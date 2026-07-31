import { Resend } from "resend";
import type { Attribution } from "@/lib/attribution";

/**
 * Mailnotifikation til klinikken, hver gang der kommer en ny henvendelse.
 *
 * Hvorfor: leads lander i `consultation_leads` og vises under Admin →
 * Henvendelser, men ingen opdager dem, før nogen husker at logge ind. En kunde,
 * der udfylder formularen kl. 14, skal ringes op samme dag, ikke tre dage efter.
 *
 * Påkrævet env (Vercel → Environment Variables):
 * - RESEND_API_KEY        oprettes på resend.com/api-keys
 * - LEAD_NOTIFICATION_TO  modtager(e), komma-separeret ved flere
 * Valgfri:
 * - RESEND_FROM           afsender, skal ligge på et verificeret domæne.
 *                         Standard: "Skønhedsklinik Aarhus <henvendelser@skoenhedsklinik-aarhus.dk>"
 *
 * Uden API-nøgle eller modtager er hvert kald her en no-op, så formularen
 * fungerer uændret, indtil nøglen er sat.
 */

const DEFAULT_FROM =
  "Skønhedsklinik Aarhus <henvendelser@skoenhedsklinik-aarhus.dk>";

export type LeadNotificationInput = {
  name: string;
  phone: string;
  areas: string[];
  recommendations: string[];
  note?: string | null;
  /** Hvilken formular på sitet leadet kom fra, f.eks. "forside-guide". */
  source?: string | null;
  attribution?: Attribution;
  /** Siden formularen blev sendt fra. */
  sourceUrl?: string;
};

/** HTML-escape, så et navn med `<` ikke ødelægger mailen. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** `+45 61 44 59 99` → `+4561445999`, så tel:-linket virker i mobilklienter. */
function telHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned.startsWith("+") ? cleaned : `+45${cleaned.replace(/^45/, "")}`;
}

/** Læsbar dansk tidsstempel i klinikkens tidszone. */
function timestamp(): string {
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Copenhagen",
  }).format(new Date());
}

/** Hvor kom besøgende fra? Tom liste, hvis der intet er at vise. */
function attributionRows(
  attr: Attribution | undefined,
  source: string | null | undefined,
): Array<[string, string]> {
  const rows: Array<[string, string]> = [];
  if (source) rows.push(["Formular", source]);
  if (attr?.utm_source) rows.push(["Kilde", attr.utm_source]);
  else if (attr?.fbclid) rows.push(["Kilde", "Meta-annonce (fbclid)"]);
  if (attr?.utm_medium) rows.push(["Medie", attr.utm_medium]);
  if (attr?.utm_campaign) rows.push(["Kampagne", attr.utm_campaign]);
  if (attr?.utm_content) rows.push(["Annonce", attr.utm_content]);
  if (attr?.utm_term) rows.push(["Søgeord", attr.utm_term]);
  if (attr?.referrer) rows.push(["Henvist fra", attr.referrer]);
  if (attr?.landingPage) rows.push(["Landingsside", attr.landingPage]);
  return rows;
}

function row(label: string, valueHtml: string): string {
  return `<tr>
    <td style="padding:8px 16px 8px 0;color:#8a7f76;font-size:14px;white-space:nowrap;vertical-align:top;">${esc(label)}</td>
    <td style="padding:8px 0;color:#2b2521;font-size:15px;vertical-align:top;">${valueHtml}</td>
  </tr>`;
}

