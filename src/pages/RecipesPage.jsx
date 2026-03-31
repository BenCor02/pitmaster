import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchRecipes } from '../lib/cms.js'
import { useFavorites } from '../hooks/useFavorites.js'

const TYPE_TABS = [
  { id: 'all', label: 'Tout', icon: '🔥' },
  { id: 'rub', label: 'Rubs', icon: '🧂' },
  { id: 'mop', label: 'Mops', icon: '🖌️' },
  { id: 'marinade', label: 'Marinades', icon: '🫙' },
  { id: 'injection', label: 'Injections', icon: '💉' },
  { id: 'glaze', label: 'Glazes', icon: '✨' },
]

const TYPE_COLORS = {
  rub: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', gradient: 'from-amber-500 to-orange-600' },
  mop: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', gradient: 'from-blue-500 to-indigo-600' },
  marinade: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', gradient: 'from-purple-500 to-violet-600' },
  injection: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', gradient: 'from-green-500 to-emerald-600' },
  glaze: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', gradient: 'from-rose-500 to-pink-600' },
}

const TYPE_LABELS = { rub: 'Rub', mop: 'Mop', marinade: 'Marinade', injection: 'Injection', glaze: 'Glaze' }

const DIFFICULTY_COLORS = {
  'facile': 'text-green-400',
  'moyen': 'text-amber-400',
  'avancé': 'text-red-400',
}

const MEAT_LABELS = {
  brisket: 'Poitrine', beef_short_ribs: 'Plat de côtes', chuck_roast: 'Paleron',
  prime_rib: 'Côte de bœuf', tomahawk: 'Tomahawk', pulled_pork: 'Échine de porc',
  spare_ribs: 'Travers', baby_back_ribs: 'Baby Back', whole_chicken: 'Poulet entier',
}

const MEAT_ICONS = {
  brisket: '🥩', beef_short_ribs: '🥩', chuck_roast: '🥩',
  prime_rib: '🥩', tomahawk: '🥩', pulled_pork: '🐖',
  spare_ribs: '🐖', baby_back_ribs: '🐖', whole_chicken: '🍗',
}

