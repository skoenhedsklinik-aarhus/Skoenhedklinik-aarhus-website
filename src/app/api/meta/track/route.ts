import { NextResponse, type NextRequest } from "next/server";
import { sendMetaEvent } from "@/lib/meta/capi";

/**
 * Browser → Conversions API bridge.
 *
 * The browser fires the pixel event and posts the same event here with the same
 * `eventId`. This half reaches Meta even when the pixel is blocked, and Meta
 * deduplicates the pair on the event id.
 *
 * Deliberately narrow: only known event names are forwarded, only same-origin
 * requests are accepted, and no personal data is accepted from the client —
 * matching is done server-side from the _fbc/_fbp cookies, IP and user agent.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Events the site is allowed to forward. Anything else is ignored. */
const ALLOWED_EVENTS = new Set([
  "Lead",
  "Schedule",
  "InitiateCheckout",
  "ViewContent",
  "Contact",
]);

/** Only these custom_data keys are passed on to Meta. */
const ALLOWED_PARAMS = new Set([
  "content_name",
  "content_category",
  "content_type",
  "content_ids",
  "value",
  "currency",
  "search_string",
  "status",
]);

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  // Same-origin fetches from some browsers omit Origin entirely — allow those.
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

  let payload: {
    event?: string;
    eventId?: string;
    eventSourceUrl?: string;
    params?: Record<string, unknown>;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { event, eventId } = payload;
  if (!event || !eventId || !ALLOWED_EVENTS.has(event)) {
    // Quietly accept: a bad tracking call should never look like a site error.
    return NextResponse.json({ ok: false, ignored: true });
  }

  const customData: Record<string, string | number | string[]> = {};
  for (const [key, value] of Object.entries(payload.params ?? {})) {
    if (!ALLOWED_PARAMS.has(key)) continue;
    if (typeof value === "string") customData[key] = value.slice(0, 200);
    else if (typeof value === "number") customData[key] = value;
    else if (Array.isArray(value)) {
      customData[key] = value.slice(0, 10).map((v) => String(v).slice(0, 200));
    }
  }

  const sent = await sendMetaEvent({
    eventName: event,
    eventId: String(eventId).slice(0, 100),
    eventSourceUrl: payload.eventSourceUrl?.slice(0, 500),
    customData,
  });

  return NextResponse.json({ ok: sent });
}
