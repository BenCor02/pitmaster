import { useEffect, useMemo, useState } from 'react'
import { fetchCalculatorCatalog } from '../modules/cms/repository'
import {
  buildRuntimeProfilesFromCatalog,
  setRuntimeCalculatorProfiles,
  clearRuntimeCalculatorProfiles,
} from '../domain/calculator/catalog'

// Safeguard: the sacred calculator engine stays canonical unless explicitly opted-in.
const ENABLE_RUNTIME_CATALOG = import.meta.env.VITE_ENABLE_RUNTIME_CATALOG === 'true'

export function useCalculatorCatalog() {
  const [catalog, setCatalog] = useState({ meats: [], methods: [], parameters: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const next = await fetchCalculatorCatalog()
        if (!alive) return
        setCatalog(next)
        const runtimeProfiles = buildRuntimeProfilesFromCatalog(next)
        if (ENABLE_RUNTIME_CATALOG && runtimeProfiles) {
          setRuntimeCalculatorProfiles(runtimeProfiles)
        } else {
          clearRuntimeCalculatorProfiles()
        }
      } catch (err) {
        if (!alive) return
        clearRuntimeCalculatorProfiles()
        setError(err)
      } finally {
        if (alive) setLoading(false)
      }
    }

    run()
    return () => {
      alive = false
    }
  }, [])

  const meatsBySlug = useMemo(
    () => Object.fromEntries((catalog.meats || []).map((entry) => [entry.slug, entry])),
    [catalog.meats]
  )

  return {
    catalog,
    meats: catalog.meats || [],
    methods: catalog.methods || [],
    parameters: catalog.parameters || [],
    meatsBySlug,
    loading,
    error,
  }
}
