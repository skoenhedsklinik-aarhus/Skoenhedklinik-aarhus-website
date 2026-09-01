"use client";



const BASE_ITEMS = [
  "Registreret hos Styrelsen for Patientsikkerhed",
  "Certificerede behandlere",
  "Aarhus C siden 2015",
  "Markedets bedste udstyr",
  "Personlig rådgivning",
];

/**
 * `freeConsultation` sættes kun på de sider, hvor gratis konsultation
 * faktisk tilbydes (laser hårfjerning, tatoveringsfjernelse, pico laser).
 * Standard er uden løftet, så striben ikke lover det på øvrige behandlinger.
 */
export function TrustStrip({ freeConsultation = false }: { freeConsultation?: boolean }) {
  const items = freeConsultation
    ? [BASE_ITEMS[0], BASE_ITEMS[1], "Gratis konsultation", ...BASE_ITEMS.slice(2)]
    : BASE_ITEMS;
  const TRUST_ITEMS = [...items, ...items];

  return (
    <div className="relative bg-white border-y border-sand py-4 overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-marquee whitespace-nowrap">
        {TRUST_ITEMS.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 mx-6 text-textMuted text-xs font-medium tracking-[0.14em] uppercase shrink-0"
          >
            <span className="w-1 h-1 rounded-full bg-cognac inline-block shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
