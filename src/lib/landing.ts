/**
 * Landingssiden, husket FØR samtykket.
 *
 * Cookiebanneret gemmer den ved første mount, altså før den besøgende trykker
 * accepter. Uden det ville en person, der accepterer på side fem, få side fem
 * registreret som sin landingsside, og så er hele førsteberøringen forkert:
 * annoncen står på side ét, ikke på side fem.
 *
 * sessionStorage, ikke localStorage: værdien skal gælde dette besøg og ikke
 * et helt andet, der begyndte i sidste uge.
 */

const LANDING_KEY = "sk_landing";

export type Landing = { url: string; referrer: string };

/** Kaldes ved første mount på hver sidevisning. Skriver kun én gang pr. fane. */
export function stashLanding(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(LANDING_KEY)) return;
    const landing: Landing = {
      url: window.location.href,
      referrer: document.referrer,
    };
    window.sessionStorage.setItem(LANDING_KEY, JSON.stringify(landing));
  } catch {
    // Privat tilstand eller blokeret storage: førsteberøringen falder tilbage
    // til den aktuelle side. Bedre end ingen førsteberøring.
  }
}

/** Den gemte landingsside, eller den aktuelle side hvis der ikke er nogen. */
export function stashedLanding(): Landing {
  const nu: Landing = {
    url: typeof window === "undefined" ? "" : window.location.href,
    referrer: typeof document === "undefined" ? "" : document.referrer,
  };
  if (typeof window === "undefined") return nu;
  try {
    const raw = window.sessionStorage.getItem(LANDING_KEY);
    if (!raw) return nu;
    const parsed = JSON.parse(raw) as Partial<Landing>;
    return {
      url: typeof parsed.url === "string" && parsed.url ? parsed.url : nu.url,
      referrer: typeof parsed.referrer === "string" ? parsed.referrer : nu.referrer,
    };
  } catch {
    return nu;
  }
}
