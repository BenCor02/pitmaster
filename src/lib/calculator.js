/**
 * ════════════════════════════════════════════════════════════════
 * PITMASTER ENGINE v8 — planificateur BBQ heuristique
 * ════════════════════════════════════════════════════════════════
 *
 * Ce moteur suit une logique simple :
 *   - 80% consensus pitmasters
 *   - 20% ajustements de modèle (épaisseur, température, smoker, wrap, marbling)
 *   - objectif principal : heure de départ crédible + fenêtre réaliste
 *
 * Important :
 *   - ce n'est pas un modèle scientifique absolu
 *   - les sorties sont des estimations robustes, sans fausse précision
 *   - l'UI simplifie ensuite ces données pour guider l'utilisateur
 * ════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────
// LOIS PHYSIQUES
// ─────────────────────────────────────────────────────────────

// PATCH: facteur d'épaisseur demandé par le produit final
const thicknessF = (cm) => Math.pow(cm / 5, 0.45)
const KG_TO_LB = 2.20462

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
  // PATCH: facteurs smoker alignés avec le consensus produit demandé
  smoker: { offset:1.00, kamado:0.95, pellet:0.93, electric:0.97, kettle:0.98 },

  // PATCH: conservé pour compatibilité; le calcul principal n'en dépend plus fortement
  smokerStall: { offset:1.00, pellet:1.00, kamado:0.98, electric:1.00, kettle:1.00 },

  // PATCH: facteurs marbling explicitement demandés
  marbling: { low:1.05, medium:1.00, high:0.94 },

  // PATCH: wrap calibré en logique "paper vs foil" simple et lisible
  wrap: { none:1.00, butcher_paper:0.92, foil:0.85, foil_boat:0.88 },

  // PATCH: conservé pour compatibilité, proche du facteur wrap principal
  wrapFinish: { none:1.00, butcher_paper:0.96, foil:0.91, foil_boat:0.93 },

  // PATCH: points de référence température demandés
  pit: { 110:1.18, 115:1.10, 120:1.00, 125:0.94, 130:0.89, 135:0.84 },
}

// ─────────────────────────────────────────────────────────────
// BASES PAR VIANDE
// calibrées sur : 4kg, 10cm, 120°C, offset, no wrap (minutes)
// ─────────────────────────────────────────────────────────────

export const PHASE_BASES = {
  // ── BŒUF ────────────────────────────────────────────────
  brisket: {
    label:'Brisket', baseMinPerLb:80,
    stallStartC:65, targetC:95, wrapTempC:74,
    collagenTarget:420, rest:120, restMax:300, variancePct:20,
    // PATCH: proportions simples, pilotées d'abord par les repères terrain
    p1:0.42, st:0.20, p3:0.38,
  },
  ribs_beef: {
    label:'Beef Ribs', baseMinPerLb:70,
    stallStartC:66, targetC:96, wrapTempC:74,
    collagenTarget:360, rest:60, restMax:120, variancePct:15,
    p1:0.44, st:0.18, p3:0.38,
  },
  paleron: {
    label:'Paleron / Chuck', baseMinPerLb:65,
    stallStartC:64, targetC:93, wrapTempC:72,
    collagenTarget:340, rest:60, restMax:180, variancePct:20,
    p1:0.40, st:0.22, p3:0.38,
  },
  plat_de_cote: {
    label:'Plat de Côte', baseMinPerLb:65,
    stallStartC:65, targetC:93, wrapTempC:73,
    collagenTarget:340, rest:60, restMax:120, variancePct:20,
    p1:0.40, st:0.22, p3:0.38,
  },
  // ── PORC ────────────────────────────────────────────────
  pork_shoulder: {
    label:'Épaule de porc (Pulled Pork)', baseMinPerLb:75,
    stallStartC:65, targetC:95, wrapTempC:68,
    collagenTarget:360, rest:90, restMax:180, variancePct:18,
    p1:0.40, st:0.22, p3:0.38,
  },
  ribs_pork: {
    label:'Spare Ribs', baseMinFixed:330,
    stallStartC:63, targetC:null, wrapTempC:null,
    collagenTarget:80, rest:20, restMax:60, variancePct:15,
    p1:0.56, st:0.16, p3:0.28,
  },
  ribs_baby_back: {
    label:'Baby Back Ribs', baseMinFixed:270,
    stallStartC:63, targetC:null, wrapTempC:null,
    collagenTarget:60, rest:15, restMax:45, variancePct:12,
    p1:0.54, st:0.14, p3:0.32,
  },
  // ── AGNEAU ──────────────────────────────────────────────
  lamb_shoulder: {
    label:"Épaule d'agneau", baseMinPerLb:68,
    stallStartC:64, targetC:90, wrapTempC:75,
    collagenTarget:260, rest:45, restMax:90, variancePct:16,
    p1:0.40, st:0.20, p3:0.40,
  },
}

// PATCH: interpolation simple entre points de température donnés par le produit
function getTempFactor(tempC) {
  const points = Object.entries(BASE_COEFFS.pit)
    .map(([temp, factor]) => [Number(temp), factor])
    .sort((a, b) => a[0] - b[0])
  const safeTemp = clamp(toFiniteNumber(tempC, 120), points[0][0], points[points.length - 1][0])
  for (let i = 0; i < points.length - 1; i += 1) {
    const [t1, f1] = points[i]
    const [t2, f2] = points[i + 1]
    if (safeTemp >= t1 && safeTemp <= t2) {
      const ratio = (safeTemp - t1) / Math.max(t2 - t1, 1)
      return f1 + (f2 - f1) * ratio
    }
  }
  return points[points.length - 1][1]
}

// PATCH: compatibilité avec les parties du fichier qui utilisent encore pitTempF
function pitTempF(tempC) {
  return getTempFactor(tempC)
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
  const weightLb = safeWeightKg * KG_TO_LB

  // PATCH: formule principale demandée par le produit
  const baseCookMin = m.baseMinFixed ?? (weightLb * toFiniteNumber(m.baseMinPerLb, 70))
  const cT = safeFactor(thicknessF(thicknessCm), 1.0, 0.70, 1.55)
  const cP = safeFactor(getTempFactor(safeSmokerTempC), 1.0, 0.80, 1.20)
  const cS = safeFactor(BASE_COEFFS.smoker[smokerType] ?? 1.0, 1.0, 0.90, 1.05)
  const cWr = safeFactor(BASE_COEFFS.wrap[wrapType] ?? 1.0, 1.0, 0.84, 1.00)
  const cM = safeFactor(BASE_COEFFS.marbling[marbling] ?? 1.0, 1.0, 0.94, 1.05)

  // PATCH: l'eau reste un ajustement très secondaire, pas un pilier du modèle
  const cWater = waterPan ? 1.02 : 1.0

  // PATCH: on garde un hook d'ajustement admin global sans casser la nouvelle formule
  const adj = approvedAdjustments
  const adjG = safeFactor(adj.global ?? 1.0, 1.0, 0.85, 1.15)

  const cookBaseAdjusted = baseCookMin * cT * cP * cS * cWr * cM * cWater * adjG
  const cookMin = normalizeDuration(cookBaseAdjusted, baseCookMin, 1)

  let phase1Min = normalizeDuration(cookMin * toFiniteNumber(m.p1, 0.40), 0, 1)
  let stallMin = normalizeDuration(cookMin * toFiniteNumber(m.st, 0.20), 0, isRibsCook(meatKey) ? 0 : 1)
  let phase3Min = normalizeDuration(cookMin * toFiniteNumber(m.p3, 0.40), 0, 1)
  ;[phase1Min, stallMin, phase3Min] = rebalancePhaseDurations(cookMin, [phase1Min, stallMin, phase3Min], [1, isRibsCook(meatKey) ? 0 : 1, 1])

  const restBase = restMinOverride == null ? m.rest : parseNumericInput(restMinOverride, m.rest)
  const restMin = clamp(normalizeDuration(restBase, m.rest, 0), 0, m.restMax ?? Math.max(m.rest, 240))
  const totalMin = cookMin + restMin

  // PATCH: le score collagène reste backend seulement, sans rallonger artificiellement la cuisson
  const collagenFinal = m.targetC
    ? calcCollagenScore(phase1Min, stallMin, phase3Min, m.stallStartC, m.targetC)
    : 0

  const variancePct = normalizeDuration(m.variancePct, isRibsCook(meatKey) ? 15 : 20, 5)
  const optimisticMin = normalizeDuration(totalMin * (1 - variancePct / 100), totalMin, restMin)
  const prudentMin = normalizeDuration(totalMin * (1 + variancePct / 100), totalMin, totalMin)

  return {
    meatKey, meatLabel: m.label, weightKg: safeWeightKg,
    thicknessCm, smokerTempC: safeSmokerTempC, smokerType, wrapType, marbling, waterPan,

    phase1Min, stallMin, phase3Min, cookMin, bufferMin: 0, restMin, totalMin,

    optimisticMin,
    probableMin: totalMin,
    prudentMin,
    varianceMin: Math.max(Math.round(totalMin * (variancePct / 100)), isRibsCook(meatKey) ? 15 : 20),
    variancePct,

    targetTempC:  m.targetC ?? null,
    targetC:      m.targetC ?? null,
    wrapTempC:    m.wrapTempC,
    stallStartC:  m.stallStartC,
    stallStartMin: phase1Min,
    wrapRecommendedAtMin: m.wrapTempC ? phase1Min : null,

    collagenScore: collagenFinal,
    collagenTarget: m.collagenTarget,
    collagenRequired: m.collagenTarget,
    collagenOk:    collagenFinal >= m.collagenTarget,

    coeffs: {
      cT:+cT.toFixed(3),
      cP:+cP.toFixed(3),
      cS:+cS.toFixed(3),
      cWr:+cWr.toFixed(3),
      cM:+cM.toFixed(3),
      cWater:+cWater.toFixed(3),
      baseCookMin: normalizeDuration(baseCookMin, 0),
      weightLb:+weightLb.toFixed(2),
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
      id:'phase1', label:'Bark en formation',
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

    // PATCH: étape wrap dédiée pour aider le front à afficher un flow ribs plus humain
    if (wrapType !== 'none') {
      phases.push({
        id:'wrap', label:'Wrap (facultatif)',
        durationMin: 0,
        description: `Emballe seulement si la couleur te plaît et si tu veux une texture plus fondante. Le papier reste plus respirant, l'alu accélère davantage.`,
        targetTempNote: 'Décision surtout visuelle : couleur, bark et retrait sur l’os.',
        checkpoint: 'wrap_confirm',
      })
    }

    phases.push({
      id:'phase3', label:'Flex test / détachement',
      durationMin: safePhase3Min,
      description: `Cherche un rack souple qui plie nettement avec une légère fissure en surface. Le flex test et le retrait sur l’os comptent plus qu’une sonde ou un chiffre exact.`,
      targetTempNote: 'Vérifie la souplesse du rack et le retrait de viande sur l’os avant de servir.',
      // PATCH: ribs = checkpoint dédié flex_test, plus de recyclage implicite du probe test
      checkpoint: 'flex_test',
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
    targetTempNote: wrapTempC ? `Commence à penser au wrap quand la couleur te plaît, souvent autour de ${wrapTempC}°C.` : null,
    checkpoint: 'stall_check',
  })

  if (safeStallMin > 0) {
    phases.push({
      id:'stall', label:`La cuisson ralentit`,
      durationMin: safeStallMin, isStall: true,
      description: wrapType !== 'none'
        ? `La montée en température ralentit, c’est normal. Le wrap aide à limiter l’évaporation et à rendre la fin de cuisson plus régulière.`
        : `La viande ralentit car l’évaporation refroidit sa surface. Ne panique pas et évite de surcorriger le fumoir.`,
      targetTempNote: wrapTempC ? `Le bon moment dépend surtout de la couleur et de la bark, pas d’une minute précise.` : null,
      wrapAt: wrapTempC,
      checkpoint: 'wrap_confirm',
    })
  }

  if (wrapType !== 'none') {
    phases.push({
      id:'wrap', label:'Wrap (emballage)',
      durationMin: 0,
      // PATCH: étape wrap explicite pour refléter le consensus pitmaster "couleur puis wrap"
      description: `Emballe quand la bark te plaît. Papier boucher = plus respirant, aluminium = plus rapide et plus humide.`,
      targetTempNote: wrapTempC ? `Souvent autour de ${wrapTempC}°C, mais la couleur reste le vrai signal.` : 'Décision guidée d’abord par l’aspect de la viande.',
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
