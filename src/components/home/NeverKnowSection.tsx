"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export function NeverKnowSection() {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // True parallax — gentle drift so images stay grouped with the text
  const leftImageY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const rightImageY = useTransform(scrollYProgress, [0, 1], ["8%", "-4%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);
  const bgGlow = useTransform(scrollYProgress, [0, 0.5, 1], [0.05, 0.25, 0.1]);

  return (
    <section
      ref={ref}
      className="section-dark relative py-20 lg:py-28 overflow-hidden"
    >
      {/* Animated cognac glow blob */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(107,79,53,0.7) 0%, transparent 70%)",
          opacity: bgGlow,
          filter: "blur(60px)",
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">

          {/* Left image — moves up faster */}
          <motion.div
            style={{ y: leftImageY }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 mb-12 lg:mb-0"
          >
            <div className="relative aspect-[4/5] w-full max-w-[360px] overflow-hidden rounded-sm shadow-2xl">
              <Image
                src="/images/ansigtsbehandling.avif"
                alt="Naturlig glød efter ansigtsbehandling"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/50 via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* Center text */}
          <motion.div
            style={{ y: textY }}
            className="lg:col-span-4 lg:col-start-6 lg:px-6 flex flex-col justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            >
              <span className="eyebrow text-cognac-light mb-6 block">
                Resultater du mærker
              </span>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-[56px] text-cream font-light leading-[1.06] mb-5 text-balance">
                Du stråler.
                <br />
                <em className="not-italic text-cognac-accent">
                  Det er vores hemmelighed.
                </em>
              </h2>
              <div className="w-10 h-px bg-cognac mb-7" />
              <p className="text-cream/55 text-base leading-relaxed mb-8 max-w-sm">
                Naturlige, skånsomme behandlinger der giver synlig forskel — kun du ved hemmeligheden bag dit strålende look.
              </p>
              <Link
                href="/behandlinger"
                className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-cream/70 hover:text-cream transition-colors group"
              >
                Se vores behandlinger
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right image — moves down slower, staggered */}
          <motion.div
            style={{ y: rightImageY }}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
            className="hidden lg:block lg:col-span-3 lg:col-start-10"
          >
            <div className="relative aspect-[3/4] w-full max-w-[230px] ml-auto overflow-hidden rounded-sm shadow-2xl">
              <Image
                src="/images/bryn-og-vipper.avif"
                alt="Naturligt look efter bryn og vipper behandling"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/60 to-transparent" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
