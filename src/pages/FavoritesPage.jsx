import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import { fetchFavorites, removeFavorite } from '../lib/favorites.js'

const TYPE_LABELS = { rub: 'Rub', mop: 'Mop', marinade: 'Marinade', injection: 'Injection', glaze: 'Glaze' }
const TYPE_COLORS = {
  rub: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  mop: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  marinade: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  injection: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  glaze: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
}
const MEAT_LABELS = {
  brisket: 'Brisket', beef_short_ribs: 'Short Ribs', chuck_roast: 'Chuck Roast',
  prime_rib: 'Prime Rib', tomahawk: 'Tomahawk', pulled_pork: 'Pulled Pork',
  spare_ribs: 'Spare Ribs', baby_back_ribs: 'Baby Back', whole_chicken: 'Poulet',
}

export default function FavoritesPage() {
  const { session, isLoading, isAuthenticated, profile } = useAuth()
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
      {/* Hero with image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1400&h=400&fit=crop&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/90 to-[#080808]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/20" />
        </div>
        <div className="relative px-6 lg:px-10 py-12 lg:py-16 max-w-5xl">
          <div className="animate-fade-up">
            <div className="badge badge-accent mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b1a] mr-2 animate-pulse" />
              Collection personnelle
            </div>
            <h1 className="font-display text-[28px] lg:text-[36px] font-black text-white tracking-tight leading-[1.1] mb-3">
              Mon <span className="text-gradient">Carnet.</span>
            </h1>
            <p className="text-[14px] lg:text-[15px] text-zinc-400 max-w-lg leading-relaxed">
              Tes recettes favorites sauvegardées. Rubs, marinades, mops — ton arsenal personnel de pitmaster.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 pb-12 max-w-5xl">
        {loading ? (
          <div className="text-center py-16 animate-fade">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <span className="text-xl">📖</span>
            </div>
            <p className="text-zinc-500 text-sm">Chargement de ton carnet...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16 animate-fade">
            <span className="text-5xl mb-4 block">📖</span>
            <p className="text-zinc-400 text-[15px] mb-2">Ton carnet est vide</p>
            <p className="text-zinc-600 text-[13px] mb-6">
              Explore les recettes et clique sur le coeur pour les sauvegarder ici.
            </p>
            <Link to="/recettes" className="btn-primary px-6 py-2.5 text-[13px]">
              Découvrir les recettes
            </Link>
          </div>
        ) : (
          <>
            <p className="text-[12px] text-zinc-600 font-medium mb-4">
              {favorites.length} recette{favorites.length > 1 ? 's' : ''} sauvegardée{favorites.length > 1 ? 's' : ''}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map(fav => {
                const recipe = fav.recipes
                if (!recipe) return null
                const colors = TYPE_COLORS[recipe.type] || TYPE_COLORS.rub
                return (
                  <div key={fav.id} className="surface p-5 group relative animate-fade-up">
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(fav.recipe_id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                      title="Retirer du carnet"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    </button>

                    <Link to={`/recettes/${recipe.slug}`} className="block">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${colors.bg} ${colors.text} ${colors.border} border`}>
                          {TYPE_LABELS[recipe.type]}
                        </span>
                        <span className="text-[10px] text-zinc-600">{recipe.difficulty}</span>
                        {recipe.prep_time && <span className="text-[10px] text-zinc-600">⏱ {recipe.prep_time}</span>}
                      </div>

                      {/* Title */}
                      <h3 className="text-[15px] font-bold text-white group-hover:text-[#ff6b1a] transition-colors mb-2 leading-tight pr-10">
                        {recipe.title}
                      </h3>

                      <p className="text-[12px] text-zinc-500 leading-relaxed line-clamp-2 mb-3">
                        {recipe.summary}
                      </p>

                      {/* Meat tags */}
                      {recipe.meat_types?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {recipe.meat_types.slice(0, 3).map(m => (
                            <span key={m} className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                              {MEAT_LABELS[m] || m}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
