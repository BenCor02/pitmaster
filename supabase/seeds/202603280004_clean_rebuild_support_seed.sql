-- Charbon & Flamme
-- Seed complementaire pour la base propre reconstruite
-- A executer APRES 202603280001_phase1_seed.sql

insert into public.plans (key, name, description, badge, color, sort_order, is_active, price_monthly, price_yearly)
values
  ('free',  'Mode decouverte',   'Pour tester le calculateur et garder quelques reperes.', null,        '#6a5a4a', 1, true, 0,    0),
  ('pro',   'Atelier pitmaster', 'Pour cuisiner souvent, sauvegarder plus et travailler avec plus de marge.', 'Atelier', '#e85d04', 2, true, null, null),
  ('ultra', 'Service feu',       'Pour les gros volumes et les usages intensifs.', 'Service', '#f48c06', 3, true, null, null)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  badge = excluded.badge,
  color = excluded.color,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  price_monthly = excluded.price_monthly,
  price_yearly = excluded.price_yearly,
  updated_at = timezone('utc', now());

insert into public.plan_features (plan_key, feature_key, label, limit_value)
values
  ('free',  'calc_uses',       'Calculs BBQ',            5),
  ('free',  'session_saves',   'Sessions sauvegardees',  10),
  ('free',  'journal_entries', 'Entrees journal',        5),
  ('free',  'party_meats',     'Viandes simultanees',    2),
  ('free',  'cold_uses',       'Fumage a froid',         5),
  ('free',  'ask_ai_daily',    'Questions pitmaster',    3),
  ('free',  'history_access',  'Historique',             1),
  ('free',  'export_pdf',      'Exports',                0),
  ('free',  'custom_meats',    'Viandes custom',         0),
  ('free',  'advanced_stats',  'Stats cuisson',          0),

  ('pro',   'calc_uses',       'Calculs BBQ',            -1),
  ('pro',   'session_saves',   'Sessions sauvegardees',  -1),
  ('pro',   'journal_entries', 'Entrees journal',        -1),
  ('pro',   'party_meats',     'Viandes simultanees',    -1),
  ('pro',   'cold_uses',       'Fumage a froid',         -1),
  ('pro',   'ask_ai_daily',    'Questions pitmaster',    50),
  ('pro',   'history_access',  'Historique',             -1),
  ('pro',   'export_pdf',      'Exports',                1),
  ('pro',   'custom_meats',    'Viandes custom',         0),
  ('pro',   'advanced_stats',  'Stats cuisson',          1),

  ('ultra', 'calc_uses',       'Calculs BBQ',            -1),
  ('ultra', 'session_saves',   'Sessions sauvegardees',  -1),
  ('ultra', 'journal_entries', 'Entrees journal',        -1),
  ('ultra', 'party_meats',     'Viandes simultanees',    -1),
  ('ultra', 'cold_uses',       'Fumage a froid',         -1),
  ('ultra', 'ask_ai_daily',    'Questions pitmaster',    -1),
  ('ultra', 'history_access',  'Historique',             -1),
  ('ultra', 'export_pdf',      'Exports',                -1),
  ('ultra', 'custom_meats',    'Viandes custom',         -1),
  ('ultra', 'advanced_stats',  'Stats cuisson',          -1)
on conflict (plan_key, feature_key) do update set
  label = excluded.label,
  limit_value = excluded.limit_value,
  updated_at = timezone('utc', now());

insert into public.base_coefficients (meat_type, phase, parameter, description, value, unit)
values
  ('global', 'smoker', 'pellet',        'Coefficient fumoir pellet', 1.000, 'ratio'),
  ('global', 'smoker', 'offset',        'Coefficient fumoir offset', 1.030, 'ratio'),
  ('global', 'smoker', 'kamado',        'Coefficient kamado',        0.970, 'ratio'),
  ('global', 'smoker', 'electric',      'Coefficient fumoir elec',   1.040, 'ratio'),
  ('global', 'smoker', 'kettle',        'Coefficient kettle',        1.010, 'ratio'),

  ('global', 'wrap',   'none',          'Sans wrap',                 1.000, 'ratio'),
  ('global', 'wrap',   'butcher_paper', 'Wrap papier',               0.950, 'ratio'),
  ('global', 'wrap',   'foil_boat',     'Foil boat',                 0.920, 'ratio'),
  ('global', 'wrap',   'foil',          'Wrap alu',                  0.880, 'ratio'),

  ('global', 'temp',   '107',           'Reference 107C',            1.120, 'ratio'),
  ('global', 'temp',   '115',           'Reference 115C',            1.050, 'ratio'),
  ('global', 'temp',   '121',           'Reference 121C',            1.000, 'ratio'),
  ('global', 'temp',   '130',           'Reference 130C',            0.920, 'ratio'),
  ('global', 'temp',   '135',           'Reference 135C',            0.880, 'ratio'),

  ('global', 'marbling', 'low',         'Persillage faible',         1.030, 'ratio'),
  ('global', 'marbling', 'medium',      'Persillage moyen',          1.000, 'ratio'),
  ('global', 'marbling', 'high',        'Persillage eleve',          0.980, 'ratio')
