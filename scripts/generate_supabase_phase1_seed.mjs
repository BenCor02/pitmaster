import fs from 'node:fs/promises'
import path from 'node:path'
import { PITMASTER_PROFILES } from '../src/lib/calculator.js'

const ROOT = '/Users/benjamincorette/pitmaster'
const OUT_FILE = path.join(ROOT, 'supabase/seeds/202603280001_phase1_seed.sql')

const categoryMap = {
  brisket: 'boeuf',
  pork_shoulder: 'porc',
  ribs_pork: 'porc',
  ribs_baby_back: 'porc',
  ribs_beef: 'boeuf',
  paleron: 'boeuf',
  plat_de_cote: 'boeuf',
  lamb_shoulder: 'agneau',
  lamb_leg: 'agneau',
  whole_chicken: 'volaille',
  chicken_pieces: 'volaille',
}

const iconMap = {
  brisket: '🥩',
  pork_shoulder: '🐷',
  ribs_pork: '🍖',
  ribs_baby_back: '🍖',
  ribs_beef: '🦴',
  paleron: '🥩',
  plat_de_cote: '🦴',
  lamb_shoulder: '🐑',
  lamb_leg: '🐑',
  whole_chicken: '🍗',
  chicken_pieces: '🍗',
}

const displayOrder = [
  'brisket',
  'pork_shoulder',
  'ribs_pork',
  'ribs_baby_back',
  'ribs_beef',
  'paleron',
  'plat_de_cote',
  'lamb_shoulder',
  'lamb_leg',
  'whole_chicken',
  'chicken_pieces',
]

const homeSections = [
  {
    section_type: 'hero',
    order_index: 1,
    title: 'À QUELLE HEURE\nLANCER TA\nCUISSON BBQ',
    subtitle: 'charbon · braise · service à l’heure',
    content: 'Brisket, ribs, pulled pork ou paleron. Tu choisis la pièce, le poids et l’heure de service. On te dit quand allumer le fumoir pour servir au bon moment, sans deviner.',
    cta_text: 'Calculer ma cuisson',
    settings_json: {
      secondary_cta_text: 'Voir le principe',
      items: ['À quelle heure lancer ?', 'Quand wrapper ?', 'Combien de repos prévoir ?'],
      metrics: [
        ['Allumage', '06h'],
        ['Viande au fumoir', '06h30'],
        ['Service visé', '19h'],
      ],
    },
  },
  {
    section_type: 'value_proof',
    order_index: 2,
    title: 'Plus besoin de deviner.',
    subtitle: 'Pourquoi c’est utile',
    content: 'Tu n’as plus à choisir au hasard entre finir trop tard ou te lever à 4h. Le site t’aide à prévoir large, à mieux gérer le repos et à servir une viande prête au bon moment.',
    settings_json: {
      items: ['Stall 65–75°C', 'Wrap 70–75°C', 'Tests dès 90°C'],
    },
  },
  {
    section_type: 'calculator_cta',
    order_index: 3,
    title: 'Entre ta cuisson.\nReçois ton plan.',
    content: 'Choisis la viande, entre le poids, règle ton fumoir et ton heure de service. En quelques secondes, tu sais quand lancer la cuisson.',
    cta_text: 'Calculer maintenant',
    settings_json: {
      secondary_cta_text: 'Retrouver mes plans',
      items: [
        ['Tu sais quand démarrer', 'Une réponse claire à une vraie question de cuisson, sans te noyer dans le détail.'],
        ['Tu prévois le repos', 'Le repos fait partie du plan, pas d’un oubli de dernière minute.'],
        ['Tu retrouves tes cuissons', 'Tu peux revenir sur un service et garder tes repères.'],
      ],
    },
  },
  {
    section_type: 'benefits',
    order_index: 4,
    settings_json: {
      items: [
        { title: 'Tu ne rates plus ton départ', copy: 'Tu vois rapidement si ton service demande un lancement la veille, un réveil tôt ou un départ confortable le matin.' },
        { title: 'Tu gères mieux ton repos', copy: 'Le plan n’oublie pas le hold. C’est souvent lui qui sauve un service propre et une viande plus sereine.' },
        { title: 'Tu cuisines avec une vraie ligne de conduite', copy: 'Repères de stall, wrap, tests de tendreté et fenêtre de service : tu avances avec des points concrets.' },
      ],
    },
  },
  {
    section_type: 'cooks',
    order_index: 5,
    title: 'Les cuissons qui comptent vraiment.',
    content: 'Brisket, ribs, pulled pork, paleron, short ribs, poulet, agneau. Tu te projettes tout de suite dans ta prochaine cuisson.',
    settings_json: {
      items: [
        { key: 'brisket', title: 'Brisket', subtitle: 'Longue cuisson, stall, wrap, repos' },
        { key: 'ribs_pork', title: 'Ribs', subtitle: 'Couleur, pullback, flex test' },
        { key: 'pork_shoulder', title: 'Pulled pork', subtitle: 'Temps long, tendreté, effilochage' },
        { key: 'paleron', title: 'Paleron', subtitle: 'Alternative généreuse, très BBQ' },
        { key: 'ribs_beef', title: 'Short ribs', subtitle: 'Bark, tendreté, service' },
        { key: 'chicken_pieces', title: 'Poulet', subtitle: 'Cuisson plus vive, peau plus propre' },
        { key: 'lamb_shoulder', title: 'Agneau', subtitle: 'Version fondante, plus douce, plus souple' },
      ],
    },
  },
  {
    section_type: 'how_it_works',
    order_index: 6,
    title: 'Trois étapes, pas plus.',
    subtitle: 'Comment ça marche ?',
    content: 'Le but n’est pas de t’impressionner. Le but, c’est de t’aider à lancer ta cuisson au bon moment.',
    settings_json: {
      items: [
        ['01', 'Choisis ta viande', 'Brisket, ribs, pulled pork, poulet, agneau… commence par la cuisson que tu prépares.'],
        ['02', 'Entre ton poids et ton heure', 'Tu donnes le poids, la méthode et l’heure à laquelle tu veux servir.'],
        ['03', 'Reçois ton plan', 'Le site te donne l’heure de départ, la fenêtre de service et les repères utiles.'],
      ],
    },
  },
  {
    section_type: 'reassurance',
    order_index: 7,
    title: 'Le BBQ reste vivant.',
    subtitle: 'À garder en tête',
    content: 'La viande, le fumoir et la météo peuvent faire bouger la cuisson. Le but est de prévoir large, de garder une vraie marge de repos et de préférer une viande prête un peu tôt qu’un service en retard.',
    settings_json: {
      items: ['Prévoir large', 'Le repos compte', 'Le wrap aide', 'Mieux vaut finir un peu tôt'],
    },
  },
  {
    section_type: 'final_cta',
    order_index: 8,
    content: 'Lance ta cuisson avec un vrai plan. Prépare ton prochain service sans deviner.',
    cta_text: 'Tester le calculateur',
    settings_json: {
      secondary_cta_text: 'Retrouver mes cuissons',
    },
  },
]

