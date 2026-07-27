"use client";

import { useEffect, useRef } from "react";
import { trackConversion } from "@/lib/pixel";

/**
 * Fires the booking conversion on the Planway confirmation page.
 *
 * Planway redirects to this page from inside the embedded booking iframe
 * (Indstillinger → Online booking → "Ekstern bekræftelsesside"). Two things
 * have to happen here:
 *
 * 1. Break out of the iframe. Otherwise the visitor sees our thank-you page
 *    squeezed into the booking frame, and the conversion is recorded against a
 *    framed page. Our page and the parent are the same origin, so this is
 *    allowed; if it ever isn't, we fall through and track inside the frame.
 *
 * 2. Fire `Schedule` — the actual completed-booking conversion — to both the
 *    browser pixel and the Conversions API with one shared event id.
 *
 * Why `Schedule` and not `Purchase`: nothing is paid at booking time, and some
 * bookings become no-shows. Reporting them as purchases would put fictional
 * revenue in Ads Manager that can never be reconciled against Dinero. `Schedule`
 * is Meta's standard event for exactly this, and it still carries a value, so
 * value-based bidding remains possible.
 */
export function BookingConfirmed({
  treatmentName,
  value,
}: {
  treatmentName: string | null;
  /** Estimated booking value in DKK, or null when no price is known. */
  value: number | null;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // 1 — escape the Planway iframe; the top-level load fires the event instead.
    if (typeof window !== "undefined" && window.top && window.top !== window.self) {
      try {
        window.top.location.href = window.location.href;
        return;
      } catch {
        // Cross-origin parent: stay put and track from inside the frame.
      }
    }

    // 2 — booking completed.
    trackConversion("Schedule", {
      content_name: treatmentName ?? "Booking",
      content_category: "planway-booking",
      content_type: "product",
      currency: "DKK",
      ...(value && value > 0 ? { value } : {}),
    });

    // Clear the booking cookies so a later visit to /tak can't re-label itself
    // with a stale booking.
    for (const name of ["sk_booking_service", "sk_booking_slug"]) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    }
  }, [treatmentName, value]);

  return null;
}
