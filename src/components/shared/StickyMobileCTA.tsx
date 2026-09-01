"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone } from "lucide-react";
import { trackConversion } from "@/lib/pixel";

/**
 * Mobile-only sticky booking bar for treatment pages — the pages Facebook
 * ads land on. Keeps "book" and "ring" one thumb-tap away no matter how far
 * the visitor scrolls. Appears after the hero so it never covers the first
 * impression.
 *
 * Also fires `ViewContent` on mount, tagging which treatment was viewed (feeds
 * remarketing audiences + campaign optimization). Sent through both the browser
 * pixel and the Conversions API on one shared event id.
 */
export function StickyMobileCTA({
  serviceSlug,
  serviceName,
  bookHref,
  bookLabel = "Book en tid",
  contentCategory = "behandling",
}: {
  serviceSlug: string;
  serviceName: string;
  /** Override the primary button target (e.g. "#lead-form" on ad landing pages) */
  bookHref?: string;
  bookLabel?: string;
  contentCategory?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    trackConversion("ViewContent", {
      content_name: serviceName,
      content_category: contentCategory,
    });
  }, [serviceName, contentCategory]);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-cream/95 backdrop-blur-md border-t border-sand shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2.5">
          <Link
            href={bookHref ?? `/book?service=${serviceSlug}`}
            className="flex-grow py-3.5 bg-cognac hover:bg-cognac-hover text-white rounded-full text-center text-sm font-medium tracking-wide transition-colors"
          >
            {bookLabel}
          </Link>
          <a
            href="tel:+4561445999"
            aria-label="Ring til os"
            onClick={() => trackConversion("Contact", { content_name: serviceName })}
            className="w-12 h-12 shrink-0 rounded-full border border-cognac/40 bg-white/70 flex items-center justify-center text-cognac hover:bg-cognac/5 transition-colors"
          >
            <Phone className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
