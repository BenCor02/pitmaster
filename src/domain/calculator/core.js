const KG_TO_LB = 2.20462

function toNumber(value, fallback = 0) {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

function parseOptionalNumber(value, fallback = null) {
  if (value === '' || value === null || value === undefined) return fallback
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function avg(a, b) {
  return (a + b) / 2
}

function round(value, step = 1) {
  return Math.round(value / step) * step
}

function formatRange(range, unit = '°C') {
  if (!Array.isArray(range) || range.length !== 2) return null
  return `${range[0]}${unit} – ${range[1]}${unit}`
}

function formatSingleOrRange(value, unit = '°C') {
  if (Array.isArray(value)) return formatRange(value, unit)
  if (value === null || value === undefined) return null
  return `${value}${unit}`
}

const METHOD_LABELS = {
  low_and_slow: 'Low & Slow',
  hot_and_fast: 'Hot & Fast',
  reverse_sear: 'Reverse Sear',
}

export const COOKING_METHODS = [
  {
    id: 'low_and_slow',
    label: METHOD_LABELS.low_and_slow,
    short: 'Cuisson lente pour les grosses pièces, avec vraie marge de repos et de service.',
  },
  {
    id: 'hot_and_fast',
    label: METHOD_LABELS.hot_and_fast,
    short: 'Version plus vive quand la pièce ou le résultat s’y prête.',
  },
  {
    id: 'reverse_sear',
    label: METHOD_LABELS.reverse_sear,
    short: 'Montée douce en indirect, puis saisie finale très chaude.',
  },
]

export const BASE_COEFFS = {
  smoker: {
    pellet: 1.0,
    offset: 1.03,
    kamado: 0.97,
    electric: 1.05,
    kettle: 1.01,
    gas: 1.02,
  },
  wrap: {
    none: 1.0,
    butcher_paper: 0.94,
    foil_boat: 0.91,
    foil: 0.87,
  },
  marbling: {
    low: 1.03,
    medium: 1.0,
    high: 0.98,
  },
}

const DONENESS_BY_ID = {
  bleu: { id: 'bleu', label: 'Bleu', tempFinal: 50, tempPull: 46, color: '#3b82f6' },
  saignant: { id: 'saignant', label: 'Saignant', tempFinal: 54, tempPull: 50, color: '#ef4444' },
  medium_rare: { id: 'medium_rare', label: 'Medium Rare', tempFinal: 57, tempPull: 53, color: '#f97316' },
  a_point: { id: 'a_point', label: 'A point', tempFinal: 60, tempPull: 56, color: '#eab308' },
  cuit_rose: { id: 'cuit_rose', label: 'Cuit rose', tempFinal: 65, tempPull: 61, color: '#22c55e' },
  bien_cuit: { id: 'bien_cuit', label: 'Bien cuit', tempFinal: 71, tempPull: 67, color: '#6b7280' },
}

export const DONENESS_LEVELS = Object.values(DONENESS_BY_ID)

const LONG_COOK_PROFILES = {
  brisket: {
    id: 'brisket',
    label: 'Brisket',
    defaultWeightKg: 5.5,
    thicknessReferenceCm: 10,
    family: 'large_cut',
    targetTempC: 95,
    temperatureCues: {
      stallRangeC: [66, 74],
      wrapRangeC: [68, 75],
      probeStartC: 90,
      probeTenderRangeC: [92, 96],
      restMinutes: [90, 240],
    },
    visuals: [
      'Bark bien prise et sèche avant de penser au wrap',
      'Stall normal au milieu de cuisson',
      'Probe tender dans le flat avant de sortir',
    ],
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 115,
        minutesPerKgRange: [125, 165],
        restMinutes: [60, 120],
        restTargetMin: 90,
        holdMinutes: [60, 300],
        wrapFriendly: true,
        wrapTemp: 71,
        wrapReduction: { none: 1, butcher_paper: 0.95, foil_boat: 0.93, foil: 0.88 },
        timelineWeights: [0.42, 0.18, 0.4],
        notes: 'Base empirique croisee Franklin-style, Meat Church, AmazingRibs, ThermoWorks et terrain.',
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [135, 152],
        smokerTempDefault: 145,
        minutesPerKgRange: [80, 115],
        restMinutes: [45, 90],
        restTargetMin: 60,
        holdMinutes: [30, 150],
        wrapFriendly: false,
        wrapTemp: null,
        wrapReduction: { none: 1 },
        timelineWeights: [0.48, 0.1, 0.42],
        notes: 'Plus rapide, mais encore pilote a la bark puis au probe tender.',
      },
    ],
  },
  pork_shoulder: {
    id: 'pork_shoulder',
    label: 'Pulled Pork',
    defaultWeightKg: 4.5,
    thicknessReferenceCm: 9,
    family: 'large_cut',
    targetTempC: 96,
    temperatureCues: {
      stallRangeC: [66, 74],
      wrapRangeC: [71, 77],
      probeStartC: 92,
      probeTenderRangeC: [94, 98],
      restMinutes: [60, 180],
    },
    visuals: [
      'Bark foncee et fixee avant wrap',
      'Os qui bouge ou texture qui se defait facilement',
      'Effilochage propre sans fibres seches',
    ],
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 115,
        minutesPerKgRange: [150, 225],
        restMinutes: [60, 120],
        restTargetMin: 90,
        holdMinutes: [60, 240],
        wrapFriendly: true,
        wrapTemp: 74,
        wrapReduction: { none: 1, butcher_paper: 0.95, foil_boat: 0.93, foil: 0.88 },
        timelineWeights: [0.42, 0.2, 0.38],
        notes: 'Toujours juger la texture finale, pas seulement le chiffre.',
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [121, 149],
        smokerTempDefault: 135,
        minutesPerKgRange: [110, 160],
        restMinutes: [45, 120],
        restTargetMin: 60,
        holdMinutes: [45, 180],
        wrapFriendly: true,
        wrapTemp: 74,
        wrapReduction: { none: 1, butcher_paper: 0.95, foil_boat: 0.92, foil: 0.88 },
        timelineWeights: [0.46, 0.14, 0.4],
        notes: 'Version competition / planning serre.',
      },
    ],
  },
  ribs_pork: {
    id: 'ribs_pork',
    label: 'Spare Ribs',
    defaultWeightKg: 2,
    thicknessReferenceCm: 4,
    family: 'ribs',
    targetTempC: null,
    temperatureCues: {
      stallRangeC: null,
      wrapRangeC: null,
      probeStartC: null,
      probeTenderRangeC: null,
      restMinutes: [10, 20],
    },
    visuals: [
      'Couleur acajou et bark propre',
      'Retrait de viande sur l’os',
      'Bend test / flex test au lieu d’une heure magique',
    ],
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 110,
        fixedCookRange: [300, 390],
        restMinutes: [10, 20],
        restTargetMin: 15,
        holdMinutes: [0, 45],
        wrapFriendly: true,
        wrapTemp: null,
        wrapReduction: { none: 1, butcher_paper: 1, foil_boat: 1, foil: 1 },
        timelineWeights: [0.5, 0.18, 0.32],
        notes: 'La methode 3-2-1 reste un squelette, pas une verite absolue.',
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [121, 149],
        smokerTempDefault: 135,
        fixedCookRange: [240, 300],
        restMinutes: [10, 15],
        restTargetMin: 12,
        holdMinutes: [0, 30],
        wrapFriendly: true,
        wrapTemp: null,
        wrapReduction: { none: 1, butcher_paper: 0.98, foil_boat: 0.96, foil: 0.94 },
        timelineWeights: [0.54, 0.1, 0.36],
        notes: 'Plus court, souvent tres propre sur kamado ou pellet stable.',
      },
    ],
  },
  ribs_baby_back: {
    id: 'ribs_baby_back',
    label: 'Baby Back Ribs',
    defaultWeightKg: 1.6,
    thicknessReferenceCm: 3.5,
    family: 'ribs',
    targetTempC: null,
    temperatureCues: {
      stallRangeC: null,
      wrapRangeC: null,
      probeStartC: null,
      probeTenderRangeC: null,
      restMinutes: [10, 15],
    },
    visuals: [
      'Couleur uniforme sans sucre brule',
      'Flex test plus important qu’un chrono fixe',
      'Cuisson plus courte que spare ribs',
    ],
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 110,
        fixedCookRange: [240, 300],
        restMinutes: [10, 15],
        restTargetMin: 12,
        holdMinutes: [0, 30],
        wrapFriendly: true,
        wrapTemp: null,
        wrapReduction: { none: 1, butcher_paper: 1, foil_boat: 1, foil: 1 },
        timelineWeights: [0.48, 0.16, 0.36],
        notes: 'La logique 2-2-1 sert de repere, pas d’horloge.',
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [121, 149],
        smokerTempDefault: 135,
        fixedCookRange: [195, 255],
        restMinutes: [10, 15],
        restTargetMin: 12,
        holdMinutes: [0, 25],
        wrapFriendly: true,
        wrapTemp: null,
        wrapReduction: { none: 1, butcher_paper: 0.99, foil_boat: 0.97, foil: 0.95 },
        timelineWeights: [0.52, 0.08, 0.4],
        notes: 'Marche tres bien pour des ribs plus rapides sans surcuisson.',
      },
    ],
  },
  ribs_beef: {
    id: 'ribs_beef',
    label: 'Short Ribs',
    defaultWeightKg: 3.5,
    thicknessReferenceCm: 8,
    family: 'large_cut',
    targetTempC: 95,
    temperatureCues: {
      stallRangeC: [66, 74],
      wrapRangeC: [70, 76],
      probeStartC: 92,
      probeTenderRangeC: [94, 98],
      restMinutes: [30, 90],
    },
    visuals: [
      'Gras bien fondu mais viande encore juteuse',
      'Probe tender sur plusieurs points',
      'Repos plus court qu’une brisket, mais reel',
    ],
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 115,
        minutesPerKgRange: [170, 240],
        restMinutes: [30, 60],
        restTargetMin: 45,
        holdMinutes: [30, 120],
        wrapFriendly: true,
        wrapTemp: 72,
        wrapReduction: { none: 1, butcher_paper: 0.95, foil_boat: 0.93, foil: 0.9 },
        timelineWeights: [0.42, 0.16, 0.42],
        notes: 'Tres tolerantes, mais encore meilleures quand on attend le vrai probe tender.',
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [135, 152],
        smokerTempDefault: 140,
        minutesPerKgRange: [100, 145],
        restMinutes: [20, 60],
        restTargetMin: 30,
        holdMinutes: [20, 90],
        wrapFriendly: false,
        wrapTemp: null,
        wrapReduction: { none: 1 },
        timelineWeights: [0.46, 0.1, 0.44],
        notes: 'Approche tres pratique sur grosses dino ribs bien grasses.',
      },
    ],
  },
  paleron: {
    id: 'paleron',
    label: 'Paleron',
    defaultWeightKg: 2.5,
    thicknessReferenceCm: 7,
    family: 'large_cut',
    targetTempC: 95,
    temperatureCues: {
      stallRangeC: [66, 74],
      wrapRangeC: [72, 77],
      probeStartC: 90,
      probeTenderRangeC: [92, 96],
      restMinutes: [45, 120],
    },
    visuals: [
      'Poor man’s brisket: bark puis texture',
      'Finition couverte utile si la couleur est deja la',
      'Tranchable ou effilochable selon cuisson poussee',
    ],
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 115,
        minutesPerKgRange: [140, 210],
        restMinutes: [60, 120],
        restTargetMin: 90,
        holdMinutes: [45, 180],
        wrapFriendly: true,
        wrapTemp: 74,
        wrapReduction: { none: 1, butcher_paper: 0.95, foil_boat: 0.93, foil: 0.88 },
        timelineWeights: [0.43, 0.15, 0.42],
        notes: 'Tres bon candidat pour un plan simple et fiable a la maison.',
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [121, 149],
        smokerTempDefault: 135,
        minutesPerKgRange: [100, 150],
        restMinutes: [30, 75],
        restTargetMin: 45,
        holdMinutes: [20, 90],
        wrapFriendly: true,
        wrapTemp: 74,
        wrapReduction: { none: 1, butcher_paper: 0.95, foil_boat: 0.92, foil: 0.89 },
        timelineWeights: [0.46, 0.1, 0.44],
        notes: 'Tres pratique quand tu veux finir dans la journee sans nuit blanche.',
      },
    ],
  },
  plat_de_cote: {
    id: 'plat_de_cote',
    label: 'Plat de cote',
    defaultWeightKg: 4,
    thicknessReferenceCm: 8,
    family: 'large_cut',
    targetTempC: 95,
    temperatureCues: {
      stallRangeC: [66, 74],
      wrapRangeC: [70, 76],
      probeStartC: 90,
      probeTenderRangeC: [92, 97],
      restMinutes: [45, 120],
    },
    visuals: [
      'Piece volumineuse: plus d’inertie qu’un paleron',
      'Bark puis vrai fondant au probe',
      'Repos utile pour calmer les jus avant tranche',
    ],
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 115,
        minutesPerKgRange: [180, 250],
        restMinutes: [30, 60],
        restTargetMin: 45,
        holdMinutes: [45, 180],
        wrapFriendly: true,
        wrapTemp: 72,
        wrapReduction: { none: 1, butcher_paper: 0.95, foil_boat: 0.93, foil: 0.9 },
        timelineWeights: [0.42, 0.16, 0.42],
        notes: 'Se rapproche des beef ribs cote planning.',
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [135, 152],
        smokerTempDefault: 140,
        minutesPerKgRange: [110, 155],
        restMinutes: [30, 75],
        restTargetMin: 45,
        holdMinutes: [20, 90],
        wrapFriendly: true,
        wrapTemp: 72,
        wrapReduction: { none: 1, butcher_paper: 0.95, foil_boat: 0.92, foil: 0.89 },
        timelineWeights: [0.46, 0.1, 0.44],
        notes: 'Bascule utile si tu veux garder une bark propre sans nuit entiere.',
      },
    ],
  },
  lamb_shoulder: {
    id: 'lamb_shoulder',
    label: "Epaule d'agneau",
    defaultWeightKg: 3.2,
    thicknessReferenceCm: 8,
    family: 'large_cut',
    targetTempC: 94,
    temperatureCues: {
      stallRangeC: [66, 74],
      wrapRangeC: [72, 78],
      probeStartC: 88,
      probeTenderRangeC: [90, 96],
      restMinutes: [30, 90],
    },
    visuals: [
      'Comportement voisin du pulled pork mais plus souple',
      'Texture fondante plutot qu’un chiffre sec',
      'Wrap utile si bark deja jolie et repas approche',
    ],
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 115,
        minutesPerKgRange: [115, 170],
        restMinutes: [30, 60],
        restTargetMin: 45,
        holdMinutes: [30, 120],
        wrapFriendly: true,
        wrapTemp: 75,
        wrapReduction: { none: 1, butcher_paper: 0.95, foil_boat: 0.93, foil: 0.88 },
        timelineWeights: [0.42, 0.14, 0.44],
        notes: 'Approche terrain proche des epaules longues mais moins lourde a planifier.',
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [121, 149],
        smokerTempDefault: 135,
        minutesPerKgRange: [90, 130],
        restMinutes: [20, 60],
        restTargetMin: 30,
        holdMinutes: [20, 90],
        wrapFriendly: true,
        wrapTemp: 75,
        wrapReduction: { none: 1, butcher_paper: 0.96, foil_boat: 0.93, foil: 0.9 },
        timelineWeights: [0.45, 0.1, 0.45],
        notes: 'Bon compromis pour un repas du soir sans depart en pleine nuit.',
      },
    ],
  },
  whole_chicken: {
    id: 'whole_chicken',
    label: 'Poulet entier',
    defaultWeightKg: 1.8,
    thicknessReferenceCm: 5,
    family: 'roast',
    targetTempC: 74,
    temperatureCues: {
      stallRangeC: null,
      wrapRangeC: null,
      probeStartC: 70,
      probeTenderRangeC: [73, 76],
      restMinutes: [10, 20],
    },
    visuals: [
      'Peau bien doree',
      'Jus clairs dans la partie la plus epaisse',
      'Repos court avant decoupe',
    ],
    methods: [
      {
        method: 'hot_and_fast',
        smokerTempRange: [149, 177],
        smokerTempDefault: 160,
        minutesPerKgRange: [55, 85],
        restMinutes: [10, 20],
        restTargetMin: 15,
        holdMinutes: [0, 30],
        wrapFriendly: false,
        wrapTemp: null,
        wrapReduction: { none: 1 },
        timelineWeights: [0.62, 0, 0.38],
        notes: 'La volaille aime la temperature plus haute pour la peau.',
      },
      {
        method: 'low_and_slow',
        smokerTempRange: [121, 149],
        smokerTempDefault: 135,
        minutesPerKgRange: [70, 105],
        restMinutes: [10, 20],
        restTargetMin: 15,
        holdMinutes: [0, 30],
        wrapFriendly: false,
        wrapTemp: null,
        wrapReduction: { none: 1 },
        timelineWeights: [0.64, 0, 0.36],
        notes: 'Possible, mais moins pertinent si tu veux une peau propre.',
      },
    ],
  },
  chicken_pieces: {
    id: 'chicken_pieces',
    label: 'Cuisses de poulet',
    defaultWeightKg: 1.2,
    thicknessReferenceCm: 4,
    family: 'roast',
    targetTempC: 76,
    temperatureCues: {
      stallRangeC: null,
      wrapRangeC: null,
      probeStartC: 72,
      probeTenderRangeC: [75, 79],
      restMinutes: [5, 10],
    },
    visuals: [
      'Peau coloree et bien sechee',
      'Chair encore juteuse',
      'Repos tres court seulement',
    ],
    methods: [
      {
        method: 'hot_and_fast',
        smokerTempRange: [149, 190],
        smokerTempDefault: 165,
        minutesPerKgRange: [45, 70],
        restMinutes: [5, 10],
        restTargetMin: 8,
        holdMinutes: [0, 20],
        wrapFriendly: false,
        wrapTemp: null,
        wrapReduction: { none: 1 },
        timelineWeights: [0.68, 0, 0.32],
        notes: 'Le plus simple et le plus propre pour cuisses et pilons.',
      },
    ],
  },
  lamb_leg: {
    id: 'lamb_leg',
    label: "Gigot d'agneau",
    defaultWeightKg: 2.5,
    thicknessReferenceCm: 7,
    family: 'roast',
    targetTempC: 60,
    temperatureCues: {
      stallRangeC: null,
      wrapRangeC: null,
      probeStartC: 54,
      probeTenderRangeC: [57, 63],
      restMinutes: [15, 30],
    },
    visuals: [
      'Traitement de roti, pas d’epaule a effilocher',
      'Thermometre et repos plus utiles qu’un horaire detaille',
      'Belle cuisson rosée au centre',
    ],
    methods: [
      {
        method: 'hot_and_fast',
        smokerTempRange: [121, 149],
        smokerTempDefault: 135,
        minutesPerKgRange: [50, 80],
        restMinutes: [15, 30],
        restTargetMin: 20,
        holdMinutes: [10, 45],
        wrapFriendly: false,
        wrapTemp: null,
        wrapReduction: { none: 1 },
        timelineWeights: [0.62, 0, 0.38],
        notes: 'Pilotage type roti rosé, pas cuisson a effilocher.',
      },
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 115,
        minutesPerKgRange: [65, 95],
        restMinutes: [15, 30],
        restTargetMin: 20,
        holdMinutes: [10, 45],
        wrapFriendly: false,
        wrapTemp: null,
        wrapReduction: { none: 1 },
        timelineWeights: [0.64, 0, 0.36],
        notes: 'Version plus douce pour garder un centre encore tendre.',
      },
    ],
  },
}

