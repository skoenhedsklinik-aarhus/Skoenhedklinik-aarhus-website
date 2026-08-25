"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CONSENT_EVENT, readConsent, type ConsentValue } from "@/lib/consent";

/**
 * Samtykke til markedsføringscookies.
 *
 * Banneret vises kun, indtil den besøgende har valgt. Valget gemmes i en
 * førsteparts-cookie (`sk_consent`), som både browseren og serveren læser.
 *
 * Indtil der er sagt ja, indlæses Meta Pixel slet ikke, Conversions API kaldes
 * ikke, og hverken cnc_uid, _fbc eller _fbp bliver skrevet. Siger den
 * besøgende nej, ryddes de cookies, vi selv råder over.
 *
 * Plausible er bevidst ikke omfattet: det sætter ingen cookies og gemmer ingen
 * personoplysninger, så det kræver ikke samtykke.
 *
 * Bemærk: bookingmodulet fra Planway ligger i en iframe på /book og har sin
 * egen cookiedialog. Den kan vi ikke styre herfra.
 */

/** fbclid'et fra adressen sendes med, så et annonceklik ikke går tabt,
 *  hvis der først siges ja nogle sider inde på sitet. */
function currentFbclid(): string | undefined {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("fbclid");
    if (fromUrl) return fromUrl;
    const raw = window.sessionStorage.getItem("sk_attribution");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { fbclid?: string };
    return parsed.fbclid;
  } catch {
    return undefined;
  }
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Først efter mount: serveren og browseren skal ikke være uenige om,
    // hvorvidt banneret er der, og cookien findes kun i browseren.
    setVisible(readConsent() === "unknown");
  }, []);

  const choose = useCallback(async (value: ConsentValue) => {
    setBusy(true);
    try {
      // Serveren sætter cookien, ikke document.cookie. Safari ITP skærer
      // ellers levetiden ned til 7 dage, og så ville både samtykket og
      // annonce-id'erne være væk længe før tid.
      await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, fbclid: currentFbclid() }),
      });
    } catch {
      // Netværksfejl må ikke låse siden. Banneret bliver stående og kan
      // prøves igen ved næste sidevisning.
    } finally {
      setBusy(false);
      setVisible(false);
      // Fortæl <MetaPixel /> og resten af siden, at valget er truffet, så
      // pixlen kan indlæses uden at den besøgende skal genindlæse siden.
      window.dispatchEvent(new Event(CONSENT_EVENT));
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Samtykke til cookies"
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-5 sm:pb-5"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-sand bg-cream/95 backdrop-blur-sm shadow-lg p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex-1">
            <p className="font-heading text-lg text-textPrimary font-light mb-1.5">
              Vi bruger cookies til markedsføring
            </p>
            <p className="text-sm text-textBody leading-relaxed">
              Vi måler, hvilke annoncer der fører til en booking, så vi ikke
              spilder penge på dem, der ikke gør. Siger du nej, virker sitet
              præcis som før.{" "}
              <Link
                href="/cookies-og-privatlivspolitik"
                className="text-cognac underline underline-offset-2 hover:text-cognac-hover"
              >
                Læs mere
              </Link>
              .
            </p>
          </div>

          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={() => choose("denied")}
              disabled={busy}
              className="flex-1 sm:flex-none px-6 py-3 rounded-full border border-sand text-textBody hover:border-cognac hover:text-cognac text-sm font-medium tracking-wide transition-colors disabled:opacity-60"
            >
              Nej tak
            </button>
            <button
              type="button"
              onClick={() => choose("granted")}
              disabled={busy}
              className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-cognac hover:bg-cognac-hover text-white text-sm font-medium tracking-wide transition-colors disabled:opacity-60"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
