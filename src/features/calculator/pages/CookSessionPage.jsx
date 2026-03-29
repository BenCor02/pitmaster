import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { formatDisplayTimeRounded, formatDuration, recalibrate } from '../../../domain/calculator/engine'
import { MEAT_IMAGES, SMOKER_IMAGE } from '../../../domain/content/images'
import { useAuth } from '../../../context/AuthContext'
import { useCookSession } from '../../../hooks/useCookSession'
import {
  WORKSHOP_PAGE_CSS,
  WorkshopStateCard,
} from '../components/WorkshopPrimitives'

const SESSION_PAGE_CSS = `
  .session-page {
    display: grid;
    gap: 16px;
    font-family: 'DM Sans', sans-serif;
  }

  .session-shell {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
    gap: 14px;
    align-items: start;
  }

  .session-stack {
    display: grid;
    gap: 12px;
  }

  .session-hero {
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    border: 1px solid rgba(255,255,255,0.08);
    min-height: 320px;
    background: linear-gradient(180deg, rgba(22,22,22,0.98), rgba(10,10,10,0.98));
  }

  .session-hero img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .session-hero::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(8,8,8,0.14), rgba(8,8,8,0.92)),
      linear-gradient(90deg, rgba(8,8,8,0.96), rgba(8,8,8,0.3));
  }

  .session-hero-body {
    position: relative;
    z-index: 1;
    height: 100%;
    padding: 22px;
    display: grid;
    align-content: end;
    gap: 14px;
  }

  .session-status-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 16px rgba(239,68,68,0.45);
    animation: session-pulse 1.8s ease-in-out infinite;
  }

  .session-chip-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .session-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(11,11,11,0.5);
    color: rgba(255,255,255,0.8);
    font-size: 11px;
    font-family: 'DM Mono', monospace;
  }

  .session-metric-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .session-metric-card {
    padding: 14px 15px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: linear-gradient(180deg, rgba(24,24,24,0.98), rgba(14,14,14,0.98));
  }

  .session-metric-value {
    margin-top: 6px;
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    line-height: 1;
    color: var(--text);
  }

  .session-metric-copy {
    margin-top: 8px;
    font-size: 12px;
    color: var(--text3);
    line-height: 1.65;
  }

  .session-timeline {
    display: grid;
    gap: 10px;
  }

  .session-step {
    display: grid;
    grid-template-columns: 40px 1fr;
    gap: 12px;
    padding: 14px 0;
  }

  .session-step + .session-step {
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .session-step-icon {
    width: 40px;
    height: 40px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
  }

  .session-step-icon.is-active {
    border-color: rgba(229,57,53,0.22);
    background: linear-gradient(180deg, rgba(229,57,53,0.18), rgba(198,40,40,0.08));
    box-shadow: 0 0 18px rgba(198,40,40,0.14);
  }

  .session-step-icon.is-done {
    border-color: rgba(34,197,94,0.24);
    background: rgba(34,197,94,0.12);
  }

  .session-step-card {
    padding: 18px;
    border-radius: 20px;
    border: 1px solid rgba(229,57,53,0.2);
    background: linear-gradient(180deg, rgba(24,24,24,0.98), rgba(12,12,12,0.98));
    box-shadow: var(--shadow-soft);
  }

  .session-choice-grid {
    display: grid;
    gap: 8px;
  }

  .session-choice {
    width: 100%;
    text-align: left;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: linear-gradient(180deg, rgba(30,30,30,0.98), rgba(20,20,20,0.98));
    color: var(--text);
    cursor: pointer;
    transition: border-color 150ms ease, transform 150ms ease, background 150ms ease;
  }

  .session-choice:hover {
    transform: translateY(-1px);
    border-color: var(--border2);
  }

  .session-choice.is-active {
    border-color: var(--orange-border);
    background: linear-gradient(180deg, rgba(198,40,40,0.16), rgba(34,18,18,0.96));
  }

  .session-log {
    display: grid;
    gap: 10px;
  }

  .session-log-entry {
    display: grid;
    grid-template-columns: 74px 1fr;
    gap: 10px;
    align-items: start;
  }

  .session-banner {
    padding: 14px 16px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: var(--text2);
    line-height: 1.65;
    font-size: 12px;
  }

  .session-action-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  @keyframes session-pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.92); }
  }

  @media (max-width: 980px) {
    .session-shell,
    .session-metric-grid,
    .session-action-grid {
      grid-template-columns: 1fr;
    }

    .session-log-entry {
      grid-template-columns: 1fr;
      gap: 4px;
    }
  }
`

