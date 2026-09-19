import { createClient } from "@/lib/supabase/server";

/**
 * Adgang til kunderejsen: kun ClicknContent.
 *
 * Det er et bevidst valg, ikke en detalje. Siden viser navne, telefonnumre og
 * hvad folk har læst på hjemmesiden, minut for minut. Klinikken er
 * dataansvarlig for leads, men kunderejsen er vores arbejdsredskab til at
 * vurdere annoncerne, og den skal ikke ligge åben i klinikkens eget admin.
 *
 * Rollen er flaget `cnc` i Supabase-brugerens app_metadata. app_metadata kan
 * kun skrives med service-nøglen, altså ikke af brugeren selv, og den følger
 * med i JWT'en. Derfor kan den samme regel håndhæves to steder:
 *
 *   her,  så siden svarer 404 til alle andre, og
 *   i RLS på touchpoints, så et direkte API-kald med klinikkens session
 *         får nul rækker, selv hvis nogen kender adressen.
 *
 * Sættes med:
 *   update auth.users
 *   set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"cnc": true}'::jsonb
 *   where email = '...';
 * Brugeren skal logge ud og ind igen, før flaget står i tokenet.
 */
export async function isCnc(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.app_metadata?.cnc === true;
  } catch {
    // Supabase utilgængelig eller ikke konfigureret: fejl lukket.
    return false;
  }
}
