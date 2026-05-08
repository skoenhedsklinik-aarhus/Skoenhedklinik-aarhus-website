"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import { revalidatePath } from "next/cache";

type OpeningHour = Database["public"]["Tables"]["opening_hours"]["Row"];

export async function updateOpeningHours(hours: OpeningHour[]) {
  const supabase = createClient();

  // Need to ensure the user is an admin
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Ikke autoriseret" };
  }

  try {
    for (const hour of hours) {
      const { error } = await supabase
        .from("opening_hours")
        .update({
          open_time: hour.is_closed ? null : hour.open_time,
          close_time: hour.is_closed ? null : hour.close_time,
          is_closed: hour.is_closed,
        } as never)
        .eq("day_of_week", hour.day_of_week);
        
      if (error) throw error;
    }

    // Revalidate paths that use opening hours
    revalidatePath("/kontakt");
    revalidatePath("/", "layout"); // Revalidate layout for footer

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error updating opening hours:", error);
    return { success: false, error: error.message };
  }
}
