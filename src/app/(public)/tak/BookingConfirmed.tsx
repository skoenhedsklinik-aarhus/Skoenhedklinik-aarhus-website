"use client";

import { useEffect, useRef } from "react";
import { trackConversion, newEventId } from "@/lib/pixel";

/**
 * Fires the booking conversion on the Planway confirmation page.
 *
 * --- Why this page needs a gate ---
 * Planway's "Ekstern bekræftelsesside" is a bare
 * https://www.skoenhedsklinik-aarhus.dk/tak with no query parameters at all:
 * no booking id, no name, no price. The page is therefore indistinguishable
 * from a direct visit by its URL alone, and it used to fire `Schedule` on
 * every single load. A refresh, a back-navigation or someone typing the URL
 * each produced a booking that never happened. Those phantom events carry no
 * click id, so they inflated the booking count and dragged Event Match Quality
 * down at the same time.
 *
 * --- The signals we do have ---
 * 1. Framing. Planway is embedded in an iframe on /book, so its confirmation
 *    redirect loads /tak INSIDE that iframe. A direct visit is never framed.
 *    This is the strongest signal and it covers the normal path.
 * 2. Referrer. When the booking runs in its own tab ("Åbn i nyt vindue") the
 *    redirect is top-level and the referrer is *.planway.com.
 * 3. A per-tab marker written on /book. Catches the case where the referrer is
 *    stripped and the redirect is not framed.
 *
 * A missed booking costs more than a phantom one, so the three are OR'd. The
 * single-fire marker below is what stops the phantoms.
 *
 * --- Two page loads, one conversion ---
 * The framed load cannot be the one that reports: the event would be recorded
 * against a page inside a frame, and the visitor would see the thank-you page
 * squeezed into the booking widget. So the framed load mints the event id,
 * stores it, and breaks out. The top-level load that follows reads the marker
 * and fires. Both documents are our own origin, so they share sessionStorage.
 *
 * Why `Schedule` and not `Purchase`: nothing is paid at booking time, and some
 * bookings become no-shows. Reporting them as purchases would put fictional
 * revenue in Ads Manager that can never be reconciled against Dinero.
 * `Schedule` is Meta's standard event for exactly this, and it still carries a
 * value, so value-based bidding remains possible.
 */

/** Set on /book, proves this tab actually opened the booking widget. */
const STARTED_KEY = "sk_booking_started";
/** The booking being confirmed: its event id and whether it already reported. */
const MARKER_KEY = "sk_booking_confirmed";
/** How long a booking signal stays trustworthy. Matches the /book cookies. */
const MAX_AGE_MS = 1000 * 60 * 60 * 6;

type Marker = { id: string; ts: number; fired: boolean };

function readJson<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode. Falling back to firing once per load is acceptable:
    // without sessionStorage there is no refresh to remember anyway.
  }
}

function isFresh(ts: number | undefined): boolean {
  return typeof ts === "number" && Date.now() - ts < MAX_AGE_MS;
}

/** True when the document was reached from Planway's booking system. */
function cameFromPlanway(): boolean {
  try {
    if (!document.referrer) return false;
    const host = new URL(document.referrer).hostname.toLowerCase();
    return host === "planway.com" || host.endsWith(".planway.com");
  } catch {
    return false;
  }
}

function isFramed(): boolean {
  try {
    return window.top !== window.self;
  } catch {
    // Cross-origin parent throws on access, which itself means we are framed.
    return true;
  }
}

export function BookingConfirmed({
  treatmentName,
  value,
}: {
  treatmentName: string | null;
  /** Estimated booking value in DKK, or null when no price is known. */
  value: number | null;
}) {
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    // --- 1. Framed load: record the booking, then escape the iframe ---------
    // Runs regardless of consent. Leaving the visitor inside the booking
    // widget would be a broken page, not a tracking decision.
    if (isFramed()) {
      const existing = readJson<Marker>(MARKER_KEY);
      if (!existing || !isFresh(existing.ts) || existing.fired) {
        writeJson(MARKER_KEY, {
          id: newEventId(),
          ts: Date.now(),
          fired: false,
        } satisfies Marker);
      }
      try {
        if (window.top) {
          window.top.location.href = window.location.href;
          return;
        }
      } catch {
        // Cross-origin parent: fall through and report from inside the frame.
      }
    }

    // --- 2. Decide whether a booking really happened ------------------------
    const marker = readJson<Marker>(MARKER_KEY);
    const started = readJson<{ ts: number }>(STARTED_KEY);

    if (marker?.fired) return; // already reported: refresh or back-navigation
    const genuine =
      (marker !== null && isFresh(marker.ts)) ||
      cameFromPlanway() ||
      (started !== null && isFresh(started.ts));

    if (!genuine) return; // direct visit, crawler, or a stale tab

    // --- 3. Report exactly once --------------------------------------------
    // Reusing the id minted in the framed load keeps one booking to one id
    // across both page loads, so the pixel and the Conversions API halves
    // deduplicate against each other rather than double-counting.
    const eventId = marker && isFresh(marker.ts) ? marker.id : newEventId();

    writeJson(MARKER_KEY, {
      id: eventId,
      ts: marker && isFresh(marker.ts) ? marker.ts : Date.now(),
      fired: true,
    } satisfies Marker);

    trackConversion(
      "Schedule",
      {
        content_name: treatmentName ?? "Booking",
        content_category: "planway-booking",
        content_type: "product",
        currency: "DKK",
        ...(value && value > 0 ? { value } : {}),
      },
      { eventId },
    );

    // Logged on purpose: this is the id to search for in Events Manager →
    // Test Events when checking that the browser and server halves merged.
    // console.info, never console.error — a tracking detail is not a fault.
    console.info(`[schedule] event_id=${eventId}`);

    // Clear the booking cookies so a later visit to /tak can't re-label itself
    // with a stale booking.
    for (const name of ["sk_booking_service", "sk_booking_slug"]) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    }
  }, [treatmentName, value]);

  return null;
}
