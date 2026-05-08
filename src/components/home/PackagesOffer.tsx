"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Database } from "@/types/supabase";

type PackageOffer = Database["public"]["Tables"]["packages_offers"]["Row"];

interface PackagesOfferProps {
  packagesOffers: PackageOffer[];
}

export function PackagesOffer({ packagesOffers }: PackagesOfferProps) {
  if (!packagesOffers || packagesOffers.length === 0) return null;

  return (
    <section className="py-24 bg-cream">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-12 text-center">
            <span className="text-xs font-medium tracking-widest uppercase text-cognac mb-2 block">
              Aktuelle Tilbud
            </span>
            <h2 className="font-heading text-3xl md:text-4xl text-textPrimary">
              Særlige pakker
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {packagesOffers.slice(0, 2).map((pkg) => (
              <div
                key={pkg.id}
                className="group relative flex flex-col bg-beige rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={pkg.hero_image_url || "/placeholder.jpg"}
                    alt={pkg.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="font-heading text-2xl text-textPrimary mb-4">
                    {pkg.name}
                  </h3>
                  <div
                    className="prose prose-sm text-textBody mb-6 flex-grow"
                    dangerouslySetInnerHTML={{ __html: pkg.description || "" }}
                  />
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-3xl font-medium text-textPrimary">
                      {pkg.package_price_dkk} kr.
                    </span>
                    {pkg.original_price_dkk && (
                      <span className="text-lg text-textMuted line-through mb-1">
                        {pkg.original_price_dkk} kr.
                      </span>
                    )}
                  </div>
                  <Link href={pkg.planway_link || "/book"}>
                    <Button className="w-full bg-cognac hover:bg-cognac-hover text-white rounded-full">
                      {pkg.cta_text || "Book pakken"}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
