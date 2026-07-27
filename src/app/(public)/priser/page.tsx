import type { Metadata } from "next";
import { getPricingTiers, getPackagesOffers } from "@/lib/supabase-queries";
import { PricingClient } from "./PricingClient";

export const metadata: Metadata = {
  title: "Priser — Skønhedsklinik Aarhus",
  description:
    "Se alle priser for vores behandlinger: laser hårfjerning, sugaring, wax, ansigtsbehandlinger, tandblegning, threading og tattoo-fjernelse. 10% studierabat på behandlinger fra 400 kr. mod fremvisning af gyldigt studiekort.",
  alternates: { canonical: "/priser" },
  openGraph: {
    title: "Priser — Skønhedsklinik Aarhus",
    description:
      "Gennemsigtige priser for alle behandlinger. 10% studierabat på behandlinger fra 400 kr. Se vores aktuelle tilbud og pakker.",
    url: "/priser",
  },
};

export default async function PricingPage() {
  const pricingTiers = await getPricingTiers();
  const packagesOffers = await getPackagesOffers();

  return <PricingClient pricingTiers={pricingTiers} packagesOffers={packagesOffers} />;
}

