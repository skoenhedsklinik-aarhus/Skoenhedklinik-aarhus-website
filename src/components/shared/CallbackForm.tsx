"use client";

import { useState } from "react";
import { Check, Loader2, Phone } from "lucide-react";
import {
  submitConsultationLead,
  type ConsultationLeadResult,
} from "@/lib/actions/consultation";
import { trackPixel } from "@/lib/pixel";

/**
 * Compact 2-field callback lead form ("Ring mig op").
 *
 * Drops the visitor's name + phone into consultation_leads with the treatment
 * as context, and fires a Meta Pixel `Lead` event on success so ad campaigns
 * can optimize toward it.
 */
export function CallbackForm({
  treatmentName,
  source = "callback-form",
  variant = "glass",
}: {
  /** Treatment shown to admin in the lead ("Laser hårfjerning" etc.) */
  treatmentName?: string;
  /** Where on the site the lead came from — sent to the pixel */
  source?: string;
  /** "solid" gives an opaque card — use on dark backgrounds */
  variant?: "glass" | "solid";
}) {
  const cardClass =
    variant === "solid"
      ? "bg-cream rounded-2xl border border-sand shadow-xl"
      : "glass-cream rounded-2xl border border-sand/40 shadow-sm";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    let res: ConsultationLeadResult;
    try {
      res = await submitConsultationLead({
        name,
        phone,
        note: `Ønsker opkald (${source})`,
        areas: [],
        recommendations: treatmentName ? [treatmentName] : [],
      });
    } catch {
      res = { ok: false, error: "Noget gik galt. Prøv igen." };
    }
    setSubmitting(false);
    if (res.ok) {
      trackPixel("Lead", {
        content_name: treatmentName ?? "Konsultation",
        content_category: source,
      });
      setDone(true);
    } else {
      setError(res.error);
    }
  };

  if (done) {
    return (
      <div className={`${cardClass} p-8 text-center`}>
        <div className="w-14 h-14 rounded-full bg-cognac/10 flex items-center justify-center mx-auto mb-5">
          <Check className="w-7 h-7 text-cognac" />
        </div>
        <h3 className="font-heading text-2xl text-textPrimary font-light mb-2">
          Tak, {name.split(" ")[0] || "vi har modtaget din besked"}!
        </h3>
        <p className="text-textBody text-sm leading-relaxed max-w-sm mx-auto">
          Vi ringer dig op hurtigst muligt på <strong>{phone}</strong> — som
          regel samme dag på hverdage.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} p-7 md:p-8`}>
      <div className="flex items-center gap-3 mb-1.5">
        <div className="w-9 h-9 rounded-full bg-cognac/10 flex items-center justify-center shrink-0">
          <Phone className="w-4 h-4 text-cognac" />
        </div>
        <h3 className="font-heading text-2xl text-textPrimary font-light">
          Bliv ringet op — gratis
        </h3>
      </div>
      <p className="text-textMuted text-sm mb-6 leading-relaxed">
        Udfyld navn og nummer, så ringer vi dig op og svarer på alt om{" "}
        {treatmentName ? (
          <span className="text-textBody font-medium">{treatmentName.toLowerCase()}</span>
        ) : (
          "din behandling"
        )}
        . Helt uforpligtende.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-textBody mb-1.5" htmlFor={`cb-name-${source}`}>
            Navn
          </label>
          <input
            id={`cb-name-${source}`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dit navn"
            autoComplete="name"
            className="w-full px-4 py-3 rounded-xl border border-sand bg-white/70 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-cognac transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-textBody mb-1.5" htmlFor={`cb-phone-${source}`}>
            Telefonnummer
          </label>
          <input
            id={`cb-phone-${source}`}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="12 34 56 78"
            autoComplete="tel"
            className="w-full px-4 py-3 rounded-xl border border-sand bg-white/70 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-cognac transition-colors"
          />
        </div>
      </div>

      {error && <p className="text-sm text-sale mt-3">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full mt-5 py-3.5 bg-cognac hover:bg-cognac-hover disabled:opacity-60 text-white rounded-full font-medium text-sm transition-colors flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitting ? "Sender…" : "Ring mig op"}
      </button>
      <p className="text-center text-textMuted text-[11px] mt-3">
        Vi ringer inden for 24 timer på hverdage · Ingen binding
      </p>
    </form>
  );
}
