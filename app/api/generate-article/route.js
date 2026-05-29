/**
 * POST /api/generate-article
 * Génère un article BBQ long format via Claude et le crée dans Sanity (brouillon)
 *
 * Body JSON :
 *   { topic: string, keyword: string, category: string, brief: string, publishNow?: boolean }
 *
 * Env requis dans Vercel :
 *   ANTHROPIC_API_KEY  — console.anthropic.com
 *   SANITY_API_TOKEN   — sanity.io/manage → API → Tokens (Editor ou Write)
 *   CRON_SECRET        — chaîne aléatoire pour sécuriser le cron
 */
import { getSanityWriteClient } from '../../../src/lib/sanity.js'

const CATEGORY_CONTEXT = {
  technique:  'une technique de cuisson BBQ',
  equipement: 'un équipement BBQ',
  science:    'la science derrière la cuisson BBQ',
  recette:    'une recette ou assaisonnement BBQ',
  culture:    "la culture et l'histoire du BBQ",
  saison:     'le BBQ selon les saisons',
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96)
}

export async function POST(request) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY manquante' }, { status: 500 })
  }

  let topic, keyword, category, brief, publishNow
  try {
    const body = await request.json()
    topic      = body.topic
    keyword    = body.keyword || topic
    category   = body.category || 'technique'
    brief      = body.brief || ''
    publishNow = body.publishNow || false
  } catch {
    return Response.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  if (!topic) return Response.json({ error: 'Paramètre topic requis' }, { status: 400 })

  const categoryCtx = CATEGORY_CONTEXT[category] || 'le barbecue'

  // ── 1. Générer avec Claude ───────────────────────────────────
  let articleData
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-key':        anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-opus-4-6',
        max_tokens: 8000,
        system: `Tu es le rédacteur en chef de Charbon & Flamme, le premier média BBQ francophone de référence.
Tu écris des articles long format, riches en informations concrètes sur ${categoryCtx}.

RÈGLES STYLISTIQUES :
- Ton expert mais accessible, comme un pitmaster qui partage son savoir
- Tutoiement naturel, direct, sans condescendance
- Zéro jargon non expliqué — chaque terme technique est défini la première fois
- Chiffres précis : températures en °C (et °F entre parenthèses), temps en heures/minutes
- Exemples concrets, pas de généralités creuses

STRUCTURE OBLIGATOIRE (Markdown) :
1. Introduction accrocheuse (2-3 §) — pose le problème ou l'enjeu
2. 4 à 6 sections H2 avec sous-sections H3 si besoin
3. Au moins un tableau ou liste structurée si pertinent
4. "## L'essentiel à retenir" en fin — 3-5 points clés, style bullet
5. "## Aller plus loin" — 2-3 suggestions de sujets connexes (juste les titres)

LONGUEUR : 2000-2500 mots minimum. Ne pas couper court.

FORMAT DE RÉPONSE : JSON strict, aucun texte autour, uniquement :
{
  "title": "Titre accrocheur optimisé SEO (50-65 caractères)",
  "seoTitle": "Variante pour balise <title> si différente (60 car max, sinon null)",
  "seoDescription": "Meta description 140-155 caractères, avec le mot-clé principal",
  "excerpt": "Chapeau éditorial 2-3 phrases (180 car max)",
  "body": "Contenu complet en Markdown (2000+ mots)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Les tags doivent être 4-6 mots-clés pertinents en français, minuscules, sans accents si possible.`,

        messages: [{
          role: 'user',
          content: `Écris un article long format sur : "${topic}"

Mot-clé SEO principal à intégrer naturellement : "${keyword}"

Contexte / angle éditorial à couvrir :
${brief || 'Traite le sujet de façon complète, du niveau débutant à expert.'}

Rappel : JSON uniquement, 2000+ mots dans "body".`,
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
    return Response.json({ error: `Erreur génération IA: ${e.message}` }, { status: 502 })
  }

  // ── 2. Créer dans Sanity ─────────────────────────────────────
  try {
    const client = getSanityWriteClient()
    const slug   = slugify(articleData.title)

    // Tags : fusionner ceux générés par l'IA + le keyword source
    const kwTag = keyword.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    const tags  = [...new Set([...(articleData.tags || []), kwTag, category])].slice(0, 8)

    const doc = {
      _type:       'article',
      title:       articleData.title,
      slug:        { _type: 'slug', current: slug },
      excerpt:     articleData.excerpt,
      body:        articleData.body,
      category,
      tags,
      seo: {
        title:       articleData.seoTitle || articleData.title,
        description: articleData.seoDescription || articleData.excerpt,
      },
      authorName:  'IA — Charbon & Flamme',
      aiGenerated: true,
      showNewsletter: true,
      sourceKeyword: keyword,
      ...(publishNow ? { publishedAt: new Date().toISOString() } : {}),
    }

    const created = await client.create(doc)
    return Response.json({
      success: true,
      id:      created._id,
      slug,
      title:   articleData.title,
      tags,
    })
  } catch (e) {
    if (e.message.includes('SANITY_API_TOKEN')) {
      return Response.json({ success: false, content: articleData, error: e.message })
    }
    return Response.json({ error: `Erreur Sanity: ${e.message}` }, { status: 500 })
  }
}
