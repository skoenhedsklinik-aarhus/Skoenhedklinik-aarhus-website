# Udkast til privatlivspolitik: måling af annoncer og kunderejse

**Status: udkast. Skal godkendes af Skønhedsklinik Aarhus, før det lægges på
sitet.** Klinikken er dataansvarlig, ClicknContent er databehandler. Teksten er
skrevet, så den kan sættes direkte ind, men ordlyden er klinikkens ansvar.

Udkastet dækker to ting på én gang:

1. Den nye måling af kunderejsen (sidevisninger og førsteberøring).
2. Et hul, der har været der siden august: Meta Pixel og Conversions API står
   slet ikke i den nuværende politik, selvom cookiebanneret beder om samtykke
   til præcis dem. Politikken er altså forkert i dag, ikke først når det nye
   går live.

Afsnit 2 i den nuværende politik ("Cookies") erstattes af teksten nedenfor.
Resten af politikken er urørt.

---

## 2. Cookies og måling

Vores hjemmeside er designet til at indsamle så lidt som muligt. Vi bruger to
slags måling, og de behandles forskelligt.

**Uden samtykke: besøgstal (Plausible Analytics)**
Vi bruger Plausible til at se, hvor mange der besøger hjemmesiden, og hvilke
sider de læser. Plausible sætter ingen cookies og indsamler ingen oplysninger,
der kan henføres til dig. Derfor kræver det ikke dit samtykke.

**Kun med dit samtykke: måling af vores annoncer**
Siger du ja i cookiebanneret, måler vi, hvilke annoncer der fører til en
henvendelse eller en booking. Formålet er alene at vurdere, om vores
markedsføring virker, så vi ikke bruger penge på annoncer, der ikke gør.

Med dit samtykke sætter vi følgende førsteparts-cookies:

| Cookie | Levetid | Hvad den bruges til |
|---|---|---|
| `sk_consent` | 1 år | Husker dit valg i cookiebanneret |
| `sk_ft` | 90 dage | Et tilfældigt besøgs-id og oplysning om, hvilken annonce eller hvilket link der først førte dig hertil |
| `cnc_uid` | 1 år | Et tilfældigt id, der lader os måle en booking uden at sende dine kontaktoplysninger til Meta |
| `_fbc`, `_fbp` | 90 dage | Metas egne id'er for annonceklik og browser |

Med dit samtykke registrerer vi desuden, hvilke sider du besøger på
hjemmesiden, hvornår, og hvilken annonce, søgning eller henvisning du kom fra.
Det gemmes sammen med besøgs-id'et fra `sk_ft`. Vi gemmer kun selve stien på
vores eget domæne samt kampagneoplysningerne i adressen. Alt andet i adressen
kasseres, og vi registrerer hverken din IP-adresse eller din placering i denne
måling.

Udfylder du en kontaktformular, knyttes de oplysninger, du selv indtaster
(navn og telefonnummer), til besøgs-id'et. Fra det øjeblik kan vi altså se,
hvilke sider netop du har læst. Udfylder du ingen formular, forbliver
oplysningerne knyttet til et tilfældigt id, som vi ikke kan sætte navn på.

Gennemfører du en booking, registrerer vi desuden tidspunktet for bookingen og
hvilken behandling den gælder, knyttet til det samme besøgs-id. Selve
bookingen, dit navn og dine kontaktoplysninger behandles af Planway og står
ikke i denne måling. Har du tidligere udfyldt en formular på hjemmesiden, kan
bookingen kobles til din henvendelse.

Vi deler desuden oplysninger om din adfærd på siden med Meta (Facebook og
Instagram) gennem Meta Pixel og Metas Conversions API, når du har givet
samtykke. Kontaktoplysninger sendes aldrig i klar tekst: de omdannes til en
uigenkaldelig talkode (hashes), før de forlader vores server. Meta er
selvstændig dataansvarlig for sin egen brug af oplysningerne. Se Metas
privatlivspolitik på facebook.com/privacy/policy.

**Retsgrundlag:** dit samtykke, jf. databeskyttelsesforordningens artikel 6,
stk. 1, litra a, og cookiebekendtgørelsens § 3.

**Opbevaring:** oplysninger om sidevisninger og bookinger slettes efter 12
måneder.
Henvendelser fra kontaktformularen slettes, når de ikke længere er nødvendige
for at behandle din forespørgsel.

**Databehandlere:** oplysningerne gemmes hos Supabase (databaser i EU,
Frankfurt) og hostes hos Vercel. ClicknContent ApS varetager annonceringen for
os og har adgang til målingen som vores databehandler.

**Du kan altid trække dit samtykke tilbage.** Sletter du cookies i din
browser, vises cookiebanneret igen, og du kan træffe et nyt valg. Du kan også
skrive til info@skoenhedsklinik-aarhus.dk og bede om at få slettet de
oplysninger, vi har registreret om dit besøg.

**Tredjepartsindlejringer:** nogle sider indeholder indhold fra tredjeparter,
som kan sætte deres egne cookies, vi ikke har kontrol over:

- **Planway (booking):** vores bookingsystem og gavekortmodul er indlejret via
  Planway. Når du bruger dem, gælder Planways cookie- og privatlivspolitik.
- **Google Maps:** på kontaktsiden viser vi et kort fra Google Maps. Google kan
  placere cookies i den forbindelse.

---

## To ting der skal besluttes, før teksten går på sitet

1. **De 12 måneders opbevaring skal håndhæves, ellers er sætningen usand.**
   Der findes ingen automatisk sletning endnu. Den kan slås til med
   nedenstående, som kræver, at udvidelsen `pg_cron` aktiveres på
   Supabase-projektet:

   ```sql
   create extension if not exists pg_cron;

   select cron.schedule(
     'slet-gamle-beroeringer',
     '30 3 * * *',
     $$delete from public.touchpoints where occurred_at < now() - interval '12 months'$$
   );

   select cron.schedule(
     'slet-gamle-bookinger',
     '35 3 * * *',
     $$delete from public.bookings where occurred_at < now() - interval '12 months'$$
   );
   ```

   Vælger klinikken en anden periode, skal både teksten og tallet i jobbet
   rettes.

2. **Klinikken skal godkende, at ClicknContent nævnes som databehandler**, og
   at der findes en databehandleraftale. Står det i politikken uden en aftale
   bag, er politikken stadig forkert.
