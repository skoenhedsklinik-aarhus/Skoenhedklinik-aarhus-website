import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Check, Calendar, MapPin, Phone, Mail } from "lucide-react";
import { getServiceBySlug, getPricingTiers } from "@/lib/supabase-queries";
import { BookingConfirmed } from "./BookingConfirmed";

/**
 * Booking confirmation page.
 *
 * This is the URL Planway must be pointed at:
 *   Planway → Indstillinger → Online booking → "Ekstern bekræftelsesside"
 *   → https://skoenhedsklinik-aarhus.dk/tak
 *
 * It exists to turn a completed Planway booking into a measurable conversion.
 * Everything visible is secondary — the point is the `Schedule` event fired by
 * <BookingConfirmed />.
 *
 * noindex: it is a post-conversion page, it must never rank or be crawled.
 */

export const metadata: Metadata = {
  title: "Tak for din booking — Skønhedsklinik Aarhus",
  description: "Din tid er booket hos Skønhedsklinik Aarhus.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// The Planway confirmation redirect must never hit a cached page.
export const dynamic = "force-dynamic";

/** Fallback booking value in DKK when the treatment has no price list. */
const DEFAULT_BOOKING_VALUE = Number(process.env.BOOKING_DEFAULT_VALUE_DKK || 0);

function readCookie(name: string): string | null {
  const raw = cookies().get(name)?.value;
  if (!raw) return null;
  try {
    return decodeURIComponent(raw) || null;
  } catch {
    return raw;
  }
}

/**
 * Estimated DKK value of the booking.
 *
 * Deliberately the *lowest* listed price for the treatment, not an average:
 * a booking is not yet paid, and some become no-shows, so it is better to
 * under-claim than to inflate the numbers Meta optimises on. Override the
 * fallback with BOOKING_DEFAULT_VALUE_DKK.
 */
async function estimateBookingValue(slug: string | null): Promise<number | null> {
  if (!slug) return DEFAULT_BOOKING_VALUE || null;

  try {
    const service = await getServiceBySlug(slug);
    if (!service?.id) return DEFAULT_BOOKING_VALUE || null;

    const tiers = await getPricingTiers();
    const prices = tiers
      .filter((tier) => tier.service_id === service.id)
      .map((tier) => Number(tier.price_dkk))
      .filter((price) => Number.isFinite(price) && price > 0);

    if (prices.length === 0) return DEFAULT_BOOKING_VALUE || null;
    return Math.min(...prices);
  } catch {
    return DEFAULT_BOOKING_VALUE || null;
  }
}

export default async function BookingThankYouPage({
  searchParams,
}: {
  searchParams: { behandling?: string };
}) {
  // The treatment the visitor picked on /book, stashed in cookies there.
  // Planway doesn't pass anything back, so this is how the conversion gets a
  // treatment name and a value in Events Manager.
  const treatmentName = searchParams.behandling || readCookie("sk_booking_service");
  const treatmentSlug = readCookie("sk_booking_slug");
  const bookingValue = await estimateBookingValue(treatmentSlug);

  return (
    <main className="bg-cream min-h-screen">
      <BookingConfirmed treatmentName={treatmentName} value={bookingValue} />

      <section className="container mx-auto px-4 lg:px-8 py-20 lg:py-28 max-w-2xl">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-cognac/10 flex items-center justify-center mx-auto mb-7">
            <Check className="w-8 h-8 text-cognac" />
          </div>
          <span className="eyebrow text-cognac mb-4 block">Booking bekræftet</span>
          <h1 className="font-heading text-4xl md:text-5xl text-textPrimary font-light mb-5">
            Tak for din booking
          </h1>
          <p className="text-lg text-textBody leading-relaxed">
            {treatmentName ? (
              <>
                Din tid til{" "}
                <span className="font-medium text-textPrimary">{treatmentName}</span>{" "}
                er registreret.{" "}
              </>
            ) : (
              <>Din tid er registreret. </>
            )}
            Du modtager en bekræftelse på mail med dato og tidspunkt.
          </p>
        </div>

        {/* Practical info */}
        <div className="glass-cream rounded-2xl p-7 md:p-8 mt-12">
          <h2 className="font-heading text-2xl text-textPrimary font-light mb-5">
            Sådan gør du op til din tid
          </h2>
          <ul className="space-y-4">
            {[
              {
                icon: Calendar,
                title: "Sæt tiden i kalenderen",
                text: "Bekræftelsesmailen indeholder dato og tid. Kan du ikke komme, så giv os besked senest 24 timer før.",
              },
              {
                icon: MapPin,
                title: "Åboulevarden 39, 5. sal th., 8000 Aarhus C",
                text: "Der er offentlig parkering i området. Mød gerne op 5 minutter før din tid.",
              },
              {
                icon: Phone,
                title: "Spørgsmål inden besøget?",
                text: "Ring til os på 61 44 59 99 — vi svarer gerne på alt inden din behandling.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="w-9 h-9 rounded-full bg-cognac/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-cognac" />
                </span>
                <div>
                  <p className="font-medium text-textPrimary text-sm mb-1">{title}</p>
                  <p className="text-textBody text-sm leading-relaxed">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + back */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto text-center px-8 py-3.5 bg-cognac hover:bg-cognac-hover text-white rounded-full text-sm font-medium tracking-wide transition-colors"
          >
            Tilbage til forsiden
          </Link>
          <a
            href="tel:+4561445999"
            className="w-full sm:w-auto text-center px-8 py-3.5 border border-sand hover:border-cognac text-textBody hover:text-cognac rounded-full text-sm font-medium tracking-wide transition-colors"
          >
            Ring til klinikken
          </a>
        </div>

        <p className="text-center text-textMuted text-xs mt-8 flex items-center justify-center gap-1.5">
          <Mail className="w-3.5 h-3.5" />
          Fik du ingen mail? Tjek dit spamfilter, eller ring på 61 44 59 99.
        </p>
      </section>
    </main>
  );
}
