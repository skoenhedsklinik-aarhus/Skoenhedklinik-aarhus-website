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

export default async function Home() {
  const services = await getServices();
  const packagesOffers = await getPackagesOffers();
  const tips = await getTipsAndTricks();
  const teamMembers = await getTeamMembers();

  return (
    <main className="flex flex-col min-h-screen">
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
