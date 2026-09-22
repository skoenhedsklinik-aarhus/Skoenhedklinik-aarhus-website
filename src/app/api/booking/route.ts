import { NextResponse, type NextRequest } from "next/server";
import { FT_COOKIE, decodeFirstTouch } from "@/lib/first-touch";
import { ingestBooking } from "@/lib/bookings";

/**
 * Registrerer, at en booking blev gennemført, og knytter den til besøgs-id'et.
 *
 * Kaldes fra <BookingConfirmed /> på /tak, og KUN når den portvagt, der i
 * forvejen afgør, om Schedule-eventet må fyre, har sagt ja. Portvagten er
 * ikke duplikeret her: ville vi gætte på det samme to steder, ville de før
 * eller siden være uenige, og så ville tallene i admin og i Events Manager
 * ikke kunne afstemmes.
 *
 * Besøgs-id'et læses af sk_ft-cookien på serveren. Cookien er samtykke-gaten:
 * uden samtykke findes den ikke, og så registreres bookingen ikke her. Meta
 * får sit Schedule-event uafhængigt af denne rute.
 *
 * Svarer altid 200. En kvitteringsside må aldrig vise en fejl, fordi vi ikke
 * kunne måle.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headlesschrome|lighthouse|pagespeed|semrush|ahrefs|python-requests|curl\/|wget|node-fetch|axios|monitor|uptime|scrapy/i;

export async function POST(request: NextRequest) {
  const ikkeGemt = NextResponse.json({ ok: true, logged: false });

  const firstTouch = decodeFirstTouch(request.cookies.get(FT_COOKIE)?.value);
  if (!firstTouch) return ikkeGemt;

  const ua = request.headers.get("user-agent") || "";
  if (!ua || BOT_RE.test(ua)) return ikkeGemt;

  let body: {
    eventId?: unknown;
    treatment?: unknown;
    treatmentSlug?: unknown;
    value?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return ikkeGemt;
  }

  const gemt = await ingestBooking({
    visitor_id: firstTouch.id,
    event_id: typeof body.eventId === "string" ? body.eventId : null,
    treatment: typeof body.treatment === "string" ? body.treatment : null,
    treatment_slug: typeof body.treatmentSlug === "string" ? body.treatmentSlug : null,
    value_dkk: typeof body.value === "number" ? body.value : null,
  });

  return NextResponse.json({ ok: true, logged: gemt });
}

export async function GET() {
  return NextResponse.json({ error: "Brug POST" }, { status: 405 });
}
