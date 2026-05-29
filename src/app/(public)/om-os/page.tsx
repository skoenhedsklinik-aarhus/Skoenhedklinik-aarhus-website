import type { Metadata } from "next";
import Image from "next/image";
import { FinalCTA } from "@/components/shared/FinalCTA";
import { Shield, Heart, Sparkles, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Om os — Skønhedsklinik Aarhus",
  description:
    "Mød teamet bag Skønhedsklinik Aarhus. Læs om vores filosofi, værdier og de specialister, der gør en forskel for vores gæster hver dag. Registreret hos Styrelsen for Patientsikkerhed.",
  alternates: { canonical: "/om-os" },
  openGraph: {
    title: "Om os — Skønhedsklinik Aarhus",
    description:
      "Mød Aliaa, Lise og Louise — teamet bag Skønhedsklinik Aarhus. Professionelle behandlere med hjertet i det rigtige sted.",
    url: "/om-os",
  },
};

const VALUES = [
  {
    icon: Shield,
    title: "Sikkerhed først",
    description: "Din sikkerhed er vores absolutte førsteprioritet i alle behandlinger.",
  },
  {
    icon: Heart,
    title: "Personlig omsorg",
    description: "Vi tager os tid til at lytte og forstå dine unikke behov og ønsker.",
  },
  {
    icon: Sparkles,
    title: "Naturlige resultater",
    description: "Vores mål er altid at fremhæve din naturlige skønhed – ikke at ændre den.",
  },
  {
    icon: Eye,
    title: "Gennemsigtighed",
    description: "Ærlig rådgivning om hvad der er muligt, og klare priser uden overraskelser.",
  },
];

const PROFILES = [
  {
    name: "Aliaa Jamil",
    role: "Ejer & behandler",
    photo: "/images/team-aliaa.avif",
    bio: [
      "Jeg hedder Aliaa, og jeg kommer oprindeligt fra København. I 2010 blev jeg færdiguddannet fra NEXT/Cph West som kosmetiker – en uddannelse der gav mig et solidt fundament inden for både skønhed, hudpleje og æstetik. Siden da har jeg arbejdet i flere anerkendte klinikker i København, hvor jeg har oparbejdet stor erfaring inden for hudpleje, kropsbehandlinger og professionelle produkter. Med tiden udviklede jeg en særlig passion for huden, og i dag er jeg specialiseret i hudterapi og resultatorienteret pleje.",
      "Af kærlighedens vej flyttede jeg til Aarhus og startede et helt nyt kapitel i mit liv i denne smukke og varme by. Her grundlagde jeg min egen klinik, hvor jeg hver dag får lov til at arbejde med det, jeg elsker: at hjælpe mennesker med at føle sig smukke, selvsikre og godt tilpas i deres egen hud.",
      "Hos Skønhedsklinik Aarhus tilbyder jeg ansigtsbehandlinger, sugaring og voks, laser hårfjerning, tandblegning og meget mere. Jeg vælger altid behandlinger med omtanke og arbejder professionelt, trygt og omsorgsfuldt, så hver kunde får den bedste oplevelse.",
      "Som person er jeg nærværende, kærlig og imødekommende. For mig er skønhed ikke kun behandlinger – det er også følelsen af at blive set, hørt og mødt med varme. Min dør er åben for alle, og jeg ønsker, at alle der træder ind hos mig føler sig velkomne, trygge og værdsatte.",
    ],
  },
  {
    name: "Louise Simonsen",
    role: "Udd. sygeplejerske",
    photo: "/images/team-louise.avif",
    bio: [
      "Louise Simonsen er uddannet sygeplejerske i 2004 og har mange års erfaring som både konsultationssygeplejerske og behandler inden for laserhårfjerning og andre kosmetiske behandlinger. Siden 2017 har hun arbejdet specialiseret med laser, hudvurdering og rådgivning, og hun er certificeret til laserhårfjerning samt fuldt registreret i Styrelsen for Patientsikkerhed.",
      "Hos Skønhedsklinik Aarhus står Louise for de lovpligtige konsultationer. Her vurderer hun hudtype og hårtype og sikrer, at hver eneste kunde får en tryg, grundig og professionelt tilpasset behandling. Louise er rolig, omhyggelig og utrolig erfaren – og derfor føler kunder sig altid i gode hænder hos hende.",
      "Vi er meget stolte af at have Louise som en fast del af klinikken, og hun glæder sig til at tage imod dig til en gratis og uforpligtende konsultation.",
    ],
  },
  {
    name: "Lise Lindhal",
    role: "Speciallæge i dermatologi",
    photo: "/images/team-lise.avif",
    bio: [
      "Lise er speciallæge i dermatologi med mange års erfaring inden for området. Hun har en bred viden og interesse for kosmetiske behandlinger, herunder laserbehandlinger, og en omfattende forskererfaring med både en doktorgrad og en ph.d.-grad inden for dermatologi.",
      "Lise Lindahl, cand.med., dr.med., ph.d., lektor og speciallæge i dermatologi.",
    ],
  },
];

