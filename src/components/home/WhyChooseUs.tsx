"use client";

import { motion } from "framer-motion";

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-beige">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-medium tracking-widest uppercase text-cognac mb-4 block">
            Hvorfor vælge os
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-textPrimary mb-8">
            Din tryghed er vores prioritet
          </h2>
          <div className="prose prose-lg mx-auto text-textBody space-y-6">
            <p>
              Hos Skønhedsklinik Aarhus går vi ikke på kompromis med kvaliteten. Vi er
              registrerede hos Styrelsen for Patientsikkerhed og anvender udelukkende
              markedets bedste og mest skånsomme udstyr og produkter. Din behandling
              tilpasses altid din huds behov for at sikre de bedste resultater.
            </p>
            <p>
              Vores team af certificerede specialister sætter en ære i at give dig en
              personlig og ærlig vejledning. Vi mener, at tryghed er fundamentet for en
              god behandling, og derfor tager vi os altid tid til en grundig forundersøgelse.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
