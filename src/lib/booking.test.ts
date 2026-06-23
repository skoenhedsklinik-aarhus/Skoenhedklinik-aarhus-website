import { describe, it, expect } from "vitest";
import {
  buildPlanwayUrl,
  PLANWAY_BASE_URL,
  PLANWAY_SERVICE_PARAM,
} from "./booking";

describe("buildPlanwayUrl", () => {
  it("returns the bare base URL when no service id is given", () => {
    expect(buildPlanwayUrl()).toBe(PLANWAY_BASE_URL);
  });

  it("returns the bare base URL when service id is null", () => {
    expect(buildPlanwayUrl(null)).toBe(PLANWAY_BASE_URL);
  });

  it("returns the bare base URL when service id is an empty string", () => {
    expect(buildPlanwayUrl("")).toBe(PLANWAY_BASE_URL);
  });

  it("appends the service id as a query param when provided", () => {
    const url = new URL(buildPlanwayUrl("abc123"));
    expect(url.searchParams.get(PLANWAY_SERVICE_PARAM)).toBe("abc123");
    expect(url.origin + url.pathname).toBe(PLANWAY_BASE_URL);
  });

  it("URL-encodes service ids that contain special characters", () => {
    const url = new URL(buildPlanwayUrl("a b&c"));
    // The raw query string must be encoded...
    expect(url.search).toContain("a+b%26c");
    // ...but reading the param back must yield the original value.
    expect(url.searchParams.get(PLANWAY_SERVICE_PARAM)).toBe("a b&c");
  });
});
