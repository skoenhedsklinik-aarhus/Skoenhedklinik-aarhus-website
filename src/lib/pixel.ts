/**
 * Meta Pixel event tracking (browser side).
 *
 * The base pixel (PageView) is loaded by <MetaPixel />. This helper fires
 * standard conversion events so Meta's ad delivery can optimize for actual
 * leads/bookings instead of raw traffic. No-ops safely when the pixel isn't
 * loaded (missing env var, ad blocker, SSR).
 *
 * Every conversion is sent TWICE on purpose:
 *   1. browser  → fbq(...)                (fast, rich browser signals)
 *   2. server   → /api/meta/track → CAPI  (survives ad blockers and iOS/ITP)
 * Both carry the same `event_id`, which is how Meta deduplicates them. Without
 * a shared event_id the same conversion would be counted twice.
 *
 * Events used on the site:
 * - ViewContent      → treatment page viewed (builds remarketing audiences)
 * - Lead             → callback form submitted (primary ad conversion)
 * - InitiateCheckout → booking calendar opened on /book
 * - Schedule         → booking completed (Planway confirmation page /tak)
 * - Contact          → phone number tapped
 */

import { captureAttribution, getAttribution, getExternalId } from "@/lib/attribution";
import { hasMarketingConsent } from "@/lib/consent";

export type PixelParams = Record<
  string,
  string | number | boolean | string[] | undefined
>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Random id shared between the browser event and its server-side twin. */
export function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Kør `fn`, så snart fbevents.js er indlæst.
 *
 * Uden det her tabte vi browserhalvdelen af konverteringer på sider, der
 * indlæses forfra. `/tak` er det værste tilfælde: Planways bekræftelse bryder
 * ud af iframen med en helt ny sideindlæsning, <BookingConfirmed /> fyrer sit
 * event i en mount-effect, og <MetaPixel /> indsætter først scriptet ét
 * render senere, fordi den skal tjekke samtykke først. Effekten vandt hver
 * gang, `window.fbq` fandtes ikke endnu, og eventet blev droppet lydløst. Det
 * viste sig i Testhændelser som en Planlægning, der kun kom fra Server.
 *
 * Vi venter i stedet i op til ti sekunder. Event-id'et er det samme, så Meta
 * deduplikerer stadig mod serverhalvdelen, selv om browserhalvdelen kommer
 * et øjeblik senere.
 */
function whenPixelReady(fn: () => void, attempt = 0) {
  if (typeof window.fbq === "function") {
    fn();
    return;
  }
  if (attempt >= 50) return; // ~10 sekunder, så giver vi op i stilhed
  window.setTimeout(() => whenPixelReady(fn, attempt + 1), 200);
}

export function trackPixel(
  event: string,
  params?: PixelParams,
  eventId?: string,
) {
  if (typeof window === "undefined") return;
  if (!hasMarketingConsent()) return;
  whenPixelReady(() => sendPixel(event, params, eventId));
}

function sendPixel(event: string, params?: PixelParams, eventId?: string) {
  const fbq = window.fbq;
  if (typeof fbq !== "function") return;
  try {
    // Re-assert external_id on every event. <MetaPixel /> sets it at init, but
    // the cookie may have been written by the server on a later request than
    // the one that loaded the pixel, so init can have run without it.
    const externalId = getExternalId();
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    if (externalId && pixelId) {
      // Re-initialising the same pixel id is Meta's documented way to update
      // Advanced Matching. It does not fire a second PageView.
      fbq("init", pixelId, { external_id: externalId });
    }

    fbq("track", event, params, eventId ? { eventID: eventId } : undefined);
  } catch {
    // Never let tracking break the UI.
  }
}

/**
 * Send an event to the Conversions API through our own server.
 * Fire-and-forget — a failure here must never surface to the visitor.
 */
export function sendToCapi(
  event: string,
  eventId: string,
  params?: PixelParams,
) {
  if (typeof window === "undefined") return;
  if (!hasMarketingConsent()) return;
  try {
    // Make sure the identity values are in place BEFORE the event is sent.
    // The server writes cnc_uid/_fbc/_fbp, but a cookie evicted by ITP is only
    // restored from the localStorage mirror here. <AttributionCapture /> also
    // calls this, but both run in a useEffect and the order between two
    // components' effects is not guaranteed. Idempotent.
    captureAttribution();

    const body = JSON.stringify({
      event,
      eventId,
      eventSourceUrl: window.location.href,
      params: params ?? {},
      attribution: getAttribution(),
    });

    // keepalive so the request survives the page unload that follows a
    // redirect-style CTA (e.g. opening the Planway booking page).
    void fetch("/api/meta/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Ignore — tracking is never allowed to break the page.
  }
}

/**
 * Track a conversion both ways (browser pixel + server CAPI) with one shared
 * event id. Use this for anything that matters commercially.
 *
 * @returns the event id, so a caller that sends the server half itself
 *          (e.g. a server action with hashed contact details) can reuse it.
 */
export function trackConversion(
  event: string,
  params?: PixelParams,
  options?: { eventId?: string; skipServer?: boolean },
): string {
  const eventId = options?.eventId ?? newEventId();
  if (typeof window !== "undefined" && !hasMarketingConsent()) return eventId;
  trackPixel(event, params, eventId);
  if (!options?.skipServer) sendToCapi(event, eventId, params);
  return eventId;
}