function addMinutes(date, minutes) {
  return new Date(new Date(date).getTime() + minutes * 60000)
}

function formatMoment(value) {
  if (!value) return '—'
  return formatDisplayTimeRounded(new Date(value))
}

function isRibsCook(meatKey) {
  return meatKey === 'ribs_pork' || meatKey === 'ribs_baby_back'
}

function buildScheduleFromPersistedSession(session) {
  if (!session) return null
  const serviceTime = session.serviceTime || '—'

  return {
    ...session,
    serve: serviceTime,
    startTime: formatMoment(session.startedAt),
    meatOnSmokerTime: formatMoment(session.startedAt),
    serviceWindowStart: serviceTime,
    serviceWindowEnd: serviceTime,
    methodLabel: 'Session active',
    methodVariantLabel: 'Session reprise',
    cues: {
      stallRange: session.stallStartC ? `${session.stallStartC}°C` : null,
      wrapRange: session.wrapTempC ? `${session.wrapTempC}°C` : null,
      probeTenderRange: session.targetC ? `${session.targetC}°C` : null,
      restRange: session.restMin ? `${session.restMin} min` : null,
    },
  }
}

function buildCheckpoints(schedule) {
  if (!schedule) return []

  if (isRibsCook(schedule.meatKey)) {
    return [
      {
        id: 'pit_stable',
        icon: '🔥',
        title: 'Fumoir stable',
        eyebrow: 'Demarrage',
        copy: 'Lance vraiment la cuisson seulement quand le pit est cale depuis quelques minutes.',
        action: 'confirm_start',
      },
      {
        id: 'bark',
        icon: '🌫️',
        title: 'Couleur et bark',
        eyebrow: 'Repere visuel',
        copy: 'Regarde la couleur, la surface et le retrait sur l’os. Ne te fige pas sur une heure precise.',
        action: 'yes_no',
        yesLabel: 'La couleur me plait',
        noLabel: 'Encore un peu tot',
      },
      {
        id: 'wrap',
        icon: '📦',
        title: 'Wrap si tu le veux',
        eyebrow: 'Option',
        copy: 'Sur les ribs, le wrap reste un choix de texture et de timing, pas une obligation.',
        action: 'choice',
        options: [
          { id: 'none', label: 'Sans wrap', copy: 'Bark plus marquee, cuisson plus directe.' },
          { id: 'butcher_paper', label: 'Papier boucher', copy: 'Un peu plus souple sans trop enfermer la bark.' },
          { id: 'foil', label: 'Alu', copy: 'Le plus rapide et le plus fondant.' },
        ],
      },
      {
        id: 'flex',
        icon: '🦴',
        title: 'Flex test',
        eyebrow: 'Finition',
        copy: 'La rack doit plier franchement et legerement fissurer. C’est le vrai signal de fin.',
        action: 'yes_no',
        yesLabel: 'Oui, ca plie bien',
        noLabel: 'Pas encore',
      },
      {
        id: 'glaze',
        icon: '🍯',
        title: 'Finition sauce',
        eyebrow: 'Option',
        copy: 'Si tu veux une finition brillante, passe une couche legere puis laisse juste le temps de la faire prendre.',
        action: 'choice',
        options: [
          { id: 'skip', label: 'Pas de sauce', copy: 'Je passe directement au repos.' },
          { id: 'light', label: 'Glaze legere', copy: 'Fine couche, retour court au fumoir.' },
        ],
      },
      {
        id: 'rest',
        icon: '😴',
        title: 'Repos court',
        eyebrow: 'Service',
        copy: 'Quelques minutes suffisent souvent sur les ribs. Ce petit repos aide quand meme beaucoup au service.',
        action: 'confirm',
      },
    ]
  }

  const steps = [
    {
      id: 'pit_stable',
      icon: '🔥',
      title: 'Fumoir stable',
      eyebrow: 'Demarrage',
      copy: 'Avant de charger la viande, laisse la temperature se poser et respire un coup.',
      action: 'confirm_start',
    },
  ]

  if (schedule.cues?.stallRange) {
    steps.push({
      id: 'stall',
      icon: '📍',
      title: 'Recalage au stall',
      eyebrow: 'Temperature reelle',
      copy: `Quand tu arrives vers ${schedule.cues.stallRange}, rentre la temperature interne actuelle. Ici, on recale avec une vraie mesure, pas avec une supposition.`,
      action: 'temperature',
    })
  }

  if (schedule.cues?.wrapRange || schedule.wrapType !== 'none') {
    steps.push({
      id: 'wrap',
      icon: '📦',
      title: 'Wrap si la bark te plait',
      eyebrow: 'Decision terrain',
      copy: `Repere utile: ${schedule.cues?.wrapRange || 'bonne couleur + bark bien prise'}. On te demande ton choix, pas une heure magique.`,
      action: 'choice',
      options: [
        { id: 'none', label: 'Sans wrap', copy: 'Je laisse la cuisson filer naturellement.' },
        { id: 'butcher_paper', label: 'Papier boucher', copy: 'Le plus classique pour accelerer un peu sans trop ramollir.' },
        { id: 'foil_boat', label: 'Foil boat', copy: 'Je protege la base tout en gardant la bark exposee.' },
        { id: 'foil', label: 'Alu', copy: 'J’assure une fin plus rapide et plus humide.' },
      ],
    })
  }

  steps.push({
    id: 'probe',
    icon: '🌡️',
    title: 'Tests de tendrete',
    eyebrow: 'Fin de cuisson',
    copy: `Commence les tests dans la bonne zone. La vraie question reste: est-ce que la sonde glisse ou pas ?`,
    action: 'yes_no',
    yesLabel: 'Oui, c’est pret',
    noLabel: 'Pas encore',
  })

  steps.push({
    id: 'rest',
    icon: '😴',
    title: 'Lancer le repos',
    eyebrow: 'Service',
    copy: `Repere utile: ${schedule.cues?.restRange || `${schedule.restMin || 60} min`}. Le repos fait partie du plan, il ne vient pas apres.`,
    action: 'confirm',
  })

  return steps
}

