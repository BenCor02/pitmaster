import { useState, useEffect } from 'react'
import { fetchSiteSettingsRow } from '../lib/cms'

// Store global partagé entre tous les composants
let cache = null
let listeners = new Set()

function notify(newSettings) {
  listeners.forEach(fn => fn({ ...newSettings }))
}

async function fetchSettings() {
  const data = await fetchSiteSettingsRow()
  if (data) {
    cache = data
    notify(cache)
  }
  return cache
}

export async function invalidateSettingsCache() {
  cache = null
  return await fetchSettings()
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(cache || {})

  useEffect(() => {
    // Charger si pas encore en cache
    if (!cache) {
      fetchSettings()
    }

    // S'abonner aux mises à jour globales
    const listener = (s) => setSettings(s)
    listeners.add(listener)
    return () => listeners.delete(listener)
  }, [])

  // Mettre à jour le titre de l'onglet
  useEffect(() => {
    const siteName = settings['site_name']
    const seoTitle = settings['seo_title']
    // Onglet = site_name si défini, sinon seo_title
    if (siteName) document.title = siteName
    else if (seoTitle) document.title = seoTitle
  }, [settings])

  const get = (key, fallback = '') => settings[key] || fallback

  return { settings, get }
}
