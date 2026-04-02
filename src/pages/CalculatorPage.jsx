import { useState, useMemo, useEffect, useRef } from 'react'
import { updateMeta, injectJsonLd } from '../lib/seo.js'
import { useCalculatorData } from '../modules/calculator/useCalculatorData.js'
import { calculateCookPlan } from '../modules/calculator/engine.js'
import { DONENESS_LABELS } from '../modules/calculator/data.js'
import ContentBlocks from '../components/content/ContentBlocks.jsx'
import ResultView from '../components/calculator/ResultView.jsx'
import { ActionBar, RubSection } from '../components/calculator/ActionCards.jsx'
import { RUB_SUGGESTIONS } from '../components/calculator/rubData.js'

const CAT_ORDER = ['boeuf', 'porc', 'agneau', 'volaille']
const CAT_META = {
  boeuf:    { label: 'Boeuf',    icon: '🥩', desc: 'Brisket, côtes, steaks épais' },
  porc:     { label: 'Porc',     icon: '🐷', desc: 'Pulled pork, ribs, filet' },
  agneau:   { label: 'Agneau',   icon: '🐑', desc: 'Épaule, souris, carré' },
  volaille: { label: 'Volaille', icon: '🍗', desc: 'Poulet, dinde, canard' },
}

// ── URL persistence ─────────────────────────────────────

function saveToURL(params) {
  const url = new URL(window.location)
  if (params) {
    url.searchParams.set('m', params.profileId)
    url.searchParams.set('w', params.weightKg)
    url.searchParams.set('t', params.cookTempC)
    url.searchParams.set('wr', params.wrapped ? '1' : '0')
    if (params.doneness) url.searchParams.set('d', params.doneness)
  } else {
    url.searchParams.delete('m')
    url.searchParams.delete('w')
    url.searchParams.delete('t')
    url.searchParams.delete('wr')
    url.searchParams.delete('d')
  }
  window.history.replaceState({}, '', url)
}

const VALID_DONENESS = ['bleu', 'rare', 'medium_rare', 'medium', 'medium_well', 'well_done', 'rose', 'a_point', 'bien_cuit']