// Fallback images by recipe type
const TYPE_IMAGES = {
  rub: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=400&fit=crop&q=80',
  mop: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&q=80',
  marinade: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&h=400&fit=crop&q=80',
  injection: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop&q=80',
  glaze: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop&q=80',
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState('all')
  const [activeMeat, setActiveMeat] = useState('all')
  const [search, setSearch] = useState('')
  const favorites = useFavorites()

  useEffect(() => {
    fetchRecipes().then(data => { setRecipes(data); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    let list = recipes
    if (activeType !== 'all') list = list.filter(r => r.type === activeType)
    if (activeMeat !== 'all') list = list.filter(r => r.meat_types?.includes(activeMeat))
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
  }, [recipes, activeType, activeMeat, search])

  const meatOptions = useMemo(() => {
    const counts = {}
    recipes.forEach(r => r.meat_types?.forEach(m => {
      if (MEAT_LABELS[m]) counts[m] = (counts[m] || 0) + 1
    }))
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ id, label: MEAT_LABELS[id], icon: MEAT_ICONS[id] || '🍖', count }))
  }, [recipes])

  const typeCounts = useMemo(() => {
    const counts = { all: recipes.length }
    TYPE_TABS.forEach(t => { if (t.id !== 'all') counts[t.id] = recipes.filter(r => r.type === t.id).length })
    return counts
  }, [recipes])

  // Featured = first recipe (or first with cover_url)
  const featured = useMemo(() => {
    if (filtered.length === 0) return null
    return filtered.find(r => r.cover_url) || filtered[0]
  }, [filtered])

  const gridRecipes = useMemo(() => {
    if (!featured) return filtered
    return filtered.filter(r => r.id !== featured.id)
  }, [filtered, featured])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-2xl">🧂</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Chargement des recettes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">

      {/* ── Hero immersif ── */}
      <div className="relative overflow-hidden min-h-[280px] lg:min-h-[340px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504564321655-3ad6c0e45982?w=1400&h=500&fit=crop&q=80"
            alt=""
            className="w-full h-full object-cover scale-105"
            style={{ animation: 'slowZoom 20s ease-in-out infinite alternate' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/30 to-transparent" />
          {/* Ember particles */}
          <div className="absolute bottom-20 left-[20%] ember" style={{ animationDelay: '0s', animationDuration: '4s' }} />
          <div className="absolute bottom-16 left-[35%] ember" style={{ animationDelay: '1.2s', animationDuration: '3.5s' }} />
          <div className="absolute bottom-24 left-[50%] ember" style={{ animationDelay: '0.6s', animationDuration: '4.5s' }} />
        </div>

        <div className="relative px-6 lg:px-10 py-14 lg:py-20 max-w-6xl">
          <div className="animate-fade-up">
            <div className="badge badge-fire mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 mr-2 animate-pulse" />
              Rubs, Mops & Marinades
            </div>
            <h1 className="font-display text-[36px] lg:text-[52px] font-black text-white tracking-tight leading-[1.05] mb-4">
              L'arsenal du{' '}
              <span className="text-gradient">Pitmaster.</span>
            </h1>
            <p className="text-[15px] lg:text-[17px] text-zinc-300 max-w-xl leading-relaxed">
              Des recettes testées au feu et à la fumée, inspirées des plus grands pitmasters.
            </p>
            <div className="flex items-center gap-4 mt-6 text-[12px] text-zinc-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff6b1a]" />
                {recipes.length} recettes
              </span>
              <span className="w-px h-3 bg-zinc-800" />
              <span>{Object.keys(TYPE_LABELS).length} catégories</span>
              <span className="w-px h-3 bg-zinc-800" />
              <span>{meatOptions.length} viandes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 pb-16 max-w-6xl">

        {/* ── Search bar ── */}
        <div className="mb-6 -mt-5 relative z-10">
          <div className="relative max-w-md">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Chercher un rub, une viande, un tag..."
              className="w-full pl-12 pr-4 py-3.5 bg-[#111]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl text-[14px] text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff6b1a]/40 focus:shadow-[0_0_30px_rgba(255,107,26,0.08)] transition-all"
            />
          </div>
        </div>

        {/* ── Type tabs ── */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 flex-wrap">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold border transition-all whitespace-nowrap ${
                activeType === tab.id
                  ? 'border-[#ff6b1a]/30 bg-[#ff6b1a]/10 text-[#ff6b1a] shadow-lg shadow-[#ff6b1a]/10'
                  : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12] hover:bg-white/[0.02]'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                activeType === tab.id ? 'bg-[#ff6b1a]/20 text-[#ff6b1a]' : 'bg-white/[0.04] text-zinc-600'
              }`}>
                {typeCounts[tab.id] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* ── Meat filter ── */}
        <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-1 flex-wrap">
          <button
            onClick={() => setActiveMeat('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all whitespace-nowrap ${
              activeMeat === 'all'
                ? 'border-white/20 bg-white/10 text-white'
                : 'border-white/[0.06] text-zinc-600 hover:text-zinc-400 hover:border-white/[0.1]'
            }`}
          >
            🍖 Toutes viandes
          </button>
          {meatOptions.map(meat => (
            <button
              key={meat.id}
              onClick={() => setActiveMeat(meat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all whitespace-nowrap ${
                activeMeat === meat.id
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-white/[0.06] text-zinc-600 hover:text-zinc-400 hover:border-white/[0.1]'
              }`}
            >
              {meat.icon} {meat.label}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                activeMeat === meat.id ? 'bg-white/15' : 'bg-white/[0.04]'
              }`}>
                {meat.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">🔍</span>
            </div>
            <p className="text-zinc-400 text-[16px] font-semibold mb-1">Aucune recette trouvée</p>
            <p className="text-zinc-600 text-[13px]">Essaie un autre filtre ou mot-clé</p>
          </div>
        ) : (
          <>
            {/* ── Featured recipe (first one, big card) ── */}
            {featured && !search.trim() && (
              <FeaturedCard recipe={featured} favorites={favorites} />
            )}

            {/* ── Recipes grid ── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
              {(search.trim() ? filtered : gridRecipes).map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} favorites={favorites} />
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slowZoom {
          from { transform: scale(1.05); }
          to { transform: scale(1.12); }
        }
      `}</style>
    </div>
  )
}

/* ── Featured Card — large hero-style card ── */
function FeaturedCard({ recipe, favorites }) {
  const colors = TYPE_COLORS[recipe.type] || TYPE_COLORS.rub
  const isFav = favorites?.isFavorite(recipe.id)
  const imageUrl = recipe.cover_url || TYPE_IMAGES[recipe.type] || TYPE_IMAGES.rub

  return (
    <Link
      to={`/recettes/${recipe.slug}`}
      className="block mb-8 group animate-fade-up"
    >
      <div className="card-premium relative overflow-hidden">
        {/* Image */}
        <div className="relative h-[220px] lg:h-[280px] img-zoom">
          <img
            src={imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111]/60 to-transparent" />

          {/* Type badge floating */}
          <div className="absolute top-4 left-4">
            <span className={`text-[11px] font-black uppercase px-3 py-1.5 rounded-lg bg-gradient-to-r ${colors.gradient} text-white shadow-lg`}>
              {TYPE_LABELS[recipe.type]}
            </span>
          </div>

          {/* Heart */}
          {favorites?.isAuthenticated && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); favorites.toggleFavorite(recipe.id) }}
              className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm ${
                isFav
                  ? 'bg-red-500/30 text-red-400'
                  : 'bg-black/30 text-white/60 hover:text-red-400 hover:bg-red-500/20'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            </button>
          )}

          {/* Featured label */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              ★ à la une
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-3 text-[11px] font-semibold">
            <span className={DIFFICULTY_COLORS[recipe.difficulty]}>{recipe.difficulty}</span>
            {recipe.prep_time && <span className="text-zinc-500">⏱ {recipe.prep_time}</span>}
            {recipe.origin && <span className="text-zinc-600">📍 {recipe.origin}</span>}
          </div>

          <h2 className="text-[22px] lg:text-[28px] font-black text-white group-hover:text-[#ff6b1a] transition-colors leading-tight mb-3">
            {recipe.title}
          </h2>

          <p className="text-[14px] text-zinc-400 leading-relaxed max-w-2xl mb-4 line-clamp-2">
            {recipe.summary}
          </p>

          <div className="flex items-center justify-between">
            {/* Meat tags */}
            <div className="flex flex-wrap gap-1.5">
              {recipe.meat_types?.slice(0, 5).map(m => (
                <span key={m} className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[#ff6b1a]/8 text-[#ff6b1a]/70 border border-[#ff6b1a]/10">
                  {MEAT_LABELS[m] || m}
                </span>
              ))}
            </div>

            {/* CTA */}
            <span className="flex items-center gap-2 text-[13px] font-bold text-[#ff6b1a] group-hover:gap-3 transition-all shrink-0">
              Voir la recette
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Recipe Card — with image and premium styling ── */
function RecipeCard({ recipe, favorites }) {
  const colors = TYPE_COLORS[recipe.type] || TYPE_COLORS.rub
  const isFav = favorites?.isFavorite(recipe.id)
  const imageUrl = recipe.cover_url || TYPE_IMAGES[recipe.type] || TYPE_IMAGES.rub

  return (
    <div className="card-premium group relative">
      {/* Heart button */}
      {favorites?.isAuthenticated && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); favorites.toggleFavorite(recipe.id) }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all z-10 ${
            isFav
              ? 'bg-red-500/30 text-red-400'
              : 'bg-black/40 text-white/50 hover:text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
        </button>
      )}

      <Link to={`/recettes/${recipe.slug}`} className="block">
        {/* Image header */}
        <div className="relative h-[160px] overflow-hidden">
          <img
            src={imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />

          {/* Type badge on image */}
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-gradient-to-r ${colors.gradient} text-white shadow-lg`}>
              {TYPE_LABELS[recipe.type]}
            </span>
          </div>

          {/* Prep time on image */}
          {recipe.prep_time && (
            <div className="absolute bottom-3 right-3">
              <span className="text-[10px] font-bold text-white/90 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                ⏱ {recipe.prep_time}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Difficulty + origin */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold ${DIFFICULTY_COLORS[recipe.difficulty]}`}>
              {recipe.difficulty}
            </span>
            {recipe.origin && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="text-[10px] text-zinc-600 italic truncate">{recipe.origin}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-[16px] font-bold text-white group-hover:text-[#ff6b1a] transition-colors mb-2 leading-snug">
            {recipe.title}
          </h3>

          {/* Summary */}
          <p className="text-[12px] text-zinc-500 leading-relaxed line-clamp-2 mb-4">
            {recipe.summary}
          </p>

          {/* Bottom: meat tags + arrow */}
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {recipe.meat_types?.slice(0, 3).map(m => (
                <span key={m} className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.05] text-zinc-400 border border-white/[0.06]">
                  {MEAT_LABELS[m] || m}
                </span>
              ))}
              {recipe.meat_types?.length > 3 && (
                <span className="text-[9px] text-zinc-600 font-bold">+{recipe.meat_types.length - 3}</span>
              )}
            </div>

            <div className="shrink-0 w-8 h-8 rounded-lg bg-[#ff6b1a]/10 flex items-center justify-center group-hover:bg-[#ff6b1a] transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-[#ff6b1a] group-hover:text-white transition-colors group-hover:translate-x-0.5 transition-transform"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
