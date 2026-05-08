"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createPackage(data: any) {
  const supabase = createClient();

  const { error } = await supabase
    .from("packages_offers")
    .insert([
      {
        name: data.name,
        description: data.description,
        original_price_dkk: data.original_price_dkk ? parseInt(data.original_price_dkk, 10) : null,
        package_price_dkk: parseInt(data.package_price_dkk, 10),
        hero_image_url: data.hero_image_url || null,
        starts_at: data.starts_at || null,
        ends_at: data.ends_at || null,
        cta_text: data.cta_text || "Book pakken",
        planway_link: data.planway_link || null,
        display_order: parseInt(data.display_order, 10) || 0,
        is_active: data.is_active,
      },
    ]);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/pakker");
  // Assuming packages are shown on the homepage
  revalidatePath("/");
  return { success: true };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updatePackage(id: string, data: any) {
  const supabase = createClient();

  const { error } = await supabase
    .from("packages_offers")
    .update({
        name: data.name,
        description: data.description,
        original_price_dkk: data.original_price_dkk ? parseInt(data.original_price_dkk, 10) : null,
        package_price_dkk: parseInt(data.package_price_dkk, 10),
        hero_image_url: data.hero_image_url || null,
        starts_at: data.starts_at || null,
        ends_at: data.ends_at || null,
        cta_text: data.cta_text || "Book pakken",
        planway_link: data.planway_link || null,
        display_order: parseInt(data.display_order, 10) || 0,
        is_active: data.is_active,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/pakker");
  revalidatePath("/");
  return { success: true };
}

export async function deletePackage(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("packages_offers")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/pakker");
  revalidatePath("/");
  return { success: true };
}
