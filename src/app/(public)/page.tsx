import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { PopularTreatments } from "@/components/home/PopularTreatments";
import { ParallaxFloating } from "@/components/home/ParallaxFloating";
import { NeverKnowSection } from "@/components/home/NeverKnowSection";
import { BeforeAfterSlider } from "@/components/home/BeforeAfterSlider";
import { BookingSection } from "@/components/home/BookingSection";
import { GoogleReviews } from "@/components/home/GoogleReviews";
import { TeamSection } from "@/components/home/TeamSection";
import { FinalCTA } from "@/components/shared/FinalCTA";
import { getServices, getTeamMembers } from "@/lib/supabase-queries";
import { getGoogleReviews } from "@/lib/reviews";
import { localBusinessSchema, reviewsSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Skønhedsklinik Aarhus — Certificeret skønhedsbehandling i Aarhus C",
  description:
    "Professionel skønhedsklinik i Aarhus. Specialister i laser hårfjerning, ansigtsbehandlinger, sugaring, tattoo-fjernelse og tandblegning. Gratis konsultation. Registreret hos STPS.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Skønhedsklinik Aarhus — Professionel skønhedsbehandling",
    description:
      "Certificeret klinik i Aarhus C. Laser hårfjerning, ansigtsbehandlinger, sugaring og meget mere. Book gratis konsultation.",
    url: "/",
  },
};

export default async function Home() {
  const services = await getServices();
  const teamMembers = await getTeamMembers();
  const googleReviews = await getGoogleReviews(4);

  // Rich results (stars in Google) — only ever emitted from real Google data.
  // Marking up fallback testimonials would be a structured-data policy breach.
  const hasRealReviews =
    googleReviews.source === "google" &&
    googleReviews.rating != null &&
    googleReviews.totalCount != null;

  const jsonLd = localBusinessSchema(
    hasRealReviews
      ? {
          aggregateRating: {
            ratingValue: googleReviews.rating as number,
            reviewCount: googleReviews.totalCount as number,
          },
        }
      : undefined,
  );

  const reviewJsonLd = hasRealReviews
    ? reviewsSchema(
        googleReviews.reviews.map((r) => ({
          author: r.author,
          text: r.text,
          rating: r.rating,
          time: r.time ?? undefined,
        })),
      )
    : [];

  return (
    <main className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {reviewJsonLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
        />
      )}
      <HeroSection />
      <PopularTreatments services={services} />
      <ParallaxFloating />
      <NeverKnowSection />
      <BeforeAfterSlider />
      <BookingSection />
      <GoogleReviews />
      <TeamSection teamMembers={teamMembers} />
      <FinalCTA />
    </main>
  );
}
