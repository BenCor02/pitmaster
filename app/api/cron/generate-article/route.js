/**
 * GET /api/cron/generate-article
 * Déclenché 2x/jour par Vercel Cron (07h et 17h UTC)
 *
 * Logique :
 *   1. Récupère les tendances BBQ depuis Reddit (r/BBQ, r/smoking, r/grilling, r/France)
 *   2. Récupère les sourceKeywords déjà utilisés dans Sanity
 *   3. Claude choisit un topic tendance ET écrit l'article complet en un seul appel
 *   4. Sauvegarde en brouillon dans Sanity
 *
 * Env Vercel requis :
 *   CRON_SECRET, ANTHROPIC_API_KEY, SANITY_API_TOKEN
 */

import { revalidatePath, revalidateTag } from 'next/cache'
import { sanityClient, getSanityWriteClient } from '../../../../src/lib/sanity.js'

export const runtime     = 'nodejs'
export const maxDuration = 300  // secondes (Vercel Pro)

// ── Auth ──────────────────────────────────────────────────────
function isAuthorized(request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return (request.headers.get('authorization') || '') === `Bearer ${secret}`
}

// ── Saison ────────────────────────────────────────────────────
function getSeason(month) {
  if ([2, 3, 4].includes(month)) return 'printemps — saison de reprise du BBQ'
  if ([5, 6, 7].includes(month)) return 'été — pleine saison BBQ, grillades quotidiennes'
  if ([8, 9, 10].includes(month)) return 'automne — BBQ de fin de saison, low & slow longue durée'
  return 'hiver — fumage en conditions froides, BBQ de Noël'
}

// ── Tendances Reddit (RSS public, sans auth) ──────────────────
async function fetchRedditTrends() {
  const feeds = [
    { url: 'https://www.reddit.com/r/BBQ/hot.rss',          origin: 'BBQ américain' },
    { url: 'https://www.reddit.com/r/smoking/hot.rss',       origin: 'Fumage' },
    { url: 'https://www.reddit.com/r/grilling/hot.rss',      origin: 'Grillades' },
    { url: 'https://www.reddit.com/r/Barbeque/hot.rss',      origin: 'Barbecue général' },
  ]

  const trends = []
  const timeout = AbortSignal.timeout(6000)

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'CharbonetFlamme-Bot/1.0' },
        signal: timeout,
      })
      if (!res.ok) continue
      const xml = await res.text()

      // Extraire les titres du RSS (format Atom ou RSS2)
      const matches = [...xml.matchAll(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/gs)]
      const titles  = matches
        .map(m => m[1].trim())
        .filter(t => t.length > 15 && !t.toLowerCase().includes('reddit'))
        .slice(0, 6)

      titles.forEach(t => trends.push(`[${feed.origin}] ${t}`))
    } catch {
      // Timeout ou réseau — on continue sans
    }
  }

  return trends.slice(0, 24)
}

// ── Image Pexels ──────────────────────────────────────────────
const CATEGORY_QUERIES = {
  technique:  'bbq barbecue grilling smoke',
  equipement: 'bbq smoker grill equipment',
  science:    'meat cooking fire wood smoke',
  recette:    'bbq grilled food recipe',
  culture:    'barbecue american food outdoor',
  saison:     'outdoor grilling summer fire',
}

async function fetchPexelsImage(category, imageQuery) {
  const pexelsKey = process.env.PEXELS_API_KEY
  if (!pexelsKey) return null

  // Priorité : query spécifique générée par Claude, sinon fallback catégorie
  const query = imageQuery || CATEGORY_QUERIES[category] || 'bbq barbecue'
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      {
        headers: { Authorization: pexelsKey },
        signal: AbortSignal.timeout(5000),
      }
    )
    if (!res.ok) return null
    const data  = await res.json()
    const photos = data.photos || []
    if (!photos.length) return null
    // Photo aléatoire parmi les 5 premiers résultats
    const photo = photos[Math.floor(Math.random() * photos.length)]
    return {
      url:          photo.src.large2x || photo.src.large,
      photographer: photo.photographer,
      pexelsUrl:    photo.url,
    }
  } catch {
    return null
  }
}

// ── Injection d'images dans le body Markdown ─────────────────
async function injectImagesInBody(body) {
  const markers = [...body.matchAll(/\[IMAGE:\s*([^\]]+)\]/g)]
  if (!markers.length) return body

  let result = body
  for (const marker of markers) {
    const [full, query] = marker
    const img = await fetchPexelsImage(null, query.trim())
    if (img) {
      const mdImage = `\n\n![${query.trim()}](${img.url})\n*Crédit : ${img.photographer} / Pexels*\n\n`
      result = result.replace(full, mdImage)
    } else {
      result = result.replace(full, '') // supprime le marqueur si pas d'image
    }
  }
  return result
}

// ── Slugify ───────────────────────────────────────────────────
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .slice(0, 96)
}

