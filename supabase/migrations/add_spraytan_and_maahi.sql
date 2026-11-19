-- Spraytan som ny behandling (fra december 2026) og Maahi på teamet.
-- Indholdet på /behandlinger/spraytan (tekst, før/efter, FAQ) ligger i
-- src/lib/services-fallback.ts. Her oprettes kun rækken, priserne og teamet.

begin;

-- 1. Kategorien "spraytan" tilføjes services_category_check.
--    (pricing_tiers har ingen kategori-constraint.)
alter table services drop constraint if exists services_category_check;
alter table services add constraint services_category_check check (
  category in ('haarfjerning', 'sugaring', 'wax', 'ansigt', 'bryn-vipper',
               'tand', 'threading', 'tatovering', 'andet', 'spraytan')
);

-- 2. Behandlingen
insert into services (
  slug, name, category, short_description, hero_image_url, og_image_url,
  meta_title, meta_description, display_order, is_popular,
  requires_consultation, is_active
)
select
  'spraytan', 'Spraytan', 'spraytan',
  'En solkysset glød uden sol og solarium. Fra december 2026.',
  '/images/services/spraytan.webp', '/images/services/spraytan-3.webp',
  'Spraytan i Aarhus fra 300 kr. | Skønhedsklinik Aarhus',
  'Spraytan i Aarhus C fra december 2026. Solkysset glød uden UV, farve tilpasset din hudtone. 300 kr., venindespraytan 500 kr. for to og klippekort.',
  coalesce((select max(display_order) from services), 0) + 1,
  false, false, true
where not exists (select 1 from services where slug = 'spraytan');

-- 3. Priser
insert into pricing_tiers (service_id, category, subcategory, name, price_dkk, duration_minutes, notes, display_order, is_active)
select s.id, 'spraytan', 'Spraytan', t.name, t.price, t.minutes, t.notes, t.ord, true
from services s
cross join (values
  ('Spraytan, krop inkl. ansigt efter ønske', 300, 30, null, 1),
  ('Venindespraytan, 2 personer (500 kr. i alt)', 500, 60, '250 kr. pr. person. I booker sammen og kommer til samme besøg.', 2),
  ('Klippekort, 5 behandlinger (betal for 4)', 1200, 30, 'Personligt. 30 min. pr. besøg. Kan ikke kombineres med andre rabatter.', 3)
) as t(name, price, minutes, notes, ord)
where s.slug = 'spraytan'
  and not exists (select 1 from pricing_tiers p where p.service_id = s.id);

-- 4. Teamet: Maahi ind som nr. 2, Lise og Louise rykker en plads.
update team_members set display_order = 3 where id = 'c0622255-38fe-48d9-9988-6ba1ef9c92be'; -- Lise
update team_members set display_order = 4 where id = 'e47a8d5c-f955-49bc-ab25-c5eccfd20f26'; -- Louise

update team_members set
  role = 'Ejer og kosmetiker',
  photo_url = '/images/team/aliaa-uniform.webp',
  short_bio = 'Aliaa er kosmetiker fra NEXT/Cph West (2010) og kvinden bag Skønhedsklinik Aarhus. Hun brænder for kvalitet, tryghed og at alle føler sig set og hørt.',
  long_bio = '<p>Jeg hedder Aliaa Jamil, og jeg er kvinden bag Skønhedsklinik Aarhus.</p><p>Jeg kommer oprindeligt fra Irak, hvor jeg læste på universitetet, inden jeg kom til Danmark i 2003. Her har jeg skabt mit liv og fundet min faglige passion. Jeg er også mor til en søn, som betyder utrolig meget for mig.</p><p>I 2010 blev jeg færdiguddannet som kosmetiker fra NEXT/Cph West. Min kosmetikeruddannelse og alle mine faglige kurser og certifikater er fra Danmark. Gennem årene har jeg arbejdet på flere klinikker i København og opbygget erfaring med hudpleje, skønhedsbehandlinger og professionelle produkter. Jeg videreuddanner mig løbende, fordi jeg elsker mit fag og ønsker at give mine kunder velovervejede behandlinger med fokus på kvalitet og tryghed.</p><p>For tre år siden flyttede jeg til Aarhus, og for omkring to år siden begyndte min rejse som selvstændig her i byen med min egen klinik på Trøjborg. I begyndelsen af september flyttede klinikken til Åboulevarden 39, 5. th., midt i Aarhus.</p><p>For mig handler skønhed også om at føle sig set, hørt og godt tilpas. Jeg ønsker, at alle, der træder ind i klinikken, føler sig velkomne, trygge og værdsatte.</p>',
  updated_at = now()
where id = '93ea3980-b363-4b8c-9146-e1dbc29f6dcd';

insert into team_members (name, role, short_bio, long_bio, photo_url, display_order, is_active)
select 'Maahi', 'Kosmetolog',
  'Maahi er uddannet læge fra Shiraz i Iran med erfaring i æstetisk medicin. Hun er kosmetolog hos os fra december.',
  '<p>Maahi kommer oprindeligt fra Shiraz i Iran og blev færdiguddannet som læge fra Shiraz University of Medical Sciences i 2016. Hun har arbejdet med almen medicin, familielægearbejde og æstetisk medicin, blandt andet Botox, fillers, tatoveringsfjernelse med laser, microneedling, fraktioneret CO2-laser og ansigtsforyngelse.</p><p>Hun flyttede til Danmark i december 2025 og arbejder hos os som kosmetolog fra december. For Maahi handler æstetik først og fremmest om mennesker: tryghed, nærvær og naturlige, harmoniske resultater.</p>',
  '/images/team/maahi.webp', 2, true
where not exists (select 1 from team_members where name = 'Maahi');

commit;
