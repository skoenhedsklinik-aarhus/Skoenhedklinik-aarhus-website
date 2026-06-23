import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";

function googleReview(overrides: Record<string, unknown> = {}) {
  return {
    rating: 5,
    text: { text: "x".repeat(50) },
    authorAttribution: { displayName: "Reviewer" },
    publishTime: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.GOOGLE_PLACES_API_KEY;
  delete process.env.GOOGLE_PLACE_ID;
});

describe("GET /api/reviews — fallback paths", () => {
  it("returns fallback reviews when env vars are not configured", async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.source).toBe("fallback");
    expect(body.reviews.length).toBeGreaterThan(0);
    expect(body.rating).toBeNull();
  });

  it("falls back when the Google API responds non-OK", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "key";
    process.env.GOOGLE_PLACE_ID = "place";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("boom"),
      }),
    );
    const body = await (await GET()).json();
    expect(body.source).toBe("fallback");
  });

  it("falls back when fetch throws", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "key";
    process.env.GOOGLE_PLACE_ID = "place";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const body = await (await GET()).json();
    expect(body.source).toBe("fallback");
  });
});

describe("GET /api/reviews — Google data handling", () => {
  beforeEach(() => {
    process.env.GOOGLE_PLACES_API_KEY = "key";
    process.env.GOOGLE_PLACE_ID = "place";
  });

  function stubGoogle(payload: Record<string, unknown>) {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(payload),
      }),
    );
  }

  it("returns filtered Google reviews with rating and total count", async () => {
    stubGoogle({
      rating: 4.8,
      userRatingCount: 200,
      reviews: [googleReview({ authorAttribution: { displayName: "Amalie" } })],
    });
    const body = await (await GET()).json();
    expect(body.source).toBe("google");
    expect(body.rating).toBe(4.8);
    expect(body.total_count).toBe(200);
    expect(body.reviews[0].author).toBe("Amalie");
  });

  it("excludes non-5-star reviews and reviews with short text", async () => {
    stubGoogle({
      rating: 5,
      userRatingCount: 3,
      reviews: [
        googleReview({ rating: 4 }), // wrong rating
        googleReview({ text: { text: "for kort" } }), // too short
        googleReview({ authorAttribution: { displayName: "Keep" } }), // valid
      ],
    });
    const body = await (await GET()).json();
    expect(body.source).toBe("google");
    expect(body.reviews).toHaveLength(1);
    expect(body.reviews[0].author).toBe("Keep");
  });

  it("sorts reviews newest-first and caps the list at three", async () => {
    stubGoogle({
      rating: 5,
      userRatingCount: 9,
      reviews: [
        googleReview({ publishTime: "2024-01-01T00:00:00Z", authorAttribution: { displayName: "Oldest" } }),
        googleReview({ publishTime: "2026-06-01T00:00:00Z", authorAttribution: { displayName: "New" } }),
        googleReview({ publishTime: "2025-06-01T00:00:00Z", authorAttribution: { displayName: "Mid" } }),
        googleReview({ publishTime: "2025-01-01T00:00:00Z", authorAttribution: { displayName: "Older" } }),
      ],
    });
    const body = await (await GET()).json();
    expect(body.reviews).toHaveLength(3);
    // newest first, oldest of the four dropped by slice(0, 3)
    expect(body.reviews.map((r: { author: string }) => r.author)).toEqual(["New", "Mid", "Older"]);
  });

  it("falls back to hardcoded reviews when filtering leaves none", async () => {
    stubGoogle({ rating: 3, userRatingCount: 5, reviews: [googleReview({ rating: 3 })] });
    const body = await (await GET()).json();
    expect(body.source).toBe("fallback");
    expect(body.reviews.length).toBeGreaterThan(0);
  });
});
