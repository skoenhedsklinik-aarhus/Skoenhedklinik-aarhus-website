import { describe, it, expect, vi, beforeEach } from "vitest";

const revalidatePath = vi.fn();
const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
}));

import { POST } from "./route";

// Minimal stand-in for NextRequest that only exposes what the handler reads.
function makeRequest(query: Record<string, string>) {
  const url = new URL("https://example.com/api/revalidate");
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  return { nextUrl: url } as unknown as Parameters<typeof POST>[0];
}

beforeEach(() => {
  revalidatePath.mockReset();
  revalidateTag.mockReset();
  process.env.REVALIDATION_SECRET = "s3cret";
});

describe("POST /api/revalidate — auth", () => {
  it("returns 401 when the secret is missing", async () => {
    const res = await POST(makeRequest({ path: "/" }));
    expect(res.status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns 401 when the secret is wrong", async () => {
    const res = await POST(makeRequest({ secret: "nope", path: "/" }));
    expect(res.status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("POST /api/revalidate — behaviour", () => {
  it("revalidates a path with a valid secret", async () => {
    const res = await POST(makeRequest({ secret: "s3cret", path: "/behandlinger" }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.revalidated).toBe(true);
    expect(body.path).toBe("/behandlinger");
    expect(revalidatePath).toHaveBeenCalledWith("/behandlinger");
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("revalidates a tag when no path is given", async () => {
    const res = await POST(makeRequest({ secret: "s3cret", tag: "services" }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.tag).toBe("services");
    expect(revalidateTag).toHaveBeenCalledWith("services");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns 400 when neither path nor tag is supplied", async () => {
    const res = await POST(makeRequest({ secret: "s3cret" }));
    expect(res.status).toBe(400);
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
