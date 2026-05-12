"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const PLANWAY_BASE = "https://skonhedsklinik-aarhus.planway.com/";

const SERVICES = [
  { name: "Permanent hårfjerning", slug: "permanent-haarfjerning", emoji: "✨" },
  { name: "Tattoo fjernelse", slug: "tattoo-fjernelse", emoji: "🖤" },
  { name: "Ansigtsbehandling", slug: "ansigtsbehandling", emoji: "🌿" },
  { name: "Sugaring hårfjerning", slug: "sugaring", emoji: "🍯" },
  { name: "Tandblegning", slug: "tandblegning", emoji: "💎" },
  { name: "Threading", slug: "threading", emoji: "🧵" },
  { name: "BB Glow behandling", slug: "bb-glow", emoji: "✨" },
  { name: "Bryn & vipper", slug: "bryn-og-vipper", emoji: "👁" },
  { name: "Wax behandling", slug: "wax-behandling", emoji: "🌸" },
  { name: "Mix Sugaring & wax", slug: "mix-sugaring-og-wax", emoji: "💫" },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export function BookingSection() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [consultationType, setConsultationType] = useState<"physical" | "phone" | "">("");

  const goNext = () => { setDir(1); setStep((s) => s + 1); };
  const goPrev = () => { setDir(-1); setStep((s) => s - 1); };

  const canProceed = () => {
    if (step === 0) return !!selectedService;
    if (step === 1) return !!consultationType;
    return true;
  };

  const handleBook = () => {
    window.open(PLANWAY_BASE, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-24 lg:py-32 bg-cream" id="book">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-28"
          >
            <span className="eyebrow text-cognac mb-5 block">Book konsultation</span>
            <h2 className="font-heading text-4xl md:text-5xl text-textPrimary font-light leading-tight mb-5 text-balance">
              Start dit behandlingsforløb
            </h2>
            <div className="w-10 h-px bg-cognac mb-7" />
            <p className="text-textBody text-base md:text-lg leading-relaxed mb-8">
              Fortæl os hvad du ønsker, og vi sørger for resten. Alle konsultationer er gratis og uforpligtende.
            </p>
            <div className="space-y-4">
              {[
                { n: "01", text: "Vælg din behandling" },
                { n: "02", text: "Vælg konsultationstype" },
                { n: "03", text: "Vælg tid i vores bookingsystem" },
              ].map((item, i) => (
                <div
                  key={item.n}
                  className={`flex items-center gap-4 transition-opacity duration-300 ${i > step ? "opacity-30" : "opacity-100"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors ${i < step ? "bg-cognac text-white" : i === step ? "bg-cognac/15 text-cognac border border-cognac/30" : "bg-sand text-textMuted"}`}>
                    {i < step ? <Check className="w-3.5 h-3.5" /> : item.n}
                  </div>
                  <span className={`text-sm font-medium ${i === step ? "text-textPrimary" : "text-textMuted"}`}>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: step form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <div className="glass-cream rounded-2xl p-8 min-h-[400px] flex flex-col">
              {/* Step content */}
              <div className="flex-grow">
                <AnimatePresence custom={dir} mode="wait">
                  <motion.div
                    key={step}
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Step 0 — pick treatment */}
                    {step === 0 && (
                      <div>
                        <h3 className="font-heading text-2xl text-textPrimary font-light mb-1">Vælg behandling</h3>
                        <p className="text-textMuted text-sm mb-6">Hvilken behandling ønsker du?</p>
                        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                          {SERVICES.map((svc) => (
                            <button
                              key={svc.slug}
                              onClick={() => setSelectedService(svc.slug)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 text-sm ${
                                selectedService === svc.slug
                                  ? "border-cognac bg-cognac/8 text-textPrimary"
                                  : "border-sand hover:border-cognac/30 text-textBody hover:bg-white/60"
                              }`}
                            >
                              <span>{svc.emoji}</span>
                              <span className="font-medium flex-grow">{svc.name}</span>
                              {selectedService === svc.slug && <Check className="w-3.5 h-3.5 text-cognac shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 1 — consultation type */}
                    {step === 1 && (
                      <div>
                        <h3 className="font-heading text-2xl text-textPrimary font-light mb-1">Konsultationstype</h3>
                        <p className="text-textMuted text-sm mb-6">Ønsker du at møde os fysisk eller tale over telefon?</p>
                        <div className="space-y-3">
                          {[
                            { id: "physical" as const, title: "Fysisk besøg", desc: "Besøg os i klinikken i Aarhus C — vi sidder ned og gennemgår dine ønsker.", icon: "🏡" },
                            { id: "phone" as const, title: "Telefonopkald", desc: "Vi ringer dig op og besvarer alle dine spørgsmål.", icon: "📞" },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setConsultationType(opt.id)}
                              className={`w-full p-5 rounded-xl border text-left transition-all duration-200 ${
                                consultationType === opt.id
                                  ? "border-cognac bg-cognac/8"
                                  : "border-sand hover:border-cognac/30 hover:bg-white/60"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-xl mt-0.5">{opt.icon}</span>
                                <div className="flex-grow">
                                  <p className="font-medium text-textPrimary text-sm mb-0.5">{opt.title}</p>
                                  <p className="text-textMuted text-xs leading-relaxed">{opt.desc}</p>
                                </div>
                                {consultationType === opt.id && (
                                  <div className="w-5 h-5 rounded-full bg-cognac flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 2 — redirect */}
                    {step === 2 && (
                      <div>
                        <h3 className="font-heading text-2xl text-textPrimary font-light mb-1">Klar til booking</h3>
                        <p className="text-textMuted text-sm mb-6">Du viderestilles til vores bookingsystem.</p>
                        <div className="glass-cognac rounded-xl p-5 mb-6">
                          <p className="eyebrow text-cognac text-[10px] mb-3">Din valg</p>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-textMuted text-sm">Behandling</span>
                              <span className="text-textPrimary text-sm font-medium">
                                {SERVICES.find((s) => s.slug === selectedService)?.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-textMuted text-sm">Konsultation</span>
                              <span className="text-textPrimary text-sm font-medium">
                                {consultationType === "physical" ? "Fysisk besøg" : "Telefonopkald"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleBook}
                          className="w-full py-4 bg-cognac hover:bg-cognac-hover text-white rounded-full font-medium tracking-wide transition-colors text-sm"
                        >
                          Gå til booking →
                        </button>
                        <p className="text-center text-textMuted text-xs mt-3">
                          Du viderestilles sikkert til vores bookingsystem
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className={`flex gap-3 mt-8 pt-6 border-t border-sand/60 ${step > 0 ? "justify-between" : "justify-end"}`}>
                {step > 0 && (
                  <button
                    onClick={goPrev}
                    className="px-6 py-3 rounded-full border border-sand text-textMuted hover:text-textBody hover:border-cognac/30 text-sm font-medium transition-all"
                  >
                    ← Tilbage
                  </button>
                )}
                {step < 2 && (
                  <button
                    onClick={goNext}
                    disabled={!canProceed()}
                    className={`px-7 py-3 rounded-full text-sm font-medium tracking-wide transition-all ${
                      canProceed()
                        ? "bg-cognac hover:bg-cognac-hover text-white"
                        : "bg-sand text-textMuted cursor-not-allowed"
                    }`}
                  >
                    Fortsæt
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
