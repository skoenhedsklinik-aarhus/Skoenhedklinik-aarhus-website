import { createClient } from "@/lib/supabase/server";
import { PackageList } from "./PackageList";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminPakkerPage() {
  const supabase = createClient();
  
  const { data: packages } = await supabase
    .from("packages_offers")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-3xl text-textPrimary">Pakker & Tilbud</h1>
        <Link href="/admin/pakker/ny">
          <Button className="bg-cognac hover:bg-cognac-hover text-white">
            Opret pakke
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-xl border border-sand shadow-sm overflow-hidden">
        <PackageList initialData={packages || []} />
      </div>
    </div>
  );
}
