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
  let h = Math.floor(minutes / 60)
  let m = Math.round((minutes % 60) / 30) * 30
  if (m === 60) { h += 1; m = 0 }
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

  // ── 3b. Temps minimum de cuisson ─────────────────────
  // Aucune pièce ne développe de saveur fumée en moins de 30 min.
  // Reverse sear : minimum 20 min en fumoir.
  // Low & slow : minimum 45 min.
  if (!profile.fixed_times) {
    const minCook = profile.cook_type === 'reverse_sear' ? 20 : 45
    cookMinutes = Math.max(cookMinutes, minCook)
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
  // Resserré : plage réaliste, pas une fourchette inutilisable
  const tolerance = weightKg > 6 ? 0.12 : weightKg > 3 ? 0.10 : 0.08

  // ── 7. Durée totale ───────────────────────────────────
  // totalHigh utilise le rest MOYEN (pas le max) pour éviter
  // des plages absurdement larges. Le rest_max reste dispo
  // dans l'UI pour info mais ne gonfle plus l'estimation haute.
  const totalCookMin = Math.round(cookMinutes)
  const restAvg = Math.round((restMin + restMax) / 2)
  const totalLow = Math.max(0, Math.round(totalCookMin * (1 - tolerance) + restMin))
  const totalHigh = Math.round(totalCookMin * (1 + tolerance) + restAvg)

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

  // ── Volaille — phases spécifiques ─────────────────────
  if (profile.category === 'volaille') {
    return buildPoultryPhases(profile, totalCookMin, tolerance, ctx)
  }

  // ── Low & slow phases (bœuf, porc) — différenciées par viande ──

  // Repères spécifiques par profil
  const meatTips = getLowSlowMeatTips(profile)

  // Phase 1: Prise de fumée (~25%)
  const phase1Min = totalCookMin * 0.25
  phases.push({
    num: 1,
    title: 'Prise de fumée',
    duration: formatApproxDuration(phase1Min, tolerance * 100),
    objective: meatTips.phase1Objective,
    markers: [
      { type: 'visual', text: meatTips.phase1Visual },
      { type: 'temp', text: meatTips.phase1Temp },
      { type: 'info', text: meatTips.phase1Info },
    ],
    advice: meatTips.phase1Advice,
  })

  // Phase 2: Stall (~30%)
  if (profile.cues?.stall_temp_min) {
    const phase2Min = totalCookMin * 0.30
    phases.push({
      num: 2,
      title: 'Le Stall — la viande transpire',
      duration: formatApproxDuration(phase2Min, tolerance * 100),
      objective: meatTips.stallObjective,
      markers: [
        { type: 'temp', text: `Plateau entre ${profile.cues.stall_temp_min}°C et ${profile.cues.stall_temp_max}°C — la sonde ne bouge plus` },
        { type: 'info', text: meatTips.stallInfo },
      ],
      advice: meatTips.stallAdvice,
    })
  }

  // Phase 3: Wrap (si activé)
  if (wrapped && profile.supports_wrap) {
    phases.push({
      num: phases.length + 1,
      title: 'Le Wrap — Texas Crutch',
      duration: null,
      objective: 'Passer le stall, garder l\'humidité et accélérer la dernière ligne droite',
      markers: [
        { type: 'temp', text: profile.cues?.wrap_temp_min ? `Emballer entre ${profile.cues.wrap_temp_min}°C et ${profile.cues.wrap_temp_max}°C interne` : 'Emballer quand la bark est bien fixée' },
        { type: 'visual', text: profile.cues?.visual_wrap || 'Bark sèche, sombre, ne se raye plus à l\'ongle' },
        { type: 'info', text: meatTips.wrapTip },
      ],
      advice: meatTips.wrapAdvice,
    })
  }

  // Phase 4: La Transformation (~25%) — ex "Rendu du collagène"
  const phase4Min = totalCookMin * 0.25
  phases.push({
    num: phases.length + 1,
    title: 'La Transformation',
    duration: formatApproxDuration(phase4Min, tolerance * 100),
    objective: meatTips.transformObjective,
    markers: [
      { type: 'temp', text: profile.cues?.begin_test_temp ? `Commencer les tests vers ${profile.cues.begin_test_temp}°C` : 'Commencer les tests vers 90°C' },
      { type: 'visual', text: profile.cues?.probe_tender || 'La sonde entre comme dans du beurre' },
      { type: 'temp', text: profile.cues?.target_temp_min ? `Cible : ${profile.cues.target_temp_min}–${profile.cues.target_temp_max}°C` : 'Cible : 92–97°C' },
      { type: 'info', text: meatTips.transformInfo },
    ],
    advice: meatTips.transformAdvice,
  })

  // Phase 5: Repos
  phases.push({
    num: phases.length + 1,
    title: 'Le Repos — patience finale',
    duration: formatRange(ctx.restMin, ctx.restMax),
    objective: meatTips.restObjective,
    markers: meatTips.restMarkers,
    advice: meatTips.restAdvice,
  })

  return phases
}

