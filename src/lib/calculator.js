/**
 * PITMASTER ENGINE — Charbon & Flamme
 *
 * PATCH: refonte complète du moteur autour d'une logique pitmaster-first.
 * - base majoritairement issue des repères terrain
 * - méthodes low & slow / hot & fast
 * - wrap intégré comme variante du low & slow, pas comme 3e méthode visible
 * - pas de moteur pseudo-scientifique accumulatif
 * - front alimenté par :
 *   - heure de départ
 *   - fenêtre réaliste
 *   - repères température
 *   - repères visuels
 *   - checkpoints métier
 */

const KG_TO_LB = 2.20462

function toFiniteNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function parseNumericInput(value, fallback = null) {
  if (value === null || value === undefined || value === '') return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function normalizeDuration(value, fallback = 0, min = 0) {
  return Math.max(min, Math.round(toFiniteNumber(value, fallback)))
}

function safePositive(value, fallback, min = 0.1, max = Number.POSITIVE_INFINITY) {
  return clamp(toFiniteNumber(value, fallback), min, max)
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function avg(a, b) {
  return (a + b) / 2
}

function formatRange(range, unit = '°C') {
  if (!Array.isArray(range) || range.length < 2) return null
  return `${range[0]}${unit} – ${range[1]}${unit}`
}

function formatSingleOrRange(value, unit = '°C') {
  if (Array.isArray(value)) return formatRange(value, unit)
  if (value === null || value === undefined) return null
  return `${value}${unit}`
}

function isRibsCook(meatKey) {
  return meatKey === 'ribs_pork' || meatKey === 'ribs_baby_back' || meatKey === 'spare_ribs' || meatKey === 'baby_back_ribs'
}

// PATCH: référentiel pitmaster structuré par viande et par méthode
// PATCH: export explicite pour permettre la migration/seed Supabase du moteur BBQ
export const PITMASTER_PROFILES = {
  brisket: {
    id: 'brisket',
    label: 'Brisket',
    tempTarget: 96,
    defaultWeightKg: 5.5,
    temperatureCues: {
      stallRangeC: [65, 75],
      wrapRangeC: [66, 74],
      probeStartC: 90,
      probeTenderRangeC: [92, 97],
      restMinutes: [60, 120],
    },
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 110,
        // PATCH: recalage vers une médiane plus crédible croisée ThermoWorks / Hey Grill Hey / BBQ Québec / terrain
        minutesPerKg: [125, 165],
        stallRange: [66, 74],
        stallDurationMin: 120,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [60, 120],
        notes: 'Méthode Texas classique. Bark d’abord, puis probe tender. Le repos est essentiel.'
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [135, 163],
        smokerTempDefault: 149,
        minutesPerKg: [77, 110],
        stallRange: [66, 74],
        stallDurationMin: 45,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [60, 120],
        notes: 'Réduit fortement le temps, mais demande plus de rigueur sur la cuisson du flat.'
      },
      {
        method: 'texas_crutch',
        smokerTempRange: [107, 135],
        smokerTempDefault: 121,
        minutesPerKg: [120, 165],
        stallRange: [66, 74],
        stallDurationMin: 30,
        wrapTemp: 71,
        wrapTimeSavedPercent: 30,
        restMinutes: [60, 120],
        notes: 'Wrap à 71°C environ. Papier boucher recommandé pour préserver davantage la bark.'
      },
    ],
  },
  pork_shoulder: {
    id: 'pulled_pork',
    label: 'Épaule de porc (Pulled Pork)',
    tempTarget: 96,
    defaultWeightKg: 4.5,
    temperatureCues: {
      stallRangeC: [63, 74],
      wrapRangeC: [72, 75],
      probeStartC: 90,
      probeTenderRangeC: [92, 96],
      restMinutes: [60, 120],
    },
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 110,
        // PATCH: recalé vers le cluster terrain 225-250°F, sans gonfler artificiellement les épaules moyennes
        minutesPerKg: [150, 225],
        stallRange: [63, 74],
        stallDurationMin: 120,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [60, 120],
        notes: 'Le stall est normal. La texture finale compte plus qu’un chiffre magique.'
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [121, 149],
        smokerTempDefault: 135,
        minutesPerKg: [95, 145],
        stallRange: [63, 74],
        stallDurationMin: 60,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [60, 120],
        notes: 'Méthode très utilisée en compétition. Bark plus rapide, temps nettement réduit.'
      },
      {
        method: 'texas_crutch',
        smokerTempRange: [107, 135],
        smokerTempDefault: 121,
        minutesPerKg: [115, 170],
        stallRange: [63, 74],
        stallDurationMin: 20,
        wrapTemp: 74,
        wrapTimeSavedPercent: 35,
        restMinutes: [60, 120],
        notes: 'Fumer nu puis wrapper vers 74°C. Très bon compromis temps / moelleux.'
      },
    ],
  },
  ribs_pork: {
    id: 'spare_ribs',
    label: 'Spare Ribs',
    tempTarget: 96,
    defaultWeightKg: 2,
    temperatureCues: {
      stallRangeC: null,
      wrapRangeC: null,
      probeStartC: null,
      probeTenderRangeC: null,
      restMinutes: [10, 20],
    },
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 110,
        minutesPerKg: [220, 320],
        fixedTotalMinutes: [300, 390],
        stallRange: null,
        stallDurationMin: 0,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [10, 20],
        notes: 'Les spare ribs se jugent surtout à la couleur, au pullback et au bend test.'
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [121, 163],
        smokerTempDefault: 135,
        minutesPerKg: [160, 230],
        fixedTotalMinutes: [210, 270],
        stallRange: null,
        stallDurationMin: 0,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [10, 20],
        notes: '275°F et plus pour des ribs plus rapides et souvent très propres.'
      },
      {
        method: 'texas_crutch',
        smokerTempRange: [107, 121],
        smokerTempDefault: 110,
        minutesPerKg: [0, 0],
        fixedTotalMinutes: [330, 390],
        stallRange: null,
        stallDurationMin: 0,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [10, 20],
        notes: 'Méthode 3-2-1. Référence populaire, mais à ajuster selon la rack et la texture voulue.'
      },
    ],
  },
  ribs_baby_back: {
    id: 'baby_back_ribs',
    label: 'Baby Back Ribs',
    tempTarget: 96,
    defaultWeightKg: 1.6,
    temperatureCues: {
      stallRangeC: null,
      wrapRangeC: null,
      probeStartC: null,
      probeTenderRangeC: null,
      restMinutes: [10, 15],
    },
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 107,
        minutesPerKg: [180, 260],
        fixedTotalMinutes: [240, 300],
        stallRange: null,
        stallDurationMin: 0,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [10, 15],
        notes: 'Plus courtes et plus maigres que les spare ribs. Le flex test reste la vraie référence.'
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [121, 149],
        smokerTempDefault: 135,
        minutesPerKg: [135, 210],
        fixedTotalMinutes: [180, 240],
        stallRange: null,
        stallDurationMin: 0,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [10, 15],
        notes: 'Fonctionne très bien sur les baby back plus fines.'
      },
      {
        method: 'texas_crutch',
        smokerTempRange: [107, 121],
        smokerTempDefault: 110,
        minutesPerKg: [0, 0],
        fixedTotalMinutes: [270, 330],
        stallRange: null,
        stallDurationMin: 0,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [10, 15],
        notes: 'Méthode 2-2-1. Très utile comme squelette de cuisson, mais à ajuster au rendu souhaité.'
      },
    ],
  },
  ribs_beef: {
    id: 'beef_short_ribs',
    label: 'Beef Short Ribs',
    tempTarget: 96,
    defaultWeightKg: 3.5,
    temperatureCues: {
      stallRangeC: [66, 74],
      wrapRangeC: [71, 74],
      probeStartC: 92,
      probeTenderRangeC: [93, 98],
      restMinutes: [30, 60],
    },
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 110,
        minutesPerKg: [170, 240],
        stallRange: [66, 74],
        stallDurationMin: 90,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [30, 60],
        notes: 'Très tolérantes grâce au gras. Ne pas précipiter la sortie avant le vrai probe tender.'
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [135, 163],
        smokerTempDefault: 141,
        minutesPerKg: [95, 140],
        stallRange: [66, 74],
        stallDurationMin: 45,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [30, 60],
        notes: 'Très bons résultats à 275-285°F. Le gras pardonne beaucoup.'
      },
      {
        method: 'texas_crutch',
        smokerTempRange: [107, 135],
        smokerTempDefault: 121,
        minutesPerKg: [135, 190],
        stallRange: [66, 74],
        stallDurationMin: 30,
        wrapTemp: 71,
        wrapTimeSavedPercent: 25,
        restMinutes: [30, 60],
        notes: 'Le wrap ou le braisage peuvent accélérer la finition sur les grosses côtes.'
      },
    ],
  },
  plat_de_cote: {
    id: 'beef_short_ribs',
    label: 'Plat de côte',
    tempTarget: 96,
    defaultWeightKg: 4,
    temperatureCues: {
      stallRangeC: [66, 74],
      wrapRangeC: [71, 74],
      probeStartC: 90,
      probeTenderRangeC: [92, 97],
      restMinutes: [30, 60],
    },
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 110,
        minutesPerKg: [180, 250],
        stallRange: [66, 74],
        stallDurationMin: 90,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [30, 60],
        notes: 'Le plat de côte supporte bien une cuisson lente jusqu’à une texture fondante.'
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [135, 163],
        smokerTempDefault: 141,
        minutesPerKg: [105, 150],
        stallRange: [66, 74],
        stallDurationMin: 45,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [30, 60],
        notes: 'La montée en température plus franche fonctionne bien sur cette coupe généreuse.'
      },
      {
        method: 'texas_crutch',
        smokerTempRange: [107, 135],
        smokerTempDefault: 121,
        minutesPerKg: [145, 205],
        stallRange: [66, 74],
        stallDurationMin: 30,
        wrapTemp: 71,
        wrapTimeSavedPercent: 25,
        restMinutes: [30, 60],
        notes: 'La finition couverte aide à aller vite sur les grosses pièces sans trop dessécher.'
      },
    ],
  },
  paleron: {
    id: 'chuck_roast',
    label: 'Paleron / Chuck Roast',
    tempTarget: 96,
    defaultWeightKg: 2.2,
    temperatureCues: {
      stallRangeC: [66, 74],
      wrapRangeC: [71, 74],
      probeStartC: 91,
      probeTenderRangeC: [91, 96],
      restMinutes: [60, 120],
    },
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 110,
        minutesPerKg: [140, 210],
        stallRange: [66, 74],
        stallDurationMin: 60,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [60, 120],
        notes: 'Le poor man’s brisket. Plus tolérant que la poitrine, mais toujours piloté à la texture.'
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [121, 149],
        smokerTempDefault: 135,
        minutesPerKg: [90, 145],
        stallRange: [66, 74],
        stallDurationMin: 30,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [60, 120],
        notes: 'Finit souvent plus vite et plus proprement avec une cuisson un peu plus vive.'
      },
      {
        method: 'texas_crutch',
        smokerTempRange: [107, 135],
        smokerTempDefault: 121,
        minutesPerKg: [110, 165],
        stallRange: [66, 74],
        stallDurationMin: 15,
        wrapTemp: 74,
        wrapTimeSavedPercent: 30,
        restMinutes: [60, 120],
        notes: 'Le wrap ou la finition braisée marchent très bien sur le paleron.'
      },
    ],
  },
  lamb_shoulder: {
    id: 'lamb_shoulder',
    label: "Épaule d'agneau",
    tempTarget: 96,
    defaultWeightKg: 3.5,
    temperatureCues: {
      stallRangeC: [66, 74],
      wrapRangeC: [74, 77],
      probeStartC: [88, 90],
      probeTenderRangeC: [90, 96],
      restMinutes: [30, 60],
    },
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 121,
        minutesPerKg: [115, 170],
        stallRange: [66, 74],
        stallDurationMin: 60,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [30, 60],
        notes: 'Approche proche du pulled pork, avec un résultat un peu plus souple à interpréter selon la texture.'
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [121, 149],
        smokerTempDefault: 135,
        minutesPerKg: [75, 125],
        stallRange: [66, 74],
        stallDurationMin: 30,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [30, 60],
        notes: 'Très bon compromis si tu veux réduire le temps sans perdre la texture.'
      },
      {
        method: 'texas_crutch',
        smokerTempRange: [107, 135],
        smokerTempDefault: 121,
        minutesPerKg: [95, 145],
        stallRange: [66, 74],
        stallDurationMin: 20,
        wrapTemp: 74,
        wrapTimeSavedPercent: 30,
        restMinutes: [30, 60],
        notes: 'Le wrap vers 74°C aide beaucoup sur les épaules d’agneau plus grosses.'
      },
    ],
  },
  whole_chicken: {
    id: 'whole_chicken',
    label: 'Poulet entier',
    tempTarget: 74,
    defaultWeightKg: 1.8,
    temperatureCues: {
      stallRangeC: null,
      wrapRangeC: null,
      probeStartC: 70,
      probeTenderRangeC: [74, 76],
      restMinutes: [10, 20],
    },
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 135],
        smokerTempDefault: 121,
        minutesPerKg: [90, 130],
        stallRange: null,
        stallDurationMin: 0,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [10, 20],
        notes: 'Possible, mais la peau reste molle à basse température.'
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [135, 163],
        smokerTempDefault: 149,
        minutesPerKg: [55, 85],
        stallRange: null,
        stallDurationMin: 0,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [10, 20],
        notes: 'Méthode recommandée pour une peau plus propre et un meilleur résultat global.'
      },
      {
        method: 'texas_crutch',
        smokerTempRange: [121, 149],
        smokerTempDefault: 135,
        minutesPerKg: [65, 95],
        stallRange: null,
        stallDurationMin: 0,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [10, 20],
        notes: 'Peu utilisé en pratique sur le poulet entier.'
      },
    ],
  },
  chicken_pieces: {
    id: 'chicken_pieces',
    label: 'Cuisses / Pilons de poulet',
    tempTarget: 76,
    defaultWeightKg: 1.2,
    temperatureCues: {
      stallRangeC: null,
      wrapRangeC: null,
      probeStartC: 72,
      probeTenderRangeC: [74, 78],
      restMinutes: [5, 10],
    },
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 135],
        smokerTempDefault: 121,
        minutesPerKg: [90, 130],
        stallRange: null,
        stallDurationMin: 0,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [5, 10],
        notes: 'Les cuisses supportent bien les cuissons plus longues grâce au gras.'
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [135, 177],
        smokerTempDefault: 149,
        minutesPerKg: [45, 75],
        stallRange: null,
        stallDurationMin: 0,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [5, 10],
        notes: 'Méthode la plus propre pour une peau croustillante.'
      },
      {
        method: 'texas_crutch',
        smokerTempRange: [121, 149],
        smokerTempDefault: 135,
        minutesPerKg: [55, 85],
        stallRange: null,
        stallDurationMin: 0,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [5, 10],
        notes: 'Peu utile hors compétition.'
      },
    ],
  },
  lamb_leg: {
    id: 'lamb_leg',
    label: "Gigot d'agneau",
    tempTarget: 63,
    defaultWeightKg: 2.5,
    temperatureCues: {
      stallRangeC: null,
      wrapRangeC: null,
      probeStartC: 55,
      probeTenderRangeC: [57, 63],
      restMinutes: [15, 30],
    },
    methods: [
      {
        method: 'low_and_slow',
        smokerTempRange: [107, 121],
        smokerTempDefault: 110,
        minutesPerKg: [66, 100],
        stallRange: null,
        stallDurationMin: 0,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [15, 30],
        notes: 'Pour une version rosée / medium. Ne pas traiter comme une pièce à effilocher.'
      },
      {
        method: 'hot_and_fast',
        smokerTempRange: [121, 149],
        smokerTempDefault: 135,
        minutesPerKg: [44, 77],
        stallRange: null,
        stallDurationMin: 0,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [15, 30],
        notes: 'Très adaptée pour un gigot rosé plus court.'
      },
      {
        method: 'texas_crutch',
        smokerTempRange: [107, 135],
        smokerTempDefault: 121,
        minutesPerKg: [55, 88],
        stallRange: null,
        stallDurationMin: 0,
        wrapTemp: null,
        wrapTimeSavedPercent: 0,
        restMinutes: [15, 30],
        notes: 'Plutôt réservé à une version poussée, type effilochée.'
      },
    ],
  },
}

