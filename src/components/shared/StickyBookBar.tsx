"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, CalendarCheck } from "lucide-react";
import { trackConversion } from "@/lib/pixel";

/**
 * Site-wide sticky booking bar for mobile.
 *
 * Booking used to be one tap away only on treatment pages. Everywhere else —
 * including the homepage — a visitor had to find the hamburger menu first. On
 * the homepage it was worse still: the scroll-expansion hero keeps both the
 * header and the hero CTA hidden until the expansion finishes, so there was no
 * visible way to book at all on first paint.
 *
 * Treatment pages and ad landing pages already render <StickyMobileCTA />,
 * which does the same job with treatment context and a ViewContent event, so
 * this bar stays out of their way.
 */

/** Routes that must never show the bar. */
function isExcluded(pathname: string): boolean {
  // Treatment detail pages already render their own <StickyMobileCTA />.
  if (/^\/behandlinger\/[^/]+$/.test(pathname)) return true;
  // The booking page itself, and the post-booking confirmation.
  if (pathname === "/book" || pathname === "/tak") return true;
  return false;
}

export function StickyBookBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const excluded = isExcluded(pathname ?? "");
  // The homepage hero is full height, so wait until the visitor is past it.
  const threshold = pathname === "/" ? 700 : 320;

  useEffect(() => {
    if (excluded) return;
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [excluded, threshold]);

  if (excluded) return null;

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <div className="bg-cream/95 backdrop-blur-md border-t border-sand shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2.5">
          <Link
            href="/book"
            tabIndex={visible ? 0 : -1}
            className="flex-grow py-3.5 bg-cognac hover:bg-cognac-hover text-white rounded-full flex items-center justify-center gap-2 text-sm font-medium tracking-wide transition-colors"
          >
            <CalendarCheck className="w-4 h-4" />
            Book gratis konsultation
          </Link>
          <a
            href="tel:+4561445999"
            aria-label="Ring til klinikken"
            tabIndex={visible ? 0 : -1}
            onClick={() => trackConversion("Contact", { content_category: "sticky-bar" })}
            className="w-12 h-12 shrink-0 rounded-full border border-cognac/40 bg-white/70 flex items-center justify-center text-cognac hover:bg-cognac/5 transition-colors"
          >
            <Phone className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
