/**
 * useCalcLimit — Phase 2
 * Quota vérifié CÔTÉ SERVEUR via RPC check_and_increment_quota
 * Aucun stockage local applicatif
 * Connecté → Supabase → infalsifiable
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../modules/supabase/client'

const FREE_LIMIT = 5
const periodStart = () => `${new Date().toISOString().slice(0, 7)}-01`

export function useCalcLimit() {
  const { user, profile } = useAuth()
  const [remaining, setRemaining] = useState(FREE_LIMIT)
  const [count,     setCount]     = useState(0)
  const [loading,   setLoading]   = useState(true)

  const activePlan = profile?.plan_code
  const isPro  = activePlan !== 'free' && activePlan != null
  const canCalc = isPro || remaining > 0

  const load = useCallback(async () => {
    setLoading(true)
    if (user) {
      // Connecté → lire depuis Supabase
      if (isPro) {
        setRemaining(Infinity)
        setCount(0)
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('user_usage_monthly')
        .select('calculations_used, calculations_limit')
        .eq('user_id', user.id)
        .eq('period_start', periodStart())
        .single()

      if (data) {
        setCount(data.calculations_used)
        setRemaining(Math.max(data.calculations_limit - data.calculations_used, 0))
      } else {
        // Pas encore de ligne ce mois = 0 utilisé
        setCount(0)
        setRemaining(FREE_LIMIT)
      }
    } else {
      // Anonyme → état mémoire seulement (pas de persistance locale)
      setCount(0)
      setRemaining(FREE_LIMIT)
    }
    setLoading(false)
  }, [user, isPro])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [load])

  // Message contextuel
  function statusMessage() {
    if (isPro) return null
    if (remaining === 0) return null
    if (remaining === 1) return `⚠️ Plus qu'un calcul gratuit ce mois-ci`
    if (remaining <= 3)  return `🔥 ${remaining} calculs gratuits restants ce mois-ci`
    return null // Pas de message si > 3
  }

  // Incrémenter — côté serveur si connecté
  async function increment() {
    if (isPro) return { allowed: true }

    if (user) {
      // RPC serveur — atomique et infalsifiable
      const { data, error } = await supabase.rpc('check_and_increment_quota', {
        p_user_id: user.id,
      })
      if (error) {
        console.error('quota error', error)
        return { allowed: false, reason: 'error' }
      }
      if (data?.allowed) {
        setCount(data.used || count + 1)
        setRemaining(data.remaining ?? remaining - 1)
      }
      return data
    } else {
      // Anonyme → état mémoire seulement (pas de persistance locale)
      if (remaining <= 0) return { allowed: false, reason: 'quota_exceeded' }
      setCount((prev) => prev + 1)
      setRemaining((prev) => Math.max(prev - 1, 0))
      return { allowed: true, remaining: Math.max(remaining - 1, 0) }
    }
  }

  return {
    count, remaining, canCalc, isPro, loading,
    increment, statusMessage, reload: load,
    FREE_LIMIT,
  }
}
