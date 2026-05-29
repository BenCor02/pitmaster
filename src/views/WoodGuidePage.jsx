'use client'

/**
 * CHARBON & FLAMME — Guide des Essences de Bois
 * Page interactive avec filtrage par intensité, cartes expansibles,
 * section bois toxiques avec avertissement.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { updateMeta } from '../lib/seo.js'
import { fetchWoods } from '../lib/woods.js'
import { CFHeader, CFFooter, NewsletterBlock } from '../components/cf/Chrome.jsx'
import { SectionEyebrow, Pill } from '../components/cf/Primitives.jsx'

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

/* ── Intensity config — semantic colors kept, adapted to light mode ── */
const INTENSITY_CONFIG = {
  leger: { label: 'Léger', color: '#16a34a', bg: 'rgba(34,197,94,0.07)', border: 'rgba(34,197,94,0.25)', dot: '#22c55e' },
  moyen: { label: 'Moyen', color: '#d97706', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.25)', dot: '#f59e0b' },
  fort:  { label: 'Fort',  color: '#dc2626', bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.25)', dot: '#ef4444' },
}

/* ── Availability labels ── */
const AVAIL_LABELS = {
  excellente: { text: 'Excellente', color: '#16a34a' },
  bonne: { text: 'Bonne', color: '#16a34a' },
  moyenne: { text: 'Moyenne', color: '#d97706' },
  limitee: { text: 'Limitée', color: '#dc2626' },
}

const cardBg = '#F5EFE0'
const borderColor = 'rgba(31,26,20,0.15)'

