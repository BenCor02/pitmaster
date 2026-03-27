/**
 * CookSession — Session interactive BBQ
 * Format wizard : une étape active à la fois, validation manuelle, recalcul ETA
 *
 * PATCH: refonte chirurgicale selon les 9 points identifiés par ChatGPT
 * - wording plus clair pour débutant tout en gardant le vocabulaire pitmaster
 * - logique wrap alignée avec calculator.js (coefficients BASE_COEFFS)
 * - ETA interne conservée seulement pour les ajustements, plus pour piloter l'UI
 * - repères température et visuels affichés à la place des heures intermédiaires
 * - ton rassurant, premium, actionnable
 */

import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { recalibrate, formatDuration, formatDisplayTimeRounded } from '../lib/calculator'
import { MEAT_IMAGES, SMOKER_IMAGE } from '../lib/images'
import { useAuth } from '../context/AuthContext'

// Coefficients wrap locaux — alignés avec BASE_COEFFS de calculator.js
// PATCH: alignement avec les coefficients terrain actuels du moteur
const WRAP_COEFFS = { none: 1.00, butcher_paper: 0.78, foil: 0.58, foil_boat: 0.66 }

// ─── Utilitaires ─────────────────────────────────────────────
const addMin = (date, m) => new Date(new Date(date).getTime() + m * 60000)
// PATCH: toutes les heures visibles suivent maintenant le même arrondi BBQ à 30 minutes
const fmt    = (d) => formatDisplayTimeRounded(d)
const fmtDur = (m) => formatDuration(Math.max(0, Math.round(m)))
const isRibsCook = (meatKey) => meatKey === 'ribs_pork' || meatKey === 'ribs_baby_back'

