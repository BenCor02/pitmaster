/**
 * cookingProfiles.js — Chargement des profils de cuisson
 *
 * Priorité : Supabase cooking_profiles (admin-editable)
 * Fallback : data.js MEAT_PROFILES (embarqué)
 */

import { supabase } from './supabase.js'
import { MEAT_PROFILES } from '../modules/calculator/data.js'

let _cache = null
let _cacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Récupère les profils depuis Supabase, fallback sur data.js
 * Retourne un tableau au même format que MEAT_PROFILES
 */
export async function fetchCookingProfiles() {
  const now = Date.now()
  if (_cache && (now - _cacheTime) < CACHE_TTL) return _cache

  try {
    const { data, error } = await supabase
      .from('cooking_profiles')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    if (!data || data.length === 0) throw new Error('No profiles in DB')

    // Mapper le format Supabase → format attendu par engine.js
    _cache = data.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      icon: row.icon,
      cook_type: row.cook_type,
      supports_wrap: row.supports_wrap,
      temp_bands: row.temp_bands || undefined,
      fixed_times: row.fixed_times || undefined,
      // v3 algorithm fields
      base_minutes: row.base_minutes ?? undefined,
      coeff: row.coeff ?? undefined,
      thickness_coeff: row.thickness_coeff ?? undefined,
      fixed_times_by_weight: row.fixed_times_by_weight || undefined,
      wrap_reduction_percent: row.wrap_reduction_percent || 0,
      rest_min: row.rest_min,
      rest_max: row.rest_max,
      reverse_sear: row.reverse_sear || undefined,
      doneness_targets: row.doneness_targets || undefined,
      cues: row.cues || {},
      phases_text: row.phases_text || undefined,
    }))
    _cacheTime = now
    return _cache
  } catch (err) {
    console.warn('[cookingProfiles] Supabase indisponible, fallback data.js:', err.message)
    _cache = MEAT_PROFILES
    _cacheTime = now
    return _cache
  }
}

/**
 * Invalide le cache (appeler après un save admin)
 */
export function invalidateProfilesCache() {
  _cache = null
  _cacheTime = 0
}
