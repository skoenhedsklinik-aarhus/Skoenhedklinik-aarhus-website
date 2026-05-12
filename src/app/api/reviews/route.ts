import { NextResponse } from "next/server";

// Revalidate every 24 hours
export const revalidate = 86400;

// ---------------------------------------------------------------------------
// Hardcoded fallback testimonials — shown when API key is missing or call fails
// ---------------------------------------------------------------------------
const FALLBACK_REVIEWS = [
  {
    author: "Amalie K.",
    text: "Utrolig professionel klinik. Aliaa er super dygtig og giver sig god tid til at forklare alt. Har fået laserbehandling og er virkelig tilfreds med resultatet!",
    rating: 5,
    time: null,
  },
  {
    author: "Sofie M.",
    text: "Føler mig altid tryg og godt behandlet her. Atmosfæren er fantastisk og personalet er yderst venligt og kompetent. Kan varmt anbefales!",
    rating: 5,
    time: null,
  },
  {
    author: "Nadia R.",
    text: "Har prøvet sugaring her og er meget tilfreds. Resultatet er så godt og personalet er søde og professionelle. Det er tydeligt, at de virkelig ved, hvad de laver.",
    rating: 5,
    time: null,
  },
];

export interface ReviewData {
  author: string;
  text: string;
  rating: number;
  time: string | null;
}

export interface ReviewsResponse {
  reviews: ReviewData[];
  rating: number | null;
  total_count: number | null;
  source: "google" | "fallback";
}

export async function GET(): Promise<NextResponse<ReviewsResponse>> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  // If env vars aren't set, return fallback immediately
  if (!apiKey || !placeId) {
    return NextResponse.json({
      reviews: FALLBACK_REVIEWS,
      rating: null,
      total_count: null,
      source: "fallback",
    });
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=reviews,rating,userRatingCount&languageCode=da`;

    const response = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      // Next.js fetch cache — revalidate every 24h
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      console.error("Google Places API error:", response.status, await response.text());
      throw new Error(`Google Places API returned ${response.status}`);
    }

    const data = await response.json();

    // Filter: 5-star reviews with meaningful text (> 40 chars), sorted newest first
    const filteredReviews: ReviewData[] = (data.reviews || [])
      .filter(
        (r: { rating: number; text?: { text?: string }; relativePublishTimeDescription?: string }) =>
          r.rating === 5 && r.text?.text && r.text.text.length > 40,
      )
      .sort(
        (
          a: { publishTime?: string },
          b: { publishTime?: string },
        ) => {
          const aTime = a.publishTime ? new Date(a.publishTime).getTime() : 0;
          const bTime = b.publishTime ? new Date(b.publishTime).getTime() : 0;
          return bTime - aTime;
        },
      )
      .slice(0, 3)
      .map(
        (r: {
          authorAttribution?: { displayName?: string };
          text?: { text?: string };
          rating: number;
          publishTime?: string;
        }) => ({
          author: r.authorAttribution?.displayName || "Anonym",
          text: r.text?.text || "",
          rating: r.rating,
          time: r.publishTime || null,
        }),
      );

    // If filtering leaves us with fewer than 3 reviews, pad with fallback
    const reviews =
      filteredReviews.length >= 1 ? filteredReviews : FALLBACK_REVIEWS;

    return NextResponse.json({
      reviews,
      rating: data.rating ?? null,
      total_count: data.userRatingCount ?? null,
      source: filteredReviews.length >= 1 ? "google" : "fallback",
    });
  } catch (error) {
    console.error("Failed to fetch Google Reviews, using fallback:", error);
    return NextResponse.json({
      reviews: FALLBACK_REVIEWS,
      rating: null,
      total_count: null,
      source: "fallback",
    });
  }
}
