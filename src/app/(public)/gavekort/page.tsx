import { FinalCTA } from "@/components/shared/FinalCTA";
import { ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function GiftCardPage() {
  const iframeUrl = "https://skonhedsklinik-aarhus.planway.com/widget/buy_giftcard";

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
        
        {/* Left Col: Iframe */}
        <div className="w-full lg:w-2/3 flex flex-col items-center">
          <iframe
            src={iframeUrl}
            width="100%"
            style={{ minHeight: "800px", border: 0 }}
            title="Køb gavekort til Skønhedsklinik Aarhus"
            loading="lazy"
            allow="payment"
            className="bg-white rounded-xl shadow-sm"
          />
          <a
            href={iframeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center gap-2 text-textBody hover:text-cognac transition-colors"
          >
            Problemer med modulet? <strong className="font-medium">Åbn i nyt vindue</strong>
            <ExternalLink className="w-4 h-4" />
          </a>
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
