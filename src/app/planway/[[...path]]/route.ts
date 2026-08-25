import { type NextRequest } from "next/server";

/**
 * Reverse proxy for Planways bookingwidget.
 *
 * Hvorfor: Planways `widget.css` indeholder
 *
 *     #widget .booking { min-height: calc(100vh - 40px) }
 *
 * I en iframe er `100vh` iframens EGEN højde, så den hvide bookingkolonne
 * strækker sig altid til den plads vi giver den. Og da kolonnen starter 135px
 * nede i dokumentet, bliver siden altid nøjagtig `rammehøjde + 95` høj.
 * Målt: 900 -> 995, 1150 -> 1245, 1600 -> 1695. Der findes altså ingen fast
 * højde uden scrollbar, og hver ekstra pixel bliver til tomt hvidt felt i
 * stedet for indhold.
 *
 * Serverer vi Planway fra vores eget domæne, bliver iframen same-origin. Så
 * kan <BookingIframe /> slå netop den ene CSS-regel fra og sætte rammen til
 * den faktiske indholdshøjde på hvert trin.
 *
 * Det virker på grund af to ting ved Planway specifikt:
 *   1. Deres sessionscookie er `PHPSESSID=...; path=/` UDEN Domain-attribut,
 *      så den binder sig til den vært der serverer den. Gennem proxyen bliver
 *      den bare en cookie på vores domæne, og sessionen overlever.
 *   2. Deres JS læser sin base-URL ud af siden (`sub_siteurl` / `.siteUrl`)
 *      i stedet for at hardkode den. Skriver vi den om i HTML'en, følger alle
 *      deres AJAX-kald automatisk med gennem proxyen.
 *
 * Kun dette ene upstream kan nås. Origin er en konstant og kommer aldrig fra
 * requesten, så det her kan ikke bruges som åben proxy.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM =
  process.env.PLANWAY_ORIGIN || "https://skonhedsklinik-aarhus.planway.com";

/** Stien hvor den proxy'ede Planway ligger på vores domæne. */
const PREFIX = "/planway";

/** Typer vi skriver URL'er om inde i. Alt andet sendes uændret igennem. */
const REWRITABLE = /(text\/html|text\/css|javascript|application\/json)/i;

/** Headers der ikke må videresendes, som de er. */
const STRIP_REQUEST = new Set([
  "host",
  "connection",
  "accept-encoding",
  "content-length",
]);

const STRIP_RESPONSE = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  // Hele pointen er at kunne indlejre siden fra vores egne sider.
  "x-frame-options",
  "content-security-policy",
  "content-security-policy-report-only",
]);

function upstreamUrl(request: NextRequest, path: string[] | undefined): string {
  const suffix = (path ?? []).join("/");
  return `${UPSTREAM}/${suffix}${request.nextUrl.search}`;
}

/** Peg alle absolutte Planway-URL'er tilbage på denne proxy. */
function rewriteBody(body: string): string {
  // Den escapede form først ("https:\/\/..." i JSON og inline JS), ellers
  // ville den almindelige erstatning nedenfor efterlade ødelagte escapes.
  const escapedUpstream = UPSTREAM.replace(/\//g, "\\/");
  const escapedPrefix = PREFIX.replace(/\//g, "\\/");
  return (
    body
      .split(escapedUpstream)
      .join(escapedPrefix)
      .split(UPSTREAM)
      .join(PREFIX)
      // Bookingformularen sender til Planways rod, som bliver til "/planway/".
      // Next svarer 308 på den skråstreg. En 308 bevarer godt nok metode og
      // krop, så browseren gentager sin POST, men det er et unødigt ekstra hop
      // på den vigtigste request i hele forløbet. Uden skråstreg rammer den
      // route-handleren direkte.
      .split('action="' + PREFIX + '/"')
      .join('action="' + PREFIX + '"')
  );
}

async function proxy(request: NextRequest, path: string[] | undefined) {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!STRIP_REQUEST.has(key.toLowerCase())) headers.set(key, value);
  });
  // Bed om ukomprimeret svar, så kroppen er ren tekst vi kan skrive om.
  headers.set("accept-encoding", "identity");

  const method = request.method;
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : Buffer.from(await request.arrayBuffer());

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl(request, path), {
      method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    return new Response("Booking er midlertidigt utilgængelig.", {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const outHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (STRIP_RESPONSE.has(lower)) return;
    if (lower === "set-cookie") return; // håndteres samlet nedenfor
    if (lower === "location") {
      // Hold redirects inde i proxyen, så sessionen ikke bliver afleveret
      // tilbage til planway.com-domænet midt i en booking.
      outHeaders.set(key, rewriteBody(value));
      return;
    }
    outHeaders.append(key, value);
  });

  // Node slår gentagne Set-Cookie sammen til én header. getSetCookie holder dem
  // adskilt, og det betyder noget, fordi Planway sætter mere end én.
  const cookies = upstream.headers.getSetCookie?.() ?? [];
  for (const cookie of cookies) outHeaders.append("set-cookie", cookie);

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!REWRITABLE.test(contentType)) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: outHeaders,
    });
  }

  const text = rewriteBody(await upstream.text());
  return new Response(text, { status: upstream.status, headers: outHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] } },
) {
  return proxy(request, params.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path?: string[] } },
) {
  return proxy(request, params.path);
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { path?: string[] } },
) {
  return proxy(request, params.path);
}
