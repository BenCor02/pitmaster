import { useState, useEffect, useRef } from 'react'
import { useCalcLimit } from '../hooks/useCalcLimit'
import { PaywallCalc, CalcBanner } from '../components/Paywall'
import { ResultBlur } from '../components/ResultBlur'
import { MEAT_IMAGES } from '../lib/images'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { MEATS } from '../lib/meats'
import {
  calculateLowSlow, recalibrate, formatDuration, formatTime,
  addMinutes, validateInput, PHASE_BASES, buildTimeline,
} from '../lib/calculator.js'
import { useSnack } from '../components/Snack'
import Snack from '../components/Snack'

const MEAT_PROFILES = Object.fromEntries(
  Object.entries(PHASE_BASES).map(([k, v]) => [k, { ...v, method: 'lowslow' }])
)

const calculateCookTime = (meatKey, weightKg, options = {}, adjustments = {}) => {
  const calc = calculateLowSlow(meatKey, weightKg, options, adjustments)
  return { ...calc, phases: buildTimeline(calc, options.smokerTempC || 120) }
}

const MEAT_CATEGORIES = {
  'Bœuf': ['brisket', 'ribs_beef', 'paleron', 'plat_de_cote'],
  'Porc': ['pork_shoulder', 'ribs_pork', 'ribs_baby_back'],
  'Agneau': ['lamb_shoulder'],
}

const SMOKER_TYPES = [
  { id: 'pellet', label: 'Pellet', emoji: '🔵' },
  { id: 'offset', label: 'Offset', emoji: '🔴' },
  { id: 'kamado', label: 'Kamado', emoji: '🟢' },
  { id: 'electric', label: 'Électrique', emoji: '⚡' },
  { id: 'kettle', label: 'Kettle', emoji: '⚫' },
]

const WRAP_TYPES = [
  { id: 'butcher_paper', label: 'Papier boucher', emoji: '📜', desc: "Franklin — préserve l'écorce" },
  { id: 'foil', label: 'Papier alu', emoji: '🥡', desc: 'Texas Crutch — plus rapide' },
  { id: 'none', label: 'Sans wrap', emoji: '❌', desc: 'Stall complet — écorce maximale' },
]

const MARBLING_TYPES = [
  { id: 'low', label: 'Faible', emoji: '⚪', desc: 'Peu de gras intramusculaire' },
  { id: 'medium', label: 'Moyen', emoji: '🟡', desc: 'Référence' },
  { id: 'high', label: 'Fort', emoji: '🟠', desc: 'Wagyu / Prime — très persillé' },
]

const toFloat = (value, fallback = 0) => {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : fallback
}

