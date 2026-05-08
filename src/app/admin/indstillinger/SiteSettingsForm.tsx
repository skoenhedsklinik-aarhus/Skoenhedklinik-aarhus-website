"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";
import { updateSiteSettings } from "./actions";
import { toast } from "sonner";

type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

interface SiteSettingsFormProps {
  initialData: SiteSettings;
}

export function SiteSettingsForm({ initialData }: SiteSettingsFormProps) {
  const [formData, setFormData] = useState<SiteSettings>(initialData);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateSiteSettings(formData);
      if (result.success) {
        toast.success("Indstillinger blev opdateret");
      } else {
        toast.error("Der opstod en fejl: " + result.error);
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
        <div>
          <label className="block text-sm font-medium text-textPrimary mb-2">
            Telefonnummer
          </label>
          <input
            type="text"
            name="contact_phone"
            value={formData.contact_phone || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-cognac"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-textPrimary mb-2">
            Email
          </label>
          <input
            type="email"
            name="contact_email"
            value={formData.contact_email || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-cognac"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-textPrimary mb-2">
            Adresse
          </label>
          <input
            type="text"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-cognac"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-textPrimary mb-2">
            Instagram URL
          </label>
          <input
            type="url"
            name="instagram_url"
            value={formData.instagram_url || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-cognac"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-textPrimary mb-2">
            Facebook URL
          </label>
          <input
            type="url"
            name="facebook_url"
            value={formData.facebook_url || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-cognac"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-textPrimary mb-2">
            CVR Nummer
          </label>
          <input
            type="text"
            name="cvr"
            value={formData.cvr || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-cognac"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-cognac hover:bg-cognac-hover text-white rounded-lg"
        disabled={loading}
      >
        {loading ? "Gemmer ændringer..." : "Gem ændringer"}
      </Button>
    </form>
  );
}
