import { createServiceClient } from "@/lib/supabase/service";
import type { BookingIntent } from "@/lib/planway/intents";
import type { Json } from "@/types/supabase";

/**
 * Webhook-sporet og Planways oplysninger på bookingen.
 *
 * Sporet (planway_webhook_events) har én række pr. kald og ingen persondata.
 * Det gør ruten idempotent, hvis Planway gentager et kald, og det er det
 * eneste sted, hvor det sande antal online-bookinger, aflysninger og salg
 * står, også dem vi ikke kunne koble til en browser.
 */

export type WebhookKind = "booking" | "cancelled" | "sale";

export type LedgerInput = {
  kind: WebhookKind;
  planwayId: string | null;
  shape: Json;
  service?: string | null;
  amountDkk?: number | null;
  startsAt?: string | null;
};

/**
 * Skriv kaldet i sporet.
 * "duplicate" betyder, at Planway har sendt den samme booking eller det samme
 * salg før, og at kaldet skal ignoreres.
 */
export async function recordWebhookEvent(
  input: LedgerInput,
): Promise<{ status: "new"; id: string } | { status: "duplicate" | "error" }> {
  const supabase = createServiceClient();
  if (!supabase) return { status: "error" };

  const { data, error } = await supabase
    .from("planway_webhook_events")
    .insert([
      {
        kind: input.kind,
        planway_id: input.planwayId,
        shape: input.shape,
        service: input.service ?? null,
        amount_dkk: input.amountDkk ?? null,
        starts_at: input.startsAt ?? null,
      } as never,
    ])
    .select("id");

  if (error) {
    // 23505 = unique_violation på (kind, planway_id): et gentaget kald.
    if (error.code === "23505") return { status: "duplicate" };
    console.error("[planway-webhook] ledger error:", error.message);
    return { status: "error" };
  }

  const id = (data as { id: string }[] | null)?.[0]?.id;
  return id ? { status: "new", id } : { status: "error" };
}

export async function markWebhookEvent(
  id: string,
  patch: { matched: boolean; eventId?: string | null; capiSent?: boolean },
): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) return;
  await supabase
    .from("planway_webhook_events")
    .update({
      matched: patch.matched,
      event_id: patch.eventId ?? null,
      capi_sent: patch.capiSent ?? false,
    } as never)
    .eq("id", id);
}

export type ConfirmedBooking = {
  planwayBookingId: string;
  service?: string | null;
  priceDkk?: number | null;
  startsAt?: string | null;
};

/**
 * Læg Planways oplysninger på bookingrækken.
 *
 * Rækken findes allerede, hvis /tak nåede at rapportere. Ellers oprettes den
 * her, så en booking, hvor kunden lukkede fanen før kvitteringen, stadig står
 * i kunderejsen. /tak's senere indsættelse rammer så det unikke event_id og
 * tælles som registreret (se ingestBooking).
 */
export async function confirmBooking(
  intent: BookingIntent,
  booking: ConfirmedBooking,
): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) return;

  const planwayColumns = {
    planway_booking_id: booking.planwayBookingId,
    status: "confirmed",
    booked_service: booking.service ?? null,
    booked_price_dkk: booking.priceDkk ?? null,
    starts_at: booking.startsAt ?? null,
  };

  const update = () =>
    supabase
      .from("bookings")
      .update(planwayColumns as never)
      .eq("event_id", intent.event_id)
      .select("id");

  const { data: updated } = await update();
  if ((updated as unknown[] | null)?.length) return;
  if (!intent.visitor_id) return;

  const { error } = await supabase.from("bookings").insert([
    {
      visitor_id: intent.visitor_id,
      occurred_at: new Date().toISOString(),
      event_id: intent.event_id,
      treatment: booking.service ?? intent.treatment,
      treatment_slug: intent.treatment_slug,
      value_dkk: booking.priceDkk ?? null,
      ...planwayColumns,
    } as never,
  ]);

  // /tak kom os i forkøbet mellem opdateringen og indsættelsen.
  if (error?.code === "23505") await update();
  else if (error) console.error("[planway-webhook] booking insert error:", error.message);
}

/** Markér en booking som aflyst. Returnerer om der fandtes en række at markere. */
export async function cancelBooking(planwayBookingId: string): Promise<boolean> {
  const supabase = createServiceClient();
  if (!supabase) return false;

  const { data } = await supabase
    .from("bookings")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() } as never)
    .eq("planway_booking_id", planwayBookingId)
    .select("id");

  return Boolean((data as unknown[] | null)?.length);
}
