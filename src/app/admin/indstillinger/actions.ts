"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import { revalidatePath } from "next/cache";

type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

export async function updateSiteSettings(settings: SiteSettings) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Ikke autoriseret" };
  }

  try {
    const { error } = await supabase
      .from("site_settings")
      .update({
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        address: settings.address,
        instagram_url: settings.instagram_url,
        facebook_url: settings.facebook_url,
        cvr: settings.cvr,
      })
      .eq("id", settings.id);
      
    if (error) throw error;

    // Revalidate layout (header, footer) and contact page
    revalidatePath("/", "layout");
    revalidatePath("/kontakt");

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error updating site settings:", error);
    return { success: false, error: error.message };
  }
}