function buildHtml(input: LeadNotificationInput, adminUrl: string): string {
  const areas = input.areas.filter(Boolean);
  const recommendations = input.recommendations.filter(Boolean);
  const note = (input.note || "").trim();
  const attr = attributionRows(input.attribution, input.source);

  const detailRows = [
    row("Navn", `<strong>${esc(input.name)}</strong>`),
    row(
      "Telefon",
      `<a href="tel:${esc(telHref(input.phone))}" style="color:#9a6a4a;font-weight:600;text-decoration:none;">${esc(input.phone)}</a>`,
    ),
    areas.length ? row("Ønsker hjælp til", esc(areas.join(", "))) : "",
    recommendations.length ? row("Behandling", esc(recommendations.join(", "))) : "",
    note ? row("Besked", esc(note).replace(/\n/g, "<br>")) : "",
    row("Modtaget", esc(timestamp())),
  ]
    .filter(Boolean)
    .join("");

  const attrBlock = attr.length
    ? `<p style="margin:28px 0 8px;color:#8a7f76;font-size:13px;text-transform:uppercase;letter-spacing:.06em;">Hvor kom hun fra</p>
       <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
         ${attr.map(([label, value]) => row(label, esc(value))).join("")}
       </table>`
    : "";

  return `<!doctype html>
<html lang="da">
<body style="margin:0;padding:24px;background:#f6f2ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;width:100%;background:#ffffff;border-radius:12px;">
    <tr><td style="padding:32px;">
      <p style="margin:0 0 4px;color:#8a7f76;font-size:13px;text-transform:uppercase;letter-spacing:.08em;">Ny henvendelse</p>
      <h1 style="margin:0 0 24px;color:#2b2521;font-size:22px;font-weight:600;">${esc(input.name)} vil kontaktes</h1>

      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        ${detailRows}
      </table>

      <p style="margin:28px 0 0;">
        <a href="tel:${esc(telHref(input.phone))}" style="display:inline-block;padding:12px 22px;background:#9a6a4a;color:#ffffff;font-size:15px;font-weight:600;border-radius:8px;text-decoration:none;">Ring til ${esc(input.name.split(/\s+/)[0])}</a>
      </p>

      ${attrBlock}

      <p style="margin:28px 0 0;padding-top:20px;border-top:1px solid #ece5de;color:#8a7f76;font-size:13px;">
        Se alle henvendelser i <a href="${esc(adminUrl)}" style="color:#9a6a4a;">admin</a>.
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildText(input: LeadNotificationInput, adminUrl: string): string {
  const lines = [
    `Ny henvendelse fra ${input.name}`,
    "",
    `Telefon: ${input.phone}`,
  ];
  const areas = input.areas.filter(Boolean);
  const recommendations = input.recommendations.filter(Boolean);
  if (areas.length) lines.push(`Ønsker hjælp til: ${areas.join(", ")}`);
  if (recommendations.length) lines.push(`Behandling: ${recommendations.join(", ")}`);
  if ((input.note || "").trim()) lines.push(`Besked: ${input.note!.trim()}`);
  lines.push(`Modtaget: ${timestamp()}`);

  const attr = attributionRows(input.attribution, input.source);
  if (attr.length) {
    lines.push("", "Hvor kom hun fra:");
    attr.forEach(([label, value]) => lines.push(`  ${label}: ${value}`));
  }
  lines.push("", `Alle henvendelser: ${adminUrl}`);
  return lines.join("\n");
}

/**
 * Sender notifikationen. Returnerer `false` i stedet for at kaste, så en
 * mailfejl aldrig kan vælte indsendelsen af et lead.
 */
export async function sendLeadNotification(
  input: LeadNotificationInput,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.LEAD_NOTIFICATION_TO || "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  if (!apiKey || to.length === 0) return false;

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://skoenhedsklinik-aarhus.dk"
  ).replace(/\/$/, "");
  const adminUrl = `${siteUrl}/admin/henvendelser`;

  const firstRecommendation = input.recommendations.filter(Boolean)[0];
  const subject = firstRecommendation
    ? `Ny henvendelse: ${input.name} — ${firstRecommendation}`
    : `Ny henvendelse: ${input.name}`;

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: process.env.RESEND_FROM || DEFAULT_FROM,
      to,
      subject,
      html: buildHtml(input, adminUrl),
      text: buildText(input, adminUrl),
    });

    if (error) {
      console.error("[lead-notification] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[lead-notification] Unexpected error:", err);
    return false;
  }
}
