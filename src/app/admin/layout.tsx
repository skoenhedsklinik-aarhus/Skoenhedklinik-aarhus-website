import Link from "next/link";
import { LogOut, Home, Settings, Clock, Users, Gift, Scissors, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // If there's no user, we might be on the login page or middleware hasn't redirected yet
  // If we are on the login page, we probably don't want to show the sidebar. 
  // We can just render children. (Alternatively, the login page can be in a separate route group)
  
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-sand hidden md:flex flex-col">
        <div className="p-6 border-b border-sand">
          <h2 className="font-heading text-2xl text-cognac">Admin</h2>
        </div>
        
        <nav className="flex-grow p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-textPrimary hover:bg-beige rounded-lg font-medium">
            <Home className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin/behandlinger" className="flex items-center gap-3 px-4 py-3 text-textBody hover:bg-beige rounded-lg">
            <Scissors className="w-5 h-5" /> Behandlinger
          </Link>
          <Link href="/admin/priser" className="flex items-center gap-3 px-4 py-3 text-textBody hover:bg-beige rounded-lg">
            <CreditCard className="w-5 h-5" /> Priser
          </Link>
          <Link href="/admin/team" className="flex items-center gap-3 px-4 py-3 text-textBody hover:bg-beige rounded-lg">
            <Users className="w-5 h-5" /> Team
          </Link>
          <Link href="/admin/pakker" className="flex items-center gap-3 px-4 py-3 text-textBody hover:bg-beige rounded-lg">
            <Gift className="w-5 h-5" /> Pakker
          </Link>
          <Link href="/admin/aabningstider" className="flex items-center gap-3 px-4 py-3 text-textBody hover:bg-beige rounded-lg">
            <Clock className="w-5 h-5" /> Åbningstider
          </Link>
          <Link href="/admin/indstillinger" className="flex items-center gap-3 px-4 py-3 text-textBody hover:bg-beige rounded-lg">
            <Settings className="w-5 h-5" /> Indstillinger
          </Link>
        </nav>

        <div className="p-4 border-t border-sand">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg">
              <LogOut className="w-5 h-5" /> Log ud
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-sand h-16 flex items-center px-6 md:hidden">
          <h2 className="font-heading text-xl text-cognac">Admin</h2>
        </header>
        <main className="flex-1 overflow-auto p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
