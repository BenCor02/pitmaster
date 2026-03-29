import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import { MEAT_PROFILES } from './data.js'

/**
 * Hook qui charge les profils de viande.
 * Pour l'instant : fallback local uniquement.
 * Plus tard : Supabase comme source de vérité.
 */
export function useCalculatorData() {
  const [profiles, setProfiles] = useState(null)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        // TODO: charger depuis Supabase quand les tables seront remplies
        // Pour l'instant, on utilise le dataset local
        setProfiles(MEAT_PROFILES)
        setSource('local')
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
