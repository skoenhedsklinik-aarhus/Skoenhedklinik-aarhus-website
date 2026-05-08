import { getPricingTiers, getPackagesOffers } from "@/lib/supabase-queries";
import { PricingClient } from "./PricingClient";

export default async function PricingPage() {
  const pricingTiers = await getPricingTiers();
  const packagesOffers = await getPackagesOffers();

  return <PricingClient pricingTiers={pricingTiers} packagesOffers={packagesOffers} />;
}
