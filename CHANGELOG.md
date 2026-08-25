# Changelog

## 2026-08-25 — Samtykke, external_id og stop for falske bookinger

Event Match Quality på `Schedule` lå på 5,3/10. Tre ting lå bag, og de er
rettet hver for sig.

**`/tak` sendte en booking af sted ved hvert eneste sidevisning.** Planways
"Ekstern bekræftelsesside" er en helt bar `/tak` uden et eneste parameter: intet
booking-id, intet navn, ingen pris. Siden kunne derfor ikke kende forskel på en
gennemført booking og en, der trykkede opdatér, gik tilbage eller skrev adressen
direkte. Den eneste spærring var en `useRef`, som nulstilles ved hver indlæsning.
Resultatet var bookinger, der aldrig havde fundet sted. De trak både antallet op
og matchkvaliteten ned, fordi de ikke havde noget klik-id med.

Der bruges nu tre signaler, som Planway rent faktisk efterlader: at siden ligger
i bookingens iframe, at henvisningen kommer fra `*.planway.com`, og et mærke sat
på `/book` i samme fane. Et enkelt sessionsmærke sikrer, at én booking giver ét
event, uanset hvor mange gange siden indlæses. Bookingens `event_id` dannes i
iframen og genbruges efter udbruddet, så pixel og Conversions API lander på det
samme id i stedet for at tælle dobbelt.

**`external_id` manglede helt.** Der ligger nu et førsteparts-id, `cnc_uid`, som
følger med hvert event. Det er en UUID uden personoplysninger, og det er den
billigste forbedring af matchkvaliteten, der findes, netop fordi det er der på
alle events og ikke kræver noget af den besøgende.

**Cookies blev skrevet fra JavaScript.** Safari ITP skærer den slags ned til 7
dage, så et annonceklik var væk, længe før en booking nåede at ske. `cnc_uid`,
`_fbc` og `_fbp` sættes nu server-side med rigtige `Set-Cookie`-headere fra
`src/middleware.ts` og `/api/consent`. Samtidig løser det en fejl, ingen havde
set: vi skrev `_fbc` og `_fbp` på `www.`, mens Metas eget script skrev de samme
navne på `.skoenhedsklinik-aarhus.dk`. Browseren havde altså to cookies med
samme navn, og serveren læste den, der tilfældigvis kom først. Nu skrives de på
registreringsdomænet, præcis som Meta selv gør. Værdierne spejles desuden i
localStorage og lægges tilbage, hvis en cookie forsvinder.

`_fbc` overskrives kun ved et nyt klik. Skrev vi det samme klik-id igen, ville
tidsstemplet blive nulstillet, og Meta læser det som det tidspunkt, annoncen
blev klikket.

**Der er kommet en cookiedialog.** Sitet havde ingen. Pixel og Conversions API
kørte for alle. Indtil den besøgende siger ja, indlæses `fbevents.js` slet ikke,
Conversions API afviser serverside, og ingen af de tre cookies skrives. Siger
den besøgende nej, ryddes de. Plausible er ikke omfattet: det sætter ingen
cookies. Bookingmodulet fra Planway har sin egen dialog, som vi ikke styrer.

Bemærk, at målte konverteringer falder, når en dialog sættes op. Det er de
besøgende, der siger nej, ikke et måletab.

E-mail og telefon sendes fortsat ikke på `Schedule`. Planway giver os dem ikke
tilbage, og de skal ikke indsamles et sted, hvor vi ikke allerede har dem.

## 2026-07-31 (3) — Nyt billede til Firm & Smooth

Kunden kunne ikke lide det gamle billede. Erstattet med et profilportræt, hvor
kæbelinjen og kantlyset er motivet, i stedet for et ansigt set forfra.

Beskåret til 4:5 og ikke 3:4. Boksen på behandlingssiden er `aspect-[4/5]` med
`object-cover`, så et 3:4-billede blev beskåret af browseren, og hvad der røg
var op til viewporten. Nu passer kildefilen præcis, og der skæres intet væk.

1200x1500, AVIF, 88 KB. Samme filnavn, så ingen kodeændring.

