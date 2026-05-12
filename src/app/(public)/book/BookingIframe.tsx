"use client";

import { useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";

export function BookingIframe() {
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service");

  // Base Planway URL
  let iframeUrl = "https://skonhedsklinik-aarhus.planway.com/";

  // Deep link if a service slug is in the URL (Planway_service_id mapping TBD)
  if (serviceSlug) {
    iframeUrl += `?d=${serviceSlug}`;
  }

  return (
    <div className="w-full flex flex-col items-center">
      <iframe
        src={iframeUrl}
        width="100%"
        style={{ minHeight: "100vh", border: 0 }}
        title="Book behandling hos Skønhedsklinik Aarhus"
        loading="lazy"
        allow="payment"
        className="bg-white rounded-xl shadow-sm"
      />
      <a
        href={iframeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex items-center gap-2 text-textBody hover:text-cognac transition-colors"
      >
        Problemer med booking?{" "}
        <strong className="font-medium">Åbn i nyt vindue</strong>
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
