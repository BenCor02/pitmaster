-- PATCH: seed initial phase 1 Charbon & Flamme
insert into public.site_settings (
  id, site_name, site_tagline, default_seo_title, default_seo_description, support_email, social_links_json, branding_json
)
values (
  1,
  'Charbon & Flamme',
  'Calculateur BBQ / fumage',
  'Charbon & Flamme — Calculateur BBQ pitmaster',
  'Choisis ta viande, ton poids et ton heure de service. Charbon & Flamme te dit quand lancer la cuisson.',
  'contact@charbonetflamme.fr',
  '{}'::jsonb,
  '{"accent":"#c62828","surface":"#161616"}'::jsonb
)
on conflict (id) do update set
  site_name = excluded.site_name,
  site_tagline = excluded.site_tagline,
  default_seo_title = excluded.default_seo_title,
  default_seo_description = excluded.default_seo_description,
  support_email = excluded.support_email,
  social_links_json = excluded.social_links_json,
  branding_json = excluded.branding_json,
  updated_at = timezone('utc', now());

insert into public.pages (
  title, slug, page_type, status, seo_title, seo_description
)
values (
  'Accueil',
  'home',
  'landing',
  'published',
  'Charbon & Flamme — Calculateur BBQ pitmaster',
  'Choisis ta viande, ton poids et ton heure de service. Charbon & Flamme te dit quand lancer la cuisson.'
)
on conflict (slug) do update set
  title = excluded.title,
  page_type = excluded.page_type,
  status = excluded.status,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = timezone('utc', now());

delete from public.page_sections
where page_id = (select id from public.pages where slug = 'home');


insert into public.page_sections (
  page_id, section_type, order_index, is_enabled, title, subtitle, content, cta_text, cta_link, image_url, settings_json
)
values (
  (select id from public.pages where slug = 'home'),
  'hero',
  1,
  true,
  'À QUELLE HEURE
LANCER TA
CUISSON BBQ',
  'charbon · braise · service à l’heure',
  'Brisket, ribs, pulled pork ou paleron. Tu choisis la pièce, le poids et l’heure de service. On te dit quand allumer le fumoir pour servir au bon moment, sans deviner.',
  'Calculer ma cuisson',
  null,
  null,
  '{"secondary_cta_text":"Voir le principe","items":["À quelle heure lancer ?","Quand wrapper ?","Combien de repos prévoir ?"],"metrics":[["Allumage","06h"],["Viande au fumoir","06h30"],["Service visé","19h"]]}'::jsonb
)
on conflict do nothing;

insert into public.page_sections (
  page_id, section_type, order_index, is_enabled, title, subtitle, content, cta_text, cta_link, image_url, settings_json
)
values (
  (select id from public.pages where slug = 'home'),
  'value_proof',
  2,
  true,
  'Plus besoin de deviner.',
  'Pourquoi c’est utile',
  'Tu n’as plus à choisir au hasard entre finir trop tard ou te lever à 4h. Le site t’aide à prévoir large, à mieux gérer le repos et à servir une viande prête au bon moment.',
  null,
  null,
  null,
  '{"items":["Stall 65–75°C","Wrap 70–75°C","Tests dès 90°C"]}'::jsonb
)
on conflict do nothing;

insert into public.page_sections (
  page_id, section_type, order_index, is_enabled, title, subtitle, content, cta_text, cta_link, image_url, settings_json
)
values (
  (select id from public.pages where slug = 'home'),
  'calculator_cta',
  3,
  true,
  'Entre ta cuisson.
Reçois ton plan.',
  null,
  'Choisis la viande, entre le poids, règle ton fumoir et ton heure de service. En quelques secondes, tu sais quand lancer la cuisson.',
  'Calculer maintenant',
  null,
  null,
  '{"secondary_cta_text":"Retrouver mes plans","items":[["Tu sais quand démarrer","Une réponse claire à une vraie question de cuisson, sans te noyer dans le détail."],["Tu prévois le repos","Le repos fait partie du plan, pas d’un oubli de dernière minute."],["Tu retrouves tes cuissons","Tu peux revenir sur un service et garder tes repères."]]}'::jsonb
)
on conflict do nothing;

