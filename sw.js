/**
 * PitMaster — Service Worker
 * Gère les notifications push pendant la cuisson
 */

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// ── Push reçu depuis serveur (futur) ou schedulé localement
self.addEventListener('push', (e) => {
  if (!e.data) return
  let data = {}
  try { data = e.data.json() } catch { data = { title: 'PitMaster', body: e.data.text() } }
  const { title = '🔥 PitMaster', body = '', tag, data: nd } = data
  e.waitUntil(
    self.registration.showNotification(title, {
      body, icon: '/icon-192.png', badge: '/icon-72.png',
      tag: tag || 'pitmaster', renotify: true,
      requireInteraction: true, vibrate: [200, 100, 200],
      data: nd || {},
    })
  )
})

// ── Clic sur notification → ouvrir /session
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = e.notification.data?.url || '/session'
  e.waitUntil(
    self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) {
          c.focus()
          c.postMessage({ type:'CHECKPOINT_ALERT', data: e.notification.data })
          return
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})

// ── Programmer une notification locale (depuis l'app via postMessage)
self.addEventListener('message', (e) => {
  if (e.data?.type !== 'SCHEDULE_NOTIF') return
  const { id, title, body, delayMs } = e.data
  setTimeout(() => {
    self.registration.showNotification(title, {
      body, icon: '/icon-192.png', tag: `cp-${id}`,
      requireInteraction: true, vibrate: [200,100,200,100,200],
      data: { url: '/session', checkpointId: id },
    })
  }, delayMs)
})
