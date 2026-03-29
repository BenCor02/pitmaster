/**
 * Vercel Serverless Function — Prerendering SEO
 *
 * Génère du HTML statique avec meta tags, JSON-LD et contenu
 * pour les crawlers (Googlebot, etc.) qui ne peuvent pas exécuter JS.
 *
 * Accessible via le middleware Edge (transparente pour les bots).
 */

import { createClient } from '@supabase/supabase-js'

const SITE = 'https://charbonetflamme.fr'
const SITE_NAME = 'Charbon & Flamme'

function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function markdownToText(md) {
  if (!md) return ''
  return md
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[|\-]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

function htmlShell({ title, description, canonical, body, jsonLd }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:locale" content="fr_FR">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#09090b">
  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
  ${body}
</body>
</html>`
}

// ── PAGE BUILDERS ──────────────────────────────────────────

function buildHomePage() {
  return htmlShell({
    title: 'Charbon & Flamme — Calculateur BBQ Pitmaster',
    description: 'Calculateur de cuisson BBQ pitmaster. Temps de cuisson brisket, pulled pork, ribs, reverse sear. Planifie ta cuisson comme un pro.',
    canonical: SITE,
    body: `
      <h1>Charbon & Flamme — Calculateur BBQ Pitmaster</h1>
      <p>Planifie ta cuisson au fumoir comme un vrai pitmaster. Brisket, pulled pork, ribs, poulet entier, côte de bœuf — chaque pièce a son temps, ses phases et ses repères terrain.</p>
      <h2>Viandes disponibles</h2>
      <ul>
        <li>Brisket (pointe de poitrine de bœuf)</li>
        <li>Pulled Pork (effiloché d'échine de porc)</li>
        <li>Beef Short Ribs (plat de côtes de bœuf)</li>
        <li>Spare Ribs</li>
        <li>Baby Back Ribs</li>
        <li>Chuck Roast (paleron de bœuf)</li>
        <li>Poulet entier au fumoir</li>
        <li>Prime Rib (train de côtes)</li>
        <li>Tomahawk</li>
      </ul>
      <nav>
        <a href="/guides">Guides BBQ</a>
      </nav>
    `,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: SITE,
      applicationCategory: 'UtilitiesApplication',
      description: 'Calculateur de cuisson BBQ pitmaster adapté au public français.',
      inLanguage: 'fr',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    },
  })
}

function buildGuidesListPage(guides) {
  const guideLinks = guides
    .map(g => `<li><a href="/guides/${escapeHtml(g.slug)}">${escapeHtml(g.title)}</a><p>${escapeHtml(g.summary || '')}</p></li>`)
    .join('\n')

  return htmlShell({
    title: 'Guides BBQ — Charbon & Flamme',
    description: 'Tous les guides pitmaster pour maîtriser le barbecue low & slow : brisket, pulled pork, ribs, saisie inversée, gestion du feu et plus.',
    canonical: `${SITE}/guides`,
    body: `
      <h1>Guides BBQ Pitmaster</h1>
      <p>Tous les guides pour maîtriser le barbecue low & slow, adapté au public français.</p>
      <ul>${guideLinks}</ul>
    `,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Guides BBQ — Charbon & Flamme',
      url: `${SITE}/guides`,
      description: 'Collection de guides BBQ pitmaster pour le public français.',
      inLanguage: 'fr',
    },
  })
}

function buildGuidePage(guide) {
  const textContent = markdownToText(guide.content)
  const truncated = textContent.slice(0, 3000)

  return htmlShell({
    title: guide.seo_title || `${guide.title} — Charbon & Flamme`,
    description: guide.seo_description || guide.summary || '',
    canonical: `${SITE}/guides/${guide.slug}`,
    body: `
      <article>
        <h1>${escapeHtml(guide.title)}</h1>
        ${guide.summary ? `<p><strong>${escapeHtml(guide.summary)}</strong></p>` : ''}
        <div>${escapeHtml(truncated)}</div>
        <nav>
          <a href="/guides">Retour aux guides</a>
          <a href="/">Calculateur BBQ</a>
        </nav>
      </article>
    `,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      description: guide.seo_description || guide.summary,
      url: `${SITE}/guides/${guide.slug}`,
      datePublished: guide.created_at,
      dateModified: guide.updated_at,
      image: guide.cover_url || undefined,
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE,
      },
      inLanguage: 'fr',
      mainEntityOfPage: `${SITE}/guides/${guide.slug}`,
    },
  })
}

function build404Page() {
  return htmlShell({
    title: 'Page introuvable — Charbon & Flamme',
    description: 'Cette page n\'existe pas.',
    canonical: SITE,
    body: `<h1>404 — Page introuvable</h1><p><a href="/">Retour à l'accueil</a></p>`,
  })
}

// ── HANDLER ────────────────────────────────────────────────

export default async function handler(req, res) {
  const path = (req.query.path || '/').replace(/\/+$/, '') || '/'

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null

  let html

  try {
    // ── Accueil
    if (path === '/' || path === '') {
      html = buildHomePage()
    }

    // ── Liste guides
    else if (path === '/guides') {
      let guides = []
      if (supabase) {
        const { data } = await supabase
          .from('guides')
          .select('title, slug, summary')
          .eq('status', 'published')
          .order('sort_order', { ascending: true })
        if (data) guides = data
      }
      html = buildGuidesListPage(guides)
    }

    // ── Guide individuel
    else if (path.startsWith('/guides/')) {
      const slug = path.replace('/guides/', '')
      let guide = null
      if (supabase && slug) {
        const { data } = await supabase
          .from('guides')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single()
        if (data) guide = data
      }
      html = guide ? buildGuidePage(guide) : build404Page()
    }

    // ── Toute autre page
    else {
      html = build404Page()
    }
  } catch (e) {
    console.error('Prerender error:', e)
    html = build404Page()
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(html)
}
