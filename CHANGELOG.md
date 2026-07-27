# Changelog

## 2026-07-27 — Ægte Google-anmeldelser + fuld Meta/Planway-måling

Mål: måle det, der rent faktisk sker (særligt gennemførte bookinger), og vise
ægte anmeldelser i stedet for pladsholdere.

Opsætningsguide: `OPSAETNING-tracking-og-anmeldelser.md`.

### Google-anmeldelser er nu live-data
- Ny `src/lib/reviews.ts` — én delt Places API (New)-henter, cachet 24 timer,
  fejler altid blødt til klientudtalelser (aldrig en tom side).
- `GoogleReviews` er splittet i en server-komponent (henter data) og
  `GoogleReviewsClient` (animation). API-nøglen når aldrig browseren.
- Rating og antal anmeldelser er ikke længere hardkodet "5,0" — de kommer fra
  Google, med link til klinikkens Google-profil.
- Annonce-landingssiderne (`/lp/*`) bruger nu de samme ægte anmeldelser.
  De opdigtede citater er kun fallback og er mærket "Klientudtalelse".
- Forsiden udsender `aggregateRating` + `Review` som strukturerede data — men
  **kun** når anmeldelserne er ægte. Ellers ville det være i strid med Googles
  regler for strukturerede data.
- `/api/reviews` er nu en tynd wrapper og den hurtigste måde at verificere
  opsætningen: `"source": "google"` = det virker.
- Nyt script `scripts/find-place-id.mjs` (`npm run find-place-id`): finder
  klinikkens Place ID og tester i samme kørsel, om nøglen må hente anmeldelser.
  Googles egen Place ID Finder virker ikke længere — søgefeltet ligger i en
  `display:none`-container, og demo-kortet indlæser ikke.

### Meta Conversions API (server-side tracking)
- Ny `src/lib/meta/capi.ts` — sender events server-til-server med SHA-256-hashet
  telefon og navn, plus `_fbc`/`_fbp`, IP og user agent.
- Ny `/api/meta/track` — bro fra browseren, så alle konverteringer sendes begge
  veje. Kun kendte event-navne og felter forwardes.
- Alle konverteringer bærer nu et delt `event_id`, så browser- og
  server-hændelsen dedupliceres i stedet for at tælle dobbelt.
- Uden `META_CAPI_ACCESS_TOKEN` er hele laget en no-op — siden kører uændret.

### Booking bliver målt for første gang
- Ny side `/tak` — Planways "Ekstern bekræftelsesside". Bryder ud af
  booking-iframen, fyrer `Schedule` til både pixel og CAPI, og navngiver
  konverteringen med den behandling kunden valgte (cookie sat på /book).
  `noindex` + blokeret i robots.txt.
- `Schedule` sendes med en DKK-værdi: laveste listepris for den valgte
  behandling, slået op i prislisten via behandlingens slug. Bevidst laveste og
  ikke gennemsnit — en booking er ikke betalt endnu, og nogle bliver no-shows.
  Fallback kan sættes med `BOOKING_DEFAULT_VALUE_DKK`.
  Bevidst *ikke* `Purchase`: fiktiv omsætning i Ads Manager kan aldrig afstemmes
  mod Dinero.
- Nyt custom-event `PlanwayEngaged`: Planway-widgeten kører på deres domæne, så
  vi kan ikke se klik inde i den. Det ene signal en cross-origin-iframe lækker
  er fokus — det bruges nu som "er faktisk begyndt at booke".

### Attribution pr. lead (rigtige kolonner)
- Ny `src/lib/attribution.ts` + `AttributionCapture` i root layout:
  gemmer `fbclid` og `utm_*` for hele sessionen, og skriver `_fbc`/`_fbp`-cookies
  selv, når pixlen er blokeret (løfter Event Match Quality).
- Ny migration `supabase/migrations/add_lead_attribution.sql`: `consultation_leads`
  får kolonnerne `source`, `utm_source`, `utm_medium`, `utm_campaign`,
  `utm_content`, `utm_term`, `fbclid`, `landing_page` og `referrer`, plus indeks
  på kampagne og kilde.
- `submitConsultationLead` skriver kolonnerne — og opdager selv, hvis
  migrationen ikke er kørt endnu: så gentages insert uden dem, og attributionen
  skrives i noten i stedet. Et lead går aldrig tabt over en manglende kolonne.
- Admin → Henvendelser har fået en "Kilde"-kolonne med kanal, kampagne,
  annoncenavn og hvilken formular leadet kom fra.

### Flere målepunkter
- Telefonklik i footer og på begge landingssider måles nu som `Contact`
  (ny `TrackedPhoneLink`) — før blev kun sticky-CTA og FinalCTA målt.
- `ViewContent`, `InitiateCheckout` og `Contact` sendes nu også server-side.

### Konfiguration
- `.env.example` udvidet med alle nye variabler og dansk forklaring på hver.
- Planway-bookinglinket kan nu overskrives med
  `NEXT_PUBLIC_PLANWAY_BOOKING_URL` uden kodeændring.

### Stadig udestående (kræver svar fra Planway)
Service-dyblink til en bestemt behandling. Planways dokumentation beskriver
ingen URL-parametre, og widgetens kode læser ingen. Koden er forberedt —
se spørgsmålet til deres support i opsætningsguiden.

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
