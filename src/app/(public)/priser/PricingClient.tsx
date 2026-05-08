"use client";

import { useEffect, useState } from "react";
import { FinalCTA } from "@/components/shared/FinalCTA";
import { Info } from "lucide-react";
import { Database } from "@/types/supabase";

type PricingTier = Database["public"]["Tables"]["pricing_tiers"]["Row"];
type PackageOffer = Database["public"]["Tables"]["packages_offers"]["Row"];

const CATEGORIES = [
  { id: "alle", label: "Alle" },
  { id: "haarfjerning", label: "Hårfjerning" },
  { id: "sugaring", label: "Sugaring" },
  { id: "wax", label: "Wax" },
  { id: "ansigt", label: "Ansigt" },
  { id: "bryn-vipper", label: "Bryn & vipper" },
  { id: "tand", label: "Tandblegning" },
  { id: "threading", label: "Threading" },
  { id: "tatovering", label: "Tatovering" },
  { id: "pakker", label: "Pakker" },
];

interface PricingClientProps {
  pricingTiers: PricingTier[];
  packagesOffers: PackageOffer[];
}

export function PricingClient({ pricingTiers, packagesOffers }: PricingClientProps) {
  const [activeSection, setActiveSection] = useState("alle");

  // Handle scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = CATEGORIES.map((c) => c.id).filter((id) => id !== "alle");
      let current = "alle";

      for (const id of sections) {
        const el = document.getElementById(`kategori-${id}`);
        if (el && window.scrollY >= el.offsetTop - 150) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    if (id === "alle") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(`kategori-${id}`);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });
    }
  };

  // Group pricing tiers
  const groupedPricing = pricingTiers.reduce((acc, tier) => {
    if (!acc[tier.category]) acc[tier.category] = {};
    const sub = tier.subcategory || "Andre";
    if (!acc[tier.category][sub]) acc[tier.category][sub] = [];
    acc[tier.category][sub].push(tier);
    return acc;
  }, {} as Record<string, Record<string, typeof pricingTiers>>);

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="bg-cream py-20 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-textPrimary mb-6">
            Priser
          </h1>
          <p className="text-lg text-textBody leading-relaxed">
            Gennemsigtige priser på alle vores behandlinger. Vi tilbyder altid
            kvalitetsbehandlinger udført af certificeret personale.
          </p>
        </div>
      </section>

      {/* Sticky Nav */}
      <div className="sticky top-20 z-40 bg-white border-b border-sand shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-4 hide-scrollbar gap-2 md:justify-center">
            {CATEGORIES.map((cat) => {
              // Only show category if it has prices or if it's "alle" or "pakker" with active packages
              if (
                cat.id !== "alle" &&
                cat.id !== "pakker" &&
                !groupedPricing[cat.id]
              ) {
                return null;
              }
              if (cat.id === "pakker" && packagesOffers.length === 0) return null;

              return (
                <button
                  key={cat.id}
                  onClick={() => scrollTo(cat.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeSection === cat.id
                      ? "bg-cognac text-white"
                      : "bg-beige text-textBody hover:bg-cognac/10"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="py-16 px-4 bg-white flex-grow">
        <div className="container mx-auto max-w-4xl space-y-20">
          
          {/* Studierabat Callout */}
          <div className="bg-moss/10 border border-moss/20 rounded-xl p-6 flex gap-4 items-start">
            <Info className="w-6 h-6 text-moss shrink-0 mt-1" />
            <div>
              <h3 className="font-heading text-xl text-textPrimary mb-2">Studierabat</h3>
              <p className="text-textBody">
                Vi tilbyder altid <strong>10% i studierabat</strong> i HELE åbningstiden, mod fremvisning af gyldigt studiekort. 
                <br className="hidden sm:block" />
                (Gælder ikke pakker og i forvejen nedsatte priser).
              </p>
            </div>
          </div>

          {/* Pricing Sections */}
          {Object.entries(groupedPricing).map(([categoryId, subcategories]) => {
            const catLabel = CATEGORIES.find(c => c.id === categoryId)?.label;
            if (!catLabel) return null;

            return (
              <div key={categoryId} id={`kategori-${categoryId}`} className="scroll-mt-32">
                <h2 className="font-heading text-3xl md:text-4xl text-textPrimary mb-8 pb-4 border-b-2 border-cognac inline-block">
                  {catLabel}
                </h2>

                <div className="space-y-12">
                  {Object.entries(subcategories).map(([subcat, tiers]) => (
                    <div key={subcat}>
                      {subcat !== "Andre" && (
                        <h3 className="font-heading text-2xl text-textPrimary mb-6 pb-2 border-b border-sand">
                          {subcat}
                        </h3>
                      )}
                      <ul className="space-y-4">
                        {tiers.map((tier) => (
                          <li key={tier.id} className="flex justify-between items-center text-textBody">
                            <span className="pr-4">{tier.name}</span>
                            <span className="font-medium text-textPrimary font-[tabular-nums] whitespace-nowrap">
                              {tier.price_dkk} kr.
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Packages Section */}
          {packagesOffers.length > 0 && (
            <div id="kategori-pakker" className="scroll-mt-32">
              <h2 className="font-heading text-3xl md:text-4xl text-textPrimary mb-8 pb-4 border-b-2 border-cognac inline-block">
                Pakker & Tilbud
              </h2>
              <ul className="space-y-4">
                {packagesOffers.map((pkg) => (
                  <li key={pkg.id} className="flex justify-between items-center text-textBody">
                    <span className="pr-4 font-medium">{pkg.name}</span>
                    <div className="flex items-center gap-3">
                      {pkg.original_price_dkk && (
                        <span className="text-textMuted line-through font-[tabular-nums] text-sm">
                          {pkg.original_price_dkk} kr.
                        </span>
                      )}
                      <span className="font-medium text-cognac font-[tabular-nums] text-lg">
                        {pkg.package_price_dkk} kr.
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Afbestillingspolitik */}
          <div className="bg-cream rounded-xl p-8 border border-sand">
            <h3 className="font-heading text-2xl text-textPrimary mb-4">Afbestillingspolitik</h3>
            <p className="text-textBody text-sm leading-relaxed">
              Vi har en afbudspolitik der hedder, afmelding meldes inden 24 timer, ellers bliver man opkrævet fuld betaling. Aflysning af tid skal ske online eller via mail, dette skal ikke ske via telefonsvaren. Ved forsinkelser over 15 min forbeholder vi retten til at annullere jeres tid og opkræve fuld betaling.
            </p>
          </div>

        </div>
      </section>

      <FinalCTA />
    </main>
  );
}
