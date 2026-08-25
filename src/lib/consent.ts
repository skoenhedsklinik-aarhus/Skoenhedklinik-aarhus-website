/**
 * Marketing consent.
 *
 * One decision, one cookie, readable from both the browser and the server:
 *
 *   sk_consent=granted   the visitor accepted marketing cookies
 *   sk_consent=denied    the visitor declined
 *   (no cookie)          the visitor has not chosen yet
 *
 * Nothing Meta-related may run until the value is "granted". That means the
 * pixel script is not injected, the Conversions API is not called, and the
 * identity cookies (cnc_uid / _fbc / _fbp) are not written. See
 * <ConsentBanner />, `src/lib/identity.ts` and `src/middleware.ts`.
 *
 * Plausible is deliberately NOT gated: it sets no cookies and stores no
 * personal data, so it does not require consent.
 */

export const CONSENT_COOKIE = "sk_consent";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type ConsentValue = "granted" | "denied";
export type ConsentState = ConsentValue | "unknown";

/** Custom event fired on `window` the moment the visitor makes a choice. */
export const CONSENT_EVENT = "sk:consent";

export function parseConsent(raw: string | undefined | null): ConsentState {
  if (raw === "granted" || raw === "denied") return raw;
  return "unknown";
}

/** Browser-side read. Returns "unknown" during SSR. */
export function readConsent(): ConsentState {
  if (typeof document === "undefined") return "unknown";
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE}=([^;]*)`),
  );
  return parseConsent(match ? decodeURIComponent(match[1]) : null);
}

/** True only when the visitor has actively accepted. */
export function hasMarketingConsent(): boolean {
  return readConsent() === "granted";
}
