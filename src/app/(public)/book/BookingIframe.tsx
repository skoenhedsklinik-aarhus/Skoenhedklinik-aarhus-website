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
          Fast højde pr. skærmbredde, målt på Planways egen side EFTER at
          kortet i sidepanelet er indlæst. Det er pointen: måler man for tidligt,
          får man et tal der er 40-60px for lavt, og så ruller embedden alligevel.

          Målt, stabilt over 7 sekunder:
            375px     indhold 2137px    sidepanel under, ét felt pr. række
            800px     indhold 1723px    to felter pr. række
            992px+    indhold  995px    sidepanel ved siden af
                                        (samme tal ved 992, 1100 og 1431px)

          992px er Bootstrap 3's breakpoint, som Planway er bygget på.

          Højderne har ~150px luft med vilje. Skriftrendering, scrollbar-bredde
          og zoom flytter sig fra maskine til maskine, og en højde der passer
          præcist på én skærm giver en scrollbar på den næste. Luften er cream
          ligesom Planways egen baggrund, så den ser ud som bundpadding.

          Senere trin med lange behandlingslister (laser hårfjerning fylder
          2921px på desktop) ruller stadig indeni. Det kan ikke fikses med en
          fast højde: at dække alt ville kræve ~3000px på desktop og ~5000px på
          mobil, altså tusindvis af pixels tom plads på første trin. Den eneste
          fuldstændige løsning er at proxy'e Planway gennem vores eget domæne,
          så iframen bliver same-origin og højden kan aflæses direkte. Fravalgt,
          fordi Planways session-cookies så ville høre til det forkerte domæne,
          og en fejl dér koster bookinger.
        */}
        <iframe
          src={iframeUrl}
          title="Book behandling hos Skønhedsklinik Aarhus"
          loading="lazy"
          allow="payment"
          onLoad={() => setLoaded(true)}
          className="relative z-10 block w-full border-0 h-[2300px] md:h-[1880px] min-[992px]:h-[1150px]"
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
