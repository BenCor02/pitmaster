/**
 * useCookSession — Hook de gestion des sessions de cuisson
 * - Sauvegarde en Supabase (persistance cross-device)
 * - Rechargement automatique si session active
 * - Notifications push locales via Service Worker
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS PUSH — Service Worker
// ─────────────────────────────────────────────────────────────

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    // PATCH: versionne explicitement le SW pour éviter qu'une ancienne UI reste servie depuis le cache
    const reg = await navigator.serviceWorker.register('/sw.js?v=brandmark-1')
    await navigator.serviceWorker.ready
    return reg
  } catch (e) {
    console.warn('SW registration failed:', e)
    return null
  }
}

async function requestNotifPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

function scheduleNotification(sw, checkpoint, startedAt) {
  if (!sw?.active) return
  const triggerTime  = new Date(checkpoint.triggerTime)
  const now          = Date.now()
  const delayMs      = Math.max(triggerTime.getTime() - now - 5 * 60000, 0) // 5min avant
  if (delayMs > 24 * 60 * 60 * 1000) return // pas dans + de 24h

  const titles = {
    pit_stable:   '🌡️ Vérifier la stabilité du pit',
    stall_check:  '📊 Vérification au Stall',
    wrap_confirm: '🌯 Heure du Wrap',
    probe_test:   '🔍 Probe Test — Prêt ?',
  }
  const bodies = {
    pit_stable:   checkpoint.question,
    stall_check:  checkpoint.question,
    wrap_confirm: checkpoint.question,
    probe_test:   checkpoint.question,
  }

  sw.active.postMessage({
    type: 'SCHEDULE_NOTIF',
    id:      checkpoint.id,
    title:   titles[checkpoint.id] || '🔥 PitMaster Checkpoint',
    body:    bodies[checkpoint.id] || checkpoint.question,
    delayMs,
  })
}

// ─────────────────────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────

export function useCookSession() {
  const { user } = useAuth()
  const [session, setSession]       = useState(null)   // session active
  const [loading, setLoading]       = useState(true)
  const [saving,  setSaving]        = useState(false)
  const [swReg,   setSwReg]         = useState(null)
  const [notifOk, setNotifOk]       = useState(false)
  const timerRef = useRef(null)

  // ── Charger la session active au montage
  useEffect(() => {
    if (!user) { setLoading(false); return }
    loadActiveSession()
    setupPush()
  }, [user])

  // ── Timer tick toutes les minutes (mise à jour elapsed)
  useEffect(() => {
    if (!session) return
    timerRef.current = setInterval(() => {
      setSession(s => s ? { ...s, _tick: Date.now() } : s)
    }, 60000)
    return () => clearInterval(timerRef.current)
  }, [session?.id])

  async function setupPush() {
    const reg = await registerServiceWorker()
    setSwReg(reg)
    const ok = await requestNotifPermission()
    setNotifOk(ok)
  }

  async function loadActiveSession() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('active_cook_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data && !error) {
        setSession(hydrateSession(data))
      }
      // error.code === 'PGRST116' = no rows → pas de session active, c'est normal
    } catch (err) {
      // Table non créée ou autre erreur Supabase → on continue sans session
      console.warn('useCookSession: table active_cook_sessions inaccessible', err?.message)
    }
    setLoading(false)
  }

  // ── Convertir la ligne Supabase en objet session complet
  function hydrateSession(row) {
    return {
      id:          row.id,
      userId:      row.user_id,
      meatKey:     row.meat_key,
      meatLabel:   row.meat_label,
      weightKg:    row.weight_kg,
      smokerTempC: row.smoker_temp_c,
      smokerType:  row.smoker_type,
      wrapType:    row.wrap_type,
      marbling:    row.marbling,
      waterPan:    row.water_pan,
      startedAt:   row.started_at,
      serviceTime: row.service_time,
      phase1Min:   row.phase1_min,
      stallMin:    row.stall_min,
      phase3Min:   row.phase3_min,
      cookMin:     row.cook_min,
      bufferMin:   row.buffer_min,
      restMin:     row.rest_min,
      totalMin:    row.total_min,
      stallStartC: row.stall_start_c,
      targetC:     row.target_c,
      wrapTempC:   row.wrap_temp_c,
      checkpoints: row.checkpoints || [],
      cookLog:     row.cook_log    || [],
      status:      row.status,
    }
  }

  // ── Lancer une nouvelle session
  async function startSession(schedule, startedAt = new Date().toISOString()) {
    if (!user) return null
    setSaving(true)

    // Calculer les triggerTimes corrects depuis startedAt
    const start = new Date(startedAt)
    const addMin = (ms, m) => new Date(ms + m * 60000)
    const fmt = (d) => d.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })

    const checkpoints = [
      {
        id: 'pit_stable',
        label: '🌡️ Stabilité du pit',
        triggerTime:    addMin(start, 60).toISOString(),
        triggerTimeStr: fmt(addMin(start, 60)),
        question: `Le pit est-il stable à ${schedule.smokerTempC}°C ?`,
        fields: [
          { key:'isStable',   type:'boolean', label:'Pit stable ?' },
          { key:'actualTemp', type:'number',  label:'T° réelle du pit', optional:true },
        ],
        hint: 'Si non, ajustez les trappes et attendez 15min.',
        validated: false,
      },
      {
        id: 'stall_check',
        label: '📊 Vérification au Stall',
        triggerTime:    addMin(start, schedule.phase1Min).toISOString(),
        triggerTimeStr: fmt(addMin(start, schedule.phase1Min)),
        question: `T° interne attendue ~${schedule.stallStartC || 65}°C. Valeur réelle ?`,
        fields: [
          { key:'actualTemp', type:'number', label:'T° interne réelle (°C)' },
        ],
        hint: "Si plus basse, l'app recalculera automatiquement.",
        validated: false,
      },
      ...(schedule.wrapTempC ? [{
        id: 'wrap_confirm',
        label: '🌯 Heure du Wrap',
        triggerTime:    addMin(start, schedule.phase1Min).toISOString(),
        triggerTimeStr: fmt(addMin(start, schedule.phase1Min)),
        question: `T° interne proche de ${schedule.wrapTempC}°C. Confirmez le wrap.`,
        fields: [
          { key:'wrapType', type:'select', label:'Type de wrap',
            options:['butcher_paper','foil','none'], default: schedule.wrapType },
        ],
        hint: 'Foil = récupère du retard. Butcher paper = meilleure écorce.',
        validated: false,
      }] : []),
      {
        id: 'probe_test',
        label: '🔍 Probe Test',
        triggerTime:    addMin(start, schedule.phase1Min + schedule.stallMin + Math.round((schedule.phase3Min||0)*0.9)).toISOString(),
        triggerTimeStr: fmt(addMin(start, schedule.phase1Min + schedule.stallMin + Math.round((schedule.phase3Min||0)*0.9))),
        question: `Score collagène bientôt atteint. La sonde glisse-t-elle comme dans du beurre ?`,
        fields: [
          { key:'passed', type:'boolean', label:'Probe test réussi ?' },
        ],
        hint: 'Si non → +30min de cuisson, repos réduit en compensation.',
        validated: false,
      },
    ]

    const { data, error } = await supabase
      .from('active_cook_sessions')
      .insert({
        user_id:      user.id,
        meat_key:     schedule.meatKey,
        meat_label:   schedule.meatLabel,
        weight_kg:    schedule.weightKg,
        smoker_temp_c: schedule.smokerTempC,
        smoker_type:  schedule.smokerType,
        wrap_type:    schedule.wrapType,
        marbling:     schedule.marbling,
        water_pan:    schedule.waterPan,
        started_at:   startedAt,
        service_time: schedule.serve,
        phase1_min:   schedule.phase1Min,
        stall_min:    schedule.stallMin,
        phase3_min:   schedule.phase3Min,
        cook_min:     schedule.cookMin,
        buffer_min:   schedule.bufferMin,
        rest_min:     schedule.restMin,
        total_min:    schedule.totalMin,
        stall_start_c: schedule.stallStartC,
        target_c:     schedule.targetC,
        wrap_temp_c:  schedule.wrapTempC,
        checkpoints,
        cook_log:     [],
        status:       'active',
      })
      .select()
      .single()

    setSaving(false)

    if (error || !data) {
      console.warn('Supabase unavailable, using local session fallback')
      // Fallback : session locale (sans persistance, mais fonctionnelle)
      const localSession = {
        id: 'local-' + Date.now(),
        userId: user.id,
        meatKey:     schedule.meatKey,
        meatLabel:   schedule.meatLabel,
        weightKg:    schedule.weightKg,
        smokerTempC: schedule.smokerTempC,
        smokerType:  schedule.smokerType,
        wrapType:    schedule.wrapType,
        marbling:    schedule.marbling,
        waterPan:    schedule.waterPan,
        startedAt,
        serviceTime: schedule.serve,
        phase1Min:   schedule.phase1Min,
        stallMin:    schedule.stallMin,
        phase3Min:   schedule.phase3Min,
        cookMin:     schedule.cookMin,
        bufferMin:   schedule.bufferMin,
        restMin:     schedule.restMin,
        totalMin:    schedule.totalMin,
        stallStartC: schedule.stallStartC,
        targetC:     schedule.targetC,
        wrapTempC:   schedule.wrapTempC,
        checkpoints,
        cookLog:     [],
        status:      'active',
      }
      setSession(localSession)
      return localSession
    }

    const hydrated = hydrateSession(data)
    setSession(hydrated)

    // Programmer les notifications push
    if (swReg && notifOk) {
      checkpoints.forEach(cp => scheduleNotification(swReg, cp, startedAt))
    }

    return hydrated
  }

  // ── Valider un checkpoint et sauvegarder
  async function validateCheckpoint(checkpointId, userResponse, action) {
    if (!session) return

    const newCheckpoints = session.checkpoints.map(cp =>
      cp.id === checkpointId
        ? { ...cp, validated: true, validatedAt: new Date().toISOString(), userResponse, action }
        : cp
    )

    const logEntry = {
      at:      new Date().toISOString(),
      type:    checkpointId,
      message: action?.message || '',
    }
    const newLog = [logEntry, ...session.cookLog]

    setSession(s => ({ ...s, checkpoints: newCheckpoints, cookLog: newLog }))

    // Sauvegarder en base si ce n'est pas une session locale
    if (!session.id?.startsWith('local-')) {
      await supabase
        .from('active_cook_sessions')
        .update({ checkpoints: newCheckpoints, cook_log: newLog })
        .eq('id', session.id)
        .catch(err => console.warn('Save checkpoint failed:', err?.message))
    }
  }

  // ── Ajouter une entrée au journal
  async function addLogEntry(message, type = 'recal') {
    if (!session) return
    const entry = { at: new Date().toISOString(), type, message }
    const newLog = [entry, ...(session.cookLog || [])]
    setSession(s => ({ ...s, cookLog: newLog }))
    if (!session.id?.startsWith('local-')) {
      await supabase
        .from('active_cook_sessions')
        .update({ cook_log: newLog })
        .eq('id', session.id)
        .catch(err => console.warn('Save log failed:', err?.message))
    }
  }

  // ── Terminer la session
  async function endSession(status = 'completed') {
    if (!session) return
    if (!session.id?.startsWith('local-')) {
      await supabase
        .from('active_cook_sessions')
        .update({ status })
        .eq('id', session.id)
        .catch(err => console.warn('End session failed:', err?.message))
    }
    setSession(null)
  }

  // ── Temps écoulé (minutes)
  const elapsedMin = session
    ? Math.round((Date.now() - new Date(session.startedAt).getTime()) / 60000)
    : 0

  // ── Checkpoint actif = premier non validé dont l'heure est passée
  const activeCheckpointId = session?.checkpoints?.find(cp => {
    if (cp.validated) return false
    const triggerMs = new Date(cp.triggerTime).getTime()
    return Date.now() >= triggerMs - 5 * 60000  // -5min pré-alerte
  })?.id

  return {
    session, loading, saving,
    elapsedMin, activeCheckpointId,
    notifOk, swReg,
    startSession, validateCheckpoint, addLogEntry, endSession,
    reload: loadActiveSession,
  }
}