export const STEAK_PROFILES = {
  cote_de_boeuf: {
    label: 'Cote de boeuf',
    reverseSearMinCm: 3.5,
    indirectTempRangeC: [105, 121],
    indirectTempDefaultC: 110,
    indirectMinPerCmRange: [11, 16],
    searMinPerFaceRange: [1.5, 2.5],
    restMin: 10,
    defaultThicknessCm: 5,
    defaultDoneness: 'medium_rare',
  },
  tomahawk: {
    label: 'Tomahawk',
    reverseSearMinCm: 3.5,
    indirectTempRangeC: [105, 121],
    indirectTempDefaultC: 110,
    indirectMinPerCmRange: [12, 17],
    searMinPerFaceRange: [2, 3],
    restMin: 10,
    defaultThicknessCm: 5.5,
    defaultDoneness: 'medium_rare',
  },
  picanha: {
    label: 'Picanha',
    reverseSearMinCm: 3,
    indirectTempRangeC: [105, 121],
    indirectTempDefaultC: 110,
    indirectMinPerCmRange: [10, 14],
    searMinPerFaceRange: [1.5, 2.5],
    restMin: 5,
    defaultThicknessCm: 3.5,
    defaultDoneness: 'medium_rare',
  },
  tri_tip: {
    label: 'Tri-tip',
    reverseSearMinCm: 3,
    indirectTempRangeC: [105, 121],
    indirectTempDefaultC: 110,
    indirectMinPerCmRange: [11, 15],
    searMinPerFaceRange: [1.5, 2.5],
    restMin: 10,
    defaultThicknessCm: 4,
    defaultDoneness: 'medium_rare',
  },
  entrecote: {
    label: 'Entrecote',
    reverseSearMinCm: 3,
    indirectTempRangeC: [105, 121],
    indirectTempDefaultC: 110,
    indirectMinPerCmRange: [10, 14],
    searMinPerFaceRange: [1.25, 2],
    restMin: 5,
    defaultThicknessCm: 3,
    defaultDoneness: 'medium_rare',
  },
}

