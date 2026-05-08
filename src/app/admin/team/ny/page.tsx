import { TeamForm } from "../TeamForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewTeamMemberPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/team" className="inline-flex items-center text-sm text-textBody hover:text-cognac transition-colors mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Tilbage til Team
        </Link>
        <h1 className="font-heading text-3xl text-textPrimary">Opret ny medarbejder</h1>
      </div>
      
      <div className="bg-white rounded-xl p-8 border border-sand shadow-sm">
        <TeamForm />
      </div>
    </div>
  );
}
