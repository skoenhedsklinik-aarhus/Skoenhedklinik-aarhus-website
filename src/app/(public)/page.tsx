import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustStrip } from "@/components/shared/TrustStrip";
import { PackagesOffer } from "@/components/home/PackagesOffer";
import { PopularTreatments } from "@/components/home/PopularTreatments";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { TipsAndTricks } from "@/components/home/TipsAndTricks";
import { GoogleReviews } from "@/components/home/GoogleReviews";
import { TeamSection } from "@/components/home/TeamSection";
import { FinalCTA } from "@/components/shared/FinalCTA";
import { getServices, getPackagesOffers, getTipsAndTricks, getTeamMembers } from "@/lib/supabase-queries";
import { localBusinessSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Skønhedsklinik Aarhus — Certificeret skønhedsbehandling i Aarhus C",
  description:
    "Professionel skønhedsklinik i Aarhus. Specialister i permanent hårfjerning (laser), ansigtsbehandlinger, sugaring, tattoo-fjernelse og tandblegning. Gratis konsultation. Registreret hos STPS.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Skønhedsklinik Aarhus — Professionel skønhedsbehandling",
    description:
      "Certificeret klinik i Aarhus C. Permanent hårfjerning, ansigtsbehandlinger, sugaring og meget mere. Book gratis konsultation.",
    url: "/",
  },
};

export default async function Home() {
  const services = await getServices();
  const packagesOffers = await getPackagesOffers();
  const tips = await getTipsAndTricks();
  const teamMembers = await getTeamMembers();

  const jsonLd = localBusinessSchema();

  return (
    <main className="flex flex-col min-h-screen">
      {/* Schema.org LocalBusiness + MedicalBusiness */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <TrustStrip />
      <PackagesOffer packagesOffers={packagesOffers} />
      <PopularTreatments services={services} />
      <WhyChooseUs />
      <TipsAndTricks tips={tips} />
      <GoogleReviews />
      <TeamSection teamMembers={teamMembers} />
      {/* Instagram feed would go here, pending decision */}
      <FinalCTA />
    </main>
  );
}

