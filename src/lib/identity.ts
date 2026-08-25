/**
 * First-party identity cookies, written SERVER-SIDE.
 *
 * Three cookies, all set with a real `Set-Cookie` header (never
 * `document.cookie`), because Safari's ITP caps script-written cookies at 7
 * days. A visitor who clicks an ad and books eleven days later would otherwise
 * arrive with no click id at all, which is a large part of why fbc coverage on
 * the Schedule event sits at 12.5%.
 *
 *   cnc_uid  our own stable visitor id, sent to Meta as `external_id`.
 *            Costs no personal data and applies to every event, so it is the
 *            cheapest Event Match Quality win available.
 *   _fbc     Meta's click id, built from `?fbclid=` in Meta's own format.
 *   _fbp     Meta's browser id. fbevents.js writes this itself, but only after
 *            the script loads, and only for 7 days on Safari.
 *
 * Domain scope matters. `fbevents.js` writes `_fbc`/`_fbp` on the registrable
 * domain (`.skoenhedsklinik-aarhus.dk`), so we write them there too. Before
 * this, `src/lib/attribution.ts` wrote them host-only on
 * `www.skoenhedsklinik-aarhus.dk`, which produced two cookies with the same
 * name at different scopes and left `cookies().get("_fbc")` picking whichever
 * the browser happened to send first.
 *
 * Nothing here runs without marketing consent. See `src/lib/consent.ts`.
 */

import type { NextRequest, NextResponse } from "next/server";
import { CONSENT_COOKIE, parseConsent } from "@/lib/consent";

export const UID_COOKIE = "cnc_uid";
export const FBC_COOKIE = "_fbc";
export const FBP_COOKIE = "_fbp";

export const UID_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
export const FB_MAX_AGE = 60 * 60 * 24 * 90; // 90 days, Meta's convention

/** Meta's fbc/fbp shape: fb.<subdomainIndex>.<timestampMs>.<id> */
const FB_VALUE = /^fb\.\d\.(\d+)\.(.+)$/;

/**
 * Cookie domain for the registrable domain, so apex and www share one cookie.
 *
 * Returns undefined (host-only cookie) for localhost, raw IPs and
 * *.vercel.app preview hosts — `.vercel.app` is a public suffix and browsers
 * refuse to set cookies on it. The two-label rule is correct for `.dk`; a
 * multi-part TLD such as `.co.uk` would need a public-suffix list.
 */
export function cookieDomain(host: string | null): string | undefined {
  if (!host) return undefined;
  const hostname = host.split(":")[0].toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".vercel.app") ||
    /^\d+(\.\d+){3}$/.test(hostname) ||
    hostname.includes(":")
  ) {
    return undefined;
  }
  const labels = hostname.split(".");
  if (labels.length < 2) return undefined;
  return `.${labels.slice(-2).join(".")}`;
}

/**
 * Is this request served over HTTPS?
 *
 * On Vercel the TLS terminates at the edge and the request Next sees can be
 * plain http, so `nextUrl.protocol` alone would silently drop the `Secure`
 * flag in production. `x-forwarded-proto` is the authoritative signal there.
 */
export function isSecureRequest(request: NextRequest): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim() === "https";
  return request.nextUrl.protocol === "https:";
}

export function buildFbc(fbclid: string, now = Date.now()): string {
  return `fb.1.${now}.${fbclid}`;
}

export function buildFbp(now = Date.now()): string {
  // Meta uses a random 10-digit component; matching the shape keeps the value
  // indistinguishable from one fbevents.js would have written itself.
  const random = Math.floor(Math.random() * 1e10);
  return `fb.1.${now}.${random}`;
}

export function newUid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Edge and Node 18+ both have randomUUID; this is defensive only.
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

/** A syntactically valid fb.* value, so we never forward junk to Meta. */
export function isValidFbValue(value: string | undefined | null): boolean {
  return typeof value === "string" && FB_VALUE.test(value);
}

/** The click id inside an `_fbc` value, or null when it cannot be read. */
export function fbclidOf(fbc: string | undefined | null): string | null {
  if (!fbc) return null;
  const match = FB_VALUE.exec(fbc);
  return match ? match[2] : null;
}

export type IdentityDecision = {
  /** Cookies that still need writing. Empty when nothing changed. */
  cookies: Array<{ name: string; value: string; maxAge: number }>;
  /** The visitor id in force after this request. */
  uid: string;
};

/**
 * Decide which identity cookies this request still needs.
 *
 * Deliberately returns nothing to write for a returning visitor who already
 * has all three. That keeps `Set-Cookie` off the response for the vast
 * majority of requests, so the CDN can still cache the static pages.
 *
 * @param fbclidOverride click id from somewhere other than the query string,
 *        used by /api/consent to honour the fbclid the visitor arrived on
 *        after they accept.
 */
export function decideIdentity(
  request: NextRequest,
  fbclidOverride?: string | null,
): IdentityDecision {
  const cookies: IdentityDecision["cookies"] = [];

  const existingUid = request.cookies.get(UID_COOKIE)?.value;
  const uid = existingUid || newUid();
  if (!existingUid) {
    cookies.push({ name: UID_COOKIE, value: uid, maxAge: UID_MAX_AGE });
  }

  const now = Date.now();

  const fbclid =
    fbclidOverride ?? request.nextUrl.searchParams.get("fbclid") ?? null;
  if (fbclid) {
    const existingFbc = request.cookies.get(FBC_COOKIE)?.value;
    // Only overwrite for a genuinely different click. Re-writing the same
    // click id would reset its timestamp, and Meta reads that timestamp as the
    // moment the ad was clicked.
    if (!isValidFbValue(existingFbc) || fbclidOf(existingFbc) !== fbclid) {
      cookies.push({
        name: FBC_COOKIE,
        value: buildFbc(fbclid.slice(0, 500), now),
        maxAge: FB_MAX_AGE,
      });
    }
  }

  const existingFbp = request.cookies.get(FBP_COOKIE)?.value;
  if (!isValidFbValue(existingFbp)) {
    cookies.push({ name: FBP_COOKIE, value: buildFbp(now), maxAge: FB_MAX_AGE });
  }

  return { cookies, uid };
}

/**
 * Write the identity cookies onto a response.
 *
 * No-ops entirely without marketing consent, and no-ops when nothing changed.
 * `httpOnly` is deliberately false: the browser has to read `cnc_uid` to pass
 * it as `external_id` in Advanced Matching, and fbevents.js has to read
 * `_fbc`/`_fbp`.
 */
export function applyIdentityCookies(
  request: NextRequest,
  response: NextResponse,
  options?: { fbclid?: string | null; assumeConsent?: boolean },
): string | null {
  const consent =
    options?.assumeConsent === true
      ? "granted"
      : parseConsent(request.cookies.get(CONSENT_COOKIE)?.value);
  if (consent !== "granted") return null;

  const { cookies, uid } = decideIdentity(request, options?.fbclid);
  const domain = cookieDomain(request.headers.get("host"));
  const secure = isSecureRequest(request);

  for (const cookie of cookies) {
    response.cookies.set({
      name: cookie.name,
      value: cookie.value,
      maxAge: cookie.maxAge,
      path: "/",
      sameSite: "lax",
      secure,
      httpOnly: false,
      ...(domain ? { domain } : {}),
    });
  }

  return uid;
}
