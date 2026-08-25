"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getExternalId } from "@/lib/attribution";
import { CONSENT_EVENT, readConsent } from "@/lib/consent";

/**
 * Meta (Facebook) Pixel.
 *
 * Renders nothing until BOTH are true:
 *   - NEXT_PUBLIC_META_PIXEL_ID is set (add it in Vercel → Environment
 *     Variables, then redeploy)
 *   - the visitor has accepted marketing cookies (see <ConsentBanner />)
 *
 * The script is not merely inert without consent, it is never injected, so no
 * request reaches connect.facebook.net and no Meta cookie is written.
 *
 * Advanced Matching: `cnc_uid` is passed as `external_id` at init. It is our
 * own first-party visitor id, it contains no personal data, and it is the
 * single cheapest way to lift Event Match Quality because it is present on
 * every event including anonymous ones. The raw id is passed on purpose: the
 * pixel hashes Advanced Matching parameters itself, and the Conversions API
 * half sends SHA-256 of the same value, so both arrive at Meta as the same
 * hash. crypto.randomUUID() is already lowercase and untrimmed, so Meta's
 * normalisation step is a no-op and cannot make the two sides diverge.
 *
 * Loaded with strategy="afterInteractive" so it never blocks rendering.
 */
export function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const [granted, setGranted] = useState(false);
  const [externalId, setExternalId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const sync = () => {
      const ok = readConsent() === "granted";
      setGranted(ok);
      // Read the id only once consent is in place — getExternalId() returns
      // undefined without it anyway, but this keeps the intent obvious.
      if (ok) setExternalId(getExternalId());
    };
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!pixelId || !granted) return null;

  const advancedMatching = externalId
    ? `, ${JSON.stringify({ external_id: externalId })}`
    : "";

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}'${advancedMatching});
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
