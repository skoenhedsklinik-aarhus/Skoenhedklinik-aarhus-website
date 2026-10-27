import { createServiceClient } from "@/lib/supabase/service";
import type { MatchedIdentity } from "@/lib/meta/matched-identity";
import type { Database } from "@/types/supabase";

/**
 * Matchnøgler fra bookingens POST, så en webhook fra Planway kan kobles
 * tilbage til den browser, der bookede.
 *
 * Webhooken kommer fra Planways server. Den har ingen af kundens cookies, ingen
 * IP og intet samtykke at vise frem. Det har proxyen: bookingens POST passerer
 * vores server med både kundens cookies og kontaktoplysninger. Her gemmes det,
 * der skal til for at sende `Schedule` og `Purchase` med fuld matchkvalitet,
 * og kun med samtykke.
 *
 * Koblingen sker på hashet mail og telefon. De hashes med samme normalisering
 * i proxyen og i webhooken (hashBookingIdentity), så de rammer samme streng.
 */

export type BookingIntent = Database["public"]["Tables"]["booking_intents"]["Row"];

/** Så længe en booking-webhook kan matche. Planway kalder inden for sekunder. */
const BOOKING_WINDOW_MS = 1000 * 60 * 60 * 2;
/** Samme levetid som _fbc og cnc_am. Ældre rækker slettes ved hver skrivning. */
const RETENTION_MS = 1000 * 60 * 60 * 24 * 90;

export type IntentInput = {
  eventId: string;
  visitorId?: string | null;
  identity: MatchedIdentity;
  fbc?: string | null;
  fbp?: string | null;
  externalId?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  testMode: boolean;
  treatment?: string | null;
  treatmentSlug?: string | null;
};

function clip(value: string | null | undefined, max: number): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

/**
 * Gem matchnøglerne for én booking. Returnerer false ved enhver fejl: en
 * booking må aldrig kunne fejle, fordi vi ville måle på den.
 */
export async function recordIntent(input: IntentInput): Promise<boolean> {
  const supabase = createServiceClient();
  if (!supabase) return false;

  const { error } = await supabase.from("booking_intents").upsert(
    [
      {
        event_id: input.eventId.slice(0, 80),
        visitor_id: clip(input.visitorId, 60),
        em: input.identity.em ?? null,
        ph: input.identity.ph ?? null,
        fn: input.identity.fn ?? null,
        ln: input.identity.ln ?? null,
        fbc: clip(input.fbc, 300),
        fbp: clip(input.fbp, 300),
        external_id: clip(input.externalId, 100),
        client_ip: clip(input.clientIp, 64),
        user_agent: clip(input.userAgent, 500),
        test_mode: input.testMode,
        treatment: clip(input.treatment, 120),
        treatment_slug: clip(input.treatmentSlug, 120),
        updated_at: new Date().toISOString(),
      } as never,
    ],
    { onConflict: "event_id" },
  );

  if (error) {
    console.error("[booking-intent] write error:", error.message);
    return false;
  }

  // Oprydning her i stedet for et cronjob. Ved omkring 10 bookinger om dagen
  // er det ét billigt delete pr. booking, og der er ingen job, der kan gå i stå.
  const cutoff = new Date(Date.now() - RETENTION_MS).toISOString();
  await supabase.from("booking_intents").delete().lt("created_at", cutoff);

  return true;
}

/**
 * Find den booking i browseren, som en "Ny booking"-webhook hører til, og
 * markér den som matchet, så den ikke kan matche to gange.
 *
 * Mail først, fordi den er entydig. Telefon bagefter, fordi en kunde kan have
 * skrevet mailen anderledes, end Planway har den. Nyeste umatchede inden for
 * to timer: sender en browser bookingformularen mere end én gang, er det den
 * seneste, /tak også bruger.
 */
export async function matchIntentForBooking(
  identity: MatchedIdentity | null,
  planway: { bookingId: string; customerId?: string | null },
): Promise<BookingIntent | null> {
  const supabase = createServiceClient();
  if (!supabase || !identity) return null;

  const since = new Date(Date.now() - BOOKING_WINDOW_MS).toISOString();

  for (const key of ["em", "ph"] as const) {
    const value = identity[key];
    if (!value) continue;

    const { data } = await supabase
      .from("booking_intents")
      .select("id")
      .eq(key, value)
      .is("matched_at", null)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1);

    const candidate = (data as { id: string }[] | null)?.[0];
    if (!candidate) continue;

    // matched_at IS NULL i selve opdateringen gør det sikkert, hvis to kald
    // fra Planway når frem samtidig: kun det ene får rækken tilbage.
    const { data: claimed } = await supabase
      .from("booking_intents")
      .update({
        matched_at: new Date().toISOString(),
        planway_booking_id: planway.bookingId,
        planway_customer_id: planway.customerId ?? null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", candidate.id)
      .is("matched_at", null)
      .select("*");

    const row = (claimed as BookingIntent[] | null)?.[0];
    if (row) return row;
  }

  return null;
}

/**
 * Find en kunde, der har givet samtykke og booket via sitet inden for 90
 * dage. Bruges til `Purchase` fra kassen, som kun må sendes for netop dem.
 *
 * Planway-kunde-id først, fordi salgswebhooken måske ikke har mail og telefon
 * med. Ellers mail, så telefon. Rækker ældre end 90 dage findes ikke længere.
 */
export async function findConsentedCustomer(
  identity: MatchedIdentity | null,
  customerId?: string | null,
): Promise<BookingIntent | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const since = new Date(Date.now() - RETENTION_MS).toISOString();
  const lookups: ["planway_customer_id" | "em" | "ph", string | undefined | null][] = [
    ["planway_customer_id", customerId],
    ["em", identity?.em],
    ["ph", identity?.ph],
  ];

  for (const [column, value] of lookups) {
    if (!value) continue;
    const { data } = await supabase
      .from("booking_intents")
      .select("*")
      .eq(column, value)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1);

    const row = (data as BookingIntent[] | null)?.[0];
    if (row) return row;
  }

  return null;
}
