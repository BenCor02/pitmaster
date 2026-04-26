/**
 * CalculatorPage — Wizard pitmaster 4 étapes (design v3 light mode)
 *
 * Étapes :
 *   ① Cut       — choix du profil de cuisson (filtré par catégorie)
 *   ② Méthode   — confirmation visuelle du cook_type (low/hot/reverse/fixed)
 *   ③ Paramètres — poids, température chambre, wrap, doneness
 *   ④ Résultat  — KPIs, timeline des phases, timer, checklist
 *
 * Conserve toutes les briques métier existantes :
 *   - useCalculatorData (Supabase profiles)
 *   - calculateCookPlan (engine v3)
 *   - logCalculation (tracking anonyme)
 *   - URL persistence (?m=...&w=...&t=...&wr=0|1&d=...)
 *   - SEO meta + JSON-LD
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateMeta, injectJsonLd } from '../lib/seo.js'
import { useCalculatorData } from '../modules/calculator/useCalculatorData.js'
import { calculateCookPlan } from '../modules/calculator/engine.js'
import { logCalculation } from '../lib/calcTracking.js'
import { useRecipeImages, imageForProfile } from '../lib/recipeImages.js'
import {
  FireButton,
  Pill,
  SectionEyebrow,
  SmokeBackdrop,
  EmberGlow,
} from '../components/cf/Primitives.jsx'
import { MethodBadge } from '../components/cf/StampBadge.jsx'
import { CFHeader, CFFooter } from '../components/cf/Chrome.jsx'

// ───────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────
const CAT_ORDER = ['boeuf', 'porc', 'agneau', 'volaille']
const CAT_META = {
  boeuf: { label: 'Bœuf', icon: '🥩' },
  porc: { label: 'Porc', icon: '🐷' },
  agneau: { label: 'Agneau', icon: '🐑' },
  volaille: { label: 'Volaille', icon: '🍗' },
}

function methodKeyFromCookType(cookType) {
  if (cookType === 'reverse_sear') return 'reverse'
  if (cookType === 'hot_and_fast' || cookType === 'hot_fast') return 'hot'
  if (cookType === 'low_and_slow' || cookType === 'low_slow') return 'low'
  return 'fixed'
}

function formatTime(min) {
  if (!min || min < 1) return '0 min'
  if (min < 60) return `${Math.round(min)} min`
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, '0')}`
}

const VALID_DONENESS = [
  'bleu', 'rare', 'medium_rare', 'medium', 'medium_well', 'well_done',
  'rose', 'a_point', 'bien_cuit',
]

function saveToURL(params) {
  const url = new URL(window.location)
  if (params) {
    url.searchParams.set('m', params.profileId)
    url.searchParams.set('w', params.weightKg)
    url.searchParams.set('t', params.cookTempC)
    url.searchParams.set('wr', params.wrapped ? '1' : '0')
    if (params.doneness) url.searchParams.set('d', params.doneness)
  } else {
    ;['m', 'w', 't', 'wr', 'd'].forEach((k) => url.searchParams.delete(k))
  }
  window.history.replaceState({}, '', url)
}

function readFromURL() {
  const params = new URLSearchParams(window.location.search)
  const m = params.get('m')
  if (!m) return null
  const rawWeight = parseFloat(params.get('w'))
  const weightKg = !isNaN(rawWeight) && rawWeight >= 0.1 && rawWeight <= 25 ? String(rawWeight) : ''
  const rawTemp = Number(params.get('t'))
  const cookTempC = !isNaN(rawTemp) && rawTemp >= 50 && rawTemp <= 400 ? rawTemp : 110
  const rawDoneness = params.get('d')
  const doneness = VALID_DONENESS.includes(rawDoneness) ? rawDoneness : 'medium_rare'
  return {
    profileId: m,
    weightKg,
    cookTempC,
    wrapped: params.get('wr') === '1',
    doneness,
  }
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

// ───────────────────────────────────────────────
// StepDots — indicateur d'étape circulaire
// ───────────────────────────────────────────────
function StepDots({ current, total, labels = [], onJump }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <button
            type="button"
            onClick={() => onJump?.(i)}
            disabled={i > current}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              border: `1.5px solid ${i <= current ? '#8B1A1A' : 'rgba(31,26,20,0.2)'}`,
              background: i < current ? '#8B1A1A' : 'transparent',
              color: i < current ? '#F5EFE0' : i === current ? '#8B1A1A' : '#968A7A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--cf-serif)', fontSize: 13, fontWeight: 700,
              cursor: i <= current ? 'pointer' : 'not-allowed',
              padding: 0,
            }}
            aria-label={labels[i] || `Étape ${i + 1}`}
          >
            {i < current ? '✓' : i + 1}
          </button>
          {i < total - 1 && (
            <div
              style={{
                width: 16, height: 1.5,
                background: i < current ? '#8B1A1A' : 'rgba(31,26,20,0.2)',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ───────────────────────────────────────────────
// Timer pitmaster (tabular-nums + flicker)
// ───────────────────────────────────────────────
function Timer({ totalSec, running, onToggle, onReset }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => { setElapsed(0) }, [totalSec])
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setElapsed((e) => Math.min(e + 1, totalSec)), 1000)
    return () => clearInterval(id)
  }, [running, totalSec])
  const remaining = Math.max(0, totalSec - elapsed)
  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60
  const pct = totalSec > 0 ? (elapsed / totalSec) * 100 : 0
  return (
    <div
      style={{
        background: '#14100B',
        color: '#F5EFE0',
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
        border: '2px solid #8B1A1A',
      }}
    >
      <EmberGlow count={6} />
      <div style={{ position: 'relative' }}>
        <div className="cf-eyebrow" style={{ color: '#E8A53C', marginBottom: 8 }}>
          ⏱ Timer pitmaster
        </div>
        <div
          className={running ? 'cf-flicker' : ''}
          style={{
            fontFamily: 'var(--cf-serif)',
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1,
            color: running ? '#E8A53C' : '#F5EFE0',
            fontVariantNumeric: 'tabular-nums',
            textShadow: running ? '0 0 20px rgba(232,165,60,0.5)' : 'none',
          }}
        >
          {h.toString().padStart(2, '0')}
          <span style={{ color: '#6E6356' }}>:</span>
          {m.toString().padStart(2, '0')}
          <span style={{ color: '#6E6356' }}>:</span>
          {s.toString().padStart(2, '0')}
        </div>
        <div
          style={{
            height: 4,
            background: 'rgba(245,239,224,0.1)',
            marginTop: 12,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pct}%`,
              background: 'linear-gradient(to right, #8B1A1A, #E8A53C)',
              transition: 'width 1s linear',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <FireButton size="sm" type={running ? 'cream' : 'primary'} onClick={onToggle} fullWidth>
            {running ? '❚❚ Pause' : '▶ Démarrer'}
          </FireButton>
          <FireButton
            size="sm"
            type="ghost"
            onClick={onReset}
            style={{ color: '#F5EFE0', borderColor: 'rgba(245,239,224,0.3)' }}
          >
            ↺
          </FireButton>
        </div>
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────
// CookTimeline — phases issues du moteur v3
// ───────────────────────────────────────────────
function CookTimeline({ phases, mobile }) {
  if (!phases || phases.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {phases.map((p, i) => (
        <div
          key={i}
          style={{
            padding: 16,
            background: i % 2 === 0 ? '#1F1A14' : '#3A3025',
            color: '#F5EFE0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            borderBottom: i < phases.length - 1 ? '1px solid rgba(245,239,224,0.1)' : 'none',
          }}
        >
          <div
            style={{
              width: 38, height: 38, borderRadius: '50%',
              border: '1.5px solid #E8A53C', color: '#E8A53C',
              fontFamily: 'var(--cf-serif)', fontWeight: 700, fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {p.num ?? i + 1}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--cf-serif)',
                fontSize: mobile ? 16 : 18,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              {p.title}
            </div>
            {p.duration && (
              <div
                style={{
                  fontFamily: 'var(--cf-mono)',
                  fontSize: 11,
                  color: '#D9CDB5',
                  marginTop: 4,
                  letterSpacing: '0.05em',
                }}
              >
                {p.duration}
              </div>
            )}
            {p.objective && (
              <div style={{ fontSize: 13, color: '#B8AC97', marginTop: 6, lineHeight: 1.5 }}>
                {p.objective}
              </div>
            )}
            {p.advice && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: '#E8A53C',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                }}
              >
                ☞ {p.advice}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ───────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────
const STEP_LABELS = ['Cut', 'Méthode', 'Paramètres', 'Résultat']

const CHECKLIST = [
  'Sors la viande 1h avant — température ambiante',
  'Allume les braises 30 min avant',
  'Sonde calibrée et branchée',
  "Bac d'eau dans le smoker",
  'Bois choisi : chêne, hickory, ou pommier',
  'Glaçage / mop sauce préparé si besoin',
]

export default function CalculatorPage() {
  const mobile = useMobile()
  const navigate = useNavigate()
  const { profiles, loading } = useCalculatorData()
  const images = useRecipeImages()

  const [step, setStep] = useState(0) // 0..3
  const [activeCat, setActiveCat] = useState('boeuf')
  const [profileId, setProfileId] = useState(null)
  const [weightKg, setWeightKg] = useState('')
  const [cookTempC, setCookTempC] = useState(110)
  const [wrapped, setWrapped] = useState(false)
  const [doneness, setDoneness] = useState('medium_rare')
  const [running, setRunning] = useState(false)
  const [check, setCheck] = useState({})

  const profile = useMemo(
    () => (profiles ? profiles.find((p) => p.id === profileId) : null),
    [profiles, profileId]
  )

  // SEO
  useEffect(() => {
    updateMeta({
      title: 'Calculateur BBQ — Temps de cuisson brisket, pulled pork, ribs | Charbon & Flamme',
      description:
        "Calcule le temps de cuisson exact pour ton BBQ : brisket, pulled pork, ribs, poulet fumé, reverse sear. Wizard 4 étapes, timer pitmaster, checklist.",
      canonical: 'https://charbonetflamme.fr/calculateur',
    })
    injectJsonLd('calculator-schema', {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Calculateur BBQ Charbon & Flamme',
      url: 'https://charbonetflamme.fr/calculateur',
      applicationCategory: 'UtilitiesApplication',
    })
    return () => injectJsonLd('calculator-schema', null)
  }, [])

  // URL restore
  useEffect(() => {
    if (!profiles || profiles.length === 0) return
    const saved = readFromURL()
    if (!saved) return
    const p = profiles.find((m) => m.id === saved.profileId)
    if (!p) return
    setProfileId(p.id)
    setActiveCat(p.category || 'boeuf')
    setWeightKg(saved.weightKg)
    setCookTempC(saved.cookTempC)
    setWrapped(saved.wrapped)
    setDoneness(saved.doneness)
    setStep(3)
  }, [profiles])

  const profilesByCategory = useMemo(() => {
    if (!profiles) return {}
    return profiles.reduce((acc, p) => {
      const cat = p.category || 'autre'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(p)
      return acc
    }, {})
  }, [profiles])

  const isReverseSear = profile?.cook_type === 'reverse_sear'
  const isFixedTime = !!profile?.fixed_times
  const supportsWrap = !!profile?.supports_wrap
  const tempMin = profile?.temp_bands?.[0]?.temp_c ?? 100
  const tempMax = profile?.temp_bands?.[profile.temp_bands.length - 1]?.temp_c ?? 150

  const result = useMemo(() => {
    if (!profile) return null
    const w = parseFloat(weightKg)
    if (!isFixedTime && (!w || w <= 0)) return null
    return calculateCookPlan({
      profile,
      weightKg: isFixedTime ? 0 : w,
      cookTempC: isFixedTime ? 0 : cookTempC,
      wrapped,
      doneness: isReverseSear ? doneness : null,
    })
  }, [profile, weightKg, cookTempC, wrapped, doneness, isFixedTime, isReverseSear])

  // ─── Handlers ───────────────────────────────
  const handlePickProfile = (id) => {
    const p = profiles.find((m) => m.id === id)
    if (!p) return
    setProfileId(p.id)
    if (p.temp_bands?.length) {
      setCookTempC(p.temp_bands[Math.floor(p.temp_bands.length / 2)].temp_c)
    }
    setWrapped(p.supports_wrap || false)
    const defaultD = p.default_doneness || (p.doneness_targets ? Object.keys(p.doneness_targets)[0] : 'medium_rare')
    setDoneness(defaultD)
    setStep(1)
  }

  const handleConfirmMethod = () => setStep(2)

  const handleCalculate = () => {
    if (!result) return
    saveToURL({
      profileId: profile.id,
      weightKg,
      cookTempC,
      wrapped,
      doneness: isReverseSear ? doneness : null,
    })
    logCalculation({
      profile,
      weightKg: isFixedTime ? null : parseFloat(weightKg),
      cookTempC: isFixedTime ? null : cookTempC,
      wrapped,
      doneness: isReverseSear ? doneness : null,
    })
    setStep(3)
  }

  const handleReset = () => {
    setStep(0)
    setProfileId(null)
    setWeightKg('')
    setRunning(false)
    setCheck({})
    saveToURL(null)
  }

  // ─── Loading ────────────────────────────────
  if (loading || !profiles) {
    return (
      <div className="cf-root cf-paper-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 56, height: 56, margin: '0 auto 16px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B1A1A, #E8A53C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'cfEmberPulse 2s ease-in-out infinite',
            }}
          >
            <span style={{ fontSize: 22 }}>🔥</span>
          </div>
          <p className="cf-eyebrow" style={{ color: '#6E6356' }}>Chargement…</p>
        </div>
      </div>
    )
  }

  // ─── Header & step indicator ────────────────
  const PageHeader = (
    <div
      style={{
        padding: mobile ? '24px 20px 16px' : '40px 64px 24px',
        maxWidth: 1280,
        margin: '0 auto',
      }}
    >
      <SectionEyebrow>Le calculateur</SectionEyebrow>
      <h1
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
        Calcule ta cuisson
        <br />
        au <span style={{ color: '#8B1A1A', fontStyle: 'italic' }}>degré près</span>.
      </h1>
      <div
        style={{
          marginTop: mobile ? 20 : 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: mobile ? 'flex-start' : 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <StepDots current={step} total={4} labels={STEP_LABELS} onJump={(i) => i <= step && setStep(i)} />
        <div className="cf-eyebrow" style={{ color: '#3A3025' }}>
          Étape {Math.min(step + 1, 4)} / 4 — {STEP_LABELS[Math.min(step, 3)]}
        </div>
      </div>
    </div>
  )

  // ─── STEP 0 : choix du cut ──────────────────
  const visibleProfiles = profilesByCategory[activeCat] || []

  const StepCut = (
    <div style={{ padding: mobile ? '8px 20px 32px' : '16px 64px 64px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Tabs catégorie */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CAT_ORDER.filter((c) => profilesByCategory[c]?.length).map((cat) => {
          const meta = CAT_META[cat]
          const active = activeCat === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                background: active ? '#1F1A14' : 'transparent',
                color: active ? '#F5EFE0' : '#1F1A14',
                border: active ? '2px solid #1F1A14' : '1.5px solid rgba(31,26,20,0.2)',
                fontFamily: 'var(--cf-serif)',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 16 }}>{meta.icon}</span>
              {meta.label}
              <span
                style={{
                  marginLeft: 6,
                  fontFamily: 'var(--cf-mono)',
                  fontSize: 10,
                  background: active ? 'rgba(245,239,224,0.15)' : 'rgba(31,26,20,0.06)',
                  padding: '2px 6px',
                }}
              >
                {profilesByCategory[cat].length}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grille profils */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: mobile ? 10 : 16,
        }}
      >
        {visibleProfiles.map((p) => {
          const active = profileId === p.id
          const img = imageForProfile(p, images)
          return (
            <button
              key={p.id}
              onClick={() => handlePickProfile(p.id)}
              style={{
                position: 'relative',
                padding: 0,
                background: '#FAF6EE',
                border: active ? '2.5px solid #8B1A1A' : '1.5px solid rgba(31,26,20,0.15)',
                cursor: 'pointer',
                textAlign: 'left',
                overflow: 'hidden',
                transition: 'all .15s',
                transform: active ? 'translateY(-2px)' : 'none',
                boxShadow: active ? '0 8px 20px rgba(139,26,26,0.18)' : 'none',
              }}
            >
              <div
                style={{
                  aspectRatio: '5/3',
                  backgroundImage: `url(${img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                {active && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: '#8B1A1A',
                      color: '#F5EFE0',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    ✓
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    fontFamily: 'var(--cf-mono)',
                    fontSize: 9,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#F5EFE0',
                    background: 'rgba(20,16,11,0.7)',
                    padding: '3px 6px',
                  }}
                >
                  {CAT_META[p.category]?.label || p.category}
                </div>
              </div>
              <div style={{ padding: mobile ? 10 : 14 }}>
                <div
                  style={{
                    fontFamily: 'var(--cf-serif)',
                    fontSize: mobile ? 16 : 20,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    lineHeight: 1.05,
                    color: '#1F1A14',
                  }}
                >
                  {p.name}
                </div>
                {!mobile && p.tagline && (
                  <div style={{ fontSize: 12, color: '#6E6356', marginTop: 4, lineHeight: 1.4 }}>
                    {p.tagline}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <FireButton
          size="lg"
          onClick={() => profileId && setStep(1)}
          icon={<span>→</span>}
          fullWidth={mobile}
          style={{ opacity: profileId ? 1 : 0.4, pointerEvents: profileId ? 'auto' : 'none' }}
        >
          Méthode
        </FireButton>
      </div>
    </div>
  )

  // ─── STEP 1 : confirmation méthode ──────────
  const methodKey = methodKeyFromCookType(profile?.cook_type)
  const methodCopy = {
    low: { name: 'Low & Slow', subtitle: 'Fumée lente, fonte du collagène', range: '95–135°C · 4–14h' },
    hot: { name: 'Hot & Fast', subtitle: 'Feu vif, croûte épaisse, jus retenu', range: '220–280°C · 5–25 min' },
    reverse: { name: 'Reverse Sear', subtitle: 'Cuisson douce puis saisie agressive', range: '110°C → 280°C · 1–3h' },
    fixed: { name: 'Recette à temps fixe', subtitle: 'Phases minutées (3-2-1, 2-2-1)', range: 'Variable selon le profil' },
  }[methodKey]

  const StepMethod = (
    <div style={{ padding: mobile ? '8px 20px 32px' : '16px 64px 64px', maxWidth: 900, margin: '0 auto' }}>
      <div
        style={{
          background: '#1F1A14',
          color: '#F5EFE0',
          border: '2.5px solid #8B1A1A',
          padding: mobile ? 24 : 40,
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : '1fr 1.4fr',
          gap: mobile ? 24 : 40,
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <SmokeBackdrop intensity={0.3} dark={true} />
        <EmberGlow count={8} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <MethodBadge method={methodKey} size={mobile ? 140 : 180} />
        </div>
        <div style={{ position: 'relative' }}>
          <div className="cf-eyebrow" style={{ color: '#E8A53C', marginBottom: 8 }}>
            Méthode imposée par la pièce
          </div>
          <h2
            style={{
              fontSize: mobile ? 36 : 56,
              lineHeight: 0.95,
              textTransform: 'uppercase',
              fontWeight: 700,
              fontFamily: 'var(--cf-serif)',
              color: '#F5EFE0',
              margin: 0,
            }}
          >
            {methodCopy.name}
          </h2>
          <p style={{ marginTop: 12, fontSize: 15, color: '#D9CDB5', lineHeight: 1.6 }}>
            {methodCopy.subtitle}.
            <br />
            <span style={{ color: '#E8A53C', fontFamily: 'var(--cf-mono)', fontSize: 12, letterSpacing: '0.1em' }}>
              {methodCopy.range}
            </span>
          </p>
          <p style={{ marginTop: 16, fontSize: 13, color: '#B8AC97', lineHeight: 1.6 }}>
            <strong style={{ color: '#F5EFE0' }}>{profile?.name}</strong> se cuit en{' '}
            <strong style={{ color: '#E8A53C' }}>{methodCopy.name}</strong>. Le calculateur applique
            les courbes terrain de cette méthode.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <FireButton size="md" type="ghost" onClick={() => setStep(0)}>
          ← Cut
        </FireButton>
        <FireButton size="lg" onClick={handleConfirmMethod} icon={<span>→</span>}>
          Paramètres
        </FireButton>
      </div>
    </div>
  )

  // ─── STEP 2 : paramètres ────────────────────
  const StepParams = (
    <div style={{ padding: mobile ? '8px 20px 32px' : '16px 64px 64px', maxWidth: 900, margin: '0 auto' }}>
      <div
        style={{
          background: '#FAF6EE',
          border: '1.5px solid rgba(31,26,20,0.15)',
          padding: mobile ? 20 : 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        {/* Poids */}
        {!isFixedTime && (
          <>
            <div>
              <div className="cf-eyebrow" style={{ marginBottom: 14 }}>Poids de la pièce</div>
              <div
                style={{
                  fontFamily: 'var(--cf-serif)',
                  fontSize: 56,
                  fontWeight: 700,
                  color: '#8B1A1A',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {weightKg ? parseFloat(weightKg).toFixed(1) : '—'}{' '}
                <span style={{ fontSize: 24, color: '#1F1A14' }}>kg</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="10"
                step="0.1"
                value={weightKg || 2}
                onChange={(e) => setWeightKg(e.target.value)}
                style={{ width: '100%', accentColor: '#8B1A1A', marginTop: 14 }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--cf-mono)',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  color: '#6E6356',
                  textTransform: 'uppercase',
                  marginTop: 4,
                }}
              >
                <span>400 g</span>
                <span>5 kg</span>
                <span>10 kg</span>
              </div>
            </div>
            <hr className="cf-divider" />

            {/* Température chambre */}
            <div>
              <div className="cf-eyebrow" style={{ marginBottom: 14 }}>Température chambre</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontFamily: 'var(--cf-serif)', fontSize: 32, fontWeight: 700, color: '#1F1A14' }}>
                  {cookTempC} <span style={{ fontSize: 16, color: '#6E6356' }}>°C</span>
                </div>
                <div style={{ fontFamily: 'var(--cf-mono)', fontSize: 11, color: '#8B1A1A' }}>
                  {tempMin}°C — {tempMax}°C
                </div>
              </div>
              <input
                type="range"
                min={tempMin}
                max={tempMax}
                step="5"
                value={cookTempC}
                onChange={(e) => setCookTempC(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#8B1A1A', marginTop: 14 }}
              />
            </div>
            <hr className="cf-divider" />
          </>
        )}

        {/* Doneness (reverse sear uniquement) */}
        {isReverseSear && profile?.doneness_targets && (
          <>
            <div>
              <div className="cf-eyebrow" style={{ marginBottom: 14 }}>Cuisson désirée</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.keys(profile.doneness_targets).map((d) => (
                  <Pill key={d} active={doneness === d} onClick={() => setDoneness(d)}>
                    {d.replace(/_/g, ' ')}
                    <span style={{ marginLeft: 6, color: '#8B1A1A' }}>{profile.doneness_targets[d]}°C</span>
                  </Pill>
                ))}
              </div>
            </div>
            <hr className="cf-divider" />
          </>
        )}

        {/* Wrap toggle (low&slow seulement) */}
        {supportsWrap && (
          <div>
            <div className="cf-eyebrow" style={{ marginBottom: 14 }}>Wrap (Texas Crutch)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={() => setWrapped(true)}
                style={{
                  padding: '14px 16px',
                  border: wrapped ? '2px solid #8B1A1A' : '1.5px solid rgba(31,26,20,0.2)',
                  background: wrapped ? '#FBE9E0' : '#FAF6EE',
                  color: '#1F1A14',
                  fontFamily: 'var(--cf-serif)',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>🥩 Avec wrap</div>
                <div style={{ fontSize: 11, color: '#6E6356', fontFamily: 'var(--cf-mono)', marginTop: 4, letterSpacing: 0, textTransform: 'none' }}>
                  Plus rapide, bark moins épaisse
                </div>
              </button>
              <button
                onClick={() => setWrapped(false)}
                style={{
                  padding: '14px 16px',
                  border: !wrapped ? '2px solid #8B1A1A' : '1.5px solid rgba(31,26,20,0.2)',
                  background: !wrapped ? '#FBE9E0' : '#FAF6EE',
                  color: '#1F1A14',
                  fontFamily: 'var(--cf-serif)',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>🔥 Sans wrap</div>
                <div style={{ fontSize: 11, color: '#6E6356', fontFamily: 'var(--cf-mono)', marginTop: 4, letterSpacing: 0, textTransform: 'none' }}>
                  Plus long, bark prononcée
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <FireButton size="md" type="ghost" onClick={() => setStep(1)}>
          ← Méthode
        </FireButton>
        <FireButton
          size="lg"
          onClick={handleCalculate}
          icon={<span>→</span>}
          style={{ opacity: result ? 1 : 0.4, pointerEvents: result ? 'auto' : 'none' }}
        >
          Calculer
        </FireButton>
      </div>
    </div>
  )

  // ─── STEP 3 : résultat ──────────────────────
  const totalAvg = result ? Math.round((result.totalLowMinutes + result.totalHighMinutes) / 2) : 0

  const StepResult = result && (
    <div style={{ padding: mobile ? '8px 20px 48px' : '16px 64px 96px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Hero result */}
      <div
        style={{
          background: '#1F1A14',
          color: '#F5EFE0',
          padding: mobile ? 20 : 32,
          marginBottom: 20,
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid #8B1A1A',
        }}
      >
        <SmokeBackdrop intensity={0.3} dark={true} />
        <EmberGlow count={10} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div className="cf-eyebrow" style={{ color: '#E8A53C' }}>Ton plan de cuisson</div>
            <div style={{ height: 1, flex: 1, background: 'rgba(245,239,224,0.15)', minWidth: 40 }} />
            <div
              style={{
                fontFamily: 'var(--cf-serif)',
                fontSize: 14,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#B8AC97',
              }}
            >
              {profile.name}{!isFixedTime && weightKg ? ` · ${parseFloat(weightKg)}kg` : ''}
              {!isFixedTime ? ` · ${cookTempC}°C` : ''}
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
              gap: mobile ? 16 : 24,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--cf-serif)',
                  fontSize: mobile ? 40 : 60,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: '#E8A53C',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatTime(totalAvg)}
              </div>
              <div className="cf-eyebrow" style={{ color: '#B8AC97', marginTop: 6 }}>Durée totale</div>
              <div style={{ fontSize: 11, color: '#6E6356', marginTop: 4, fontFamily: 'var(--cf-mono)' }}>
                {result.totalEstimate}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--cf-serif)',
                  fontSize: mobile ? 40 : 60,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: '#F5EFE0',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {isFixedTime ? '—' : cookTempC}
                {!isFixedTime && <span style={{ fontSize: mobile ? 20 : 28, color: '#B8AC97' }}>°C</span>}
              </div>
              <div className="cf-eyebrow" style={{ color: '#B8AC97', marginTop: 6 }}>Temp. chambre</div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--cf-serif)',
                  fontSize: mobile ? 40 : 60,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: '#F5EFE0',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {result.targetFinalTemp || profile.cues?.target_temp_min || '—'}
                {(result.targetFinalTemp || profile.cues?.target_temp_min) && (
                  <span style={{ fontSize: mobile ? 20 : 28, color: '#B8AC97' }}>°C</span>
                )}
              </div>
              <div className="cf-eyebrow" style={{ color: '#B8AC97', marginTop: 6 }}>À cœur</div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--cf-serif)',
                  fontSize: mobile ? 40 : 60,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: '#F5EFE0',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {!isFixedTime && weightKg ? Math.round(parseFloat(weightKg) * 0.7 * 10) / 10 : '—'}
                {!isFixedTime && weightKg && <span style={{ fontSize: mobile ? 20 : 28, color: '#B8AC97' }}>kg</span>}
              </div>
              <div className="cf-eyebrow" style={{ color: '#B8AC97', marginTop: 6 }}>Rendement</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline + Timer */}
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1.5fr 1fr', gap: 20 }}>
        <div style={{ background: '#FAF6EE', border: '1.5px solid rgba(31,26,20,0.15)', overflow: 'hidden' }}>
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1.5px solid rgba(31,26,20,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div className="cf-eyebrow">Timeline pitmaster</div>
            <div style={{ fontFamily: 'var(--cf-mono)', fontSize: 11, color: '#8B1A1A' }}>
              {result.phases?.length || 0} phases
            </div>
          </div>
          <CookTimeline phases={result.phases} mobile={mobile} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Timer
            totalSec={Math.max(60, totalAvg * 60)}
            running={running}
            onToggle={() => setRunning((r) => !r)}
            onReset={() => setRunning(false)}
          />
          <div style={{ background: '#FAF6EE', border: '1.5px solid rgba(31,26,20,0.15)', padding: 18 }}>
            <div className="cf-eyebrow" style={{ marginBottom: 12 }}>Checklist pitmaster</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CHECKLIST.map((c, i) => (
                <label
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    cursor: 'pointer',
                    fontSize: 13,
                    lineHeight: 1.4,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!check[i]}
                    onChange={(e) => setCheck({ ...check, [i]: e.target.checked })}
                    style={{ accentColor: '#8B1A1A', marginTop: 2 }}
                  />
                  <span
                    style={{
                      color: check[i] ? '#968A7A' : '#1F1A14',
                      textDecoration: check[i] ? 'line-through' : 'none',
                    }}
                  >
                    {c}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tips/cues si présents */}
      {result.tips && result.tips.length > 0 && (
        <div style={{ marginTop: 20, background: '#FAF6EE', border: '1.5px solid rgba(31,26,20,0.15)', padding: 20 }}>
          <div className="cf-eyebrow" style={{ marginBottom: 12 }}>Conseils du pitmaster</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {result.tips.slice(0, 6).map((t, i) => (
              <li
                key={i}
                style={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: '#3A3025',
                  paddingLeft: 18,
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 6,
                    width: 6,
                    height: 6,
                    background: '#8B1A1A',
                    borderRadius: '50%',
                  }}
                />
                {typeof t === 'string' ? t : t.text || t.label || ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          marginTop: 20,
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(3, 1fr)',
          gap: 10,
        }}
      >
        <FireButton size="md" type="cream" onClick={() => navigator.share?.({ url: window.location.href }).catch(() => {})}>
          ↗ Partager
        </FireButton>
        <FireButton size="md" type="cream" onClick={() => window.print()}>
          ↓ Imprimer
        </FireButton>
        <FireButton size="md" type="primary" onClick={handleReset}>
          ↺ Refaire
        </FireButton>
      </div>
    </div>
  )

  return (
    <div className="cf-root cf-paper-bg" style={{ width: '100%', minHeight: '100vh' }}>
      <CFHeader dark={false} />
      {PageHeader}
      {step === 0 && StepCut}
      {step === 1 && profile && StepMethod}
      {step === 2 && profile && StepParams}
      {step === 3 && result && StepResult}
      <CFFooter mobile={mobile} />
    </div>
  )
}
