import type { Metadata } from "next";
import { FinalCTA } from "@/components/shared/FinalCTA";
import { MapPin, Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Gavekort — Skønhedsklinik Aarhus",
  description:
    "Giv gaven af velvære og selvforkælelse. Køb et gavekort til Skønhedsklinik Aarhus i klinikken eller over telefonen. Gyldigt i 3 år. Kan bruges til alle behandlinger.",
  alternates: { canonical: "/gavekort" },
  openGraph: {
    title: "Gavekort — Skønhedsklinik Aarhus",
    description:
      "Den perfekte gave — køb et gavekort til en, du holder af, og lad dem selv vælge behandling.",
    url: "/gavekort",
  },
};

export default function GiftCardPage() {
  return (
    <main className="flex flex-col min-h-screen bg-cream">
      {/* Hero */}
      <section className="pt-20 pb-10 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-textPrimary mb-4">
            Gavekort
          </h1>
          <p className="text-lg text-textBody">
            Giv gaven af velvære og selvforkælelse til en du holder af.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 pb-20 flex flex-col lg:flex-row gap-12 lg:gap-8">
        
        {/* Left Col: Sådan køber du */}
        {/*
          Online køb kommer tilbage, når klinikken har Geckos modul til online
          betaling. Så erstattes dette kort af Geckos gavekortshop.
        */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-xl p-8 md:p-10 shadow-sm border border-sand">
            <h2 className="font-heading text-2xl md:text-3xl text-textPrimary mb-3">
              Sådan køber du et gavekort
            </h2>
            <p className="text-textBody mb-8">
              Gavekort købes i klinikken eller over telefonen. Vælg et beløb, så klarer vi resten.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {["500 kr.", "1.000 kr.", "1.500 kr."].map((amount) => (
                <div
                  key={amount}
                  className="rounded-xl border border-sand bg-cream px-4 py-6 text-center"
                >
                  <span className="block text-xs uppercase tracking-wide text-textMuted mb-1">Gavekort</span>
                  <span className="font-heading text-2xl text-textPrimary">{amount}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="tel:+4561445999"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cognac px-6 py-3 text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Phone className="w-4 h-4" />
                Ring 61 44 59 99
              </a>
              <div className="inline-flex items-center gap-2 text-textBody text-sm">
                <MapPin className="w-4 h-4 text-cognac shrink-0" />
                Åboulevarden 39, 5. sal th., 8000 Aarhus C
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: FAQ */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-sand sticky top-24">
            <h2 className="font-heading text-2xl text-textPrimary mb-6">Værd at vide</h2>
            <Accordion defaultValue={["item-0"]}>
              <AccordionItem value="item-0" className="border-sand">
                <AccordionTrigger className="text-left font-medium text-textPrimary hover:text-cognac">
                  Hvor længe er gavekortet gyldigt?
                </AccordionTrigger>
                <AccordionContent className="text-textBody text-sm leading-relaxed pb-4">
                  Gavekort udstedt af Skønhedsklinik Aarhus er gyldige i 3 år fra udstedelsesdatoen i henhold til gældende lovgivning.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-1" className="border-sand">
                <AccordionTrigger className="text-left font-medium text-textPrimary hover:text-cognac">
                  Hvordan indløses det?
                </AccordionTrigger>
                <AccordionContent className="text-textBody text-sm leading-relaxed pb-4">
                  Gavekortet indløses fysisk nede i klinikken efter endt behandling. Du kan medbringe det udskrevet eller vise det på din telefon. Du booker blot tid online som normalt.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-transparent">
                <AccordionTrigger className="text-left font-medium text-textPrimary hover:text-cognac">
                  Kan gavekortet refunderes?
                </AccordionTrigger>
                <AccordionContent className="text-textBody text-sm leading-relaxed pb-4">
                  Gavekort kan refunderes til kontanter mod et gebyr inden for gavekortets gyldighedsperiode samt i op til 1 år efter udløb.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

      </div>

      <FinalCTA />
    </main>
  );
}