insert into public.page_sections (
  page_id, section_type, order_index, is_enabled, title, subtitle, content, cta_text, cta_link, image_url, settings_json
)
values (
  (select id from public.pages where slug = 'home'),
  'benefits',
  4,
  true,
  null,
  null,
  null,
  null,
  null,
  null,
  '{"items":[{"title":"Tu ne rates plus ton départ","copy":"Tu vois rapidement si ton service demande un lancement la veille, un réveil tôt ou un départ confortable le matin."},{"title":"Tu gères mieux ton repos","copy":"Le plan n’oublie pas le hold. C’est souvent lui qui sauve un service propre et une viande plus sereine."},{"title":"Tu cuisines avec une vraie ligne de conduite","copy":"Repères de stall, wrap, tests de tendreté et fenêtre de service : tu avances avec des points concrets."}]}'::jsonb
)
on conflict do nothing;

insert into public.page_sections (
  page_id, section_type, order_index, is_enabled, title, subtitle, content, cta_text, cta_link, image_url, settings_json
)
values (
  (select id from public.pages where slug = 'home'),
  'cooks',
  5,
  true,
  'Les cuissons qui comptent vraiment.',
  null,
  'Brisket, ribs, pulled pork, paleron, short ribs, poulet, agneau. Tu te projettes tout de suite dans ta prochaine cuisson.',
  null,
  null,
  null,
  '{"items":[{"key":"brisket","title":"Brisket","subtitle":"Longue cuisson, stall, wrap, repos"},{"key":"ribs_pork","title":"Ribs","subtitle":"Couleur, pullback, flex test"},{"key":"pork_shoulder","title":"Pulled pork","subtitle":"Temps long, tendreté, effilochage"},{"key":"paleron","title":"Paleron","subtitle":"Alternative généreuse, très BBQ"},{"key":"ribs_beef","title":"Short ribs","subtitle":"Bark, tendreté, service"},{"key":"chicken_pieces","title":"Poulet","subtitle":"Cuisson plus vive, peau plus propre"},{"key":"lamb_shoulder","title":"Agneau","subtitle":"Version fondante, plus douce, plus souple"}]}'::jsonb
)
on conflict do nothing;

insert into public.page_sections (
  page_id, section_type, order_index, is_enabled, title, subtitle, content, cta_text, cta_link, image_url, settings_json
)
values (
  (select id from public.pages where slug = 'home'),
  'how_it_works',
  6,
  true,
  'Trois étapes, pas plus.',
  'Comment ça marche ?',
  'Le but n’est pas de t’impressionner. Le but, c’est de t’aider à lancer ta cuisson au bon moment.',
  null,
  null,
  null,
  '{"items":[["01","Choisis ta viande","Brisket, ribs, pulled pork, poulet, agneau… commence par la cuisson que tu prépares."],["02","Entre ton poids et ton heure","Tu donnes le poids, la méthode et l’heure à laquelle tu veux servir."],["03","Reçois ton plan","Le site te donne l’heure de départ, la fenêtre de service et les repères utiles."]]}'::jsonb
)
on conflict do nothing;

insert into public.page_sections (
  page_id, section_type, order_index, is_enabled, title, subtitle, content, cta_text, cta_link, image_url, settings_json
)
values (
  (select id from public.pages where slug = 'home'),
  'reassurance',
  7,
  true,
  'Le BBQ reste vivant.',
  'À garder en tête',
  'La viande, le fumoir et la météo peuvent faire bouger la cuisson. Le but est de prévoir large, de garder une vraie marge de repos et de préférer une viande prête un peu tôt qu’un service en retard.',
  null,
  null,
  null,
  '{"items":["Prévoir large","Le repos compte","Le wrap aide","Mieux vaut finir un peu tôt"]}'::jsonb
)
on conflict do nothing;

