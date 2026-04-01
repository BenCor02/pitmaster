import { useState, useMemo } from 'react'
import { useCalculatorData } from '../modules/calculator/useCalculatorData.js'
import { calculateCookPlan, formatHours } from '../modules/calculator/engine.js'
import { DONENESS_LABELS } from '../modules/calculator/data.js'

const CAT_LABELS = { boeuf: 'Boeuf', porc: 'Porc', volaille: 'Volaille' }

export default function MultiCookPage() {
  const { profiles, loading } = useCalculatorData()
  const [entries, setEntries] = useState([])
  const [serviceHour, setServiceHour] = useState(19)
  const [showPicker, setShowPicker] = useState(false)

  const profilesByCategory = useMemo(() => {
    if (!profiles) return {}
    return profiles.reduce((acc, p) => {
      const cat = p.category || 'autre'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(p)
      return acc
    }, {})
  }, [profiles])

  // ── Add meat entry ──
  const addEntry = (profileId) => {
    const profile = profiles.find(p => p.id === profileId)
    if (!profile) return
    const isFixed = !!profile.fixed_times
    const isRS = profile.cook_type === 'reverse_sear'
    const midTemp = profile.temp_bands?.[Math.floor((profile.temp_bands?.length || 1) / 2)]?.temp_c || 120
    setEntries(prev => [...prev, {
      id: Date.now(),
      profileId,
      profile,
      weightKg: isFixed ? '' : '4',
      cookTempC: midTemp,
      wrapped: profile.supports_wrap || false,
      doneness: isRS ? (profile.default_doneness || Object.keys(profile.doneness_targets || {})[0] || 'medium_rare') : null,
      isFixed,
      isRS,
    }])
    setShowPicker(false)
  }

  const removeEntry = (id) => setEntries(prev => prev.filter(e => e.id !== id))

  const updateEntry = (id, field, value) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  // ── Compute all plans ──
  const plans = useMemo(() => {
    return entries.map(entry => {
      try {
        const plan = calculateCookPlan({
          profile: entry.profile,
          weightKg: entry.isFixed ? 0 : parseFloat(entry.weightKg) || 0,
          cookTempC: entry.isFixed ? 0 : entry.cookTempC,
          wrapped: entry.wrapped,
          doneness: entry.isRS ? entry.doneness : null,
        })
        return { ...entry, plan, valid: true }
      } catch {
        return { ...entry, plan: null, valid: false }
      }
    }).filter(e => e.valid && e.plan)
  }, [entries])

  // ── Timeline computation ──
  const timeline = useMemo(() => {
    if (plans.length === 0) return null

    const serviceMinutes = serviceHour * 60
    const items = plans.map(p => {
      const avgCookMin = Math.round((p.plan.totalLowMinutes + p.plan.totalHighMinutes) / 2)
      const startMinute = serviceMinutes - avgCookMin
      const earlyStart = serviceMinutes - p.plan.totalHighMinutes
      const lateStart = serviceMinutes - p.plan.totalLowMinutes
      return {
        ...p,
        avgCookMin,
        startMinute,
        earlyStart,
        lateStart,
        startDisplay: fmtClock(startMinute),
        earlyDisplay: fmtClock(earlyStart),
        lateDisplay: fmtClock(lateStart),
      }
    })

    // Sort by earliest start time
    items.sort((a, b) => a.startMinute - b.startMinute)

    const firstStart = items[0].earlyStart
    const overallSpan = serviceMinutes - firstStart

    return { items, firstStart, overallSpan, serviceMinutes }
  }, [plans, serviceHour])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-xl">🔥</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b1a]/[0.06] via-transparent to-[#ef4444]/[0.04]" />
        <div className="relative px-6 lg:px-10 py-10 lg:py-14 max-w-5xl">
          <div className="animate-fade-up">
            <div className="badge badge-accent mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b1a] mr-2 animate-pulse" />
              Multi-cuisson
            </div>
            <h1 className="text-[28px] lg:text-[36px] font-extrabold text-white tracking-tight leading-[1.1] mb-2">
              Plusieurs viandes, <span className="text-gradient">une seule heure de service.</span>
            </h1>
            <p className="text-[14px] lg:text-[15px] text-zinc-400 max-w-lg leading-relaxed">
              Ajoute tes viandes, choisis l'heure du repas. On calcule quand allumer chaque cuisson pour que tout soit prêt en même temps.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 pb-12 max-w-5xl">

        {/* ── Service time selector ── */}
        <div className="surface p-5 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-sm">🕐</span>
              </div>
              <span className="text-[13px] font-semibold text-zinc-300">Heure de service :</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[12, 13, 14, 17, 18, 19, 20, 21].map(h => (
                <button
                  key={h}
                  onClick={() => setServiceHour(h)}
                  className={`px-3 py-2 rounded-lg text-[13px] font-bold border transition-all ${
                    serviceHour === h
                      ? 'border-[#ff6b1a]/40 bg-[#ff6b1a]/10 text-[#ff6b1a] shadow-lg shadow-[#ff6b1a]/10'
                      : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Entries list ── */}
        <div className="space-y-3 mb-6">
          {entries.map((entry, idx) => (
            <MeatEntry
              key={entry.id}
              entry={entry}
              index={idx}
              plan={plans.find(p => p.id === entry.id)?.plan}
              serviceHour={serviceHour}
              onUpdate={(field, value) => updateEntry(entry.id, field, value)}
              onRemove={() => removeEntry(entry.id)}
            />
          ))}
        </div>

        {/* ── Add meat button ── */}
        {!showPicker ? (
          <button
            onClick={() => setShowPicker(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-[#ff6b1a]/30 text-zinc-500 hover:text-[#ff6b1a] transition-all flex items-center justify-center gap-2 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">+</span>
            <span className="text-[14px] font-semibold">Ajouter une viande</span>
          </button>
        ) : (
          <div className="surface p-5 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-bold text-white">Choisis une viande</h3>
              <button onClick={() => setShowPicker(false)} className="text-[12px] text-zinc-500 hover:text-white transition-colors">
                Fermer
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(profilesByCategory).map(([cat, items]) => (
                <div key={cat}>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.1em] mb-2 px-1">{CAT_LABELS[cat]}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {items.map(p => (
                      <button
                        key={p.id}
                        onClick={() => addEntry(p.id)}
                        className="surface text-left p-3 group hover:border-[#ff6b1a]/20 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{p.icon}</span>
                          <div>
                            <p className="text-[12px] font-semibold text-zinc-300 group-hover:text-white transition-colors">{p.name}</p>
                            <p className="text-[10px] text-zinc-600">{p.cook_type === 'reverse_sear' ? 'Reverse sear' : 'Low & slow'}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ TIMELINE ══════════ */}
        {timeline && timeline.items.length >= 2 && (
          <div className="mt-8 animate-fade-up">

            {/* Section title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 fire-divider" />
              <p className="text-[11px] font-bold text-[#ff6b1a] uppercase tracking-[0.12em]">Planning de cuisson</p>
              <div className="h-px flex-1 fire-divider" />
            </div>

            {/* Summary banner */}
            <div className="surface-fire p-5 mb-5">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] flex items-center justify-center shadow-lg shadow-[#ff6b1a]/20">
                  <span className="text-xl">⏰</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-[#ff6b1a]/70 uppercase tracking-wider">Première cuisson à lancer</p>
                  <p className="text-[26px] font-black text-white leading-tight">
                    {timeline.items[0].startDisplay}
                  </p>
                  <p className="text-[12px] text-zinc-500 mt-0.5">
                    {timeline.items[0].profile.name} — fourchette : {timeline.items[0].earlyDisplay} à {timeline.items[0].lateDisplay}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-zinc-500 font-medium">Service</p>
                  <p className="text-[20px] font-extrabold text-white">{serviceHour}h00</p>
                </div>
              </div>
            </div>

            {/* Visual timeline */}
            <div className="space-y-0">
              {timeline.items.map((item, idx) => {
                const offsetPct = ((item.startMinute - timeline.firstStart) / timeline.overallSpan) * 100
                const widthPct = (item.avgCookMin / timeline.overallSpan) * 100
                const colors = TIMELINE_COLORS[idx % TIMELINE_COLORS.length]

                return (
                  <TimelineItem
                    key={item.id}
                    item={item}
                    idx={idx}
                    offsetPct={offsetPct}
                    widthPct={widthPct}
                    colors={colors}
                    timeline={timeline}
                    serviceHour={serviceHour}
                  />
                )
              })}
            </div>

            {/* Step by step checklist */}
            <div className="surface p-5 mt-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] flex items-center justify-center">
                  <span className="text-xs">📋</span>
                </div>
                <h3 className="text-[14px] font-bold text-white">Ton plan étape par étape</h3>
              </div>
              <div className="space-y-3">
                {timeline.items.map((item, idx) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] flex items-center justify-center text-[12px] font-black text-white shrink-0 shadow-md shadow-[#ff6b1a]/20">
                      {idx + 1}
                    </div>
                    <div className="pt-1">
                      <p className="text-[13px] text-white font-semibold">
                        <span className="text-[#ff6b1a] font-black">{item.startDisplay}</span> — Lance le {item.profile.name}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {item.plan.weightKg > 0 ? `${item.plan.weightKg}kg, ` : ''}
                        {item.plan.cookTempC > 0 ? `${item.plan.cookTempC}°C, ` : ''}
                        {item.plan.wrapped ? 'wrappé' : 'sans wrap'}
                        {item.plan.doneness ? ` · ${DONENESS_LABELS[item.plan.doneness] || item.plan.doneness}` : ''}
                        {' · '}durée {item.plan.totalEstimate}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex items-start gap-3 pt-2 border-t border-white/[0.06]">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-sm shrink-0">
                    🍽️
                  </div>
                  <div className="pt-1">
                    <p className="text-[13px] text-white font-semibold">
                      <span className="text-[#ff6b1a] font-black">{serviceHour}h00</span> — À table !
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {timeline.items.length} viandes prêtes en même temps
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="surface p-5 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">💡</span>
                <h3 className="text-[13px] font-bold text-white">Conseils multi-cuisson</h3>
              </div>
              <div className="space-y-2">
                {[
                  'Le planning se base sur la durée de chaque viande — c\'est le type de cuisson qui décide l\'ordre, pas le poids.',
                  'Si tu n\'as qu\'un seul fumoir, les cuissons à la même température peuvent cohabiter sur la grille.',
                  'Prévois 30 min de marge — mieux vaut que tout repose un peu plus longtemps que de courir.',
                  'Les pièces riches en collagène (brisket, pulled pork) supportent un long repos en glacière (2-4h). Les pièces maigres (poulet, reverse sear) moins.',
                ].map((tip, i) => (
                  <p key={i} className="text-[12px] text-zinc-400 leading-relaxed flex gap-2">
                    <span className="text-[#ff6b1a] font-bold shrink-0">{i + 1}.</span>
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state hint */}
        {entries.length === 0 && (
          <div className="text-center py-12 animate-fade">
            <span className="text-4xl mb-4 block">🔥</span>
            <p className="text-zinc-500 text-[14px]">Ajoute au moins 2 viandes pour voir le planning</p>
          </div>
        )}

        {entries.length === 1 && (
          <div className="text-center py-6 animate-fade">
            <p className="text-zinc-600 text-[13px]">Ajoute une deuxième viande pour voir le planning multi-cuisson</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Timeline colors ── */
const TIMELINE_COLORS = [
  { bg: 'bg-[#ff6b1a]/15', text: 'text-[#ff6b1a]', bar: 'bg-gradient-to-r from-[#ff6b1a] to-[#ef4444]' },
  { bg: 'bg-amber-500/15', text: 'text-amber-400', bar: 'bg-gradient-to-r from-amber-400 to-[#ff6b1a]' },
  { bg: 'bg-red-500/15', text: 'text-red-400', bar: 'bg-gradient-to-r from-red-400 to-rose-500' },
  { bg: 'bg-yellow-500/15', text: 'text-yellow-400', bar: 'bg-gradient-to-r from-yellow-400 to-amber-500' },
  { bg: 'bg-rose-500/15', text: 'text-rose-400', bar: 'bg-gradient-to-r from-rose-400 to-red-500' },
]

/* ── Clock formatter ── */
function fmtClock(totalMinutes) {
  let m = totalMinutes
  let suffix = ''
  if (m < 0) { m = 24 * 60 + m; suffix = ' (veille)' }
  let h = Math.floor(m / 60) % 24
  let min = Math.round(m % 60)
  min = Math.round(min / 15) * 15
  if (min === 60) { h = (h + 1) % 24; min = 0 }
  return min === 0 ? `${h}h${suffix}` : `${h}h${String(min).padStart(2, '0')}${suffix}`
}

/* ── Phase icon mapping ── */
const PHASE_ICONS = { 1: '🔥', 2: '🥵', 3: '🥩', 4: '🧈', 5: '🍽️' }

/* ── Timeline item with expandable detail ── */
function TimelineItem({ item, idx, offsetPct, widthPct, colors, timeline, serviceHour }) {
  const [expanded, setExpanded] = useState(false)
  const plan = item.plan

  return (
    <div className="relative">
      {/* Timeline bar */}
      <div className="surface p-4 mb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center text-sm shrink-0`}>
            {item.profile.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white">{item.profile.name}</p>
            <p className="text-[11px] text-zinc-500">
              {plan.weightKg > 0 ? `${plan.weightKg}kg · ` : ''}
              {plan.totalEstimate}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className={`text-[18px] font-black ${colors.text}`}>{item.startDisplay}</p>
              <p className="text-[10px] text-zinc-600">
                {item.earlyDisplay} – {item.lateDisplay}
              </p>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[#ff6b1a] hover:bg-[#ff6b1a]/10 border border-[#ff6b1a]/20 hover:border-[#ff6b1a]/40 transition-all"
              title={expanded ? 'Masquer le détail' : 'Voir le détail'}
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>

        {/* Visual bar */}
        <div className="h-3 rounded-full bg-white/[0.04] overflow-hidden relative">
          <div
            className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
            style={{ marginLeft: `${offsetPct}%`, width: `${Math.max(widthPct, 4)}%` }}
          />
          <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/30" />
        </div>

        {/* Time labels under bar */}
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px] text-zinc-700">{fmtClock(timeline.firstStart)}</span>
          <span className="text-[9px] text-zinc-500 font-semibold">{serviceHour}h00 🍽️</span>
        </div>

        {/* ── Expanded phases detail ── */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-white/[0.06] animate-fade space-y-2.5">
            {plan.phases.map((phase) => (
              <div key={phase.num} className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">{PHASE_ICONS[phase.num] || '🔥'}</span>
                  <p className="text-[12px] font-bold text-white flex-1">{phase.title}</p>
                  {phase.duration && (
                    <span className="text-[10px] font-bold text-[#ff6b1a]/80 bg-[#ff6b1a]/8 px-2 py-0.5 rounded-md">{phase.duration}</span>
                  )}
                </div>
                {phase.objective && (
                  <p className="text-[11px] text-zinc-500 mb-2">{phase.objective}</p>
                )}
                {phase.markers?.length > 0 && (
                  <div className="space-y-1">
                    {phase.markers.map((m, mi) => (
                      <div key={mi} className="flex items-start gap-2">
                        <span className="text-[9px] mt-0.5">
                          {m.type === 'temp' ? '🌡️' : m.type === 'visual' ? '👁️' : 'ℹ️'}
                        </span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{m.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                {phase.advice && (
                  <p className="text-[10px] text-zinc-500 mt-2 italic">
                    <span className="text-[#ff6b1a] font-semibold not-italic">Conseil :</span> {phase.advice}
                  </p>
                )}
              </div>
            ))}

            {plan.cues?.target_temp_min && (
              <div className="rounded-xl p-3 bg-[#ff6b1a]/[0.04] border border-[#ff6b1a]/[0.10]">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Cible interne</p>
                    <p className="text-[16px] font-black text-white">{plan.cues.target_temp_min}–{plan.cues.target_temp_max}°C</p>
                  </div>
                  {plan.cues.stall_temp_min && (
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Stall</p>
                      <p className="text-[16px] font-black text-white">{plan.cues.stall_temp_min}–{plan.cues.stall_temp_max}°C</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {plan.tips?.length > 0 && (
              <div className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Conseils pitmaster</p>
                {plan.tips.slice(0, 3).map((tip, ti) => (
                  <p key={ti} className="text-[11px] text-zinc-400 leading-relaxed mb-1 last:mb-0">
                    <span className="text-[#ff6b1a] font-bold">{ti + 1}.</span> {tip}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connector */}
      {idx < timeline.items.length - 1 && (
        <div className="flex items-center gap-2 py-1 px-6">
          <div className="w-px h-4 bg-white/[0.06] ml-3" />
          <span className="text-[10px] text-zinc-700">
            puis {Math.round((timeline.items[idx + 1].startMinute - item.startMinute) / 60 * 10) / 10}h plus tard →
          </span>
        </div>
      )}
    </div>
  )
}

/* ── Meat entry card ── */
function MeatEntry({ entry, index, plan, serviceHour, onUpdate, onRemove }) {
  const isFixed = entry.isFixed
  const isRS = entry.isRS
  const tempMin = entry.profile.temp_bands?.[0]?.temp_c || 100
  const tempMax = entry.profile.temp_bands?.[entry.profile.temp_bands.length - 1]?.temp_c || 150

  // Compute start time for this entry
  let startDisplay = null
  if (plan) {
    const avgMin = Math.round((plan.totalLowMinutes + plan.totalHighMinutes) / 2)
    const startMin = serviceHour * 60 - avgMin
    startDisplay = fmtClock(startMin)
  }

  return (
    <div className="surface p-4 animate-fade-up">
      <div className="flex items-start gap-3">
        {/* Meat icon + number */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b1a]/10 to-[#ef4444]/5 flex items-center justify-center text-xl border border-[#ff6b1a]/10">
            {entry.profile.icon}
          </div>
          <span className="text-[9px] font-bold text-zinc-600">#{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[14px] font-bold text-white">{entry.profile.name}</p>
              <p className="text-[11px] text-zinc-600">
                {isRS ? 'Reverse sear' : isFixed ? 'Temps fixe' : 'Low & slow'}
                {entry.profile.supports_wrap ? ' · Wrap possible' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {startDisplay && (
                <div className="text-right">
                  <p className="text-[10px] text-zinc-600">Départ</p>
                  <p className="text-[16px] font-black text-[#ff6b1a]">{startDisplay}</p>
                </div>
              )}
              <button
                onClick={onRemove}
                className="text-zinc-700 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                title="Retirer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* Controls grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Weight */}
            {!isFixed && (
              <div>
                <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">Poids</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="20"
                    value={entry.weightKg}
                    onChange={(e) => onUpdate('weightKg', e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-[14px] font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-[#ff6b1a]/30 transition-all"
                    placeholder="4"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-zinc-600">kg</span>
                </div>
              </div>
            )}

            {/* Temperature */}
            {!isFixed && (
              <div>
                <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">Fumoir</label>
                <div className="relative">
                  <input
                    type="number"
                    min={tempMin}
                    max={tempMax}
                    value={entry.cookTempC}
                    onChange={(e) => onUpdate('cookTempC', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-[14px] font-bold text-white focus:outline-none focus:border-[#ff6b1a]/30 transition-all"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-zinc-600">°C</span>
                </div>
              </div>
            )}

            {/* Wrap */}
            {entry.profile.supports_wrap && (
              <div>
                <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">Wrap</label>
                <button
                  onClick={() => onUpdate('wrapped', !entry.wrapped)}
                  className={`w-full px-3 py-2 rounded-lg text-[12px] font-semibold border transition-all ${
                    entry.wrapped
                      ? 'border-[#ff6b1a]/25 bg-[#ff6b1a]/8 text-[#ff6b1a]'
                      : 'border-white/[0.08] text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {entry.wrapped ? 'Oui' : 'Non'}
                </button>
              </div>
            )}

            {/* Doneness */}
            {isRS && (
              <div>
                <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">Cuisson</label>
                <select
                  value={entry.doneness || entry.profile?.default_doneness || 'medium_rare'}
                  onChange={(e) => onUpdate('doneness', e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-[12px] font-semibold text-white focus:outline-none focus:border-[#ff6b1a]/30 transition-all appearance-none"
                >
                  {Object.entries(entry.profile?.doneness_targets || {}).map(([k]) => (
                    <option key={k} value={k} className="bg-zinc-900">{DONENESS_LABELS[k] || k}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick info */}
          {plan && (
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              <span className="text-[11px] text-zinc-500">
                Durée : <span className="text-zinc-300 font-semibold">{plan.totalEstimate}</span>
              </span>
              <span className="text-[11px] text-zinc-500">
                Repos : <span className="text-zinc-300 font-semibold">{plan.restEstimate}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
