"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { CONSENT_EVENT, readConsent } from "@/lib/consent";

/**
 * Pop-up med laserpakkerne. Slås til og fra under Indstillinger i admin
 * (site_settings.laser_popup_enabled), så det kræver ingen ny deploy.
 *
 * Slået fra kan den stadig ses med ?vis=laserpakker i adressen. Det er til at
 * vise klinikken designet, før den går live. Almindelige besøgende ser intet.
 *
 * Den venter, til cookiebanneret er besvaret. Ellers ligger de to oven i
 * hinanden i bunden af skærmen på mobil.
 */

/** Giv den besøgende tid til at se, hvor de er landet, før pop-up'en kommer. */
const FORSINKELSE_MS = 4000;

const STORAGE_KEY = "ska-laserpakker-lukket";

/** Ankeret sidder på underoverskriften "Pakker" under laser på /priser. */
const PRISER_URL = "/priser#haarfjerning-pakker";

/**
 * Kun fra sm og op; på mobil ville den gøre pop-up'en skærmhøj. Allerede en lille
 * AVIF. Den hentes under ventetiden, så den er klar, når pop-up'en åbner.
 */
const BILLEDE = "/images/services/laser-haarfjerning-2.avif";

export type LaserPakke = { id: string; navn: string; pris: number };

/**
 * Pop-up'en må ikke dække målet selv eller bookingflowet. Andre behandlinger
 * springes også over: kommer man fra en annonce for tandblegning, skal den
 * side ikke dækkes af et lasertilbud.
 */
function passerTilSiden(pathname: string): boolean {
  if (["/priser", "/book", "/tak"].some((p) => pathname.startsWith(p))) return false;
  if (pathname.startsWith("/behandlinger/")) {
    return pathname === "/behandlinger/laser-haarfjerning";
  }
  return true;
}

function kroner(pris: number): string {
  return `${pris.toLocaleString("da-DK")} kr.`;
}

export function LaserPackagesPopup({
  pakker,
  aktiv,
}: {
  pakker: LaserPakke[];
  aktiv: boolean;
}) {
  const pathname = usePathname();
  const [aaben, setAaben] = useState(false);
  const [lukket, setLukket] = useState(false);
  const [samtykkeBesvaret, setSamtykkeBesvaret] = useState(false);
  const [forhaandsvisning, setForhaandsvisning] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Adressen og cookien findes kun i browseren, så de læses først efter mount.
  useEffect(() => {
    setForhaandsvisning(
      new URLSearchParams(window.location.search).get("vis") === "laserpakker",
    );
    setSamtykkeBesvaret(readConsent() !== "unknown");

    // Hændelsen kommer, når banneret er lukket, uanset svar.
    const onConsent = () => setSamtykkeBesvaret(true);
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  const close = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Privat browsing kan blokere sessionStorage. Så kommer pop-up'en igen
      // ved næste sidevisning, men den må aldrig crashe siden.
    }
    setLukket(true);
    setAaben(false);
  }, []);

  useEffect(() => {
    if (aaben || lukket || !samtykkeBesvaret) return;

    if (!forhaandsvisning) {
      if (!aktiv || !passerTilSiden(pathname)) return;
      try {
        if (sessionStorage.getItem(STORAGE_KEY)) return;
      } catch {
        // Ingen storage: vis pop-up'en alligevel.
      }
    }

    if (window.matchMedia("(min-width: 640px)").matches) new window.Image().src = BILLEDE;
    const timer = window.setTimeout(
      () => setAaben(true),
      forhaandsvisning ? 600 : FORSINKELSE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [aaben, lukket, samtykkeBesvaret, forhaandsvisning, aktiv, pathname]);

  // Escape lukker, Tab holdes inde i dialogen, og siden bag må ikke scrolle.
  useEffect(() => {
    if (!aaben) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [aaben, close]);

  if (!aaben) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="absolute inset-0 bg-noir/50 backdrop-blur-sm animate-fade-in"
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="laserpakker-titel"
        className="relative w-full max-w-md sm:max-w-3xl sm:grid sm:grid-cols-[5fr_7fr] max-h-[calc(100dvh-2rem)] overflow-y-auto bg-cream border border-sand rounded-3xl shadow-[0_24px_80px_rgba(26,26,26,0.35)] animate-slide-up"
      >
        <div className="relative hidden sm:block">
          <Image
            src={BILLEDE}
            alt=""
            fill
            unoptimized
            className="object-cover object-[50%_70%]"
          />
        </div>

        <button
          ref={closeButtonRef}
          type="button"
          onClick={close}
          aria-label="Luk"
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center bg-cream/90 text-textMuted hover:text-textPrimary hover:bg-cream transition-colors focus:outline-none focus:ring-2 focus:ring-cognac focus:ring-offset-2 focus:ring-offset-cream"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-5 pt-8 pb-6 sm:px-10 sm:py-11">
          <span className="eyebrow text-cognac flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Laser hårfjerning
          </span>

          <h2
            id="laserpakker-titel"
            className="font-heading text-3xl sm:text-[34px] leading-tight font-light text-textPrimary text-balance mb-3"
          >
            Start nu – og bliv klar til sommer!
          </h2>

          <p className="text-textBody leading-relaxed mb-6">
            Drømmer du om glat hud og mindre barbering? Start dit forløb med
            laserhårfjerning, og vælg den pakke, der passer til dig.
          </p>

          <ul className="rounded-2xl border border-sand bg-white/70 divide-y divide-sand">
            {pakker.map((pakke) => (
              <li
                key={pakke.id}
                className="flex items-baseline justify-between gap-3 px-4 sm:px-5 py-3.5"
              >
                <span className="text-[15px] sm:text-base text-textPrimary">{pakke.navn}</span>
                <span className="font-heading text-xl sm:text-2xl text-cognac lining-nums tabular-nums whitespace-nowrap">
                  {kroner(pakke.pris)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-textMuted mt-2.5 mb-7 px-1">
            Priserne er pr. behandling.
          </p>

          <Link
            href={PRISER_URL}
            onClick={close}
            className="block w-full px-6 py-3.5 bg-cognac hover:bg-cognac-hover text-white rounded-full text-center text-sm font-medium tracking-wide transition-colors"
          >
            Se pakker og priser
          </Link>
        </div>
      </div>
    </div>
  );
}
