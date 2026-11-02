"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { LASER_POPUP_SETTING } from "@/lib/laser-popup";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SiteSettings = any;

export async function updateSiteSettings(settings: SiteSettings) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Ikke autoriseret" };
  }

  try {
    const keys = ["contact_email", "contact_phone", "address", "instagram_url", "facebook_url", "cvr"];
    for (const key of keys) {
      if (settings[key] !== undefined) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: settings[key] } as never)
          .eq("key", key);
          
        if (error) throw error;
      }
    }

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

export async function setLaserPopupEnabled(enabled: boolean) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Ikke autoriseret" };
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: LASER_POPUP_SETTING, value: enabled ? "true" : "false" } as never, {
      onConflict: "key",
    });

  if (error) {
    console.error("Error updating laser popup setting:", error);
    return { success: false, error: error.message };
  }

  // Pop-up'en ligger i layoutet for alle offentlige sider.
  revalidatePath("/", "layout");

  return { success: true };
}