const KEY_ALIASES = {
  pulled_pork: 'pork_shoulder',
  spare_ribs: 'ribs_pork',
  baby_back_ribs: 'ribs_baby_back',
  beef_short_ribs: 'ribs_beef',
  chuck_roast: 'paleron',
}

function getCanonicalProfile(meatKey) {
  const normalized = KEY_ALIASES[meatKey] || meatKey
  return LONG_COOK_PROFILES[normalized] || null
}

function getThicknessReference(meatKey) {
  return getCanonicalProfile(meatKey)?.thicknessReferenceCm || 7
}

function estimateWeightThickness(weightKg, meatKey) {
  const safeWeightKg = clamp(toNumber(weightKg, 3), 0.3, 30)
  const reference = getThicknessReference(meatKey)
  if (meatKey === 'ribs_pork' || meatKey === 'ribs_baby_back') return reference
  const thickness = reference * Math.pow(safeWeightKg / Math.max(getCanonicalProfile(meatKey)?.defaultWeightKg || 3, 0.1), 0.33)
  return Number(clamp(thickness, 2, 20).toFixed(1))
}

function buildScenarioProfile(profile, options = {}) {
  if (profile.id !== 'lamb_leg' || options.lambLegStyle !== 'pulled') return profile

  return {
    ...profile,
    label: "Gigot d'agneau effiloche",
    targetTempC: 95,
    temperatureCues: {
      stallRangeC: [66, 74],
      wrapRangeC: [72, 77],
      probeStartC: 90,
      probeTenderRangeC: [93, 97],
      restMinutes: [30, 75],
    },
    visuals: [
      "Traite le gigot comme une petite epaule si tu veux l'effilocher",
      "Bark d'abord, puis wrap si besoin",
      'Texture filandreuse et moelleuse avant sortie',
    ],
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 115,
        minutesPerKgRange: [130, 190],
        restMinutes: [30, 75],
        restTargetMin: 45,
        holdMinutes: [20, 90],
        wrapFriendly: true,
        wrapTemp: 74,
        wrapReduction: { none: 1, butcher_paper: 0.94, foil_boat: 0.91, foil: 0.88 },
        timelineWeights: [0.42, 0.16, 0.42],
        notes: "Version effilochee: logique proche d'une epaule d'agneau compacte.",
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [121, 149],
        smokerTempDefault: 135,
        minutesPerKgRange: [95, 145],
        restMinutes: [20, 60],
        restTargetMin: 30,
        holdMinutes: [15, 60],
        wrapFriendly: true,
        wrapTemp: 74,
        wrapReduction: { none: 1, butcher_paper: 0.96, foil_boat: 0.93, foil: 0.9 },
        timelineWeights: [0.46, 0.1, 0.44],
        notes: "Version plus rapide pour un effilochage sans cuisson de nuit.",
      },
    ],
  }
}

