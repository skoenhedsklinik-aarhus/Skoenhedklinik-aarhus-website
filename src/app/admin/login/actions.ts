"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "MANGLER";
    return { error: `${error.message} [URL: ${url.slice(0, 40)}]` };
  }

  redirect("/admin");
}
