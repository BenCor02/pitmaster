/**
 * CookSession — Session interactive BBQ
 * Format wizard : une étape active à la fois, validation manuelle, recalcul ETA
 *
 * PATCH: refonte chirurgicale selon les 9 points identifiés par ChatGPT
 * - wording plus clair pour débutant tout en gardant le vocabulaire pitmaster
 * - logique wrap alignée avec calculator.js (coefficients BASE_COEFFS)
 * - ETA plus robuste (basée sur elapsed réel)
 * - etaTimes = repères visuels, pas déclencheurs
 * - ton rassurant, premium, actionnable
 */

import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { recalibrate, formatDuration } from '../lib/calculator'
import { MEAT_IMAGES, SMOKER_IMAGE } from '../lib/images'

// Coefficients wrap locaux — alignés avec BASE_COEFFS de calculator.js
const WRAP_COEFFS = { none: 1.00, butcher_paper: 0.60, foil: 0.38, foil_boat: 0.50 }
import { useAuth } from '../context/AuthContext'

// ─── Utilitaires ─────────────────────────────────────────────
const addMin = (date, m) => new Date(new Date(date).getTime() + m * 60000)
const fmt    = (d) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
const fmtDur = (m) => formatDuration(Math.max(0, Math.round(m)))

// PATCH: computeEtaTimes = repères de progression visuels uniquement
// Ces heures sont des ESTIMATIONS, pas des déclencheurs automatiques
// Le membre valide manuellement quand l'étape arrive réellement
function computeEtaTimes(schedule, cookStartTime) {
  const start = new Date(cookStartTime || new Date())
  const p1 = schedule.phase1Min || 0
  const st = schedule.stallMin  || 0
  const p3 = schedule.phase3Min || 0
  return {
    pit_stable: start,
    stall:      addMin(start, p1),
    wrap:       addMin(start, p1),
    probe_test: addMin(start, p1 + st + Math.round(p3 * 0.85)),
    rest:       addMin(start, p1 + st + p3),
  }
}

// PATCH: buildCheckpoints — wording revu sur tous les points
// Format : titre simple > sous-titre pitmaster > explication accessible > action concrète
function buildCheckpoints(schedule) {
  const cps = [
    {
      id: 'pit_stable',
      emoji: '🌡️',
      // PATCH: titre principal simple, vocabulaire pitmaster en sous-titre
      title: 'Le fumoir est prêt ?',
      titlePitmaster: 'Stabilité du pit',
      // PATCH: explication + conseil concret si "pas encore"
      explanation: "Vérifie que la température du fumoir est stable depuis 10 à 15 minutes. Une T° instable au départ fausse tout le timing de la cuisson.",
      tipIfNo: "Ajuste les trappes ou ajoute du combustible, puis attends 10-15min avant de revalider. Ne lance pas la cuisson sur un pit instable.",
      action: 'pit_confirm',
      actionLabel: '✅ Fumoir stable — Lancer la cuisson',
      validated: false,
    },
    {
      id: 'stall',
      emoji: '📊',
      // PATCH: titre simple "La cuisson ralentit", sous-titre pitmaster "Stall"
      title: 'La cuisson ralentit',
      titlePitmaster: 'Stall (plateau évaporatif)',
      // PATCH: explication rassurante, cause réelle, durée indicative
      explanation: "La température interne marque le pas — elle stagne ou remonte très lentement. C'est normal et attendu : la viande transpire, ce refroidissement par évaporation ralentit la montée en T°. Ça peut durer de 1 à 4h selon la taille de la pièce.",
      action: 'temp_input',
      actionLabel: 'Valider et recalculer',
      field: { key: 'actualTemp', label: 'T° interne actuelle (°C)', placeholder: `Ex: ${schedule.stallStartC || 65}` },
      validated: false,
    },
    {
      id: 'wrap',
      emoji: '🌯',
      title: "Emballer la viande ?",
      titlePitmaster: 'Texas Crutch',
      // PATCH: explication plus concrète avec guide de décision
      explanation: "Si la couleur de la viande te plaît et que l'écorce est bien formée, c'est le bon moment pour emballer. Le papier boucher laisse respirer et préserve mieux l'écorce. L'aluminium crée plus de vapeur et accélère davantage. Sans wrap = écorce maximale mais cuisson plus longue.",
      action: 'wrap_select',
      actionLabel: 'Confirmer mon choix',
      options: [
        { id: 'butcher_paper', label: '📜 Papier boucher', desc: "Méthode Franklin — écorce préservée" },
        { id: 'foil',          label: '🥡 Aluminium',      desc: "Texas Crutch — plus rapide" },
        { id: 'none',          label: '❌ Sans wrap',       desc: "Écorce maximale, cuisson plus longue" },
      ],
      validated: false,
    },
    {
      id: 'probe_test',
      emoji: '🔍',
      title: 'La viande est tendre ?',
      titlePitmaster: 'Probe Tender',
      // PATCH: instructions pratiques précises sur comment tester
      explanation: "Pique la sonde dans la partie la plus épaisse, sans viser le gras ou la surface sèche. Elle doit entrer presque sans résistance — comme dans du beurre fondu. C'est plus fiable que la température exacte. Aaron Franklin dit : \"si tu dois forcer, ce n'est pas prêt.\"",
      action: 'probe_result',
      actionLabel: 'Valider',
      validated: false,
    },
    {
      id: 'rest',
      emoji: '😴',
      title: 'Lancer le repos',
      titlePitmaster: 'Rest / Hold (Cambro)',
      // PATCH: rôle du repos expliqué, durée mini, flexibilité si besoin d'attendre
      explanation: "Le repos est une étape à part entière — pas facultative. Les fibres se détendent, les jus se redistribuent, la texture s'améliore. Durée minimale : 1h. Tu peux maintenir au chaud jusqu'à 3-4h en glacière (Cambro) sans problème. Emballe dans du papier boucher, puis entoure de serviettes.",
      action: 'rest_start',
      actionLabel: '😴 Repos lancé',
      validated: false,
    },
  ]

  // Supprimer le wrap si la viande ne le nécessite pas (ex: beef ribs — cf. Franklin)
  if (!schedule.wrapTempC && !schedule.stallStartC) {
    return cps.filter(c => c.id !== 'wrap')
  }
  return cps
}

