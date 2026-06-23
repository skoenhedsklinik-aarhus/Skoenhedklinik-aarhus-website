// @vitest-environment node
// Next's NextResponse.next() requires the platform (undici) Headers, which the
// jsdom environment shadows — run this file under the node environment.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// getUser is reconfigured per test to simulate logged-in / logged-out / error.
const getUser = vi.fn();
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser } }),
}));

import { updateSession } from "./middleware";

function request(pathname: string) {
  return new NextRequest(new URL(`https://example.com${pathname}`));
}

function locationOf(res: Response) {
  return res.headers.get("location");
}

beforeEach(() => {
  getUser.mockReset();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
});

describe("updateSession — Supabase configured", () => {
  it("redirects an unauthenticated user away from /admin to the login page", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await updateSession(request("/admin/priser"));
    expect(res.status).toBe(307);
    expect(locationOf(res)).toContain("/admin/login");
  });

  it("lets an unauthenticated user reach the login page", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await updateSession(request("/admin/login"));
    expect(locationOf(res)).toBeNull();
  });

  it("redirects an authenticated user away from the login page to the dashboard", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const res = await updateSession(request("/admin/login"));
    expect(res.status).toBe(307);
    expect(locationOf(res)).toContain("/admin");
  });

  it("lets an authenticated user reach a protected admin page", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const res = await updateSession(request("/admin/priser"));
    expect(locationOf(res)).toBeNull();
  });

  it("does not touch public routes", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await updateSession(request("/behandlinger"));
    expect(locationOf(res)).toBeNull();
  });

  it("treats an auth error as logged-out and fails closed on admin routes", async () => {
    getUser.mockRejectedValue(new Error("token expired"));
    const res = await updateSession(request("/admin/priser"));
    expect(locationOf(res)).toContain("/admin/login");
  });
});

describe("updateSession — Supabase not configured", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it("fails closed: redirects protected admin routes to login", async () => {
    const res = await updateSession(request("/admin/priser"));
    expect(locationOf(res)).toContain("/admin/login");
  });

  it("lets the login page and public routes through", async () => {
    expect(locationOf(await updateSession(request("/admin/login")))).toBeNull();
    expect(locationOf(await updateSession(request("/")))).toBeNull();
  });
});
