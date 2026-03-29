import { useState, useMemo } from 'react'
import { useCalculatorData } from '../modules/calculator/useCalculatorData.js'
import { calculateCookPlan, formatDuration } from '../modules/calculator/engine.js'
import { DONENESS_LABELS } from '../modules/calculator/data.js'

export default function CalculatorPage() {
  const { profiles, loading } = useCalculatorData()

  const [selectedProfile, setSelectedProfile] = useState(null)
  const [weightKg, setWeightKg] = useState('')
  const [cookTempC, setCookTempC] = useState('')
  const [wrapped, setWrapped] = useState(false)
  const [eatAt, setEatAt] = useState('13:00')
  const [doneness, setDoneness] = useState('medium_rare')
  const [result, setResult] = useState(null)

  // Grouper par catégorie (avant tout return conditionnel)
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
    // Pré-remplir la température moyenne du profil
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
        <p className="text-zinc-400">Chargement...</p>
      </div>
    )
  }

  const categoryLabels = {
    boeuf: 'Boeuf',
    porc: 'Porc',
    volaille: 'Volaille',
    agneau: 'Agneau',
  }

  const tempRange = selectedProfile?.temp_bands
    ? `${selectedProfile.temp_bands[0].temp_c}–${selectedProfile.temp_bands[selectedProfile.temp_bands.length - 1].temp_c}°C`
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Calculateur BBQ</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Planifiez votre cuisson. Résultat honnête, pas de fausse précision.
      </p>

      {/* 1. Viande */}
      <Section num="1" title="Choisissez votre viande">
        {Object.entries(profilesByCategory).map(([cat, items]) => (
          <div key={cat} className="mb-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
              {categoryLabels[cat] || cat}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((p) => (
                <Chip
                  key={p.id}
                  label={`${p.icon} ${p.name}`}
                  active={selectedProfile?.id === p.id}
                  onClick={() => handleProfileSelect(p.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* 2. Poids (sauf ribs à temps fixe) */}
      {selectedProfile && !isFixedTime && (
        <Section num="2" title="Poids (kg)">
          <input
            type="number"
            step="0.1"
            min="0.5"
            max="20"
            value={weightKg}
            onChange={(e) => { setWeightKg(e.target.value); setResult(null) }}
            placeholder="Ex: 3.5"
            className="w-40 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand-500"
          />
        </Section>
      )}

      {/* 3. Température de cuisson (sauf ribs) */}
      {selectedProfile && !isFixedTime && weightKg && (
        <Section num="3" title="Température de cuisson (°C)">
          <input
            type="number"
            step="5"
            min="80"
            max="300"
            value={cookTempC}
            onChange={(e) => { setCookTempC(e.target.value); setResult(null) }}
            className="w-40 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand-500"
          />
          {tempRange && (
            <p className="text-xs text-zinc-500 mt-1">Plage typique : {tempRange}</p>
          )}
        </Section>
      )}

      {/* 4. Cuisson souhaitée (reverse sear uniquement) */}
      {isReverseSear && (
        <Section num="4" title="Cuisson souhaitée">
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
        </Section>
      )}

      {/* 5. Emballage (wrap) — seulement si la viande le supporte */}
      {selectedProfile?.supports_wrap && (isFixedTime || (weightKg && cookTempC)) && (
        <Section num={isReverseSear ? '5' : '4'} title="Emballage (wrap)">
          <div className="flex gap-3">
            <Chip label="Avec wrap" active={wrapped} onClick={() => { setWrapped(true); setResult(null) }} />
            <Chip label="Sans wrap" active={!wrapped} onClick={() => { setWrapped(false); setResult(null) }} />
          </div>
        </Section>
      )}

      {/* 6. Heure de repas */}
      {selectedProfile && (isFixedTime || (weightKg && cookTempC)) && (
        <Section num={isReverseSear ? '6' : '5'} title="Heure de repas souhaitée">
          <input
            type="time"
            value={eatAt}
            onChange={(e) => { setEatAt(e.target.value); setResult(null) }}
            className="w-40 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-brand-500"
          />
        </Section>
      )}

      {/* Bouton */}
      {canCalculate && !result && (
        <button
          onClick={handleCalculate}
          className="w-full mt-6 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg rounded-xl transition-colors"
        >
          Calculer mon plan de cuisson
        </button>
      )}

      {/* Résultats */}
      {result && <ResultPanel result={result} onReset={() => setResult(null)} />}
    </div>
  )
}

// ── Composants internes ──────────────────────────────────

function Section({ num, title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-brand-400 mb-3">
        <span className="text-brand-600 mr-2">{num}.</span>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-brand-600 text-white'
          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
      }`}
    >
      {label}
    </button>
  )
}

function ResultPanel({ result, onReset }) {
  return (
    <div className="mt-8 space-y-6">
      {/* En-tête résumé */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Votre plan de cuisson</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <InfoBlock label="Allume vers" value={result.preheatStart} highlight />
          <InfoBlock label="Viande en cuisson vers" value={result.meatOnTime} highlight />
          <InfoBlock label="Durée cuisson estimée" value={formatDuration(result.cookMinutes)} />
          <InfoBlock label="Repos conseillé" value={`~${result.restMinutes} min`} />
          <InfoBlock
            label="Prêt idéalement entre"
            value={`${result.serviceWindow.idealStart} – ${result.serviceWindow.idealEnd}`}
            highlight
          />
          <InfoBlock
            label="Encore acceptable jusqu'à"
            value={result.serviceWindow.acceptableEnd}
          />
          {result.cookType === 'reverse_sear' && result.targetFinalTemp && (
            <>
              <InfoBlock label="Saisie finale" value={`~${result.searMinutes} min`} />
              <InfoBlock label="Température cible" value={`${result.targetFinalTemp}°C`} />
            </>
          )}
        </div>
      </div>

      {/* Étapes et repères */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Étapes & repères</h3>
        <div className="space-y-4">
          {result.steps.map((step, i) => (
            <StepRow key={i} step={step} />
          ))}
        </div>
      </div>

      {/* Conseils */}
      {result.tips?.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3">Conseils</h3>
          <ul className="space-y-2">
            {result.tips.map((tip, i) => (
              <li key={i} className="text-sm text-zinc-300 flex gap-2">
                <span className="text-brand-500 shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recalculer */}
      <button
        onClick={onReset}
        className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
      >
        Modifier les paramètres
      </button>
    </div>
  )
}

function InfoBlock({ label, value, highlight }) {
  return (
    <div>
      <p className="text-zinc-500 text-xs">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-brand-400' : 'text-zinc-100'}`}>
        {value}
      </p>
    </div>
  )
}

function StepRow({ step }) {
  const typeColors = {
    preheat: 'border-amber-600',
    cook_start: 'border-red-500',
    stall: 'border-yellow-500',
    wrap: 'border-blue-400',
    test: 'border-emerald-500',
    pull: 'border-violet-400',
    sear: 'border-red-400',
    rest: 'border-purple-400',
    service_ideal: 'border-brand-500',
    service_acceptable: 'border-zinc-600',
  }

  return (
    <div className={`flex gap-4 items-start pl-3 border-l-2 ${typeColors[step.type] || 'border-zinc-700'}`}>
      <span className="text-brand-400 font-mono text-sm w-14 shrink-0">
        {step.time || '🔥'}
      </span>
      <div>
        <p className="text-sm font-semibold text-zinc-100">
          {step.label}
          {step.isCue && <span className="text-zinc-500 font-normal ml-1">(repère)</span>}
        </p>
        <p className="text-xs text-zinc-400">{step.description}</p>
      </div>
    </div>
  )
}
