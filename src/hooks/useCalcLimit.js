/**
 * useCalcLimit — Phase 2
 * Quota vérifié CÔTÉ SERVEUR via RPC check_and_increment_quota
 * localStorage uniquement pour les anonymes (pas de compte)
 * Connecté → Supabase → infalsifiable
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../modules/supabase/client'

const FREE_LIMIT = 5
const LS_KEY     = 'cf_calc_anon' // { count, month }

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

function getAnonUsage() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { count: 0, month: currentMonth() }
    const d = JSON.parse(raw)
    if (d.month !== currentMonth()) return { count: 0, month: currentMonth() }
    return d
  } catch { return { count: 0, month: currentMonth() } }
}

function setAnonUsage(count) {
  localStorage.setItem(LS_KEY, JSON.stringify({ count, month: currentMonth() }))
}

export function useCalcLimit() {
  const { user, profile } = useAuth()
  const [remaining, setRemaining] = useState(FREE_LIMIT)
  const [count,     setCount]     = useState(0)
  const [loading,   setLoading]   = useState(true)

  // PATCH: nouveau champ plan_code, avec fallback legacy si besoin.
  const activePlan = profile?.plan_code ?? profile?.plan
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
        .eq('period_start', new Date().toISOString().slice(0, 7) + '-01')
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
      // Anonyme → localStorage
      const anon = getAnonUsage()
      setCount(anon.count)
      setRemaining(Math.max(FREE_LIMIT - anon.count, 0))
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
      // Anonyme → localStorage
      const anon = getAnonUsage()
      if (anon.count >= FREE_LIMIT) return { allowed: false, reason: 'quota_exceeded' }
      const newCount = anon.count + 1
      setAnonUsage(newCount)
      setCount(newCount)
      setRemaining(FREE_LIMIT - newCount)
      return { allowed: true, remaining: FREE_LIMIT - newCount }
    }
  }

  return {
    count, remaining, canCalc, isPro, loading,
    increment, statusMessage, reload: load,
    FREE_LIMIT,
  }
}
