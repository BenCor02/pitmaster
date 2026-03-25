import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Store global partagé entre tous les composants
let cache = null
let listeners = new Set()

function notify(newSettings) {
  listeners.forEach(fn => fn({ ...newSettings }))
}

async function fetchSettings() {
  const { data } = await supabase.from('site_settings').select('key, value')
  if (data) {
    cache = {}
    data.forEach(row => { cache[row.key] = row.value })
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
    } else {
      setSettings({ ...cache })
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