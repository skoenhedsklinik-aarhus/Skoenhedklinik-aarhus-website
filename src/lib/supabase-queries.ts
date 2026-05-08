/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Use standard client for public queries so we can generate pages statically at build time
const createClient = () => createSupabaseClient(supabaseUrl, supabaseKey);

export async function getServices(): Promise<any[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching services:", error);
    return [];
  }
  return (data as any[]) || [];
}

export async function getServiceBySlug(slug: string): Promise<any> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error(`Error fetching service ${slug}:`, error);
    return null;
  }
  return data;
}

export async function getPricingTiers(): Promise<any[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pricing_tiers")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching pricing tiers:", error);
    return [];
  }
  return (data as any[]) || [];
}

export async function getTeamMembers(): Promise<any[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
  return (data as any[]) || [];
}

export async function getPackagesOffers(): Promise<any[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("packages_offers")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching packages offers:", error);
    return [];
  }
  return (data as any[]) || [];
}

export async function getOpeningHours(): Promise<any[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("opening_hours")
    .select("*")
    .order("day_of_week", { ascending: true });

  if (error) {
    console.error("Error fetching opening hours:", error);
    return [];
  }
  return (data as any[]) || [];
}

export async function getSiteSettings(): Promise<Record<string, any>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*");

  if (error) {
    console.error("Error fetching site settings:", error);
    return {};
  }
  
  const settings: Record<string, string | null> = {};
  data.forEach((row: any) => {
    settings[row.key] = row.value;
  });
  return settings;
}

export async function getTipsAndTricks(): Promise<any[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tips")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching tips:", error);
    return [];
  }
  return (data as any[]) || [];
}
