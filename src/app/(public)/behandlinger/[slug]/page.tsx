import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getServices, getServiceBySlug, getPricingTiers } from "@/lib/supabase-queries";
import { enrichServiceWithFallback, getServiceThumbnail } from "@/lib/services-fallback";
import { FinalCTA } from "@/components/shared/FinalCTA";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Clock, Leaf, Star, Info } from "lucide-react";
import { medicalProcedureSchema, faqPageSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://skoenhedsklinik-aarhus.dk";

const iconMap: Record<string, React.ElementType> = {
  shield: Shield,
  clock: Clock,
  leaf: Leaf,
  star: Star,
};

export async function generateStaticParams() {
  const services = await getServices() || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return services.map((service: any) => ({
    slug: service.slug,
  }));
}

export const dynamicParams = true;

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);
  if (!service) return { title: "Behandling ikke fundet" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = service as any;
  const title = s.meta_title || `${s.name} — Skønhedsklinik Aarhus`;
  const description = s.meta_description || s.short_description || "";
  const image = s.og_image_url || s.hero_image_url || "/images/og-default.jpg";
  const canonical = `/behandlinger/${s.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title, description, url: canonical,
      images: [{ url: image.startsWith("http") ? image : `${SITE_URL}${image}`, width: 1200, height: 630, alt: s.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.startsWith("http") ? image : `${SITE_URL}${image}`] },
  };
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = await getServiceBySlug(params.slug);
  if (!service) notFound();

  const allPricingTiers = await getPricingTiers();
  const prices = allPricingTiers.filter((p) => p.service_id === service.id);
  const groupedPrices = prices.reduce((acc, price) => {
    const group = price.subcategory || "Andre";
    if (!acc[group]) acc[group] = [];
    acc[group].push(price);
    return acc;
  }, {} as Record<string, typeof prices>);

  const allServices = await getServices();
  const relatedServices = allServices
    .filter((s) => s.category === service.category && s.slug !== service.slug)
    .slice(0, 3);
  const finalRelated = relatedServices.length > 0
    ? relatedServices
    : allServices.filter((s) => s.is_popular && s.slug !== service.slug).slice(0, 3);

  // Enrich service with comprehensive fallback content (descriptions, benefits, FAQs, care guidelines)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = enrichServiceWithFallback(params.slug, service as any);

  // Split long_description dynamically at <h3> or <h2> if present to support high-end magazine layouts
  let firstPart = s.long_description || `<p>${s.short_description || ""}</p>`;
  let secondPart = "";
  let hasSplit = false;

  if (s.long_description) {
    const splitTag = s.long_description.includes("<h3>") ? "<h3>" : (s.long_description.includes("<h2>") ? "<h2>" : null);
    if (splitTag) {
      const index = s.long_description.indexOf(splitTag);
      firstPart = s.long_description.substring(0, index);
      secondPart = s.long_description.substring(index);
      hasSplit = true;
    }
  }

  const procedureJsonLd = medicalProcedureSchema(s);
  const hasFaq = s.faq && Array.isArray(s.faq) && s.faq.length > 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const faqJsonLd = hasFaq ? faqPageSchema(s.faq as any[]) : null;

  return (
    <main className="flex flex-col min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(procedureJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      {/* ─── 1. Parallax Hero ──────────────────────────────────────── */}
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0 bg-textPrimary">
          {s.hero_video_url ? (
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src={s.hero_video_url} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={service.hero_image_url || "/placeholder.jpg"}
              alt={service.name}
              fill priority
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
        </div>

        <div className="container relative z-10 mx-auto px-4 lg:px-8 pb-14 md:pb-20">
          <span className="eyebrow text-cognac-light mb-4 block">
            {service.category.replace(/-/g, " ")}
          </span>
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-white font-light leading-[1.06] mb-6 max-w-3xl text-balance">
            {service.name}
          </h1>
          <p className="text-white/70 text-lg font-light max-w-xl mb-10">
            {service.short_description}
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link href={`/book?service=${service.slug}`}>
              <button className="px-8 py-4 bg-cognac hover:bg-cognac-hover text-white rounded-full text-sm font-medium tracking-wide transition-colors">
                Book konsultation
              </button>
            </Link>
            <Link href="#priser">
              <button className="px-8 py-4 glass hover:bg-white/15 text-white rounded-full text-sm font-medium tracking-wide transition-all">
                Se priser
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 2. Intro — Full Width Section (First Part, only if split) ─── */}
      {hasSplit && (
        <section className="pt-20 pb-8 lg:pt-28 lg:pb-12 bg-white">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl text-center">
            <span className="eyebrow text-cognac mb-4 block">Om behandlingen</span>
            <h2 className="font-heading text-4xl md:text-5xl text-textPrimary font-light mb-6 leading-tight">
              {service.name} i Aarhus
            </h2>
            <div className="w-16 h-px bg-cognac mx-auto mb-10" />
            <div
              className="prose prose-lg max-w-none text-textBody prose-headings:font-heading prose-headings:text-textPrimary prose-a:text-cognac mx-auto text-left leading-relaxed font-light"
              dangerouslySetInnerHTML={{ __html: firstPart }}
            />
          </div>
        </section>
      )}

      {/* ─── 2b. Details & Action — two column ───────────────────────── */}
      <section className={`${hasSplit ? "pb-20 lg:pb-28" : "py-20 lg:py-28"} bg-white`}>
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            {/* Text details & Consultation Box */}
            <div className="lg:col-span-7 space-y-10">
              {!hasSplit && (
                <div>
                  <span className="eyebrow text-cognac mb-4 block">Om behandlingen</span>
                  <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light mb-5 leading-tight">
                    {service.name} i Aarhus
                  </h2>
                  <div className="w-10 h-px bg-cognac mb-7" />
                </div>
              )}
              
              <div
                className="prose prose-lg max-w-none text-textBody prose-headings:font-heading prose-headings:text-textPrimary prose-a:text-cognac leading-relaxed font-light"
                dangerouslySetInnerHTML={{ __html: hasSplit ? secondPart : firstPart }}
              />
              
              {service.requires_consultation && (
                <div className="glass-cognac rounded-2xl p-8 border border-cognac/20 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cognac/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
                  <span className="eyebrow text-cognac text-[10px] tracking-wider mb-2 block uppercase font-medium">Lovpligtig forundersøgelse</span>
                  <h4 className="font-heading text-2xl text-textPrimary font-light mb-4">Konsultation v/ Louise</h4>
                  <p className="text-textBody text-sm leading-relaxed mb-5 font-light">
                    Hos Skønhedsklinik Aarhus tilbyder vi en gratis og helt uforpligtende konsultation, før du kan starte et forløb med laser hårfjerning. Konsultationen er et lovpligtigt krav og en vigtig del af processen, så vi sikrer, at behandlingen er den rette for dig.
                  </p>
                  <p className="text-textBody text-sm leading-relaxed mb-6 font-light">
                    Vores erfarne sygeplejerske Louise, som har mange års erfaring inden for laser- og skønhedsbehandlinger, gennemgår hele forløbet med dig. Sammen taler I om dine ønsker, vurderer din hud- og hårtype for at lægge den mest præcise og sikre behandlingsplan. Du får også mulighed for at få prøvet laseren på et lille område, så du kan mærke behandlingen inden start.
                  </p>
                  <Link href={`/book?service=${service.slug}&type=consultation`}>
                    <button className="px-8 py-3 bg-cognac hover:bg-cognac-hover text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm">
                      Book gratis konsultation
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Secondary image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-lg shadow-2xl border border-sand/20">
                <Image
                  src={(s.gallery && s.gallery.length > 0 ? s.gallery[0] : service.hero_image_url) || "/placeholder.jpg"}
                  alt={`${service.name} behandling`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Benefits grid ──────────────────────────────────────── */}
      {s.benefits && Array.isArray(s.benefits) && s.benefits.length > 0 && (
        <section className="py-20 bg-beige">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <span className="eyebrow text-cognac mb-4 block">Fordele</span>
              <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light">
                Fordele ved {service.name.toLowerCase()}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(s.benefits as any[]).map((benefit: any, i: number) => {
                const Icon = iconMap[benefit.icon] || Info;
                return (
                  <div key={i} className="glass-cream rounded-xl p-7 flex gap-5 items-start">
                    <div className="w-10 h-10 rounded-full bg-cognac/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-cognac" />
                    </div>
                    <div>
                      <h4 className="font-heading text-lg text-textPrimary font-medium mb-1.5">{benefit.title}</h4>
                      <p className="text-textBody text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── 3b. Gallery ───────────────────────────────────────────── */}
      {s.gallery && Array.isArray(s.gallery) && s.gallery.length >= 3 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <span className="eyebrow text-cognac mb-4 block">Galleri</span>
              <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light">
                Se {service.name.toLowerCase()}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
              {(s.gallery as string[]).map((src: string, i: number) => (
                <div
                  key={i}
                  className="group relative aspect-[4/5] overflow-hidden rounded-lg shadow-sm border border-sand/20"
                >
                  <Image
                    src={src}
                    alt={`${service.name} — billede ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 4. What to expect ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <div className="text-center mb-12">
            <span className="eyebrow text-cognac mb-4 block">Forløbet</span>
            <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light">
              Hvad kan du forvente?
            </h2>
            <p className="text-textMuted text-base mt-4 max-w-lg mx-auto">
              Vi sørger for, at du er tryg og informeret gennem hele behandlingsforløbet.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { n: "01", title: "Personlig konsultation", desc: "Vi gennemgår din hud, dine ønsker og dit mål — og finder den rette behandling til dig." },
              { n: "02", title: "Skræddersyet behandling", desc: "Behandlingen tilpasses nøje efter din hudtype og de resultater, vi ønsker at opnå." },
              { n: "03", title: "Opfølgning & støtte", desc: "Vi er altid tilgængelige med råd og vejledning efter behandlingen." },
            ].map((step) => (
              <div key={step.n} className="glass-cream rounded-xl p-7">
                <p className="font-heading text-4xl text-cognac/20 font-light mb-4">{step.n}</p>
                <h4 className="font-heading text-lg text-textPrimary font-medium mb-2">{step.title}</h4>
                <p className="text-textBody text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4b. Before & After Care Instructions (Før & Efter) ────────── */}
      {((s.pre_instructions && Array.isArray(s.pre_instructions) && s.pre_instructions.length > 0) ||
        (s.post_instructions && Array.isArray(s.post_instructions) && s.post_instructions.length > 0)) && (
        <section className="py-20 bg-beige border-t border-b border-sand/40">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <div className="text-center mb-16">
              <span className="eyebrow text-cognac mb-4 block">Retningslinjer</span>
              <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light">
                Forberedelse & Efterbehandling
              </h2>
              <p className="text-textMuted text-base mt-4 max-w-xl mx-auto">
                Følg disse vigtige retningslinjer for at sikre det bedste resultat og en sikker behandling.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Før behandling */}
              {s.pre_instructions && Array.isArray(s.pre_instructions) && s.pre_instructions.length > 0 && (
                <div className="glass-cream rounded-2xl p-8 lg:p-10 shadow-sm border border-sand/30 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-cognac/10 flex items-center justify-center">
                      <Info className="w-4 h-4 text-cognac" />
                    </div>
                    <h3 className="font-heading text-2xl text-textPrimary font-light">Før behandlingen</h3>
                  </div>
                  <div className="w-full h-px bg-sand/60 mb-6" />
                  <ul className="space-y-4 flex-1">
                    {(s.pre_instructions as string[]).map((item, i) => (
                      <li key={i} className="flex gap-3.5 items-start text-textBody text-sm leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-cognac/5 border border-cognac/20 flex items-center justify-center text-[10px] font-medium text-cognac shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Efter behandling */}
              {s.post_instructions && Array.isArray(s.post_instructions) && s.post_instructions.length > 0 && (
                <div className="glass-cream rounded-2xl p-8 lg:p-10 shadow-sm border border-sand/30 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[#7A8B5C]/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#7A8B5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-heading text-2xl text-textPrimary font-light">Efter behandlingen</h3>
                  </div>
                  <div className="w-full h-px bg-sand/60 mb-6" />
                  <ul className="space-y-4 flex-1">
                    {(s.post_instructions as string[]).map((item, i) => (
                      <li key={i} className="flex gap-3.5 items-start text-textBody text-sm leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-[#7A8B5C]/5 border border-[#7A8B5C]/20 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-[#7A8B5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── 5. Pricing ────────────────────────────────────────────── */}
      {prices.length > 0 && (
        <section id="priser" className="py-20 bg-cream scroll-mt-20">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <div className="text-center mb-12">
              <span className="eyebrow text-cognac mb-4 block">Priser</span>
              <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light">
                Priser for {service.name.toLowerCase()}
              </h2>
            </div>
 
            <Accordion defaultValue={["group-0"]} className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(Object.entries(groupedPrices) as [string, any[]][]).map(([group, groupPrices], index) => (
                <AccordionItem
                  key={group}
                  value={`group-${index}`}
                  className="border border-sand/40 rounded-xl bg-white/40 backdrop-blur-sm px-6 overflow-hidden transition-all duration-300"
                >
                  <AccordionTrigger className="font-heading text-lg text-textPrimary hover:text-cognac py-5 no-underline hover:no-underline font-medium">
                    {group}
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-6">
                    <ul className="space-y-0">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {groupPrices.map((price: any, i: number) => (
                        <li
                          key={price.id}
                          className={`flex justify-between items-center py-3.5 text-textBody ${
                            i < groupPrices.length - 1 ? "border-b border-sand/30" : ""
                          }`}
                        >
                          <span className="text-sm">{price.name}</span>
                          <span className="font-medium text-textPrimary tnum text-sm tabular-nums">
                            {price.price_dkk} kr.
                          </span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
 
            <div className="mt-12 text-center">
              <Link href="/priser" className="text-cognac font-medium text-sm hover:text-cognac-hover transition-colors">
                Se alle priser →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── 6. FAQ ────────────────────────────────────────────────── */}
      {hasFaq && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <div className="text-center mb-12">
              <span className="eyebrow text-cognac mb-4 block">Spørgsmål & svar</span>
              <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light">
                Ofte stillede spørgsmål
              </h2>
            </div>
            <Accordion defaultValue={["item-0"]}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(s.faq as any[]).map((item: any, index: number) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-sand">
                  <AccordionTrigger className="text-left font-heading text-xl text-textPrimary hover:text-cognac py-5 no-underline hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div
                      className="prose prose-sm text-textBody pb-5 pt-1"
                      dangerouslySetInnerHTML={{ __html: item.answer }}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* ─── 7. Related Services ───────────────────────────────────── */}
      {finalRelated.length > 0 && (
        <section className="section-dark py-20 lg:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mb-12">
              <span className="eyebrow text-cognac-light mb-4 block">Relaterede behandlinger</span>
              <h2 className="font-heading text-3xl md:text-4xl text-cream font-light">
                Du vil måske også synes om
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {finalRelated.map((related) => (
                <Link
                  key={related.slug}
                  href={`/behandlinger/${related.slug}`}
                  className="group relative overflow-hidden rounded-sm block"
                >
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={getServiceThumbnail(related.slug, related.hero_image_url)}
                      alt={related.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <div className="absolute bottom-5 left-5">
                      <h3 className="font-heading text-2xl text-white font-light">{related.name}</h3>
                      <span className="text-cognac-light text-xs font-medium tracking-wide mt-1 block">
                        Læs mere →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <FinalCTA />
    </main>
  );
}
