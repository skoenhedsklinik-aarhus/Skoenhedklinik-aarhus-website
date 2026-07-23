import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Block = {
  heading?: string;
  text?: string;
  items?: string[];
};

type Facial = {
  name: string;
  tag?: string;
  duration: string;
  price: string;
  packagePrice?: string;
  image: string;
  intro: string;
  blocks: Block[];
};

// Behandlingsmenu for Ansigtsbehandling. Indholdet vedligeholdes her i koden,
// så hver behandling får sit eget forløb beskrevet. Billederne ligger i
// /public/images/services.
const FACIALS: Facial[] = [
  {
    name: "Microneedling",
    tag: "Ansigtsbehandling",
    duration: "ca. 60 min",
    price: "850 kr.",
    packagePrice: "Pakke med 3 behandlinger: 2.400 kr.",
    image: "/images/services/ansigtsbehandling.avif",
    intro:
      "Opnå fornyet og ungdommelig hud med vores microneedling-behandling. Små, præcise nåle stimulerer hudens egen kollagenproduktion og forbedrer hudens struktur. Behandlingen reducerer fine linjer, ar og pigmentforandringer og giver fastere, glattere og mere strålende hud. Den tilpasses din hudtype og dine behov og udføres med professionelle produkter og udstyr i trygge rammer.",
    blocks: [
      {
        heading: "Behandlingsforløb",
        items: [
          "Afrensning af huden",
          "Desinficering og klargøring af huden",
          "Microneedling med specialtilpasset serum",
          "Beroligende og fugtgivende maske",
          "Afsluttes med serum, øjencreme og dagcreme fra NEOSTRATA",
        ],
      },
    ],
  },
  {
    name: "Retinol Resurface",
    tag: "Eksklusiv peel med synlig effekt",
    duration: "ca. 30 min",
    price: "799 kr.",
    packagePrice: "Pakke med 4 behandlinger: 2.800 kr.",
    image: "/images/services/ansigtsbehandling-retinol.avif",
    intro:
      "En avanceret medicinsk peeling baseret på NEOSTRATA ProSystem, udelukkende til professionel brug. Ideel til dig, der ønsker at forbedre hudens struktur, reducere fine linjer og opnå en smukkere og mere ensartet hudtone. Peelingen med 3 % Retinol Boosting Complex giver synlig hudfornyelse uden downtime.",
    blocks: [
      {
        heading: "Særligt effektiv mod",
        items: [
          "Fine linjer og rynker",
          "Ujævn hudtone",
          "Pigmentforandringer",
          "Store porer",
          "Grov hudstruktur",
          "Akne og urenheder",
          "Træt og glansløs hud",
        ],
      },
      {
        heading: "Sådan foregår behandlingen",
        text: "Behandlingen starter med grundig afrensning. Herefter påføres et aktivt retinolkompleks på huden med en blød viftebørste. Du får enten en mild eller mere intensiv peel afhængigt af hudtype og behov.",
      },
      {
        heading: "Du kan forvente",
        items: [
          "En let prikkende eller varm fornemmelse",
          "Ingen neutralisering nødvendig, produktet bliver på huden i op til 8 timer",
          "Eventuel let afskalning i dagene efter (en naturlig proces)",
        ],
      },
      {
        heading: "Efterbehandling og pleje",
        text: "Efter behandlingen må du ikke anvende andre produkter samme dag. Peelingen skylles af derhjemme efter 8 timer afhængigt af hudtype og tolerance. Vi anbefaler NeoStrata Bionic Face Cream eller serum og en solcreme med høj faktor de følgende dage.",
        items: [
          "Undgå sol, varme, sauna og sved i 48 timer",
          "Undgå peeling, voks og skrappe produkter i 5 til 7 dage",
          "Undgå at pille eller trække i huden",
        ],
      },
    ],
  },
  {
    name: "Glow & Renew",
    tag: "Ansigtsbehandling",
    duration: "ca. 50 min",
    price: "599 kr.",
    image: "/images/services/ansigtsbehandling-glow.avif",
    intro:
      "En mild men effektiv ansigtsbehandling med PHA fra NEOSTRATA, som eksfolierer skånsomt, stimulerer cellefornyelsen og efterlader huden frisk, glat og strålende. Behandlingen passer til alle hudtyper, også sart hud.",
    blocks: [
      {
        heading: "Behandlingsforløb",
        items: [
          "Afrensning af huden",
          "Kemisk eksfoliering med PHA",
          "Ansigtsmassage eller let stimulering",
          "Beroligende og fugtgivende maske",
          "Afsluttes med serum, øjencreme og dagcreme fra NEOSTRATA",
        ],
      },
    ],
  },
  {
    name: "Clear Skin",
    tag: "Udrensende ansigtsbehandling",
    duration: "ca. 50 min",
    price: "579 kr.",
    image: "/images/services/ansigtsbehandling-clear-skin.avif",
    intro:
      "En effektiv behandling med NEOSTRATA, målrettet urenheder, tilstopninger og fedtet hud. Behandlingen renser i dybden uden at udtørre huden og efterlader den frisk, balanceret og beroliget.",
    blocks: [
      {
        heading: "Behandlingsforløb",
        items: [
          "Afrensning af huden",
          "Eksfoliering med AHA/PHA",
          "Dybderens (udtrækning)",
          "Beroligende og rensende maske",
          "Let ansigtsmassage med behandlende serum",
          "Afsluttes med fugtgivende dagcreme og øjencreme fra NEOSTRATA",
        ],
      },
    ],
  },
  {
    name: "Even Skin",
    tag: "Mod pigmentpletter og ujævn hudtone",
    duration: "ca. 50 min",
    price: "629 kr.",
    image: "/images/services/ansigtsbehandling-even-skin.avif",
    intro:
      "En effektiv behandling med AHA/PHA-syrer og antioxidanter fra NEOSTRATA, der arbejder målrettet på pigmentpletter, solskader og ujævn hudtone. Behandlingen lysner huden gradvist og forbedrer dens klarhed og glød. Ideel som del af et kurforløb.",
    blocks: [
      {
        heading: "Behandlingsforløb",
        items: [
          "Afrensning af huden",
          "Eksfoliering med AHA/PHA",
          "Påføring af pigmentudjævnende serum",
          "Let ansigtsmassage",
          "Lysnende og beroligende maske",
          "Afsluttes med dagcreme og øjencreme med antioxidantbeskyttelse fra NEOSTRATA",
        ],
      },
    ],
  },
  {
    name: "Firm & Smooth",
    tag: "Anti-aging behandling",
    duration: "ca. 55 min",
    price: "649 kr.",
    image: "/images/services/ansigtsbehandling-firm-smooth.avif",
    intro:
      "En avanceret anti-age behandling med NEOSTRATA, der målrettet mindsker fine linjer og rynker, forbedrer hudens fasthed og stimulerer cellefornyelsen. Kombinationen af AHA og Bionic PHA forbedrer hudens struktur og giver et mere glat, fast og ungdommeligt udtryk.",
    blocks: [
      {
        heading: "Behandlingsforløb",
        items: [
          "Afrensning af huden",
          "Eksfoliering med AHA og Bionic PHA",
          "Påføring af opstrammende serum",
          "Opstrammende og stimulerende massage",
          "Maske med anti-age effekt",
          "Afsluttes med intensiv fugtpleje og øjencreme fra NEOSTRATA",
        ],
      },
    ],
  },
  {
    name: "Hydra Boost",
    tag: "Intens fugtpleje",
    duration: "ca. 40 min",
    price: "499 kr.",
    image: "/images/services/ansigtsbehandling-hydra-boost.avif",
    intro:
      "En fugtgivende ansigtsbehandling med NEOSTRATA-produkter, der genopretter hudens fugtbalance og beroliger tør eller dehydreret hud. Perfekt som en opfriskende og blødgørende pleje til alle hudtyper.",
    blocks: [
      {
        heading: "Behandlingsforløb",
        items: [
          "Afrensning af huden",
          "Mild eksfoliering",
          "Fugtboostende serum",
          "Afslappende ansigtsmassage",
          "Fugtgivende og beroligende maske",
          "Afsluttes med øjencreme og dagcreme fra NEOSTRATA",
        ],
      },
    ],
  },
  {
    name: "Redness Rescue",
    tag: "Beroligende behandling for rødme og sensitiv hud",
    duration: "ca. 45 min",
    price: "549 kr.",
    image: "/images/services/ansigtsbehandling-redness.avif",
    intro:
      "En skånsom og styrkende behandling med NEOSTRATA, der reducerer rødme, irritation og inflammation. Særligt velegnet til dig med sensitiv hud, tendens til rødme, rosacea eller hud i ubalance. Behandlingen genopretter hudens barriere og giver øjeblikkelig ro og komfort.",
    blocks: [
      {
        heading: "Behandlingsforløb",
        items: [
          "Skånsom afrensning",
          "Mild eksfoliering med PHA (ekstra skånsom syre til sensitiv hud)",
          "Påføring af beroligende og styrkende serum",
          "Let massage med fugtgivende og antiinflammatoriske produkter",
          "Kølende og beroligende maske",
          "Afsluttes med reparerende dagcreme og øjencreme fra NEOSTRATA",
        ],
      },
    ],
  },
];

