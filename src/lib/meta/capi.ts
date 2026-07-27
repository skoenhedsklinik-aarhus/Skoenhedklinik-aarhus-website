import crypto from "crypto";
import { headers, cookies } from "next/headers";

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

export type CapiEventInput = {
  /** Standard event name, e.g. "Lead", "Schedule", "InitiateCheckout". */
  eventName: string;
  /** Shared with the browser pixel event — this is what deduplicates them. */
  eventId: string;
  /** Full URL of the page the event happened on. */
  eventSourceUrl?: string;
  /** Personal details to hash for matching (optional but improves match rate). */
  userData?: CapiUserData;
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

function buildUserData(userData?: CapiUserData) {
  const h = headers();
  const c = cookies();

  const payload: Record<string, string | string[]> = {};

  // Click id + browser id — the highest-signal identifiers Meta has.
  const fbc = c.get("_fbc")?.value;
  const fbp = c.get("_fbp")?.value;
  if (fbc) payload.fbc = fbc;
  if (fbp) payload.fbp = fbp;

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
  if (userData?.city) payload.ct = [sha256(normaliseName(userData.city).replace(/\s/g, ""))];
  if (userData?.country) payload.country = [sha256(userData.country.trim().toLowerCase())];

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

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        ...(input.eventSourceUrl && { event_source_url: input.eventSourceUrl }),
        user_data: buildUserData(input.userData),
        ...(input.customData && { custom_data: cleanCustomData(input.customData) }),
      },
    ],
  };

  if (process.env.META_TEST_EVENT_CODE) {
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
