/**
 * CHARBON & FLAMME — Tracking anonyme des calculs BBQ
 *
 * Fire-and-forget : insère une ligne dans calculator_logs à chaque calcul.
 * Aucune erreur ne remonte au calculateur — c'est purement informatif.
 */

import { supabase } from './supabase.js'

/**
 * Loggue un calcul. Ne throw jamais.
 *
 * @param {Object} params
 * @param {Object} params.profile - profil de cuisson (id, name, category, cook_type)
 * @param {number} [params.weightKg]
 * @param {number} [params.cookTempC]
 * @param {boolean} [params.wrapped]
 * @param {string|null} [params.doneness]
 */
export function logCalculation({ profile, weightKg, cookTempC, wrapped, doneness }) {
  if (!profile) return

  const payload = {
    profile_id: profile.id || null,
    profile_name: profile.name || profile.label || null,
    category: profile.category || null,
    weight_kg: weightKg && weightKg > 0 ? Number(weightKg) : null,
    cook_temp_c: cookTempC && cookTempC > 0 ? Number(cookTempC) : null,
    wrapped: !!wrapped,
    doneness: doneness || null,
    cook_type: profile.cook_type || (profile.fixed_times ? 'fixed' : null),
  }

  // Fire-and-forget : on ne bloque jamais l'UI sur le tracking
  supabase
    .from('calculator_logs')
    .insert(payload)
    .then(({ error }) => {
      if (error && import.meta.env.DEV) {
        console.warn('[calcTracking] insert failed:', error.message)
      }
    })
}