## 2026-07-31 (2) — Admin: kategorinavne i prislisten

Under **Priser** stod kategorien som den rå databaseværdi: "Haarfjerning" i
gruppeoverskrifterne og `haarfjerning` i dropdownen. Behandlinger havde allerede
fået læsbare navne, men prislisten var ikke rettet med.

Listen af kategorier ligger nu ét sted, `src/lib/service-categories.ts`, og
bruges af både behandlinger og priser — så de to sider ikke kan komme til at
vise forskellige navne for den samme kategori igen. Værdierne er uændrede, da de
er låst af CHECK-constraints i databasen.

Gruppeoverskrifterne gik før gennem `capitalize` og en enkelt `replace("-", " ")`,
så "bryn-vipper" blev til "Bryn vipper". Nu står der "Bryn & vipper".

## 2026-07-31 (1) — Mailnotifikation ved nye henvendelser

Leads landede i databasen og på **Admin → Henvendelser**, men ingen fik besked.
En henvendelse kl. 14 skal ringes op samme dag, ikke opdages tre dage senere.

`submitConsultationLead` sender nu en mail via Resend, når leadet er gemt.
Mailen indeholder navn, telefonnummer som klikbart `tel:`-link, ønskede områder,
anbefalet behandling, fri besked og hele annonce-attributionen (kampagne,
annonce, landingsside), så det er til at se med det samme, hvilken annonce der
leverede henvendelsen.

Afsendelsen ligger efter databaseindsættelsen og fanger sine egne fejl, så en
mailfejl aldrig kan koste et lead. Uden `RESEND_API_KEY` og
`LEAD_NOTIFICATION_TO` er kaldet en no-op, præcis som Conversions API'et uden
token — formularen fungerer uændret, indtil nøglerne er sat.

Opsætning: se afsnit 3b i `OPSAETNING-tracking-og-anmeldelser.md`.

## 2026-07-27 (6) — PlanwayEngaged fjernet

Målt over syv dage: **nul** `PlanwayEngaged`-events, mod 50-100
`InitiateCheckout` i samme periode. Nogle af de besøgende, der åbnede
bookingkalenderen, må have klikket ind i widgeten, så heuristikken virkede ikke.

Den byggede på det eneste signal en cross-origin-iframe lækker: at vinduet
mister fokus og `document.activeElement` bliver iframen. Det viste sig ikke at
være pålideligt mod Planways widget.

Fjernet fra `BookingIframe`, fra allowlisten i `/api/meta/track` og fra
opsætningsguiden. `trackPixelCustom` og `custom`-flaget i `trackConversion` er
fjernet med, da de kun fandtes til dette ene event.

## 2026-07-27 (5) — Rettelse: fbp-cookien manglede på en fjerdedel af events

Målt i Events Manager havde `ViewContent` kun 77,3 % dækning på `fbp`, altså
manglede hver fjerde event et browser-id at matche på.

Årsag: `ViewContent` fyrer i en `useEffect` når komponenten mounter, og
`AttributionCapture` skriver `_fbp`-cookien i sin egen `useEffect`. Rækkefølgen
mellem to komponenters effects er ikke garanteret, så en del events blev afsendt,
før cookien fandtes.

`sendToCapi` kalder nu `captureAttribution()` som det første, så cookien altid
findes inden afsendelse. Kaldet er idempotent og bevarer first-touch-attribution.

## 2026-07-27 (4) — Admin: nemmere at oprette behandlinger

- **Slug udfyldes automatisk** ud fra navnet, med dansk translitteration
  (æ→ae, ø→oe, å→aa), så "Laser hårfjerning" bliver til "laser-haarfjerning".
  Auto-udfyldningen stopper, så snart brugeren selv retter feltet, og den er helt
  slået fra ved redigering, hvor en ændret slug ville bryde eksisterende links.
- **Forklaring på slug-feltet** med live forhåndsvisning af den færdige URL, plus
  en advarsel ved redigering.
