"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to monitoring (add Sentry / LogRocket here in Phase 2)
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center bg-cream"
    >
      <span className="text-sm font-medium tracking-widest uppercase text-cognac mb-6 block">
        Der opstod en fejl
      </span>
      <h1 className="font-heading text-5xl md:text-7xl text-textPrimary mb-6">
        Noget gik galt
      </h1>
      <p className="text-textBody text-lg max-w-md mb-10 leading-relaxed">
        Vi beklager ulejligheden. Prøv igen, eller gå tilbage til forsiden.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={reset}
          className="bg-cognac hover:bg-cognac-hover text-white rounded-full px-8"
        >
          Prøv igen
        </Button>
        <Link href="/">
          <Button
            variant="outline"
            className="border-cognac text-cognac hover:bg-cognac/5 rounded-full px-8"
          >
            Gå til forsiden
          </Button>
        </Link>
      </div>
    </main>
  );
}
