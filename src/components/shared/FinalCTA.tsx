"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { trackConversion } from "@/lib/pixel";

/**
 * `freeConsultation` sættes kun på behandlingssider med gratis konsultation
 * (laser hårfjerning, tatoveringsfjernelse, pico laser). Alle andre steder
 * er CTA'en en ren book-knap uden løfte om gratis konsultation.
 */
export function FinalCTA({ freeConsultation = false }: { freeConsultation?: boolean }) {
  return (
    <section className="section-dark relative py-28 lg:py-36 overflow-hidden">
      {/* Decorative gradient blob */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(107,79,53,0.6) 0%, transparent 70%)",
        }}
      />

      <div className="container relative mx-auto px-4 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow text-cognac-light mb-6 block">
            Klar til at komme i gang?
          </span>

          <h2 className="font-heading text-4xl md:text-5xl lg:text-[60px] text-cream font-light leading-[1.08] mb-5 text-balance max-w-2xl mx-auto">
            {freeConsultation ? "Book din gratis konsultation i dag" : "Book din tid i dag"}
          </h2>

          <div className="w-10 h-px bg-cognac mx-auto mb-7" />

          <p className="text-cream/55 text-base md:text-lg leading-relaxed max-w-md mx-auto mb-12">
            Vi tager os tid til at forstå dine ønsker og finde den behandling, der passer præcis til dig — helt uforpligtende.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/book">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-9 py-4 bg-cognac hover:bg-cognac-hover text-white rounded-full text-sm font-medium tracking-wide transition-colors"
              >
                {freeConsultation ? "Book gratis konsultation" : "Book en tid"}
              </motion.button>
            </Link>
            <Link href="tel:+4561445999" onClick={() => trackConversion("Contact", { content_category: "final-cta" })}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-9 py-4 glass hover:bg-white/15 text-cream rounded-full text-sm font-medium tracking-wide transition-all"
              >
                Ring til os — 61 44 59 99
              </motion.button>
            </Link>
          </div>

          <p className="text-cream/40 text-xs font-medium tracking-wide mt-8">
            ★★★★★ 5,0 på Google · Registreret hos Styrelsen for Patientsikkerhed
            {freeConsultation ? " · Gratis & uforpligtende" : " · Certificerede behandlere"}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
