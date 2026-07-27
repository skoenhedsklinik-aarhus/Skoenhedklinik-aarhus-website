import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, Star, Phone, MapPin } from "lucide-react";
import { getServiceBySlug, getPricingTiers } from "@/lib/supabase-queries";
import { CallbackForm } from "@/components/shared/CallbackForm";
import { StickyMobileCTA } from "@/components/shared/StickyMobileCTA";
import { TrustStrip } from "@/components/shared/TrustStrip";
import { TrackedPhoneLink } from "@/components/shared/TrackedPhoneLink";
import { getGoogleReviews } from "@/lib/reviews";

/**
 * Dedicated ad landing pages (Facebook/Instagram traffic).
 *
 * Deliberately NOT part of the normal site:
 * - lives outside the (public) layout → no header/footer navigation to leak
 *   visitors out of the funnel
 * - noindex/nofollow → never surfaces in Google
 * - not in the sitemap and not linked from anywhere
 *
 * One goal per page: the callback lead form. Booking is the secondary CTA.
 */

type LpContent = {
  eyebrow: string;
  headline: string;
  subline: string;
  bullets: string[];
  image: string;
  resultImages: { src: string; alt: string }[];
  steps: { title: string; desc: string }[];
  faq: { q: string; a: string }[];
  reviews: { name: string; text: string; service: string }[];
};