export default function AboutPage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* ─── Hero — soft pastel gradient ──────────────────────────── */}
      <section className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `radial-gradient(60% 80% at 78% 52%, rgba(240,184,150,0.62) 0%, transparent 60%),
              radial-gradient(55% 72% at 20% 34%, rgba(199,184,216,0.55) 0%, transparent 60%),
              radial-gradient(52% 60% at 50% 90%, rgba(236,201,205,0.5) 0%, transparent 65%),
              linear-gradient(160deg, #F4ECE2 0%, #FAF6F0 55%, #F3E7DC 100%)`,
          }}
        />
        <div className="container relative z-10 mx-auto px-4 lg:px-8 text-center pt-28 pb-16">
          <span className="eyebrow text-cognac mb-5 block">Skønhedsklinik Aarhus</span>
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-textPrimary font-light leading-[1.06] mb-6">
            Om klinikken
          </h1>
          <p className="text-textBody text-lg md:text-xl font-light max-w-xl mx-auto">
            Hos os møder du certificerede specialister, der brænder for naturlige resultater,
            tryghed og personlig rådgivning.
          </p>
        </div>
      </section>

      {/* ─── Story & philosophy ───────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <span className="eyebrow text-cognac mb-4 block">Vores filosofi</span>
          <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light mb-6">
            Ægte skønhed starter med tryghed
          </h2>
          <div className="w-16 h-px bg-cognac mx-auto mb-10" />
          <div className="text-textBody text-left font-light leading-relaxed space-y-5 text-base md:text-lg">
            <p>
              Skønhedsklinik Aarhus blev grundlagt med en klar vision: At skabe et rum, hvor
              faglighed, tryghed og nærvær går hånd i hånd. Vi tror på, at ægte skønhed starter
              med at føle sig godt tilpas i sin egen hud.
            </p>
            <p>
              Vores tilgang er altid holistisk. Vi lytter til dine ønsker, analyserer din hud og
              skræddersyr et behandlingsforløb, der giver mening for netop dig. For os handler det
              ikke om at ændre dit udseende, men om at fremhæve og bevare din naturlige skønhed med
              de mest skånsomme og effektive metoder på markedet.
            </p>
            <p>
              Vi holder os konstant opdaterede med den nyeste viden inden for skønhedsbranchen og
              investerer udelukkende i veldokumenteret, medicinsk godkendt udstyr for at sikre dig
              de bedste og sikreste resultater.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Values ───────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-beige border-y border-sand/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-14">
            <span className="eyebrow text-cognac mb-4 block">Det vi står for</span>
            <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light">
              Vores værdier
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {VALUES.map((val) => (
              <div
                key={val.title}
                className="glass-cream rounded-2xl p-8 text-center shadow-sm border border-sand/30"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-cognac/10 flex items-center justify-center text-cognac mb-6">
                  <val.icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-xl text-textPrimary font-medium mb-3">
                  {val.title}
                </h3>
                <p className="text-textBody text-sm leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Team — detailed profiles ─────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="eyebrow text-cognac mb-4 block">Vores team</span>
            <h2 className="font-heading text-3xl md:text-4xl text-textPrimary font-light mb-5">
              Mød holdet bag klinikken
            </h2>
            <p className="text-textBody text-base md:text-lg font-light leading-relaxed">
              Bag hver behandling står et erfarent hold af certificerede specialister — lær dem at
              kende herunder.
            </p>
          </div>

          <div className="space-y-16 lg:space-y-24">
            {PROFILES.map((p, i) => (
              <div
                key={p.name}
                className={`flex flex-col gap-8 lg:gap-16 items-center ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
                }`}
              >
                <div className="w-full lg:w-2/5 shrink-0">
                  <div className="relative aspect-[3/4] w-full max-w-[340px] mx-auto overflow-hidden rounded-2xl shadow-xl ring-1 ring-cognac/10">
                    <Image
                      src={p.photo}
                      alt={`${p.name} — ${p.role}`}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-3/5">
                  <span className="eyebrow text-cognac mb-3 block">{p.role}</span>
                  <h3 className="font-heading text-3xl md:text-4xl text-textPrimary font-light mb-6">
                    {p.name}
                  </h3>
                  <div className="space-y-4 text-textBody font-light leading-relaxed">
                    {p.bio.map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STPS trust badge ─────────────────────────────────────── */}
      <section className="py-20 px-4 bg-cream border-t border-sand/50 text-center">
        <div className="container mx-auto max-w-2xl">
          <div className="mx-auto w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mb-6">
            <Shield className="w-7 h-7 text-success" />
          </div>
          <h3 className="font-heading text-2xl md:text-3xl text-textPrimary font-light mb-4">
            Registreret hos Styrelsen for Patientsikkerhed
          </h3>
          <p className="text-textBody leading-relaxed mb-6">
            Din sikkerhed er vores absolutte førsteprioritet. Derfor er vi stolte af at være
            officielt registreret som behandlingssted hos Styrelsen for Patientsikkerhed. Det er din
            garanti for, at vi overholder alle lovkrav, hygiejnestandarder og retningslinjer for
            kosmetisk behandling.
          </p>
          <a
            href="https://stps.dk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cognac font-medium hover:text-cognac-hover hover:underline"
          >
            Læs mere på stps.dk →
          </a>
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}
