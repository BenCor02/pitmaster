import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchRecipes } from '../lib/cms.js'

const TYPE_TABS = [
  { id: 'all', label: 'Tout', icon: '🔥' },
  { id: 'rub', label: 'Rubs', icon: '🧂' },
  { id: 'mop', label: 'Mops', icon: '🖌️' },
  { id: 'marinade', label: 'Marinades', icon: '🫙' },
  { id: 'injection', label: 'Injections', icon: '💉' },
  { id: 'glaze', label: 'Glazes', icon: '✨' },
]

const TYPE_COLORS = {
  rub: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  mop: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  marinade: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  injection: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  glaze: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
}

const TYPE_LABELS = { rub: 'Rub', mop: 'Mop', marinade: 'Marinade', injection: 'Injection', glaze: 'Glaze' }

const DIFFICULTY_COLORS = {
  'facile': 'text-green-400',
  'moyen': 'text-amber-400',
  'avancé': 'text-red-400',
}

const MEAT_LABELS = {
  brisket: 'Brisket', beef_short_ribs: 'Short Ribs', chuck_roast: 'Chuck Roast',
  prime_rib: 'Prime Rib', tomahawk: 'Tomahawk', pulled_pork: 'Pulled Pork',
  spare_ribs: 'Spare Ribs', baby_back_ribs: 'Baby Back', whole_chicken: 'Poulet',
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchRecipes().then(data => { setRecipes(data); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    let list = recipes
    if (activeType !== 'all') list = list.filter(r => r.type === activeType)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.summary?.toLowerCase().includes(q) ||
        r.tags?.some(t => t.toLowerCase().includes(q)) ||
        r.meat_types?.some(m => (MEAT_LABELS[m] || m).toLowerCase().includes(q))
      )
    }
    return list
  }, [recipes, activeType, search])

  const typeCounts = useMemo(() => {
    const counts = { all: recipes.length }
    TYPE_TABS.forEach(t => { if (t.id !== 'all') counts[t.id] = recipes.filter(r => r.type === t.id).length })
    return counts
  }, [recipes])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-xl">🧂</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Chargement des recettes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b1a]/[0.06] via-transparent to-[#ef4444]/[0.04]" />
        <div className="relative px-6 lg:px-10 py-10 lg:py-14 max-w-5xl">
          <div className="animate-fade-up">
            <div className="badge badge-accent mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b1a] mr-2 animate-pulse" />
              Rubs, Mops & Marinades
            </div>
            <h1 className="text-[28px] lg:text-[36px] font-extrabold text-white tracking-tight leading-[1.1] mb-2">
              L'arsenal du <span className="text-gradient">Pitmaster.</span>
            </h1>
            <p className="text-[14px] lg:text-[15px] text-zinc-400 max-w-lg leading-relaxed">
              Des recettes testées, inspirées des plus grands pitmasters. Rubs secs, mops de cuisson, marinades, injections et glazes pour sublimer chaque pièce.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 pb-12 max-w-5xl">

        {/* Search */}
        <div className="mb-5">
          <div className="relative max-w-sm">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Chercher un rub, une viande, un tag..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[13px] text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff6b1a]/30 transition-all"
            />
          </div>
        </div>

        {/* Type tabs */}
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1 flex-wrap">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold border transition-all whitespace-nowrap ${
                activeType === tab.id
                  ? 'border-[#ff6b1a]/30 bg-[#ff6b1a]/10 text-[#ff6b1a] shadow-lg shadow-[#ff6b1a]/10'
                  : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                activeType === tab.id ? 'bg-[#ff6b1a]/20' : 'bg-white/[0.04]'
              }`}>
                {typeCounts[tab.id] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Recipes grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 animate-fade">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-zinc-500 text-[14px]">Aucune recette trouvée</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RecipeCard({ recipe }) {
  const colors = TYPE_COLORS[recipe.type] || TYPE_COLORS.rub

  return (
    <Link
      to={`/recettes/${recipe.slug}`}
      className="surface p-5 group hover:border-[#ff6b1a]/20 transition-all animate-fade-up"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${colors.bg} ${colors.text} ${colors.border} border`}>
            {TYPE_LABELS[recipe.type]}
          </span>
          <span className={`text-[10px] font-semibold ${DIFFICULTY_COLORS[recipe.difficulty]}`}>
            {recipe.difficulty}
          </span>
        </div>
        {recipe.prep_time && (
          <span className="text-[10px] text-zinc-600 font-medium shrink-0">⏱ {recipe.prep_time}</span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-bold text-white group-hover:text-[#ff6b1a] transition-colors mb-2 leading-tight">
        {recipe.title}
      </h3>

      {/* Summary */}
      <p className="text-[12px] text-zinc-500 leading-relaxed line-clamp-2 mb-3">
        {recipe.summary}
      </p>

      {/* Origin */}
      {recipe.origin && (
        <p className="text-[10px] text-zinc-600 italic mb-3">
          📍 {recipe.origin}
        </p>
      )}

      {/* Meat tags */}
      {recipe.meat_types?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {recipe.meat_types.slice(0, 4).map(m => (
            <span key={m} className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
              {MEAT_LABELS[m] || m}
            </span>
          ))}
          {recipe.meat_types.length > 4 && (
            <span className="text-[9px] text-zinc-600">+{recipe.meat_types.length - 4}</span>
          )}
        </div>
      )}

      {/* Arrow */}
      <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#ff6b1a]/60 group-hover:text-[#ff6b1a] transition-colors">
        Voir la recette
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
      </div>
    </Link>
  )
}
