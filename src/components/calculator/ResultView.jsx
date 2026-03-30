import { useState } from 'react'

// ── Themes ──────────────────────────────────────────────

const PHASE_THEMES = {
  1: { color: 'from-[#ff6b1a] to-red-500', bg: 'bg-[#ff6b1a]/[0.08]', border: 'border-[#ff6b1a]/[0.20]', text: 'text-[#ff6b1a]', icon: '🔥' },
  2: { color: 'from-amber-400 to-[#ff6b1a]', bg: 'bg-amber-500/[0.08]', border: 'border-amber-500/[0.20]', text: 'text-amber-400', icon: '🥵' },
  3: { color: 'from-red-500 to-rose-500', bg: 'bg-red-500/[0.08]', border: 'border-red-500/[0.20]', text: 'text-red-400', icon: '🥩' },
  4: { color: 'from-yellow-400 to-amber-500', bg: 'bg-yellow-500/[0.08]', border: 'border-yellow-500/[0.20]', text: 'text-yellow-400', icon: '🧈' },
  5: { color: 'from-[#ff8c4a] to-red-600', bg: 'bg-[#ff8c4a]/[0.08]', border: 'border-[#ff8c4a]/[0.20]', text: 'text-[#ff8c4a]', icon: '🍽️' },
}

// ── Helpers ─────────────────────────────────────────────

function fmtTime(raw) {
  let totalMin = Math.round(raw * 60)
  let negative = totalMin < 0
  if (negative) totalMin = 24 * 60 + totalMin
  let h = Math.floor(totalMin / 60) % 24
  let m = totalMin % 60
  m = Math.round(m / 15) * 15
  if (m === 60) { h = (h + 1) % 24; m = 0 }
  const suffix = negative ? ' (veille)' : ''
  return m === 0 ? `${h}h${suffix}` : `${h}h${String(m).padStart(2, '0')}${suffix}`
}

// ── Collapsible section ─────────────────────────────────

