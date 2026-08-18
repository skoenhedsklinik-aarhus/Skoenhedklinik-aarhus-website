"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, X } from "lucide-react";
import { TrackedPhoneLink } from "@/components/shared/TrackedPhoneLink";

/**
 * Driftsbesked på forsiden: klinikken holder lukket og åbner igen den
 * 24. august på den nye adresse på Åboulevarden.
 *
 * Beskeden skjuler sig selv efter `SKJUL_EFTER`, så ingen skal huske at fjerne
 * komponenten manuelt. Skal den vises længere (eller kortere), er datoen
 * herunder det eneste, der skal rettes. Skal den væk helt, fjernes
 * <AnnouncementPopup /> fra src/app/(public)/page.tsx.
 */

/**
 * Sidste øjeblik beskeden vises. Klinikken åbner igen den 24., så beskeden
 * stopper natten mellem den 23. og den 24. Efter dette renderer komponenten
 * ingenting.
 */
const SKJUL_EFTER = new Date("2026-08-23T23:59:59+02:00");

/** Lukker besøgende beskeden, holder den sig lukket resten af besøget. */
const STORAGE_KEY = "ska-besked-lukket-2026-08";

/** Forsiden har en scroll-hero. Vent, til den er malet, før beskeden kommer. */
const FORSINKELSE_MS = 900;

export function AnnouncementPopup() {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Privat browsing kan blokere sessionStorage. Beskeden må gerne komme
      // igen ved næste sidevisning, men den må aldrig crashe siden.
    }
  }, []);

  useEffect(() => {
    if (Date.now() > SKJUL_EFTER.getTime()) return;

    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // Ingen storage: vis beskeden alligevel.
    }

    const timer = window.setTimeout(() => setOpen(true), FORSINKELSE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Escape lukker, Tab holdes inde i dialogen, og siden bag må ikke scrolle.
  useEffect(() => {
    if (!open) return;

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
  }, [open, close]);

  if (!open) return null;

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
        aria-labelledby="besked-titel"
        className="relative w-full max-w-md bg-cream border border-sand rounded-3xl shadow-[0_24px_80px_rgba(26,26,26,0.35)] px-7 py-9 sm:px-9 sm:py-10 animate-slide-up"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={close}
          aria-label="Luk besked"
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-textMuted hover:text-textPrimary hover:bg-sand/60 transition-colors focus:outline-none focus:ring-2 focus:ring-cognac focus:ring-offset-2 focus:ring-offset-cream"
        >
          <X className="w-4 h-4" />
        </button>

        <span className="eyebrow text-cognac block mb-4">Vigtig besked</span>

        <h2
          id="besked-titel"
          className="font-heading text-3xl sm:text-[34px] leading-tight font-light text-textPrimary text-balance mb-4"
        >
          Vi holder lukket indtil den 24. august
        </h2>

        <p className="text-textBody leading-relaxed mb-7">
          Klinikken er lukket i en kort periode. Den 24. august åbner vi igen
          på vores nye adresse. Du er meget velkommen til at skrive eller ringe
          imens.
        </p>

        <div className="rounded-2xl border border-sand bg-beige/60 px-5 py-5 mb-8">
          <div className="flex gap-3.5">
            <MapPin className="w-5 h-5 text-cognac shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-textMuted mb-2">
                Ny adresse fra 24. august
              </p>
              <p className="text-textPrimary font-medium leading-snug">
                Åboulevarden 39, 5. sal th.
                <br />
                8000 Aarhus C
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=%C3%85boulevarden+39%2C+8000+Aarhus+C"
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 text-sm text-cognac underline underline-offset-4 hover:text-cognac-hover transition-colors"
              >
                Se på kort
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/book"
            onClick={close}
            className="flex-1 px-6 py-3.5 bg-cognac hover:bg-cognac-hover text-white rounded-full text-center text-sm font-medium tracking-wide transition-colors"
          >
            Book tid
          </Link>
          <TrackedPhoneLink
            contentCategory="driftsbesked"
            className="flex-1 px-6 py-3.5 border border-cognac/40 text-cognac hover:bg-cognac/5 rounded-full text-center text-sm font-medium tracking-wide transition-colors"
          >
            Ring 61 44 59 99
          </TrackedPhoneLink>
        </div>
      </div>
    </div>
  );
}