function weightInertiaFactor(weightKg, profile) {
  const threshold = Math.max((profile.defaultWeightKg || 3) + 1.5, 4.5)
  if (weightKg <= threshold) return 1
  return clamp(1 + (weightKg - threshold) * 0.012, 1, 1.06)
}

function thicknessFactor(thicknessCm, profile) {
  const reference = profile.thicknessReferenceCm || 7
  const ratio = clamp(thicknessCm / Math.max(reference, 1), 0.75, 1.25)
  return clamp(1 + (ratio - 1) * 0.08, 0.96, 1.05)
}

function interpolateCookValue(range, smokerTempRange, smokerTempC) {
  if (!Array.isArray(range) || range.length !== 2) return 0
  const [rangeMin, rangeMax] = range
  const [tempMin, tempMax] = smokerTempRange
  const safeTemp = clamp(toNumber(smokerTempC, avg(tempMin, tempMax)), tempMin, tempMax)
  const normalized = (safeTemp - tempMin) / Math.max(tempMax - tempMin, 1)
  const curved = Math.pow(clamp(normalized, 0, 1), 0.7)
  return rangeMax + (rangeMin - rangeMax) * curved
}

function getMethodProfile(profile, requestedMethod = null, smokerTempC = null) {
  if (requestedMethod && profile.methods.some((entry) => entry.method === requestedMethod)) {
    return profile.methods.find((entry) => entry.method === requestedMethod)
  }

  if (requestedMethod === 'reverse_sear') return profile.methods[0]

  if (smokerTempC != null) {
    const hotMethod = profile.methods.find((entry) => entry.method === 'hot_and_fast')
    if (hotMethod && smokerTempC >= hotMethod.smokerTempRange[0]) return hotMethod
  }

  return profile.methods[0]
}

function buildCompatProfiles() {
  return Object.fromEntries(
    Object.entries(LONG_COOK_PROFILES).map(([key, profile]) => {
      const defaultMethod = profile.methods[0]
      return [
        key,
        {
          id: key,
          label: profile.label,
          tempTarget: profile.targetTempC,
          defaultWeightKg: profile.defaultWeightKg,
          temperatureCues: {
            stallRangeC: profile.temperatureCues.stallRangeC,
            wrapRangeC: profile.temperatureCues.wrapRangeC,
            probeStartC: profile.temperatureCues.probeStartC,
            probeTenderRangeC: profile.temperatureCues.probeTenderRangeC,
            restMinutes: profile.temperatureCues.restMinutes,
          },
          methods: profile.methods.map((method) => ({
            method: method.method,
            smokerTempRange: method.smokerTempRange,
            smokerTempDefault: method.smokerTempDefault,
            minutesPerKg: method.minutesPerKgRange ? [...method.minutesPerKgRange] : [0, 0],
            stallRange: profile.temperatureCues.stallRangeC,
            stallDurationMin: round(avg(...method.timelineWeights.slice(1, 2).map((weight) => weight * 100)) || 0),
            wrapTemp: method.wrapTemp,
            wrapTimeSavedPercent: round((1 - (method.wrapReduction?.butcher_paper || 1)) * 100),
            restMinutes: method.restMinutes,
            fixedTotalMinutes: method.fixedCookRange ? [...method.fixedCookRange] : null,
            notes: method.notes,
          })),
          meta: {
            family: profile.family,
            holdMinutes: defaultMethod.holdMinutes,
            visuals: profile.visuals,
          },
        },
      ]
    }),
  )
}

export const PITMASTER_PROFILES = buildCompatProfiles()

export const PHASE_BASES = Object.fromEntries(
  Object.entries(PITMASTER_PROFILES).map(([key, profile]) => [
    key,
    {
      label: profile.label,
      method: profile.methods[0]?.method || 'low_and_slow',
      stallStartC: profile.temperatureCues.stallRangeC?.[0] ?? null,
      targetC: profile.tempTarget ?? null,
      wrapTempC: profile.methods.find((entry) => entry.wrapTemp)?.wrapTemp ?? null,
      rest: avg(...profile.temperatureCues.restMinutes),
      restMax: profile.temperatureCues.restMinutes?.[1] ?? avg(...profile.temperatureCues.restMinutes),
    },
  ]),
)

