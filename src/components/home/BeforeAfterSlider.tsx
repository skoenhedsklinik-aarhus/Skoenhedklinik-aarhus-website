"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function BeforeAfterSlider() {
  const [position, setPosition] = useState(48);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.min(Math.max((x / rect.width) * 100, 5), 95);
    setPosition(pct);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  return (
    <section className="py-24 lg:py-32 bg-beige overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Slider */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Slider container */}
            <div
              ref={containerRef}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-sm cursor-ew-resize select-none shadow-2xl"
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
            >
              {/* After (full image beneath) */}
              <div className="absolute inset-0">
                <Image
                  src="/images/laser-after.avif"
                  alt="Efter laser hårfjerning"
                  fill
                  className="object-cover"
                  draggable={false}
                />
              </div>

              {/* Before (clipped to left of divider) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${position}%` }}
              >
                <div className="absolute inset-0" style={{ width: `${10000 / position}%` }}>
                  <Image
                    src="/images/laser-before.avif"
                    alt="Før laser hårfjerning"
                    fill
                    className="object-cover"
                    draggable={false}
                  />
                </div>
              </div>

              {/* Divider line */}
              <div
                className="absolute top-0 bottom-0 w-px bg-white/90 z-20"
                style={{ left: `${position}%` }}
              />

              {/* Handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30"
                style={{ left: `${position}%` }}
              >
                <div className="w-10 h-10 rounded-full glass border border-white/40 flex items-center justify-center shadow-xl">
                  <div className="flex items-center gap-0.5">
                    <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                      <path d="M5 1L1 6L5 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className="rotate-180">
                      <path d="M5 1L1 6L5 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-4 left-4 glass-dark rounded-full px-3 py-1.5 z-20">
                <span className="text-white text-xs font-medium tracking-wide">Før</span>
              </div>
              <div className="absolute top-4 right-4 glass-dark rounded-full px-3 py-1.5 z-20">
                <span className="text-white text-xs font-medium tracking-wide">Efter</span>
              </div>
            </div>
          </motion.div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <span className="eyebrow text-cognac mb-5 block">
              Ægte resultater
            </span>
            <h2 className="font-heading text-4xl md:text-5xl text-textPrimary font-light leading-tight mb-5 text-balance">
              Se den ægte forskel
            </h2>
            <div className="w-10 h-px bg-cognac mb-7" />
            <p className="text-textBody text-base md:text-lg leading-relaxed mb-4">
              Laser hårfjerning med laser giver langvarige resultater, som ses allerede fra første behandling. Vores certificerede behandlere tilpasser hvert forløb til din hud og behov.
            </p>
            <p className="text-textBody text-base leading-relaxed mb-10">
              Billederne er fra en af vores klienters behandlingsforløb — optaget i vores klinik i Aarhus C.
            </p>

            {/* Trust points */}
            <div className="space-y-3 mb-10">
              {[
                "Certificeret laserbehandler",
                "Tilpasset din hudtype og hårfarve",
                "Lovpligtig konsultation inkluderet",
              ].map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-cognac/12 flex items-center justify-center shrink-0">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#6B4F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-textBody text-sm">{point}</span>
                </div>
              ))}
            </div>

            <Link
              href="/behandlinger/laser-haarfjerning"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-cognac hover:bg-cognac-hover text-white rounded-full text-sm font-medium tracking-wide transition-colors group"
            >
              Læs om behandlingen
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
