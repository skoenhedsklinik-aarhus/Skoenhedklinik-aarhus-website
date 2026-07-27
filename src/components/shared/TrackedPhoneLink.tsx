"use client";

import { trackConversion } from "@/lib/pixel";

/**
 * Phone link that reports the tap as a Meta `Contact` conversion.
 *
 * For a local clinic a phone call is a real lead, so it belongs in the same
 * conversion set as the callback form. Use this anywhere a `tel:` link sits in
 * a server component (footer, ad landing pages).
 */
export function TrackedPhoneLink({
  children,
  className,
  contentCategory = "telefon",
  contentName,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  /** Where on the site the tap happened, e.g. "lp-tattoo-fjernelse". */
  contentCategory?: string;
  /** Treatment context, when there is one. */
  contentName?: string;
  ariaLabel?: string;
}) {
  return (
    <a
      href="tel:+4561445999"
      aria-label={ariaLabel}
      className={className}
      onClick={() =>
        trackConversion("Contact", {
          content_category: contentCategory,
          content_name: contentName,
        })
      }
    >
      {children}
    </a>
  );
}
