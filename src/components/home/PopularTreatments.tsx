"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Database } from "@/types/supabase";

type Service = Database["public"]["Tables"]["services"]["Row"];

interface PopularTreatmentsProps {
  services: Service[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

export function PopularTreatments({ services }: PopularTreatmentsProps) {
  const popularServices = services
    .filter((s) => s.is_popular)
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, 4);

  return (
    <section className="section-dark py-24 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6"
        >
          <div>
            <span className="eyebrow text-cognac-light mb-4 block">
              Behandlinger
            </span>
            <h2 className="font-heading text-4xl md:text-5xl text-cream font-light leading-tight">
              Populære behandlinger
            </h2>
          </div>
          <Link
            href="/behandlinger"
            className="text-cream/50 hover:text-cream text-sm font-medium tracking-wide transition-colors flex items-center gap-2 group shrink-0"
          >
            Se alle behandlinger
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {popularServices.map((service, index) => (
            <motion.div
              key={service.slug}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <Link
                href={`/behandlinger/${service.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-sm cursor-pointer"
              >
                {/* Image container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={service.hero_image_url || "/placeholder.jpg"}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                  />

                  {/* Permanent dark gradient at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Hover overlay — glassmorphism strip */}
                  <div className="absolute inset-x-0 bottom-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <h3 className="font-heading text-2xl text-white font-light leading-tight mb-2">
                      {service.name}
                    </h3>
                    <p className="text-white/65 text-sm leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-400 mb-3">
                      {service.short_description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-cognac-light text-xs font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                      Læs mere
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
