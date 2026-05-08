"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative w-full h-[70vh] lg:h-[60vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80"
          alt="Behandlerrum hos Skønhedsklinik Aarhus"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center text-white flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs md:text-sm font-medium tracking-widest uppercase mb-4 block">
            Skønhedsklinik i Aarhus
          </span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light mb-6 max-w-4xl mx-auto leading-tight">
            Hvor naturlig skønhed møder professionel pleje
          </h1>
          <p className="text-lg md:text-xl font-light max-w-2xl mx-auto mb-10 opacity-90">
            Certificeret behandling med fokus på sikkerhed, synlige resultater og personlig rådgivning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/book">
              <Button className="w-full sm:w-auto bg-cognac hover:bg-cognac-hover text-white rounded-full px-8 py-6 text-base border border-cognac">
                Book gratis konsultation
              </Button>
            </Link>
            <Link href="/behandlinger">
              <Button variant="outline" className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white border-white rounded-full px-8 py-6 text-base">
                Se behandlinger
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