const LP_CONTENT: Record<string, LpContent> = {
  "tattoo-fjernelse": {
    eyebrow: "Tattoo fjernelse i Aarhus C",
    headline: "Fortryder du din tatovering?",
    subline:
      "Sikker og effektiv fjernelse med avanceret Pico Laser — udført af certificerede behandlere. Start med en gratis vurdering af din tatovering.",
    bullets: [
      "Gratis og uforpligtende vurdering af din tatovering",
      "Pico Laser — mere effektiv og skånsom end ældre lasere",
      "Fast pris pr. behandling — ingen skjulte gebyrer",
      "Registreret hos Styrelsen for Patientsikkerhed",
    ],
    image: "/images/services/tattoo-fjernelse.avif",
    resultImages: [
      { src: "/images/services/tattoo-fjernelse.avif", alt: "Tattoo fjernelse hos Skønhedsklinik Aarhus" },
      { src: "/images/services/tattoo-fjernelse-2.avif", alt: "Pico Laser behandling" },
    ],
    steps: [
      { title: "Gratis vurdering", desc: "Vi ser på din tatovering — størrelse, farver og hudtype — og giver dig en ærlig vurdering af antal behandlinger og pris." },
      { title: "Behandlingsplan", desc: "Du får en fast plan med fast pris, så du ved præcis, hvad du kan forvente, før vi starter." },
      { title: "Laserbehandling", desc: "Pico Laseren nedbryder blækket gradvist over få behandlinger, mens huden skånes mest muligt." },
    ],
    faq: [
      { q: "Gør det ondt?", a: "De fleste beskriver det som små, hurtige prik — mindre end at få tatoveringen lavet. Hver behandling tager typisk kun 10-20 minutter." },
      { q: "Hvor mange behandlinger skal der til?", a: "Det afhænger af tatoveringens størrelse, farver og alder — typisk 4-10 behandlinger. Du får en ærlig vurdering ved den gratis konsultation." },
      { q: "Hvad koster det?", a: "Prisen afhænger af tatoveringens størrelse. Du får en fast pris ved den gratis vurdering, så der er ingen overraskelser." },
      { q: "Er det sikkert?", a: "Ja. Vi er registreret hos Styrelsen for Patientsikkerhed, og behandlingen udføres altid af certificerede behandlere med moderne Pico Laser-udstyr." },
    ],
    reviews: [
      { name: "Sofie M.", text: "Utrolig professionel behandling. Aliaa er super dygtig og gav mig en grundig vejledning inden behandlingen. Kan varmt anbefales!", service: "Laserbehandling" },
      { name: "Mette K.", text: "Fantastisk klinik med en helt unik atmosfære. Følte mig tryg fra første sekund. Resultatet er bedre end jeg turde håbe på.", service: "Klinikbesøg" },
      { name: "Lotte P.", text: "Endelig fundet en klinik jeg kan stole på. Grundig konsultation, synlige resultater og fair priser. Kommer igen og igen!", service: "Klinikbesøg" },
    ],
  },
  "laser-haarfjerning": {
    eyebrow: "Laser hårfjerning i Aarhus C",
    headline: "Slip for barbering — permanent",
    subline:
      "Varig hårreduktion med skånsom diode-laser, udført af erfaren sygeplejerske. Start med en gratis konsultation, hvor du kan prøve laseren på et lille område.",
    bullets: [
      "Gratis konsultation med hud- og hårtypevurdering",
      "Prøv laseren på et lille område, før du beslutter dig",
      "Udføres af erfaren sygeplejerske",
      "Registreret hos Styrelsen for Patientsikkerhed",
    ],
    image: "/images/services/laser-haarfjerning.avif",
    resultImages: [
      { src: "/images/laser-before.avif", alt: "Før laser hårfjerning" },
      { src: "/images/laser-after.avif", alt: "Efter laser hårfjerning" },
    ],
    steps: [
      { title: "Gratis konsultation", desc: "Vores sygeplejerske Louise vurderer din hud- og hårtype og lægger en præcis behandlingsplan. Du kan prøve laseren på et lille område." },
      { title: "Behandlingsforløb", desc: "Typisk 6-10 behandlinger med 4-8 ugers mellemrum. Hver behandling er hurtig — små områder tager få minutter." },
      { title: "Varigt resultat", desc: "Hårvæksten reduceres markant for hver behandling — glat hud uden barbering, voks eller indgroede hår." },
    ],
    faq: [
      { q: "Gør det ondt?", a: "De fleste oplever kun et lille varmt prik — langt mindre ubehageligt end voks. Ved den gratis konsultation kan du prøve laseren, før du beslutter dig." },
      { q: "Hvor mange behandlinger skal der til?", a: "Typisk 6-10 behandlinger, afhængigt af område, hudtype og hårfarve. Du får en realistisk plan ved konsultationen." },
      { q: "Virker det på min hud- og hårtype?", a: "Diode-laseren virker bedst på mørkt hår. Ved konsultationen vurderer vi ærligt, om laser er det rigtige for dig — og siger det, hvis det ikke er." },
      { q: "Hvad koster det?", a: "Prisen afhænger af området — se fast prisliste ved konsultationen. Forløbspakker giver rabat pr. behandling." },
    ],
    reviews: [
      { name: "Sofie M.", text: "Utrolig professionel behandling. Aliaa er super dygtig og gav mig en grundig vejledning inden behandlingen. Kan varmt anbefales!", service: "Laser hårfjerning" },
      { name: "Amalie K.", text: "Aliaa er super dygtig og giver sig god tid til at forklare alt. Har fået laserbehandling og er virkelig tilfreds med resultatet!", service: "Laser hårfjerning" },
      { name: "Mette K.", text: "Fantastisk klinik med en helt unik atmosfære. Følte mig tryg fra første sekund. Resultatet er bedre end jeg turde håbe på.", service: "Klinikbesøg" },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(LP_CONTENT).map((slug) => ({ slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const lp = LP_CONTENT[params.slug];
  if (!lp) return { title: "Ikke fundet" };
  return {
    title: `${lp.eyebrow} — Skønhedsklinik Aarhus`,
    description: lp.subline,
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

function Stars() {
  return (
    <span className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-cognac-accent text-cognac-accent" />
      ))}
    </span>
  );
}

export default async function AdLandingPage({ params }: { params: { slug: string } }) {
  const lp = LP_CONTENT[params.slug];
  if (!lp) notFound();

  const service = await getServiceBySlug(params.slug);
  if (!service) notFound();

  const allPricingTiers = await getPricingTiers();
  const priceValues = allPricingTiers
    .filter((p) => p.service_id === service.id)
    .map((p) => Number(p.price_dkk))
    .filter((n) => Number.isFinite(n) && n > 0);
  const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : null;
  const minPriceLabel = minPrice !== null ? minPrice.toLocaleString("da-DK") : null;

  // Real Google reviews when available — the placeholder quotes in LP_CONTENT
  // are only a stopgap, and running paid traffic against invented reviews is a
  // markedsføringslov problem.
  const googleReviews = await getGoogleReviews(3);
  const reviewCards =
    googleReviews.source === "google"
      ? googleReviews.reviews.map((r) => ({
          name: r.author,
          text: r.text,
          service: r.relativeTime
            ? `Google-anmeldelse · ${r.relativeTime}`
            : "Google-anmeldelse",
        }))
      : lp.reviews;
  const ratingLabel = (googleReviews.rating ?? 5).toFixed(1).replace(".", ",");

  return (
    <main className="flex flex-col min-h-screen bg-cream">
      {/* ─── Minimal top bar — logo + phone, no navigation ─────────── */}
      <div className="bg-noir/95 text-cream">
        <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          <span className="font-heading text-lg font-medium tracking-tight">
            Skønhedsklinik Aarhus
          </span>
          <TrackedPhoneLink
            contentCategory={`lp-${params.slug}`}
            contentName={service.name}
            className="flex items-center gap-2 text-cream/80 hover:text-cream text-sm font-medium transition-colors"
          >
            <Phone className="w-4 h-4" /> 61 44 59 99
          </TrackedPhoneLink>
        </div>
      </div>

      {/* ─── Hero — headline left, lead form right ─────────────────── */}
      <section className="relative overflow-hidden section-dark">
        <div className="absolute inset-0">
          <Image src={lp.image} alt={service.name} fill priority className="object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-noir/70 via-noir/80 to-noir/95" />
        </div>
        <div className="container relative mx-auto px-4 lg:px-8 py-14 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <span className="eyebrow text-cognac-light mb-4 block">{lp.eyebrow}</span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white font-light leading-[1.08] mb-5 text-balance">
                {lp.headline}
              </h1>
              <p className="text-white/70 text-lg font-light leading-relaxed mb-7 max-w-xl">
                {lp.subline}
              </p>
              <ul className="space-y-3 mb-8">
                {lp.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-white/85 text-sm">
                    <span className="w-5 h-5 rounded-full bg-cognac flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-white/60 text-xs font-medium tracking-wide">
                <span className="flex items-center gap-1.5">
                  <Stars /> {ratingLabel} på Google
                </span>
                {minPriceLabel && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/40" />
                    <span>Priser fra {minPriceLabel} kr.</span>
                  </>
                )}
              </div>
            </div>

            <div id="lead-form" className="scroll-mt-6">
              <CallbackForm treatmentName={service.name} source={`lp-${params.slug}`} variant="solid" />
              <p className="text-center text-white/50 text-xs mt-4">
                …eller book din gratis konsultation direkte:{" "}
                <Link href={`/book?service=${params.slug}`} className="text-cognac-light underline underline-offset-2 hover:text-white transition-colors">
                  vælg tid her
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <TrustStrip />

      {/* ─── Results ───────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <div className="text-center mb-10">
            <span className="eyebrow text-cognac mb-4 block">Resultater</span>
            <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light">
              Se behandlingen
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:gap-6">
            {lp.resultImages.map((img) => (
              <div key={img.src} className="relative aspect-[4/5] overflow-hidden rounded-lg shadow-md border border-sand/30">
                <Image src={img.src} alt={img.alt} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ──────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-beige">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <div className="text-center mb-10">
            <span className="eyebrow text-cognac mb-4 block">Sådan foregår det</span>
            <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light">
              Fra tvivl til resultat i 3 trin
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {lp.steps.map((step, i) => (
              <div key={step.title} className="glass-cream rounded-xl p-7">
                <p className="font-heading text-4xl text-cognac/25 font-light mb-4">0{i + 1}</p>
                <h3 className="font-heading text-lg text-textPrimary font-medium mb-2">{step.title}</h3>
                <p className="text-textBody text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Reviews ───────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="eyebrow text-cognac mb-4 block">Anmeldelser</span>
              <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light">
                Det siger vores klienter
              </h2>
            </div>
            <div className="glass-cream rounded-xl px-5 py-3.5 flex items-center gap-3 shrink-0 self-start md:self-auto">
              <p className="text-2xl font-heading font-light text-textPrimary leading-none">
                {ratingLabel}
              </p>
              <div className="w-px h-8 bg-sand" />
              <div>
                <Stars />
                <p className="text-xs text-textMuted mt-0.5">
                  {googleReviews.totalCount
                    ? `${googleReviews.totalCount} Google-anmeldelser`
                    : "Google Anmeldelser"}
                </p>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {reviewCards.map((r, i) => (
              <div key={`${r.name}-${i}`} className="glass-cream rounded-xl p-6 flex flex-col gap-4">
                <Stars />
                <p className="text-textBody text-sm leading-relaxed flex-grow">&ldquo;{r.text}&rdquo;</p>
                <div className="border-t border-sand/60 pt-3">
                  <p className="font-medium text-textPrimary text-sm">{r.name}</p>
                  <p className="text-textMuted text-xs mt-0.5">{r.service}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-beige">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className="text-center mb-10">
            <span className="eyebrow text-cognac mb-4 block">Spørgsmål & svar</span>
            <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light">
              Det spørger folk oftest om
            </h2>
          </div>
          <div className="space-y-4">
            {lp.faq.map((item) => (
              <div key={item.q} className="glass-cream rounded-xl p-6">
                <h3 className="font-heading text-lg text-textPrimary font-medium mb-2">{item.q}</h3>
                <p className="text-textBody text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────────────────────── */}
      <section className="section-dark py-20 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <span className="eyebrow text-cognac-light mb-5 block">Klar når du er</span>
          <h2 className="font-heading text-3xl md:text-5xl text-cream font-light leading-tight mb-5 max-w-2xl mx-auto text-balance">
            Få svar på alle dine spørgsmål — gratis
          </h2>
          <p className="text-cream/55 text-base leading-relaxed max-w-md mx-auto mb-9">
            Ingen binding, intet pres. Vi lægger en ærlig plan sammen, og du
            beslutter dig i ro og mag.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="#lead-form"
              className="px-9 py-4 bg-cognac hover:bg-cognac-hover text-white rounded-full text-sm font-medium tracking-wide transition-colors"
            >
              Bliv ringet op — gratis
            </a>
            <TrackedPhoneLink
              contentCategory={`lp-${params.slug}-final`}
              contentName={service.name}
              className="px-9 py-4 glass hover:bg-white/15 text-cream rounded-full text-sm font-medium tracking-wide transition-all"
            >
              Ring nu — 61 44 59 99
            </TrackedPhoneLink>
          </div>
          <p className="flex items-center justify-center gap-2 text-cream/40 text-xs">
            <MapPin className="w-3.5 h-3.5" /> Tordenskjoldsgade 61, 8000 Aarhus C
          </p>
        </div>
      </section>

      {/* Minimal footer — legal links only */}
      <footer className="bg-noir text-cream/40 text-xs py-6">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© Skønhedsklinik Aarhus · CVR 46525299</span>
          <div className="flex gap-5">
            <Link href="/cookies-og-privatlivspolitik" className="hover:text-cream/70 transition-colors">
              Privatlivspolitik
            </Link>
            <Link href="/handelsbetingelser" className="hover:text-cream/70 transition-colors">
              Handelsbetingelser
            </Link>
          </div>
        </div>
      </footer>

      <StickyMobileCTA
        serviceSlug={params.slug}
        serviceName={service.name}
        bookHref="#lead-form"
        bookLabel="Bliv ringet op — gratis"
        contentCategory="lp"
      />
    </main>
  );
}
