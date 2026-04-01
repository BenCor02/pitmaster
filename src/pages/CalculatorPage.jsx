import { useState, useMemo, useEffect, useRef } from 'react'
import { useCalculatorData } from '../modules/calculator/useCalculatorData.js'
import { calculateCookPlan } from '../modules/calculator/engine.js'
import { DONENESS_LABELS } from '../modules/calculator/data.js'
import { Link } from 'react-router-dom'
import ContentBlocks from '../components/content/ContentBlocks.jsx'
import ResultView from '../components/calculator/ResultView.jsx'
import { ActionBar, RubSection } from '../components/calculator/ActionCards.jsx'
import { RUB_SUGGESTIONS } from '../components/calculator/rubData.js'

const CAT_LABELS = { boeuf: 'Boeuf', porc: 'Porc', volaille: 'Volaille', agneau: 'Agneau' }

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

const VALID_DONENESS = ['bleu', 'rare', 'medium_rare', 'medium', 'medium_well', 'well_done']

function readFromURL() {
  const params = new URLSearchParams(window.location.search)
  const m = params.get('m')
  if (!m) return null

  // Bounds checking sur les paramètres numériques
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

  const [selectedProfile, setSelectedProfile] = useState(null)
  const [weightKg, setWeightKg] = useState('')
  const [cookTempC, setCookTempC] = useState(110)
  const [wrapped, setWrapped] = useState(false)
  const [doneness, setDoneness] = useState('medium_rare')
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(1)

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

      {/* ══════════ HERO ══════════ */}
      {!result && step === 1 && !selectedProfile && (
        <HeroSection profiles={profiles} onSelect={handleProfileSelect} />
      )}

      {/* ══════════ HEADER BAR ══════════ */}
      {(result || selectedProfile) && (
        <div className="px-6 lg:px-12 py-5 border-b border-white/[0.05] bg-[#080808]/80 backdrop-blur-sm">
          <div className="max-w-4xl flex items-center justify-between">
            <div>
              <h1 className="font-display text-[20px] font-bold text-[#f5f0eb] tracking-tight">
                {result ? '🔥 Assistant cuisson' : '🔥 Calculateur'}
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
            <div className="flex items-center gap-3 mb-8">
              <StepPill num={1} label="Viande" active={step >= 1} />
              <div className={`h-px flex-1 ${step >= 2 ? 'bg-[#ff6b1a]/30' : 'bg-white/[0.06]'}`} />
              <StepPill num={2} label="Réglages" active={step >= 2} />
              <div className="h-px flex-1 bg-white/[0.06]" />
              <StepPill num={3} label="Résultat" active={false} />
            </div>

            {/* STEP 1: Meat selection */}
            {step >= 1 && (
              <div className="animate-fade-up">
                <SectionHeader title="Choisis ta pièce" description="L'outil adapte automatiquement la méthode et les repères." />
                <div className="space-y-6 stagger">
                  {Object.entries(profilesByCategory).map(([cat, items]) => (
                    <div key={cat}>
                      <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3 px-1">{CAT_LABELS[cat]}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {items.map((p) => {
                          const active = selectedProfile?.id === p.id
                          return (
                            <button key={p.id} onClick={() => handleProfileSelect(p.id)} className={`surface text-left p-4 transition-all group ${active ? 'surface-active' : ''}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors ${active ? 'bg-[#ff6b1a]/10' : 'bg-white/[0.03]'}`}>{p.icon}</div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[13px] font-semibold transition-colors ${active ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>{p.name}</p>
                                  <p className="text-[11px] text-zinc-600">{p.cook_type === 'reverse_sear' ? 'Reverse sear' : 'Low & slow'}{p.fixed_times ? ' · Temps fixe' : ''}</p>
                                </div>
                                {active && <CheckIcon />}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Settings */}
            {step >= 2 && selectedProfile && (
              <div ref={step2Ref} className="mt-10 animate-fade-up scroll-mt-20">
                <SectionHeader title="Règle ta cuisson" description="Ajuste les paramètres. Durées approximatives, pas de fausse précision." />
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
                  {isReverseSear && (
                    <div className="surface p-5">
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3 block">Cuisson souhaitée</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(DONENESS_LABELS).map(([key, label]) => (
                          <button key={key} onClick={() => { setDoneness(key); setResult(null) }} className={`px-4 py-2.5 rounded-xl text-[13px] font-medium border transition-all ${doneness === key ? 'bg-[#ff6b1a]/8 border-[#ff6b1a]/25 text-[#ff6b1a]' : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]'}`}>
                            {label} <span className="text-[11px] ml-1 text-zinc-600">{selectedProfile.doneness_targets[key]}°C</span>
                          </button>
                        ))}
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
                      <span>Lancer l'assistant cuisson</span>
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

// ── Hero section ────────────────────────────────────────

function HeroSection({ profiles, onSelect }) {
  return (
    <>
      <div className="relative overflow-hidden min-h-[92vh] lg:min-h-[80vh] flex items-end">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1800&h=1000&fit=crop&q=90" alt="" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/85 to-[#080808]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-[#080808] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#ff6b1a]/[0.03] to-transparent" />
        </div>

        <div className="relative px-6 lg:px-12 pb-16 lg:pb-24 pt-12 max-w-5xl w-full">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.07] backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-[#ff6b1a] animate-pulse" />
              <span className="text-[11px] font-bold text-[#ff8c4a] uppercase tracking-[0.1em]">Du débutant au pitmaster</span>
            </div>

            <h1 className="font-display text-[38px] sm:text-[48px] lg:text-[64px] font-black text-[#f5f0eb] tracking-tight leading-[1.02] mb-5">
              Réussis ta cuisson,<br />
              <span className="text-gradient">à tous les niveaux.</span>
            </h1>
            <p className="text-[16px] lg:text-[18px] text-stone-400 max-w-xl leading-relaxed mb-10">
              Que tu débutes ou que tu maîtrises le fumoir, l'outil calcule temps, phases et repères pour une viande parfaite à chaque fois.
            </p>

            <div className="flex flex-wrap gap-6 sm:gap-10 mb-12">
              <HeroStat icon="🔥" value="9" label="Profils viande" />
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
              <HeroStat icon="🧂" value="50+" label="Recettes & Rubs" accent />
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/[0.08] to-transparent hidden sm:block" />
              <HeroStat icon="✓" value="100%" label="Testé terrain" />
            </div>

            <div className="space-y-4">
              <p className="text-[10px] text-stone-600 font-bold uppercase tracking-[0.15em]">Choisis ta viande pour commencer</p>
              <div className="flex flex-wrap gap-2.5">
                {profiles?.slice(0, 5).map((p) => (
                  <button key={p.id} onClick={() => onSelect(p.id)} className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.07] hover:border-[#ff6b1a]/25 text-[13px] font-semibold text-stone-300 hover:text-white transition-all group backdrop-blur-md shadow-lg shadow-black/20">
                    <span className="text-xl group-hover:scale-110 transition-transform">{p.icon}</span>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meat grid */}
      <div className="px-6 lg:px-12 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="badge badge-accent mx-auto mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b1a] mr-2" />
            Viandes supportées
          </div>
          <h2 className="font-display text-[26px] lg:text-[34px] font-black text-[#f5f0eb] tracking-tight leading-tight">
            Chaque pièce a <span className="text-gradient-static">sa méthode.</span>
          </h2>
          <p className="text-[14px] text-stone-500 mt-2 max-w-md mx-auto">Sélectionne une viande pour obtenir un plan de cuisson précis, avec les bons repères.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 stagger">
          {profiles?.map((p) => (
            <button key={p.id} onClick={() => onSelect(p.id)} className="group card-premium p-0 text-left">
              <div className="h-[90px] overflow-hidden bg-gradient-to-br from-stone-800/50 to-stone-900/50 flex items-center justify-center">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-500">{p.icon}</span>
              </div>
              <div className="p-3.5">
                <p className="text-[13px] font-bold text-stone-200 group-hover:text-white transition-colors">{p.name}</p>
                <p className="text-[10px] text-stone-600 mt-0.5">{p.cook_type === 'reverse_sear' ? 'Reverse sear' : 'Low & slow'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="section-separator">
        <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1400&h=200&fit=crop&q=80" alt="" loading="lazy" />
      </div>

      {/* Why this tool */}
      <div className="section-alt py-16">
        <div className="px-6 lg:px-12 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-[24px] lg:text-[30px] font-black text-[#f5f0eb] tracking-tight">
              Pas un chrono. <span className="text-gradient-static">Un vrai assistant.</span>
            </h2>
            <p className="text-[14px] text-stone-500 mt-2 max-w-lg mx-auto">Accessible aux débutants, précis pour les confirmés. Chaque donnée est basée sur des cuissons réelles.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FeatureCard icon="🎯" title="Précis" description="Fourchettes basées sur des cuissons réelles, pas des formules théoriques." badge="Données terrain" />
            <FeatureCard icon="🔥" title="Complet" description="Phases, rubs, wrap, repos, conseils. Tout en un seul endroit." badge="Recommandé" />
            <FeatureCard icon="📱" title="Mobile-first" description="Utilisable en plein air, devant ton fumoir, une main sur la viande." badge="Responsive" />
          </div>
        </div>
      </div>

      <div className="section-separator">
        <img src="https://images.unsplash.com/photo-1558030006-450675393462?w=1400&h=200&fit=crop&q=80" alt="" loading="lazy" />
      </div>

      {/* Community CTA */}
      <div className="px-6 lg:px-12 py-16 max-w-5xl mx-auto">
        <div className="surface-fire p-8 lg:p-10 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#ff6b1a]/[0.04] rounded-full blur-[60px] pointer-events-none" />
          <div className="relative">
            <span className="text-3xl mb-4 block">🏆</span>
            <h3 className="font-display text-[22px] lg:text-[26px] font-black text-white mb-3">Rejoins la communauté</h3>
            <p className="text-[14px] text-stone-400 max-w-md mx-auto mb-6 leading-relaxed">
              Débutants comme confirmés utilisent Charbon & Flamme pour planifier leurs cuissons. Gratuit, sans pub, sans compromis.
            </p>
            <Link to="/recettes" className="btn-primary inline-flex items-center gap-2">
              <span>🧂</span>
              Explorer les recettes
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Small reusable components ───────────────────────────

function HeroStat({ icon, value, label, accent }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ff6b1a]/15 to-[#dc2626]/10 flex items-center justify-center border border-[#ff6b1a]/10">
        <span className="text-lg">{icon}</span>
      </div>
      <div>
        <p className={`text-[22px] font-black font-display leading-none ${accent ? 'text-[#ff6b1a]' : 'text-white'}`}>{value}</p>
        <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, badge }) {
  return (
    <div className="surface p-6 text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#ff6b1a]/12 to-[#dc2626]/8 flex items-center justify-center border border-[#ff6b1a]/8">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-[15px] font-bold text-white mb-1.5">{title}</h3>
      <p className="text-[12px] text-stone-500 leading-relaxed">{description}</p>
      <div className="badge badge-precision mt-3 text-[9px]">{badge}</div>
    </div>
  )
}

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

function SectionHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="text-[18px] font-bold text-white tracking-tight">{title}</h2>
      {description && <p className="text-[13px] text-zinc-500 mt-1">{description}</p>}
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
