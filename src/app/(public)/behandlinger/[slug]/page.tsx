import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getServices, getServiceBySlug, getPricingTiers } from "@/lib/supabase-queries";
import { FinalCTA } from "@/components/shared/FinalCTA";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Clock, Leaf, Info } from "lucide-react";
import { medicalProcedureSchema, faqPageSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://skoenhedsklinik-aarhus.dk";

const iconMap: Record<string, React.ElementType> = {
  shield: Shield,
  clock: Clock,
  leaf: Leaf,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = service as any;
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
        <div className="absolute inset-0 z-0">
          <Image
            src={service.hero_image_url || "/placeholder.jpg"}
            alt={service.name}
            fill priority
            className="object-cover"
          />
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

      {/* ─── 2. Intro — two column ─────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Text */}
            <div>
              <span className="eyebrow text-cognac mb-4 block">Om behandlingen</span>
              <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light mb-5 leading-tight">
                {service.name} i Aarhus
              </h2>
              <div className="w-10 h-px bg-cognac mb-7" />
              <div
                className="prose prose-lg text-textBody prose-headings:font-heading prose-headings:text-textPrimary prose-a:text-cognac"
                dangerouslySetInnerHTML={{ __html: service.long_description || `<p>${service.short_description}</p>` }}
              />
              {service.requires_consultation && (
                <div className="mt-8 glass-cognac rounded-xl p-5">
                  <p className="eyebrow text-cognac text-[10px] mb-2">Lovpligtig forundersøgelse</p>
                  <p className="text-textBody text-sm leading-relaxed">
                    Denne behandling kræver en gratis konsultation hos vores sygeplejerske mindst 48 timer inden første behandling — registreret hos Styrelsen for Patientsikkerhed.
                  </p>
                  <Link href={`/book?service=${service.slug}&type=consultation`}>
                    <button className="mt-4 px-6 py-2.5 bg-cognac hover:bg-cognac-hover text-white rounded-full text-xs font-medium tracking-wide transition-colors">
                      Book gratis konsultation
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Secondary image */}
            <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-sm shadow-xl">
              <Image
                src={service.hero_image_url || "/placeholder.jpg"}
                alt={`${service.name} behandling`}
                fill
                className="object-cover"
              />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
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

            <div className="space-y-10">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(Object.entries(groupedPrices) as [string, any[]][]).map(([group, groupPrices]) => (
                <div key={group}>
                  {group !== "Andre" && (
                    <h3 className="font-heading text-lg text-textPrimary mb-4 pb-2 border-b border-sand">{group}</h3>
                  )}
                  <ul className="space-y-0">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {groupPrices.map((price: any, i: number) => (
                      <li
                        key={price.id}
                        className={`flex justify-between items-center py-3.5 text-textBody ${
                          i < groupPrices.length - 1 ? "border-b border-sand/60" : ""
                        }`}
                      >
                        <span className="text-sm">{price.name}</span>
                        <span className="font-medium text-textPrimary tnum text-sm tabular-nums">
                          {price.price_dkk} kr.
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
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
                      src={related.hero_image_url || "/placeholder.jpg"}
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
