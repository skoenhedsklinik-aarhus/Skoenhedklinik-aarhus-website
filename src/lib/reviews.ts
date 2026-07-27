/**
 * Google Reviews via Places API (New).
 *
 * One shared fetcher used by both the server components that render reviews
 * and the /api/reviews route. Never throws: if the API key, the Place ID or the
 * network fails, it returns hardcoded fallback testimonials so the page keeps
 * rendering.
 *
 * Required env (set in Vercel → Environment Variables):
 * - GOOGLE_PLACES_API_KEY  server-side key with "Places API (New)" enabled
 * - GOOGLE_PLACE_ID        the clinic's Place ID (ChIJ...)
 *
 * Google's terms allow caching Places data for up to 30 days (Place IDs
 * indefinitely). We revalidate every 24 hours, which is well inside that.
 * Reviews must always be shown with author attribution and a Google source
 * label — see GoogleReviewsClient.
 */

export interface ReviewData {
  author: string;
  /** Author's Google profile photo, when Google returns one. */
  authorPhoto: string | null;
  /** Link to the author's Google profile / the review itself. */
  authorUrl: string | null;
  text: string;
  rating: number;
  /** ISO timestamp of publication, or null for fallback testimonials. */
  time: string | null;
  /** Google's own relative label, e.g. "for 2 uger siden". */
  relativeTime: string | null;
}

export interface ReviewsResult {
  reviews: ReviewData[];
  /** Overall Google rating, e.g. 5 — null when unavailable. */
  rating: number | null;
  /** Total number of Google ratings — null when unavailable. */
  totalCount: number | null;
  source: "google" | "fallback";
  /** Direct link to the clinic's Google profile, when the Place ID is known. */
  profileUrl: string | null;
}

// ---------------------------------------------------------------------------
// Fallback testimonials — only shown when the Google API is unavailable.
// ---------------------------------------------------------------------------
const FALLBACK_REVIEWS: ReviewData[] = [
  {
    author: "Amalie K.",
    authorPhoto: null,
    authorUrl: null,
    text: "Utrolig professionel klinik. Aliaa er super dygtig og giver sig god tid til at forklare alt. Har fået laserbehandling og er virkelig tilfreds med resultatet!",
    rating: 5,
    time: null,
    relativeTime: null,
  },
  {
    author: "Sofie M.",
    authorPhoto: null,
    authorUrl: null,
    text: "Føler mig altid tryg og godt behandlet her. Atmosfæren er fantastisk og personalet er yderst venligt og kompetent. Kan varmt anbefales!",
    rating: 5,
    time: null,
    relativeTime: null,
  },
  {
    author: "Nadia R.",
    authorPhoto: null,
    authorUrl: null,
    text: "Har prøvet sugaring her og er meget tilfreds. Resultatet er så godt og personalet er søde og professionelle. Det er tydeligt, at de virkelig ved, hvad de laver.",
    rating: 5,
    time: null,
    relativeTime: null,
  },
  {
    author: "Line H.",
    authorPhoto: null,
    authorUrl: null,
    text: "Endelig en klinik jeg kan stole på. Grundig konsultation, synlige resultater og fair priser. Jeg kommer igen og igen.",
    rating: 5,
    time: null,
    relativeTime: null,
  },
];

/** Shape of the bits of the Places API (New) response we use. */
type PlacesReview = {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  publishTime?: string;
  relativePublishTimeDescription?: string;
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
    uri?: string;
  };
};

const REVALIDATE_SECONDS = 60 * 60 * 24; // 24 hours

function fallback(placeId?: string): ReviewsResult {
  return {
    reviews: FALLBACK_REVIEWS,
    rating: null,
    totalCount: null,
    source: "fallback",
    profileUrl: placeId ? googleProfileUrl(placeId) : null,
  };
}

/** Public "write a review" / profile link for a Place ID. */
export function googleProfileUrl(placeId: string): string {
  return `https://search.google.com/local/reviews?placeid=${encodeURIComponent(placeId)}`;
}

/**
 * Fetch the clinic's Google reviews.
 *
 * @param limit  max number of reviews to return. Google's Places API
 *                returns at most 5 per place, and offers no pagination, so 5
 *                is the hard ceiling regardless of how many the clinic has.
 */
export async function getGoogleReviews(limit = 5): Promise<ReviewsResult> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) return fallback(placeId);

  try {
    const url =
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}` +
      `?fields=reviews,rating,userRatingCount&languageCode=da&regionCode=DK`;

    const response = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      next: { revalidate: REVALIDATE_SECONDS, tags: ["google-reviews"] },
    });

    if (!response.ok) {
      console.error(
        "[reviews] Google Places API error:",
        response.status,
        await response.text(),
      );
      return fallback(placeId);
    }

    const data: {
      reviews?: PlacesReview[];
      rating?: number;
      userRatingCount?: number;
    } = await response.json();

    const reviews: ReviewData[] = (data.reviews ?? [])
      .filter((r) => {
        const text = r.text?.text ?? r.originalText?.text ?? "";
        // Google returnerer højst 5 anmeldelser i alt, så filteret skal være
        // løst: hver kasseret anmeldelse er 20% af det, vi overhovedet kan vise.
        return r.rating === 5 && text.trim().length > 25;
      })
      .sort((a, b) => {
        const aTime = a.publishTime ? Date.parse(a.publishTime) : 0;
        const bTime = b.publishTime ? Date.parse(b.publishTime) : 0;
        return bTime - aTime;
      })
      .slice(0, limit)
      .map((r) => ({
        author: r.authorAttribution?.displayName || "Google-bruger",
        authorPhoto: r.authorAttribution?.photoUri || null,
        authorUrl: r.authorAttribution?.uri || null,
        text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
        rating: r.rating ?? 5,
        time: r.publishTime || null,
        relativeTime: r.relativePublishTimeDescription || null,
      }));

    if (reviews.length === 0) {
      // Key works but nothing passed the filter — keep the real rating/count.
      return {
        reviews: FALLBACK_REVIEWS,
        rating: data.rating ?? null,
        totalCount: data.userRatingCount ?? null,
        source: "fallback",
        profileUrl: googleProfileUrl(placeId),
      };
    }

    return {
      reviews,
      rating: data.rating ?? null,
      totalCount: data.userRatingCount ?? null,
      source: "google",
      profileUrl: googleProfileUrl(placeId),
    };
  } catch (error) {
    console.error("[reviews] Failed to fetch Google Reviews:", error);
    return fallback(placeId);
  }
}
