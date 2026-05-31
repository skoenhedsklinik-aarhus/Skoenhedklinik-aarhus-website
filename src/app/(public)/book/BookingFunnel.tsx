"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Check, Phone, MapPin, ChevronLeft } from "lucide-react";

const PLANWAY_BASE = "https://skonhedsklinik-aarhus.planway.com/";

const SERVICES = [
  { name: "Laser hårfjerning", slug: "laser-haarfjerning", emoji: "✨" },
  { name: "Tattoo fjernelse", slug: "tattoo-fjernelse", emoji: "🖤" },
  { name: "Ansigtsbehandling", slug: "ansigtsbehandling", emoji: "🌿" },
  { name: "Sugaring hårfjerning", slug: "sugaring", emoji: "🍯" },
  { name: "Tandblegning", slug: "tandblegning", emoji: "💎" },
  { name: "Threading", slug: "threading", emoji: "🧵" },
  { name: "Bryn & vipper", slug: "bryn-og-vipper", emoji: "👁" },
  { name: "Wax behandling", slug: "wax-behandling", emoji: "🌸" },
  { name: "Mix Sugaring & wax", slug: "mix-sugaring-og-wax", emoji: "💫" },
];

const STEPS = ["Behandling", "Konsultation", "Book"];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export function BookingFunnel() {
  const searchParams = useSearchParams();
  // BB Glow is folded into Ansigtsbehandling — normalise any old deep-link.
  const rawPreselected = searchParams.get("service") || "";
  const preselected = rawPreselected === "bb-glow" ? "ansigtsbehandling" : rawPreselected;

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [selectedService, setSelectedService] = useState(preselected);
  const [consultationType, setConsultationType] = useState<"physical" | "phone" | "">("");

  useEffect(() => {
    if (preselected) setSelectedService(preselected);
  }, [preselected]);

  const goNext = () => { setDir(1); setStep((s) => s + 1); };
  const goPrev = () => { setDir(-1); setStep((s) => s - 1); };

  const handleBook = () => {
    const url = PLANWAY_BASE;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const canProceed = () => {
    if (step === 0) return !!selectedService;
    if (step === 1) return !!consultationType;
    return true;
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — clinic image, sticky */}
      <div className="hidden lg:block relative">
        <div className="sticky top-0 h-screen overflow-hidden">
          <Image
            src="/images/services/ansigtsbehandling.avif"
            alt="Skønhedsklinik Aarhus"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-noir/60 via-noir/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-12">
            <div className="glass rounded-2xl p-8 max-w-sm">
              <p className="font-heading text-3xl text-white font-light leading-tight mb-3">
                Din tryghed.<br />Vores prioritet.
              </p>
              <div className="w-8 h-px bg-cognac mb-5" />
              <div className="space-y-3">
                {[
                  { icon: MapPin, text: "Tordenskjoldsgade 61, 8000 Aarhus C" },
                  { icon: Phone, text: "61 44 59 99" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-cognac-light shrink-0" />
                    <span className="text-white/70 text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — multi-step form */}
      <div className="bg-white min-h-screen flex flex-col">
        <div className="flex-grow flex flex-col max-w-xl mx-auto w-full px-6 lg:px-10 py-12">
          {/* Logo/back on mobile */}
          <div className="mb-10 flex items-center justify-between">
            <p className="font-heading text-xl text-textPrimary">Skønhedsklinik Aarhus</p>
            {step > 0 && (
              <button onClick={goPrev} className="flex items-center gap-1.5 text-textMuted hover:text-textBody text-sm transition-colors">
                <ChevronLeft className="w-4 h-4" /> Tilbage
              </button>
            )}
          </div>

          {/* Progress */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    i < step ? "bg-cognac text-white" :
                    i === step ? "bg-cognac text-white ring-4 ring-cognac/20" :
                    "bg-sand text-textMuted"
                  }`}>
                    {i < step ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className={`text-xs tracking-wide ${i === step ? "text-textPrimary font-medium" : "text-textMuted"}`}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px w-8 transition-colors ${i < step ? "bg-cognac" : "bg-sand"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

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
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Step 0 — Pick treatment */}
                {step === 0 && (
                  <div>
                    <h2 className="font-heading text-3xl text-textPrimary font-light mb-2">
                      Vælg behandling
                    </h2>
                    <p className="text-textMuted text-sm mb-8">Hvilken behandling ønsker du?</p>
                    <div className="grid grid-cols-1 gap-2">
                      {SERVICES.map((svc) => (
                        <button
                          key={svc.slug}
                          onClick={() => setSelectedService(svc.slug)}
                          className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            selectedService === svc.slug
                              ? "border-cognac bg-cognac/5 text-textPrimary"
                              : "border-sand hover:border-cognac/40 text-textBody hover:bg-beige"
                          }`}
                        >
                          <span className="text-lg">{svc.emoji}</span>
                          <span className="font-medium text-sm">{svc.name}</span>
                          {selectedService === svc.slug && (
                            <Check className="w-4 h-4 text-cognac ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1 — Consultation type */}
                {step === 1 && (
                  <div>
                    <h2 className="font-heading text-3xl text-textPrimary font-light mb-2">
                      Vælg konsultationstype
                    </h2>
                    <p className="text-textMuted text-sm mb-8">Ønsker du at møde os fysisk eller tale over telefon?</p>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        {
                          id: "physical" as const,
                          title: "Fysisk besøg",
                          desc: "Besøg os i klinikken. Vi sidder ned og taler om dine ønsker og gennemgår din hud.",
                          icon: "🏡",
                          detail: "Tordenskjoldsgade 61, 8000 Aarhus C",
                        },
                        {
                          id: "phone" as const,
                          title: "Telefonopkald",
                          desc: "Vi ringer dig op på det tidspunkt, der passer dig bedst, og besvarer alle dine spørgsmål.",
                          icon: "📞",
                          detail: "Vi ringer dig op",
                        },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setConsultationType(opt.id)}
                          className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                            consultationType === opt.id
                              ? "border-cognac bg-cognac/5"
                              : "border-sand hover:border-cognac/40 hover:bg-beige"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <span className="text-2xl mt-0.5">{opt.icon}</span>
                            <div className="flex-grow">
                              <p className="font-medium text-textPrimary mb-1">{opt.title}</p>
                              <p className="text-textMuted text-sm leading-relaxed mb-2">{opt.desc}</p>
                              <p className="text-xs text-cognac font-medium">{opt.detail}</p>
                            </div>
                            {consultationType === opt.id && (
                              <div className="w-5 h-5 rounded-full bg-cognac flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2 — Summary + redirect */}
                {step === 2 && (
                  <div>
                    <h2 className="font-heading text-3xl text-textPrimary font-light mb-2">
                      Klar til booking
                    </h2>
                    <p className="text-textMuted text-sm mb-8">
                      Du viderestilles til vores bookingsystem, hvor du vælger dato og tid.
                    </p>

                    {/* Summary card */}
                    <div className="glass-cream rounded-xl p-6 mb-8">
                      <p className="eyebrow text-cognac text-[10px] mb-3">Din valg</p>
                      <div className="space-y-3">
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

                    <p className="text-center text-textMuted text-xs mt-4">
                      Du viderestilles sikkert til vores bookingsystem
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          {step < 2 && (
            <div className="mt-10 pt-6 border-t border-sand">
              <button
                onClick={goNext}
                disabled={!canProceed()}
                className={`w-full py-4 rounded-full text-sm font-medium tracking-wide transition-all ${
                  canProceed()
                    ? "bg-cognac hover:bg-cognac-hover text-white"
                    : "bg-sand text-textMuted cursor-not-allowed"
                }`}
              >
                Fortsæt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
