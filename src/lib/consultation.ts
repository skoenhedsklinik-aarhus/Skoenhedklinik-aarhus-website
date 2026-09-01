/**
 * Hvilke behandlinger der må markedsføres med gratis konsultation.
 *
 * Klinikken tilbyder kun gratis forundersøgelse på laserbehandlingerne —
 * laser hårfjerning, tatoveringsfjernelse og pico laser — hvor konsultationen
 * er et lovpligtigt led i forløbet. Alle øvrige behandlinger bookes direkte,
 * så deres CTA'er må ikke love en gratis konsultation.
 */
const FREE_CONSULTATION_SLUGS = new Set([
  "laser-haarfjerning",
  "tattoo-fjernelse",
  "pico-laser",
]);

/** Fanger nye laser-slugs (fx "pico-laser-aarhus") uden en kodeændring. */
const FREE_CONSULTATION_PATTERN = /laser|tattoo|tatover/;

export function hasFreeConsultation(slug?: string | null): boolean {
  if (!slug) return false;
  const s = slug.toLowerCase();
  return FREE_CONSULTATION_SLUGS.has(s) || FREE_CONSULTATION_PATTERN.test(s);
}

/** Standardtekst på book-knapper uden konsultationsløfte. */
export const BOOK_LABEL = "Book en tid";
export const FREE_CONSULTATION_LABEL = "Book gratis konsultation";

/** Knaptekst for en konkret behandling. */
export function bookLabel(slug?: string | null): string {
  return hasFreeConsultation(slug) ? FREE_CONSULTATION_LABEL : BOOK_LABEL;
}
