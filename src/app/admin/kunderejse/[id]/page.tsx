import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isCnc } from "@/lib/cnc-access";
import { getJourney } from "@/lib/touchpoints";
import { JourneyTimeline } from "@/components/admin/JourneyTimeline";
import type { Database } from "@/types/supabase";

type Lead = Database["public"]["Tables"]["consultation_leads"]["Row"];

/** Kunderejsen for ét lead. Kun ClicknContent. Se ../page.tsx. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kunderejse",
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

export default async function KunderejseDetaljePage({
  params,
}: {
  params: { id: string };
}) {
  if (!(await isCnc())) notFound();

  const supabase = createClient();
  const { data, error } = await supabase
    .from("consultation_leads")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) notFound();
  const lead = data as Lead;

  const { journey, truncated, visitorId } = await getJourney(
    lead.ft_id ?? null,
    lead.created_at,
  );

  const omraader = Array.isArray(lead.areas) ? (lead.areas as string[]) : [];
  const anbefalinger = Array.isArray(lead.recommendations)
    ? (lead.recommendations as string[])
    : [];

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/kunderejse"
        className="mb-6 inline-flex items-center gap-2 text-sm text-textMuted hover:text-cognac"
      >
        <ArrowLeft className="h-4 w-4" /> Alle kunderejser
      </Link>

      <h1 className="font-heading text-3xl text-textPrimary">{lead.name}</h1>
      <p className="mb-8 text-textBody">
        {lead.phone} · henvendte sig {fmtDato(lead.created_at)}
      </p>

      <section className="mb-8 rounded-xl border border-sand bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-heading text-xl text-textPrimary">Henvendelsen</h2>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Felt navn="Formular" vaerdi={lead.source} />
          <Felt navn="Ønsker" vaerdi={omraader.join(", ") || null} />
          <Felt navn="Anbefalet" vaerdi={anbefalinger.join(", ") || null} />
          <Felt navn="Note" vaerdi={lead.note} />
        </dl>
      </section>

      <section className="mb-8 rounded-xl border border-sand bg-white p-6 shadow-sm">
        <h2 className="mb-1 font-heading text-xl text-textPrimary">Førsteberøring</h2>
        <p className="mb-4 text-sm text-textMuted">
          Den allerførste gang de var her, ikke den sidste. Står fast i 90 dage,
          uanset hvordan de kom tilbage.
        </p>
        {lead.ft_id ? (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Felt navn="Tidspunkt" vaerdi={lead.ft_at ? fmtDato(lead.ft_at) : null} />
            <Felt navn="Landingsside" vaerdi={lead.ft_landing_page} />
            <Felt navn="Kilde" vaerdi={lead.ft_source} />
            <Felt navn="Medie" vaerdi={lead.ft_medium} />
            <Felt navn="Kampagne" vaerdi={lead.ft_campaign} />
            <Felt navn="Annonce" vaerdi={lead.ft_content} />
            <Felt navn="Meta klik-id" vaerdi={lead.ft_fbclid ? "Ja" : null} />
            <Felt navn="Google klik-id" vaerdi={lead.ft_gclid ? "Ja" : null} />
            <Felt navn="Besøgs-id" vaerdi={visitorId} />
          </dl>
        ) : (
          <p className="text-sm text-textMuted">
            Ingen førsteberøring. Leadet er fra før sporingen, eller den
            besøgende sagde nej til cookies.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-heading text-xl text-textPrimary">Rejsen</h2>
        <JourneyTimeline journey={journey} truncated={truncated} />
      </section>
    </div>
  );
}
