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

import { captureAttribution, getAttribution } from "@/lib/attribution";

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

/** Fire a browser-side pixel event. Safe to call anywhere. */
export function trackPixel(
  event: string,
  params?: PixelParams,
  eventId?: string,
) {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;
  try {
    window.fbq(
      "track",
      event,
      params,
      eventId ? { eventID: eventId } : undefined,
    );
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
  try {
    // Sørg for at _fbp/_fbc findes, FØR eventet sendes. <AttributionCapture />
    // skriver dem også, men begge kører i en useEffect, og rækkefølgen mellem
    // to komponenters effects er ikke garanteret. Uden det her afsendes en del
    // events før cookien er skrevet, og så mangler Meta et browser-id at matche
    // på (målt: fbp-dækning på 77% for ViewContent). Kaldet er idempotent.
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
  trackPixel(event, params, eventId);
  if (!options?.skipServer) sendToCapi(event, eventId, params);
  return eventId;
}