function StepChoiceCard({ option, active, onClick }) {
  return (
    <button type="button" className={`session-choice${active ? ' is-active' : ''}`} onClick={onClick}>
      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{option.label}</div>
      {option.copy ? (
        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
          {option.copy}
        </div>
      ) : null}
    </button>
  )
}

function ActiveCheckpointCard({ checkpoint, schedule, onValidate }) {
  const [selection, setSelection] = useState(checkpoint.action === 'choice' ? checkpoint.options?.[0]?.id || 'none' : null)
  const [binary, setBinary] = useState(null)
  const [currentTemp, setCurrentTemp] = useState('')
  const [pitTemp, setPitTemp] = useState('')

  return (
    <div className="session-step-card">
      <div className="pm-kicker" style={{ marginBottom: 10 }}>{checkpoint.eyebrow}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div className="session-step-icon is-active">{checkpoint.icon}</div>
        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: 'var(--text)', lineHeight: 1.05 }}>
          {checkpoint.title}
        </div>
      </div>

      <div className="session-banner" style={{ marginBottom: 12 }}>
        {checkpoint.copy}
      </div>

      {checkpoint.action === 'choice' ? (
        <div className="session-choice-grid" style={{ marginBottom: 12 }}>
          {checkpoint.options.map((option) => (
            <StepChoiceCard key={option.id} option={option} active={selection === option.id} onClick={() => setSelection(option.id)} />
          ))}
        </div>
      ) : null}

      {checkpoint.action === 'yes_no' ? (
        <div className="session-choice-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', marginBottom: 12 }}>
          <StepChoiceCard
            option={{ label: checkpoint.yesLabel, copy: 'Le repere terrain est bien la.' }}
            active={binary === true}
            onClick={() => setBinary(true)}
          />
          <StepChoiceCard
            option={{ label: checkpoint.noLabel, copy: 'Je laisse encore un peu et je recontrole.' }}
            active={binary === false}
            onClick={() => setBinary(false)}
          />
        </div>
      ) : null}

      {checkpoint.action === 'temperature' ? (
        <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
          <div>
            <label className="pm-field-label">Temperature interne actuelle</label>
            <input className="pm-input" type="number" value={currentTemp} placeholder={schedule.stallStartC ? `Ex: ${schedule.stallStartC}` : 'Ex: 68'} onChange={(event) => setCurrentTemp(event.target.value)} />
          </div>
          <div>
            <label className="pm-field-label">Temperature pit reelle</label>
            <input className="pm-input" type="number" value={pitTemp} placeholder="Optionnel" onChange={(event) => setPitTemp(event.target.value)} />
          </div>
        </div>
      ) : null}

      <div className="session-action-grid">
        {checkpoint.action === 'choice' ? (
          <button type="button" className="pm-btn-primary" onClick={() => onValidate(checkpoint, { choice: selection })}>
            Valider ce choix
          </button>
        ) : null}

        {checkpoint.action === 'confirm_start' ? (
          <button type="button" className="pm-btn-primary" onClick={() => onValidate(checkpoint, { confirmed: true })}>
            Lancer la cuisson
          </button>
        ) : null}

        {checkpoint.action === 'confirm' ? (
          <button type="button" className="pm-btn-primary" onClick={() => onValidate(checkpoint, { confirmed: true })}>
            Repos lance
          </button>
        ) : null}

        {checkpoint.action === 'yes_no' ? (
          <button
            type="button"
            className="pm-btn-primary"
            disabled={binary === null}
            onClick={() => onValidate(checkpoint, { passed: binary })}
          >
            Valider ce controle
          </button>
        ) : null}

        {checkpoint.action === 'temperature' ? (
          <button
            type="button"
            className="pm-btn-primary"
            disabled={currentTemp === ''}
            onClick={() => onValidate(checkpoint, { currentTemp, pitTemp })}
          >
            Recaler la cuisson
          </button>
        ) : null}

        <button type="button" className="pm-btn-secondary" onClick={() => onValidate(checkpoint, { skip: true })}>
          Passer pour l’instant
        </button>
      </div>
    </div>
  )
}

