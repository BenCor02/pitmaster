/**
 * HomePage — Landing Charbon & Flamme v3 (light mode pitmaster)
 *
 * Recrée la landing du brief design (hero photo + fumée, méthodes,
 * mini-calc interactif, "comment ça marche", articles, newsletter).
 *
 * Données : la grille articles utilise les guides/recettes Supabase
 * publiés s'ils sont disponibles, sinon contenu démo issu du brief.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { updateMeta } from '../lib/seo.js'
import { useSiteSettings } from '../hooks/useSiteSettings.jsx'
import { useRecipeImages, imageForProfile } from '../lib/recipeImages.js'
import { adminCms } from '../lib/cms.js'
import {
  FireButton,
  SectionEyebrow,
  SmokeBackdrop,
  EmberGlow,
  Pill,
  CutIcon,
} from '../components/cf/Primitives.jsx'
import { CFHeader, CFFooter, NewsletterBlock, SponsorSlot } from '../components/cf/Chrome.jsx'
import { RecipeCard, FeaturedRecipe, MethodCard, StepCard } from '../components/cf/Cards.jsx'

// Détecte l'écran mobile (≤ 767px) en se rebranchant sur les changements
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

// ───────────────────────────────────────────────
// Hero
// ───────────────────────────────────────────────
function LandingHero({ mobile, images }) {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: mobile ? 580 : 720,
        overflow: 'hidden',
        background: '#14100B',
        color: '#F5EFE0',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(to bottom, rgba(20,16,11,0.55) 0%, rgba(20,16,11,0.4) 40%, rgba(20,16,11,0.92) 100%), url(${images.fire})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <SmokeBackdrop intensity={0.7} dark={true} />
      <EmberGlow count={mobile ? 14 : 24} />
      <div
        style={{
          position: 'relative',
          padding: mobile ? '40px 20px 60px' : '88px 64px 96px',
          maxWidth: mobile ? '100%' : 1280,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: mobile ? 20 : 28,
          minHeight: mobile ? 580 : 720,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 32, height: 1.5, background: '#E8A53C' }} />
          <span className="cf-eyebrow" style={{ color: '#E8A53C' }}>
            Le calculateur BBQ français · Édition 2026
          </span>
        </div>
        <h1
          style={{
            fontSize: mobile ? 56 : 128,
            lineHeight: 0.92,
            fontWeight: 700,
            letterSpacing: '-0.015em',
            textTransform: 'uppercase',
            color: '#F5EFE0',
            textShadow: '0 2px 30px rgba(20,16,11,0.6)',
            maxWidth: mobile ? '100%' : 1100,
            fontFamily: 'var(--cf-serif)',
            margin: 0,
          }}
        >
          Ne rate plus
          <br />
          jamais une{' '}
          <span style={{ color: '#E8A53C', fontStyle: 'italic', fontWeight: 600 }}>cuisson</span>.
        </h1>
        <p
          style={{
            fontSize: mobile ? 16 : 20,
            lineHeight: 1.5,
            color: '#D9CDB5',
            maxWidth: mobile ? '100%' : 560,
            margin: 0,
          }}
        >
          Le calculateur de cuisson BBQ qui pense comme un pitmaster. Plus le magazine pour les vrais
          amateurs de feu, de fumée, et de viande bien cuite.
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: mobile ? 'column' : 'row',
            gap: 12,
            alignItems: mobile ? 'stretch' : 'center',
            marginTop: mobile ? 8 : 16,
          }}
        >
          <Link to="/calculateur" style={{ textDecoration: 'none' }}>
            <FireButton size="lg" type="primary" fullWidth={mobile} icon={<span style={{ fontSize: 18 }}>→</span>}>
              Lance le calculateur
            </FireButton>
          </Link>
          <Link to="/guides" style={{ textDecoration: 'none' }}>
            <FireButton
              size="lg"
              type="ghost"
              fullWidth={mobile}
              style={{ color: '#F5EFE0', borderColor: 'rgba(245,239,224,0.4)' }}
            >
              Découvrir les guides
            </FireButton>
          </Link>
        </div>
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: mobile ? 'column' : 'row',
            gap: mobile ? 12 : 32,
            paddingTop: mobile ? 24 : 40,
            borderTop: '1px solid rgba(245,239,224,0.15)',
            fontFamily: 'var(--cf-mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            color: '#B8AC97',
            textTransform: 'uppercase',
          }}
        >
          <span><span style={{ color: '#E8A53C' }}>9</span> cuts de viande</span>
          <span><span style={{ color: '#E8A53C' }}>3</span> méthodes pitmaster</span>
          <span><span style={{ color: '#E8A53C' }}>4 200+</span> abonnés newsletter</span>
        </div>
      </div>
    </section>
  )
}

// ───────────────────────────────────────────────
// Méthodes pitmaster
// ───────────────────────────────────────────────
function MethodsSection({ mobile, images }) {
  return (
    <section
      style={{ padding: mobile ? '48px 20px' : '96px 64px', maxWidth: 1400, margin: '0 auto' }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: mobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: mobile ? 'flex-start' : 'flex-end',
          gap: 16,
          marginBottom: mobile ? 28 : 56,
        }}
      >
        <div>
          <SectionEyebrow>01 · Les méthodes</SectionEyebrow>
          <h2
            style={{
              fontSize: mobile ? 40 : 72,
              lineHeight: 0.95,
              textTransform: 'uppercase',
              fontWeight: 700,
              marginTop: 12,
              fontFamily: 'var(--cf-serif)',
              color: '#1F1A14',
            }}
          >
            Trois écoles.
            <br />
            <span style={{ color: '#8B1A1A', fontStyle: 'italic' }}>Une seule</span> obsession.
          </h2>
        </div>
        <p style={{ fontSize: 14, color: '#3A3025', maxWidth: 320, lineHeight: 1.6, margin: 0 }}>
          Low & slow pour la patience. Hot & fast pour le geste. Reverse sear pour le meilleur des
          deux. Choisis ton camp — ou alterne, on ne juge pas.
        </p>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)',
          gap: mobile ? 16 : 20,
        }}
      >
        <MethodCard
          mobile={mobile}
          method="low"
          title="Low & Slow"
          subtitle="La fumée prend son temps. Le collagène fond. Le résultat fond aussi."
          range="95–135°C · 6–14h"
          image={images.smoke}
        />
        <MethodCard
          mobile={mobile}
          method="hot"
          title="Hot & Fast"
          subtitle="Feu vif, croûte épaisse, jus retenu. Le geste qui marque la viande."
          range="220–280°C · 5–25 min"
          image={images.fire}
        />
        <MethodCard
          mobile={mobile}
          method="reverse"
          title="Reverse Sear"
          subtitle="Cuisson douce d'abord, saisie agressive ensuite. La précision américaine."
          range="110°C → 280°C · 1–3h"
          image={images.steak}
        />
      </div>
    </section>
  )
}

// ───────────────────────────────────────────────
// Mini calculateur (démo en direct)
// ───────────────────────────────────────────────
function MiniCalcSection({ mobile }) {
  const [cut, setCut] = useState('picanha')
  const [method, setMethod] = useState('reverse')
  const [weight, setWeight] = useState(1.2)

  const cuts = [
    { id: 'picanha', name: 'Picanha', cat: 'Bœuf' },
    { id: 'brisket', name: 'Brisket', cat: 'Bœuf' },
    { id: 'ribs', name: 'Travers', cat: 'Porc' },
    { id: 'poulet', name: 'Poulet entier', cat: 'Volaille' },
  ]

  const baseMinPerKg = { low: 240, hot: 8, reverse: 75 }[method]
  const totalMin = Math.round(weight * baseMinPerKg)
  const tempCible = { low: 95, hot: 240, reverse: 110 }[method]

  return (
    <section
      style={{
        padding: mobile ? '48px 20px' : '96px 64px',
        background: '#E5DBC6',
        borderTop: '2px solid #1F1A14',
        borderBottom: '2px solid #1F1A14',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: mobile ? 28 : 48 }}>
          <div style={{ display: 'inline-flex' }}>
            <SectionEyebrow>02 · Démo en direct</SectionEyebrow>
          </div>
          <h2
            style={{
              fontSize: mobile ? 40 : 64,
              lineHeight: 0.95,
              textTransform: 'uppercase',
              fontWeight: 700,
              marginTop: 12,
              fontFamily: 'var(--cf-serif)',
              color: '#1F1A14',
            }}
          >
            Teste-le. <span style={{ color: '#8B1A1A', fontStyle: 'italic' }}>Maintenant.</span>
          </h2>
          <p
            style={{
              marginTop: 12,
              fontSize: 14,
              color: '#3A3025',
              maxWidth: 480,
              margin: '12px auto 0',
              lineHeight: 1.5,
            }}
          >
            Trois clics, un résultat. La version complète a 9+ cuts, des paramètres avancés, un
            timer et des notifs.
          </p>
        </div>
        <div
          style={{
            background: '#FAF6EE',
            border: '2px solid #1F1A14',
            padding: mobile ? 16 : 32,
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : '1.2fr 1fr',
            gap: mobile ? 20 : 32,
            boxShadow: '8px 8px 0 #8B1A1A',
          }}
        >
          {/* Inputs */}
          <div>
            <div className="cf-eyebrow" style={{ marginBottom: 12 }}>① Choisis le cut</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 24 }}>
              {cuts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCut(c.id)}
                  style={{
                    padding: '12px',
                    border: cut === c.id ? '2px solid #8B1A1A' : '1px solid rgba(31,26,20,0.2)',
                    background: cut === c.id ? '#FBE9E0' : '#FAF6EE',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <CutIcon cut={c.id} size={36} />
                  <div>
                    <div className="cf-eyebrow" style={{ fontSize: 9 }}>{c.cat}</div>
                    <div
                      style={{
                        fontFamily: 'var(--cf-serif)',
                        fontSize: 16,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: '#1F1A14',
                      }}
                    >
                      {c.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="cf-eyebrow" style={{ marginBottom: 12 }}>② Méthode</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {[
                { id: 'low', l: 'Low & Slow' },
                { id: 'hot', l: 'Hot & Fast' },
                { id: 'reverse', l: 'Reverse Sear' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  style={{
                    padding: '10px 14px',
                    border: method === m.id ? '2px solid #8B1A1A' : '1px solid rgba(31,26,20,0.2)',
                    background: method === m.id ? '#8B1A1A' : 'transparent',
                    color: method === m.id ? '#F5EFE0' : '#1F1A14',
                    fontFamily: 'var(--cf-serif)',
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {m.l}
                </button>
              ))}
            </div>
            <div className="cf-eyebrow" style={{ marginBottom: 12 }}>③ Poids · {weight.toFixed(1)} kg</div>
            <input
              type="range"
              min="0.4"
              max="6"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#8B1A1A' }}
            />
          </div>

          {/* Output */}
          <div
            style={{
              background: '#1F1A14',
              color: '#F5EFE0',
              padding: mobile ? 20 : 28,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <EmberGlow count={6} />
            <div className="cf-eyebrow" style={{ color: '#E8A53C', marginBottom: 12, position: 'relative' }}>
              Résultat estimé
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--cf-serif)',
                      fontSize: 56,
                      fontWeight: 700,
                      lineHeight: 1,
                      color: '#E8A53C',
                    }}
                  >
                    {Math.floor(totalMin / 60)}
                    <span style={{ fontSize: 24, color: '#B8AC97' }}>h</span>
                    {(totalMin % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="cf-eyebrow" style={{ color: '#B8AC97', marginTop: 4 }}>Durée totale</div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--cf-serif)',
                      fontSize: 56,
                      fontWeight: 700,
                      lineHeight: 1,
                      color: '#E8A53C',
                    }}
                  >
                    {tempCible}
                    <span style={{ fontSize: 24, color: '#B8AC97' }}>°C</span>
                  </div>
                  <div className="cf-eyebrow" style={{ color: '#B8AC97', marginTop: 4 }}>Temp. cible</div>
                </div>
              </div>
              <div style={{ height: 1, background: 'rgba(245,239,224,0.15)', margin: '16px 0' }} />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontFamily: 'var(--cf-mono)',
                  fontSize: 12,
                  color: '#D9CDB5',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Préchauffe</span>
                  <span>20 min</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cuisson</span>
                  <span>
                    {Math.floor((totalMin * 0.85) / 60)}h{(Math.round(totalMin * 0.85) % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Repos</span>
                  <span>{Math.round(totalMin * 0.15)} min</span>
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Link to="/calculateur" style={{ textDecoration: 'none', display: 'block' }}>
                  <FireButton size="md" type="primary" fullWidth icon={<span>→</span>}>
                    Calculateur complet
                  </FireButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ───────────────────────────────────────────────
// Comment ça marche (3 étapes)
// ───────────────────────────────────────────────
function HowItWorksSection({ mobile }) {
  return (
    <section style={{ padding: mobile ? '48px 20px' : '96px 64px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: mobile ? 28 : 56 }}>
        <SectionEyebrow>03 · Comment ça marche</SectionEyebrow>
        <h2
          style={{
            fontSize: mobile ? 40 : 64,
            lineHeight: 0.95,
            textTransform: 'uppercase',
            fontWeight: 700,
            marginTop: 12,
            maxWidth: 800,
            fontFamily: 'var(--cf-serif)',
            color: '#1F1A14',
          }}
        >
          Trois étapes,
          <br />
          un <span style={{ color: '#8B1A1A', fontStyle: 'italic' }}>résultat</span>.
        </h2>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)',
          gap: mobile ? 32 : 48,
        }}
      >
        <StepCard
          num="1"
          badge="◉"
          title="Choisis ta pièce"
          body="9+ cuts disponibles, du brisket de 5kg à la côte de bœuf en passant par la picanha brésilienne. Photos et fiches techniques pour chacun."
        />
        <StepCard
          num="2"
          badge="≋"
          title="Pose tes paramètres"
          body="Méthode, poids, cuisson désirée, paramètres avancés (température extérieure, type de bois, repos). On adapte le calcul à ta réalité."
        />
        <StepCard
          num="3"
          badge="✦"
          title="Cuis avec confiance"
          body="Timer intégré, alertes aux étapes clés, checklist pitmaster. Sauvegarde, partage avec les copains, exporte en PDF pour la cuisine."
        />
      </div>
    </section>
  )
}

// ───────────────────────────────────────────────
// Articles + recettes (utilise la DB si dispo, sinon mockup)
// ───────────────────────────────────────────────
function ArticlesGridSection({ mobile, images }) {
  const navigate = useNavigate()
  const [guides, setGuides] = useState([])
  const [recipes, setRecipes] = useState([])

  useEffect(() => {
    let alive = true
    Promise.all([
      adminCms.list('guides').catch(() => []),
      adminCms.list('recipes').catch(() => []),
    ]).then(([g, r]) => {
      if (!alive) return
      setGuides((g || []).filter((x) => x.status === 'published'))
      setRecipes((r || []).filter((x) => x.status === 'published'))
    })
    return () => { alive = false }
  }, [])

  const featured = guides[0] || recipes[0] || null
  const small = useMemo(() => {
    const all = [...recipes, ...guides].filter((x) => x !== featured)
    return all.slice(0, 4)
  }, [guides, recipes, featured])

  // Fallback contenu démo si la DB est vide
  const useMock = !featured

  return (
    <section style={{ padding: mobile ? '48px 20px' : '96px 64px', maxWidth: 1400, margin: '0 auto' }}>
      <div
        style={{
          marginBottom: mobile ? 28 : 56,
          display: 'flex',
          flexDirection: mobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: mobile ? 'flex-start' : 'flex-end',
          gap: 16,
        }}
      >
        <div>
          <SectionEyebrow>04 · Le magazine</SectionEyebrow>
          <h2
            style={{
              fontSize: mobile ? 40 : 64,
              lineHeight: 0.95,
              textTransform: 'uppercase',
              fontWeight: 700,
              marginTop: 12,
              fontFamily: 'var(--cf-serif)',
              color: '#1F1A14',
            }}
          >
            Lecture
            <br />
            de braise
          </h2>
        </div>
        <Link
          to="/guides"
          style={{
            fontFamily: 'var(--cf-mono)',
            fontSize: 12,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#8B1A1A',
            borderBottom: '1px solid #8B1A1A',
            paddingBottom: 2,
            textDecoration: 'none',
          }}
        >
          Tout le mag →
        </Link>
      </div>

      <div style={{ marginBottom: mobile ? 24 : 40 }}>
        {useMock ? (
          <FeaturedRecipe
            mobile={mobile}
            image={images.brisket}
            eyebrow="Reportage · Texas"
            title="J'ai dormi dehors avec un brisket"
            dek="14 heures de fumée, 3 réveils nocturnes, et la conviction que le low & slow se mérite. Récit d'une nuit blanche à 110°C."
            meta={['8 min de lecture', 'Par Mathieu R.', '15 mars']}
          />
        ) : (
          <FeaturedRecipe
            mobile={mobile}
            image={featured.image_url || images.brisket}
            eyebrow={featured.category || 'Guide'}
            title={featured.title}
            dek={featured.summary || featured.description || ''}
            meta={[featured.read_time || '—', featured.author || 'Charbon & Flamme'].filter(Boolean)}
            onClick={() => navigate(`/guides/${featured.slug}`)}
          />
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: mobile ? 12 : 20,
        }}
      >
        {useMock
          ? [
              { image: images.picanha, category: 'Recette · Bœuf', title: 'Picanha au sel gros', time: '45 min', difficulty: 'Facile' },
              { image: images.ribs, category: 'Recette · Porc', title: 'Travers façon Memphis', time: '5h', difficulty: 'Inter.' },
              { image: images.poulet, category: 'Article', title: 'Le poulet entier, et tu n\'y reviendras plus', time: '6 min', difficulty: '—', sponsor: true },
              { image: images.rub, category: 'Fiche rub', title: 'Magic Dust : la base américaine', time: '—', difficulty: '—' },
            ].map((r, i) => <RecipeCard key={i} compact {...r} />)
          : small.map((r) => (
              <RecipeCard
                key={r.id}
                compact
                image={r.image_url || images.fire}
                category={r.category || (r.cooking_method ? 'Recette' : 'Guide')}
                title={r.title}
                time={r.read_time || r.cook_time || '—'}
                difficulty={r.difficulty || '—'}
                onClick={() =>
                  navigate(r.slug ? (r.cooking_method ? `/recettes/${r.slug}` : `/guides/${r.slug}`) : '/guides')
                }
              />
            ))}
      </div>

      <div style={{ marginTop: mobile ? 24 : 40 }}>
        <SponsorSlot big mobile={mobile} />
      </div>
    </section>
  )
}

// ───────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────
export default function HomePage() {
  const mobile = useMobile()
  const images = useRecipeImages()
  const { isModuleEnabled } = useSiteSettings()

  useEffect(() => {
    updateMeta({
      title: 'Charbon & Flamme — Calculateur BBQ Pitmaster',
      description:
        'Le calculateur de cuisson BBQ qui pense comme un pitmaster. Brisket, pulled pork, ribs, reverse sear : ne rate plus jamais une cuisson.',
      canonical: 'https://charbonetflamme.fr/',
    })
  }, [])

  return (
    <div className="cf-root cf-paper-bg" style={{ width: '100%', minHeight: '100vh' }}>
      <CFHeader dark={false} />
      <LandingHero mobile={mobile} images={images} />
      <MethodsSection mobile={mobile} images={images} />
      <MiniCalcSection mobile={mobile} />
      <HowItWorksSection mobile={mobile} />
      {isModuleEnabled('guides') || isModuleEnabled('recipes') ? (
        <ArticlesGridSection mobile={mobile} images={images} />
      ) : null}
      <NewsletterBlock mobile={mobile} />
      <CFFooter mobile={mobile} />
    </div>
  )
}
