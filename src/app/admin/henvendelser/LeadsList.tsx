"use client";

import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Check, Undo2, Trash2, Phone } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setLeadHandled, deleteLead } from "./actions";

type Lead = Database["public"]["Tables"]["consultation_leads"]["Row"];

interface LeadsListProps {
  initialData: Lead[];
}

function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("da-DK", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function LeadsList({ initialData }: LeadsListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (lead: Lead) => {
    setLoadingId(lead.id);
    const result = await setLeadHandled(lead.id, !lead.handled);
    if (result.success) {
      toast.success(lead.handled ? "Markeret som ny" : "Markeret som behandlet");
      router.refresh();
    } else {
      toast.error("Der opstod en fejl: " + result.error);
    }
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på, at du vil slette denne henvendelse?")) return;
    setLoadingId(id);
    const result = await deleteLead(id);
    if (result.success) {
      toast.success("Henvendelse slettet");
      router.refresh();
    } else {
      toast.error("Der opstod en fejl: " + result.error);
    }
    setLoadingId(null);
  };

  if (initialData.length === 0) {
    return (
      <div className="p-8 text-center text-textBody">
        Der er ingen henvendelser endnu.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-beige border-b border-sand">
            <th className="p-4 font-medium text-textPrimary">Modtaget</th>
            <th className="p-4 font-medium text-textPrimary">Navn</th>
            <th className="p-4 font-medium text-textPrimary">Telefon</th>
            <th className="p-4 font-medium text-textPrimary">Ønsker</th>
            <th className="p-4 font-medium text-textPrimary">Status</th>
            <th className="p-4 font-medium text-textPrimary text-right">Handlinger</th>
          </tr>
        </thead>
        <tbody>
          {initialData.map((lead) => {
            const areas = asList(lead.areas);
            const recs = asList(lead.recommendations);
            return (
              <tr
                key={lead.id}
                className={`border-b border-sand align-top transition-colors ${
                  lead.handled ? "bg-beige/30" : "hover:bg-beige/50"
                }`}
              >
                <td className="p-4 text-textBody whitespace-nowrap">
                  {formatDate(lead.created_at)}
                </td>
                <td className="p-4 font-medium text-textPrimary">{lead.name}</td>
                <td className="p-4 text-textBody whitespace-nowrap">
                  <a
                    href={`tel:${lead.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-cognac hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" /> {lead.phone}
                  </a>
                </td>
                <td className="p-4 text-textBody max-w-xs">
                  {areas.length > 0 && (
                    <div className="text-sm">{areas.join(", ")}</div>
                  )}
                  {recs.length > 0 && (
                    <div className="text-xs text-textMuted mt-0.5">
                      Anbefalet: {recs.join(", ")}
                    </div>
                  )}
                  {lead.note && (
                    <div className="text-xs text-textBody mt-1 italic">
                      &ldquo;{lead.note}&rdquo;
                    </div>
                  )}
                  {areas.length === 0 && recs.length === 0 && !lead.note && (
                    <span className="text-textMuted">—</span>
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      lead.handled
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {lead.handled ? "Behandlet" : "Ny"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-sand text-textPrimary hover:bg-beige"
                      onClick={() => handleToggle(lead)}
                      disabled={loadingId === lead.id}
                    >
                      {lead.handled ? (
                        <>
                          <Undo2 className="w-4 h-4 mr-2" /> Markér som ny
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" /> Behandlet
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDelete(lead.id)}
                      disabled={loadingId === lead.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
