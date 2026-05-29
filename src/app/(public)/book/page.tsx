import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingIframe } from "./BookingIframe";

export const metadata: Metadata = {
  title: "Book din tid — Skønhedsklinik Aarhus",
  description:
    "Book din tid hos Skønhedsklinik Aarhus. Vælg behandling, dato og tidspunkt direkte online — nemt og hurtigt.",
};

export default function BookPage() {
  return (
    <main className="bg-cream min-h-screen">
      {/* Hero */}
      <section className="bg-cream pt-20 pb-10 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <span className="eyebrow text-cognac mb-5 block">Book online</span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-textPrimary mb-4">
            Book din tid
          </h1>
          <p className="text-lg text-textBody">
            Vælg din behandling, find et ledigt tidspunkt, og bekræft din
            booking direkte her på siden.
          </p>
        </div>
      </section>

      {/* Embed */}
      <section className="w-full max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 pb-24">
        <Suspense fallback={null}>
          <BookingIframe />
        </Suspense>
      </section>
    </main>
  );
}
