/**
 * CHARBON & FLAMME — Capacitor bridge
 *
 * Détecte si l'app tourne dans Capacitor (Android)
 * et expose les APIs natives de manière transparente.
 */

import { Capacitor } from '@capacitor/core'

export const isNative = Capacitor.isNativePlatform()
export const platform = Capacitor.getPlatform() // 'android' | 'ios' | 'web'

/**
 * Vérifie si un plugin Capacitor est disponible.
 * Utile pour éviter les crashes quand on tourne en web.
 */
export function isPluginAvailable(name) {
  return Capacitor.isPluginAvailable(name)
}
