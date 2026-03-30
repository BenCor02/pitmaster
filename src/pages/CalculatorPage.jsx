import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useCalculatorData } from '../modules/calculator/useCalculatorData.js'
import { calculateCookPlan } from '../modules/calculator/engine.js'
import { DONENESS_LABELS } from '../modules/calculator/data.js'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import ContentBlocks from '../components/content/ContentBlocks.jsx'
import { journal } from '../lib/journal.js'

const CAT_LABELS = { boeuf: 'Boeuf', porc: 'Porc', volaille: 'Volaille', agneau: 'Agneau' }

/**
 * Rubs inspirés de grands pitmasters — adaptés au public français
 * Sources : Aaron Franklin, Malcom Reed, Tuffy Stone, Myron Mixon,
 * Le Barbecue de Rafa, Pit's BBQ (Xavier Pincemin)
 */
const RUB_SUGGESTIONS = {
  brisket: [
    {
      name: 'Dalmatien (Aaron Franklin)',
      origin: 'Franklin Barbecue, Austin TX',
      ingredients: 'Sel + poivre noir concassé, parts égales',
      tip: 'Le rub le plus simple et le plus respecté. Laisse le bœuf parler. ~60g de chaque pour un 5kg.',
      badge: 'Classique',
    },
    {
      name: 'Texas Bold',
      origin: 'Inspiré Harry Soo',
      ingredients: 'Sel, poivre noir, ail en poudre, oignon en poudre, piment de Cayenne',
      tip: 'Un cran au-dessus du dalmatien. L\'ail et l\'oignon renforcent la bark.',
      badge: 'Pitmaster',
    },
  ],
  pulled_pork: [
    {
      name: 'Sweet Smoke (Malcom Reed)',
      origin: 'HowToBBQRight',
      ingredients: 'Paprika fumé, cassonade, sel, poivre, ail, oignon, cumin, moutarde en poudre',
      tip: 'La cassonade caramélise et forme une bark sombre et sucrée-salée. Badigeonner de moutarde jaune avant d\'appliquer.',
      badge: 'Classique',
    },
    {
      name: 'Le Rafa (style français)',
      origin: 'Le Barbecue de Rafa',
      ingredients: 'Paprika doux, sel, poivre, herbes de Provence, miel en finition',
      tip: 'Version française plus subtile. Les herbes de Provence apportent une touche méditerranéenne unique.',
      badge: 'FR',
    },
  ],
  beef_short_ribs: [
    {
      name: 'Dalmatien (Aaron Franklin)',
      origin: 'Franklin Barbecue, Austin TX',
      ingredients: 'Sel + poivre noir concassé, parts égales',
      tip: 'Comme pour le brisket — le bœuf de qualité n\'a besoin de rien d\'autre.',
      badge: 'Classique',
    },
    {
      name: 'Coffee Rub',
      origin: 'Inspiré Tuffy Stone',
      ingredients: 'Café moulu fin, poivre noir, sel, cacao en poudre, paprika fumé',
      tip: 'Le café crée une bark sombre et profonde. Aucun goût de café dans le résultat, juste de l\'umami.',
      badge: 'Audacieux',
    },
  ],
  spare_ribs: [
    {
      name: 'Memphis Dry Rub',
      origin: 'Tradition Memphis',
      ingredients: 'Paprika, cassonade, sel, poivre, ail, oignon, cumin, piment de Cayenne',
      tip: 'Le rub classique des compétitions Memphis. Appliquer généreusement la veille.',
      badge: 'Classique',
    },
    {
      name: 'Kansas City Sweet',
      origin: 'Inspiré Myron Mixon',
      ingredients: 'Paprika, cassonade, moutarde en poudre, ail, oignon, cumin, poivre, cannelle',
      tip: 'Plus sucré que Memphis. Parfait avec un glaze BBQ en fin de cuisson.',
      badge: 'Compétition',
    },
  ],
  baby_back_ribs: [
    {
      name: 'Memphis Dry Rub',
      origin: 'Tradition Memphis',
      ingredients: 'Paprika, cassonade, sel, poivre, ail, oignon, cumin, piment de Cayenne',
      tip: 'Même base que les spare ribs. Les baby back étant plus tendres, réduire légèrement le sel.',
      badge: 'Classique',
    },
    {
      name: 'Honey Garlic',
      origin: 'Inspiré Malcom Reed',
      ingredients: 'Ail en poudre, paprika doux, sel, poivre, miel en finition',
      tip: 'Badigeonner de miel 30 min avant la fin pour un glacé doré. Simple et efficace.',
      badge: 'Facile',
    },
  ],
  chuck_roast: [
    {
      name: 'Dalmatien renforcé',
      origin: 'Inspiré Aaron Franklin',
      ingredients: 'Sel, poivre noir, ail en poudre',
      tip: 'Le paleron est une pièce persillée — l\'ail en poudre sublime le gras fondu.',
      badge: 'Classique',
    },
    {
      name: 'Chili Rub',
      origin: 'Style Tex-Mex',
      ingredients: 'Piment ancho, cumin, ail, oignon, paprika fumé, sel, poivre, origan',
      tip: 'Parfait si tu veux effilocher le paleron façon tacos. L\'ancho apporte un côté fruité sans trop de piquant.',
      badge: 'Audacieux',
    },
  ],
  whole_chicken: [
    {
      name: 'Poulet fumé classique',
      origin: 'Weber Academy',
      ingredients: 'Paprika, sel, poivre, ail, oignon, thym séché, un filet d\'huile d\'olive',
      tip: 'Glisser du beurre aux herbes sous la peau pour un résultat juteux. Poulet fermier Label Rouge obligatoire.',
      badge: 'Classique',
    },
    {
      name: 'Cajun',
      origin: 'Louisiane',
      ingredients: 'Paprika, ail, oignon, thym, origan, cayenne, sel, poivre blanc',
      tip: 'Plus relevé. Le poivre blanc fait la différence — il pique sans dominer.',
      badge: 'Épicé',
    },
  ],
  prime_rib: [
    {
      name: 'Sel + herbes (Rafa style)',
      origin: 'Le Barbecue de Rafa',
      ingredients: 'Gros sel, poivre concassé, romarin frais, ail frais haché, huile d\'olive',
      tip: 'Appliquer 12h avant et laisser au frigo à découvert. La surface sèche = meilleure croûte.',
      badge: 'Classique',
    },
    {
      name: 'Au Roquefort (finition)',
      origin: 'Tradition française',
      ingredients: 'Sel, poivre pour la cuisson. Beurre + Roquefort fondu en finition',
      tip: 'Après la saisie inversée, napper d\'un beurre au Roquefort. Accord bœuf + fromage puissant.',
      badge: 'FR',
    },
  ],
  tomahawk: [
    {
      name: 'Dalmatien (Aaron Franklin)',
      origin: 'La référence pour le bœuf',
      ingredients: 'Sel + poivre noir concassé, parts égales',
      tip: 'Sur une pièce de cette qualité, la simplicité est reine. Saler 1h avant minimum.',
      badge: 'Classique',
    },
    {
      name: 'Beurre noisette & ail',
      origin: 'Finition Pitmaster',
      ingredients: 'Sel, poivre pour la cuisson. Beurre noisette, ail, thym et romarin pour arroser',
      tip: 'Pendant la saisie finale, arroser à la cuillère avec un beurre noisette + ail écrasé + herbes fraîches.',
      badge: 'Premium',
    },
  ],
}