let runtimeProfiles = null

// PATCH: le moteur peut désormais être piloté par un catalogue Supabase, sans casser les appels existants.
export function setRuntimeCalculatorProfiles(profiles) {
  runtimeProfiles = profiles && typeof profiles === 'object' ? profiles : null
}

export function clearRuntimeCalculatorProfiles() {
  runtimeProfiles = null
}

export function buildRuntimeProfilesFromCatalog(catalog = {}) {
  const meats = Array.isArray(catalog.meats) ? catalog.meats : []
  const methods = Array.isArray(catalog.methods) ? catalog.methods : []
  const parameters = Array.isArray(catalog.parameters) ? catalog.parameters : []
  if (!meats.length || !methods.length) return null

  const paramsByMethodId = Object.fromEntries(parameters.map((entry) => [entry.method_id, entry]))
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
              ? meatMethods[0].target_internal_temp
              : null,
          restMinutes: meatMethods[0]?.rest_min != null && meatMethods[0]?.rest_max != null
            ? [meatMethods[0].rest_min, meatMethods[0].rest_max]
            : [30, 60],
        },
        methods: meatMethods.map((method) => {
          const param = paramsByMethodId[method.id]
          return {
            method: method.method_key,
            smokerTempRange: [method.smoker_temp_min, method.smoker_temp_max],
            smokerTempDefault: method.smoker_temp_default,
            minutesPerKg: param
              ? [param.high_temp_minutes_per_kg, param.low_temp_minutes_per_kg]
              : [method.high_temp_minutes_per_kg ?? 120, method.low_temp_minutes_per_kg ?? 180],
            stallRange: method.stall_min != null && method.stall_max != null ? [method.stall_min, method.stall_max] : null,
            stallDurationMin: method.stall_duration_min ?? 0,
            wrapTemp: method.wrap_temp ?? null,
            wrapTimeSavedPercent: method.wrap_time_saved_percent ?? 0,
            restMinutes: method.rest_min != null && method.rest_max != null ? [method.rest_min, method.rest_max] : [30, 60],
            fixedTotalMinutes: method.fixed_total_min != null && method.fixed_total_max != null ? [method.fixed_total_min, method.fixed_total_max] : null,
            notes: method.notes || '',
          }
        }),
      }
    })

  return Object.keys(profiles).length ? profiles : null
}

