import {
  addMinutes,
  buildTimeline,
  calculateLowSlow,
  calculateSteak,
  formatTime,
  hhmmToMinutes,
  minutesToClock,
  roundMinutesForDisplay,
} from '../../domain/calculator/engine'

export function buildServeDate(serveTime) {
  const [hours, minutes] = String(serveTime || '19:00').split(':').map((v) => parseInt(v, 10))
  const now = new Date()
  const serve = new Date(now)
  serve.setSeconds(0, 0)
  serve.setHours(
    Number.isFinite(hours) ? hours : 19,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0,
  )
  if (serve.getTime() <= now.getTime()) serve.setDate(serve.getDate() + 1)
  return serve
}

export function buildCookResult(meatKey, weightKg, options = {}, serveTime = '19:00') {
  const calc = options?.method === 'reverse_sear'
    ? calculateSteak(meatKey, options)
    : calculateLowSlow(meatKey, weightKg, options)
  const phases = calc.phases || buildTimeline(calc, options.smokerTempC || calc.smokerTempC || 120)
  const serve = buildServeDate(serveTime)

  const probableMin = Number.isFinite(calc.probableMin) ? calc.probableMin : calc.totalMin || calc.cookMin || 0
  const optimisticMin = Number.isFinite(calc.optimisticMin) ? calc.optimisticMin : probableMin
  const prudentMin = Number.isFinite(calc.prudentMin) ? calc.prudentMin : probableMin

  // New planning rule: recommend the safe departure, not the median departure.
  const start = addMinutes(serve, -prudentMin)
  const meatOnSmokerAt = addMinutes(start, calc.preheatMin || 0)
  const earliestReadyAt = addMinutes(start, optimisticMin)
  const probableReadyAt = addMinutes(start, probableMin)
  const latestReadyAt = addMinutes(start, prudentMin)
  const estimatedCookDoneAt = addMinutes(probableReadyAt, -(calc.restMin || 0))

  let cursor = new Date(meatOnSmokerAt)
  const timeline = phases.map((phase) => {
    const step = {
      ...phase,
      time: formatTime(cursor),
    }
    if (phase.durationMin) cursor = addMinutes(cursor, phase.durationMin)
    return step
  })
  timeline.push({
    id: 'service',
    label: '🍽️ Service',
    isService: true,
    description: 'Sers dans la fenêtre conseillée.',
    time: formatTime(probableReadyAt),
  })

  return {
    ...calc,
    probableMin,
    optimisticMin,
    prudentMin,
    startTimeRaw: start.toISOString(),
    meatOnSmokerAtRaw: meatOnSmokerAt.toISOString(),
    cookDoneAtRaw: estimatedCookDoneAt.toISOString(),
    readyAtRaw: probableReadyAt.toISOString(),
    startTime: formatTime(start),
    meatOnSmokerTime: formatTime(meatOnSmokerAt),
    cookDoneTime: formatTime(estimatedCookDoneAt),
    readyAfterRestTime: formatTime(probableReadyAt),
    serve: formatTime(serve),
    serviceWindowStart: formatTime(earliestReadyAt),
    serviceWindowEnd: formatTime(latestReadyAt),
    timeline,
  }
}

export function buildCookRoadmap(result) {
  if (!result) return []

  const startMinutes = typeof result.preheatStartMinutes === 'number'
    ? result.preheatStartMinutes
    : hhmmToMinutes(result.startTime || '19:00')
  const meatOnSmokerMinutes = typeof result.meatOnSmokerMinutes === 'number'
    ? result.meatOnSmokerMinutes
    : startMinutes + (result.preheatMin || 0)
  const displayClock = (minutes) => minutesToClock(roundMinutesForDisplay(minutes, 15)).replace(':', 'h')

  const roadmap = [
    {
      id: 'preheat',
      icon: '🔥',
      title: 'Prechauffage',
      time: displayClock(startMinutes),
      caption: `Allume et stabilise le fumoir avant d’y poser la viande.`,
    },
    {
      id: 'load',
      icon: result.meatKey === 'ribs_pork' || result.meatKey === 'ribs_baby_back' ? '🍖' : '🥩',
      title: 'Mise en cuisson',
      time: displayClock(meatOnSmokerMinutes),
      caption: `Charge la viande vers ${result.meatOnSmokerTime || formatTime(addMinutes(new Date(), meatOnSmokerMinutes))} a ${result.smokerTempC || 'la temperature prévue'}°C.`,
    },
  ]

  ;(result.timeline || []).forEach((step) => {
    if (step.id === 'service') return
    if (step.id === 'bark') {
      roadmap.push({ id: 'bark', icon: '🌫️', title: step.label, time: step.time || null, caption: step.description })
      return
    }
    if (step.id === 'stall') {
      roadmap.push({ id: 'stall', icon: '📍', title: step.label, time: step.time || null, caption: step.description })
      return
    }
    if (step.id === 'wrap') {
      roadmap.push({ id: 'wrap', icon: '📦', title: step.label, time: step.time || null, caption: step.description })
      return
    }
    if (step.id === 'pullback') {
      roadmap.push({ id: 'pullback', icon: '🦴', title: step.label, time: step.time || null, caption: step.description })
      return
    }
    if (step.id === 'flex') {
      roadmap.push({ id: 'flex', icon: '🔍', title: step.label, time: step.time || null, caption: step.description })
      return
    }
    if (step.id === 'probe') {
      roadmap.push({ id: 'probe', icon: '🌡️', title: step.label, time: step.time || null, caption: step.description })
      return
    }
    if (step.id === 'rest') {
      roadmap.push({ id: 'rest', icon: '😴', title: step.label, time: step.time || null, caption: step.description })
    }
  })

  roadmap.push({
    id: 'service',
    icon: '🍽️',
    title: 'Service',
    time: result.readyAfterRestTime || result.serve,
    caption: `Viande probablement prete entre ${result.serviceWindowStart} et ${result.serviceWindowEnd}.`,
  })

  return roadmap
}
