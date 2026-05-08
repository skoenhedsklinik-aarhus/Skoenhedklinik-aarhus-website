import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="bg-cognac text-cream py-20 flex items-center justify-center min-h-[300px]">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-heading mb-4 text-cream">
          Klar til at booke?
        </h2>
        <p className="text-lg md:text-xl mb-8 text-cream/90 max-w-xl mx-auto">
          Book en gratis konsultation, og lad os finde den rette behandling til dig.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/book">
            <Button size="lg" className="bg-cream text-cognac hover:bg-cream/90 text-lg px-8 rounded-full h-14">
              Book online
            </Button>
          </Link>
          <a
            href="tel:+4561445999"
            className="text-cream hover:text-white underline underline-offset-4 font-medium transition-colors"
          >
            Ring til os: 61 44 59 99
          </a>
        </div>
      </div>
    </section>
  );
}
