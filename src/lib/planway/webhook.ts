import { hashBookingIdentity } from "@/lib/meta/matched-identity";
import { sendServerEvent } from "@/lib/meta/capi";
import { findConsentedCustomer, matchIntentForBooking } from "@/lib/planway/intents";
import {
  cancelBooking,
  confirmBooking,
  markWebhookEvent,
  recordWebhookEvent,
  type WebhookKind,
} from "@/lib/planway/store";
import type { Json } from "@/types/supabase";

/**
 * Planways webhooks: "Ny booking", "Slettet booking" og "Nyt salg".
 *
 * Opsat i Planway under Apps → Webhooks. Planway sender altid POST, men
 * formatet er ikke dokumenteret nogen steder. Derfor er det bygget i to trin:
 *
 *   1. Hvert kald gemmes med sin FORM (describeShape): feltnavne, typer og
 *      mønstre, men ingen navne, mails eller telefonnumre. Det er sådan,
 *      formatet læres af rigtige bookinger uden at gemme kundedata.
 *   2. map*Payload oversætter formen til de få felter, vi bruger. Indtil de er
 *      skrevet ud fra et rigtigt kald, returnerer de null, og der sendes intet
 *      til Meta. Matching, afsendelse og bookingrækken er klar til dem.
 *
 * Der sendes kun noget til Meta for en kunde, der har givet samtykke på
 * sitet, fordi det kun er dem, der har en intent at matche på. Manuelle
 * bookinger, bookinger direkte på planway.com og kunder uden samtykke ender
 * kun i sporet.
 */

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://skoenhedsklinik-aarhus.dk"
).replace(/\/$/, "");

// --- Indlæsning --------------------------------------------------------------

/**
 * Læs kroppen, uanset om Planway sender JSON eller en formular.
 *
 * Planway er skrevet i PHP, og PHP-formularer sender lister og objekter som
 * `booking[service][name]=...`. De foldes ud til et rigtigt objekt, så formen
 * kan læses og mappes på samme måde som JSON.
 */
