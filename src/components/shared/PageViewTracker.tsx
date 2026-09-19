"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CONSENT_EVENT, hasMarketingConsent } from "@/lib/consent";
import { stashedLanding } from "@/lib/landing";

/**
 * Sender én sidevisning pr. rute til /api/pageview, så adminsiden kan vise
 * hele kunderejsen og ikke kun første kilde.
 *
 * Kun med markedsføringssamtykke, og aldrig blokerende: sendBeacon lader
 * navigationen fortsætte med det samme.
 *
 * Besøgs-id'et kender klienten ikke. Det står i sk_ft-cookien, som er
 * HttpOnly, og serveren læser det selv. Komponenten har ingen state og tegner
 * ingenting.
 */

const PAGEVIEW = "/api/pageview";
const FIRST_TOUCH = "/api/first-touch";
const RETRY_MS = 2000;

/**
 * Sender via sendBeacon (svaret er uinteressant) og falder tilbage til fetch
 * med keepalive. Returnerer true, når serveren bekræftede, at sidevisningen
 * blev gemt, og null når svaret ikke kunne læses (sendBeacon giver intet
 * svar).
 */
async function send(body: string, venterPaaSvar: boolean): Promise<boolean | null> {
  if (!venterPaaSvar) {
    try {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon?.(PAGEVIEW, blob)) return null;
    } catch {
      // sendBeacon utilgængelig eller afvist: falder tilbage til fetch.
    }
  }
  try {
    const res = await fetch(PAGEVIEW, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.logged === true;
  } catch {
    // Ingen logning, ingen fejl til den besøgende.
    return null;
  }
}

/**
 * Beder serveren sætte førsteberøringscookien. Idempotent: findes cookien,
 * rører endepunktet den ikke. Kaldes kun, når serveren har sagt, at den ikke
 * kunne logge — altså når cookien enten er undervejs eller er udløbet efter
 * 90 dage, mens samtykket varer et år.
 */
async function ensureFirstTouch() {
  try {
    await fetch(FIRST_TOUCH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stashedLanding()),
      keepalive: true,
    });
  } catch {
    // Ingen førsteberøring, ingen krasch.
  }
}

export function PageViewTracker() {
  const pathname = usePathname();
  // Samme sti sendes ikke to gange. Fanger både genmontering (React strict
  // mode i udvikling) og et ruteskift, der ender på den samme sti.
  const sidstSendt = useRef<string | null>(null);
  const harPrøvetIgen = useRef(false);

  useEffect(() => {
    if (!pathname) return;

    const nuvaerende = () => window.location.pathname + window.location.search;

    const log = async (venterPaaSvar: boolean) => {
      if (!hasMarketingConsent()) return;
      const noegle = nuvaerende();
      if (sidstSendt.current === noegle) return;
      sidstSendt.current = noegle;

      const body = JSON.stringify({ path: noegle, referrer: document.referrer });
      const logget = await send(body, venterPaaSvar);

      // Lige efter "Accepter" kan sk_ft-cookien stadig være undervejs.
      // Serveren svarer logged: false, og vi prøver netop denne ene gang igen.
      if (logget === false && !harPrøvetIgen.current) {
        harPrøvetIgen.current = true;
        sidstSendt.current = null;
        await ensureFirstTouch();
        setTimeout(() => {
          if (sidstSendt.current === null) void log(true);
        }, RETRY_MS);
      }
    };

    void log(false);

    // Det første samtykke sker uden et ruteskift, så effekten ovenfor er
    // allerede kørt. Banneret melder selv, når valget er truffet.
    const onConsent = () => void log(true);
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, [pathname]);

  return null;
}
