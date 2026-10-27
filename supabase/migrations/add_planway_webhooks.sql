-- ---------------------------------------------------------------------------
-- Planway-webhooks: bookinger og salg bekræftet fra Planways egen server
--
-- Additiv og idempotent. Ingen eksisterende kolonner ændres, ingen data røres,
-- og migrationen kan køres flere gange uden fejl.
--
-- Tre dele:
--   1. booking_intents: matchnøglerne fra bookingens POST gennem proxyen, så en
--      webhook fra Planway kan kobles tilbage til den browser, der bookede.
--   2. planway_webhook_events: ét spor pr. webhook, uden persondata. Gør ruten
--      idempotent og giver det sande antal online-bookinger, aflysninger og salg.
--   3. bookings: Planways egne oplysninger om bookingen, når den er matchet.
--
-- 1 og 2 kan KUN læses og skrives med service role. RLS er slået til uden en
-- eneste policy, og rettighederne er trukket tilbage fra anon og authenticated.
-- Begge dele er bevidst: booking_intents indeholder IP, browser og hashet
-- telefonnummer, og SHA-256 af et dansk 8-cifret nummer kan brute-forces.
-- ---------------------------------------------------------------------------

-- --- 1. Matchnøgler fra bookingens POST --------------------------------------
-- Skrives kun med markedsføringssamtykke. Slettes efter 90 dage af
-- src/lib/planway/intents.ts ved hver ny skrivning, samme levetid som _fbc.

create table if not exists public.booking_intents (
  id                  uuid primary key default gen_random_uuid(),
  -- Metas event_id for bookingens Schedule. Delt med pixel og /tak-bridgen
  -- gennem cnc_bk-cookien, så de tre halvdele deduplikeres mod hinanden.
  event_id            text not null unique,
  visitor_id          text,                 -- = bookings.visitor_id (sk_ft)
  em                  text,                 -- SHA-256, aldrig råt
  ph                  text,
  fn                  text,
  ln                  text,
  fbc                 text,
  fbp                 text,
  external_id         text,                 -- cnc_uid, hashes ved afsendelse
  client_ip           text,
  user_agent          text,
  test_mode           boolean not null default false,
  treatment           text,                 -- det valgte på /book, som fallback
  treatment_slug      text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  matched_at          timestamptz,
  planway_booking_id  text,
  -- Sat ved booking-match, så et senere salg kan findes på kunde-id, hvis
  -- Planways salgswebhook ikke indeholder mail og telefon.
  planway_customer_id text
);

create index if not exists booking_intents_em_idx
  on public.booking_intents (em, created_at) where em is not null;
create index if not exists booking_intents_ph_idx
  on public.booking_intents (ph, created_at) where ph is not null;
create index if not exists booking_intents_customer_idx
  on public.booking_intents (planway_customer_id) where planway_customer_id is not null;
create index if not exists booking_intents_created_idx
  on public.booking_intents (created_at);

-- --- 2. Webhook-sporet --------------------------------------------------------

create table if not exists public.planway_webhook_events (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('booking', 'cancelled', 'sale')),
  planway_id   text,                 -- bookingens eller salgets id hos Planway
  received_at  timestamptz not null default now(),
  matched      boolean not null default false,
  event_id     text,                 -- det event_id, Meta fik, hvis nogen
  capi_sent    boolean not null default false,
  service      text,
  amount_dkk   numeric,
  starts_at    timestamptz,
  -- Kaldets form: feltnavne, typer og mønstre. Værdier kun for felter, der
  -- hverken hedder eller ligner persondata. Se describeShape().
  shape        jsonb
);

-- Planway kan gentage et kald. Samme booking eller salg bliver til én række.
create unique index if not exists planway_webhook_events_kind_id_key
  on public.planway_webhook_events (kind, planway_id)
  where planway_id is not null;

create index if not exists planway_webhook_events_received_idx
  on public.planway_webhook_events (received_at);

-- --- 3. Planways oplysninger på bookingen -------------------------------------

alter table public.bookings
  add column if not exists planway_booking_id text,
  add column if not exists status             text,  -- 'confirmed' | 'cancelled'
  add column if not exists booked_service     text,  -- fra Planway, ikke gættet
  add column if not exists booked_price_dkk   numeric,
  add column if not exists starts_at          timestamptz,
  add column if not exists cancelled_at       timestamptz;

create index if not exists bookings_planway_booking_idx
  on public.bookings (planway_booking_id)
  where planway_booking_id is not null;

-- --- Adgang -----------------------------------------------------------------

revoke all on public.booking_intents from anon, authenticated;
revoke all on public.planway_webhook_events from anon, authenticated;

-- Heller ikke service role får rettigheder af sig selv i dette projekt. RLS
-- springer den over, men uden en GRANT afvises den med "permission denied".
grant select, insert, update, delete on public.booking_intents to service_role;
grant select, insert, update on public.planway_webhook_events to service_role;
grant select, insert, update on public.bookings to service_role;

alter table public.booking_intents enable row level security;
alter table public.planway_webhook_events enable row level security;
