import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center bg-cream"
    >
      <span className="text-sm font-medium tracking-widest uppercase text-cognac mb-6 block">
        404 — Side ikke fundet
      </span>
      <h1 className="font-heading text-5xl md:text-7xl text-textPrimary mb-6">
        Siden eksisterer ikke
      </h1>
      <p className="text-textBody text-lg max-w-md mb-10 leading-relaxed">
        Den side du leder efter, kan vi desværre ikke finde. Den er måske blevet
        flyttet eller slettet.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button className="bg-cognac hover:bg-cognac-hover text-white rounded-full px-8">
            Gå til forsiden
          </Button>
        </Link>
        <Link href="/behandlinger">
          <Button
            variant="outline"
            className="border-cognac text-cognac hover:bg-cognac/5 rounded-full px-8"
          >
            Se behandlinger
          </Button>
        </Link>
      </div>
    </main>
  );
}