const METHOD_LABELS = {
  low_and_slow: 'Low & Slow',
  hot_and_fast: 'Hot & Fast',
}

// PATCH: seules les méthodes lisibles par un utilisateur restent visibles dans le front
export const COOKING_METHODS = [
  { id: 'low_and_slow', label: METHOD_LABELS.low_and_slow, short: 'Cuisson lente, bark propre, wrap possible si tu veux raccourcir la fin.' },
  { id: 'hot_and_fast', label: METHOD_LABELS.hot_and_fast, short: 'Plus direct, plus rapide, très utile sur volaille et grosses sessions.' },
]

const KEY_ALIASES = {
  pulled_pork: 'pork_shoulder',
  spare_ribs: 'ribs_pork',
  baby_back_ribs: 'ribs_baby_back',
  beef_short_ribs: 'ribs_beef',
  chuck_roast: 'paleron',
}

export const BASE_COEFFS = {
  smoker: { pellet:1.00, offset:1.03, kamado:0.97, electric:1.04, kettle:1.01 },
  wrap: { none:1.00, butcher_paper:0.95, foil_boat:0.92, foil:0.88 },
  temp: { 107:1.12, 115:1.05, 121:1.00, 130:0.92, 135:0.88 },
  marbling: { low:1.03, medium:1.00, high:0.98 },
}

// PATCH: export compatible conservé pour le front existant
export const PHASE_BASES = Object.fromEntries(
  Object.entries(PITMASTER_PROFILES)
    .filter(([key]) => ['brisket', 'pork_shoulder', 'ribs_beef', 'paleron', 'plat_de_cote', 'ribs_pork', 'ribs_baby_back', 'lamb_shoulder'].includes(key))
    .map(([key, profile]) => [
      key,
      {
        label: profile.label,
        method: 'lowslow',
        stallStartC: profile.temperatureCues.stallRangeC?.[0] ?? null,
        targetC: profile.tempTarget ?? null,
        wrapTempC: profile.methods.find(m => m.wrapTemp)?.wrapTemp ?? null,
        rest: avg(...profile.temperatureCues.restMinutes),
        restMax: profile.temperatureCues.restMinutes[1],
      },
    ])
)

function getProfile(meatKey) {
  const source = runtimeProfiles || PITMASTER_PROFILES
  return source[meatKey] || source[KEY_ALIASES[meatKey]] || null
}

// PATCH: helpers exportés pour garder la méthode et les plages de température cohérentes dans le front
export function getCookingProfile(meatKey) {
  return getProfile(meatKey)
}

function getMethodProfile(profile, method) {
  return profile.methods.find((entry) => entry.method === method) || profile.methods[0]
}

export function getMethodConfig(meatKey, method = null) {
  const profile = getProfile(meatKey)
  if (!profile) return null
  const resolvedMethod = inferMethod({ method })
  const methodProfile = getMethodProfile(profile, resolvedMethod)
  return {
    method: methodProfile.method,
    methodLabel: METHOD_LABELS[methodProfile.method],
    smokerTempRange: methodProfile.smokerTempRange,
    smokerTempDefault: methodProfile.smokerTempDefault,
    wrapTemp: methodProfile.wrapTemp ?? null,
    notes: methodProfile.notes,
  }
}

function inferMethod({ method = null, smokerTempC = 110 } = {}) {
  if (method === 'texas_crutch') return 'low_and_slow'
  if (method && METHOD_LABELS[method]) return method
  if (toFiniteNumber(smokerTempC, 110) >= 130) return 'hot_and_fast'
  return 'low_and_slow'
}

