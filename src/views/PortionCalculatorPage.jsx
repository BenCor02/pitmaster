'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { updateMeta } from '../lib/seo.js'
import { CFHeader, CFFooter, NewsletterBlock } from '../components/cf/Chrome.jsx'
import { FireButton, SectionEyebrow, Pill } from '../components/cf/Primitives.jsx'

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

/**
 * Données de rendement par viande.
 * raw_kg_per_person = kg de viande CRUE nécessaire par personne (portion standard ~200-250g cuit).
 * Le rendement tient compte de la perte à la cuisson (eau, gras fondu, shrinkage).
 *
 * Sources :
 * - AmazingRibs.com (Meathead Goldwyn) — rendement ~50% brisket, ~55% pulled pork
 * - Aaron Franklin MasterClass — "Count on losing about half the weight"
 * - Weber Academy / BBQ Québec
 * - Retours terrain r/smoking, r/BBQ
 */
const PORTIONS_DATA = [
  // ── BOEUF ──
  {
    id: 'brisket',
    name: 'Brisket',
    category: 'boeuf',
    icon: '🥩',
    raw_kg_per_person: 0.45,
    yield_pct: 50,
    note: 'Rendement ~50%. Un brisket de 5kg nourrit ~11 personnes. Prévoir un peu plus si tu sers en sandwich.',
    serving_style: 'Tranché ou en sandwich',
    cook_link: '/calculateur?m=brisket',
  },
  {
    id: 'beef_short_ribs',
    name: 'Beef Short Ribs',
    category: 'boeuf',
    icon: '🥩',
    raw_kg_per_person: 0.50,
    yield_pct: 45,
    note: 'Beaucoup d\'os = rendement plus faible (~45%). Compte ~500g brut par personne.',
    serving_style: 'Entier ou effiloché',
    cook_link: '/calculateur?m=beef_short_ribs',
  },
  {
    id: 'chuck_roast',
    name: 'Paleron / Chuck Roast',
    category: 'boeuf',
    icon: '🥩',
    raw_kg_per_person: 0.40,
    yield_pct: 55,
    note: 'Bon rendement (~55%). Parfait pour du pulled beef en mode tacos ou burgers.',
    serving_style: 'Effiloché',
    cook_link: '/calculateur?m=chuck_roast',
  },
  {
    id: 'prime_rib',
    name: 'Côte de bœuf / Prime Rib',
    category: 'boeuf',
    icon: '🥩',
    raw_kg_per_person: 0.40,
    yield_pct: 70,
    note: 'Rendement élevé (~70%) car cuisson douce. Compter 1 côte (~400g) par personne.',
    serving_style: 'Tranché épais',
    cook_link: '/calculateur?m=prime_rib',
  },
  {
    id: 'tomahawk',
    name: 'Tomahawk',
    category: 'boeuf',
    icon: '🥩',
    raw_kg_per_person: 0.50,
    yield_pct: 65,
    note: 'L\'os pèse lourd (~30% du poids). Un tomahawk de 1kg peut nourrir 2 personnes.',
    serving_style: 'Tranché et partagé',
    cook_link: '/calculateur?m=tomahawk',
  },

  // ── PORC ──
  {
    id: 'pulled_pork',
    name: 'Pulled Pork',
    category: 'porc',
    icon: '🐷',
    raw_kg_per_person: 0.45,
    yield_pct: 50,
    note: 'Rendement ~50%. Un pork butt de 4kg donne ~2kg de pulled = ~9 personnes en sandwich.',
    serving_style: 'Effiloché en sandwich ou assiette',
    cook_link: '/calculateur?m=pulled_pork',
  },
  {
    id: 'spare_ribs',
    name: 'Spare Ribs',
    category: 'porc',
    icon: '🍖',
    raw_kg_per_person: 0.50,
    yield_pct: 50,
    note: 'Un rack de spare ribs (~1.5kg) nourrit 2-3 personnes. Beaucoup d\'os.',
    serving_style: 'Par côtes (3-4 côtes/personne)',
    cook_link: '/calculateur?m=spare_ribs',
  },
  {
    id: 'baby_back_ribs',
    name: 'Baby Back Ribs',
    category: 'porc',
    icon: '🍖',
    raw_kg_per_person: 0.45,
    yield_pct: 50,
    note: 'Plus petites que les spare ribs. Un rack (~1kg) nourrit 2 personnes.',
    serving_style: 'Par côtes (4-5 côtes/personne)',
    cook_link: '/calculateur?m=baby_back_ribs',
  },

  // ── VOLAILLE ──
  {
    id: 'whole_chicken',
    name: 'Poulet entier',
    category: 'volaille',
    icon: '🍗',
    raw_kg_per_person: 0.45,
    yield_pct: 65,
    note: 'Un poulet de 1.8kg nourrit 4 personnes. Le fumoir donne une peau incroyable.',
    serving_style: 'Découpé (cuisse, blanc, aile)',
    cook_link: '/calculateur?m=whole_chicken',
  },
]

