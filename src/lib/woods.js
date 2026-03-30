/**
 * CHARBON & FLAMME — Essences de bois de fumage
 */

import { supabase } from './supabase.js'

/** Récupère toutes les essences de bois publiées */
export async function fetchWoods() {
  const { data, error } = await supabase
    .from('woods')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  if (error) { console.error('fetchWoods:', error); return [] }
  return data || []
}

/** Récupère une essence par ID */
export async function fetchWoodById(id) {
  const { data, error } = await supabase
    .from('woods')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error) { console.error('fetchWoodById:', error); return null }
  return data
}
