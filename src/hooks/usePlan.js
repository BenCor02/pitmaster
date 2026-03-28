import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../modules/supabase/client'
import { CAPABILITY_INFO, getAccessMeta } from '../modules/access/catalog'

// Feature keys
export const FEATURES = {
  CALC: 'calc_uses',
  SESSIONS: 'session_saves',
  JOURNAL: 'journal_entries',
  PARTY: 'party_meats',
  COLD: 'cold_uses',
  AI: 'ask_ai_daily',
  HISTORY: 'history_access',
  PDF: 'export_pdf',
  CUSTOM_MEATS: 'custom_meats',
  STATS: 'advanced_stats',
}

export const FEATURE_INFO = {
  ...CAPABILITY_INFO,
}

export function usePlan() {
  const { user } = useAuth()
  const [plan, setPlan] = useState('free')
  const [planData, setPlanData] = useState(null)
  const [features, setFeatures] = useState({})  // { feature_key: limit_value }
  const [usage, setUsage] = useState({})         // { feature_key: count }
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // PATCH: nouveau schéma Supabase-first sur profiles.id / plan_code / account_status.
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_code, account_status')
      .eq('id', user.id)
      .single()

    if (profile?.account_status === 'suspended') {
      await supabase.auth.signOut()
      return
    }

    const userPlan = profile?.plan_code || 'free'
    setPlan(userPlan)

    // 2. Charger les features du plan depuis Supabase
    const { data: planFeatures } = await supabase
      .from('plan_features')
      .select('feature_key, limit_value, label')
      .eq('plan_key', userPlan)

    const featMap = {}
    planFeatures?.forEach(f => { featMap[f.feature_key] = f.limit_value })
    setFeatures(featMap)

    // 3. Charger les plans disponibles
    const { data: plans } = await supabase
      .from('plans')
      .select('*')
      .order('sort_order')
    setPlanData(plans || [])

    // 4. Charger l'usage de l'utilisateur
    const { data: usageData } = await supabase
      .from('user_usage')
      .select('feature_key, count, period')
      .eq('user_id', user.id)

    const usageMap = {}
    usageData?.forEach(u => {
      const key = u.period === 'daily' ? `${u.feature_key}_daily` : u.feature_key
      usageMap[key] = u.count
    })
    setUsage(usageMap)
    setLoading(false)
  }, [user])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [load])

  // Vérifier si une feature est accessible
  function can(featureKey) {
    const limit = features[featureKey]
    if (limit === undefined) return true  // pas de limite définie = libre
    if (limit === 0) return false          // bloqué
    if (limit === -1) return true          // illimité

    const info = FEATURE_INFO[featureKey]
    const usageKey = info?.period === 'daily' ? `${featureKey}_daily` : featureKey
    const used = usage[usageKey] || 0
    return used < limit
  }

  // Obtenir la limite
  function getLimit(featureKey) {
    const limit = features[featureKey]
    if (limit === -1) return Infinity
    return limit || 0
  }

  // Obtenir l'usage actuel
  function getUsage(featureKey) {
    const info = FEATURE_INFO[featureKey]
    const usageKey = info?.period === 'daily' ? `${featureKey}_daily` : featureKey
    return usage[usageKey] || 0
  }

  // Incrémenter l'usage
  async function increment(featureKey) {
    if (!user) return false
    if (!can(featureKey)) return false

    const info = FEATURE_INFO[featureKey]
    const period = info?.period || 'total'
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase.from('user_usage').upsert({
      user_id: user.id,
      feature_key: featureKey,
      period,
      count: (getUsage(featureKey)) + 1,
      reset_at: period === 'daily' ? new Date(today + 'T23:59:59').toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,feature_key,period' })

    if (!error) {
      const usageKey = period === 'daily' ? `${featureKey}_daily` : featureKey
      setUsage(prev => ({ ...prev, [usageKey]: (prev[usageKey] || 0) + 1 }))
    }
    return !error
  }

  // Plan minimal requis pour une feature
  function requiredPlan() {
    return 'pro'
  }

  // % d'utilisation pour une feature
  function usagePercent(featureKey) {
    const limit = getLimit(featureKey)
    if (limit === Infinity || limit === 0) return 0
    return Math.min(100, Math.round((getUsage(featureKey) / limit) * 100))
  }

  return {
    plan, planData, features, usage, loading,
    accessMeta: getAccessMeta(plan),
    can, getLimit, getUsage, increment, usagePercent, requiredPlan,
    reload: load,
  }
}
