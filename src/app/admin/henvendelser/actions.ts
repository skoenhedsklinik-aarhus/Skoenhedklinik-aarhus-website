"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function setLeadHandled(id: string, handled: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("consultation_leads")
    .update({ handled } as never)
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath("/admin/henvendelser");
  return { success: true };
}

export async function deleteLead(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("consultation_leads")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath("/admin/henvendelser");
  return { success: true };
}
