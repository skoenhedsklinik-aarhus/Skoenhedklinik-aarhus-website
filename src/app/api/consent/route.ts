import { NextResponse, type NextRequest } from "next/server";
import { CONSENT_COOKIE, CONSENT_MAX_AGE, parseConsent } from "@/lib/consent";
import { applyIdentityCookies, cookieDomain, isSecureRequest } from "@/lib/identity";

/**
 * Records the visitor's marketing-cookie choice.
 *
 * Why this is a server route rather than `document.cookie`: on "granted" it
 * also writes the identity cookies (cnc_uid / _fbc / _fbp) in the same
 * response, server-side, so they are not capped at 7 days by Safari's ITP.
 *
 * The banner passes back the `fbclid` it saw in the URL. Without that, the
 * click id of a visitor who arrives from an ad and accepts on the landing page
 * would be lost: the middleware may not see that page again before they
 * navigate on.
 *
 * On "denied" every marketing cookie we control is actively cleared.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let body: { value?: string; fbclid?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const consent = parseConsent(body.value);
  if (consent === "unknown") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, consent });
  const domain = cookieDomain(request.headers.get("host"));
  const secure = isSecureRequest(request);

  response.cookies.set({
    name: CONSENT_COOKIE,
    value: consent,
    maxAge: CONSENT_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure,
    httpOnly: false,
    ...(domain ? { domain } : {}),
  });

  if (consent === "granted") {
    // assumeConsent: the cookie above is on the response, not yet on the
    // request, so re-reading it here would still say "unknown".
    applyIdentityCookies(request, response, {
      fbclid: typeof body.fbclid === "string" ? body.fbclid.slice(0, 500) : null,
      assumeConsent: true,
    });
  } else {
    for (const name of ["cnc_uid", "_fbc", "_fbp"]) {
      response.cookies.set({
        name,
        value: "",
        maxAge: 0,
        path: "/",
        ...(domain ? { domain } : {}),
      });
    }
  }

  return response;
}
