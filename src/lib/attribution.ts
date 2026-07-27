/**
 * Ad attribution capture (browser side).
 *
 * Two jobs, both of which directly improve Meta ad measurement:
 *
 * 1. Remember where the visitor came from (fbclid + utm_*) for the whole
 *    session, so a lead submitted three pages later can still be traced back to
 *    the exact ad. The values are attached to the lead in Supabase and shown
 *    under Admin → Henvendelser.
 *
 * 2. Make sure the `_fbc` / `_fbp` cookies exist. Meta's pixel normally writes
 *    them, but ~20-30% of visitors block the pixel. Writing them ourselves means
 *    the Conversions API still has a click id and browser id to match on, which
 *    is what drives the Event Match Quality score in Events Manager.
 *
 * Nothing here is personal data: only ad click ids and campaign labels.
 */

const STORAGE_KEY = "sk_attribution";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days, Meta's fbc/fbp convention

export type Attribution = {
  fbclid?: string;
  fbc?: string;
  fbp?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  /** First page of the session. */
  landingPage?: string;
  /** External referrer, when there is one. */
  referrer?: string;
  /** ISO timestamp of first touch. */
  capturedAt?: string;
};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${name}=${encodeURIComponent(value)}; Max-Age=${COOKIE_MAX_AGE}` +
    `; Path=/; SameSite=Lax${secure}`;
}

/** Meta's format: fb.<subdomainIndex>.<timestamp>.<clickId|randomId> */
function buildFbc(fbclid: string): string {
  return `fb.1.${Date.now()}.${fbclid}`;
}

function buildFbp(): string {
  const random = Math.floor(Math.random() * 1e10);
  return `fb.1.${Date.now()}.${random}`;
}

/**
 * Run once per page load (see <AttributionCapture />).
 * Stores first-touch attribution and backfills the Meta cookies.
 */
export function captureAttribution() {
  if (typeof window === "undefined") return;

  try {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get("fbclid") || undefined;

    // --- Meta cookies -----------------------------------------------------
    if (fbclid && !readCookie("_fbc")) writeCookie("_fbc", buildFbc(fbclid));
    if (!readCookie("_fbp")) writeCookie("_fbp", buildFbp());

    // --- First-touch attribution -----------------------------------------
    const existing = getAttribution();
    const incoming: Attribution = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) incoming[key] = value.slice(0, 120);
    }
    if (fbclid) incoming.fbclid = fbclid.slice(0, 255);

    const hasIncoming = Object.keys(incoming).length > 0;
    const hasExisting = existing && Object.keys(existing).length > 0;

    // Keep the first touch: don't let an internal navigation overwrite the ad
    // that actually brought the visitor here.
    if (hasExisting && !hasIncoming) return;

    const next: Attribution = {
      ...(hasExisting ? existing : {}),
      ...incoming,
      landingPage:
        existing?.landingPage ?? window.location.pathname + window.location.search,
      referrer:
        existing?.referrer ??
        (document.referrer && !document.referrer.includes(window.location.host)
          ? document.referrer.slice(0, 255)
          : undefined),
      capturedAt: existing?.capturedAt ?? new Date().toISOString(),
    };

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // sessionStorage can throw in private mode — attribution is best effort.
  }
}

/** Read the stored attribution, always including the current fbc/fbp cookies. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  let stored: Attribution = {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw) as Attribution;
  } catch {
    stored = {};
  }
  return {
    ...stored,
    fbc: readCookie("_fbc") ?? stored.fbc,
    fbp: readCookie("_fbp") ?? stored.fbp,
  };
}

/** Compact one-line summary for the lead note shown in the admin. */
export function attributionSummary(attr: Attribution): string {
  const parts: string[] = [];
  if (attr.utm_source) parts.push(`kilde: ${attr.utm_source}`);
  if (attr.utm_campaign) parts.push(`kampagne: ${attr.utm_campaign}`);
  if (attr.utm_content) parts.push(`annonce: ${attr.utm_content}`);
  if (attr.utm_medium) parts.push(`medie: ${attr.utm_medium}`);
  if (!attr.utm_source && attr.fbclid) parts.push("kilde: Meta-annonce (fbclid)");
  if (!parts.length && attr.referrer) parts.push(`henvist fra: ${attr.referrer}`);
  if (attr.landingPage) parts.push(`landingsside: ${attr.landingPage}`);
  return parts.join(" · ");
}
