"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LASER_POPUP_PREVIEW_URL } from "@/lib/laser-popup";
import { setLaserPopupEnabled } from "./actions";

export function LaserPopupToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    const next = !enabled;
    setLoading(true);
    try {
      const result = await setLaserPopupEnabled(next);
      if (result.success) {
        setEnabled(next);
        toast.success(next ? "Pop-up'en er slået til" : "Pop-up'en er slået fra");
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="font-heading text-xl text-textPrimary">Pop-up med laserpakker</h2>
          <span
            className={`px-2 py-1 text-xs rounded-full ${enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {enabled ? "Aktiv" : "Slået fra"}
          </span>
        </div>
        <a
          href={LASER_POPUP_PREVIEW_URL}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-cognac underline underline-offset-4 hover:text-cognac-hover"
        >
          Se pop-up&apos;en
        </a>
      </div>

      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-60 ${
          enabled
            ? "border border-sand text-textBody hover:border-cognac hover:text-cognac"
            : "bg-cognac hover:bg-cognac-hover text-white"
        }`}
      >
        {enabled ? "Slå fra" : "Slå til"}
      </button>
    </div>
  );
}
