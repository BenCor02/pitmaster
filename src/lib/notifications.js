/**
 * CHARBON & FLAMME — Notifications natives
 *
 * Utilise Capacitor LocalNotifications pour les alertes de cuisson
 * (température atteinte, temps de repos, etc.)
 * Fallback sur l'API Web Notification en mode navigateur.
 */

import { isNative, isPluginAvailable } from './capacitor.js'

let LocalNotifications = null

// Charger le plugin dynamiquement (évite le crash en web)
async function getPlugin() {
  if (LocalNotifications) return LocalNotifications
  if (isNative && isPluginAvailable('LocalNotifications')) {
    const mod = await import('@capacitor/local-notifications')
    LocalNotifications = mod.LocalNotifications
    return LocalNotifications
  }
  return null
}

/**
 * Demande la permission de notifier.
 * À appeler au premier lancement ou quand l'utilisateur active les notifs.
 */
export async function requestPermission() {
  const plugin = await getPlugin()

  if (plugin) {
    const result = await plugin.requestPermissions()
    return result.display === 'granted'
  }

  // Fallback web
  if ('Notification' in window) {
    const result = await Notification.requestPermission()
    return result === 'granted'
  }

  return false
}

/**
 * Envoie une notification locale.
 * En natif : notification Android avec son et vibration.
 * En web : Web Notification API.
 */
export async function sendNotification(title, body, { id, channelId = 'cuisson' } = {}) {
  const plugin = await getPlugin()

  if (plugin) {
    // Capacitor attend un id entier 32 bits — Date.now() est trop grand
    const notifId = id || (Date.now() % 2147483647)
    try {
      await plugin.schedule({
        notifications: [{
          id: notifId,
          title,
          body,
          channelId,
          sound: 'default',
          smallIcon: 'ic_launcher',
          largeIcon: 'ic_launcher',
          iconColor: '#ff6b1a',
        }],
      })
    } catch (err) {
      console.warn('[Notifications] schedule error:', err)
    }
    return
  }

  // Fallback web
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192.png' })
    }
  }
}

/**
 * Crée les canaux de notification Android.
 * À appeler une fois au démarrage de l'app.
 */
export async function setupChannels() {
  const plugin = await getPlugin()
  if (!plugin) return

  await plugin.createChannel({
    id: 'cuisson',
    name: 'Alertes de cuisson',
    description: 'Températures cibles, temps de repos, fin de cuisson',
    importance: 5, // max
    visibility: 1, // public
    sound: 'default',
    vibration: true,
  })

  await plugin.createChannel({
    id: 'general',
    name: 'Général',
    description: 'Notifications générales',
    importance: 3,
    sound: 'default',
  })
}
