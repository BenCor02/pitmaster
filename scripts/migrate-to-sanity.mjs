/**
 * Migration Supabase → Sanity
 * Guides (19) + Recettes (~78) avec corrections terminologie FR
 *
 * Usage :
 *   SUPABASE_URL=... SUPABASE_KEY=... SANITY_TOKEN=... node scripts/migrate-to-sanity.mjs
 *
 * Variables d'environnement requises :
 *   SUPABASE_URL        → URL de ton projet Supabase
 *   SUPABASE_SERVICE_KEY → clé service role (pas la clé anon)
 *   SANITY_TOKEN        → token Editor/Write depuis sanity.io/manage
 */

import { createClient } from '@supabase/supabase-js'
import { createClient as createSanityClient } from '@sanity/client'

// ── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const SANITY_TOKEN = process.env.SANITY_TOKEN

if (!SUPABASE_URL || !SUPABASE_KEY || !SANITY_TOKEN) {
  console.error('❌ Variables manquantes : SUPABASE_URL, SUPABASE_SERVICE_KEY, SANITY_TOKEN')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const sanity = createSanityClient({
  projectId: 'nv9jfkc3',
  dataset: 'production',
  apiVersion: '2025-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

// ── Corrections terminologie ─────────────────────────────────────────────────
// On garde les termes BBQ universels (rub, bark, brisket, low & slow…)
// mais on corrige les labels purement anglais sans contexte FR

const TERM_FIXES = [
  // Types de recettes dans les titres
  [/\bDry Rub\b/gi, 'Rub sec'],
  [/\bWet Rub\b/gi, 'Rub humide'],
  [/\bMop Sauce\b/gi, "Sauce d'arrosage"],
  [/\bGlaze\b/gi, 'Laquage'],

  // Termes anatomiques → français avec terme US entre parenthèses
  [/\bFlat\b(?! de)/g, 'Plat (Flat)'],
  [/\bPoint\b(?! de| sur)/g, 'Pointe (Point)'],

  // Cuissons / techniques → garder l'US entre parenthèses pour le SEO
  [/\bWrap\b/gi, 'Emballage (Wrap)'],
  [/\bBark\b/gi, 'Croûte (Bark)'],
  [/\bStall\b/gi, 'Plateau de cuisson (Stall)'],

  // Pitmasters et régions → pas de changement, c'est des noms propres
]

function fixTerms(text) {
  if (!text) return text
  let result = text
  for (const [pattern, replacement] of TERM_FIXES) {
    result = result.replace(pattern, replacement)
  }
  return result
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // retire accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sanityId(type, supabaseId) {
  // Sanity IDs alphanumériques uniquement
  return `${type}-${supabaseId.replace(/-/g, '')}`
}

// ── Migration Guides ──────────────────────────────────────────────────────────

async function migrateGuides() {
  console.log('\n📚 Migration des guides…')

  const { data: guides, error } = await supabase
    .from('guides')
    .select('*')
    .eq('status', 'published')
    .order('sort_order')

  if (error) throw new Error(`Supabase guides: ${error.message}`)
  console.log(`   ${guides.length} guides trouvés`)

  let created = 0, skipped = 0

  for (const g of guides) {
    const docId = sanityId('guide', g.id)

    // Vérifie si déjà migré
    const existing = await sanity.getDocument(docId)
    if (existing) { skipped++; continue }

    const doc = {
      _id: docId,
      _type: 'guide',
      title: fixTerms(g.title),
      slug: { _type: 'slug', current: g.slug },
      summary: fixTerms(g.summary),
      content: fixTerms(g.content),
      coverUrl: g.cover_url || null,
      category: g.category || null,
      meatType: g.meat_type || null,
      tags: g.tags || [],
      publishedAt: g.created_at,
      status: 'published',
      seo: {
        title: fixTerms(g.seo_title) || null,
        description: fixTerms(g.seo_description) || null,
      },
    }

    await sanity.createOrReplace(doc)
    console.log(`   ✅ Guide : ${g.title}`)
    created++
  }

  console.log(`   → ${created} créés, ${skipped} déjà existants`)
}

// ── Migration Recettes ────────────────────────────────────────────────────────

async function migrateRecipes() {
  console.log('\n🧂 Migration des recettes…')

  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('status', 'published')
    .order('sort_order')

  if (error) throw new Error(`Supabase recipes: ${error.message}`)
  console.log(`   ${recipes.length} recettes trouvées`)

  let created = 0, skipped = 0

  for (const r of recipes) {
    const docId = sanityId('recipe', r.id)

    const existing = await sanity.getDocument(docId)
    if (existing) { skipped++; continue }

    // Normaliser les ingrédients (JSONB Supabase → array Sanity)
    const ingredients = (r.ingredients || []).map((ing, i) => ({
      _type: 'object',
      _key: `ing-${i}`,
      name: ing.name || ing.ingredient || '',
      qty: ing.qty || ing.quantity || ing.amount || '',
      note: ing.note || '',
    }))

    // Normaliser les étapes
    const steps = (r.steps || []).map(s =>
      typeof s === 'string' ? s : s.step || s.text || String(s)
    )

    const doc = {
      _id: docId,
      _type: 'recipe',
      title: fixTerms(r.title),
      slug: { _type: 'slug', current: r.slug },
      type: r.type || 'rub',
      summary: fixTerms(r.summary),
      description: fixTerms(r.description),
      ingredients,
      steps,
      yieldAmount: r.yield_amount || null,
      prepTime: r.prep_time || null,
      meatTypes: r.meat_types || [],
      origin: r.origin || null,
      difficulty: r.difficulty || 'facile',
      tags: r.tags || [],
      coverUrl: r.cover_url || null,
      status: 'published',
    }

    await sanity.createOrReplace(doc)
    console.log(`   ✅ Recette : ${r.title}`)
    created++
  }

  console.log(`   → ${created} créées, ${skipped} déjà existantes`)
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Début de la migration Supabase → Sanity')
  console.log(`   Projet Sanity : nv9jfkc3 / production`)

  try {
    await migrateGuides()
    await migrateRecipes()
    console.log('\n✨ Migration terminée avec succès !')
  } catch (err) {
    console.error('\n❌ Erreur :', err.message)
    process.exit(1)
  }
}

main()