// PATCH: le wrap vit dans le low & slow; on réutilise les profils texas crutch seulement comme métadonnées de gain
function getWrapPlan(profile, method, wrapType, lambLegStyle = 'medium') {
  const wrapActive = method === 'low_and_slow' && wrapType !== 'none' && !(profile.id === 'lamb_leg' && lambLegStyle === 'medium')
  if (!wrapActive) return { active: false, fixedTotalMinutes: null, wrapTemp: null, wrapTimeSavedPercent: 0 }

  const crutchProfile = profile.methods.find((entry) => entry.method === 'texas_crutch')
  return {
    active: true,
    fixedTotalMinutes: crutchProfile?.fixedTotalMinutes || null,
    wrapTemp: crutchProfile?.wrapTemp ?? profile.temperatureCues.wrapRangeC?.[0] ?? null,
    wrapTimeSavedPercent: crutchProfile?.wrapTimeSavedPercent ?? 25,
  }
}

function inferThicknessClass(thicknessCm, meatKey, weightKg) {
  const estimated = thicknessCm ?? estimateThickness(weightKg, meatKey)
  const reference = isRibsCook(meatKey) ? 3.5 : meatKey === 'brisket' ? 10 : 7
  if (estimated <= reference * 0.82) return 'thin'
  if (estimated >= reference * 1.18) return 'thick'
  return 'normal'
}

function getThicknessAdjustment(thicknessClass) {
  if (thicknessClass === 'thin') return 0.95
  if (thicknessClass === 'thick') return 1.08
  return 1.0
}

function getTempAdjustment(smokerTempC) {
  const points = Object.entries(BASE_COEFFS.temp).map(([k, v]) => [Number(k), v]).sort((a, b) => a[0] - b[0])
  const safeTemp = clamp(toFiniteNumber(smokerTempC, 121), points[0][0], points[points.length - 1][0])
  for (let i = 0; i < points.length - 1; i += 1) {
    const [t1, f1] = points[i]
    const [t2, f2] = points[i + 1]
    if (safeTemp >= t1 && safeTemp <= t2) {
      const ratio = (safeTemp - t1) / Math.max(t2 - t1, 1)
      return lerp(f1, f2, ratio)
    }
  }
  return points[points.length - 1][1]
}

function getAdjustedMinutesPerKg(methodProfile, smokerTempC) {
  const [rangeMin, rangeMax] = methodProfile.smokerTempRange
  const temp = clamp(toFiniteNumber(smokerTempC, methodProfile.smokerTempDefault), rangeMin, rangeMax)
  const normalized = (temp - rangeMin) / Math.max(rangeMax - rangeMin, 1)
  const curved = Math.pow(clamp(normalized, 0, 1), 0.7)
  // PATCH: interpolation non linéaire officielle : plus de gain dans le bas de plage
  return methodProfile.minutesPerKg[1] + (methodProfile.minutesPerKg[0] - methodProfile.minutesPerKg[1]) * curved
}

function getCookMinutes(profile, methodProfile, weightKg, smokerTempC, lambLegStyle = 'medium', wrapPlan = { active: false }) {
  let cookMinutes

  if (wrapPlan.active && wrapPlan.fixedTotalMinutes) {
    cookMinutes = avg(wrapPlan.fixedTotalMinutes[0], wrapPlan.fixedTotalMinutes[1])
  } else if (methodProfile.fixedTotalMinutes) {
    cookMinutes = avg(methodProfile.fixedTotalMinutes[0], methodProfile.fixedTotalMinutes[1])
  } else {
    const adjustedMinPerKg = getAdjustedMinutesPerKg(methodProfile, smokerTempC)
    cookMinutes = weightKg * adjustedMinPerKg
  }

  // PATCH: très grosses pièces = légère inertie supplémentaire, jamais explosive
  if (weightKg > 6 && !methodProfile.fixedTotalMinutes) {
    cookMinutes *= 1 + (weightKg - 6) * 0.03
  }

  // PATCH: gigot effiloché = comportement proche d’une épaule
  if (profile.id === 'lamb_leg' && lambLegStyle === 'pulled') {
    cookMinutes *= 1.45
  }

  // PATCH: le wrap raccourcit seulement la partie post-stall, pas toute la cuisson
  if (wrapPlan.active && !wrapPlan.fixedTotalMinutes) {
    const materialFactor = wrapPlan.wrapType === 'foil' ? 1.0 : wrapPlan.wrapType === 'foil_boat' ? 0.85 : 0.72
    const totalReduction = clamp((wrapPlan.wrapTimeSavedPercent / 100) * 0.45 * materialFactor, 0.05, 0.18)
    cookMinutes *= (1 - totalReduction)
  }

  return cookMinutes
}

function buildCues(profile, methodProfile, wrapType, options = {}) {
  const temperatureCues = profile.temperatureCues
  const wrapRangeC = (options.wrapTemp ?? methodProfile.wrapTemp)
    ? [Math.max((options.wrapTemp ?? methodProfile.wrapTemp) - 3, 0), (options.wrapTemp ?? methodProfile.wrapTemp) + 3]
    : temperatureCues.wrapRangeC
  const lambLegStyle = options.lambLegStyle || 'medium'

  if (isRibsCook(profile.id)) {
    return {
      style: 'visual',
      stallRange: null,
      wrapRange: null,
      probeStart: null,
      probeTenderRange: null,
      restRange: formatRange(temperatureCues.restMinutes, ' min'),
      visuals: [
        'Couleur / bark',
        'Pullback / retrait sur l’os',
        wrapType !== 'none' ? 'Wrap facultatif' : 'Cuisson à nu',
        'Flex test',
        'Glaze optionnelle',
      ],
    }
  }

  if (profile.id === 'lamb_leg') {
    if (lambLegStyle === 'pulled') {
      return {
        style: 'temperature_and_visual',
        stallRange: formatRange([66, 74]),
        wrapRange: formatRange([71, 74]),
        probeStart: '90°C',
        probeTenderRange: '94°C – 97°C',
        restRange: formatRange([30, 60], ' min'),
        visuals: [
          'Bark / couleur',
          'Wrap utile si la surface te plaît',
          'Texture effilochable et moelleuse',
        ],
      }
    }

    return {
      style: 'temperature_and_visual',
      stallRange: null,
      wrapRange: null,
      probeStart: '55°C',
      probeTenderRange: '57°C – 63°C',
      restRange: formatRange([15, 30], ' min'),
      visuals: [
        'Belle couleur extérieure',
        'Cuisson rosée au centre',
        'Repos avant découpe',
      ],
    }
  }

  return {
    style: 'temperature_and_visual',
    stallRange: formatRange(temperatureCues.stallRangeC),
    wrapRange: wrapType !== 'none' || options.wrapTemp || methodProfile.wrapTemp ? formatRange(wrapRangeC) : formatRange(temperatureCues.wrapRangeC),
    probeStart: formatSingleOrRange(temperatureCues.probeStartC),
    probeTenderRange: formatSingleOrRange(temperatureCues.probeTenderRangeC),
    restRange: formatRange(temperatureCues.restMinutes, ' min'),
    visuals: [
      'Couleur / bark',
      methodProfile.wrapTemp ? 'Wrap quand la bark te plaît' : 'Stall normal',
      profile.id === 'pork_shoulder' ? 'Texture qui s’effiloche bien' : 'Sonde qui glisse presque sans résistance',
    ],
  }
}

