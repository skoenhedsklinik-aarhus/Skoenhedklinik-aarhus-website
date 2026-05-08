"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createPackage, updatePackage } from "./actions";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

type Package = Database["public"]["Tables"]["packages_offers"]["Row"];

interface PackageFormProps {
  initialData?: Package;
}

export function PackageForm({ initialData }: PackageFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    original_price_dkk: initialData?.original_price_dkk || "",
    package_price_dkk: initialData?.package_price_dkk || "",
    hero_image_url: initialData?.hero_image_url || "",
    starts_at: initialData?.starts_at || "",
    ends_at: initialData?.ends_at || "",
    cta_text: initialData?.cta_text || "Book pakken",
    planway_link: initialData?.planway_link || "",
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
        result = await updatePackage(initialData.id, formData);
      } else {
        result = await createPackage(formData);
      }

      if (result.success) {
        toast.success(isEditing ? "Pakke opdateret" : "Pakke oprettet");
        router.push("/admin/pakker");
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
          <label className="text-sm font-medium text-textPrimary">Navn</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Rækkefølge</label>
          <input
            type="number"
            value={formData.display_order}
            onChange={(e) => handleChange("display_order", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-textPrimary">Beskrivelse</label>
        <RichTextEditor
          value={formData.description}
          onChange={(val) => handleChange("description", val)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Før-pris (DKK, valgfrit)</label>
          <input
            type="number"
            min="0"
            value={formData.original_price_dkk}
            onChange={(e) => handleChange("original_price_dkk", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Tilbudspris (DKK)</label>
          <input
            type="number"
            required
            min="0"
            value={formData.package_price_dkk}
            onChange={(e) => handleChange("package_price_dkk", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Startdato (valgfrit)</label>
          <input
            type="date"
            value={formData.starts_at}
            onChange={(e) => handleChange("starts_at", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Slutdato (valgfrit)</label>
          <input
            type="date"
            value={formData.ends_at}
            onChange={(e) => handleChange("ends_at", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Planway Link (til booking)</label>
          <input
            type="url"
            value={formData.planway_link}
            onChange={(e) => handleChange("planway_link", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Knap Tekst (CTA)</label>
          <input
            type="text"
            required
            value={formData.cta_text}
            onChange={(e) => handleChange("cta_text", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-textPrimary">Hero Image URL</label>
        <input
          type="text"
          value={formData.hero_image_url}
          onChange={(e) => handleChange("hero_image_url", e.target.value)}
          className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          placeholder="https://..."
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
          Aktiv (vises på hjemmesiden, hvis inden for datoerne)
        </label>
      </div>

      <div className="flex gap-4 pt-4 border-t border-sand">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/pakker")}
          className="w-full"
        >
          Annuller
        </Button>
        <Button
          type="submit"
          className="w-full bg-cognac hover:bg-cognac-hover text-white"
          disabled={loading}
        >
          {loading ? "Gemmer..." : isEditing ? "Gem ændringer" : "Opret pakke"}
        </Button>
      </div>
    </form>
  );
}
