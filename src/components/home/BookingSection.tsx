"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Phone, Calendar, ArrowRight, Loader2 } from "lucide-react";
import {
  submitConsultationLead,
  type ConsultationLeadResult,
} from "@/lib/actions/consultation";

/* ------------------------------------------------------------------ */
/* Data: focus areas, follow-up questions, and treatment metadata      */
/* ------------------------------------------------------------------ */

type Option = { label: string; value: string };

type Area = {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  question?: { prompt: string; options: Option[] };
  resolve: (answer?: string) => string; // returns a treatment slug
};

const AREAS: Area[] = [
  {
    id: "haar",
    label: "Uønsket hår",
    emoji: "🪶",
    desc: "Effektiv eller skånsom hårfjerning",
    question: {
      prompt: "Hvad er vigtigst for dig?",
      options: [
        { label: "Et varigt resultat", value: "varig" },
        { label: "Skånsomt og naturligt", value: "skaansom" },
        { label: "Små områder i ansigtet", value: "ansigt" },
        { label: "Hurtigt på større områder", value: "krop" },
      ],
    },
    resolve: (a) =>
      ({
        varig: "laser-haarfjerning",
        skaansom: "sugaring",
        ansigt: "threading",
        krop: "wax-behandling",
      }[a ?? ""] ?? "laser-haarfjerning"),
  },
  {
    id: "hud",
    label: "Hud & teint",
    emoji: "🌿",
    desc: "Glød, urenheder & fine linjer",
    question: {
      prompt: "Hvad ønsker du mest at forbedre?",
      options: [
        { label: "Glød & fugt", value: "gloed" },
        { label: "Urenheder & akne", value: "akne" },
        { label: "Fine linjer & fasthed", value: "aldring" },
        { label: "Ujævn teint, ar & struktur", value: "teint" },
      ],
    },
    resolve: (a) => (a === "teint" ? "bb-glow" : "ansigtsbehandling"),
  },
  {
    id: "tatovering",
    label: "Tatovering jeg fortryder",
    emoji: "🖤",
    desc: "Sikker fjernelse af tatovering",
    resolve: () => "tattoo-fjernelse",
  },
  {
    id: "smil",
    label: "Tænder & smil",
    emoji: "💎",
    desc: "Et lysere smil",
    resolve: () => "tandblegning",
  },
  {
    id: "bryn",
    label: "Bryn & vipper",
    emoji: "👁",
    desc: "Løft, farve og form",
    resolve: () => "bryn-og-vipper",
  },
];

