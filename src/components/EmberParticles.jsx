import { useEffect, useRef } from 'react'

/**
 * Particules d'étincelles/braises flottantes
 * Purement décoratif, léger
 */
export default function EmberParticles({ count = 8 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const embers = []
    for (let i = 0; i < count; i++) {
      const ember = document.createElement('div')
      ember.className = 'ember'
      ember.style.left = `${Math.random() * 100}%`
      ember.style.bottom = `${Math.random() * 30}%`
      ember.style.animationDelay = `${Math.random() * 3}s`
      ember.style.animationDuration = `${1.5 + Math.random() * 2}s`
      ember.style.width = `${2 + Math.random() * 3}px`
      ember.style.height = ember.style.width
      container.appendChild(ember)
      embers.push(ember)
    }

    return () => embers.forEach(e => e.remove())
  }, [count])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    />
  )
}
