"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const googleReviews = [
  {
    author_name: 'Sofie Nielsen',
    rating: 5,
    text: 'Virkelig professionel og tryg oplevelse. Aliaa er super dygtig og tager sig god tid til at forklare alt. Kan varmt anbefale laserbehandling her!',
    time: 1690890200,
  },
  {
    author_name: 'Camilla Jensen',
    rating: 5,
    text: 'Fantastisk klinik med en utrolig afslappet og luksuriøs stemning. Fik lavet sugaring, og det var næsten smertefrit. Kommer helt sikkert igen.',
    time: 1690000000,
  },
  {
    author_name: 'Maria Pedersen',
    rating: 5,
    text: 'Jeg har fået fjernet en tatovering, og resultatet er over al forventning. God vejledning og ærlig rådgivning fra start til slut.',
    time: 1689000000,
  }
];

export function GoogleReviews() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-xs font-medium tracking-widest uppercase text-cognac mb-2 block">
            Anmeldelser
          </span>
          <h2 className="font-heading text-3xl md:text-4xl text-textPrimary">
            Vores kunders oplevelser
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {googleReviews.slice(0, 3).map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-beige rounded-xl p-8 flex flex-col"
            >
              <div className="flex gap-1 mb-6 text-cognac">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <blockquote className="font-heading italic text-xl text-textPrimary mb-6 flex-grow leading-relaxed">
                &quot;{review.text}&quot;
              </blockquote>
              <div className="font-medium text-textBody">
                – {review.author_name}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="#"
            className="text-cognac font-medium flex items-center justify-center group hover:text-cognac-hover transition-colors"
          >
            Se alle anmeldelser på Google{" "}
            <span className="ml-2 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