// Mapping meat_type des profiles → clé dans RUB_SUGGESTIONS
const PROFILE_TO_RUB_KEY = {
  brisket: 'brisket',
  pulled_pork: 'pulled_pork',
  beef_short_ribs: 'beef_short_ribs',
  spare_ribs: 'spare_ribs',
  baby_back_ribs: 'baby_back_ribs',
  chuck_roast: 'chuck_roast',
  whole_chicken: 'whole_chicken',
  prime_rib: 'prime_rib',
  tomahawk: 'tomahawk',
}

/** Encode les params de cuisson dans l'URL pour survivre au refresh */
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

function readFromURL() {
  const params = new URLSearchParams(window.location.search)
  const m = params.get('m')
  if (!m) return null
  return {
    profileId: m,
    weightKg: params.get('w') || '',
    cookTempC: Number(params.get('t')) || 110,
    wrapped: params.get('wr') === '1',
    doneness: params.get('d') || 'medium_rare',
  }
}

export default function CalculatorPage() {
  const { profiles, loading } = useCalculatorData()

  const [selectedProfile, setSelectedProfile] = useState(null)
  const [weightKg, setWeightKg] = useState('')
  const [cookTempC, setCookTempC] = useState(110)
  const [wrapped, setWrapped] = useState(false)
  const [doneness, setDoneness] = useState('medium_rare')
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(1)

  // Refs pour auto-scroll
  const step2Ref = useRef(null)
  const resultRef = useRef(null)

  // ── Restore depuis URL au chargement ──
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
    // Lancer le calcul automatiquement
    const isFixed = !!p.fixed_times
    const isRS = p.cook_type === 'reverse_sear'
    if (isFixed || saved.weightKg) {
      const plan = calculateCookPlan({
        profile: p,
        weightKg: isFixed ? 0 : parseFloat(saved.weightKg),
        cookTempC: isFixed ? 0 : saved.cookTempC,
        wrapped: saved.wrapped,
        doneness: isRS ? saved.doneness : null,
      })
      setResult(plan)
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
      const midBand = p.temp_bands[Math.floor(p.temp_bands.length / 2)]
      setCookTempC(midBand.temp_c)
    }
    setWrapped(p?.supports_wrap || false)
    setResult(null)
    setStep(2)
    // Auto-scroll vers l'étape 2
    setTimeout(() => {
      step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
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
    // Auto-scroll vers les résultats
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
    // Sauvegarder dans l'URL
    saveToURL({
      profileId: selectedProfile.id,
      weightKg,
      cookTempC,
      wrapped,
      doneness: isReverseSear ? doneness : null,
    })
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
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b1a] mr-2 animate-pulse" />
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
                  <p className="text-[24px] font-bold text-[#ff6b1a]">100%</p>
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
              <div className={`h-px flex-1 ${step >= 2 ? 'bg-[#ff6b1a]/30' : 'bg-white/[0.06]'}`} />
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

                  {/* Recap */}
                  <div className="surface p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#ff6b1a]/10 flex items-center justify-center text-2xl">{selectedProfile.icon}</div>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-white">{selectedProfile.name}</p>
                      <p className="text-[12px] text-zinc-500">{selectedProfile.cook_type === 'reverse_sear' ? 'Reverse sear' : 'Low & slow'}{selectedProfile.supports_wrap ? ' · Wrap possible' : ''}</p>
                    </div>
                    <button onClick={() => { setStep(1); setSelectedProfile(null); setResult(null) }} className="text-[12px] text-zinc-500 hover:text-[#ff6b1a] font-medium transition-colors">Changer</button>
                  </div>

                  {/* Rub suggestions */}
                  {RUB_SUGGESTIONS[PROFILE_TO_RUB_KEY[selectedProfile.id]] && (
                    <RubSection rubs={RUB_SUGGESTIONS[PROFILE_TO_RUB_KEY[selectedProfile.id]]} meatName={selectedProfile.name} />
                  )}

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

                  {/* Doneness */}
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
        <div ref={resultRef} className="scroll-mt-20" />
        {result && <ResultView result={result} />}

        {/* ══════════ SAVE SESSION ══════════ */}
        {result && <SaveSessionCTA result={result} />}

        {/* Blocs contextuels CMS : SEO, FAQ, Affiliation, Guides */}
        {result && (
          <ContentBlocks
            meatType={result.profileId}
            cookingMethod={result.cookType}
          />
        )}
      </div>
    </div>
  )
}