let runtimeProfiles = null

export function setRuntimeCalculatorProfiles(profiles) {
  runtimeProfiles = profiles && typeof profiles === 'object' ? profiles : null
}

export function clearRuntimeCalculatorProfiles() {
  runtimeProfiles = null
}

export function buildRuntimeProfilesFromCatalog(catalog = {}) {
  const meats = Array.isArray(catalog.meats) ? catalog.meats : []
  const methods = Array.isArray(catalog.methods) ? catalog.methods : []
  if (!meats.length || !methods.length) return null

  const profiles = {}
  meats
    .filter((meat) => meat.is_active !== false)
    .forEach((meat) => {
      const meatMethods = methods
        .filter((method) => method.meat_id === meat.id && method.is_active !== false)
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))

      if (!meatMethods.length) return

      profiles[meat.slug] = {
        id: meat.slug,
        label: meat.name,
        tempTarget: meatMethods[0]?.target_internal_temp ?? null,
        defaultWeightKg: Number(meat.default_weight_kg) || 3,
        temperatureCues: {
          stallRangeC: meatMethods[0]?.stall_min != null && meatMethods[0]?.stall_max != null ? [meatMethods[0].stall_min, meatMethods[0].stall_max] : null,
          wrapRangeC: meatMethods[0]?.wrap_temp != null ? [Math.max(meatMethods[0].wrap_temp - 3, 0), meatMethods[0].wrap_temp + 3] : null,
          probeStartC: meatMethods[0]?.probe_start_temp ?? null,
          probeTenderRangeC: meatMethods[0]?.target_internal_temp_min != null && meatMethods[0]?.target_internal_temp_max != null
            ? [meatMethods[0].target_internal_temp_min, meatMethods[0].target_internal_temp_max]
            : meatMethods[0]?.target_internal_temp != null
              ? [Math.max(meatMethods[0].target_internal_temp - 2, 0), meatMethods[0].target_internal_temp]
              : null,
          restMinutes: meatMethods[0]?.rest_min != null && meatMethods[0]?.rest_max != null
            ? [meatMethods[0].rest_min, meatMethods[0].rest_max]
            : [30, 60],
        },
        methods: meatMethods.map((method) => ({
          method: method.method_key,
          smokerTempRange: [method.smoker_temp_min, method.smoker_temp_max],
          smokerTempDefault: method.smoker_temp_default,
          minutesPerKg: [
            method.high_temp_minutes_per_kg ?? 120,
            method.low_temp_minutes_per_kg ?? 180,
          ],
          stallRange: method.stall_min != null && method.stall_max != null ? [method.stall_min, method.stall_max] : null,
          stallDurationMin: method.stall_duration_min ?? 0,
          wrapTemp: method.wrap_temp ?? null,
          wrapTimeSavedPercent: method.wrap_time_saved_percent ?? 0,
          restMinutes: method.rest_min != null && method.rest_max != null ? [method.rest_min, method.rest_max] : [30, 60],
          fixedTotalMinutes: method.fixed_total_min != null && method.fixed_total_max != null ? [method.fixed_total_min, method.fixed_total_max] : null,
          notes: method.notes || '',
        })),
      }
    })

  return Object.keys(profiles).length ? profiles : null
}

function getCompatProfile(meatKey) {
  const source = runtimeProfiles || PITMASTER_PROFILES
  return source[meatKey] || source[KEY_ALIASES[meatKey]] || null
}

export function getCookingProfile(meatKey) {
  return getCompatProfile(meatKey)
}

export function getMethodConfig(meatKey, method = null) {
  const profile = getCompatProfile(meatKey)
  if (!profile) return null
  const methodProfile = profile.methods.find((entry) => entry.method === method) || profile.methods[0]
  return {
    method: methodProfile.method,
    methodLabel: METHOD_LABELS[methodProfile.method] || methodProfile.method,
    smokerTempRange: methodProfile.smokerTempRange,
    smokerTempDefault: methodProfile.smokerTempDefault,
    wrapTemp: methodProfile.wrapTemp,
    notes: methodProfile.notes,
  }
}

function buildCues(profile, methodProfile, wrapType) {
  const wrapRange = wrapType !== 'none' && profile.temperatureCues.wrapRangeC
    ? profile.temperatureCues.wrapRangeC
    : profile.temperatureCues.wrapRangeC

  if (profile.family === 'ribs') {
    return {
      style: 'visual',
      stallRange: null,
      wrapRange: null,
      probeStart: null,
      probeTenderRange: null,
      restRange: formatRange(methodProfile.restMinutes, ' min'),
      visuals: profile.visuals,
    }
  }

  return {
    style: 'temperature_and_visual',
    stallRange: formatRange(profile.temperatureCues.stallRangeC),
    wrapRange: wrapType !== 'none' ? formatRange(wrapRange) : formatRange(profile.temperatureCues.wrapRangeC),
    probeStart: formatSingleOrRange(profile.temperatureCues.probeStartC),
    probeTenderRange: formatSingleOrRange(profile.temperatureCues.probeTenderRangeC),
    restRange: formatRange(methodProfile.restMinutes, ' min'),
    visuals: profile.visuals,
  }
}

export function estimateThickness(weightKg, meatKey) {
  return estimateWeightThickness(weightKg, KEY_ALIASES[meatKey] || meatKey)
}

function getDisplayStep(totalMinutes) {
  if (totalMinutes >= 480) return 30
  if (totalMinutes >= 120) return 15
  return 5
}

function calculateCookRange(profile, methodProfile, weightKg, options) {
  const smokerTypeFactor = BASE_COEFFS.smoker[options.smokerType || 'pellet'] ?? 1
  const marblingFactor = BASE_COEFFS.marbling[options.marbling || 'medium'] ?? 1
  const thicknessCm = parseOptionalNumber(options.thicknessCm, estimateWeightThickness(weightKg, profile.id))
  const thicknessAdj = thicknessFactor(thicknessCm, profile)
  const inertiaAdj = weightInertiaFactor(weightKg, profile)
  const wrapFactor = methodProfile.fixedCookRange
    ? 1
    : methodProfile.wrapFriendly
    ? (methodProfile.wrapReduction?.[options.wrapType || 'none'] ?? 1)
    : 1

  const totalFactor = methodProfile.fixedCookRange
    ? clamp(smokerTypeFactor, 0.94, 1.08)
    : clamp(smokerTypeFactor * marblingFactor * thicknessAdj * inertiaAdj * wrapFactor, 0.82, 1.18)

  let probableCook
  let variability

  if (methodProfile.fixedCookRange) {
    const baseCook = avg(...methodProfile.fixedCookRange)
    probableCook = round(clamp(baseCook * totalFactor, 20, 24 * 60))
    variability = Math.max(18, round(probableCook * 0.12))
  } else {
    const baseMinutesPerKg = interpolateCookValue(
      methodProfile.minutesPerKgRange,
      methodProfile.smokerTempRange,
      options.smokerTempC,
    )
    let baseCook = weightKg * baseMinutesPerKg
    if (weightKg > 6) baseCook *= 1 + (weightKg - 6) * 0.03
    probableCook = round(clamp(baseCook * totalFactor, 20, 24 * 60))
    variability = Math.max(20, round(probableCook * 0.12))
  }

  return {
    thicknessCm,
    probableCookMin: probableCook,
    cookMin: round(clamp(probableCook - variability, 20, 24 * 60)),
    cookMax: round(clamp(probableCook + variability, 25, 30 * 60)),
    factors: {
      smokerTypeFactor: Number(smokerTypeFactor.toFixed(3)),
      marblingFactor: Number(marblingFactor.toFixed(3)),
      thicknessAdj: Number(thicknessAdj.toFixed(3)),
      inertiaAdj: Number(inertiaAdj.toFixed(3)),
      wrapFactor: Number(wrapFactor.toFixed(3)),
    },
  }
}

