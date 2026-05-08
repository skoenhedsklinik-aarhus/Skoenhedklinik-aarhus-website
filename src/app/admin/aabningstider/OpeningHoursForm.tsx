"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";
import { updateOpeningHours } from "./actions";
import { toast } from "sonner";

type OpeningHour = Database["public"]["Tables"]["opening_hours"]["Row"];

interface OpeningHoursFormProps {
  initialData: OpeningHour[];
}

export function OpeningHoursForm({ initialData }: OpeningHoursFormProps) {
  const [hours, setHours] = useState(
    initialData.sort((a, b) => a.day_of_week - b.day_of_week)
  );
  const [loading, setLoading] = useState(false);

  const daysMap: Record<number, string> = {
    1: "Mandag",
    2: "Tirsdag",
    3: "Onsdag",
    4: "Torsdag",
    5: "Fredag",
    6: "Lørdag",
    7: "Søndag",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (day: number, field: "open_time" | "close_time" | "is_closed", value: any) => {
    setHours((prev) =>
      prev.map((h) => (h.day_of_week === day ? { ...h, [field]: value } : h))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateOpeningHours(hours);
      if (result.success) {
        toast.success("Åbningstider blev opdateret");
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
      {hours.map((hour) => (
        <div key={hour.id} className="flex items-center gap-4 bg-beige p-4 rounded-lg">
          <div className="w-24 font-medium text-textPrimary">
            {daysMap[hour.day_of_week]}
          </div>
          
          <label className="flex items-center gap-2 text-sm text-textBody">
            <input
              type="checkbox"
              checked={hour.is_closed}
              onChange={(e) => handleChange(hour.day_of_week, "is_closed", e.target.checked)}
              className="rounded text-cognac focus:ring-cognac"
            />
            Lukket
          </label>

          {!hour.is_closed && (
            <div className="flex items-center gap-2 flex-grow justify-end">
              <input
                type="time"
                value={hour.open_time || ""}
                onChange={(e) => handleChange(hour.day_of_week, "open_time", e.target.value)}
                className="px-3 py-1.5 border border-sand rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cognac"
                required={!hour.is_closed}
              />
              <span className="text-textMuted">-</span>
              <input
                type="time"
                value={hour.close_time || ""}
                onChange={(e) => handleChange(hour.day_of_week, "close_time", e.target.value)}
                className="px-3 py-1.5 border border-sand rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cognac"
                required={!hour.is_closed}
              />
            </div>
          )}
        </div>
      ))}

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
