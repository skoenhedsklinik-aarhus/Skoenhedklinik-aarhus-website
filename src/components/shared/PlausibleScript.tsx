"use client";

import Script from "next/script";

/**
 * Plausible Analytics script.
 * Renders nothing in development or when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is not set.
 * Loaded with strategy="afterInteractive" so it never blocks rendering.
 */
export function PlausibleScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