/**
 * Repères pitmaster spécifiques à chaque viande pour les phases low & slow.
 * Chaque viande a ses propres marqueurs visuels, températures et conseils.
 */
function getLowSlowMeatTips(profile) {
  const id = profile.id

  // ── BRISKET ──
  if (id === 'brisket') return {
    phase1Objective: 'Formation de la bark — la croûte fumée qui fait toute la différence',
    phase1Visual: 'La surface fonce du rose au brun acajou. Le gras de surface commence à rendre et nourrit la bark.',
    phase1Temp: 'Température interne : ~55–70°C',
    phase1Info: 'C\'est pendant cette phase que la viande absorbe le plus de fumée. Bois de choix : chêne, noyer, ou mesquite pour un goût texan.',
    phase1Advice: 'Côté gras vers le haut ou le bas ? Ça dépend de ton fumoir. Gras vers la source de chaleur pour protéger la viande. Ne touche à rien pendant au moins 2h.',
    stallObjective: 'La viande transpire — l\'évaporation fait stagner la température pendant parfois 2 à 4h',
    stallInfo: 'C\'est normal et c\'est un bon signe. L\'eau s\'évapore en surface et refroidit la viande, comme la sueur. Plus le brisket est gros, plus le stall est long.',
    stallAdvice: 'C\'est le moment où la plupart des débutants paniquent. Ne monte PAS la température du fumoir. Si tu as le temps, laisse faire. Sinon, c\'est le moment de wrapper.',
    wrapTip: 'Pour le brisket, le papier boucher (peach paper) est le choix des compétiteurs — il garde la bark intacte tout en retenant l\'humidité.',
    wrapAdvice: 'Papier boucher > aluminium pour le brisket. L\'alu donne un résultat plus « braisé ». Le papier garde la texture de la bark. Ajoute un filet de jus de cuisson ou de bouillon avant de fermer.',
    transformObjective: 'Le tissu conjonctif fond et se transforme en gélatine — c\'est ça qui rend le brisket fondant',
    transformInfo: 'Le thermomètre ne suffit pas. Deux briskets à 96°C peuvent avoir des textures complètement différentes. Fais confiance à la sonde : elle doit glisser sans aucune résistance.',
    transformAdvice: 'Teste le flat (partie maigre) au point le plus épais. Si ça accroche encore, remets 30 min et reteste. La patience ici fait la différence entre un bon et un grand brisket.',
    restObjective: 'Les jus se redistribuent et la gélatine se stabilise — le repos est AUSSI important que la cuisson',
    restMarkers: [
      { type: 'visual', text: 'Emballer serré dans du papier boucher, puis dans une serviette épaisse' },
      { type: 'visual', text: 'Placer dans une glacière fermée (sans glace). Peut tenir 4h+ sans problème.' },
      { type: 'info', text: 'Un brisket qui a reposé 2h sera toujours meilleur qu\'un brisket découpé à la sortie du fumoir.' },
    ],
    restAdvice: 'Minimum 1h de repos, idéalement 2h. Aaron Franklin repose ses briskets 2-3h en glacière. C\'est pendant le repos que la magie opère — la gélatine épaissit et retient les jus.',
  }

  // ── BEEF SHORT RIBS ──
  if (id === 'beef_short_ribs') return {
    phase1Objective: 'Développement de la bark et pénétration de la fumée dans les fibres épaisses',
    phase1Visual: 'La surface caramélise lentement. Le gras entre les os commence à rendre et perle en surface.',
    phase1Temp: 'Température interne : ~55–70°C',
    phase1Info: 'Les short ribs sont très persillées — le gras intramusculaire fond pendant toute la cuisson et donne cette texture « beefy » incomparable.',
    phase1Advice: 'Dispose les short ribs os vers le bas pour protéger la viande. Le gras va fondre vers le bas et nourrir la bark. Bois recommandé : chêne ou hickory.',
    stallObjective: 'Stall classique — la température interne semble bloquée pendant que l\'eau s\'évapore',
    stallInfo: 'Sur les short ribs, le stall peut être moins prononcé que sur un brisket car la pièce est plus petite, mais il est bien là.',
    stallAdvice: 'Patience. Les short ribs ont beaucoup de tissu conjonctif qui a besoin de temps pour se transformer. Ne coupe pas la cuisson trop tôt.',
    wrapTip: 'L\'aluminium fonctionne très bien pour les short ribs — l\'effet « braisé » est un plus sur cette pièce grasse.',
    wrapAdvice: 'Alu ou papier boucher, les deux marchent. Ajoute un peu de bouillon de bœuf ou de jus de cuisson pour braiser légèrement. Le résultat sera spectaculaire.',
    transformObjective: 'Le gras et les tissus conjonctifs fondent — la viande devient tremblotante comme de la gelée',
    transformInfo: 'Les short ribs peuvent encaisser jusqu\'à 99°C sans problème. Plus tu pousses (dans la cible), plus c\'est fondant. Le gras protège la viande du dessèchement.',
    transformAdvice: 'Secoue doucement le rack — la viande doit trembler comme de la gelée. C\'est le signe que c\'est prêt. Si c\'est encore ferme, remets 30 min.',
    restObjective: 'Stabilisation des jus — repos modéré pour une viande prête à servir',
    restMarkers: [
      { type: 'visual', text: 'Reposer 30 min à 1h à couvert, dans l\'emballage' },
      { type: 'visual', text: 'La viande doit légèrement « figer » en surface — c\'est le gras qui se stabilise' },
    ],
    restAdvice: 'Repos plus court que le brisket — 30 min à 1h suffit. Les short ribs se servent souvent en rack entier, découpées entre les os à table.',
  }

  // ── CHUCK ROAST / PALERON ──
  if (id === 'chuck_roast') return {
    phase1Objective: 'Formation de la bark sur cette pièce compacte et persillée',
    phase1Visual: 'La surface fonce uniformément. Le paleron étant compact, la bark se forme plus vite que sur un brisket.',
    phase1Temp: 'Température interne : ~55–70°C',
    phase1Info: 'Le paleron est le « poor man\'s brisket » — moins cher, plus rapide, et excellent en pulled beef. Très persillé = très tolérant.',
    phase1Advice: 'Pas besoin de spritzer le paleron — il a suffisamment de gras interne pour rester juteux. Laisse le fumoir faire son travail.',
    stallObjective: 'Stall plus court que le brisket grâce à la taille plus modeste de la pièce',
    stallInfo: 'Le paleron stalle aussi mais moins longtemps. Le réseau de gras interne aide à passer le plateau plus vite.',
    stallAdvice: 'Le paleron est plus tolérant que le brisket. Même si tu dépasses un peu la cible en température, le gras interne compense.',
    wrapTip: 'Le papier alu avec un fond de bouillon donne un excellent résultat « braisé » sur le paleron.',
    wrapAdvice: 'Emballer avec un filet de bouillon de bœuf ou de Worcestershire. Le paleron se prête bien à un résultat mi-fumé, mi-braisé.',
    transformObjective: 'Le réseau de gras et de tissus conjonctifs fond — le paleron se défait en filaments',
    transformInfo: 'Cible 91–96°C. Le paleron est prêt quand tu peux le tirer en filaments avec deux fourchettes sans effort.',
    transformAdvice: 'Teste en tirant un morceau avec une fourchette. Si ça se défait en filaments sans résistance, c\'est prêt pour du pulled beef. Sinon, remets 20 min.',
    restObjective: 'Court repos pour stabiliser la texture avant d\'effilocher',
    restMarkers: [
      { type: 'visual', text: 'Reposer 30 min à couvert dans l\'emballage' },
      { type: 'info', text: 'Le paleron peut être effiloché directement après le repos — pas besoin de glacière' },
    ],
    restAdvice: 'Repos de 30 min à 1h, puis effiloche dans un grand saladier. Mélange avec un peu de jus de cuisson récupéré dans l\'emballage.',
  }

  // ── PULLED PORK ──
  if (id === 'pulled_pork') return {
    phase1Objective: 'Formation de la bark et absorption maximale de la fumée — c\'est ici que le goût se construit',
    phase1Visual: 'La surface rougit puis vire au brun-rouge foncé. La couche de gras externe commence à fondre et nourrit la bark.',
    phase1Temp: 'Température interne : ~55–65°C',
    phase1Info: 'L\'échine de porc (pork butt) est la pièce la plus tolérante du BBQ. Beaucoup de gras, beaucoup de tissu conjonctif = beaucoup de saveur et une grande marge d\'erreur.',
    phase1Advice: 'Bois de choix : pommier, cerisier, ou hickory. Le fumoir à 107–121°C est le sweet spot. Ne soulève pas le couvercle pendant les 3 premières heures.',
    stallObjective: 'Le porc stalle plus tôt et parfois plus longtemps que le bœuf — c\'est normal',
    stallInfo: 'L\'échine de porc contient beaucoup d\'eau. Le stall peut commencer dès 63°C et durer plusieurs heures. C\'est la phase la plus longue.',
    stallAdvice: 'C\'est LE moment de patience. Le pulled pork récompense ceux qui ne paniquent pas. Si tu as le temps, ne wrappe pas — la bark sera exceptionnelle.',
    wrapTip: 'Pour le porc, l\'alu fonctionne aussi bien que le papier boucher. Ajoute du jus de pomme ou du vinaigre de cidre dans le wrap.',
    wrapAdvice: 'Emballe avec un généreux filet de jus de pomme (ou bière, ou vinaigre de cidre). L\'acidité attendrit les fibres et ajoute une couche de saveur. Le porc est tolérant — difficile de rater.',
    transformObjective: 'Le gras fond dans les fibres, les tissus se relâchent — la viande devient effilochable',
    transformInfo: 'La cible est 93–96°C mais c\'est la sonde qui décide. L\'os doit tourner librement et se retirer presque tout seul — c\'est le signe ultime.',
    transformAdvice: 'Essaie de faire tourner l\'os. S\'il bouge librement, c\'est prêt. La sonde doit glisser partout comme dans du beurre fondu. Si l\'os résiste encore, remets 30 min.',
    restObjective: 'Les fibres se relâchent encore et les jus se redistribuent — le repos rend le effilochage plus facile',
    restMarkers: [
      { type: 'visual', text: 'Emballer dans du papier alu puis dans une serviette, placer en glacière (sans glace)' },
      { type: 'visual', text: 'Le jus va continuer à s\'accumuler dans l\'emballage — récupère-le pour le mélanger au pulled pork' },
    ],
    restAdvice: 'Minimum 45 min, idéalement 1h30. Comme le brisket, le pulled pork peut tenir 3-4h en glacière sans problème. Plus tu reposes, plus c\'est facile à effilocher et juteux.',
  }

  // ── FALLBACK (profil inconnu) ──
  return {
    phase1Objective: 'Formation de la bark et développement des saveurs fumées',
    phase1Visual: 'La surface de la viande fonce progressivement et devient sèche au toucher',
    phase1Temp: 'Température interne : ~55–70°C',
    phase1Info: 'C\'est pendant cette phase que la viande absorbe le plus de fumée. Ne pas ouvrir le couvercle trop souvent.',
    phase1Advice: 'Chaque ouverture du couvercle ajoute 15-20 min de cuisson. Laisse le fumoir faire son travail.',
    stallObjective: 'Phase normale où la température interne semble stagner — la viande transpire',
    stallInfo: 'L\'évaporation de l\'eau refroidit la viande en surface — c\'est le même principe que la transpiration. Le stall finit toujours par passer.',
    stallAdvice: 'Ne pas monter la température du fumoir. Patience. C\'est la phase la plus frustrante mais la plus importante.',
    wrapTip: 'Papier boucher pour garder la bark, aluminium pour aller plus vite.',
    wrapAdvice: 'Le wrap (Texas Crutch) accélère la fin de cuisson et passe le stall plus vite. Choisis papier boucher pour la bark, alu pour la vitesse.',
    transformObjective: 'Les tissus conjonctifs se transforment en gélatine — la viande devient tendre et fondante',
    transformInfo: 'C\'est la texture qui décide, pas le thermomètre. La sonde doit entrer sans résistance — c\'est le test ultime.',
    transformAdvice: 'Teste au point le plus épais. Si ça accroche, remets 20-30 min et reteste. La patience ici fait toute la différence.',
    restObjective: 'Les jus se redistribuent dans toute la viande',
    restMarkers: [
      { type: 'visual', text: 'Emballer dans une serviette épaisse' },
      { type: 'visual', text: 'Placer dans une glacière fermée (sans glace)' },
    ],
    restAdvice: 'Repos à couvert. Un long repos en glacière améliore toujours le résultat.',
  }
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
      `Monter jusqu'à ${temps[d] ? (temps[d] - (profile.reverse_sear?.pull_before_target_c || 6)) + '°C' : '~46–52°C'} interne`,
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

// ── Phases volaille ─────────────────────────────────────

function buildPoultryPhases(profile, totalCookMin, tolerance, ctx) {
  const phases = []
  const highTemp = ctx.cookTempC >= 150

  // Phase 1: Mise en fumée
  const phase1Min = totalCookMin * 0.35
  phases.push({
    num: 1,
    title: 'Mise en fumée',
    duration: formatApproxDuration(phase1Min, tolerance * 100),
    objective: 'Absorption de la fumée et coloration de la peau',
    markers: [
      { type: 'visual', text: 'La peau commence à dorer et prend une teinte ambrée' },
      { type: 'temp', text: 'Température interne : ~40–55°C' },
      { type: 'visual', text: 'Placement de la sonde : piquer dans la partie la plus épaisse de la cuisse, sans toucher l\'os' },
    ],
    advice: 'Plante la sonde dans le gras de la cuisse, entre le pilon et le haut de cuisse, en visant le centre de la chair. C\'est la partie la plus longue à cuire — c\'est elle qui décide quand le poulet est prêt.',
  })

  // Phase 2: Cuisson principale
  const phase2Min = totalCookMin * 0.45
  phases.push({
    num: 2,
    title: 'Cuisson principale',
    duration: formatApproxDuration(phase2Min, tolerance * 100),
    objective: 'Montée en température progressive vers la cible de 74°C',
    markers: [
      { type: 'temp', text: 'La température monte régulièrement — pas de stall comme le bœuf ou le porc' },
      { type: 'temp', text: 'Commencer à surveiller à partir de 65°C interne' },
      { type: 'visual', text: 'Le jus qui coule de la cuisse doit devenir clair (pas rosé)' },
    ],
    advice: highTemp
      ? 'À 150°C+ au fumoir, la peau croustille bien. C\'est le sweet spot pour un poulet fumé avec une belle peau.'
      : 'En dessous de 130°C, la peau reste molle et caoutchouteuse. Pense à finir 10 min sur un grill chaud pour la crisper.',
  })

  // Phase 3: Finition / vérification
  phases.push({
    num: 3,
    title: 'Vérification & finition',
    duration: '5–10 min',
    objective: 'S\'assurer que le poulet est cuit à cœur et que la peau est à ton goût',
    markers: [
      { type: 'temp', text: 'Cible : 74°C dans la cuisse (sécurité alimentaire)' },
      { type: 'temp', text: 'Vérifier aussi entre le blanc et la cuisse : piquer à la jonction, viser 74°C' },
      { type: 'visual', text: 'Remuer une cuisse — elle doit bouger facilement dans l\'articulation' },
    ],
    advice: !highTemp
      ? 'Peau molle ? Finis 5–10 min sur un grill très chaud (250°C+) ou sous le gril du four pour crisper la peau sans sur-cuire la chair.'
      : 'Si la peau est déjà dorée et croustillante, c\'est prêt. Ne dépasse pas 80°C interne sinon les blancs sèchent.',
  })

  // Phase 4: Repos
  phases.push({
    num: 4,
    title: 'Repos',
    duration: formatRange(ctx.restMin, ctx.restMax),
    objective: 'Les jus se redistribuent — le poulet sera plus juteux à la découpe',
    markers: [
      { type: 'visual', text: 'Couvrir de papier alu en tente (sans serrer, pour garder la peau croustillante)' },
      { type: 'visual', text: 'Laisser reposer sur une planche, pas dans un plat (l\'humidité ramollit le dessous)' },
    ],
    advice: 'Un repos de 10–15 min suffit pour le poulet. Pas besoin de glacière comme pour le brisket — la volaille se découpe vite.',
  })

  return phases
}

// ── Conseils pitmaster ──────────────────────────────────

function buildTips(profile, wrapped, weightKg, cookTempC) {
  const tips = []

  // Conseils spécifiques volaille
  if (profile.category === 'volaille') {
    tips.push('Plante la sonde dans la cuisse, pas dans le blanc. La cuisse est la dernière partie à atteindre 74°C — c\'est elle qui décide.')
    tips.push('74°C dans la cuisse = poulet cuit et juteux. Au-delà de 80°C, les blancs commencent à sécher.')
    if (cookTempC < 140) {
      tips.push('En dessous de 140°C au fumoir, la peau ne croustillera pas. Prévois une finition au grill ou au four (250°C, 5–10 min).')
    }
    if (cookTempC >= 150) {
      tips.push('À 150°C+ au fumoir, la peau devrait bien crisper. C\'est la température idéale pour un poulet fumé.')
    }
    tips.push('Astuce pro : sèche bien la peau avec du papier absorbant avant d\'appliquer le rub. Une peau sèche = une peau croustillante.')
    tips.push("Chaque cuisson est différente. Les durées sont des estimations — c'est la viande qui décide, pas la montre.")
    return tips
  }

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
