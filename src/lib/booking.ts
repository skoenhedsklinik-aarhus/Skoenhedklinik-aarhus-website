/**
 * Ét sted for klinikkens booking-URL'er. Bookingsystemet er Gecko fra
 * 24. november 2026 (før det Planway).
 *
 * Gecko indlejres som en almindelig iframe fra deres eget domæne. Det er det
 * samme, som deres `iframe.js` gør, bare uden `document.write`:
 *
 *   - Forvalg af ydelse: `preSelectService=<Gecko ydelses-ID>`
 *   - Forvalg af kalender (behandler): `kal=<Gecko kalender-ID>`, flere med punktum
 *   - Højde: Gecko sender `postMessage` til forældresiden med enten et tal
 *     eller `{ geckoSetHeight: <px> }`.
 *
 * ID'erne sættes pr. behandling i admin (/admin/behandlinger). De ligger i de
 * gamle kolonner `planway_service_id` og `planway_staff_id`, så skiftet ikke
 * krævede en migration. Er der intet ID, åbner bookingen på ydelseslisten.
 */

/**
 * Geckos indsætningskode "Default indsætningskode" (Indstillinger >
 * Indsætningskoder > Online booking).
 */
export const GECKO_IC_CODE =
  process.env.NEXT_PUBLIC_GECKO_IC_CODE || "95d7b838a52db572fe9af5df694760c8b12312";

/** Klinikkens Gecko-domæne. */
export const GECKO_ORIGIN = "https://skoenhedsklinikaarhus.app5.geckobooking.dk";

/** Kun beskeder fra Geckos egne domæner må styre iframens højde. */
export function isGeckoOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === "geckobooking.dk" || host.endsWith(".geckobooking.dk");
  } catch {
    return false;
  }
}

/** Kun hele tal. Alt andet ignoreres, så en forkert værdi aldrig når Gecko. */
function numericId(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed && /^\d+$/.test(trimmed) ? trimmed : null;
}

/** Kalender-ID'er må være én eller flere, adskilt med punktum (Geckos format). */
function calendarIds(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed && /^\d+(\.\d+)*$/.test(trimmed) ? trimmed : null;
}

/**
 * Geckos bookingside, evt. med forvalgt ydelse og kalender.
 *
 * `embedded` styrer kun Geckos skabelon: `dTpl=1` er visningen til et direkte
 * link i et nyt vindue, uden er det den integrerede visning til iframen.
 */
export function buildBookingUrl(
  serviceId?: string | null,
  calendarId?: string | null,
  { embedded = true }: { embedded?: boolean } = {},
): string {
  const url = new URL("/site/index.php", GECKO_ORIGIN);
  url.searchParams.set("icCode", GECKO_IC_CODE);
  if (embedded) url.searchParams.set("id", "12312");
  else url.searchParams.set("dTpl", "1");

  const service = numericId(serviceId);
  if (service) url.searchParams.set("preSelectService", service);
  const calendar = calendarIds(calendarId);
  if (calendar) url.searchParams.set("kal", calendar);

  return url.toString();
}

/** Minimal service info the /book page hands to the client booking embed. */
export type BookableService = {
  slug: string;
  name: string;
  /** Geckos ydelses-ID, eller null indtil det er sat i admin. */
  bookingServiceId: string | null;
  /** Geckos kalender-ID(er), eller null for alle behandlere. */
  bookingCalendarId: string | null;
};

/**
 * Bookingens event_id. Bruges af /tak og webhooken til at deduplikere
 * `Schedule` hos Meta. Kun et tilfældigt UUID, ingen persondata.
 */
export const BOOKING_EVENT_COOKIE = "cnc_bk";
export const BOOKING_EVENT_MAX_AGE = 60 * 60 * 6; // 6 timer, samme som /tak
