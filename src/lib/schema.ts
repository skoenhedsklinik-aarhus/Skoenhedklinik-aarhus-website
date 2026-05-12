/**
 * Schema.org JSON-LD factory functions.
 * All functions return a plain object ready to be serialised with JSON.stringify
 * and embedded in a <script type="application/ld+json"> tag.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://skoenhedsklinik-aarhus.dk";
const CLINIC_NAME = "Skønhedsklinik Aarhus";
const CLINIC_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "Tordenskjoldsgade 61, st. th.",
  addressLocality: "Aarhus C",
  postalCode: "8000",
  addressCountry: "DK",
};

// ---------------------------------------------------------------------------
// LocalBusiness + MedicalBusiness — used on the homepage
// ---------------------------------------------------------------------------
export function localBusinessSchema(options?: {
  aggregateRating?: { ratingValue: number; reviewCount: number };
}) {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "MedicalBusiness"],
    name: CLINIC_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}/images/og-default.jpg`,
    description:
      "Certificeret skønhedsklinik i Aarhus C. Specialister i permanent hårfjerning, laser, ansigtsbehandlinger, sugaring og meget mere. Registreret hos Styrelsen for Patientsikkerhed.",
    telephone: "+4561445999",
    email: "info@skoenhedsklinik-aarhus.dk",
    address: CLINIC_ADDRESS,
    geo: {
      "@type": "GeoCoordinates",
      latitude: 56.1611,
      longitude: 10.2081,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday"],
        opens: "10:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "15:00",
      },
    ],
    currenciesAccepted: "DKK",
    priceRange: "$$",
    ...(options?.aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: options.aggregateRating.ratingValue,
        reviewCount: options.aggregateRating.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
}

// ---------------------------------------------------------------------------
// MedicalProcedure — used on each service detail page
// ---------------------------------------------------------------------------
export function medicalProcedureSchema(service: {
  name: string;
  short_description: string;
  slug: string;
  category: string;
  hero_image_url?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: service.name,
    description: service.short_description,
    url: `${SITE_URL}/behandlinger/${service.slug}`,
    image: service.hero_image_url || `${SITE_URL}/images/og-default.jpg`,
    procedureType: "https://schema.org/CosmeticProcedure",
    status: "https://schema.org/ActiveActionStatus",
    performer: {
      "@type": ["LocalBusiness", "MedicalBusiness"],
      name: CLINIC_NAME,
      url: SITE_URL,
      address: CLINIC_ADDRESS,
    },
    code: {
      "@type": "MedicalCode",
      codeSystem: "serviceCategory",
      code: service.category,
    },
  };
}

// ---------------------------------------------------------------------------
// FAQPage — used on service detail pages that have FAQ data
// ---------------------------------------------------------------------------
export function faqPageSchema(faqItems: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        // Strip HTML tags from the answer for clean schema output
        text: item.answer.replace(/<[^>]*>/g, "").trim(),
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// Review items — used on homepage if Google Reviews are available
// ---------------------------------------------------------------------------
export function reviewsSchema(
  reviews: Array<{ author: string; text: string; rating: number; time?: string }>,
) {
  return reviews.map((review) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "LocalBusiness",
      name: CLINIC_NAME,
    },
    author: {
      "@type": "Person",
      name: review.author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.text,
    ...(review.time && { datePublished: review.time }),
  }));
}
