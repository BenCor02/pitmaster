import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { updateMeta } from '../lib/seo.js'

/**
 * Données de rendement par viande.
 * raw_kg_per_person = kg de viande CRUE nécessaire par personne (portion standard ~200-250g cuit).
 * Le rendement tient compte de la perte à la cuisson (eau, gras fondu, shrinkage).
 *
 * Sources :
 * - AmazingRibs.com (Meathead Goldwyn) — rendement ~50% brisket, ~55% pulled pork
 * - Aaron Franklin MasterClass — "Count on losing about half the weight"
 * - Weber Academy / BBQ Québec
 * - Retours terrain r/smoking, r/BBQ
 */
const PORTIONS_DATA = [
  // ── BOEUF ──
  {
    id: 'brisket',
    name: 'Brisket',
    category: 'boeuf',
    icon: '🥩',
    raw_kg_per_person: 0.45,
    yield_pct: 50,
    note: 'Rendement ~50%. Un brisket de 5kg nourrit ~11 personnes. Prévoir un peu plus si tu sers en sandwich.',
    serving_style: 'Tranché ou en sandwich',
    cook_link: '/calculateur?m=brisket',
  },
  {
    id: 'beef_short_ribs',
    name: 'Beef Short Ribs',
    category: 'boeuf',
    icon: '🥩',
    raw_kg_per_person: 0.50,
    yield_pct: 45,
    note: 'Beaucoup d\'os = rendement plus faible (~45%). Compte ~500g brut par personne.',
    serving_style: 'Entier ou effiloché',
    cook_link: '/calculateur?m=beef_short_ribs',
  },
  {
    id: 'chuck_roast',
    name: 'Paleron / Chuck Roast',
    category: 'boeuf',
    icon: '🥩',
    raw_kg_per_person: 0.40,
    yield_pct: 55,
    note: 'Bon rendement (~55%). Parfait pour du pulled beef en mode tacos ou burgers.',
    serving_style: 'Effiloché',
    cook_link: '/calculateur?m=chuck_roast',
  },
  {
    id: 'prime_rib',
    name: 'Côte de bœuf / Prime Rib',
    category: 'boeuf',
    icon: '🥩',
    raw_kg_per_person: 0.40,
    yield_pct: 70,
    note: 'Rendement élevé (~70%) car cuisson douce. Compter 1 côte (~400g) par personne.',
    serving_style: 'Tranché épais',
    cook_link: '/calculateur?m=prime_rib',
  },
  {
    id: 'tomahawk',
    name: 'Tomahawk',
    category: 'boeuf',
    icon: '🥩',
    raw_kg_per_person: 0.50,
    yield_pct: 65,
    note: 'L\'os pèse lourd (~30% du poids). Un tomahawk de 1kg peut nourrir 2 personnes.',
    serving_style: 'Tranché et partagé',
    cook_link: '/calculateur?m=tomahawk',
  },

  // ── PORC ──
  {
    id: 'pulled_pork',
    name: 'Pulled Pork',
    category: 'porc',
    icon: '🐷',
    raw_kg_per_person: 0.45,
    yield_pct: 50,
    note: 'Rendement ~50%. Un pork butt de 4kg donne ~2kg de pulled = ~9 personnes en sandwich.',
    serving_style: 'Effiloché en sandwich ou assiette',
    cook_link: '/calculateur?m=pulled_pork',
  },
  {
    id: 'spare_ribs',
    name: 'Spare Ribs',
    category: 'porc',
    icon: '🍖',
    raw_kg_per_person: 0.50,
    yield_pct: 50,
    note: 'Un rack de spare ribs (~1.5kg) nourrit 2-3 personnes. Beaucoup d\'os.',
    serving_style: 'Par côtes (3-4 côtes/personne)',
    cook_link: '/calculateur?m=spare_ribs',
  },
  {
    id: 'baby_back_ribs',
    name: 'Baby Back Ribs',
    category: 'porc',
    icon: '🍖',
    raw_kg_per_person: 0.45,
    yield_pct: 50,
    note: 'Plus petites que les spare ribs. Un rack (~1kg) nourrit 2 personnes.',
    serving_style: 'Par côtes (4-5 côtes/personne)',
    cook_link: '/calculateur?m=baby_back_ribs',
  },

  // ── VOLAILLE ──
  {
    id: 'whole_chicken',
    name: 'Poulet entier',
    category: 'volaille',
    icon: '🍗',
    raw_kg_per_person: 0.45,
    yield_pct: 65,
    note: 'Un poulet de 1.8kg nourrit 4 personnes. Le fumoir donne une peau incroyable.',
    serving_style: 'Découpé (cuisse, blanc, aile)',
    cook_link: '/calculateur?m=whole_chicken',
  },
]