function buildPhaseMinutes(profile, methodProfile, probableCookMin, wrapType) {
  const [phaseOneWeight, stallWeight] = methodProfile.timelineWeights
  const effectiveStallWeight = profile.temperatureCues.stallRangeC ? stallWeight : 0
  const barkMin = round(probableCookMin * phaseOneWeight)
  const stallMin = round(probableCookMin * effectiveStallWeight)
  const finishMin = Math.max(probableCookMin - barkMin - stallMin, 10)

  if (profile.family === 'ribs') {
    if (wrapType !== 'none') {
      const first = round(probableCookMin * 0.48)
      const second = round(probableCookMin * 0.28)
      return {
        phase1Min: first,
        stallMin: 0,
        phase3Min: Math.max(probableCookMin - first - second, 10),
        wrappedPhaseMin: second,
      }
    }

    return {
      phase1Min: round(probableCookMin * 0.54),
      stallMin: 0,
      phase3Min: round(probableCookMin * 0.46),
      wrappedPhaseMin: 0,
    }
  }

  return {
    phase1Min: barkMin,
    stallMin,
    phase3Min: finishMin,
    wrappedPhaseMin: 0,
  }
}

export function calculateLowSlow(meatKey, weightKg, options = {}, approvedAdjustments = {}) {
  const baseProfile = getCanonicalProfile(meatKey)
  const profile = baseProfile ? buildScenarioProfile(baseProfile, options) : null
  if (!profile) throw new Error(`Viande inconnue : ${meatKey}`)

  const safeWeightKg = clamp(toNumber(weightKg, profile.defaultWeightKg), 0.3, 30)
  const methodProfile = getMethodProfile(profile, options.method, options.smokerTempC)
  const smokerTempC = clamp(toNumber(options.smokerTempC, methodProfile.smokerTempDefault), methodProfile.smokerTempRange[0], methodProfile.smokerTempRange[1])
  const wrapType = methodProfile.wrapFriendly ? (options.wrapType || 'none') : 'none'
  const preheatMin = profile.family === 'roast' ? 20 : 30
  const adjustmentHook = clamp(toNumber(approvedAdjustments.global, 1), 0.9, 1.1)

  const cookRange = calculateCookRange(profile, methodProfile, safeWeightKg, {
    ...options,
    smokerTempC,
    wrapType,
  })

  const cookMin = round(cookRange.cookMin * adjustmentHook)
  const cookMax = round(cookRange.cookMax * adjustmentHook)
  const probableCookMin = round(cookRange.probableCookMin * adjustmentHook)
  const restRange = [...methodProfile.restMinutes]
  const restMin = round(methodProfile.restTargetMin ?? avg(...restRange))
  const holdRange = methodProfile.holdMinutes || [0, 0]
  const optimisticMin = preheatMin + cookMin + restMin
  const prudentMin = preheatMin + cookMax + restMin
  const probableMin = preheatMin + probableCookMin + restMin
  const phases = buildPhaseMinutes(profile, methodProfile, probableCookMin, wrapType)
  const cues = buildCues(profile, methodProfile, wrapType)

  return {
    meatKey: profile.id,
    meatLabel: profile.label,
    method: methodProfile.method,
    methodLabel: METHOD_LABELS[methodProfile.method] || methodProfile.method,
    methodVariantLabel: wrapType !== 'none' ? `${METHOD_LABELS[methodProfile.method]} + wrap` : METHOD_LABELS[methodProfile.method],
    methodProfile,
    weightKg: safeWeightKg,
    weightLb: Number((safeWeightKg * KG_TO_LB).toFixed(1)),
    thicknessCm: cookRange.thicknessCm,
    smokerTempC,
    smokerType: options.smokerType || 'pellet',
    wrapType,
    marbling: options.marbling || 'medium',
    targetTempC: profile.targetTempC,
    targetC: profile.targetTempC,
    wrapTempC: wrapType !== 'none' ? methodProfile.wrapTemp : null,
    stallStartC: profile.temperatureCues.stallRangeC?.[0] ?? null,
    preheatMin,
    cookMin: probableCookMin,
    cookMinMin: cookMin,
    cookMinMax: cookMax,
    restMin,
    restMinMin: restRange[0],
    restMinMax: restRange[1],
    holdMinMin: holdRange[0],
    holdMinMax: holdRange[1],
    bufferMin: 0,
    totalMin: probableMin,
    probableMin,
    optimisticMin,
    prudentMin,
    variancePct: Math.max(10, round(((prudentMin - optimisticMin) / Math.max(probableMin, 1)) * 100)),
    varianceMin: round((prudentMin - optimisticMin) / 2),
    phase1Min: phases.phase1Min,
    stallMin: phases.stallMin,
    phase3Min: phases.phase3Min,
    wrappedPhaseMin: phases.wrappedPhaseMin,
    stallRangeC: profile.temperatureCues.stallRangeC,
    wrapRangeC: profile.temperatureCues.wrapRangeC,
    probeStartC: profile.temperatureCues.probeStartC,
    probeTenderRangeC: profile.temperatureCues.probeTenderRangeC,
    restRecommendation: formatRange(restRange, ' min'),
    holdRecommendation: formatRange(holdRange, ' min'),
    cues,
    notes: methodProfile.notes,
    coeffs: {
      ...cookRange.factors,
      adjustmentHook: Number(adjustmentHook.toFixed(3)),
    },
    meta: {
      family: profile.family,
      visuals: profile.visuals,
    },
  }
}

