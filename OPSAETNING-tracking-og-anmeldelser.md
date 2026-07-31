# Opsætning: Google-anmeldelser, Meta-tracking og Planway

Al kode er skrevet og deployet-klar. Det, der mangler, er nøgler og
indstillinger i tre eksterne systemer. Regn med ca. 1 time i alt, hvoraf
Google-delen (trin 2) fylder halvdelen, fordi der skal oprettes et Cloud-projekt.

Rækkefølgen betyder noget: **0 → 1 → 2 → 3 → 4**. Trin 4 (test) kan ikke laves,
før resten er på plads.

---

## Oversigt — hvad koden gør nu

| Hændelse på sitet | Meta-event | Sendes fra browser | Sendes fra server (CAPI) |
|---|---|---|---|
| Behandlingsside vist | `ViewContent` | ✅ | ✅ |
| "Ring mig op"-formular sendt | `Lead` | ✅ | ✅ + hashet navn/telefon |
| Bookingkalender åbnet på /book | `InitiateCheckout` | ✅ | ✅ |
| **Booking gennemført** | `Schedule` (med DKK-værdi) | ✅ | ✅ |
| Telefonnummer trykket | `Contact` | ✅ | ✅ |

Alle events sendes **to gange med samme `event_id`** — én gang fra browseren og
én gang server-til-server. Meta smider dubletten væk og beholder den, der kom
først. Det er dét, der gør, at konverteringer fra folk med adblocker eller
iPhone stadig bliver målt. Regn med 15-30 % flere målte konverteringer.

`Schedule` er den vigtige nye: det er den **eneste** måde at måle en faktisk
gennemført Planway-booking på. Den kræver trin 3.

**Hvorfor `Schedule` og ikke `Purchase`:** der bliver ikke betalt noget ved
bookingen, og en del bookinger bliver til no-shows. Sender vi dem som `Purchase`,
står der en omsætning i Ads Manager, som aldrig kan afstemmes mod Dinero, og
ROAS-tallet bliver fiktion. `Schedule` er Metas standardhændelse for præcis
dette, og den bærer stadig en værdi, så værdibaseret budgivning er mulig.

Værdien sættes til **laveste listepris for den valgte behandling** (hentet fra
prislisten i admin). Bevidst laveste og ikke gennemsnit: det er bedre at
underdrive end at pumpe de tal, Meta optimerer på. Har behandlingen ingen pris,
kan du sætte en fast fallback med `BOOKING_DEFAULT_VALUE_DKK` i Vercel.
Vil I senere have ægte `Purchase`-hændelser, skal de komme fra betalte
behandlinger, ikke fra bookinger.

---

## 0. Kør databasemigrationen (2 min)

Leads får nu kilde, kampagne og annoncenavn i rigtige kolonner i stedet for som
tekst i noten, så I kan filtrere og tælle pr. kampagne.

1. Supabase → projektet → **SQL Editor** → **New query**.
2. Indsæt indholdet af `supabase/migrations/add_lead_attribution.sql`.
3. **Run**.

Migrationen er additiv og kan køres flere gange: den tilføjer kun nye,
tomme kolonner og rører ingen eksisterende data.

**Koden virker også før migrationen.** Opdager den, at kolonnerne mangler,
skriver den i stedet attributionen ind i notefeltet. Der går altså ingen leads
tabt, hvis du venter med at køre den — men kolonnen "Kilde" under
Admin → Henvendelser er tom indtil da.

---

## 1. Meta Pixel + Conversions API (15 min)

### 1a. Pixel ID

