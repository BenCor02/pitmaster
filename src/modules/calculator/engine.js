/**
 * CHARBON & FLAMME — Moteur du calculateur BBQ v2
 *
 * Algorithme empirique, crédible, honnête.
 * Basé sur des données terrain par profil de viande.
 *
 * Deux types de cuisson :
 * - low_and_slow : interpolation temp_bands ou fixed_times, wrap, stall, repos
 * - reverse_sear : cuisson douce + saisie finale, doneness targets
 *
 * Règles :
 * - Préchauffage : 30 min
 * - Marge de sécurité : 12% du temps de cuisson, clampé 30–120 min
 * - Pénalité grosses pièces : +3% par kg au-dessus de 6 kg
 * - Fenêtres réalistes, pas de fausse précision
 *
 * Zéro dépendance React. Zéro localStorage. Pur JavaScript.
 */

// ── Helpers ──────────────────────────────────────────────

export function average(a, b) {
  return (a + b) / 2
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

/**
 * Interpole le min_per_kg entre les bandes de température du profil.
 * Si la temp est hors bornes, on prend la borne la plus proche.
 */
export function interpolateMinPerKg(tempBands, cookTempC) {
  if (!tempBands || tempBands.length === 0) return 120 // fallback safe

  // Trier par temp croissante
  const sorted = [...tempBands].sort((a, b) => a.temp_c - b.temp_c)

  // En dessous de la bande la plus basse
  if (cookTempC <= sorted[0].temp_c) return sorted[0].min_per_kg

  // Au-dessus de la bande la plus haute
  if (cookTempC >= sorted[sorted.length - 1].temp_c) return sorted[sorted.length - 1].min_per_kg

  // Interpolation linéaire entre les deux bandes encadrantes
  for (let i = 0; i < sorted.length - 1; i++) {
    const lo = sorted[i]
    const hi = sorted[i + 1]
    if (cookTempC >= lo.temp_c && cookTempC <= hi.temp_c) {
      const ratio = (cookTempC - lo.temp_c) / (hi.temp_c - lo.temp_c)
      return lo.min_per_kg + ratio * (hi.min_per_kg - lo.min_per_kg)
    }
  }

  return sorted[0].min_per_kg // fallback
}

/** "HH:MM" → nombre de minutes depuis minuit */
export function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Nombre de minutes → "HH:MM" (gère minuit et jours précédents) */
export function minutesToHHMM(totalMin) {
  const m = ((totalMin % 1440) + 1440) % 1440
  const h = Math.floor(m / 60)
  const min = Math.round(m % 60)
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

/** Formate une durée en minutes → "Xh" ou "XhYY" ou "X min" */
export function formatDuration(minutes) {
  const rounded = Math.round(minutes)
  const h = Math.floor(rounded / 60)
  const m = rounded % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h${String(m).padStart(2, '0')}`
}

// ── Moteur principal ─────────────────────────────────────

/**
 * Calcule le plan de cuisson complet.
 *
 * @param {Object} params
 * @param {Object} params.profile      - Profil viande (depuis MEAT_PROFILES)
 * @param {number} params.weightKg     - Poids en kg
 * @param {number} params.cookTempC    - Température de cuisson en °C
 * @param {boolean} params.wrapped     - Emballé (papier boucher / alu)
 * @param {string} params.eatAt        - Heure souhaitée du repas "HH:MM"
 * @param {string|null} params.doneness - Pour reverse sear : 'rare', 'medium_rare', 'medium'
 * @returns {Object} Plan de cuisson complet
 */
export function calculateCookPlan({ profile, weightKg, cookTempC, wrapped, eatAt, doneness = null }) {
  const PREHEAT_MINUTES = 30
  const eatAtMinutes = hhmmToMinutes(eatAt)

  // ── 1. Temps de cuisson ────────────────────────────────
  let cookMinutes = 0

  if (profile.fixed_times) {
    // Ribs : temps fixe, pas basé sur le poids
    const fixed = wrapped && profile.fixed_times.wrapped
      ? profile.fixed_times.wrapped
      : profile.fixed_times.unwrapped
    cookMinutes = average(fixed.min, fixed.max)
  } else {
    // Interpolation sur les bandes de température
    const minPerKg = interpolateMinPerKg(profile.temp_bands, cookTempC)
    cookMinutes = weightKg * minPerKg
  }

  // ── 2. Réduction wrap ──────────────────────────────────
  if (wrapped && profile.wrap_reduction_percent) {
    cookMinutes *= 1 - profile.wrap_reduction_percent / 100
  }

  // ── 3. Pénalité grosses pièces ─────────────────────────
  if (weightKg > 6 && !profile.fixed_times) {
    cookMinutes *= 1 + (weightKg - 6) * 0.03
  }

  // ── 4. Repos ───────────────────────────────────────────
  const restMinutes = Math.round(average(profile.rest_min, profile.rest_max))

  // ── 5. Reverse sear (si applicable) ────────────────────
  let searMinutes = 0
  let reversePullTemp = null
  let targetFinalTemp = null

  if (profile.cook_type === 'reverse_sear') {
    const d = doneness || 'medium_rare'
    targetFinalTemp = profile.doneness_targets?.[d] || 54
    reversePullTemp = targetFinalTemp - (profile.reverse_sear?.pull_before_target_c || 8)
    searMinutes = Math.round(average(
      profile.reverse_sear?.sear_total_minutes_min || 4,
      profile.reverse_sear?.sear_total_minutes_max || 8,
    ))
  }

  // ── 6. Marge de sécurité ───────────────────────────────
  const bufferMinutes = Math.round(clamp(cookMinutes * 0.12, 30, 120))

  // ── 7. Total et timeline inversée ──────────────────────
  const totalMinutes = Math.round(
    PREHEAT_MINUTES + cookMinutes + searMinutes + restMinutes + bufferMinutes
  )

  const preheatStart = eatAtMinutes - totalMinutes
  const meatOnTime = preheatStart + PREHEAT_MINUTES

  const idealReadyStart = eatAtMinutes - Math.round(bufferMinutes * 0.5)
  const idealReadyEnd = eatAtMinutes
  const acceptableEnd = eatAtMinutes + 30

  // ── 8. Étapes pour l'affichage ─────────────────────────
  const steps = []

  steps.push({
    time: minutesToHHMM(preheatStart),
    label: 'Allumer / préchauffer',
    description: `Préchauffer à ${cookTempC}°C`,
    type: 'preheat',
  })

  steps.push({
    time: minutesToHHMM(meatOnTime),
    label: 'Mettre la viande en cuisson',
    description: `${profile.name} — ${weightKg} kg`,
    type: 'cook_start',
  })

  // Repères de cuisson selon les cues du profil
  if (profile.cues?.stall_temp_min) {
    steps.push({
      time: null,
      label: `Stall probable (${profile.cues.stall_temp_min}–${profile.cues.stall_temp_max}°C interne)`,
      description: "Phase normale où la température semble stagner. C'est normal, patience.",
      type: 'stall',
      isCue: true,
    })
  }

  if (wrapped && profile.supports_wrap && profile.cues?.wrap_temp_min) {
    steps.push({
      time: null,
      label: `Wrapper vers ${profile.cues.wrap_temp_min}–${profile.cues.wrap_temp_max}°C interne`,
      description: profile.cues.visual_wrap || 'Emballer dans du papier boucher ou de l\'aluminium.',
      type: 'wrap',
      isCue: true,
    })
  }

  if (profile.cues?.begin_test_temp) {
    steps.push({
      time: null,
      label: `Commencer les tests vers ${profile.cues.begin_test_temp}°C interne`,
      description: profile.cues.probe_tender || 'Tester la tendreté avec la sonde.',
      type: 'test',
      isCue: true,
    })
  }

  if (profile.cook_type === 'reverse_sear' && reversePullTemp) {
    steps.push({
      time: null,
      label: `Sortir la viande à ${reversePullTemp}°C interne`,
      description: profile.cues?.reverse_note || 'Sortir avant la température cible, puis saisir.',
      type: 'pull',
      isCue: true,
    })

    steps.push({
      time: null,
      label: `Saisie finale (~${searMinutes} min total)`,
      description: `Saisir fort pour la croûte. Cible finale : ${targetFinalTemp}°C.`,
      type: 'sear',
      isCue: true,
    })
  }

  if (restMinutes >= 5) {
    steps.push({
      time: minutesToHHMM(eatAtMinutes - restMinutes - Math.round(bufferMinutes * 0.5)),
      label: `Repos (~${restMinutes} min)`,
      description: restMinutes >= 30
        ? 'Le repos est essentiel. Emballer dans une serviette, placer dans une glacière fermée.'
        : 'Repos court — laisser reposer à couvert.',
      type: 'rest',
    })
  }

  steps.push({
    time: minutesToHHMM(idealReadyStart),
    label: 'Prêt idéalement entre',
    description: `${minutesToHHMM(idealReadyStart)} et ${minutesToHHMM(idealReadyEnd)}`,
    type: 'service_ideal',
  })

  steps.push({
    time: minutesToHHMM(acceptableEnd),
    label: 'Encore acceptable jusqu\'à',
    description: minutesToHHMM(acceptableEnd),
    type: 'service_acceptable',
  })

  // ── 9. Conseils ────────────────────────────────────────
  const tips = buildTips(profile, wrapped, weightKg, cookTempC)

  // ── 10. Résultat ───────────────────────────────────────
  return {
    profile: profile.name,
    profileId: profile.id,
    cookType: profile.cook_type,
    weightKg,
    cookTempC,
    wrapped,

    preheatStart: minutesToHHMM(preheatStart),
    meatOnTime: minutesToHHMM(meatOnTime),

    cookMinutes: Math.round(cookMinutes),
    searMinutes: Math.round(searMinutes),
    restMinutes,
    bufferMinutes,
    totalMinutes,

    serviceWindow: {
      idealStart: minutesToHHMM(idealReadyStart),
      idealEnd: minutesToHHMM(idealReadyEnd),
      acceptableEnd: minutesToHHMM(acceptableEnd),
    },

    reversePullTemp,
    targetFinalTemp,
    doneness,

    cues: profile.cues,
    steps,
    tips,
  }
}

// ── Conseils contextuels ─────────────────────────────────

function buildTips(profile, wrapped, weightKg, cookTempC) {
  const tips = []

  tips.push('Le thermomètre est votre meilleur ami — fiez-vous à la température interne, pas au chrono.')

  if (profile.cues?.stall_temp_min && !wrapped) {
    tips.push(`Cette viande a tendance à staller entre ${profile.cues.stall_temp_min}°C et ${profile.cues.stall_temp_max}°C interne. Si la température stagne, c'est normal. Patience.`)
  }

  if (profile.supports_wrap && wrapped) {
    tips.push('Le wrap accélère le passage du stall mais peut ramollir la bark. Choix personnel.')
  }

  if (profile.supports_wrap && !wrapped) {
    tips.push('Sans wrap, la cuisson sera plus longue mais la bark plus prononcée.')
  }

  if (weightKg > 6 && !profile.fixed_times) {
    tips.push('Grosse pièce : prévoyez une marge supplémentaire. Mieux vaut finir tôt — le repos peut durer longtemps dans une glacière.')
  }

  if (profile.cook_type === 'reverse_sear') {
    tips.push(`Pensez à sortir la viande ~8°C avant votre cible finale (${profile.cues?.reverse_note || ''}).`)
  }

  if (profile.cues?.visual_warning) {
    tips.push(profile.cues.visual_warning)
  }

  return tips
}