// ─── Barre de progression + repères horaires ─────────────────
function ProgressBar({ checkpoints, currentIndex, etaTimes }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Pastilles de progression */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
        {checkpoints.map((cp, i) => {
          const done = cp.validated, active = i === currentIndex
          return (
            <div key={cp.id} style={{ display: 'flex', alignItems: 'center', flex: i < checkpoints.length - 1 ? 1 : 'none' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: done ? 13 : 16,
                background: done ? '#22c55e' : active ? 'var(--orange)' : 'var(--surface2)',
                border: `2px solid ${done ? '#22c55e' : active ? 'var(--orange)' : 'var(--border)'}`,
                transition: 'all 0.3s',
              }}>
                {done ? '✓' : cp.emoji}
              </div>
              {i < checkpoints.length - 1 && (
                <div style={{ flex: 1, height: 2, marginLeft: 4, background: done ? '#22c55e' : 'var(--border)', transition: 'background 0.3s' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Liste des étapes à venir avec repères horaires */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {checkpoints.map((cp, i) => {
          if (cp.validated) return null
          const active = i === currentIndex
          const eta    = etaTimes?.[cp.id]
          return (
            <div key={cp.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 10,
              background: active ? 'var(--orange-bg)' : 'var(--surface2)',
              border: `1px solid ${active ? 'var(--orange-border)' : 'var(--border)'}`,
              opacity: active ? 1 : 0.6,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{cp.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: active ? 'var(--orange)' : 'var(--text2)' }}>
                  {cp.title}
                  {active && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 400 }}>← en cours</span>}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{cp.titlePitmaster}</div>
              </div>
              {/* PATCH: étiquette "heure estimée" claire, présentée comme repère */}
              {eta && (() => {
                const etaDate = new Date(eta)
                const diffMin = Math.round((etaDate - Date.now()) / 60000)
                const diffStr = diffMin <= 0 ? 'bientôt' : diffMin < 60
                  ? `dans ${diffMin}min`
                  : `dans ${Math.floor(diffMin / 60)}h${String(diffMin % 60).padStart(2, '0')}`
                return (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, fontWeight: 700, color: active ? 'var(--orange)' : 'var(--text2)' }}>
                      ~{etaDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>
                      {diffStr} · estimation
                    </div>
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Carte checkpoint active ──────────────────────────────────
function CheckpointCard({ cp, schedule, elapsed, onValidate }) {
  const [tempInput,  setTempInput]  = useState('')
  const [wrapChoice, setWrapChoice] = useState(schedule.wrapType || 'butcher_paper')
  const [probeOk,    setProbeOk]    = useState(null)
  const [pitOk,      setPitOk]      = useState(null)
  // PATCH: état pour afficher le conseil si pit pas encore stable
  const [showPitTip, setShowPitTip] = useState(false)

  function submit() {
    if (cp.action === 'pit_confirm') {
      if (pitOk === null) return
      // PATCH: si pit instable, afficher conseil au lieu de bloquer sans feedback
      if (!pitOk) { setShowPitTip(true); return }
      onValidate(cp.id, { pitOk })
    }
    if (cp.action === 'temp_input') {
      if (!tempInput) return
      onValidate(cp.id, { actualTemp: parseFloat(tempInput) })
    }
    if (cp.action === 'wrap_select') {
      onValidate(cp.id, { wrapType: wrapChoice })
    }
    if (cp.action === 'probe_result') {
      if (probeOk === null) return
      onValidate(cp.id, { probeOk })
    }
    if (cp.action === 'rest_start') {
      onValidate(cp.id, {})
    }
  }

  const canSubmit =
    (cp.action === 'pit_confirm'  && pitOk !== null && pitOk) ||
    (cp.action === 'temp_input'   && tempInput !== '')        ||
    (cp.action === 'wrap_select')                             ||
    (cp.action === 'probe_result' && probeOk !== null)        ||
    (cp.action === 'rest_start')

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--orange)', borderRadius: 20, padding: 24, marginBottom: 16 }}>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--orange-bg)', border: '1px solid var(--orange-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {cp.emoji}
        </div>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--text)', lineHeight: 1.2 }}>
            {cp.title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 600, marginTop: 2 }}>
            {cp.titlePitmaster}
          </div>
        </div>
      </div>

      {/* Explication */}
      <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 14px', marginBottom: 18, fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
        {cp.explanation}
      </div>

      {/* PATCH: conseil pit instable — s'affiche si le membre dit "pas encore" */}
      {showPitTip && cp.tipIfNo && (
        <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '12px 14px', marginBottom: 14, fontSize: 12, color: '#f87171', lineHeight: 1.6 }}>
          ⚠️ {cp.tipIfNo}
        </div>
      )}

      {/* ── Formulaire selon le type d'action */}

      {cp.action === 'pit_confirm' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { val: true,  label: '✅ Oui, stable',   color: '#22c55e' },
            { val: false, label: '⏳ Pas encore',    color: '#f87171' },
          ].map(opt => (
            <button key={String(opt.val)} onClick={() => { setPitOk(opt.val); setShowPitTip(false) }} style={{
              padding: '14px', borderRadius: 12, cursor: 'pointer',
              fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13,
              border: `2px solid ${pitOk === opt.val ? opt.color : 'var(--border)'}`,
              background: pitOk === opt.val ? opt.color + '18' : 'var(--surface2)',
              color: pitOk === opt.val ? opt.color : 'var(--text3)',
            }}>
              {opt.label}
            </button>
          ))}
          {/* PATCH: bouton "revalider" si pit instable */}
          {showPitTip && (
            <button onClick={() => { setPitOk(null); setShowPitTip(false) }}
              style={{ gridColumn: '1/-1', padding: '10px', borderRadius: 50, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text3)', fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: 12, cursor: 'pointer', marginTop: 4 }}>
              🔄 Revalider dans 15min
            </button>
          )}
        </div>
      )}

      {cp.action === 'temp_input' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>
            {cp.field.label}
          </label>
          <input type="number" value={tempInput} onChange={e => setTempInput(e.target.value)}
            placeholder={cp.field.placeholder}
            style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', padding: '14px', fontSize: 22, fontFamily: "'DM Mono',monospace", outline: 'none', boxSizing: 'border-box', fontWeight: 700, textAlign: 'center' }} />
          {/* PATCH: indication de la T° attendue selon le moteur */}
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
            T° attendue par le moteur : ~{schedule.stallStartC || 65}°C
          </div>
        </div>
      )}

      {cp.action === 'wrap_select' && (
        <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
          {cp.options.map(opt => (
            <button key={opt.id} onClick={() => setWrapChoice(opt.id)} style={{
              padding: '12px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              border: `2px solid ${wrapChoice === opt.id ? 'var(--orange)' : 'var(--border)'}`,
              background: wrapChoice === opt.id ? 'var(--orange-bg)' : 'var(--surface2)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: wrapChoice === opt.id ? 'var(--orange)' : 'var(--text)' }}>
                {opt.label}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{opt.desc}</span>
            </button>
          ))}
        </div>
      )}

      {cp.action === 'probe_result' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { val: true,  label: '✅ Ça glisse',    color: '#22c55e' },
            { val: false, label: '⏳ Pas encore',   color: '#f87171' },
          ].map(opt => (
            <button key={String(opt.val)} onClick={() => setProbeOk(opt.val)} style={{
              padding: '14px', borderRadius: 12, cursor: 'pointer',
              fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13,
              border: `2px solid ${probeOk === opt.val ? opt.color : 'var(--border)'}`,
              background: probeOk === opt.val ? opt.color + '18' : 'var(--surface2)',
              color: probeOk === opt.val ? opt.color : 'var(--text3)',
            }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Bouton valider */}
      <button onClick={submit} disabled={!canSubmit} style={{
        width: '100%', padding: '15px', borderRadius: 50, border: 'none',
        background: canSubmit ? 'linear-gradient(135deg,#f48c06,#d44e00)' : 'var(--surface2)',
        color: canSubmit ? '#fff' : 'var(--text3)',
        fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14,
        cursor: canSubmit ? 'pointer' : 'default', transition: 'all 0.2s',
      }}>
        {cp.actionLabel}
      </button>
    </div>
  )
}

// ─── Étape validée (résumé compact) ──────────────────────────
function ValidatedStep({ cp, result }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 8, opacity: 0.75 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#22c55e', flexShrink: 0 }}>✓</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{cp.emoji} {cp.title}</div>
        {result?.message && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{result.message}</div>}
      </div>
    </div>
  )
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────
export default function CookSession() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const schedule  = location.state?.schedule
  const startRef  = useRef(location.state?.startedAt || new Date().toISOString())

  const [checkpoints,   setCheckpoints]   = useState(() => schedule ? buildCheckpoints(schedule) : [])
  const [currentIndex,  setCurrentIndex]  = useState(0)
  const [results,       setResults]       = useState({})
  // PATCH: eta stocke cookMin restant (décroissant) et totalMin pour le service
  const [eta,           setEta]           = useState(() => schedule ? {
    cookMin:  schedule.cookMin  || 0,
    totalMin: schedule.totalMin || 0,
  } : null)
  const [elapsed,       setElapsed]       = useState(0)
  const [cookStarted,   setCookStarted]   = useState(false)
  const [cookStartTime, setCookStartTime] = useState(null)
  const [etaTimes,      setEtaTimes]      = useState(null)
  const [restTimer,     setRestTimer]     = useState(null)
  const [log,           setLog]           = useState([])
  const timerRef = useRef(null)

  // ── Timer tick toutes les minutes
  useEffect(() => {
    if (!cookStarted || !cookStartTime) return
    const tick = () => setElapsed(Math.round((Date.now() - new Date(cookStartTime).getTime()) / 60000))
    tick()
    timerRef.current = setInterval(tick, 60000)
    return () => clearInterval(timerRef.current)
  }, [cookStarted, cookStartTime])

  function addLog(message) {
    setLog(l => [{ at: new Date().toISOString(), message }, ...l])
  }

  // ── Validation d'un checkpoint
  function handleValidate(id, userResponse) {
    let message = null
    // PATCH: on travaille sur une copie de eta pour ne pas avoir de stale closure
    const currentEta = { ...eta }

    // ── Pit stable
    if (id === 'pit_stable') {
      const start = new Date().toISOString()
      setCookStarted(true)
      setCookStartTime(start)
      setEtaTimes(computeEtaTimes(schedule, start))
      message = `Cuisson lancée à ${fmt(start)}`
    }

    // ── Stall — recalibrate() via calculator.js
    if (id === 'stall' && userResponse.actualTemp) {
      const r = recalibrate(schedule, userResponse.actualTemp, elapsed)
      // PATCH: mettre à jour cookMin restant depuis recalibrate (source de vérité = moteur)
      currentEta.cookMin  = r.remainingCookMin
      currentEta.totalMin = r.remainingTotalMin
      if (r.alert) {
        message = `${r.alert}${r.action ? ' → ' + r.action : ''}`
      } else {
        message = `T° ${userResponse.actualTemp}°C — rythme ${Math.round(r.speedRatio * 100)}% de la normale`
      }
      // PATCH: recalculer etaTimes depuis maintenant avec les nouvelles durées
      const now = new Date()
      setEtaTimes(t => ({
        ...t,
        wrap:       addMin(now, Math.round(r.remainingCookMin * 0.15)),
        probe_test: addMin(now, Math.round(r.remainingCookMin * 0.9)),
        rest:       addMin(now, r.remainingCookMin),
      }))
    }

    // PATCH: wrap — logique alignée avec BASE_COEFFS de calculator.js
    // On ne recalcule plus avec une mini logique locale arbitraire
    // On utilise les coefficients officiels du moteur pour calculer le gain sur le stall restant
    if (id === 'wrap') {
      const chosen  = userResponse.wrapType || 'none'
      const current = schedule.wrapType     || 'none'
      // Coefficients officiels depuis BASE_COEFFS (calculator.js)
      const wc = WRAP_COEFFS
      const stallBase   = schedule.stallMin || 0
      // Stall initial (avant tout wrap) = stallBase / coeff du wrap initial
      const stallNoWrap = stallBase / (wc[current] || 1)
      // Stall avec le nouveau wrap choisi
      const stallNew    = Math.round(stallNoWrap * (wc[chosen] || 1))
      // Stall avec le wrap initial
      const stallOld    = Math.round(stallNoWrap * (wc[current] || 1))
      const saved       = Math.max(stallOld - stallNew, 0)
      const labels      = { none: 'Sans wrap', butcher_paper: 'Papier boucher', foil: 'Aluminium' }
      message = saved > 0
        ? `${labels[chosen]} — environ ${saved}min économisées sur le stall`
        : `${labels[chosen]} confirmé — stall complet maintenu`
      // Mettre à jour l'ETA en soustrayant les minutes gagnées
      currentEta.cookMin  = Math.max((currentEta.cookMin  || 0) - saved, 0)
      currentEta.totalMin = Math.max((currentEta.totalMin || 0) - saved, 0)
    }

    // ── Probe test
    if (id === 'probe_test') {
      if (userResponse.probeOk) {
        message = '🎉 Probe tender — sortez la viande et lancez le repos en Cambro.'
        currentEta.message = 'Cuisson terminée'
      } else {
        const extra = 30
        message = `Pas encore — +${extra}min ajoutées. Retest dans 30min.`
        currentEta.cookMin  = (currentEta.cookMin  || 0) + extra
        currentEta.totalMin = (currentEta.totalMin || 0) + extra
        addLog(message)
        setEta(currentEta)
        setResults(r => ({ ...r, [id]: { message } }))
        // PATCH: ne pas avancer — reste sur probe_test pour revalider
        return
      }
    }

    // ── Repos
    if (id === 'rest') {
      const restMin = schedule.restMin || 60
      const restEnd = addMin(new Date(), restMin)
      setRestTimer({ endTime: restEnd.toISOString(), durationMin: restMin })
      message = `Repos lancé — prêt à ${fmt(restEnd)} (${fmtDur(restMin)} minimum)`
    }

    addLog(message || id)
    setEta(currentEta)
    setResults(r => ({ ...r, [id]: { message } }))
    setCheckpoints(cps => cps.map(c => c.id === id ? { ...c, validated: true } : c))
    setCurrentIndex(i => i + 1)
  }

  // ─── Pas de session active
  if (!schedule) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🔥</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text)', marginBottom: 10 }}>
          Aucune session active
        </h2>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
          Lance un calcul depuis le Calculateur BBQ,<br />puis clique sur "🔴 Lancer la session".
        </p>
        <button onClick={() => navigate('/app')} style={{ padding: '12px 28px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,#f48c06,#d44e00)', color: '#fff', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          ← Aller au Calculateur
        </button>
      </div>
    )
  }

  const isFinished = currentIndex >= checkpoints.length

  // PATCH: ETA robuste — cookMin décroît avec elapsed, service = cookStartTime + cookMin + restMin
  const etaCookMin = eta?.cookMin || schedule.cookMin || 0
  const etaRestMin = schedule.restMin || 60
  // PATCH: temps restant = ce qu'il reste de cookMin depuis le départ, moins le temps écoulé
  const restantMin = cookStarted
    ? Math.max(etaCookMin - elapsed, 0)
    : etaCookMin
  // PATCH: heure de service recalculée depuis cookStartTime (stable, ne change pas à chaque tick)
  const etaService = cookStartTime
    ? fmt(addMin(cookStartTime, etaCookMin + etaRestMin))
    : fmt(addMin(new Date(), etaCookMin + etaRestMin))

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.25s ease both }
      `}</style>

      {/* ── HEADER avec photo viande */}
      <div style={{ marginBottom: 20, borderRadius: 20, overflow: 'hidden', position: 'relative', border: '1px solid var(--border)' }}>
        {/* Photo viande ou ambiance fumoir */}
        <div style={{ height: 140, position: 'relative' }}>
          <img
            src={MEAT_IMAGES[schedule.meatKey] || SMOKER_IMAGE}
            alt={schedule.meatLabel}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="eager"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />
          {/* Badge statut */}
          <div style={{ position: 'absolute', top: 12, left: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            {cookStarted && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />}
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: cookStarted ? '#ef4444' : 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: 20 }}>
              {cookStarted ? '🔴 CUISSON EN COURS' : '⏳ PRÊT À DÉMARRER'}
            </span>
          </div>
          {/* Infos viande en bas de la photo */}
          <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: '#fff', margin: 0, marginBottom: 2 }}>
              {schedule.meatLabel}
            </h1>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
              {schedule.weightKg}kg · {schedule.smokerTempC}°C · {schedule.smokerType}
            </div>
          </div>
        </div>
      </div>

      {/* ── BLOC ETA */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 20px', marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Écoulé</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>{fmtDur(elapsed)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Restant</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--orange)' }}>
            {fmtDur(restantMin)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          {/* PATCH: libellé "Service ~" pour indiquer que c'est une estimation */}
          <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Service ~</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: '#22c55e' }}>{etaService}</div>
        </div>
      </div>

      {/* ── PROGRESSION */}
      <ProgressBar checkpoints={checkpoints} currentIndex={currentIndex} etaTimes={etaTimes} />

      {/* ── ÉTAPES VALIDÉES */}
      {checkpoints.slice(0, currentIndex).map(cp => (
        <ValidatedStep key={cp.id} cp={cp} result={results[cp.id]} />
      ))}

      {/* ── ÉTAPE ACTIVE */}
      {!isFinished && (
        <div className="fade-up">
          <CheckpointCard
            cp={checkpoints[currentIndex]}
            schedule={schedule}
            elapsed={elapsed}
            onValidate={handleValidate}
          />
        </div>
      )}

      {/* ── TIMER REPOS */}
      {restTimer && (
        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16, padding: '18px 20px', marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>😴 Repos en cours</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28, color: '#22c55e' }}>
            Prêt à {fmt(restTimer.endTime)}
          </div>
          {/* PATCH: message rassurant — on peut tenir plus longtemps */}
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6, lineHeight: 1.6 }}>
            Papier boucher + serviettes dans la glacière · Tu peux tenir 3-4h sans problème
          </div>
        </div>
      )}

      {/* ── SESSION TERMINÉE */}
      {isFinished && (
        <div className="fade-up" style={{ textAlign: 'center', padding: '28px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🏆</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: 'var(--text)', marginBottom: 8 }}>
            Belle cuisson !
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 24 }}>
            Note tes observations — T° réelles, durée des phases, qualité du stall.<br />
            C'est ce qui te rendra meilleur à chaque cuisson.
          </div>
        </div>
      )}

      {/* ── JOURNAL */}
      {log.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, marginTop: 8 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 12 }}>
            📋 Journal de cuisson
          </div>
          {log.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: i < log.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: 'var(--text3)', flexShrink: 0, paddingTop: 2 }}>{fmt(e.at)}</span>
              <span style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{e.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── TERMINER */}
      <button onClick={() => navigate('/app')} style={{ width: '100%', padding: '14px', borderRadius: 50, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text3)', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 16 }}>
        ↩ Terminer la session
      </button>
    </div>
  )
}