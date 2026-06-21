"use server";

import { createClient } from "@/lib/supabase/server";

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

  try {
    const supabase = createClient();
    const { error } = await supabase.from("consultation_leads").insert([
      {
        name,
        phone,
        note: note || null,
        areas,
        recommendations,
      } as never,
    ]);

    if (error) {
      console.error("[consultation] Supabase insert error:", error);
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
