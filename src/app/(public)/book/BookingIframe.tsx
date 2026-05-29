"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";

export function BookingIframe() {
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service");
  const [loaded, setLoaded] = useState(false);

  // Base Planway URL
  let iframeUrl = "https://skonhedsklinik-aarhus.planway.com/";

  // Deep link if a service slug is in the URL (Planway_service_id mapping TBD)
  if (serviceSlug) {
    iframeUrl += `?d=${serviceSlug}`;
  }

  return (
    <div className="w-full">
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