function sqlQuote(value) {
  if (value === null || value === undefined) return 'null'
  return `'${String(value).replaceAll("'", "''")}'`
}

function sqlJson(value) {
  return `${sqlQuote(JSON.stringify(value))}::jsonb`
}

function sqlBool(value) {
  return value ? 'true' : 'false'
}

function buildHomeSectionsSql() {
  return homeSections.map((section) => `
insert into public.page_sections (
  page_id, section_type, order_index, is_enabled, title, subtitle, content, cta_text, cta_link, image_url, settings_json
)
values (
  (select id from public.pages where slug = 'home'),
  ${sqlQuote(section.section_type)},
  ${section.order_index},
  true,
  ${sqlQuote(section.title)},
  ${sqlQuote(section.subtitle)},
  ${sqlQuote(section.content)},
  ${sqlQuote(section.cta_text)},
  ${sqlQuote(section.cta_link)},
  ${sqlQuote(section.image_url)},
  ${sqlJson(section.settings_json || {})}
)
on conflict do nothing;`).join('\n')
}

function buildMeatSql() {
  return displayOrder
    .filter((slug) => PITMASTER_PROFILES[slug])
    .map((slug, index) => {
      const profile = PITMASTER_PROFILES[slug]
      return `
insert into public.meats (
  slug, name, category, icon, description, default_weight_kg, is_active, display_order
)
values (
  ${sqlQuote(slug)},
  ${sqlQuote(profile.label)},
  ${sqlQuote(categoryMap[slug] || 'bbq')},
  ${sqlQuote(iconMap[slug] || '🔥')},
  ${sqlQuote(profile.methods?.[0]?.notes || '')},
  ${profile.defaultWeightKg || 3},
  true,
  ${index + 1}
)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  icon = excluded.icon,
  description = excluded.description,
  default_weight_kg = excluded.default_weight_kg,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());`
    }).join('\n')
}

