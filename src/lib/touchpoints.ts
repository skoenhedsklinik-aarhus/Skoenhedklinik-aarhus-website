import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { buildJourney, type Journey, type Touchpoint } from "@/lib/journey";

/**
 * Skrivning og læsning af berøringer (sidevisninger).
 *
 * Formular, database og adminside ligger i den samme app, så der skrives
 * direkte til databasen. Der er hverken webhook eller delt hemmelighed: det
 * hører til, når hjemmeside og CRM er to adskilte systemer.
 *
 * Skrivningen er bevidst billig: én INSERT og intet opslag mod leads.
 * Koblingen findes allerede, fordi visitor_id ER consultation_leads.ft_id,
 * altså UUID'et fra sk_ft-cookien. Der bygges ikke et nyt id.
 */

export type TouchpointInput = {
  visitor_id: string;
  occurred_at?: string | null;
  path?: string | null;
  referrer_host?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  fbclid?: string | null;
  gclid?: string | null;
};

/** Afkort frem for at afvise: et usædvanligt langt felt må aldrig koste hele
 *  berøringen. Kun visitor_id er der mening i at afvise på. */
function clip(value: string | null | undefined, max: number): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

/** Et ugyldigt tidsstempel må ikke bindes råt til en timestamptz-kolonne.
 *  Modtagelsestidspunktet er en fornuftig erstatning: rækken skrives
 *  sekunder efter sidevisningen. */
function parseTidspunkt(value: string | null | undefined): string {
  if (value) {
    const t = Date.parse(value);
    if (!Number.isNaN(t)) return new Date(t).toISOString();
  }
  return new Date().toISOString();
}

/**
 * Klient til skrivningen: den offentlige nøgle uden session, præcis som
 * formularen skriver leads i dag. RLS tillader anon at INDSÆTTE berøringer og
 * ingenting andet, så den her klient kan hverken læse eller ændre noget.
 */
function writeClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Gemmer én sidevisning. Returnerer false ved enhver fejl: en tabt berøring
 *  må aldrig ramme den besøgende. */
export async function ingestTouchpoint(input: TouchpointInput): Promise<boolean> {
  const supabase = writeClient();
  if (!supabase) return false;

  const { error } = await supabase.from("touchpoints").insert([
    {
      visitor_id: input.visitor_id.slice(0, 60),
      occurred_at: parseTidspunkt(input.occurred_at),
      path: clip(input.path, 200),
      referrer_host: clip(input.referrer_host, 80),
      utm_source: clip(input.utm_source, 100),
      utm_medium: clip(input.utm_medium, 100),
      utm_campaign: clip(input.utm_campaign, 100),
      utm_content: clip(input.utm_content, 100),
      utm_term: clip(input.utm_term, 100),
      fbclid: clip(input.fbclid, 200),
      gclid: clip(input.gclid, 200),
      // as never: samme mønster som leads-indsættelsen. Tabellens Insert-type
      // er en Partial, og supabase-js løser den til never.
    } as never,
  ]);

  if (error) {
    console.error("[touchpoint] insert error:", error.message);
    return false;
  }
  return true;
}

/** Højeste antal berøringer der hentes til visningen. */
export const JOURNEY_LIMIT = 500;

export type JourneyResult = {
  visitorId: string | null;
  journey: Journey;
  /** Flere berøringer end loftet: visningen er afkortet, og det skal siges. */
  truncated: boolean;
};

/**
 * Kunderejsen for ét lead.
 *
 * Læser med den indloggede brugers session, så RLS afgør adgangen: kun en
 * bruger med app_metadata.cnc = true får rækker. Klinikkens egen bruger får
 * en tom rejse, også hvis nogen skulle finde på at kalde udenom siden.
 *
 * PostgREST leverer timestamptz som ISO 8601 ("2026-09-19T08:30:00+00:00"),
 * som alle browsere parser. Det er kun Postgres' egen tekstform
 * ("2026-09-19 08:30:00+02") Safari falder over.
 */
export async function getJourney(
  visitorId: string | null,
  leadCreatedAt: string | null,
): Promise<JourneyResult> {
  if (!visitorId) {
    return { visitorId: null, journey: buildJourney([]), truncated: false };
  }

  const supabase = createSessionClient();
  const { data, error } = await supabase
    .from("touchpoints")
    .select(
      "id, occurred_at, path, referrer_host, utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid, gclid",
    )
    .eq("visitor_id", visitorId)
    .order("occurred_at", { ascending: true })
    // Én mere end loftet, så vi ærligt kan sige, at listen er afkortet.
    .limit(JOURNEY_LIMIT + 1);

  if (error) {
    console.error("[touchpoint] read error:", error.message);
    return { visitorId, journey: buildJourney([]), truncated: false };
  }

  const rows = (data ?? []) as Touchpoint[];
  const truncated = rows.length > JOURNEY_LIMIT;

  return {
    visitorId,
    journey: buildJourney(truncated ? rows.slice(0, JOURNEY_LIMIT) : rows, {
      leadCreatedAt,
    }),
    truncated,
  };
}

/** Loft på listeopslaget, så én side i admin aldrig trækker hele tabellen. */
const LIST_LIMIT = 5000;

/**
 * Rejserne for en hel liste af leads, i ÉT opslag frem for ét pr. lead.
 *
 * Nøglen i resultatet er besøgs-id'et (ft_id). Leads uden ft_id er ikke med:
 * de er fra før sporingen, eller den besøgende sagde nej til cookies.
 */
export async function getJourneys(
  leads: { ft_id?: string | null; created_at: string }[],
): Promise<Map<string, Journey>> {
  const rejser = new Map<string, Journey>();
  const ids = Array.from(
    new Set(leads.map((l) => l.ft_id).filter((id): id is string => !!id)),
  );
  if (ids.length === 0) return rejser;

  const supabase = createSessionClient();
  const { data, error } = await supabase
    .from("touchpoints")
    .select(
      "id, visitor_id, occurred_at, path, referrer_host, utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid, gclid",
    )
    .in("visitor_id", ids)
    .order("occurred_at", { ascending: true })
    .limit(LIST_LIMIT);

  if (error || !data) {
    if (error) console.error("[touchpoint] list read error:", error.message);
    return rejser;
  }

  const pr = new Map<string, Touchpoint[]>();
  for (const row of data as (Touchpoint & { visitor_id: string })[]) {
    const liste = pr.get(row.visitor_id);
    if (liste) liste.push(row);
    else pr.set(row.visitor_id, [row]);
  }

  for (const lead of leads) {
    if (!lead.ft_id) continue;
    const tps = pr.get(lead.ft_id);
    if (!tps) continue;
    rejser.set(lead.ft_id, buildJourney(tps, { leadCreatedAt: lead.created_at }));
  }
  return rejser;
}