function buildRemainingMetrics(eta, tickAnchorIso) {
  if (!eta) {
    return { cookRemaining: 0, totalRemaining: 0 }
  }
  const anchor = eta.updatedAt || tickAnchorIso
  if (!anchor) {
    return {
      cookRemaining: Math.max(Math.round(eta.remainingCookMin || 0), 0),
      totalRemaining: Math.max(Math.round(eta.remainingTotalMin || 0), 0),
    }
  }
  const elapsedSinceAnchor = Math.max(Math.round((Date.now() - new Date(anchor).getTime()) / 60000), 0)
  return {
    cookRemaining: Math.max(Math.round((eta.remainingCookMin || 0) - elapsedSinceAnchor), 0),
    totalRemaining: Math.max(Math.round((eta.remainingTotalMin || 0) - elapsedSinceAnchor), 0),
  }
}

export default function CookSessionPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    session: persistedSession,
    loading: persistedSessionLoading,
    startSession,
    validateCheckpoint: persistCheckpoint,
    addLogEntry: persistLogEntry,
  } = useCookSession()

  const sessionBootstrapRef = useRef(false)
  const schedule = location.state?.schedule || buildScheduleFromPersistedSession(persistedSession)

  const [checkpoints, setCheckpoints] = useState(() => (schedule ? buildCheckpoints(schedule) : []))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [eta, setEta] = useState(() => (schedule ? {
    remainingCookMin: schedule.cookMin || 0,
    remainingTotalMin: schedule.totalMin || 0,
    updatedAt: location.state?.startedAt || null,
  } : null))
  const [cookStarted, setCookStarted] = useState(() => Boolean(location.state?.startedAt || persistedSession?.startedAt))
  const [cookStartTime, setCookStartTime] = useState(() => location.state?.startedAt || persistedSession?.startedAt || null)
  const [restTimer, setRestTimer] = useState(null)
  const [log, setLog] = useState([])
  const [tick, setTick] = useState(0)

  const sessionImageSrc = MEAT_IMAGES[schedule?.meatKey] || SMOKER_IMAGE

  useEffect(() => {
    if (!cookStarted || !cookStartTime) return undefined
    const initialTimeout = window.setTimeout(() => setTick(Date.now()), 0)
    const timer = window.setInterval(() => setTick(Date.now()), 60000)
    return () => {
      window.clearTimeout(initialTimeout)
      window.clearInterval(timer)
    }
  }, [cookStarted, cookStartTime])

  useEffect(() => {
    if (sessionBootstrapRef.current) return
    if (!user) return
    if (!location.state?.schedule) return
    if (persistedSession?.id) return

    sessionBootstrapRef.current = true
    startSession(location.state.schedule, location.state.startedAt || new Date().toISOString())
      .catch((error) => {
        console.warn('startSession bootstrap failed', error?.message || error)
        sessionBootstrapRef.current = false
      })
  }, [location.state, persistedSession?.id, startSession, user])

  useEffect(() => {
    if (!schedule) return
    const timeoutId = window.setTimeout(() => {
      const nextCheckpoints = Array.isArray(schedule.checkpoints) && schedule.checkpoints.length
        ? schedule.checkpoints
        : buildCheckpoints(schedule)
      setCheckpoints(nextCheckpoints)
      const nextIndex = nextCheckpoints.findIndex((checkpoint) => !checkpoint.validated)
      setCurrentIndex(nextIndex === -1 ? nextCheckpoints.length : nextIndex)

      if (Array.isArray(schedule.cookLog)) {
        setLog(schedule.cookLog.map((entry) => ({
          at: entry.at || new Date().toISOString(),
          message: entry.message || entry.type || 'Etape validee',
        })))
      } else {
        setLog([])
      }
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [schedule])

  function addLog(message) {
    const nextEntry = { at: new Date().toISOString(), message }
    setLog((current) => [nextEntry, ...current])
    persistLogEntry(message).catch((error) => {
      console.warn('persist log failed', error?.message || error)
    })
  }

  function moveToNextCheckpoint() {
    setCheckpoints((current) => {
      const next = [...current]
      if (next[currentIndex]) next[currentIndex] = { ...next[currentIndex], validated: true }
      return next
    })
    setCurrentIndex((current) => current + 1)
  }

  function applyEtaSnapshot(nextCookRemaining, nextTotalRemaining) {
    setEta({
      remainingCookMin: Math.max(Math.round(nextCookRemaining || 0), 0),
      remainingTotalMin: Math.max(Math.round(nextTotalRemaining || 0), Math.max(Math.round(nextCookRemaining || 0), 0)),
      updatedAt: new Date().toISOString(),
    })
  }

  function saveResult(checkpointId, message, payload = {}) {
    persistCheckpoint(checkpointId, payload, { message }).catch((error) => {
      console.warn('persist checkpoint failed', error?.message || error)
    })
  }

  function handleValidate(checkpoint, payload) {
    if (!schedule) return

    if (payload?.skip) {
      addLog(`Etape reportee: ${checkpoint.title}`)
      return
    }

    if (checkpoint.id === 'pit_stable') {
      const startedAt = new Date().toISOString()
      setCookStarted(true)
      setCookStartTime(startedAt)
      applyEtaSnapshot(schedule.cookMin || 0, schedule.totalMin || (schedule.cookMin || 0) + (schedule.restMin || 0))
      const message = `Cuisson lancee a ${formatMoment(startedAt)}`
      addLog(message)
      saveResult(checkpoint.id, message, payload)
      moveToNextCheckpoint()
      return
    }

    if (checkpoint.id === 'stall') {
      const measuredTemp = Number(payload.currentTemp)
      if (!Number.isFinite(measuredTemp)) return
      const measuredPit = payload.pitTemp === '' ? null : Number(payload.pitTemp)
      const recal = recalibrate(schedule, measuredTemp, Math.max(Math.round((tick - new Date(cookStartTime || Date.now()).getTime()) / 60000), 0), Number.isFinite(measuredPit) ? measuredPit : null)
      applyEtaSnapshot(recal.remainingCookMin, recal.remainingTotalMin)
      const message = recal.alert
        ? `${recal.alert}${recal.action ? ` · ${recal.action}` : ''}`
        : `Recalage fait. Compte encore environ ${formatDuration(recal.remainingTotalMin)} avant service.`
      addLog(message)
      saveResult(checkpoint.id, message, payload)
      moveToNextCheckpoint()
      return
    }

    if (checkpoint.id === 'wrap') {
      const choice = payload.choice || 'none'
      const choiceLabel = checkpoint.options.find((option) => option.id === choice)?.label || choice
      const message = choice === 'none'
        ? 'Pas de wrap choisi. On continue a la bark et a la texture.'
        : `Wrap choisi: ${choiceLabel}. Garde en tete que le vrai repere reste la bark qui te plait.`
      addLog(message)
      saveResult(checkpoint.id, message, payload)
      moveToNextCheckpoint()
      return
    }

    if (checkpoint.id === 'bark') {
      if (!payload.passed) {
        const message = 'Couleur encore un peu legere. Laisse encore 15 a 20 min puis recontrole.'
        addLog(message)
        saveResult(checkpoint.id, message, payload)
        return
      }
      const message = 'Couleur validee. Tu peux enchainer vers la finition.'
      addLog(message)
      saveResult(checkpoint.id, message, payload)
      moveToNextCheckpoint()
      return
    }

    if (checkpoint.id === 'flex') {
      if (!payload.passed) {
        const message = 'Le rack n’est pas encore assez souple. Laisse encore un peu puis refais le test.'
        addLog(message)
        saveResult(checkpoint.id, message, payload)
        return
      }
      const message = 'Flex test valide. Les ribs sont pretes pour la toute fin.'
      addLog(message)
      saveResult(checkpoint.id, message, payload)
      moveToNextCheckpoint()
      return
    }

    if (checkpoint.id === 'glaze') {
      const message = payload.choice === 'light'
        ? 'Glaze legere choisie. Passe une couche fine et remets juste le temps de la faire prendre.'
        : 'Pas de sauce ajoutee. Tu passes directement au repos.'
      addLog(message)
      saveResult(checkpoint.id, message, payload)
      moveToNextCheckpoint()
      return
    }

    if (checkpoint.id === 'probe') {
      if (!payload.passed) {
        const message = 'Pas encore probe tender. Continue tranquille et recontrole dans 20 a 30 min.'
        addLog(message)
        saveResult(checkpoint.id, message, payload)
        return
      }
      applyEtaSnapshot(0, schedule.restMin || 60)
      const message = 'La viande est prete. Sors-la et lance maintenant le repos.'
      addLog(message)
      saveResult(checkpoint.id, message, payload)
      moveToNextCheckpoint()
      return
    }

    if (checkpoint.id === 'rest') {
      const restMin = schedule.restMin || 60
      const endTime = addMinutes(new Date(), restMin)
      setRestTimer({ endTime: endTime.toISOString(), durationMin: restMin })
      applyEtaSnapshot(0, restMin)
      const message = `Repos lance. Service conseille vers ${formatMoment(endTime)} minimum.`
      addLog(message)
      saveResult(checkpoint.id, message, payload)
      moveToNextCheckpoint()
    }
  }

  const isFinished = currentIndex >= checkpoints.length
  const activeCheckpoint = !isFinished ? checkpoints[currentIndex] : null
  const elapsedMin = cookStarted && cookStartTime ? Math.max(Math.round((tick - new Date(cookStartTime).getTime()) / 60000), 0) : 0
  const remaining = buildRemainingMetrics(eta, cookStartTime)
  const nextCheckpointTitle = activeCheckpoint?.title || 'Session terminee'

  const metrics = useMemo(() => {
    return [
      {
        label: 'Temps ecoule',
        value: cookStarted ? formatDuration(elapsedMin) : 'Pas lancee',
        copy: cookStarted ? 'Depuis le lancement de cette session.' : 'La session attend encore le feu vert de depart.',
      },
      {
        label: 'Temps restant',
        value: cookStarted ? formatDuration(remaining.totalRemaining) : formatDuration(schedule?.totalMin || 0),
        copy: 'Lis-le comme une estimation globale. Les signaux terrain gardent toujours le dernier mot.',
      },
      {
        label: 'Prochaine etape',
        value: nextCheckpointTitle,
        copy: activeCheckpoint ? activeCheckpoint.copy : 'Tous les reperes de cette session sont passes.',
      },
      {
        label: 'Service vise',
        value: schedule ? `${schedule.serviceWindowStart} → ${schedule.serviceWindowEnd}` : '—',
        copy: 'La fenetre de service reste la vraie reference pour ne pas finir trop tard.',
      },
    ]
  }, [activeCheckpoint, cookStarted, elapsedMin, nextCheckpointTitle, remaining.totalRemaining, schedule])

  if (!schedule && persistedSessionLoading) {
    return (
      <div className="session-page">
        <style>{WORKSHOP_PAGE_CSS}</style>
        <style>{SESSION_PAGE_CSS}</style>
        <WorkshopStateCard icon="🔥" title="Recherche de la session active" copy="On verifie si une session de cuisson existe deja dans l’atelier." />
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="session-page">
        <style>{WORKSHOP_PAGE_CSS}</style>
        <style>{SESSION_PAGE_CSS}</style>
        <WorkshopStateCard
          icon="🔥"
          title="Aucune session active"
          copy="Lance d’abord un calcul puis utilise “Lancer la session” depuis le nouveau calculateur pour piloter la cuisson en direct."
          actions={(
            <button className="pm-btn-primary" style={{ width: 'auto', minWidth: 220 }} onClick={() => navigate('/app')}>
              Aller au calculateur
            </button>
          )}
        />
      </div>
    )
  }

  return (
    <div className="session-page">
      <style>{WORKSHOP_PAGE_CSS}</style>
      <style>{SESSION_PAGE_CSS}</style>

      <div className="session-shell">
        <div className="session-stack">
          <div className="session-hero">
            <img
              src={sessionImageSrc}
              alt={schedule.meatLabel}
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = SMOKER_IMAGE
              }}
            />
            <div className="session-hero-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {cookStarted ? <span className="session-status-dot" /> : null}
                <div className="pm-kicker">
                  {cookStarted ? 'Session en cours' : 'Session prete'}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'Syne', fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 800, lineHeight: 0.96, color: '#fff' }}>
                  {schedule.meatLabel}
                </div>
                <div style={{ marginTop: 10, maxWidth: 620, fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                  Ici, tu pilotes la vraie cuisson. On te montre la prochaine decision utile, pas une chronologie artificielle chargee de micro-heures.
                </div>
              </div>

              <div className="session-chip-row">
                <span className="session-chip">service {schedule.serviceWindowStart} → {schedule.serviceWindowEnd}</span>
                <span className="session-chip">{schedule.smokerTempC}°C fumoir</span>
                {schedule.weightKg ? <span className="session-chip">{schedule.weightKg}kg</span> : null}
                <span className="session-chip">{schedule.methodVariantLabel || schedule.methodLabel}</span>
              </div>
            </div>
          </div>

          <div className="pm-card">
            <div className="pm-sec-label"><span>Suivi</span><span>Lecture rapide</span></div>
            <div className="session-metric-grid">
              {metrics.map((metric) => (
                <div key={metric.label} className="session-metric-card">
                  <div className="workshop-stat-label">{metric.label}</div>
                  <div className="session-metric-value">{metric.value}</div>
                  <div className="session-metric-copy">{metric.copy}</div>
                </div>
              ))}
            </div>
          </div>

          {restTimer ? (
            <div className="session-banner" style={{ borderColor: 'rgba(34,197,94,0.24)', background: 'rgba(34,197,94,0.08)' }}>
              <strong style={{ color: '#4ade80' }}>Repos en cours.</strong> Tu peux viser un service vers <strong style={{ color: 'var(--text)' }}>{formatMoment(restTimer.endTime)}</strong>. Si tu as un peu d’avance, c’est une bonne chose.
            </div>
          ) : null}

          <div className="pm-card">
            <div className="pm-sec-label"><span>Roadmap</span><span>Ou tu en es</span></div>
            <div className="session-timeline">
              {checkpoints.map((checkpoint, index) => {
                const done = index < currentIndex
                const active = index === currentIndex && !isFinished
                return (
                  <div key={checkpoint.id} className="session-step">
                    <div className={`session-step-icon${active ? ' is-active' : done ? ' is-done' : ''}`}>
                      {done ? '✓' : checkpoint.icon}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>
                          {checkpoint.title}
                        </div>
                        <div className="workshop-stat-label" style={{ marginTop: 0 }}>
                          {done ? 'fait' : active ? 'maintenant' : 'a venir'}
                        </div>
                      </div>
                      <div style={{ marginTop: 7, fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>
                        {checkpoint.copy}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {log.length ? (
            <div className="pm-card">
              <div className="pm-sec-label"><span>Journal</span><span>Ce qui s’est passe</span></div>
              <div className="session-log">
                {log.map((entry, index) => (
                  <div key={`${entry.at}-${index}`} className="session-log-entry">
                    <div style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--text3)', paddingTop: 2 }}>
                      {formatMoment(entry.at)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
                      {entry.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="session-stack">
          {!isFinished && activeCheckpoint ? (
            <ActiveCheckpointCard key={activeCheckpoint.id} checkpoint={activeCheckpoint} schedule={schedule} onValidate={handleValidate} />
          ) : (
            <div className="pm-hero-shell">
              <div className="pm-kicker" style={{ marginBottom: 12 }}>Session terminee</div>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, lineHeight: 1, color: 'var(--text)', marginBottom: 10 }}>
                Belle cuisson.
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
                Le plan a ete suivi jusqu’au bout. Le plus utile maintenant, c’est de garder ce que tu as vraiment observe: bark, texture, avance ou retard, tenue au service.
              </div>
            </div>
          )}

          {isRibsCook(schedule.meatKey) ? (
            <div className="pm-card">
              <div className="pm-sec-label"><span>Repere ribs</span><span>Ce qui compte vraiment</span></div>
              <div className="session-banner">
                Sur les ribs, la couleur, le retrait sur l’os et le flex test restent plus utiles qu’une heure exacte. Cet ecran est la pour te rappeler quoi regarder, pas pour te mentir avec des horaires rigides.
              </div>
            </div>
          ) : (
            <div className="pm-card">
              <div className="pm-sec-label"><span>Repere de fin</span><span>Toujours utile</span></div>
              <div className="session-banner">
                Le chiffre aide, la texture decide. Quand tu approches de la zone de fin, commence a sonder et retire des que la viande te donne la bonne sensation.
              </div>
            </div>
          )}

          {!user ? (
            <div className="pm-card">
              <div className="pm-sec-label"><span>Compte</span><span>Retrouver cette session</span></div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 12 }}>
                Sans compte, tu peux suivre la cuisson ici. Avec un compte, tu retrouves ensuite ton historique, ton journal et tes sessions actives plus facilement.
              </div>
              <div className="session-action-grid">
                <button className="pm-btn-primary" onClick={() => navigate('/auth', { state: { from: '/app/session', reason: 'resume-session' } })}>
                  Créer un compte
                </button>
                <button className="pm-btn-secondary" onClick={() => navigate('/auth', { state: { from: '/app/session', reason: 'resume-session-login' } })}>
                  Se connecter
                </button>
              </div>
            </div>
          ) : null}

          <div className="pm-card">
            <div className="pm-sec-label"><span>Actions</span><span>Sortie</span></div>
            <div className="session-action-grid">
              <button className="pm-btn-secondary" onClick={() => navigate('/app/history')}>
                Voir l’historique
              </button>
              <button className="pm-btn-secondary" onClick={() => navigate('/app/journal')}>
                Ouvrir le journal
              </button>
              <button className="pm-btn-primary" onClick={() => navigate('/app')}>
                Retour calculateur
              </button>
              <button
                className="pm-btn-secondary"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Remonter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