const TREATMENTS: Record<string, { name: string; emoji: string; blurb: string }> = {
  "laser-haarfjerning": {
    name: "Laser hårfjerning",
    emoji: "✨",
    blurb: "Varig reduktion af uønsket hår med skånsom laserteknologi.",
  },
  sugaring: {
    name: "Sugaring",
    emoji: "🍯",
    blurb: "100% naturlig hårfjerning, der er blid mod huden.",
  },
  threading: {
    name: "Threading",
    emoji: "🧵",
    blurb: "Præcis hårfjerning i ansigtet med tråd.",
  },
  "wax-behandling": {
    name: "Wax behandling",
    emoji: "🌸",
    blurb: "Hurtig og effektiv hårfjerning på større områder.",
  },
  ansigtsbehandling: {
    name: "Ansigtsbehandling",
    emoji: "🌿",
    blurb: "Skræddersyet behandling for glød, fugt og renere hud.",
  },
  "bb-glow": {
    name: "BB Glow",
    emoji: "✨",
    blurb: "Jævner teint og forbedrer hudens struktur og udstråling.",
  },
  "tattoo-fjernelse": {
    name: "Tattoo-fjernelse",
    emoji: "🖤",
    blurb: "Sikker laserfjernelse af uønsket tatovering.",
  },
  tandblegning: {
    name: "Tandblegning",
    emoji: "💎",
    blurb: "Et synligt lysere smil med professionel blegning.",
  },
  "bryn-og-vipper": {
    name: "Bryn & vipper",
    emoji: "👁",
    blurb: "Løft, farve og form, der fremhæver dine øjne.",
  },
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

type Phase = "areas" | "questions" | "result" | "phone" | "done";

export function BookingSection() {
  const [phase, setPhase] = useState<Phase>("areas");
  const [dir, setDir] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [qIndex, setQIndex] = useState(0);

  // Phone form
  const [name, setName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Areas that have a follow-up question, in display order
  const questionAreas = useMemo(
    () => AREAS.filter((a) => selected.includes(a.id) && a.question),
    [selected],
  );

  // Recommendations (deduped), keeping selection order
  const recommendations = useMemo(() => {
    const slugs = AREAS.filter((a) => selected.includes(a.id)).map((a) =>
      a.resolve(answers[a.id]),
    );
    return Array.from(new Set(slugs));
  }, [selected, answers]);

  const primarySlug = recommendations[0];

  // Progress step shown in the left column (0,1,2)
  const stepIndex =
    phase === "areas" ? 0 : phase === "questions" ? 1 : 2;

  const toggleArea = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const startQuestions = () => {
    setDir(1);
    if (questionAreas.length > 0) {
      setQIndex(0);
      setPhase("questions");
    } else {
      setPhase("result");
    }
  };

  const answerCurrent = (value: string) => {
    const area = questionAreas[qIndex];
    setAnswers((prev) => ({ ...prev, [area.id]: value }));
  };

  const nextQuestion = () => {
    setDir(1);
    if (qIndex < questionAreas.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      setPhase("result");
    }
  };

  const prevStep = () => {
    setDir(-1);
    setSubmitError(null);
    if (phase === "phone") return setPhase("result");
    if (phase === "result") {
      if (questionAreas.length > 0) {
        setQIndex(questionAreas.length - 1);
        return setPhase("questions");
      }
      return setPhase("areas");
    }
    if (phase === "questions") {
      if (qIndex > 0) return setQIndex((i) => i - 1);
      return setPhase("areas");
    }
  };

  const reset = () => {
    setDir(-1);
    setSelected([]);
    setAnswers({});
    setQIndex(0);
    setName("");
    setPhoneNo("");
    setNote("");
    setSubmitError(null);
    setPhase("areas");
  };

  const handleSubmitPhone = async () => {
    setSubmitting(true);
    setSubmitError(null);
    let res: ConsultationLeadResult;
    try {
      res = await submitConsultationLead({
        name,
        phone: phoneNo,
        note,
        areas: AREAS.filter((a) => selected.includes(a.id)).map((a) => a.label),
        recommendations: recommendations.map((s) => TREATMENTS[s]?.name ?? s),
      });
    } catch {
      res = { ok: false, error: "Noget gik galt. Prøv igen." };
    }
    setSubmitting(false);
    if (res.ok) {
      setDir(1);
      setPhase("done");
    } else {
      setSubmitError(res.error);
    }
  };

  const currentArea = questionAreas[qIndex];
  const animKey =
    phase === "questions" ? `q-${qIndex}` : phase;

  return (
    <section className="py-24 lg:py-32 bg-cream" id="book">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: text + progress */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-28"
          >
            <span className="eyebrow text-cognac mb-5 block">Find din behandling</span>
            <h2 className="font-heading text-4xl md:text-5xl text-textPrimary font-light leading-tight mb-5 text-balance">
              Start dit behandlingsforløb
            </h2>
            <div className="w-10 h-px bg-cognac mb-7" />
            <p className="text-textBody text-base md:text-lg leading-relaxed mb-8">
              Ved du ikke helt, hvor du skal starte? Svar på et par spørgsmål, så
              guider vi dig til den behandling, der passer bedst til dine ønsker.
              Alle konsultationer er gratis og uforpligtende.
            </p>
            <div className="space-y-4">
              {[
                { n: "01", text: "Vælg dit fokusområde" },
                { n: "02", text: "Svar på et par spørgsmål" },
                { n: "03", text: "Få din anbefaling & book" },
              ].map((item, i) => (
                <div
                  key={item.n}
                  className={`flex items-center gap-4 transition-opacity duration-300 ${i > stepIndex ? "opacity-30" : "opacity-100"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors ${i < stepIndex ? "bg-cognac text-white" : i === stepIndex ? "bg-cognac/15 text-cognac border border-cognac/30" : "bg-sand text-textMuted"}`}
                  >
                    {i < stepIndex ? <Check className="w-3.5 h-3.5" /> : item.n}
                  </div>
                  <span
                    className={`text-sm font-medium ${i === stepIndex ? "text-textPrimary" : "text-textMuted"}`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: interactive card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <div className="glass-cream rounded-2xl p-8 min-h-[460px] flex flex-col">
              <div className="flex-grow">
                <AnimatePresence custom={dir} mode="wait">
                  <motion.div
                    key={animKey}
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* ---- Phase: choose areas ---- */}
                    {phase === "areas" && (
                      <div>
                        <h3 className="font-heading text-2xl text-textPrimary font-light mb-1">
                          Hvad vil du gerne forbedre?
                        </h3>
                        <p className="text-textMuted text-sm mb-6">
                          Vælg et eller flere områder.
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {AREAS.map((area) => {
                            const active = selected.includes(area.id);
                            return (
                              <button
                                key={area.id}
                                onClick={() => toggleArea(area.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${active ? "border-cognac bg-cognac/8" : "border-sand hover:border-cognac/30 hover:bg-white/60"}`}
                              >
                                <span className="text-lg">{area.emoji}</span>
                                <span className="flex-grow">
                                  <span className="block font-medium text-sm text-textPrimary">
                                    {area.label}
                                  </span>
                                  <span className="block text-xs text-textMuted">
                                    {area.desc}
                                  </span>
                                </span>
                                <span
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${active ? "bg-cognac border-cognac" : "border-sand"}`}
                                >
                                  {active && <Check className="w-3 h-3 text-white" />}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ---- Phase: follow-up questions ---- */}
                    {phase === "questions" && currentArea?.question && (
                      <div>
                        <p className="eyebrow text-cognac text-[10px] mb-2">
                          {currentArea.emoji} {currentArea.label}
                        </p>
                        <h3 className="font-heading text-2xl text-textPrimary font-light mb-1">
                          {currentArea.question.prompt}
                        </h3>
                        <p className="text-textMuted text-sm mb-6">
                          Spørgsmål {qIndex + 1} af {questionAreas.length}
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {currentArea.question.options.map((opt) => {
                            const active = answers[currentArea.id] === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => answerCurrent(opt.value)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-200 text-sm ${active ? "border-cognac bg-cognac/8 text-textPrimary" : "border-sand hover:border-cognac/30 text-textBody hover:bg-white/60"}`}
                              >
                                <span className="font-medium flex-grow">
                                  {opt.label}
                                </span>
                                {active && (
                                  <Check className="w-4 h-4 text-cognac shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ---- Phase: recommendation ---- */}
                    {phase === "result" && (
                      <div>
                        <h3 className="font-heading text-2xl text-textPrimary font-light mb-1">
                          {recommendations.length > 1
                            ? "Vi anbefaler"
                            : "Vores anbefaling til dig"}
                        </h3>
                        <p className="text-textMuted text-sm mb-6">
                          Baseret på dine svar passer disse behandlinger bedst.
                        </p>
                        <div className="space-y-3 mb-7">
                          {recommendations.map((slug) => {
                            const t = TREATMENTS[slug];
                            if (!t) return null;
                            return (
                              <Link
                                key={slug}
                                href={`/behandlinger/${slug}`}
                                className="group flex items-start gap-3 p-4 rounded-xl bg-white/70 border border-sand hover:border-cognac/40 transition-colors"
                              >
                                <span className="text-xl mt-0.5">{t.emoji}</span>
                                <span className="flex-grow">
                                  <span className="block font-medium text-textPrimary text-sm mb-0.5">
                                    {t.name}
                                  </span>
                                  <span className="block text-xs text-textMuted leading-relaxed">
                                    {t.blurb}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-xs text-cognac font-medium mt-1.5 group-hover:gap-2 transition-all">
                                    Læs mere <ArrowRight className="w-3 h-3" />
                                  </span>
                                </span>
                              </Link>
                            );
                          })}
                        </div>

                        <p className="text-sm font-medium text-textPrimary mb-3">
                          Book en gratis konsultation
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Link
                            href={
                              primarySlug
                                ? `/book?service=${primarySlug}`
                                : "/book"
                            }
                            className="flex items-center justify-center gap-2 py-3.5 px-4 bg-cognac hover:bg-cognac-hover text-white rounded-full font-medium text-sm transition-colors"
                          >
                            <Calendar className="w-4 h-4" />
                            Fysisk konsultation
                          </Link>
                          <button
                            onClick={() => {
                              setDir(1);
                              setPhase("phone");
                            }}
                            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-full border border-cognac/40 text-cognac hover:bg-cognac/5 font-medium text-sm transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            Ring mig op
                          </button>
                        </div>
                        <button
                          onClick={reset}
                          className="mt-5 text-xs text-textMuted hover:text-textBody transition-colors"
                        >
                          Start forfra
                        </button>
                      </div>
                    )}

                    {/* ---- Phase: phone capture ---- */}
                    {phase === "phone" && (
                      <div>
                        <h3 className="font-heading text-2xl text-textPrimary font-light mb-1">
                          Vi ringer dig op
                        </h3>
                        <p className="text-textMuted text-sm mb-6">
                          Skriv dit navn og nummer, så kontakter vi dig for en
                          gratis, uforpligtende snak.
                        </p>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-textBody mb-1.5">
                              Navn
                            </label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Dit navn"
                              className="w-full px-4 py-3 rounded-xl border border-sand bg-white/70 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-cognac transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-textBody mb-1.5">
                              Telefonnummer
                            </label>
                            <input
                              type="tel"
                              value={phoneNo}
                              onChange={(e) => setPhoneNo(e.target.value)}
                              placeholder="12 34 56 78"
                              className="w-full px-4 py-3 rounded-xl border border-sand bg-white/70 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-cognac transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-textBody mb-1.5">
                              Besked{" "}
                              <span className="text-textMuted font-normal">
                                (valgfrit)
                              </span>
                            </label>
                            <textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              rows={2}
                              placeholder="Fx hvornår det passer dig bedst at blive ringet op"
                              className="w-full px-4 py-3 rounded-xl border border-sand bg-white/70 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-cognac transition-colors resize-none"
                            />
                          </div>
                        </div>

                        {submitError && (
                          <p className="text-sm text-sale mt-3">{submitError}</p>
                        )}

                        <button
                          onClick={handleSubmitPhone}
                          disabled={submitting}
                          className="w-full mt-5 py-3.5 bg-cognac hover:bg-cognac-hover disabled:opacity-60 text-white rounded-full font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          {submitting && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                          {submitting ? "Sender…" : "Send forespørgsel"}
                        </button>
                        <p className="text-center text-textMuted text-[11px] mt-3">
                          Vi bruger kun dine oplysninger til at kontakte dig.
                        </p>
                      </div>
                    )}

                    {/* ---- Phase: done ---- */}
                    {phase === "done" && (
                      <div className="text-center py-6">
                        <div className="w-14 h-14 rounded-full bg-cognac/10 flex items-center justify-center mx-auto mb-5">
                          <Check className="w-7 h-7 text-cognac" />
                        </div>
                        <h3 className="font-heading text-2xl text-textPrimary font-light mb-2">
                          Tak, {name.split(" ")[0] || "vi har modtaget din besked"}!
                        </h3>
                        <p className="text-textBody text-sm leading-relaxed max-w-sm mx-auto mb-6">
                          Vi har modtaget din forespørgsel og ringer dig op
                          hurtigst muligt på <strong>{phoneNo}</strong>.
                        </p>
                        <button
                          onClick={reset}
                          className="text-sm text-cognac hover:text-cognac-hover font-medium transition-colors"
                        >
                          Start forfra
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              {(phase === "areas" ||
                phase === "questions" ||
                phase === "phone") && (
                <div
                  className={`flex gap-3 mt-8 pt-6 border-t border-sand/60 ${phase === "areas" ? "justify-end" : "justify-between"}`}
                >
                  {phase !== "areas" && (
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 rounded-full border border-sand text-textMuted hover:text-textBody hover:border-cognac/30 text-sm font-medium transition-all"
                    >
                      ← Tilbage
                    </button>
                  )}
                  {phase === "areas" && (
                    <button
                      onClick={startQuestions}
                      disabled={selected.length === 0}
                      className={`px-7 py-3 rounded-full text-sm font-medium tracking-wide transition-all ${selected.length > 0 ? "bg-cognac hover:bg-cognac-hover text-white" : "bg-sand text-textMuted cursor-not-allowed"}`}
                    >
                      Fortsæt
                    </button>
                  )}
                  {phase === "questions" && (
                    <button
                      onClick={nextQuestion}
                      disabled={!answers[currentArea?.id ?? ""]}
                      className={`px-7 py-3 rounded-full text-sm font-medium tracking-wide transition-all ${answers[currentArea?.id ?? ""] ? "bg-cognac hover:bg-cognac-hover text-white" : "bg-sand text-textMuted cursor-not-allowed"}`}
                    >
                      {qIndex < questionAreas.length - 1
                        ? "Næste"
                        : "Se anbefaling"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
