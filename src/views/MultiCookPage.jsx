'use client'

import { useState, useMemo, useEffect } from 'react'
import { updateMeta } from '../lib/seo.js'
import { useCalculatorData } from '../modules/calculator/useCalculatorData.js'
import { calculateCookPlan, formatHours } from '../modules/calculator/engine.js'
import { DONENESS_LABELS } from '../modules/calculator/data.js'
import { CFHeader, CFFooter } from '../components/cf/Chrome.jsx'

// ── CF v3 design tokens ──
const C = {
  bg: '#FAF6EE',
  card: '#F0EBE1',
  cardBorder: 'rgba(31,26,20,0.10)',
  text: '#1F1A14',
  muted: '#6E6356',
  red: '#8B1A1A',
  gold: '#E8A53C',
  redFaint: 'rgba(139,26,26,0.08)',
  goldFaint: 'rgba(232,165,60,0.10)',
  borderLight: 'rgba(31,26,20,0.08)',
}

const CAT_LABELS = { boeuf: 'Bœuf', porc: 'Porc', volaille: 'Volaille' }

export default function MultiCookPage() {
  const { profiles, loading } = useCalculatorData()
  const [entries, setEntries] = useState([])
  const [serviceHour, setServiceHour] = useState(19)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    updateMeta({
      title: 'Planificateur multi-cuisson BBQ — Tout prêt à la même heure | Charbon & Flamme',
      description: "Planifie plusieurs viandes au BBQ pour qu'elles soient prêtes en même temps.",
      canonical: 'https://charbonetflamme.fr/multi',
    })
  }, [])

  const profilesByCategory = useMemo(() => {
    if (!profiles) return {}
    return profiles.reduce((acc, p) => {
      const cat = p.category || 'autre'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(p)
      return acc
    }, {})
  }, [profiles])

  const addEntry = (profileId) => {
    const profile = profiles.find(p => p.id === profileId)
    if (!profile) return
    const isFixed = !!profile.fixed_times
    const isRS = profile.cook_type === 'reverse_sear'
    const midTemp = profile.temp_bands?.[Math.floor((profile.temp_bands?.length || 1) / 2)]?.temp_c || 120
    setEntries(prev => [...prev, {
      id: Date.now(),
      profileId,
      profile,
      weightKg: isFixed ? '' : '4',
      cookTempC: midTemp,
      wrapped: profile.supports_wrap || false,
      doneness: isRS ? (profile.default_doneness || Object.keys(profile.doneness_targets || {})[0] || 'medium_rare') : null,
      isFixed,
      isRS,
    }])
    setShowPicker(false)
  }

  const removeEntry = (id) => setEntries(prev => prev.filter(e => e.id !== id))

  const updateEntry = (id, field, value) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  const plans = useMemo(() => {
    return entries.map(entry => {
      try {
        const plan = calculateCookPlan({
          profile: entry.profile,
          weightKg: entry.isFixed ? 0 : parseFloat(entry.weightKg) || 0,
          cookTempC: entry.isFixed ? 0 : entry.cookTempC,
          wrapped: entry.wrapped,
          doneness: entry.isRS ? entry.doneness : null,
        })
        return { ...entry, plan, valid: true }
      } catch {
        return { ...entry, plan: null, valid: false }
      }
    }).filter(e => e.valid && e.plan)
  }, [entries])

  const timeline = useMemo(() => {
    if (plans.length === 0) return null
    const serviceMinutes = serviceHour * 60
    const items = plans.map(p => {
      const avgCookMin = Math.round((p.plan.totalLowMinutes + p.plan.totalHighMinutes) / 2)
      const startMinute = serviceMinutes - avgCookMin
      const earlyStart = serviceMinutes - p.plan.totalHighMinutes
      const lateStart = serviceMinutes - p.plan.totalLowMinutes
      return {
        ...p,
        avgCookMin,
        startMinute,
        earlyStart,
        lateStart,
        startDisplay: fmtClock(startMinute),
        earlyDisplay: fmtClock(earlyStart),
        lateDisplay: fmtClock(lateStart),
      }
    })
    items.sort((a, b) => a.startMinute - b.startMinute)
    const firstStart = items[0].earlyStart
    const overallSpan = serviceMinutes - firstStart
    return { items, firstStart, overallSpan, serviceMinutes }
  }, [plans, serviceHour])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔥</div>
          <p style={{ color: C.muted, fontFamily: 'var(--cf-mono)', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Chargement…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <CFHeader />

      <main style={{ maxWidth: 840, margin: '0 auto', padding: '0 20px 80px' }}>

        {/* Hero */}
        <div style={{ padding: '56px 0 40px', borderBottom: `1px solid ${C.borderLight}`, marginBottom: 40 }}>
          <p style={{ fontFamily: 'var(--cf-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.red, marginBottom: 12 }}>
            Multi-cuisson
          </p>
          <h1 style={{ fontFamily: 'var(--cf-serif)', fontSize: 42, fontWeight: 800, lineHeight: 1, textTransform: 'uppercase', color: C.text, margin: '0 0 16px' }}>
            Plusieurs viandes,<br />
            <span style={{ color: C.red }}>une seule heure</span> de service.
          </h1>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
            Ajoute tes viandes, choisis l'heure du repas. On calcule quand allumer chaque cuisson pour que tout soit prêt en même temps.
          </p>
        </div>

        {/* Service hour */}
        <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 4, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🕐</span>
              Heure de service :
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[12, 13, 14, 17, 18, 19, 20, 21].map(h => (
                <button
                  key={h}
                  onClick={() => setServiceHour(h)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'var(--cf-mono)',
                    border: serviceHour === h ? `2px solid ${C.red}` : `2px solid ${C.borderLight}`,
                    background: serviceHour === h ? C.red : 'transparent',
                    color: serviceHour === h ? '#FAF6EE' : C.muted,
                    cursor: 'pointer',
                  }}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Entries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {entries.map((entry, idx) => (
            <MeatEntry
              key={entry.id}
              entry={entry}
              index={idx}
              plan={plans.find(p => p.id === entry.id)?.plan}
              serviceHour={serviceHour}
              onUpdate={(field, value) => updateEntry(entry.id, field, value)}
              onRemove={() => removeEntry(entry.id)}
            />
          ))}
        </div>

        {/* Add button / picker */}
        {!showPicker ? (
          <button
            onClick={() => setShowPicker(true)}
            style={{
              width: '100%', padding: '20px', borderRadius: 4,
              border: `2px dashed ${C.cardBorder}`, background: 'transparent',
              color: C.muted, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <span style={{ fontSize: 22 }}>+</span>
            Ajouter une viande
          </button>
        ) : (
          <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 4, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>Choisis une viande</h3>
              <button onClick={() => setShowPicker(false)} style={{ fontSize: 12, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
                Fermer
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {Object.entries(profilesByCategory).map(([cat, items]) => (
                <div key={cat}>
                  <p style={{ fontFamily: 'var(--cf-mono)', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                    {CAT_LABELS[cat] || cat}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                    {items.map(p => (
                      <button
                        key={p.id}
                        onClick={() => addEntry(p.id)}
                        style={{
                          background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 4,
                          padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 10,
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{p.icon}</span>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: '0 0 2px' }}>{p.name}</p>
                          <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>
                            {p.cook_type === 'reverse_sear' ? 'Reverse sear' : 'Low & slow'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {timeline && timeline.items.length >= 2 && (
          <div style={{ marginTop: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <div style={{ flex: 1, height: 1, background: C.cardBorder }} />
              <p style={{ fontFamily: 'var(--cf-mono)', fontSize: 11, fontWeight: 700, color: C.red, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
                Planning de cuisson
              </p>
              <div style={{ flex: 1, height: 1, background: C.cardBorder }} />
            </div>

            {/* Summary banner */}
            <div style={{ background: C.red, borderRadius: 4, padding: '20px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 36 }}>⏰</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--cf-mono)', fontSize: 10, fontWeight: 700, color: 'rgba(250,246,238,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
                  Première cuisson à lancer
                </p>
                <p style={{ fontFamily: 'var(--cf-serif)', fontSize: 36, fontWeight: 800, color: '#FAF6EE', lineHeight: 1, margin: 0 }}>
                  {timeline.items[0].startDisplay}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(250,246,238,0.65)', marginTop: 4 }}>
                  {timeline.items[0].profile.name} — fourchette : {timeline.items[0].earlyDisplay} à {timeline.items[0].lateDisplay}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: 'rgba(250,246,238,0.6)', marginBottom: 4 }}>Service</p>
                <p style={{ fontFamily: 'var(--cf-serif)', fontSize: 28, fontWeight: 800, color: C.gold, margin: 0 }}>{serviceHour}h00</p>
              </div>
            </div>

            {/* Timeline items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {timeline.items.map((item, idx) => {
                const offsetPct = ((item.startMinute - timeline.firstStart) / timeline.overallSpan) * 100
                const widthPct = (item.avgCookMin / timeline.overallSpan) * 100
                const color = TIMELINE_COLORS[idx % TIMELINE_COLORS.length]
                return (
                  <TimelineItem
                    key={item.id}
                    item={item}
                    idx={idx}
                    offsetPct={offsetPct}
                    widthPct={widthPct}
                    color={color}
                    timeline={timeline}
                    serviceHour={serviceHour}
                  />
                )
              })}
            </div>

            {/* Checklist */}
            <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 4, padding: '20px 24px', marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <span style={{ fontSize: 18 }}>📋</span>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>Ton plan étape par étape</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {timeline.items.map((item, idx) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 4, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#FAF6EE', flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <div style={{ paddingTop: 2 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 2px' }}>
                        <span style={{ color: C.red, fontFamily: 'var(--cf-mono)', fontWeight: 800 }}>{item.startDisplay}</span>
                        {' '}— Lance le {item.profile.name}
                      </p>
                      <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                        {item.plan.weightKg > 0 ? `${item.plan.weightKg}kg, ` : ''}
                        {item.plan.cookTempC > 0 ? `${item.plan.cookTempC}°C, ` : ''}
                        {item.plan.wrapped ? 'wrappé' : 'sans wrap'}
                        {item.plan.doneness ? ` · ${DONENESS_LABELS[item.plan.doneness] || item.plan.doneness}` : ''}
                        {' · '}durée {item.plan.totalEstimate}
                      </p>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingTop: 12, borderTop: `1px solid ${C.borderLight}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: 4, background: C.goldFaint, border: `1px solid ${C.gold}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    🍽️
                  </div>
                  <div style={{ paddingTop: 2 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 2px' }}>
                      <span style={{ color: C.red, fontFamily: 'var(--cf-mono)', fontWeight: 800 }}>{serviceHour}h00</span>
                      {' '}— À table !
                    </p>
                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                      {timeline.items.length} viandes prêtes en même temps
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 4, padding: '20px 24px', marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 16 }}>💡</span>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>Conseils multi-cuisson</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  "Le planning se base sur la durée de chaque viande — c'est le type de cuisson qui décide l'ordre, pas le poids.",
                  "Si tu n'as qu'un seul fumoir, les cuissons à la même température peuvent cohabiter sur la grille.",
                  'Prévois 30 min de marge — mieux vaut que tout repose un peu plus longtemps que de courir.',
                  'Les pièces riches en collagène (brisket, pulled pork) supportent un long repos en glacière (2–4h). Les pièces maigres (poulet, reverse sear) moins.',
                ].map((tip, i) => (
                  <p key={i} style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, margin: 0, display: 'flex', gap: 8 }}>
                    <span style={{ color: C.red, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty / single states */}
        {entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
            <p style={{ fontSize: 14, color: C.muted }}>Ajoute au moins 2 viandes pour voir le planning</p>
          </div>
        )}
        {entries.length === 1 && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ fontSize: 13, color: C.muted }}>Ajoute une deuxième viande pour voir le planning multi-cuisson</p>
          </div>
        )}
      </main>

      <CFFooter />
    </div>
  )
}

/* ── Timeline colors (CF v3) ── */
const TIMELINE_COLORS = [
  { bar: '#8B1A1A' },
  { bar: '#C8801A' },
  { bar: '#2D6A4F' },
  { bar: '#1B4F72' },
  { bar: '#6C3483' },
]

/* ── Clock formatter ── */
function fmtClock(totalMinutes) {
  let m = totalMinutes
  let suffix = ''
  if (m < 0) { m = 24 * 60 + m; suffix = ' (veille)' }
  let h = Math.floor(m / 60) % 24
  let min = Math.round(m % 60)
  min = Math.round(min / 15) * 15
  if (min === 60) { h = (h + 1) % 24; min = 0 }
  return min === 0 ? `${h}h${suffix}` : `${h}h${String(min).padStart(2, '0')}${suffix}`
}

const PHASE_ICONS = { 1: '🔥', 2: '🥵', 3: '🥩', 4: '🧈', 5: '🍽️' }

/* ── Timeline item ── */
function TimelineItem({ item, idx, offsetPct, widthPct, color, timeline, serviceHour }) {
  const [expanded, setExpanded] = useState(false)
  const plan = item.plan

  return (
    <div>
      <div style={{ background: '#F0EBE1', border: '1px solid rgba(31,26,20,0.10)', borderRadius: 4, padding: '16px 20px', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>{item.profile.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1F1A14', margin: '0 0 2px' }}>{item.profile.name}</p>
            <p style={{ fontSize: 11, color: '#6E6356', margin: 0 }}>
              {plan.weightKg > 0 ? `${plan.weightKg}kg · ` : ''}{plan.totalEstimate}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'var(--cf-mono)', fontSize: 22, fontWeight: 800, color: color.bar, margin: 0, lineHeight: 1 }}>
                {item.startDisplay}
              </p>
              <p style={{ fontSize: 10, color: '#6E6356', margin: '2px 0 0' }}>
                {item.earlyDisplay} – {item.lateDisplay}
              </p>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                width: 32, height: 32, borderRadius: 4, border: '1px solid rgba(31,26,20,0.10)',
                background: expanded ? 'rgba(139,26,26,0.08)' : 'transparent',
                color: '#8B1A1A', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bar */}
        <div style={{ height: 8, borderRadius: 99, background: 'rgba(31,26,20,0.08)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99, background: color.bar,
            marginLeft: `${offsetPct}%`, width: `${Math.max(widthPct, 4)}%`,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 9, color: '#6E6356', fontFamily: 'var(--cf-mono)' }}>{fmtClock(timeline.firstStart)}</span>
          <span style={{ fontSize: 9, color: '#6E6356', fontFamily: 'var(--cf-mono)' }}>{serviceHour}h00 🍽️</span>
        </div>

        {/* Expanded phases */}
        {expanded && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(31,26,20,0.08)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plan.phases?.map((phase) => (
              <div key={phase.num} style={{ background: '#FAF6EE', border: '1px solid rgba(31,26,20,0.08)', borderRadius: 4, padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{PHASE_ICONS[phase.num] || '🔥'}</span>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1F1A14', flex: 1, margin: 0 }}>{phase.title}</p>
                  {phase.duration && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#8B1A1A', background: 'rgba(139,26,26,0.08)', padding: '2px 8px', borderRadius: 99, fontFamily: 'var(--cf-mono)' }}>
                      {phase.duration}
                    </span>
                  )}
                </div>
                {phase.objective && <p style={{ fontSize: 11, color: '#6E6356', margin: '0 0 8px' }}>{phase.objective}</p>}
                {phase.markers?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {phase.markers.map((m, mi) => (
                      <div key={mi} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <span style={{ fontSize: 9, marginTop: 1 }}>{m.type === 'temp' ? '🌡️' : m.type === 'visual' ? '👁️' : 'ℹ️'}</span>
                        <p style={{ fontSize: 11, color: '#6E6356', margin: 0, lineHeight: 1.5 }}>{m.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                {phase.advice && (
                  <p style={{ fontSize: 10, color: '#6E6356', margin: '8px 0 0', fontStyle: 'italic' }}>
                    <span style={{ color: '#8B1A1A', fontWeight: 600, fontStyle: 'normal' }}>Conseil : </span>{phase.advice}
                  </p>
                )}
              </div>
            ))}
            {plan.cues?.target_temp_min && (
              <div style={{ background: 'rgba(139,26,26,0.06)', border: '1px solid rgba(139,26,26,0.15)', borderRadius: 4, padding: '12px 16px', display: 'flex', gap: 24 }}>
                <div>
                  <p style={{ fontFamily: 'var(--cf-mono)', fontSize: 10, fontWeight: 700, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Cible interne</p>
                  <p style={{ fontFamily: 'var(--cf-serif)', fontSize: 22, fontWeight: 800, color: '#1F1A14', margin: 0 }}>{plan.cues.target_temp_min}–{plan.cues.target_temp_max}°C</p>
                </div>
                {plan.cues.stall_temp_min && (
                  <div>
                    <p style={{ fontFamily: 'var(--cf-mono)', fontSize: 10, fontWeight: 700, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Stall</p>
                    <p style={{ fontFamily: 'var(--cf-serif)', fontSize: 22, fontWeight: 800, color: '#1F1A14', margin: 0 }}>{plan.cues.stall_temp_min}–{plan.cues.stall_temp_max}°C</p>
                  </div>
                )}
              </div>
            )}
            {plan.tips?.length > 0 && (
              <div style={{ background: '#FAF6EE', border: '1px solid rgba(31,26,20,0.08)', borderRadius: 4, padding: '12px 16px' }}>
                <p style={{ fontFamily: 'var(--cf-mono)', fontSize: 10, fontWeight: 700, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Conseils pitmaster</p>
                {plan.tips.slice(0, 3).map((tip, ti) => (
                  <p key={ti} style={{ fontSize: 11, color: '#6E6356', lineHeight: 1.5, margin: '0 0 4px' }}>
                    <span style={{ color: '#8B1A1A', fontWeight: 700 }}>{ti + 1}. </span>{tip}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {idx < timeline.items.length - 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 4px 16px', marginBottom: 4 }}>
          <div style={{ width: 1, height: 16, background: 'rgba(31,26,20,0.08)' }} />
          <span style={{ fontSize: 10, color: '#6E6356', fontFamily: 'var(--cf-mono)' }}>
            puis {Math.round((timeline.items[idx + 1].startMinute - item.startMinute) / 60 * 10) / 10}h plus tard →
          </span>
        </div>
      )}
    </div>
  )
}

/* ── Meat entry card ── */
function MeatEntry({ entry, index, plan, serviceHour, onUpdate, onRemove }) {
  const isFixed = entry.isFixed
  const isRS = entry.isRS
  const tempMin = entry.profile.temp_bands?.[0]?.temp_c || 100
  const tempMax = entry.profile.temp_bands?.[entry.profile.temp_bands.length - 1]?.temp_c || 150

  let startDisplay = null
  if (plan) {
    const avgMin = Math.round((plan.totalLowMinutes + plan.totalHighMinutes) / 2)
    startDisplay = fmtClock(serviceHour * 60 - avgMin)
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 32px 8px 10px',
    background: '#FAF6EE',
    border: '1px solid rgba(31,26,20,0.10)',
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 700,
    color: '#1F1A14',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ background: '#F0EBE1', border: '1px solid rgba(31,26,20,0.10)', borderRadius: 4, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 4, background: 'rgba(139,26,26,0.08)', border: '1px solid rgba(139,26,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            {entry.profile.icon}
          </div>
          <span style={{ fontFamily: 'var(--cf-mono)', fontSize: 9, fontWeight: 700, color: '#6E6356' }}>#{index + 1}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1F1A14', margin: '0 0 2px' }}>{entry.profile.name}</p>
              <p style={{ fontSize: 11, color: '#6E6356', margin: 0 }}>
                {isRS ? 'Reverse sear' : isFixed ? 'Temps fixe' : 'Low & slow'}
                {entry.profile.supports_wrap ? ' · Wrap possible' : ''}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {startDisplay && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, color: '#6E6356', margin: '0 0 2px' }}>Départ</p>
                  <p style={{ fontFamily: 'var(--cf-mono)', fontSize: 20, fontWeight: 800, color: '#8B1A1A', margin: 0, lineHeight: 1 }}>{startDisplay}</p>
                </div>
              )}
              <button
                onClick={onRemove}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6E6356', padding: 4, borderRadius: 4 }}
                title="Retirer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
            {!isFixed && (
              <div>
                <label style={{ fontFamily: 'var(--cf-mono)', fontSize: 9, fontWeight: 700, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>Poids</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" step="0.5" min="0.5" max="20" value={entry.weightKg} onChange={e => onUpdate('weightKg', e.target.value)} style={inputStyle} placeholder="4" />
                  <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#6E6356' }}>kg</span>
                </div>
              </div>
            )}
            {!isFixed && (
              <div>
                <label style={{ fontFamily: 'var(--cf-mono)', fontSize: 9, fontWeight: 700, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>Fumoir</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" min={tempMin} max={tempMax} value={entry.cookTempC} onChange={e => onUpdate('cookTempC', Number(e.target.value))} style={inputStyle} />
                  <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#6E6356' }}>°C</span>
                </div>
              </div>
            )}
            {entry.profile.supports_wrap && (
              <div>
                <label style={{ fontFamily: 'var(--cf-mono)', fontSize: 9, fontWeight: 700, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>Wrap</label>
                <button
                  onClick={() => onUpdate('wrapped', !entry.wrapped)}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    border: entry.wrapped ? '1px solid rgba(139,26,26,0.4)' : '1px solid rgba(31,26,20,0.10)',
                    background: entry.wrapped ? 'rgba(139,26,26,0.08)' : 'transparent',
                    color: entry.wrapped ? '#8B1A1A' : '#6E6356',
                  }}
                >
                  {entry.wrapped ? 'Oui ✓' : 'Non'}
                </button>
              </div>
            )}
            {isRS && (
              <div>
                <label style={{ fontFamily: 'var(--cf-mono)', fontSize: 9, fontWeight: 700, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>Cuisson</label>
                <select
                  value={entry.doneness || entry.profile?.default_doneness || 'medium_rare'}
                  onChange={e => onUpdate('doneness', e.target.value)}
                  style={{ ...inputStyle, padding: '8px 10px', cursor: 'pointer' }}
                >
                  {Object.entries(entry.profile?.doneness_targets || {}).map(([k]) => (
                    <option key={k} value={k}>{DONENESS_LABELS[k] || k}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {plan && (
            <div style={{ marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: '#6E6356' }}>Durée : <span style={{ color: '#1F1A14', fontWeight: 600 }}>{plan.totalEstimate}</span></span>
              <span style={{ fontSize: 11, color: '#6E6356' }}>Repos : <span style={{ color: '#1F1A14', fontWeight: 600 }}>{plan.restEstimate}</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
