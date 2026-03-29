import { useState, useMemo } from 'react'
import { useCalculatorData } from '../modules/calculator/useCalculatorData.js'
import { calculateCookPlan, formatDuration } from '../modules/calculator/engine.js'
import { DONENESS_LABELS } from '../modules/calculator/data.js'

const CAT_LABELS = { boeuf: 'Boeuf', porc: 'Porc', volaille: 'Volaille', agneau: 'Agneau' }

export default function CalculatorPage() {
  const { profiles, loading } = useCalculatorData()

  const [selectedProfile, setSelectedProfile] = useState(null)
  const [weightKg, setWeightKg] = useState('')
  const [cookTempC, setCookTempC] = useState(110)
  const [wrapped, setWrapped] = useState(false)
  const [eatAt, setEatAt] = useState('19:00')
  const [doneness, setDoneness] = useState('medium_rare')
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(1) // Wizard steps

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
      const midBand = p.temp_bands[Math.floor(p.temp_bands.length / 2)]
      setCookTempC(midBand.temp_c)
    }
    setWrapped(p?.supports_wrap || false)
    setResult(null)
    setStep(2)
  }

  const isReverseSear = selectedProfile?.cook_type === 'reverse_sear'
  const isFixedTime = !!selectedProfile?.fixed_times
  const canCalculate = selectedProfile && (isFixedTime || weightKg) && eatAt

  const handleCalculate = () => {
    if (!canCalculate) return
    const plan = calculateCookPlan({
      profile: selectedProfile,
      weightKg: isFixedTime ? 0 : parseFloat(weightKg),
      cookTempC: isFixedTime ? 0 : cookTempC,
      wrapped,
      eatAt,
      doneness: isReverseSear ? doneness : null,
    })
    setResult(plan)
  }

  const handleReset = () => {
    setResult(null)
    setStep(1)
    setSelectedProfile(null)
    setWeightKg('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
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

      {/* ══════════ HEADER BAR ══════════ */}
      <div className="px-6 lg:px-10 py-5 border-b border-white/[0.06]">
        <div className="max-w-4xl flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-white tracking-tight">Calculateur</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">Planifie ta cuisson BBQ en quelques clics</p>
          </div>
          {result && (
            <button
              onClick={handleReset}
              className="text-[13px] font-medium text-zinc-400 hover:text-white px-4 py-2 rounded-xl hover:bg-white/[0.04] transition-all"
            >
              ← Nouvelle cuisson
            </button>
          )}
        </div>
      </div>

      <div className="px-6 lg:px-10 py-8 max-w-4xl">

        {/* ══════════ WIZARD: NO RESULT ══════════ */}
        {!result && (
          <>
            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-8">
              <StepPill num={1} label="Viande" active={step >= 1} current={step === 1} />
              <div className={`h-px flex-1 ${step >= 2 ? 'bg-orange-500/30' : 'bg-white/[0.06]'}`} />
              <StepPill num={2} label="Réglages" active={step >= 2} current={step === 2} />
              <div className={`h-px flex-1 ${step >= 3 ? 'bg-orange-500/30' : 'bg-white/[0.06]'}`} />
              <StepPill num={3} label="Résultat" active={result !== null} current={false} />
            </div>

            {/* ── STEP 1: Meat selection ── */}
            {step >= 1 && (
              <div className="animate-fade-up">
                <SectionHeader
                  title="Choisis ta pièce"
                  description="Sélectionne la viande. L'outil adapte automatiquement la méthode et les temps."
                />

                <div className="space-y-6 stagger">
                  {Object.entries(profilesByCategory).map(([cat, items]) => (
                    <div key={cat}>
                      <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3 px-1">
                        {CAT_LABELS[cat]}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {items.map((p) => {
                          const active = selectedProfile?.id === p.id
                          return (
                            <button
                              key={p.id}
                              onClick={() => handleProfileSelect(p.id)}
                              className={`surface text-left p-4 transition-all group ${active ? 'surface-active' : ''}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors ${
                                  active ? 'bg-orange-500/10' : 'bg-white/[0.03]'
                                }`}>
                                  {p.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[13px] font-semibold transition-colors ${
                                    active ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                                  }`}>
                                    {p.name}
                                  </p>
                                  <p className="text-[11px] text-zinc-600">
                                    {p.cook_type === 'reverse_sear' ? 'Reverse sear' : 'Low & slow'}
                                    {p.fixed_times ? ' · Temps fixe' : ''}
                                  </p>
                                </div>
                                {active && (
                                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  </div>
                                )}
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

            {/* ── STEP 2: Settings ── */}
            {step >= 2 && selectedProfile && (
              <div className="mt-10 animate-fade-up">
                <SectionHeader
                  title="Règle ta cuisson"
                  description="Ajuste les paramètres. Le calculateur s'adapte en temps réel."
                />

                <div className="space-y-4">

                  {/* Selected meat recap */}
                  <div className="surface p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-2xl">
                      {selectedProfile.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-white">{selectedProfile.name}</p>
                      <p className="text-[12px] text-zinc-500">
                        {selectedProfile.cook_type === 'reverse_sear' ? 'Reverse sear' : 'Low & slow'}
                        {selectedProfile.supports_wrap ? ' · Wrap possible' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => { setStep(1); setSelectedProfile(null); setResult(null) }}
                      className="text-[12px] text-zinc-500 hover:text-orange-400 font-medium transition-colors"
                    >
                      Changer
                    </button>
                  </div>

                  {/* Weight */}
                  {!isFixedTime && (
                    <div className="surface p-5">
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3 block">
                        Poids de la pièce
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-[200px]">
                          <input
                            type="number"
                            step="0.1"
                            min="0.5"
                            max="20"
                            value={weightKg}
                            onChange={(e) => { setWeightKg(e.target.value); setResult(null) }}
                            placeholder="4.0"
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[18px] font-semibold text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500/30 focus:bg-white/[0.04] transition-all"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-zinc-600 font-medium">kg</span>
                        </div>
                        <div className="flex gap-1.5">
                          {[2, 3, 4, 5, 6, 8].map((w) => (
                            <button
                              key={w}
                              onClick={() => { setWeightKg(String(w)); setResult(null) }}
                              className={`px-3 py-2 rounded-lg text-[12px] font-medium border transition-all ${
                                weightKg === String(w)
                                  ? 'border-orange-500/30 bg-orange-500/8 text-orange-400'
                                  : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]'
                              }`}
                            >
                              {w}kg
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Temperature */}
                  {!isFixedTime && (
                    <div className="surface p-5">
                      <div className="flex items-center justify-between mb-5">
                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em]">
                          Température fumoir
                        </label>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[28px] font-bold text-white tracking-tight">{cookTempC}</span>
                          <span className="text-[14px] text-zinc-500 font-medium">°C</span>
                          <span className="text-[11px] text-zinc-700 ml-1">({Math.round(cookTempC * 9/5 + 32)}°F)</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={tempMin}
                        max={tempMax}
                        value={cookTempC}
                        onChange={(e) => { setCookTempC(Number(e.target.value)); setResult(null) }}
                        className="w-full mb-3"
                      />
                      <div className="flex justify-between text-[11px] text-zinc-600">
                        <span>{tempMin}°C</span>
                        <span className="text-orange-500/60">{Math.round((tempMin + tempMax) / 2)}°C recommandé</span>
                        <span>{tempMax}°C</span>
                      </div>
                    </div>
                  )}

                  {/* Doneness (reverse sear) */}
                  {isReverseSear && (
                    <div className="surface p-5">
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3 block">
                        Cuisson souhaitée
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(DONENESS_LABELS).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => { setDoneness(key); setResult(null) }}
                            className={`px-4 py-2.5 rounded-xl text-[13px] font-medium border transition-all ${
                              doneness === key
                                ? 'bg-orange-500/8 border-orange-500/25 text-orange-400'
                                : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]'
                            }`}
                          >
                            {label}
                            <span className="text-[11px] ml-1 text-zinc-600">
                              {selectedProfile.doneness_targets[key]}°C
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Wrap */}
                  {selectedProfile.supports_wrap && (
                    <div className="surface p-5">
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3 block">
                        Emballage (Texas crutch)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <WrapOption
                          active={wrapped}
                          onClick={() => { setWrapped(true); setResult(null) }}
                          title="Avec wrap"
                          description="Plus rapide, moins de bark"
                          icon="📦"
                        />
                        <WrapOption
                          active={!wrapped}
                          onClick={() => { setWrapped(false); setResult(null) }}
                          title="Sans wrap"
                          description="Plus long, bark prononcée"
                          icon="🔥"
                        />
                      </div>
                    </div>
                  )}

                  {/* Service time */}
                  <div className="surface p-5">
                    <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3 block">
                      Heure de service
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="time"
                        value={eatAt}
                        onChange={(e) => { setEatAt(e.target.value); setResult(null) }}
                        className="px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[18px] font-semibold text-white focus:outline-none focus:border-orange-500/30 transition-all"
                      />
                      <div className="flex gap-1.5">
                        {['12:00', '13:00', '19:00', '20:00'].map((t) => (
                          <button
                            key={t}
                            onClick={() => { setEatAt(t); setResult(null) }}
                            className={`px-3 py-2 rounded-lg text-[12px] font-medium border transition-all ${
                              eatAt === t
                                ? 'border-orange-500/30 bg-orange-500/8 text-orange-400'
                                : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Calculate button */}
                  {canCalculate && (
                    <button
                      onClick={handleCalculate}
                      className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                    >
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
        {result && <ResultView result={result} formatDuration={formatDuration} />}
      </div>
    </div>
  )
}

/* ── Subcomponents ─────────────────────────────────── */

function StepPill({ num, label, active, current }) {
  return (
    <div className={`flex items-center gap-2 ${current ? '' : ''}`}>
      <div className={`w-7 h-7 rounded-full text-[12px] font-bold flex items-center justify-center transition-all ${
        active
          ? 'bg-orange-500 text-white'
          : 'bg-white/[0.04] text-zinc-600'
      }`}>
        {num}
      </div>
      <span className={`text-[12px] font-medium hidden sm:inline ${
        active ? 'text-zinc-300' : 'text-zinc-600'
      }`}>{label}</span>
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
    <button
      onClick={onClick}
      className={`surface p-4 text-left transition-all ${active ? 'surface-active' : ''}`}
    >
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

function ResultView({ result, formatDuration }) {
  return (
    <div className="animate-fade-up space-y-4">

      {/* Hero stat */}
      <div className="surface p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-orange-500/[0.03] rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center animate-pulse-glow">
              <span className="text-lg">🔥</span>
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-white">Plan de cuisson</h2>
              <p className="text-[12px] text-zinc-500">
                {result.profile}
                {result.weightKg > 0 ? ` · ${result.weightKg} kg` : ''}
                {result.cookTempC > 0 ? ` · ${result.cookTempC}°C` : ' · Temps fixe'}
              </p>
            </div>
          </div>

          {/* Key stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard label="Allumage fumoir" value={result.preheatStart} accent />
            <StatCard label="Viande en cuisson" value={result.meatOnTime} accent />
            <StatCard label="Durée estimée" value={formatDuration(result.cookMinutes)} />
            <StatCard label="Repos" value={`~${result.restMinutes} min`} />
            <StatCard label="Service idéal" value={`${result.serviceWindow.idealStart} – ${result.serviceWindow.idealEnd}`} accent />
            <StatCard label="Acceptable" value={result.serviceWindow.acceptableEnd} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="surface p-6">
        <h3 className="text-[15px] font-bold text-white mb-5 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          Timeline & repères
        </h3>
        <div className="space-y-0 stagger">
          {result.steps.map((step, i) => (
            <TimelineRow key={i} step={step} isLast={i === result.steps.length - 1} />
          ))}
        </div>
      </div>

      {/* Tips */}
      {result.tips?.length > 0 && (
        <div className="surface p-6">
          <h3 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><path d="M12 2v1m0 18v1m-9-10H2m20 0h-1M5.6 5.6l-.7-.7m13.5 13.5l-.7-.7M5.6 18.4l-.7.7M18.4 5.6l.7-.7" /><circle cx="12" cy="12" r="4" /></svg>
            Conseils pitmaster
          </h3>
          <div className="space-y-3">
            {result.tips.map((tip, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-1 h-1 rounded-full bg-orange-500/60 mt-2 shrink-0" />
                <p className="text-[13px] text-zinc-400 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`rounded-xl p-4 ${accent ? 'bg-white/[0.04]' : 'bg-white/[0.02]'} border border-white/[0.04]`}>
      <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.08em] mb-1">{label}</p>
      <p className={`text-[16px] font-bold ${accent ? 'text-orange-400' : 'text-zinc-200'}`}>{value}</p>
    </div>
  )
}

function TimelineRow({ step, isLast }) {
  const colors = {
    preheat: 'bg-amber-500', cook_start: 'bg-orange-500', stall: 'bg-yellow-500',
    wrap: 'bg-blue-400', test: 'bg-emerald-500', pull: 'bg-violet-400',
    sear: 'bg-red-400', rest: 'bg-purple-400',
    service_ideal: 'bg-orange-500', service_acceptable: 'bg-zinc-500',
  }

  return (
    <div className="flex gap-4 items-start group">
      <div className="flex flex-col items-center pt-0.5">
        <div className={`w-2 h-2 rounded-full ${colors[step.type] || 'bg-zinc-600'} ring-[3px] ring-[#111113] shrink-0 group-hover:ring-[#18181b] transition-colors`} />
        {!isLast && <div className="w-px h-10 bg-white/[0.06]" />}
      </div>
      <div className="pb-4 -mt-0.5 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {step.time ? (
            <span className="text-[13px] font-mono font-bold text-orange-400">{step.time}</span>
          ) : (
            <span className="badge badge-muted">repère</span>
          )}
          <span className="text-[13px] font-semibold text-zinc-200">{step.label}</span>
        </div>
        <p className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed">{step.description}</p>
      </div>
    </div>
  )
}
