"use client";

import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { deletePackage } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Package = Database["public"]["Tables"]["packages_offers"]["Row"];

interface PackageListProps {
  initialData: Package[];
}

export function PackageList({ initialData }: PackageListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på, at du vil slette denne pakke?")) return;
    
    setLoadingId(id);
    const result = await deletePackage(id);
    
    if (result.success) {
      toast.success("Pakke slettet");
      router.refresh();
    } else {
      toast.error("Der opstod en fejl: " + result.error);
    }
    setLoadingId(null);
  };

  if (initialData.length === 0) {
    return (
      <div className="p-8 text-center text-textBody">
        Der er ingen pakker eller tilbud endnu.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-beige border-b border-sand text-sm">
            <th className="p-4 font-medium text-textPrimary">Rækkefølge</th>
            <th className="p-4 font-medium text-textPrimary">Navn</th>
            <th className="p-4 font-medium text-textPrimary">Pris (DKK)</th>
            <th className="p-4 font-medium text-textPrimary">Aktiv Periode</th>
            <th className="p-4 font-medium text-textPrimary">Aktiv</th>
            <th className="p-4 font-medium text-textPrimary text-right">Handlinger</th>
          </tr>
        </thead>
        <tbody>
          {initialData.map((pkg) => (
            <tr key={pkg.id} className="border-b border-sand hover:bg-beige/50 transition-colors">
              <td className="p-4 text-textBody">{pkg.display_order}</td>
              <td className="p-4 font-medium text-textPrimary">{pkg.name}</td>
              <td className="p-4 text-textPrimary">
                {pkg.original_price_dkk && (
                  <span className="line-through text-textMuted text-xs mr-2">{pkg.original_price_dkk} kr.</span>
                )}
                <span className="font-medium text-cognac">{pkg.package_price_dkk} kr.</span>
              </td>
              <td className="p-4 text-textBody text-sm">
                {pkg.starts_at ? new Date(pkg.starts_at).toLocaleDateString("da-DK") : "Altid"} 
                {" - "} 
                {pkg.ends_at ? new Date(pkg.ends_at).toLocaleDateString("da-DK") : "Ingen slutdato"}
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 text-xs rounded-full ${pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {pkg.is_active ? "Aktiv" : "Inaktiv"}
                </span>
              </td>
              <td className="p-4 flex justify-end gap-2">
                <Link href={`/admin/pakker/${pkg.id}`}>
                  <Button variant="outline" size="sm" className="h-8 border-sand text-textPrimary hover:bg-beige">
                    <Edit className="w-4 h-4 mr-2" /> Rediger
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleDelete(pkg.id)}
                  disabled={loadingId === pkg.id}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> {loadingId === pkg.id ? "Sletter..." : "Slet"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
