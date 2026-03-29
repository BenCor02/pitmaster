import { useState, useMemo } from 'react'
import { useCalculatorData } from '../modules/calculator/useCalculatorData.js'
import { calculateCookPlan } from '../modules/calculator/engine.js'
import { DONENESS_LABELS } from '../modules/calculator/data.js'

const CAT_LABELS = { boeuf: 'Boeuf', porc: 'Porc', volaille: 'Volaille', agneau: 'Agneau' }

export default function CalculatorPage() {
  const { profiles, loading } = useCalculatorData()

  const [selectedProfile, setSelectedProfile] = useState(null)
  const [weightKg, setWeightKg] = useState('')
  const [cookTempC, setCookTempC] = useState(110)
  const [wrapped, setWrapped] = useState(false)
  const [doneness, setDoneness] = useState('medium_rare')
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(1)

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

      {/* ══════════ HERO ══════════ */}
      {!result && step === 1 && !selectedProfile && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1400&h=600&fit=crop&q=80"
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/85 to-[#09090b]/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/30" />
          </div>
          <div className="relative px-6 lg:px-10 py-12 lg:py-16 max-w-4xl">
            <div className="animate-fade-up">
              <div className="badge badge-accent mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2 animate-pulse" />
                Assistant Pitmaster
              </div>
              <h1 className="text-[32px] lg:text-[42px] font-extrabold text-white tracking-tight leading-[1.1] mb-3">
                Planifie ta cuisson,<br />
                <span className="text-gradient">comme un vrai pitmaster.</span>
              </h1>
              <p className="text-[15px] lg:text-[16px] text-zinc-400 max-w-md leading-relaxed mb-8">
                Des phases, des repères terrain, des durées honnêtes. Pas d'heure au minute près — juste ce qu'il faut pour réussir ta cuisson.
              </p>
              <div className="flex gap-6 mb-8">
                <div>
                  <p className="text-[24px] font-bold text-white">9</p>
                  <p className="text-[11px] text-zinc-500 font-medium">Profils viande</p>
                </div>
                <div className="w-px bg-white/[0.08]" />
                <div>
                  <p className="text-[24px] font-bold text-white">~</p>
                  <p className="text-[11px] text-zinc-500 font-medium">Durées approx.</p>
                </div>
                <div className="w-px bg-white/[0.08]" />
                <div>
                  <p className="text-[24px] font-bold text-orange-400">100%</p>
                  <p className="text-[11px] text-zinc-500 font-medium">Terrain</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-zinc-600 font-medium uppercase tracking-wider mb-3">Accès rapide</p>
                <div className="flex flex-wrap gap-2">
                  {profiles?.slice(0, 5).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleProfileSelect(p.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] hover:border-white/[0.12] text-[13px] font-medium text-zinc-300 hover:text-white transition-all group"
                    >
                      <span className="text-base group-hover:scale-110 transition-transform">{p.icon}</span>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ HEADER BAR ══════════ */}
      {(result || selectedProfile) && (
        <div className="px-6 lg:px-10 py-5 border-b border-white/[0.06]">
          <div className="max-w-4xl flex items-center justify-between">
            <div>
              <h1 className="text-[20px] font-bold text-white tracking-tight">
                {result ? 'Assistant cuisson' : 'Calculateur'}
              </h1>
              <p className="text-[13px] text-zinc-500 mt-0.5">
                {result ? `${result.profile} — prêt dans environ ${result.totalEstimate.replace('~', '')}` : 'Configure les paramètres'}
              </p>
            </div>
            <button onClick={handleReset} className="text-[13px] font-medium text-zinc-400 hover:text-white px-4 py-2 rounded-xl hover:bg-white/[0.04] transition-all">
              ← {result ? 'Nouvelle cuisson' : 'Retour'}
            </button>
          </div>
        </div>
      )}

      <div className="px-6 lg:px-10 py-8 max-w-4xl">

        {/* ══════════ WIZARD ══════════ */}
        {!result && (
          <>
            <div className="flex items-center gap-3 mb-8">
              <StepPill num={1} label="Viande" active={step >= 1} />
              <div className={`h-px flex-1 ${step >= 2 ? 'bg-orange-500/30' : 'bg-white/[0.06]'}`} />
              <StepPill num={2} label="Réglages" active={step >= 2} />
              <div className={`h-px flex-1 bg-white/[0.06]`} />
              <StepPill num={3} label="Résultat" active={false} />
            </div>

            {/* STEP 1: Meat */}
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
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors ${active ? 'bg-orange-500/10' : 'bg-white/[0.03]'}`}>{p.icon}</div>
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
              <div className="mt-10 animate-fade-up">
                <SectionHeader title="Règle ta cuisson" description="Ajuste les paramètres. Durées approximatives, pas de fausse précision." />
                <div className="space-y-4">

                  {/* Recap */}
                  <div className="surface p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-2xl">{selectedProfile.icon}</div>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-white">{selectedProfile.name}</p>
                      <p className="text-[12px] text-zinc-500">{selectedProfile.cook_type === 'reverse_sear' ? 'Reverse sear' : 'Low & slow'}{selectedProfile.supports_wrap ? ' · Wrap possible' : ''}</p>
                    </div>
                    <button onClick={() => { setStep(1); setSelectedProfile(null); setResult(null) }} className="text-[12px] text-zinc-500 hover:text-orange-400 font-medium transition-colors">Changer</button>
                  </div>

                  {/* Weight */}
                  {!isFixedTime && (
                    <div className="surface p-5">
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3 block">Poids de la pièce</label>
                      <div className="relative max-w-[200px] mb-3">
                        <input type="number" inputMode="decimal" step="0.1" min="0.5" max="20" value={weightKg} onChange={(e) => { setWeightKg(e.target.value); setResult(null) }} placeholder="4.0" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[18px] font-semibold text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500/30 focus:bg-white/[0.04] transition-all" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-zinc-600 font-medium">kg</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {[2, 3, 4, 5, 6, 8].map((w) => (
                          <button key={w} onClick={() => { setWeightKg(String(w)); setResult(null) }} className={`px-3 py-2 rounded-lg text-[12px] font-medium border transition-all ${weightKg === String(w) ? 'border-orange-500/30 bg-orange-500/8 text-orange-400' : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]'}`}>{w}kg</button>
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
                        <span className="text-orange-500/60">{Math.round((tempMin + tempMax) / 2)}°C recommandé</span>
                        <span>{tempMax}°C</span>
                      </div>
                    </div>
                  )}

                  {/* Doneness */}
                  {isReverseSear && (
                    <div className="surface p-5">
                      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3 block">Cuisson souhaitée</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(DONENESS_LABELS).map(([key, label]) => (
                          <button key={key} onClick={() => { setDoneness(key); setResult(null) }} className={`px-4 py-2.5 rounded-xl text-[13px] font-medium border transition-all ${doneness === key ? 'bg-orange-500/8 border-orange-500/25 text-orange-400' : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]'}`}>
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
                        <WrapOption active={wrapped} onClick={() => { setWrapped(true); setResult(null) }} title="Avec wrap" description="Plus rapide, moins de bark" icon="📦" />
                        <WrapOption active={!wrapped} onClick={() => { setWrapped(false); setResult(null) }} title="Sans wrap" description="Plus long, bark prononcée" icon="🔥" />
                      </div>
                    </div>
                  )}

                  {/* Calculate */}
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
        {result && <ResultView result={result} />}
      </div>
    </div>
  )
}

/* ── Small components ─────────────────────────────── */

function CheckIcon() {
  return (
    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    </div>
  )
}

function StepPill({ num, label, active }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full text-[12px] font-bold flex items-center justify-center transition-all ${active ? 'bg-orange-500 text-white' : 'bg-white/[0.04] text-zinc-600'}`}>{num}</div>
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

/* ══════════════════════════════════════════════════════
   RESULT VIEW — Phases, pas de timeline horaire
   ══════════════════════════════════════════════════════ */

function ResultView({ result }) {
  return (
    <div className="animate-fade-up space-y-4">

      {/* ── Estimation globale ── */}
      <div className="surface p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-orange-500/[0.03] rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center animate-pulse-glow">
              <span className="text-lg">🔥</span>
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-white">Estimation de cuisson</h2>
              <p className="text-[12px] text-zinc-500">
                {result.profile}
                {result.weightKg > 0 ? ` · ${result.weightKg} kg` : ''}
                {result.cookTempC > 0 ? ` · ${result.cookTempC}°C` : ''}
                {result.wrapped ? ' · Wrappé' : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl p-5 bg-orange-500/[0.06] border border-orange-500/[0.12]">
              <p className="text-[10px] font-semibold text-orange-400/70 uppercase tracking-[0.08em] mb-1">Durée totale estimée</p>
              <p className="text-[22px] font-bold text-orange-400">{result.totalEstimate}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Cuisson + repos inclus</p>
            </div>
            <div className="rounded-xl p-5 bg-white/[0.02] border border-white/[0.04]">
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.08em] mb-1">Repos conseillé</p>
              <p className="text-[22px] font-bold text-zinc-200">{result.restEstimate}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Essentiel pour le jus</p>
            </div>
          </div>

          <div className="mt-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-[12px] text-zinc-400">
              <span className="text-orange-400 font-semibold">Prêt dans environ {result.totalEstimate.replace('~', '')}</span> — les durées sont des estimations basées sur l'expérience terrain. Chaque cuisson est unique.
            </p>
          </div>
        </div>
      </div>

      {/* ── Phases ── */}
      <div className="space-y-3">
        {result.phases.map((phase) => (
          <PhaseCard key={phase.num} phase={phase} />
        ))}
      </div>

      {/* ── Ribs method ── */}
      {result.ribsMethod && <RibsMethodCard method={result.ribsMethod} />}

      {/* ── Reverse sear guide ── */}
      {result.reverseSearGuide && <ReverseSearCard guide={result.reverseSearGuide} />}

      {/* ── Tips ── */}
      {result.tips?.length > 0 && (
        <div className="surface p-6">
          <h3 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><path d="M12 2v1m0 18v1m-9-10H2m20 0h-1M5.6 5.6l-.7-.7m13.5 13.5l-.7-.7M5.6 18.4l-.7.7M18.4 5.6l.7-.7" /><circle cx="12" cy="12" r="4" /></svg>
            Conseils du pitmaster
          </h3>
          <div className="space-y-3">
            {result.tips.map((tip, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50 mt-1.5 shrink-0" />
                <p className="text-[13px] text-zinc-400 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Phase card ── */
function PhaseCard({ phase }) {
  return (
    <div className="surface p-5 group">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-[13px] font-bold text-orange-400 shrink-0 mt-0.5">
          {phase.num}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="text-[14px] font-bold text-white">{phase.title}</h3>
            {phase.duration && (
              <span className="badge badge-accent">{phase.duration}</span>
            )}
          </div>

          {phase.objective && (
            <p className="text-[12px] text-zinc-400 mb-3">{phase.objective}</p>
          )}

          {/* Markers */}
          {phase.markers?.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {phase.markers.map((m, i) => (
                <div key={i} className="flex items-start gap-2">
                  <MarkerIcon type={m.type} />
                  <p className="text-[12px] text-zinc-300 leading-relaxed">{m.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Advice */}
          {phase.advice && (
            <div className="mt-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                <span className="text-orange-400/70 font-semibold">Conseil :</span> {phase.advice}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MarkerIcon({ type }) {
  if (type === 'temp') {
    return <span className="text-[11px] mt-0.5 shrink-0">🌡️</span>
  }
  if (type === 'visual') {
    return <span className="text-[11px] mt-0.5 shrink-0">👁️</span>
  }
  return <span className="text-[11px] mt-0.5 shrink-0">ℹ️</span>
}

/* ── Ribs method card ── */
function RibsMethodCard({ method }) {
  return (
    <div className="surface p-6">
      <h3 className="text-[15px] font-bold text-white mb-1 flex items-center gap-2">
        🍖 {method.title}
      </h3>
      <p className="text-[11px] text-zinc-500 mb-4">Température fumoir : {method.temp}</p>

      <div className="space-y-2 mb-4">
        {method.steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-14 shrink-0 text-right">
              <span className="text-[13px] font-bold text-orange-400">{s.time}</span>
            </div>
            <div className="w-px h-4 bg-white/[0.08]" />
            <p className="text-[13px] text-zinc-300">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] mb-3">
        <p className="text-[12px] text-zinc-400">
          <span className="font-semibold text-zinc-300">Résultat :</span> {method.result}
        </p>
      </div>

      <p className="text-[11px] text-zinc-600 italic">{method.note}</p>

      {method.alternative && (
        <div className="mt-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[11px] text-zinc-500">
            <span className="font-semibold text-zinc-400">Alternative : {method.alternative.name}</span> — {method.alternative.desc}
          </p>
        </div>
      )}
    </div>
  )
}

/* ── Reverse sear card ── */
function ReverseSearCard({ guide }) {
  return (
    <div className="surface p-6 border-orange-500/[0.12]">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-[15px] font-bold text-white">{guide.title}</h3>
      </div>
      <p className="badge badge-accent mb-4">{guide.badge}</p>

      {/* Principle steps */}
      <div className="mb-5">
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3">Principe</p>
        <div className="space-y-2">
          {guide.principle.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-[13px] text-zinc-300">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Temperature targets */}
      <div className="mb-5">
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3">Températures pull (avant saisie)</p>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(guide.targets).map(([key, t]) => (
            <div key={key} className={`px-4 py-2.5 rounded-xl border transition-all ${
              guide.selectedDoneness === key
                ? 'bg-orange-500/8 border-orange-500/25'
                : 'border-white/[0.06] bg-white/[0.02]'
            }`}>
              <p className={`text-[13px] font-semibold ${guide.selectedDoneness === key ? 'text-orange-400' : 'text-zinc-300'}`}>
                {t.label}
              </p>
              <p className="text-[11px] text-zinc-500">{t.temp - 8}°C pull → {t.temp}°C final</p>
            </div>
          ))}
        </div>
      </div>

      {/* Advantages */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3">Avantages</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {guide.advantages.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              <p className="text-[12px] text-zinc-400">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
