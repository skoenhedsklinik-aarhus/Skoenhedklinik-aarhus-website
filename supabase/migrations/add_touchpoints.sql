-- ---------------------------------------------------------------------------
-- Kunderejse: førsteberøring på leadet og én række pr. sidevisning
--
-- Additiv og idempotent. Ingen eksisterende kolonner ændres, ingen data røres,
-- og migrationen kan køres flere gange uden fejl.
--
-- Koblingen mellem de to dele er gratis: touchpoints.visitor_id ER
-- consultation_leads.ft_id, altså UUID'et fra sk_ft-cookien. Der findes
-- hverken et ekstra id eller en koblingstabel.
--
-- Sessioner (besøg) beregnes VED LÆSNING i src/lib/journey.ts, ikke her. Så
-- kan reglen om 30 minutters pause ændres bagud uden en ny migration og uden
-- at genberegne historikken.
-- ---------------------------------------------------------------------------

-- --- 1. Førsteberøring på leadet ------------------------------------------
-- De eksisterende utm_*-kolonner er sidste kendte værdi fra sessionStorage og
-- overlever ikke, at den besøgende lukker fanen. ft_* er den FØRSTE berøring,
-- læst server-side af den 90 dage gamle HttpOnly-cookie.

alter table public.consultation_leads
  add column if not exists ft_id           text,  -- besøgs-id, = touchpoints.visitor_id
  add column if not exists ft_at           timestamptz,
  add column if not exists ft_source       text,
  add column if not exists ft_medium       text,
  add column if not exists ft_campaign     text,
  add column if not exists ft_content      text,
  add column if not exists ft_term         text,
  add column if not exists ft_fbclid       text,
  add column if not exists ft_gclid        text,
  add column if not exists ft_landing_page text;

comment on column public.consultation_leads.ft_id is
  'Besøgs-id fra sk_ft-cookien. Samme værdi som touchpoints.visitor_id — det er hele koblingen til kunderejsen.';
comment on column public.consultation_leads.ft_at is
  'Tidspunktet for FØRSTE besøg, ikke for henvendelsen.';
comment on column public.consultation_leads.ft_campaign is
  'Kampagnen der oprindeligt bragte den besøgende, også hvis de kom igen tre uger senere via Google.';

-- --- 2. Berøringer ---------------------------------------------------------

create table if not exists public.touchpoints (
  id            uuid primary key default gen_random_uuid(),
  visitor_id    text not null,          -- = consultation_leads.ft_id
  occurred_at   timestamptz not null,   -- tidspunktet på hjemmesiden
  path          text,                   -- sti på vores eget domæne, evt. med utm-parametre
  referrer_host text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  utm_term      text,
  fbclid        text,
  gclid         text,
  created_at    timestamptz not null default now()
);

-- Opslaget er altid "alle berøringer for ét besøgs-id, i tidsrækkefølge".
create index if not exists touchpoints_visitor_idx
  on public.touchpoints (visitor_id, occurred_at);

-- --- 3. Adgang -------------------------------------------------------------
-- Tabellen indeholder browsinghistorik, der kan kobles til navn og telefon på
-- et lead. Den er derfor strammere end resten af skemaet, hvor enhver
-- indlogget bruger har fuld adgang:
--
--   INSERT  anon, så /api/pageview kan skrive med den offentlige nøgle,
--           præcis som formularen skriver leads i dag.
--   SELECT  kun en bruger med app_metadata.cnc = true, altså ClicknContent.
--           Klinikkens egen bruger får nul rækker, også ved et direkte
--           API-kald uden om adminsiden. Flaget ligger i app_metadata, som
--           kun kan skrives med service-nøglen, så det kan ikke sættes af
--           brugeren selv.
--   UPDATE/DELETE  ingen policy = ingen adgang for nogen via API'et.
--           Oprydning sker med databaseadgang.

alter table public.touchpoints enable row level security;

drop policy if exists "anon can insert touchpoints" on public.touchpoints;
create policy "anon can insert touchpoints"
  on public.touchpoints for insert
  to anon, authenticated
  with check (true);

drop policy if exists "cnc can read touchpoints" on public.touchpoints;
create policy "cnc can read touchpoints"
  on public.touchpoints for select
  to authenticated
  using (coalesce(auth.jwt() #>> '{app_metadata,cnc}', 'false') = 'true');
