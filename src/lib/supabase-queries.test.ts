import { describe, it, expect, vi, beforeEach } from "vitest";

// A chainable query-builder stub. Every listed method returns the builder, and
// the builder itself is thenable so `await supabase.from(...).select(...)...`
// resolves to whatever `result` is set to by the current test.
let result: { data: unknown; error: unknown };
const builder: Record<string, unknown> = {};
for (const m of ["select", "eq", "order", "single"]) {
  builder[m] = vi.fn(() => builder);
}
(builder as { then: unknown }).then = (resolve: (v: unknown) => void) => resolve(result);

const fromMock = vi.fn(() => builder);
const createSupabaseClient = vi.fn((..._args: unknown[]) => ({ from: fromMock }));
// Lazy wrapper so the hoisted factory doesn't touch `createSupabaseClient`
// before it is initialised.
vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => createSupabaseClient(...args),
}));

// supabase-queries.ts reads the env vars at MODULE LOAD, not per call, so each
// test re-imports it fresh with the env it needs.
async function loadQueries(configured: boolean) {
  vi.resetModules();
  if (configured) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  } else {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
  return import("./supabase-queries");
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  createSupabaseClient.mockClear();
  fromMock.mockClear();
  result = { data: [], error: null };
});

describe("graceful degradation when env vars are missing", () => {
  it("returns [] from list queries without constructing a client", async () => {
    const queries = await loadQueries(false);
    expect(await queries.getServices()).toEqual([]);
    expect(await queries.getPricingTiers()).toEqual([]);
    expect(createSupabaseClient).not.toHaveBeenCalled();
  });

  it("returns {} from getSiteSettings", async () => {
    const queries = await loadQueries(false);
    expect(await queries.getSiteSettings()).toEqual({});
  });
});

describe("getServices", () => {
  it("filters out hidden service slugs (bb-glow)", async () => {
    const queries = await loadQueries(true);
    result = {
      data: [{ slug: "laser-haarfjerning" }, { slug: "bb-glow" }, { slug: "sugaring" }],
      error: null,
    };
    const services = await queries.getServices();
    expect(services.map((s) => s.slug)).toEqual(["laser-haarfjerning", "sugaring"]);
  });

  it("returns [] and logs when the query errors", async () => {
    const queries = await loadQueries(true);
    result = { data: null, error: { message: "db down" } };
    expect(await queries.getServices()).toEqual([]);
  });
});

describe("getSiteSettings", () => {
  it("reduces rows into a key/value map", async () => {
    const queries = await loadQueries(true);
    result = {
      data: [
        { key: "phone", value: "61445999" },
        { key: "email", value: "info@example.dk" },
      ],
      error: null,
    };
    expect(await queries.getSiteSettings()).toEqual({
      phone: "61445999",
      email: "info@example.dk",
    });
  });
});