export default function WoodGuidePage() {
  const mobile = useMobile()
  const [woods, setWoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    updateMeta({
      title: 'Guide des bois de fumage BBQ — Chêne, pommier, hickory | Charbon & Flamme',
      description: 'Quel bois utiliser pour fumer ? Guide complet des essences : chêne, hickory, pommier, cerisier, mesquite. Intensité, accords viandes et bois toxiques à éviter.',
      canonical: 'https://charbonetflamme.fr/bois',
    })
  }, [])

  useEffect(() => {
    fetchWoods().then(data => { setWoods(data); setLoading(false) })
  }, [])

  /* Séparer bois de fumage et bois toxiques */
  const smokingWoods = useMemo(() => woods.filter(w => !w.is_toxic), [woods])
  const toxicWoods = useMemo(() => woods.filter(w => w.is_toxic), [woods])

  /* Filtrage */
  const filtered = useMemo(() => {
    let list = smokingWoods
    if (filter !== 'all') list = list.filter(w => w.intensity === filter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.flavor_profile.toLowerCase().includes(q) ||
        w.best_meats.some(m => m.toLowerCase().includes(q))
      )
    }
    return list
  }, [smokingWoods, filter, searchQuery])

  /* Compteurs par intensité */
  const counts = useMemo(() => {
    const c = { all: smokingWoods.length, leger: 0, moyen: 0, fort: 0 }
    smokingWoods.forEach(w => { if (c[w.intensity] !== undefined) c[w.intensity]++ })
    return c
  }, [smokingWoods])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#6E6356' }}>
          <svg style={{ animation: 'spin 1s linear infinite', width: 20, height: 20 }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
          </svg>
          Chargement des essences...
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14' }}>
      <CFHeader />

      {/* ── Hero with image ── */}
      <div style={{ position: 'relative', overflow: 'hidden', height: mobile ? 200 : 280 }}>
        <img
          src="https://images.unsplash.com/photo-1587049016823-69ef9d68f4e0?w=1400&h=400&fit=crop&q=80"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(31,26,20,0.75) 0%, rgba(31,26,20,0.45) 60%, rgba(31,26,20,0.15) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: mobile ? '0 20px' : '0 64px' }}>
          <SectionEyebrow accent="#E8A53C">Guide du fumage</SectionEyebrow>
          <h1 style={{
            fontFamily: 'var(--cf-serif)',
            fontSize: mobile ? 30 : 42,
            fontWeight: 700,
            color: '#F5EFE0',
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
            margin: '12px 0 8px',
          }}>
            Essences de Bois
          </h1>
          <p style={{ color: 'rgba(245,239,224,0.75)', fontSize: mobile ? 13 : 15, maxWidth: 500, lineHeight: 1.6 }}>
            Chaque bois donne un caractère unique à ta viande. Intensité, profil aromatique, meilleurs accords.
          </p>

          {/* Légende intensité */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 16 }}>
            {Object.entries(INTENSITY_CONFIG).map(([key, cfg]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot }} />
                <span style={{ fontSize: 12, color: 'rgba(245,239,224,0.8)', fontFamily: 'var(--cf-sans)', fontWeight: 500 }}>{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: mobile ? '32px 16px 48px' : '48px 48px' }}>

        {/* ── Filtres ── */}
        <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 12, marginBottom: 28 }}>
          {/* Boutons intensité */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'Toutes' },
              { key: 'leger', label: 'Léger' },
              { key: 'moyen', label: 'Moyen' },
              { key: 'fort', label: 'Fort' },
            ].map(({ key, label }) => (
              <Pill key={key} active={filter === key} onClick={() => setFilter(key)}>
                {label} <span style={{ opacity: 0.6, marginLeft: 3 }}>{counts[key]}</span>
              </Pill>
            ))}
          </div>

          {/* Recherche */}
          <div style={{ position: 'relative', marginLeft: mobile ? 0 : 'auto' }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#6E6356' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Chercher une essence, viande..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: mobile ? '100%' : 256,
                paddingLeft: 38, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
                background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2,
                fontSize: 13, color: '#1F1A14', fontFamily: 'var(--cf-sans)',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* ── Grille de bois ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#6E6356' }}>
            <p style={{ fontSize: 17 }}>Aucune essence trouvée</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Essaie un autre filtre ou terme de recherche</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(wood => (
              <WoodCard
                key={wood.id}
                wood={wood}
                expanded={expandedId === wood.id}
                onToggle={() => setExpandedId(expandedId === wood.id ? null : wood.id)}
                mobile={mobile}
              />
            ))}
          </div>
        )}

        {/* ── Section bois toxiques ── */}
        {toxicWoods.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 4, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--cf-serif)', fontSize: 20, fontWeight: 700, color: '#dc2626' }}>Bois à éviter absolument</h2>
                <p style={{ fontSize: 12, color: '#6E6356', marginTop: 2 }}>Toxiques, dangereux ou nocifs pour la santé</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
              {toxicWoods.map(wood => (
                <div
                  key={wood.id}
                  style={{
                    padding: 16, borderRadius: 4,
                    background: 'rgba(220,38,38,0.04)',
                    border: '1px solid rgba(220,38,38,0.18)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{wood.emoji || '☠️'}</span>
                    <div>
                      <h3 style={{ fontWeight: 700, color: '#dc2626', fontSize: 14, fontFamily: 'var(--cf-serif)' }}>{wood.name}</h3>
                      {wood.scientific_name && (
                        <p style={{ fontSize: 10, color: '#6E6356', fontStyle: 'italic', marginTop: 1 }}>{wood.scientific_name}</p>
                      )}
                      <p style={{ fontSize: 12, color: '#6E6356', marginTop: 6, lineHeight: 1.55 }}>{wood.toxic_reason || wood.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Note pédagogique ── */}
        <div style={{
          marginTop: 48,
          padding: mobile ? 20 : 28,
          borderRadius: 4,
          background: 'rgba(232,165,60,0.06)',
          border: '1px solid rgba(232,165,60,0.20)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>💡</span>
            <div>
              <h3 style={{ fontWeight: 700, color: '#1F1A14', fontSize: 14, marginBottom: 8, fontFamily: 'var(--cf-serif)' }}>Le mythe du trempage</h3>
              <p style={{ fontSize: 12, color: '#6E6356', lineHeight: 1.65 }}>
                Contrairement à une idée reçue, tremper les copeaux ne prolonge pas la fumée — ça retarde juste le moment
                où ils commencent à fumer. L'eau ne pénètre que la surface du bois. Pour un fumage constant,
                mieux vaut utiliser des chunks secs et contrôler la ventilation.
              </p>
              <p style={{ fontSize: 10, color: '#6E6356', marginTop: 8, fontFamily: 'var(--cf-mono)' }}>
                Source : Meathead Goldwyn — AmazingRibs.com
              </p>
            </div>
          </div>
        </div>

      </main>

      <NewsletterBlock mobile={mobile} />
      <CFFooter mobile={mobile} />
    </div>
  )
}

/* ══════════════════════════════════════════════
   WoodCard — Carte expansible pour chaque bois
   ══════════════════════════════════════════════ */

function WoodCard({ wood, expanded, onToggle, mobile }) {
  const cfg = INTENSITY_CONFIG[wood.intensity] || INTENSITY_CONFIG.moyen
  const avail = wood.availability_eu ? AVAIL_LABELS[wood.availability_eu] : null

  return (
    <div
      style={{
        borderRadius: 4,
        border: `1.5px solid ${expanded ? cfg.border : 'rgba(31,26,20,0.15)'}`,
        background: expanded ? cfg.bg : '#F5EFE0',
        overflow: 'hidden',
        transition: 'all .2s',
      }}
    >
      {/* En-tête cliquable */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px', textAlign: 'left', background: 'none', border: 'none',
          cursor: 'pointer', color: '#1F1A14',
        }}
      >
        <span style={{ fontSize: 22, flexShrink: 0 }}>{wood.emoji || '🪵'}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontWeight: 700, color: '#1F1A14', fontSize: 14, fontFamily: 'var(--cf-serif)' }}>{wood.name}</h3>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: cfg.color, fontFamily: 'var(--cf-mono)' }}>
              {cfg.label}
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#6E6356', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wood.flavor_profile}</p>
        </div>

        {/* Best meats preview */}
        {!mobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {wood.best_meats.slice(0, 3).map((meat, i) => (
              <span key={i} style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 2,
                background: '#FAF6EE', color: '#6E6356',
                border: '1px solid rgba(31,26,20,0.15)',
                fontFamily: 'var(--cf-mono)',
              }}>
                {meat}
              </span>
            ))}
            {wood.best_meats.length > 3 && (
              <span style={{ fontSize: 10, color: '#6E6356' }}>+{wood.best_meats.length - 3}</span>
            )}
          </div>
        )}

        {/* Chevron */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6E6356" strokeWidth="2" strokeLinecap="round"
          style={{ flexShrink: 0, transition: 'transform .2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Contenu expansible */}
      {expanded && (
        <div style={{ padding: '0 18px 20px' }}>
          <div style={{ height: 1, background: 'rgba(31,26,20,0.12)', marginBottom: 16 }} />

          {/* Description */}
          <p style={{ fontSize: 14, color: '#1F1A14', lineHeight: 1.65, marginBottom: 16 }}>{wood.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
            {/* Colonne gauche */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Viandes recommandées */}
              <DetailBlock title="Viandes recommandées" icon="✅">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {wood.best_meats.map((m, i) => (
                    <span key={i} style={{
                      fontSize: 12, padding: '4px 10px', borderRadius: 2,
                      background: 'rgba(22,163,74,0.08)', color: '#16a34a',
                      border: '1px solid rgba(22,163,74,0.20)',
                      fontFamily: 'var(--cf-sans)',
                    }}>
                      {m}
                    </span>
                  ))}
                </div>
              </DetailBlock>

              {/* Viandes à éviter */}
              {wood.avoid_meats.length > 0 && (
                <DetailBlock title="À éviter" icon="⚠️">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {wood.avoid_meats.map((m, i) => (
                      <span key={i} style={{
                        fontSize: 12, padding: '4px 10px', borderRadius: 2,
                        background: 'rgba(220,38,38,0.07)', color: '#dc2626',
                        border: '1px solid rgba(220,38,38,0.20)',
                        fontFamily: 'var(--cf-sans)',
                      }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </DetailBlock>
              )}

              {/* Disponibilité EU */}
              {avail && (
                <DetailBlock title="Disponibilité en Europe" icon="🇪🇺">
                  <span style={{ fontSize: 12, fontWeight: 600, color: avail.color }}>{avail.text}</span>
                </DetailBlock>
              )}
            </div>

            {/* Colonne droite */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Caractéristiques de combustion */}
              {wood.burn_characteristics && (
                <DetailBlock title="Combustion" icon="🔥">
                  <p style={{ fontSize: 12, color: '#6E6356', lineHeight: 1.55 }}>{wood.burn_characteristics}</p>
                </DetailBlock>
              )}

              {/* Origine */}
              {wood.origin && (
                <DetailBlock title="Origine" icon="🌍">
                  <p style={{ fontSize: 12, color: '#6E6356' }}>{wood.origin}</p>
                </DetailBlock>
              )}

              {/* Nom scientifique */}
              {wood.scientific_name && (
                <DetailBlock title="Nom scientifique" icon="🔬">
                  <p style={{ fontSize: 12, color: '#6E6356', fontStyle: 'italic' }}>{wood.scientific_name}</p>
                </DetailBlock>
              )}
            </div>
          </div>

          {/* Tips du pitmaster */}
          {wood.pitmaster_tips && (
            <div style={{ marginTop: 16, padding: 14, borderRadius: 4, background: 'rgba(139,26,26,0.06)', border: '1px solid rgba(139,26,26,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>🎯</span>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--cf-mono)', marginBottom: 4 }}>Tip Pitmaster</p>
                  <p style={{ fontSize: 12, color: '#1F1A14', lineHeight: 1.55 }}>{wood.pitmaster_tips}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes de sécurité */}
          {wood.safety_notes && (
            <div style={{ marginTop: 10, padding: 12, borderRadius: 4, background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.18)' }}>
              <p style={{ fontSize: 10, color: '#d97706', fontWeight: 500 }}>⚠️ {wood.safety_notes}</p>
            </div>
          )}

          {/* Source */}
          {wood.source && (
            <p style={{ marginTop: 12, fontSize: 10, color: '#6E6356', fontFamily: 'var(--cf-mono)' }}>
              Source : {wood.source}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Detail block sub-component ── */
function DetailBlock({ title, icon, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 12 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--cf-mono)' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}
