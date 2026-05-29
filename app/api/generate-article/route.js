/**
 * POST /api/generate-article
 * Génère un article BBQ complet via Anthropic Claude
 * 
 * Body: { topic: string, category?: string }
 * Env: ANTHROPIC_API_KEY (à ajouter dans Vercel)
 */

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY non configurée dans les variables d\'environnement Vercel' }, { status: 500 })
  }

  let topic, category
  try {
    const body = await request.json()
    topic = body.topic
    category = body.category || 'technique'
  } catch {
    return Response.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  if (!topic) return Response.json({ error: 'Paramètre topic requis' }, { status: 400 })

  const categoryContext = {
    technique: 'une technique de cuisson BBQ',
    equipement: 'un équipement ou accessoire BBQ',
    science: 'la science derrière la cuisson BBQ',
    recette: 'une recette ou assaisonnement BBQ',
    culture: 'la culture et l\'histoire du BBQ',
    saison: 'le BBQ saisonnier ou de saison',
  }[category] || 'le barbecue'

  const systemPrompt = `Tu es le rédacteur en chef de Charbon & Flamme, le premier média BBQ francophone sérieux. 
Tu écris des articles de haute qualité sur ${categoryContext}.

Règles de rédaction :
- Ton expert mais accessible, comme un pitmaster passionné qui partage son savoir
- Structure claire avec titres H2 et H3 en Markdown
- Articles de fond : 600-900 mots minimum
- Inclure des données concrètes (températures en °C, temps, techniques)
- Terminer par 2-3 conseils clés ("L'essentiel à retenir")
- JAMAIS de mentions commerciales non pertinentes
- Écrire uniquement en français, style éditorial

Format de réponse : JSON strict avec deux clés :
{
  "excerpt": "Une phrase d'accroche de 1-2 phrases maximum (pour la card)",
  "body": "Contenu complet en Markdown"
}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Écris un article complet sur : "${topic}"\n\nRéponds uniquement avec le JSON demandé.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return Response.json({ error: `Anthropic API error: ${err}` }, { status: 502 })
    }

    const result = await response.json()
    const raw = result.content?.[0]?.text || ''

    // Extract JSON from response (may be wrapped in ```json ... ```)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return Response.json({ error: 'Réponse IA invalide' }, { status: 502 })

    const parsed = JSON.parse(jsonMatch[0])
    return Response.json({ body: parsed.body, excerpt: parsed.excerpt })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