1. Gå til [business.facebook.com](https://business.facebook.com) → **Alle værktøjer** → **Events Manager**.
2. Vælg jeres datasæt/pixel i venstre side.
3. Kopiér **Pixel ID** (15-16 cifre, står under navnet øverst).

### 1b. Conversions API-token

1. Samme sted: **Indstillinger** (fanen øverst) → rul ned til **Konverterings-API**.
2. Klik **Generér adgangstoken**.
3. Kopiér tokenet. Det vises **kun én gang** — gem det med det samme.

### 1c. Læg dem i Vercel

Vercel → projektet → **Settings** → **Environment Variables**. Tilføj til
Production, Preview og Development:

```
NEXT_PUBLIC_META_PIXEL_ID = <pixel id fra 1a>
META_CAPI_ACCESS_TOKEN    = <token fra 1b>
```

Redeploy bagefter (Deployments → seneste → ⋯ → Redeploy).

> **Uden token er der ingen fejl** — siden kører videre, men så måles kun
> browser-siden, og I mister de 15-30 %.

### 1d. Samme Pixel ID ind i Planway

Planway → **Apps** → **Facebook Pixel** → indsæt **samme** Pixel ID → **Gem**.

Det får bookingsiden inde i widgeten til at fyre PageView på jeres pixel, så I
også kan se, hvem der åbnede kalenderen men ikke gennemførte.

---

## 2. Google-anmeldelser (30 min)

Siden viser lige nu generiske klientudtalelser, mærket "Klientudtalelse" — ikke
Google-anmeldelser. Så snart de to nøgler nedenfor er sat, skifter forsiden og
begge annonce-landingssider automatisk til ægte Google-anmeldelser med rigtigt
antal og rating, og der kommer stjerner i Google-søgeresultatet
(aggregateRating i strukturerede data).

Det tager længere tid end de andre punkter, fordi Google kræver et Cloud-projekt
med fakturering. Hele afsnittet er skrevet, så du kan følge det uden at kende
Google Cloud i forvejen.

> **Om Googles egen "Place ID Finder":** den virker ikke længere. Søgefeltet på
> `developers.google.com/.../place-id` ligger i en skjult container, og
> demo-kortet indlæser ikke. Det er derfor, du ikke kunne finde noget søgefelt.
> Vi finder i stedet Place ID'et via API'et i trin 2.6, hvilket også beviser,
> at nøglen virker.

### 2.1 Hvilken Google-konto skal bruges?

Det kan sagtens være **din egen Google-konto** til at starte med. Det ideelle
på sigt er klinikkens egen konto, så projektet og betalingskortet hører til
klinikken og ikke til en person, der kan forsvinde. Men det er ikke noget, der
skal afgøres nu.

**Overdragelse senere er ukompliceret.** Cloud-projektet kan flyttes til
klinikken uden at røre koden:

1. **IAM & Admin** → **IAM** → **Grant access** → tilføj klinikkens Google-konto
   som **Owner**.
2. **Billing** → skift projektets faktureringskonto til klinikkens.
3. Fjern dig selv som Owner, når de har bekræftet adgangen.

API-nøglen og Place ID'et er de samme hele vejen igennem, så der skal intet
ændres i Vercel eller i koden.

To ting det **ikke** kræver:

- Du behøver **ikke** adgang til klinikkens Google Business Profile — hverken nu
  eller senere. Places API læser offentlige data, præcis som en almindelig
  bruger ser dem på Google Maps. Cloud-projektet og virksomhedsprofilen er to
  helt adskilte ting.
- Anmeldelserne behøver **ikke** at være "koblet sammen" med noget. Vi peger
  bare på klinikkens Place ID.

Administratoradgang til Google Business Profile er stadig værd at få af andre
grunde (svare på anmeldelser, rette åbningstider, lægge billeder op), men det
er en separat opgave, som anmeldelserne på sitet ikke venter på.

### 2.2 Opret et Google Cloud-projekt

1. Gå til [console.cloud.google.com](https://console.cloud.google.com) og log ind
   med klinikkens Google-konto.
2. Acceptér vilkårene, hvis det er første gang.
3. Øverst i den blå bjælke: klik projektvælgeren → **New project**.
4. Navn: `skoenhedsklinik-web`. Organisation: lad stå. → **Create**.
5. Sørg for, at projektvælgeren står på det nye projekt, før du går videre.
   Alt herunder gælder kun det valgte projekt.

### 2.3 Aktivér fakturering (det du så beskeden om)

Google kræver et betalingskort på projektet, før Places API overhovedet svarer.
Det gælder også, når man holder sig inden for gratiskvoten.

1. Venstremenu → **Billing** → **Link a billing account** →
   **Create billing account**.
2. Land: **Danmark**. Kontotype: **Virksomhed** (så CVR kan påføres fakturaer).
3. Indtast kort. Google trækker typisk et lille beløb til verifikation og
   tilbagefører det.
4. Bekræft, at projektet `skoenhedsklinik-web` er koblet til kontoen.

Nye konti får normalt en gratis prøvekredit (typisk 300 USD i 90 dage).
**Usikkert:** beløb og periode varierer og kan være ændret. Regn ikke med den —
regnestykket nedenfor holder også uden.

### 2.4 Hvad kommer det til at koste? (det korte svar: 0 kr.)

Places API (New) prissættes pr. felt-gruppe. Reglen er, at **det dyreste felt i
kaldet bestemmer prisen for hele kaldet.**

Vores kald henter `reviews`, `rating` og `userRatingCount`:

| Felt | SKU-gruppe |
|---|---|
| `reviews` | Place Details **Enterprise + Atmosphere** |
| `rating`, `userRatingCount` | Place Details Enterprise |

`reviews` er det dyreste, så hele kaldet afregnes som **Place Details
Enterprise + Atmosphere**. Rating og antal kører gratis med — derfor henter vi
dem i samme kald i stedet for at lave to.

| | Tal |
|---|---|
| Gratis pr. måned på den SKU | **1.000 kald** |
| Pris derover | fra **25 USD pr. 1.000 kald** (falder ved højere volumen) |
| Vores faktiske forbrug | **ca. 30-90 kald om måneden** |

Forbruget er så lavt, fordi svaret caches i 24 timer. Uanset hvor mange
besøgende siden har, rammer den Google cirka én gang i døgnet (lidt oftere
lige efter et deploy, hvor cachen er tom). Det er under 10 % af gratiskvoten.

### 2.5 Sæt et loft, så det aldrig kan løbe løbsk

To lag. Tag som minimum det første.

**Budgetadvarsel (advarer, stopper ikke):**

1. **Billing** → **Budgets & alerts** → **Create budget**.
2. Scope: projektet `skoenhedsklinik-web`. Beløb: **50 kr.**
3. Advarsler ved 50 %, 90 % og 100 %. → **Finish**.

Rammer forbruget nogensinde 25 kr., er noget galt, og du får en mail.

**Kvoteloft (stopper faktisk kaldene):**

1. Venstremenu → **APIs & Services** → **Quotas & System Limits**.
2. Filtrér på **Places API (New)**.
3. Vælg kvoten → tre-prikker-menu → **Edit quota** → sæt et lavt loft →
   **Submit request**.

**Usikkert:** Google tilbyder ikke altid en redigerbar "requests per day" på
denne API — nogle gange kun pr. minut. Er der ingen dagskvote at redigere, så
nøjes med budgetadvarslen. Koden kan under alle omstændigheder ikke kalde mere
end cirka én gang i døgnet.

### 2.6 Slå Places API (New) til

1. **APIs & Services** → **Library**.
2. Søg **"Places API (New)"**.
3. Vælg det resultat, der hedder præcis **Places API (New)** → **Enable**.

> **Vigtigt:** der findes også et gammelt **"Places API"** uden "(New)".
> Det er en anden API, og vores kode bruger den ikke. Slår du kun den gamle til,
> fejler alt med "API not enabled". Har du slået begge til, gør det ikke noget.

### 2.7 Opret API-nøglen og begræns den

1. **APIs & Services** → **Credentials** → **Create credentials** → **API key**.
2. Kopiér nøglen (starter med `AIza…`) og gem den et sikkert sted.
3. Klik på nøglen for at redigere den. Navngiv den `skoenhedsklinik-web-server`.
4. **Application restrictions**: lad stå på **None**.
   Kaldet sker fra vores server, ikke fra browseren, så en HTTP-referrer-
   begrænsning ville blokere det. IP-begrænsning duer heller ikke, fordi Vercels
   udgående IP'er ikke er faste.
5. **API restrictions**: vælg **Restrict key** → sæt kryds i **Places API (New)**
   → **Save**.

Punkt 5 er den vigtige: nøglen kan så kun bruges til at læse steder, og intet
andet, selv hvis den skulle slippe ud.

Der går op til 5 minutter, før ændringerne slår igennem hos Google.

### 2.8 Find Place ID'et

Vi bruger nøglen fra 2.7 til at slå klinikken op. Kør i projektmappen:

```bash
npm run find-place-id -- --key DIN_API_NOEGLE
```

Scriptet søger efter klinikken, viser Place ID for hvert træf, og tester
bagefter, om nøglen rent faktisk må hente anmeldelser. Output ser sådan ud:

```
🔎  Søger efter: Skønhedsklinik Aarhus, Tordenskjoldsgade 61, 8000 Aarhus C

Resultater:

  1. Skønhedsklinik Aarhus
     Tordenskjoldsgade 61, 8000 Aarhus C, Danmark
     Place ID: ChIJ....................
     Tjek på kortet: https://www.google.com/maps/place/?q=place_id:ChIJ...

🔐  Tester om nøglen må hente anmeldelser (Enterprise + Atmosphere)…

✅  Rating: 5
✅  Antal anmeldelser i alt: 47
✅  Anmeldelser returneret af API'et: 5
✅  Heraf 5-stjernede med tekst (dem sitet viser): 4
```

Søg efter noget andet, hvis træffet er forkert:

```bash
npm run find-place-id -- --key DIN_API_NOEGLE "Skønhedsklinik Aarhus C"
```

**Verificér altid** ved at åbne "Tjek på kortet"-linket. Åbner det den rigtige
klinik på Google Maps, er Place ID'et rigtigt.

> ### ⚠️ Den fælde, der koster mest tid
>
> **Virksomheders Place ID starter med `ChIJ`.** Starter dit ID med `Ej` eller
> `Ei`, er det en *geokodet adresse* og ikke virksomheden. En adresse har ingen
> anmeldelser knyttet til sig, så API'et svarer pænt med 200 OK og et tomt
> resultat, og siden falder tilbage til klientudtalelser uden at fejle.
>
> Det skete i første opsætning her: ID'et dekodede til
> "Tordenskjoldsgade 61, st th, 8200 Aarhus" — både en adresse i stedet for
> klinikken, og med forkert postnummer (klinikken ligger i 8000 Aarhus C).
>
> Scriptet markerer nu hvert resultat med ✅ virksomhed eller ⚠️ ADRESSE, og
> vælger automatisk virksomheds-ID'et.

**Test et ID, du allerede har lagt i Vercel:**

```bash
npm run find-place-id -- --key DIN_API_NOEGLE --verify DIT_PLACE_ID
```

Den viser navn, adresse, rating, det samlede antal anmeldelser, og hvor mange
der rent faktisk vil blive vist på sitet.

<details>
<summary>Uden scriptet: samme opslag med curl</summary>

```bash
curl -X POST 'https://places.googleapis.com/v1/places:searchText' \
  -H 'Content-Type: application/json' \
  -H 'X-Goog-Api-Key: DIN_API_NOEGLE' \
  -H 'X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress' \
  -d '{"textQuery":"Skønhedsklinik Aarhus, Tordenskjoldsgade 61","languageCode":"da","regionCode":"DK"}'
```

Place ID'et er `id`-feltet i svaret.
</details>

### 2.9 Læg nøglerne i Vercel

Vercel → projektet → **Settings** → **Environment Variables**. Tilføj til
Production, Preview og Development:

```
GOOGLE_PLACES_API_KEY = <nøglen fra 2.7>
GOOGLE_PLACE_ID       = <place id fra 2.8>
```

Redeploy bagefter (Deployments → seneste → ⋯ → Redeploy).

### 2.10 Test at det virker

Åbn `https://skoenhedsklinik-aarhus.dk/api/reviews`.

- `"source": "google"` → det virker. Forsiden viser nu ægte anmeldelser.
- `"source": "fallback"` → noget mangler. Se tabellen nedenfor.

Anmeldelserne hentes forfra hvert døgn. Nye 5-stjernede anmeldelser med tekst
dukker automatisk op inden for et døgn.

> **Google returnerer højst 5 anmeldelser pr. sted.** Det er en hård grænse i
> Places API, og der findes ingen paginering — uanset om klinikken har 30 eller
> 300 anmeldelser. Forsiden viser derfor alle 5 i en karrusel plus et kort, der
> linker til hele profilen på Google, hvor det rigtige samlede antal står.

### 2.11 Fejlsøgning

| Symptom | Årsag | Løsning |
|---|---|---|
| `"source": "fallback"` | En af de to variabler mangler eller er tom i Vercel | Tjek stavning, og at der er redeployet bagefter |
| `"source": "fallback"`, men nøglerne ser rigtige ud | Place ID'et er en adresse (`Ej…`), ikke virksomheden (`ChIJ…`) | Kør `--verify` (trin 2.8) og find det rigtige ID |
| `"totalCount": null` sammen med `"source": "fallback"` | Google svarede slet ikke med data for stedet | Samme som ovenfor |
| `API key not valid` | Nøglen er kopieret forkert | Kopiér den igen fra Credentials |
| `PERMISSION_DENIED` / `SERVICE_DISABLED` | Places API (New) er ikke slået til | Trin 2.6 — husk at det skal være "(New)" |
| `This API method requires billing to be enabled` | Ingen faktureringskonto på projektet | Trin 2.3 |
| `requests to this API ... are blocked` | Nøglen er begrænset til en HTTP-referrer | Sæt Application restrictions til **None** (trin 2.7) |
| `NOT_FOUND` på Place ID | Place ID er forældet eller forkert | Kør scriptet i 2.8 igen |
| `"source": "google"` men kun få kort vises | Google returnerer højst 5 anmeldelser, og vi filtrerer til 5-stjernede med over 40 tegn | Normalt. Flere gode anmeldelser løser det |
| Ingen stjerner i Google-søgeresultatet | Strukturerede data kræver, at Google gennemsøger siden igen | Kan tage 1-3 uger. Tjek med Rich Results Test |

---

## 3. Planway — bekræftelsesside (10 min)

**Det her er det vigtigste enkeltpunkt på hele listen.** Uden det kan Meta ikke
se, hvem der rent faktisk fik booket en tid — kun hvem der åbnede kalenderen.

1. Planway → **Indstillinger** → **Online booking**.
2. Find feltet **"Ekstern bekræftelsesside"**.
3. Indsæt præcis:

   ```
   https://skoenhedsklinik-aarhus.dk/tak
   ```

4. **Gem**.

Siden `/tak` er allerede bygget. Den:
- bryder ud af booking-iframen, så kunden ser en rigtig kvitteringsside
- fyrer `Schedule` til både pixel og Conversions API
- navngiver konverteringen med den behandling, kunden valgte på /book
- er sat til `noindex` og blokeret i robots.txt

Mens I er inde i Planway, så tag også:

5. **Indstillinger** → **Online booking** → **Bookingside**: kopiér "Direkte
   link" og send det til os. Vi bruger `https://skonhedsklinik-aarhus.planway.com/`
   i dag — hvis det er et andet link, retter vi det (én miljøvariabel).

---

## 4. Test at det hele virker (10 min)

1. Events Manager → **Testhændelser** → kopiér testkoden (`TEST12345`).
2. Vercel → tilføj `META_TEST_EVENT_CODE = <koden>` → redeploy.
3. Gå igennem sitet:
   - åbn en behandlingsside → forvent `ViewContent`
   - udfyld "Ring mig op" → forvent `Lead` (skal stå som **Browser + Server**)
   - åbn /book → forvent `InitiateCheckout`
   - gennemfør en testbooking i Planway → forvent `Schedule`
4. I Testhændelser skal hvert event vise **både** "Browser" og "Server" og være
   markeret som dedupliceret. Står der to adskilte events, så sig til.
5. **Fjern `META_TEST_EVENT_CODE` igen** og redeploy. Glemmer I det, tæller
   hændelserne ikke med i de rigtige kampagnedata.

---

## 5. Efter lancering — det der faktisk sænker prisen

1. **Vent på data.** Cirka 50 `Lead`-events pr. uge, før optimering giver mening.
2. **Skift kampagnemål** i Ads Manager fra "Trafik" til **"Kundeemner (Leads)"**,
   og vælg `Lead` som konverteringshændelse.
3. Når der er nok bookinger, kan I lave en separat kampagne optimeret mod
   `Schedule` — det er den hændelse, der ligger tættest på omsætning.
4. **Tjek Event Match Quality** i Events Manager (mål: 6,0+). Den er høj her,
   fordi vi sender hashet telefonnummer og navn med hvert lead.
5. **Brug UTM-tags i annoncerne.** Koden gemmer `utm_source`, `utm_campaign` og
   `utm_content` og skriver dem på hvert lead under **Admin → Henvendelser**, så
   I kan se præcis hvilken annonce der skabte hvilket lead. Anbefalet skabelon i
   annoncens URL-parametre:

   ```
   utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
   ```

---

## Spørgsmål vi mangler svar på

**Planway service-dyblink.** Vi kan i dag sende folk til bookingsiden, men ikke
direkte til en bestemt behandling — kunden skal selv finde f.eks. "Laser
hårfjerning" i listen. Planways dokumentation nævner ingen URL-parametre, og
widgetens kode læser ingen. Koden er forberedt: hvis Planway bekræfter et
format, er det én linje at aktivere (`PLANWAY_SERVICE_PARAM` i
`src/lib/booking.ts`), plus at udfylde "Planway Service ID" pr. behandling under
Admin → Behandlinger.

Spørgsmål til Planways support (chatten i systemet):

> Hej! Vi sender annoncetrafik fra vores hjemmeside til vores bookingside. Kan
> man lave et link, der åbner bookingsiden med en bestemt service forvalgt —
> f.eks. et link direkte til "Laser hårfjerning"? Hvis ja: hvordan skal linket
> se ud?

Indtil da viser /book en tydelig bjælke ("Du booker: Laser hårfjerning — vælg
behandlingen i kalenderen nedenfor").

---

## Alle miljøvariabler samlet

| Variabel | Hvor | Påkrævet |
|---|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | Events Manager | Ja |
| `META_CAPI_ACCESS_TOKEN` | Events Manager → Konverterings-API | Ja |
| `META_TEST_EVENT_CODE` | Events Manager → Testhændelser | Kun under test |
| `META_GRAPH_API_VERSION` | — | Nej (standard v23.0) |
| `GOOGLE_PLACES_API_KEY` | Google Cloud Console | Ja |
| `GOOGLE_PLACE_ID` | Google Place ID Finder | Ja |
| `NEXT_PUBLIC_PLANWAY_BOOKING_URL` | Planway → Online booking | Nej |
| `BOOKING_DEFAULT_VALUE_DKK` | — | Nej (fallback-værdi på bookinger) |
| `NEXT_PUBLIC_SITE_URL` | — | Ja (bør allerede være sat) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible | Nej |
