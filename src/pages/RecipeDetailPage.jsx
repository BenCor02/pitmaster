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
  brisket: 'Poitrine', beef_short_ribs: 'Plat de côtes', chuck_roast: 'Paleron',
  prime_rib: 'Côte de bœuf', tomahawk: 'Tomahawk', pulled_pork: 'Échine de porc',
  spare_ribs: 'Travers', baby_back_ribs: 'Baby Back', whole_chicken: 'Poulet entier',
}

const DIFFICULTY_COLORS = {
  'facile': 'text-green-400 bg-green-500/10 border-green-500/20',
  'moyen': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'avancé': 'text-red-400 bg-red-500/10 border-red-500/20',
}

const TYPE_IMAGES = {
  rub: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1400&h=500&fit=crop&q=80',
  mop: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1400&h=500&fit=crop&q=80',
  marinade: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=1400&h=500&fit=crop&q=80',
  injection: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1400&h=500&fit=crop&q=80',
  glaze: 'https://images.unsplash.com/photo-1558030006-450675393462?w=1400&h=500&fit=crop&q=80',
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
    window.scrollTo(0, 0)
    fetchRecipeBySlug(slug).then(data => {
      setRecipe(data)
      setLoading(false)
      if (data) {
        updateMeta({
          title: data.title,
          description: data.description || `Recette ${data.title} pour BBQ et fumoir.`,
          canonical: `https://charbonetflamme.fr/recettes/${data.slug}`,
        })
        injectJsonLd('recipe-schema', recipeSchema(data))
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-2xl">🔥</span>
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
          <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">😕</span>
          </div>
          <p className="text-zinc-300 text-[17px] font-semibold mb-2">Recette introuvable</p>
          <p className="text-zinc-600 text-[13px] mb-6">Elle a peut-être été déplacée ou supprimée</p>
          <Link to="/recettes" className="btn-primary px-6 py-3 text-[13px]">← Retour aux recettes</Link>
        </div>
      </div>
    )
  }

  const ingredients = typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients
  const steps = typeof recipe.steps === 'string' ? JSON.parse(recipe.steps) : recipe.steps
  const gradientClass = TYPE_COLORS[recipe.type] || TYPE_COLORS.rub
  const imageUrl = recipe.cover_url || recipe.image_url || TYPE_IMAGES[recipe.type] || TYPE_IMAGES.rub
  const completedCount = Object.values(checkedSteps).filter(Boolean).length
  const progress = steps?.length ? (completedCount / steps.length) * 100 : 0

  return (
    <div className="min-h-screen">

      {/* ── Hero immersif pleine largeur ── */}
      <div className="relative overflow-hidden min-h-[300px] lg:min-h-[400px]">
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
            style={{ animation: 'slowZoom 25s ease-in-out infinite alternate' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/50 to-[#080808]/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/80 to-transparent" />
        </div>

        {/* Back + Favorite buttons floating on hero */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <Link
            to="/recettes"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/40 backdrop-blur-sm text-[12px] font-bold text-white/80 hover:text-white hover:bg-black/60 transition-all border border-white/[0.08]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            Recettes
          </Link>

          {isAuthenticated && (
            <button
              onClick={() => toggleFavorite(recipe.id)}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm border border-white/[0.08] ${
                isFavorite(recipe.id)
                  ? 'bg-red-500/30 text-red-400 shadow-lg shadow-red-500/20'
                  : 'bg-black/40 text-white/60 hover:text-red-400 hover:bg-red-500/20'
              }`}
              title={isFavorite(recipe.id) ? 'Retirer du carnet' : 'Ajouter au carnet'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite(recipe.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            </button>
          )}
        </div>

        {/* Recipe info overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-10 pb-8 pt-20 bg-gradient-to-t from-[#080808] via-[#080808]/90 to-transparent">
          <div className="max-w-4xl animate-fade-up">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`text-[11px] font-black uppercase px-3 py-1.5 rounded-lg bg-gradient-to-r ${gradientClass} text-white shadow-lg`}>
                {TYPE_ICONS[recipe.type]} {TYPE_LABELS[recipe.type]}
              </span>
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border ${DIFFICULTY_COLORS[recipe.difficulty]}`}>
                {recipe.difficulty}
              </span>
              {recipe.prep_time && (
                <span className="text-[11px] font-bold text-zinc-400 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                  ⏱ {recipe.prep_time}
                </span>
              )}
              {recipe.yield_amount && (
                <span className="text-[11px] font-bold text-zinc-400 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                  📦 {recipe.yield_amount}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-[30px] lg:text-[44px] font-black text-white tracking-tight leading-[1.05] mb-3">
              {recipe.title}
            </h1>

            {recipe.origin && (
              <p className="text-[13px] text-zinc-400 italic mb-3">📍 {recipe.origin}</p>
            )}

            <p className="text-[15px] text-zinc-300 leading-relaxed max-w-2xl">
              {recipe.summary}
            </p>

            {/* Meat tags */}
            {recipe.meat_types?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {recipe.meat_types.map(m => (
                  <span key={m} className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[#ff6b1a]/10 text-[#ff6b1a]/80 border border-[#ff6b1a]/15">
                    {MEAT_LABELS[m] || m}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-6 lg:px-10 py-10 max-w-4xl">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* ── Left: Description + Steps ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Description */}
            {recipe.description && (
              <div className="surface p-6 animate-fade-up">
                <h2 className="text-[15px] font-bold text-white mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff6b1a]/20 to-[#ef4444]/10 flex items-center justify-center text-sm">📖</span>
                  À propos
                </h2>
                <p className="text-[14px] text-zinc-400 leading-[1.8]">{recipe.description}</p>
              </div>
            )}

            {/* Steps */}
            {steps?.length > 0 && (
              <div className="surface p-6 animate-fade-up">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[15px] font-bold text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff6b1a]/20 to-[#ef4444]/10 flex items-center justify-center text-sm">👨‍🍳</span>
                    Préparation
                  </h2>
                  <span className="text-[12px] font-bold text-[#ff6b1a]">
                    {completedCount}/{steps.length}
                  </span>
                </div>

                {/* Progress bar at top */}
                <div className="mb-6">
                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#ff6b1a] to-[#ef4444] transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {progress === 100 && (
                    <p className="text-[12px] text-green-400 font-bold mt-2 animate-fade">
                      ✓ Toutes les étapes terminées !
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  {steps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`w-full flex items-start gap-4 text-left p-3 rounded-xl transition-all ${
                        checkedSteps[idx]
                          ? 'opacity-50 bg-green-500/[0.03]'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-black shrink-0 transition-all ${
                        checkedSteps[idx]
                          ? 'bg-green-500/20 text-green-400 scale-90'
                          : 'bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] text-white shadow-md shadow-[#ff6b1a]/20'
                      }`}>
                        {checkedSteps[idx] ? '✓' : idx + 1}
                      </div>
                      <p className={`text-[14px] leading-relaxed pt-1 transition-all ${
                        checkedSteps[idx]
                          ? 'text-zinc-600 line-through'
                          : 'text-zinc-300'
                      }`}>
                        {step}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Ingredients (sticky) ── */}
          <div className="lg:col-span-2">
            <div className="surface-fire p-6 lg:sticky lg:top-6 animate-fade-up">
              <h2 className="text-[15px] font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff6b1a]/20 to-[#ef4444]/10 flex items-center justify-center text-sm">🧪</span>
                Ingrédients
              </h2>
              <div className="space-y-0">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#ff6b1a] to-[#ef4444] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] text-white font-medium">{ing.name}</span>
                      {ing.note && (
                        <span className="text-[11px] text-zinc-600 italic ml-2">{ing.note}</span>
                      )}
                    </div>
                    <span className="text-[13px] text-[#ff6b1a] font-bold shrink-0">{ing.qty}</span>
                  </div>
                ))}
              </div>

              {recipe.yield_amount && (
                <div className="mt-5 pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center gap-3 text-[13px]">
                    <span className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-sm">📦</span>
                    <div>
                      <p className="text-zinc-500 text-[11px]">Rendement</p>
                      <p className="text-white font-bold">{recipe.yield_amount}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {recipe.tags?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5 animate-fade-up">
                {recipe.tags.map(tag => (
                  <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/[0.03] text-zinc-500 border border-white/[0.06] hover:border-[#ff6b1a]/20 hover:text-[#ff6b1a]/60 transition-colors cursor-default">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Related recipes ── */}
        {related.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 fire-divider" />
              <p className="text-[12px] font-black text-[#ff6b1a] uppercase tracking-[0.15em]">
                Autres {TYPE_LABELS[recipe.type]}s
              </p>
              <div className="h-px flex-1 fire-divider" />
            </div>

            <div className="grid sm:grid-cols-3 gap-4 stagger">
              {related.map(r => {
                const relImg = r.cover_url || TYPE_IMAGES[r.type] || TYPE_IMAGES.rub
                return (
                  <Link
                    key={r.id}
                    to={`/recettes/${r.slug}`}
                    className="card-premium group overflow-hidden"
                  >
                    <div className="relative h-[120px] overflow-hidden">
                      <img
                        src={relImg}
                        alt={r.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
                    </div>
                    <div className="p-4">
                      <h4 className="text-[14px] font-bold text-white group-hover:text-[#ff6b1a] transition-colors mb-1 leading-snug">
                        {r.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-2">{r.summary}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slowZoom {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
      `}</style>
    </div>
  )
}
