import { useEffect, useState } from 'react'
import { fetchSeoBlocks } from '../modules/cms/repository'

export function useSeoBlocks({ position, meatSlug, methodKey, pageSlug = 'calculator' }) {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const next = await fetchSeoBlocks({ position, meatSlug, methodKey, pageSlug })
        if (!active) return
        setBlocks(next)
      } catch (err) {
        if (!active) return
        setError(err)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [position, meatSlug, methodKey, pageSlug])

  return { blocks, loading, error }
}
