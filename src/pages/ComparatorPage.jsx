import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { updateMeta } from '../lib/seo.js'
import { fetchRecipes } from '../lib/cms.js'
import { CFHeader, CFFooter } from '../components/cf/Chrome.jsx'
import { Pill } from '../components/cf/Primitives.jsx'

/* ── useMobile ── */
function useMobile() {
  const [mobile, setMobile] = React.useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  )
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => setMobile(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])
  return mobile
}

const TYPE_LABELS = { rub: 'Rub', mop: 'Mop', marinade: 'Marinade', injection: 'Injection', glaze: 'Glaze' }
const TYPE_COLORS = {
  rub: { bg: 'rgba(232,165,60,0.15)', color: '#8B1A1A', border: 'rgba(232,165,60,0.30)' },
  mop: { bg: 'rgba(59,130,246,0.10)', color: '#1e40af', border: 'rgba(59,130,246,0.20)' },
  marinade: { bg: 'rgba(147,51,234,0.10)', color: '#6b21a8', border: 'rgba(147,51,234,0.20)' },
  injection: { bg: 'rgba(34,197,94,0.10)', color: '#15803d', border: 'rgba(34,197,94,0.20)' },
  glaze: { bg: 'rgba(244,63,94,0.10)', color: '#9f1239', border: 'rgba(244,63,94,0.20)' },
}
const MEAT_LABELS = {
  brisket: 'Brisket', beef_short_ribs: 'Short Ribs', chuck_roast: 'Chuck Roast',
  prime_rib: 'Prime Rib', tomahawk: 'Tomahawk', pulled_pork: 'Pulled Pork',
  spare_ribs: 'Spare Ribs', baby_back_ribs: 'Baby Back', whole_chicken: 'Poulet',
}
const DIFF_ORDER = { 'facile': 1, 'moyen': 2, 'avancé': 3 }
const DIFF_COLORS = { 'facile': '#2D6A4F', 'moyen': '#E8A53C', 'avancé': '#8B1A1A' }

const MAX_COMPARE = 3

