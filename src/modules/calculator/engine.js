/**
 * CHARBON & FLAMME — Moteur du calculateur BBQ v2
 *
 * Assistant pitmaster réaliste.
 * Phases approximatives, repères terrain, zéro heure exacte.
 *
 * Inspiré Aaron Franklin, Meathead, Malcom Reed, LebbqdeRafa.
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

export function interpolateMinPerKg(tempBands, cookTempC) {
  if (!tempBands || tempBands.length === 0) return 120
  const sorted = [...tempBands].sort((a, b) => a.temp_c - b.temp_c)
  if (cookTempC <= sorted[0].temp_c) return sorted[0].min_per_kg
  if (cookTempC >= sorted[sorted.length - 1].temp_c) return sorted[sorted.length - 1].min_per_kg
  for (let i = 0; i < sorted.length - 1; i++) {
    const lo = sorted[i]
    const hi = sorted[i + 1]
    if (cookTempC >= lo.temp_c && cookTempC <= hi.temp_c) {
      const ratio = (cookTempC - lo.temp_c) / (hi.temp_c - lo.temp_c)
      return lo.min_per_kg + ratio * (hi.min_per_kg - lo.min_per_kg)
    }
  }
  return sorted[0].min_per_kg
}

/** Formate une durée minutes → plage approximative "~Xh à Xh" */
export function formatApproxDuration(minutes, tolerancePercent = 15) {
  const low = Math.max(0, minutes * (1 - tolerancePercent / 100))
  const high = minutes * (1 + tolerancePercent / 100)
  return `~${formatHours(low)} à ${formatHours(high)}`
}

/** Minutes → "Xh" ou "Xh30" lisible */
export function formatHours(minutes) {
  const h = Math.floor(minutes / 60)
  const m = Math.round((minutes % 60) / 30) * 30
  if (h === 0 && m === 0) return '30 min'
  if (h === 0) return `${Math.round(minutes)} min`
  if (m === 0) return `${h}h`
  return `${h}h${m}`
}

/** Formate une plage en heures depuis min/max minutes */
export function formatRange(minMinutes, maxMinutes) {
  return `~${formatHours(minMinutes)} à ${formatHours(maxMinutes)}`
}

// ── Moteur principal ─────────────────────────────────────

/**
 * Calcule le plan de cuisson par phases approximatives.
 * Zéro heure exacte. Tout en durées et repères.
 */
export function calculateCookPlan({ profile, weightKg, cookTempC, wrapped, doneness = null }) {
  // ── 1. Temps de cuisson brut ──────────────────────────
  let cookMinutes = 0

  if (profile.fixed_times) {
    const fixed = wrapped && profile.fixed_times.wrapped
      ? profile.fixed_times.wrapped
      : profile.fixed_times.unwrapped
    cookMinutes = average(fixed.min, fixed.max)
  } else {
    const minPerKg = interpolateMinPerKg(profile.temp_bands, cookTempC)
    cookMinutes = weightKg * minPerKg
  }

  // ── 2. Réduction wrap ─────────────────────────────────
  if (wrapped && profile.wrap_reduction_percent) {
    cookMinutes *= 1 - profile.wrap_reduction_percent / 100
  }

  // ── 3. Pénalité grosses pièces ────────────────────────
  if (weightKg > 6 && !profile.fixed_times) {
    cookMinutes *= 1 + (weightKg - 6) * 0.03
  }

  // ── 4. Repos ──────────────────────────────────────────
  const restMin = profile.rest_min
  const restMax = profile.rest_max

  // ── 5. Reverse sear ───────────────────────────────────
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

  // ── 6. Tolérance selon poids ──────────────────────────
  const tolerance = weightKg > 6 ? 0.20 : weightKg > 3 ? 0.15 : 0.10

  // ── 7. Durée totale ───────────────────────────────────
  // Philosophie pitmaster : mieux vaut finir 1h trop tôt que 1h trop tard.
  // On décale la fourchette vers le haut (+60 min) pour encourager
  // un démarrage plus tôt → repos plus long → meilleur résultat.
  const totalCookMin = Math.round(cookMinutes)
  const EARLY_BUFFER = 60 // 1h de marge "service idéal plus tard"
  const totalLow = Math.round(totalCookMin * (1 - tolerance) + restMin + EARLY_BUFFER)
  const totalHigh = Math.round(totalCookMin * (1 + tolerance) + restMax + EARLY_BUFFER)

  // ── 8. Construction des phases ────────────────────────
  const phases = buildPhases(profile, totalCookMin, tolerance, wrapped, {
    searMinutes, reversePullTemp, targetFinalTemp, doneness,
    restMin, restMax, cookTempC, weightKg,
  })

  // ── 9. Conseils pitmaster ─────────────────────────────
  const tips = buildTips(profile, wrapped, weightKg, cookTempC)

  // ── 10. Section ribs (si applicable) ──────────────────
  const ribsMethod = buildRibsMethod(profile, wrapped)

  // ── 11. Section reverse sear (si applicable) ──────────
  const reverseSearGuide = buildReverseSearGuide(profile, doneness)

  return {
    profile: profile.name,
    profileId: profile.id,
    cookType: profile.cook_type,
    weightKg,
    cookTempC,
    wrapped,

    totalEstimate: formatRange(totalLow, totalHigh),
    totalLowMinutes: totalLow,
    totalHighMinutes: totalHigh,
    restEstimate: formatRange(restMin, restMax),
    restMin,
    restMax,

    cookMinutes: totalCookMin,
    searMinutes,
    reversePullTemp,
    targetFinalTemp,
    doneness,
    tolerance,

    phases,
    tips,
    ribsMethod,
    reverseSearGuide,
    cues: profile.cues,
  }
}

