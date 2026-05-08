"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createService(data: any) {
  const supabase = createClient();

  const { error } = await supabase
    .from("services")
    .insert([
      {
        slug: data.slug,
        name: data.name,
        category: data.category,
        short_description: data.short_description,
        long_description: data.long_description,
        hero_image_url: data.hero_image_url,
        og_image_url: data.og_image_url,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        benefits: data.benefits || [],
        faq: data.faq || [],
        related_service_ids: data.related_service_ids || [],
        planway_service_id: data.planway_service_id || null,
        planway_staff_id: data.planway_staff_id || null,
        display_order: parseInt(data.display_order, 10) || 0,
        is_popular: data.is_popular,
        requires_consultation: data.requires_consultation,
        is_active: data.is_active,
      },
    ]);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/behandlinger");
  revalidatePath("/behandlinger");
  revalidatePath(`/behandlinger/${data.slug}`);
  return { success: true };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateService(id: string, data: any) {
  const supabase = createClient();

  const { error } = await supabase
    .from("services")
    .update({
        slug: data.slug,
        name: data.name,
        category: data.category,
        short_description: data.short_description,
        long_description: data.long_description,
        hero_image_url: data.hero_image_url,
        og_image_url: data.og_image_url,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        benefits: data.benefits || [],
        faq: data.faq || [],
        related_service_ids: data.related_service_ids || [],
        planway_service_id: data.planway_service_id || null,
        planway_staff_id: data.planway_staff_id || null,
        display_order: parseInt(data.display_order, 10) || 0,
        is_popular: data.is_popular,
        requires_consultation: data.requires_consultation,
        is_active: data.is_active,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/behandlinger");
  revalidatePath("/behandlinger");
  revalidatePath(`/behandlinger/${data.slug}`);
  return { success: true };
}

export async function deleteService(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/behandlinger");
  revalidatePath("/behandlinger");
  return { success: true };
}
