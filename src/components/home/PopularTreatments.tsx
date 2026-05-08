"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Database } from "@/types/supabase";

type Service = Database["public"]["Tables"]["services"]["Row"];

interface PopularTreatmentsProps {
  services: Service[];
}

export function PopularTreatments({ services }: PopularTreatmentsProps) {
  const popularServices = services
    .filter((s) => s.is_popular)
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, 4);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-xs font-medium tracking-widest uppercase text-cognac mb-2 block">
            Behandlinger
          </span>
          <h2 className="font-heading text-3xl md:text-4xl text-textPrimary">
            Populære behandlinger
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {popularServices.map((service, index) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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
                <h3 className="font-heading text-[28px] text-textPrimary leading-tight mb-2">
                  {service.name}
                </h3>
                <p className="text-textBody text-base line-clamp-3 mb-4 flex-grow">
                  {service.short_description}
                </p>
                <span className="text-cognac font-medium flex items-center group-hover:text-cognac-hover transition-colors">
                  Book konsultation <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/behandlinger">
            <Button variant="ghost" className="text-cognac border border-cognac hover:bg-cream rounded-full px-8">
              Se alle behandlinger
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