// ── Phases ───────────────────────────────────────────────

function buildPhases(profile, totalCookMin, tolerance, wrapped, ctx) {
  const phases = []
  const isRibs = !!profile.fixed_times
  const isReverseSear = profile.cook_type === 'reverse_sear'

  if (isRibs) {
    return buildRibsPhases(profile, wrapped, ctx)
  }

  if (isReverseSear) {
    return buildReverseSearPhases(profile, totalCookMin, tolerance, ctx)
  }

  // ── Low & slow phases ─────────────────────────────────

  // Phase 1: Montée initiale (~25%)
  const phase1Min = totalCookMin * 0.25
  phases.push({
    num: 1,
    title: 'Montée initiale',
    duration: formatApproxDuration(phase1Min, tolerance * 100),
    objective: 'Formation de la bark et développement des saveurs',
    markers: [
      { type: 'visual', text: 'La surface de la viande fonce progressivement' },
      { type: 'visual', text: 'La surface devient sèche au toucher' },
      { type: 'temp', text: `Température interne : ~65–75°C` },
    ],
    advice: 'Ne pas ouvrir le couvercle trop souvent. Chaque ouverture ajoute du temps.',
  })

  // Phase 2: Stall (~30%)
  if (profile.cues?.stall_temp_min) {
    const phase2Min = totalCookMin * 0.30
    phases.push({
      num: 2,
      title: 'Stall (plateau thermique)',
      duration: formatApproxDuration(phase2Min, tolerance * 100),
      objective: 'Phase normale où la température interne semble stagner',
      markers: [
        { type: 'temp', text: `Plateau entre ${profile.cues.stall_temp_min}°C et ${profile.cues.stall_temp_max}°C` },
        { type: 'info', text: "L'évaporation de l'eau refroidit la viande — c'est le même effet que la transpiration" },
      ],
      advice: 'Ne pas monter la température du fumoir. Patience. Le stall finit toujours par passer.',
    })
  }

  // Phase 3: Wrap (si activé)
  if (wrapped && profile.supports_wrap) {
    phases.push({
      num: phases.length + 1,
      title: 'Wrap (Texas crutch)',
      duration: null,
      objective: 'Accélérer la fin de cuisson et passer le stall plus vite',
      markers: [
        { type: 'temp', text: profile.cues?.wrap_temp_min ? `Emballer entre ${profile.cues.wrap_temp_min}°C et ${profile.cues.wrap_temp_max}°C interne` : 'Emballer quand la bark est fixée' },
        { type: 'visual', text: profile.cues?.visual_wrap || 'Bark sèche, sombre, ne se raye plus' },
      ],
      advice: 'Papier boucher (meilleure bark) ou aluminium (plus rapide). Le wrap réduit le stall mais ramollit légèrement la bark.',
    })
  }

  // Phase 4: Rendu du collagène (~25%)
  const phase4Min = totalCookMin * 0.25
  phases.push({
    num: phases.length + 1,
    title: 'Rendu du collagène',
    duration: formatApproxDuration(phase4Min, tolerance * 100),
    objective: 'Le collagène se transforme en gélatine — la viande devient tendre',
    markers: [
      { type: 'temp', text: profile.cues?.begin_test_temp ? `Commencer les tests vers ${profile.cues.begin_test_temp}°C` : 'Commencer les tests vers 90°C' },
      { type: 'visual', text: profile.cues?.probe_tender || 'La sonde entre comme dans du beurre' },
      { type: 'temp', text: profile.cues?.target_temp_min ? `Cible : ${profile.cues.target_temp_min}–${profile.cues.target_temp_max}°C` : 'Cible : 92–97°C' },
    ],
    advice: "C'est la texture qui décide, pas le thermomètre. La sonde doit entrer sans résistance.",
  })

  // Phase 5: Repos
  phases.push({
    num: phases.length + 1,
    title: 'Repos',
    duration: formatRange(ctx.restMin, ctx.restMax),
    objective: 'Les jus se redistribuent dans la viande',
    markers: [
      { type: 'visual', text: 'Emballer dans une serviette épaisse' },
      { type: 'visual', text: 'Placer dans une glacière fermée (pas de glace)' },
    ],
    advice: ctx.restMax >= 60
      ? "Le repos est aussi important que la cuisson. Un brisket peut rester 4h dans une glacière fermée sans problème."
      : "Repos court mais nécessaire. Laisser reposer à couvert.",
  })

  return phases
}

