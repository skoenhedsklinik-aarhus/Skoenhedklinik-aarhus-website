"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createPricingTier(data: any) {
  const supabase = createClient();

  const { error } = await supabase
    .from("pricing_tiers")
    .insert([
      {
        service_id: data.service_id || null,
        category: data.category,
        subcategory: data.subcategory || null,
        name: data.name,
        price_dkk: parseInt(data.price_dkk, 10),
        duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes, 10) : null,
        notes: data.notes || null,
        display_order: parseInt(data.display_order, 10) || 0,
        is_active: data.is_active,
      },
    ]);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/priser");
  revalidatePath("/priser");
  return { success: true };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updatePricingTier(id: string, data: any) {
  const supabase = createClient();

  const { error } = await supabase
    .from("pricing_tiers")
    .update({
        service_id: data.service_id || null,
        category: data.category,
        subcategory: data.subcategory || null,
        name: data.name,
        price_dkk: parseInt(data.price_dkk, 10),
        duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes, 10) : null,
        notes: data.notes || null,
        display_order: parseInt(data.display_order, 10) || 0,
        is_active: data.is_active,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/priser");
  revalidatePath("/priser");
  return { success: true };
}

export async function deletePricingTier(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("pricing_tiers")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/priser");
  revalidatePath("/priser");
  return { success: true };
}
