import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { applyIdentityCookies, applyTestModeCookie } from "@/lib/identity";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Must run on the response updateSession actually returns. The Supabase
  // cookie adapter swaps `supabaseResponse` for a fresh NextResponse.next()
  // every time it writes a cookie, so anything set before that call would be
  // silently thrown away.
  //
  // Skips itself without marketing consent, and skips itself when the visitor
  // already has all three cookies — that keeps Set-Cookie off the response for
  // returning visitors so the static pages stay CDN-cacheable.
  applyIdentityCookies(request, response as NextResponse);

  // ?metatest=1 opts this browser alone into Meta's Test Events tool.
  applyTestModeCookie(request, response as NextResponse);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
