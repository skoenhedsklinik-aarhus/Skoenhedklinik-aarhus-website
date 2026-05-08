import { TeamForm } from "../TeamForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function EditTeamMemberPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    notFound();
  }

  // Cast data to avoid TS never inference issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teamMember = data as any;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/team" className="inline-flex items-center text-sm text-textBody hover:text-cognac transition-colors mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Tilbage til Team
        </Link>
        <h1 className="font-heading text-3xl text-textPrimary">Rediger {teamMember.name}</h1>
      </div>
      
      <div className="bg-white rounded-xl p-8 border border-sand shadow-sm">
        <TeamForm initialData={teamMember} />
      </div>
    </div>
  );
}