export function estimateThickness(weightKg, meatKey) {
  const safeWeightKg = safePositive(weightKg, 4, 0.25, 30)
  const ratios = {
    brisket:{l:3.5,w:2.0},
    pork_shoulder:{l:1.9,w:1.5},
    ribs_beef:{l:3.0,w:1.5},
    paleron:{l:2.4,w:1.8},
    plat_de_cote:{l:3.0,w:1.6},
    lamb_shoulder:{l:1.8,w:1.5},
    whole_chicken:{l:1.7,w:1.4},
    chicken_pieces:{l:1.5,w:1.4},
    lamb_leg:{l:2.2,w:1.6},
  }[meatKey] || {l:2.0,w:1.5}
  const base = Math.cbrt((6 * safeWeightKg / 1050) / (Math.PI * ratios.l * ratios.w)) * 100
  return +clamp(meatKey === 'brisket' ? base * 1.15 : base, 1.5, 25).toFixed(1)
}

// PATCH: moteur principal compatible avec l’app actuelle, mais recodé autour du modèle charbonetflamme.fr
export function calculateLowSlow(meatKey, weightKg, options = {}, approvedAdjustments = {}) {
  const profile = getProfile(meatKey)
  if (!profile) throw new Error(`Viande inconnue : ${meatKey}`)

  const safeWeightKg = safePositive(weightKg, profile.defaultWeightKg ?? 3, 0.3, 30)
  const thicknessCm = clamp(parseNumericInput(options.thicknessCm, null) ?? estimateThickness(safeWeightKg, meatKey), 1.5, 25)
  const smokerTempC = clamp(toFiniteNumber(options.smokerTempC, profile.methods[0].smokerTempDefault), 80, 190)
  const smokerType = options.smokerType || 'offset'
  const wrapType = options.wrapType || 'none'
  const marbling = options.marbling || 'medium'
  const lambLegStyle = options.lambLegStyle || 'medium'
  const method = inferMethod({ method: options.method, smokerTempC, wrapType })
  const methodProfile = getMethodProfile(profile, method)
  const wrapPlan = getWrapPlan(profile, method, wrapType, lambLegStyle)
  const thicknessClass = inferThicknessClass(parseNumericInput(options.thicknessCm, null), meatKey, safeWeightKg)
  const smokerAdjustment = BASE_COEFFS.smoker[smokerType] ?? 1.0
  const wrapAdjustment = wrapPlan.active ? (BASE_COEFFS.wrap[wrapType] ?? 1.0) : 1.0
  const tempAdjustment = getTempAdjustment(smokerTempC)
  const thicknessAdjustment = getThicknessAdjustment(thicknessClass)
  const marblingAdjustment = BASE_COEFFS.marbling[marbling] ?? 1.0
  // PATCH: hook d'ajustement conservé pour compatibilité admin/calibration future
  const adjustmentHook = clamp(toFiniteNumber(approvedAdjustments.global, 1.0), 0.9, 1.1)

  // PATCH: ribs et profils à temps fixe = corrections secondaires beaucoup plus légères
  const isFixedCook = Boolean(wrapPlan.fixedTotalMinutes || methodProfile.fixedTotalMinutes)
  const totalAdjustment = isFixedCook
    ? clamp(smokerAdjustment * tempAdjustment * adjustmentHook, 0.92, 1.08)
    : clamp(smokerAdjustment * wrapAdjustment * tempAdjustment * thicknessAdjustment * marblingAdjustment * adjustmentHook, 0.82, 1.18)
  const baseCookMinutes = getCookMinutes(profile, methodProfile, safeWeightKg, smokerTempC, lambLegStyle, { ...wrapPlan, wrapType })
  const cookMin = normalizeDuration(baseCookMinutes * totalAdjustment, baseCookMinutes, 1)

  const restMin = normalizeDuration(avg(...methodProfile.restMinutes), 0, 5)
  // PATCH: plus de tampon produit visible — le repos couvre déjà la marge utile pour le service
  const bufferMin = 0
  const preheatMin = 30

  const totalMin = cookMin + restMin + bufferMin + preheatMin
  const variabilityCookMin = cookMin * 0.12
  const optimisticMin = normalizeDuration(preheatMin + (cookMin - variabilityCookMin) + restMin + bufferMin, totalMin, 5)
  const prudentMin = normalizeDuration(preheatMin + (cookMin + variabilityCookMin) + restMin + bufferMin, totalMin, optimisticMin)

  const stallRangeC = methodProfile.stallRange || profile.temperatureCues.stallRangeC || null
  const wrapRangeC = wrapPlan.wrapTemp ? [Math.max(wrapPlan.wrapTemp - 3, 0), wrapPlan.wrapTemp + 3] : profile.temperatureCues.wrapRangeC || null
  const probeStartC = profile.id === 'lamb_leg' && lambLegStyle === 'medium' ? 55 : profile.temperatureCues.probeStartC ?? null
  const probeTenderRangeC = profile.id === 'lamb_leg' && lambLegStyle === 'medium' ? [57, 63] : profile.temperatureCues.probeTenderRangeC ?? null

  // PATCH: phases internes conservées uniquement pour la logique session/recalibration
  const phaseRatios = isRibsCook(meatKey)
    ? wrapPlan.active
      ? [0.45, 0.35, 0.20]
      : [0.55, 0.15, 0.30]
    : wrapPlan.active
      ? [0.42, 0.10, 0.48]
      : method === 'hot_and_fast'
        ? [0.48, 0.12, 0.40]
        : [0.45, 0.20, 0.35]

  const phase1Min = normalizeDuration(cookMin * phaseRatios[0], cookMin, 1)
  const stallMin = normalizeDuration(cookMin * phaseRatios[1], 0, isRibsCook(meatKey) ? 0 : 0)
  const phase3Min = Math.max(cookMin - phase1Min - stallMin, 1)

  const cues = buildCues(profile, methodProfile, wrapType, { lambLegStyle, wrapTemp: wrapPlan.wrapTemp })
  const targetTemp = profile.id === 'lamb_leg'
    ? (lambLegStyle === 'pulled' ? 96 : 63)
    : profile.tempTarget ?? null

  const result = {
    meatKey,
    meatLabel: profile.label,
    method,
    methodLabel: METHOD_LABELS[method],
    methodVariantLabel: wrapPlan.active ? 'Low & Slow + Wrap' : METHOD_LABELS[method],
    methodProfile,
    weightKg: safeWeightKg,
    thicknessCm,
    smokerTempC,
    smokerType,
    wrapType,
    marbling,
    lambLegStyle,
    targetTempC: targetTemp,
    targetC: targetTemp,
    wrapTempC: wrapPlan.wrapTemp ?? null,
    stallStartC: stallRangeC?.[0] ?? null,
    preheatMin,
    cookMin,
    restMin,
    bufferMin,
    totalMin,
    probableMin: totalMin,
    optimisticMin,
    prudentMin,
    variancePct: 15,
    varianceMin: normalizeDuration((prudentMin - optimisticMin) / 2, 0, 15),
    phase1Min,
    stallMin,
    phase3Min,
    stallRangeC,
    wrapRangeC,
    probeStartC,
    probeTenderRangeC,
    restRecommendation: formatRange(methodProfile.restMinutes, ' min'),
    collagenScore: 0,
    collagenTarget: 0,
    collagenRequired: 0,
    collagenOk: true,
    cues,
    notes: methodProfile.notes,
    coeffs: {
      smokerAdjustment:+smokerAdjustment.toFixed(3),
      wrapAdjustment:+wrapAdjustment.toFixed(3),
      tempAdjustment:+tempAdjustment.toFixed(3),
      thicknessAdjustment:+thicknessAdjustment.toFixed(3),
      marblingAdjustment:+marblingAdjustment.toFixed(3),
      totalAdjustment:+totalAdjustment.toFixed(3),
      minutesPerKg: methodProfile.fixedTotalMinutes ? null : +getAdjustedMinutesPerKg(methodProfile, smokerTempC).toFixed(1),
    },
  }

  result.steps = buildTimeline(result, smokerTempC)
  result.phases = result.steps
  return result
}

