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

/** Met à jour un setting via upsert (key est unique) */
export async function updateSetting(key, value) {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value }, { onConflict: 'key', ignoreDuplicates: false })

  if (error) {
    console.error(`updateSetting(${key}):`, error)
    throw error
  }
}
