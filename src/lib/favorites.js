/**
 * CHARBON & FLAMME — Favoris (Mon Carnet)
 */

import { supabase } from './supabase.js'

/** Récupère tous les favoris d'un user avec les recettes associées */
export async function fetchFavorites(userId) {
  const { data, error } = await supabase
    .from('favorites')
    .select('id, recipe_id, notes, created_at, recipes(id, title, slug, type, summary, meat_types, origin, difficulty, prep_time, tags)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) { console.error('fetchFavorites:', error); return [] }
  return data || []
}

/** Ajoute une recette aux favoris */
export async function addFavorite(userId, recipeId) {
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, recipe_id: recipeId })
    .select()
    .single()

  if (error) { console.error('addFavorite:', error); return null }
  return data
}

/** Retire une recette des favoris */
export async function removeFavorite(userId, recipeId) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)

  if (error) { console.error('removeFavorite:', error); return false }
  return true
}

/** Récupère les IDs des recettes favorites d'un user */
export async function fetchFavoriteIds(userId) {
  const { data, error } = await supabase
    .from('favorites')
    .select('recipe_id')
    .eq('user_id', userId)

  if (error) { console.error('fetchFavoriteIds:', error); return [] }
  return (data || []).map(f => f.recipe_id)
}
