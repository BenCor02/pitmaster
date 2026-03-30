/**
 * CHARBON & FLAMME — Utilitaires SEO
 * Met à jour les meta tags dynamiquement (SPA).
 */

/** Nom du site utilisé dans les titres — mis à jour par SiteSettingsProvider */
let _siteName = 'Charbon & Flamme'
let _siteTagline = 'Calculateur BBQ Pitmaster'

export function setSiteBranding(line1, line2, tagline) {
  _siteName = [line1, line2].filter(Boolean).join(' ')
  _siteTagline = tagline || _siteTagline
}

export function getSiteName() { return _siteName }

export function updateMeta({ title, description, canonical }) {
  // Title
  document.title = title ? `${title} — ${_siteName}` : `${_siteName} — ${_siteTagline}`

  // Meta description
  let metaDesc = document.querySelector('meta[name="description"]')
  if (!metaDesc) {
    metaDesc = document.createElement('meta')
    metaDesc.name = 'description'
    document.head.appendChild(metaDesc)
  }
  metaDesc.content = description || 'Calculateur de cuisson BBQ pitmaster. Temps de cuisson, stall, wrap, repos — tout pour réussir votre barbecue low & slow.'

  // Canonical
  let link = document.querySelector('link[rel="canonical"]')
  if (canonical) {
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = canonical
  } else if (link) {
    link.remove()
  }
}

/** Génère le JSON-LD FAQ schema pour Google */
export function faqSchema(faqs) {
  if (!faqs?.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer.replace(/\*\*/g, '').replace(/\n/g, ' '),
      },
    })),
  }
}

/** Génère le JSON-LD Article schema pour un guide */
export function articleSchema(guide) {
  if (!guide) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.seo_title || guide.title,
    description: guide.seo_description || guide.summary,
    image: guide.cover_url,
    datePublished: guide.created_at,
    dateModified: guide.updated_at,
    author: {
      '@type': 'Organization',
      name: _siteName,
    },
  }
}

/** Génère le JSON-LD Recipe schema pour Google rich snippets */
export function recipeSchema(recipe) {
  if (!recipe) return null
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description || recipe.summary || '',
    image: recipe.image_url || undefined,
    datePublished: recipe.created_at,
    author: { '@type': 'Organization', name: _siteName },
    recipeCategory: recipe.type || 'Assaisonnement',
    recipeCuisine: 'BBQ',
  }
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    schema.recipeIngredient = recipe.ingredients.map(i =>
      typeof i === 'string' ? i : `${i.qty || ''} ${i.unit || ''} ${i.name || ''}`.trim()
    )
  }
  if (recipe.prep_time_min) {
    schema.prepTime = `PT${recipe.prep_time_min}M`
  }
  return schema
}

/** Injecte un script JSON-LD dans le <head> */
export function injectJsonLd(id, schema) {
  let script = document.getElementById(id)
  if (!schema) {
    if (script) script.remove()
    return
  }
  if (!script) {
    script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(schema)
}