// Laveste enkeltpris blandt ansigtsbehandlingerne — bruges som prisanker
// ("fra X kr.") på behandlingssidens hero.
export const ANSIGTSBEHANDLING_FROM_PRICE = Math.min(
  ...FACIALS.map((f) => parseInt(f.price, 10)).filter((n) => Number.isFinite(n))
);

export function AnsigtsbehandlingerSection() {
  return (
    <section className="py-20 lg:py-28 bg-white border-t border-sand/40">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <div className="text-center mb-14">
          <span className="eyebrow text-cognac mb-4 block">Behandlingsmenu</span>
          <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light">
            Vores ansigtsbehandlinger
          </h2>
          <p className="text-textMuted text-base mt-4 max-w-xl mx-auto">
            Alle behandlinger tilpasses din hud. Vælg en behandling nedenfor og se
            forløb, varighed og pris. Er du i tvivl, lægger vi planen sammen ved en
            gratis konsultation.
          </p>
        </div>

        <Accordion defaultValue={["facial-0"]} className="space-y-4">
          {FACIALS.map((f, index) => (
            <AccordionItem
              key={f.name}
              value={`facial-${index}`}
              className="border border-sand/50 rounded-2xl bg-cream/40 px-5 sm:px-7 overflow-hidden transition-all duration-300"
            >
              <AccordionTrigger className="py-5 no-underline hover:no-underline group">
                <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4 pr-3 text-left">
                  <div>
                    <h3 className="font-heading text-xl md:text-2xl text-textPrimary font-medium group-hover:text-cognac transition-colors leading-tight">
                      {f.name}
                    </h3>
                    {f.tag && (
                      <p className="text-textMuted text-xs tracking-wide mt-0.5">{f.tag}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-textMuted text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {f.duration}
                    </span>
                    <span className="font-heading text-lg text-cognac font-medium tabular-nums whitespace-nowrap">
                      {f.price}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pb-8 pt-1">
                <div className="grid md:grid-cols-5 gap-7 lg:gap-9 items-start">
                  {/* Image */}
                  <div className="md:col-span-2">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl shadow-sm border border-sand/30">
                      <Image
                        src={f.image}
                        alt={`${f.name} ansigtsbehandling`}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="md:col-span-3">
                    <p className="text-textBody leading-relaxed font-light mb-6">
                      {f.intro}
                    </p>

                    {f.blocks.map((block, bi) => (
                      <div key={bi} className="mb-6 last:mb-0">
                        {block.heading && (
                          <h4 className="font-heading text-base text-textPrimary font-medium mb-3">
                            {block.heading}
                          </h4>
                        )}
                        {block.text && (
                          <p className="text-textBody text-sm leading-relaxed font-light mb-3 last:mb-0">
                            {block.text}
                          </p>
                        )}
                        {block.items && (
                          <ul className="space-y-2">
                            {block.items.map((item, ii) => (
                              <li
                                key={ii}
                                className="flex gap-3 items-start text-textBody text-sm leading-relaxed"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-cognac shrink-0 mt-2" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}

                    <div className="mt-7 flex flex-wrap items-center gap-4">
                      <Link href="/book?service=ansigtsbehandling">
                        <button className="px-7 py-3 bg-cognac hover:bg-cognac-hover text-white rounded-full text-xs font-semibold tracking-wide transition-colors">
                          Book nu
                        </button>
                      </Link>
                      {f.packagePrice && (
                        <span className="text-textMuted text-xs">{f.packagePrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