export default function ComparatorPage() {
  const mobile = useMobile()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    updateMeta({
      title: 'Comparateur de recettes BBQ — Rubs, marinades, mops | Charbon & Flamme',
      description: 'Compare les rubs, marinades, mops et glazes BBQ côte à côte. Trouve la recette parfaite pour ton brisket, pulled pork ou ribs.',
      canonical: 'https://charbonetflamme.fr/comparateur',
    })
  }, [])

  useEffect(() => {
    fetchRecipes().then(data => { setRecipes(data); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    let list = recipes
    if (filterType !== 'all') list = list.filter(r => r.type === filterType)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r => r.title.toLowerCase().includes(q) || r.summary?.toLowerCase().includes(q))
    }
    return list
  }, [recipes, filterType, search])

  const selectedRecipes = useMemo(() => {
    return selected.map(id => recipes.find(r => r.id === id)).filter(Boolean)
  }, [selected, recipes])

  const [detailedRecipes, setDetailedRecipes] = useState({})

  useEffect(() => {
    const toLoad = selected.filter(id => !detailedRecipes[id])
    if (toLoad.length === 0) return

    Promise.all(toLoad.map(id => {
      const r = recipes.find(r => r.id === id)
      if (!r) return null
      return import('../lib/cms.js').then(mod => mod.fetchRecipeBySlug(r.slug))
    })).then(results => {
      const newDetails = { ...detailedRecipes }
      results.forEach(r => { if (r) newDetails[r.id] = r })
      setDetailedRecipes(newDetails)
    })
  }, [selected])

  const toggleSelect = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, id]
    })
  }

  const removeFromCompare = (id) => {
    setSelected(prev => prev.filter(x => x !== id))
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(139,26,26,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>
            ⚖️
          </div>
          <p style={{ color: '#6E6356', fontSize: 14 }}>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14' }}>
      <CFHeader />
      <main>
        {/* Hero */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <img
              src="https://images.unsplash.com/photo-1558030006-450675393462?w=1400&h=400&fit=crop&q=80"
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(250,246,238,0.97) 40%, rgba(250,246,238,0.75) 100%)' }} />
          </div>
          <div style={{ position: 'relative', padding: mobile ? '48px 24px' : '64px 40px', maxWidth: 960 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 20, background: 'rgba(139,26,26,0.08)', border: '1px solid rgba(139,26,26,0.15)', marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B1A1A' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Comparateur</span>
            </div>
            <h1 style={{ fontFamily: 'var(--cf-serif)', fontSize: mobile ? 28 : 36, fontWeight: 900, color: '#1F1A14', lineHeight: 1.1, margin: '0 0 12px' }}>
              Comparer les <span style={{ color: '#8B1A1A' }}>recettes.</span>
            </h1>
            <p style={{ fontSize: mobile ? 14 : 15, color: '#6E6356', maxWidth: 500, lineHeight: 1.7, margin: 0 }}>
              Mets jusqu'à 3 recettes côte à côte pour comparer ingrédients, difficulté et viandes compatibles.
            </p>
          </div>
        </div>

        <div style={{ padding: mobile ? '24px 16px 48px' : '32px 40px 64px', maxWidth: 960, margin: '0 auto' }}>

          {/* ── Comparison view ── */}
          {selected.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1F1A14', margin: 0 }}>Comparaison</h2>
                <span style={{ fontSize: 11, color: '#6E6356' }}>{selected.length}/{MAX_COMPARE}</span>
                <button
                  onClick={() => setSelected([])}
                  style={{ fontSize: 11, color: '#6E6356', marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Tout retirer
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: selected.length === 1 ? '1fr' : selected.length === 2 ? '1fr 1fr' : '1fr 1fr 1fr', gap: 12, maxWidth: selected.length === 1 ? 380 : 'none' }}>
                {selected.map(id => {
                  const r = detailedRecipes[id] || recipes.find(x => x.id === id)
                  if (!r) return null
                  const ingredients = r.ingredients
                    ? (typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : r.ingredients)
                    : []
                  const typeColor = TYPE_COLORS[r.type] || TYPE_COLORS.rub

                  return (
                    <div key={id} style={{ background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.12)', borderRadius: 16, padding: 20, position: 'relative' }}>
                      <button
                        onClick={() => removeFromCompare(id)}
                        style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 8, background: 'rgba(31,26,20,0.06)', border: 'none', color: '#6E6356', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>

                      <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6, background: typeColor.bg, color: typeColor.color, border: `1px solid ${typeColor.border}`, marginBottom: 12 }}>
                        {TYPE_LABELS[r.type]}
                      </span>

                      <Link to={`/recettes/${r.slug}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F1A14', marginBottom: 4, lineHeight: 1.3, paddingRight: 24 }}>{r.title}</h3>
                      </Link>

                      {r.origin && <p style={{ fontSize: 10, color: '#6E6356', fontStyle: 'italic', marginBottom: 12 }}>📍 {r.origin}</p>}

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, fontSize: 11 }}>
                        <span style={{ fontWeight: 700, color: DIFF_COLORS[r.difficulty] }}>{r.difficulty}</span>
                        {r.prep_time && <span style={{ color: '#6E6356' }}>⏱ {r.prep_time}</span>}
                        {r.yield_amount && <span style={{ color: '#6E6356' }}>📦 {r.yield_amount}</span>}
                      </div>

                      {ingredients.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Ingrédients</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {ingredients.map((ing, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                                <span style={{ fontSize: 12, color: '#1F1A14' }}>{ing.name}</span>
                                <span style={{ fontSize: 11, color: '#8B1A1A', fontWeight: 700, flexShrink: 0 }}>{ing.qty}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {r.meat_types?.length > 0 && (
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Viandes</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {r.meat_types.map(m => (
                              <span key={m} style={{ fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'rgba(232,165,60,0.12)', color: '#8B1A1A', border: '1px solid rgba(232,165,60,0.20)' }}>
                                {MEAT_LABELS[m] || m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Placeholder slots */}
                {Array.from({ length: MAX_COMPARE - selected.length }).map((_, idx) => (
                  <div key={`empty-${idx}`} style={{ border: '2px dashed rgba(31,26,20,0.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
                    <p style={{ fontSize: 12, color: '#6E6356' }}>Sélectionne une recette ci-dessous</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Selector ── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
              <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6E6356' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Chercher..."
                style={{ width: '100%', paddingLeft: 38, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.15)', borderRadius: 12, fontSize: 13, color: '#1F1A14', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {['all', 'rub', 'marinade', 'mop', 'injection', 'glaze'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  border: filterType === t ? '1px solid rgba(139,26,26,0.25)' : '1px solid rgba(31,26,20,0.12)',
                  background: filterType === t ? 'rgba(139,26,26,0.08)' : 'transparent',
                  color: filterType === t ? '#8B1A1A' : '#6E6356',
                }}
              >
                {t === 'all' ? 'Tout' : TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Recipe list */}
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
            {filtered.map(recipe => {
              const isSelected = selected.includes(recipe.id)
              const isFull = selected.length >= MAX_COMPARE && !isSelected
              return (
                <button
                  key={recipe.id}
                  onClick={() => !isFull && toggleSelect(recipe.id)}
                  disabled={isFull}
                  style={{
                    textAlign: 'left', padding: 16, borderRadius: 12, cursor: isFull ? 'not-allowed' : 'pointer',
                    border: isSelected ? '1px solid rgba(139,26,26,0.30)' : '1px solid rgba(31,26,20,0.12)',
                    background: isSelected ? 'rgba(139,26,26,0.06)' : '#F5EFE0',
                    opacity: isFull ? 0.4 : 1,
                    outline: isSelected ? '1px solid rgba(139,26,26,0.15)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, border: isSelected ? '2px solid #8B1A1A' : '2px solid rgba(31,26,20,0.20)',
                      background: isSelected ? '#8B1A1A' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2
                    }}>
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#6E6356' }}>{TYPE_LABELS[recipe.type]}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: DIFF_COLORS[recipe.difficulty] }}>{recipe.difficulty}</span>
                      </div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1F1A14', lineHeight: 1.3, marginBottom: 4 }}>{recipe.title}</h4>
                      <p style={{ fontSize: 11, color: '#6E6356', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{recipe.summary}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </main>
      <CFFooter mobile={mobile} />
    </div>
  )
}
