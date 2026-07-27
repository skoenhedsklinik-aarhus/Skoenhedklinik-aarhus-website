-- ---------------------------------------------------------------------------
-- Annonce-attribution på leads
--
-- Kør denne i Supabase → SQL Editor → New query → Run.
-- Den er additiv og idempotent: kun nye kolonner, alle nullable, ingen data
-- ændres, og den kan køres flere gange uden fejl.
--
-- Indtil den er kørt, skriver koden attributionen ind i `note` i stedet, så
-- der aldrig går leads tabt. Efter migrationen bruges kolonnerne automatisk.
-- ---------------------------------------------------------------------------

alter table public.consultation_leads
  add column if not exists source        text,   -- hvor på sitet formularen stod
  add column if not exists utm_source    text,   -- f.eks. "meta"
  add column if not exists utm_medium    text,   -- f.eks. "paid"
  add column if not exists utm_campaign  text,   -- kampagnenavn fra Ads Manager
  add column if not exists utm_content   text,   -- annoncenavn fra Ads Manager
  add column if not exists utm_term      text,
  add column if not exists fbclid        text,   -- Metas klik-id
  add column if not exists landing_page  text,   -- første side i sessionen
  add column if not exists referrer      text;   -- ekstern henvisning

comment on column public.consultation_leads.source is
  'Hvor på sitet leadet kom fra, f.eks. lp-tattoo-fjernelse eller forside-guide.';
comment on column public.consultation_leads.utm_campaign is
  'Kampagnenavn fra Meta Ads Manager via utm_campaign={{campaign.name}}.';
comment on column public.consultation_leads.utm_content is
  'Annoncenavn fra Meta Ads Manager via utm_content={{ad.name}}.';

-- Gør det hurtigt at gruppere leads pr. kampagne i admin og i SQL-rapporter.
create index if not exists consultation_leads_utm_campaign_idx
  on public.consultation_leads (utm_campaign);

create index if not exists consultation_leads_source_idx
  on public.consultation_leads (source);