export function buildTimeline(calc, smokerTempC) {
  const safeTemp = clamp(toFiniteNumber(smokerTempC ?? calc.smokerTempC, 121), 80, 190)
  const steps = []

  if (isRibsCook(calc.meatKey)) {
    // PATCH: méthodes ribs fixes = roadmap 3-2-1 / 2-2-1 explicite
    if (calc.method === 'low_and_slow' && calc.wrapType !== 'none') {
      const phase1 = calc.meatKey === 'ribs_pork' ? 180 : 120
      const phase2 = 120
      const phase3 = 60
      steps.push({
        id: 'bark',
        label: 'Phase de fumée nue',
        description: `Laisse les ribs prendre la fumée à ${safeTemp}°C sans les perturber.`,
        visualCueNote: 'Cherche une belle couleur et une surface bien prise.',
        checkpoint: 'bark_check',
        durationMin: phase1,
      })
      steps.push({
        id: 'wrap',
        label: 'Wrap / braisage',
        description: 'Emballe les ribs pour les attendrir et accélérer la cuisson.',
        visualCueNote: 'Le wrap reste une méthode, pas une obligation terrain.',
        checkpoint: 'wrap_confirm',
        durationMin: phase2,
      })
      steps.push({
        id: 'flex',
        label: 'Finition / flex test',
        description: 'Termine à découvert, glace si tu veux, puis valide le rack au flex test.',
        visualCueNote: 'La rack doit plier nettement et commencer à fissurer.',
        checkpoint: 'flex_test',
        durationMin: phase3,
      })
      steps.push({
        id: 'glaze',
        label: 'Glaze / sauce',
        description: 'Optionnelle en toute fin : fine couche seulement pour faire prendre la sauce sans brûler le sucre.',
        visualCueNote: 'Quelques minutes suffisent pour fixer la glaze.',
        checkpoint: 'glaze',
        isOptional: true,
        durationMin: 15,
      })
      steps.push({
        id: 'rest',
        label: 'Repos court / service',
        description: `Laisse reposer quelques minutes, puis sers. Repère : ${calc.cues?.restRange || calc.restRecommendation}.`,
        isRest: true,
        durationMin: calc.restMin,
      })
      return steps
    }

    steps.push({
      id: 'bark',
      label: 'Couleur / bark',
      description: `Fumoir stable autour de ${safeTemp}°C. Laisse les ribs prendre la fumée et une belle couleur.`,
      visualCueNote: 'Cherche une couleur acajou et une surface sèche.',
      checkpoint: 'bark_check',
      durationMin: calc.phase1Min,
    })
    steps.push({
      id: 'pullback',
      label: 'Pullback / retrait sur l’os',
      description: 'Quand la viande commence à se retirer sur l’os, tu entres dans la vraie deuxième moitié de cuisson.',
      visualCueNote: 'Le retrait devient visible sur plusieurs os.',
      checkpoint: calc.wrapType === 'none' ? 'bark_check' : 'wrap_confirm',
      durationMin: calc.stallMin,
    })
    if (calc.wrapType !== 'none') {
      steps.push({
        id: 'wrap',
        label: 'Wrap (facultatif)',
        description: 'Emballe seulement si tu veux une texture plus fondante. Le papier garde mieux la structure, l’alu accélère davantage.',
        visualCueNote: 'Décision visuelle, pas chronométrique.',
        checkpoint: 'wrap_confirm',
        durationMin: 0,
      })
    }
    steps.push({
      id: 'flex',
      label: 'Flex test',
      description: 'Soulève la rack : elle doit plier franchement et commencer à fissurer légèrement en surface.',
      visualCueNote: 'Le flex test vaut mieux qu’une température finale sur les ribs.',
      checkpoint: 'flex_test',
      durationMin: calc.phase3Min,
    })
    steps.push({
      id: 'glaze',
      label: 'Glaze / sauce de finition',
      description: 'Si tu veux des ribs brillantes et légèrement collantes, ajoute une fine couche de sauce en toute fin.',
      visualCueNote: 'Surveille le sucre : il brûle vite.',
      checkpoint: 'glaze',
      isOptional: true,
      durationMin: 15,
    })
    steps.push({
      id: 'rest',
      label: 'Repos court / service',
      description: `Laisse reposer quelques minutes, puis sers. Repère : ${calc.cues?.restRange || calc.restRecommendation}.`,
      isRest: true,
      durationMin: calc.restMin,
    })
    return steps
  }

  steps.push({
    id: 'bark',
    label: calc.meatKey === 'pork_shoulder' ? 'Bark / fumée' : calc.meatKey === 'lamb_shoulder' || calc.meatKey === 'paleron' || calc.meatKey === 'plat_de_cote' ? 'Couleur / fumée' : 'Bark en formation',
    description: `Fumoir stable autour de ${safeTemp}°C. Laisse la couleur et la bark se construire.`,
    targetTempNote: calc.cues?.stallRange ? `Stall attendu vers ${calc.cues.stallRange}.` : null,
    checkpoint: 'stall_check',
    durationMin: calc.phase1Min,
  })

  if (calc.cues?.stallRange) {
    steps.push({
      id: 'stall',
      label: 'Stall / ralentissement',
      description: 'La montée en température peut ralentir franchement. C’est normal, surtout sur les grosses pièces.',
      targetTempNote: `Repère stall : ${calc.cues.stallRange}.`,
      checkpoint: 'stall_check',
      isStall: true,
      durationMin: calc.stallMin,
    })
  }

  if (calc.method === 'low_and_slow' && (calc.wrapType !== 'none' || calc.wrapTempC)) {
    steps.push({
      id: 'wrap',
      label: calc.meatKey === 'paleron' ? 'Wrap / finition couverte' : 'Wrap (emballage)',
      description: calc.meatKey === 'paleron'
        ? 'Emballe ou couvre si la couleur te plaît. Très utile pour finir le paleron sans sécher.'
        : 'Emballe quand la bark te plaît. Le wrap accélère la phase post-stall.',
      targetTempNote: calc.cues?.wrapRange ? `Repère wrap : ${calc.cues.wrapRange}.` : (calc.wrapTempC ? `Repère wrap : ${calc.wrapTempC}°C.` : null),
      checkpoint: 'wrap_confirm',
      durationMin: 0,
    })
  }

  steps.push({
    id: 'probe',
    label: calc.meatKey === 'pork_shoulder' ? 'Test d’effilochage / tendreté' : 'Test de tendreté',
    description: calc.meatKey === 'pork_shoulder'
      ? 'Commence à vérifier la texture. La viande doit devenir souple et bien s’effilocher.'
      : calc.meatKey === 'lamb_shoulder'
        ? 'Commence à tester selon la texture recherchée. L’agneau supporte une lecture un peu plus souple.'
        : 'Commence les tests de sonde. La sonde doit glisser presque sans résistance.',
    targetTempNote: calc.cues?.probeTenderRange
      ? `Début des tests : ${calc.cues.probeStart}. Zone finale : ${calc.cues.probeTenderRange}.`
      : calc.cues?.probeStart ? `Début des tests : ${calc.cues.probeStart}.` : null,
    checkpoint: 'probe_test',
    durationMin: calc.phase3Min,
  })

  steps.push({
    id: 'rest',
    label: calc.meatKey === 'pork_shoulder' ? 'Repos' : 'Rest / Hold',
    description: `Repos recommandé : ${calc.cues?.restRange || calc.restRecommendation}. Cette étape fait partie du résultat final.`,
    checkpoint: 'rest_start',
    isRest: true,
    durationMin: calc.restMin,
  })

  return steps
}

