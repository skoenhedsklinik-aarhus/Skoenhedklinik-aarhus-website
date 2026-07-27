import { getGoogleReviews } from "@/lib/reviews";
import { GoogleReviewsClient } from "./GoogleReviewsClient";

/**
 * Reviews section on the homepage.
 *
 * Server component: pulls the clinic's real Google reviews (cached 24h) and
 * hands them to the animated client component. Falls back to generic client
 * testimonials — labelled "Klientudtalelse", not as Google reviews — whenever
 * GOOGLE_PLACES_API_KEY / GOOGLE_PLACE_ID are missing or Google errors out.
 */
export async function GoogleReviews() {
  const { reviews, rating, totalCount, source, profileUrl } =
    await getGoogleReviews(4);

  return (
    <GoogleReviewsClient
      reviews={reviews}
      rating={rating}
      totalCount={totalCount}
      profileUrl={profileUrl}
      isLive={source === "google"}
    />
  );
}
