"use client";

import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { deletePricingTier } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

// The fetch query includes the joined service name
type PricingTier = Database["public"]["Tables"]["pricing_tiers"]["Row"] & {
  services?: { name: string } | null;
};

interface PricingListProps {
  initialData: PricingTier[];
}

export function PricingList({ initialData }: PricingListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på, at du vil slette denne pris?")) return;
    
    setLoadingId(id);
    const result = await deletePricingTier(id);
    
    if (result.success) {
      toast.success("Pris slettet");
      router.refresh();
    } else {
      toast.error("Der opstod en fejl: " + result.error);
    }
    setLoadingId(null);
  };

  if (initialData.length === 0) {
    return (
      <div className="p-8 text-center text-textBody">
        Der er ingen priser endnu.
      </div>
    );
  }

  // Group by category for easier viewing
  const grouped = initialData.reduce((acc, tier) => {
    const cat = tier.category || "andet";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tier);
    return acc;
  }, {} as Record<string, PricingTier[]>);

  return (
    <div className="overflow-x-auto">
      {Object.entries(grouped).map(([category, tiers]) => (
        <div key={category} className="mb-8 last:mb-0">
          <div className="bg-beige px-4 py-2 border-y border-sand">
            <h3 className="font-heading text-lg text-cognac capitalize">{category.replace("-", " ")}</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sand text-sm">
                <th className="p-4 font-medium text-textPrimary w-16">Rækkefølge</th>
                <th className="p-4 font-medium text-textPrimary">Navn / Underkategori</th>
                <th className="p-4 font-medium text-textPrimary">Tilknyttet Behandling</th>
                <th className="p-4 font-medium text-textPrimary">Pris</th>
                <th className="p-4 font-medium text-textPrimary">Aktiv</th>
                <th className="p-4 font-medium text-textPrimary text-right">Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.id} className="border-b border-sand hover:bg-beige/50 transition-colors">
                  <td className="p-4 text-textBody">{tier.display_order}</td>
                  <td className="p-4">
                    <div className="font-medium text-textPrimary">{tier.name}</div>
                    {tier.subcategory && <div className="text-sm text-textMuted">{tier.subcategory}</div>}
                  </td>
                  <td className="p-4 text-textBody text-sm">{tier.services?.name || "-"}</td>
                  <td className="p-4 text-textPrimary">{tier.price_dkk} kr.</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${tier.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {tier.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <Link href={`/admin/priser/${tier.id}`}>
                      <Button variant="outline" size="sm" className="h-8 border-sand text-textPrimary hover:bg-beige">
                        <Edit className="w-4 h-4 mr-2" /> Rediger
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDelete(tier.id)}
                      disabled={loadingId === tier.id}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> {loadingId === tier.id ? "Sletter..." : "Slet"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
