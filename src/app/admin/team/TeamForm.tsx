"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createTeamMember, updateTeamMember } from "./actions";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];

interface TeamFormProps {
  initialData?: TeamMember;
}

export function TeamForm({ initialData }: TeamFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    role: initialData?.role || "",
    short_bio: initialData?.short_bio || "",
    long_bio: initialData?.long_bio || "",
    photo_url: initialData?.photo_url || "",
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
        result = await updateTeamMember(initialData.id, formData);
      } else {
        result = await createTeamMember(formData);
      }

      if (result.success) {
        toast.success(isEditing ? "Medarbejder opdateret" : "Medarbejder oprettet");
        router.push("/admin/team");
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
          <label className="text-sm font-medium text-textPrimary">Rolle (fx. Læge, Ejer)</label>
          <input
            type="text"
            required
            value={formData.role}
            onChange={(e) => handleChange("role", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-textPrimary">Kort Bio (vises på kort)</label>
        <textarea
          rows={3}
          value={formData.short_bio}
          onChange={(e) => handleChange("short_bio", e.target.value)}
          className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-textPrimary">Lang Bio (vises på Om os)</label>
        <RichTextEditor
          value={formData.long_bio}
          onChange={(val) => handleChange("long_bio", val)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Foto URL (midlertidig)</label>
          <input
            type="text"
            value={formData.photo_url}
            onChange={(e) => handleChange("photo_url", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-textPrimary">Rækkefølge (0 er først)</label>
          <input
            type="number"
            value={formData.display_order}
            onChange={(e) => handleChange("display_order", e.target.value)}
            className="w-full px-3 py-2 border border-sand rounded-md focus:outline-none focus:ring-1 focus:ring-cognac"
          />
        </div>
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
          onClick={() => router.push("/admin/team")}
          className="w-full"
        >
          Annuller
        </Button>
        <Button
          type="submit"
          className="w-full bg-cognac hover:bg-cognac-hover text-white"
          disabled={loading}
        >
          {loading ? "Gemmer..." : isEditing ? "Gem ændringer" : "Opret medarbejder"}
        </Button>
      </div>
    </form>
  );
}
