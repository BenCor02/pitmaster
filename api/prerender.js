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
  <meta property="og:image" content="${SITE}/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
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
        <a href="/recettes">Recettes & Rubs</a>
        <a href="/bois">Essences de bois</a>
        <a href="/bbq">Types de BBQ</a>
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

function buildRecipesListPage(recipes) {
  const recipeLinks = recipes
    .map(r => `<li><a href="/recettes/${escapeHtml(r.slug)}">${escapeHtml(r.title)}</a><p>${escapeHtml(r.description || '')}</p></li>`)
    .join('\n')

  return htmlShell({
    title: 'Recettes BBQ — Rubs, Marinades & Sauces — Charbon & Flamme',
    description: 'Recettes de rubs, marinades, mops et sauces BBQ pour fumoir. Recettes testées et adaptées au public français.',
    canonical: `${SITE}/recettes`,
    body: `
      <h1>Recettes BBQ — Rubs, Marinades & Sauces</h1>
      <p>Toutes les recettes de rubs, marinades et sauces pour accompagner vos cuissons au fumoir.</p>
      <ul>${recipeLinks}</ul>
    `,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Recettes BBQ — Charbon & Flamme',
      url: `${SITE}/recettes`,
      description: 'Collection de recettes BBQ pour le public français.',
      inLanguage: 'fr',
    },
  })
}

function buildRecipePage(recipe) {
  const textContent = markdownToText(recipe.content || recipe.instructions || '')
  const truncated = textContent.slice(0, 2000)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description || recipe.summary || '',
    url: `${SITE}/recettes/${recipe.slug}`,
    image: recipe.image_url || undefined,
    datePublished: recipe.created_at,
    author: { '@type': 'Organization', name: SITE_NAME },
    recipeCategory: recipe.type || 'Assaisonnement',
    recipeCuisine: 'BBQ',
    inLanguage: 'fr',
  }
  // Ajouter les ingrédients si disponibles
  if (recipe.ingredients) {
    try {
      const ingredients = typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients
      if (Array.isArray(ingredients)) {
        jsonLd.recipeIngredient = ingredients.map(i => typeof i === 'string' ? i : `${i.qty || ''} ${i.unit || ''} ${i.name || ''}`.trim())
      }
    } catch (e) { /* ignore */ }
  }

  return htmlShell({
    title: `${recipe.title} — Recette BBQ — Charbon & Flamme`,
    description: recipe.description || recipe.summary || `Recette ${recipe.title} pour BBQ et fumoir.`,
    canonical: `${SITE}/recettes/${recipe.slug}`,
    body: `
      <article>
        <h1>${escapeHtml(recipe.title)}</h1>
        ${recipe.description ? `<p>${escapeHtml(recipe.description)}</p>` : ''}
        <div>${escapeHtml(truncated)}</div>
        <nav>
          <a href="/recettes">Toutes les recettes</a>
          <a href="/">Calculateur BBQ</a>
        </nav>
      </article>
    `,
    jsonLd,
  })
}

function buildToolPage(slug) {
  const TOOL_PAGES = {
    calculateur: {
      title: 'Calculateur BBQ — Temps de cuisson brisket, pulled pork, ribs',
      description: 'Calcule le temps de cuisson exact pour ton BBQ : brisket, pulled pork, ribs, poulet fumé, reverse sear. Température, repos, wrap — tout est calculé automatiquement.',
    },
    comparateur: {
      title: 'Comparateur de recettes BBQ — Rubs, marinades, mops',
      description: 'Compare les rubs, marinades, mops et glazes BBQ côte à côte. Trouve la recette parfaite pour ton brisket, pulled pork ou ribs.',
    },
    portions: {
      title: 'Calculateur de quantités BBQ',
      description: 'Calcule la quantité de viande à acheter par personne pour ton prochain BBQ. Brisket, pulled pork, ribs et plus.',
    },
    multi: {
      title: 'Multi-cuisson BBQ — Planificateur',
      description: 'Planifie plusieurs cuissons en parallèle pour que tout soit prêt en même temps. Synchronise tes viandes au fumoir.',
    },
    bois: {
      title: 'Guide des essences de bois pour fumoir',
      description: 'Chêne, hickory, mesquite, pommier, cerisier — quelle essence de bois choisir pour chaque viande au fumoir.',
    },
    bbq: {
      title: 'Guide des types de BBQ et fumoirs',
      description: 'Offset, WSM, Kamado, Pellet, Kettle — comparatif des types de barbecues et fumoirs pour choisir le bon.',
    },
    live: {
      title: 'Live Cook — Suivi temps réel avec sonde',
      description: 'Connecte ta sonde Meater ou FireBoard et suis ta cuisson en temps réel avec alertes et graphiques.',
    },
  }

  const page = TOOL_PAGES[slug]
  if (!page) return null

  return htmlShell({
    title: `${page.title} — Charbon & Flamme`,
    description: page.description,
    canonical: `${SITE}/${slug}`,
    body: `
      <h1>${escapeHtml(page.title)}</h1>
      <p>${escapeHtml(page.description)}</p>
      <nav>
        <a href="/">Calculateur BBQ</a>
        <a href="/recettes">Recettes</a>
        <a href="/guides">Guides</a>
      </nav>
    `,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: page.title,
      url: `${SITE}/${slug}`,
      applicationCategory: 'UtilitiesApplication',
      description: page.description,
      inLanguage: 'fr',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
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

    // ── Liste recettes
    else if (path === '/recettes') {
      let recipes = []
      if (supabase) {
        const { data } = await supabase
          .from('recipes')
          .select('title, slug, description, type')
          .eq('status', 'published')
          .order('sort_order', { ascending: true })
        if (data) recipes = data
      }
      html = buildRecipesListPage(recipes)
    }

    // ── Recette individuelle
    else if (path.startsWith('/recettes/')) {
      const slug = path.replace('/recettes/', '')
      let recipe = null
      if (supabase && slug) {
        const { data } = await supabase
          .from('recipes')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single()
        if (data) recipe = data
      }
      html = recipe ? buildRecipePage(recipe) : build404Page()
    }

    // ── Pages outils (comparateur, portions, multi, bois, bbq, live)
    // ── Page confidentialité
    else if (path === '/confidentialite') {
      html = htmlShell({
        title: 'Politique de confidentialité — Charbon & Flamme',
        description: 'Politique de confidentialité de l\'application Charbon & Flamme. Données collectées, utilisation et vos droits RGPD.',
        canonical: `${SITE}/confidentialite`,
        body: `
          <h1>Politique de confidentialité</h1>
          <p>Charbon & Flamme respecte votre vie privée. Découvrez quelles données sont collectées, comment elles sont utilisées, et comment exercer vos droits RGPD.</p>
          <nav><a href="/">Retour à l'accueil</a></nav>
        `,
      })
    }

    // ── Pages outils (comparateur, portions, multi, bois, bbq, live)
    else if (['calculateur', 'comparateur', 'portions', 'multi', 'bois', 'bbq', 'live'].includes(path.replace('/', ''))) {
      const slug = path.replace('/', '')
      html = buildToolPage(slug) || build404Page()
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