// PATCH: bridge temporaire avant persistence membre; sessionStorage plutôt que localStorage produit
function loadPendingSession() {
  try {
    const raw = sessionStorage.getItem('pm_active_session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function savePendingSession(payload) {
  try {
    sessionStorage.setItem('pm_active_session', JSON.stringify({
      ...payload,
      savedAt: new Date().toISOString(),
    }))
  } catch {
    // PATCH: persistance best effort
  }
}

function clearPendingSession() {
  try {
    sessionStorage.removeItem('pm_active_session')
  } catch {
    // PATCH: nettoyage best effort
  }
}

// PATCH: buildCheckpoints — wording revu sur tous les points
// Format : titre simple > sous-titre pitmaster > explication accessible > action concrète
function buildCheckpoints(schedule) {
  const hasStallCue = Boolean(schedule.cues?.stallRange)
  const hasWrapCue = Boolean(schedule.cues?.wrapRange) || schedule.wrapType !== 'none'
  const isPoultry = schedule.meatKey === 'whole_chicken' || schedule.meatKey === 'chicken_pieces'
  const isLeg = schedule.meatKey === 'lamb_leg'
  // PATCH: flow spécifique ribs = repères visuels et mécaniques, pas probe tender centré sonde
  if (isRibsCook(schedule.meatKey)) {
    const cps = [
      {
        id: 'pit_stable',
        emoji: '🌡️',
        title: 'Le fumoir est prêt ?',
        titlePitmaster: 'Stabilité du pit',
        explanation: "Vérifie que la température du fumoir est stable depuis 10 à 15 minutes. Un départ propre rend toute la suite plus simple.",
        tipIfNo: "Stabilise le feu avant de charger les ribs. Un départ instable rend la couleur et la texture moins prévisibles.",
        action: 'pit_confirm',
        actionLabel: '✅ Fumoir stable — Lancer la cuisson',
        validated: false,
      },
      {
        id: 'bark_check',
        emoji: '🍖',
        title: 'La couleur te plaît ?',
        titlePitmaster: 'Bark / couleur / pullback',
        explanation: "Sur les ribs, on regarde d'abord la couleur, l'écorce de cuisson et le léger retrait de viande sur les os. C'est le bon moment pour décider si tu wrapes ou si tu laisses continuer à nu.",
        action: 'bark_result',
        actionLabel: 'Valider',
        validated: false,
      },
      {
        id: 'wrap',
        emoji: '🌯',
        title: 'Wrap (emballage)',
        titlePitmaster: 'Papier ou aluminium',
        explanation: "Le wrap sur les ribs n'est pas obligatoire. Il accélère la cuisson et change la texture: plus fondante, parfois moins ferme. Garde-le si c'est ton style, sinon reste à nu.",
        action: 'wrap_select',
        actionLabel: 'Confirmer mon choix',
        options: [
          { id: 'butcher_paper', label: '📜 Papier boucher', desc: "Un peu plus souple, garde mieux la surface" },
          { id: 'foil',          label: '🥡 Aluminium',      desc: "Plus rapide, texture plus fondante" },
          { id: 'none',          label: '❌ Sans wrap',       desc: "Bark plus marquée, cuisson plus directe" },
        ],
        validated: false,
      },
      {
        id: 'flex_test',
        emoji: '🦴',
        title: 'Les ribs sont prêtes ?',
        titlePitmaster: 'Flex test / retrait sur l’os',
        explanation: "Prends le rack au tiers avec des pinces: il doit plier nettement et commencer à fissurer en surface. Tu peux aussi regarder le retrait de viande sur les os. Sur les ribs, c'est plus utile qu'un probe test classique.",
        action: 'flex_result',
        actionLabel: 'Valider',
        validated: false,
      },
      {
        id: 'glaze',
        emoji: '🍯',
        title: 'Tu veux glacer les ribs ?',
        titlePitmaster: 'Glaze / sauce de finition',
        // PATCH: glaze ribs = option courte de finition, jamais une grosse phase obligatoire
        explanation: "Si tu veux une finition brillante et légèrement collante, ajoute une fine couche de sauce maintenant seulement. Remets ensuite juste le temps de la faire prendre.",
        action: 'glaze_choice',
        actionLabel: 'Confirmer',
        options: [
          { id: 'light_glaze', label: '🍯 Oui, légère glaze', desc: 'Fine couche puis retour bref au smoker' },
          { id: 'skip_glaze', label: '🌶️ Non, je les laisse dry', desc: 'Passe directement au repos' },
        ],
        validated: false,
      },
      {
        id: 'rest',
        emoji: '😴',
        title: 'Repos court avant service',
        titlePitmaster: 'Rest / Hold (repos)',
        explanation: "Un repos court aide les jus à se calmer et rend la découpe plus propre. Sur les ribs, quelques minutes suffisent souvent.",
        action: 'rest_start',
        actionLabel: '😴 Repos lancé',
        validated: false,
      },
    ]
    // PATCH: ribs sans wrap = on garde quand même un flow clair bark -> pullback -> flex -> repos
    return schedule.wrapType === 'none' ? cps.filter(c => c.id !== 'wrap') : cps
  }

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
        explanation: `La température interne marque le pas — c'est normal. Repère utile : ${schedule.cues?.stallRange || `${schedule.stallStartC || 65}°C`} environ. Continue à juger aussi la couleur et la bark.`,
      action: 'temp_input',
      actionLabel: 'Valider et recalculer',
      field: { key: 'actualTemp', label: 'T° interne actuelle (°C)', placeholder: `Ex: ${schedule.stallStartC || 65}` },
      validated: false,
    },
    {
      id: 'wrap',
      emoji: '🌯',
      title: schedule.meatKey === 'paleron' || schedule.meatKey === 'plat_de_cote' ? 'Couvrir la finition ?' : "Emballer la viande ?",
      titlePitmaster: schedule.meatKey === 'paleron' || schedule.meatKey === 'plat_de_cote' ? 'Wrap / finition couverte' : 'Texas Crutch',
      // PATCH: explication plus concrète avec guide de décision
        explanation: `Si la couleur de la viande te plaît et que l'écorce est bien formée, c'est le bon moment pour emballer. Repère utile : ${schedule.cues?.wrapRange || 'zone de wrap'}. Le papier boucher laisse respirer et préserve mieux l'écorce. L'aluminium accélère davantage.`,
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
      title: isPoultry ? 'La volaille est prête ?' : schedule.meatKey === 'pork_shoulder' ? 'La viande s’effiloche bien ?' : isLeg ? 'Le gigot est au bon point ?' : 'La viande est tendre ?',
      titlePitmaster: isPoultry ? 'Température cœur / jutosité' : schedule.meatKey === 'pork_shoulder' ? 'Test d’effilochage / tendreté' : isLeg ? 'Contrôle du point de cuisson' : 'Probe Tender',
      // PATCH: instructions pratiques précises sur comment tester
      explanation: isPoultry
        ? `Commence à contrôler vers ${schedule.cues?.probeStart || '72°C'}, puis vise une sortie propre autour de ${schedule.cues?.probeTenderRange || '74–78°C'}. Sur la volaille, la peau et la jutosité comptent autant que le chiffre.`
        : isLeg
          ? `Commence à contrôler tôt, puis retire selon le point voulu. Sur le gigot, la bonne fin reste plus proche d'une cuisson rosée que d'une logique effilochée.`
        : schedule.meatKey === 'lamb_shoulder'
        ? `Commence à tester vers ${schedule.cues?.probeStart || '88°C'} puis ajuste selon la texture et le résultat voulu. Sur l’agneau, le bon point dépend plus du rendu recherché que d’un chiffre unique.`
        : schedule.meatKey === 'pork_shoulder'
          ? `Commence à tester vers ${schedule.cues?.probeStart || '90°C'}, puis cherche une viande souple qui s’effiloche proprement. La température aide, mais la texture décide.`
          : `Commence les tests vers ${schedule.cues?.probeStart || `${schedule.targetTempC || 90}°C`} puis cherche la vraie zone probe tender autour de ${schedule.cues?.probeTenderRange || `${schedule.targetTempC || 95}°C`}. La sonde doit glisser presque sans résistance.`,
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
        explanation: `Le repos est une étape à part entière. Repère utile : ${schedule.cues?.restRange || 'repos recommandé'}. Les fibres se détendent, les jus se redistribuent et le service devient plus simple.`,
      action: 'rest_start',
      actionLabel: '😴 Repos lancé',
      validated: false,
    },
  ]

  // PATCH: petites viandes sans stall ni wrap explicites gardent un flow plus propre
  return cps.filter((checkpoint) => {
    if (checkpoint.id === 'stall' && !hasStallCue) return false
    if (checkpoint.id === 'wrap' && (!hasWrapCue || schedule.wrapType === 'none')) return false
    return true
  })
}

