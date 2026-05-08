import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="font-heading text-3xl text-textPrimary mb-8">Dashboard</h1>
      
      <div className="bg-white rounded-xl p-8 border border-sand shadow-sm max-w-2xl">
        <h2 className="font-heading text-2xl text-cognac mb-4">Velkommen til administrationspanelet</h2>
        <p className="text-textBody mb-6">
          Logget ind som: <span className="font-medium text-textPrimary">{user?.email}</span>
        </p>
        <p className="text-textBody">
          Brug menuen til venstre for at redigere indhold på hjemmesiden. Alle ændringer vil fremgå på live-siden med det samme.
        </p>
      </div>
    </div>
  );
}
