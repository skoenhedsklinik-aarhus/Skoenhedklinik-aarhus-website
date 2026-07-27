"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/attribution";

/**
 * Runs the ad-attribution capture (fbclid/utm + _fbc/_fbp cookies).
 *
 * Mounted once in the root layout, renders nothing. Deliberately reads the
 * query string off `window.location` instead of `useSearchParams()` — the hook
 * would opt the entire site out of static rendering.
 */
export function AttributionCapture() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
  }, [pathname]);

  return null;
}
