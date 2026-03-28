/**
 * engineLoader.js
 * Charge les ajustements approuvés depuis Supabase
 * et les injecte dans le moteur de calcul.
 *
 * Cache en mémoire — rechargé au démarrage ou sur invalidation admin.
 */

import { supabase } from '../modules/supabase/client'

let cachedAdjustments = null
let lastLoaded = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Charge les ajustements approuvés depuis Supabase.
 * Structure retournée :
 * {
 *   global: 1.0,
 *   brisket: { p1: 1.0, st: 1.02, p3: 0.98 },
 *   pork_shoulder: { ... },
 *   ...
 * }
 */
export async function loadApprovedAdjustments(forceRefresh = false) {
  const now = Date.now()
  if (!forceRefresh && cachedAdjustments && lastLoaded && (now - lastLoaded) < CACHE_TTL) {
    return cachedAdjustments
  }

  const { data, error } = await supabase
    .from('approved_adjustments')
    .select('category, parameter, adjustment_value')

  if (error || !data) {
    console.warn('engineLoader: impossible de charger les ajustements', error)
    return {}
  }

  const adjustments = {}
  data.forEach(row => {
    const { category, parameter, adjustment_value } = row
    if (category === 'global') {
      adjustments.global = adjustment_value
    } else {
      if (!adjustments[category]) adjustments[category] = {}
      adjustments[category][parameter] = adjustment_value
    }
  })

  cachedAdjustments = adjustments
  lastLoaded = now
  return adjustments
}

export function invalidateAdjustmentsCache() {
  cachedAdjustments = null
  lastLoaded = null
}

/**
 * Sauvegarde une cuisson terminée dans cook_history
 * pour analyse ultérieure et génération de suggestions
 */
export async function saveCookHistory(userId, cookData) {
  const { error } = await supabase.from('cook_history').insert({
    user_id:       userId,
    meat_type:     cookData.meatKey,
    weight_kg:     cookData.weightKg,
    thickness_cm:  cookData.thicknessCm,
    pit_temp_c:    cookData.smokerTempC,
    smoker_type:   cookData.smokerType,
    wrap_type:     cookData.wrapType,
    marbling:      cookData.marbling,
    predicted_min: cookData.predictedMin,
    real_min:      cookData.realMin,
    stall_real_min:cookData.stallRealMin || null,
    confidence_score: cookData.confidenceScore || null,
    notes:         cookData.notes || null,
  })
  return { error }
}

/**
 * Analyse l'historique et génère des suggestions (statut 'pending')
 * Appelé depuis le panel admin — aucune modification directe
 */
export async function analyzeAndSuggest(meatKey, minSamples = 5) {
  const { data, error } = await supabase
    .from('cook_history')
    .select('error_pct, error_min, pit_temp_c, wrap_type, smoker_type, thickness_cm')
    .eq('meat_type', meatKey)
    .not('real_min', 'is', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !data || data.length < minSamples) return []

  const suggestions = []
  const errors = data.map(d => d.error_pct).filter(e => e != null)
  const avgError = errors.reduce((a,b) => a+b, 0) / errors.length
  const stdDev = Math.sqrt(errors.map(e => (e - avgError)**2).reduce((a,b)=>a+b,0) / errors.length)

  if (Math.abs(avgError) >= 5) {
    const suggestedAdj = Math.min(Math.max(1 + (avgError / 100) * 0.4, 0.80), 1.20)
    suggestions.push({
      category: meatKey,
      parameter: 'p1',
      current_value: 1.0,
      suggested_value: Math.round(suggestedAdj * 1000) / 1000,
      sample_size: errors.length,
      confidence_score: Math.round(Math.max(0, 100 - stdDev * 4)),
      rationale: `Erreur moyenne : ${avgError.toFixed(1)}% sur ${errors.length} cuissons. Écart-type : ${stdDev.toFixed(1)}%.`,
      status: 'pending',
    })
  }

  return suggestions
}
