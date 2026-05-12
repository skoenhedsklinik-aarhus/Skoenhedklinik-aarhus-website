"use client";

import Link from "next/link";
import ScrollExpandMedia from "@/components/blocks/scroll-expansion-hero";

function HeroContent() {
  return (
    <div className="w-full flex items-center justify-center px-4">
      {/* Frosted glass card over the blurred video */}
      <div
        className="max-w-2xl w-full mx-auto text-center rounded-3xl px-8 py-14 md:px-14"
        style={{
          background: 'rgba(10, 8, 6, 0.45)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 60px rgba(0,0,0,0.4)',
        }}
      >
        <span className="eyebrow text-cognac-light mb-5 block tracking-widest">Skønhedsklinik Aarhus</span>
        <h2 className="font-heading text-4xl md:text-5xl text-white font-light leading-tight mb-5 text-balance">
          Certificeret skønhed — tilpasset dig
        </h2>
        <div className="w-10 h-px bg-cognac mx-auto mb-7" />
        <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Professionelle behandlinger i hjertet af Aarhus C. Vi sætter din tryghed øverst og leverer synlige resultater med markedets bedste udstyr.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/behandlinger">
            <button className="px-8 py-4 bg-cognac hover:bg-cognac-hover text-white rounded-full text-sm font-medium tracking-wide transition-colors">
              Se behandlinger
            </button>
          </Link>
          <Link href="/om-os">
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full text-sm font-medium tracking-wide transition-colors backdrop-blur-sm">
              Lær os at kende
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <ScrollExpandMedia
      mediaType="video"
      mediaSrc="/videos/hero.mp4"
      bgImageSrc="/images/filler.avif"
      title="Tidløs Skønhed"
      date="Skønhedsklinik Aarhus"
      scrollToExpand="↓ Scroll for at opleve"
      textBlend={false}
    >
      <HeroContent />
    </ScrollExpandMedia>
  );
}
