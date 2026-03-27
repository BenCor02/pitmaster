import { useState, useEffect, useMemo } from 'react'
import { MEAT_IMAGES } from '../lib/images'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { MEATS } from '../lib/meats'
import {
  calculateLowSlow, recalibrate, formatDuration, formatTime,
  addMinutes, validateInput, PHASE_BASES, buildTimeline, COOKING_METHODS,
  getCookingProfile, getMethodConfig, hhmmToMinutes, minutesToClock, roundMinutesForDisplay,
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
  'Volaille': ['whole_chicken', 'chicken_pieces'],
  'Gigot': ['lamb_leg'],
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

const DEFAULT_METHOD = 'low_and_slow'

const toFloat = (value, fallback = 0) => {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : fallback
}

const toInt = (value, fallback = 0) => {
  const n = parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

// PATCH: persistance locale réduite aux brouillons de formulaire uniquement
function getCalcDraft() {
  try {
    return JSON.parse(localStorage.getItem('pm_calc') || '{}')
  } catch {
    return {}
  }
}

// PATCH: restauration du dernier résultat pour retrouver rapidement son plan
function getLastCalcResult() {
  try {
    return JSON.parse(localStorage.getItem('pm_calc_result') || 'null')
  } catch {
    return null
  }
}

// PATCH: bridge temporaire pour une future persistence membre/Supabase des sessions
function savePendingSession(payload) {
  try {
    sessionStorage.setItem('pm_active_session', JSON.stringify({
      ...payload,
      savedAt: new Date().toISOString(),
      source: 'calculator',
    }))
  } catch {
    // PATCH: session best effort seulement
  }
}

// PATCH: identifiant visiteur local pour préparer une analytics anonyme sans friction
function getAnonymousVisitorId() {
  try {
    const existing = localStorage.getItem('pm_visitor_id')
    if (existing) return existing
    const next = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem('pm_visitor_id', next)
    return next
  } catch {
    // PATCH: fallback sans persistance si localStorage indisponible
    return `visitor_${Date.now()}`
  }
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

// PATCH: petits intertitres pour guider le parcours sans surcharger l'écran
function renderSectionEyebrow(index, title, subtitle) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="pm-kicker" style={{ marginBottom: 8 }}>{index}</div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text)', lineHeight: 1.05 }}>
        {title}
      </div>
      {subtitle ? (
        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  )
}

function getTimelineStepContent(step, result) {
  const isRibsCook = result?.meatKey === 'ribs_pork' || result?.meatKey === 'ribs_baby_back'
  const isShoulder = result?.meatKey === 'pork_shoulder'
  const isChuckLike = result?.meatKey === 'paleron' || result?.meatKey === 'plat_de_cote'
  const isLamb = result?.meatKey === 'lamb_shoulder'
  const isBeefRibs = result?.meatKey === 'ribs_beef'
  if (step.isService) return {
    title: isRibsCook ? 'Service' : 'Service',
    explanation: 'La cuisson est terminée et la viande est dans sa bonne fenêtre de service.',
    action: 'Sers pendant qu’elle est encore bien chaude et avec la texture voulue.',
  }
  if (step.isRest) return {
    title: isRibsCook ? 'Repos' : 'Rest / Hold (repos)',
    explanation: 'Le repos aide les jus à se répartir et rend le service plus simple.',
    action: isRibsCook ? 'Laisse reposer quelques minutes avant de couper et servir.' : 'Laisse reposer au chaud avant de trancher ou effilocher.',
  }
  if (step.isStall) return {
    title: isRibsCook ? 'Retrait sur l’os' : 'La cuisson ralentit',
    explanation: isRibsCook
      ? 'Sur les ribs, ce moment sert surtout à regarder la couleur, le retrait de viande sur l’os et à décider si un wrap est utile.'
      : result?.wrapType !== 'none'
        ? "La température peut ralentir. C'est normal. Le wrap, c'est emballer la viande pour accélérer la fin de cuisson et garder plus de jus."
        : "La température peut ralentir ou presque stagner. C'est normal pendant le low & slow.",
    action: isRibsCook
      ? "Si la couleur te plaît, tu peux wrapper. Sinon laisse encore un peu prendre la fumée."
      : result?.wrapType !== 'none'
        ? `Emballe quand la couleur te plaît ou autour de ${result.wrapTempC}°C, puis garde un feu stable.`
        : "N'augmente pas brutalement la température du fumoir. Laisse la cuisson suivre son rythme.",
  }
  if (step.id === 'wrap') return {
    title: isRibsCook ? 'Wrap (facultatif)' : 'Wrap (emballage)',
    explanation: isRibsCook
      ? "Sur les ribs, le wrap reste facultatif. Il accélère la cuisson et donne souvent une texture plus fondante."
      : isChuckLike
        ? "Sur le chuck et le plat de côte, une finition plus couverte aide souvent à aller chercher la tendreté sans dessécher."
        : "Le wrap aide à traverser la fin de cuisson plus régulièrement et à garder davantage de jus.",
    action: isRibsCook
      ? 'Emballe seulement si la couleur te plaît et si tu veux une texture plus souple.'
      : isChuckLike
        ? 'Couvre ou emballe quand la couleur te plaît, puis laisse finir tranquillement vers la tendreté.'
        : `Emballe quand la bark te plaît ou dans la bonne zone de température.`,
  }
  if (step.id === 'glaze') return {
    title: 'Glaze / sauce de finition',
    explanation: 'Si tu veux des ribs brillantes et légèrement collantes, c’est le bon moment pour ajouter une fine couche de sauce.',
    action: 'Badigeonne légèrement, puis remets 10 à 20 min pour faire prendre.',
  }
  if (step.id === 'bark') return {
    title: isRibsCook ? 'Couleur / fumée' : 'Bark en formation',
    explanation: isRibsCook
      ? "La rack prend la fumée et sa couleur se construit. Sur les ribs, c'est un repère plus utile qu'une heure fixe."
      : isShoulder
        ? "Dans cette première partie, la viande prend la fumée et construit sa bark. C’est là que le goût barbecue se joue vraiment."
        : isChuckLike || isLamb
          ? "La viande prend la fumée et sa couleur se construit. On cherche surtout une belle surface avant la finition."
          : "La bark, c'est la croûte / écorce de cuisson qui se forme avec la fumée et la chaleur.",
    action: "Évite d'ouvrir le fumoir inutilement et garde une température régulière.",
  }
  if (step.id === 'pullback') return {
    title: 'Pullback / retrait sur l’os',
    explanation: "La viande commence à se rétracter sur les os. C’est un vrai signal terrain sur les ribs.",
    action: 'Si la couleur te plaît déjà, tu peux wrapper. Sinon laisse encore prendre un peu.',
  }
  if (step.id === 'flex') return {
    title: isRibsCook ? 'Flex test' : 'Finition / test de tendreté',
    explanation: isRibsCook
      ? "Soulève la rack: elle doit se courber franchement et commencer à fissurer légèrement en surface. C'est le vrai signal de fin."
      : "On cherche le probe tender: la sonde doit entrer presque comme dans du beurre. C'est plus important que le chiffre exact.",
    action: isRibsCook
      ? 'Commence à vérifier la souplesse de la rack et le retrait sur l’os avant de servir.'
      : `Commence à tester régulièrement vers ${result?.targetTempC || '?'}°C et retire dès que la viande est tendre.`,
  }
  if (step.id === 'probe') return {
    title: isShoulder ? 'Test d’effilochage / tendreté' : isBeefRibs ? 'Probe tender' : 'Test de tendreté',
    explanation: isShoulder
      ? "La température est un repère, mais la vraie fin se juge surtout à la texture. La viande doit devenir souple et bien s’effilocher."
      : isLamb
        ? "Commence à tester selon la texture et le résultat voulu. Sur l’agneau, la bonne fin reste un peu plus souple qu’une grosse pièce de bœuf."
        : "La sonde doit entrer presque sans résistance. Le chiffre aide, mais la sensation reste le vrai verdict.",
    action: isShoulder
      ? 'Commence à tester dans la bonne zone, puis retire quand la viande s’effiloche proprement.'
      : isLamb
        ? 'Commence à tester, puis ajuste selon la texture et le résultat voulu.'
        : 'Commence à tester dans la bonne zone de température et retire dès que ça glisse.',
  }
  return {
    title: step.label,
    explanation: step.description,
    action: 'Suis cette étape tranquillement et garde le fumoir stable.',
  }
}

// PATCH: la timeline front répond explicitement à "quoi regarder / quoi comprendre / quoi faire"
function getStepGuide(content) {
  return {
    watch: content.title,
    meaning: content.explanation,
    action: content.action,
  }
}

function getReadyWindowText(result) {
  if (!result) return ''
  return `Viande probablement prête entre ${result.serviceWindowStart} et ${result.serviceWindowEnd}`
}

// PATCH: le hero remonte seulement les vrais repères utiles du moteur final
function getHeroCues(result, unit = 'c') {
  if (!result?.cues) return []
  if (result.meatKey === 'ribs_pork' || result.meatKey === 'ribs_baby_back') {
    return [
      { label: 'Repères ribs', value: 'Couleur, pullback, flex test' },
      { label: 'Glaze', value: 'Optionnelle en toute fin' },
      { label: 'Repos', value: result.cues.restRange || 'Repos court' },
    ]
  }
  return [
    { label: 'Stall', value: result.stallRangeC ? formatRangeDisplay(result.stallRangeC, unit) : result.cues.stallRange },
    { label: 'Wrap', value: result.wrapRangeC ? formatRangeDisplay(result.wrapRangeC, unit) : result.cues.wrapRange },
    { label: 'Début tests', value: result.probeStartC ? formatRangeDisplay(result.probeStartC, unit) : result.cues.probeStart },
    { label: 'Cible interne', value: result.probeTenderRangeC ? formatRangeDisplay(result.probeTenderRangeC, unit) : formatTemperatureDisplay(result.targetTempC, unit) || result.cues.probeTenderRange },
    { label: 'Repos', value: result.cues.restRange },
  ].filter(cue => cue.value)
}

// PATCH: petit label compact pour afficher la température utile à atteindre sur chaque étape
function getStepTemperatureBadge(step, result, unit = 'c') {
  if (!result || result.meatKey === 'ribs_pork' || result.meatKey === 'ribs_baby_back') return null
  if (step.id === 'stall') return result.stallRangeC ? formatRangeDisplay(result.stallRangeC, unit) : result.cues?.stallRange || null
  if (step.id === 'wrap') return result.wrapRangeC ? formatRangeDisplay(result.wrapRangeC, unit) : result.cues?.wrapRange || null
  if (step.id === 'probe') {
    if (result.probeTenderRangeC) return formatRangeDisplay(result.probeTenderRangeC, unit)
    if (result.probeStartC) return formatRangeDisplay(result.probeStartC, unit)
    return result.cues?.probeTenderRange || result.cues?.probeStart || null
  }
  if (step.id === 'rest') return result.cues?.restRange || null
  return null
}

function cToF(value) {
  return Math.round((value * 9) / 5 + 32)
}

function formatTemperatureDisplay(value, unit = 'c') {
  if (value == null) return null
  const numeric = typeof value === 'number' ? value : null
  if (numeric === null) return String(value)
  return unit === 'f' ? `${cToF(numeric)}°F` : `${numeric}°C`
}

function formatRangeDisplay(value, unit = 'c') {
  if (Array.isArray(value) && value.length === 2) {
    return unit === 'f'
      ? `${cToF(value[0])}–${cToF(value[1])}°F`
      : `${value[0]}–${value[1]}°C`
  }
  return formatTemperatureDisplay(value, unit)
}

// PATCH: roadmap visuelle simple branchée sur le moteur et affichée comme un plan d’action
function buildRoadmap(result) {
  if (!result) return []
  const startMinutes = typeof result.preheatStartMinutes === 'number' ? result.preheatStartMinutes : hhmmToMinutes(result.startTime || '19:00')
  const meatOnSmokerMinutes = typeof result.meatOnSmokerMinutes === 'number' ? result.meatOnSmokerMinutes : startMinutes + (result.preheatMin || 30)
  const cookDoneMinutes = typeof result.estimatedDoneTimeMinutes === 'number' ? result.estimatedDoneTimeMinutes : meatOnSmokerMinutes + (result.cookMin || 0)
  const readyAtMinutes = typeof result.readyAfterRestMinutes === 'number' ? result.readyAfterRestMinutes : cookDoneMinutes + (result.restMin || 0)
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

export default function Calc() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { snack, showSnack } = useSnack()

  // PATCH: seul le brouillon de formulaire reste restauré depuis localStorage
  const [meatKey,    setMeatKey]    = useState(() => getCalcDraft().meatKey || 'brisket')
  const [weight,     setWeight]     = useState(() => getCalcDraft().weight ?? 4)
  const [thickness,  setThickness]  = useState(() => getCalcDraft().thickness || '')
  const [smokerTemp, setSmokerTemp] = useState(() => getCalcDraft().smokerTemp ?? 110)
  const [serveTime,  setServeTime]  = useState(() => getCalcDraft().serveTime || '19:00')
  const [cookMethod, setCookMethod] = useState(() => {
    const savedMethod = getCalcDraft().cookMethod || DEFAULT_METHOD
    return savedMethod === 'texas_crutch' ? 'low_and_slow' : savedMethod
  })
  const [displayUnit, setDisplayUnit] = useState(() => getCalcDraft().displayUnit || 'c')
  const [lambLegStyle, setLambLegStyle] = useState(() => getCalcDraft().lambLegStyle || 'medium')
  const [smokerType, setSmokerType] = useState(() => getCalcDraft().smokerType || 'pellet')
  const [wrapType,   setWrapType]   = useState(() => getCalcDraft().wrapType || 'none')
  const [marbling,   setMarbling]   = useState(() => getCalcDraft().marbling || 'medium')
  const [startTemp,  setStartTemp]  = useState(() => getCalcDraft().startTemp ?? 4)
  const [showAdvanced,   setShowAdvanced]   = useState(false)
  const [showRecal,      setShowRecal]      = useState(false)
  const [currentTempC,   setCurrentTempC]   = useState('')
  const [elapsedMin,     setElapsedMin]     = useState('')
  const [currentPitTemp, setCurrentPitTemp] = useState('')
  const [recalResult,    setRecalResult]    = useState(null)
  // PATCH: le résultat n'est plus restauré depuis localStorage pour éviter d'en faire une base produit fragile
  const [result,   setResult]   = useState(() => getLastCalcResult())
  const [timeline, setTimeline] = useState([])
  const [warnings, setWarnings] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [sharing,  setSharing]  = useState(false)

  const profile = MEAT_PROFILES[meatKey]
  const meatData = MEATS[meatKey]
  const isLowSlow = profile?.method === 'lowslow'
  const cookingProfile = getCookingProfile(meatKey)
  const methodConfig = useMemo(() => getMethodConfig(meatKey, cookMethod), [meatKey, cookMethod])
  const tempRange = useMemo(() => methodConfig?.smokerTempRange || [100, 160], [methodConfig])
  const showWrapChoices = cookMethod === 'low_and_slow' && (Boolean(cookingProfile?.temperatureCues?.wrapRangeC) || meatKey === 'ribs_pork' || meatKey === 'ribs_baby_back' || meatKey === 'lamb_leg')
  const roadmap = buildRoadmap(result)

  // ── Sauvegarde automatique des inputs dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pm_calc', JSON.stringify({
        meatKey, weight, thickness, smokerTemp, serveTime,
        cookMethod, displayUnit, lambLegStyle, smokerType, wrapType, marbling, startTemp,
      }))
    } catch {
      // PATCH: persistance best effort seulement
    }
  }, [meatKey, weight, thickness, smokerTemp, serveTime, cookMethod, displayUnit, lambLegStyle, smokerType, wrapType, marbling, startTemp])

  // PATCH: changement de viande = poids et méthode ramenés sur quelque chose de crédible
  useEffect(() => {
    const nextProfile = getCookingProfile(meatKey)
    if (!nextProfile) return
    if (cookMethod === 'texas_crutch') setCookMethod('low_and_slow')
    if (!weight || weight <= 0) setWeight(nextProfile.defaultWeightKg || 3)
    if (!nextProfile.methods.some(entry => entry.method === cookMethod)) {
      const fallbackMethod = nextProfile.methods[0]?.method || DEFAULT_METHOD
      setCookMethod(fallbackMethod)
      const fallbackConfig = getMethodConfig(meatKey, fallbackMethod)
      if (fallbackConfig?.smokerTempDefault) setSmokerTemp(fallbackConfig.smokerTempDefault)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meatKey])

  // PATCH: le slider fumoir suit la méthode choisie, et le wrap reste cohérent avec cette méthode
  useEffect(() => {
    if (!methodConfig) return
    setSmokerTemp(current => clamp(current, tempRange[0], tempRange[1]))
    if (cookMethod === 'hot_and_fast' && wrapType !== 'none') setWrapType('none')
  }, [cookMethod, methodConfig, tempRange, wrapType])

  async function calculate() {
    setLoading(true)
    setRecalResult(null)
    setTimeout(async () => {
      try {
        const safeWeight = Math.max(toFloat(weight, 1), 0.1)
        const safeSmokerTemp = toInt(smokerTemp, 110)
        const safeStartTemp = toInt(startTemp, 4)
        const safeThickness = thickness === '' ? null : toFloat(thickness, null)
        const w = validateInput(meatKey, safeWeight, safeSmokerTemp)
        setWarnings(w)

        const options = {
          method: cookMethod,
          thicknessCm: safeThickness,
          smokerTempC: safeSmokerTemp,
          startTempC: safeStartTemp,
          lambLegStyle,
          smokerType,
          wrapType,
          marbling,
        }

        const calc = calculateCookTime(meatKey, safeWeight, options)
        const serve = buildServeDate(serveTime)
        const probableMin = Number.isFinite(calc.probableMin) ? calc.probableMin : calc.totalMin || calc.cookMin || 0
        const optimisticMin = Number.isFinite(calc.optimisticMin) ? calc.optimisticMin : probableMin
        const prudentMin = Number.isFinite(calc.prudentMin) ? calc.prudentMin : probableMin

        const start = addMinutes(serve, -probableMin)
        const meatOnSmokerAt = addMinutes(start, calc.preheatMin || 30)
        // PATCH: expose une lecture simple "fin cuisson" puis "prêt après repos"
        const estimatedCookDoneAt = addMinutes(meatOnSmokerAt, calc.cookMin || 0)
        const estimatedReadyAt = addMinutes(estimatedCookDoneAt, calc.restMin || 0)
        const serviceWindowStart = addMinutes(serve, -(prudentMin - probableMin))
        const serviceWindowEnd = addMinutes(serve, Math.max(optimisticMin - probableMin, 0))

        // PATCH: plus d'heures fixes par étape dans l'UI; on garde seulement les repères de cuisson
        const tl = calc.phases.map(phase => ({ ...phase }))
        tl.push({
          id: 'service', label: '🍽️ Service', isService: true,
          description: `Sers dans la fenêtre conseillée.`,
        })

        const newResult = {
          ...calc,
          weightKg: safeWeight,
          smokerTempC: safeSmokerTemp,
          startTimeRaw: start.toISOString(),
          meatOnSmokerAtRaw: meatOnSmokerAt.toISOString(),
          cookDoneAtRaw: estimatedCookDoneAt.toISOString(),
          readyAtRaw: estimatedReadyAt.toISOString(),
          startTime: formatTime(start),
          meatOnSmokerTime: formatTime(meatOnSmokerAt),
          cookDoneTime: formatTime(estimatedCookDoneAt),
          readyAfterRestTime: formatTime(estimatedReadyAt),
          // PATCH: l'heure de service affichée suit aussi l'arrondi utilisateur global
          serve: formatTime(serve),
          serviceWindowStart: formatTime(serviceWindowStart),
          serviceWindowEnd: formatTime(serviceWindowEnd),
          probableMin, optimisticMin, prudentMin,
          // PATCH: contexte non visible pour futures analytics anonymes et usage réel
          analyticsContext: {
            visitorId: getAnonymousVisitorId(),
            calculatedAt: new Date().toISOString(),
            isAnonymous: !user,
            entryPoint: 'calculator',
            smokerType,
            wrapType,
            marbling,
          },
        }
        setResult(newResult)
        try {
          localStorage.setItem('pm_calc_result', JSON.stringify(newResult))
        } catch {
          // PATCH: résultat mémorisé en best effort uniquement
        }
        setTimeline(tl)
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
    if (!result) return
    // PATCH: sauvegarde historique réservée aux membres, sans bloquer l'usage gratuit
    if (!user) {
      showSnack('Crée un compte pour sauvegarder cette cuisson et la retrouver plus tard.', 'info')
      navigate('/auth', { state: { from: '/app', reason: 'save-planning' } })
      return
    }
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

  // PATCH: partage rapide pour favoriser l'usage viral sans forcer la création de compte
  async function sharePlan() {
    if (!result) return
    setSharing(true)
    const text = `BBQ plan ${meatData?.full || result.meatLabel} · départ ${result.startTime} · service ${result.serve} · fumoir ${result.smokerTempC}°C`
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Mon planning BBQ',
          text,
          url: window.location.href,
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text} · ${window.location.href}`)
        showSnack('✓ Lien copié pour partager le planning')
      }
    } catch {
      // PATCH: le partage peut être annulé sans erreur visible
    }
    setSharing(false)
  }

  function downloadPlan() {
    if (!result) return
    const lines = [
      'Charbon & Flamme — Calculateur BBQ Pitmaster',
      '',
      `Viande: ${meatData?.full || result.meatLabel}`,
      `Poids: ${result.weightKg} kg`,
      `Fumoir: ${result.smokerTempC}°C`,
      `Service: ${result.serve}`,
      `Depart recommande: ${result.startTime}`,
      `Fin cuisson estimee: ${result.cookDoneTime}`,
      `Pret apres repos: ${result.readyAfterRestTime}`,
      `Fenetre de service: ${result.serviceWindowStart} -> ${result.serviceWindowEnd}`,
      '',
      'Repères de cuisson:',
      ...timeline.map((step) => {
        const content = getTimelineStepContent(step, result)
        return `- ${content.title}: ${content.action}`
      }),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bbq-plan-${result.meatKey || 'cook'}.txt`
    link.click()
    URL.revokeObjectURL(url)
    showSnack('✓ Planning téléchargé')
  }

  const phaseColor = p => p.isRest ? 'var(--blue)' : p.isStall ? 'var(--gold)' : 'var(--orange)'

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.22s ease both}
        .calc-seo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
        .calc-result-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
        .calc-sticky-cta{display:none}
        @media(max-width:900px){
          .calc-seo-grid{grid-template-columns:1fr}
          .calc-result-actions{grid-template-columns:1fr}
          .calc-sticky-cta{display:flex;position:fixed;left:12px;right:12px;bottom:76px;z-index:48}
        }
      `}</style>
      <Snack snack={snack} />

      {/* Entrée produit: plus simple et plus claire */}
      <div className="pm-hero-shell" style={{ marginBottom: 18 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, alignItems:'stretch' }}>
          <div>
            <div className="pm-kicker" style={{ marginBottom: 14 }}>Calculateur BBQ Pitmaster</div>
            <h1 style={{ fontSize:'clamp(30px,5vw,44px)', lineHeight:1.02, marginBottom:10 }}>
              Lance ta cuisson
              <br />
              <span style={{ color:'var(--ember)' }}>sans te perdre dans l’outil</span>
            </h1>
            <p style={{ fontSize:14, maxWidth:520, color:'var(--text2)' }}>
              Choisis la viande, règle ton fumoir, puis récupère un plan clair avec les vrais repères pitmaster. Rien de compliqué, rien d’inutile.
            </p>
            <div className="pm-grid-2" style={{ marginTop: 16 }}>
              <div className="pm-glow-pill">
                <div style={{ width: 36, height: 36, borderRadius: 12, background:'rgba(232,69,11,0.14)', border:'1px solid rgba(232,69,11,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🔥</div>
                <div>
                  <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', marginBottom:4 }}>Lecture immédiate</div>
                  <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:15, color:'var(--text)' }}>Départ net, service crédible</div>
                </div>
              </div>
              <div className="pm-glow-pill">
                <div style={{ width: 36, height: 36, borderRadius: 12, background:'rgba(245,166,35,0.10)', border:'1px solid rgba(245,166,35,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🧭</div>
                <div>
                  <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', marginBottom:4 }}>Parcours simple</div>
                  <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:15, color:'var(--text)' }}>Choisir, régler, calculer, cuire</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, display:'flex', gap:8, flexWrap:'wrap' }}>
              {[
                'Brisket',
                'Ribs',
                'Pulled pork',
                'Volaille',
              ].map(item => (
                <span key={item} style={{ padding:'6px 10px', borderRadius:999, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', fontSize:11, color:'var(--text2)', fontWeight:600 }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div style={{ position:'relative', minHeight:220, borderRadius:24, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
            <img
              src={MEAT_IMAGES[meatKey] || MEAT_IMAGES.brisket}
              alt={meatData?.full || 'BBQ'}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', filter:'saturate(.96) contrast(1.06)' }}
            />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(8,8,8,0.82) 0%, rgba(16,12,10,0.14) 56%, rgba(16,12,10,0.08) 100%)' }} />
            <div style={{ position:'absolute', top:14, right:14, display:'grid', gap:8 }}>
              <div style={{ padding:'8px 10px', borderRadius:14, background:'rgba(8,8,8,0.64)', border:'1px solid rgba(255,255,255,0.08)', backdropFilter:'blur(10px)' }}>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.62)', textTransform:'uppercase', marginBottom:3 }}>Fumoir</div>
                <div style={{ fontFamily:'DM Mono, monospace', fontWeight:700, fontSize:12, color:'#fff' }}>{smokerType}</div>
              </div>
              <div style={{ padding:'8px 10px', borderRadius:14, background:'rgba(8,8,8,0.64)', border:'1px solid rgba(255,255,255,0.08)', backdropFilter:'blur(10px)' }}>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.62)', textTransform:'uppercase', marginBottom:3 }}>Service</div>
                <div style={{ fontFamily:'DM Mono, monospace', fontWeight:700, fontSize:12, color:'#fff' }}>{serveTime.replace(':', 'h')}</div>
              </div>
            </div>
            <div style={{ position:'absolute', left:16, right:16, bottom:16 }}>
              <div className="pm-kicker" style={{ marginBottom: 10 }}>{meatData?.full || 'Cuisson low & slow'}</div>
              <div style={{ fontFamily:'Syne, sans-serif', fontSize:26, fontWeight:800, color:'#fff', lineHeight:1.05, marginBottom:6 }}>
                {smokerTemp}°C · {wrapType === 'none' ? 'Sans wrap' : wrapType === 'foil' ? 'Wrap alu' : 'Wrap papier'}
              </div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.82)', lineHeight:1.6 }}>
                Lecture compacte, pensée pour la vraie cuisson.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 }}>
          Outil mobile-first · plan simple · repères terrain · design pitmaster
        </p>
      </div>

      {/* VIANDE + PHOTO */}
      {renderSectionEyebrow('01', 'Choisis ta pièce', 'Commence par la viande. L’outil adapte ensuite la méthode, les repères et la roadmap.')}
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
                <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: 50, background: 'rgba(232,69,11,0.88)', fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>
                  🔥 {cookMethod === 'hot_and_fast' ? 'HOT & FAST' : 'LOW & SLOW'}
                </span>
              )}
            </div>
          </div>
        )}
        {/* Select viande */}
        <div style={{ padding: '12px 16px' }}>
          <label className="pm-field-label">Changer de viande</label>
          <select className="pm-input" value={meatKey} onChange={e => {
            const nextMeat = e.target.value
            const nextProfile = getCookingProfile(nextMeat)
            setMeatKey(nextMeat)
            setThickness('')
            if (nextProfile?.defaultWeightKg) setWeight(nextProfile.defaultWeightKg)
          }}>
            {Object.entries(MEAT_CATEGORIES).map(([cat, keys]) => (
              <optgroup key={cat} label={cat}>
                {keys.map(k => MEATS[k] ? <option key={k} value={k}>{MEATS[k].full}</option> : null)}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* POIDS & ÉPAISSEUR */}
      {renderSectionEyebrow('02', 'Règle ta cuisson', 'Poids, méthode, température et options utiles. Le reste doit rester simple.')}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="pm-card">
          <label className="pm-field-label">Poids (kg)</label>
          <input type="number" className="pm-input" value={weight} min="0.5" max="20" step="0.5"
            onChange={e => { setWeight(toFloat(e.target.value, 0)) }} />
          {(meatKey === 'ribs_pork' || meatKey === 'ribs_baby_back') && (
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 5, lineHeight: 1.5 }}>
              Sur les ribs, le type de rack et le rendu voulu comptent souvent plus que le poids exact.
            </div>
          )}
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
        <label className="pm-field-label">Méthode</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
          {COOKING_METHODS.filter(option => cookingProfile?.methods?.some(method => method.method === option.id)).map(option => (
            <button
              key={option.id}
              onClick={() => {
                setCookMethod(option.id)
                const nextConfig = getMethodConfig(meatKey, option.id)
                if (nextConfig?.smokerTempDefault) setSmokerTemp(nextConfig.smokerTempDefault)
              }}
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                cursor: 'pointer',
                textAlign: 'left',
                border: `1.5px solid ${cookMethod === option.id ? 'var(--orange-border)' : 'var(--border)'}`,
                background: cookMethod === option.id ? 'var(--orange-bg)' : 'var(--surface2)',
              }}
            >
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: cookMethod === option.id ? 'var(--orange)' : 'var(--text)' }}>
                {option.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, lineHeight: 1.5 }}>
                {option.short}
              </div>
            </button>
          ))}
        </div>
        {methodConfig?.notes && (
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
            {methodConfig.notes}
          </div>
        )}
      </div>

      {/* FUMOIR */}
      <div className="pm-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <label className="pm-field-label" style={{ marginBottom: 0 }}>T° fumoir (zone indirecte)</label>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 30, color: 'var(--orange)', display: 'block' }}>
              {formatTemperatureDisplay(smokerTemp, displayUnit)}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>
              {displayUnit === 'c' ? `${cToF(smokerTemp)}°F` : `${smokerTemp}°C`}
            </span>
          </div>
        </div>
        <input type="range" value={smokerTemp} min={tempRange[0]} max={tempRange[1]} step="1"
          onChange={e => { setSmokerTemp(toInt(e.target.value, 110)) }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>{tempRange[0]}°C · mini</span>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>{methodConfig?.smokerTempDefault ?? smokerTemp}°C · conseillé</span>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>{tempRange[1]}°C · maxi</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {[
            { id: 'c', label: 'Afficher en °C' },
            { id: 'f', label: 'Afficher en °F' },
          ].map(option => (
            <button
              key={option.id}
              onClick={() => setDisplayUnit(option.id)}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: 999,
                border: `1px solid ${displayUnit === option.id ? 'var(--orange-border)' : 'var(--border)'}`,
                background: displayUnit === option.id ? 'var(--orange-bg)' : 'var(--surface2)',
                color: displayUnit === option.id ? 'var(--orange)' : 'var(--text3)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* SERVICE */}
      <div className="pm-card">
        <label className="pm-field-label">Service à</label>
        <input type="time" className="pm-input" value={serveTime}
          onChange={e => { setServeTime(e.target.value) }} />
      </div>

      {meatKey === 'lamb_leg' && (
        <div className="pm-card">
          <label className="pm-field-label">Style du gigot</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { id: 'medium', title: 'Rosé / Medium', desc: 'Cible autour de 63°C, cuisson plus courte, belle tranche.' },
              { id: 'pulled', title: 'Effiloché', desc: 'Version poussée type épaule, plus longue et plus fondante.' },
            ].map(option => (
              <button
                key={option.id}
                onClick={() => setLambLegStyle(option.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: `1.5px solid ${lambLegStyle === option.id ? 'var(--orange-border)' : 'var(--border)'}`,
                  background: lambLegStyle === option.id ? 'var(--orange-bg)' : 'var(--surface2)',
                }}
              >
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: lambLegStyle === option.id ? 'var(--orange)' : 'var(--text)' }}>
                  {option.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5, lineHeight: 1.5 }}>
                  {option.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* WRAP */}
      {showWrapChoices && (
        <div className="pm-card">
          <label className="pm-field-label">Wrap pendant le low & slow</label>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10, lineHeight: 1.6 }}>
            Le wrap fait partie du low & slow. Choisis-le si tu veux raccourcir la fin de cuisson et lisser le stall.
          </div>
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
      {renderSectionEyebrow('03', 'Calcule ton plan', 'Un clic pour obtenir l’heure de départ, la fenêtre de service et les grands repères de cuisson.')}
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
          <div style={{ background: 'linear-gradient(180deg, rgba(24,24,24,0.98), rgba(12,12,12,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '22px 20px', marginBottom: 12, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--orange)', borderRadius: '20px 20px 0 0' }} />
            <div style={{ position:'absolute', inset:'auto -60px -60px auto', width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle, rgba(232,69,11,0.18), transparent 68%)', pointerEvents:'none' }} />
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Lancer le préchauffage</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 72, fontWeight: 800, lineHeight: 1, color: 'var(--ember)', letterSpacing: '-3px' }}>{result.startTime}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 10, lineHeight: 1.6 }}>
                Pour servir à {result.serve}, allume le fumoir vers {result.startTime} puis mets la viande vers {result.meatOnSmokerTime}.
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '14px', marginBottom: 12 }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 6, textAlign: 'center' }}>
                {getReadyWindowText(result)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, marginBottom: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Viande sur fumoir</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{result.meatOnSmokerTime}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Fin cuisson</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{result.cookDoneTime}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Prêt après repos</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{result.readyAfterRestTime}</div>
                </div>
              </div>
              <div style={{ paddingTop: 6 }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6, textAlign: 'center' }}>Fenêtre de service</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 15, color: 'var(--text)', fontWeight: 700, textAlign: 'center' }}>
                  {result.serviceWindowStart} → {result.serviceWindowEnd}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Méthode</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{result.methodVariantLabel || result.methodLabel}</div>
              </div>
              {getHeroCues(result, displayUnit).map(cue => (
                <div key={cue.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>{cue.label}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{cue.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 10 }}>
              {[
                ['Cuisson', formatDuration(result.cookMin)],
                ['Repos', formatDuration(result.restMin)],
                ['Total', formatDuration(result.totalMin)],
              ].map(([label, value]) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PATCH: actions secondaires, après les repères de cuisson */}
          <div className="pm-card" style={{ marginBottom: 12 }}>
            <div className="pm-sec-label">⚡ Actions rapides</div>
            <div className="calc-result-actions">
              <button onClick={sharePlan} disabled={sharing} className="pm-btn-secondary">
                {sharing ? '⏳...' : '📤 Partager'}
              </button>
              <button onClick={saveSession} disabled={saving} className="pm-btn-primary">
                {saving ? '⏳...' : user ? '☁️ Sauvegarder' : '🔐 Sauvegarder'}
              </button>
              <button onClick={downloadPlan} className="pm-btn-secondary">
                ⬇ Télécharger
              </button>
            </div>
            {!user && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                Tu peux utiliser l’outil sans compte. Pour garder tes plannings, ton historique et reprendre plus tard, il faut créer un compte.
              </div>
            )}
          </div>


          {/* PATCH: roadmap visuelle branchée sur la méthode choisie */}
          <div className="pm-roadmap-shell" style={{ marginBottom: 12 }}>
            <div className="pm-sec-label">🗺️ Roadmap cuisson</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12, lineHeight: 1.6, padding:'0 18px 0 18px' }}>
              Une feuille de route simple pour savoir quoi faire du préchauffage au service.
            </div>
            {roadmap.map((step, i) => (
              <div key={step.id} className="pm-roadmap-step" style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(180deg, rgba(232,69,11,0.22), rgba(232,69,11,0.08))', border: '1px solid var(--orange-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow:'0 0 20px rgba(232,69,11,0.12)' }}>
                  {step.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <div style={{ fontSize:9, color:'var(--text4)', textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:4 }}>
                        Étape {String(i + 1).padStart(2, '0')}
                      </div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{step.title}</div>
                    </div>
                    {step.time && (
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 700, color: 'var(--ember)', whiteSpace: 'nowrap', padding:'6px 8px', borderRadius:999, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
                        {step.time}
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
                    {step.caption}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TIMELINE */}
          <div className="pm-card" style={{ marginBottom: 12 }}>
            <div className="pm-sec-label">📋 Repères de cuisson</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12, lineHeight: 1.6 }}>
              Ce bloc te dit quoi surveiller, ce que ça veut dire et quoi faire. Pas d’horaires fixes entre les étapes.
            </div>
            {timeline.map((step, i) => {
              const content = getTimelineStepContent(step, result)
              const guide = getStepGuide(content)
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '10px 1fr', gap: '0 10px', padding: '9px 0', position: 'relative' }}>
                  {i < timeline.length - 1 && <div style={{ position: 'absolute', left: 4, top: 24, bottom: -9, width: 1, background: 'var(--border)' }} />}
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: phaseColor(step), marginTop: 4, justifySelf: 'center', boxShadow: `0 0 6px ${phaseColor(step)}60` }} />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text)', lineHeight: 1.3 }}>{guide.watch}</div>
                      {getStepTemperatureBadge(step, result, displayUnit) && (
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--text3)', flexShrink: 0 }}>
                          {getStepTemperatureBadge(step, result, displayUnit)}
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: 6, display: 'grid', gap: 6 }}>
                      <div style={{ padding: '7px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                        <strong style={{ color: 'var(--text2)' }}>Ce que ça veut dire :</strong> {guide.meaning}
                      </div>
                      <div style={{ padding: '7px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                        <strong style={{ color: 'var(--orange)' }}>Quoi faire :</strong> {guide.action}
                      </div>
                    </div>
                    {step.visualCueNote && (
                      <div style={{ marginTop: 6, padding: '4px 10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>
                        👀 Repère visuel : {step.visualCueNote}
                      </div>
                    )}
                    {step.targetTempNote && (
                      <div style={{ marginTop: 6, padding: '4px 10px', background: 'var(--orange-bg)', border: '1px solid var(--orange-border)', borderRadius: 8, fontSize: 11, color: 'var(--orange)', fontWeight: 600 }}>
                        🌡️ Repère température : {step.targetTempNote}
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
                          { l: 'Basse', v: recalResult.remainingOptimistic, c: 'var(--green)' },
                          { l: 'Repère', v: recalResult.remainingMin, c: 'var(--orange)' },
                          { l: 'Haute', v: recalResult.remainingPrudent, c: 'var(--red)' },
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
            <button onClick={() => {
                setResult(null); setWarnings([]); setRecalResult(null)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }} className="pm-btn-secondary">
              ↩ Nouveau calcul
            </button>
            <button onClick={() => {
              // PATCH: la session se transmet par navigation + brouillon sessionStorage, pour limiter la fragilité du state seul
              const sessionPayload = {
                schedule: { ...result },
                startedAt: new Date().toISOString(),
              }
              savePendingSession(sessionPayload)
              navigate('/app/session', { state: sessionPayload })
            }} style={{ width: '100%', padding: '14px', borderRadius: 50, border: 'none',
              background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff',
              fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              🔴 Lancer la session
            </button>
          </div>
        </div>
      )}

      <div className="calc-sticky-cta">
        <button onClick={calculate} disabled={loading} className="pm-btn-primary" style={{ width: '100%', padding: '15px 20px' }}>
          {loading ? 'Calcul...' : 'Calculer'}
        </button>
      </div>
    </div>
  )
}
