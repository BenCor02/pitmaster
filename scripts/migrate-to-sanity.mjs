/**
 * Migration Supabase → Sanity  (zéro dépendance npm — fetch natif Node 18+)
 * Guides (19) + Recettes (~78) avec corrections terminologie FR
 *
 * Usage :
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=eyJxxx \
 *   SANITY_TOKEN=skxxx \
 *   node scripts/migrate-to-sanity.mjs
 */

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, '')
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const SANITY_TOKEN = process.env.SANITY_TOKEN
const SANITY_PROJECT = 'nv9jfkc3'
const SANITY_DATASET = 'production'
const SANITY_API    = `https://${SANITY_PROJECT}.api.sanity.io/v2025-01-01/data`

if (!SUPABASE_URL || !SUPABASE_KEY || !SANITY_TOKEN) {
  console.error('❌ Variables manquantes : SUPABASE_URL, SUPABASE_SERVICE_KEY, SANITY_TOKEN')
  process.exit(1)
}

// ── Helpers Supabase ─────────────────────────────────────────────────────────

async function supabaseFetch(table, params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`
  console.log(`   → GET ${url.slice(0, 80)}…`)
  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
    return res.json()
  } catch (err) {
    throw new Error(`Supabase ${table}: ${err.message}`)
  }
}

// ── Helpers Sanity ───────────────────────────────────────────────────────────

async function sanityMutate(mutations) {
  const res = await fetch(`${SANITY_API}/mutate/${SANITY_DATASET}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SANITY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutations }),
  })
  if (!res.ok) throw new Error(`Sanity mutate: ${res.status} ${await res.text()}`)
  return res.json()
}

async function sanityExists(docId) {
  const res = await fetch(
    `${SANITY_API}/query/${SANITY_DATASET}?query=*[_id=="${docId}"][0]._id`,
    { headers: { Authorization: `Bearer ${SANITY_TOKEN}` } }
  )
  const json = await res.json()
  return !!json?.result
}

// ── Corrections terminologie ─────────────────────────────────────────────────

const TERM_FIXES = [
  [/\bDry Rub\b/gi,  'Rub sec'],
  [/\bWet Rub\b/gi,  'Rub humide'],
  [/\bMop Sauce\b/gi, "Sauce d'arrosage"],
  [/\bStall\b/gi,    'Plateau de cuisson (Stall)'],
  [/\bBark\b/gi,     'Croûte (Bark)'],
]

function fix(text) {
  if (!text) return text
  let s = text
  for (const [p, r] of TERM_FIXES) s = s.replace(p, r)
  return s
}

function sanityId(type, uuid) {
  return `${type}-${uuid.replace(/-/g, '')}`
}

// ── Migration Guides ──────────────────────────────────────────────────────────

async function migrateGuides() {
  console.log('\n📚 Migration des guides…')
  const guides = await supabaseFetch('guides', 'status=eq.published&order=sort_order.asc')
  console.log(`   ${guides.length} guides trouvés`)

  let created = 0, skipped = 0

  for (const g of guides) {
    const _id = sanityId('guide', g.id)
    if (await sanityExists(_id)) { skipped++; continue }

    const doc = {
      _id,
      _type: 'guide',
      title:    fix(g.title),
      slug:     { _type: 'slug', current: g.slug },
      summary:  fix(g.summary),
      content:  fix(g.content),
      coverUrl: g.cover_url || null,
      category: g.category  || null,
      meatType: g.meat_type || null,
      tags:     g.tags      || [],
      publishedAt: g.created_at,
      status: 'published',
      seo: {
        title:       fix(g.seo_title)       || null,
        description: fix(g.seo_description) || null,
      },
    }

    await sanityMutate([{ createOrReplace: doc }])
    console.log(`   ✅ ${g.title}`)
    created++
  }

  console.log(`   → ${created} créés, ${skipped} déjà existants`)
}

// ── Migration Recettes ────────────────────────────────────────────────────────

async function migrateRecipes() {
  console.log('\n🧂 Migration des recettes…')
  const recipes = await supabaseFetch('recipes', 'status=eq.published&order=sort_order.asc')
  console.log(`   ${recipes.length} recettes trouvées`)

  let created = 0, skipped = 0

  for (const r of recipes) {
    const _id = sanityId('recipe', r.id)
    if (await sanityExists(_id)) { skipped++; continue }

    const ingredients = (r.ingredients || []).map((ing, i) => ({
      _type: 'object',
      _key:  `ing${i}`,
      name:  ing.name || ing.ingredient || '',
      qty:   ing.qty  || ing.quantity   || ing.amount || '',
      note:  ing.note || '',
    }))

    const steps = (r.steps || []).map(s =>
      typeof s === 'string' ? s : s.step || s.text || String(s)
    )

    const doc = {
      _id,
      _type: 'recipe',
      title:       fix(r.title),
      slug:        { _type: 'slug', current: r.slug },
      type:        r.type        || 'rub',
      summary:     fix(r.summary),
      description: fix(r.description),
      ingredients,
      steps,
      yieldAmount: r.yield_amount || null,
      prepTime:    r.prep_time   || null,
      meatTypes:   r.meat_types  || [],
      origin:      r.origin      || null,
      difficulty:  r.difficulty  || 'facile',
      tags:        r.tags        || [],
      coverUrl:    r.cover_url   || null,
      status: 'published',
    }

    await sanityMutate([{ createOrReplace: doc }])
    console.log(`   ✅ ${r.title}`)
    created++
  }

  console.log(`   → ${created} créées, ${skipped} déjà existantes`)
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Migration Supabase → Sanity')
  try {
    await migrateGuides()
    await migrateRecipes()
    console.log('\n✨ Migration terminée !')
  } catch (err) {
    console.error('\n❌', err.message)
    process.exit(1)
  }
}

main()
