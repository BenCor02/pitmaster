#!/usr/bin/env node
/**
 * Charbon & Flamme — Génération automatique d'articles BBQ
 * Lancé par GitHub Actions 2x/jour (aucun timeout Vercel)
 *
 * Secrets GitHub requis :
 *   ANTHROPIC_API_KEY, SANITY_API_TOKEN, PEXELS_API_KEY (optionnel)
 */

const SANITY_PROJECT  = 'nv9jfkc3'
const SANITY_DATASET  = 'production'
const SANITY_API      = `https://${SANITY_PROJECT}.api.sanity.io/v2025-01-01/data`
const SANITY_TOKEN    = process.env.SANITY_API_TOKEN
const ANTHROPIC_KEY   = process.env.ANTHROPIC_API_KEY
const PEXELS_KEY      = process.env.PEXELS_API_KEY

if (!ANTHROPIC_KEY) { console.error('❌ ANTHROPIC_API_KEY manquante'); process.exit(1) }
if (!SANITY_TOKEN)  { console.error('❌ SANITY_API_TOKEN manquante');  process.exit(1) }

// ── Helpers ───────────────────────────────────────────────────
function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 96)
}

function getSeason(month) {
  if ([2,3,4].includes(month)) return 'printemps — reprise du BBQ, premières grillades'
  if ([5,6,7].includes(month)) return 'été — pleine saison BBQ, grillades quotidiennes'
  if ([8,9,10].includes(month)) return 'automne — BBQ de fin de saison, low & slow'
  return 'hiver — fumage en conditions froides, BBQ festif'
}

async function sanityFetch(query) {
  const url = `${SANITY_API}/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${SANITY_TOKEN}` } })
  const json = await res.json()
  return json.result || []
}

