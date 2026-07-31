"use server";

import { createClient } from "@/lib/supabase/server";
import { sendMetaEvent } from "@/lib/meta/capi";
import { sendLeadNotification } from "@/lib/email/lead-notification";
import type { Attribution } from "@/lib/attribution";

export type ConsultationLeadInput = {
  name: string;
  phone: string;
  /** Human-readable focus areas the user picked, e.g. ["Uønsket hår"] */
  areas: string[];
  /** Recommended treatment names, e.g. ["Laser hårfjerning"] */
  recommendations: string[];
  /** Optional free-text note from the user */
  note?: string;
  /** Which form on the site this came from, e.g. "lp-tattoo-fjernelse". */
  source?: string;
  /**
   * Event id generated in the browser. Passing it here lets the server-side
   * Conversions API `Lead` event deduplicate against the browser pixel event.
   */
  eventId?: string;
  /** Where the visitor came from (fbclid / utm_*), captured on landing. */
  attribution?: Attribution;
  /** Page the form was submitted from — used as the CAPI event source URL. */
  sourceUrl?: string;
};

export type ConsultationLeadResult = { ok: true } | { ok: false; error: string };

/** Trim to a sane column width — ad names can be very long. */
function clip(value: string | undefined | null, max = 255): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

/**
 * Compact "kilde: meta · kampagne: …" line.
 * Used as the fallback when the attribution columns don't exist yet, so no
 * campaign data is ever lost between deploy and migration.
 */
function attributionLine(attr?: Attribution, source?: string): string | null {
  if (!attr && !source) return null;
  const parts: string[] = [];
  if (source) parts.push(`formular: ${source}`);
  if (attr?.utm_source) parts.push(`kilde: ${attr.utm_source}`);
  if (attr?.utm_medium) parts.push(`medie: ${attr.utm_medium}`);
  if (attr?.utm_campaign) parts.push(`kampagne: ${attr.utm_campaign}`);
  if (attr?.utm_content) parts.push(`annonce: ${attr.utm_content}`);
  if (attr?.utm_term) parts.push(`term: ${attr.utm_term}`);
  if (!attr?.utm_source && attr?.fbclid) parts.push("kilde: Meta-annonce (fbclid)");
  if (parts.length <= 1 && attr?.referrer) parts.push(`henvist fra: ${attr.referrer}`);
  if (attr?.landingPage) parts.push(`landingsside: ${attr.landingPage}`);
  return parts.length ? parts.join(" · ") : null;
}

/** Postgres/PostgREST codes for "that column doesn't exist". */
function isMissingColumnError(error: { code?: string; message?: string }): boolean {
  if (error.code === "42703" || error.code === "PGRST204") return true;
  const message = (error.message || "").toLowerCase();
  return (
    message.includes("column") &&
    (message.includes("does not exist") || message.includes("could not find"))
  );
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

  const areas = input.areas.filter(Boolean);
  const recommendations = input.recommendations.filter(Boolean);
  const attr = input.attribution;

  const baseRow = {
    name,
    phone,
    areas,
    recommendations,
  };

  const attributionColumns = {
    source: clip(input.source, 80),
    utm_source: clip(attr?.utm_source, 120),
    utm_medium: clip(attr?.utm_medium, 120),
    utm_campaign: clip(attr?.utm_campaign, 255),
    utm_content: clip(attr?.utm_content, 255),
    utm_term: clip(attr?.utm_term, 255),
    fbclid: clip(attr?.fbclid, 255),
    landing_page: clip(attr?.landingPage, 255),
    referrer: clip(attr?.referrer, 255),
  };

  const failure: ConsultationLeadResult = {
    ok: false,
    error:
      "Vi kunne desværre ikke sende din forespørgsel. Prøv igen, eller ring til os på 61 44 59 99.",
  };

  try {
    const supabase = createClient();

    // Preferred shape: attribution in real columns, note kept clean.
    const { error } = await supabase.from("consultation_leads").insert([
      {
        ...baseRow,
        note: note || null,
        ...attributionColumns,
      } as never,
    ]);

    if (error) {
      // The migration in supabase/migrations/add_lead_attribution.sql hasn't
      // been run yet. Retry without the new columns and keep the campaign data
      // in the note, so a lead is never lost over a missing column.
      if (isMissingColumnError(error)) {
        const fallbackNote =
          [note, attributionLine(attr, input.source)].filter(Boolean).join("\n") || null;

        const { error: retryError } = await supabase
          .from("consultation_leads")
          .insert([{ ...baseRow, note: fallbackNote } as never]);

        if (retryError) {
          console.error("[consultation] Supabase insert error:", retryError);
          return failure;
        }
      } else {
        console.error("[consultation] Supabase insert error:", error);
        return failure;
      }
    }
  } catch (err) {
    console.error("[consultation] Unexpected error:", err);
    return {
      ok: false,
      error:
        "Der opstod en uventet fejl. Prøv igen, eller ring til os på 61 44 59 99.",
    };
  }

  // Mailnotifikation til klinikken. Kører først når leadet er gemt, og en
  // fejl her må aldrig ramme den besøgende — derfor .catch(). Uden
  // RESEND_API_KEY + LEAD_NOTIFICATION_TO er kaldet en no-op.
  await sendLeadNotification({
    name,
    phone,
    areas,
    recommendations,
    note: note || null,
    source: input.source ?? null,
    attribution: attr,
    sourceUrl: input.sourceUrl,
  }).catch(() => false);

  // Server-side Lead event. Runs after the lead is safely stored, and its
  // failure can never affect the visitor. Name and phone are hashed inside
  // sendMetaEvent — raw values never leave the server.
  if (input.eventId) {
    const [firstName, ...rest] = name.split(/\s+/);
    await sendMetaEvent({
      eventName: "Lead",
      eventId: input.eventId,
      eventSourceUrl: input.sourceUrl,
      userData: {
        phone,
        firstName,
        lastName: rest.length ? rest.join(" ") : null,
        country: "dk",
      },
      customData: {
        content_name: recommendations[0] ?? "Konsultation",
        content_category: input.source ?? "lead",
      },
    }).catch(() => false);
  }

  return { ok: true };
}