function Collapsible({ title, icon, defaultOpen = false, children, badge }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="surface overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff6b1a]/15 to-red-500/10 flex items-center justify-center shrink-0">
          <span className="text-xs">{icon}</span>
        </div>
        <span className="text-[13px] font-bold text-white flex-1">{title}</span>
        {badge && <span className="text-[10px] font-semibold text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded-md">{badge}</span>}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`text-zinc-600 transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4 animate-fade">{children}</div>}
    </div>
  )
}

// ── Main component ──────────────────────────────────────

export default function ResultView({ result, contentBlocks, rubs, actionBar }) {
  const [serviceHour, setServiceHour] = useState(19)

  const avgTotalMin = Math.round((result.totalLowMinutes + result.totalHighMinutes) / 2)
  const startHourRaw = serviceHour - avgTotalMin / 60
  const startDisplay = fmtTime(startHourRaw)
  const startEarlyRaw = serviceHour - result.totalHighMinutes / 60
  const startLateRaw = serviceHour - result.totalLowMinutes / 60

  return (
    <div className="animate-fade-up space-y-3">

      {/* ── Hero compact : résumé + stats intégrés ── */}
      <div className="surface p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff6b1a] to-red-600 flex items-center justify-center shadow-lg shadow-[#ff6b1a]/15 shrink-0">
            <span className="text-xl">🔥</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[20px] font-extrabold text-white tracking-tight leading-tight">{result.profile}</h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
              {result.weightKg > 0 && <span className="text-[11px] text-zinc-500 font-medium">{result.weightKg} kg</span>}
              {result.weightKg > 0 && result.cookTempC > 0 && <span className="text-zinc-700">·</span>}
              {result.cookTempC > 0 && <span className="text-[11px] text-zinc-500 font-medium">{result.cookTempC}°C ({Math.round(result.cookTempC * 9/5 + 32)}°F)</span>}
              {(result.weightKg > 0 || result.cookTempC > 0) && <span className="text-zinc-700">·</span>}
              <span className="text-[11px] text-zinc-500 font-medium">{result.cookType === 'reverse_sear' ? 'Reverse sear' : 'Low & slow'}</span>
              {result.wrapped && <><span className="text-zinc-700">·</span><span className="text-[11px] text-zinc-500 font-medium">Wrappé</span></>}
            </div>
          </div>
        </div>

        {/* Durées */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl p-3.5 bg-gradient-to-br from-[#ff6b1a]/[0.10] to-[#dc2626]/[0.04] border border-[#ff6b1a]/[0.20]">
            <p className="text-[10px] font-bold text-[#ff6b1a]/70 uppercase tracking-wider">Durée totale</p>
            <p className="text-[22px] font-black text-[#ff6b1a] leading-tight mt-0.5">{result.totalEstimate}</p>
          </div>
          <div className="rounded-xl p-3.5 bg-white/[0.04] border border-white/[0.06]">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Repos</p>
            <p className="text-[22px] font-extrabold text-white leading-tight mt-0.5">{result.restEstimate}</p>
          </div>
        </div>

        {/* Note */}
        <p className="text-[11px] text-zinc-600 mt-3 leading-relaxed">
          Estimations terrain — chaque cuisson est unique, fie-toi à la viande, pas au chrono.
        </p>
      </div>

      {/* ── Heure de démarrage (compact) ── */}
      <div className="surface p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">🕐</span>
          <p className="text-[13px] font-bold text-white">Quand allumer ?</p>
          <span className="text-[11px] text-zinc-500 ml-auto">pour manger à</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[12, 13, 14, 18, 19, 20, 21].map((h) => (
            <button key={h} onClick={() => setServiceHour(h)} className={`px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${serviceHour === h ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300'}`}>{h}h</button>
          ))}
        </div>
        <div className="flex items-center gap-3 rounded-xl p-3 bg-blue-500/[0.06] border border-blue-500/[0.12]">
          <span className="text-lg">⏰</span>
          <div>
            <p className="text-[16px] font-extrabold text-white">Allume vers {startDisplay}</p>
            <p className="text-[10px] text-zinc-500">Entre {fmtTime(startEarlyRaw)} et {fmtTime(startLateRaw)}</p>
          </div>
        </div>
      </div>

      {/* ── Phases (toujours visibles — le coeur) ── */}
      <div className="flex items-center gap-3 pt-1">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.1em]">Phases de cuisson</p>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>

      <div className="space-y-2.5">
        {result.phases.map((phase) => (
          <PhaseCard key={phase.num} phase={phase} total={result.phases.length} />
        ))}
      </div>

      {/* ── Ribs method (si applicable) ── */}
      {result.ribsMethod && <RibsMethodCard method={result.ribsMethod} />}

      {/* ── Reverse sear guide (si applicable) ── */}
      {result.reverseSearGuide && <ReverseSearCard guide={result.reverseSearGuide} />}

      {/* ── Sections repliables ── */}

      {result.tips?.length > 0 && (
        <Collapsible title="Conseils du pitmaster" icon="💡" badge={`${result.tips.length} conseils`}>
          <div className="space-y-2">
            {result.tips.map((tip, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center text-[10px] font-bold text-zinc-600 shrink-0 mt-0.5">{i + 1}</div>
                <p className="text-[12px] text-zinc-400 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </Collapsible>
      )}

      {rubs}

      {contentBlocks && (
        <Collapsible title="Guides & articles" icon="📖">
          {contentBlocks}
        </Collapsible>
      )}

      {/* ── Barre d'actions compacte ── */}
      {actionBar}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────

function PhaseCard({ phase, total }) {
  const theme = PHASE_THEMES[phase.num] || PHASE_THEMES[1]

  return (
    <div className="surface p-4 relative overflow-hidden group hover:border-white/[0.1] transition-all">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${theme.color} flex items-center justify-center shadow-lg`} style={{ boxShadow: '0 4px 12px rgba(249,115,22,0.12)' }}>
            <span className="text-sm">{theme.icon}</span>
          </div>
          <span className="text-[9px] font-bold text-zinc-600">{phase.num}/{total}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-[14px] font-bold text-white">{phase.title}</h3>
            {phase.duration && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${theme.bg} ${theme.border} ${theme.text} border`}>{phase.duration}</span>
            )}
          </div>
          {phase.objective && <p className="text-[11px] text-zinc-500 mb-2 leading-relaxed">{phase.objective}</p>}
          {phase.markers?.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {phase.markers.map((m, i) => (
                <div key={i} className="flex items-start gap-2 rounded-md px-2.5 py-1.5 bg-white/[0.02] border border-white/[0.03]">
                  <MarkerIcon type={m.type} />
                  <p className="text-[11px] text-zinc-300 leading-relaxed">{m.text}</p>
                </div>
              ))}
            </div>
          )}
          {phase.advice && (
            <div className="px-2.5 py-2 rounded-md bg-[#ff6b1a]/[0.04] border border-[#ff6b1a]/[0.08]">
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
  const styles = {
    temp: { bg: 'bg-red-500/10', icon: '🌡️' },
    visual: { bg: 'bg-blue-500/10', icon: '👁️' },
  }
  const s = styles[type] || { bg: 'bg-zinc-500/10', icon: 'ℹ️' }
  return (
    <div className={`w-4 h-4 rounded ${s.bg} flex items-center justify-center shrink-0 mt-0.5`}>
      <span className="text-[9px]">{s.icon}</span>
    </div>
  )
}

function RibsMethodCard({ method }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="surface overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors">
        <span className="text-lg">🍖</span>
        <div className="flex-1">
          <span className="text-[13px] font-bold text-white">{method.title}</span>
          <span className="text-[11px] text-amber-400 font-semibold ml-2">{method.temp}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`text-zinc-600 transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 animate-fade">
          <div className="space-y-0 mb-4">
            {method.steps.map((s, i) => (
              <div key={i} className="flex items-stretch gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-[#dc2626] flex items-center justify-center text-[11px] font-bold text-white shrink-0">{s.time}</div>
                  {i < method.steps.length - 1 && <div className="w-px flex-1 bg-amber-500/20 my-1" />}
                </div>
                <div className="pb-3 pt-1">
                  <p className="text-[12px] text-zinc-300 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-3 bg-amber-500/[0.05] border border-amber-500/[0.1]">
            <p className="text-[11px] text-zinc-300"><span className="font-bold text-amber-400">Résultat :</span> {method.result}</p>
          </div>
          {method.alternative && (
            <div className="mt-2 rounded-lg p-2.5 bg-white/[0.02] border border-white/[0.04]">
              <p className="text-[10px] text-zinc-500"><span className="font-semibold text-zinc-400">{method.alternative.name}</span> — {method.alternative.desc}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReverseSearCard({ guide }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="surface overflow-hidden border-[#ff6b1a]/[0.12]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff6b1a] to-red-600 flex items-center justify-center shadow-md shadow-[#ff6b1a]/15 shrink-0">
          <span className="text-sm">🔥</span>
        </div>
        <div className="flex-1">
          <span className="text-[13px] font-bold text-white">Reverse Sear</span>
          <span className="text-[10px] text-[#ff6b1a] font-semibold ml-2">{guide.badge}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`text-zinc-600 transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 animate-fade space-y-4">
          <div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Principe</p>
            <div className="space-y-1.5">
              {guide.principle.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-[#ff6b1a]/10 flex items-center justify-center text-[10px] font-bold text-[#ff6b1a] shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-[12px] text-zinc-300 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Températures pull</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(guide.targets).map(([key, t]) => (
                <div key={key} className={`rounded-lg p-2.5 border text-center ${guide.selectedDoneness === key ? 'bg-[#ff6b1a]/[0.08] border-[#ff6b1a]/25' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                  <p className={`text-[11px] font-bold ${guide.selectedDoneness === key ? 'text-[#ff6b1a]' : 'text-zinc-400'}`}>{t.label}</p>
                  <p className="text-[18px] font-extrabold text-white">{t.temp}°C</p>
                  <p className="text-[9px] text-zinc-600">Pull {t.temp - 8}°C</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
