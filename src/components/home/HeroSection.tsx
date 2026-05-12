"use client";

import Link from "next/link";
import ScrollExpandMedia from "@/components/blocks/scroll-expansion-hero";

function HeroContent() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <span className="eyebrow text-cognac mb-5 block">Skønhedsklinik Aarhus</span>
          <h2 className="font-heading text-4xl md:text-5xl text-textPrimary font-light leading-tight mb-5 text-balance">
            Certificeret skønhed — tilpasset dig
          </h2>
          <div className="w-10 h-px bg-cognac mx-auto mb-7" />
          <p className="text-textBody text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Professionelle behandlinger i hjertet af Aarhus C. Vi sætter din tryghed øverst og leverer synlige resultater med markedets bedste udstyr.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/behandlinger">
              <button className="px-8 py-4 bg-cognac hover:bg-cognac-hover text-white rounded-full text-sm font-medium tracking-wide transition-colors">
                Se behandlinger
              </button>
            </Link>
            <Link href="/om-os">
              <button className="px-8 py-4 bg-beige hover:bg-sand text-textPrimary rounded-full text-sm font-medium tracking-wide transition-colors">
                Lær os at kende
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
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
