import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchRecipes } from '../lib/cms.js'

const TYPE_LABELS = { rub: 'Rub', mop: 'Mop', marinade: 'Marinade', injection: 'Injection', glaze: 'Glaze' }
const TYPE_COLORS = {
  rub: 'from-amber-500 to-orange-600',
  mop: 'from-blue-500 to-indigo-600',
  marinade: 'from-purple-500 to-violet-600',
  injection: 'from-green-500 to-emerald-600',
  glaze: 'from-rose-500 to-pink-600',
}
const MEAT_LABELS = {
  brisket: 'Brisket', beef_short_ribs: 'Short Ribs', chuck_roast: 'Chuck Roast',
  prime_rib: 'Prime Rib', tomahawk: 'Tomahawk', pulled_pork: 'Pulled Pork',
  spare_ribs: 'Spare Ribs', baby_back_ribs: 'Baby Back', whole_chicken: 'Poulet',
}
const DIFF_ORDER = { 'facile': 1, 'moyen': 2, 'avancé': 3 }
const DIFF_COLORS = { 'facile': 'text-green-400', 'moyen': 'text-amber-400', 'avancé': 'text-red-400' }

const MAX_COMPARE = 3

export default function ComparatorPage() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])   // array of recipe ids
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

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

  // On a besoin des détails complets (ingrédients) pour les recettes sélectionnées
  const [detailedRecipes, setDetailedRecipes] = useState({})

  useEffect(() => {
    // Charger les détails des recettes sélectionnées qu'on n'a pas encore
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
      if (prev.length >= MAX_COMPARE) return prev // max 3
      return [...prev, id]
    })
  }

  const removeFromCompare = (id) => {
    setSelected(prev => prev.filter(x => x !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-xl">⚖️</span>
          </div>
          <p className="text-zinc-500 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero with image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558030006-450675393462?w=1400&h=400&fit=crop&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/90 to-[#080808]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/20" />
        </div>
        <div className="relative px-6 lg:px-10 py-12 lg:py-16 max-w-6xl">
          <div className="animate-fade-up">
            <div className="badge badge-accent mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b1a] mr-2 animate-pulse" />
              Comparateur
            </div>
            <h1 className="font-display text-[28px] lg:text-[36px] font-black text-white tracking-tight leading-[1.1] mb-3">
              Comparer les <span className="text-gradient">recettes.</span>
            </h1>
            <p className="text-[14px] lg:text-[15px] text-zinc-400 max-w-lg leading-relaxed">
              Mets jusqu'à 3 recettes côte à côte pour comparer ingrédients, difficulté et viandes compatibles.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 pb-12 max-w-6xl">

        {/* ── Comparison view ── */}
        {selected.length > 0 && (
          <div className="mb-8 animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[14px] font-bold text-white">Comparaison</h2>
              <span className="text-[11px] text-zinc-600">{selected.length}/{MAX_COMPARE}</span>
              <button
                onClick={() => setSelected([])}
                className="text-[11px] text-zinc-600 hover:text-red-400 ml-auto transition-colors"
              >
                Tout retirer
              </button>
            </div>

            <div className={`grid gap-3 ${selected.length === 1 ? 'grid-cols-1 max-w-md' : selected.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
              {selected.map(id => {
                const r = detailedRecipes[id] || recipes.find(x => x.id === id)
                if (!r) return null
                const ingredients = r.ingredients
                  ? (typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : r.ingredients)
                  : []
                const gradientClass = TYPE_COLORS[r.type] || TYPE_COLORS.rub

                return (
                  <div key={id} className="surface p-5 relative">
                    <button
                      onClick={() => removeFromCompare(id)}
                      className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/[0.05] text-zinc-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>

                    {/* Header */}
                    <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-gradient-to-r ${gradientClass} text-white mb-3`}>
                      {TYPE_LABELS[r.type]}
                    </span>

                    <Link to={`/recettes/${r.slug}`} className="hover:text-[#ff6b1a] transition-colors">
                      <h3 className="text-[15px] font-bold text-white mb-1 leading-tight pr-8">{r.title}</h3>
                    </Link>

                    {r.origin && <p className="text-[10px] text-zinc-600 italic mb-3">📍 {r.origin}</p>}

                    {/* Stats row */}
                    <div className="flex items-center gap-3 mb-4 text-[11px]">
                      <span className={`font-bold ${DIFF_COLORS[r.difficulty]}`}>{r.difficulty}</span>
                      {r.prep_time && <span className="text-zinc-500">⏱ {r.prep_time}</span>}
                      {r.yield_amount && <span className="text-zinc-500">📦 {r.yield_amount}</span>}
                    </div>

                    {/* Ingrédients */}
                    {ingredients.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Ingrédients</p>
                        <div className="space-y-1.5">
                          {ingredients.map((ing, idx) => (
                            <div key={idx} className="flex items-baseline justify-between gap-2">
                              <span className="text-[12px] text-zinc-300">{ing.name}</span>
                              <span className="text-[11px] text-[#ff6b1a] font-bold shrink-0">{ing.qty}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Viandes */}
                    {r.meat_types?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Viandes</p>
                        <div className="flex flex-wrap gap-1">
                          {r.meat_types.map(m => (
                            <span key={m} className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-[#ff6b1a]/8 text-[#ff6b1a]/80 border border-[#ff6b1a]/15">
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
                <div key={`empty-${idx}`} className="border-2 border-dashed border-white/[0.06] rounded-2xl flex items-center justify-center py-16">
                  <p className="text-[12px] text-zinc-700">Sélectionne une recette ci-dessous</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Selector ── */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Chercher..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[13px] text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff6b1a]/30 transition-all"
            />
          </div>
          {['all', 'rub', 'marinade', 'mop', 'injection', 'glaze'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                filterType === t
                  ? 'border-[#ff6b1a]/30 bg-[#ff6b1a]/10 text-[#ff6b1a]'
                  : 'border-white/[0.06] text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {t === 'all' ? 'Tout' : TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Recipe list */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(recipe => {
            const isSelected = selected.includes(recipe.id)
            const isFull = selected.length >= MAX_COMPARE && !isSelected
            return (
              <button
                key={recipe.id}
                onClick={() => !isFull && toggleSelect(recipe.id)}
                disabled={isFull}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#ff6b1a]/30 bg-[#ff6b1a]/[0.06] ring-1 ring-[#ff6b1a]/20'
                    : isFull
                    ? 'border-white/[0.04] opacity-40 cursor-not-allowed'
                    : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isSelected
                      ? 'border-[#ff6b1a] bg-[#ff6b1a]'
                      : 'border-zinc-700'
                  }`}>
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold uppercase text-zinc-600">{TYPE_LABELS[recipe.type]}</span>
                      <span className={`text-[9px] font-bold ${DIFF_COLORS[recipe.difficulty]}`}>{recipe.difficulty}</span>
                    </div>
                    <h4 className="text-[13px] font-bold text-white leading-tight mb-1">{recipe.title}</h4>
                    <p className="text-[11px] text-zinc-600 line-clamp-1">{recipe.summary}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