function buildRibsPhases(profile, wrapped, ctx) {
  const phases = []
  const isSpare = profile.id === 'spare_ribs'

  if (wrapped) {
    // Méthode 3-2-1 ou 2-2-1
    const smokeH = isSpare ? 3 : 2
    const wrapH = 2
    const finishH = 1

    phases.push({
      num: 1,
      title: 'Fumée à nu',
      duration: `~${smokeH}h`,
      objective: 'Développer la bark et les arômes fumés',
      markers: [
        { type: 'visual', text: 'La surface fonce et devient sèche' },
        { type: 'temp', text: '110–120°C au fumoir' },
      ],
      advice: "Pas besoin de spritzer pendant cette phase. Laisser le feu faire son travail.",
    })

    phases.push({
      num: 2,
      title: 'Emballé (wrap)',
      duration: `~${wrapH}h`,
      objective: 'Attendrir la viande et accélérer la cuisson',
      markers: [
        { type: 'visual', text: 'Emballer avec beurre, miel ou jus de pomme' },
        { type: 'visual', text: 'Papier alu ou papier boucher' },
      ],
      advice: "C'est pendant cette phase que la viande devient fondante. Ne pas ouvrir.",
    })

    phases.push({
      num: 3,
      title: 'Finition / laquage',
      duration: `~${finishH}h`,
      objective: 'Caraméliser la sauce et raffermir légèrement la surface',
      markers: [
        { type: 'visual', text: 'Appliquer la sauce en couches fines' },
        { type: 'visual', text: 'La sauce doit devenir collante et brillante' },
      ],
      advice: "Remettre à nu dans le fumoir. Badigeonner toutes les 15-20 minutes.",
    })
  } else {
    const totalH = isSpare ? '5 à 6' : '4 à 5'
    phases.push({
      num: 1,
      title: 'Fumée complète à nu',
      duration: `~${totalH}h`,
      objective: 'Cuisson lente sans emballage — bark maximale',
      markers: [
        { type: 'visual', text: 'Surface très sombre et sèche' },
        { type: 'temp', text: '110–120°C au fumoir' },
        { type: 'visual', text: profile.cues?.probe_tender || 'Flex test : le rack plie et fissure' },
      ],
      advice: "Sans wrap, la bark est plus prononcée mais la viande est moins fondante. Spritzer toutes les 45 min si nécessaire.",
    })
  }

  // Repos ribs
  phases.push({
    num: phases.length + 1,
    title: 'Repos',
    duration: formatRange(ctx.restMin, ctx.restMax),
    objective: 'Laisser les jus se redistribuer',
    markers: [
      { type: 'visual', text: 'Reposer 10-20 minutes à couvert' },
    ],
    advice: 'Les ribs ne nécessitent pas un long repos comme un brisket.',
  })

  return phases
}

function buildReverseSearPhases(profile, totalCookMin, tolerance, ctx) {
  const phases = []

  // Phase 1: Cuisson indirecte
  phases.push({
    num: 1,
    title: 'Cuisson indirecte basse température',
    duration: formatApproxDuration(totalCookMin, tolerance * 100),
    objective: 'Monter doucement en température pour une cuisson uniforme',
    markers: [
      { type: 'temp', text: `Fumoir à ${ctx.cookTempC}°C (zone indirecte)` },
      { type: 'temp', text: ctx.reversePullTemp ? `Sortir la viande à ${ctx.reversePullTemp}°C interne` : 'Sortir ~8°C avant la cible finale' },
    ],
    advice: "La patience est la clé. Plus la montée est lente, plus la cuisson est uniforme d'un bord à l'autre.",
  })

  // Phase 2: Saisie
  phases.push({
    num: 2,
    title: 'Saisie finale (sear)',
    duration: `~${ctx.searMinutes} min total`,
    objective: 'Créer une croûte caramélisée (réaction de Maillard)',
    markers: [
      { type: 'temp', text: 'Grill ou poêle en fonte à 250–300°C' },
      { type: 'visual', text: '~45–60 secondes par face' },
      { type: 'temp', text: ctx.targetFinalTemp ? `Cible finale : ${ctx.targetFinalTemp}°C` : '' },
    ].filter(m => m.text),
    advice: "Sécher la surface avant de saisir. Une surface sèche = meilleure croûte.",
  })

  // Phase 3: Repos court
  phases.push({
    num: 3,
    title: 'Repos',
    duration: formatRange(ctx.restMin, ctx.restMax),
    objective: 'Redistribution des jus',
    markers: [
      { type: 'visual', text: 'Repos court sous aluminium' },
    ],
    advice: "Ne pas couper immédiatement. Même 5 minutes font une différence.",
  })

  return phases
}

