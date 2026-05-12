import type { Metadata } from "next";
import Image from "next/image";
import { getTeamMembers } from "@/lib/supabase-queries";
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
    description: "Din sikkerhed er vores absolutte førsteprioritet i alle behandlinger."
  },
  {
    icon: Heart,
    title: "Personlig omsorg",
    description: "Vi tager os tid til at lytte og forstå dine unikke behov og ønsker."
  },
  {
    icon: Sparkles,
    title: "Naturlige resultater",
    description: "Vores mål er altid at fremhæve din naturlige skønhed – ikke at ændre den."
  },
  {
    icon: Eye,
    title: "Gennemsigtighed",
    description: "Ærlig rådgivning om hvad der er muligt, og klare priser uden overraskelser."
  }
];

export default async function AboutPage() {
  const teamMembers = await getTeamMembers();

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative w-full h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/services/ansigtsbehandling.avif"
            alt="Klinikkens indretning"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6">
            Om os
          </h1>
          <p className="text-lg md:text-xl font-light max-w-2xl mx-auto opacity-90">
            Mød teamet bag Skønhedsklinik Aarhus og bliv klogere på vores filosofi.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-[720px] prose prose-lg text-textBody">
          <h2 className="font-heading text-3xl md:text-4xl text-textPrimary text-center mb-8">
            Vores historie og filosofi
          </h2>
          <p>
            Skønhedsklinik Aarhus blev grundlagt med en klar vision: At skabe et rum, hvor
            faglighed, tryghed og nærvær går hånd i hånd. Vi tror på, at ægte skønhed starter
            med at føle sig godt tilpas i sin egen hud.
          </p>
          <p>
            Vores tilgang er altid holistisk. Vi lytter til dine ønsker, analyserer din hud
            og skræddersyr et behandlingsforløb, der giver mening for netop dig. For os
            handler det ikke om at ændre dit udseende, men om at fremhæve og bevare din
            naturlige skønhed med de mest skånsomme og effektive metoder på markedet.
          </p>
          <p>
            Vi holder os konstant opdaterede med den nyeste viden inden for
            skønhedsbranchen og investerer udelukkende i veldokumenteret, medicinsk
            godkendt udstyr for at sikre dig de bedste og sikreste resultater.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-beige border-y border-sand">
        <div className="container mx-auto lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl text-textPrimary">
              Vores værdier
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {VALUES.map((val, i) => (
              <div key={i} className="bg-white rounded-xl p-8 text-center shadow-sm">
                <div className="mx-auto w-12 h-12 bg-cream rounded-full flex items-center justify-center text-cognac mb-6">
                  <val.icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-xl text-textPrimary mb-3">
                  {val.title}
                </h3>
                <p className="text-textBody text-sm">
                  {val.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto lg:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl text-textPrimary">
              Mød teamet
            </h2>
          </div>

          <div className="space-y-20">
            {teamMembers.map((member, index) => (
              <div 
                key={member.id} 
                className={`flex flex-col ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-10 md:gap-16 items-center`}
              >
                <div className="w-full md:w-1/3 shrink-0 flex justify-center">
                  <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] rounded-full overflow-hidden border-4 border-cream shadow-sm">
                    <Image
                      src={member.photo_url || "/placeholder.jpg"}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="w-full md:w-2/3 text-center md:text-left">
                  <h3 className="font-heading text-3xl text-textPrimary mb-1">
                    {member.name}
                  </h3>
                  <div className="text-cognac font-medium mb-6 text-lg">
                    {member.role}
                  </div>
                  <div 
                    className="prose prose-lg text-textBody mb-6"
                    dangerouslySetInnerHTML={{ __html: member.long_bio }}
                  />
                  {member.qualifications && Array.isArray(member.qualifications) && member.qualifications.length > 0 && (
                    <ul className="text-textBody space-y-2 mt-4 text-sm bg-cream p-4 rounded-lg inline-block text-left">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(member.qualifications as any[]).map((qual: any, qIdx: number) => (
                        <li key={qIdx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-cognac shrink-0" />
                          {String(qual)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STPS */}
      <section className="py-16 px-4 bg-moss/10 border-t border-moss/20 text-center">
        <div className="container mx-auto max-w-[720px]">
          <Shield className="w-10 h-10 text-moss mx-auto mb-4" />
          <h3 className="font-heading text-2xl text-textPrimary mb-4">
            Registreret hos Styrelsen for Patientsikkerhed
          </h3>
          <p className="text-textBody mb-6">
            Din sikkerhed er vores absolutte førsteprioritet. Derfor er vi stolte af at være officielt registreret som behandlingssted hos Styrelsen for Patientsikkerhed. Dette er din garanti for, at vi overholder alle lovkrav, hygiejnestandarder og retningslinjer for kosmetisk behandling.
          </p>
          <a 
            href="https://stps.dk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-moss font-medium hover:underline"
          >
            Læs mere på stps.dk →
          </a>
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}
