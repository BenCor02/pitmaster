import { useState, useEffect } from 'react'
import { fetchCookingProfiles } from '../../lib/cookingProfiles.js'
import { MEAT_PROFILES } from './data.js'

/**
 * Hook qui charge les profils de viande.
 * Priorité : Supabase cooking_profiles (admin-editable)
 * Fallback : data.js MEAT_PROFILES (embarqué)
 */
export function useCalculatorData() {
  const [profiles, setProfiles] = useState(null)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCookingProfiles()
        setProfiles(data)
        setSource(data === MEAT_PROFILES ? 'local' : 'supabase')
      } catch {
        setProfiles(MEAT_PROFILES)
        setSource('local')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { profiles, loading, source }
}