// ── Ribs method section ─────────────────────────────────

function buildRibsMethod(profile) {
  if (!profile.fixed_times) return null

  const isSpare = profile.id === 'spare_ribs'

  return {
    title: isSpare ? 'Méthode 3-2-1 (Spare Ribs / St Louis)' : 'Méthode 2-2-1 (Baby Back Ribs)',
    steps: isSpare
      ? [
          { time: '3h', desc: 'Fumée à nu — développement bark et arômes' },
          { time: '2h', desc: 'Emballé (papier alu + beurre / miel) — attendrissement' },
          { time: '1h', desc: 'Finition / laquage — caramélisation de la sauce' },
        ]
      : [
          { time: '2h', desc: 'Fumée à nu — bark et saveurs fumées' },
          { time: '2h', desc: 'Emballé — attendrissement' },
          { time: '1h', desc: 'Finition / laquage — sauce caramélisée' },
        ],
    temp: '110–120°C',
    result: isSpare ? 'Très fondant, la viande se détache facilement' : 'Moins fondant, meilleure tenue sur l\'os',
    note: 'Ces méthodes sont indicatives. La cuisson doit toujours être validée à la texture, pas au chrono.',
    alternative: isSpare
      ? { name: 'Méthode 2-2-1', desc: 'Pour Baby Back Ribs — moins de temps de fumée car ribs plus fins' }
      : { name: 'Méthode 3-2-1', desc: 'Pour Spare Ribs / St Louis — plus de temps de fumée car ribs plus épais' },
  }
}

// ── Reverse sear guide ──────────────────────────────────

function buildReverseSearGuide(profile, doneness) {
  if (profile.cook_type !== 'reverse_sear') return null

  const d = doneness || 'medium_rare'
  const temps = profile.doneness_targets || {}

  return {
    title: '🔥 Reverse Sear recommandé',
    badge: 'Technique utilisée en compétition BBQ',
    principle: [
      'Cuisson indirecte basse température (100–120°C)',
      `Monter jusqu'à ${temps[d] ? (temps[d] - 8) + '°C' : '~46–52°C'} interne`,
      'Retirer la viande du fumoir',
      'Monter le grill très fort (250–300°C)',
      'Saisir 45–60 secondes par face',
    ],
    targets: {
      rare: { temp: temps.rare || 52, label: 'Saignant' },
      medium_rare: { temp: temps.medium_rare || 54, label: 'Medium saignant' },
      medium: { temp: temps.medium || 60, label: 'Medium' },
    },
    selectedDoneness: d,
    advantages: [
      'Cuisson parfaitement uniforme du bord au centre',
      'Meilleure croûte (Maillard)',
      'Contrôle parfait de la cuisson',
      'Résultat digne d\'une compétition',
    ],
  }
}

// ── Conseils pitmaster ──────────────────────────────────

function buildTips(profile, wrapped, weightKg, cookTempC) {
  const tips = []

  tips.push('Le thermomètre est ton meilleur allié — fie-toi à la température interne, pas au chrono.')

  if (profile.cues?.stall_temp_min && !wrapped) {
    tips.push(`Le stall entre ${profile.cues.stall_temp_min}°C et ${profile.cues.stall_temp_max}°C est normal. La viande transpire et la température stagne. Patience.`)
  }

  if (profile.supports_wrap && wrapped) {
    tips.push('Le wrap accélère le passage du stall mais peut ramollir la bark. Papier boucher = meilleur compromis.')
  }

  if (profile.supports_wrap && !wrapped) {
    tips.push('Sans wrap, la cuisson est plus longue mais la bark est plus prononcée et croustillante.')
  }

  if (weightKg > 6 && !profile.fixed_times) {
    tips.push('Grosse pièce : prévois une marge. Mieux vaut finir tôt — un long repos en glacière ne fait qu\'améliorer le résultat.')
  }

  if (profile.cook_type === 'reverse_sear') {
    tips.push('Sèche bien la surface avant la saisie. Une surface humide = vapeur au lieu de croûte.')
  }

  if (profile.cues?.visual_warning) {
    tips.push(profile.cues.visual_warning)
  }

  tips.push("Chaque cuisson est différente. Les durées sont des estimations — c'est la viande qui décide, pas la montre.")

  return tips
}
