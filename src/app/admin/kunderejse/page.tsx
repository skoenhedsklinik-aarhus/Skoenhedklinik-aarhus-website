import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isCnc } from "@/lib/cnc-access";
import { getJourneys } from "@/lib/touchpoints";
import { getBookings, getRecentBookings, type BookingRow } from "@/lib/bookings";
import type { Journey } from "@/lib/journey";
import type { Database } from "@/types/supabase";

type Lead = Database["public"]["Tables"]["consultation_leads"]["Row"];

/**
 * Kunderejse: henvendelser og bookinger med den vej, der førte til dem.
 * Kun ClicknContent.
 *
 * Siden svarer 404 til alle uden rollen, også til klinikkens egen indloggede
 * bruger, så dens eksistens ikke afsløres. Håndhævet både her og i RLS på
 * touchpoints og bookings. Se src/lib/cnc-access.ts.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kunderejse",
  robots: { index: false, follow: false, nocache: true },
};

const LEAD_LIMIT = 200;
const BOOKING_LIMIT = 200;

function fmtDato(iso: string): string {
  // Fast tidszone: serveren kører UTC, og noget fra kl. 21.40 dansk tid må
  // ikke stå som 19.40 på listen.
  return new Date(iso).toLocaleString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Copenhagen",
  });
}

function Dage({ journey }: { journey?: Journey }) {
  if (!journey || journey.daysToLead === null) return <span className="text-textMuted">—</span>;
  return <>{journey.daysToLead === 0 ? "Samme dag" : journey.daysToLead}</>;
}

function Tilbage({ journey }: { journey?: Journey }) {
  if (!journey || journey.sessionsAfterLead === 0) {
    return <span className="text-textMuted">—</span>;
  }
  return (
    <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-textPrimary">
      Ja, {journey.sessionsAfterLead} {journey.sessionsAfterLead === 1 ? "gang" : "gange"}
    </span>
  );
}

export default async function KunderejsePage() {
  if (!(await isCnc())) notFound();

  const supabase = createClient();
  const { data, error } = await supabase
    .from("consultation_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(LEAD_LIMIT);

  const leads = (error ? [] : (data ?? [])) as Lead[];
  const bookinger = await getRecentBookings(BOOKING_LIMIT);

  // Bookinger fra en, der også har skrevet til os, hører hjemme på leadet.
  // Resten får deres egen liste, ellers ville de være usynlige: man kan booke
  // direkte uden nogensinde at udfylde formularen.
  const leadVisitorIds = new Set(leads.map((l) => l.ft_id).filter(Boolean) as string[]);
  const loeseBookinger = bookinger.filter((b) => !leadVisitorIds.has(b.visitor_id));

  // Ét opslag til begge lister. For et lead brydes rejsen ved henvendelsen,
  // for en løs booking ved bookingen: "efter" betyder det samme begge steder.
  const rejser = await getJourneys([
    ...leads.map((l) => ({ ft_id: l.ft_id, created_at: l.created_at })),
    ...loeseBookinger.map((b) => ({ ft_id: b.visitor_id, created_at: b.occurred_at })),
  ]);

  const bookingerPrBesoeg = await getBookings(Array.from(leadVisitorIds));

  const medRejse = leads.filter((l) => l.ft_id && rejser.has(l.ft_id)).length;
  const leadsMedBooking = leads.filter(
    (l) => l.ft_id && (bookingerPrBesoeg.get(l.ft_id)?.length ?? 0) > 0,
  ).length;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-3xl text-textPrimary">Kunderejse</h1>
        <span className="text-sm text-textMuted">
          {medRejse} af {leads.length} henvendelser med rejse · {bookinger.length}{" "}
          {bookinger.length === 1 ? "booking" : "bookinger"}
        </span>
      </div>

      <p className="mb-8 max-w-2xl text-textBody">
        Hvilken kanal bragte dem, hvad læste de før de skrev eller bookede, hvor
        lang tid der gik, og om de kom tilbage bagefter. Kun synlig for
        ClicknContent.
      </p>

      <h2 className="mb-3 font-heading text-xl text-textPrimary">
        Henvendelser
        {leadsMedBooking > 0 && (
          <span className="ml-2 text-sm font-normal text-textMuted">
            {leadsMedBooking} af dem har booket en tid
          </span>
        )}
      </h2>

      <div className="mb-12 overflow-hidden rounded-xl border border-sand bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-beige text-left text-xs uppercase tracking-wide text-textMuted">
            <tr>
              <th className="px-4 py-3 font-medium">Henvendelse</th>
              <th className="px-4 py-3 font-medium">Første kilde</th>
              <th className="px-4 py-3 font-medium">Besøg</th>
              <th className="px-4 py-3 font-medium">Dage</th>
              <th className="px-4 py-3 font-medium">Booket</th>
              <th className="px-4 py-3 font-medium">Tilbage bagefter</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-textMuted">
                  Ingen henvendelser endnu.
                </td>
              </tr>
            )}
            {leads.map((lead) => {
              const rejse = lead.ft_id ? rejser.get(lead.ft_id) : undefined;
              const booket = lead.ft_id ? bookingerPrBesoeg.get(lead.ft_id) : undefined;
              return (
                <tr key={lead.id} className="border-t border-sand align-top">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/kunderejse/${lead.id}`}
                      className="font-medium text-cognac hover:underline"
                    >
                      {lead.name}
                    </Link>
                    <div className="text-xs text-textMuted">{fmtDato(lead.created_at)}</div>
                  </td>
                  <td className="px-4 py-3 text-textBody">
                    {rejse?.firstSource ?? lead.ft_source ?? lead.utm_source ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-textBody">
                    {rejse ? `${rejse.sessions.length} · ${rejse.pageviews} sider` : "—"}
                  </td>
                  <td className="px-4 py-3 text-textBody">
                    <Dage journey={rejse} />
                  </td>
                  <td className="px-4 py-3">
                    {booket && booket.length > 0 ? (
                      <span className="rounded-full bg-cognac/15 px-2.5 py-1 text-xs font-medium text-cognac">
                        {booket.length > 1 ? `${booket.length} tider` : "Ja"}
                      </span>
                    ) : (
                      <span className="text-textMuted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Tilbage journey={rejse} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mb-1 font-heading text-xl text-textPrimary">
        Bookinger uden en henvendelse
      </h2>
      <p className="mb-3 max-w-2xl text-sm text-textMuted">
        Folk der bookede direkte uden at udfylde formularen. Planways kvittering
        er helt bar, så vi har hverken navn eller telefonnummer på dem. Klinikken
        har begge dele i Planway, og tidspunktet her passer med deres kalender.
      </p>

      <div className="overflow-hidden rounded-xl border border-sand bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-beige text-left text-xs uppercase tracking-wide text-textMuted">
            <tr>
              <th className="px-4 py-3 font-medium">Booket</th>
              <th className="px-4 py-3 font-medium">Behandling</th>
              <th className="px-4 py-3 font-medium">Første kilde</th>
              <th className="px-4 py-3 font-medium">Besøg</th>
              <th className="px-4 py-3 font-medium">Dage</th>
              <th className="px-4 py-3 font-medium">Tilbage bagefter</th>
            </tr>
          </thead>
          <tbody>
            {loeseBookinger.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-textMuted">
                  Ingen bookinger uden en henvendelse endnu.
                </td>
              </tr>
            )}
            {loeseBookinger.map((booking: BookingRow) => {
              const rejse = rejser.get(booking.visitor_id);
              return (
                <tr key={booking.id} className="border-t border-sand align-top">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/kunderejse/booking/${booking.id}`}
                      className="font-medium text-cognac hover:underline"
                    >
                      {fmtDato(booking.occurred_at)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-textBody">{booking.treatment ?? "—"}</td>
                  <td className="px-4 py-3 text-textBody">{rejse?.firstSource ?? "—"}</td>
                  <td className="px-4 py-3 text-textBody">
                    {rejse ? `${rejse.sessions.length} · ${rejse.pageviews} sider` : "—"}
                  </td>
                  <td className="px-4 py-3 text-textBody">
                    <Dage journey={rejse} />
                  </td>
                  <td className="px-4 py-3">
                    <Tilbage journey={rejse} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
