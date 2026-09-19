/**
 * Kunderejsen, udregnet af rå berøringer.
 *
 * Ingen database-import, ingen læsning af uret, ingen "server-only": ren
 * logik, så den kan enhedstestes med et fastfrosset ur
 * (scripts/test-journey.mjs) og bruges til typer i brugerfladen.
 *
 * Besøg beregnes altså VED LÆSNING, ikke når en berøring skrives. Reglen om
 * 30 minutters pause er et valg, ikke en naturlov, og skal kunne ændres bagud
 * uden en migration og uden at genberegne historikken. Derfor står den her og
 * ikke i tabellen.
 */

/** Én berøring: én sidevisning på hjemmesiden. */
export type Touchpoint = {
  id: string;
  occurred_at: string;
  path: string | null;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  gclid: string | null;
};

export type JourneySession = {
  startedAt: string;
  endedAt: string;
  /** Minutter fra første til sidste sidevisning i besøget (0 ved én side). */
  minutes: number;
  /** Læsbar kilde, fx "Meta-annonce", "google.com", "Direkte". */
  source: string;
  campaign: string | null;
  /** Stierne i den rækkefølge de blev læst. */
  paths: string[];
  pageviews: number;
  /** Besøget BEGYNDTE efter henvendelsen: de kom tilbage. */
  afterLead: boolean;
};

export type Journey = {
  sessions: JourneySession[];
  pageviews: number;
  firstSource: string | null;
  /** Kilden på det sidste besøg, der begyndte før henvendelsen. */
  lastSourceBeforeLead: string | null;
  /** Hele dage fra første besøg til henvendelsen. 0 = samme dag. */
  daysToLead: number | null;
  topPaths: { path: string; count: number }[];
  /**
   * Besøg der BEGYNDTE efter henvendelsen. Det interessante signal før et
   * opkald: kom de tilbage af sig selv?
   */
  sessionsAfterLead: number;
  pageviewsAfterLead: number;
  firstAt: string | null;
  lastAt: string | null;
};

/** Nyt besøg efter så lang en pause. Ligger her, ikke i databasen. */
export const SESSION_GAP_MINUTES = 30;

const DAY_MS = 24 * 60 * 60 * 1000;
const TOP_PATHS = 5;

const META_RE = /facebook|meta|instagram|^fb$|^ig$/i;
const GOOGLE_RE = /^google/i;

/**
 * Læsbar kilde for en berøring. Klik-id'er vejer tungest: de er beviset for,
 * at der faktisk blev klikket på en annonce.
 */
export function sourceLabel(tp: Touchpoint): string {
  const kampagne = tp.utm_campaign ? ` · ${tp.utm_campaign}` : "";
  if (tp.fbclid || (tp.utm_source && META_RE.test(tp.utm_source))) {
    return `Meta-annonce${kampagne}`;
  }
  if (tp.gclid || (tp.utm_source && GOOGLE_RE.test(tp.utm_source) && tp.utm_medium === "cpc")) {
    return `Google Ads${kampagne}`;
  }
  if (tp.utm_source) {
    return `${tp.utm_source}${tp.utm_medium ? ` / ${tp.utm_medium}` : ""}${kampagne}`;
  }
  if (tp.referrer_host) return tp.referrer_host.replace(/^www\./, "");
  return "Direkte";
}

/**
 * Det, der gør én annonceberøring forskellig fra en anden. Null når
 * berøringen ikke bærer noget signal, fx en intern navigation: den fortsætter
 * det igangværende besøg.
 */
function signalKey(tp: Touchpoint): string | null {
  const dele = [tp.utm_source, tp.fbclid, tp.gclid].filter((v): v is string => !!v);
  return dele.length ? dele.join("|") : null;
}

function pathUdenQuery(p: string | null): string {
  if (!p) return "(ukendt)";
  const i = p.indexOf("?");
  return i === -1 ? p : p.slice(0, i);
}

