import {
  addMinutes,
  buildTimeline,
  calculateLowSlow,
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
  const calc = calculateLowSlow(meatKey, weightKg, options)
  const phases = buildTimeline(calc, options.smokerTempC || 120)
  const serve = buildServeDate(serveTime)

  const probableMin = Number.isFinite(calc.probableMin) ? calc.probableMin : calc.totalMin || calc.cookMin || 0
  const optimisticMin = Number.isFinite(calc.optimisticMin) ? calc.optimisticMin : probableMin
  const prudentMin = Number.isFinite(calc.prudentMin) ? calc.prudentMin : probableMin

  const start = addMinutes(serve, -probableMin)
  const meatOnSmokerAt = addMinutes(start, calc.preheatMin || 30)
  const estimatedCookDoneAt = addMinutes(meatOnSmokerAt, calc.cookMin || 0)
  const estimatedReadyAt = addMinutes(estimatedCookDoneAt, calc.restMin || 0)
  const serviceWindowStart = addMinutes(serve, -(prudentMin - probableMin))
  const serviceWindowEnd = addMinutes(serve, Math.max(optimisticMin - probableMin, 0))

  const timeline = phases.map((phase) => ({ ...phase }))
  timeline.push({
    id: 'service',
    label: '🍽️ Service',
    isService: true,
    description: 'Sers dans la fenêtre conseillée.',
  })

  return {
    ...calc,
    probableMin,
    optimisticMin,
    prudentMin,
    startTimeRaw: start.toISOString(),
    meatOnSmokerAtRaw: meatOnSmokerAt.toISOString(),
    cookDoneAtRaw: estimatedCookDoneAt.toISOString(),
    readyAtRaw: estimatedReadyAt.toISOString(),
    startTime: formatTime(start),
    meatOnSmokerTime: formatTime(meatOnSmokerAt),
    cookDoneTime: formatTime(estimatedCookDoneAt),
    readyAfterRestTime: formatTime(estimatedReadyAt),
    serve: formatTime(serve),
    serviceWindowStart: formatTime(serviceWindowStart),
    serviceWindowEnd: formatTime(serviceWindowEnd),
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
    : startMinutes + (result.preheatMin || 30)
  const cookDoneMinutes = typeof result.estimatedDoneTimeMinutes === 'number'
    ? result.estimatedDoneTimeMinutes
    : meatOnSmokerMinutes + (result.cookMin || 0)
  const readyAtMinutes = typeof result.readyAfterRestMinutes === 'number'
    ? result.readyAfterRestMinutes
    : cookDoneMinutes + (result.restMin || 0)
  const stallAtMinutes = meatOnSmokerMinutes + Math.round((result.cookMin || 0) * (result.method === 'hot_and_fast' ? 0.5 : 0.55))
  const wrapAtMinutes = meatOnSmokerMinutes + Math.round((result.cookMin || 0) * 0.45)
  const probeAtMinutes = meatOnSmokerMinutes + Math.round((result.cookMin || 0) * (result.method === 'hot_and_fast' ? 0.8 : 0.85))
  const displayClock = (minutes) => minutesToClock(roundMinutesForDisplay(minutes, 10)).replace(':', 'h')

  if (result.meatKey === 'ribs_pork' || result.meatKey === 'ribs_baby_back') {
    return [
      { id: 'preheat', icon: '🔥', title: 'Préchauffage', time: displayClock(startMinutes), caption: 'Allume et stabilise le fumoir avant de charger le rack.' },
      { id: 'load', icon: '🍖', title: 'Poser les ribs', time: displayClock(meatOnSmokerMinutes), caption: `Place les ribs à ${result.smokerTempC}°C et laisse la couleur se construire.` },
      { id: 'pullback', icon: '🦴', title: 'Pullback', time: null, caption: 'Observe la couleur, le retrait sur l’os et décide si tu veux wrapper.' },
      { id: 'wrap', icon: '🌯', title: 'Wrap éventuel', time: result.wrapType !== 'none' ? displayClock(wrapAtMinutes) : null, caption: result.wrapType !== 'none' ? 'Emballe si la couleur te plaît et que tu veux une texture plus souple.' : 'Reste à nu si tu veux garder une bark plus marquée.' },
      { id: 'flex', icon: '🔍', title: 'Flex test', time: null, caption: 'Le vrai signal de fin : le rack plie franchement et commence à fissurer.' },
      { id: 'rest', icon: '😴', title: 'Repos court', time: displayClock(cookDoneMinutes), caption: 'Laisse reposer quelques minutes avant de couper.' },
      { id: 'service', icon: '🍽️', title: 'Service', time: displayClock(readyAtMinutes), caption: `Fenêtre conseillée : ${result.serviceWindowStart} → ${result.serviceWindowEnd}.` },
    ]
  }

  return [
    { id: 'preheat', icon: '🔥', title: 'Préchauffage', time: displayClock(startMinutes), caption: 'Allume le fumoir et laisse-le se stabiliser tranquillement.' },
    { id: 'load', icon: '🥩', title: 'Poser la viande', time: displayClock(meatOnSmokerMinutes), caption: `Charge la viande sur le fumoir à ${result.smokerTempC}°C.` },
    { id: 'stall', icon: '📍', title: 'Stall attendu', time: result.cues?.stallRange ? displayClock(stallAtMinutes) : null, caption: result.cues?.stallRange ? `Repère utile : ${result.cues.stallRange}. Continue à surveiller la bark.` : 'Surveille surtout la couleur et la texture.' },
    { id: 'wrap', icon: '📦', title: 'Wrap', time: result.wrapType !== 'none' ? displayClock(wrapAtMinutes) : null, caption: result.wrapType !== 'none' ? `Emballe quand la bark te plaît. Repère : ${result.cues?.wrapRange || 'bonne zone de wrap'}.` : 'Sans wrap : laisse continuer jusqu’à la vraie tendreté.' },
    { id: 'probe', icon: '🌡️', title: 'Début des tests', time: displayClock(probeAtMinutes), caption: result.cues?.probeTenderRange ? `Commence à tester vers ${result.cues?.probeStart || 'la bonne zone'} puis cherche ${result.cues.probeTenderRange}.` : 'Commence à tester selon la texture recherchée.' },
    { id: 'rest', icon: '😴', title: 'Repos', time: displayClock(cookDoneMinutes), caption: `Repos recommandé : ${result.cues?.restRange || result.restRecommendation}.` },
    { id: 'service', icon: '🍽️', title: 'Service', time: displayClock(readyAtMinutes), caption: `Fenêtre conseillée : ${result.serviceWindowStart} → ${result.serviceWindowEnd}.` },
  ]
}