export function buildTimeline(calc, smokerTempC = null) {
  const safeTemp = round(toNumber(smokerTempC, calc.smokerTempC || 115))
  const steps = []

  if (calc.meta?.family === 'ribs') {
    steps.push({
      id: 'bark',
      label: 'Fumee / couleur',
      description: `Laisse le rack prendre sa couleur a ${safeTemp}°C sans le perturber inutilement.`,
      durationMin: calc.phase1Min,
      visualCueNote: 'Cherche une belle couleur et une surface bien prise.',
    })

    if (calc.wrapType !== 'none') {
      steps.push({
        id: 'wrap',
        label: 'Wrap facultatif',
        description: 'Emballe si la couleur te plait et si tu veux une texture plus fondante.',
        durationMin: calc.wrappedPhaseMin,
        visualCueNote: 'Le wrap sert a accelerer et attendrir, pas a suivre une heure magique.',
      })
    } else {
      steps.push({
        id: 'pullback',
        label: 'Pullback / retrait sur l’os',
        description: 'Observe le retrait de viande sur l’os et la souplesse du rack.',
        durationMin: round(calc.phase3Min * 0.45),
        visualCueNote: 'Le rack se retracte et commence a plier plus franchement.',
      })
    }

    steps.push({
      id: 'flex',
      label: 'Flex test',
      description: 'Le vrai repere de fin: le rack plie franchement et fissure legerement.',
      durationMin: calc.wrapType !== 'none' ? calc.phase3Min : Math.max(calc.phase3Min - round(calc.phase3Min * 0.45), 10),
      visualCueNote: 'Teste la souplesse plutot qu’une temperature de sortie.',
    })

    steps.push({
      id: 'rest',
      label: 'Repos court',
      description: `Repos recommande: ${calc.cues?.restRange || calc.restRecommendation}.`,
      durationMin: calc.restMin,
      isRest: true,
    })

    return steps
  }

  steps.push({
    id: 'bark',
    label: calc.meta?.family === 'roast' ? 'Cuisson principale' : 'Bark / phase principale',
    description: calc.meta?.family === 'roast'
      ? `Cuisson stable a ${safeTemp}°C jusqu’au coeur souhaite.`
      : `Laisse la couleur et la bark se construire a ${safeTemp}°C.`,
    durationMin: calc.phase1Min,
  })

  if (calc.stallRangeC) {
    steps.push({
      id: 'stall',
      label: 'Stall attendu',
      description: 'La courbe peut ralentir franchement. C’est normal sur ces grosses pieces.',
      durationMin: calc.stallMin,
      isStall: true,
    })
  }

  if (calc.wrapType !== 'none' && calc.wrapTempC) {
    steps.push({
      id: 'wrap',
      label: 'Wrap',
      description: 'Emballe quand la bark te plait. Le repere visuel prime sur l’horloge.',
      durationMin: 0,
    })
  }

  steps.push({
    id: 'probe',
    label: calc.meatKey === 'pork_shoulder' ? 'Tests d’effilochage' : 'Tests de tendrete',
    description: calc.meatKey === 'pork_shoulder'
      ? 'Commence a verifier la texture et non seulement la temperature.'
      : 'Commence a sonder. La sonde doit glisser presque sans resistance.',
    durationMin: calc.phase3Min,
  })

  steps.push({
    id: 'rest',
    label: 'Repos / hold',
    description: `Repos recommande: ${calc.cues?.restRange || calc.restRecommendation}.`,
    durationMin: calc.restMin,
    isRest: true,
  })

  return steps
}

export function recalibrate(calc, currentTempC, elapsedMin, currentPitTempC = null) {
  const safeElapsedMin = clamp(round(toNumber(elapsedMin, 0)), 0, 3 * 24 * 60)
  const currentInternal = parseOptionalNumber(currentTempC, null)

  if (currentInternal === null) {
    const remainingCookMin = Math.max(calc.cookMin - safeElapsedMin, 0)
    return {
      elapsedMin: safeElapsedMin,
      currentTempC: null,
      expectedTempC: null,
      deviation: null,
      currentPhase: 'Mesure manquante',
      remainingCookMin,
      remainingMin: remainingCookMin,
      remainingTotalMin: remainingCookMin + calc.restMin,
      remainingOptimistic: Math.max(remainingCookMin + calc.restMinMin - 15, calc.restMinMin),
      remainingPrudent: remainingCookMin + calc.restMinMax + 30,
      isAhead: false,
      isBehind: false,
      isAheadOfSchedule: false,
      isBehindSchedule: false,
      alert: 'Sonde interne absente. Recalage limite a la duree restante.',
      action: 'Rentre une temperature interne pour un recalage plus fiable.',
    }
  }

  const targetTemp = calc.targetTempC || calc.probeTenderRangeC?.[1] || calc.probeTenderRangeC?.[0] || 95
  const stallTemp = calc.stallRangeC?.[0] ?? Math.max(targetTemp - 22, 60)
  const safePit = currentPitTempC == null ? calc.smokerTempC : toNumber(currentPitTempC, calc.smokerTempC)
  const pitFactor = clamp((safePit || calc.smokerTempC) / Math.max(calc.smokerTempC || 110, 1), 0.88, 1.15)

  let expectedTemp = stallTemp
  let currentPhase = 'Cuisson'

  if (safeElapsedMin <= calc.phase1Min) {
    expectedTemp = 4 + ((stallTemp - 4) * safeElapsedMin) / Math.max(calc.phase1Min, 1)
    currentPhase = calc.meta?.family === 'roast' ? 'Cuisson principale' : 'Bark / montee'
  } else if (calc.stallMin > 0 && safeElapsedMin <= calc.phase1Min + calc.stallMin) {
    expectedTemp = stallTemp
    currentPhase = 'Stall'
  } else {
    const elapsedAfterStall = safeElapsedMin - calc.phase1Min - calc.stallMin
    expectedTemp = stallTemp + ((targetTemp - stallTemp) * elapsedAfterStall) / Math.max(calc.phase3Min, 1)
    currentPhase = 'Tests de tendrete'
  }

  const deviation = Number((currentInternal - expectedTemp).toFixed(1))
  const speedRatio = clamp((currentInternal + 1) / Math.max(expectedTemp + 1, 1), 0.72, 1.28)
  const remainingCookBase = Math.max(calc.cookMin - safeElapsedMin, 0)
  const remainingCookMin = round(Math.max((remainingCookBase / speedRatio) / pitFactor, 0))

  return {
    elapsedMin: safeElapsedMin,
    currentTempC: currentInternal,
    expectedTempC: Number(expectedTemp.toFixed(1)),
    deviation,
    speedRatio: Number(speedRatio.toFixed(2)),
    correction: Number((1 / pitFactor).toFixed(2)),
    currentPhase,
    remainingCookMin,
    remainingMin: remainingCookMin,
    remainingTotalMin: remainingCookMin + calc.restMin,
    remainingOptimistic: Math.max(remainingCookMin + calc.restMinMin - 15, calc.restMinMin),
    remainingPrudent: remainingCookMin + calc.restMinMax + 25,
    isAhead: deviation > 3,
    isBehind: deviation < -3,
    isAheadOfSchedule: deviation > 3,
    isBehindSchedule: deviation < -3,
    alert: deviation < -5
      ? 'Cuisson un peu en retard sur le scenario moyen.'
      : deviation > 5
        ? 'Cuisson un peu en avance sur le scenario moyen.'
        : null,
    action: deviation < -5
      ? calc.wrapType === 'none' && calc.wrapTempC
        ? 'Si la bark te plait, un wrap peut raccourcir la fin.'
        : 'Garde surtout un pit stable et evite les grosses corrections.'
      : deviation > 5
        ? 'Profite de l’avance pour offrir plus de repos.'
        : 'Continue a surveiller la texture et garde la cuisson stable.',
  }
}

export function hhmmToMinutes(value) {
  const [hours, minutes] = String(value || '19:00').split(':').map((part) => parseInt(part, 10))
  return (Number.isFinite(hours) ? hours : 19) * 60 + (Number.isFinite(minutes) ? minutes : 0)
}

