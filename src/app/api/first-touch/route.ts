import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { CONSENT_COOKIE, parseConsent } from "@/lib/consent";
import { cookieDomain, isSecureRequest } from "@/lib/identity";
import {
  FT_COOKIE,
  FT_MAX_AGE,
  buildFirstTouch,
  decodeFirstTouch,
  encodeFirstTouch,
} from "@/lib/first-touch";

/**
 * Sætter førsteberøringscookien `sk_ft`, server-side.
 *
 * Kaldes én gang fra klienten, når der er givet markedsføringssamtykke (se
 * <ConsentBanner /> og <PageViewTracker />). Cookien er den eneste kilde til,
 * hvilken annonce der oprindeligt bragte den besøgende hertil, uanset hvor
 * mange sider og besøg der går, før formularen udfyldes.
 *
 * Findes cookien allerede, returneres der med det samme, og der laves INTET
 * om. Første besøg vinder altid. Begrundelserne for server-side, HttpOnly og
 * 90 dage står i `src/lib/first-touch.ts`.
 *
 * Kroppen er landingssiden, ikke den aktuelle side: banneret gemmer den ved
 * mount, før der trykkes. Ellers ville en person, der accepterer på side fem,
 * få side fem registreret som sin landingsside.
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

  // Samtykket er en forudsætning, ikke en formalitet. Uden det skrives der
  // ingen cookie, og dermed logges der heller ingen sidevisninger.
  if (parseConsent(request.cookies.get(CONSENT_COOKIE)?.value) !== "granted") {
    return NextResponse.json({ ok: true, set: false });
  }

  // Allerede sat: rør den ikke.
  if (decodeFirstTouch(request.cookies.get(FT_COOKIE)?.value)) {
    return NextResponse.json({ ok: true, set: false });
  }

  let body: { url?: unknown; referrer?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    // Ingen krop: så bliver det en førsteberøring uden landingsside frem for
    // slet ingen. Besøgs-id'et er det vigtigste felt.
  }

  const firstTouch = buildFirstTouch(
    randomUUID(),
    typeof body.url === "string" ? body.url : undefined,
    typeof body.referrer === "string" ? body.referrer : undefined,
  );

  const response = NextResponse.json({ ok: true, set: true });
  response.cookies.set({
    name: FT_COOKIE,
    value: encodeFirstTouch(firstTouch),
    maxAge: FT_MAX_AGE,
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: isSecureRequest(request),
    ...(cookieDomain(request.headers.get("host"))
      ? { domain: cookieDomain(request.headers.get("host")) }
      : {}),
  });
  return response;
}

export async function GET() {
  return NextResponse.json({ error: "Brug POST" }, { status: 405 });
}