- **Kategori-dropdownen viser læsbare navne** ("Laser hårfjerning" i stedet for
  "haarfjerning"). Værdierne er uændrede, da de er låst af en CHECK-constraint
  i databasen.
- **Påkrævede felter er markeret** med *, og "Kort beskrivelse" er nu påkrævet i
  formularen, fordi den vises på alle behandlingskort.
- **Forståelige fejlbeskeder**: en dublet-slug gav før den rå Postgres-fejl
  "duplicate key value violates unique constraint services_slug_key".
- **"Opret behandling"-knappen lå uden for kortet.** Årsag: Button-komponenten
  har `shrink-0` i sine basisklasser, så to `w-full`-knapper i en flex-række
  ikke kunne krympe. Footeren bruger nu grid.

## 2026-07-27 (3) — Anmeldelseskarrusel + Place ID-fælden

### Anmeldelser som karrusel
- `GoogleReviewsClient` er nu en vandret scroll-snap-karrusel i stedet for et
  fast grid: swipe på touch, pile på desktop, og den skalerer af sig selv, hvis
  antallet af anmeldelser vokser.
- Sidste kort linker til hele Google-profilen med det rigtige samlede antal.
- Forsiden henter nu alle 5 (før 4), og tekstfilteret er løsnet fra 40 til 25
  tegn. Med højst 5 tilgængelige er hver kasseret anmeldelse 20% af det, vi
  overhovedet kan vise.
- **Google returnerer højst 5 anmeldelser pr. sted og har ingen paginering.**
  Det er en hård API-grænse, uanset hvor mange klinikken har.

### Place ID-fælden
Live-sitet viste stadig klientudtalelser, selv om `/api/reviews` svarede 200.
Årsag: `GOOGLE_PLACE_ID` i Vercel var et *adresse*-ID (`Ej…`), ikke
virksomhedens (`ChIJ…`). Det dekodede til "Tordenskjoldsgade 61, st th, 8200
Aarhus" — forkert type og forkert postnummer. Adresser har ingen anmeldelser, så
API'et svarer tomt og koden falder pænt tilbage uden at fejle.

- `scripts/find-place-id.mjs` markerer nu hvert resultat som ✅ virksomhed eller
  ⚠️ ADRESSE, og vælger automatisk virksomheds-ID'et.
- Nyt `--verify <place_id>` til at teste et ID, der allerede ligger i Vercel.
- Fælden og fejlsøgningen er dokumenteret i opsætningsguiden.

## 2026-07-27 (2) — Ansigtsbehandlinger, booking-flow og studierabat

### Ansigtsbehandlinger
- Aloe-billedet fra Firm & Smooth er flyttet til Glow & Renew. Det erstatter et
  sløret 6,5 KB-billede og passer langt bedre til behandlingen.
- Firm & Smooth har fået et nyt portræt af en kvinde i tresserne, genereret til
  formålet og beskåret til kortets 4:5-format. Kæbelinje og hals er synlige,
  hvilket er det en opstrammende anti-age-behandling faktisk adresserer.

### Lettere at booke
- **Book-knap i mobil-headeren.** Booking lå før gemt bag hamburgermenuen på
  telefonen, hvor størstedelen af trafikken kommer fra.
- **Ny `StickyBookBar`** i (public)-layoutet: sticky bookingbjælke på mobil på
  alle offentlige sider. Særligt vigtigt på forsiden, hvor scroll-hero'en holder
  både header og hero-CTA skjult, indtil animationen er kørt færdig — der var
  ingen synlig måde at booke på ved første visning.
- Bjælken holder sig væk fra behandlingssider og annonce-landingssider, som
  allerede har `StickyMobileCTA` med behandlingskontekst. Verificeret: præcis én
  bjælke pr. side, aldrig to, og ingen på /book og /tak.
- Telefonknappen i bjælken måles som `Contact`.

### Studierabat
Fra 1. august 2026 gælder studierabatten kun på behandlinger fra 400 kr. og op,
og den kan ikke kombineres med kampagner, pakker eller i forvejen nedsatte
priser. Opdateret på prissiden, i handelsbetingelserne og i sidens metadata.

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