// ─── Barre de progression simple ─────────────────
function ProgressBar({ checkpoints, currentIndex }) {
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {checkpoints.map((cp, i) => {
          if (cp.validated) return null
          const active = i === currentIndex
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
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Carte checkpoint active ──────────────────────────────────
function CheckpointCard({ cp, schedule, onValidate }) {
  const [tempInput,  setTempInput]  = useState('')
  const [wrapChoice, setWrapChoice] = useState(schedule.wrapType || 'butcher_paper')
  const [glazeChoice, setGlazeChoice] = useState('skip_glaze')
  const [probeOk,    setProbeOk]    = useState(null)
  const [barkOk,     setBarkOk]     = useState(null)
  const [flexOk,     setFlexOk]     = useState(null)
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
    if (cp.action === 'glaze_choice') {
      onValidate(cp.id, { glazeChoice })
    }
    if (cp.action === 'probe_result') {
      if (probeOk === null) return
      onValidate(cp.id, { probeOk })
    }
    if (cp.action === 'bark_result') {
      if (barkOk === null) return
      onValidate(cp.id, { barkOk })
    }
    if (cp.action === 'flex_result') {
      if (flexOk === null) return
      onValidate(cp.id, { flexOk })
    }
    if (cp.action === 'rest_start') {
      onValidate(cp.id, {})
    }
  }

  const canSubmit =
    (cp.action === 'pit_confirm'  && pitOk !== null && pitOk) ||
    (cp.action === 'temp_input'   && tempInput !== '')        ||
    (cp.action === 'wrap_select')                             ||
    (cp.action === 'glaze_choice')                            ||
    (cp.action === 'probe_result' && probeOk !== null)        ||
    (cp.action === 'bark_result'  && barkOk !== null)         ||
    (cp.action === 'flex_result'  && flexOk !== null)         ||
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
              🔄 Revalider un peu plus tard
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

      {cp.action === 'glaze_choice' && (
        <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
          {cp.options.map(opt => (
            <button key={opt.id} onClick={() => setGlazeChoice(opt.id)} style={{
              padding: '12px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              border: `2px solid ${glazeChoice === opt.id ? 'var(--orange)' : 'var(--border)'}`,
              background: glazeChoice === opt.id ? 'var(--orange-bg)' : 'var(--surface2)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: glazeChoice === opt.id ? 'var(--orange)' : 'var(--text)' }}>
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

      {cp.action === 'bark_result' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { val: true,  label: '✅ Oui, belle couleur', color: '#22c55e' },
            { val: false, label: '⏳ Encore un peu tôt', color: '#f87171' },
          ].map(opt => (
            <button key={String(opt.val)} onClick={() => setBarkOk(opt.val)} style={{
              padding: '14px', borderRadius: 12, cursor: 'pointer',
              fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13,
              border: `2px solid ${barkOk === opt.val ? opt.color : 'var(--border)'}`,
              background: barkOk === opt.val ? opt.color + '18' : 'var(--surface2)',
              color: barkOk === opt.val ? opt.color : 'var(--text3)',
            }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {cp.action === 'flex_result' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { val: true,  label: '✅ Oui, ça plie bien', color: '#22c55e' },
            { val: false, label: '⏳ Pas encore', color: '#f87171' },
          ].map(opt => (
            <button key={String(opt.val)} onClick={() => setFlexOk(opt.val)} style={{
              padding: '14px', borderRadius: 12, cursor: 'pointer',
              fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13,
              border: `2px solid ${flexOk === opt.val ? opt.color : 'var(--border)'}`,
              background: flexOk === opt.val ? opt.color + '18' : 'var(--surface2)',
              color: flexOk === opt.val ? opt.color : 'var(--text3)',
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

  // PATCH: priorité à la navigation courante, fallback sessionStorage pour éviter une dépendance fragile à location.state
  const pendingSession = loadPendingSession()
  const schedule  = location.state?.schedule || pendingSession?.schedule

  const [checkpoints,   setCheckpoints]   = useState(() => schedule ? buildCheckpoints(schedule) : [])
  const [currentIndex,  setCurrentIndex]  = useState(0)
  const [results,       setResults]       = useState({})
  // PATCH: structure ETA sans ambiguïté entre total, restant et temps écoulé
  const [eta,           setEta]           = useState(() => schedule ? {
    remainingCookMin:  schedule.cookMin  || 0,
    remainingTotalMin: schedule.totalMin || 0,
    updatedAt: null,
  } : null)
  const [elapsed,       setElapsed]       = useState(0)
  const [cookStarted,   setCookStarted]   = useState(() => Boolean(location.state?.startedAt || pendingSession?.startedAt))
  const [cookStartTime, setCookStartTime] = useState(() => location.state?.startedAt || pendingSession?.startedAt || null)
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

  useEffect(() => {
    if (currentIndex >= checkpoints.length && checkpoints.length > 0) clearPendingSession()
  }, [currentIndex, checkpoints.length])

  // PATCH: persistance transitoire de session pour ne pas dépendre seulement du state de navigation
  useEffect(() => {
    if (!schedule) return
    savePendingSession({
      schedule,
      startedAt: cookStartTime,
      progress: {
        checkpoints,
        currentIndex,
        results,
        eta,
        elapsed,
        restTimer,
        log,
      },
    })
  }, [schedule, cookStartTime, checkpoints, currentIndex, results, eta, elapsed, restTimer, log])

  // PATCH: restauration légère si la page est rechargée au milieu d'une session
  useEffect(() => {
    const progress = pendingSession?.progress
    if (!progress) return
    if (progress.checkpoints?.length) setCheckpoints(progress.checkpoints)
    if (Number.isInteger(progress.currentIndex)) setCurrentIndex(progress.currentIndex)
    if (progress.results) setResults(progress.results)
    if (progress.eta) setEta(progress.eta)
    if (Number.isFinite(progress.elapsed)) setElapsed(progress.elapsed)
    if (progress.restTimer) setRestTimer(progress.restTimer)
    if (Array.isArray(progress.log)) setLog(progress.log)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addLog(message) {
    setLog(l => [{ at: new Date().toISOString(), message }, ...l])
  }

  // ── Validation d'un checkpoint
  function handleValidate(id, userResponse) {
    let message = null
    // PATCH: on travaille sur une copie structurée avec remaining* pour éviter les ambiguïtés
    const currentEta = { ...eta }
    const nowIso = new Date().toISOString()

    const applyEtaSnapshot = (nextRemainingCookMin, nextRemainingTotalMin) => {
      currentEta.remainingCookMin = Math.max(Math.round(nextRemainingCookMin || 0), 0)
      currentEta.remainingTotalMin = Math.max(Math.round(nextRemainingTotalMin || 0), currentEta.remainingCookMin)
      currentEta.updatedAt = nowIso
    }

    // ── Pit stable
    if (id === 'pit_stable') {
      const start = nowIso
      setCookStarted(true)
      setCookStartTime(start)
      applyEtaSnapshot(schedule.cookMin || 0, schedule.totalMin || ((schedule.cookMin || 0) + (schedule.restMin || 0)))
      message = `Cuisson lancée à ${fmt(start)}`
    }

    // ── Stall — recalibrate() via calculator.js
    if (id === 'stall' && userResponse.actualTemp) {
      const r = recalibrate(schedule, userResponse.actualTemp, elapsed)
      // PATCH: source de vérité ETA = remaining* du moteur, à l’instant du recalcul
      applyEtaSnapshot(r.remainingCookMin, r.remainingTotalMin)
      if (r.alert) {
        message = `${r.alert}${r.action ? ' → ' + r.action : ''}`
      } else {
        message = `T° ${userResponse.actualTemp}°C — rythme ${Math.round(r.speedRatio * 100)}% de la normale`
      }
    }

    // PATCH: ribs — checkpoint visuel avant wrap, sans logique sonde
    if (id === 'bark_check') {
      if (userResponse.barkOk) {
        message = "Couleur validée — continue vers l'étape suivante."
      } else {
        const extra = 20
        message = `Couleur encore légère — ajoute environ ${extra}min puis recontrôle.`
        applyEtaSnapshot((currentEta.remainingCookMin || 0) + extra, (currentEta.remainingTotalMin || 0) + extra)
        addLog(message)
        setEta(currentEta)
        setResults(r => ({ ...r, [id]: { message, payload: userResponse, capturedAt: new Date().toISOString() } }))
        return
      }
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
      // PATCH: l’ETA est mise à jour à partir du temps restant courant, pas du total historique
      applyEtaSnapshot(
        Math.max((currentEta.remainingCookMin || 0) - saved, 0),
        Math.max((currentEta.remainingTotalMin || 0) - saved, 0)
      )
    }

    // ── Probe test
    if (id === 'probe_test') {
      if (userResponse.probeOk) {
        message = '🎉 Probe tender — sortez la viande et lancez le repos en Cambro.'
        currentEta.message = 'Cuisson terminée'
        applyEtaSnapshot(0, schedule.restMin || 60)
      } else {
        const extra = 30
        message = `Pas encore — +${extra}min ajoutées. Retest dans 30min.`
        applyEtaSnapshot((currentEta.remainingCookMin || 0) + extra, (currentEta.remainingTotalMin || 0) + extra)
        addLog(message)
        setEta(currentEta)
        setResults(r => ({ ...r, [id]: { message } }))
        // PATCH: ne pas avancer — reste sur probe_test pour revalider
        return
      }
    }

    // PATCH: ribs — flex test / retrait sur l'os en checkpoint principal
    if (id === 'flex_test') {
      if (userResponse.flexOk) {
        // PATCH: avec glaze optionnelle ensuite, le flex test valide la finition imminente plutôt qu'une sortie immédiate
        message = '🎉 Flex test validé — les ribs sont prêtes pour la finition.'
        currentEta.message = 'Ribs prêtes pour la finition'
        applyEtaSnapshot(0, schedule.restMin || 15)
      } else {
        const extra = 15
        message = `Pas encore assez souples — ajoute environ ${extra}min puis reteste.`
        applyEtaSnapshot((currentEta.remainingCookMin || 0) + extra, (currentEta.remainingTotalMin || 0) + extra)
        addLog(message)
        setEta(currentEta)
        setResults(r => ({ ...r, [id]: { message, payload: userResponse, capturedAt: new Date().toISOString() } }))
        return
      }
    }

    if (id === 'glaze') {
      if (userResponse.glazeChoice === 'light_glaze') {
        const extra = 15
        // PATCH: fine glaze = petite rallonge réaliste, sans rigidifier le flow
        message = 'Ajoute une fine couche de sauce et laisse prendre encore 10 à 20 min en surveillant bien la caramélisation.'
        applyEtaSnapshot((currentEta.remainingCookMin || 0) + extra, (currentEta.remainingTotalMin || 0) + extra)
      } else {
        message = 'Pas de sauce ajoutée — passe directement au repos.'
      }
    }

    // ── Repos
    if (id === 'rest') {
      const restMin = schedule.restMin || 60
      const restEnd = addMin(new Date(), restMin)
      setRestTimer({ endTime: restEnd.toISOString(), durationMin: restMin })
      applyEtaSnapshot(0, restMin)
      message = `Repos lancé — prêt à ${fmt(restEnd)} (${fmtDur(restMin)} minimum)`
    }

    addLog(message || id)
    setEta(currentEta)
    // PATCH: structure prête pour analytics futures sur validations humaines
    setResults(r => ({ ...r, [id]: { message, payload: userResponse, capturedAt: new Date().toISOString() } }))
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
  const ribsSession = isRibsCook(schedule.meatKey)

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.25s ease both }
      `}</style>

      {/* PATCH: header session renforcé pour une lecture plus claire et plus premium */}
      <div className="pm-hero-shell" style={{ marginBottom: 20, padding: 0 }}>
        {/* ── HEADER avec photo viande */}
        <div style={{ borderRadius: 24, overflow: 'hidden', position: 'relative', border: '1px solid var(--border)' }}>
        {/* Photo viande ou ambiance fumoir */}
        <div style={{ height: 156, position: 'relative' }}>
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
              {schedule.weightKg}kg · {schedule.smokerTempC}°C · {schedule.methodVariantLabel || schedule.methodLabel || 'Méthode pitmaster'} · {schedule.smokerType}
            </div>
          </div>
        </div>
        </div>
        <div style={{ padding:'14px 18px 18px' }}>
          <div className="pm-kicker" style={{ marginBottom: 10 }}>
            {cookStarted ? 'Cuisson en cours' : 'Session prête'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
            Une seule étape active à la fois. Valide les vrais signaux terrain, puis laisse l’app t’aider à garder le cap sans te surcharger.
          </div>
        </div>
      </div>

      {/* PATCH: ribs = cuisson visuelle, pas pilotée étape par étape par des chiffres */}
      {ribsSession ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
            Cuisson visuelle
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: 'var(--text)', marginBottom: 8 }}>
            Suis surtout la couleur, le retrait sur l’os et le flex test
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>
            Les ribs ne se pilotent pas à la minute près. Valide chaque étape quand le rack te donne le bon signal visuel.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Départ estimé</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{schedule.startTime || '—'}</div>
            </div>
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Fenêtre service</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{schedule.serviceWindowStart} → {schedule.serviceWindowEnd}</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Départ estimé</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{schedule.startTime || '—'}</div>
            </div>
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Fenêtre service</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{schedule.serviceWindowStart} → {schedule.serviceWindowEnd}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {schedule.cues?.stallRange && (
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Stall</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{schedule.cues.stallRange}</div>
              </div>
            )}
            {schedule.cues?.wrapRange && (
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Wrap</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{schedule.cues.wrapRange}</div>
              </div>
            )}
            {schedule.cues?.probeStart && (
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Début probe</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{schedule.cues.probeStart}</div>
              </div>
            )}
            {schedule.cues?.probeTenderRange && (
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Probe tender</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{schedule.cues.probeTenderRange}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PROGRESSION */}
      <ProgressBar checkpoints={checkpoints} currentIndex={currentIndex} />

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

      {/* PATCH: CTA d'inscription après session terminée */}
      {isFinished && !user && (
        <div style={{ background:'linear-gradient(180deg,var(--surface),var(--orange-bg))', border:'1px solid var(--orange-border)', borderRadius:16, padding:'18px 20px', marginBottom:16 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:'var(--text)', marginBottom:8 }}>
            Créer un compte pour garder cette cuisson
          </div>
          <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.7, marginBottom:12 }}>
            Retrouve ce planning plus tard, garde tes cuissons passées et construis ton historique pour progresser d’une session à l’autre.
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <button
              onClick={() => navigate('/auth', { state: { from: '/app/session', reason: 'session-finished' } })}
              style={{ padding:'13px', borderRadius:50, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}
            >
              Créer un compte
            </button>
            <button
              onClick={() => navigate('/auth', { state: { from: '/app/session', reason: 'resume-history' } })}
              style={{ padding:'13px', borderRadius:50, border:'1px solid var(--border)', background:'var(--surface2)', color:'var(--text2)', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}
            >
              Se connecter
            </button>
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

      {/* PATCH: rappel doux avant de quitter une session en cours */}
      {!isFinished && !user && log.length > 0 && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'16px 18px', marginTop:16 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'var(--text)', marginBottom:6 }}>
            Reprendre cette cuisson plus tard ?
          </div>
          <div style={{ fontSize:12, color:'var(--text3)', lineHeight:1.7, marginBottom:10 }}>
            Connecte-toi pour retrouver tes sessions en cours et ton historique depuis n’importe quel appareil.
          </div>
          <button
            onClick={() => navigate('/auth', { state: { from: '/app/session', reason: 'resume-session' } })}
            style={{ width:'100%', padding:'12px', borderRadius:50, border:'1px solid var(--orange-border)', background:'var(--orange-bg)', color:'var(--orange)', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}
          >
            Se connecter pour retrouver cette session
          </button>
        </div>
      )}

      {/* ── TERMINER */}
      <button onClick={() => { clearPendingSession(); navigate('/app') }} style={{ width: '100%', padding: '14px', borderRadius: 50, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text3)', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 16 }}>
        ↩ Terminer la session
      </button>
    </div>
  )
}
