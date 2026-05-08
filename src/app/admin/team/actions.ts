"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createTeamMember(data: any) {
  const supabase = createClient();

  const { error } = await supabase
    .from("team_members")
    .insert([
      {
        name: data.name,
        role: data.role,
        short_bio: data.short_bio,
        long_bio: data.long_bio,
        photo_url: data.photo_url,
        qualifications: data.qualifications || [],
        display_order: parseInt(data.display_order, 10),
        is_active: data.is_active,
      },
    ]);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/team");
  revalidatePath("/om-os");
  return { success: true };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateTeamMember(id: string, data: any) {
  const supabase = createClient();

  const { error } = await supabase
    .from("team_members")
    .update({
      name: data.name,
      role: data.role,
      short_bio: data.short_bio,
      long_bio: data.long_bio,
      photo_url: data.photo_url,
      qualifications: data.qualifications || [],
      display_order: parseInt(data.display_order, 10),
      is_active: data.is_active,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/team");
  revalidatePath("/om-os");
  return { success: true };
}

export async function deleteTeamMember(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/team");
  revalidatePath("/om-os");
  return { success: true };
}
