/**
 * CHARBON & FLAMME — Utilitaires SEO
 * Met à jour les meta tags dynamiquement (SPA).
 */

export function updateMeta({ title, description, canonical }) {
  // Title
  document.title = title ? `${title} — Charbon & Flamme` : 'Charbon & Flamme — Calculateur BBQ Pitmaster'

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
      name: 'Charbon & Flamme',
    },
  }
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
