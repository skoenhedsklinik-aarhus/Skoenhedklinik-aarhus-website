"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export function ParallaxFloating() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const leftY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const rightY = useTransform(scrollYProgress, [0, 1], [-40, 80]);
  const centerY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <section
      ref={ref}
      className="relative py-32 lg:py-40 bg-cream overflow-hidden"
    >
      {/* Background texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-beige/40 via-cream to-cream/60 pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 items-center">

          {/* Left image — drifts upward on scroll */}
          <motion.div
            style={{ y: leftY }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-sm shadow-2xl">
              <Image
                src="/images/services/sugaring-2.avif"
                alt="Sugaring behandling hos Skønhedsklinik Aarhus"
                fill
                className="object-cover"
              />
              {/* Subtle glass label */}
              <div className="absolute bottom-4 left-4 glass-cream rounded-lg px-4 py-2.5">
                <span className="eyebrow text-textPrimary text-[10px]">Sugaring</span>
              </div>
            </div>
          </motion.div>

          {/* Center text — gently floats */}
          <motion.div
            style={{ y: centerY }}
            className="text-center px-4 lg:px-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="eyebrow text-cognac mb-5 block">
                Vores filosofi
              </span>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-[54px] text-textPrimary font-light leading-[1.1] mb-6 text-balance">
                Tidløs pleje,<br />synlige resultater
              </h2>
              <div className="w-10 h-px bg-cognac mx-auto mb-7" />
              <p className="text-textBody text-base md:text-lg leading-relaxed max-w-sm mx-auto mb-10">
                Hos Skønhedsklinik Aarhus tilpasses hver behandling din hud og dine ønsker. Vi anvender markedets bedste udstyr og sætter din tryghed øverst.
              </p>
              <Link
                href="/om-os"
                className="inline-flex items-center gap-2 text-cognac hover:text-cognac-hover font-medium text-sm tracking-wide transition-colors group"
              >
                Lær os at kende
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right image — drifts downward on scroll */}
          <motion.div
            style={{ y: rightY }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[3/4] w-full max-w-[320px] ml-auto overflow-hidden rounded-sm shadow-2xl">
              <Image
                src="/images/retinol.avif"
                alt="Retinol behandling hos Skønhedsklinik Aarhus"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 glass-cream rounded-lg px-4 py-2.5">
                <span className="eyebrow text-textPrimary text-[10px]">Ansigtsbehandling</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Mobile: single image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:hidden mt-12 relative aspect-[4/3] w-full max-w-sm mx-auto overflow-hidden rounded-sm shadow-xl"
        >
          <Image
            src="/images/hydra-boost.avif"
            alt="Behandling hos Skønhedsklinik Aarhus"
            fill
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
