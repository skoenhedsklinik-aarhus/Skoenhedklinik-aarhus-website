# Changelog

## 2026-07-06 — Konverteringsoptimering + fejlrettelser

Mål: flere leads og bookinger fra samme trafik — særligt Facebook-annoncer
til tattoo fjernelse og laser hårfjerning.

### Meta Pixel — konverterings-events (`src/lib/pixel.ts`)
Pixlen sendte kun PageView; nu sendes rigtige konverteringssignaler, så
Meta kan optimere annoncelevering mod leads i stedet for klik:
- `Lead` — når en "ring mig op"-formular indsendes (med behandlingsnavn)
- `ViewContent` — når en behandlingsside vises (bygger remarketing-målgrupper)
- `InitiateCheckout` — når bookingkalenderen åbnes på /book
- `Contact` — når der klikkes på telefonnummeret
Kræver kun at `NEXT_PUBLIC_META_PIXEL_ID` er sat i Vercel (allerede konfigureret).
**Husk:** Skift kampagnemål i Ads Manager til "Leads" efter ~50 registrerede leads.

### Nye komponenter
- **CallbackForm** (`src/components/shared/CallbackForm.tsx`) — kompakt
  2-felts lead-formular (navn + telefon). Gemmer i `consultation_leads`
  (vises under Admin → Henvendelser) tagget med behandling og kilde.
- **StickyMobileCTA** (`src/components/shared/StickyMobileCTA.tsx`) —
  fast bund-bjælke på mobil med "Book gratis konsultation" + ring-knap.
  Vises efter scroll forbi hero.

### Behandlingssider (`/behandlinger/[slug]`)
- "Ring mig op"-sektion tilføjet (før "Du vil måske også synes om")
- Prisanker i hero: "Se priser — fra X kr." (hentes automatisk fra prislisten)
- Trust-linje i hero: 5,0 på Google · STPS-registreret · Gratis konsultation
- TrustStrip (rullende trust-banner) under hero
- Book-knap direkte under prislisten
- Sticky mobil-CTA på alle behandlingssider

### Skjulte annonce-landingssider (`/lp/tattoo-fjernelse`, `/lp/laser-haarfjerning`)
Dedikerede sider til Facebook/Instagram-annoncer:
- Ingen navigation (ingen lækage ud af funnel), minimal footer
- Lead-formular over folden, direct-response-tekst, FAQ mod indvendinger
- `noindex/nofollow` + blokeret i robots.txt — findes ikke via Google eller sitet
- Leads tagges `lp-<behandling>` så annonce-effekt kan måles separat
- **OBS:** Anmeldelser på LP'erne er midlertidige — udskift med ægte
  Google-citater før stor annoncespend (markedsføringsloven)

### CTA-skærpelser
- Alle primære knapper siger nu "Book gratis konsultation" (header, heroes, prissektioner)
- Forside-hero: primær CTA går nu til /book (før: /behandlinger)
- Trust-mikrolinjer tilføjet under CTA'er på forside og FinalCTA

### Fejlrettelser
- **Hero-scroll-effekten på forsiden var død i udvikling** (`scroll-expansion-hero.tsx`):
  cleanup nulstillede ikke `rafRef` efter `cancelAnimationFrame`, så efter
  StrictMode-remount blev alle scroll-events ignoreret. Produktion var ikke
  ramt, men lokalt virkede effekten aldrig. Rettet og verificeret i browser.
- **TrustStrip-marquee animerede aldrig**: `animate-marquee`-klassen var
  aldrig defineret i Tailwind-konfigurationen (komponenten var bygget, men
  aldrig brugt på en side). Keyframes tilføjet + `w-max` for sømløst loop.

### Udestående (kræver input fra klienten — se KLIENT-GUIDE i projektmappen)
1. Google Place ID → ægte Google-anmeldelser på sitet (API-nøgle findes allerede)
2. Planway: bekræft med support om service-dybdelink er muligt (koden er forberedt)
3. Bekræft Pixel ID i Vercel + skift kampagnemål til Leads
