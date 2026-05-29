'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { updateMeta } from '../lib/seo.js'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import { fetchFavorites, removeFavorite } from '../lib/favorites.js'
import { CFHeader, CFFooter } from '../components/cf/Chrome.jsx'
import { FireButton } from '../components/cf/Primitives.jsx'

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
  const mobile = useMobile()
  const { session, isLoading, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updateMeta({
      title: 'Mon carnet BBQ — Recettes favorites | Charbon & Flamme',
      description: 'Retrouve tes recettes BBQ favorites : rubs, marinades, mops et glazes sauvegardés dans ton carnet personnel.',
      canonical: 'https://charbonetflamme.fr/carnet',
    })
  }, [])

  useEffect(() => {
    if (!session?.user?.id) return
    fetchFavorites(session.user.id).then(data => {
      setFavorites(data)
      setLoading(false)
    })
  }, [session?.user?.id])

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: '#FAF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6E6356' }}>
      Chargement...
    </div>
  )
  if (!isAuthenticated) return /* redirect to /login */null

  const handleRemove = async (recipeId) => {
    setFavorites(prev => prev.filter(f => f.recipe_id !== recipeId))
    await removeFavorite(session.user.id, recipeId)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14' }}>
      <CFHeader />
      <main>
        {/* Hero */}
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: mobile ? 220 : 280 }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1400&h=400&fit=crop&q=80"
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', animation: 'slowZoom 20s ease-in-out infinite alternate' }}
              onError={e => { e.target.style.display = 'none' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(250,246,238,0.96) 45%, rgba(250,246,238,0.70) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(250,246,238,0.95) 0%, rgba(250,246,238,0.20) 60%, transparent 100%)' }} />
          </div>
          <div style={{ position: 'relative', padding: mobile ? '48px 24px' : '64px 40px', maxWidth: 960 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 20, background: 'rgba(139,26,26,0.08)', border: '1px solid rgba(139,26,26,0.15)', marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B1A1A' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Collection personnelle</span>
            </div>
            <h1 style={{ fontFamily: 'var(--cf-serif)', fontSize: mobile ? 32 : 44, fontWeight: 900, color: '#1F1A14', lineHeight: 1.05, margin: '0 0 10px' }}>
              Mon <span style={{ color: '#8B1A1A' }}>Carnet.</span>
            </h1>
            <p style={{ fontSize: mobile ? 14 : 16, color: '#6E6356', maxWidth: 440, lineHeight: 1.7, margin: 0 }}>
              Tes recettes favorites sauvegardées. Ton arsenal personnel de pitmaster.
            </p>
            {!loading && favorites.length > 0 && (
              <p style={{ fontSize: 12, color: '#6E6356', fontWeight: 700, marginTop: 14 }}>
                {favorites.length} recette{favorites.length > 1 ? 's' : ''} sauvegardée{favorites.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        <div style={{ padding: mobile ? '24px 16px 64px' : '32px 40px 80px', maxWidth: 960, margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(139,26,26,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>
                📖
              </div>
              <p style={{ color: '#6E6356', fontSize: 14 }}>Chargement de ton carnet...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 40 }}>
                📖
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#1F1A14', marginBottom: 8 }}>Ton carnet est vide</p>
              <p style={{ fontSize: 14, color: '#6E6356', marginBottom: 28, maxWidth: 320, margin: '0 auto 28px' }}>
                Explore les recettes et clique sur le cœur pour les sauvegarder ici.
              </p>
              <Link href="/recettes" style={{ textDecoration: 'none' }}>
                <FireButton>🔥 Découvrir les recettes</FireButton>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {favorites.map(fav => {
                const recipe = fav.recipes
                if (!recipe) return null
                const colors = TYPE_COLORS[recipe.type] || TYPE_COLORS.rub
                const imageUrl = recipe.cover_url || TYPE_IMAGES[recipe.type] || TYPE_IMAGES.rub
                return (
                  <div key={fav.id} style={{ background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.12)', borderRadius: 16, overflow: 'hidden', position: 'relative' }} className="group">
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(fav.recipe_id)}
                      title="Retirer du carnet"
                      style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 8, background: 'rgba(139,26,26,0.15)', color: '#8B1A1A', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    </button>

                    <Link href={`/recettes/${recipe.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                      {/* Image */}
                      <div style={{ position: 'relative', height: 150, overflow: 'hidden', background: '#E8DCC8' }}>
                        <img
                          src={imageUrl}
                          alt={recipe.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s', display: 'block' }}
                          loading="lazy"
                          onError={e => { e.target.style.display = 'none' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(31,26,20,0.35) 0%, transparent 60%)' }} />
                        <div style={{ position: 'absolute', top: 10, left: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 8, background: colors.bg, color: colors.color, border: `1px solid ${colors.border}` }}>
                            {TYPE_LABELS[recipe.type]}
                          </span>
                        </div>
                        {recipe.prep_time && (
                          <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#FAF6EE', background: 'rgba(31,26,20,0.55)', padding: '4px 8px', borderRadius: 8 }}>
                              ⏱ {recipe.prep_time}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: '#6E6356', fontWeight: 600 }}>{recipe.difficulty}</span>
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F1A14', lineHeight: 1.3, marginBottom: 8, paddingRight: 24 }}>
                          {recipe.title}
                        </h3>
                        <p style={{ fontSize: 12, color: '#6E6356', lineHeight: 1.6, marginBottom: 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {recipe.summary}
                        </p>
                        {recipe.meat_types?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {recipe.meat_types.slice(0, 3).map(m => (
                              <span key={m} style={{ fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'rgba(31,26,20,0.06)', color: '#6E6356', border: '1px solid rgba(31,26,20,0.10)' }}>
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
      </main>
      <CFFooter mobile={mobile} />
      <style>{`
        @keyframes slowZoom {
          from { transform: scale(1.05); }
          to { transform: scale(1.12); }
        }
      `}</style>
    </div>
  )
}
