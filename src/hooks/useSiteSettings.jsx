/**
 * CHARBON & FLAMME — SiteSettingsProvider + useSiteSettings hook
 *
 * Charge branding + modules au démarrage, expose un context global.
 * L'admin peut rafraîchir via refresh().
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchAllSettings } from '../lib/siteSettings.js'
import { setSiteBranding } from '../lib/seo.js'

const SiteSettingsContext = createContext({})

const DEFAULT_BRANDING = {
  site_name_line1: 'CHARBON',
  site_name_line2: '& FLAMME',
  tagline: "L'arsenal du pitmaster",
  logo_url: null,
}

const DEFAULT_MODULES = {
  seo_blocks: true,
  affiliate: false,
  faq: true,
  guides: true,
  recipes: true,
  wood_guide: true,
  comparator: true,
  favorites: true,
  shared_cooks: true,
  journal: true,
}

export function SiteSettingsProvider({ children }) {
  const [branding, setBranding] = useState(DEFAULT_BRANDING)
  const [modules, setModules] = useState(DEFAULT_MODULES)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    try {
      const all = await fetchAllSettings()
      if (all.branding) {
        const b = { ...DEFAULT_BRANDING, ...all.branding }
        setBranding(b)
        setSiteBranding(b.site_name_line1, b.site_name_line2, b.tagline)
      }
      if (all.modules) setModules({ ...DEFAULT_MODULES, ...all.modules })
    } catch (err) {
      console.error('SiteSettings load error:', err)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => { load() }, [load])

  /** Vérifie si un module est activé */
  const isModuleEnabled = useCallback((key) => {
    return modules[key] !== false
  }, [modules])

  return (
    <SiteSettingsContext.Provider value={{ branding, modules, isModuleEnabled, loaded, refresh: load }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
