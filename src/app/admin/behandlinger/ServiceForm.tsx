"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createService, updateService } from "./actions";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Plus, Trash2 } from "lucide-react";

type Service = Database["public"]["Tables"]["services"]["Row"];

interface ServiceFormProps {
  initialData?: Service;
}

const CATEGORIES = [
  "haarfjerning", "sugaring", "wax", "ansigt",
  "bryn-vipper", "tand", "threading", "tatovering", "andet"
];

export function ServiceForm({ initialData }: ServiceFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    slug: initialData?.slug || "",
    name: initialData?.name || "",
    category: initialData?.category || "andet",
    short_description: initialData?.short_description || "",
    long_description: initialData?.long_description || "",
    hero_image_url: initialData?.hero_image_url || "",
    og_image_url: initialData?.og_image_url || "",
    meta_title: initialData?.meta_title || "",
    meta_description: initialData?.meta_description || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    benefits: (initialData?.benefits as any[]) || [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    faq: (initialData?.faq as any[]) || [],
    related_service_ids: initialData?.related_service_ids || [],
    planway_service_id: initialData?.planway_service_id || "",
    planway_staff_id: initialData?.planway_staff_id || "",
    display_order: initialData?.display_order || 0,
    is_popular: initialData?.is_popular ?? false,
    requires_consultation: initialData?.requires_consultation ?? false,
    is_active: initialData?.is_active ?? true,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBenefitChange = (index: number, field: string, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = { ...newBenefits[index], [field]: value };
    handleChange("benefits", newBenefits);
  };

  const handleAddBenefit = () => {
    handleChange("benefits", [...formData.benefits, { icon: "check", title: "", description: "" }]);
  };

  const handleRemoveBenefit = (index: number) => {
    const newBenefits = [...formData.benefits];
    newBenefits.splice(index, 1);
    handleChange("benefits", newBenefits);
  };

  const handleFaqChange = (index: number, field: string, value: string) => {
    const newFaq = [...formData.faq];
    newFaq[index] = { ...newFaq[index], [field]: value };
    handleChange("faq", newFaq);
  };

  const handleAddFaq = () => {
    handleChange("faq", [...formData.faq, { question: "", answer: "" }]);
  };

  const handleRemoveFaq = (index: number) => {
    const newFaq = [...formData.faq];
    newFaq.splice(index, 1);
    handleChange("faq", newFaq);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isEditing) {
        result = await updateService(initialData.id, formData);
      } else {
        result = await createService(formData);
      }

      if (result.success) {
        toast.success(isEditing ? "Behandling opdateret" : "Behandling oprettet");
        router.push("/admin/behandlinger");
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-heading text-cognac border-b border-sand pb-2">Basis information</h2>
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
            <label className="text-sm font-medium text-textPrimary">Slug (URL)</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-textPrimary">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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

        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange("is_active", e.target.checked)}
              className="rounded text-cognac focus:ring-cognac"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-textPrimary">Aktiv</label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_popular"
              checked={formData.is_popular}
              onChange={(e) => handleChange("is_popular", e.target.checked)}
              className="rounded text-cognac focus:ring-cognac"
            />
            <label htmlFor="is_popular" className="text-sm font-medium text-textPrimary">Populær</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requires_consultation"
              checked={formData.requires_consultation}
              onChange={(e) => handleChange("requires_consultation", e.target.checked)}
              className="rounded text-cognac focus:ring-cognac"
            />
            <label htmlFor="requires_consultation" className="text-sm font-medium text-textPrimary">Kræver konsultation</label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h2 className="text-xl font-heading text-cognac border-b border-sand pb-2">Indhold</h2>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Kort beskrivelse (vises på kort)</label>
          <textarea
            rows={2}
            value={formData.short_description}
            onChange={(e) => handleChange("short_description", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Lang beskrivelse</label>
          <RichTextEditor
            value={formData.long_description}
            onChange={(val) => handleChange("long_description", val)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-textPrimary">Hero Image URL</label>
            <input
              type="text"
              value={formData.hero_image_url}
              onChange={(e) => handleChange("hero_image_url", e.target.value)}
              className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-textPrimary">OG Image URL (til deling)</label>
            <input
              type="text"
              value={formData.og_image_url}
              onChange={(e) => handleChange("og_image_url", e.target.value)}
              className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
            />
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-sand pb-2">
          <h2 className="text-xl font-heading text-cognac">Fordele (Benefits)</h2>
          <Button type="button" variant="outline" size="sm" onClick={handleAddBenefit}>
            <Plus className="w-4 h-4 mr-2" /> Tilføj fordel
          </Button>
        </div>
        
        {formData.benefits.map((benefit, index) => (
          <div key={index} className="flex gap-4 items-start bg-beige p-4 rounded-lg">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Titel"
                  value={benefit.title}
                  onChange={(e) => handleBenefitChange(index, "title", e.target.value)}
                  className="w-full px-3 py-2 border border-sand rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Ikon (fx. shield, check)"
                  value={benefit.icon}
                  onChange={(e) => handleBenefitChange(index, "icon", e.target.value)}
                  className="w-full px-3 py-2 border border-sand rounded-md text-sm"
                />
              </div>
              <textarea
                placeholder="Beskrivelse"
                rows={2}
                value={benefit.description}
                onChange={(e) => handleBenefitChange(index, "description", e.target.value)}
                className="w-full px-3 py-2 border border-sand rounded-md text-sm"
              />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveBenefit(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-sand pb-2">
          <h2 className="text-xl font-heading text-cognac">FAQ</h2>
          <Button type="button" variant="outline" size="sm" onClick={handleAddFaq}>
            <Plus className="w-4 h-4 mr-2" /> Tilføj Spørgsmål
          </Button>
        </div>
        
        {formData.faq.map((item, index) => (
          <div key={index} className="flex gap-4 items-start bg-beige p-4 rounded-lg">
            <div className="flex-1 space-y-4">
              <input
                type="text"
                placeholder="Spørgsmål"
                value={item.question}
                onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                className="w-full px-3 py-2 border border-sand rounded-md text-sm font-medium"
              />
              <textarea
                placeholder="Svar (Understøtter HTML)"
                rows={3}
                value={item.answer}
                onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                className="w-full px-3 py-2 border border-sand rounded-md text-sm font-mono"
              />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveFaq(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* SEO & Integrations */}
      <div className="space-y-4">
        <h2 className="text-xl font-heading text-cognac border-b border-sand pb-2">SEO & Integrationer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-textPrimary">Meta Title</label>
            <input
              type="text"
              value={formData.meta_title}
              onChange={(e) => handleChange("meta_title", e.target.value)}
              className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-textPrimary">Meta Description</label>
            <textarea
              rows={2}
              value={formData.meta_description}
              onChange={(e) => handleChange("meta_description", e.target.value)}
              className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-textPrimary">Planway Service ID (valgfrit)</label>
            <input
              type="text"
              value={formData.planway_service_id}
              onChange={(e) => handleChange("planway_service_id", e.target.value)}
              className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-textPrimary">Planway Staff ID (valgfrit)</label>
            <input
              type="text"
              value={formData.planway_staff_id}
              onChange={(e) => handleChange("planway_staff_id", e.target.value)}
              className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-sand">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/behandlinger")}
          className="w-full"
        >
          Annuller
        </Button>
        <Button
          type="submit"
          className="w-full bg-cognac hover:bg-cognac-hover text-white"
          disabled={loading}
        >
          {loading ? "Gemmer..." : isEditing ? "Gem ændringer" : "Opret behandling"}
        </Button>
      </div>
    </form>
  );
}
