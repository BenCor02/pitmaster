/**
 * RecipesPage — "Recettes de feu" (design v3 light mode pitmaster)
 *
 * Liste éditoriale des rubs / mops / marinades / injections / glazes
 * (table Supabase `recipes`). Repris du brief design "RecipeListPage" :
 * h1 Oswald géant, filtres Pill, FeaturedRecipe en tête, grille de
 * RecipeCard, SponsorSlot intercalé, "Charger plus".
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchRecipes } from '../lib/cms.js'
import { updateMeta } from '../lib/seo.js'
import { useRecipeImages } from '../lib/recipeImages.js'
import { Pill, SectionEyebrow, FireButton } from '../components/cf/Primitives.jsx'
import { CFHeader, CFFooter, NewsletterBlock, SponsorSlot } from '../components/cf/Chrome.jsx'
import { RecipeCard, FeaturedRecipe } from '../components/cf/Cards.jsx'

// ── Constantes ────────────────────────────────────
const TYPE_OPTIONS = [
  { id: 'all', label: 'Tout' },
  { id: 'rub', label: 'Rubs' },
  { id: 'mop', label: 'Mops' },
  { id: 'marinade', label: 'Marinades' },
  { id: 'injection', label: 'Injections' },
  { id: 'glaze', label: 'Glazes' },
]

const MEAT_OPTIONS = [
  { id: 'all', label: 'Toutes viandes' },
  { id: 'brisket', label: 'Brisket' },
  { id: 'pulled_pork', label: 'Pulled pork' },
  { id: 'spare_ribs', label: 'Travers' },
  { id: 'whole_chicken', label: 'Poulet' },
  { id: 'tomahawk', label: 'Côte de bœuf' },
]

const DIFFICULTY_LABELS = {
  facile: 'Facile',
  moyen: 'Moyen',
  avance: 'Avancé',
  'avancé': 'Avancé',
  intermediaire: 'Inter.',
  'intermédiaire': 'Inter.',
}

// Fallback image par type (si pas de cover_url)
function fallbackImage(type, images) {
  const map = {
    rub: images.rub,
    mop: images.fire,
    marinade: images.steak,
    injection: images.brisket,
    glaze: images.ribs,
  }
  return map[type] || images.fire
}

function useMobile() {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  )
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => setMobile(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])
  return mobile
}

// ── Page ──────────────────────────────────────────
const PAGE_SIZE = 12

export default function RecipesPage() {
  const mobile = useMobile()
  const navigate = useNavigate()
  const images = useRecipeImages()

  const [recipes, setRecipes] = useState(null) // null = loading
  const [type, setType] = useState('all')
  const [meat, setMeat] = useState('all')
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    updateMeta({
      title: 'Recettes de feu — Rubs, marinades, glazes BBQ | Charbon & Flamme',
      description:
        'Toutes les recettes de rubs, mops, marinades, injections et glazes BBQ. Du brisket Magic Dust à la marinade asiatique pour ribs.',
      canonical: 'https://charbonetflamme.fr/recettes',
    })
  }, [])

  useEffect(() => {
    let alive = true
    fetchRecipes().then((data) => {
      if (!alive) return
      setRecipes(data || [])
    })
    return () => { alive = false }
  }, [])

  // Filtres
  const filtered = useMemo(() => {
    if (!recipes) return []
    let list = recipes
    if (type !== 'all') list = list.filter((r) => r.type === type)
    if (meat !== 'all') list = list.filter((r) => Array.isArray(r.meat_types) && r.meat_types.includes(meat))
    return list
  }, [recipes, type, meat])

  // Compteurs par type (pour les badges des Pills)
  const typeCounts = useMemo(() => {
    if (!recipes) return {}
    const counts = { all: recipes.length }
    for (const opt of TYPE_OPTIONS) {
      if (opt.id === 'all') continue
      counts[opt.id] = recipes.filter((r) => r.type === opt.id).length
    }
    return counts
  }, [recipes])

  const featured = filtered[0] || null
  const grid = filtered.slice(1, visible)
  const canLoadMore = filtered.length > visible

  // ── Render ────────────────────────────────────
  return (
    <div className="cf-root cf-paper-bg" style={{ width: '100%', minHeight: '100vh' }}>
      <CFHeader dark={false} />

      {/* Hero éditorial */}
      <section
        style={{
          padding: mobile ? '32px 20px 16px' : '64px 64px 32px',
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        <SectionEyebrow>Le mag · Recettes & condiments</SectionEyebrow>
        <h1
          style={{
            fontSize: mobile ? 56 : 120,
            lineHeight: 0.92,
            textTransform: 'uppercase',
            fontWeight: 700,
            marginTop: 12,
            letterSpacing: '-0.015em',
            fontFamily: 'var(--cf-serif)',
            color: '#1F1A14',
            margin: 0,
          }}
        >
          Recettes
          <br />
          de <span style={{ color: '#8B1A1A', fontStyle: 'italic' }}>feu</span>.
        </h1>
        <p
          style={{
            marginTop: 16,
            fontSize: mobile ? 14 : 16,
            color: '#3A3025',
            maxWidth: 600,
            lineHeight: 1.5,
          }}
        >
          Rubs Magic Dust, mops vinaigrés, glazes asiatiques, marinades fortes. Toutes les recettes
          sont reliées au calculateur — un clic et tu cuisines.
        </p>
      </section>

      {/* Filtres */}
      <section
        style={{ padding: mobile ? '0 20px 16px' : '0 64px 24px', maxWidth: 1400, margin: '0 auto' }}
      >
        <div
          className="cf-noscroll"
          style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}
        >
          {TYPE_OPTIONS.map((t) => (
            <Pill key={t.id} active={type === t.id} onClick={() => { setType(t.id); setVisible(PAGE_SIZE) }}>
              {t.label}
              {typeCounts[t.id] != null && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 9,
                    opacity: 0.7,
                  }}
                >
                  {typeCounts[t.id]}
                </span>
              )}
            </Pill>
          ))}
        </div>
        {!mobile && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {MEAT_OPTIONS.map((m) => (
              <Pill key={m.id} active={meat === m.id} onClick={() => { setMeat(m.id); setVisible(PAGE_SIZE) }}>
                {m.label}
              </Pill>
            ))}
          </div>
        )}
      </section>

      {/* État vide / chargement */}
      {recipes === null && (
        <section style={{ padding: '64px 20px', textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 16px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B1A1A, #E8A53C)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'cfEmberPulse 2s ease-in-out infinite',
            }}
          >
            <span style={{ fontSize: 22 }}>🔥</span>
          </div>
          <p className="cf-eyebrow" style={{ color: '#6E6356' }}>
            Chargement des recettes…
          </p>
        </section>
      )}

      {recipes && filtered.length === 0 && (
        <section
          style={{
            padding: mobile ? '32px 20px 64px' : '32px 64px 96px',
            maxWidth: 1400,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              padding: 48,
              border: '1.5px dashed rgba(31,26,20,0.2)',
              background: '#FAF6EE',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--cf-serif)',
                fontSize: 32,
                fontWeight: 600,
                textTransform: 'uppercase',
                color: '#1F1A14',
                margin: 0,
              }}
            >
              Aucune recette
            </h3>
            <p style={{ marginTop: 12, fontSize: 14, color: '#6E6356' }}>
              Pas de recette dans cette combinaison de filtres. Élargis ta recherche.
            </p>
            <div style={{ marginTop: 20, display: 'inline-flex' }}>
              <FireButton size="md" type="ghost" onClick={() => { setType('all'); setMeat('all') }}>
                Réinitialiser les filtres
              </FireButton>
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {featured && (
        <section
          style={{ padding: mobile ? '0 20px 32px' : '0 64px 32px', maxWidth: 1400, margin: '0 auto' }}
        >
          <FeaturedRecipe
            mobile={mobile}
            image={featured.cover_url || fallbackImage(featured.type, images)}
            eyebrow={`${TYPE_OPTIONS.find((t) => t.id === featured.type)?.label || 'Recette'}${featured.origin ? ` · ${featured.origin}` : ''}`}
            title={featured.title}
            dek={featured.summary || ''}
            meta={[
              featured.prep_time ? `${featured.prep_time} de prep` : null,
              featured.difficulty ? DIFFICULTY_LABELS[featured.difficulty] || featured.difficulty : null,
              featured.tags?.[0] || null,
            ].filter(Boolean)}
            onClick={() => navigate(`/recettes/${featured.slug}`)}
          />
        </section>
      )}

      {/* Grille principale (premiers 4 puis sponsor puis le reste) */}
      {grid.length > 0 && (
        <section
          style={{ padding: mobile ? '0 20px 24px' : '0 64px 32px', maxWidth: 1400, margin: '0 auto' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: mobile ? 12 : 20,
            }}
          >
            {grid.slice(0, 4).map((r) => (
              <RecipeCard
                key={r.id}
                compact
                image={r.cover_url || fallbackImage(r.type, images)}
                category={`${TYPE_OPTIONS.find((t) => t.id === r.type)?.label || 'Recette'}${r.origin ? ` · ${r.origin}` : ''}`}
                title={r.title}
                time={r.prep_time || '—'}
                difficulty={r.difficulty ? DIFFICULTY_LABELS[r.difficulty] || r.difficulty : '—'}
                onClick={() => navigate(`/recettes/${r.slug}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Sponsor intercalé */}
      {filtered.length > 4 && (
        <section
          style={{ padding: mobile ? '0 20px 24px' : '0 64px 32px', maxWidth: 1400, margin: '0 auto' }}
        >
          <SponsorSlot
            mobile={mobile}
            label="Cette grille vous est offerte par"
            name="Big Green Egg · Carbon Steel"
          />
        </section>
      )}

      {/* Suite de la grille */}
      {grid.length > 4 && (
        <section
          style={{
            padding: mobile ? '0 20px 48px' : '0 64px 64px',
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: mobile ? 12 : 20,
            }}
          >
            {grid.slice(4).map((r) => (
              <RecipeCard
                key={r.id}
                compact
                image={r.cover_url || fallbackImage(r.type, images)}
                category={`${TYPE_OPTIONS.find((t) => t.id === r.type)?.label || 'Recette'}${r.origin ? ` · ${r.origin}` : ''}`}
                title={r.title}
                time={r.prep_time || '—'}
                difficulty={r.difficulty ? DIFFICULTY_LABELS[r.difficulty] || r.difficulty : '—'}
                onClick={() => navigate(`/recettes/${r.slug}`)}
              />
            ))}
          </div>

          {canLoadMore && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <FireButton size="md" type="ghost" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Charger plus de recettes ({filtered.length - visible} restantes)
              </FireButton>
            </div>
          )}
        </section>
      )}

      <NewsletterBlock mobile={mobile} />
      <CFFooter mobile={mobile} />
    </div>
  )
}
