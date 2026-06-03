import { createClient } from "@/lib/supabase/server";
import { LeadsList } from "./LeadsList";
import { Database } from "@/types/supabase";

type Lead = Database["public"]["Tables"]["consultation_leads"]["Row"];

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  // Read with the cookie-authenticated client so RLS grants the admin access.
  const supabase = createClient();
  const { data, error } = await supabase
    .from("consultation_leads")
    .select("*")
    .order("created_at", { ascending: false });

  const leads = (error ? [] : data ?? []) as Lead[];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-3xl text-textPrimary">Henvendelser</h1>
        <span className="text-sm text-textMuted">
          {leads.length} {leads.length === 1 ? "henvendelse" : "henvendelser"}
        </span>
      </div>

      <p className="text-textBody mb-6 max-w-2xl">
        Kunder, der har udfyldt &ldquo;Vi ringer dig op&rdquo;-formularen på
        forsiden. Markér en henvendelse som behandlet, når du har ringet dem op.
      </p>

      <div className="bg-white rounded-xl border border-sand shadow-sm overflow-hidden">
        <LeadsList initialData={leads} />
      </div>
    </div>
  );
}
