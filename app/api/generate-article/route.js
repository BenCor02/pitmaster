/**
 * POST /api/generate-article
 * Génère un article BBQ via Claude et le crée dans Sanity (brouillon)
 *
 * Env requis dans Vercel :
 *   ANTHROPIC_API_KEY  — console.anthropic.com
 *   SANITY_API_TOKEN   — sanity.io/manage → API → Tokens (Editor ou Write)
 */
import { getSanityWriteClient } from '../../../src/lib/sanity.js'

export async function POST(request) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY manquante dans Vercel env vars' }, { status: 500 })
  }

  let topic, category, publishNow
  try {
    const body = await request.json()
    topic = body.topic; category = body.category || 'technique'; publishNow = body.publishNow || false
  } catch { return Response.json({ error: 'Body JSON invalide' }, { status: 400 }) }

  if (!topic) return Response.json({ error: 'Paramètre topic requis' }, { status: 400 })

  const categoryContext = {
    technique: 'une technique de cuisson BBQ', equipement: 'un équipement BBQ',
    science: 'la science derrière la cuisson BBQ', recette: 'une recette ou assaisonnement BBQ',
    culture: "la culture et l'histoire du BBQ", saison: 'le BBQ de saison',
  }[category] || 'le barbecue'

  // 1. Générer avec Claude
  let articleData
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 4096,
        system: `Tu es le rédacteur en chef de Charbon & Flamme, le premier média BBQ francophone sérieux.
Tu écris des articles de haute qualité sur ${categoryContext}.
- Ton expert mais accessible, comme un pitmaster qui partage son savoir
- Structure claire avec titres H2 et H3 en Markdown
- 700-1000 mots minimum
- Données concrètes (températures °C, temps, techniques)
- Terminer par "## L'essentiel à retenir" avec 3 bullet points
- Uniquement en français, style éditorial

Réponds avec un JSON strict :
{"title":"Titre accrocheur (60 car max)","excerpt":"Chapeau de 1-2 phrases (140 car max)","body":"Contenu complet en Markdown"}`,
        messages: [{ role: 'user', content: `Écris un article sur : "${topic}"\n\nRéponds uniquement avec le JSON.` }],
      }),
    })
    if (!res.ok) throw new Error(`Anthropic: ${await res.text()}`)
    const result = await res.json()
    const raw = result.content?.[0]?.text || ''
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Réponse IA invalide')
    articleData = JSON.parse(match[0])
  } catch (e) {
    return Response.json({ error: `Erreur génération IA: ${e.message}` }, { status: 502 })
  }

  // 2. Créer dans Sanity
  try {
    const client = getSanityWriteClient()
    const slug = articleData.title
      .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 96)

    const doc = {
      _type: 'article',
      title: articleData.title,
      slug: { _type: 'slug', current: slug },
      excerpt: articleData.excerpt,
      body: articleData.body,
      category,
      authorName: 'IA — Charbon & Flamme',
      aiGenerated: true,
      showNewsletter: true,
      ...(publishNow ? { publishedAt: new Date().toISOString() } : {}),
    }

    const created = await client.create(doc)
    return Response.json({ success: true, id: created._id, slug, title: articleData.title })
  } catch (e) {
    if (e.message.includes('SANITY_API_TOKEN')) {
      return Response.json({ success: false, content: articleData, error: e.message })
    }
    return Response.json({ error: `Erreur Sanity: ${e.message}` }, { status: 500 })
  }
}
