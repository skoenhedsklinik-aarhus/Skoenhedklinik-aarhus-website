"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FinalCTA } from "@/components/shared/FinalCTA";
import { motion, AnimatePresence } from "framer-motion";
import { Database } from "@/types/supabase";

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
  { id: "tatovering", label: "Tatovering" },
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
      <section className="bg-cream py-20 lg:py-32 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-textPrimary mb-6">
            Behandlinger
          </h1>
          <p className="text-lg text-textBody leading-relaxed">
            Gå på opdagelse i vores store udvalg af professionelle skønhedsbehandlinger.
            Uanset om du søger permanent hårfjerning, en fornyende ansigtsbehandling eller
            noget helt tredje, så har vi ekspertisen til at hjælpe dig i mål.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 bg-white flex-grow">
        <div className="container mx-auto lg:px-8">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-cognac text-white shadow-md"
                    : "bg-beige text-textBody hover:bg-cognac/10 hover:text-cognac"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredServices.map((service) => (
                <motion.div
                  key={service.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    href={`/behandlinger/${service.slug}`}
                    className="group flex flex-col h-full bg-white rounded-xl overflow-hidden transition-all duration-400 hover:-translate-y-[2px]"
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl mb-4">
                      <Image
                        src={service.hero_image_url || "/placeholder.jpg"}
                        alt={service.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                    <h3 className="font-heading text-2xl text-textPrimary mb-2">
                      {service.name}
                    </h3>
                    <p className="text-textBody line-clamp-2 mb-4 flex-grow">
                      {service.short_description}
                    </p>
                    <span className="text-cognac font-medium flex items-center group-hover:text-cognac-hover transition-colors">
                      Læs mere <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </span>
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
