'use client'

import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'next/navigation'
import { fetchRecipeBySlug, fetchRecipes } from '../lib/cms.js'
import { useFavorites } from '../hooks/useFavorites.js'
import { updateMeta, recipeSchema, injectJsonLd } from '../lib/seo.js'
import { CFHeader, CFFooter } from '../components/cf/Chrome.jsx'

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
const TYPE_ICONS = { rub: '🧂', mop: '🖌️', marinade: '🫙', injection: '💉', glaze: '✨' }
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
const DIFFICULTY_COLORS = {
  'facile': { color: '#2D6A4F', bg: 'rgba(45,106,79,0.10)', border: 'rgba(45,106,79,0.20)' },
  'moyen': { color: '#E8A53C', bg: 'rgba(232,165,60,0.10)', border: 'rgba(232,165,60,0.20)' },
  'avancé': { color: '#8B1A1A', bg: 'rgba(139,26,26,0.10)', border: 'rgba(139,26,26,0.20)' },
}
const TYPE_IMAGES = {
  rub: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1400&h=500&fit=crop&q=80',
  mop: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1400&h=500&fit=crop&q=80',
  marinade: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=1400&h=500&fit=crop&q=80',
  injection: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1400&h=500&fit=crop&q=80',
  glaze: 'https://images.unsplash.com/photo-1558030006-450675393462?w=1400&h=500&fit=crop&q=80',
}

