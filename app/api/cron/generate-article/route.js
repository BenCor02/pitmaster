/**
 * GET /api/cron/generate-article
 * Déclenché automatiquement par Vercel Cron (voir vercel.json)
 *
 * Logique :
 *   1. Récupère tous les articles existants dans Sanity (sourceKeyword)
 *   2. Sélectionne un topic non encore traité depuis BBQ_TOPICS
 *   3. Appelle /api/generate-article pour générer l'article
 *   4. Retourne le résultat
 *
 * Env requis dans Vercel :
 *   CRON_SECRET        — chaîne aléatoire, configurée dans vercel.json + env vars
 *   ANTHROPIC_API_KEY  — console.anthropic.com
 *   SANITY_API_TOKEN   — manage.sanity.io → API → Tokens
 *   NEXT_PUBLIC_BASE_URL — ex : https://charbonetflamme.fr
 */

import { sanityClient } from '../../../../src/lib/sanity.js'
import { BBQ_TOPICS } from '../../../../src/data/bbq-topics.js'

export const runtime = 'nodejs'

// Vercel Cron passe Authorization: Bearer <CRON_SECRET>
function isAuthorized(request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true // pas de secret configuré → mode dev permissif
  const auth = request.headers.get('authorization') || ''
  return auth === `Bearer ${cronSecret}`
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 1. Topics déjà générés ──────────────────────────────────
  let usedKeywords = new Set()
  try {
    const existing = await sanityClient.fetch(
      `*[_type == "article" && defined(sourceKeyword)].sourceKeyword`,
      {},
      { cache: 'no-store' }
    )
    usedKeywords = new Set(existing || [])
  } catch (e) {
    console.error('[cron] Sanity fetch failed:', e.message)
    // On continue quand même — au pire on regénère un topic
  }

  // ── 2. Choisir un topic non traité ──────────────────────────
  const available = BBQ_TOPICS.filter(t => !usedKeywords.has(t.keyword))

  if (available.length === 0) {
    return Response.json({
      skipped: true,
      reason: 'Tous les topics BBQ_TOPICS ont déjà été générés.',
      total:  BBQ_TOPICS.length,
    })
  }

  // Sélection aléatoire parmi les topics disponibles
  const topic = available[Math.floor(Math.random() * available.length)]

  console.log(`[cron] Topic sélectionné : "${topic.title}" (${available.length} disponibles)`)

  // ── 3. Appeler la route de génération ───────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://charbonetflamme.fr'

  let result
  try {
    const res = await fetch(`${baseUrl}/api/generate-article`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic:      topic.title,
        keyword:    topic.keyword,
        category:   topic.category,
        brief:      topic.brief,
        publishNow: false,   // toujours en brouillon, approbation manuelle
      }),
    })
    result = await res.json()

    if (!res.ok || result.error) {
      throw new Error(result.error || `HTTP ${res.status}`)
    }
  } catch (e) {
    console.error('[cron] Génération échouée:', e.message)
    return Response.json({ error: `Génération échouée: ${e.message}` }, { status: 502 })
  }

  console.log(`[cron] Article créé : "${result.title}" → /articles/${result.slug}`)

  return Response.json({
    success:   true,
    topic:     topic.keyword,
    category:  topic.category,
    title:     result.title,
    slug:      result.slug,
    sanityId:  result.id,
    remaining: available.length - 1,
  })
}
