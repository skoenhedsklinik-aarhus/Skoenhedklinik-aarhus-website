import crypto from "crypto";
import { headers, cookies } from "next/headers";
import { CONSENT_COOKIE, parseConsent } from "@/lib/consent";
import { TEST_MODE_COOKIE } from "@/lib/identity";
import { readMatchedIdentity } from "@/lib/meta/matched-identity";

/**
 * Meta Conversions API (CAPI) — server-side conversion tracking.
 *
 * Why this exists: roughly a quarter to a third of visitors block the browser
 * pixel (ad blockers, iOS/ITP, Safari). Those conversions are invisible to Meta,
 * which means the algorithm optimises on incomplete data and CPA looks worse
 * than it is. Sending the same events server-to-server fixes that.
 *
 * Deduplication: every event carries an `event_id` that matches the browser
 * pixel event. Meta keeps whichever arrives first and discards the twin — so a
 * conversion is never double-counted.
 *
 * Required env (Vercel → Environment Variables):
 * - NEXT_PUBLIC_META_PIXEL_ID   the pixel/dataset id (same one the browser uses)
 * - META_CAPI_ACCESS_TOKEN      generated in Events Manager → Settings → CAPI
 * Optional:
 * - META_TEST_EVENT_CODE        set while validating in "Test events", then remove
 * - META_GRAPH_API_VERSION      defaults to v23.0
 *
 * Without the access token every call here is a no-op, so the site works
 * unchanged until the token is added.
 */

const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || "v23.0";

export type CapiUserData = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  country?: string | null;
};

/**
 * Identity values recovered by the browser when the cookie itself was gone
 * (evicted by ITP and restored from the localStorage mirror). Used only as a
 * fallback: a real cookie always wins, because the server is the source of
 * truth for all three.
 */
export type CapiIdentity = {
  fbc?: string | null;
  fbp?: string | null;
  externalId?: string | null;
};

export type CapiEventInput = {
  /** Standard event name, e.g. "Lead", "Schedule", "InitiateCheckout". */
  eventName: string;
  /** Shared with the browser pixel event — this is what deduplicates them. */
  eventId: string;
  /** Full URL of the page the event happened on. */
  eventSourceUrl?: string;
  /** Personal details to hash for matching (optional but improves match rate). */
  userData?: CapiUserData;
  /** Browser-recovered fbc/fbp/external_id, used when the cookies are missing. */
  identity?: CapiIdentity;
  /** Meta's custom_data block: content_name, value, currency, … */
  customData?: Record<string, string | number | string[] | undefined>;
  /** Unix seconds. Defaults to now. Must be within the last 7 days. */
  eventTime?: number;
};

/** SHA-256 hex, as Meta requires for all personally identifying fields. */
function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Danish phone numbers to Meta's format: digits only, country code included,
 * no plus sign. "61 44 59 99" → "4561445999".
 */
export function normalisePhone(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  // Bare 8-digit number = Danish local number.
  if (digits.length === 8) digits = `45${digits}`;
  if (digits.length < 8) return null;
  return digits;
}

function normaliseName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Meta's fbc/fbp shape, so a corrupt client value is never forwarded. */
const FB_VALUE = /^fb\.\d\.\d+\..+$/;

function pickFbValue(
  cookieValue: string | undefined,
  fallback: string | null | undefined,
): string | undefined {
  if (cookieValue && FB_VALUE.test(cookieValue)) return cookieValue;
  if (fallback && FB_VALUE.test(fallback)) return fallback;
  return undefined;
}

