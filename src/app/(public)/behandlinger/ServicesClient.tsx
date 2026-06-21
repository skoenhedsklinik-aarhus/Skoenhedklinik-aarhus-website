"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FinalCTA } from "@/components/shared/FinalCTA";
import { motion, AnimatePresence } from "framer-motion";
import { Database } from "@/types/supabase";
import { getServiceThumbnail } from "@/lib/services-fallback";

type Service = Database["public"]["Tables"]["services"]["Row"];

const CATEGORIES = [
  { id: "alle", label: "Alle" },
  { id: "haarfjerning", label: "Hårfjerning" },
  { id: "ansigt", label: "Ansigt" },
  { id: "bryn-vipper", label: "Bryn & vipper" },
  { id: "sugaring", label: "Sugaring" },
  { id: "wax", label: "Wax" },
  { id: "tand", label: "Tandblegning" },
  { id: "threading", label: "Threading" },
  { id: "tatovering", label: "Tattoo fjernelse" },
];

interface ServicesClientProps {
  services: Service[];
}

export function ServicesClient({ services }: ServicesClientProps) {
  const [activeCategory, setActiveCategory] = useState("alle");

  const filteredServices = services
    .filter((s) => activeCategory === "alle" || s.category === activeCategory)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="section-dark relative py-32 lg:py-44 overflow-hidden">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 20% 80%, rgba(107,79,53,0.7) 0%, transparent 60%)",
          }}
        />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="eyebrow text-cognac-light mb-5 block">Skønhedsklinik Aarhus</span>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-cream font-light leading-[1.06] mb-6 max-w-2xl text-balance">
              Vores behandlinger
            </h1>
            <p className="text-cream/60 text-lg leading-relaxed max-w-xl">
              Professionelle skønhedsbehandlinger tilpasset din hud, dine ønsker og dit liv.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category filter + grid */}
      <section className="py-16 px-4 bg-white flex-grow">
        <div className="container mx-auto lg:px-8">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-14">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-xs font-medium tracking-[0.12em] uppercase transition-all duration-250 ${
                  activeCategory === cat.id
                    ? "bg-cognac text-white shadow-sm"
                    : "bg-beige text-textMuted hover:bg-sand hover:text-textBody"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Services grid */}
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                >
                  <Link
                    href={`/behandlinger/${service.slug}`}
                    className="group relative flex flex-col overflow-hidden rounded-sm cursor-pointer block"
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      <Image
                        src={getServiceThumbnail(service.slug, service.hero_image_url)}
                        alt={service.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                      {/* Content overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <h3 className="font-heading text-2xl text-white font-light leading-tight mb-1.5">
                          {service.name}
                        </h3>
                        <p className="text-white/60 text-xs leading-relaxed line-clamp-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-h-0 group-hover:max-h-10 overflow-hidden">
                          {service.short_description}
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-cognac-light text-xs font-medium tracking-wide">
                          Book konsultation
                          <span className="translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredServices.length === 0 && (
            <div className="text-center py-20 text-textMuted">
              Ingen behandlinger fundet i denne kategori.
            </div>
          )}
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}
