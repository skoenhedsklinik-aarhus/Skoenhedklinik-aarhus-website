"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink, Check } from "lucide-react";
import { buildPlanwayUrl, type BookableService } from "@/lib/booking";
import { trackConversion } from "@/lib/pixel";

/** How long the picked treatment is remembered for the /tak conversion. */
const BOOKING_COOKIE_MAX_AGE = 60 * 60 * 6; // 6 hours

export function BookingIframe({
  serviceMap,
}: {
  serviceMap: Record<string, BookableService>;
}) {
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service");
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const engagedRef = useRef(false);

  // Resolve the deep-linked service (if any) and build the Planway URL centrally.
  // Note: Planway's widget doesn't currently read the param, so this deep-links
  // forward-compatibly while we surface the choice in-page below. See lib/booking.ts.
  const selected = serviceSlug ? serviceMap[serviceSlug] : undefined;
  const iframeUrl = buildPlanwayUrl(selected?.planwayServiceId);
  const selectedName = selected?.name;

  // Booking calendar opened = strong mid-funnel intent signal for Meta ads.
  // Sent both browser-side and server-side (deduplicated on a shared event id).
  useEffect(() => {
    trackConversion("InitiateCheckout", {
      content_name: selectedName ?? "Booking",
      content_category: "booking",
    });
  }, [selectedName]);

  // Remember the treatment so /tak — the page Planway redirects to after a
  // completed booking — can label the Schedule conversion with it. Planway
  // passes nothing back to us, so this cookie is the only link between the two.
  useEffect(() => {
    // Fall back to the slug when the service isn't in the CMS map, so the
    // conversion still carries something more useful than "Booking".
    const label =
      selectedName ??
      (serviceSlug ? serviceSlug.replace(/-/g, " ") : "Booking");
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    const write = (name: string, raw: string) => {
      document.cookie =
        `${name}=${encodeURIComponent(raw)}; Max-Age=${BOOKING_COOKIE_MAX_AGE}` +
        `; Path=/; SameSite=Lax${secure}`;
    };
    write("sk_booking_service", label);
    // The slug lets /tak look up the treatment's price and put a DKK value on
    // the Schedule conversion.
    write("sk_booking_slug", serviceSlug ?? "");
  }, [selectedName, serviceSlug]);

  // The Planway widget runs on its own domain, so we cannot see clicks inside
  // it. The one signal a cross-origin iframe does leak: when the visitor clicks
  // into it, the window blurs and document.activeElement becomes the iframe.
  // That's a reliable "actually started booking" signal — fired once per page.
  useEffect(() => {
    const onBlur = () => {
      if (engagedRef.current) return;
      if (document.activeElement !== frameRef.current) return;
      engagedRef.current = true;
      trackConversion(
        "PlanwayEngaged",
        {
          content_name: selectedName ?? "Booking",
          content_category: "planway-widget",
        },
        { custom: true },
      );
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [selectedName]);

  return (
    <div className="w-full">
      {selected && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-cognac/30 bg-cognac/5 px-5 py-4">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cognac">
            <Check className="h-3.5 w-3.5 text-white" />
          </span>
          <p className="text-sm text-textBody">
            Du booker:{" "}
            <span className="font-medium text-textPrimary">{selected.name}</span>
            {" — "}vælg behandlingen i kalenderen nedenfor.
          </p>
        </div>
      )}

      <div className="relative w-full bg-white rounded-3xl border border-sand/70 overflow-hidden min-h-[900px]">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-cognac border-t-transparent rounded-full animate-spin" />
              <p className="text-textMuted text-sm">Indlæser booking…</p>
            </div>
          </div>
        )}
        <iframe
          ref={frameRef}
          src={iframeUrl}
          width="100%"
          style={{ minHeight: "900px", border: 0 }}
          title="Book behandling hos Skønhedsklinik Aarhus"
          loading="lazy"
          allow="payment"
          onLoad={() => setLoaded(true)}
          className="relative z-10 block w-full"
        />
      </div>

      <div className="flex justify-center mt-5">
        <a
          href={iframeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-textMuted hover:text-cognac transition-colors text-sm"
        >
          Problemer med booking? <span className="font-medium">Åbn i nyt vindue</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
