import { useState, useMemo } from 'react'
import { useCalculatorData } from '../modules/calculator/useCalculatorData.js'
import { calculateCookPlan, formatDuration, minutesToHHMM } from '../modules/calculator/engine.js'
import { DONENESS_LABELS } from '../modules/calculator/data.js'

// Icônes des catégories
const CAT_ICONS = { boeuf: '🐂', porc: '🐷', volaille: '🍗', agneau: '🐑' }
const CAT_LABELS = { boeuf: 'Boeuf', porc: 'Porc', volaille: 'Volaille', agneau: 'Agneau' }

export default function CalculatorPage() {
  const { profiles, loading } = useCalculatorData()

  const [selectedProfile, setSelectedProfile] = useState(null)
  const [weightKg, setWeightKg] = useState('')
  const [cookTempC, setCookTempC] = useState('')
  const [wrapped, setWrapped] = useState(false)
  const [eatAt, setEatAt] = useState('13:00')
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
      setCookTempC(String(midBand.temp_c))
    }
    setWrapped(p?.supports_wrap || false)
    setResult(null)
  }

  const isReverseSear = selectedProfile?.cook_type === 'reverse_sear'
  const isFixedTime = !!selectedProfile?.fixed_times
  const canCalculate = selectedProfile && (isFixedTime || weightKg) && (isFixedTime || cookTempC) && eatAt

  const handleCalculate = () => {
    if (!canCalculate) return
    const plan = calculateCookPlan({
      profile: selectedProfile,
      weightKg: isFixedTime ? 0 : parseFloat(weightKg),
      cookTempC: isFixedTime ? 0 : parseInt(cookTempC, 10),
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
          <p className="text-zinc-500 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  const tempRange = selectedProfile?.temp_bands
    ? `${selectedProfile.temp_bands[0].temp_c}–${selectedProfile.temp_bands[selectedProfile.temp_bands.length - 1].temp_c}°C`
    : null

  // Numéro d'étape dynamique
  let stepNum = 1

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-red-600 flex items-center justify-center text-white text-lg shadow-lg shadow-brand-600/20">
            🔥
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-zinc-50">Calculateur de cuisson</h1>
            <p className="text-zinc-500 text-sm">Résultat honnête. Pas de fausse précision.</p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-brand-600/30 via-brand-600/10 to-transparent" />
      </div>

      {/* ── 1. VIANDE ── */}
      <StepSection num={stepNum++} title="Choisissez votre viande" icon="🥩" active>
        <div className="space-y-4 stagger-children">
          {Object.entries(profilesByCategory).map(([cat, items]) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{CAT_ICONS[cat]}</span>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  {CAT_LABELS[cat] || cat}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {items.map((p) => (
                  <MeatCard
                    key={p.id}
                    profile={p}
                    active={selectedProfile?.id === p.id}
                    onClick={() => handleProfileSelect(p.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </StepSection>

      {/* ── 2. POIDS ── */}
      {selectedProfile && !isFixedTime && (
        <StepSection num={stepNum++} title="Poids de la pièce" icon="⚖️" animate>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="20"
                value={weightKg}
                onChange={(e) => { setWeightKg(e.target.value); setResult(null) }}
                placeholder="3.5"
                className="w-32 px-4 py-3 bg-zinc-900/80 border border-zinc-700/50 rounded-xl text-zinc-100 text-lg font-medium placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">kg</span>
            </div>
            {weightKg && parseFloat(weightKg) > 6 && (
              <p className="text-xs text-amber-500/80 animate-fade-in">
                ⚠️ Grosse pièce — prévoir un temps supplémentaire
              </p>
            )}
          </div>
        </StepSection>
      )}

      {/* Ribs: pas de poids nécessaire */}
      {selectedProfile && isFixedTime && (
        <StepSection num={stepNum++} title="Temps de cuisson" icon="⏱️" animate>
          <p className="text-sm text-zinc-400">
            Les {selectedProfile.name} ont un temps de cuisson fixe, indépendant du poids.
          </p>
        </StepSection>
      )}

      {/* ── 3. TEMPÉRATURE ── */}
      {selectedProfile && !isFixedTime && weightKg && (
        <StepSection num={stepNum++} title="Température de cuisson" icon="🌡️" animate>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="number"
                step="5"
                min="80"
                max="300"
                value={cookTempC}
                onChange={(e) => { setCookTempC(e.target.value); setResult(null) }}
                className="w-32 px-4 py-3 bg-zinc-900/80 border border-zinc-700/50 rounded-xl text-zinc-100 text-lg font-medium placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">°C</span>
            </div>
            {tempRange && (
              <p className="text-xs text-zinc-500">Plage typique : {tempRange}</p>
            )}
          </div>
        </StepSection>
      )}

      {/* ── 4. DONENESS (reverse sear) ── */}
      {isReverseSear && (
        <StepSection num={stepNum++} title="Cuisson souhaitée" icon="🎯" animate>
          <div className="flex flex-wrap gap-2">
            {Object.entries(DONENESS_LABELS).map(([key, label]) => (
              <Chip
                key={key}
                label={`${label} (${selectedProfile.doneness_targets[key]}°C)`}
                active={doneness === key}
                onClick={() => { setDoneness(key); setResult(null) }}
              />
            ))}
          </div>
        </StepSection>
      )}

      {/* ── 5. WRAP ── */}
      {selectedProfile?.supports_wrap && (isFixedTime || (weightKg && cookTempC)) && (
        <StepSection num={stepNum++} title="Emballage (wrap)" icon="📦" animate>
          <div className="flex gap-3">
            <Chip
              label="🧻 Avec wrap"
              active={wrapped}
              onClick={() => { setWrapped(true); setResult(null) }}
              description="Papier boucher ou alu"
            />
            <Chip
              label="🔓 Sans wrap"
              active={!wrapped}
              onClick={() => { setWrapped(false); setResult(null) }}
              description="Bark plus prononcée"
            />
          </div>
          {selectedProfile.cues?.visual_wrap && wrapped && (
            <p className="text-xs text-zinc-500 mt-3 italic">
              💡 {selectedProfile.cues.visual_wrap}
            </p>
          )}
        </StepSection>
      )}

      {/* ── 6. HEURE DE REPAS ── */}
      {selectedProfile && (isFixedTime || (weightKg && cookTempC)) && (
        <StepSection num={stepNum++} title="Heure de repas souhaitée" icon="🕐" animate>
          <input
            type="time"
            value={eatAt}
            onChange={(e) => { setEatAt(e.target.value); setResult(null) }}
            className="w-40 px-4 py-3 bg-zinc-900/80 border border-zinc-700/50 rounded-xl text-zinc-100 text-lg font-medium focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all"
          />
        </StepSection>
      )}

      {/* ── BOUTON ── */}
      {canCalculate && !result && (
        <div className="mt-8 animate-fade-in-up">
          <button
            onClick={handleCalculate}
            className="w-full py-4 bg-gradient-to-r from-brand-600 to-red-600 hover:from-brand-500 hover:to-red-500 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30 hover:scale-[1.01] active:scale-[0.99]"
          >
            🔥 Calculer mon plan de cuisson
          </button>
        </div>
      )}

      {/* ── RÉSULTATS ── */}
      {result && <ResultPanel result={result} onReset={() => setResult(null)} />}
    </div>
  )
}

// ── Composants ───────────────────────────────────────────

function StepSection({ num, title, icon, children, active, animate }) {
  return (
    <div className={`mb-8 ${animate ? 'animate-fade-in-up' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-sm">
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-md">{num}</span>
          <h2 className="text-sm font-semibold text-zinc-300">{title}</h2>
        </div>
      </div>
      <div className="ml-11">
        {children}
      </div>
    </div>
  )
}

function MeatCard({ profile, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-3 rounded-xl transition-all duration-200 border ${
        active
          ? 'bg-brand-600/10 border-brand-500/30 shadow-lg shadow-brand-600/10'
          : 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/50 hover:bg-zinc-800/50'
      } card-hover`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{profile.icon}</span>
        <span className={`text-sm font-medium ${active ? 'text-brand-300' : 'text-zinc-200'}`}>
          {profile.name}
        </span>
      </div>
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
        {profile.cook_type === 'reverse_sear' ? 'Reverse sear' : 'Low & slow'}
      </p>
    </button>
  )
}

function Chip({ label, active, onClick, description }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
        active
          ? 'bg-brand-600/15 border-brand-500/30 text-brand-300'
          : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/50 border-zinc-800/50 hover:border-zinc-700/50'
      }`}
    >
      <span>{label}</span>
      {description && <span className="block text-[10px] text-zinc-500 mt-0.5">{description}</span>}
    </button>
  )
}

function ResultPanel({ result, onReset }) {
  return (
    <div className="mt-10 space-y-6 animate-fade-in-up">
      {/* ── Header résultat ── */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-br from-zinc-900 via-zinc-900 to-brand-950/20 p-6 animate-pulse-glow">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-brand-600/10 to-transparent rounded-full blur-2xl" />

        <div className="flex items-center gap-3 mb-5">
          <div className="text-2xl animate-flicker">🔥</div>
          <h2 className="text-xl font-bold text-zinc-50">Votre plan de cuisson</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <BigStat label="Allume vers" value={result.preheatStart} icon="🔥" primary />
          <BigStat label="Viande en cuisson" value={result.meatOnTime} icon="🥩" primary />
          <BigStat label="Durée estimée" value={formatDuration(result.cookMinutes)} icon="⏱️" />
          <BigStat label="Repos conseillé" value={`~${result.restMinutes} min`} icon="😴" />
          <BigStat
            label="Prêt idéalement"
            value={`${result.serviceWindow.idealStart} – ${result.serviceWindow.idealEnd}`}
            icon="✅"
            primary
          />
          <BigStat
            label="Acceptable jusqu'à"
            value={result.serviceWindow.acceptableEnd}
            icon="⏰"
          />
          {result.cookType === 'reverse_sear' && result.targetFinalTemp && (
            <>
              <BigStat label="Saisie finale" value={`~${result.searMinutes} min`} icon="🔥" />
              <BigStat label="Temp. cible" value={`${result.targetFinalTemp}°C`} icon="🎯" />
            </>
          )}
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-6">
        <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
          <span>📋</span> Étapes & repères
        </h3>
        <div className="space-y-1 stagger-children">
          {result.steps.map((step, i) => (
            <TimelineStep key={i} step={step} isLast={i === result.steps.length - 1} />
          ))}
        </div>
      </div>

      {/* ── Conseils ── */}
      {result.tips?.length > 0 && (
        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>💡</span> Conseils du pitmaster
          </h3>
          <div className="space-y-3">
            {result.tips.map((tip, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                <p className="text-sm text-zinc-300 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recalculer ── */}
      <button
        onClick={onReset}
        className="w-full py-3.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200 rounded-xl transition-all duration-200 border border-zinc-700/30 hover:border-zinc-600/30"
      >
        ← Modifier les paramètres
      </button>
    </div>
  )
}

function BigStat({ label, value, icon, primary }) {
  return (
    <div className={`p-3 rounded-xl ${primary ? 'bg-zinc-800/50' : 'bg-zinc-800/20'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs">{icon}</span>
        <p className="text-[11px] text-zinc-500">{label}</p>
      </div>
      <p className={`text-lg font-bold ${primary ? 'text-brand-400' : 'text-zinc-200'}`}>
        {value}
      </p>
    </div>
  )
}

function TimelineStep({ step, isLast }) {
  const colors = {
    preheat: { dot: 'bg-amber-500', line: 'border-amber-500/20' },
    cook_start: { dot: 'bg-red-500', line: 'border-red-500/20' },
    stall: { dot: 'bg-yellow-500', line: 'border-yellow-500/20' },
    wrap: { dot: 'bg-blue-400', line: 'border-blue-400/20' },
    test: { dot: 'bg-emerald-500', line: 'border-emerald-500/20' },
    pull: { dot: 'bg-violet-400', line: 'border-violet-400/20' },
    sear: { dot: 'bg-red-400', line: 'border-red-400/20' },
    rest: { dot: 'bg-purple-400', line: 'border-purple-400/20' },
    service_ideal: { dot: 'bg-brand-500', line: 'border-brand-500/20' },
    service_acceptable: { dot: 'bg-zinc-500', line: 'border-zinc-500/20' },
  }

  const c = colors[step.type] || { dot: 'bg-zinc-500', line: 'border-zinc-700' }

  return (
    <div className="flex gap-4 items-start group">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${c.dot} shadow-lg ring-2 ring-zinc-900 shrink-0 group-hover:scale-125 transition-transform`} />
        {!isLast && <div className={`w-px h-10 border-l ${c.line}`} />}
      </div>

      {/* Content */}
      <div className="pb-4 -mt-0.5 min-w-0">
        <div className="flex items-baseline gap-2">
          {step.time ? (
            <span className="text-sm font-mono font-bold text-brand-400">{step.time}</span>
          ) : (
            <span className="text-xs font-medium text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">repère</span>
          )}
          <span className="text-sm font-medium text-zinc-200">{step.label}</span>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
      </div>
    </div>
  )
}
