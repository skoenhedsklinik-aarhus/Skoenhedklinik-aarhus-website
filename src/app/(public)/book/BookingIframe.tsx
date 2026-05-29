"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink, Check } from "lucide-react";
import { buildPlanwayUrl, type BookableService } from "@/lib/booking";

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
