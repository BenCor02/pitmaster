import { useEffect, useMemo, useState } from 'react'
import { fetchCalculatorCatalog } from '../modules/cms/repository'
import { clearRuntimeCalculatorProfiles } from '../domain/calculator/catalog'

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
        // Sacred rule: catalog data is for UI/admin only.
        // Calculator runtime profiles stay canonical and are never overridden from CMS.
        clearRuntimeCalculatorProfiles()
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