export async function parsePayload(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  const raw = await request.text();
  if (!raw) return null;

  if (/json/i.test(contentType) || /^\s*[[{]/.test(raw)) {
    try {
      return JSON.parse(raw);
    } catch {
      // Falder igennem til formularen.
    }
  }

  const form = new URLSearchParams(raw);
  const out: Record<string, unknown> = {};
  form.forEach((value, key) => setPhpKey(out, key, value));
  return out;
}

function setPhpKey(target: Record<string, unknown>, key: string, value: string) {
  const parts = key.replace(/\]/g, "").split("[");
  let node: Record<string, unknown> = target;
  parts.forEach((part, index) => {
    const name = part === "" ? String(Object.keys(node).length) : part;
    if (index === parts.length - 1) {
      node[name] = value;
      return;
    }
    if (typeof node[name] !== "object" || node[name] === null) node[name] = {};
    node = node[name] as Record<string, unknown>;
  });
}

// --- Formen på et kald ----------------------------------------------------------

/**
 * Feltnavne, hvor værdien må vises. Alt andet vises kun som type og mønster.
 *
 * Bevidst en tilladeliste og ikke en spærreliste: et felt, vi ikke har tænkt
 * på, kan indeholde et navn, og det skal hellere mangle end slippe igennem.
 * "title", "name" og "description" er udeladt med vilje, fordi de i en
 * bookingkalender lige så tit er kundens navn som behandlingens.
 */
const SAFE_KEY =
  /(^|_)(id|uuid|type|status|kind|event|action|service|services|ydelse|behandling|treatment|product|price|pris|amount|belob|beløb|total|sum|subtotal|vat|moms|tax|currency|valuta|duration|varighed|minutes|date|dato|time|tid|start|end|slut|created|updated|source|kilde|online|origin|method|payment|betaling|qty|quantity|antal|discount|rabat|count|paid|cancelled|deleted)(_|$)|_id$|Id$|_at$/i;

/** Feltnavne, der altid er persondata, også selv om resten af navnet ser sikkert ud. */
const PII_KEY =
  /name|navn|mail|phone|telefon|tlf|mobil|address|adresse|street|zip|postnr|postal|city|birth|fodsel|fødsel|cpr|note|comment|kommentar|message|besked|journal|customer|kunde|client|klient|person|user|ip/i;

type Shape = Json;

function pattern(value: string): string {
  const v = value.trim();
  if (!v) return "empty";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "email";
  if (/^\+?[\d\s-]{8,}$/.test(v) && v.replace(/\D/g, "").length >= 8) return "phone";
  if (/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?/.test(v)) return "date";
  if (/^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(v)) return "date";
  if (/^-?\d+([.,]\d+)?$/.test(v)) return "number";
  if (/^[0-9a-f-]{32,36}$/i.test(v)) return "uuid";
  if (/^https?:\/\//i.test(v)) return "url";
  return `text(${v.length})`;
}

/**
 * Formen på et kald, uden kundedata.
 *
 * Et felt under en persondata-nøgle (f.eks. alt under `customer`) arver den,
 * så `customer.id` vises som "number" og ikke som sin værdi.
 */
export function describeShape(value: unknown, key = "", insidePii = false, depth = 0): Shape {
  if (depth > 6) return "…";
  const pii = insidePii || (key !== "" && PII_KEY.test(key));

  if (Array.isArray(value)) {
    return {
      _array: value.length,
      ...(value.length > 0 && { _first: describeShape(value[0], key, pii, depth + 1) }),
    };
  }

  if (value && typeof value === "object") {
    const out: Record<string, Shape> = {};
    for (const [childKey, child] of Object.entries(value).slice(0, 80)) {
      out[childKey] = describeShape(child, childKey, pii, depth + 1);
    }
    return out;
  }

  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value;

  const text = String(value);
  const kind = typeof value === "number" ? "number" : pattern(text);
  const showValue =
    !pii &&
    SAFE_KEY.test(key) &&
    kind !== "email" &&
    kind !== "phone" &&
    text.length <= 60;

  return showValue ? `${kind}: ${text}` : kind;
}

// --- Oversættelse af et kald -----------------------------------------------------

type Contact = {
  customerId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  countryCode?: string | null;
};

export type BookingFields = Contact & {
  planwayId: string;
  service?: string | null;
  priceDkk?: number | null;
  startsAt?: string | null;
};

export type SaleFields = Contact & {
  planwayId: string;
  amountDkk?: number | null;
  items?: string[];
};

export type CancelFields = { planwayId: string };

/**
 * "Ny booking" → de felter, vi bruger.
 * Skrives ud fra det første rigtige kald i planway_webhook_events.shape.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function mapBookingPayload(payload: unknown): BookingFields | null {
  return null;
}

/** "Nyt salg" → de felter, vi bruger. Se mapBookingPayload. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function mapSalePayload(payload: unknown): SaleFields | null {
  return null;
}

/** "Slettet booking" → bookingens id. Se mapBookingPayload. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function mapCancelPayload(payload: unknown): CancelFields | null {
  return null;
}

// --- Behandling -------------------------------------------------------------------

const now = () => Math.floor(Date.now() / 1000);

export async function handleWebhook(kind: WebhookKind, payload: unknown): Promise<void> {
  const shape = describeShape(payload);
  // Formen logges også, så det første kald kan læses i Vercel med det samme.
  console.info(`[planway-webhook] ${kind} shape=${JSON.stringify(shape)}`);

  if (kind === "booking") return handleBooking(payload, shape);
  if (kind === "sale") return handleSale(payload, shape);
  return handleCancelled(payload, shape);
}

async function handleBooking(payload: unknown, shape: Shape) {
  const fields = mapBookingPayload(payload);
  const ledger = await recordWebhookEvent({
    kind: "booking",
    planwayId: fields?.planwayId ?? null,
    shape,
    service: fields?.service,
    amountDkk: fields?.priceDkk,
    startsAt: fields?.startsAt,
  });
  if (!fields || ledger.status !== "new") return;

  const identity = hashBookingIdentity(fields);
  const intent = await matchIntentForBooking(identity, {
    bookingId: fields.planwayId,
    customerId: fields.customerId,
  });
  if (!intent) {
    console.info("[planway-webhook] booking unmatched (manuel, uden samtykke eller uden for sitet)");
    return;
  }

  const value = fields.priceDkk && fields.priceDkk > 0 ? fields.priceDkk : undefined;
  const sent = await sendServerEvent({
    eventName: "Schedule",
    eventId: intent.event_id,
    actionSource: "website",
    eventTime: now(),
    eventSourceUrl: `${SITE_URL}/book`,
    userData: {
      em: identity?.em ?? intent.em,
      ph: identity?.ph ?? intent.ph,
      fn: identity?.fn ?? intent.fn,
      ln: identity?.ln ?? intent.ln,
      externalId: intent.external_id,
      fbc: intent.fbc,
      fbp: intent.fbp,
      clientIp: intent.client_ip,
      userAgent: intent.user_agent,
      country: "dk",
    },
    customData: {
      content_name: fields.service ?? intent.treatment ?? "Booking",
      content_category: "planway-booking",
      content_type: "product",
      currency: "DKK",
      value,
    },
    testMode: intent.test_mode,
  });

  await confirmBooking(intent, {
    planwayBookingId: fields.planwayId,
    service: fields.service,
    priceDkk: fields.priceDkk,
    startsAt: fields.startsAt,
  });
  await markWebhookEvent(ledger.id, { matched: true, eventId: intent.event_id, capiSent: sent });
  console.info(`[planway-webhook] booking matched, capi ${sent ? "ok" : "failed"} event_id=${intent.event_id}`);
}

async function handleSale(payload: unknown, shape: Shape) {
  const fields = mapSalePayload(payload);
  const ledger = await recordWebhookEvent({
    kind: "sale",
    planwayId: fields?.planwayId ?? null,
    shape,
    service: fields?.items?.join(", ").slice(0, 200),
    amountDkk: fields?.amountDkk,
  });
  if (!fields || ledger.status !== "new") return;
  if (!fields.amountDkk || fields.amountDkk <= 0) return;

  const identity = hashBookingIdentity(fields);
  const intent = await findConsentedCustomer(identity, fields.customerId);
  if (!intent) {
    console.info("[planway-webhook] sale unmatched (ingen samtykket web-booking inden for 90 dage)");
    return;
  }

  const eventId = `pw-sale-${fields.planwayId}`;
  const sent = await sendServerEvent({
    eventName: "Purchase",
    eventId,
    actionSource: "physical_store",
    eventTime: now(),
    userData: {
      em: identity?.em ?? intent.em,
      ph: identity?.ph ?? intent.ph,
      fn: identity?.fn ?? intent.fn,
      ln: identity?.ln ?? intent.ln,
      externalId: intent.external_id,
      // Klik-id'et fra annoncen, kunden kom fra. IP og browser er bevidst
      // udeladt: de er fra bookingen og ikke fra købet i klinikken.
      fbc: intent.fbc,
      country: "dk",
    },
    customData: {
      content_name: fields.items?.length ? fields.items.join(", ").slice(0, 200) : undefined,
      content_category: "planway-salg",
      content_type: "product",
      currency: "DKK",
      value: fields.amountDkk,
    },
    testMode: intent.test_mode,
  });

  await markWebhookEvent(ledger.id, { matched: true, eventId, capiSent: sent });
  console.info(`[planway-webhook] sale matched, capi ${sent ? "ok" : "failed"} event_id=${eventId}`);
}

async function handleCancelled(payload: unknown, shape: Shape) {
  const fields = mapCancelPayload(payload);
  const ledger = await recordWebhookEvent({
    kind: "cancelled",
    planwayId: fields?.planwayId ?? null,
    shape,
  });
  if (!fields || ledger.status !== "new") return;

  // Meta kan ikke tage et event tilbage. Aflysningen står kun hos os.
  const found = await cancelBooking(fields.planwayId);
  await markWebhookEvent(ledger.id, { matched: found });
}
