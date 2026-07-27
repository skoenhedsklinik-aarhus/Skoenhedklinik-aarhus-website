"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReviewData } from "@/lib/reviews";

/**
 * Presentational half of the reviews section. Data comes from the server
 * component <GoogleReviews /> so the Google API key never reaches the browser.
 *
 * Rendered as a horizontal scroll-snap carousel rather than a fixed grid: it
 * swipes on touch, has arrows on desktop, and does not need a code change if
 * the number of reviews grows.
 *
 * Google's Places API returns at most 5 reviews per place and offers no
 * pagination, so the carousel shows every review we can get. The real total is
 * shown in the badge, and the "se alle" link goes to the full Google profile.
 *
 * Google's Places terms require reviews to be shown with the author's name and
 * clearly attributed to Google — hence the author line and the "Google" badge.
 */

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} ud af 5 stjerner`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-cognac text-cognac" />
      ))}
    </div>
  );
}

/** 5 → "5,0" (Danish decimal comma). */
function formatRating(rating: number) {
  return rating.toFixed(1).replace(".", ",");
}

export function GoogleReviewsClient({
  reviews,
  rating,
  totalCount,
  profileUrl,
  isLive,
}: {
  reviews: ReviewData[];
  rating: number | null;
  totalCount: number | null;
  profileUrl: string | null;
  /** True when the reviews came from Google, false for fallback testimonials. */
  isLive: boolean;
}) {
  const displayRating = rating ?? 5;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, reviews.length]);

  /** Scroll by one card, whatever the current breakpoint makes that. */
  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  const badge = (
    <div className="glass-cream rounded-xl px-5 py-3.5 flex items-center gap-3 shrink-0">
      <div>
        <p className="text-2xl font-heading font-light text-textPrimary leading-none">
          {formatRating(displayRating)}
        </p>
        <div className="mt-1">
          <StarRow count={Math.round(displayRating)} />
        </div>
      </div>
      <div className="w-px h-10 bg-sand" />
      <div>
        <p className="text-xs text-textMuted uppercase tracking-wide font-medium">
          Google
        </p>
        <p className="text-xs text-textMuted">
          {totalCount ? `${totalCount} anmeldelser` : "Anmeldelser"}
        </p>
      </div>
    </div>
  );

  return (
    <section className="py-24 lg:py-32 bg-beige overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <span className="eyebrow text-cognac mb-4 block">Anmeldelser</span>
            <h2 className="font-heading text-4xl md:text-5xl text-textPrimary font-light">
              Hvad vores klienter siger
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {profileUrl ? (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 transition-transform hover:-translate-y-0.5"
                aria-label="Se alle anmeldelser på Google"
              >
                {badge}
              </a>
            ) : (
              badge
            )}

            {/* Arrows — desktop only; touch devices swipe instead. */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                disabled={!canPrev}
                aria-label="Forrige anmeldelser"
                className="w-10 h-10 rounded-full border border-sand bg-white/70 flex items-center justify-center text-textBody hover:text-cognac hover:border-cognac disabled:opacity-30 disabled:hover:text-textBody disabled:hover:border-sand transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                disabled={!canNext}
                aria-label="Flere anmeldelser"
                className="w-10 h-10 rounded-full border border-sand bg-white/70 flex items-center justify-center text-textBody hover:text-cognac hover:border-cognac disabled:opacity-30 disabled:hover:text-textBody disabled:hover:border-sand transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            role="region"
            aria-label="Anmeldelser"
          >
            {reviews.map((review, i) => (
              <motion.article
                key={`${review.author}-${i}`}
                data-review-card
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 3) * 0.08 }}
                className="snap-start shrink-0 w-[82%] sm:w-[46%] lg:w-[31%] glass-cream rounded-xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-300"
              >
                <StarRow count={review.rating} />
                <p className="text-textBody text-sm leading-relaxed flex-grow">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="border-t border-sand/60 pt-4">
                  <p className="font-medium text-textPrimary text-sm">
                    {review.author}
                  </p>
                  <p className="text-textMuted text-xs mt-0.5">
                    {isLive ? "Google-anmeldelse" : "Klientudtalelse"}
                    {review.relativeTime ? ` · ${review.relativeTime}` : ""}
                  </p>
                </div>
              </motion.article>
            ))}

            {/* Sidste kort: send folk videre til hele Google-profilen. */}
            {profileUrl && (
              <a
                data-review-card
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="snap-start shrink-0 w-[82%] sm:w-[46%] lg:w-[31%] rounded-xl p-6 flex flex-col items-center justify-center gap-3 border border-dashed border-cognac/40 text-center hover:bg-cognac/5 transition-colors"
              >
                <StarRow count={5} />
                <p className="font-heading text-xl text-textPrimary font-light">
                  {totalCount ? `Se alle ${totalCount} anmeldelser` : "Se alle anmeldelser"}
                </p>
                <p className="text-textMuted text-xs">
                  Åbner klinikkens profil på Google
                </p>
              </a>
            )}
          </div>
        </div>

        {/* Swipe-hint på touch, hvor der ikke er pile */}
        <p className="md:hidden text-center text-textMuted text-xs mt-4">
          Stryg til siden for flere anmeldelser
        </p>
      </div>
    </section>
  );
}