export function recalibrate(calc, currentTempC, elapsedMin, currentPitTempC = null) {
  const safeCurrentTempC = parseNumericInput(currentTempC, null)
  const safeElapsedMin = normalizeDuration(parseNumericInput(elapsedMin, 0), 0)
  const targetTempC = toFiniteNumber(calc.targetTempC ?? calc.targetC, null)
  const stallStartC = calc.stallRangeC?.[0] ?? calc.stallStartC ?? 65
  const pitNow = parseNumericInput(currentPitTempC, calc.smokerTempC)
  const pitAdj = clamp(getTempAdjustment(pitNow) / Math.max(getTempAdjustment(calc.smokerTempC), 0.5), 0.88, 1.15)

  if (safeCurrentTempC === null || isRibsCook(calc.meatKey)) {
    const remainingCookMin = Math.max(Math.round((calc.cookMin - safeElapsedMin) * pitAdj), 0)
    return {
      elapsedMin: safeElapsedMin,
      currentTempC: safeCurrentTempC,
      expectedTempC: null,
      deviation: null,
      speedRatio: pitAdj,
      correction: pitAdj,
      currentPhase: isRibsCook(calc.meatKey) ? 'Cuisson visuelle ribs' : 'Mesure manquante',
      variancePct: 15,
      remainingCookMin,
      remainingMin: remainingCookMin,
      remainingTotalMin: remainingCookMin + calc.restMin,
      remainingOptimistic: Math.max(remainingCookMin + calc.restMin - 20, calc.restMin),
      remainingPrudent: remainingCookMin + calc.restMin + 30,
      isAhead: pitAdj < 1,
      isBehind: pitAdj > 1,
      isAheadOfSchedule: pitAdj < 1,
      isBehindSchedule: pitAdj > 1,
      alert: safeCurrentTempC === null ? 'Température interne absente — recalcul limité.' : null,
      action: isRibsCook(calc.meatKey) ? 'Continue à juger les ribs à la couleur, au pullback et au flex test.' : 'Renseigne une mesure interne pour un recalcul plus fin.',
    }
  }

  let expectedTempC = stallStartC
  let currentPhase = 'Montée initiale'
  if (safeElapsedMin <= calc.phase1Min) {
    expectedTempC = lerp(4, stallStartC, safeElapsedMin / Math.max(calc.phase1Min, 1))
    currentPhase = 'Bark / montée'
  } else if (safeElapsedMin <= calc.phase1Min + calc.stallMin) {
    expectedTempC = stallStartC
    currentPhase = 'Stall'
  } else {
    const phaseProgress = (safeElapsedMin - calc.phase1Min - calc.stallMin) / Math.max(calc.phase3Min, 1)
    expectedTempC = lerp(stallStartC, targetTempC ?? Math.max(stallStartC + 22, 90), clamp(phaseProgress, 0, 1))
    currentPhase = 'Finition / tests'
  }

  const speedRatio = clamp((safeCurrentTempC + 1) / Math.max(expectedTempC + 1, 1), 0.7, 1.3)
  const remainingCookBase = Math.max(calc.cookMin - safeElapsedMin, 0)
  const remainingCookMin = Math.max(Math.round(remainingCookBase * (1 / speedRatio) * pitAdj), 0)
  const deviation = +(safeCurrentTempC - expectedTempC).toFixed(1)

  let alert = null
  let action = null
  if (deviation <= -5) {
    alert = 'Cuisson un peu en retard sur le scénario moyen.'
    action = calc.wrapType === 'none' ? 'Si la bark te plaît, un wrap peut raccourcir la fin de cuisson.' : 'Garde un pit bien stable et évite de corriger brutalement.'
  } else if (deviation >= 5) {
    alert = 'Cuisson un peu en avance sur le scénario moyen.'
    action = 'Profite de l’avance pour ménager un meilleur repos.'
  }

  return {
    elapsedMin: safeElapsedMin,
    currentTempC: safeCurrentTempC,
    expectedTempC: +expectedTempC.toFixed(1),
    deviation,
    speedRatio: +speedRatio.toFixed(2),
    correction: +pitAdj.toFixed(2),
    currentPhase,
    variancePct: 15,
    remainingCookMin,
    remainingMin: remainingCookMin,
    remainingTotalMin: remainingCookMin + calc.restMin,
    remainingOptimistic: Math.max(remainingCookMin + calc.restMin - 20, calc.restMin),
    remainingPrudent: remainingCookMin + calc.restMin + 35,
    isAhead: deviation > 3,
    isBehind: deviation < -3,
    isAheadOfSchedule: deviation > 3,
    isBehindSchedule: deviation < -3,
    alert,
    action,
  }
}

// PATCH: helpers horaires pour la future V1 charbonetflamme.fr
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

export function roundMinutesForDisplay(totalMinutes, step = 10) {
  return Math.round(totalMinutes / step) * step
}

// ─────────────────────────────────────────────────────────────
// STEAKS (compatibilité)
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
  tomahawk:      { label:'Tomahawk',          reverseSearMinCm:0,  indirectMinPerCm:14, searMinPerFace:2.5, restMin:10, defaultThicknessCm:5.5, defaultDoneness:'medium_rare' },
  bavette:       { label:'Bavette',           reverseSearMinCm:99, indirectMinPerCm:10, searMinPerFace:2.0, restMin:5,  defaultThicknessCm:2.0, defaultDoneness:'saignant' },
  onglet:        { label:'Onglet',            reverseSearMinCm:99, indirectMinPerCm:8,  searMinPerFace:2.0, restMin:5,  defaultThicknessCm:2.5, defaultDoneness:'saignant' },
  hampe:         { label:'Hampe',             reverseSearMinCm:99, indirectMinPerCm:8,  searMinPerFace:2.0, restMin:5,  defaultThicknessCm:2.0, defaultDoneness:'saignant' },
  rumsteck:      { label:'Rumsteck',          reverseSearMinCm:3,  indirectMinPerCm:12, searMinPerFace:1.5, restMin:5,  defaultThicknessCm:2.5, defaultDoneness:'medium_rare' },
  picanha:       { label:'Picanha',           reverseSearMinCm:3,  indirectMinPerCm:12, searMinPerFace:2.0, restMin:5,  defaultThicknessCm:3.5, defaultDoneness:'medium_rare' },
  cote_agneau:   { label:"Côte d'agneau",     reverseSearMinCm:4,  indirectMinPerCm:12, searMinPerFace:1.5, restMin:5,  defaultThicknessCm:2.5, defaultDoneness:'medium_rare' },
  cote_porc:     { label:'Côte de porc',      reverseSearMinCm:3,  indirectMinPerCm:11, searMinPerFace:2.0, restMin:5,  defaultThicknessCm:2.5, defaultDoneness:'cuit_rose' },
  magret_canard: { label:'Magret de canard',  reverseSearMinCm:99, indirectMinPerCm:10, searMinPerFace:3.0, restMin:5,  defaultThicknessCm:3.0, defaultDoneness:'medium_rare' },
}

