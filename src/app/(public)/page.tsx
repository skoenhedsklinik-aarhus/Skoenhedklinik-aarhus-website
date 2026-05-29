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
import { localBusinessSchema } from "@/lib/schema";

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
  const jsonLd = localBusinessSchema();

  return (
    <main className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
