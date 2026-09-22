import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isCnc } from "@/lib/cnc-access";
import { getJourney } from "@/lib/touchpoints";
import { JourneyTimeline } from "@/components/admin/JourneyTimeline";
import type { BookingRow } from "@/lib/bookings";
import type { Database } from "@/types/supabase";

type Lead = Database["public"]["Tables"]["consultation_leads"]["Row"];

/**
 * Rejsen frem til én booking. Kun ClicknContent. Se ../../page.tsx.
 *
 * Skellet i tidslinjen ligger ved bookingen her, ikke ved en henvendelse:
 * "efter" betyder efter de bookede.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking",
  robots: { index: false, follow: false, nocache: true },
};

function fmtDato(iso: string): string {
  return new Date(iso).toLocaleString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Copenhagen",
  });
}

function Felt({ navn, vaerdi }: { navn: string; vaerdi: string | null | undefined }) {
  if (!vaerdi) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-textMuted">{navn}</dt>
      <dd className="break-words text-sm text-textPrimary">{vaerdi}</dd>
    </div>
  );
}

export default async function BookingDetaljePage({ params }: { params: { id: string } }) {
  if (!(await isCnc())) notFound();

  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) notFound();
  const booking = data as BookingRow;

  const { journey, truncated } = await getJourney(booking.visitor_id, booking.occurred_at);

  // Har den samme besøgende også skrevet til os, hører de to ting sammen.
  const { data: leadData } = await supabase
    .from("consultation_leads")
    .select("*")
    .eq("ft_id", booking.visitor_id)
    .order("created_at", { ascending: true })
    .limit(1);
  const lead = ((leadData ?? [])[0] ?? null) as Lead | null;

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/kunderejse"
        className="mb-6 inline-flex items-center gap-2 text-sm text-textMuted hover:text-cognac"
      >
        <ArrowLeft className="h-4 w-4" /> Alle kunderejser
      </Link>

      <h1 className="font-heading text-3xl text-textPrimary">
        {booking.treatment ?? "Booking"}
      </h1>
      <p className="mb-8 text-textBody">Booket {fmtDato(booking.occurred_at)}</p>

      <section className="mb-8 rounded-xl border border-sand bg-white p-6 shadow-sm">
        <h2 className="mb-1 font-heading text-xl text-textPrimary">Bookingen</h2>
        <p className="mb-4 text-sm text-textMuted">
          Registreret på kvitteringssiden efter Planway. Navn, tidspunkt for selve
          behandlingen og kontaktoplysninger står i Planway, ikke her.
        </p>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Felt navn="Behandling" vaerdi={booking.treatment} />
          <Felt
            navn="Anslået værdi"
            vaerdi={booking.value_dkk ? `${Math.round(Number(booking.value_dkk))} kr.` : null}
          />
          <Felt navn="Meta event-id" vaerdi={booking.event_id} />
          <Felt navn="Besøgs-id" vaerdi={booking.visitor_id} />
        </dl>

        {lead && (
          <p className="mt-4 rounded-lg border border-cognac/30 bg-cognac/5 px-4 py-3 text-sm">
            Samme besøgende skrev også til os:{" "}
            <Link
              href={`/admin/kunderejse/${lead.id}`}
              className="font-medium text-cognac hover:underline"
            >
              {lead.name}
            </Link>{" "}
            <span className="text-textMuted">({fmtDato(lead.created_at)})</span>
          </p>
        )}
      </section>

      <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
        <h2 className="mb-1 font-heading text-xl text-textPrimary">Vejen til bookingen</h2>
        <p className="mb-4 text-sm text-textMuted">
          Skellet i tidslinjen ligger ved bookingen.
        </p>
        <JourneyTimeline journey={journey} truncated={truncated} anledning="bookingen" />
      </section>
    </div>
  );
}
