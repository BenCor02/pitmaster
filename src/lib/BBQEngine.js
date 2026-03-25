/**
 * PITMASTER ENGINE v9 - Production Grade
 * Modélisation physique, environnementale et stochastique.
 */

export const MEAT_PROFILES = {
  brisket: { label: 'Poitrine de bœuf (Brisket)', baseMin: 720, stallStartC: 65, targetC: 94, wrapTempC: 74, collagenTarget: 650, rest: 120, p1: 0.25, st: 0.35, p3: 0.40 },
  pork_shoulder: { label: 'Épaule de porc (Pulled Pork)', baseMin: 540, stallStartC: 65, targetC: 95, wrapTempC: 70, collagenTarget: 580, rest: 60, p1: 0.25, st: 0.35, p3: 0.40 },
  ribs_beef: { label: 'Beef Ribs', baseMin: 500, stallStartC: 66, targetC: 96, wrapTempC: 74, collagenTarget: 750, rest: 45, p1: 0.25, st: 0.35, p3: 0.40 },
  ribs_pork: { label: 'Spare Ribs', baseMin: 360, stallStartC: 63, targetC: 91, wrapTempC: 72, collagenTarget: 400, rest: 20, p1: 0.50, st: 0.30, p3: 0.20 },
};

export const BASE_COEFFS = {
  smoker: { offset: 1.0, pellet: 0.95, kamado: 1.08, electric: 1.15, kettle: 1.02 },
  marbling: { low: 1.05, medium: 1.0, high: 0.92 },
  wrap: { none: 1.0, butcher_paper: 0.65, foil: 0.45, foil_boat: 0.55 },
  weather: { sunny: 1.0, cold: 1.12, windy: 1.08, rainy: 1.15 }
};

const thicknessF = (cm) => Math.pow(cm / 10, 0.5);
const weightF = (kg) => Math.pow(kg / 4, 0.35);
const pitTempF = (t) => Math.exp(-0.015 * (t - 120));

export function calculateSession(meatKey, weightKg, options) {
  const m = MEAT_PROFILES[meatKey];
  const { 
    smokerTempC = 120, smokerType = 'offset', wrapType = 'butcher_paper', 
    marbling = 'medium', weather = 'sunny', extraRest = 0 
  } = options;

  // Estimation épaisseur (Physique des matériaux)
  const thicknessCm = Math.cbrt((6 * weightKg / 1050) / (Math.PI * 3.5 * 2.0)) * 100 * (meatKey === 'brisket' ? 1.18 : 1.0);
  
  const c = {
    t: thicknessF(thicknessCm),
    w: weightF(weightKg),
    p: pitTempF(smokerTempC),
    s: BASE_COEFFS.smoker[smokerType],
    m: BASE_COEFFS.marbling[marbling],
    wr: BASE_COEFFS.wrap[wrapType],
    e: BASE_COEFFS.weather[weather]
  };

  const commonMult = c.t * c.w * c.p * c.s * c.m * c.e;

  const p1Min = Math.round(m.baseMin * m.p1 * commonMult);
  const stMin = Math.round(m.baseMin * m.st * commonMult * c.wr);
  const p3Min = Math.round(m.baseMin * m.p3 * commonMult);

  const cookMin = p1Min + stMin + p3Min;
  const bufferMin = Math.round(cookMin * 0.12); // Marge d'incertitude 12%
  const totalRest = m.rest + Number(extraRest);
  
  return {
    meatLabel: m.label,
    phases: { p1Min, stMin, p3Min, bufferMin, restMin: totalRest },
    totalMin: cookMin + bufferMin + totalRest,
    targetC: m.targetC,
    stallC: m.stallStartC,
    thicknessCm
  };
}