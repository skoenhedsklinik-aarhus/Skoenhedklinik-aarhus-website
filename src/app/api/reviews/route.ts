import { NextResponse } from "next/server";
import { getGoogleReviews, type ReviewsResult } from "@/lib/reviews";

/**
 * Public JSON endpoint for the clinic's Google reviews.
 *
 * The site's own components fetch reviews directly through `getGoogleReviews`
 * (server-side, no extra round trip). This route stays for external use and as
 * the quickest way to verify the Google setup in a browser: /api/reviews should
 * report `"source": "google"` once GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID are
 * set in Vercel.
 */
export const revalidate = 86400;

export async function GET(): Promise<NextResponse<ReviewsResult>> {
  const result = await getGoogleReviews(5);
  return NextResponse.json(result);
}
