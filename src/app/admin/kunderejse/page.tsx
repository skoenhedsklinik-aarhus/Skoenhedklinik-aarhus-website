import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isCnc } from "@/lib/cnc-access";
import { getJourneys } from "@/lib/touchpoints";
import type { Database } from "@/types/supabase";

type Lead = Database["public"]["Tables"]["consultation_leads"]["Row"];

/**
 * Kunderejse: leads med deres vej gennem sitet. Kun ClicknContent.
 *
 * Siden svarer 404 til alle uden rollen, også til klinikkens egen indloggede
 * bruger, så dens eksistens ikke afsløres. Håndhævet både her og i RLS på
 * touchpoints. Se src/lib/cnc-access.ts.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kunderejse",
  robots: { index: false, follow: false, nocache: true },
};

const LEAD_LIMIT = 200;

function fmtDato(iso: string): string {
  // Fast tidszone: serveren kører UTC, og et lead fra kl. 21.40 dansk tid må
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

export default async function KunderejsePage() {
  if (!(await isCnc())) notFound();

  const supabase = createClient();
  const { data, error } = await supabase
    .from("consultation_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(LEAD_LIMIT);

  const leads = (error ? [] : (data ?? [])) as Lead[];
  const rejser = await getJourneys(
    leads.map((l) => ({ ft_id: l.ft_id, created_at: l.created_at })),
  );

  const medRejse = leads.filter((l) => l.ft_id && rejser.has(l.ft_id)).length;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-3xl text-textPrimary">Kunderejse</h1>
        <span className="text-sm text-textMuted">
          {medRejse} af {leads.length} med registreret rejse
        </span>
      </div>

      <p className="mb-6 max-w-2xl text-textBody">
        Hvilken kanal bragte dem, hvad læste de før de skrev, hvor lang tid der
        gik, og om de kom tilbage bagefter. Kun synlig for ClicknContent.
      </p>

      <div className="overflow-hidden rounded-xl border border-sand bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-beige text-left text-xs uppercase tracking-wide text-textMuted">
            <tr>
              <th className="px-4 py-3 font-medium">Henvendelse</th>
              <th className="px-4 py-3 font-medium">Første kilde</th>
              <th className="px-4 py-3 font-medium">Besøg</th>
              <th className="px-4 py-3 font-medium">Dage</th>
              <th className="px-4 py-3 font-medium">Tilbage bagefter</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-textMuted">
                  Ingen henvendelser endnu.
                </td>
              </tr>
            )}
            {leads.map((lead) => {
              const rejse = lead.ft_id ? rejser.get(lead.ft_id) : undefined;
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
                    {rejse?.daysToLead === undefined || rejse?.daysToLead === null
                      ? "—"
                      : rejse.daysToLead === 0
                        ? "Samme dag"
                        : rejse.daysToLead}
                  </td>
                  <td className="px-4 py-3">
                    {rejse && rejse.sessionsAfterLead > 0 ? (
                      <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-textPrimary">
                        Ja, {rejse.sessionsAfterLead}{" "}
                        {rejse.sessionsAfterLead === 1 ? "gang" : "gange"}
                      </span>
                    ) : (
                      <span className="text-textMuted">—</span>
                    )}
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
