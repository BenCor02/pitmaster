/**
 * Charbon & Flamme — Articles lib
 * Requêtes Supabase pour le système d'articles média BBQ
 */

import { supabase } from './supabase.js'

// ── Lecture publique ──────────────────────────────────────────

/** Liste des articles publiés (tri par date desc) */
export async function getPublishedArticles({ category, tag, limit = 50 } = {}) {
  let query = supabase
    .from('articles')
    .select('id, title, slug, excerpt, cover_url, category, tags, author_name, reading_time_min, ai_generated, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (category) query = query.eq('category', category)
  if (tag)      query = query.contains('tags', [tag])

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/** Article complet par slug */
export async function getArticleBySlug(slug) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) return null
  return data
}

/** Tous les slugs publiés — pour generateStaticParams */
export async function getAllPublishedSlugs() {
  const { data } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'published')
  return (data || []).map(r => r.slug)
}

/** Catégories distinctes avec comptage */
export async function getArticleCategories() {
  const { data } = await supabase
    .from('articles')
    .select('category')
    .eq('status', 'published')
    .not('category', 'is', null)

  if (!data) return []
  const counts = {}
  data.forEach(r => { if (r.category) counts[r.category] = (counts[r.category] || 0) + 1 })
  return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

// ── Admin (authentifié) ───────────────────────────────────────

export async function getArticleById(id) {
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createArticle(article) {
  const payload = {
    ...article,
    reading_time_min: estimateReadingTime(article.body),
    published_at: article.status === 'published' ? (article.published_at || new Date().toISOString()) : null,
  }
  const { data, error } = await supabase.from('articles').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateArticle(id, updates) {
  const payload = {
    ...updates,
    reading_time_min: estimateReadingTime(updates.body),
    published_at: updates.status === 'published' ? (updates.published_at || new Date().toISOString()) : null,
  }
  const { data, error } = await supabase.from('articles').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteArticle(id) {
  const { error } = await supabase.from('articles').delete().eq('id', id)
  if (error) throw error
}

// ── Utils ─────────────────────────────────────────────────────

export function estimateReadingTime(markdown = '') {
  const words = (markdown || '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export const ARTICLE_CATEGORIES = [
  { value: 'technique',    label: 'Technique',     emoji: '🔥' },
  { value: 'equipement',   label: 'Équipement',    emoji: '⚙️' },
  { value: 'science',      label: 'Science BBQ',   emoji: '🧪' },
  { value: 'recette',      label: 'Recette',       emoji: '🧂' },
  { value: 'culture',      label: 'Culture',       emoji: '🌍' },
  { value: 'saison',       label: 'Saison',        emoji: '📅' },
]

export function categoryLabel(cat) {
  return ARTICLE_CATEGORIES.find(c => c.value === cat)?.label || cat || ''
}
export function categoryEmoji(cat) {
  return ARTICLE_CATEGORIES.find(c => c.value === cat)?.emoji || '📰'
}
