/**
 * CHARBON & FLAMME — Data access layer CMS
 *
 * Toutes les requêtes Supabase pour le contenu (SEO, FAQ, guides, affiliation).
 * Centralisé ici pour éviter la duplication et faciliter le cache futur.
 */

import { supabase } from './supabase.js'

// ── Helpers ─────────────────────────────────────────────────

/** Sélectionne les blocs pertinents pour un contexte de cuisson donné */
function contextFilter(query, { meatType, cookingMethod } = {}) {
  // On veut : les blocs globaux OU ceux qui matchent le meat_type/cooking_method
  // Supabase ne supporte pas OR natif sur colonnes différentes, donc on fait 2 requêtes
  // Alternative : on charge tout et on filtre côté client (dataset petit)
  return query
}

// ── SEO Blocks ──────────────────────────────────────────────

export async function fetchSeoBlocks({ meatType, cookingMethod } = {}) {
  let query = supabase
    .from('seo_blocks')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  const { data, error } = await query
  if (error) { console.error('fetchSeoBlocks:', error); return [] }

  return filterByContext(data, meatType, cookingMethod)
}

// ── FAQ ─────────────────────────────────────────────────────

export async function fetchFaqs({ meatType, cookingMethod } = {}) {
  let query = supabase
    .from('faqs')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  const { data, error } = await query
  if (error) { console.error('fetchFaqs:', error); return [] }

  return filterByContext(data, meatType, cookingMethod)
}

// ── Affiliate Tools ─────────────────────────────────────────

export async function fetchAffiliateTools({ meatType } = {}) {
  let query = supabase
    .from('affiliate_tools')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  const { data, error } = await query
  if (error) { console.error('fetchAffiliateTools:', error); return [] }

  // Filtrage : globaux + spécifiques à la viande
  if (!meatType) return data.filter(d => d.is_global)
  return data.filter(d => d.is_global || d.meat_type === meatType)
}

// ── Guides ──────────────────────────────────────────────────

export async function fetchGuides({ meatType, limit } = {}) {
  let query = supabase
    .from('guides')
    .select('id, title, slug, summary, cover_url, category, tags, meat_type, created_at')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) { console.error('fetchGuides:', error); return [] }

  if (!meatType) return data
  // Trier : les guides liés à la viande en premier, puis les autres
  return [
    ...data.filter(d => d.meat_type === meatType || (d.tags && d.tags.includes(meatType))),
    ...data.filter(d => d.meat_type !== meatType && !(d.tags && d.tags.includes(meatType))),
  ]
}

export async function fetchGuideBySlug(slug) {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) { console.error('fetchGuideBySlug:', error); return null }
  return data
}

// ── Recipes ────────────────────────────────────────────────

export async function fetchRecipes({ type, meatType, limit } = {}) {
  let query = supabase
    .from('recipes')
    .select('id, title, slug, type, summary, meat_types, origin, difficulty, tags, cover_url, prep_time, created_at')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  if (type) query = query.eq('type', type)
  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) { console.error('fetchRecipes:', error); return [] }

  if (!meatType) return data
  // Trier : recettes contenant la viande en premier
  return [
    ...data.filter(d => d.meat_types && d.meat_types.includes(meatType)),
    ...data.filter(d => !d.meat_types || !d.meat_types.includes(meatType)),
  ]
}

export async function fetchRecipeBySlug(slug) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) { console.error('fetchRecipeBySlug:', error); return null }
  return data
}

// ── Admin CRUD ──────────────────────────────────────────────

export const adminCms = {
  // Générique : fonctionne pour toutes les tables CMS
  async list(table, { includeAll = true } = {}) {
    let query = supabase.from(table).select('*').order('sort_order', { ascending: true })
    if (!includeAll) query = query.eq('status', 'published')
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getById(table, id) {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async create(table, record) {
    const { data, error } = await supabase.from(table).insert(record).select().single()
    if (error) throw error
    return data
  },

  async update(table, id, updates) {
    const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async remove(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
  },

  async toggleStatus(table, id, newStatus) {
    return this.update(table, id, { status: newStatus })
  },
}

// ── Filtrage contextuel ─────────────────────────────────────

function filterByContext(items, meatType, cookingMethod) {
  if (!meatType && !cookingMethod) return items.filter(d => d.is_global)

  return items.filter(d => {
    if (d.is_global) return true
    if (meatType && d.meat_type === meatType) return true
    if (cookingMethod && d.cooking_method === cookingMethod) return true
    return false
  })
}
