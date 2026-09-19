/**
 * Førsteberøring: hvem bragte den besøgende hertil ALLERFØRSTE gang.
 *
 * Én HttpOnly-cookie, `sk_ft`, sat server-side og aldrig overskrevet. Den
 * indeholder et genereret besøgs-id plus kampagnen på det første besøg.
 *
 * Tre ting er bevidste og må ikke laves om:
 *
 * 1. Server-side. Safari sletter cookies sat fra JavaScript efter 7 dage. Sat
 *    fra serveren overlever den de 90 dage, den lover, og et annonceklik går
 *    ikke tabt, fordi personen først booker to uger senere.
 *
 * 2. HttpOnly. Cookien ER dermed selv samtykke-gaten på serveren: den sættes
 *    kun ved samtykke, så ingen cookie betyder ingen data, og det kan ikke
 *    omgås fra klienten. Browseren kan hverken læse eller forfalske besøgs-
 *    id'et.
 *
 * 3. Første besøg vinder. Kommer personen tilbage tre uger senere via Google
 *    og udfylder formularen der, skal den oprindelige annonce stadig stå på
 *    leadet. Cookien må derfor ALDRIG overskrives.
 *
 * Værdien er base64url-kodet JSON. Ikke procent-kodet: tegn som {, " og :
 * ville hver fylde tre tegn og let sprænge de 1 KB, en cookie må fylde.
 *
 * Indholdet er ikke personoplysninger i sig selv, men bliver det i det
 * øjeblik besøgs-id'et står på et lead med navn og telefon. Se
 * `src/lib/touchpoints.ts` for adgangen til den samlede rejse.
 */

export const FT_COOKIE = "sk_ft";
export const FT_MAX_AGE = 60 * 60 * 24 * 90; // 90 dage

/** Cookien må ikke nærme sig browserens 4 KB-loft. Vi holder os under 1 KB. */
const MAX_COOKIE_BYTES = 1000;

export type FirstTouch = {
  /** Besøgs-id. Samme værdi som touchpoints.visitor_id. */
  id: string;
  /** ISO-tidspunkt for første besøg. */
  ts: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  landing_page?: string;
  referrer_host?: string;
};

/** Længder valgt så worst case stadig ligger under 1 KB efter base64. */
const MAX = {
  utm_source: 40,
  utm_medium: 40,
  utm_campaign: 40,
  utm_content: 40,
  utm_term: 40,
  fbclid: 100,
  gclid: 100,
  landing_page: 100,
  referrer_host: 80,
} as const;

function clip(value: string | null | undefined, max: number): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

/**
 * Bygger førsteberøringen ud fra landingssidens fulde URL og dens referrer.
 * Ugyldige værdier ignoreres i stilhed: en berøring er sekundærdata og må
 * aldrig koste hele besøget.
 */
export function buildFirstTouch(
  id: string,
  url: string | undefined,
  referrer: string | undefined,
  now: Date = new Date(),
): FirstTouch {
  const ft: FirstTouch = { id, ts: now.toISOString() };

  if (url) {
    try {
      const u = new URL(url);
      ft.landing_page = clip(u.pathname, MAX.landing_page);
      ft.utm_source = clip(u.searchParams.get("utm_source"), MAX.utm_source);
      ft.utm_medium = clip(u.searchParams.get("utm_medium"), MAX.utm_medium);
      ft.utm_campaign = clip(u.searchParams.get("utm_campaign"), MAX.utm_campaign);
      ft.utm_content = clip(u.searchParams.get("utm_content"), MAX.utm_content);
      ft.utm_term = clip(u.searchParams.get("utm_term"), MAX.utm_term);
      ft.fbclid = clip(u.searchParams.get("fbclid"), MAX.fbclid);
      ft.gclid = clip(u.searchParams.get("gclid"), MAX.gclid);
    } catch {
      // Ugyldig URL: så er der ingen landingsside at gemme.
    }
  }

  if (referrer) {
    try {
      ft.referrer_host = clip(new URL(referrer).hostname, MAX.referrer_host);
    } catch {
      // Tom streng eller en app-URI: ingen referrer.
    }
  }

  return ft;
}

/**
 * Cookieværdien for en førsteberøring.
 *
 * Felter uden værdi udelades, hvilket er det der holder den typiske cookie
 * nede omkring 100 tegn. Skulle den mod forventning stadig være for stor,
 * beholdes id, tidspunkt og landingsside: uden id kan rejsen aldrig kobles
 * til et menneske, og det er vigtigere end kampagnenavnet.
 */
export function encodeFirstTouch(ft: FirstTouch): string {
  const udenTomme = Object.fromEntries(
    Object.entries(ft).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  );
  const value = Buffer.from(JSON.stringify(udenTomme), "utf8").toString("base64url");
  if (value.length <= MAX_COOKIE_BYTES) return value;

  const minimal = { id: ft.id, ts: ft.ts, landing_page: ft.landing_page };
  return Buffer.from(JSON.stringify(minimal), "utf8").toString("base64url");
}

/** Læser en cookieværdi tilbage. Null ved alt, der ikke kan bruges. */
export function decodeFirstTouch(raw: string | undefined | null): FirstTouch | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    const id = (parsed as { id?: unknown }).id;
    if (typeof id !== "string" || id.length === 0) return null;
    return { ...(parsed as FirstTouch), id: id.slice(0, 60) };
  } catch {
    // Ulæselig cookie (afkortet, manipuleret, ugyldig base64): behandles som
    // ingen cookie. Den må aldrig vælte en rute.
    return null;
  }
}
