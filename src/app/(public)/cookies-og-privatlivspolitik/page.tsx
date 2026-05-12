import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies og Privatlivspolitik — Skønhedsklinik Aarhus",
  description:
    "Læs om hvordan Skønhedsklinik Aarhus behandler dine personoplysninger og vores brug af cookies. GDPR-kompatibel privatlivspolitik.",
  alternates: { canonical: "/cookies-og-privatlivspolitik" },
  robots: { index: true, follow: false },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex flex-col min-h-screen bg-cream">
      <section className="pt-20 pb-10 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl md:text-5xl text-textPrimary mb-4">
            Cookies og Privatlivspolitik
          </h1>
          <p className="text-textBody">Sidst opdateret: Maj 2026</p>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="container mx-auto max-w-3xl bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-sand prose prose-lg text-textBody prose-headings:font-heading prose-headings:text-textPrimary prose-a:text-cognac">
          <h2>1. Introduktion</h2>
          <p>
            Hos Skønhedsklinik Aarhus tager vi din databeskyttelse alvorligt. Denne politik forklarer, hvordan vi behandler dine personoplysninger og vores brug af cookies på hjemmesiden.
          </p>

          <h2>2. Cookies</h2>
          <p>
            Vores hjemmeside er designet til at være så privatlivsvenlig som muligt.
          </p>
          <ul>
            <li><strong>Analyse (Plausible Analytics):</strong> Vi bruger Plausible til at måle trafik på vores hjemmeside. Plausible er en privatlivsfokuseret løsning, der ikke bruger cookies og ikke indsamler nogen personhenførbare data. Derfor kræves der ikke samtykke til dette.</li>
            <li><strong>Tredjepartsindlejringer:</strong> Nogle sider indeholder indlejret indhold fra tredjeparter. Disse tjenester kan sætte deres egne cookies, som vi ikke har kontrol over:
              <ul>
                <li><strong>Planway (Booking):</strong> Vores bookingsystem og gavekort-modul er indlejret via Planway. Når du interagerer med disse moduler, gælder Planways cookie- og privatlivspolitik.</li>
                <li><strong>Google Maps:</strong> På vores kontaktside viser vi et kort fra Google Maps. Google kan placere cookies i din browser i denne forbindelse.</li>
              </ul>
            </li>
          </ul>

          <h2>3. Personoplysninger ved booking</h2>
          <p>
            Når du booker en tid hos os, sker dette gennem vores partner Planway. De oplysninger du indtaster (navn, e-mail, telefonnummer) behandles af Planway på vores vegne for at vi kan administrere din aftale og kontakte dig vedrørende din behandling.
          </p>

          <h2>4. Google Anmeldelser</h2>
          <p>
            På vores hjemmeside viser vi udvalgte anmeldelser fra vores Google Business profil. Disse hentes automatisk og vi gemmer ingen yderligere data om anmelderne lokalt.
          </p>

          <h2>5. Dine rettigheder (GDPR)</h2>
          <p>
            Ifølge persondataforordningen (GDPR) har du en række rettigheder i forhold til vores behandling af oplysninger om dig:
          </p>
          <ul>
            <li><strong>Ret til at se oplysninger (indsigtsret):</strong> Du har ret til at få indsigt i de oplysninger, som vi behandler om dig.</li>
            <li><strong>Ret til berigtigelse (rettelse):</strong> Du har ret til at få urigtige oplysninger om dig selv rettet.</li>
            <li><strong>Ret til sletning:</strong> I særlige tilfælde har du ret til at få slettet oplysninger om dig.</li>
            <li><strong>Ret til indsigelse:</strong> Du har i visse tilfælde ret til at gøre indsigelse mod vores ellers lovlige behandling af dine personoplysninger.</li>
          </ul>
          <p>
            Hvis du vil gøre brug af dine rettigheder, bedes du kontakte os på info@skoenhedsklinik-aarhus.dk.
          </p>

          <h2>6. Kontakt</h2>
          <p>
            Skønhedsklinik Aarhus<br />
            Tordenskjoldsgade 61, st. th.<br />
            8000 Aarhus C<br />
            CVR: 33091982<br />
            E-mail: info@skoenhedsklinik-aarhus.dk
          </p>
        </div>
      </section>
    </main>
  );
}
