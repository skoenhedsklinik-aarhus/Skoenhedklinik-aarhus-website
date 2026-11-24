"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink, Check } from "lucide-react";
import { buildBookingUrl, isGeckoOrigin, type BookableService } from "@/lib/booking";
import { trackConversion } from "@/lib/pixel";

/** How long the picked treatment is remembered for the /tak conversion. */
const BOOKING_COOKIE_MAX_AGE = 60 * 60 * 6; // 6 hours

/** Højde indtil Gecko har meldt sin første højde. */
const FALLBACK_HEIGHT = 970;

/** Gecko melder højden som et tal eller som `{ geckoSetHeight }`. */
function heightFromMessage(data: unknown): number | null {
  const raw =
    data && typeof data === "object" && "geckoSetHeight" in data
      ? (data as { geckoSetHeight: unknown }).geckoSetHeight
      : data;
  const height = typeof raw === "string" ? Number(raw) : raw;
  return typeof height === "number" && Number.isFinite(height) && height > 100
    ? Math.ceil(height)
    : null;
}

export function BookingIframe({
  serviceMap,
}: {
  serviceMap: Record<string, BookableService>;
}) {
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service");
  const [loaded, setLoaded] = useState(false);
  const [height, setHeight] = useState<number | null>(null);

  // Resolve the deep-linked service (if any). With a Gecko id it opens with the
  // treatment preselected; without one it opens on the full treatment list.
  const selected = serviceSlug ? serviceMap[serviceSlug] : undefined;
  const iframeUrl = buildBookingUrl(selected?.bookingServiceId, selected?.bookingCalendarId);
  const directUrl = buildBookingUrl(selected?.bookingServiceId, selected?.bookingCalendarId, {
    embedded: false,
  });
  const selectedName = selected?.name;

  const frameRef = useRef<HTMLIFrameElement>(null);

  // Gecko sender sin indholdshøjde med postMessage på hvert trin. Samme
  // beskeder som deres iframe.js lytter efter, men kun fra Geckos domæne og
  // kun fra vores egen ramme.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isGeckoOrigin(event.origin)) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      const next = heightFromMessage(event.data);
      if (next) setHeight(next);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Booking calendar opened = strong mid-funnel intent signal for Meta ads.
  // Sent both browser-side and server-side (deduplicated on a shared event id).
  useEffect(() => {
    trackConversion("InitiateCheckout", {
      content_name: selectedName ?? "Booking",
      content_category: "booking",
    });
  }, [selectedName]);

  // Prove this tab opened the booking widget. /tak uses it to tell a real
  // booking from someone typing /tak into the address bar.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        "sk_booking_started",
        JSON.stringify({ ts: Date.now() }),
      );
    } catch {
      // Private mode. The other signals on /tak still apply.
    }
  }, []);

  // Remember the treatment so a later conversion can be labelled with it.
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
            {selected.bookingServiceId
              ? null
              : ". Vælg behandlingen i kalenderen nedenfor."}
          </p>
        </div>
      )}

      <div className="relative w-full bg-cream rounded-3xl border border-sand/70 overflow-hidden">
        {!loaded && (
          <div className="absolute inset-x-0 top-0 h-[600px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-cognac border-t-transparent rounded-full animate-spin" />
              <p className="text-textMuted text-sm">Indlæser booking…</p>
            </div>
          </div>
        )}
        {/*
          Højden kommer fra Gecko. Indtil første besked står rammen på
          fallback-højden og må scrolle, så intet bliver skjult, hvis Gecko
          aldrig melder en højde.
        */}
        <iframe
          ref={frameRef}
          src={iframeUrl}
          title="Book behandling hos Skønhedsklinik Aarhus"
          allow="payment; publickey-credentials-get *"
          scrolling={height ? "no" : "auto"}
          onLoad={() => setLoaded(true)}
          style={{ height: `${height ?? FALLBACK_HEIGHT}px` }}
          className="relative z-10 block w-full border-0"
        />
      </div>

      <div className="flex justify-center mt-5">
        <a
          href={directUrl}
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
