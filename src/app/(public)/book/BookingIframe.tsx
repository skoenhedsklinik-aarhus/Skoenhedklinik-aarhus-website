"use client";

import { useEffect, useState } from "react";
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
          Fast højde pr. skærmbredde, målt på Planways egen side.
          Planway sender ingen postMessage med indholdshøjden, og iframen er på
          et andet domæne, så højden kan hverken aflæses eller sættes
          automatisk. Tallene her er første trin ("Vælg service"), som er det
          alle ser, plus lidt luft:

            under 768px   indhold 2137px   sidepanelet ligger under, ét felt pr. række
            768-991px     indhold 1684px   to felter pr. række
            992px og op   indhold  956px   sidepanelet ligger ved siden af

          992px er Bootstrap 3's breakpoint, som Planway bruger. Det er verificeret:
          991px giver 1684px, 992px giver 956px.

          Senere trin med lange behandlingslister (fx laser hårfjerning, 2921px
          på desktop) ruller stadig inde i iframen. At undgå det ville kræve
          ~3000px på desktop og ~5000px på mobil, altså flere tusinde pixels
          tom plads på første trin. Det er værre end en scrollbar.
        */}
        <iframe
          src={iframeUrl}
          title="Book behandling hos Skønhedsklinik Aarhus"
          loading="lazy"
          allow="payment"
          onLoad={() => setLoaded(true)}
          className="relative z-10 block w-full border-0 h-[2200px] md:h-[1750px] min-[992px]:h-[1000px]"
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
