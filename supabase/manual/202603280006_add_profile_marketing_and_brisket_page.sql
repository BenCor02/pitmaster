alter table public.profiles
  add column if not exists smoker_type text,
  add column if not exists experience_level text,
  add column if not exists bbq_frequency text,
  add column if not exists favorite_meats jsonb not null default '[]'::jsonb,
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists source_channel text;

create or replace function public.get_my_profile()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', p.id,
    'email', p.email,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'smoker_type', p.smoker_type,
    'experience_level', p.experience_level,
    'bbq_frequency', p.bbq_frequency,
    'favorite_meats', p.favorite_meats,
    'marketing_opt_in', p.marketing_opt_in,
    'source_channel', p.source_channel,
    'role', p.role,
    'roles', jsonb_build_array(p.role),
    'status', p.status,
    'account_status', p.account_status,
    'plan_code', p.plan_code,
    'avatar_url', p.avatar_url,
    'last_seen_at', p.last_seen_at,
    'created_at', p.created_at,
    'updated_at', p.updated_at
  )
  from public.profiles p
  where p.id = auth.uid()
  order by p.updated_at desc nulls last, p.created_at desc nulls last
  limit 1;
$$;

insert into public.pages (
  title, slug, page_type, status, seo_title, seo_description
)
values (
  'Brisket fumée',
  'brisket',
  'meat_guide',
  'published',
  'Brisket fumée : quand lancer, quand wrapper, combien de temps prévoir',
  'Guide brisket en français : heure de départ, stall, wrap, repos, matériel recommandé et calculateur préfiltré.'
)
on conflict (slug) do update set
  title = excluded.title,
  page_type = excluded.page_type,
  status = excluded.status,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = timezone('utc', now());

delete from public.page_sections
where page_id = (select id from public.pages where slug = 'brisket');

insert into public.page_sections (
  page_id, section_type, order_index, is_enabled, title, subtitle, content, cta_text, cta_link, image_url, settings_json
)
values
(
  (select id from public.pages where slug = 'brisket'),
  'hero',
  1,
  true,
  'Brisket fumee : quand lancer et comment servir a l heure',
  'Guide viande',
  'Tu prepares une brisket et tu veux savoir quand allumer le fumoir, quand wrapper et combien de repos garder. Cette page te donne une base claire, puis te renvoie vers le calculateur prefiltre sur brisket.',
  'Calculer ma brisket',
  '/app',
  null,
  '{"meat_slug":"brisket","hero_points":["Lancer a la bonne heure","Traverser le stall","Servir avec repos et marge"]}'::jsonb
),
(
  (select id from public.pages where slug = 'brisket'),
  'tips',
  2,
  true,
  'Les vrais reperes qui comptent',
  null,
  'Sur brisket, on cherche surtout une bark propre, un wrap au bon moment si besoin, puis une fin de cuisson au probe tender. Le but n est pas de cuire vite. Le but est de servir juste.',
  null,
  null,
  null,
  '{"items":["Stall probable vers 68-74°C","Wrap utile si bark deja belle","Tests de tendrete a partir de 90°C","Repos long tres utile pour un service propre"]}'::jsonb
),
(
  (select id from public.pages where slug = 'brisket'),
  'material',
  3,
  true,
  'Materiel utile pour brisket',
  null,
  'Une bonne sonde, du papier boucher et un couteau a trancher propre changent vraiment le service.',
  'Voir le materiel conseille',
  '/guides/materiel-brisket',
  null,
  '{}'::jsonb
);

insert into public.seo_blocks (
  title,
  block_type,
  position,
  page_slug,
  meat_slug,
  method_key,
  content,
  cta_text,
  cta_link,
  affiliate_link,
  badge,
  note,
  icon,
  display_order,
  is_active
)
values
(
  'Papier boucher recommande pour brisket',
  'bloc_recommendation_produit',
  'after_intro',
  'brisket',
  'brisket',
  'low_and_slow',
  'Si ta bark est deja la, le papier boucher aide a accelerer la fin de cuisson sans etuver la viande comme l alu.',
  'Voir le papier recommande',
  '/guides/materiel-brisket',
  'https://example.com/affiliate/butcher-paper',
  'Brisket',
  'Bloc visible sur la page brisket.',
  '📜',
  110,
  true
),
(
  'Guide : quand wrapper une brisket',
  'bloc_guide',
  'bottom_page',
  'brisket',
  'brisket',
  'low_and_slow',
  'Couleur de bark, stall, papier boucher ou alu : les bons signaux pour wrapper sans casser ton service.',
  'Lire le guide brisket',
  '/guides/quand-wrapper-brisket',
  null,
  'Guide brisket',
  null,
  '📚',
  120,
  true
)
on conflict do nothing;
