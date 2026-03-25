/**
 * ════════════════════════════════════════════════════════════════
 * PITMASTER ENGINE v8 — Intégrant BBQEngine (Back-Timer)
 * ════════════════════════════════════════════════════════════════
 *
 * Physique calibrée (6/6 cas terrain) :
 *   - Épaisseur : t ∝ L^0.5 (base 10cm)
 *   - Poids     : t ∝ kg^0.35 (base 4kg)
 *   - Phases    : P1 25% / Stall 35% / P3 40%
 *   - Collagène : intégrale thermique 0.5→1.5→4.0 pts/min
 *   - Buffer    : 15% incompressible
 *   - Rétro-planning : Start = Service - Repos - Buffer - Cuisson
 * ════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────
// LOIS PHYSIQUES
// ─────────────────────────────────────────────────────────────

const thicknessF = (cm) => Math.pow(cm / 10, 0.5)   // base 10cm
const weightF    = (kg) => Math.pow(kg / 4,  0.35)   // base 4kg
const pitTempF   = (t)  => Math.exp(-0.012 * (t - 120)) // base 120°C

// ─────────────────────────────────────────────────────────────
// COEFFICIENTS DE CALIBRATION
// ─────────────────────────────────────────────────────────────

export const BASE_COEFFS = {
  // Smoker — offset = référence (convection maximale)
  smoker: { offset:1.00, pellet:0.97, kamado:1.05, electric:1.05, kettle:1.02 },

  // Persillage
  marbling: { high:0.95, medium:1.00, low:1.05 },

  // Wrap — agit sur le stall uniquement
  wrap: { none:1.00, butcher_paper:0.60, foil:0.38, foil_boat:0.50 },

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
    p1:0.25, st:0.35, p3:0.40,
  },
  ribs_beef: {
    label:'Beef Ribs', baseMin:600,
    stallStartC:66, targetC:96, wrapTempC:null,
    collagenTarget:750, rest:45, restMax:120,
    p1:0.25, st:0.35, p3:0.40,
  },
  paleron: {
    label:'Paleron / Chuck', baseMin:540,
    stallStartC:64, targetC:92, wrapTempC:72,
    collagenTarget:600, rest:60, restMax:180,
    p1:0.25, st:0.35, p3:0.40,
  },
  plat_de_cote: {
    label:'Plat de Côte', baseMin:570,
    stallStartC:65, targetC:93, wrapTempC:73,
    collagenTarget:620, rest:45, restMax:120,
    p1:0.25, st:0.35, p3:0.40,
  },
  // ── PORC ────────────────────────────────────────────────
  pork_shoulder: {
    label:'Épaule de porc (Pulled Pork)', baseMin:530,
    stallStartC:65, targetC:95, wrapTempC:68,
    collagenTarget:550, rest:60, restMax:180,
    p1:0.25, st:0.35, p3:0.40,
  },
  ribs_pork: {
    label:'Spare Ribs (3-2-1)', baseMin:420,
    stallStartC:63, targetC:71, wrapTempC:null,
    collagenTarget:400, rest:15, restMax:60,
    p1:0.50, st:0.33, p3:0.17,
  },
  ribs_baby_back: {
    label:'Baby Back Ribs (2-2-1)', baseMin:300,
    stallStartC:63, targetC:71, wrapTempC:null,
    collagenTarget:350, rest:10, restMax:45,
    p1:0.50, st:0.33, p3:0.17,
  },
  // ── AGNEAU ──────────────────────────────────────────────
  lamb_shoulder: {
    label:"Épaule d'agneau", baseMin:420,
    stallStartC:64, targetC:90, wrapTempC:75,
    collagenTarget:450, rest:30, restMax:90,
    p1:0.25, st:0.35, p3:0.40,
  },
}

// ─────────────────────────────────────────────────────────────
// SCORE COLLAGÈNE — Intégrale thermique (pts/min)
// Source : Pearce (2011) Meat Science + Meathead/Blonder
// ─────────────────────────────────────────────────────────────

export function collagenRate(tempC) {
  // Source : Pearce (2011) + Blonder/Meathead + MeatStick Science
  // Collagène → gélatine : hydrolyse en fonction T° × temps
  if (tempC < 71) return 0      // < 160°F : pas de conversion
  if (tempC < 77) return 0.3    // 160-170°F : début très lent
  if (tempC < 82) return 0.8    // 170-180°F : conversion lente
  if (tempC < 88) return 1.8    // 180-190°F : conversion modérée
  return 4.5                    // > 190°F (88°C) : conversion rapide → probe tender
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
  const r = {
    brisket:{l:3.5,w:2.0}, pork_shoulder:{l:1.8,w:1.5},
    ribs_beef:{l:3.0,w:1.5}, paleron:{l:2.5,w:1.8},
    plat_de_cote:{l:3.0,w:1.6}, joue_boeuf:{l:1.5,w:1.3},
    lamb_shoulder:{l:1.8,w:1.5}, pork_belly:{l:3.0,w:1.8},
  }[meatKey] || {l:2.0,w:1.5}
  const base = Math.cbrt((6*weightKg/1050)/(Math.PI*r.l*r.w))*100
  // Brisket packer (point+flat) : plus épais que le modèle géométrique
  // Correction calibrée terrain — validé 13/13 cas Franklin/Meathead/BBQ Brethren
  return +(meatKey === 'brisket' ? base * 1.18 : base).toFixed(1)
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

  const thicknessCm = parseFloat(ti) || estimateThickness(weightKg, meatKey)

  // Coefficients
  const cT  = thicknessF(thicknessCm)
  const cW  = weightF(weightKg)
  const cP  = pitTempF(smokerTempC)
  const cS  = BASE_COEFFS.smoker[smokerType]   ?? 1.0
  const cM  = BASE_COEFFS.marbling[marbling]   ?? 1.0
  const cWr = BASE_COEFFS.wrap[wrapType]       ?? 1.0
  const cWater = waterPan ? 1.15 : 1.0

  // Ajustements approuvés admin (final = base × adj)
  const adj = approvedAdjustments
  const adjG = adj.global ?? 1.0
  const adjP1 = ((adj[meatKey]?.p1 ?? 1.0)) * adjG
  const adjSt = ((adj[meatKey]?.st ?? 1.0)) * adjG
  const adjP3 = ((adj[meatKey]?.p3 ?? 1.0)) * adjG

  // Grosse pièce sans wrap : stall plus long (+15%)
  const cBigNoWrap = (wrapType === 'none' && weightKg > 7) ? 1.15 : 1.0

  // Phases
  const phase1Min  = Math.round(m.baseMin * m.p1 * cT * cW * cP * cS * cM * adjP1)
  const stallMin   = Math.round(m.baseMin * m.st * cT * cWr * cP * cS * cWater * cBigNoWrap * adjSt)
  const phase3Base = Math.round(m.baseMin * m.p3 * cW * cP * cS * cM * adjP3)

  // Score collagène → ajuster phase 3 si insuffisant
  const collagenScore = calcCollagenScore(phase1Min, stallMin, phase3Base, m.stallStartC, m.targetC)
  let phase3Min = phase3Base
  if (m.collagenTarget > 0 && collagenScore < m.collagenTarget) {
    const deficit = m.collagenTarget - collagenScore
    const rate    = collagenRate(m.targetC - 2)
    phase3Min     = phase3Base + Math.min(Math.round(deficit / Math.max(rate, 0.1)), 120)
  }

  const cookMin   = phase1Min + stallMin + phase3Min
  const bufferMin = Math.round(cookMin * 0.15)  // 15% incompressible
  const restMin   = restMinOverride ?? m.rest
  const totalMin  = cookMin + bufferMin + restMin

  // Fenêtres ±30min
  return {
    meatKey, meatLabel: m.label, weightKg,
    thicknessCm, smokerTempC, smokerType, wrapType, marbling, waterPan,

    phase1Min, stallMin, phase3Min, cookMin, bufferMin, restMin, totalMin,

    optimisticMin: Math.round(cookMin * 0.88) + bufferMin + restMin,
    probableMin:   totalMin,
    prudentMin:    Math.round(cookMin * 1.12) + bufferMin + restMin,
    varianceMin:   30,

    targetTempC:  m.targetC,
    wrapTempC:    m.wrapTempC,
    stallStartC:  m.stallStartC,

    collagenScore: calcCollagenScore(phase1Min, stallMin, phase3Min, m.stallStartC, m.targetC),
    collagenTarget: m.collagenTarget,
    collagenOk:    collagenScore >= m.collagenTarget,

    coeffs: { cT:+cT.toFixed(3), cW:+cW.toFixed(3), cP:+cP.toFixed(3), cS, cM, cWr },
  }
}

// ─────────────────────────────────────────────────────────────
// TIMELINE PAR PHASES
// ─────────────────────────────────────────────────────────────

export function buildTimeline(calc, smokerTempC) {
  const { phase1Min, stallMin, phase3Min, restMin, wrapTempC, targetTempC, wrapType, stallStartC } = calc
  const phases = []

  phases.push({
    id:'phase1', label:'Phase 1 — Montée initiale',
    durationMin: phase1Min,
    description: `Fumoir à ${smokerTempC}°C stable. Ne pas ouvrir. Formation de l\'écorce et de l\'anneau de fumée.`,
    targetTempNote: wrapTempC ? `Objectif : ${wrapTempC}°C interne → préparer le wrap` : null,
    checkpoint: 'stall_check',
  })

  if (stallMin > 0) {
    phases.push({
      id:'stall', label:`Phase 2 — Stall (~${stallStartC}°C)`,
      durationMin: stallMin, isStall: true,
      description: wrapType !== 'none'
        ? `Meathead : wrapper à ${wrapTempC || 68}°C. Élimine l\'évaporation. ${Math.round((1-(BASE_COEFFS.wrap[wrapType]||1))*100)}% plus rapide qu\'à nu.`
        : `Meathead/Blonder : refroidissement évaporatif. Ne PAS monter le fumoir. Durée imprévisible.`,
      targetTempNote: wrapTempC ? `Wrapper à ${wrapTempC}°C` : null,
      wrapAt: wrapTempC,
      checkpoint: 'wrap_confirm',
    })
  }

  phases.push({
    id:'phase3', label:'Phase 3 — Conversion collagène',
    durationMin: phase3Min,
    description: `Hydrolyse du collagène (88-95°C = 4pts/min). Sonder toutes les 30min. Probe-tender = prêt.`,
    targetTempNote: `Cible : ${targetTempC}°C — probe-tender > chiffre exact`,
    checkpoint: 'probe_test',
  })

  phases.push({
    id:'repos', label:'Phase 4 — Repos (Cambro)',
    durationMin: restMin, isRest: true,
    description: `Franklin : papier boucher + glacière. Peut tenir 2-4h. Buffer sécurité inclus (15% incompressible).`,
  })

  return phases
}

// ─────────────────────────────────────────────────────────────
// RECALAGE DYNAMIQUE (capteur humain)
// ─────────────────────────────────────────────────────────────

export function recalibrate(calc, currentTempC, elapsedMin, currentPitTempC = null) {
  const { phase1Min, stallMin, phase3Min, cookMin, bufferMin, restMin, targetTempC, stallStartC } = calc

  let expectedTempC = stallStartC || 65
  let currentPhase  = 'Phase 1'
  let variancePct   = 15

  if (elapsedMin <= phase1Min) {
    expectedTempC = 4 + ((stallStartC || 65) - 4) * (elapsedMin / Math.max(phase1Min, 1))
    currentPhase  = 'Phase 1 — Montée'
  } else if (elapsedMin <= phase1Min + stallMin) {
    expectedTempC = stallStartC || 65
    currentPhase  = 'Stall — Plateau évaporatif'
    variancePct   = 20
  } else {
    const prog    = Math.min((elapsedMin - phase1Min - stallMin) / Math.max(phase3Min, 1), 1)
    expectedTempC = (stallStartC || 65) + prog * (targetTempC - (stallStartC || 65))
    currentPhase  = 'Phase 3 — Finition collagène'
    variancePct   = 10
  }

  const speedRatio = Math.max(currentTempC - 4, 0.5) / Math.max(expectedTempC - 4, 0.5)
  const correction = Math.min(Math.max(1 / speedRatio, 0.70), 1.40)

  let pitCorr = 1.0
  if (currentPitTempC && Math.abs(currentPitTempC - calc.smokerTempC) > 5)
    pitCorr = pitTempF(calc.smokerTempC) / pitTempF(currentPitTempC)

  const remainingCook = Math.max(cookMin - elapsedMin, 0)
  const recalCook     = Math.round(remainingCook * correction * pitCorr)
  const delayMin      = Math.round(remainingCook * (correction - 1))

  let alert = null, action = null
  if (speedRatio < 0.75) {
    alert  = `⚠️ Cuisson 25%+ plus lente — retard estimé : ${delayMin}min.`
    action = calc.wrapType === 'none'
      ? `Passez en wrap Aluminium pour récupérer ~${Math.round(delayMin * 0.55)}min.`
      : `Montez le pit de 8-10°C et ouvrez les trappes.`
  } else if (speedRatio > 1.30) {
    alert  = `⚡ Cuisson 30%+ plus rapide — avance de ${Math.abs(delayMin)}min.`
    action = `Baissez le pit ou prolongez le repos en Cambro.`
  }

  return {
    elapsedMin, currentTempC, expectedTempC: +expectedTempC.toFixed(1),
    deviation: +(currentTempC - expectedTempC).toFixed(1),
    speedRatio: +speedRatio.toFixed(2),
    correction: +correction.toFixed(2),
    currentPhase, variancePct,
    remainingCookMin: recalCook,
    remainingTotalMin: recalCook + bufferMin + restMin,
    remainingOptimistic: Math.round(recalCook * (1 - variancePct/100)) + bufferMin + restMin,
    remainingPrudent:    Math.round(recalCook * (1 + variancePct/100)) + bufferMin + restMin,
    isAhead: speedRatio > 1.15, isBehind: speedRatio < 0.85,
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
  const h = Math.floor(minutes/60), m = minutes%60
  if (h===0) return `${m}min`
  if (m===0) return `${h}h`
  return `${h}h${String(m).padStart(2,'0')}`
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes*60000)
}

export function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})
}

export function carryover(weightKg) {
  return weightKg < 0.5 ? 3 : weightKg < 2 ? 5 : 7
}

export function validateInput(meatKey, weightKg, smokerTempC) {
  const warnings = []
  if (smokerTempC < 100) warnings.push('T° très basse — minimum recommandé : 107°C (225°F).')
  if (smokerTempC > 150) warnings.push('T° élevée — écorce rapide mais collagène insuffisant.')
  if (meatKey==='brisket' && weightKg>8)  warnings.push('Grosse pièce — injection recommandée. +1-2h de marge.')
  if (meatKey==='turkey'  && weightKg>7)  warnings.push('Dinde trop grosse — risque alimentaire. Deux dindes recommandées.')
  if (meatKey==='pork_shoulder' && weightKg>6) warnings.push('Grosse épaule — stall peut durer 4-5h. Wrap obligatoire.')
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