async function sanityMutate(mutations) {
  const res = await fetch(`${SANITY_API}/mutate/${SANITY_DATASET}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SANITY_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations }),
  })
  return res.json()
}

// ── Tendances Reddit ──────────────────────────────────────────
async function fetchRedditTrends() {
  const feeds = [
    { url: 'https://www.reddit.com/r/BBQ/hot.rss',     origin: 'BBQ américain' },
    { url: 'https://www.reddit.com/r/smoking/hot.rss',  origin: 'Fumage' },
    { url: 'https://www.reddit.com/r/grilling/hot.rss', origin: 'Grillades' },
  ]
  const trends = []
  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'CharbonetFlamme-Bot/1.0' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      const xml = await res.text()
      const matches = [...xml.matchAll(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/gs)]
      matches.map(m => m[1].trim())
        .filter(t => t.length > 15 && !t.toLowerCase().includes('reddit'))
        .slice(0, 5)
        .forEach(t => trends.push(`[${feed.origin}] ${t}`))
    } catch (e) {
      console.warn(`Tendances ${feed.origin} : ${e.message}`)
    }
  }
  return trends
}

// ── Image Pexels ──────────────────────────────────────────────
const PEXELS_QUERIES = {
  technique:  'bbq barbecue grilling smoke',
  equipement: 'bbq smoker grill',
  science:    'meat cooking fire wood',
  recette:    'bbq grilled food',
  culture:    'barbecue american outdoor',
  saison:     'outdoor grilling fire',
}

async function fetchPexelsImage(category) {
  if (!PEXELS_KEY) return null
  const query = PEXELS_QUERIES[category] || 'bbq barbecue'
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY }, signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return null
    const data   = await res.json()
    const photos = data.photos || []
    if (!photos.length) return null
    const photo  = photos[Math.floor(Math.random() * photos.length)]
    return { url: photo.src.large2x || photo.src.large, credit: `${photo.photographer} / Pexels` }
  } catch (e) {
    console.warn('Pexels :', e.message)
    return null
  }
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  // 1. Topics déjà couverts
  const usedKeywords = await sanityFetch(
    `*[_type == "article" && defined(sourceKeyword)].sourceKeyword`
  )
  console.log(`📚 ${usedKeywords.length} articles déjà générés`)

  // 2. Tendances Reddit
  const trends = await fetchRedditTrends()
  console.log(`📡 ${trends.length} tendances récupérées`)

  // 3. Contexte temporel
  const now    = new Date()
  const month  = now.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
  const season = getSeason(now.getMonth())

  // 4. Génération Claude
  console.log('🤖 Génération Claude en cours...')
  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':          ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-6',
      max_tokens: 8000,
      system: `Tu es le rédacteur en chef de Charbon & Flamme, premier média BBQ francophone de référence.

Tu rédiges des articles long format (2000-2500 mots) qui mélangent :
- Techniques et recettes de BBQ américain (Texas, Kansas City, Carolina, Memphis)
- BBQ français : cochon de lait, agneau, bœuf Charolais, fromages fumés
- Tendances actuelles des communautés BBQ en ligne
- Contenu saisonnier adapté au calendrier français

STYLE : expert mais accessible, tutoiement naturel, chiffres précis (°C, temps), anecdotes de pitmaster.

STRUCTURE OBLIGATOIRE :
1. Introduction accrocheuse (2-3 §)
2. 4-6 sections H2 avec sous-sections H3
3. Un tableau ou liste structurée si pertinent
4. "## L'essentiel à retenir" — 3-5 bullet points
5. "## Aller plus loin" — 2-3 titres connexes

FORMAT : JSON strict uniquement :
{
  "sourceKeyword": "mot-cle-kebab-case",
  "title": "Titre SEO 50-65 caractères",
  "seoTitle": "Variante <title> ou null",
  "seoDescription": "Meta description 140-155 caractères",
  "excerpt": "Chapeau 2-3 phrases",
  "body": "Contenu Markdown 2000+ mots",
  "tags": ["tag1","tag2","tag3","tag4","tag5"],
  "category": "technique|science|equipement|recette|culture|saison"
}`,
      messages: [{
        role: 'user',
        content: `## Contexte
Date : ${month} — Saison : ${season}

## Tendances actuelles (forums BBQ internationaux)
${trends.length > 0 ? trends.map(t => `• ${t}`).join('\n') : '(aucune tendance — choisis un sujet saisonnier)'}

## Topics déjà couverts (NE PAS répéter)
${usedKeywords.length > 0 ? usedKeywords.join(', ') : '(aucun)'}

## Mission
1. Choisis UN topic BBQ original (tendance, saisonnier, ou BBQ américain/français)
2. Écris l'article complet 2000+ mots
JSON uniquement.`,
      }],
    }),
  })

  if (!claudeRes.ok) {
    const err = await claudeRes.text()
    console.error('❌ Claude API :', err)
    process.exit(1)
  }

  const claudeJson = await claudeRes.json()
  const raw        = claudeJson.content?.[0]?.text || ''
  const match      = raw.match(/\{[\s\S]*\}/)
  if (!match) { console.error('❌ JSON non trouvé dans la réponse Claude'); process.exit(1) }

  const article = JSON.parse(match[0])
  console.log(`✅ Article généré : "${article.title}"`)

  // 5. Image Pexels
  const image = await fetchPexelsImage(article.category)
  if (image) console.log(`📸 Image : ${image.url}`)

  // 6. Sauvegarder dans Sanity
  const slug  = slugify(article.title)
  const kwTag = (article.sourceKeyword || '').replace(/[^a-z0-9-]/g, '')
  const tags  = [...new Set([...(article.tags || []), kwTag, article.category].filter(Boolean))].slice(0, 8)

  const doc = {
    _type:          'article',
    title:          article.title,
    slug:           { _type: 'slug', current: slug },
    excerpt:        article.excerpt,
    body:           article.body,
    category:       article.category || 'technique',
    tags,
    seo: {
      title:       article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt,
    },
    authorName:     'IA — Charbon & Flamme',
    aiGenerated:    true,
    showNewsletter: true,
    sourceKeyword:  article.sourceKeyword || slug,
    publishedAt:    new Date().toISOString(),
    ...(image ? { coverUrl: image.url, coverCredit: image.credit } : {}),
  }

  const result = await sanityMutate([{ create: doc }])
  if (result.error) {
    console.error('❌ Sanity :', JSON.stringify(result.error))
    process.exit(1)
  }

  const created = result.results?.[0]?.document || result.results?.[0]
  console.log(`🎉 Publié dans Sanity : /articles/${slug} (${created?._id || '?'})`)
}

main().catch(e => { console.error('❌ Fatal :', e); process.exit(1) })
