import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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

// Generating static params
export async function generateStaticParams() {
  const services = await getServices() || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return services.map((service: any) => ({
    slug: service.slug,
  }));
}

// Allow pages not pre-generated at build time to be rendered on demand
export const dynamicParams = true;

// Dynamic per-service metadata
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);

  if (!service) {
    return {
      title: "Behandling ikke fundet",
      description: "Den ønskede behandling kunne ikke findes.",
    };
  }

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
      title,
      description,
      url: canonical,
      images: [
        {
          url: image.startsWith("http") ? image : `${SITE_URL}${image}`,
          width: 1200,
          height: 630,
          alt: s.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.startsWith("http") ? image : `${SITE_URL}${image}`],
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = await getServiceBySlug(params.slug);

  if (!service) {
    notFound();
  }

  const allPricingTiers = await getPricingTiers();
  const prices = allPricingTiers.filter((p) => p.service_id === service.id);
  
  // Group prices by subcategory
  const groupedPrices = prices.reduce((acc, price) => {
    const group = price.subcategory || 'Andre';
    if (!acc[group]) acc[group] = [];
    acc[group].push(price);
    return acc;
  }, {} as Record<string, typeof prices>);

  const allServices = await getServices();
  const relatedServices = allServices
    .filter((s) => s.category === service.category && s.slug !== service.slug)
    .slice(0, 3);

  // If no related in same category, just take popular ones
  const finalRelated = relatedServices.length > 0 
    ? relatedServices 
    : allServices.filter(s => s.is_popular && s.slug !== service.slug).slice(0, 3);

  // Build JSON-LD schemas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = service as any;
  const procedureJsonLd = medicalProcedureSchema(s);
  const hasFaq = s.faq && Array.isArray(s.faq) && s.faq.length > 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const faqJsonLd = hasFaq ? faqPageSchema(s.faq as any[]) : null;

  return (
    <main className="flex flex-col min-h-screen">
      {/* Schema.org MedicalProcedure */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(procedureJsonLd) }}
      />
      {/* Schema.org FAQPage (conditional) */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={service.hero_image_url || "/placeholder.jpg"}
            alt={service.name}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <span className="text-sm font-medium tracking-widest uppercase mb-4 block text-white/90">
            {service.category.replace("-", " ")}
          </span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6 max-w-4xl mx-auto">
            {service.name}
          </h1>
          <p className="text-lg md:text-xl font-light max-w-2xl mx-auto mb-10 opacity-90">
            {service.short_description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`/book?service=${service.slug}`}>
              <Button className="w-full sm:w-auto bg-cognac hover:bg-cognac-hover text-white rounded-full px-8 border border-cognac">
                Book konsultation
              </Button>
            </Link>
            <Link href="#priser">
              <Button variant="outline" className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white border-white rounded-full px-8">
                Se priser
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Intro & Benefits */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-[720px]">
          <div 
            className="prose prose-lg text-textBody prose-headings:font-heading prose-headings:text-textPrimary prose-a:text-cognac mx-auto"
            dangerouslySetInnerHTML={{ __html: service.long_description }}
          />

          {service.benefits && Array.isArray(service.benefits) && service.benefits.length > 0 && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-sand pt-16">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(service.benefits as any[]).map((benefit: any, i) => {
                const Icon = iconMap[benefit.icon] || Info;
                return (
                  <div key={i} className="text-center md:text-left flex flex-col items-center md:items-start">
                    <div className="bg-cream p-4 rounded-full text-cognac mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-heading text-xl text-textPrimary mb-2">{benefit.title}</h4>
                    <p className="text-textBody text-sm">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Consultation Callout */}
      {service.requires_consultation && (
        <section className="py-12 px-4 bg-beige border-y border-sand">
          <div className="container mx-auto max-w-[720px] text-center">
            <span className="inline-block bg-moss/10 text-moss border border-moss/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
              Lovpligtig forundersøgelse
            </span>
            <h3 className="font-heading text-2xl text-textPrimary mb-4">
              Gratis konsultation påkrævet
            </h3>
            <p className="text-textBody mb-6">
              Ifølge Styrelsen for Patientsikkerhed kræver denne behandling en gratis og uforpligtende forundersøgelse hos vores sygeplejerske mindst 48 timer før din første behandling.
            </p>
            <Link href={`/book?service=${service.slug}&type=consultation`}>
              <Button className="bg-cognac hover:bg-cognac-hover text-white rounded-full">
                Book gratis konsultation
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Pricing */}
      {prices.length > 0 && (
        <section id="priser" className="py-20 px-4 bg-white scroll-mt-20">
          <div className="container mx-auto max-w-[720px]">
            <h2 className="font-heading text-3xl md:text-4xl text-textPrimary mb-10 text-center">
              Priser for {service.name.toLowerCase()}
            </h2>
            
            <div className="space-y-12">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(Object.entries(groupedPrices) as [string, any[]][]).map(([group, groupPrices]) => (
                <div key={group}>
                  {group !== 'Andre' && (
                    <h3 className="font-heading text-xl text-textPrimary border-b border-sand pb-2 mb-6">
                      {group}
                    </h3>
                  )}
                  <ul className="space-y-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {groupPrices.map((price: any) => (
                      <li key={price.id} className="flex justify-between items-center text-textBody">
                        <span>{price.name}</span>
                        <span className="font-medium text-textPrimary font-[tabular-nums]">
                          {price.price_dkk} kr.
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/priser" className="text-cognac font-medium hover:text-cognac-hover transition-colors">
                Se alle priser →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {service.faq && Array.isArray(service.faq) && service.faq.length > 0 && (
        <section className="py-20 px-4 bg-cream">
          <div className="container mx-auto max-w-[720px]">
            <h2 className="font-heading text-3xl md:text-4xl text-textPrimary mb-10 text-center">
              Ofte stillede spørgsmål
            </h2>
            <Accordion defaultValue={["item-0"]}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(service.faq as any[]).map((item: any, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-sand">
                  <AccordionTrigger className="text-left font-heading text-xl text-textPrimary hover:text-cognac">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div 
                      className="prose prose-sm text-textBody pb-4"
                      dangerouslySetInnerHTML={{ __html: item.answer }}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* Related Services */}
      <section className="py-20 px-4 bg-white border-t border-sand">
        <div className="container mx-auto lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-textPrimary mb-12">
            Du kunne også være interesseret i...
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {finalRelated.map((related) => (
              <Link
                key={related.slug}
                href={`/behandlinger/${related.slug}`}
                className="group block text-left"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl mb-4">
                  <Image
                    src={related.hero_image_url || "/placeholder.jpg"}
                    alt={related.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-heading text-2xl text-textPrimary mb-2 group-hover:text-cognac transition-colors">
                  {related.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}
