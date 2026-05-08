import { getSiteSettings } from "@/lib/supabase-queries";
import { SiteSettingsForm } from "./SiteSettingsForm";

export default async function AdminSiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-heading text-3xl text-textPrimary mb-8">Klinik Indstillinger</h1>
      
      <div className="bg-white rounded-xl p-8 border border-sand shadow-sm max-w-3xl">
        <p className="text-textBody mb-6">
          Her kan du redigere klinikkens generelle oplysninger, som vises på tværs af hele hjemmesiden.
        </p>
        
        <SiteSettingsForm initialData={settings} />
      </div>
    </div>
  );
}
