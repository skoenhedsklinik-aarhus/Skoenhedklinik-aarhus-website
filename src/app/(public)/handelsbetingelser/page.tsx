import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Handelsbetingelser — Skønhedsklinik Aarhus",
  description:
    "Læs vores handelsbetingelser: afbudspolitik (24 timers afmelding), lovpligtig forundersøgelse, priser og betaling, gavekort, reklamation og dine rettigheder.",
  alternates: { canonical: "/handelsbetingelser" },
  robots: { index: true, follow: false },
};

export default function TermsPage() {
  return (
    <main className="flex flex-col min-h-screen bg-cream">
      <section className="pt-20 pb-10 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl md:text-5xl text-textPrimary mb-4">
            Handelsbetingelser
          </h1>
          <p className="text-textBody">Gældende for Skønhedsklinik Aarhus</p>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="container mx-auto max-w-3xl bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-sand prose prose-lg text-textBody prose-headings:font-heading prose-headings:text-textPrimary">
          <h2>1. Bookingbetingelser</h2>
          <p>Ved booking accepterer du nedenstående betingelser.</p>

          <h3>Afbud</h3>
          <p>Afbud skal ske senest 24 timer før behandlingens start.</p>
          <p>
            Ved afbud senere end 24 timer før aftalen opkræves 70 % af behandlingens normale pris før eventuelle rabatter.
          </p>
          <p>
            Ved udeblivelse uden afbud opkræves 100 % af behandlingens normale pris før eventuelle rabatter.
          </p>

          <h3>Forsinkelse</h3>
          <p>Kommer du for sent, kan behandlingstiden blive forkortet, uden at prisen reduceres.</p>
          <p>
            Hvis behandlingen ikke kan gennemføres på grund af din forsinkelse, opkræves 70 % af behandlingens normale pris før eventuelle rabatter.
          </p>

          <h3>Betaling</h3>
          <p>
            Behandlinger betales på behandlingsdagen. Ved opkrævning for sent afbud eller udeblivelse skal beløbet betales inden den frist, der fremgår af opkrævningen.
          </p>
          <p>
            Beløbet betales via MobilePay til <strong>112813</strong>. Skriv venligst dit fulde navn og datoen for din aftale i beskedfeltet.
          </p>
          <p>
            Send derefter en besked med dit navn og et billede af betalingskvitteringen til klinikkens telefonnummer <a href="tel:+4561445999">61 44 59 99</a>, så vi hurtigt kan registrere din betaling.
          </p>

          <h3>Manglende betaling og inkasso</h3>
          <p>
            Ved manglende betaling sender vi et skriftligt inkassovarsel med en betalingsfrist på mindst 10 dage fra afsendelsen.
          </p>
          <p>
            Hvis beløbet fortsat ikke er betalt efter fristens udløb, kan kravet overdrages til inkasso. Dette kan medføre yderligere omkostninger efter gældende regler.
          </p>
          <p>
            Har du allerede betalt, eller er du uenig i kravet, bedes du kontakte klinikken hurtigst muligt.
          </p>

          <h3>Kontakt</h3>
          <p>
            Afbud kan foretages via din onlinebooking inden afbudsfristens udløb eller ved direkte kontakt til klinikken på telefon <a href="tel:+4561445999">61 44 59 99</a>.
          </p>
          <p>Tak, fordi du respekterer vores tid.</p>

          <h2>2. Lovpligtig forundersøgelse</h2>
          <p>
            Nogle behandlinger (bl.a. laser hårfjerning og tatoveringsfjernelse med laser) kræver ifølge Styrelsen for Patientsikkerhed en lovpligtig forundersøgelse hos vores læge eller sygeplejerske mindst 48 timer før selve behandlingen må finde sted. Forundersøgelsen er gratis og uforpligtende.
          </p>

          <h2>3. Priser og betaling</h2>
          <p>
            Alle priser på hjemmesiden er i danske kroner (DKK) og er inklusiv moms, hvor dette er gældende. Vi forbeholder os retten til at ændre priserne uden forudgående varsel. Den pris der var gældende på tidspunktet for bookingen, vil dog altid være gældende for den specifikke aftale.
          </p>
          <p>
            Betaling for behandlinger sker typisk i klinikken efter endt behandling (medmindre forudbetaling er valgt via Planway). Gavekort købes og betales online via Planway.
          </p>
          <p>
            <strong>Studierabat:</strong> Vi tilbyder 10% i studierabat i hele åbningstiden mod fremvisning af gyldigt studiekort. Fra 1. august 2026 gælder studierabatten alene på behandlinger til 400 kr. og derover. Studierabatten kan ikke kombineres med kampagner, pakkeløsninger eller i forvejen nedsatte priser.
          </p>

          <h2>4. Gavekort</h2>
          <p>
            Gavekort er gyldige i 3 år fra udstedelsesdatoen. Gavekort kan indløses til alle behandlinger og produkter i klinikken. Gavekort kan refunderes til kontanter mod et gebyr i gyldighedsperioden samt op til 1 år efter udløb.
          </p>

          <h2>5. Reklamation og klager</h2>
          <p>
            Hvis du mod forventning er utilfreds med din behandling, bedes du kontakte os hurtigst muligt, så vi sammen kan finde en løsning. Klager over sundhedsfaglige behandlinger kan desuden rettes til Styrelsen for Patientklager.
          </p>

          <h2>6. Data og privatliv</h2>
          <p>
            Vi behandler dine persondata fortroligt og i overensstemmelse med gældende lovgivning. Du har ret til indsigt i hvilke data vi har registreret om dig, og du kan kræve dem rettet eller slettet. Læs mere i vores <a href="/cookies-og-privatlivspolitik">Cookies- og Privatlivspolitik</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