export default function RecipeDetailPage() {
  const mobile = useMobile()
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
      <div style={{ minHeight: '100vh', background: '#FAF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(139,26,26,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 26 }}>
            🔥
          </div>
          <p style={{ color: '#6E6356', fontSize: 14, fontWeight: 500 }}>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 24, background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>
            😕
          </div>
          <p style={{ fontSize: 17, fontWeight: 600, color: '#1F1A14', marginBottom: 8 }}>Recette introuvable</p>
          <p style={{ fontSize: 13, color: '#6E6356', marginBottom: 24 }}>Elle a peut-être été déplacée ou supprimée</p>
          <Link href="/recettes" style={{ display: 'inline-block', padding: '10px 22px', borderRadius: 12, background: '#8B1A1A', color: '#FAF6EE', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            ← Retour aux recettes
          </Link>
        </div>
      </div>
    )
  }

  const ingredients = typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients
  const steps = typeof recipe.steps === 'string' ? JSON.parse(recipe.steps) : recipe.steps
  const typeColor = TYPE_COLORS[recipe.type] || TYPE_COLORS.rub
  const diffColor = DIFFICULTY_COLORS[recipe.difficulty] || DIFFICULTY_COLORS['moyen']
  const imageUrl = recipe.cover_url || recipe.image_url || TYPE_IMAGES[recipe.type] || TYPE_IMAGES.rub
  const completedCount = Object.values(checkedSteps).filter(Boolean).length
  const progress = steps?.length ? (completedCount / steps.length) * 100 : 0

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14' }}>
      <CFHeader />
      <main>
        {/* ── Hero immersif pleine largeur ── */}
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: mobile ? 260 : 380 }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <img
              src={imageUrl}
              alt={recipe.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', animation: 'slowZoom 25s ease-in-out infinite alternate' }}
              onError={e => { e.target.style.display = 'none' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(250,246,238,1) 0%, rgba(250,246,238,0.60) 45%, rgba(250,246,238,0.15) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(250,246,238,0.85) 0%, transparent 60%)' }} />
          </div>

          {/* Back + Favorite buttons floating on hero */}
          <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
            <Link
              href="/recettes"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12, background: 'rgba(250,246,238,0.85)', backdropFilter: 'blur(8px)', fontSize: 12, fontWeight: 700, color: '#1F1A14', textDecoration: 'none', border: '1px solid rgba(31,26,20,0.15)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
              Recettes
            </Link>

            {isAuthenticated && (
              <button
                onClick={() => toggleFavorite(recipe.id)}
                style={{
                  width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)', border: '1px solid rgba(31,26,20,0.15)', cursor: 'pointer',
                  background: isFavorite(recipe.id) ? 'rgba(139,26,26,0.15)' : 'rgba(250,246,238,0.85)',
                  color: isFavorite(recipe.id) ? '#8B1A1A' : '#6E6356',
                }}
                title={isFavorite(recipe.id) ? 'Retirer du carnet' : 'Ajouter au carnet'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite(recipe.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
              </button>
            )}
          </div>

          {/* Recipe info overlay at bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: mobile ? '48px 24px 24px' : '80px 40px 32px' }}>
            <div style={{ maxWidth: 760 }}>
              {/* Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 8, background: typeColor.bg, color: typeColor.color, border: `1px solid ${typeColor.border}` }}>
                  {TYPE_ICONS[recipe.type]} {TYPE_LABELS[recipe.type]}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 8, background: diffColor.bg, color: diffColor.color, border: `1px solid ${diffColor.border}` }}>
                  {recipe.difficulty}
                </span>
                {recipe.prep_time && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6E6356', padding: '5px 12px', borderRadius: 8, background: 'rgba(31,26,20,0.06)', border: '1px solid rgba(31,26,20,0.12)' }}>
                    ⏱ {recipe.prep_time}
                  </span>
                )}
                {recipe.yield_amount && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6E6356', padding: '5px 12px', borderRadius: 8, background: 'rgba(31,26,20,0.06)', border: '1px solid rgba(31,26,20,0.12)' }}>
                    📦 {recipe.yield_amount}
                  </span>
                )}
              </div>

              <h1 style={{ fontFamily: 'var(--cf-serif)', fontSize: mobile ? 28 : 42, fontWeight: 900, color: '#1F1A14', lineHeight: 1.05, margin: '0 0 10px' }}>
                {recipe.title}
              </h1>

              {recipe.origin && (
                <p style={{ fontSize: 13, color: '#6E6356', fontStyle: 'italic', margin: '0 0 10px' }}>📍 {recipe.origin}</p>
              )}

              <p style={{ fontSize: 15, color: '#6E6356', lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
                {recipe.summary}
              </p>

              {recipe.meat_types?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
                  {recipe.meat_types.map(m => (
                    <span key={m} style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 8, background: 'rgba(232,165,60,0.12)', color: '#8B1A1A', border: '1px solid rgba(232,165,60,0.20)' }}>
                      {MEAT_LABELS[m] || m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ padding: mobile ? '24px 16px 64px' : '40px 40px 80px', maxWidth: 864, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '3fr 2fr', gap: 28 }}>

            {/* ── Left: Description + Steps ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Description */}
              {recipe.description && (
                <div style={{ background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.12)', borderRadius: 16, padding: 24 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1F1A14', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(139,26,26,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📖</span>
                    À propos
                  </h2>
                  <p style={{ fontSize: 14, color: '#6E6356', lineHeight: 1.8, margin: 0 }}>{recipe.description}</p>
                </div>
              )}

              {/* Steps */}
              {steps?.length > 0 && (
                <div style={{ background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.12)', borderRadius: 16, padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1F1A14', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                      <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(139,26,26,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👨‍🍳</span>
                      Préparation
                    </h2>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#8B1A1A' }}>
                      {completedCount}/{steps.length}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ height: 6, borderRadius: 4, background: 'rgba(31,26,20,0.08)', overflow: 'hidden' }}>
                      <div
                        style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(to right, #8B1A1A, #E8A53C)', transition: 'width 0.5s ease-out', width: `${progress}%` }}
                      />
                    </div>
                    {progress === 100 && (
                      <p style={{ fontSize: 12, color: '#2D6A4F', fontWeight: 700, marginTop: 8 }}>
                        ✓ Toutes les étapes terminées !
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {steps.map((step, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleStep(idx)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, textAlign: 'left',
                          padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                          background: checkedSteps[idx] ? 'rgba(45,106,79,0.04)' : 'transparent',
                          opacity: checkedSteps[idx] ? 0.55 : 1,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{
                          width: 30, height: 30, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 800, flexShrink: 0, transition: 'all 0.2s',
                          background: checkedSteps[idx] ? 'rgba(45,106,79,0.15)' : '#8B1A1A',
                          color: checkedSteps[idx] ? '#2D6A4F' : '#FAF6EE',
                        }}>
                          {checkedSteps[idx] ? '✓' : idx + 1}
                        </div>
                        <p style={{
                          fontSize: 14, lineHeight: 1.65, paddingTop: 4, transition: 'all 0.2s', margin: 0,
                          color: checkedSteps[idx] ? '#6E6356' : '#1F1A14',
                          textDecoration: checkedSteps[idx] ? 'line-through' : 'none',
                        }}>
                          {step}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Ingredients (sticky) ── */}
            <div>
              <div style={{ background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.15)', borderRadius: 16, padding: 24, position: mobile ? 'static' : 'sticky', top: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1F1A14', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(139,26,26,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🧪</span>
                  Ingrédients
                </h2>
                <div>
                  {ingredients.map((ing, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: idx < ingredients.length - 1 ? '1px solid rgba(31,26,20,0.08)' : 'none' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B1A1A', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 14, color: '#1F1A14', fontWeight: 500 }}>{ing.name}</span>
                        {ing.note && (
                          <span style={{ fontSize: 11, color: '#6E6356', fontStyle: 'italic', marginLeft: 6 }}>{ing.note}</span>
                        )}
                      </div>
                      <span style={{ fontSize: 13, color: '#8B1A1A', fontWeight: 700, flexShrink: 0 }}>{ing.qty}</span>
                    </div>
                  ))}
                </div>

                {recipe.yield_amount && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(31,26,20,0.10)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                      <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(31,26,20,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📦</span>
                      <div>
                        <p style={{ color: '#6E6356', fontSize: 11, margin: 0 }}>Rendement</p>
                        <p style={{ color: '#1F1A14', fontWeight: 700, margin: 0 }}>{recipe.yield_amount}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {recipe.tags?.length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {recipe.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 8, background: 'rgba(31,26,20,0.05)', color: '#6E6356', border: '1px solid rgba(31,26,20,0.10)', cursor: 'default' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Related recipes ── */}
          {related.length > 0 && (
            <div style={{ marginTop: 56 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(31,26,20,0.12)' }} />
                <p style={{ fontSize: 12, fontWeight: 800, color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
                  Autres {TYPE_LABELS[recipe.type]}s
                </p>
                <div style={{ flex: 1, height: 1, background: 'rgba(31,26,20,0.12)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
                {related.map(r => {
                  const relImg = r.cover_url || TYPE_IMAGES[r.type] || TYPE_IMAGES.rub
                  return (
                    <Link
                      key={r.id}
                      href={`/recettes/${r.slug}`}
                      style={{ textDecoration: 'none', background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.12)', borderRadius: 16, overflow: 'hidden', display: 'block' }}
                    >
                      <div style={{ position: 'relative', height: 110, overflow: 'hidden', background: '#E8DCC8' }}>
                        <img
                          src={relImg}
                          alt={r.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s', display: 'block' }}
                          loading="lazy"
                          onError={e => { e.target.style.display = 'none' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(31,26,20,0.25), transparent)' }} />
                      </div>
                      <div style={{ padding: 16 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1F1A14', lineHeight: 1.3, marginBottom: 4 }}>
                          {r.title}
                        </h4>
                        <p style={{ fontSize: 11, color: '#6E6356', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: 0 }}>{r.summary}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <CFFooter mobile={mobile} />
      <style>{`
        @keyframes slowZoom {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
      `}</style>
    </div>
  )
}
