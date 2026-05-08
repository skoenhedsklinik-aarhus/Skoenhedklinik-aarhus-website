"use client";

import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteTeamMember } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];

interface TeamListProps {
  initialData: TeamMember[];
}

export function TeamList({ initialData }: TeamListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på, at du vil slette denne medarbejder?")) return;
    
    setLoadingId(id);
    const result = await deleteTeamMember(id);
    
    if (result.success) {
      toast.success("Medarbejder slettet");
      router.refresh();
    } else {
      toast.error("Der opstod en fejl: " + result.error);
    }
    setLoadingId(null);
  };

  if (initialData.length === 0) {
    return (
      <div className="p-8 text-center text-textBody">
        Der er ingen medarbejdere endnu.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-beige border-b border-sand">
            <th className="p-4 font-medium text-textPrimary">Rækkefølge</th>
            <th className="p-4 font-medium text-textPrimary">Navn</th>
            <th className="p-4 font-medium text-textPrimary">Rolle</th>
            <th className="p-4 font-medium text-textPrimary">Aktiv</th>
            <th className="p-4 font-medium text-textPrimary text-right">Handlinger</th>
          </tr>
        </thead>
        <tbody>
          {initialData.map((member) => (
            <tr key={member.id} className="border-b border-sand hover:bg-beige/50 transition-colors">
              <td className="p-4 text-textBody">{member.display_order}</td>
              <td className="p-4 font-medium text-textPrimary">{member.name}</td>
              <td className="p-4 text-textBody">{member.role}</td>
              <td className="p-4">
                <span className={`px-2 py-1 text-xs rounded-full ${member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {member.is_active ? "Aktiv" : "Inaktiv"}
                </span>
              </td>
              <td className="p-4 flex justify-end gap-2">
                <Link href={`/admin/team/${member.id}`}>
                  <Button variant="outline" size="sm" className="h-8 border-sand text-textPrimary hover:bg-beige">
                    <Edit className="w-4 h-4 mr-2" /> Rediger
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleDelete(member.id)}
                  disabled={loadingId === member.id}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> {loadingId === member.id ? "Sletter..." : "Slet"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
