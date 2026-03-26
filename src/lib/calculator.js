/**
 * ════════════════════════════════════════════════════════════════
 * PITMASTER ENGINE v8 — planificateur BBQ heuristique
 * ════════════════════════════════════════════════════════════════
 *
 * Ce moteur combine :
 *   - épaisseur, poids, température fumoir et type de smoker
 *   - phases pitmaster (formation bark, stall, finition, repos)
 *   - heuristiques viande par viande pour rester crédible sur le terrain
 *
 * Important :
 *   - ce n'est pas un modèle scientifique absolu
 *   - les sorties sont des estimations robustes pour la cuisson réelle
 *   - l'UI simplifie ensuite ces données pour guider l'utilisateur
 * ════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────
// LOIS PHYSIQUES
// ─────────────────────────────────────────────────────────────

const thicknessF = (cm) => Math.pow(cm / 10, 0.5)   // base 10cm
const weightF    = (kg) => Math.pow(kg / 4,  0.35)   // base 4kg
const pitTempF   = (t)  => Math.exp(-0.012 * (t - 120)) // base 120°C

// PATCH: helpers défensifs pour garder des entrées et durées cohérentes
function toFiniteNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

// PATCH: parse explicite des entrées UI pour éviter les NaN silencieux
function parseNumericInput(value, fallback = null) {
  if (value === null || value === undefined || value === '') return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

// PATCH: borne centralisée simple
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// PATCH: durées entières et toujours positives
function normalizeDuration(value, fallback = 0, min = 0) {
  return Math.max(min, Math.round(toFiniteNumber(value, fallback)))
}

// PATCH: protège les coefficients et facteurs contre les excès
function safeFactor(value, fallback = 1, min = 0.25, max = 3) {
  return clamp(toFiniteNumber(value, fallback), min, max)
}

// PATCH: protège les quantités positives utilisées par le moteur
function safePositive(value, fallback, min = 0.1, max = Number.POSITIVE_INFINITY) {
  const n = toFiniteNumber(value, fallback)
  return clamp(n, min, max)
}

// PATCH: garde les phases cohérentes avec leur total final
function rebalancePhaseDurations(totalMin, rawPhases, minimums = []) {
  const safeTotal = normalizeDuration(totalMin, 0)
  const mins = rawPhases.map((_, index) => normalizeDuration(minimums[index], 0))
  const result = rawPhases.map((value, index) => Math.max(normalizeDuration(value, 0), mins[index]))

  let currentTotal = result.reduce((sum, value) => sum + value, 0)
  if (safeTotal <= 0) return result.map(() => 0)
  if (currentTotal === safeTotal) return result

  if (currentTotal < safeTotal) {
    let deficit = safeTotal - currentTotal
    const weights = rawPhases.map((value, index) => Math.max(toFiniteNumber(value, result[index]), 1))
    const weightSum = weights.reduce((sum, value) => sum + value, 0) || weights.length

    weights.forEach((weight, index) => {
      const share = index === weights.length - 1 ? deficit : Math.floor((safeTotal - currentTotal) * (weight / weightSum))
      result[index] += share
      deficit -= share
    })

    let cursor = 0
    while (deficit > 0 && result.length > 0) {
      result[cursor % result.length] += 1
      deficit -= 1
      cursor += 1
    }

    return result
  }

  let overflow = currentTotal - safeTotal
  while (overflow > 0) {
    let moved = false
    for (let i = result.length - 1; i >= 0 && overflow > 0; i -= 1) {
      if (result[i] > mins[i]) {
        result[i] -= 1
        overflow -= 1
        moved = true
      }
    }
    if (!moved) break
  }

  return result
}

// ─────────────────────────────────────────────────────────────
// COEFFICIENTS DE CALIBRATION
// ─────────────────────────────────────────────────────────────

export const BASE_COEFFS = {
  // Smoker — offset = référence (convection maximale)
  smoker: { offset:1.00, pellet:0.97, kamado:1.05, electric:1.05, kettle:1.02 },

  // PATCH: effet spécifique du smoker sur le stall / évaporation
  smokerStall: { offset:1.07, pellet:1.00, kamado:0.92, electric:0.97, kettle:1.02 },

  // Persillage
  marbling: { high:0.95, medium:1.00, low:1.05 },

  // Wrap — agit sur le stall uniquement
  // PATCH: coefficients wrap adoucis pour rester réalistes sur le terrain
  wrap: { none:1.00, butcher_paper:0.78, foil:0.58, foil_boat:0.66 },

  // PATCH: léger effet du wrap sur la fin de cuisson sans suraccélérer
  wrapFinish: { none:1.02, butcher_paper:0.99, foil:0.94, foil_boat:0.97 },

  // T° pit — interpolation (base 120°C)
  pit: { 100:1.45, 110:1.22, 120:1.00, 130:0.82, 140:0.67 },
}

// ─────────────────────────────────────────────────────────────
// BASES PAR VIANDE
// calibrées sur : 4kg, 10cm, 120°C, offset, no wrap (minutes)
// ─────────────────────────────────────────────────────────────

export const PHASE_BASES = {
  // ── BŒUF ────────────────────────────────────────────────
  brisket: {
    label:'Brisket', baseMin:720,
    stallStartC:65, targetC:95, wrapTempC:74,
    collagenTarget:650, rest:120, restMax:300,
    // PATCH: brisket = référence, très sensible à l'épaisseur et au hold
    thicknessExp:0.76, weightExp:0.30, stallFactor:1.14, finishFactor:1.05, restFactor:1.22, uncertainty:1.15,
    p1:0.25, st:0.35, p3:0.40,
  },
  ribs_beef: {
    label:'Beef Ribs', baseMin:600,
    stallStartC:66, targetC:96, wrapTempC:null,
    collagenTarget:750, rest:45, restMax:120,
    // PATCH: proche brisket mais plus homogène et plus stable
    thicknessExp:0.70, weightExp:0.29, stallFactor:0.98, finishFactor:1.02, restFactor:0.98, uncertainty:1.03,
    p1:0.25, st:0.35, p3:0.40,
  },
  paleron: {
    label:'Paleron / Chuck', baseMin:540,
    stallStartC:64, targetC:92, wrapTempC:72,
    collagenTarget:600, rest:60, restMax:180,
    // PATCH: intermédiaire entre brisket et shoulder, finition importante
    thicknessExp:0.68, weightExp:0.33, stallFactor:0.98, finishFactor:1.05, restFactor:1.03, uncertainty:1.06,
    p1:0.25, st:0.35, p3:0.40,
  },
  plat_de_cote: {
    label:'Plat de Côte', baseMin:570,
    stallStartC:65, targetC:93, wrapTempC:73,
    collagenTarget:620, rest:45, restMax:120,
    // PATCH: logique collagène utile mais un peu moins capricieuse qu'un brisket
    thicknessExp:0.70, weightExp:0.31, stallFactor:1.00, finishFactor:1.04, restFactor:0.92, uncertainty:1.04,
    p1:0.25, st:0.35, p3:0.40,
  },
  // ── PORC ────────────────────────────────────────────────
  pork_shoulder: {
    label:'Épaule de porc (Pulled Pork)', baseMin:530,
    stallStartC:65, targetC:95, wrapTempC:68,
    collagenTarget:550, rest:60, restMax:180,
    // PATCH: vraie stall, mais plus tolérante qu'un brisket
    thicknessExp:0.66, weightExp:0.37, stallFactor:1.04, finishFactor:0.99, restFactor:1.06, uncertainty:1.08,
    p1:0.25, st:0.35, p3:0.40,
  },
  ribs_pork: {
    label:'Spare Ribs', baseMin:360,
    stallStartC:63, targetC:71, wrapTempC:null,
    collagenTarget:180, rest:15, restMax:60,
    // PATCH: ribs porc = logique visuelle/mécanique, stall secondaire et fenêtre plus serrée
    thicknessExp:0.58, weightExp:0.25, stallFactor:0.46, finishFactor:0.93, restFactor:0.75, uncertainty:0.86,
    p1:0.58, st:0.16, p3:0.26,
  },
  ribs_baby_back: {
    label:'Baby Back Ribs', baseMin:285,
    stallStartC:63, targetC:71, wrapTempC:null,
    collagenTarget:150, rest:10, restMax:45,
    // PATCH: baby back plus rapides, peu dominées par le stall
    thicknessExp:0.54, weightExp:0.22, stallFactor:0.38, finishFactor:0.91, restFactor:0.70, uncertainty:0.82,
    p1:0.60, st:0.13, p3:0.27,
  },
  // ── AGNEAU ──────────────────────────────────────────────
  lamb_shoulder: {
    label:"Épaule d'agneau", baseMin:420,
    stallStartC:64, targetC:90, wrapTempC:75,
    collagenTarget:450, rest:30, restMax:90,
    // PATCH: un peu plus rapide qu'une pork shoulder
    thicknessExp:0.64, weightExp:0.33, stallFactor:0.86, finishFactor:0.95, restFactor:0.88, uncertainty:0.95,
    p1:0.25, st:0.35, p3:0.40,
  },
}

// PATCH: lecture sûre des profils viande sans casser la forme historique de PHASE_BASES
function getMeatProfile(meatBase) {
  return {
    thicknessExp: safeFactor(meatBase.thicknessExp ?? 0.68, 0.68, 0.45, 0.9),
    weightExp: safeFactor(meatBase.weightExp ?? 0.35, 0.35, 0.15, 0.45),
    stallFactor: safeFactor(meatBase.stallFactor ?? 1.0, 1.0, 0.25, 1.3),
    finishFactor: safeFactor(meatBase.finishFactor ?? 1.0, 1.0, 0.85, 1.15),
    restFactor: safeFactor(meatBase.restFactor ?? 1.0, 1.0, 0.65, 1.35),
    uncertainty: safeFactor(meatBase.uncertainty ?? 1.0, 1.0, 0.75, 1.25),
  }
}

function isRibsCook(meatKey) {
  return meatKey === 'ribs_pork' || meatKey === 'ribs_baby_back'
}

// ─────────────────────────────────────────────────────────────
// SCORE COLLAGÈNE — Intégrale thermique (pts/min)
// Source : Pearce (2011) Meat Science + Meathead/Blonder
// ─────────────────────────────────────────────────────────────

export function collagenRate(tempC) {
  // PATCH: échelle simple et modérée pour rester utile sans devenir un oracle
  if (tempC < 70) return 0
  if (tempC < 80) return 0.5
  if (tempC < 88) return 1.5
  return 4.0
}

function calcCollagenScore(p1Min, stallMin, p3Min, stallC, targetC) {
  let score = 0
  for (let i = 0; i < p1Min; i++)
    score += collagenRate(4 + (stallC - 4) * (i / Math.max(p1Min, 1)))
  score += collagenRate(stallC || 65) * stallMin
  for (let i = 0; i < p3Min; i++)
    score += collagenRate((stallC || 65) + (targetC - (stallC || 65)) * (i / Math.max(p3Min, 1)))
  return Math.round(score)
}

// ─────────────────────────────────────────────────────────────
// ESTIMATION ÉPAISSEUR depuis le poids
// ─────────────────────────────────────────────────────────────

export function estimateThickness(weightKg, meatKey) {
  // PATCH: protège l'estimation contre les poids invalides
  const safeWeightKg = safePositive(weightKg, 4, 0.25, 30)
  const r = {
    brisket:{l:3.5,w:2.0}, pork_shoulder:{l:1.8,w:1.5},
    ribs_beef:{l:3.0,w:1.5}, paleron:{l:2.5,w:1.8},
    plat_de_cote:{l:3.0,w:1.6}, joue_boeuf:{l:1.5,w:1.3},
    lamb_shoulder:{l:1.8,w:1.5}, pork_belly:{l:3.0,w:1.8},
  }[meatKey] || {l:2.0,w:1.5}
  const base = Math.cbrt((6*safeWeightKg/1050)/(Math.PI*r.l*r.w))*100
  // Brisket packer (point+flat) : un peu plus épais que le modèle simple
  return +clamp(meatKey === 'brisket' ? base * 1.18 : base, 1.5, 25).toFixed(1)
}

// ─────────────────────────────────────────────────────────────
// CALCUL PRINCIPAL — LOW & SLOW
// ─────────────────────────────────────────────────────────────

export function calculateLowSlow(meatKey, weightKg, options = {}, approvedAdjustments = {}) {
  const {
    thicknessCm: ti = null,
    smokerTempC  = 120,
    smokerType   = 'offset',
    wrapType     = 'butcher_paper',
    marbling     = 'medium',
    waterPan     = false,
    restMinOverride = null,
  } = options

  const m = PHASE_BASES[meatKey]
  if (!m) throw new Error('Viande inconnue : ' + meatKey)

  // PATCH: normalisation stricte des entrées pour éviter NaN et valeurs incohérentes
  const safeWeightKg = safePositive(weightKg, 4, 0.25, 30)
  const safeThicknessInput = parseNumericInput(ti, null)
  const thicknessCm = clamp(safeThicknessInput ?? estimateThickness(safeWeightKg, meatKey), 1.5, 25)
  const safeSmokerTempC = clamp(toFiniteNumber(smokerTempC, 120), 80, 180)
  const meatProfile = getMeatProfile(m)
  const thicknessRatio = clamp(thicknessCm / 10, 0.35, 2.6)
  const weightRatio = clamp(safeWeightKg / 4, 0.2, 3.2)

  // Coefficients
  // PATCH: épaisseur et poids bornés, avec profils spécifiques par viande
  const cT  = safeFactor(Math.pow(thicknessRatio, meatProfile.thicknessExp), thicknessF(thicknessCm), 0.35, 2.2)
  const cW  = safeFactor(Math.pow(weightRatio, meatProfile.weightExp), weightF(safeWeightKg), 0.60, 1.70)
  const cP  = safeFactor(pitTempF(safeSmokerTempC), 1.0, 0.45, 1.70)
  const cS  = safeFactor(BASE_COEFFS.smoker[smokerType] ?? 1.0, 1.0, 0.80, 1.25)
  const cStSmoker = safeFactor(BASE_COEFFS.smokerStall[smokerType] ?? 1.0, 1.0, 0.82, 1.18)
  const cM  = safeFactor(BASE_COEFFS.marbling[marbling] ?? 1.0, 1.0, 0.90, 1.10)
  const cWr = safeFactor(BASE_COEFFS.wrap[wrapType] ?? 1.0, 1.0, 0.50, 1.20)
  const cWrFinish = safeFactor(BASE_COEFFS.wrapFinish[wrapType] ?? 1.0, 1.0, 0.88, 1.05)
  // PATCH: water pan à effet modéré
  const cWater = waterPan ? 1.08 : 1.0

  // Ajustements approuvés admin (final = base × adj)
  const adj = approvedAdjustments
  const adjG = safeFactor(adj.global ?? 1.0, 1.0, 0.70, 1.30)
  const adjP1 = safeFactor((adj[meatKey]?.p1 ?? 1.0) * adjG, 1.0, 0.60, 1.50)
  const adjSt = safeFactor((adj[meatKey]?.st ?? 1.0) * adjG, 1.0, 0.60, 1.50)
  const adjP3 = safeFactor((adj[meatKey]?.p3 ?? 1.0) * adjG, 1.0, 0.60, 1.50)

  // PATCH: no-wrap sur grosse pièce un peu plus lent, sans explosion artificielle
  const cBigNoWrap = (wrapType === 'none' && safeWeightKg > 7) ? 1.10 : 1.0
  // PATCH: pénalité épaisseur/no-wrap adoucie et bornée
  const cThickNoWrap = wrapType === 'none'
    ? clamp(1 + Math.max(thicknessCm - 10, 0) * 0.015, 1, 1.18)
    : 1.0

  // Phases
  const rawPhase1Min = m.baseMin * m.p1 * cT * cW * cP * cS * cM * adjP1
  const rawStallMin  = m.baseMin * m.st * cT * cP * cStSmoker * cWr * cWater * cBigNoWrap * cThickNoWrap * meatProfile.stallFactor * adjSt
  const rawPhase3Base = m.baseMin * m.p3 * cT * cW * cP * cS * cM * cWrFinish * meatProfile.finishFactor * adjP3

  let phase1Min = normalizeDuration(rawPhase1Min, 0, 1)
  let stallMin  = normalizeDuration(rawStallMin, 0, m.st > 0 ? 1 : 0)
  let phase3Min = normalizeDuration(rawPhase3Base, 0, 1)

  // PATCH: collagène utile surtout pour les grosses pièces riches en tissu conjonctif
  const collagenBaseScore = calcCollagenScore(phase1Min, stallMin, phase3Min, m.stallStartC, m.targetC)
  const collagenImportance = isRibsCook(meatKey) ? 0.25 : meatKey === 'lamb_shoulder' ? 0.75 : 1.0
  if (m.collagenTarget > 0 && collagenImportance > 0 && collagenBaseScore < m.collagenTarget) {
    const deficit = m.collagenTarget - collagenBaseScore
    const rate = collagenRate(m.targetC - 2)
    const extensionCap = isRibsCook(meatKey) ? 18 : 90
    const extension = Math.round((deficit / Math.max(rate, 0.5)) * collagenImportance)
    phase3Min += clamp(extension, isRibsCook(meatKey) ? 0 : 5, extensionCap)
  }

  // PATCH: recalage des phases pour garder un total cohérent et réaliste
  const rawCookMin = phase1Min + stallMin + phase3Min
  const minCookMin = Math.round(m.baseMin * (isRibsCook(meatKey) ? 0.65 : 0.55))
  const maxCookMin = Math.round(m.baseMin * (isRibsCook(meatKey) ? 1.70 : 2.40))
  const cookMin = clamp(normalizeDuration(rawCookMin, m.baseMin, 1), minCookMin, maxCookMin)
  ;[phase1Min, stallMin, phase3Min] = rebalancePhaseDurations(cookMin, [phase1Min, stallMin, phase3Min], [1, m.st > 0 ? 1 : 0, 1])

  // PATCH: repos plus sérieux sur brisket / shoulder, plus court sur ribs
  const restBase = restMinOverride == null ? m.rest * meatProfile.restFactor : parseNumericInput(restMinOverride, m.rest)
  const restMin = clamp(normalizeDuration(restBase, m.rest, 0), 0, m.restMax ?? Math.max(m.rest, 240))

  // PATCH: buffer prudent mais moins dogmatique, piloté par la pièce et le contexte
  const bufferPct = clamp(
    (isRibsCook(meatKey) ? 0.07 : 0.10)
      + (wrapType === 'none' ? 0.02 : 0)
      + (smokerType === 'offset' ? 0.02 : 0)
      + (waterPan ? 0.01 : 0),
    isRibsCook(meatKey) ? 0.05 : 0.08,
    isRibsCook(meatKey) ? 0.12 : 0.18
  )
  const bufferMin = normalizeDuration(cookMin * bufferPct, 0, isRibsCook(meatKey) ? 5 : 10)
  const totalMin  = cookMin + bufferMin + restMin

  const collagenFinal = calcCollagenScore(phase1Min, stallMin, phase3Min, m.stallStartC, m.targetC)

  // PATCH: fenêtres probabilistes plus crédibles selon la viande
  const variancePct = clamp(
    (7 * meatProfile.uncertainty)
      + (wrapType === 'none' ? 3 : 0)
      + (safeSmokerTempC < 110 ? 2 : 0)
      + (safeWeightKg > 7 ? 2 : 0)
      + (isRibsCook(meatKey) ? -2 : 0),
    isRibsCook(meatKey) ? 5 : 7,
    isRibsCook(meatKey) ? 12 : 18
  )
  const optimisticCookMin = Math.max(Math.round(cookMin * (1 - variancePct / 100)), Math.round(cookMin * 0.82))
  const prudentCookMin = Math.max(Math.round(cookMin * (1 + variancePct / 100)), cookMin)
  const optimisticMin = Math.min(optimisticCookMin + bufferMin + restMin, totalMin)
  const prudentMin = Math.max(prudentCookMin + bufferMin + restMin, totalMin)

  return {
    meatKey, meatLabel: m.label, weightKg: safeWeightKg,
    thicknessCm, smokerTempC: safeSmokerTempC, smokerType, wrapType, marbling, waterPan,

    phase1Min, stallMin, phase3Min, cookMin, bufferMin, restMin, totalMin,

    optimisticMin,
    probableMin: totalMin,
    prudentMin,
    varianceMin: Math.max(Math.round(cookMin * (variancePct / 100)), isRibsCook(meatKey) ? 15 : 20),
    variancePct,

    targetTempC:  m.targetC,
    targetC:      m.targetC,
    wrapTempC:    m.wrapTempC,
    stallStartC:  m.stallStartC,
    stallStartMin: phase1Min,
    wrapRecommendedAtMin: m.wrapTempC ? phase1Min : null,

    collagenScore: collagenFinal,
    collagenTarget: m.collagenTarget,
    collagenRequired: m.collagenTarget,
    collagenOk:    collagenFinal >= m.collagenTarget,

    coeffs: {
      cT:+cT.toFixed(3), cW:+cW.toFixed(3), cP:+cP.toFixed(3),
      cS, cStSmoker, cM, cWr, cWrFinish, cWater, cBigNoWrap, cThickNoWrap,
    },
  }
}

// ─────────────────────────────────────────────────────────────
// TIMELINE PAR PHASES
// ─────────────────────────────────────────────────────────────

export function buildTimeline(calc, smokerTempC) {
  const { meatKey, phase1Min, stallMin, phase3Min, restMin, wrapTempC, wrapType } = calc
  const targetTempC = toFiniteNumber(calc.targetTempC ?? calc.targetC, null)
  const safeSmokerTempC = clamp(toFiniteNumber(smokerTempC ?? calc.smokerTempC, 120), 80, 180)
  const safePhase1Min = normalizeDuration(phase1Min, 0)
  const safeStallMin = normalizeDuration(stallMin, 0)
  const safePhase3Min = normalizeDuration(phase3Min, 0)
  const safeRestMin = normalizeDuration(restMin, 0)
  const phases = []

  // PATCH: timeline dédiée ribs = visuelle et mécanique, pas mini-brisket
  if (isRibsCook(meatKey)) {
    phases.push({
      id:'phase1', label:'Bark / couleur',
      durationMin: safePhase1Min,
      description: `Fumoir à ${safeSmokerTempC}°C stable. Laisse la couleur se construire et surveille le début de pullback sur les os.`,
      targetTempNote: wrapType !== 'none' ? 'Quand la couleur te plaît, tu peux emballer pour assouplir la fin de cuisson.' : 'Laisse continuer jusqu’à une belle couleur et un léger retrait sur l’os.',
      checkpoint: 'bark_check',
    })

    if (safeStallMin > 0) {
      phases.push({
        id:'stall', label:'Pullback / rétractation',
        durationMin: safeStallMin, isStall: true,
        description: wrapType !== 'none'
          ? `Le rythme peut ralentir un peu. Sur les ribs, ce repère sert surtout à observer la couleur, le retrait sur l'os et décider si le wrap reste utile.`
          : `Le rythme ralentit parfois légèrement, mais sur les ribs on se fie surtout à la couleur, au retrait sur l’os et à la souplesse du rack.`,
        targetTempNote: wrapType !== 'none' ? 'Wrap (emballage) si la couleur et la texture te conviennent.' : 'Continue à nu si tu veux une bark plus marquée.',
        wrapAt: wrapTempC,
        checkpoint: wrapType === 'none' ? 'bark_check' : 'wrap_confirm',
      })
    }

    phases.push({
      id:'phase3', label:'Flex test / détachement',
      durationMin: safePhase3Min,
      description: `Cherche un rack souple qui plie nettement avec une légère fissure en surface. Le flex test et le retrait sur l’os comptent plus qu’une sonde ou un chiffre exact.`,
      targetTempNote: 'Vérifie la souplesse du rack et le retrait de viande sur l’os avant de servir.',
      checkpoint: 'probe_test',
    })

    phases.push({
      id:'repos', label:'Repos court / service',
      durationMin: safeRestMin, isRest: true,
      description: `Laisse reposer quelques minutes pour stabiliser les jus, puis tranche et sers pendant que la texture est encore idéale.`,
    })

    return phases
  }

  phases.push({
    id:'phase1', label:'Bark en formation',
    durationMin: safePhase1Min,
    description: `Fumoir à ${safeSmokerTempC}°C stable. Laisse la bark se former et évite d’ouvrir inutilement.`,
    targetTempNote: wrapTempC ? `Objectif : ${wrapTempC}°C interne pour préparer le wrap.` : null,
    checkpoint: 'stall_check',
  })

  if (safeStallMin > 0) {
    phases.push({
      id:'stall', label:`Stall (ralentissement normal)`,
      durationMin: safeStallMin, isStall: true,
      description: wrapType !== 'none'
        ? `La montée en température ralentit, c’est normal. Le wrap aide à limiter l’évaporation et à rendre la fin de cuisson plus régulière.`
        : `La viande ralentit car l’évaporation refroidit sa surface. Ne panique pas et évite de surcorriger le fumoir.`,
      targetTempNote: wrapTempC ? `Wrapper à ${wrapTempC}°C` : null,
      wrapAt: wrapTempC,
      checkpoint: 'wrap_confirm',
    })
  }

  phases.push({
    id:'phase3', label:'Finition / test de tendreté',
    durationMin: safePhase3Min,
    description: `La viande entre dans la vraie zone de tendreté. La sonde doit glisser presque comme dans du beurre, plus important que le chiffre exact.`,
    targetTempNote: targetTempC ? `Commence les tests de sonde vers ${targetTempC}°C.` : 'Commence les tests de sonde régulièrement en fin de cuisson.',
    checkpoint: 'probe_test',
  })

  phases.push({
    id:'repos', label:'Rest / Hold (repos)',
    durationMin: safeRestMin, isRest: true,
    description: `Repos ou maintien au chaud : les jus se redistribuent et le service devient plus facile. Sur brisket, shoulder et chuck, cette étape compte vraiment.`,
  })

  return phases
}

// ─────────────────────────────────────────────────────────────
// RECALAGE DYNAMIQUE (capteur humain)
// ─────────────────────────────────────────────────────────────

export function recalibrate(calc, currentTempC, elapsedMin, currentPitTempC = null) {
  // PATCH: entrées sécurisées et aliases compatibles front
  const phase1Min = normalizeDuration(calc.phase1Min, 0)
  const stallMin = normalizeDuration(calc.stallMin, 0)
  const phase3Min = normalizeDuration(calc.phase3Min, 0)
  const cookMin = Math.max(normalizeDuration(calc.cookMin, phase1Min + stallMin + phase3Min), phase1Min + stallMin + phase3Min)
  const bufferMin = normalizeDuration(calc.bufferMin, 0)
  const restMin = normalizeDuration(calc.restMin, 0)
  const targetTempC = toFiniteNumber(calc.targetTempC ?? calc.targetC, null)
  const stallStartC = toFiniteNumber(calc.stallStartC, 65)
  const basePitTempC = clamp(toFiniteNumber(calc.smokerTempC, 120), 80, 180)
  const safeCurrentTempC = parseNumericInput(currentTempC, null)
  const safeElapsedMin = normalizeDuration(parseNumericInput(elapsedMin, 0), 0)
  const safeCurrentPitTempC = parseNumericInput(currentPitTempC, null)

  // PATCH: fallback exploitable si la mesure est absente ou invalide
  if (safeCurrentTempC === null) {
    const remaining = Math.max(cookMin - safeElapsedMin, 0)
    return {
      elapsedMin: safeElapsedMin,
      currentTempC: null,
      expectedTempC: null,
      deviation: null,
      speedRatio: 1,
      correction: 1,
      currentPhase: 'Mesure manquante',
      variancePct: isRibsCook(calc.meatKey) ? 10 : 15,
      remainingCookMin: remaining,
      remainingMin: remaining,
      remainingTotalMin: remaining + bufferMin + restMin,
      remainingOptimistic: remaining + bufferMin + restMin,
      remainingPrudent: remaining + bufferMin + restMin,
      isAhead: false,
      isBehind: false,
      isAheadOfSchedule: false,
      isBehindSchedule: false,
      alert: 'Température interne absente ou invalide.',
      action: 'Renseigne une mesure réelle pour recalculer le temps restant.',
    }
  }

  let expectedTempC = stallStartC
  let currentPhase  = 'Montée initiale'
  let variancePct   = isRibsCook(calc.meatKey) ? 10 : 15

  if (safeElapsedMin <= phase1Min) {
    expectedTempC = 4 + (stallStartC - 4) * (safeElapsedMin / Math.max(phase1Min, 1))
    currentPhase  = isRibsCook(calc.meatKey) ? 'Bark / couleur' : 'Bark en formation'
  } else if (safeElapsedMin <= phase1Min + stallMin) {
    expectedTempC = stallStartC
    currentPhase  = isRibsCook(calc.meatKey) ? 'Pullback / ralentissement' : 'Stall — ralentissement normal'
    variancePct   = isRibsCook(calc.meatKey) ? 12 : 20
  } else {
    const safeTargetTempC = targetTempC ?? Math.max(stallStartC + 20, 90)
    const progress = Math.min((safeElapsedMin - phase1Min - stallMin) / Math.max(phase3Min, 1), 1)
    expectedTempC = stallStartC + progress * (safeTargetTempC - stallStartC)
    currentPhase  = isRibsCook(calc.meatKey) ? 'Finition / flex test' : 'Finition / test de tendreté'
    variancePct   = isRibsCook(calc.meatKey) ? 8 : 10
  }

  const normalizedCurrentTempC = clamp(safeCurrentTempC, Math.max(stallStartC - 5, 40), (targetTempC ?? 98) + 5)
  const speedRatio = clamp(Math.max(normalizedCurrentTempC - 4, 0.5) / Math.max(expectedTempC - 4, 0.5), 0.55, 1.55)
  const correction = clamp(1 / speedRatio, 0.72, 1.35)

  let pitCorr = 1.0
  if (safeCurrentPitTempC !== null && Math.abs(safeCurrentPitTempC - basePitTempC) > 5) {
    pitCorr = clamp(pitTempF(basePitTempC) / pitTempF(clamp(safeCurrentPitTempC, 80, 180)), 0.85, 1.20)
  }

  const remainingCook = Math.max(cookMin - safeElapsedMin, 0)
  // PATCH: pendant le stall, on corrige plus doucement pour éviter les sur-réactions
  const phaseSmoothing = currentPhase.includes('Stall') || currentPhase.includes('ralentissement')
    ? 0.55
    : currentPhase.includes('Finition')
      ? 0.80
      : 0.70
  const effectiveCorrection = 1 + ((correction * pitCorr) - 1) * phaseSmoothing
  const recalCook = normalizeDuration(remainingCook * effectiveCorrection, remainingCook)
  const delayMin = Math.round(recalCook - remainingCook)

  let alert = null, action = null
  if (speedRatio < 0.75) {
    alert = `⚠️ Cuisson plus lente que prévu — retard estimé : ${Math.abs(delayMin)}min.`
    action = calc.wrapType === 'none' && !isRibsCook(calc.meatKey)
      ? `Si la bark vous convient, un wrap aluminium peut encore récupérer environ ${Math.round(Math.abs(delayMin) * 0.5)}min.`
      : `Gardez un pit stable et évitez les corrections brutales.`
  } else if (speedRatio > 1.30) {
    alert = `⚡ Cuisson plus rapide que prévu — avance d’environ ${Math.abs(delayMin)}min.`
    action = `Profitez de l'avance pour prolonger le repos ou baisser légèrement le pit.`
  }

  return {
    elapsedMin: safeElapsedMin,
    currentTempC: normalizedCurrentTempC,
    expectedTempC: +expectedTempC.toFixed(1),
    deviation: +(normalizedCurrentTempC - expectedTempC).toFixed(1),
    speedRatio: +speedRatio.toFixed(2),
    correction: +effectiveCorrection.toFixed(2),
    currentPhase, variancePct,
    remainingCookMin: recalCook,
    remainingMin: recalCook,
    remainingTotalMin: recalCook + bufferMin + restMin,
    remainingOptimistic: Math.round(recalCook * (1 - variancePct / 100)) + bufferMin + restMin,
    remainingPrudent: Math.round(recalCook * (1 + variancePct / 100)) + bufferMin + restMin,
    isAhead: speedRatio > 1.15,
    isBehind: speedRatio < 0.85,
    isAheadOfSchedule: speedRatio > 1.15,
    isBehindSchedule: speedRatio < 0.85,
    alert, action,
  }
}

// ─────────────────────────────────────────────────────────────
// STEAKS (inchangé)
// ─────────────────────────────────────────────────────────────

export const DONENESS_LEVELS = [
  { id:'bleu',        label:'Bleu',        emoji:'🔵', tempFinal:50, tempPull:44, color:'#3b82f6' },
  { id:'saignant',    label:'Saignant',    emoji:'🔴', tempFinal:55, tempPull:49, color:'#ef4444' },
  { id:'medium_rare', label:'Medium Rare', emoji:'🟠', tempFinal:57, tempPull:52, color:'#f97316' },
  { id:'a_point',     label:'À point',     emoji:'🟡', tempFinal:60, tempPull:55, color:'#eab308' },
  { id:'cuit_rose',   label:'Cuit rosé',   emoji:'🟢', tempFinal:65, tempPull:60, color:'#22c55e' },
  { id:'bien_cuit',   label:'Bien cuit',   emoji:'⚫', tempFinal:72, tempPull:67, color:'#6b7280' },
]

export const STEAK_PROFILES = {
  entrecote:     { label:'Entrecôte',         reverseSearMinCm:3,  indirectMinPerCm:13, searMinPerFace:1.5, restMin:5,  defaultThicknessCm:2.5, defaultDoneness:'medium_rare' },
  filet:         { label:'Filet / Tournedos', reverseSearMinCm:4,  indirectMinPerCm:11, searMinPerFace:1.5, restMin:5,  defaultThicknessCm:4.0, defaultDoneness:'medium_rare' },
  cote_de_boeuf: { label:'Côte de bœuf',      reverseSearMinCm:0,  indirectMinPerCm:14, searMinPerFace:2.0, restMin:10, defaultThicknessCm:5.0, defaultDoneness:'medium_rare' },
  tomahawk:      { label:'Tomahawk',           reverseSearMinCm:0,  indirectMinPerCm:14, searMinPerFace:2.5, restMin:10, defaultThicknessCm:5.5, defaultDoneness:'medium_rare' },
  bavette:       { label:'Bavette',            reverseSearMinCm:99, indirectMinPerCm:10, searMinPerFace:2.0, restMin:5,  defaultThicknessCm:2.0, defaultDoneness:'saignant'    },
  onglet:        { label:'Onglet',             reverseSearMinCm:99, indirectMinPerCm:8,  searMinPerFace:2.0, restMin:5,  defaultThicknessCm:2.5, defaultDoneness:'saignant'    },
  hampe:         { label:'Hampe',              reverseSearMinCm:99, indirectMinPerCm:8,  searMinPerFace:2.0, restMin:5,  defaultThicknessCm:2.0, defaultDoneness:'saignant'    },
  rumsteck:      { label:'Rumsteck',           reverseSearMinCm:3,  indirectMinPerCm:12, searMinPerFace:1.5, restMin:5,  defaultThicknessCm:2.5, defaultDoneness:'medium_rare' },
  picanha:       { label:'Picanha',            reverseSearMinCm:3,  indirectMinPerCm:12, searMinPerFace:2.0, restMin:5,  defaultThicknessCm:3.5, defaultDoneness:'medium_rare' },
  cote_agneau:   { label:'Côte d\'agneau',     reverseSearMinCm:4,  indirectMinPerCm:12, searMinPerFace:1.5, restMin:5,  defaultThicknessCm:2.5, defaultDoneness:'medium_rare' },
  cote_porc:     { label:'Côte de porc',       reverseSearMinCm:3,  indirectMinPerCm:11, searMinPerFace:2.0, restMin:5,  defaultThicknessCm:2.5, defaultDoneness:'cuit_rose'   },
  magret_canard: { label:'Magret de canard',   reverseSearMinCm:99, indirectMinPerCm:10, searMinPerFace:3.0, restMin:5,  defaultThicknessCm:3.0, defaultDoneness:'medium_rare' },
}

export function calculateSteak(meatKey, options = {}) {
  const { thicknessCm:ti, smokerTempC=110, smokerType='pellet', donenessId=null } = options
  const p = STEAK_PROFILES[meatKey]
  if (!p) throw new Error('Steak inconnu : ' + meatKey)
  const thickness = parseFloat(ti) || p.defaultThicknessCm
  const doneness  = DONENESS_LEVELS.find(d => d.id === (donenessId || p.defaultDoneness)) || DONENESS_LEVELS[2]
  const co        = thickness > 4 ? 7 : thickness > 2 ? 5 : 3
  const eff       = BASE_COEFFS.smoker[smokerType] || 1.0
  const useRS     = thickness >= p.reverseSearMinCm

  if (useRS) {
    const tf           = pitTempF(Math.min(smokerTempC, 120))
    const indirectMin  = Math.round(thickness * p.indirectMinPerCm * tf / eff)
    const preheatMin   = 15
    const searPerFace  = smokerTempC < 90 ? 0.5 : p.searMinPerFace
    const searTotal    = Math.max(Math.round(searPerFace * 2), 2)
    const totalMin     = indirectMin + preheatMin + searTotal + p.restMin
    return {
      method:'reverse_sear', doneness, thicknessCm:thickness,
      pullTemp:doneness.tempPull, targetTemp:doneness.tempFinal, carryoverC:co,
      cookMin:indirectMin+searTotal, restMin:p.restMin, totalMin,
      optimisticMin:Math.round(totalMin*0.90), probableMin:totalMin, prudentMin:Math.round(totalMin*1.12),
      phases:[
        { id:'indirect', label:`Phase 1 — Indirect ${smokerTempC}°C (${indirectMin}min)`, durationMin:indirectMin,
          description:`Zone indirecte. Sonde au cœur. Pull à ${doneness.tempPull}°C.`,
          targetTempNote:`Pull à ${doneness.tempPull}°C → final ${doneness.tempFinal}°C (+${co}°C carryover)` },
        { id:'preheat',  label:'Phase 2 — Repos + montée du feu', durationMin:preheatMin, isRest:true,
          description:`Monter grill/plancha à 260-350°C minimum.` },
        { id:'sear',     label:`Phase 3 — Saisie ${searPerFace.toFixed(1)}min/face`, durationMin:searTotal, isCrisp:true,
          description: smokerTempC < 90
            ? `French Smoker : ~20-30s/face — Maillard uniquement. Stop à ${doneness.tempFinal}°C !`
            : `Butter baste (beurre+thym+ail). Stop à ${doneness.tempFinal}°C !`,
          targetTempNote:`Stop à ${doneness.tempFinal}°C max` },
        { id:'rest', label:`Phase 4 — Repos (${p.restMin}min)`, durationMin:p.restMin, isRest:true,
          description:'Sur grille. Assiette chaude avec noix de beurre.' },
      ],
    }
  } else {
    const searPerFace = Math.max(Math.round(thickness * 0.8), 2)
    const indirectMin = thickness > 1.5 && p.reverseSearMinCm >= 99 ? Math.round(thickness * 5) : 0
    const cookMin     = searPerFace * 2 + indirectMin
    const phases = [
      { id:'sear1', label:`Phase 1 — Saisie face 1 (${searPerFace}min)`, durationMin:searPerFace, isCrisp:true,
        description:`Feu vif. Ne pas bouger tant que ça ne se décolle pas.` },
      { id:'sear2', label:`Phase 2 — Saisie face 2 (${searPerFace}min)`, durationMin:searPerFace, isCrisp:true,
        description:`Butter baste. Pull à ${doneness.tempPull}°C.`,
        targetTempNote:`Pull à ${doneness.tempPull}°C → final ${doneness.tempFinal}°C (+${co}°C)` },
    ]
    if (indirectMin > 0) phases.push({
      id:'indirect', label:`Phase 3 — Finition (${indirectMin}min)`, durationMin:indirectMin,
      description:`Indirect pour finir à cœur. Pull à ${doneness.tempPull}°C.`,
      targetTempNote:`Pull à ${doneness.tempPull}°C → final ${doneness.tempFinal}°C` })
    phases.push({ id:'rest', label:`Phase ${phases.length+1} — Repos (${p.restMin}min)`,
      durationMin:p.restMin, isRest:true, description:`Règle Rafa : ⅓ du temps de cuisson.` })
    return {
      method:'direct', doneness, thicknessCm:thickness,
      pullTemp:doneness.tempPull, targetTemp:doneness.tempFinal, carryoverC:co,
      cookMin, restMin:p.restMin, totalMin:cookMin+p.restMin,
      optimisticMin:cookMin+p.restMin-2, probableMin:cookMin+p.restMin, prudentMin:cookMin+p.restMin+3,
      phases,
    }
  }
}

// ─────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────

export function formatDuration(minutes) {
  // PATCH: sécurise l'affichage des durées
  const safeMinutes = normalizeDuration(minutes, 0)
  const h = Math.floor(safeMinutes / 60)
  const m = safeMinutes % 60
  if (h===0) return `${m}min`
  if (m===0) return `${h}h`
  return `${h}h${String(m).padStart(2,'0')}`
}

export function addMinutes(date, minutes) {
  // PATCH: fallback propre si la date ou la durée sont invalides
  const safeDate = date instanceof Date && Number.isFinite(date.getTime()) ? date : new Date()
  return new Date(safeDate.getTime() + toFiniteNumber(minutes, 0) * 60000)
}

export function formatTime(date) {
  // PATCH: évite les crashs UI sur date invalide
  const safeDate = date instanceof Date && Number.isFinite(date.getTime()) ? date : new Date()
  return safeDate.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})
}

export function carryover(weightKg) {
  return weightKg < 0.5 ? 3 : weightKg < 2 ? 5 : 7
}

export function validateInput(meatKey, weightKg, smokerTempC, thicknessCm = null) {
  // PATCH: messages d'aide plus robustes et compatibles avec les entrées UI imparfaites
  const warnings = []
  const safeWeightKg = parseNumericInput(weightKg, null)
  const safeSmokerTempC = parseNumericInput(smokerTempC, null)
  const safeThicknessCm = parseNumericInput(thicknessCm, null)

  if (safeWeightKg === null || safeWeightKg <= 0) {
    warnings.push('Poids invalide — renseigne une valeur positive pour fiabiliser l’estimation.')
    return warnings
  }

  if (safeSmokerTempC === null) warnings.push('Température fumoir absente — estimation calculée sur la valeur de référence.')
  else if (safeSmokerTempC < 100) warnings.push('T° très basse — cuisson plus longue et stall potentiellement prolongé.')
  else if (safeSmokerTempC > 150) warnings.push('T° élevée — cuisson plus rapide mais fenêtre de tendreté plus étroite.')

  if (safeThicknessCm !== null) {
    if (safeThicknessCm < 2) warnings.push('Pièce très fine — le modèle low & slow devient moins prédictif.')
    else if (safeThicknessCm > 18) warnings.push('Pièce très épaisse — ajoute de la marge, surtout sans wrap.')
  }

  if (meatKey === 'brisket' && safeWeightKg > 8) warnings.push('Grosse pièce — ajoute 1 à 2h de marge et surveille surtout l’épaisseur de la flat.')
  if (meatKey === 'pork_shoulder' && safeWeightKg > 6) warnings.push('Grosse épaule — stall longue probable; le wrap peut aider mais reste facultatif si tu as du temps.')
  if ((meatKey === 'ribs_pork' || meatKey === 'ribs_baby_back') && safeSmokerTempC !== null && safeSmokerTempC > 135) warnings.push('Température haute pour des ribs — la couleur et le sucre du rub peuvent partir vite.')
  if ((meatKey === 'ribs_pork' || meatKey === 'ribs_baby_back') && safeWeightKg > 4) warnings.push('Pour les ribs, surveille surtout la couleur, le pullback et le flex test plutôt qu’un simple temps théorique.')
  if ((meatKey === 'paleron' || meatKey === 'plat_de_cote') && safeSmokerTempC !== null && safeSmokerTempC < 107) warnings.push('Sous 107°C, chuck / paleron / plat de côte peuvent devenir très longs en zone de tendreté.')
  return warnings
}

export function generateSuggestion(historySamples, meatKey, parameter) {
  if (!historySamples || historySamples.length < 3) return null
  const errors = historySamples.map(s => s.error_pct).filter(e => e != null)
  if (errors.length < 3) return null
  const avg = errors.reduce((a,b)=>a+b,0)/errors.length
  const std = Math.sqrt(errors.map(e=>(e-avg)**2).reduce((a,b)=>a+b,0)/errors.length)
  if (Math.abs(avg) < 5) return null
  return {
    category: meatKey || 'global', parameter,
    current_value: 1.0,
    suggested_value: Math.round(Math.min(Math.max(1+(avg/100)*0.4,0.80),1.20)*1000)/1000,
    sample_size: errors.length,
    confidence_score: Math.round(Math.max(0,100-std*4)),
    rationale: `Erreur moyenne : ${avg.toFixed(1)}% sur ${errors.length} cuissons.`,
    status: 'pending',
  }
}
