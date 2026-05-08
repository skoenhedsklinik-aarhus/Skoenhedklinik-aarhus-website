import { createClient } from "@/lib/supabase/server";
import { PricingList } from "./PricingList";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminPriserPage() {
  const supabase = createClient();
  
  // Fetch pricing tiers
  const { data: pricingTiers } = await supabase
    .from("pricing_tiers")
    .select("*, services(name)")
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-3xl text-textPrimary">Priser</h1>
        <Link href="/admin/priser/ny">
          <Button className="bg-cognac hover:bg-cognac-hover text-white">
            Opret pris
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-xl border border-sand shadow-sm overflow-hidden">
        <PricingList initialData={pricingTiers || []} />
      </div>
    </div>
  );
}