on conflict do nothing;

insert into public.algorithm_versions (version_name, description, snapshot, is_active, rollback_available)
values (
  'baseline-clean-rebuild',
  'Base propre reconstruite a partir du moteur valide Charbon & Flamme.',
  jsonb_build_object(
    'created_from', '202603280004_clean_rebuild_support_seed',
    'notes', 'Reference initiale apres reset propre Supabase'
  ),
  true,
  false
)
on conflict do nothing;

delete from public.seo_blocks
where title in (
  'Sonde recommandee pour cette cuisson',
  'Guide : quand wrapper proprement',
  'Conseil pitmaster : prevoir large',
  'Materiel recommande pour brisket'
);

insert into public.seo_blocks (
  title,
  block_type,
  position,
  page_slug,
  meat_slug,
  method_key,
  content,
  image_url,
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
    'Sonde recommandee pour cette cuisson',
    'bloc_recommendation_produit',
    'after_result',
    'calculator',
    null,
    null,
    'Une bonne sonde te simplifie la vie sur les longues cuissons et t aide a verifier la bonne fenetre de tendrete.',
    null,
    'Voir notre selection',
    '/guides/thermometre-bbq',
    'https://example.com/affiliate/thermometre',
    'Selection pitmaster',
    'Compatible brisket, pulled pork et grosses pieces.',
    '🌡️',
    10,
    true
  ),
  (
    'Guide : quand wrapper proprement',
    'bloc_guide',
    'after_timeline',
    'calculator',
    null,
    'low_and_slow',
    'Papier boucher, alu ou sans wrap : les bons reperes pour ne pas casser la bark et garder le bon rythme de cuisson.',
    null,
    'Lire le guide',
    '/guides/quand-wrapper',
    null,
    'Guide cuisson',
    null,
    '📚',
    20,
    true
  ),
  (
    'Conseil pitmaster : prevoir large',
    'bloc_conseil',
    'bottom_page',
    'calculator',
    null,
    null,
    'Sur une grosse piece, mieux vaut finir un peu en avance et tenir au chaud que courir apres le service.',
    null,
    'Voir les conseils',
    '/guides/repos-hold-bbq',
    null,
    null,
    'Repos et hold',
    '💡',
    30,
    true
  ),
  (
    'Materiel recommande pour brisket',
    'bloc_recommendation_produit',
    'bottom_page',
    'calculator',
    'brisket',
    'low_and_slow',
    'Papier boucher, grande sonde et couteau a trancher : la base pour un service propre.',
    null,
    'Voir la selection brisket',
    '/guides/materiel-brisket',
    'https://example.com/affiliate/brisket-kit',
    'Brisket',
    'Bloc visible seulement sur brisket.',
    '🥩',
    40,
    true
  )
on conflict do nothing;

insert into public.seo_block_products (
  seo_block_id,
  name,
  image_url,
  affiliate_url,
  description,
  rating,
  display_order
)
select
  b.id,
  p.name,
  p.image_url,
  p.affiliate_url,
  p.description,
  p.rating,
  p.display_order
from public.seo_blocks b
join (
  values
    ('Sonde recommandee pour cette cuisson', 'Thermometre double sonde', null, 'https://example.com/affiliate/thermometre-double', 'Pratique pour suivre la chambre et le coeur en meme temps.', 4.8, 1),
    ('Sonde recommandee pour cette cuisson', 'Thermometre lecture instantanee', null, 'https://example.com/affiliate/instant-read', 'Ideal pour verifier vite sans rester porte ouverte.', 4.7, 2),
    ('Materiel recommande pour brisket', 'Papier boucher rose', null, 'https://example.com/affiliate/butcher-paper', 'Le classique pour garder la bark sans etuver la viande.', 4.9, 1),
    ('Materiel recommande pour brisket', 'Grand couteau a trancher', null, 'https://example.com/affiliate/slicing-knife', 'Pour couper net sans dechirer la tranche.', 4.6, 2)
) as p(block_title, name, image_url, affiliate_url, description, rating, display_order)
  on p.block_title = b.title
on conflict do nothing;