const toInt = (value, fallback = 0) => {
  const n = parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

function buildServeDate(serveTime) {
  const [hours, minutes] = String(serveTime || '19:00').split(':').map(v => parseInt(v, 10))
  const now = new Date()
  const serve = new Date(now)
  serve.setSeconds(0, 0)
  serve.setHours(
    Number.isFinite(hours) ? hours : 19,
    Number.isFinite(minutes) ? minutes : 0,
    0, 0
  )
  if (serve.getTime() <= now.getTime()) serve.setDate(serve.getDate() + 1)
  return serve
}

function getTimelineStepContent(step, result) {
  if (step.isService) return {
    title: 'Service',
    explanation: 'La cuisson, le repos et la marge sont terminés.',
    action: 'Tranche, effiloche ou sers pendant que la viande est encore bien chaude.',
  }
  if (step.isRest) return {
    title: 'Rest / Hold (repos)',
    explanation: 'Le repos aide les jus à se répartir et rend le service plus facile.',
    action: 'Laisse reposer au chaud avant de trancher ou effilocher.',
  }
  if (step.isStall) return {
    title: result?.wrapType !== 'none'
      ? 'Wrap (emballage) + Stall (ralentissement normal)'
      : 'Stall (ralentissement normal)',
    explanation: result?.wrapType !== 'none'
      ? "La température peut ralentir. C'est normal. Le wrap, c'est emballer la viande pour accélérer la fin de cuisson et garder plus de jus."
      : "La température peut ralentir ou presque stagner. C'est normal pendant le low & slow.",
    action: result?.wrapType !== 'none'
      ? `Emballe quand la couleur te plaît ou autour de ${result.wrapTempC}°C, puis garde un feu stable.`
      : "N'augmente pas brutalement la température du fumoir. Laisse la cuisson suivre son rythme.",
  }
  if (step.id === 'phase1') return {
    title: 'Bark en formation',
    explanation: "La bark, c'est la croûte / écorce de cuisson qui se forme avec la fumée et la chaleur.",
    action: "Évite d'ouvrir le fumoir inutilement et garde une température régulière.",
  }
  if (step.id === 'phase3') return {
    title: 'Finition / test de tendreté',
    explanation: "On cherche le probe tender: la sonde doit entrer presque comme dans du beurre. C'est plus important que le chiffre exact.",
    action: `Commence à tester régulièrement vers ${result?.targetTempC || '?'}°C et retire dès que la viande est tendre.`,
  }
  return {
    title: step.label,
    explanation: step.description,
    action: 'Suis cette étape tranquillement et garde le fumoir stable.',
  }
}

function getReadyWindowText(result) {
  if (!result) return ''
  return `Viande probablement prête entre ${result.serviceWindowStart} et ${result.serviceWindowEnd}`
}

function getTendernessStatus(result) {
  if (!result) return null
  if (result.collagenOk) return {
    title: 'Tendreté probable atteinte',
    description: 'La viande est probablement entrée dans la bonne zone de tendreté.',
    action: 'Commence les tests de sonde et retire dès que ça glisse presque comme dans du beurre.',
    color: 'var(--green)', bg: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
  }
  return {
    title: 'Zone de tendreté en cours',
    description: 'La cuisson avance vers la bonne texture, mais il est sans doute encore un peu tôt.',
    action: "Continue à cuire, puis commence les tests de sonde à l'étape de finition.",
    color: 'var(--orange)', bg: 'var(--orange-bg)', border: '1px solid var(--orange-border)',
  }
}

export default function Calc() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { canCalc, remaining, isPro, increment, statusMessage } = useCalcLimit()
  const [showPaywall, setShowPaywall] = useState(false)
  const [showBlur,    setShowBlur]    = useState(false)  // résultat flouté avant auth
  const { snack, showSnack } = useSnack()

  // ── Restauration depuis localStorage — persiste entre les navigations
  const [meatKey,    setMeatKey]    = useState(() => { try { return JSON.parse(localStorage.getItem('pm_calc') || '{}').meatKey    || 'brisket'       } catch { return 'brisket'       } })
  const [weight,     setWeight]     = useState(() => { try { return JSON.parse(localStorage.getItem('pm_calc') || '{}').weight     ?? 4               } catch { return 4               } })
  const [thickness,  setThickness]  = useState(() => { try { return JSON.parse(localStorage.getItem('pm_calc') || '{}').thickness  || ''              } catch { return ''              } })
  const [smokerTemp, setSmokerTemp] = useState(() => { try { return JSON.parse(localStorage.getItem('pm_calc') || '{}').smokerTemp ?? 110             } catch { return 110             } })
  const [serveTime,  setServeTime]  = useState(() => { try { return JSON.parse(localStorage.getItem('pm_calc') || '{}').serveTime  || '19:00'         } catch { return '19:00'         } })
  const [margin,     setMargin]     = useState(() => { try { return JSON.parse(localStorage.getItem('pm_calc') || '{}').margin     ?? 60              } catch { return 60              } })
  const [smokerType, setSmokerType] = useState(() => { try { return JSON.parse(localStorage.getItem('pm_calc') || '{}').smokerType || 'pellet'        } catch { return 'pellet'        } })
  const [wrapType,   setWrapType]   = useState(() => { try { return JSON.parse(localStorage.getItem('pm_calc') || '{}').wrapType   || 'butcher_paper' } catch { return 'butcher_paper' } })
  const [marbling,   setMarbling]   = useState(() => { try { return JSON.parse(localStorage.getItem('pm_calc') || '{}').marbling   || 'medium'        } catch { return 'medium'        } })
  const [startTemp,  setStartTemp]  = useState(() => { try { return JSON.parse(localStorage.getItem('pm_calc') || '{}').startTemp  ?? 4               } catch { return 4               } })
  const [showAdvanced,   setShowAdvanced]   = useState(false)
  const [showRecal,      setShowRecal]      = useState(false)
  const [currentTempC,   setCurrentTempC]   = useState('')
  const [elapsedMin,     setElapsedMin]     = useState('')
  const [currentPitTemp, setCurrentPitTemp] = useState('')
  const [recalResult,    setRecalResult]    = useState(null)
  const [result,   setResult]   = useState(() => { try { const r = localStorage.getItem('pm_calc_result');   return r ? JSON.parse(r) : null } catch { return null } })
  const [timeline, setTimeline] = useState(() => { try { const t = localStorage.getItem('pm_calc_timeline'); return t ? JSON.parse(t) : []   } catch { return []   } })
  const [warnings, setWarnings] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [saving,   setSaving]   = useState(false)

  const profile = MEAT_PROFILES[meatKey]
  const meatData = MEATS[meatKey]
  const isSteak = false
  const isRibs = false
  const isLowSlow = profile?.method === 'lowslow'

  // ── Sauvegarde position scroll + restauration au retour
  useEffect(() => {
    const saved = localStorage.getItem('pm_calc_scroll')
    if (saved && result) {
      setTimeout(() => window.scrollTo({ top: parseInt(saved), behavior: 'instant' }), 50)
    }
    const onScroll = () => localStorage.setItem('pm_calc_scroll', window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Sauvegarde automatique des inputs dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pm_calc', JSON.stringify({
        meatKey, weight, thickness, smokerTemp, serveTime,
        margin, smokerType, wrapType, marbling, startTemp,
      }))
    } catch {}
  }, [meatKey, weight, thickness, smokerTemp, serveTime, margin, smokerType, wrapType, marbling, startTemp])

  async function calculate() {
    setLoading(true)
    setRecalResult(null)
    setTimeout(async () => {
      try {
        const safeWeight = Math.max(toFloat(weight, 1), 0.1)
        const safeSmokerTemp = toInt(smokerTemp, 110)
        const safeStartTemp = toInt(startTemp, 4)
        const safeThickness = thickness === '' ? null : toFloat(thickness, null)
        const safeMargin = Math.max(toInt(margin, 60), 0)

        const w = validateInput(meatKey, safeWeight, safeSmokerTemp)
        setWarnings(w)

        const options = {
          thicknessCm: safeThickness,
          smokerTempC: safeSmokerTemp,
          startTempC: safeStartTemp,
          smokerType,
          wrapType,
          marbling,
        }

        const calc = calculateCookTime(meatKey, safeWeight, options)
        const serve = buildServeDate(serveTime)
        const probableMin = Number.isFinite(calc.probableMin) ? calc.probableMin : calc.totalMin || calc.cookMin || 0
        const optimisticMin = Number.isFinite(calc.optimisticMin) ? calc.optimisticMin : probableMin
        const prudentMin = Number.isFinite(calc.prudentMin) ? calc.prudentMin : probableMin

        const totalWithMargin = probableMin + safeMargin
        const start = addMinutes(serve, -totalWithMargin)
        const serviceWindowStart = addMinutes(serve, -(prudentMin - probableMin))
        const serviceWindowEnd = addMinutes(serve, Math.max(optimisticMin - probableMin, 0))

        let cursor = new Date(start)
        const tl = calc.phases.map(phase => {
          const startStr = formatTime(cursor)
          if (phase.durationMin) cursor = addMinutes(cursor, phase.durationMin)
          return { ...phase, startStr }
        })
        tl.push({
          id: 'service', label: '🍽️ Service', startStr: serveTime, isService: true,
          description: `Marge de sécurité incluse : ${formatDuration(safeMargin)}.`,
        })

        const newResult = {
          ...calc,
          weightKg: safeWeight,
          smokerTempC: safeSmokerTemp,
          startTime: formatTime(start),
          serve: serveTime,
          marginMin: safeMargin,
          serviceWindowStart: formatTime(serviceWindowStart),
          serviceWindowEnd: formatTime(serviceWindowEnd),
          probableMin, optimisticMin, prudentMin,
        }
        setResult(newResult)
        // Si non connecté → afficher résultat flouté pour inciter à l'inscription
        if (!user) {
          setShowBlur(true)
        } else {
          // Incrémenter côté serveur (atomique, infalsifiable)
        const quotaResult = await increment()
        if (quotaResult && !quotaResult.allowed) {
          setShowPaywall(true)
        }
        }
        setTimeline(tl)
        // Sauvegarder le résultat dans localStorage
        try {
          localStorage.setItem('pm_calc_result', JSON.stringify(newResult))
          localStorage.setItem('pm_calc_timeline', JSON.stringify(tl))
        } catch {}
        setLoading(false)
        setTimeout(() => document.getElementById('calc-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      } catch (e) {
        showSnack('Erreur : ' + e.message, 'error')
        setLoading(false)
      }
    }, 300)
  }

  function doRecalibrate() {
    if (!result) return
    const r = recalibrate(
      result,
      toFloat(currentTempC, NaN),
      toFloat(elapsedMin, NaN),
      currentPitTemp === '' ? null : toFloat(currentPitTemp, null)
    )
    setRecalResult(r)
  }

  async function saveSession() {
    if (!result || !user) return
    setSaving(true)
    const { error } = await supabase.from('sessions').insert({
      user_id: user.id,
      meat_key: result.meatKey,
      meat_name: meatData?.name,
      weight: result.weightKg,
      smoker_temp: result.smokerTempC,
      serve_time: result.serve,
      start_time: result.startTime,
      cook_min: result.cookMin,
      date: new Date().toLocaleDateString('fr-FR'),
    })
    setSaving(false)
    if (error) showSnack('Erreur : ' + error.message, 'error')
    else showSnack('✓ Session sauvegardée !')
  }

  const phaseColor = p => {
    if (p.isService) return 'var(--orange)'
    if (p.isRest) return 'var(--blue)'
    if (p.isStall) return 'var(--gold)'
    return 'var(--orange)'
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} .fade-up{animation:fadeUp 0.22s ease both}`}</style>
      <Snack snack={snack} />

      <div style={{ marginBottom: 24 }}>
        <h1>Calculateur <span style={{ color: 'var(--orange)' }}>BBQ</span></h1>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
          Assistant cuisson · Étapes claires · Recalage en cours de cuisson
        </p>
      </div>

      {/* PAYWALL CALCULS */}
      {showPaywall && <PaywallCalc remaining={remaining} onClose={() => setShowPaywall(false)} />}

      {/* BANDEAU COMPTEUR */}
      <CalcBanner remaining={remaining} isPro={isPro} />

      {/* VIANDE + PHOTO */}
      <div className="pm-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Photo de la viande sélectionnée */}
        {MEAT_IMAGES[meatKey] && (
          <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
            <img
              src={MEAT_IMAGES[meatKey]}
              alt={MEATS[meatKey]?.full || meatKey}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.4s' }}
              loading="lazy"
            />
            {/* Gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
            {/* Nom de la viande sur la photo */}
            <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: '#fff', lineHeight: 1.2 }}>
                {MEATS[meatKey]?.full}
              </div>
              {profile && (
                <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: 50, background: 'rgba(232,93,4,0.85)', fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>
                  🔥 LOW & SLOW
                </span>
              )}
            </div>
          </div>
        )}
        {/* Select viande */}
        <div style={{ padding: '12px 16px' }}>
          <label className="pm-field-label">Changer de viande</label>
          <select className="pm-input" value={meatKey} onChange={e => { setMeatKey(e.target.value); setThickness('') }}>
            {Object.entries(MEAT_CATEGORIES).map(([cat, keys]) => (
              <optgroup key={cat} label={cat}>
                {keys.map(k => MEATS[k] ? <option key={k} value={k}>{MEATS[k].full}</option> : null)}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* POIDS & ÉPAISSEUR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="pm-card">
          <label className="pm-field-label">Poids (kg)</label>
          <input type="number" className="pm-input" value={weight} min="0.5" max="20" step="0.5"
            onChange={e => { setWeight(toFloat(e.target.value, 0)) }} />
        </div>
        <div className="pm-card">
          <label className="pm-field-label">
            Épaisseur max (cm)
            <span style={{ color: 'var(--text3)', textTransform: 'none', letterSpacing: 0, fontSize: 10, marginLeft: 6 }}>optionnel</span>
          </label>
          <input type="number" className="pm-input" value={thickness} min="0.5" max="20" step="0.5"
            placeholder="Auto depuis le poids"
            onChange={e => { setThickness(e.target.value) }} />
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 5, lineHeight: 1.5 }}>
            Harry Soo : l&apos;épaisseur influence souvent plus le temps que le poids
          </div>
        </div>
      </div>

      {/* FUMOIR */}
      <div className="pm-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <label className="pm-field-label" style={{ marginBottom: 0 }}>T° fumoir (zone indirecte)</label>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 30, color: 'var(--orange)' }}>{smokerTemp}°C</span>
        </div>
        <input type="range" value={smokerTemp} min={100} max={160} step="5"
          onChange={e => { setSmokerTemp(toInt(e.target.value, 110)) }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>100°C · Low & Slow</span>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>160°C · Hot & Fast</span>
        </div>
      </div>

      {/* SERVICE & MARGE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="pm-card">
          <label className="pm-field-label">Service à</label>
          <input type="time" className="pm-input" value={serveTime}
            onChange={e => { setServeTime(e.target.value) }} />
        </div>
        <div className="pm-card">
          <label className="pm-field-label">Marge sécurité</label>
          <select className="pm-input" value={margin} onChange={e => { setMargin(toInt(e.target.value, 60)) }}>
            <option value={30}>+30 min</option>
            <option value={60}>+1h ✓</option>
            <option value={90}>+1h30</option>
            <option value={120}>+2h</option>
          </select>
        </div>
      </div>

      {/* WRAP */}
      {isLowSlow && MEAT_PROFILES[meatKey]?.stallStartC && (
        <div className="pm-card">
          <label className="pm-field-label">Type de wrap</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
            {WRAP_TYPES.map(w => (
              <button key={w.id} onClick={() => { setWrapType(w.id) }}
                style={{ padding: '10px 6px', borderRadius: 12, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                  border: `1.5px solid ${wrapType === w.id ? 'var(--orange-border)' : 'var(--border)'}`,
                  background: wrapType === w.id ? 'var(--orange-bg)' : 'var(--surface2)' }}>
                <div style={{ fontSize: 18, marginBottom: 3 }}>{w.emoji}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11, color: wrapType === w.id ? 'var(--orange)' : 'var(--text2)' }}>{w.label}</div>
                <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{w.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* OPTIONS AVANCÉES */}
      <button onClick={() => setShowAdvanced(o => !o)}
        style={{ width: '100%', padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 50, color: 'var(--text3)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 12, cursor: 'pointer', marginBottom: 10 }}>
        {showAdvanced ? '▲ Masquer' : '▼ Options avancées'} (fumoir, persillage, T° départ)
      </button>

      {showAdvanced && (
        <div className="pm-card fade-up">
          <div style={{ marginBottom: 14 }}>
            <label className="pm-field-label">Type de fumoir</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SMOKER_TYPES.map(s => (
                <button key={s.id} onClick={() => { setSmokerType(s.id) }}
                  style={{ padding: '7px 12px', borderRadius: 50, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12,
                    border: `1.5px solid ${smokerType === s.id ? 'var(--orange-border)' : 'var(--border)'}`,
                    background: smokerType === s.id ? 'var(--orange-bg)' : 'var(--surface2)',
                    color: smokerType === s.id ? 'var(--orange)' : 'var(--text2)' }}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="pm-field-label">Persillage (marbling)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {MARBLING_TYPES.map(m => (
                <button key={m.id} onClick={() => { setMarbling(m.id) }}
                  style={{ padding: '9px 6px', borderRadius: 12, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    border: `1.5px solid ${marbling === m.id ? 'var(--orange-border)' : 'var(--border)'}`,
                    background: marbling === m.id ? 'var(--orange-bg)' : 'var(--surface2)' }}>
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{m.emoji}</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11, color: marbling === m.id ? 'var(--orange)' : 'var(--text2)' }}>{m.label}</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)' }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="pm-field-label">Température de départ de la viande</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ v: 4, l: 'Frigo (4°C)' }, { v: 15, l: 'Tempérée (15°C)' }, { v: 20, l: 'Ambiante (20°C)' }].map(opt => (
                <button key={opt.v} onClick={() => { setStartTemp(opt.v) }}
                  style={{ flex: 1, padding: '9px 6px', borderRadius: 50, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 11, transition: 'all 0.15s',
                    border: `1.5px solid ${startTemp === opt.v ? 'var(--orange-border)' : 'var(--border)'}`,
                    background: startTemp === opt.v ? 'var(--orange-bg)' : 'var(--surface2)',
                    color: startTemp === opt.v ? 'var(--orange)' : 'var(--text2)' }}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOUTON CALCULER */}
      <button onClick={calculate} disabled={loading} className="pm-btn-primary"
        style={{ width: '100%', padding: '14px', marginBottom: 24, fontSize: 14 }}>
        {loading
          ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Calcul...</>
          : '🔥 Calculer le planning'}
      </button>

      {/* WARNINGS */}
      {warnings.length > 0 && (
        <div style={{ background: 'var(--orange-bg)', border: '1px solid var(--orange-border)', borderRadius: 12, padding: '12px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--orange)', fontWeight: 700, marginBottom: 8 }}>À garder en tête</div>
          {warnings.map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
              <span>⚠️</span><span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* RÉSULTATS */}
      {result && (
        <div id="calc-result" className="fade-up">
          {/* Badge "Recalculer" si les paramètres ont changé depuis le dernier calcul */}
          {(result.meatKey !== meatKey || Math.abs((result.weightKg || 0) - weight) > 0.1) && (
            <div style={{ background:'rgba(232,93,4,0.08)', border:'1px solid var(--orange-border)', borderRadius:12, padding:'10px 14px', marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, color:'var(--orange)' }}>⚠️ Paramètres modifiés — résultat peut être périmé</span>
              <button onClick={calculate} style={{ fontSize:11, fontWeight:700, color:'var(--orange)', background:'none', border:'none', cursor:'pointer', padding:'0 4px' }}>Recalculer →</button>
            </div>
          )}

          {/* HERO */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '22px 20px', marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--orange)', borderRadius: '20px 20px 0 0' }} />
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Heure de départ recommandée</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 72, fontWeight: 800, lineHeight: 1, color: 'var(--orange)', letterSpacing: '-3px' }}>{result.startTime}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 10, lineHeight: 1.6 }}>
                Pour servir à {result.serve}, démarre la cuisson à {result.startTime}.
              </div>
            </div>

            <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: '14px', marginBottom: 12 }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 6, textAlign: 'center' }}>
                {getReadyWindowText(result)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                {[
                  { label: 'Rapide', min: result.optimisticMin, color: 'var(--green)' },
                  { label: 'Probable', min: result.probableMin, color: 'var(--orange)' },
                  { label: 'Large', min: result.prudentMin, color: 'var(--red)' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: s.color }}>{formatDuration(s.min)}</div>
                  </div>
                ))}
              </div>
              <div style={{ paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Fenêtre de service conseillée</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: 'var(--text)', fontWeight: 700 }}>
                  {result.serviceWindowStart} → {result.serviceWindowEnd}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6, lineHeight: 1.5 }}>
                  Marge de sécurité incluse : {formatDuration(result.marginMin)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {result.targetTempC && (
                <span style={{ background: 'var(--orange-bg)', border: '1px solid var(--orange-border)', borderRadius: 50, padding: '4px 12px', fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--orange)', fontWeight: 600 }}>
                  Test de tendreté vers {result.targetTempC}°C
                </span>
              )}
              {result.wrapTempC && wrapType !== 'none' && (
                <span style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 50, padding: '4px 12px', fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--blue)' }}>
                  Wrap vers {result.wrapTempC}°C
                </span>
              )}
            </div>
          </div>



          {/* TIMELINE */}
          <div className="pm-card" style={{ marginBottom: 12 }}>
            <div className="pm-sec-label">📋 Étapes de cuisson</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12, lineHeight: 1.6 }}>
              Suis les étapes dans l'ordre. Chaque bloc t'explique ce qui se passe et quoi faire.
            </div>
            <div style={{ display: 'flex', gap: 2, height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
              {timeline.filter(p => p.durationMin).map((p, i) => (
                <div key={i} style={{ flex: p.durationMin, background: phaseColor(p), opacity: p.isRest ? 0.5 : 1, minWidth: 3, borderRadius: 1 }} />
              ))}
            </div>
            {timeline.map((step, i) => {
              const content = getTimelineStepContent(step, result)
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 10px 1fr', gap: '0 10px', padding: '9px 0', position: 'relative' }}>
                  {i < timeline.length - 1 && <div style={{ position: 'absolute', left: 56, top: 24, bottom: -9, width: 1, background: 'var(--border)' }} />}
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: step.isService ? 'var(--orange)' : 'var(--text3)', textAlign: 'right', paddingTop: 2, fontWeight: step.isService ? 700 : 400 }}>
                    {step.startStr}
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: phaseColor(step), marginTop: 4, justifySelf: 'center', boxShadow: `0 0 6px ${phaseColor(step)}60` }} />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text)', lineHeight: 1.3 }}>{content.title}</div>
                      {step.durationMin && <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--text3)', flexShrink: 0 }}>{formatDuration(step.durationMin)}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 5, lineHeight: 1.6 }}>{content.explanation}</div>
                    <div style={{ marginTop: 6, padding: '7px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                      <strong style={{ color: 'var(--orange)' }}>Action :</strong> {content.action}
                    </div>
                    {step.targetTempNote && (
                      <div style={{ marginTop: 6, padding: '4px 10px', background: 'var(--orange-bg)', border: '1px solid var(--orange-border)', borderRadius: 8, fontSize: 11, color: 'var(--orange)', fontWeight: 600 }}>
                        🌡️ {step.targetTempNote}
                      </div>
                    )}
                    {step.isStall && (
                      <div style={{ marginTop: 6, padding: '7px 10px', background: 'rgba(232,146,10,0.08)', border: '1px solid rgba(232,146,10,0.2)', borderRadius: 8, fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>
                        ⚠️ <strong style={{ color: 'var(--gold)' }}>Le stall est normal.</strong> La cuisson peut ralentir franchement. Garde une température stable et laisse travailler le fumoir.
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* RECALAGE */}
          {isLowSlow && (
            <div className="pm-card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowRecal(o => !o)}>
                <div className="pm-sec-label" style={{ marginBottom: 0 }}>🔄 Aide si la cuisson ralentit</div>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{showRecal ? '▲' : '▼'}</span>
              </div>
              {showRecal && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12, lineHeight: 1.6 }}>
                    Entre la température interne actuelle pour voir si la cuisson est dans les temps.
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                    {[
                      { label: 'T° interne (°C)', val: currentTempC, set: setCurrentTempC, placeholder: 'Ex: 68' },
                      { label: 'Temps écoulé (min)', val: elapsedMin, set: setElapsedMin, placeholder: 'Ex: 180' },
                      { label: 'T° pit réelle (°C)', val: currentPitTemp, set: setCurrentPitTemp, placeholder: 'Optionnel' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="pm-field-label">{f.label}</label>
                        <input className="pm-input" type="number" value={f.val} placeholder={f.placeholder} onChange={e => f.set(e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <button onClick={doRecalibrate} className="pm-btn-secondary" style={{ width: '100%', padding: '11px' }}>
                    🔄 Recalculer
                  </button>
                  {recalResult && (
                    <div style={{ marginTop: 12, padding: '14px', background: 'var(--surface2)', borderRadius: 14,
                      border: `1px solid ${recalResult.isBehind ? 'rgba(248,113,113,0.3)' : recalResult.isAhead ? 'rgba(52,211,153,0.3)' : 'var(--border)'}` }}>
                      {recalResult.alert && (
                        <div style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 10,
                          color: recalResult.isBehind ? 'var(--red)' : 'var(--green)',
                          background: recalResult.isBehind ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.1)' }}>
                          {recalResult.alert}
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>T° attendue</div>
                          <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>{recalResult.expectedTempC}°C</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Écart</div>
                          <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 20, color: recalResult.deviation < -3 ? 'var(--red)' : recalResult.deviation > 3 ? 'var(--green)' : 'var(--text)' }}>
                            {recalResult.deviation > 0 ? '+' : ''}{recalResult.deviation}°C
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        {[
                          { l: 'Optimiste', v: recalResult.remainingOptimistic, c: 'var(--green)' },
                          { l: 'Probable', v: recalResult.remainingMin, c: 'var(--orange)' },
                          { l: 'Prudente', v: recalResult.remainingPrudent, c: 'var(--red)' },
                        ].map(s => (
                          <div key={s.l} style={{ textAlign: 'center', background: 'var(--surface)', borderRadius: 10, padding: '10px 6px' }}>
                            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>{s.l}</div>
                            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: s.c }}>{formatDuration(s.v)} restants</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text3)' }}>
                        Étape : <strong style={{ color: 'var(--text2)' }}>{recalResult.currentPhase}</strong> ·
                        Rythme : <strong style={{ color: recalResult.speedRatio < 0.85 ? 'var(--red)' : recalResult.speedRatio > 1.15 ? 'var(--green)' : 'var(--text2)' }}>
                          {Math.round(recalResult.speedRatio * 100)}%
                        </strong>
                      </div>
                      {recalResult.action && (
                        <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11, color: 'var(--text2)', lineHeight: 1.6 }}>
                          <strong style={{ color: 'var(--orange)' }}>Conseil :</strong> {recalResult.action}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* RUB & BOIS */}
          {meatData?.rubs?.length > 0 && (
            <div className="pm-card" style={{ marginBottom: 10 }}>
              <div className="pm-sec-label">🧂 Rub</div>
              {meatData.rubs.map((rub, i) => (
                <div key={i}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{rub.name}</div>
                  {rub.ingr?.map((ing, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: j < rub.ingr.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13 }}>
                      <span style={{ color: 'var(--text2)' }}>{ing.n}</span>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--orange)' }}>{ing.q}</span>
                    </div>
                  ))}
                  {rub.note && <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', marginTop: 8, lineHeight: 1.5 }}>{rub.note}</div>}
                </div>
              ))}
            </div>
          )}

          {meatData?.woods?.length > 0 && (
            <div className="pm-card" style={{ marginBottom: 20 }}>
              <div className="pm-sec-label">🪵 Bois de fumage</div>
              {meatData.woods.map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < meatData.woods.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 20 }}>{w.e}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{w.n}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{w.d}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[1,2,3,4,5].map(n => <div key={n} style={{ width: 6, height: 6, borderRadius: '50%', background: n <= w.i ? 'var(--orange)' : 'var(--border)' }} />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ACTIONS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={saveSession} disabled={saving} className="pm-btn-primary">
              {saving ? '⏳...' : '☁️ Sauvegarder'}
            </button>
            <button onClick={() => {
                setResult(null); setWarnings([]); setRecalResult(null)
                try { localStorage.removeItem('pm_calc_result'); localStorage.removeItem('pm_calc_timeline') } catch {}
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }} className="pm-btn-secondary">
              ↩ Nouveau calcul
            </button>
          </div>

          {/* RÉSULTAT FLOUTÉ — incitation à l'inscription */}
          {showBlur && result && (
            <ResultBlur
              launchTime={result.startTime}
              onAuth={() => navigate('/auth', { state: { from: '/app', calcResult: result.startTime } })}
              onClose={() => setShowBlur(false)}
            />
          )}

          {isLowSlow && (
            <button onClick={() => navigate('/session', {
              state: {
                schedule: { ...result },
                startedAt: new Date().toISOString(),
              }
            })} style={{ width: '100%', padding: '14px', marginTop: 8, borderRadius: 50, border: 'none',
              background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff',
              fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              🔴 Lancer la session de cuisson
            </button>
          )}
        </div>
      )}
    </div>
  )
}