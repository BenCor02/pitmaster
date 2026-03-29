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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-4xl mb-3 animate-flicker">🔥</div>
          <p className="text-zinc-600 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  // Temp range for slider
  const tempMin = selectedProfile?.temp_bands?.[0]?.temp_c || 100
  const tempMax = selectedProfile?.temp_bands?.[selectedProfile.temp_bands.length - 1]?.temp_c || 150

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 max-w-5xl">

      {/* ══════════════════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════════════════ */}
      {!result && (
        <div className="mb-12 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: text */}
            <div className="flex-1">
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-zinc-100 leading-tight mb-2">
                Planifie ta cuisson
              </h1>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-gradient-fire leading-tight mb-6">
                sans compliquer ton barbecue
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed max-w-lg mb-6">
                Choisis la viande, règle le fumoir, puis récupère un plan clair
                avec les bons repères terrain. Rapide à lire, simple à suivre.
              </p>

              <div className="flex gap-3 mb-6">
                <div className="card px-4 py-3 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Lecture immédiate</p>
                  <p className="text-sm font-semibold text-zinc-200">🔥 Départ net, service crédible</p>
                </div>
                <div className="card px-4 py-3 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Parcours simple</p>
                  <p className="text-sm font-semibold text-zinc-200">✓ Choisir, régler, calculer, cuire</p>
                </div>
              </div>

              {/* Quick meat chips */}
              <div className="flex flex-wrap gap-2">
                {profiles?.slice(0, 5).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleProfileSelect(p.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedProfile?.id === p.id
                        ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: hero image card */}
            <div className="w-full lg:w-96 shrink-0">
              <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/60 aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=450&fit=crop&q=80"
                  alt="BBQ Brisket"
                  className="w-full h-full object-cover opacity-80"
                />
                {/* Overlay info */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-lg px-3 py-1.5 text-right">
                    <p className="text-[9px] text-zinc-500 uppercase">méthode</p>
                    <p className="text-xs font-semibold text-zinc-200">low & slow</p>
                  </div>
                  <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-lg px-3 py-1.5 text-right">
                    <p className="text-[9px] text-zinc-500 uppercase">service</p>
                    <p className="text-xs font-semibold text-zinc-200">19h00</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[10px] uppercase tracking-wider text-brand-400 mb-1">
                    {selectedProfile?.name || 'Brisket'}
                  </p>
                  <p className="font-display text-2xl font-bold text-zinc-100">
                    {cookTempC}°C · {wrapped ? 'Avec wrap' : 'Sans wrap'}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Lecture compacte, pensée pour la vraie cuisson.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subtitle bar */}
          <div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.15em] text-zinc-600">
            <span>Outil mobile-first</span>
            <span className="text-zinc-800">·</span>
            <span>Plan simple</span>
            <span className="text-zinc-800">·</span>
            <span>Repères terrain</span>
            <span className="text-zinc-800">·</span>
            <span>Design pitmaster</span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STEP 1: CHOIX VIANDE
          ══════════════════════════════════════════════════ */}
      {!result && (
        <>
          <FormSection num="01" title="Choisis ta pièce" subtitle="Commence par la viande. L'outil adapte ensuite la méthode et les repères utiles.">
            <div className="space-y-5 stagger">
              {Object.entries(profilesByCategory).map(([cat, items]) => (
                <div key={cat}>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                    {CAT_LABELS[cat]}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleProfileSelect(p.id)}
                        className={`card text-left p-4 transition-all ${
                          selectedProfile?.id === p.id ? 'card-active' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{p.icon}</span>
                          <div>
                            <p className={`text-sm font-semibold ${selectedProfile?.id === p.id ? 'text-brand-300' : 'text-zinc-200'}`}>
                              {p.name}
                            </p>
                            <p className="text-[11px] text-zinc-600">
                              {p.cook_type === 'reverse_sear' ? 'Reverse sear' : 'Low & slow'}
                              {p.fixed_times ? ' · Temps fixe' : ''}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          {/* ══════════════════════════════════════════════════
              STEP 2: RÉGLAGES
              ══════════════════════════════════════════════════ */}
          {selectedProfile && (
            <FormSection num="02" title="Règle ta cuisson" subtitle="Poids, méthode, température et options utiles. Rien de plus.">
              <div className="space-y-6">

                {/* Poids */}
                {!isFixedTime && (
                  <div className="card p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2 block">
                          Poids (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="20"
                          value={weightKg}
                          onChange={(e) => { setWeightKg(e.target.value); setResult(null) }}
                          placeholder="4"
                          className="w-full px-4 py-3.5 bg-zinc-800/40 border border-zinc-700/30 rounded-xl text-xl font-medium text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-500/40 transition-all"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2 block">
                          Épaisseur max (cm) <span className="text-zinc-700">optionnel</span>
                        </label>
                        <input
                          type="text"
                          disabled
                          placeholder="Auto depuis le poids"
                          className="w-full px-4 py-3.5 bg-zinc-800/20 border border-zinc-700/20 rounded-xl text-zinc-600 placeholder-zinc-700 cursor-not-allowed"
                        />
                        <p className="text-[11px] text-zinc-600 mt-1.5">
                          L'épaisseur peut jouer autant que le poids sur certaines grosses pièces.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Méthode */}
                <div className="card p-6">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-4 block">
                    Méthode
                  </label>
                  <div className="space-y-3">
                    <MethodCard
                      name="Low & Slow"
                      description="Cuisson lente, bark propre, wrap possible si tu veux raccourcir la fin."
                      active={!isReverseSear}
                      onClick={() => {}}
                      disabled={isReverseSear}
                    />
                    {isReverseSear && (
                      <MethodCard
                        name="Reverse Sear"
                        description="Cuisson douce puis saisie forte. Idéal pour une croûte parfaite."
                        active
                        onClick={() => {}}
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-3">
                    {isReverseSear
                      ? "Cuisson douce, puis saisie forte. Le repos est court."
                      : "Méthode Texas classique. Bark d'abord, puis probe tender. Le repos est essentiel."}
                  </p>
                </div>

                {/* Température slider */}
                {!isFixedTime && (
                  <div className="card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                        T° fumoir (zone indirecte)
                      </label>
                      <div className="text-right">
                        <span className="font-display text-3xl font-bold text-gradient-fire">{cookTempC}°C</span>
                        <span className="text-xs text-zinc-600 ml-2">{Math.round(cookTempC * 9/5 + 32)}°F</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={tempMin}
                      max={tempMax}
                      value={cookTempC}
                      onChange={(e) => { setCookTempC(Number(e.target.value)); setResult(null) }}
                      className="w-full mb-2"
                    />
                    <div className="flex justify-between text-[11px] text-zinc-600">
                      <span>{tempMin}°C · mini</span>
                      <span>{Math.round((tempMin + tempMax) / 2)}°C · conseillé</span>
                      <span>{tempMax}°C · maxi</span>
                    </div>
                  </div>
                )}

                {/* Doneness (reverse sear) */}
                {isReverseSear && (
                  <div className="card p-6">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-3 block">
                      Cuisson souhaitée
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(DONENESS_LABELS).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => { setDoneness(key); setResult(null) }}
                          className={`px-4 py-2.5 rounded-xl text-sm border transition-all ${
                            doneness === key
                              ? 'bg-brand-500/10 border-brand-500/30 text-brand-300 font-medium'
                              : 'border-zinc-800/60 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                          }`}
                        >
                          {label} ({selectedProfile.doneness_targets[key]}°C)
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wrap */}
                {selectedProfile.supports_wrap && (
                  <div className="card p-6">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-3 block">
                      Emballage (wrap)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => { setWrapped(true); setResult(null) }}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          wrapped ? 'bg-brand-500/8 border-brand-500/25' : 'border-zinc-800/60 hover:border-zinc-700'
                        }`}
                      >
                        <p className={`text-sm font-semibold mb-0.5 ${wrapped ? 'text-brand-300' : 'text-zinc-300'}`}>
                          Avec wrap
                        </p>
                        <p className="text-[11px] text-zinc-500">Papier boucher ou alu. Plus rapide, moins de bark.</p>
                      </button>
                      <button
                        onClick={() => { setWrapped(false); setResult(null) }}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          !wrapped ? 'bg-brand-500/8 border-brand-500/25' : 'border-zinc-800/60 hover:border-zinc-700'
                        }`}
                      >
                        <p className={`text-sm font-semibold mb-0.5 ${!wrapped ? 'text-brand-300' : 'text-zinc-300'}`}>
                          Sans wrap
                        </p>
                        <p className="text-[11px] text-zinc-500">Plus long, mais bark plus prononcée.</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Service */}
                <div className="card p-6">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2 block">
                    Service à
                  </label>
                  <input
                    type="time"
                    value={eatAt}
                    onChange={(e) => { setEatAt(e.target.value); setResult(null) }}
                    className="w-40 px-4 py-3.5 bg-zinc-800/40 border border-zinc-700/30 rounded-xl text-xl font-medium text-zinc-100 focus:outline-none focus:border-brand-500/40 transition-all"
                  />
                </div>
              </div>
            </FormSection>
          )}

          {/* Bouton */}
          {canCalculate && (
            <div className="mt-8 animate-fade-in-up">
              <button
                onClick={handleCalculate}
                className="w-full py-4.5 bg-gradient-to-r from-brand-600 to-red-600 hover:from-brand-500 hover:to-red-500 text-white font-bold text-base rounded-2xl transition-all duration-300 shadow-lg shadow-brand-600/15 hover:shadow-brand-500/25 active:scale-[0.99]"
                style={{ paddingTop: '1.1rem', paddingBottom: '1.1rem' }}
              >
                🔥 Calculer mon plan de cuisson
              </button>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════
          RÉSULTATS
          ══════════════════════════════════════════════════ */}
      {result && <ResultView result={result} onReset={() => setResult(null)} />}
    </div>
  )
}

// ── Sous-composants ──────────────────────────────────────

function FormSection({ num, title, subtitle, children }) {
  return (
    <div className="mb-10 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-bold text-brand-500 bg-brand-500/10 w-7 h-7 rounded-full flex items-center justify-center">
          {num}
        </span>
        <h2 className="font-display text-2xl font-bold text-zinc-100">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-zinc-500 mb-6 ml-10">{subtitle}</p>}
      <div className="ml-0">
        {children}
      </div>
    </div>
  )
}

function MethodCard({ name, description, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        active
          ? 'bg-brand-500/8 border-brand-500/25'
          : 'border-zinc-800/60 text-zinc-500'
      } ${disabled ? 'cursor-default' : 'hover:border-zinc-700'}`}
    >
      <p className={`text-sm font-semibold ${active ? 'text-brand-400' : 'text-zinc-400'}`}>{name}</p>
      <p className="text-[11px] text-zinc-500 mt-0.5">{description}</p>
    </button>
  )
}

function ResultView({ result, onReset }) {
  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Back */}
      <button
        onClick={onReset}
        className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
      >
        ← Modifier les paramètres
      </button>

      {/* Header */}
      <div className="card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-brand-500/8 to-transparent rounded-full blur-2xl" />
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl animate-flicker">🔥</span>
          <div>
            <h2 className="font-display text-2xl font-bold text-zinc-100">Ton plan de cuisson</h2>
            <p className="text-xs text-zinc-500">{result.profile} · {result.weightKg > 0 ? `${result.weightKg} kg · ` : ''}{result.cookTempC > 0 ? `${result.cookTempC}°C` : 'Temps fixe'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Stat label="Allume vers" value={result.preheatStart} icon="🔥" primary />
          <Stat label="Viande en cuisson" value={result.meatOnTime} icon="🥩" primary />
          <Stat label="Durée estimée" value={formatDuration(result.cookMinutes)} icon="⏱" />
          <Stat label="Repos" value={`~${result.restMinutes} min`} icon="😴" />
          <Stat label="Prêt idéalement" value={`${result.serviceWindow.idealStart} – ${result.serviceWindow.idealEnd}`} icon="✅" primary />
          <Stat label="Acceptable jusqu'à" value={result.serviceWindow.acceptableEnd} icon="⏰" />
        </div>
      </div>

      {/* Steps */}
      <div className="card p-6">
        <h3 className="font-display text-lg font-bold mb-5">📋 Étapes & repères</h3>
        <div className="space-y-0.5 stagger">
          {result.steps.map((step, i) => (
            <TimelineRow key={i} step={step} isLast={i === result.steps.length - 1} />
          ))}
        </div>
      </div>

      {/* Tips */}
      {result.tips?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-display text-lg font-bold mb-4">💡 Conseils du pitmaster</h3>
          <div className="space-y-3">
            {result.tips.map((tip, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                <p className="text-sm text-zinc-400 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, icon, primary }) {
  return (
    <div className={`rounded-xl p-3.5 ${primary ? 'bg-zinc-800/50' : 'bg-zinc-800/25'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs">{icon}</span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-lg font-bold ${primary ? 'text-brand-400' : 'text-zinc-200'}`}>{value}</p>
    </div>
  )
}

function TimelineRow({ step, isLast }) {
  const dotColors = {
    preheat: 'bg-amber-500', cook_start: 'bg-red-500', stall: 'bg-yellow-500',
    wrap: 'bg-blue-400', test: 'bg-emerald-500', pull: 'bg-violet-400',
    sear: 'bg-red-400', rest: 'bg-purple-400',
    service_ideal: 'bg-brand-500', service_acceptable: 'bg-zinc-500',
  }

  return (
    <div className="flex gap-4 items-start">
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColors[step.type] || 'bg-zinc-600'} ring-2 ring-zinc-900 shrink-0`} />
        {!isLast && <div className="w-px h-8 bg-zinc-800" />}
      </div>
      <div className="pb-3 -mt-0.5">
        <div className="flex items-baseline gap-2">
          {step.time ? (
            <span className="text-sm font-mono font-bold text-brand-400">{step.time}</span>
          ) : (
            <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">repère</span>
          )}
          <span className="text-sm font-medium text-zinc-200">{step.label}</span>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
      </div>
    </div>
  )
}
