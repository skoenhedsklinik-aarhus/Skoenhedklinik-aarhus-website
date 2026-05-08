import { PricingForm } from "../PricingForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function NewPricingPage() {
  const supabase = createClient();
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
        <h1 className="font-heading text-3xl text-textPrimary">Opret ny pris</h1>
      </div>
      
      <div className="bg-white rounded-xl p-8 border border-sand shadow-sm">
        <PricingForm services={services || []} />
      </div>
    </div>
  );
}
