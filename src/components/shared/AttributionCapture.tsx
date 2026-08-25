"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/attribution";
import { CONSENT_EVENT } from "@/lib/consent";

/**
 * Runs the ad-attribution capture (fbclid/utm + the cnc_uid/_fbc/_fbp mirror).
 *
 * Mounted once in the root layout, renders nothing. Deliberately reads the
 * query string off `window.location` instead of `useSearchParams()` — the hook
 * would opt the entire site out of static rendering.
 *
 * captureAttribution() is a no-op without marketing consent, so it also runs
 * on the consent event: the visitor who accepts on the landing page they
 * arrived at should still have that page's fbclid and utm_* recorded.
 */
export function AttributionCapture() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
    const onConsent = () => captureAttribution();
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, [pathname]);

  return null;
}
