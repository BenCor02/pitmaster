/**
 * CHARBON & FLAMME — Journal de cuisson (CRUD)
 * Accès Supabase pour les sessions de cuisson utilisateur
 */

import { supabase } from './supabase.js'

export const journal = {
  /**
   * Récupérer toutes les sessions de l'utilisateur connecté
   */
  async list() {
    const { data, error } = await supabase
      .from('cook_sessions')
      .select('*')
      .order('cook_date', { ascending: false })
    if (error) throw error
    return data || []
  },

  /**
   * Récupérer une session par ID
   */
  async get(id) {
    const { data, error } = await supabase
      .from('cook_sessions')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  /**
   * Créer une nouvelle session
   */
  async create(session) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non connecté')

    const { data, error } = await supabase
      .from('cook_sessions')
      .insert({ ...session, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    return data
  },

  /**
   * Mettre à jour une session
   */
  async update(id, updates) {
    const { id: _, user_id, created_at, ...clean } = updates
    const { data, error } = await supabase
      .from('cook_sessions')
      .update(clean)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  /**
   * Supprimer une session
   */
  async remove(id) {
    const { error } = await supabase
      .from('cook_sessions')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  /**
   * Créer une session pré-remplie depuis les résultats du calculateur
   */
  fromCalculatorResult(result) {
    return {
      meat_name: result.profile || '',
      meat_profile_id: result.profileId || '',
      weight_kg: result.weightKg || null,
      cook_temp_c: result.cookTempC || null,
      wrapped: result.wrapped || false,
      doneness: result.doneness || null,
      cook_date: new Date().toISOString().split('T')[0],
    }
  },
}
