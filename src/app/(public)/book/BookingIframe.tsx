"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink, Check } from "lucide-react";
import { buildPlanwayUrl, type BookableService } from "@/lib/booking";
import { trackConversion } from "@/lib/pixel";

/** How long the picked treatment is remembered for the /tak conversion. */
const BOOKING_COOKIE_MAX_AGE = 60 * 60 * 6; // 6 hours

/**
 * Planway serveret fra vores eget domæne, så iframen er same-origin.
 * Se `src/app/planway/[[...path]]/route.ts` for hvorfor.
 */
const PROXY_PATH = "/planway";

/** Højde indtil den første måling er kørt. Fra første trin på desktop. */
const FALLBACK_HEIGHT = 970;

export function BookingIframe({
  serviceMap,
}: {
  serviceMap: Record<string, BookableService>;
}) {
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service");
  const [loaded, setLoaded] = useState(false);

  // Resolve the deep-linked service (if any) and build the Planway URL centrally.
  // Note: Planway's widget doesn't currently read the param, so this deep-links
  // forward-compatibly while we surface the choice in-page below. See lib/booking.ts.
  const selected = serviceSlug ? serviceMap[serviceSlug] : undefined;
  // Fallback-linket ("Åbn i nyt vindue") peger med vilje på Planways rigtige
  // domæne. Går proxyen ned, skal nødudgangen ikke gå gennem den samme proxy.
  const directUrl = buildPlanwayUrl(selected?.planwayServiceId);
  const iframeUrl = selected?.planwayServiceId
    ? `${PROXY_PATH}/?service=${encodeURIComponent(selected.planwayServiceId)}`
    : `${PROXY_PATH}/`;
  const selectedName = selected?.name;

  const frameRef = useRef<HTMLIFrameElement>(null);

  /**
   * Sæt rammen til Planways faktiske indholdshøjde.
   *
   * Iframen er same-origin gennem proxyen, så vi kan gøre to ting, der ellers
   * er umulige på tværs af domæner: slå `min-height: calc(100vh - 40px)` fra,
   * som ellers strækker den hvide kolonne til rammens højde og altid giver
   * 95px overskydende, og måle det rigtige indhold på hvert trin.
   *
   * Fejler noget af det, bliver rammen stående på fallback-højden og opfører
   * sig som før. Ingen fejl i konsollen, ingen tom side.
   */
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    let observer: ResizeObserver | undefined;

    const sync = () => {
      let doc: Document | null = null;
      try {
        doc = frame.contentDocument;
      } catch {
        return; // ikke same-origin (fx hvis proxyen er slået fra)
      }
      // Kun Planways egen side. Efter en gennemført booking navigerer iframen
      // til vores /tak, og den skal ikke have injiceret noget.
      if (!doc?.body || !doc.getElementById("widget")) return;

      if (!doc.getElementById("sk-embed-fit")) {
        const style = doc.createElement("style");
        style.id = "sk-embed-fit";
        style.textContent =
          "#widget .booking{min-height:0 !important}" +
          "html,body{height:auto !important;overflow:hidden !important}";
        doc.head.appendChild(style);
      }

      // Bevidst IKKE documentElement.scrollHeight. Den er aldrig mindre end
      // iframens egen højde, så målingen ville låse sig fast på den højde vi
      // lige har sat og kun kunne vokse. `body` med `height:auto` giver det
      // rigtige tal: målt 956px her, hvor documentElement sagde 970px.
      const height = Math.max(
        doc.body.getBoundingClientRect().height,
        doc.body.scrollHeight,
      );
      if (height > 100) frame.style.height = `${Math.ceil(height)}px`;
    };

    const attach = () => {
      sync();
      try {
        const body = frame.contentDocument?.body;
        if (body && "ResizeObserver" in window) {
          observer?.disconnect();
          observer = new ResizeObserver(sync);
          observer.observe(body);
        }
      } catch {
        // ignoreres — pollingen nedenfor dækker os
      }
    };

    frame.addEventListener("load", attach);
    attach();
    // Planway skifter trin med AJAX. Body'ens boks ændrer sig ikke altid
    // synligt for ResizeObserver, så vi måler også med et fast interval.
    const poll = window.setInterval(sync, 400);

    return () => {
      frame.removeEventListener("load", attach);
      observer?.disconnect();
      window.clearInterval(poll);
    };
  }, [iframeUrl]);

  // Booking calendar opened = strong mid-funnel intent signal for Meta ads.
  // Sent both browser-side and server-side (deduplicated on a shared event id).
  useEffect(() => {
    trackConversion("InitiateCheckout", {
      content_name: selectedName ?? "Booking",
      content_category: "booking",
    });
  }, [selectedName]);

  // Prove this tab opened the booking widget. /tak needs it: Planway's
  // confirmation URL carries no parameters at all, so when the redirect is
  // neither framed nor sends a referrer, this marker is the only thing left
  // that separates a real booking from someone typing /tak into the address
  // bar. See <BookingConfirmed />.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        "sk_booking_started",
        JSON.stringify({ ts: Date.now() }),
      );
    } catch {
      // Private mode — the framing and referrer signals still apply.
    }
  }, []);

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

      <div className="relative w-full bg-cream rounded-3xl border border-sand/70 overflow-hidden">
        {!loaded && (
          // Kun i toppen. Rammen er op til 2200px høj på mobil, og en spinner
          // centreret i hele den højde ville stå langt under skærmkanten.
          <div className="absolute inset-x-0 top-0 h-[600px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-cognac border-t-transparent rounded-full animate-spin" />
              <p className="text-textMuted text-sm">Indlæser booking…</p>
            </div>
          </div>
        )}
        {/*
          Ingen fast højde. Effekten ovenfor måler Planways rigtige indhold og
          sætter højden på hvert trin, fordi iframen er same-origin gennem
          /planway. `scrolling="no"` er med, fordi rammen altid passer: er der
          en scrollbar, er det en fejl i målingen, ikke noget brugeren skal
          rydde op i. Fallback-højden gælder indtil første måling er kørt.
        */}
        <iframe
          ref={frameRef}
          src={iframeUrl}
          title="Book behandling hos Skønhedsklinik Aarhus"
          allow="payment"
          scrolling="no"
          onLoad={() => setLoaded(true)}
          style={{ height: `${FALLBACK_HEIGHT}px` }}
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