export function minutesToClock(totalMinutes) {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function roundMinutesForDisplay(totalMinutes, step = 15) {
  return round(totalMinutes, step)
}

export function formatDuration(minutes) {
  const safeMinutes = Math.max(round(toNumber(minutes, 0)), 0)
  const hours = Math.floor(safeMinutes / 60)
  const mins = safeMinutes % 60
  if (!hours) return `${mins}min`
  if (!mins) return `${hours}h`
  return `${hours}h${String(mins).padStart(2, '0')}`
}

export function addMinutes(date, minutes) {
  const base = date instanceof Date && Number.isFinite(date.getTime()) ? date : new Date()
  return new Date(base.getTime() + toNumber(minutes, 0) * 60000)
}

export function roundToNearestHalfHour(date) {
  const safeDate = date instanceof Date && Number.isFinite(date.getTime()) ? new Date(date.getTime()) : new Date()
  const rounded = new Date(safeDate)
  const step = getDisplayStep(rounded.getHours() < 6 ? 480 : 180)
  const nextMinutes = round(rounded.getMinutes(), step)
  if (nextMinutes >= 60) rounded.setHours(rounded.getHours() + 1, 0, 0, 0)
  else rounded.setMinutes(nextMinutes, 0, 0)
  return rounded
}

export function formatDisplayTimeRounded(date) {
  const roundedDate = roundToNearestHalfHour(date)
  const hours = roundedDate.getHours()
  const minutes = roundedDate.getMinutes()
  return minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, '0')}`
}

export function formatTime(date) {
  return formatDisplayTimeRounded(date)
}

export function carryover(weightKg) {
  if (weightKg < 0.5) return 3
  if (weightKg < 2) return 5
  return 7
}

export function calculateSteak(meatKey, options = {}) {
  const profile = STEAK_PROFILES[meatKey]
  if (!profile) throw new Error(`Piece reverse sear inconnue : ${meatKey}`)

  const thicknessCm = clamp(toNumber(options.thicknessCm, profile.defaultThicknessCm), 1.5, 10)
  const smokerTempC = clamp(toNumber(options.smokerTempC, profile.indirectTempDefaultC), profile.indirectTempRangeC[0], profile.indirectTempRangeC[1])
  const doneness = DONENESS_BY_ID[options.donenessId] || DONENESS_BY_ID[profile.defaultDoneness]
  const indirectFactor = clamp(1 - ((smokerTempC - profile.indirectTempDefaultC) / 40) * 0.18, 0.82, 1.12)
  const indirectMin = round(thicknessCm * profile.indirectMinPerCmRange[0] * indirectFactor)
  const indirectMax = round(thicknessCm * profile.indirectMinPerCmRange[1] * indirectFactor)
  const probableIndirect = round(avg(indirectMin, indirectMax))
  const searPerFace = avg(...profile.searMinPerFaceRange)
  const searTotalMin = round(searPerFace * 2, 5)
  const totalMin = probableIndirect + searTotalMin + profile.restMin
  const useReverse = thicknessCm >= profile.reverseSearMinCm

  if (!useReverse) {
    return {
      method: 'direct',
      doneness,
      thicknessCm,
      pullTemp: doneness.tempPull,
      targetTemp: doneness.tempFinal,
      carryoverC: 3,
      cookMin: searTotalMin,
      restMin: profile.restMin,
      totalMin: searTotalMin + profile.restMin,
      optimisticMin: searTotalMin + Math.max(profile.restMin - 2, 3),
      probableMin: searTotalMin + profile.restMin,
      prudentMin: searTotalMin + profile.restMin + 3,
      phases: [
        {
          id: 'sear',
          label: 'Saisie directe',
          durationMin: searTotalMin,
          description: `Feu vif et controle a la sonde. Retire vers ${doneness.tempPull}°C.`,
          isCrisp: true,
        },
        {
          id: 'rest',
          label: 'Repos court',
          durationMin: profile.restMin,
          description: 'Laisse la piece se detendre avant de servir.',
          isRest: true,
        },
      ],
    }
  }

  return {
    method: 'reverse_sear',
    doneness,
    thicknessCm,
    pullTemp: doneness.tempPull,
    targetTemp: doneness.tempFinal,
    carryoverC: 3,
    cookMin: probableIndirect + searTotalMin,
    restMin: profile.restMin,
    totalMin,
    optimisticMin: indirectMin + searTotalMin + profile.restMin,
    probableMin: totalMin,
    prudentMin: indirectMax + searTotalMin + profile.restMin,
    phases: [
      {
        id: 'indirect',
        label: `Phase indirecte ${smokerTempC}°C`,
        durationMin: probableIndirect,
        description: `Monte doucement jusqu’a ${doneness.tempPull}°C avant la saisie.`,
      },
      {
        id: 'sear',
        label: 'Saisie finale',
        durationMin: searTotalMin,
        description: `Saisie tres chaude puis stop vers ${doneness.tempFinal}°C.`,
        isCrisp: true,
      },
      {
        id: 'rest',
        label: 'Repos court',
        durationMin: profile.restMin,
        description: 'Repos tres court avant service.',
        isRest: true,
      },
    ],
  }
}

export function validateInput(meatKey, weightKg, smokerTempC, thicknessCm = null) {
  const warnings = []
  const safeWeight = parseOptionalNumber(weightKg, null)
  const safeTemp = parseOptionalNumber(smokerTempC, null)
  const safeThickness = parseOptionalNumber(thicknessCm, null)

  if (safeWeight === null || safeWeight <= 0) {
    warnings.push('Poids invalide: renseigne une valeur positive.')
    return warnings
  }

  if (safeTemp === null) {
    warnings.push('Temperature fumoir absente: estimation basee sur la valeur de reference.')
  } else {
    if (safeTemp < 100) warnings.push('Temperature tres basse: prevois franchement plus large.')
    if (safeTemp > 165) warnings.push('Temperature haute: surveille davantage la coloration.')
    if ((meatKey === 'whole_chicken' || meatKey === 'chicken_pieces') && safeTemp < 145) {
      warnings.push('Volaille: en dessous de 145°C, la peau risque de rester molle.')
    }
  }

  if (safeThickness !== null) {
    if (safeThickness < 2) warnings.push('Piece tres fine: la cuisson peut aller plus vite que prevu.')
    if (safeThickness > 18) warnings.push('Piece tres epaisse: ajoute une vraie marge de service.')
  }

  if (meatKey === 'brisket' && safeWeight > 7) warnings.push('Grosse brisket: prevois une vraie marge et un hold confortable.')
  if (meatKey === 'pork_shoulder' && safeWeight > 6) warnings.push('Grosse epaule: le stall peut durer longtemps, surtout sans wrap.')
  if (meatKey === 'ribs_pork' || meatKey === 'ribs_baby_back') warnings.push('Sur les ribs, le bend test et le pullback valent mieux qu’une horloge.')

  return warnings
}

export function generateSuggestion(historySamples, meatKey, parameter) {
  if (!historySamples || historySamples.length < 3) return null
  const errors = historySamples.map((sample) => sample.error_pct).filter((value) => value != null)
  if (errors.length < 3) return null
  const avgError = errors.reduce((sum, value) => sum + value, 0) / errors.length
  return {
    category: meatKey || 'global',
    parameter,
    current_value: 1.0,
    suggested_value: Math.round(clamp(1 + (avgError / 100) * 0.2, 0.88, 1.12) * 1000) / 1000,
    sample_size: errors.length,
    confidence_score: Math.max(0, Math.round(100 - Math.abs(avgError) * 3)),
    rationale: `Erreur moyenne observee: ${avgError.toFixed(1)}% sur ${errors.length} cuissons.`,
    status: 'pending',
  }
}
