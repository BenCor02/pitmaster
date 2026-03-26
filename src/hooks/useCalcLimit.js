/**
 * useCalcLimit — Gestion des 5 calculs gratuits/mois
 * Stockage : localStorage pour les non-connectés, Supabase pour les connectés
 * Logique : reset mensuel automatique
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const FREE_LIMIT = 5
const LS_KEY     = 'cf_calc_usage' // { count, month: 'YYYY-MM' }

function currentMonth() {
  return new Date().toISOString().slice(0, 7) // 'YYYY-MM'
}

function getLocalUsage() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { count: 0, month: currentMonth() }
    const data = JSON.parse(raw)
    // Reset si nouveau mois
    if (data.month !== currentMonth()) return { count: 0, month: currentMonth() }
    return data
  } catch { return { count: 0, month: currentMonth() } }
}

function setLocalUsage(count) {
  localStorage.setItem(LS_KEY, JSON.stringify({ count, month: currentMonth() }))
}

export function useCalcLimit() {
  const { user } = useAuth()
  const [count,   setCount]   = useState(0)
  const [plan,    setPlan]    = useState('free')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    if (user) {
      // Charger depuis Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, monthly_calc_count, monthly_calc_reset')
        .eq('user_id', user.id)
        .single()

      const userPlan = profile?.plan || 'free'
      setPlan(userPlan)

      if (userPlan !== 'free') {
        setCount(0) // Pro = illimité, pas besoin de compter
        setLoading(false)
        return
      }

      // Reset mensuel si nécessaire
      const storedMonth = profile?.monthly_calc_reset || ''
      if (storedMonth !== currentMonth()) {
        await supabase.from('profiles').update({
          monthly_calc_count: 0,
          monthly_calc_reset: currentMonth(),
        }).eq('user_id', user.id)
        setCount(0)
      } else {
        setCount(profile?.monthly_calc_count || 0)
      }
    } else {
      // Non connecté = localStorage
      const local = getLocalUsage()
      setCount(local.count)
      setPlan('free')
    }
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  // Peut-il encore calculer ?
  const canCalc = plan !== 'free' || count < FREE_LIMIT

  // Combien lui reste-t-il ?
  const remaining = plan !== 'free' ? Infinity : Math.max(FREE_LIMIT - count, 0)

  // Message contextuel
  function statusMessage() {
    if (plan !== 'free') return null
    if (remaining === 0) return null // géré par le paywall
    if (remaining === 1) return `⚠️ Plus qu'un calcul gratuit ce mois-ci`
    if (remaining <= 2)  return `Il te reste ${remaining} calculs gratuits ce mois-ci`
    return `Il te reste ${remaining} calculs gratuits ce mois-ci`
  }

  // Incrémenter après un calcul
  async function increment() {
    if (plan !== 'free') return true // Pro = toujours OK
    if (!canCalc) return false

    const newCount = count + 1
    setCount(newCount)

    if (user) {
      await supabase.from('profiles').update({
        monthly_calc_count: newCount,
        monthly_calc_reset: currentMonth(),
      }).eq('user_id', user.id)
    } else {
      setLocalUsage(newCount)
    }
    return true
  }

  return {
    count, remaining, canCalc, plan, loading,
    increment, statusMessage, reload: load,
    FREE_LIMIT,
    isPro: plan !== 'free',
  }
}
