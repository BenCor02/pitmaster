/**
 * CHARBON & FLAMME — Cuissons partagées
 */

import { supabase } from './supabase.js'

/** Crée un lien de partage pour un plan de cuisson */
export async function createSharedCook(userId, cookData) {
  const { data, error } = await supabase
    .from('shared_cooks')
    .insert({ user_id: userId, ...cookData })
    .select()
    .single()

  if (error) { console.error('createSharedCook:', error); return null }
  return data
}

/** Récupère une cuisson partagée par son code */
export async function fetchSharedCook(shareCode) {
  const { data, error } = await supabase
    .from('shared_cooks')
    .select('*')
    .eq('share_code', shareCode)
    .single()

  if (error) { console.error('fetchSharedCook:', error); return null }
  return data
}

/** Récupère les cuissons partagées par un user */
export async function fetchMySharedCooks(userId) {
  const { data, error } = await supabase
    .from('shared_cooks')
    .select('id, share_code, meat_name, weight_kg, total_estimate, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) { console.error('fetchMySharedCooks:', error); return [] }
  return data || []
}
