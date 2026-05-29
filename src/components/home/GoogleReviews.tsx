"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const MOCK_REVIEWS = [
  {
    name: "Sofie M.",
    rating: 5,
    text: "Utrolig professionel behandling. Aliaa er super dygtig og gav mig en grundig vejledning inden behandlingen. Kan varmt anbefales!",
    service: "Laser hårfjerning",
    timeAgo: "2 uger siden",
  },
  {
    name: "Mette K.",
    rating: 5,
    text: "Fantastisk klinik med en helt unik atmosfære. Følte mig tryg fra første sekund. Resultatet er bedre end jeg turde håbe på.",
    service: "Ansigtsbehandling",
    timeAgo: "1 måned siden",
  },
  {
    name: "Amira B.",
    rating: 5,
    text: "Har prøvet sugaring og bryn-behandling her — begge dele var perfekte. Personalet er super venligt og professionelt.",
    service: "Sugaring & Bryn",
    timeAgo: "3 uger siden",
  },
  {
    name: "Lotte P.",
    rating: 5,
    text: "Endelig fundet en klinik jeg kan stole på. Grundig konsultation, synlige resultater og fair priser. Kommer igen og igen!",
    service: "BB Glow",
    timeAgo: "1 uge siden",
  },
];

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-cognac text-cognac" />
      ))}
    </div>
  );
}

export function GoogleReviews() {
  return (
    <section className="py-24 lg:py-32 bg-beige overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <span className="eyebrow text-cognac mb-4 block">Anmeldelser</span>
            <h2 className="font-heading text-4xl md:text-5xl text-textPrimary font-light">
              Hvad vores klienter siger
            </h2>
          </div>
          {/* Google rating badge */}
          <div className="glass-cream rounded-xl px-5 py-3.5 flex items-center gap-3 shrink-0">
            <div>
              <p className="text-2xl font-heading font-light text-textPrimary leading-none">5.0</p>
              <div className="mt-1"><StarRow count={5} /></div>
            </div>
            <div className="w-px h-10 bg-sand" />
            <div>
              <p className="text-xs text-textMuted uppercase tracking-wide font-medium">Google</p>
              <p className="text-xs text-textMuted">Anmeldelser</p>
            </div>
          </div>
        </motion.div>

        {/* Review cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
              className="glass-cream rounded-xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-300"
            >
              <StarRow count={review.rating} />
              <p className="text-textBody text-sm leading-relaxed flex-grow">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="border-t border-sand/60 pt-4">
                <p className="font-medium text-textPrimary text-sm">{review.name}</p>
                <p className="text-textMuted text-xs mt-0.5">{review.service} · {review.timeAgo}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