function buildUserData(userData?: CapiUserData, identity?: CapiIdentity) {
  const h = headers();
  const c = cookies();

  const payload: Record<string, string | string[]> = {};

  // Click id + browser id — the highest-signal identifiers Meta has.
  const fbc = pickFbValue(c.get("_fbc")?.value, identity?.fbc);
  const fbp = pickFbValue(c.get("_fbp")?.value, identity?.fbp);
  if (fbc) payload.fbc = fbc;
  if (fbp) payload.fbp = fbp;

  // external_id: our own first-party visitor id (cnc_uid). Present on every
  // event, personal-data-free, and the browser half sends the same value
  // through Advanced Matching, so the two deduplicate cleanly. Hashed here
  // because the pixel hashes its Advanced Matching parameters client-side, and
  // the two halves have to arrive at Meta as the same string.
  const uid = c.get("cnc_uid")?.value || identity?.externalId || undefined;
  if (uid) payload.external_id = [sha256(uid.trim().toLowerCase())];

  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    undefined;
  const userAgent = h.get("user-agent") || undefined;
  if (ip) payload.client_ip_address = ip;
  if (userAgent) payload.client_user_agent = userAgent;

  if (userData?.email) payload.em = [sha256(normaliseEmail(userData.email))];
  if (userData?.phone) {
    const phone = normalisePhone(userData.phone);
    if (phone) payload.ph = [sha256(phone)];
  }
  if (userData?.firstName) payload.fn = [sha256(normaliseName(userData.firstName))];
  if (userData?.lastName) payload.ln = [sha256(normaliseName(userData.lastName))];

  // Hashet kontaktinfo fra en tidligere Planway-booking i denne browser.
  // Planway giver os intet på /tak, så uden det her har Schedule kun IP og
  // browser at matche på. Kalderens egne værdier vinder altid: et lead med
  // friske oplysninger skal ikke overskrives af en gammel booking.
  const matched = readMatchedIdentity();
  if (matched) {
    if (!payload.em && matched.em) payload.em = [matched.em];
    if (!payload.ph && matched.ph) payload.ph = [matched.ph];
    if (!payload.fn && matched.fn) payload.fn = [matched.fn];
    if (!payload.ln && matched.ln) payload.ln = [matched.ln];
  }
  if (userData?.city) payload.ct = [sha256(normaliseName(userData.city).replace(/\s/g, ""))];

  // country: taget fra Vercels geo-header, ellers fra det kaldet selv oplyser.
  // Landeopslag på IP er præcist nok til at bruges (modsat by og region, der
  // ofte peger på teleudbyderens knudepunkt frem for den besøgende). Meta
  // tæller country som en match key, den er på 100% af events, og den koster
  // ingen personoplysninger. Se `docs`-noten i CHANGELOG for hvorfor ct/st/zp
  // bevidst IKKE udledes af IP her.
  const geoCountry = h.get("x-vercel-ip-country")?.trim().toLowerCase();
  const country =
    userData?.country?.trim().toLowerCase() ||
    (geoCountry && /^[a-z]{2}$/.test(geoCountry) ? geoCountry : undefined);
  if (country) payload.country = [sha256(country)];

  return payload;
}

/**
 * Send one event to the Conversions API.
 * Never throws — tracking failures must not affect the visitor.
 *
 * @returns true when Meta accepted the event.
 */
export async function sendMetaEvent(input: CapiEventInput): Promise<boolean> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) return false;

  // The authoritative consent gate. Every server-side caller goes through
  // here — the /api/meta/track bridge and the lead server action alike — so
  // this is the one place that has to be right.
  if (parseConsent(cookies().get(CONSENT_COOKIE)?.value) !== "granted") {
    return false;
  }

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        ...(input.eventSourceUrl && { event_source_url: input.eventSourceUrl }),
        user_data: buildUserData(input.userData, input.identity),
        ...(input.customData && { custom_data: cleanCustomData(input.customData) }),
      },
    ],
  };

  // Only for a browser that opted in with ?metatest=1. Stamping every
  // visitor's events with the test code would push real conversions into the
  // Test Events tool, where Meta does not count them for delivery or
  // reporting. See applyTestModeCookie in src/lib/identity.ts.
  if (
    process.env.META_TEST_EVENT_CODE &&
    cookies().get(TEST_MODE_COOKIE)?.value === "1"
  ) {
    body.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(
        "[meta-capi] Rejected:",
        input.eventName,
        response.status,
        await response.text(),
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("[meta-capi] Request failed:", input.eventName, error);
    return false;
  }
}

/** Drop undefined values — Meta rejects nulls in custom_data. */
function cleanCustomData(
  data: Record<string, string | number | string[] | undefined>,
) {
  const out: Record<string, string | number | string[]> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== "") out[key] = value;
  }
  return out;
}
