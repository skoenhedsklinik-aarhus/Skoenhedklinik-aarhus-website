import { Shield, Heart, Award, Clock } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Shield,
    title: "Certificerede specialister",
    description: "Registreret hos Styrelsen for Patientsikkerhed",
  },
  {
    icon: Heart,
    title: "Personlig rådgivning",
    description: "Vi tager os tid til at forstå dine ønsker",
  },
  {
    icon: Award,
    title: "Kvalitetsprodukter",
    description: "Vi bruger kun professionelle, godkendte produkter",
  },
  {
    icon: Clock,
    title: "Gratis konsultation",
    description: "Start altid med en uforpligtende samtale",
  },
];

export function TrustStrip() {
  return (
    <section className="bg-cream border-y border-sand py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center lg:text-left">
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} className="flex flex-col lg:flex-row items-center lg:items-start gap-4">
              <div className="bg-white p-3 rounded-full shrink-0 text-cognac shadow-sm border border-sand/50">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading text-lg md:text-xl font-medium text-textPrimary mb-1">
                  {item.title}
                </h4>
                <p className="text-textBody text-sm leading-relaxed max-w-[200px] lg:max-w-none mx-auto">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