function buildMethodSql() {
  const statements = []
  displayOrder.forEach((slug) => {
    const profile = PITMASTER_PROFILES[slug]
    if (!profile) return
    profile.methods.forEach((method, index) => {
      statements.push(`
insert into public.cooking_methods (
  meat_id, method_key, label, smoker_temp_min, smoker_temp_max, smoker_temp_default,
  target_internal_temp, target_internal_temp_min, target_internal_temp_max, probe_start_temp,
  wrap_temp, wrap_time_saved_percent, rest_min, rest_max, stall_min, stall_max, stall_duration_min,
  notes, timeline_profile, fixed_total_min, fixed_total_max, sizing_model,
  high_temp_minutes_per_kg, low_temp_minutes_per_kg, is_active, display_order
)
values (
  (select id from public.meats where slug = ${sqlQuote(slug)}),
  ${sqlQuote(method.method)},
  ${sqlQuote(method.method === 'low_and_slow' ? 'Low & Slow' : method.method === 'hot_and_fast' ? 'Hot & Fast' : 'Low & Slow + Wrap')},
  ${method.smokerTempRange[0]},
  ${method.smokerTempRange[1]},
  ${method.smokerTempDefault},
  ${profile.tempTarget ?? 'null'},
  ${Array.isArray(profile.temperatureCues?.probeTenderRangeC) ? profile.temperatureCues.probeTenderRangeC[0] : 'null'},
  ${Array.isArray(profile.temperatureCues?.probeTenderRangeC) ? profile.temperatureCues.probeTenderRangeC[1] : 'null'},
  ${Array.isArray(profile.temperatureCues?.probeStartC) ? profile.temperatureCues.probeStartC[0] : profile.temperatureCues?.probeStartC ?? 'null'},
  ${method.wrapTemp ?? 'null'},
  ${method.wrapTimeSavedPercent ?? 0},
  ${method.restMinutes?.[0] ?? 30},
  ${method.restMinutes?.[1] ?? 60},
  ${method.stallRange?.[0] ?? 'null'},
  ${method.stallRange?.[1] ?? 'null'},
  ${method.stallDurationMin ?? 0},
  ${sqlQuote(method.notes || '')},
  ${sqlQuote(slug.startsWith('ribs_') || slug.includes('ribs') ? 'ribs_visual' : 'classic_probe')},
  ${method.fixedTotalMinutes?.[0] ?? 'null'},
  ${method.fixedTotalMinutes?.[1] ?? 'null'},
  ${sqlQuote(method.fixedTotalMinutes ? 'fixed' : 'weighted')},
  ${method.minutesPerKg?.[0] ?? 'null'},
  ${method.minutesPerKg?.[1] ?? 'null'},
  true,
  ${index + 1}
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
  updated_at = timezone('utc', now());`)

      statements.push(`
insert into public.calculator_parameters (
  method_id, low_temp_minutes_per_kg, high_temp_minutes_per_kg, buffer_percent, buffer_min_minutes, buffer_max_minutes,
  weight_adjustment_json, special_rules_json
)
values (
  (
    select id from public.cooking_methods
    where meat_id = (select id from public.meats where slug = ${sqlQuote(slug)})
      and method_key = ${sqlQuote(method.method)}
  ),
  ${method.minutesPerKg?.[1] ?? 0},
  ${method.minutesPerKg?.[0] ?? 0},
  0,
  0,
  0,
  ${sqlJson({ overweight_from_kg: 6, overweight_percent_per_kg: 0.03 })},
  ${sqlJson({ fixed_total: Boolean(method.fixedTotalMinutes), wrap_temp: method.wrapTemp ?? null })}
)
on conflict (method_id) do update set
  low_temp_minutes_per_kg = excluded.low_temp_minutes_per_kg,
  high_temp_minutes_per_kg = excluded.high_temp_minutes_per_kg,
  buffer_percent = excluded.buffer_percent,
  buffer_min_minutes = excluded.buffer_min_minutes,
  buffer_max_minutes = excluded.buffer_max_minutes,
  weight_adjustment_json = excluded.weight_adjustment_json,
  special_rules_json = excluded.special_rules_json,
  updated_at = timezone('utc', now());`)
    })
  })
  return statements.join('\n')
}

const sql = `-- PATCH: seed initial phase 1 Charbon & Flamme
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

${buildHomeSectionsSql()}

${buildMeatSql()}

${buildMethodSql()}
`

await fs.mkdir(path.dirname(OUT_FILE), { recursive: true })
await fs.writeFile(OUT_FILE, sql, 'utf8')
console.log(`Seed written to ${OUT_FILE}`)
