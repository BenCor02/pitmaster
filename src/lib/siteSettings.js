/**
 * CHARBON & FLAMME — Site Settings (branding + module toggles)
 */

import { supabase } from './supabase.js'

/** Récupère un setting par sa clé */
export async function fetchSetting(key) {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single()

  if (error) { console.error(`fetchSetting(${key}):`, error); return null }
  return data?.value ?? null
}

/** Récupère tous les settings d'un coup */
export async function fetchAllSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')

  if (error) { console.error('fetchAllSettings:', error); return {} }
  const map = {}
  ;(data || []).forEach(row => { map[row.key] = row.value })
  return map
}

/** Met à jour un setting (upsert par clé) */
export async function updateSetting(key, value) {
  // On cherche d'abord si la clé existe
  const { data: existing } = await supabase
    .from('site_settings')
    .select('id')
    .eq('key', key)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('site_settings')
      .update({ value })
      .eq('key', key)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('site_settings')
      .insert({ key, value })
    if (error) throw error
  }
}
