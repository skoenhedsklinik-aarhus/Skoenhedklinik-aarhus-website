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
 * 2. Keep `cnc_uid` / `_fbc` / `_fbp` alive.
 *
 * On (2) this file used to write `_fbc`/`_fbp` itself with `document.cookie`.
 * It no longer does. Safari's ITP caps script-written cookies at 7 days, and
 * writing them host-only on `www.` while fbevents.js wrote the same names on
 * `.skoenhedsklinik-aarhus.dk` produced two cookies with one name. The server
 * now owns all three (see `src/lib/identity.ts` and `src/middleware.ts`).
 *
 * What remains here is a mirror: the values are copied into localStorage and
 * copied back if the cookies ever disappear, so a booking is still matched
 * after a cookie has been evicted. A restored cookie is written with
 * `document.cookie`, which ITP will cap at 7 days again, but restoring an
 * already-expired value for 7 days beats losing it entirely.
 *
 * Nothing here runs without marketing consent, and nothing here is personal
 * data: only ad click ids and campaign labels.
 */

import { hasMarketingConsent } from "@/lib/consent";
import { UID_COOKIE, FBC_COOKIE, FBP_COOKIE } from "@/lib/identity";

const STORAGE_KEY = "sk_attribution";
/** localStorage mirror of the identity cookies. */
const MIRROR_KEY = "sk_ids";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days, Meta's fbc/fbp convention

/** Meta's fbc/fbp shape, so a corrupt mirror is never handed to Meta. */
const FB_VALUE = /^fb\.\d\.\d+\..+$/;

export type Attribution = {
  fbclid?: string;
  fbc?: string;
  fbp?: string;
  /** Our own first-party visitor id, sent to Meta as external_id. */
  externalId?: string;
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

/**
 * Last-resort cookie write, used only to restore a value that already existed
 * and has since been evicted. New values are always written server-side.
 */
function restoreCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  // Registrable domain, matching what fbevents.js and the server both use, so
  // this cannot create a second cookie with the same name.
  const host = window.location.hostname;
  const labels = host.split(".");
  const domain =
    host === "localhost" || /^\d+(\.\d+){3}$/.test(host) || labels.length < 2
      ? ""
      : `; Domain=.${labels.slice(-2).join(".")}`;
  document.cookie =
    `${name}=${encodeURIComponent(value)}; Max-Age=${COOKIE_MAX_AGE}` +
    `; Path=/${domain}; SameSite=Lax${secure}`;
}

type Mirror = Partial<Record<typeof UID_COOKIE | typeof FBC_COOKIE | typeof FBP_COOKIE, string>>;

function readMirror(): Mirror {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(MIRROR_KEY);
    return raw ? (JSON.parse(raw) as Mirror) : {};
  } catch {
    return {};
  }
}

function writeMirror(next: Mirror) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MIRROR_KEY, JSON.stringify(next));
  } catch {
    // Private mode / quota. The mirror is best effort.
  }
}

function isValidId(name: string, value: string | undefined): value is string {
  if (!value) return false;
  if (name === UID_COOKIE) return value.length > 0 && value.length <= 100;
  return FB_VALUE.test(value);
}

/**
 * Keep cookies and localStorage in step, in both directions.
 * Cookie wins when both exist: the server is the source of truth.
 */
function syncIdentityMirror() {
  const mirror = readMirror();
  const next: Mirror = { ...mirror };
  let changed = false;

  for (const name of [UID_COOKIE, FBC_COOKIE, FBP_COOKIE] as const) {
    const cookie = readCookie(name);
    if (isValidId(name, cookie)) {
      if (mirror[name] !== cookie) {
        next[name] = cookie;
        changed = true;
      }
      continue;
    }
    // Cookie gone but we have seen this visitor before: put it back.
    const stored = mirror[name];
    if (isValidId(name, stored)) restoreCookie(name, stored);
  }

  if (changed) writeMirror(next);
}

/**
 * Run once per page load (see <AttributionCapture />).
 * Stores first-touch attribution and keeps the identity mirror in step.
 */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  if (!hasMarketingConsent()) return;

  try {
    syncIdentityMirror();

    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get("fbclid") || undefined;

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

/**
 * Our first-party visitor id, for Meta's `external_id`.
 * Reads the cookie first, then the localStorage mirror.
 */
export function getExternalId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  if (!hasMarketingConsent()) return undefined;
  const cookie = readCookie(UID_COOKIE);
  if (isValidId(UID_COOKIE, cookie)) return cookie;
  const stored = readMirror()[UID_COOKIE];
  return isValidId(UID_COOKIE, stored) ? stored : undefined;
}

/** Read the stored attribution, always including the current identity values. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  let stored: Attribution = {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw) as Attribution;
  } catch {
    stored = {};
  }
  const mirror = readMirror();
  const fbc = readCookie(FBC_COOKIE) ?? mirror[FBC_COOKIE] ?? stored.fbc;
  const fbp = readCookie(FBP_COOKIE) ?? mirror[FBP_COOKIE] ?? stored.fbp;
  return {
    ...stored,
    fbc: isValidId(FBC_COOKIE, fbc) ? fbc : undefined,
    fbp: isValidId(FBP_COOKIE, fbp) ? fbp : undefined,
    externalId: getExternalId(),
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
