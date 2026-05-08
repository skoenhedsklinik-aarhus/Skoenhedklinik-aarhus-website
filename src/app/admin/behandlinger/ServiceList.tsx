"use client";

import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteService } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Service = Database["public"]["Tables"]["services"]["Row"];

interface ServiceListProps {
  initialData: Service[];
}

export function ServiceList({ initialData }: ServiceListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på, at du vil slette denne behandling?")) return;
    
    setLoadingId(id);
    const result = await deleteService(id);
    
    if (result.success) {
      toast.success("Behandling slettet");
      router.refresh();
    } else {
      toast.error("Der opstod en fejl: " + result.error);
    }
    setLoadingId(null);
  };

  if (initialData.length === 0) {
    return (
      <div className="p-8 text-center text-textBody">
        Der er ingen behandlinger endnu.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-beige border-b border-sand">
            <th className="p-4 font-medium text-textPrimary">Rækkefølge</th>
            <th className="p-4 font-medium text-textPrimary">Navn</th>
            <th className="p-4 font-medium text-textPrimary">Kategori</th>
            <th className="p-4 font-medium text-textPrimary">Populær</th>
            <th className="p-4 font-medium text-textPrimary">Aktiv</th>
            <th className="p-4 font-medium text-textPrimary text-right">Handlinger</th>
          </tr>
        </thead>
        <tbody>
          {initialData.map((service) => (
            <tr key={service.id} className="border-b border-sand hover:bg-beige/50 transition-colors">
              <td className="p-4 text-textBody">{service.display_order}</td>
              <td className="p-4 font-medium text-textPrimary">{service.name}</td>
              <td className="p-4 text-textBody capitalize">{service.category.replace("-", " ")}</td>
              <td className="p-4">
                {service.is_popular ? (
                  <span className="text-cognac font-medium">Ja</span>
                ) : (
                  <span className="text-textMuted">Nej</span>
                )}
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 text-xs rounded-full ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {service.is_active ? "Aktiv" : "Inaktiv"}
                </span>
              </td>
              <td className="p-4 flex justify-end gap-2">
                <Link href={`/admin/behandlinger/${service.slug}`}>
                  <Button variant="outline" size="sm" className="h-8 border-sand text-textPrimary hover:bg-beige">
                    <Edit className="w-4 h-4 mr-2" /> Rediger
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleDelete(service.id)}
                  disabled={loadingId === service.id}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> {loadingId === service.id ? "Sletter..." : "Slet"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
