"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { ReviewData } from "@/lib/reviews";

/**
 * Presentational half of the reviews section. Data comes from the server
 * component <GoogleReviews /> so the Google API key never reaches the browser.
 *
 * Google's Places terms require that reviews are shown with the author's name
 * and are clearly attributed to Google — hence the author line and the "Google"
 * badge linking to the clinic's profile.
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
        </motion.div>

        {/* Review cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reviews.map((review, i) => (
            <motion.div
              key={`${review.author}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
              className="glass-cream rounded-xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-300"
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
            </motion.div>
          ))}
        </div>

        {profileUrl && (
          <div className="mt-8 text-center">
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-textMuted hover:text-cognac transition-colors underline underline-offset-4"
            >
              Se alle anmeldelser på Google
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
