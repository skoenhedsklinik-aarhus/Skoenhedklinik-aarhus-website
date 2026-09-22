import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

/**
 * Bookinger, knyttet til den rejse der førte til dem.
 *
 * Bookingen sker inde i Planway. Det eneste, vi selv ser, er kvitteringen på
 * /tak, og den er bar: intet booking-id, intet navn, ingen mail, intet
 * telefonnummer. Derfor er en booking her et tidspunkt, en behandling og et
 * besøgs-id, ikke en person.
 *
 * Det rækker til det, spørgsmålet handler om: hvilken annonce gav bookinger,
 * hvad læste de først, og bookede et tidligere lead så en tid bagefter.
 */

export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

export type BookingInput = {
  visitor_id: string;
  event_id?: string | null;
  treatment?: string | null;
  treatment_slug?: string | null;
  value_dkk?: number | null;
};

function clip(value: string | null | undefined, max: number): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function writeClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Gemmer én booking. Returnerer false ved enhver fejl: en tabt række må
 * aldrig ramme den besøgende, og slet ikke på en kvitteringsside.
 *
 * Genindlæses /tak, kommer den samme event_id igen, og det unikke indeks
 * afviser rækken. Det tælles som en succes: bookingen ER registreret.
 */
export async function ingestBooking(input: BookingInput): Promise<boolean> {
  const supabase = writeClient();
  if (!supabase) return false;

  const vaerdi =
    typeof input.value_dkk === "number" && Number.isFinite(input.value_dkk) && input.value_dkk > 0
      ? input.value_dkk
      : null;

  const { error } = await supabase.from("bookings").insert([
    {
      visitor_id: input.visitor_id.slice(0, 60),
      occurred_at: new Date().toISOString(),
      event_id: clip(input.event_id, 80),
      treatment: clip(input.treatment, 120),
      treatment_slug: clip(input.treatment_slug, 120),
      value_dkk: vaerdi,
    } as never,
  ]);

  if (error) {
    // 23505 = unique_violation, altså den samme booking en gang til.
    if (error.code === "23505") return true;
    console.error("[booking] insert error:", error.message);
    return false;
  }
  return true;
}

/** Loft på listeopslaget i admin. */
const LIST_LIMIT = 1000;

/**
 * Bookinger pr. besøgs-id. Ét opslag til hele listen.
 * Tom map, hvis brugeren ikke må læse dem.
 */
export async function getBookings(visitorIds: string[]): Promise<Map<string, BookingRow[]>> {
  const pr = new Map<string, BookingRow[]>();
  const ids = Array.from(new Set(visitorIds.filter(Boolean)));
  if (ids.length === 0) return pr;

  const supabase = createSessionClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .in("visitor_id", ids)
    .order("occurred_at", { ascending: true })
    .limit(LIST_LIMIT);

  if (error || !data) {
    if (error) console.error("[booking] read error:", error.message);
    return pr;
  }

  for (const row of data as BookingRow[]) {
    const liste = pr.get(row.visitor_id);
    if (liste) liste.push(row);
    else pr.set(row.visitor_id, [row]);
  }
  return pr;
}

/**
 * De seneste bookinger, uanset besøgs-id.
 *
 * Bruges til listen i admin, så en booking fra en, der aldrig udfyldte
 * formularen, ikke bliver usynlig. Det er typisk flertallet: man kan booke
 * direkte uden at skrive til klinikken først.
 */
export async function getRecentBookings(limit = 200): Promise<BookingRow[]> {
  const supabase = createSessionClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error("[booking] list error:", error.message);
    return [];
  }
  return data as BookingRow[];
}
