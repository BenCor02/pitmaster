import { useEffect, useMemo, useState } from 'react'
import { fetchCalculatorCatalog } from '../lib/cms'
import { buildRuntimeProfilesFromCatalog, setRuntimeCalculatorProfiles } from '../lib/calculator'

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
        if (runtimeProfiles) setRuntimeCalculatorProfiles(runtimeProfiles)
      } catch (err) {
        if (!alive) return
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
