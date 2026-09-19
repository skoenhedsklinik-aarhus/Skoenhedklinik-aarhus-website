import { NextResponse, type NextRequest } from "next/server";
import { FT_COOKIE, decodeFirstTouch } from "@/lib/first-touch";
import { ingestTouchpoint } from "@/lib/touchpoints";

/**
 * Logger én sidevisning som en berøring i kunderejsen.
 *
 * Besøgs-id'et står i sk_ft-cookien, som er HttpOnly. Derfor læses det her på
 * serveren, og klienten kender det aldrig. Cookien ER samtykke-gaten: den
 * sættes kun ved samtykke (se /api/first-touch), så uden cookie gør ruten
 * ingenting. Det kan ikke omgås fra klienten.
 *
 * Alt afvises i stilhed med 200. En besøgende skal aldrig se en fejl, fordi
 * vi ikke kunne måle dem, og en bot skal ikke kunne se forskel på at blive
 * logget og at blive afvist.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PATH = 200;

/**
 * De eneste query-parametre der overlever. Resten (søgeord, session-id'er,
 * tilfældige sporingsparametre) smides væk, så vi ikke gemmer mere end
 * attributionen kræver.
 */
const KEEP_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
] as const;

const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headlesschrome|lighthouse|pagespeed|semrush|ahrefs|python-requests|curl\/|wget|node-fetch|axios|monitor|uptime|scrapy/i;

/**
 * Loft pr. besøgs-id pr. døgn, så en løbsk fane eller et script ikke fylder
 * tabellen. Ligger i hukommelsen: det holder pr. serverless-instans, hvilket
 * stopper en enkelt løbsk fane, men er ikke en global garanti på tværs af
 * instanser.
 */
const MAX_PER_DAY = 200;
const DAY_MS = 24 * 60 * 60 * 1000;
const PRUNE_AT = 5000;
const counters = new Map<string, { count: number; since: number }>();

function overCap(visitorId: string): boolean {
  const now = Date.now();
  const rec = counters.get(visitorId);
  if (!rec || now - rec.since > DAY_MS) {
    // Ryd udløbne poster, så kortet ikke vokser uendeligt i en langlivet
    // instans.
    if (counters.size > PRUNE_AT) {
      counters.forEach((v, k) => {
        if (now - v.since > DAY_MS) counters.delete(k);
      });
    }
    counters.set(visitorId, { count: 1, since: now });
    return false;
  }
  rec.count++;
  return rec.count > MAX_PER_DAY;
}

type CleanPath = { path: string; params: URLSearchParams };

/**
 * Validerer at stien er en sti på vores eget domæne, og beholder kun de
 * query-parametre attributionen bruger.
 *
 * Oprindelsen tages fra selve forespørgslen frem for en miljøvariabel:
 * variabler bages ind ved build, og en rute, der tier stille ved en forkert
 * værdi, er præcis den slags fejl, man ikke opdager. Klienten sender kun
 * relative stier, så en sti kan kun ende på en anden oprindelse ved at bryde
 * ud, og det er netop dét, sammenligningen fanger.
 */
function cleanPath(raw: unknown, origin: string): CleanPath | null {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return null;
  let u: URL;
  try {
    u = new URL(raw, origin);
  } catch {
    return null;
  }
  // Fanger fx "/\evil.com" og andre forsøg på at slippe ud af vores domæne.
  if (u.origin !== origin) return null;

  const params = new URLSearchParams();
  for (const key of KEEP_PARAMS) {
    const value = u.searchParams.get(key);
    if (value) params.set(key, value.slice(0, 100));
  }
  const query = params.toString();
  return { path: (u.pathname + (query ? `?${query}` : "")).slice(0, MAX_PATH), params };
}

function referrerHost(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    return new URL(raw).hostname.slice(0, 80) || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  // logged fortæller klienten, om sidevisningen blev gemt. Det bruges kun til
  // ét enkelt genforsøg lige efter samtykke, hvor cookien kan være undervejs.
  const ikkeLogget = NextResponse.json({ ok: true, logged: false });

  const firstTouch = decodeFirstTouch(request.cookies.get(FT_COOKIE)?.value);
  if (!firstTouch) return ikkeLogget;

  const ua = request.headers.get("user-agent") || "";
  if (!ua || BOT_RE.test(ua)) return ikkeLogget;

  let body: { path?: unknown; referrer?: unknown };
  try {
    body = await request.json();
  } catch {
    return ikkeLogget;
  }

  // Skulle nextUrl.origin mod forventning være ubrugelig bag en proxy, må
  // det ikke betyde, at hver eneste sidevisning tabes i stilhed.
  const origin = /^https?:\/\/.+/.test(request.nextUrl.origin)
    ? request.nextUrl.origin
    : "https://www.skoenhedsklinik-aarhus.dk";

  const cleaned = cleanPath(body.path, origin);
  if (!cleaned) return ikkeLogget;
  if (overCap(firstTouch.id)) return ikkeLogget;

  const gemt = await ingestTouchpoint({
    visitor_id: firstTouch.id,
    occurred_at: new Date().toISOString(),
    path: cleaned.path,
    referrer_host: referrerHost(body.referrer),
    utm_source: cleaned.params.get("utm_source"),
    utm_medium: cleaned.params.get("utm_medium"),
    utm_campaign: cleaned.params.get("utm_campaign"),
    utm_content: cleaned.params.get("utm_content"),
    utm_term: cleaned.params.get("utm_term"),
    fbclid: cleaned.params.get("fbclid"),
    gclid: cleaned.params.get("gclid"),
  });

  return NextResponse.json({ ok: true, logged: gemt });
}

export async function GET() {
  return NextResponse.json({ error: "Brug POST" }, { status: 405 });
}