/* ── Small components ─────────────────────────────── */

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

function SaveSessionCTA({ result }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleSave = () => {
    const prefill = journal.fromCalculatorResult(result)
    const encoded = encodeURIComponent(JSON.stringify(prefill))
    navigate(`/journal?prefill=${encoded}`)
  }

  return (
    <div className="surface p-5 mt-6">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ff6b1a]/15 to-amber-500/10 flex items-center justify-center shrink-0">
          <span className="text-xl">📓</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-white">Enregistrer cette session</p>
          <p className="text-[12px] text-zinc-500">
            {isAuthenticated
              ? 'Note ta cuisson, ce qui a marché et ce qu\'il faut améliorer.'
              : 'Connecte-toi pour sauvegarder tes sessions de cuisson.'}
          </p>
        </div>
        {isAuthenticated ? (
          <button onClick={handleSave} className="btn-primary px-5 py-2.5 text-[13px] shrink-0">
            Enregistrer
          </button>
        ) : (
          <Link
            to="/login"
            state={{ from: '/' }}
            className="btn-primary px-5 py-2.5 text-[13px] shrink-0 inline-flex items-center"
          >
            Se connecter
          </Link>
        )}
      </div>
    </div>
  )
}

function RubSection({ rubs, meatName }) {
  const [expanded, setExpanded] = useState(false)

  if (!rubs || rubs.length === 0) return null

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff6b1a]/20 to-red-500/10 flex items-center justify-center">
            <span className="text-xs">🧂</span>
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-white">Rubs suggérés</h3>
            <p className="text-[10px] text-zinc-600">Inspirés de grands pitmasters</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] font-medium text-[#ff6b1a]/70 hover:text-[#ff6b1a] transition-colors"
        >
          {expanded ? 'Réduire' : 'Voir les recettes'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {rubs.map((rub, i) => (
          <div key={i} className="rounded-xl p-3.5 bg-white/[0.02] border border-white/[0.06] hover:border-[#ff6b1a]/15 transition-all">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[13px] font-semibold text-white leading-tight">{rub.name}</p>
              {rub.badge && (
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ml-2 ${
                  rub.badge === 'Classique' ? 'bg-[#ff6b1a]/10 text-[#ff6b1a]' :
                  rub.badge === 'FR' ? 'bg-blue-500/10 text-blue-400' :
                  rub.badge === 'Compétition' ? 'bg-purple-500/10 text-purple-400' :
                  rub.badge === 'Premium' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-white/[0.06] text-zinc-400'
                }`}>
                  {rub.badge}
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-600 mb-1.5">{rub.origin}</p>

            {expanded && (
              <div className="animate-fade space-y-2 mt-3 pt-3 border-t border-white/[0.04]">
                <div>
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Ingrédients</p>
                  <p className="text-[12px] text-zinc-300 leading-relaxed">{rub.ingredients}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Conseil</p>
                  <p className="text-[12px] text-zinc-400 leading-relaxed">{rub.tip}</p>
                </div>
              </div>
            )}

            {!expanded && (
              <p className="text-[11px] text-zinc-500 leading-relaxed">{rub.ingredients}</p>
            )}
          </div>
        ))}
      </div>
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
   RESULT VIEW — Premium, visuel, immersif
   ══════════════════════════════════════════════════════ */

const PHASE_THEMES = {
  1: { color: 'from-[#ff6b1a] to-red-500', bg: 'bg-[#ff6b1a]/[0.08]', border: 'border-[#ff6b1a]/[0.20]', text: 'text-[#ff6b1a]', icon: '🔥' },
  2: { color: 'from-amber-400 to-[#ff6b1a]', bg: 'bg-amber-500/[0.08]', border: 'border-amber-500/[0.20]', text: 'text-amber-400', icon: '🥵' },
  3: { color: 'from-red-500 to-rose-500', bg: 'bg-red-500/[0.08]', border: 'border-red-500/[0.20]', text: 'text-red-400', icon: '🥩' },
  4: { color: 'from-yellow-400 to-amber-500', bg: 'bg-yellow-500/[0.08]', border: 'border-yellow-500/[0.20]', text: 'text-yellow-400', icon: '🧈' },
  5: { color: 'from-[#ff8c4a] to-red-600', bg: 'bg-[#ff8c4a]/[0.08]', border: 'border-[#ff8c4a]/[0.20]', text: 'text-[#ff8c4a]', icon: '🍽️' },
}

const HERO_IMAGES = {
  boeuf: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&h=400&fit=crop&q=80',
  porc: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=900&h=400&fit=crop&q=80',
  volaille: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=900&h=400&fit=crop&q=80',
}

function ResultView({ result }) {
  const [serviceHour, setServiceHour] = useState(19)
  const category = result.profileId?.includes('chicken') ? 'volaille' :
    ['pulled_pork', 'spare_ribs', 'baby_back_ribs'].includes(result.profileId) ? 'porc' : 'boeuf'
  const heroImg = HERO_IMAGES[category]

  // Formate des heures décimales en "Xh" ou "XhMM" proprement
  const fmtTime = (raw) => {
    // Convertir en minutes totales pour éviter les erreurs d'arrondi
    let totalMin = Math.round(raw * 60)
    let negative = totalMin < 0
    if (negative) totalMin = 24 * 60 + totalMin // wrap sur 24h
    let h = Math.floor(totalMin / 60) % 24
    let m = totalMin % 60
    // Arrondir au quart d'heure le plus proche pour lisibilité
    m = Math.round(m / 15) * 15
    if (m === 60) { h = (h + 1) % 24; m = 0 }
    const suffix = negative ? ' (veille)' : ''
    return m === 0 ? `${h}h${suffix}` : `${h}h${String(m).padStart(2, '0')}${suffix}`
  }

  // Calcul heure de démarrage à partir de l'heure de service
  const avgTotalMin = Math.round((result.totalLowMinutes + result.totalHighMinutes) / 2)
  const startHourRaw = serviceHour - avgTotalMin / 60
  const startDisplay = fmtTime(startHourRaw)

  // Plage : heure de démarrage pessimiste (totalHigh) et optimiste (totalLow)
  const startEarlyRaw = serviceHour - result.totalHighMinutes / 60
  const startLateRaw = serviceHour - result.totalLowMinutes / 60

  return (
    <div className="animate-fade-up space-y-5">

      {/* ── Hero banner avec image ── */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/95 via-[#09090b]/80 to-[#09090b]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
        </div>
        <div className="relative p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl animate-float">🔥</span>
            <span className="badge badge-accent">Assistant Cuisson</span>
          </div>
          <h2 className="text-[24px] sm:text-[30px] font-extrabold text-white tracking-tight leading-tight mb-1">
            {result.profile}
          </h2>
          <p className="text-[13px] text-zinc-400 mb-6">
            {result.weightKg > 0 ? `${result.weightKg} kg · ` : ''}
            {result.cookTempC > 0 ? `${result.cookTempC}°C · ` : ''}
            {result.wrapped ? 'Wrappé · ' : ''}
            {result.cookType === 'reverse_sear' ? 'Reverse sear' : 'Low & slow'}
          </p>

          {/* Big stats */}
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div className="rounded-xl p-4 bg-gradient-to-br from-[#ff6b1a]/[0.12] to-[#ef4444]/[0.06] border border-[#ff6b1a]/[0.25] backdrop-blur-sm shadow-lg shadow-[#ff6b1a]/[0.08]">
              <p className="text-[10px] font-bold text-[#ff6b1a]/80 uppercase tracking-[0.08em] mb-0.5">Durée totale</p>
              <p className="text-[20px] sm:text-[24px] font-black text-[#ff6b1a] leading-tight">{result.totalEstimate}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Cuisson + repos</p>
            </div>
            <div className="rounded-xl p-4 bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-0.5">Repos</p>
              <p className="text-[20px] sm:text-[24px] font-extrabold text-white leading-tight">{result.restEstimate}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Essentiel</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Heure de démarrage ── */}
      <div className="surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-xs">🕐</span>
          </div>
          <h3 className="text-[14px] font-bold text-white">Quand allumer le fumoir ?</h3>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <p className="text-[13px] text-zinc-400">Je veux manger à</p>
          <div className="flex items-center gap-1.5">
            {[12, 13, 14, 17, 18, 19, 20, 21].map((h) => (
              <button
                key={h}
                onClick={() => setServiceHour(h)}
                className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                  serviceHour === h
                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                    : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-4 bg-gradient-to-r from-blue-500/[0.08] to-indigo-500/[0.05] border border-blue-500/[0.15]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
              <span className="text-lg">⏰</span>
            </div>
            <div>
              <p className="text-[18px] sm:text-[22px] font-extrabold text-white leading-tight">
                Allume vers {startDisplay}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Fourchette : entre {fmtTime(startEarlyRaw)} et {fmtTime(startLateRaw)}
              </p>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-zinc-600 mt-2.5">
          Estimation basée sur la durée moyenne. Mieux vaut commencer tôt — un long repos n'abîme jamais la viande.
        </p>
      </div>

      {/* ── Quick brief : comment cuire ── */}
      <div className="surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-[#ef4444] flex items-center justify-center">
            <span className="text-xs">🔥</span>
          </div>
          <h3 className="text-[14px] font-bold text-white">Comment cuire</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {result.cookTempC > 0 && (
            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.05]">
              <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider">Fumoir</p>
              <p className="text-[18px] font-extrabold text-white mt-0.5">{result.cookTempC}°C</p>
              <p className="text-[10px] text-zinc-600">{Math.round(result.cookTempC * 9/5 + 32)}°F</p>
            </div>
          )}
          <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.05]">
            <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider">Méthode</p>
            <p className="text-[14px] font-bold text-white mt-0.5">{result.cookType === 'reverse_sear' ? 'Reverse sear' : 'Low & slow'}</p>
            <p className="text-[10px] text-zinc-600">Zone indirecte</p>
          </div>
          {result.wrapped && (
            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.05]">
              <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider">Wrap</p>
              <p className="text-[14px] font-bold text-white mt-0.5">Oui</p>
              <p className="text-[10px] text-zinc-600">Papier boucher</p>
            </div>
          )}
          {result.cues?.target_temp_min && (
            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.05]">
              <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider">Cible interne</p>
              <p className="text-[18px] font-extrabold text-white mt-0.5">{result.cues.target_temp_min}°C</p>
              <p className="text-[10px] text-zinc-600">à {result.cues.target_temp_max}°C</p>
            </div>
          )}
          {result.targetFinalTemp && (
            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.05]">
              <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider">Cible finale</p>
              <p className="text-[18px] font-extrabold text-white mt-0.5">{result.targetFinalTemp}°C</p>
              <p className="text-[10px] text-zinc-600">Après saisie</p>
            </div>
          )}
          {result.weightKg > 0 && (
            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.05]">
              <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider">Poids</p>
              <p className="text-[18px] font-extrabold text-white mt-0.5">{result.weightKg} kg</p>
              <p className="text-[10px] text-zinc-600">{result.tolerance > 0.15 ? 'Grosse pièce' : 'Pièce standard'}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Disclaimer pitmaster ── */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#ff6b1a]/[0.04] border border-[#ff6b1a]/[0.08]">
        <span className="text-sm mt-0.5">💡</span>
        <p className="text-[12px] text-zinc-400 leading-relaxed">
          <span className="text-[#ff6b1a] font-semibold">Prêt dans environ {result.totalEstimate.replace('~', '')}</span> — ces durées sont des estimations terrain. Chaque cuisson est unique, fie-toi à la viande, pas au chrono.
        </p>
      </div>

      {/* ── Phases section title ── */}
      <div className="flex items-center gap-3 pt-2">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.1em]">Phases de cuisson</p>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>

      {/* ── Phases ── */}
      <div className="space-y-3 stagger">
        {result.phases.map((phase) => (
          <PhaseCard key={phase.num} phase={phase} total={result.phases.length} />
        ))}
      </div>

      {/* ── Ribs method ── */}
      {result.ribsMethod && <RibsMethodCard method={result.ribsMethod} />}

      {/* ── Reverse sear guide ── */}
      {result.reverseSearGuide && <ReverseSearCard guide={result.reverseSearGuide} />}

      {/* ── Tips ── */}
      {result.tips?.length > 0 && (
        <div className="surface p-6 relative overflow-hidden">
          <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-[#ff6b1a]/[0.03] rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff6b1a] to-red-600 flex items-center justify-center">
                <span className="text-sm">💡</span>
              </div>
              <h3 className="text-[15px] font-bold text-white">Conseils du pitmaster</h3>
            </div>
            <div className="space-y-3">
              {result.tips.map((tip, i) => (
                <div key={i} className="flex gap-3 items-start group">
                  <div className="w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center text-[10px] font-bold text-zinc-600 shrink-0 mt-0.5 group-hover:bg-[#ff6b1a]/10 group-hover:text-[#ff6b1a] transition-colors">
                    {i + 1}
                  </div>
                  <p className="text-[13px] text-zinc-400 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Phase card ── */
function PhaseCard({ phase, total }) {
  const theme = PHASE_THEMES[phase.num] || PHASE_THEMES[1]
  const progress = (phase.num / total) * 100

  return (
    <div className={`surface p-5 relative overflow-hidden group hover:border-white/[0.1] transition-all`}>
      {/* Progress indicator */}
      <div className="absolute top-0 left-0 h-[2px] rounded-full bg-gradient-to-r opacity-60" style={{
        width: `${progress}%`,
        backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
      }}>
        <div className={`h-full rounded-full bg-gradient-to-r ${theme.color}`} />
      </div>

      <div className="flex items-start gap-4">
        {/* Phase number with icon */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.color} flex items-center justify-center shadow-lg`}
            style={{ boxShadow: `0 4px 15px rgba(249,115,22,0.15)` }}>
            <span className="text-base">{theme.icon}</span>
          </div>
          <span className="text-[9px] font-bold text-zinc-600">{phase.num}/{total}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <h3 className="text-[15px] font-bold text-white">{phase.title}</h3>
            {phase.duration && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${theme.bg} ${theme.border} ${theme.text} border`}>
                {phase.duration}
              </span>
            )}
          </div>

          {phase.objective && (
            <p className="text-[12px] text-zinc-500 mb-3 leading-relaxed">{phase.objective}</p>
          )}

          {/* Markers */}
          {phase.markers?.length > 0 && (
            <div className="space-y-2 mb-3">
              {phase.markers.map((m, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg px-3 py-2 bg-white/[0.02] border border-white/[0.03]">
                  <MarkerIcon type={m.type} />
                  <p className="text-[12px] text-zinc-300 leading-relaxed">{m.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Advice */}
          {phase.advice && (
            <div className="px-3 py-2.5 rounded-lg bg-[#ff6b1a]/[0.04] border border-[#ff6b1a]/[0.08]">
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                <span className="text-[#ff6b1a] font-semibold">Conseil :</span> {phase.advice}
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
    return (
      <div className="w-5 h-5 rounded-md bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[10px]">🌡️</span>
      </div>
    )
  }
  if (type === 'visual') {
    return (
      <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[10px]">👁️</span>
      </div>
    )
  }
  return (
    <div className="w-5 h-5 rounded-md bg-zinc-500/10 flex items-center justify-center shrink-0 mt-0.5">
      <span className="text-[10px]">ℹ️</span>
    </div>
  )
}

/* ── Ribs method card ── */
function RibsMethodCard({ method }) {
  return (
    <div className="surface p-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/[0.04] rounded-full blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🍖</span>
          <h3 className="text-[16px] font-bold text-white">{method.title}</h3>
        </div>
        <p className="text-[12px] text-zinc-500 mb-5">Température fumoir : <span className="text-amber-400 font-semibold">{method.temp}</span></p>

        <div className="space-y-0 mb-5">
          {method.steps.map((s, i) => (
            <div key={i} className="flex items-stretch gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-[#ef4444] flex items-center justify-center text-[12px] font-bold text-white shadow-md shrink-0">
                  {s.time}
                </div>
                {i < method.steps.length - 1 && <div className="w-px flex-1 bg-amber-500/20 my-1" />}
              </div>
              <div className="pb-4 pt-1.5">
                <p className="text-[13px] text-zinc-200 font-medium leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-4 bg-amber-500/[0.05] border border-amber-500/[0.1] mb-3">
          <p className="text-[12px] text-zinc-300">
            <span className="font-bold text-amber-400">Résultat :</span> {method.result}
          </p>
        </div>

        <p className="text-[11px] text-zinc-600 italic">{method.note}</p>

        {method.alternative && (
          <div className="mt-3 rounded-xl p-3 bg-white/[0.02] border border-white/[0.04]">
            <p className="text-[11px] text-zinc-500">
              <span className="font-semibold text-zinc-400">Alternative : {method.alternative.name}</span> — {method.alternative.desc}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Reverse sear card ── */
function ReverseSearCard({ guide }) {
  return (
    <div className="surface p-6 border-[#ff6b1a]/[0.15] relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#ff6b1a]/[0.04] rounded-full blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b1a] to-red-600 flex items-center justify-center shadow-lg shadow-[#ff6b1a]/20">
            <span className="text-lg">🔥</span>
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-white">Reverse Sear</h3>
            <p className="badge badge-accent mt-0.5">{guide.badge}</p>
          </div>
        </div>

        {/* Principle steps */}
        <div className="mt-5 mb-5">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3">Principe</p>
          <div className="space-y-2">
            {guide.principle.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#ff6b1a]/20 to-red-500/20 flex items-center justify-center text-[10px] font-bold text-[#ff6b1a] shrink-0 mt-0.5 border border-[#ff6b1a]/10">
                  {i + 1}
                </div>
                <p className="text-[13px] text-zinc-300 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Temperature targets */}
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3">Températures pull</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(guide.targets).map(([key, t]) => (
              <div key={key} className={`rounded-xl p-3 border text-center transition-all ${
                guide.selectedDoneness === key
                  ? 'bg-[#ff6b1a]/[0.08] border-[#ff6b1a]/25 shadow-lg shadow-[#ff6b1a]/5'
                  : 'border-white/[0.06] bg-white/[0.02]'
              }`}>
                <p className={`text-[13px] font-bold ${guide.selectedDoneness === key ? 'text-[#ff6b1a]' : 'text-zinc-300'}`}>
                  {t.label}
                </p>
                <p className="text-[20px] font-extrabold text-white mt-0.5">{t.temp}°C</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">Pull à {t.temp - 8}°C</p>
              </div>
            ))}
          </div>
        </div>

        {/* Advantages */}
        <div>
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3">Avantages</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {guide.advantages.map((a, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg px-3 py-2 bg-white/[0.02] border border-white/[0.03]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b1a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                <p className="text-[12px] text-zinc-300">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
