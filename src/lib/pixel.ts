/**
 * Meta Pixel event tracking.
 *
 * The base pixel (PageView) is loaded by <MetaPixel />. This helper fires
 * standard conversion events so Meta's ad delivery can optimize for actual
 * leads/bookings instead of raw traffic. No-ops safely when the pixel isn't
 * loaded (missing env var, ad blocker, SSR).
 *
 * Events used on the site:
 * - ViewContent      → treatment page viewed (builds remarketing audiences)
 * - Lead             → callback form submitted (primary ad conversion)
 * - InitiateCheckout → booking calendar opened on /book
 * - Contact          → phone number tapped
 */

type PixelParams = Record<string, string | number | string[] | undefined>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackPixel(event: string, params?: PixelParams) {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;
  try {
    window.fbq("track", event, params);
  } catch {
    // Never let tracking break the UI.
  }
}
