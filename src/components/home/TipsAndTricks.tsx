"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Database } from "@/types/supabase";

type Tip = Database["public"]["Tables"]["tips"]["Row"];

interface TipsAndTricksProps {
  tips: Tip[];
}

export function TipsAndTricks({ tips }: TipsAndTricksProps) {
  if (!tips || tips.length < 1) return null;

  return (
    <section className="py-24 bg-cream">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-xs font-medium tracking-widest uppercase text-cognac mb-2 block">
            Tips & Tricks
          </span>
          <h2 className="font-heading text-3xl md:text-4xl text-textPrimary">
            Få mest ud af din behandling
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tips.slice(0, 3).map((tip, index) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={tip.hero_image_url || "/placeholder.jpg"}
                  alt={tip.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-heading text-2xl text-textPrimary mb-3">
                  {tip.title}
                </h3>
                <div
                  className="text-textBody mb-4 flex-grow line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: tip.body }}
                />
                <Link
                  href="#"
                  className="text-cognac font-medium flex items-center group-hover:text-cognac-hover transition-colors"
                >
                  Læs mere <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