const CAT_LABELS = { boeuf: 'Boeuf', porc: 'Porc', volaille: 'Volaille' }
const CAT_ORDER = ['boeuf', 'porc', 'volaille']

export default function PortionCalculatorPage() {
  const [guests, setGuests] = useState(8)
  const [appetite, setAppetite] = useState('normal') // light | normal | big
  const [selectedMeat, setSelectedMeat] = useState(null)

  useEffect(() => {
    updateMeta({
      title: 'Calculateur de portions BBQ — Combien de viande par personne | Charbon & Flamme',
      description: 'Combien de brisket, pulled pork ou ribs acheter ? Calcule les portions exactes par personne en tenant compte du rendement de cuisson.',
      canonical: 'https://charbonetflamme.fr/portions',
    })
  }, [])

  const appetiteMultiplier = appetite === 'light' ? 0.75 : appetite === 'big' ? 1.35 : 1

  const byCategory = useMemo(() => {
    const map = {}
    PORTIONS_DATA.forEach(m => {
      if (!map[m.category]) map[m.category] = []
      map[m.category].push(m)
    })
    return map
  }, [])

  const results = useMemo(() => {
    return PORTIONS_DATA.map(m => {
      const rawKg = m.raw_kg_per_person * guests * appetiteMultiplier
      const cookedKg = rawKg * (m.yield_pct / 100)
      return { ...m, rawKg: Math.ceil(rawKg * 10) / 10, cookedKg: Math.round(cookedKg * 10) / 10 }
    })
  }, [guests, appetiteMultiplier])

  const selectedResult = selectedMeat ? results.find(r => r.id === selectedMeat) : null

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b1a]/[0.06] via-transparent to-red-500/[0.04]" />
        <div className="relative px-6 lg:px-10 py-10 lg:py-14 max-w-4xl">
          <div className="animate-fade-up">
            <div className="badge badge-accent mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b1a] mr-2 animate-pulse" />
              Outil Pitmaster
            </div>
            <h1 className="text-[28px] lg:text-[36px] font-extrabold text-white tracking-tight leading-[1.1] mb-2">
              Combien de viande <span className="text-gradient">acheter ?</span>
            </h1>
            <p className="text-[14px] lg:text-[15px] text-zinc-400 max-w-lg leading-relaxed">
              Calcule les quantités exactes de viande crue à acheter selon le nombre d'invités. Rendements réels, pas de la théorie.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 pb-12 max-w-4xl">

        {/* ── Controls ── */}
        <div className="surface p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">

            {/* Guests */}
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3 block">
                Nombre de personnes
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all text-lg font-bold"
                >
                  −
                </button>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={guests}
                    onChange={(e) => setGuests(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[22px] font-extrabold text-white focus:outline-none focus:border-[#ff6b1a]/30 transition-all"
                  />
                </div>
                <button
                  onClick={() => setGuests(Math.min(100, guests + 1))}
                  className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all text-lg font-bold"
                >
                  +
                </button>
              </div>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {[4, 6, 8, 10, 15, 20, 30].map(n => (
                  <button
                    key={n}
                    onClick={() => setGuests(n)}
                    className={`px-2.5 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                      guests === n
                        ? 'border-[#ff6b1a]/30 bg-[#ff6b1a]/8 text-[#ff6b1a]'
                        : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Appetite */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3 block">
                Appétit
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'light', label: 'Léger', icon: '🥗', desc: '−25%' },
                  { id: 'normal', label: 'Normal', icon: '🍽️', desc: 'Standard' },
                  { id: 'big', label: 'Gros mangeurs', icon: '🤤', desc: '+35%' },
                ].map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAppetite(a.id)}
                    className={`flex flex-col items-center px-4 py-2.5 rounded-xl border transition-all ${
                      appetite === a.id
                        ? 'border-[#ff6b1a] bg-[#ff6b1a]/10 text-[#ff8c4a]'
                        : 'border-zinc-700/50 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <span className="text-lg mb-0.5">{a.icon}</span>
                    <span className="text-[11px] font-semibold">{a.label}</span>
                    <span className="text-[9px] text-zinc-600">{a.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Results grid ── */}
        <div className="space-y-6">
          {CAT_ORDER.map(cat => {
            const items = byCategory[cat]
            if (!items) return null
            return (
              <div key={cat}>
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-3 px-1">
                  {CAT_LABELS[cat]}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map(meat => {
                    const r = results.find(x => x.id === meat.id)
                    const active = selectedMeat === meat.id
                    return (
                      <button
                        key={meat.id}
                        onClick={() => setSelectedMeat(active ? null : meat.id)}
                        className={`surface text-left p-4 transition-all group ${active ? 'surface-active' : ''}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors ${
                            active ? 'bg-[#ff6b1a]/10' : 'bg-white/[0.03]'
                          }`}>
                            {meat.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[13px] font-semibold transition-colors ${
                              active ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                            }`}>
                              {meat.name}
                            </p>
                            <p className="text-[10px] text-zinc-600">{meat.serving_style}</p>
                          </div>
                        </div>

                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[28px] font-extrabold text-[#ff6b1a] leading-none">{r.rawKg}</span>
                          <span className="text-[13px] text-zinc-500 font-medium">kg à acheter</span>
                        </div>
                        <p className="text-[11px] text-zinc-600 mt-1">
                          ≈ {r.cookedKg} kg cuit · rendement {meat.yield_pct}%
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Detail card ── */}
        {selectedResult && (
          <div className="mt-6 animate-fade-up">
            <div className="surface p-6 border-[#ff6b1a]/[0.15]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#ff6b1a]/10 flex items-center justify-center text-2xl">
                  {selectedResult.icon}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white">{selectedResult.name}</h3>
                  <p className="text-[12px] text-zinc-500">{selectedResult.serving_style}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-xl p-3 bg-[#ff6b1a]/[0.08] border border-[#ff6b1a]/[0.15] text-center">
                  <p className="text-[9px] font-semibold text-[#ff8c4a]/70 uppercase tracking-wider">À acheter</p>
                  <p className="text-[24px] font-extrabold text-[#ff6b1a]">{selectedResult.rawKg}</p>
                  <p className="text-[10px] text-zinc-500">kg brut</p>
                </div>
                <div className="rounded-xl p-3 bg-white/[0.04] border border-white/[0.06] text-center">
                  <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Cuit</p>
                  <p className="text-[24px] font-extrabold text-white">{selectedResult.cookedKg}</p>
                  <p className="text-[10px] text-zinc-500">kg</p>
                </div>
                <div className="rounded-xl p-3 bg-white/[0.04] border border-white/[0.06] text-center">
                  <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Rendement</p>
                  <p className="text-[24px] font-extrabold text-white">{selectedResult.yield_pct}%</p>
                  <p className="text-[10px] text-zinc-500">après cuisson</p>
                </div>
              </div>

              <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-4">
                <p className="text-[12px] text-zinc-400 leading-relaxed">
                  <span className="text-[#ff6b1a] font-semibold">Conseil :</span> {selectedResult.note}
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  to={selectedResult.cook_link}
                  className="btn-primary px-5 py-2.5 text-[13px] inline-flex items-center gap-2"
                >
                  <span>🔥</span>
                  Calculer la cuisson
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Tips ── */}
        <div className="surface p-5 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff6b1a] to-red-600 flex items-center justify-center">
              <span className="text-xs">💡</span>
            </div>
            <h3 className="text-[14px] font-bold text-white">Astuces quantités</h3>
          </div>
          <div className="space-y-2.5">
            {[
              'Si tu sers plusieurs viandes, réduis chaque quantité de 30-40%.',
              'Prévois toujours 10-15% de plus que le calcul — mieux vaut des restes que des invités affamés.',
              'Les accompagnements (coleslaw, pain, sides) réduisent la quantité de viande nécessaire.',
              'Pour un événement, compte ~250g de viande cuite par personne en moyenne.',
            ].map((tip, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center text-[10px] font-bold text-zinc-600 shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-[12px] text-zinc-400 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
