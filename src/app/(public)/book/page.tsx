"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Info, ExternalLink } from "lucide-react";

function BookingIframe() {
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service");
  
  // Base URL from mock settings
  let iframeUrl = "https://skonhedsklinik-aarhus.planway.com/";
  
  // If we had a real mapping of slug to planway_service_id, we would append it here.
  // For mock purposes, if there is a service, we'll pretend to deep link.
  if (serviceSlug) {
    // Just a mock deep link pattern since we don't have real IDs mapped in mock yet
    iframeUrl += `?d=laser`; 
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
        Problemer med booking? <strong className="font-medium">Åbn i nyt vindue</strong>
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

export default function BookPage() {
  return (
    <main className="flex flex-col min-h-screen bg-cream">
      {/* Hero */}
      <section className="pt-20 pb-10 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-textPrimary mb-4">
            Book din tid
          </h1>
          <p className="text-lg text-textBody">
            Vælg behandling, dato og tidspunkt nedenfor.
          </p>
        </div>
      </section>

      {/* Practical Info Callout */}
      <section className="px-4 pb-10">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white rounded-xl p-6 border border-sand flex gap-4 items-start shadow-sm">
            <Info className="w-6 h-6 text-cognac shrink-0 mt-1" />
            <p className="text-textBody leading-relaxed">
              <strong>Bemærk:</strong> Laserbehandlinger og tatoveringsfjernelse kræver en gratis forundersøgelse 
              hos vores sygeplejerske før første behandling. Det tager ca. 30 minutter og er helt uforpligtende.
            </p>
          </div>
        </div>
      </section>

      {/* Iframe Section */}
      <section className="px-4 pb-20 flex-grow">
        <div className="container mx-auto max-w-5xl">
          <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-white rounded-xl shadow-sm">Indlæser booking system...</div>}>
            <BookingIframe />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
