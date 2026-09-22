-- ---------------------------------------------------------------------------
-- Bookinger i kunderejsen
--
-- Additiv og idempotent. Bookingen selv sker inde i Planway og ligger i deres
-- system. Det her er ikke en kopi af deres kalender: det er ét spor om, at en
-- booking blev gennemført, knyttet til det besøgs-id der bragte personen hertil.
--
-- Koblingen er den samme som for leads: bookings.visitor_id ER
-- consultation_leads.ft_id ER touchpoints.visitor_id, altså UUID'et fra
-- sk_ft-cookien. Derfor kan tre spørgsmål besvares på én gang:
--   hvilken annonce førte til bookingen,
--   hvad læste de først,
--   og bookede et tidligere lead så en tid bagefter.
--
-- Hvad der IKKE står her: navn, mail og telefon. Planways bekræftelsesside er
-- helt bar, og bookingens egne kontaktoplysninger passerer kun deres eget
-- system. At hente dem ud af bookingen er klinikkens beslutning som
-- dataansvarlig, ikke vores.
-- ---------------------------------------------------------------------------

create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  visitor_id     text not null,        -- = consultation_leads.ft_id
  occurred_at    timestamptz not null, -- da bekræftelsen blev vist
  -- Metas event_id for det tilhørende Schedule-event. Gør en række til at
  -- slå op i Events Manager, og er samtidig det der holder tabellen ren:
  -- én booking giver ét id, uanset hvor mange gange /tak genindlæses.
  event_id       text,
  treatment      text,
  treatment_slug text,
  value_dkk      numeric,
  created_at     timestamptz not null default now()
);

-- Opslaget er altid "bookinger for ét besøgs-id".
create index if not exists bookings_visitor_idx
  on public.bookings (visitor_id, occurred_at);

-- Samme event_id kan kun blive til én række. En genindlæsning af
-- kvitteringssiden må aldrig blive til en booking mere.
create unique index if not exists bookings_event_id_key
  on public.bookings (event_id)
  where event_id is not null;

-- --- Adgang ---------------------------------------------------------------
-- Samme regler som touchpoints, og af samme grund: rækkerne kan kobles til et
-- navn gennem leadet. Rettighederne gives EKSPLICIT, fordi en policy uden en
-- GRANT under sig ikke gør noget som helst.

grant insert on public.bookings to anon, authenticated;
grant select on public.bookings to authenticated;

alter table public.bookings enable row level security;

drop policy if exists "anon can insert bookings" on public.bookings;
create policy "anon can insert bookings"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

drop policy if exists "cnc can read bookings" on public.bookings;
create policy "cnc can read bookings"
  on public.bookings for select
  to authenticated
  using (coalesce(auth.jwt() #>> '{app_metadata,cnc}', 'false') = 'true');
