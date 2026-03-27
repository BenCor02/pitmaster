import { useEffect, useState } from 'react'
import { fetchPageWithSections } from '../lib/cms'

export function usePageContent(slug) {
  const [page, setPage] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const next = await fetchPageWithSections(slug)
        if (!active) return
        setPage(next.page)
        setSections(next.sections)
      } catch (err) {
        if (!active) return
        setError(err)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [slug])

  return { page, sections, loading, error }
}
