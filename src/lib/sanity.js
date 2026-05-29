/**
 * Charbon & Flamme — Client Sanity
 * Requêtes GROQ pour les articles média
 */
import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: 'nv9jfkc3',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true,          // cache CDN pour la lecture publique
  perspective: 'published',
})

// Builder d'URL image Sanity (CDN auto, WebP, redimensionnement)
const builder = imageUrlBuilder(sanityClient)
export const urlFor = (source) => {
  if (!source) return null
  return builder.image(source)
}

// ── Requêtes GROQ ────────────────────────────────────────────

const ARTICLE_CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "coverUrl": coverImage.asset->url,
  category,
  tags,
  authorName,
  aiGenerated,
  publishedAt,
  "readingTimeMin": round(length(body) / 5 / 200)
`

export async function getPublishedArticles({ category, tag, limit = 50 } = {}) {
  let filter = `_type == "article" && defined(publishedAt) && publishedAt <= now()`
  if (category) filter += ` && category == "${category}"`
  if (tag)      filter += ` && "${tag}" in tags`

  return sanityClient.fetch(
    `*[${filter}] | order(publishedAt desc)[0..${limit - 1}] { ${ARTICLE_CARD_FIELDS} }`,
    {},
    { next: { revalidate: 3600 } }
  )
}

export async function getArticleBySlug(slug) {
  return sanityClient.fetch(
    `*[_type == "article" && slug.current == $slug && defined(publishedAt)][0] {
      ${ARTICLE_CARD_FIELDS},
      body,
      showNewsletter,
      "seoTitle": seo.title,
      "seoDescription": seo.description,
      _updatedAt
    }`,
    { slug },
    { next: { revalidate: 3600 } }
  )
}

export async function getAllPublishedSlugs() {
  const results = await sanityClient.fetch(
    `*[_type == "article" && defined(publishedAt) && publishedAt <= now()].slug.current`,
    {},
    { next: { revalidate: 3600 } }
  )
  return results || []
}

export async function getArticleCategories() {
  const results = await sanityClient.fetch(
    `*[_type == "article" && defined(publishedAt)] { category }`,
    {},
    { next: { revalidate: 3600 } }
  )
  const counts = {}
  results?.forEach(r => { if (r.category) counts[r.category] = (counts[r.category] || 0) + 1 })
  return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

// ── Guides ───────────────────────────────────────────────────

const GUIDE_CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  summary,
  "coverUrl": coalesce(coverImage.asset->url, coverUrl),
  category,
  meatType,
  tags,
  publishedAt
`

export async function getPublishedGuides({ category, meatType } = {}) {
  let filter = `_type == "guide" && status == "published"`
  if (category) filter += ` && category == "${category}"`
  if (meatType) filter += ` && meatType == "${meatType}"`

  return sanityClient.fetch(
    `*[${filter}] | order(publishedAt desc) { ${GUIDE_CARD_FIELDS} }`,
    {},
    { next: { revalidate: 3600 } }
  )
}

export async function getGuideBySlug(slug) {
  return sanityClient.fetch(
    `*[_type == "guide" && slug.current == $slug && status == "published"][0] {
      ${GUIDE_CARD_FIELDS},
      content,
      "seoTitle": seo.title,
      "seoDescription": seo.description,
      _updatedAt
    }`,
    { slug },
    { next: { revalidate: 3600 } }
  )
}

export async function getAllGuideSlugs() {
  const results = await sanityClient.fetch(
    `*[_type == "guide" && status == "published"].slug.current`,
    {},
    { next: { revalidate: 3600 } }
  )
  return results || []
}

// ── Recettes ─────────────────────────────────────────────────

const RECIPE_CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  type,
  summary,
  "coverUrl": coalesce(coverImage.asset->url, coverUrl),
  meatTypes,
  difficulty,
  prepTime,
  tags
`

export async function getPublishedRecipes({ type, meatType } = {}) {
  let filter = `_type == "recipe" && status == "published"`
  if (type)     filter += ` && type == "${type}"`
  if (meatType) filter += ` && "${meatType}" in meatTypes`

  return sanityClient.fetch(
    `*[${filter}] | order(type asc, title asc) { ${RECIPE_CARD_FIELDS} }`,
    {},
    { next: { revalidate: 3600 } }
  )
}

export async function getRecipeBySlug(slug) {
  return sanityClient.fetch(
    `*[_type == "recipe" && slug.current == $slug && status == "published"][0] {
      ${RECIPE_CARD_FIELDS},
      description,
      ingredients,
      steps,
      yieldAmount,
      origin,
      _updatedAt
    }`,
    { slug },
    { next: { revalidate: 3600 } }
  )
}

export async function getAllRecipeSlugs() {
  const results = await sanityClient.fetch(
    `*[_type == "recipe" && status == "published"].slug.current`,
    {},
    { next: { revalidate: 3600 } }
  )
  return results || []
}

// ── Écriture (pour génération IA) ────────────────────────────
// Nécessite SANITY_API_TOKEN avec permission write

export function getSanityWriteClient() {
  const token = process.env.SANITY_API_TOKEN
  if (!token) throw new Error('SANITY_API_TOKEN manquante dans les variables d\'environnement')
  return createClient({
    projectId: 'nv9jfkc3',
    dataset: 'production',
    apiVersion: '2025-01-01',
    useCdn: false,
    token,
  })
}
