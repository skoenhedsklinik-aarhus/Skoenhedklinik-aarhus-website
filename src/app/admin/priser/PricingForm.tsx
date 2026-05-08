"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createPricingTier, updatePricingTier } from "./actions";

type PricingTier = Database["public"]["Tables"]["pricing_tiers"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];

interface PricingFormProps {
  initialData?: PricingTier;
  services: Service[];
}

const CATEGORIES = [
  "haarfjerning", "sugaring", "wax", "ansigt",
  "bryn-vipper", "tand", "threading", "tatovering", "andet"
];

export function PricingForm({ initialData, services }: PricingFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "andet",
    subcategory: initialData?.subcategory || "",
    price_dkk: initialData?.price_dkk || 0,
    duration_minutes: initialData?.duration_minutes || "",
    notes: initialData?.notes || "",
    service_id: initialData?.service_id || "",
    display_order: initialData?.display_order || 0,
    is_active: initialData?.is_active ?? true,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isEditing) {
        result = await updatePricingTier(initialData.id, formData);
      } else {
        result = await createPricingTier(formData);
      }

      if (result.success) {
        toast.success(isEditing ? "Pris opdateret" : "Pris oprettet");
        router.push("/admin/priser");
        router.refresh();
      } else {
        toast.error("Fejl: " + result.error);
      }
    } catch {
      toast.error("Der opstod en uventet fejl.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Navn / Titel</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Pris (DKK)</label>
          <input
            type="number"
            required
            min="0"
            value={formData.price_dkk}
            onChange={(e) => handleChange("price_dkk", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Kategori</label>
          <select
            required
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          >
            <option value="">Vælg kategori</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Underkategori (valgfrit, fx. &quot;Sugaring – Kvinder&quot;)</label>
          <input
            type="text"
            value={formData.subcategory}
            onChange={(e) => handleChange("subcategory", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Tilknyttet Behandling (valgfrit)</label>
          <select
            value={formData.service_id}
            onChange={(e) => handleChange("service_id", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          >
            <option value="">Ingen specifik behandling</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Varighed (minutter, valgfrit)</label>
          <input
            type="number"
            min="0"
            value={formData.duration_minutes}
            onChange={(e) => handleChange("duration_minutes", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-textPrimary">Noter (valgfrit, fx. &quot;Pris fra pr. behandling&quot;)</label>
        <textarea
          rows={2}
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
        />
      </div>

      <div className="space-y-2 md:w-1/2">
        <label className="text-sm font-medium text-textPrimary">Rækkefølge</label>
        <input
          type="number"
          value={formData.display_order}
          onChange={(e) => handleChange("display_order", e.target.value)}
          className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => handleChange("is_active", e.target.checked)}
          className="rounded text-cognac focus:ring-cognac"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-textPrimary">
          Aktiv (vises på hjemmesiden)
        </label>
      </div>

      <div className="flex gap-4 pt-4 border-t border-sand">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/priser")}
          className="w-full"
        >
          Annuller
        </Button>
        <Button
          type="submit"
          className="w-full bg-cognac hover:bg-cognac-hover text-white"
          disabled={loading}
        >
          {loading ? "Gemmer..." : isEditing ? "Gem ændringer" : "Opret pris"}
        </Button>
      </div>
    </form>
  );
}
