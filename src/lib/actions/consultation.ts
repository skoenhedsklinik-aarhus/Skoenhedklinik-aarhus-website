"use server";

import { Resend } from "resend";

export type ConsultationLeadInput = {
  name: string;
  phone: string;
  /** Human-readable focus areas the user picked, e.g. ["Uønsket hår"] */
  areas: string[];
  /** Recommended treatment names, e.g. ["Laser hårfjerning"] */
  recommendations: string[];
  /** Optional free-text note from the user */
  note?: string;
};

export type ConsultationLeadResult = { ok: true } | { ok: false; error: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function submitConsultationLead(
  input: ConsultationLeadInput,
): Promise<ConsultationLeadResult> {
  const name = (input.name || "").trim();
  const phone = (input.phone || "").trim();
  const note = (input.note || "").trim();

  if (!name) return { ok: false, error: "Udfyld venligst dit navn." };
  if (phone.replace(/\D/g, "").length < 8) {
    return { ok: false, error: "Indtast venligst et gyldigt telefonnummer." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONSULTATION_EMAIL_TO;
  // Resend's shared sender works out of the box; swap for a verified domain in prod.
  const from =
    process.env.CONSULTATION_EMAIL_FROM ||
    "Skønhedsklinik Aarhus <onboarding@resend.dev>";

  if (!apiKey || !to) {
    // Misconfiguration shouldn't crash the page — surface a graceful fallback.
    console.error(
      "[consultation] Missing RESEND_API_KEY or CONSULTATION_EMAIL_TO env var",
    );
    return {
      ok: false,
      error:
        "Vi kunne desværre ikke sende din forespørgsel lige nu. Ring til os på 61 44 59 99, så hjælper vi dig.",
    };
  }

  const areas = input.areas.filter(Boolean).map(escapeHtml).join(", ") || "—";
  const recs =
    input.recommendations.filter(Boolean).map(escapeHtml).join(", ") || "—";

  const html = `
    <div style="font-family: Arial, sans-serif; color:#2C1F18; line-height:1.6;">
      <h2 style="color:#6B4F35; margin:0 0 16px;">Ny telefonkonsultation</h2>
      <p>En kunde ønsker at blive ringet op efter at have gennemført behandlingsguiden:</p>
      <table style="border-collapse:collapse; margin-top:8px;">
        <tr><td style="padding:4px 12px 4px 0;"><strong>Navn</strong></td><td>${escapeHtml(name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;"><strong>Telefon</strong></td><td>${escapeHtml(phone)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;"><strong>Fokusområder</strong></td><td>${areas}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;"><strong>Anbefalet</strong></td><td>${recs}</td></tr>
      </table>
      ${note ? `<p style="margin-top:16px;"><strong>Besked:</strong><br/>${escapeHtml(note)}</p>` : ""}
    </div>
  `;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `Ny telefonkonsultation – ${name}`,
      html,
      replyTo: undefined,
    });
    if (error) {
      console.error("[consultation] Resend error:", error);
      return {
        ok: false,
        error:
          "Vi kunne desværre ikke sende din forespørgsel. Prøv igen, eller ring til os på 61 44 59 99.",
      };
    }
    return { ok: true };
  } catch (err) {
    console.error("[consultation] Unexpected error:", err);
    return {
      ok: false,
      error:
        "Der opstod en uventet fejl. Prøv igen, eller ring til os på 61 44 59 99.",
    };
  }
}