function pitTempF(tempC) {
  return getTempAdjustment(tempC)
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
    const tf           = pitTempF(Math.min(smokerTempC, 135))
    const indirectMin  = Math.round(thickness * p.indirectMinPerCm * tf / eff)
    const preheatMin   = 15
    const searPerFace  = smokerTempC < 90 ? 0.5 : p.searMinPerFace
    const searTotal    = Math.max(Math.round(searPerFace * 2), 2)
    const totalMin     = indirectMin + preheatMin + searTotal + p.restMin
    return {
      method:'reverse_sear', doneness, thicknessCm:thickness,
      pullTemp:doneness.tempPull, targetTemp:doneness.tempFinal, carryoverC:co,
      cookMin:indirectMin + searTotal, restMin:p.restMin, totalMin,
      optimisticMin:Math.round(totalMin*0.90), probableMin:totalMin, prudentMin:Math.round(totalMin*1.12),
      phases:[
        { id:'indirect', label:`Phase 1 — Indirect ${smokerTempC}°C`, durationMin:indirectMin, description:`Zone indirecte. Pull à ${doneness.tempPull}°C.` },
        { id:'preheat', label:'Phase 2 — Repos + montée du feu', durationMin:preheatMin, isRest:true, description:'Monter le grill pour la saisie.' },
        { id:'sear', label:`Phase 3 — Saisie ${searPerFace.toFixed(1)}min/face`, durationMin:searTotal, isCrisp:true, description:`Stop à ${doneness.tempFinal}°C max.` },
        { id:'rest', label:`Phase 4 — Repos`, durationMin:p.restMin, isRest:true, description:'Repos court avant service.' },
      ],
    }
  }

  const searPerFace = Math.max(Math.round(thickness * 0.8), 2)
  const indirectMin = thickness > 1.5 && p.reverseSearMinCm >= 99 ? Math.round(thickness * 5) : 0
  const cookMin = searPerFace * 2 + indirectMin
  const phases = [
    { id:'sear1', label:'Phase 1 — Saisie face 1', durationMin:searPerFace, isCrisp:true, description:'Feu vif.' },
    { id:'sear2', label:'Phase 2 — Saisie face 2', durationMin:searPerFace, isCrisp:true, description:`Pull à ${doneness.tempPull}°C.` },
  ]
  if (indirectMin > 0) phases.push({ id:'indirect', label:'Phase 3 — Finition', durationMin:indirectMin, description:'Indirect pour finir à cœur.' })
  phases.push({ id:'rest', label:'Repos', durationMin:p.restMin, isRest:true, description:'Repos court avant service.' })

  return {
    method:'direct', doneness, thicknessCm:thickness,
    pullTemp:doneness.tempPull, targetTemp:doneness.tempFinal, carryoverC:co,
    cookMin, restMin:p.restMin, totalMin:cookMin+p.restMin,
    optimisticMin:cookMin+p.restMin-2, probableMin:cookMin+p.restMin, prudentMin:cookMin+p.restMin+3,
    phases,
  }
}

export function formatDuration(minutes) {
  const safeMinutes = normalizeDuration(minutes, 0)
  const h = Math.floor(safeMinutes / 60)
  const m = safeMinutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${String(m).padStart(2, '0')}`
}

export function addMinutes(date, minutes) {
  const safeDate = date instanceof Date && Number.isFinite(date.getTime()) ? date : new Date()
  return new Date(safeDate.getTime() + toFiniteNumber(minutes, 0) * 60000)
}

export function roundToNearestHalfHour(date) {
  const safeDate = date instanceof Date && Number.isFinite(date.getTime()) ? new Date(date.getTime()) : new Date()
  const rounded = new Date(safeDate)
  const minutes = rounded.getMinutes()
  const snapped = Math.round(minutes / 10) * 10
  if (snapped === 60) rounded.setHours(rounded.getHours() + 1, 0, 0, 0)
  else rounded.setMinutes(snapped, 0, 0)
  return rounded
}

export function formatDisplayTimeRounded(date) {
  const rounded = roundToNearestHalfHour(date)
  const hours = rounded.getHours()
  const minutes = rounded.getMinutes()
  return minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, '0')}`
}

export function formatTime(date) {
  return formatDisplayTimeRounded(date)
}

export function carryover(weightKg) {
  return weightKg < 0.5 ? 3 : weightKg < 2 ? 5 : 7
}

export function validateInput(meatKey, weightKg, smokerTempC, thicknessCm = null) {
  const warnings = []
  const safeWeightKg = parseNumericInput(weightKg, null)
  const safeSmokerTempC = parseNumericInput(smokerTempC, null)
  const safeThicknessCm = parseNumericInput(thicknessCm, null)

  if (safeWeightKg === null || safeWeightKg <= 0) {
    warnings.push('Poids invalide — renseigne une valeur positive pour fiabiliser l’estimation.')
    return warnings
  }

  if (safeSmokerTempC === null) {
    warnings.push('Température fumoir absente — estimation calculée sur la valeur de référence.')
  } else {
    if (safeSmokerTempC < 100) warnings.push('Température très basse — la cuisson peut devenir nettement plus longue.')
    if ((meatKey === 'whole_chicken' || meatKey === 'chicken_pieces') && safeSmokerTempC < 130) {
      warnings.push('Volaille : en dessous de 130°C, la peau risque de rester molle. La plupart des pitmasters recommandent 135°C+.')
    }
    if (safeSmokerTempC > 160) warnings.push('Température haute — surveille davantage la coloration et l’écorce.')
  }

  if (safeThicknessCm !== null) {
    if (safeThicknessCm < 2) warnings.push('Pièce très fine — la cuisson peut aller plus vite que prévu.')
    else if (safeThicknessCm > 18) warnings.push('Pièce très épaisse — ajoute de la marge sur le service.')
  }

  if (meatKey === 'brisket' && safeWeightKg > 8) warnings.push('Grosse brisket : la cuisson peut déborder franchement selon le stall réel et le repos.')
  if (meatKey === 'pork_shoulder' && safeWeightKg > 6) warnings.push('Grosse épaule : le stall peut durer longtemps, surtout sans wrap.')
  if (isRibsCook(meatKey)) warnings.push('Pour les ribs, le bend test et le pullback valent mieux qu’une lecture purement théorique.')
  if (meatKey === 'lamb_leg') warnings.push('Gigot : rosé et effiloché sont deux cuissons très différentes. Vérifie bien le style choisi.')
  return warnings
}

export function generateSuggestion(historySamples, meatKey, parameter) {
  if (!historySamples || historySamples.length < 3) return null
  const errors = historySamples.map((s) => s.error_pct).filter((e) => e != null)
  if (errors.length < 3) return null
  const avgError = errors.reduce((a, b) => a + b, 0) / errors.length
  return {
    category: meatKey || 'global',
    parameter,
    current_value: 1.0,
    suggested_value: Math.round(Math.min(Math.max(1 + (avgError / 100) * 0.25, 0.85), 1.15) * 1000) / 1000,
    sample_size: errors.length,
    confidence_score: Math.max(0, Math.round(100 - Math.abs(avgError) * 3)),
    rationale: `Erreur moyenne : ${avgError.toFixed(1)}% sur ${errors.length} cuissons.`,
    status: 'pending',
  }
}
