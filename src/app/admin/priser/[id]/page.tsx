import { PricingForm } from "../PricingForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function EditPricingPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  // Fetch pricing tier
  const { data: tier, error } = await supabase
    .from("pricing_tiers")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !tier) {
    notFound();
  }

  // Fetch services for dropdown
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/priser" className="inline-flex items-center text-sm text-textBody hover:text-cognac transition-colors mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Tilbage til Priser
        </Link>
        <h1 className="font-heading text-3xl text-textPrimary">Rediger pris</h1>
      </div>
      
      <div className="bg-white rounded-xl p-8 border border-sand shadow-sm">
        <PricingForm initialData={tier} services={services || []} />
      </div>
    </div>
  );
}
