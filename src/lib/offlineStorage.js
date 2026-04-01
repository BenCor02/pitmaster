/**
 * CHARBON & FLAMME — Stockage offline
 *
 * Utilise Capacitor Preferences en natif, localStorage en web.
 * Permet de sauvegarder les données essentielles pour le mode hors-ligne :
 * - Profils de cuisson (data.js est déjà embarqué)
 * - Dernières cuissons du journal
 * - Recettes favorites
 * - Paramètres utilisateur
 */

import { isNative, isPluginAvailable } from './capacitor.js'

let Preferences = null

async function getPlugin() {
  if (Preferences) return Preferences
  if (isNative && isPluginAvailable('Preferences')) {
    const mod = await import('@capacitor/preferences')
    Preferences = mod.Preferences
    return Preferences
  }
  return null
}

/**
 * Sauvegarde une valeur (objet sérialisé en JSON).
 */
export async function save(key, value) {
  const plugin = await getPlugin()

  if (plugin) {
    await plugin.set({ key, value: JSON.stringify(value) })
    return
  }

  // Fallback web
  try {
    localStorage.setItem(`cf_${key}`, JSON.stringify(value))
  } catch {}
}

/**
 * Récupère une valeur. Retourne null si absente.
 */
export async function load(key) {
  const plugin = await getPlugin()

  if (plugin) {
    const { value } = await plugin.get({ key })
    return value ? JSON.parse(value) : null
  }

  // Fallback web
  try {
    const raw = localStorage.getItem(`cf_${key}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Supprime une clé.
 */
export async function remove(key) {
  const plugin = await getPlugin()

  if (plugin) {
    await plugin.remove({ key })
    return
  }

  try {
    localStorage.removeItem(`cf_${key}`)
  } catch {}
}

/**
 * Cache les données Supabase essentielles pour le mode offline.
 * Appelé après chaque fetch réussi.
 */
export async function cacheForOffline(dataType, data) {
  await save(`cache_${dataType}`, {
    data,
    cachedAt: Date.now(),
  })
}

/**
 * Récupère les données cachées. Retourne null si pas de cache.
 */
export async function getCachedData(dataType) {
  const cached = await load(`cache_${dataType}`)
  return cached?.data || null
}
