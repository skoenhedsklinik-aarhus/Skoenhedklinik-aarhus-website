import { createClient } from "@/lib/supabase/server";
import { ServiceList } from "./ServiceList";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminBehandlingerPage() {
  const supabase = createClient();
  // Fetch all services, active or not, for the admin panel
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-3xl text-textPrimary">Behandlinger</h1>
        <Link href="/admin/behandlinger/ny">
          <Button className="bg-cognac hover:bg-cognac-hover text-white">
            Opret behandling
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-xl border border-sand shadow-sm overflow-hidden">
        <ServiceList initialData={services || []} />
      </div>
    </div>
  );
}