// ── Handler principal ─────────────────────────────────────────
export async function GET(request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY manquante' }, { status: 500 })
  }

  // 1. Tendances Reddit
  const trendingPosts = await fetchRedditTrends()
  console.log(`[cron] ${trendingPosts.length} tendances récupérées`)

  // 2. Topics déjà couverts
  let usedKeywords = []
  try {
    usedKeywords = await sanityClient.fetch(
      `*[_type == "article" && defined(sourceKeyword)].sourceKeyword`,
      {},
      { cache: 'no-store' }
    ) || []
  } catch (e) {
    console.warn('[cron] Sanity read failed:', e.message)
  }

  // 3. Contexte temporel
  const now    = new Date()
  const month  = now.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
  const season = getSeason(now.getMonth())

  // 4. Claude : choix du topic + rédaction complète en UN seul appel
  let articleData
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':          anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',   // plus rapide qu'opus, dans le timeout 60s
        max_tokens: 8000,
        system: `Tu es le rédacteur en chef de Charbon & Flamme, premier média BBQ francophone de référence.

Tu rédiges des articles long format (2000-2500 mots) qui mélangent :
- Techniques et recettes de BBQ américain (Texas, Kansas City, Carolina, Memphis)
- BBQ français : cochon de lait, agneau, bœuf Charolais, fromages fumés, vins d'accompagnement
- Tendances actuelles des communautés BBQ en ligne
- Contenu saisonnier adapté au calendrier français

STYLE : expert mais accessible, tutoiement naturel, chiffres précis (°C, temps), anecdotes de pitmaster.

STRUCTURE OBLIGATOIRE :
1. Introduction accrocheuse (2-3 §)
2. 4-6 sections H2 avec sous-sections H3 si besoin
3. Place 2 à 3 marqueurs d'images dans le corps aux transitions naturelles entre sections, format : [IMAGE: search terms in english]
   Exemples : [IMAGE: smoked brisket sliced texas] ou [IMAGE: offset smoker wood fire] ou [IMAGE: pitmaster bbq competition]
   → Chaque marqueur sera remplacé par une vraie photo Pexels adaptée au contenu
4. Un tableau ou liste structurée si pertinent
5. "## L'essentiel à retenir" — 3-5 bullet points
6. "## Aller plus loin" — 2-3 titres de sujets connexes

FORMAT DE RÉPONSE : JSON strict uniquement :
{
  "sourceKeyword": "mot-cle-kebab-case-unique",
  "title": "Titre accrocheur SEO (50-65 caractères)",
  "seoTitle": "Variante <title> si différente (60 car max, null sinon)",
  "seoDescription": "Meta description 140-155 caractères avec mot-clé",
  "excerpt": "Chapeau éditorial 2-3 phrases (180 car max)",
  "body": "Contenu Markdown 2000+ mots avec 2-3 marqueurs [IMAGE: ...] aux bons endroits",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "technique|science|equipement|recette|culture|saison",
  "imageQuery": "3-5 mots anglais pour la photo de couverture (ex: 'smoked brisket texas bbq')"
}`,

        messages: [{
          role: 'user',
          content: `## Contexte
Date : ${month} — Saison : ${season}

## Tendances actuelles sur les forums BBQ internationaux
${trendingPosts.length > 0
  ? trendingPosts.map(t => `• ${t}`).join('\n')
  : '(aucune tendance récupérée — choisis un sujet saisonnier pertinent)'
}

## Topics déjà traités sur Charbon & Flamme (à NE PAS répéter)
${usedKeywords.length > 0 ? usedKeywords.join(', ') : '(aucun pour l\'instant)'}

## Ta mission
1. Choisis UN topic BBQ original qui soit :
   - En lien avec une tendance ci-dessus OU saisonnier OU sur le BBQ américain/français
   - Pas encore couvert (voir liste ci-dessus)
   - Optimisé pour le SEO francophone

2. Écris l'article complet 2000+ mots.

Rappel : JSON uniquement, "body" en Markdown complet.`,
        }],
      }),
    })

    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`)
    const result = await res.json()
    const raw    = result.content?.[0]?.text || ''
    const match  = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Réponse IA invalide — JSON non trouvé')
    articleData = JSON.parse(match[0])
  } catch (e) {
    console.error('[cron] Génération IA échouée:', e.message)
    return Response.json({ error: `Génération IA: ${e.message}` }, { status: 502 })
  }

  // 5. Image de couverture via Pexels — utilise la query générée par Claude
  const image = await fetchPexelsImage(articleData.category, articleData.imageQuery)
  if (image) console.log(`[cron] 📸 Image Pexels : ${image.url}`)

  // 6. Sauvegarder dans Sanity
  try {
    const client = getSanityWriteClient()
    const slug   = slugify(articleData.title)

    // Injecter les images inline dans le body avant de sauvegarder
    const injectedBody = await injectImagesInBody(articleData.body || '')
    const kwTag  = (articleData.sourceKeyword || '').replace(/[^a-z0-9-]/g, '')
    const tags   = [...new Set([
      ...(articleData.tags || []),
      kwTag,
      articleData.category,
    ].filter(Boolean))].slice(0, 8)

    const doc = {
      _type:          'article',
      title:          articleData.title,
      slug:           { _type: 'slug', current: slug },
      excerpt:        articleData.excerpt,
      body:           injectedBody,
      category:       articleData.category || 'technique',
      tags,
      seo: {
        title:       articleData.seoTitle || articleData.title,
        description: articleData.seoDescription || articleData.excerpt,
      },
      authorName:     'IA — Charbon & Flamme',
      aiGenerated:    true,
      showNewsletter: true,
      sourceKeyword:  articleData.sourceKeyword || slug,
      publishedAt:    new Date().toISOString(),
      ...(image ? { coverUrl: image.url, coverCredit: `${image.photographer} / Pexels` } : {}),
    }

    const created = await client.create(doc)
    console.log(`[cron] ✅ Article créé : "${articleData.title}" (${created._id})`)

    // Invalider le cache Next.js immédiatement
    revalidateTag('articles')
    revalidatePath('/articles')

    return Response.json({
      success:      true,
      title:        articleData.title,
      slug,
      sanityId:     created._id,
      category:     articleData.category,
      tags,
      trendsUsed:   trendingPosts.length,
      totalCovered: usedKeywords.length + 1,
    })
  } catch (e) {
    console.error('[cron] Sanity write échouée:', e.message)
    return Response.json({ error: `Sanity: ${e.message}` }, { status: 500 })
  }
}
