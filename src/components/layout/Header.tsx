"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
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
import { Menu, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TREATMENTS = [
  { name: "Laser hårfjerning", slug: "laser-haarfjerning" },
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
  // Only show header AFTER the hero has fully expanded
  const [heroExpanded, setHeroExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = usePathname();
  // The scroll-expansion hero (which dispatches "heroExpanded") only exists on
  // the homepage. Every other route should show the header immediately.
  const isHome = pathname === "/";

  useEffect(() => {
    setHeroExpanded(!isHome);
  }, [isHome]);

  useEffect(() => {
    // Only the homepage hero drives expansion; ignore the event elsewhere.
    if (!isHome) return;
    const onHeroExpanded = (e: Event) => {
      const detail = (e as CustomEvent<{ expanded: boolean }>).detail;
      setHeroExpanded(detail.expanded);
      // Reset scrolled state when hero collapses
      if (!detail.expanded) setScrolled(false);
    };

    window.addEventListener("heroExpanded", onHeroExpanded);
    return () => window.removeEventListener("heroExpanded", onHeroExpanded);
  }, [isHome]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Glass/cream when scrolled down after hero, dark transparent right after expansion
  const atTop = !scrolled;

  return (
    <AnimatePresence>
      {heroExpanded && (
        <motion.header
          key="header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 left-0 right-0 z-50 w-full border-b"
          style={{
            backgroundColor: atTop ? "rgba(0,0,0,0)" : "rgba(250,246,240,0.92)",
            backdropFilter: atTop ? "blur(0px)" : "blur(16px)",
            WebkitBackdropFilter: atTop ? "blur(0px)" : "blur(16px)",
            borderBottomColor: atTop ? "rgba(232,224,213,0)" : "rgba(232,224,213,0.5)",
            transition: "background-color 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease",
          }}
        >
          {/* Top scrim — keeps white nav legible over light hero media */}
          {atTop && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent" />
          )}
          <div className="container relative z-10 mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className={`font-heading text-2xl font-medium tracking-tight transition-colors duration-300 ${
                atTop ? "text-white" : "text-textPrimary"
              }`}
            >
              Skønhedsklinik Aarhus
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`flex items-center gap-1 transition-colors duration-300 outline-none font-medium text-sm tracking-wide ${
                    atTop ? "text-white/90 hover:text-white" : "text-textBody hover:text-textPrimary"
                  }`}
                >
                  Behandlinger <ChevronDown className="h-3.5 w-3.5 mt-0.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[420px] p-5 grid grid-cols-2 gap-1 rounded-xl bg-cream/95 backdrop-blur-md border border-sand shadow-xl">
                  {TREATMENTS.map((t) => (
                    <DropdownMenuItem key={t.slug} className="cursor-pointer hover:bg-beige rounded-lg p-0 focus:bg-beige">
                      <Link
                        href={`/behandlinger/${t.slug}`}
                        className="w-full text-textBody hover:text-textPrimary px-3 py-2 block text-sm transition-colors"
                      >
                        {t.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {["Priser", "Om os", "Kontakt"].map((label) => (
                <Link
                  key={label}
                  href={`/${label.toLowerCase().replace(" ", "-").replace("ø", "o")}`}
                  className={`transition-colors duration-300 font-medium text-sm tracking-wide ${
                    atTop ? "text-white/90 hover:text-white" : "text-textBody hover:text-textPrimary"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Book CTA */}
            <div className="hidden lg:block">
              <Link href="/book">
                <button
                  className={`rounded-full px-7 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 ${
                    atTop
                      ? "bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm"
                      : "bg-cognac hover:bg-cognac-hover text-white"
                  }`}
                >
                  Book nu
                </button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger>
                <button
                  className={`lg:hidden p-2 transition-colors duration-300 ${
                    atTop ? "text-white" : "text-textPrimary"
                  }`}
                  aria-label="Åbn menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[380px] bg-noir border-l border-white/10 p-0">
                <div className="flex flex-col h-full p-8">
                  <div className="flex justify-between items-center mb-10">
                    <span className="font-heading text-xl text-cream">Menu</span>
                    <SheetClose className="text-cream/50 hover:text-cream transition-colors">
                      <X className="h-5 w-5" />
                    </SheetClose>
                  </div>

                  <nav className="flex flex-col gap-1 flex-grow">
                    <p className="eyebrow text-cognac-accent mb-4">Behandlinger</p>
                    <div className="flex flex-col gap-0.5 mb-8">
                      {TREATMENTS.map((t) => (
                        <Link
                          key={t.slug}
                          href={`/behandlinger/${t.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="text-cream/70 hover:text-cream text-sm py-2 px-3 rounded-lg hover:bg-white/5 transition-all"
                        >
                          {t.name}
                        </Link>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 border-t border-white/10 pt-6">
                      {[
                        { label: "Behandlinger", href: "/behandlinger" },
                        { label: "Priser", href: "/priser" },
                        { label: "Om os", href: "/om-os" },
                        { label: "Kontakt", href: "/kontakt" },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="font-heading text-2xl text-cream hover:text-cognac-light transition-colors py-1"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </nav>

                  <div className="mt-auto pt-8 border-t border-white/10">
                    <Link
                      href="/book"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full py-4 bg-cognac hover:bg-cognac-hover text-white rounded-full text-center text-sm font-medium tracking-wide transition-colors"
                    >
                      Book konsultation
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
