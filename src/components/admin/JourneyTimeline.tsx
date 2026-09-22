"use client";

import type { Journey } from "@/lib/journey";

/**
 * Kunderejsen som en tidslinje pr. besøg.
 *
 * Det vigtigste i visningen er skellet: hvad skete FØR henvendelsen, og hvad
 * skete EFTER. Det sidste er det, man kan bruge i opkaldet, så det står
 * øverst og ikke begravet nederst.
 *
 * Klientkomponent, fordi datoerne skal formateres i den besøgendes egen
 * tidszone. Serveren kører UTC, og et besøg klokken 21.40 dansk tid ville
 * ellers stå som 19.40.
 */

function fmt(d: string) {
  return new Date(d).toLocaleString("da-DK", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const VIS_STIER = 12;

export function JourneyTimeline({
  journey,
  truncated,
  /** Hvad skellet i tidslinjen er. En rejse kan ende i en henvendelse eller
   *  i en booking, og teksten skal sige hvilken. */
  anledning = "henvendelsen",
}: {
  journey: Journey;
  truncated: boolean;
  anledning?: "henvendelsen" | "bookingen";
}) {
  const skel = anledning === "bookingen" ? "Bookingen" : "Henvendelsen";
  const tidTil = anledning === "bookingen" ? "Tid til booking" : "Tid til henvendelse";
  if (journey.pageviews === 0) {
    return (
      <p className="text-sm text-textMuted">
        Ingen berøringer registreret. Enten er den fra før sporingen, eller også
        sagde den besøgende nej til cookies.
      </p>
    );
  }

  return (
    <div>
      {/* Det mest brugbare felt først: kom de tilbage efter de skrev? */}
      {journey.sessionsAfterLead > 0 && (
        <p className="mb-5 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-textPrimary">
          <strong>
            Kom tilbage {journey.sessionsAfterLead}{" "}
            {journey.sessionsAfterLead === 1 ? "gang" : "gange"} efter{" "}
            {anledning}
          </strong>{" "}
          ({journey.pageviewsAfterLead}{" "}
          {journey.pageviewsAfterLead === 1 ? "sidevisning" : "sidevisninger"}).
          De er varme. Brug det i opkaldet.
        </p>
      )}

      <dl className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-textMuted">Besøg</dt>
          <dd className="text-xl text-textPrimary">{journey.sessions.length}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-textMuted">
            Sidevisninger
          </dt>
          <dd className="text-xl text-textPrimary">{journey.pageviews}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-textMuted">{tidTil}</dt>
          <dd className="text-xl text-textPrimary">
            {journey.daysToLead === null
              ? "—"
              : journey.daysToLead === 0
                ? "Samme dag"
                : `${journey.daysToLead} ${journey.daysToLead === 1 ? "dag" : "dage"}`}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-textMuted">
            Tilbage bagefter
          </dt>
          <dd className="text-xl text-textPrimary">
            {journey.sessionsAfterLead > 0 ? `Ja, ${journey.sessionsAfterLead}` : "Nej"}
          </dd>
        </div>
      </dl>

      <div className="mb-5 space-y-1 text-sm">
        {journey.firstSource && (
          <p>
            <span className="text-textMuted">Første kilde:</span>{" "}
            <span className="font-medium text-textPrimary">{journey.firstSource}</span>
          </p>
        )}
        {journey.lastSourceBeforeLead &&
          journey.lastSourceBeforeLead !== journey.firstSource && (
            <p>
              <span className="text-textMuted">Sidste kilde før {anledning}:</span>{" "}
              <span className="font-medium text-textPrimary">
                {journey.lastSourceBeforeLead}
              </span>
            </p>
          )}
      </div>

      <ol className="flex flex-col gap-3">
        {journey.sessions.map((s, i) => (
          <li key={`${s.startedAt}-${i}`}>
            {s.afterLead && !journey.sessions[i - 1]?.afterLead && (
              <p className="mb-3 mt-1 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-success">
                <span className="h-px flex-1 bg-success/40" />
                {skel}
                <span className="h-px flex-1 bg-success/40" />
              </p>
            )}
            <div
              className={`rounded-xl border px-4 py-3 ${
                s.afterLead ? "border-success/40 bg-success/5" : "border-sand bg-cream"
              }`}
            >
              <p className="text-sm">
                <span className="text-textMuted">{fmt(s.startedAt)}</span>
                <span className="mx-2 font-medium text-textPrimary">{s.source}</span>
                <span className="text-textMuted">
                  {s.pageviews} {s.pageviews === 1 ? "side" : "sider"}
                  {s.minutes > 0 ? ` · ${s.minutes} min` : ""}
                </span>
              </p>
              <p className="mt-1 break-words text-xs leading-relaxed text-textBody">
                {s.paths.slice(0, VIS_STIER).join(" → ")}
                {s.paths.length > VIS_STIER
                  ? ` → +${s.paths.length - VIS_STIER} flere`
                  : ""}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {journey.topPaths.length > 1 && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-textMuted">
            Mest læste sider
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {journey.topPaths.map((p) => (
              <li key={p.path} className="flex justify-between gap-4">
                <span className="truncate text-textBody">{p.path}</span>
                <span className="shrink-0 font-medium text-textPrimary">{p.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {truncated && (
        <p className="mt-3 text-xs text-textMuted">
          Viser de første {journey.pageviews} berøringer. Der er flere.
        </p>
      )}
    </div>
  );
}