function topStier(tps: Touchpoint[]): { path: string; count: number }[] {
  const antal = new Map<string, number>();
  for (const tp of tps) {
    const p = pathUdenQuery(tp.path);
    antal.set(p, (antal.get(p) ?? 0) + 1);
  }
  // forEach frem for spread: repoet kompilerer til ES5, hvor en Map-iterator
  // ikke kan spredes.
  const liste: { path: string; count: number }[] = [];
  antal.forEach((count, path) => liste.push({ path, count }));
  return liste
    .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path))
    .slice(0, TOP_PATHS);
}

const tom: Journey = {
  sessions: [],
  pageviews: 0,
  firstSource: null,
  lastSourceBeforeLead: null,
  daysToLead: null,
  topPaths: [],
  sessionsAfterLead: 0,
  pageviewsAfterLead: 0,
  firstAt: null,
  lastAt: null,
};

/**
 * Grupperer berøringer til besøg og udregner nøgletallene.
 *
 * Nyt besøg ved en pause over gapMinutes, ELLER når der kommer en ny
 * utm_source, fbclid eller gclid.
 */
export function buildJourney(
  touchpoints: Touchpoint[],
  opts: { leadCreatedAt?: string | null; gapMinutes?: number } = {},
): Journey {
  const gapMs = (opts.gapMinutes ?? SESSION_GAP_MINUTES) * 60_000;
  const leadAt = opts.leadCreatedAt ? Date.parse(opts.leadCreatedAt) : NaN;
  const harLead = !Number.isNaN(leadAt);

  // Stol ikke på rækkefølgen fra kalderen, og smid ubrugelige tidsstempler væk.
  const sorteret = touchpoints
    .filter((tp) => !Number.isNaN(Date.parse(tp.occurred_at)))
    .slice()
    .sort((a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at));
  if (sorteret.length === 0) return { ...tom };

  const spande: { items: Touchpoint[]; signal: string | null }[] = [];
  for (const tp of sorteret) {
    const nu = spande[spande.length - 1];
    const forrige = nu?.items[nu.items.length - 1];
    const pause = forrige
      ? Date.parse(tp.occurred_at) - Date.parse(forrige.occurred_at)
      : Infinity;
    const key = signalKey(tp);
    if (!nu || pause > gapMs || (key !== null && key !== nu.signal)) {
      spande.push({ items: [tp], signal: key });
    } else {
      nu.items.push(tp);
    }
  }

  const sessions: JourneySession[] = spande.map((s) => {
    const foerste = s.items[0];
    const sidste = s.items[s.items.length - 1];
    return {
      startedAt: foerste.occurred_at,
      endedAt: sidste.occurred_at,
      minutes: Math.round(
        (Date.parse(sidste.occurred_at) - Date.parse(foerste.occurred_at)) / 60_000,
      ),
      source: sourceLabel(foerste),
      campaign: foerste.utm_campaign,
      paths: s.items.map((t) => t.path ?? "(ukendt)"),
      pageviews: s.items.length,
      // Kun besøg der BEGYNDTE efter henvendelsen tæller som "kom tilbage".
      // Ellers ville kvitteringssiden lige efter formularen tælle med, og så
      // ville hvert eneste lead se ud som om det kom tilbage.
      afterLead: harLead && Date.parse(foerste.occurred_at) > leadAt,
    };
  });

  const efter = sessions.filter((s) => s.afterLead);
  const foerLead = sessions.filter((s) => !s.afterLead);
  const firstAt = sorteret[0].occurred_at;

  return {
    sessions,
    pageviews: sorteret.length,
    firstSource: sessions[0]?.source ?? null,
    lastSourceBeforeLead: foerLead.length ? foerLead[foerLead.length - 1].source : null,
    // Negativt kan forekomme, hvis cookien blev sat efter henvendelsen: vis 0.
    daysToLead: harLead
      ? Math.max(0, Math.floor((leadAt - Date.parse(firstAt)) / DAY_MS))
      : null,
    topPaths: topStier(sorteret),
    sessionsAfterLead: efter.length,
    pageviewsAfterLead: efter.reduce((n, s) => n + s.pageviews, 0),
    firstAt,
    lastAt: sorteret[sorteret.length - 1].occurred_at,
  };
}
