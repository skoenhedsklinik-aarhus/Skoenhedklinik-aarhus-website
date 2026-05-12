import type { Metadata } from "next";
import { Suspense } from "react";
import { Info } from "lucide-react";
import { BookingIframe } from "./BookingIframe";

export const metadata: Metadata = {
  title: "Book din tid — Skønhedsklinik Aarhus",
  description:
    "Book en behandling eller gratis konsultation online hos Skønhedsklinik Aarhus. Vælg behandling, dato og tidspunkt direkte her.",
  robots: { index: false, follow: false },
};

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