function readFromURL() {
  const params = new URLSearchParams(window.location.search)
  const m = params.get('m')
  if (!m) return null

  const rawWeight = parseFloat(params.get('w'))
  const weightKg = (!isNaN(rawWeight) && rawWeight >= 0.1 && rawWeight <= 25) ? String(rawWeight) : ''

  const rawTemp = Number(params.get('t'))
  const cookTempC = (!isNaN(rawTemp) && rawTemp >= 50 && rawTemp <= 400) ? rawTemp : 110

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

// ── Main component ──────────────────────────────────────

export default function CalculatorPage() {
  const { profiles, loading } = useCalculatorData()

  useEffect(() => {
    updateMeta({
      title: 'Calculateur BBQ — Temps de cuisson brisket, pulled pork, ribs | Charbon & Flamme',
      description: 'Calcule le temps de cuisson exact pour ton BBQ : brisket, pulled pork, ribs, poulet fumé, reverse sear. Température, repos, wrap — tout est calculé automatiquement.',
      canonical: 'https://charbonetflamme.fr/calculateur',
    })
    injectJsonLd('calculator-schema', {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Calculateur BBQ Charbon & Flamme',
      url: 'https://charbonetflamme.fr/calculateur',
      applicationCategory: 'UtilitiesApplication',
      description: 'Calculateur de temps de cuisson BBQ pour brisket, pulled pork, ribs, poulet fumé et plus. Intègre wrap, température fumoir et repos.',
      inLanguage: 'fr',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    })
    return () => injectJsonLd('calculator-schema', null)
  }, [])

  const [selectedProfile, setSelectedProfile] = useState(null)
  const [weightKg, setWeightKg] = useState('')
  const [cookTempC, setCookTempC] = useState(110)
  const [wrapped, setWrapped] = useState(false)
  const [doneness, setDoneness] = useState('medium_rare')
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(1)
  const [activeTab, setActiveTab] = useState('boeuf')

  const step2Ref = useRef(null)
  const resultRef = useRef(null)

  // Restore from URL
  useEffect(() => {
    if (!profiles || profiles.length === 0) return
    const saved = readFromURL()
    if (!saved) return
    const p = profiles.find(m => m.id === saved.profileId)
    if (!p) return
    setSelectedProfile(p)
    setWeightKg(saved.weightKg)
    setCookTempC(saved.cookTempC)
    setWrapped(saved.wrapped)
    setDoneness(saved.doneness)
    setActiveTab(p.category || 'boeuf')
    setStep(2)
    const isFixed = !!p.fixed_times
    const isRS = p.cook_type === 'reverse_sear'
    if (isFixed || saved.weightKg) {
      setResult(calculateCookPlan({
        profile: p,
        weightKg: isFixed ? 0 : parseFloat(saved.weightKg),
        cookTempC: isFixed ? 0 : saved.cookTempC,
        wrapped: saved.wrapped,
        doneness: isRS ? saved.doneness : null,
      }))
    }
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

  const handleProfileSelect = (id) => {
    const p = profiles.find((m) => m.id === id)
    setSelectedProfile(p)
    if (p?.temp_bands?.length) {
      setCookTempC(p.temp_bands[Math.floor(p.temp_bands.length / 2)].temp_c)
    }
    setWrapped(p?.supports_wrap || false)
    // Doneness par défaut selon le profil (ex: porc = rosé, boeuf = medium_rare)
    const defaultDoneness = p?.default_doneness || (p?.doneness_targets ? Object.keys(p.doneness_targets)[0] : 'medium_rare')
    setDoneness(defaultDoneness)
    setResult(null)
    setStep(2)
    setTimeout(() => step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const isReverseSear = selectedProfile?.cook_type === 'reverse_sear'
  const isFixedTime = !!selectedProfile?.fixed_times
  const canCalculate = selectedProfile && (isFixedTime || weightKg)

  const handleCalculate = () => {
    if (!canCalculate) return
    const plan = calculateCookPlan({
      profile: selectedProfile,
      weightKg: isFixedTime ? 0 : parseFloat(weightKg),
      cookTempC: isFixedTime ? 0 : cookTempC,
      wrapped,
      doneness: isReverseSear ? doneness : null,
    })
    setResult(plan)
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    saveToURL({ profileId: selectedProfile.id, weightKg, cookTempC, wrapped, doneness: isReverseSear ? doneness : null })
  }

  const handleReset = () => {
    setResult(null)
    setStep(1)
    setSelectedProfile(null)
    setWeightKg('')
    saveToURL(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff6b1a] to-red-600 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-xl">🔥</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  const tempMin = selectedProfile?.temp_bands?.[0]?.temp_c || 100
  const tempMax = selectedProfile?.temp_bands?.[selectedProfile.temp_bands.length - 1]?.temp_c || 150

  return (
    <div className="min-h-screen">

      {/* ══════════ HERO COMPACT ══════════ */}
      {!result && step === 1 && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#ff6b1a]/[0.04] to-transparent pointer-events-none" />
          <div className="px-6 lg:px-12 pt-10 pb-8 max-w-4xl">
            <div className="animate-fade-up">
              <h1 className="font-display text-[28px] sm:text-[36px] lg:text-[42px] font-black text-[#f5f0eb] tracking-tight leading-[1.08]">
                Planifie ta cuisson <span className="text-gradient">au fumoir</span>
              </h1>
              <p className="text-[15px] text-stone-400 mt-3 max-w-lg leading-relaxed">
                Choisis ta viande, entre le poids et la temp. L'outil te donne un plan complet : durée, phases, wrap, repos et repères de pitmaster.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ HEADER BAR (pendant wizard step 2 ou résultat) ══════════ */}
      {(result || (step >= 2 && selectedProfile)) && (
        <div className="px-6 lg:px-12 py-5 border-b border-white/[0.05] bg-[#080808]/80 backdrop-blur-sm">
          <div className="max-w-4xl flex items-center justify-between">
            <div>
              <h1 className="font-display text-[20px] font-bold text-[#f5f0eb] tracking-tight">
                {result ? '🔥 Plan de cuisson' : '🔥 Calculateur'}
              </h1>
              <p className="text-[13px] text-stone-500 mt-0.5">
                {result ? `${result.profile} — prêt dans environ ${result.totalEstimate.replace('~', '')}` : 'Configure les paramètres ci-dessous'}
              </p>
            </div>
            <button onClick={handleReset} className="text-[13px] font-medium text-stone-400 hover:text-white px-4 py-2.5 rounded-xl hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/[0.10] transition-all">
              ← {result ? 'Nouvelle cuisson' : 'Retour'}
            </button>
          </div>
        </div>
      )}

      <div className="px-6 lg:px-12 py-8 max-w-4xl">

        {/* ══════════ WIZARD ══════════ */}
        {!result && (
          <>
            {/* Steps indicator */}
            {step >= 2 && (
              <div className="flex items-center gap-3 mb-8">
                <StepPill num={1} label="Viande" active={step >= 1} />
                <div className={`h-px flex-1 ${step >= 2 ? 'bg-[#ff6b1a]/30' : 'bg-white/[0.06]'}`} />
                <StepPill num={2} label="Réglages" active={step >= 2} />
                <div className="h-px flex-1 bg-white/[0.06]" />
                <StepPill num={3} label="Résultat" active={false} />
              </div>
            )}

            {/* STEP 1: Meat selection avec onglets */}
            {step === 1 && (
              <div className="animate-fade-up">
                {/* Onglets catégorie */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
                  {CAT_ORDER.filter(cat => profilesByCategory[cat]?.length).map((cat) => {
                    const meta = CAT_META[cat]
                    const active = activeTab === cat
                    const count = profilesByCategory[cat]?.length || 0
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-[13px] font-semibold whitespace-nowrap border transition-all ${
                          active
                            ? 'bg-[#ff6b1a]/[0.08] border-[#ff6b1a]/25 text-white'
                            : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12]'
                        }`}
                      >
                        <span className="text-lg">{meta.icon}</span>
                        {meta.label}
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${active ? 'bg-[#ff6b1a]/20 text-[#ff8c4a]' : 'bg-white/[0.04] text-zinc-600'}`}>{count}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Grille viandes de l'onglet actif */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 animate-fade">
                  {(profilesByCategory[activeTab] || []).map((p) => {
                    const active = selectedProfile?.id === p.id
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleProfileSelect(p.id)}
                        className={`surface text-left p-4 transition-all group ${active ? 'surface-active' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-colors ${active ? 'bg-[#ff6b1a]/10' : 'bg-white/[0.03] group-hover:bg-white/[0.05]'}`}>
                            {p.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[14px] font-semibold transition-colors ${active ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                              {p.name}
                            </p>
                            <p className="text-[11px] text-zinc-600 mt-0.5">
                              {p.cook_type === 'reverse_sear' ? 'Reverse sear' : 'Low & slow'}
                              {p.fixed_times ? ' · Temps fixe' : ''}
                              {p.supports_wrap ? ' · Wrap' : ''}
                            </p>
                          </div>
                          {active && <CheckIcon />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Settings */}
            {step >= 2 && selectedProfile && (
              <div ref={step2Ref} className="animate-fade-up scroll-mt-20">
                <div className="space-y-4">

                  {/* Selected meat recap */}
                  <div className="surface p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#ff6b1a]/10 flex items-center justify-center text-2xl">{selectedProfile.icon}</div>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-white">{selectedProfile.name}</p>
                      <p className="text-[12px] text-zinc-500">{selectedProfile.cook_type === 'reverse_sear' ? 'Reverse sear' : 'Low & slow'}{selectedProfile.supports_wrap ? ' · Wrap possible' : ''}</p>
                    </div>
                    <button onClick={() => { setStep(1); setSelectedProfile(null); setResult(null) }} className="text-[12px] text-zinc-500 hover:text-[#ff6b1a] font-medium transition-colors">Changer</button>
                  </div>

                  {/* Weight */}
                  {!isFixedTime && (
                    <div className="surface p-5">
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3 block">Poids de la pièce</label>
                      <div className="relative max-w-[200px] mb-3">
                        <input type="number" inputMode="decimal" step="0.1" min="0.5" max="20" value={weightKg} onChange={(e) => { setWeightKg(e.target.value); setResult(null) }} placeholder="4.0" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[18px] font-semibold text-white placeholder-zinc-700 focus:outline-none focus:border-[#ff6b1a]/30 focus:bg-white/[0.04] transition-all" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-zinc-600 font-medium">kg</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {[2, 3, 4, 5, 6, 8].map((w) => (
                          <button key={w} onClick={() => { setWeightKg(String(w)); setResult(null) }} className={`px-3 py-2 rounded-lg text-[12px] font-medium border transition-all ${weightKg === String(w) ? 'border-[#ff6b1a]/30 bg-[#ff6b1a]/8 text-[#ff6b1a]' : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]'}`}>{w}kg</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Temperature */}
                  {!isFixedTime && (
                    <div className="surface p-5">
                      <div className="flex items-center justify-between mb-5">
                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em]">Température fumoir</label>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[28px] font-bold text-white tracking-tight">{cookTempC}</span>
                          <span className="text-[14px] text-zinc-500 font-medium">°C</span>
                          <span className="text-[11px] text-zinc-700 ml-1">({Math.round(cookTempC * 9/5 + 32)}°F)</span>
                        </div>
                      </div>
                      <input type="range" min={tempMin} max={tempMax} value={cookTempC} onChange={(e) => { setCookTempC(Number(e.target.value)); setResult(null) }} className="w-full mb-3" />
                      <div className="flex justify-between text-[11px] text-zinc-600">
                        <span>{tempMin}°C</span>
                        <span className="text-[#ff6b1a]/60">{Math.round((tempMin + tempMax) / 2)}°C recommandé</span>
                        <span>{tempMax}°C</span>
                      </div>
                    </div>
                  )}

                  {/* Doneness (reverse sear) */}
                  {isReverseSear && selectedProfile.doneness_targets && (
                    <div className="surface p-5">
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3 block">Cuisson souhaitée</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(selectedProfile.doneness_targets).map((key) => {
                          const label = DONENESS_LABELS[key] || key
                          const temp = selectedProfile.doneness_targets[key]
                          return (
                            <button key={key} onClick={() => { setDoneness(key); setResult(null) }} className={`px-4 py-2.5 rounded-xl text-[13px] font-medium border transition-all ${doneness === key ? 'bg-[#ff6b1a]/8 border-[#ff6b1a]/25 text-[#ff6b1a]' : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]'}`}>
                              {label} <span className="text-[11px] ml-1 text-zinc-600">{temp}°C</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Wrap */}
                  {selectedProfile.supports_wrap && (
                    <div className="surface p-5">
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3 block">Emballage (Texas crutch)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <WrapOption active={wrapped} onClick={() => { setWrapped(true); setResult(null) }} title="Avec wrap" description="Plus rapide, moins de bark" icon="🥩" />
                        <WrapOption active={!wrapped} onClick={() => { setWrapped(false); setResult(null) }} title="Sans wrap" description="Plus long, bark prononcée" icon="🔥" />
                      </div>
                    </div>
                  )}

                  {/* Calculate button */}
                  {canCalculate && (
                    <button onClick={handleCalculate} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                      <span>🔥</span>
                      <span>Calculer le plan de cuisson</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════ RESULTS ══════════ */}
        <div ref={resultRef} className="scroll-mt-20" />
        {result && (
          <ResultView
            result={result}
            contentBlocks={<ContentBlocks meatType={result.profileId} cookingMethod={result.cookType} />}
            rubs={RUB_SUGGESTIONS[result.profileId] ? <RubSection rubs={RUB_SUGGESTIONS[result.profileId]} meatName={result.profile} /> : null}
            actionBar={<ActionBar result={result} />}
          />
        )}
      </div>
    </div>
  )
}

// ── Small reusable components ───────────────────────────

function CheckIcon() {
  return (
    <div className="w-5 h-5 rounded-full bg-[#ff6b1a] flex items-center justify-center">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    </div>
  )
}

function StepPill({ num, label, active }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full text-[12px] font-bold flex items-center justify-center transition-all ${active ? 'bg-[#ff6b1a] text-white' : 'bg-white/[0.04] text-zinc-600'}`}>{num}</div>
      <span className={`text-[12px] font-medium hidden sm:inline ${active ? 'text-zinc-300' : 'text-zinc-600'}`}>{label}</span>
    </div>
  )
}

function WrapOption({ active, onClick, title, description, icon }) {
  return (
    <button onClick={onClick} className={`surface p-4 text-left transition-all ${active ? 'surface-active' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <div>
          <p className={`text-[13px] font-semibold ${active ? 'text-white' : 'text-zinc-400'}`}>{title}</p>
          <p className="text-[11px] text-zinc-600">{description}</p>
        </div>
      </div>
    </button>
  )
}
