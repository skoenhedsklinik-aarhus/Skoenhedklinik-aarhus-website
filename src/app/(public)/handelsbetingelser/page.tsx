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
          <h2>1. Tidsbestilling og afbudspolitik</h2>
          <p>
            For at sikre den bedst mulige oplevelse for alle vores klienter, beder vi dig overholde følgende regler for tidsbestilling og afbud:
          </p>
          <ul>
            <li><strong>Afbud:</strong> Vi har en afbudspolitik der hedder, afmelding meldes inden 24 timer, ellers bliver man opkrævet fuld betaling for den bookede behandling.</li>
            <li><strong>Måde for afbud:</strong> Aflysning af tid skal ske online via vores bookingsystem (Planway) eller via e-mail. Afbud kan <strong>ikke</strong> ske via telefonsvarer eller SMS.</li>
            <li><strong>Forsinkelser:</strong> Ved forsinkelser på over 15 minutter forbeholder vi os retten til at annullere din tid og opkræve fuld betaling, da vi derved ikke kan nå at udføre behandlingen forsvarligt uden at forsinke de efterfølgende klienter.</li>
          </ul>

          <h2>2. Lovpligtig forundersøgelse</h2>
          <p>
            Nogle behandlinger (bl.a. permanent hårfjerning og tatoveringsfjernelse med laser) kræver ifølge Styrelsen for Patientsikkerhed en lovpligtig forundersøgelse hos vores læge eller sygeplejerske mindst 48 timer før selve behandlingen må finde sted. Forundersøgelsen er gratis og uforpligtende.
          </p>

          <h2>3. Priser og betaling</h2>
          <p>
            Alle priser på hjemmesiden er i danske kroner (DKK) og er inklusiv moms, hvor dette er gældende. Vi forbeholder os retten til at ændre priserne uden forudgående varsel. Den pris der var gældende på tidspunktet for bookingen, vil dog altid være gældende for den specifikke aftale.
          </p>
          <p>
            Betaling for behandlinger sker typisk i klinikken efter endt behandling (medmindre forudbetaling er valgt via Planway). Gavekort købes og betales online via Planway.
          </p>
          <p>
            <strong>Studierabat:</strong> Vi tilbyder 10% i studierabat i HELE åbningstiden mod fremvisning af gyldigt studiekort. Bemærk at studierabatten ikke kan kombineres med i forvejen nedsatte priser eller pakkeløsninger.
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
