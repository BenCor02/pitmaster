/**
 * CHARBON & FLAMME — Hook favoris
 * Gère l'état des favoris avec cache local pour réactivité instantanée.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import { fetchFavoriteIds, addFavorite, removeFavorite } from '../lib/favorites.js'

export function useFavorites() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [loading, setLoading] = useState(false)

  // Charger les IDs au montage
  useEffect(() => {
    if (!userId) { setFavoriteIds(new Set()); return }
    setLoading(true)
    fetchFavoriteIds(userId).then(ids => {
      setFavoriteIds(new Set(ids))
      setLoading(false)
    })
  }, [userId])

  const isFavorite = useCallback((recipeId) => {
    return favoriteIds.has(recipeId)
  }, [favoriteIds])

  const toggleFavorite = useCallback(async (recipeId) => {
    if (!userId) return false

    if (favoriteIds.has(recipeId)) {
      // Optimistic remove
      setFavoriteIds(prev => { const next = new Set(prev); next.delete(recipeId); return next })
      const ok = await removeFavorite(userId, recipeId)
      if (!ok) setFavoriteIds(prev => new Set([...prev, recipeId])) // rollback
      return false
    } else {
      // Optimistic add
      setFavoriteIds(prev => new Set([...prev, recipeId]))
      const result = await addFavorite(userId, recipeId)
      if (!result) setFavoriteIds(prev => { const next = new Set(prev); next.delete(recipeId); return next }) // rollback
      return true
    }
  }, [userId, favoriteIds])

  return { favoriteIds, isFavorite, toggleFavorite, loading, isAuthenticated: !!userId }
}