insert into public.page_sections (
  page_id, section_type, order_index, is_enabled, title, subtitle, content, cta_text, cta_link, image_url, settings_json
)
values (
  (select id from public.pages where slug = 'home'),
  'final_cta',
  8,
  true,
  null,
  null,
  'Lance ta cuisson avec un vrai plan. Prépare ton prochain service sans deviner.',
  'Tester le calculateur',
  null,
  null,
  '{"secondary_cta_text":"Retrouver mes cuissons"}'::jsonb
)
on conflict do nothing;


insert into public.meats (
  slug, name, category, icon, description, default_weight_kg, is_active, display_order
)
values (
  'brisket',
  'Brisket',
  'boeuf',
  '🥩',
  'Méthode Texas classique. Bark d’abord, puis probe tender. Le repos est essentiel.',
  5.5,
  true,
  1
)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  icon = excluded.icon,
  description = excluded.description,
  default_weight_kg = excluded.default_weight_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.meats (
  slug, name, category, icon, description, default_weight_kg, is_active, display_order
)
values (
  'pork_shoulder',
  'Épaule de porc (Pulled Pork)',
  'porc',
  '🐷',
  'Le stall est normal. La texture finale compte plus qu’un chiffre magique.',
  4.5,
  true,
  2
)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  icon = excluded.icon,
  description = excluded.description,
  default_weight_kg = excluded.default_weight_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.meats (
  slug, name, category, icon, description, default_weight_kg, is_active, display_order
)
values (
  'ribs_pork',
  'Spare Ribs',
  'porc',
  '🍖',
  'Les spare ribs se jugent surtout à la couleur, au pullback et au bend test.',
  2,
  true,
  3
)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  icon = excluded.icon,
  description = excluded.description,
  default_weight_kg = excluded.default_weight_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.meats (
  slug, name, category, icon, description, default_weight_kg, is_active, display_order
)
values (
  'ribs_baby_back',
  'Baby Back Ribs',
  'porc',
  '🍖',
  'Plus courtes et plus maigres que les spare ribs. Le flex test reste la vraie référence.',
  1.6,
  true,
  4
)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  icon = excluded.icon,
  description = excluded.description,
  default_weight_kg = excluded.default_weight_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.meats (
  slug, name, category, icon, description, default_weight_kg, is_active, display_order
)
values (
  'ribs_beef',
  'Beef Short Ribs',
  'boeuf',
  '🦴',
  'Très tolérantes grâce au gras. Ne pas précipiter la sortie avant le vrai probe tender.',
  3.5,
  true,
  5
)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  icon = excluded.icon,
  description = excluded.description,
  default_weight_kg = excluded.default_weight_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.meats (
  slug, name, category, icon, description, default_weight_kg, is_active, display_order
)
values (
  'paleron',
  'Paleron / Chuck Roast',
  'boeuf',
  '🥩',
  'Le poor man’s brisket. Plus tolérant que la poitrine, mais toujours piloté à la texture.',
  2.2,
  true,
  6
)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  icon = excluded.icon,
  description = excluded.description,
  default_weight_kg = excluded.default_weight_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.meats (
  slug, name, category, icon, description, default_weight_kg, is_active, display_order
)
values (
  'plat_de_cote',
  'Plat de côte',
  'boeuf',
  '🦴',
  'Le plat de côte supporte bien une cuisson lente jusqu’à une texture fondante.',
  4,
  true,
  7
)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  icon = excluded.icon,
  description = excluded.description,
  default_weight_kg = excluded.default_weight_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.meats (
  slug, name, category, icon, description, default_weight_kg, is_active, display_order
)
values (
  'lamb_shoulder',
  'Épaule d''agneau',
  'agneau',
  '🐑',
  'Approche proche du pulled pork, avec un résultat un peu plus souple à interpréter selon la texture.',
  3.5,
  true,
  8
)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  icon = excluded.icon,
  description = excluded.description,
  default_weight_kg = excluded.default_weight_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.meats (
  slug, name, category, icon, description, default_weight_kg, is_active, display_order
)
values (
  'lamb_leg',
  'Gigot d''agneau',
  'agneau',
  '🐑',
  'Pour une version rosée / medium. Ne pas traiter comme une pièce à effilocher.',
  2.5,
  true,
  9
)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  icon = excluded.icon,
  description = excluded.description,
  default_weight_kg = excluded.default_weight_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.meats (
  slug, name, category, icon, description, default_weight_kg, is_active, display_order
)
values (
  'whole_chicken',
  'Poulet entier',
  'volaille',
  '🍗',
  'Possible, mais la peau reste molle à basse température.',
  1.8,
  true,
  10
)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  icon = excluded.icon,
  description = excluded.description,
  default_weight_kg = excluded.default_weight_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.meats (
  slug, name, category, icon, description, default_weight_kg, is_active, display_order
)
values (
  'chicken_pieces',
  'Cuisses / Pilons de poulet',
  'volaille',
  '🍗',
  'Les cuisses supportent bien les cuissons plus longues grâce au gras.',
  1.2,
  true,
  11
)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  icon = excluded.icon,
  description = excluded.description,
  default_weight_kg = excluded.default_weight_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());


insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'brisket'),
  'low_and_slow',
  'Low & Slow',
  107,
  121,
  110,
  96,
  92,
  97,
  90,
  null,
  0,
  60,
  120,
  66,
  74,
  120,
  'Méthode Texas classique. Bark d’abord, puis probe tender. Le repos est essentiel.',
  'classic_probe',
  null,
  null,
  'weighted',
  125,
  165,
  true,
  1
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'brisket')
      and method_key = 'low_and_slow'
  ),
  165,
  125,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'brisket'),
  'hot_and_fast',
  'Hot & Fast',
  135,
  163,
  149,
  96,
  92,
  97,
  90,
  null,
  0,
  60,
  120,
  66,
  74,
  45,
  'Réduit fortement le temps, mais demande plus de rigueur sur la cuisson du flat.',
  'classic_probe',
  null,
  null,
  'weighted',
  77,
  110,
  true,
  2
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'brisket')
      and method_key = 'hot_and_fast'
  ),
  110,
  77,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'brisket'),
  'texas_crutch',
  'Low & Slow + Wrap',
  107,
  135,
  121,
  96,
  92,
  97,
  90,
  71,
  30,
  60,
  120,
  66,
  74,
  30,
  'Wrap à 71°C environ. Papier boucher recommandé pour préserver davantage la bark.',
  'classic_probe',
  null,
  null,
  'weighted',
  120,
  165,
  true,
  3
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'brisket')
      and method_key = 'texas_crutch'
  ),
  165,
  120,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":71}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'pork_shoulder'),
  'low_and_slow',
  'Low & Slow',
  107,
  121,
  110,
  96,
  92,
  96,
  90,
  null,
  0,
  60,
  120,
  63,
  74,
  120,
  'Le stall est normal. La texture finale compte plus qu’un chiffre magique.',
  'classic_probe',
  null,
  null,
  'weighted',
  150,
  225,
  true,
  1
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'pork_shoulder')
      and method_key = 'low_and_slow'
  ),
  225,
  150,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'pork_shoulder'),
  'hot_and_fast',
  'Hot & Fast',
  121,
  149,
  135,
  96,
  92,
  96,
  90,
  null,
  0,
  60,
  120,
  63,
  74,
  60,
  'Méthode très utilisée en compétition. Bark plus rapide, temps nettement réduit.',
  'classic_probe',
  null,
  null,
  'weighted',
  95,
  145,
  true,
  2
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'pork_shoulder')
      and method_key = 'hot_and_fast'
  ),
  145,
  95,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'pork_shoulder'),
  'texas_crutch',
  'Low & Slow + Wrap',
  107,
  135,
  121,
  96,
  92,
  96,
  90,
  74,
  35,
  60,
  120,
  63,
  74,
  20,
  'Fumer nu puis wrapper vers 74°C. Très bon compromis temps / moelleux.',
  'classic_probe',
  null,
  null,
  'weighted',
  115,
  170,
  true,
  3
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'pork_shoulder')
      and method_key = 'texas_crutch'
  ),
  170,
  115,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":74}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'ribs_pork'),
  'low_and_slow',
  'Low & Slow',
  107,
  121,
  110,
  96,
  null,
  null,
  null,
  null,
  0,
  10,
  20,
  null,
  null,
  0,
  'Les spare ribs se jugent surtout à la couleur, au pullback et au bend test.',
  'ribs_visual',
  300,
  390,
  'fixed',
  220,
  320,
  true,
  1
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'ribs_pork')
      and method_key = 'low_and_slow'
  ),
  320,
  220,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":true,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'ribs_pork'),
  'hot_and_fast',
  'Hot & Fast',
  121,
  163,
  135,
  96,
  null,
  null,
  null,
  null,
  0,
  10,
  20,
  null,
  null,
  0,
  '275°F et plus pour des ribs plus rapides et souvent très propres.',
  'ribs_visual',
  210,
  270,
  'fixed',
  160,
  230,
  true,
  2
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'ribs_pork')
      and method_key = 'hot_and_fast'
  ),
  230,
  160,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":true,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'ribs_pork'),
  'texas_crutch',
  'Low & Slow + Wrap',
  107,
  121,
  110,
  96,
  null,
  null,
  null,
  null,
  0,
  10,
  20,
  null,
  null,
  0,
  'Méthode 3-2-1. Référence populaire, mais à ajuster selon la rack et la texture voulue.',
  'ribs_visual',
  330,
  390,
  'fixed',
  0,
  0,
  true,
  3
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'ribs_pork')
      and method_key = 'texas_crutch'
  ),
  0,
  0,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":true,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'ribs_baby_back'),
  'low_and_slow',
  'Low & Slow',
  107,
  121,
  107,
  96,
  null,
  null,
  null,
  null,
  0,
  10,
  15,
  null,
  null,
  0,
  'Plus courtes et plus maigres que les spare ribs. Le flex test reste la vraie référence.',
  'ribs_visual',
  240,
  300,
  'fixed',
  180,
  260,
  true,
  1
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'ribs_baby_back')
      and method_key = 'low_and_slow'
  ),
  260,
  180,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":true,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'ribs_baby_back'),
  'hot_and_fast',
  'Hot & Fast',
  121,
  149,
  135,
  96,
  null,
  null,
  null,
  null,
  0,
  10,
  15,
  null,
  null,
  0,
  'Fonctionne très bien sur les baby back plus fines.',
  'ribs_visual',
  180,
  240,
  'fixed',
  135,
  210,
  true,
  2
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'ribs_baby_back')
      and method_key = 'hot_and_fast'
  ),
  210,
  135,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":true,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'ribs_baby_back'),
  'texas_crutch',
  'Low & Slow + Wrap',
  107,
  121,
  110,
  96,
  null,
  null,
  null,
  null,
  0,
  10,
  15,
  null,
  null,
  0,
  'Méthode 2-2-1. Très utile comme squelette de cuisson, mais à ajuster au rendu souhaité.',
  'ribs_visual',
  270,
  330,
  'fixed',
  0,
  0,
  true,
  3
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'ribs_baby_back')
      and method_key = 'texas_crutch'
  ),
  0,
  0,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":true,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'ribs_beef'),
  'low_and_slow',
  'Low & Slow',
  107,
  121,
  110,
  96,
  93,
  98,
  92,
  null,
  0,
  30,
  60,
  66,
  74,
  90,
  'Très tolérantes grâce au gras. Ne pas précipiter la sortie avant le vrai probe tender.',
  'ribs_visual',
  null,
  null,
  'weighted',
  170,
  240,
  true,
  1
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'ribs_beef')
      and method_key = 'low_and_slow'
  ),
  240,
  170,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'ribs_beef'),
  'hot_and_fast',
  'Hot & Fast',
  135,
  163,
  141,
  96,
  93,
  98,
  92,
  null,
  0,
  30,
  60,
  66,
  74,
  45,
  'Très bons résultats à 275-285°F. Le gras pardonne beaucoup.',
  'ribs_visual',
  null,
  null,
  'weighted',
  95,
  140,
  true,
  2
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'ribs_beef')
      and method_key = 'hot_and_fast'
  ),
  140,
  95,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'ribs_beef'),
  'texas_crutch',
  'Low & Slow + Wrap',
  107,
  135,
  121,
  96,
  93,
  98,
  92,
  71,
  25,
  30,
  60,
  66,
  74,
  30,
  'Le wrap ou le braisage peuvent accélérer la finition sur les grosses côtes.',
  'ribs_visual',
  null,
  null,
  'weighted',
  135,
  190,
  true,
  3
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'ribs_beef')
      and method_key = 'texas_crutch'
  ),
  190,
  135,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":71}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'paleron'),
  'low_and_slow',
  'Low & Slow',
  107,
  121,
  110,
  96,
  91,
  96,
  91,
  null,
  0,
  60,
  120,
  66,
  74,
  60,
  'Le poor man’s brisket. Plus tolérant que la poitrine, mais toujours piloté à la texture.',
  'classic_probe',
  null,
  null,
  'weighted',
  140,
  210,
  true,
  1
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'paleron')
      and method_key = 'low_and_slow'
  ),
  210,
  140,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'paleron'),
  'hot_and_fast',
  'Hot & Fast',
  121,
  149,
  135,
  96,
  91,
  96,
  91,
  null,
  0,
  60,
  120,
  66,
  74,
  30,
  'Finit souvent plus vite et plus proprement avec une cuisson un peu plus vive.',
  'classic_probe',
  null,
  null,
  'weighted',
  90,
  145,
  true,
  2
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'paleron')
      and method_key = 'hot_and_fast'
  ),
  145,
  90,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'paleron'),
  'texas_crutch',
  'Low & Slow + Wrap',
  107,
  135,
  121,
  96,
  91,
  96,
  91,
  74,
  30,
  60,
  120,
  66,
  74,
  15,
  'Le wrap ou la finition braisée marchent très bien sur le paleron.',
  'classic_probe',
  null,
  null,
  'weighted',
  110,
  165,
  true,
  3
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'paleron')
      and method_key = 'texas_crutch'
  ),
  165,
  110,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":74}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'plat_de_cote'),
  'low_and_slow',
  'Low & Slow',
  107,
  121,
  110,
  96,
  92,
  97,
  90,
  null,
  0,
  30,
  60,
  66,
  74,
  90,
  'Le plat de côte supporte bien une cuisson lente jusqu’à une texture fondante.',
  'classic_probe',
  null,
  null,
  'weighted',
  180,
  250,
  true,
  1
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'plat_de_cote')
      and method_key = 'low_and_slow'
  ),
  250,
  180,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'plat_de_cote'),
  'hot_and_fast',
  'Hot & Fast',
  135,
  163,
  141,
  96,
  92,
  97,
  90,
  null,
  0,
  30,
  60,
  66,
  74,
  45,
  'La montée en température plus franche fonctionne bien sur cette coupe généreuse.',
  'classic_probe',
  null,
  null,
  'weighted',
  105,
  150,
  true,
  2
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'plat_de_cote')
      and method_key = 'hot_and_fast'
  ),
  150,
  105,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'plat_de_cote'),
  'texas_crutch',
  'Low & Slow + Wrap',
  107,
  135,
  121,
  96,
  92,
  97,
  90,
  71,
  25,
  30,
  60,
  66,
  74,
  30,
  'La finition couverte aide à aller vite sur les grosses pièces sans trop dessécher.',
  'classic_probe',
  null,
  null,
  'weighted',
  145,
  205,
  true,
  3
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'plat_de_cote')
      and method_key = 'texas_crutch'
  ),
  205,
  145,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":71}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'lamb_shoulder'),
  'low_and_slow',
  'Low & Slow',
  107,
  121,
  121,
  96,
  90,
  96,
  88,
  null,
  0,
  30,
  60,
  66,
  74,
  60,
  'Approche proche du pulled pork, avec un résultat un peu plus souple à interpréter selon la texture.',
  'classic_probe',
  null,
  null,
  'weighted',
  115,
  170,
  true,
  1
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'lamb_shoulder')
      and method_key = 'low_and_slow'
  ),
  170,
  115,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'lamb_shoulder'),
  'hot_and_fast',
  'Hot & Fast',
  121,
  149,
  135,
  96,
  90,
  96,
  88,
  null,
  0,
  30,
  60,
  66,
  74,
  30,
  'Très bon compromis si tu veux réduire le temps sans perdre la texture.',
  'classic_probe',
  null,
  null,
  'weighted',
  75,
  125,
  true,
  2
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'lamb_shoulder')
      and method_key = 'hot_and_fast'
  ),
  125,
  75,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'lamb_shoulder'),
  'texas_crutch',
  'Low & Slow + Wrap',
  107,
  135,
  121,
  96,
  90,
  96,
  88,
  74,
  30,
  30,
  60,
  66,
  74,
  20,
  'Le wrap vers 74°C aide beaucoup sur les épaules d’agneau plus grosses.',
  'classic_probe',
  null,
  null,
  'weighted',
  95,
  145,
  true,
  3
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'lamb_shoulder')
      and method_key = 'texas_crutch'
  ),
  145,
  95,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":74}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'lamb_leg'),
  'low_and_slow',
  'Low & Slow',
  107,
  121,
  110,
  63,
  57,
  63,
  55,
  null,
  0,
  15,
  30,
  null,
  null,
  0,
  'Pour une version rosée / medium. Ne pas traiter comme une pièce à effilocher.',
  'classic_probe',
  null,
  null,
  'weighted',
  66,
  100,
  true,
  1
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'lamb_leg')
      and method_key = 'low_and_slow'
  ),
  100,
  66,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'lamb_leg'),
  'hot_and_fast',
  'Hot & Fast',
  121,
  149,
  135,
  63,
  57,
  63,
  55,
  null,
  0,
  15,
  30,
  null,
  null,
  0,
  'Très adaptée pour un gigot rosé plus court.',
  'classic_probe',
  null,
  null,
  'weighted',
  44,
  77,
  true,
  2
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'lamb_leg')
      and method_key = 'hot_and_fast'
  ),
  77,
  44,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'lamb_leg'),
  'texas_crutch',
  'Low & Slow + Wrap',
  107,
  135,
  121,
  63,
  57,
  63,
  55,
  null,
  0,
  15,
  30,
  null,
  null,
  0,
  'Plutôt réservé à une version poussée, type effilochée.',
  'classic_probe',
  null,
  null,
  'weighted',
  55,
  88,
  true,
  3
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'lamb_leg')
      and method_key = 'texas_crutch'
  ),
  88,
  55,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'whole_chicken'),
  'low_and_slow',
  'Low & Slow',
  107,
  135,
  121,
  74,
  74,
  76,
  70,
  null,
  0,
  10,
  20,
  null,
  null,
  0,
  'Possible, mais la peau reste molle à basse température.',
  'classic_probe',
  null,
  null,
  'weighted',
  90,
  130,
  true,
  1
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'whole_chicken')
      and method_key = 'low_and_slow'
  ),
  130,
  90,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'whole_chicken'),
  'hot_and_fast',
  'Hot & Fast',
  135,
  163,
  149,
  74,
  74,
  76,
  70,
  null,
  0,
  10,
  20,
  null,
  null,
  0,
  'Méthode recommandée pour une peau plus propre et un meilleur résultat global.',
  'classic_probe',
  null,
  null,
  'weighted',
  55,
  85,
  true,
  2
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'whole_chicken')
      and method_key = 'hot_and_fast'
  ),
  85,
  55,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'whole_chicken'),
  'texas_crutch',
  'Low & Slow + Wrap',
  121,
  149,
  135,
  74,
  74,
  76,
  70,
  null,
  0,
  10,
  20,
  null,
  null,
  0,
  'Peu utilisé en pratique sur le poulet entier.',
  'classic_probe',
  null,
  null,
  'weighted',
  65,
  95,
  true,
  3
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'whole_chicken')
      and method_key = 'texas_crutch'
  ),
  95,
  65,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'chicken_pieces'),
  'low_and_slow',
  'Low & Slow',
  107,
  135,
  121,
  76,
  74,
  78,
  72,
  null,
  0,
  5,
  10,
  null,
  null,
  0,
  'Les cuisses supportent bien les cuissons plus longues grâce au gras.',
  'classic_probe',
  null,
  null,
  'weighted',
  90,
  130,
  true,
  1
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'chicken_pieces')
      and method_key = 'low_and_slow'
  ),
  130,
  90,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'chicken_pieces'),
  'hot_and_fast',
  'Hot & Fast',
  135,
  177,
  149,
  76,
  74,
  78,
  72,
  null,
  0,
  5,
  10,
  null,
  null,
  0,
  'Méthode la plus propre pour une peau croustillante.',
  'classic_probe',
  null,
  null,
  'weighted',
  45,
  75,
  true,
  2
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'chicken_pieces')
      and method_key = 'hot_and_fast'
  ),
  75,
  45,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());

insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = 'chicken_pieces'),
  'texas_crutch',
  'Low & Slow + Wrap',
  121,
  149,
  135,
  76,
  74,
  78,
  72,
  null,
  0,
  5,
  10,
  null,
  null,
  0,
  'Peu utile hors compétition.',
  'classic_probe',
  null,
  null,
  'weighted',
  55,
  85,
  true,
  3
)
on conflict (meat_id, method_key) do update set
  label = excluded.label,
  smoker_temp_min = excluded.smoker_temp_min,
  smoker_temp_max = excluded.smoker_temp_max,
  smoker_temp_default = excluded.smoker_temp_default,
  target_internal_temp = excluded.target_internal_temp,
  target_internal_temp_min = excluded.target_internal_temp_min,
  target_internal_temp_max = excluded.target_internal_temp_max,
  probe_start_temp = excluded.probe_start_temp,
  wrap_temp = excluded.wrap_temp,
  wrap_time_saved_percent = excluded.wrap_time_saved_percent,
  rest_min = excluded.rest_min,
  rest_max = excluded.rest_max,
  stall_min = excluded.stall_min,
  stall_max = excluded.stall_max,
  stall_duration_min = excluded.stall_duration_min,
  notes = excluded.notes,
  timeline_profile = excluded.timeline_profile,
  fixed_total_min = excluded.fixed_total_min,
  fixed_total_max = excluded.fixed_total_max,
  sizing_model = excluded.sizing_model,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = 'chicken_pieces')
      and method_key = 'texas_crutch'
  ),
  85,
  55,
  0,
  0,
  0,
  '{"overweight_from_kg":6,"overweight_percent_per_kg":0.03}'::jsonb,
  '{"fixed_total":false,"wrap_temp":null}'::jsonb
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());