const CAT_LABELS = { boeuf: 'Boeuf', porc: 'Porc', volaille: 'Volaille' }
const CAT_ORDER = ['boeuf', 'porc', 'volaille']

export default function PortionCalculatorPage() {
  const mobile = useMobile()
  const [guests, setGuests] = useState(8)
  const [appetite, setAppetite] = useState('normal') // light | normal | big
  const [selectedMeat, setSelectedMeat] = useState(null)

  useEffect(() => {
    updateMeta({
      title: 'Calculateur de portions BBQ — Combien de viande par personne | Charbon & Flamme',
      description: 'Combien de brisket, pulled pork ou ribs acheter ? Calcule les portions exactes par personne en tenant compte du rendement de cuisson.',
      canonical: 'https://charbonetflamme.fr/portions',
    })
  }, [])

  const appetiteMultiplier = appetite === 'light' ? 0.75 : appetite === 'big' ? 1.35 : 1

  const byCategory = useMemo(() => {
    const map = {}
    PORTIONS_DATA.forEach(m => {
      if (!map[m.category]) map[m.category] = []
      map[m.category].push(m)
    })
    return map
  }, [])

  const results = useMemo(() => {
    return PORTIONS_DATA.map(m => {
      const rawKg = m.raw_kg_per_person * guests * appetiteMultiplier
      const cookedKg = rawKg * (m.yield_pct / 100)
      return { ...m, rawKg: Math.ceil(rawKg * 10) / 10, cookedKg: Math.round(cookedKg * 10) / 10 }
    })
  }, [guests, appetiteMultiplier])

  const selectedResult = selectedMeat ? results.find(r => r.id === selectedMeat) : null

  const borderColor = 'rgba(31,26,20,0.15)'
  const cardBg = '#F5EFE0'

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14' }}>
      <CFHeader />

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg, rgba(139,26,26,0.05) 0%, transparent 60%)', padding: mobile ? '32px 16px 24px' : '48px 64px 32px' }}>
        <div style={{ maxWidth: 800 }}>
          <SectionEyebrow accent="#8B1A1A">Outil Pitmaster</SectionEyebrow>
          <h1 style={{
            fontFamily: 'var(--cf-serif)',
            fontSize: mobile ? 28 : 38,
            fontWeight: 700,
            color: '#1F1A14',
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
            margin: '12px 0 8px',
          }}>
            Combien de viande acheter ?
          </h1>
          <p style={{ fontSize: mobile ? 14 : 15, color: '#6E6356', maxWidth: 500, lineHeight: 1.65 }}>
            Calcule les quantités exactes de viande crue à acheter selon le nombre d'invités. Rendements réels, pas de la théorie.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: mobile ? '0 16px 48px' : '0 48px 48px' }}>

        {/* ── Controls ── */}
        <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 4, padding: mobile ? 20 : 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: mobile ? 'flex-start' : 'flex-end', gap: 28 }}>

            {/* Guests */}
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontFamily: 'var(--cf-mono)', fontWeight: 600, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>
                Nombre de personnes
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  style={{
                    width: 40, height: 40, borderRadius: 2,
                    background: '#FAF6EE', border: `1px solid ${borderColor}`,
                    color: '#1F1A14', fontSize: 18, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  style={{
                    width: 72, textAlign: 'center', padding: '8px 12px',
                    background: '#FAF6EE', border: `1px solid ${borderColor}`, borderRadius: 2,
                    fontSize: 22, fontWeight: 700, color: '#1F1A14',
                    fontFamily: 'var(--cf-serif)', outline: 'none',
                  }}
                />
                <button
                  onClick={() => setGuests(Math.min(100, guests + 1))}
                  style={{
                    width: 40, height: 40, borderRadius: 2,
                    background: '#FAF6EE', border: `1px solid ${borderColor}`,
                    color: '#1F1A14', fontSize: 18, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  +
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                {[4, 6, 8, 10, 15, 20, 30].map(n => (
                  <Pill key={n} active={guests === n} onClick={() => setGuests(n)}>
                    {n}
                  </Pill>
                ))}
              </div>
            </div>

            {/* Appetite */}
            <div>
              <label style={{ fontSize: 11, fontFamily: 'var(--cf-mono)', fontWeight: 600, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>
                Appétit
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { id: 'light', label: 'Léger', icon: '🥗', desc: '−25%' },
                  { id: 'normal', label: 'Normal', icon: '🍽️', desc: 'Standard' },
                  { id: 'big', label: 'Gros mangeurs', icon: '🤤', desc: '+35%' },
                ].map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAppetite(a.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      padding: '10px 14px', borderRadius: 2, cursor: 'pointer',
                      border: `1.5px solid ${appetite === a.id ? '#8B1A1A' : borderColor}`,
                      background: appetite === a.id ? 'rgba(139,26,26,0.06)' : '#FAF6EE',
                      color: appetite === a.id ? '#8B1A1A' : '#6E6356',
                      transition: 'all .15s',
                    }}
                  >
                    <span style={{ fontSize: 18, marginBottom: 2 }}>{a.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--cf-sans)' }}>{a.label}</span>
                    <span style={{ fontSize: 9, color: '#6E6356', fontFamily: 'var(--cf-mono)', marginTop: 1 }}>{a.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Results grid ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {CAT_ORDER.map(cat => {
            const items = byCategory[cat]
            if (!items) return null
            return (
              <div key={cat}>
                <p style={{ fontSize: 11, fontFamily: 'var(--cf-mono)', fontWeight: 600, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, paddingLeft: 2 }}>
                  {CAT_LABELS[cat]}
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: 12,
                }}>
                  {items.map(meat => {
                    const r = results.find(x => x.id === meat.id)
                    const active = selectedMeat === meat.id
                    return (
                      <button
                        key={meat.id}
                        onClick={() => setSelectedMeat(active ? null : meat.id)}
                        style={{
                          textAlign: 'left', padding: 16, cursor: 'pointer',
                          background: active ? 'rgba(139,26,26,0.05)' : cardBg,
                          border: `1.5px solid ${active ? '#8B1A1A' : borderColor}`,
                          borderRadius: 4,
                          transition: 'all .15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: 4,
                            background: active ? 'rgba(139,26,26,0.10)' : 'rgba(31,26,20,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                          }}>
                            {meat.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#1F1A14', fontFamily: 'var(--cf-sans)' }}>{meat.name}</p>
                            <p style={{ fontSize: 10, color: '#6E6356', fontFamily: 'var(--cf-mono)', marginTop: 2 }}>{meat.serving_style}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ fontSize: 28, fontWeight: 700, color: '#8B1A1A', lineHeight: 1, fontFamily: 'var(--cf-serif)' }}>{r.rawKg}</span>
                          <span style={{ fontSize: 13, color: '#6E6356', fontWeight: 500 }}>kg à acheter</span>
                        </div>
                        <p style={{ fontSize: 11, color: '#6E6356', marginTop: 4, fontFamily: 'var(--cf-mono)' }}>
                          ≈ {r.cookedKg} kg cuit · rendement {meat.yield_pct}%
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Detail card ── */}
        {selectedResult && (
          <div style={{ marginTop: 24 }}>
            <div style={{ background: cardBg, border: `1.5px solid #8B1A1A`, borderRadius: 4, padding: mobile ? 20 : 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 4, background: 'rgba(139,26,26,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {selectedResult.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F1A14', fontFamily: 'var(--cf-serif)' }}>{selectedResult.name}</h3>
                  <p style={{ fontSize: 12, color: '#6E6356', fontFamily: 'var(--cf-mono)', marginTop: 2 }}>{selectedResult.serving_style}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                <div style={{ borderRadius: 4, padding: 14, background: 'rgba(139,26,26,0.07)', border: '1px solid rgba(139,26,26,0.20)', textAlign: 'center' }}>
                  <p style={{ fontSize: 9, fontWeight: 600, color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--cf-mono)' }}>À acheter</p>
                  <p style={{ fontSize: 26, fontWeight: 700, color: '#8B1A1A', fontFamily: 'var(--cf-serif)', margin: '4px 0' }}>{selectedResult.rawKg}</p>
                  <p style={{ fontSize: 10, color: '#6E6356' }}>kg brut</p>
                </div>
                <div style={{ borderRadius: 4, padding: 14, background: '#FAF6EE', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                  <p style={{ fontSize: 9, fontWeight: 600, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--cf-mono)' }}>Cuit</p>
                  <p style={{ fontSize: 26, fontWeight: 700, color: '#1F1A14', fontFamily: 'var(--cf-serif)', margin: '4px 0' }}>{selectedResult.cookedKg}</p>
                  <p style={{ fontSize: 10, color: '#6E6356' }}>kg</p>
                </div>
                <div style={{ borderRadius: 4, padding: 14, background: '#FAF6EE', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                  <p style={{ fontSize: 9, fontWeight: 600, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--cf-mono)' }}>Rendement</p>
                  <p style={{ fontSize: 26, fontWeight: 700, color: '#1F1A14', fontFamily: 'var(--cf-serif)', margin: '4px 0' }}>{selectedResult.yield_pct}%</p>
                  <p style={{ fontSize: 10, color: '#6E6356' }}>après cuisson</p>
                </div>
              </div>

              <div style={{ padding: '14px 16px', borderRadius: 4, background: '#FAF6EE', border: `1px solid ${borderColor}`, marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: '#6E6356', lineHeight: 1.6 }}>
                  <span style={{ color: '#8B1A1A', fontWeight: 600 }}>Conseil :</span> {selectedResult.note}
                </p>
              </div>

              <FireButton as={Link} href={selectedResult.cook_link} size="md">
                <span>🔥</span>
                Calculer la cuisson
              </FireButton>
            </div>
          </div>
        )}

        {/* ── Tips ── */}
        <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 4, padding: mobile ? 20 : 24, marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 2, background: '#8B1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 12 }}>💡</span>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1F1A14', fontFamily: 'var(--cf-serif)' }}>Astuces quantités</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Si tu sers plusieurs viandes, réduis chaque quantité de 30-40%.',
              'Prévois toujours 10-15% de plus que le calcul — mieux vaut des restes que des invités affamés.',
              'Les accompagnements (coleslaw, pain, sides) réduisent la quantité de viande nécessaire.',
              'Pour un événement, compte ~250g de viande cuite par personne en moyenne.',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(139,26,26,0.10)', border: '1px solid rgba(139,26,26,0.20)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#8B1A1A', flexShrink: 0, marginTop: 1,
                  fontFamily: 'var(--cf-mono)',
                }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 12, color: '#6E6356', lineHeight: 1.6 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <NewsletterBlock mobile={mobile} />
      <CFFooter mobile={mobile} />
    </div>
  )
}
