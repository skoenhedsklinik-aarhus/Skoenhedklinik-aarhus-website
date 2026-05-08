"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown } from "lucide-react";

const TREATMENTS = [
  { name: "Permanent hårfjerning", slug: "permanent-haarfjerning" },
  { name: "Tattoo fjernelse", slug: "tattoo-fjernelse" },
  { name: "Ansigtsbehandling", slug: "ansigtsbehandling" },
  { name: "Sugaring hårfjerning", slug: "sugaring" },
  { name: "Tandblegning", slug: "tandblegning" },
  { name: "Threading", slug: "threading" },
  { name: "BB Glow behandling", slug: "bb-glow" },
  { name: "Bryn & vipper", slug: "bryn-og-vipper" },
  { name: "Wax behandling", slug: "wax-behandling" },
  { name: "Mix Sugaring & wax", slug: "mix-sugaring-og-wax" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="w-full bg-cognac text-cream text-center py-2 text-sm font-medium tracking-wide uppercase">
        REGISTRERET HOS STYRELSEN FOR PATIENTSIKKERHED ✓
      </div>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 bg-white ${
          scrolled ? "shadow-sm border-b border-sand" : ""
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="font-heading text-2xl font-medium tracking-tight text-textPrimary">
            Skønhedsklinik Aarhus
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-textBody hover:text-textPrimary transition-colors outline-none font-medium">
                Behandlinger <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[400px] p-4 grid grid-cols-2 gap-2 rounded-xl">
                {TREATMENTS.map((t) => (
                  <DropdownMenuItem key={t.slug} className="cursor-pointer hover:bg-cream rounded-md p-0">
                    <Link href={`/behandlinger/${t.slug}`} className="w-full text-textBody px-2 py-1.5 block">
                      {t.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/priser" className="text-textBody hover:text-textPrimary transition-colors font-medium">
              Priser
            </Link>
            <Link href="/om-os" className="text-textBody hover:text-textPrimary transition-colors font-medium">
              Om os
            </Link>
            <Link href="/kontakt" className="text-textBody hover:text-textPrimary transition-colors font-medium">
              Kontakt
            </Link>
          </nav>

          <div className="hidden lg:block">
            <Link href="/book">
              <Button className="bg-cognac hover:bg-cognac-hover text-white rounded-full px-8">
                Book nu
              </Button>
            </Link>
          </div>

          {/* Mobile Nav */}
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="text-textPrimary" />}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-cream">
              <nav className="flex flex-col gap-6 mt-10">
                <div className="space-y-4">
                  <h4 className="font-medium text-textPrimary uppercase tracking-wider text-sm">Behandlinger</h4>
                  <div className="flex flex-col gap-3 pl-4 border-l border-sand">
                    {TREATMENTS.map((t) => (
                      <SheetClose key={t.slug} render={<Link href={`/behandlinger/${t.slug}`} className="w-full text-left text-textBody hover:text-cognac transition-colors py-2 px-4 rounded-lg hover:bg-beige block" />}>
                        {t.name}
                      </SheetClose>
                    ))}
                  </div>
                </div>
                <SheetClose render={<Link href="/behandlinger" className="w-full text-left font-heading text-3xl mb-4 text-textPrimary hover:text-cognac transition-colors block" />}>
                  Behandlinger
                </SheetClose>
                <SheetClose render={<Link href="/om-os" className="w-full text-left font-heading text-3xl text-textPrimary hover:text-cognac transition-colors block" />}>
                  Om os
                </SheetClose>
                <SheetClose render={<Link href="/kontakt" className="w-full text-left font-heading text-3xl text-textPrimary hover:text-cognac transition-colors block" />}>
                  Kontakt
                </SheetClose>
                <SheetClose render={<Link href="/book" className="mt-4 block" />}>
                  <Button className="w-full bg-cognac hover:bg-cognac-hover text-white rounded-full">
                    Book nu
                  </Button>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
