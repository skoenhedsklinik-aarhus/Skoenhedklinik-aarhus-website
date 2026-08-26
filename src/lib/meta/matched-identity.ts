import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Hashed kontaktinfo fra en gennemført Planway-booking.
 *
 * Planway giver os intet tilbage på `/tak`. Bekræftelses-URL'en er en helt bar
 * `/tak` uden parametre, så `Schedule` har aldrig haft andet at matche på end
 * IP, browser og vores egne id'er. Det er derfor den ligger omkring 6/10, og
 * Metas egne anbefalinger peger alle sammen på det samme: send e-mail og
 * telefon.
 *
 * Efter at Planway blev lagt bag vores egen proxy passerer bookingens POST
 * gennem vores server. Den indeholder `info_name`, `info_email`, `phonenumber`
 * og `countrycode`. Her hashes de med SHA-256 med det samme, og KUN hashet
 * gemmes.
 *
 * Spilleregler, som er bevidste og skal blive stående:
 *
 * - Rå værdier forlader aldrig denne funktion. De logges ikke, gemmes ikke og
 *   sendes ikke videre nogen steder.
 * - Cookien er `httpOnly`. Det er ikke pynt: SHA-256 af et dansk 8-cifret
 *   telefonnummer kan brute-forces på sekunder, så et hash der kan læses fra
 *   JavaScript er reelt selve telefonnummeret. Kun vores egen server ser den.
 * - Der skrives intet uden markedsføringssamtykke.
 * - Kun bookingformularen. En POST uden de felter rører ikke cookien.
 *
 * Værdierne hænger på `cnc_am` og ryger med på alle efterfølgende CAPI-events
 * fra samme browser, ikke kun på selve `Schedule`. Det er hele pointen med
 * Advanced Matching: kender vi først kunden, skal ViewContent og
 * InitiateCheckout også kunne matches.
 */

export const MATCH_COOKIE = "cnc_am";
/** Samme levetid som _fbc. Længere ville være at gemme på kundedata uden grund. */
export const MATCH_MAX_AGE = 60 * 60 * 24 * 90; // 90 dage

export type MatchedIdentity = {
  /** SHA-256 af normaliseret e-mail. */
  em?: string;
  /** SHA-256 af telefonnummer med landekode, kun cifre. */
  ph?: string;
  /** SHA-256 af fornavn. */
  fn?: string;
  /** SHA-256 af efternavn. */
  ln?: string;
};

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** Metas normalisering: trim og små bogstaver. */
function normaliseText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/**
 * Sæt landekode og nummer sammen.
 *
 * Planway sender dem i hver sit felt. Har nummeret allerede landekoden med,
 * må den ikke sættes på to gange, så koden lægges kun til, når nummeret er
 * kort nok til at være et lokalt nummer.
 */
function composePhone(phone: string, countryCode?: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);

  const code = (countryCode ?? "").replace(/\D/g, "");
  if (code && digits.length <= 8 && !digits.startsWith(code)) {
    digits = code + digits;
  }
  // Bart 8-cifret nummer uden landekode er dansk.
  if (digits.length === 8) digits = `45${digits}`;
  // Bevidst samme regel som normalisePhone i capi.ts, men skrevet her frem for
  // importeret: capi.ts importerer readMatchedIdentity herfra, og en cirkulær
  // import mellem de to ville være en fælde at falde i senere.
  if (digits.length < 8) return null;
  return digits;
}

/**
 * Hash det, der kan hashes. Returnerer null hvis der ikke var noget brugbart,
 * så kalderen kan lade være med at røre cookien.
 */
export function hashBookingIdentity(fields: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  countryCode?: string | null;
}): MatchedIdentity | null {
  const identity: MatchedIdentity = {};

  const email = fields.email?.trim();
  if (email && isEmail(email)) identity.em = sha256(email.toLowerCase());

  if (fields.phone) {
    const phone = composePhone(fields.phone, fields.countryCode ?? undefined);
    if (phone) identity.ph = sha256(phone);
  }

  const name = fields.name?.trim();
  if (name) {
    const parts = normaliseText(name).split(" ").filter(Boolean);
    if (parts.length) {
      identity.fn = sha256(parts[0]);
      if (parts.length > 1) identity.ln = sha256(parts.slice(1).join(" "));
    }
  }

  return Object.keys(identity).length ? identity : null;
}

/** Serialiser til cookieværdi. Kun hashes, aldrig råt. */
export function serialiseMatchedIdentity(identity: MatchedIdentity): string {
  return JSON.stringify(identity);
}

/** Hashene fra en tidligere booking i denne browser, hvis der er nogen. */
export function readMatchedIdentity(): MatchedIdentity | undefined {
  try {
    const raw = cookies().get(MATCH_COOKIE)?.value;
    if (!raw) return undefined;
    const parsed = JSON.parse(decodeURIComponent(raw)) as MatchedIdentity;
    const clean: MatchedIdentity = {};
    // Kun 64 tegns hex slipper igennem, så en manipuleret cookie ikke kan
    // sende vilkårligt indhold videre til Meta.
    for (const key of ["em", "ph", "fn", "ln"] as const) {
      const value = parsed?.[key];
      if (typeof value === "string" && /^[0-9a-f]{64}$/.test(value)) {
        clean[key] = value;
      }
    }
    return Object.keys(clean).length ? clean : undefined;
  } catch {
    return undefined;
  }
}
