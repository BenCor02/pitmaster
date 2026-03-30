import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchRecipeBySlug, fetchRecipes } from '../lib/cms.js'
import { useFavorites } from '../hooks/useFavorites.js'
import { updateMeta, recipeSchema, injectJsonLd } from '../lib/seo.js'

const TYPE_LABELS = { rub: 'Rub', mop: 'Mop', marinade: 'Marinade', injection: 'Injection', glaze: 'Glaze' }
const TYPE_ICONS = { rub: '🧂', mop: '🖌️', marinade: '🫙', injection: '💉', glaze: '✨' }
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

const DIFFICULTY_COLORS = {
  'facile': 'text-green-400 bg-green-500/10',
  'moyen': 'text-amber-400 bg-amber-500/10',
  'avancé': 'text-red-400 bg-red-500/10',
}

export default function RecipeDetailPage() {
  const { slug } = useParams()
  const [recipe, setRecipe] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkedSteps, setCheckedSteps] = useState({})
  const { isFavorite, toggleFavorite, isAuthenticated } = useFavorites()

  useEffect(() => {
    setLoading(true)
    setCheckedSteps({})
    fetchRecipeBySlug(slug).then(data => {
      setRecipe(data)
      setLoading(false)
      if (data) {
        // SEO : meta tags + JSON-LD Recipe schema
        updateMeta({
          title: data.title,
          description: data.description || `Recette ${data.title} pour BBQ et fumoir.`,
          canonical: `https://charbonetflamme.fr/recettes/${data.slug}`,
        })
        injectJsonLd('recipe-schema', recipeSchema(data))
        // Fetch related recipes of same type
        fetchRecipes({ type: data.type, limit: 6 }).then(all => {
          setRelated(all.filter(r => r.slug !== slug).slice(0, 3))
        })
      }
    })
    return () => injectJsonLd('recipe-schema', null)
  }, [slug])

  const toggleStep = (idx) => {
    setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-xl">🔥</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl mb-4 block">😕</span>
          <p className="text-zinc-400 text-[15px] mb-4">Recette introuvable</p>
          <Link to="/recettes" className="btn-primary px-5 py-2.5 text-[13px]">← Retour aux recettes</Link>
        </div>
      </div>
    )
  }

  const ingredients = typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients
  const steps = typeof recipe.steps === 'string' ? JSON.parse(recipe.steps) : recipe.steps
  const gradientClass = TYPE_COLORS[recipe.type] || TYPE_COLORS.rub

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-[0.04]`} />
        <div className="relative px-6 lg:px-10 py-8 lg:py-12 max-w-4xl">
          <Link to="/recettes" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-zinc-500 hover:text-[#ff6b1a] transition-colors mb-5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            Toutes les recettes
          </Link>

          <div className="animate-fade-up">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg bg-gradient-to-r ${gradientClass} text-white`}>
                {TYPE_ICONS[recipe.type]} {TYPE_LABELS[recipe.type]}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${DIFFICULTY_COLORS[recipe.difficulty]}`}>
                {recipe.difficulty}
              </span>
              {recipe.prep_time && (
                <span className="text-[11px] font-medium text-zinc-500 px-2.5 py-1 rounded-lg bg-white/[0.04]">
                  ⏱ {recipe.prep_time}
                </span>
              )}
              {recipe.yield_amount && (
                <span className="text-[11px] font-medium text-zinc-500 px-2.5 py-1 rounded-lg bg-white/[0.04]">
                  📦 {recipe.yield_amount}
                </span>
              )}
            </div>

            <div className="flex items-start gap-3 mb-3">
              <h1 className="text-[26px] lg:text-[34px] font-extrabold text-white tracking-tight leading-[1.1] flex-1">
                {recipe.title}
              </h1>
              {isAuthenticated && (
                <button
                  onClick={() => toggleFavorite(recipe.id)}
                  className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isFavorite(recipe.id)
                      ? 'bg-red-500/20 text-red-400 shadow-lg shadow-red-500/10'
                      : 'bg-white/[0.05] text-zinc-600 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                  title={isFavorite(recipe.id) ? 'Retirer du carnet' : 'Ajouter au carnet'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite(recipe.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                </button>
              )}
            </div>

            {recipe.origin && (
              <p className="text-[13px] text-zinc-500 italic mb-2">📍 {recipe.origin}</p>
            )}

            <p className="text-[14px] text-zinc-400 leading-relaxed max-w-xl">
              {recipe.summary}
            </p>

            {/* Meat tags */}
            {recipe.meat_types?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {recipe.meat_types.map(m => (
                  <span key={m} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#ff6b1a]/8 text-[#ff6b1a]/80 border border-[#ff6b1a]/15">
                    {MEAT_LABELS[m] || m}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 pb-12 max-w-4xl">
        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── Left: Description + Steps ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Description */}
            {recipe.description && (
              <div className="surface p-5">
                <h2 className="text-[14px] font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-sm">📖</span> À propos
                </h2>
                <p className="text-[13px] text-zinc-400 leading-relaxed">{recipe.description}</p>
              </div>
            )}

            {/* Steps */}
            {steps?.length > 0 && (
              <div className="surface p-5">
                <h2 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-sm">👨‍🍳</span> Préparation
                </h2>
                <div className="space-y-3">
                  {steps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`w-full flex items-start gap-3 text-left group transition-all ${
                        checkedSteps[idx] ? 'opacity-50' : ''
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 transition-all ${
                        checkedSteps[idx]
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] text-white shadow-md shadow-[#ff6b1a]/20'
                      }`}>
                        {checkedSteps[idx] ? '✓' : idx + 1}
                      </div>
                      <p className={`text-[13px] leading-relaxed pt-0.5 transition-all ${
                        checkedSteps[idx]
                          ? 'text-zinc-600 line-through'
                          : 'text-zinc-300 group-hover:text-white'
                      }`}>
                        {step}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Progress */}
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="text-zinc-600">Progression</span>
                    <span className="text-[#ff6b1a] font-bold">
                      {Object.values(checkedSteps).filter(Boolean).length}/{steps.length}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#ff6b1a] to-[#ef4444] transition-all duration-300"
                      style={{ width: `${(Object.values(checkedSteps).filter(Boolean).length / steps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Ingredients ── */}
          <div className="lg:col-span-2">
            <div className="surface p-5 lg:sticky lg:top-8">
              <h2 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-sm">🧪</span> Ingrédients
              </h2>
              <div className="space-y-2">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b1a] mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[13px] text-white font-medium">{ing.name}</span>
                        <span className="text-[12px] text-[#ff6b1a] font-bold shrink-0">{ing.qty}</span>
                      </div>
                      {ing.note && (
                        <p className="text-[10px] text-zinc-600 mt-0.5 italic">{ing.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {recipe.yield_amount && (
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <p className="text-[11px] text-zinc-500">
                    <span className="text-zinc-400 font-semibold">Rendement :</span> {recipe.yield_amount}
                  </p>
                </div>
              )}
            </div>

            {/* Tags */}
            {recipe.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {recipe.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.03] text-zinc-600 border border-white/[0.05]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Related recipes ── */}
        {related.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 fire-divider" />
              <p className="text-[11px] font-bold text-[#ff6b1a] uppercase tracking-[0.12em]">
                Autres {TYPE_LABELS[recipe.type]}s
              </p>
              <div className="h-px flex-1 fire-divider" />
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {related.map(r => (
                <Link
                  key={r.id}
                  to={`/recettes/${r.slug}`}
                  className="surface p-4 group hover:border-[#ff6b1a]/20 transition-all"
                >
                  <h4 className="text-[13px] font-bold text-white group-hover:text-[#ff6b1a] transition-colors mb-1">
                    {r.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 line-clamp-2">{r.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
