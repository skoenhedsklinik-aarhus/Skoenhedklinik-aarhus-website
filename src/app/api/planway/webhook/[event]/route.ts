import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { handleWebhook, parsePayload } from "@/lib/planway/webhook";
import type { WebhookKind } from "@/lib/planway/store";

/**
 * Modtager for Planways webhooks (Apps → Webhooks i Planway).
 *
 *   Ny booking       → /api/planway/webhook/booking?token=…
 *   Slettet booking  → /api/planway/webhook/cancelled?token=…
 *   Nyt salg         → /api/planway/webhook/sale?token=…
 *
 * Planway signerer ikke sine kald, så adgangen er en hemmelig token i URL'en,
 * sammenlignet med PLANWAY_WEBHOOK_SECRET. Uden den kunne hvem som helst
 * sende falske bookinger og salg videre til Meta.
 *
 * Svarer 200 på alt, der har den rigtige token, også hvis noget fejler
 * internt. En fejl her er en målefejl, ikke en grund til, at Planway skal
 * gentage kaldet igen og igen.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS: Record<string, WebhookKind> = {
  booking: "booking",
  cancelled: "cancelled",
  sale: "sale",
};

function tokenIsValid(request: NextRequest): boolean {
  const expected = process.env.PLANWAY_WEBHOOK_SECRET;
  const given = request.nextUrl.searchParams.get("token");
  if (!expected || !given) return false;
  // Hash begge sider, så sammenligningen altid er lige lang og tager lige lang tid.
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { event: string } },
) {
  const kind = KINDS[params.event];
  if (!kind) return NextResponse.json({ ok: false }, { status: 404 });
  if (!tokenIsValid(request)) return NextResponse.json({ ok: false }, { status: 401 });

  try {
    await handleWebhook(kind, await parsePayload(request));
  } catch (error) {
    console.error(`[planway-webhook] ${kind} failed:`, error);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: "Brug POST" }, { status: 405 });
}
