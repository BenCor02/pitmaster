import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import { fetchFavorites, removeFavorite } from '../lib/favorites.js'

const TYPE_LABELS = { rub: 'Rub', mop: 'Mop', marinade: 'Marinade', injection: 'Injection', glaze: 'Glaze' }
const TYPE_COLORS = {
  rub: { gradient: 'from-amber-500 to-orange-600' },
  mop: { gradient: 'from-blue-500 to-indigo-600' },
  marinade: { gradient: 'from-purple-500 to-violet-600' },
  injection: { gradient: 'from-green-500 to-emerald-600' },
  glaze: { gradient: 'from-rose-500 to-pink-600' },
}
const MEAT_LABELS = {
  brisket: 'Poitrine', beef_short_ribs: 'Plat de côtes', chuck_roast: 'Paleron',
  prime_rib: 'Côte de bœuf', tomahawk: 'Tomahawk', pulled_pork: 'Échine de porc',
  spare_ribs: 'Travers', baby_back_ribs: 'Baby Back', whole_chicken: 'Poulet entier',
}

const TYPE_IMAGES = {
  rub: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=400&fit=crop&q=80',
  mop: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&q=80',
  marinade: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&h=400&fit=crop&q=80',
  injection: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop&q=80',
  glaze: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop&q=80',
}

export default function FavoritesPage() {
  const { session, isLoading, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return
    fetchFavorites(session.user.id).then(data => {
      setFavorites(data)
      setLoading(false)
    })
  }, [session?.user?.id])

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-zinc-500">Chargement...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const handleRemove = async (recipeId) => {
    setFavorites(prev => prev.filter(f => f.recipe_id !== recipeId))
    await removeFavorite(session.user.id, recipeId)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden min-h-[240px] lg:min-h-[300px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1400&h=400&fit=crop&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ animation: 'slowZoom 20s ease-in-out infinite alternate' }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/30 to-transparent" />
        </div>
        <div className="relative px-6 lg:px-10 py-14 lg:py-20 max-w-6xl">
          <div className="animate-fade-up">
            <div className="badge badge-fire mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 mr-2 animate-pulse" />
              Collection personnelle
            </div>
            <h1 className="font-display text-[32px] lg:text-[44px] font-black text-white tracking-tight leading-[1.05] mb-3">
              Mon <span className="text-gradient">Carnet.</span>
            </h1>
            <p className="text-[15px] lg:text-[16px] text-zinc-300 max-w-lg leading-relaxed">
              Tes recettes favorites sauvegardées. Ton arsenal personnel de pitmaster.
            </p>
            {!loading && favorites.length > 0 && (
              <p className="text-[12px] text-zinc-500 font-bold mt-4">
                {favorites.length} recette{favorites.length > 1 ? 's' : ''} sauvegardée{favorites.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 pb-16 max-w-6xl">
        {loading ? (
          <div className="text-center py-20 animate-fade">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <span className="text-2xl">📖</span>
            </div>
            <p className="text-zinc-500 text-sm">Chargement de ton carnet...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 animate-fade">
            <div className="w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">📖</span>
            </div>
            <p className="text-zinc-300 text-[18px] font-bold mb-2">Ton carnet est vide</p>
            <p className="text-zinc-600 text-[14px] mb-8 max-w-sm mx-auto">
              Explore les recettes et clique sur le cœur pour les sauvegarder ici.
            </p>
            <Link to="/recettes" className="btn-primary px-8 py-3.5 text-[14px] inline-flex items-center gap-2">
              🔥 Découvrir les recettes
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
            {favorites.map(fav => {
              const recipe = fav.recipes
              if (!recipe) return null
              const colors = TYPE_COLORS[recipe.type] || TYPE_COLORS.rub
              const imageUrl = recipe.cover_url || TYPE_IMAGES[recipe.type] || TYPE_IMAGES.rub
              return (
                <div key={fav.id} className="card-premium group relative">
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(fav.recipe_id)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-all z-10 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                    title="Retirer du carnet"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  </button>

                  <Link to={`/recettes/${recipe.slug}`} className="block">
                    {/* Image */}
                    <div className="relative h-[150px] overflow-hidden bg-zinc-900">
                      <img
                        src={imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-gradient-to-r ${colors.gradient} text-white shadow-lg`}>
                          {TYPE_LABELS[recipe.type]}
                        </span>
                      </div>
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
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-zinc-600 font-semibold">{recipe.difficulty}</span>
                      </div>

                      <h3 className="text-[16px] font-bold text-white group-hover:text-[#ff6b1a] transition-colors mb-2 leading-snug pr-8">
                        {recipe.title}
                      </h3>

                      <p className="text-[12px] text-zinc-500 leading-relaxed line-clamp-2 mb-4">
                        {recipe.summary}
                      </p>

                      {recipe.meat_types?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {recipe.meat_types.slice(0, 3).map(m => (
                            <span key={m} className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.05] text-zinc-400 border border-white/[0.06]">
                              {MEAT_LABELS[m] || m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
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
