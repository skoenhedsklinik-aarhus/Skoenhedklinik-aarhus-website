import { getOpeningHours } from "@/lib/supabase-queries";
import { OpeningHoursForm } from "./OpeningHoursForm";

export default async function AdminOpeningHoursPage() {
  const openingHours = await getOpeningHours();

  return (
    <div>
      <h1 className="font-heading text-3xl text-textPrimary mb-8">Åbningstider</h1>
      
      <div className="bg-white rounded-xl p-8 border border-sand shadow-sm max-w-2xl">
        <p className="text-textBody mb-6">
          Her kan du redigere klinikkens generelle åbningstider. Disse vises bl.a. på kontaktsiden og i footeren.
        </p>
        
        <OpeningHoursForm initialData={openingHours} />
      </div>
    </div>
  );
}
