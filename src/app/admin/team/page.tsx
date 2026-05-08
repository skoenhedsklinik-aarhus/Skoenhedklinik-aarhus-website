import { getTeamMembers } from "@/lib/supabase-queries";
import { TeamList } from "./TeamList";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminTeamPage() {
  const teamMembers = await getTeamMembers();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-3xl text-textPrimary">Team</h1>
        <Link href="/admin/team/ny">
          <Button className="bg-cognac hover:bg-cognac-hover text-white">
            Tilføj medarbejder
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-xl border border-sand shadow-sm overflow-hidden">
        <TeamList initialData={teamMembers} />
      </div>
    </div>
  );
}
