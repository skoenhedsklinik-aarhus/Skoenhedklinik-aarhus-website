import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Supabase med service role. KUN til server-kode, der ikke har en bruger:
 * Planways webhooks og proxyens matchnøgler.
 *
 * Tabellerne booking_intents og planway_webhook_events kan ikke nås med
 * anon-nøglen overhovedet (RLS uden policies), så det er den eneste vej ind.
 * Uden SUPABASE_SERVICE_ROLE_KEY returneres null, og kalderen gør ingenting.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
