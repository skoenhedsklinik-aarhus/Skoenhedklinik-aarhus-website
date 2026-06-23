import { describe, it, expect } from "vitest";
import {
  localBusinessSchema,
  medicalProcedureSchema,
  faqPageSchema,
  reviewsSchema,
} from "./schema";

describe("localBusinessSchema", () => {
  it("produces a valid LocalBusiness/MedicalBusiness node", () => {
    const schema = localBusinessSchema();
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toEqual(["LocalBusiness", "MedicalBusiness"]);
    expect(schema.telephone).toBe("+4561445999");
    expect(schema.address.addressLocality).toBe("Aarhus C");
  });

  it("omits aggregateRating when no rating is supplied", () => {
    expect(localBusinessSchema()).not.toHaveProperty("aggregateRating");
  });

  it("includes aggregateRating when supplied", () => {
    const schema = localBusinessSchema({
      aggregateRating: { ratingValue: 4.9, reviewCount: 120 },
    });
    expect(schema.aggregateRating).toMatchObject({
      "@type": "AggregateRating",
      ratingValue: 4.9,
      reviewCount: 120,
      bestRating: 5,
      worstRating: 1,
    });
  });
});

describe("medicalProcedureSchema", () => {
  const service = {
    name: "Laser hårfjerning",
    short_description: "Permanent hårreduktion.",
    slug: "laser-haarfjerning",
    category: "Laser",
  };

  it("builds the canonical service URL from the slug", () => {
    const schema = medicalProcedureSchema(service);
    expect(schema["@type"]).toBe("MedicalProcedure");
    expect(schema.url).toMatch(/\/behandlinger\/laser-haarfjerning$/);
    expect(schema.code.code).toBe("Laser");
  });

  it("falls back to the default OG image when no hero image is set", () => {
    const schema = medicalProcedureSchema({ ...service, hero_image_url: null });
    expect(schema.image).toMatch(/\/images\/og-default\.jpg$/);
  });

  it("uses the hero image when provided", () => {
    const schema = medicalProcedureSchema({
      ...service,
      hero_image_url: "https://cdn.example.com/hero.jpg",
    });
    expect(schema.image).toBe("https://cdn.example.com/hero.jpg");
  });
});

describe("faqPageSchema", () => {
  it("strips HTML tags from answers for clean schema output", () => {
    const schema = faqPageSchema([
      { question: "Gør det ondt?", answer: "<p>Nej, <strong>slet</strong> ikke.</p>" },
    ]);
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe("Nej, slet ikke.");
  });

  it("maps each FAQ item to a Question node", () => {
    const schema = faqPageSchema([
      { question: "Q1", answer: "A1" },
      { question: "Q2", answer: "A2" },
    ]);
    expect(schema.mainEntity).toHaveLength(2);
    expect(schema.mainEntity[1].name).toBe("Q2");
  });
});

describe("reviewsSchema", () => {
  it("maps reviews to Review nodes with ratings", () => {
    const schema = reviewsSchema([
      { author: "Amalie", text: "Super klinik", rating: 5 },
    ]);
    expect(schema).toHaveLength(1);
    expect(schema[0]["@type"]).toBe("Review");
    expect(schema[0].author.name).toBe("Amalie");
    expect(schema[0].reviewRating.ratingValue).toBe(5);
  });

  it("includes datePublished only when a time is provided", () => {
    const [withTime, withoutTime] = reviewsSchema([
      { author: "A", text: "t", rating: 5, time: "2026-01-01" },
      { author: "B", text: "t", rating: 4 },
    ]);
    expect(withTime).toHaveProperty("datePublished", "2026-01-01");
    expect(withoutTime).not.toHaveProperty("datePublished");
  });
});
