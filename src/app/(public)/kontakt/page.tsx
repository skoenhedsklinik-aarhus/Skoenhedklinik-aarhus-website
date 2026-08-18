import type { Metadata } from "next";
import { getOpeningHours, getSiteSettings } from "@/lib/supabase-queries";
import { FinalCTA } from "@/components/shared/FinalCTA";
import { MapPin, Phone, Mail, Car, Bus, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontakt — Skønhedsklinik Aarhus",
  description:
    "Find os på Åboulevarden 39, 5. sal th., 8000 Aarhus C. Ring på +45 61 44 59 99 eller skriv til info@skoenhedsklinik-aarhus.dk. Se åbningstider og kort.",
  alternates: { canonical: "/kontakt" },
  openGraph: {
    title: "Kontakt — Skønhedsklinik Aarhus",
    description:
      "Adresse, telefonnummer, åbningstider og kort til Skønhedsklinik Aarhus i Aarhus C.",
    url: "/kontakt",
  },
};

export default async function ContactPage() {
  const openingHours = await getOpeningHours();
  const siteSettings = await getSiteSettings();

  const daysOfWeek = [
    "Søndag",
    "Mandag",
    "Tirsdag",
    "Onsdag",
    "Torsdag",
    "Fredag",
    "Lørdag",
  ];

  // Map and sort opening hours (Mandag = 1 to Søndag = 0 at the end)
  const sortedHours = [...openingHours].sort((a, b) => {
    const dayA = a.day_of_week === 0 ? 7 : a.day_of_week;
    const dayB = b.day_of_week === 0 ? 7 : b.day_of_week;
    return dayA - dayB;
  });

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="bg-cream py-20 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-textPrimary mb-6">
            Kontakt
          </h1>
          <p className="text-lg text-textBody leading-relaxed">
            Vi står altid klar til at besvare dine spørgsmål. Ring til os,
            eller kig forbi klinikken på Åboulevarden i Aarhus C.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left Col: Info */}
            <div className="space-y-12">
              <div className="space-y-8">
                <h2 className="font-heading text-3xl text-textPrimary">Praktisk information</h2>
                
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-beige rounded-full flex items-center justify-center text-cognac shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl text-textPrimary mb-1">Adresse</h3>
                    <p className="text-textBody">
                      Skønhedsklinik Aarhus<br />
                      {siteSettings.address_line_1 || "Åboulevarden 39, 5. sal th."}<br />
                      {siteSettings.address_line_2 || "8000 Aarhus C"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-beige rounded-full flex items-center justify-center text-cognac shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl text-textPrimary mb-1">Telefon</h3>
                    <a href={`tel:${siteSettings.phone || "+4561445999"}`} className="text-textBody hover:text-cognac transition-colors">
                      {siteSettings.phone_display || "+45 61 44 59 99"}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-beige rounded-full flex items-center justify-center text-cognac shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl text-textPrimary mb-1">E-mail</h3>
                    <a href={`mailto:${siteSettings.email || "info@skoenhedsklinik-aarhus.dk"}`} className="text-textBody hover:text-cognac transition-colors">
                      {siteSettings.email || "info@skoenhedsklinik-aarhus.dk"}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-beige rounded-full flex items-center justify-center text-cognac shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl text-textPrimary mb-1">Parkering</h3>
                    <p className="text-textBody">
                      Klinikken ligger i betalingszonen i midtbyen, og der er flere p-huse inden for få minutters gang.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-beige rounded-full flex items-center justify-center text-cognac shrink-0">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl text-textPrimary mb-1">Offentlig transport</h3>
                    <p className="text-textBody">
                      Klinikken ligger midt i Aarhus C med busstoppesteder få minutters gang væk.
                    </p>
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="bg-cream rounded-xl p-8 border border-sand">
                <div className="flex items-center gap-3 mb-6 border-b border-sand pb-4">
                  <Clock className="w-6 h-6 text-cognac" />
                  <h3 className="font-heading text-2xl text-textPrimary">Åbningstider</h3>
                </div>
                <ul className="space-y-3">
                  {sortedHours.map((hour) => (
                    <li key={hour.day_of_week} className="flex justify-between items-center text-textBody">
                      <span className="font-medium w-24">{daysOfWeek[hour.day_of_week]}</span>
                      {hour.is_closed ? (
                        <span className="text-textMuted italic">Lukket</span>
                      ) : (
                        <span className="font-[tabular-nums]">
                          {hour.open_time?.slice(0, 5)} – {hour.close_time?.slice(0, 5)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Col: Map */}
            <div className="h-[500px] lg:h-auto w-full min-h-[500px] rounded-2xl overflow-hidden border border-sand bg-cream">
              <iframe 
                src={siteSettings.google_maps_embed_src || "https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s%C3%85boulevarden+39,+8000+Aarhus+C!6i16!3m1!1sda!5m1!1sda"} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps over Skønhedsklinik Aarhus"
              ></iframe>
            </div>

          </div>
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}
