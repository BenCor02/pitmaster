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
    const d = doneness || profile.default_doneness || 'medium_rare'
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

  // Repères spécifiques par profil (hardcoded fallback)
  const meatTips = getLowSlowMeatTips(profile)
  // Textes admin-editables (priorité sur hardcoded)
  const pt = profile.phases_text || {}

  // Phase 1: Prise de fumée (~25%)
  const phase1Min = totalCookMin * 0.25
  phases.push({
    num: 1,
    title: pt.phase1_title || 'Prise de fumée',
    duration: formatApproxDuration(phase1Min, tolerance * 100),
    objective: pt.phase1_objective || meatTips.phase1Objective,
    markers: [
      { type: 'visual', text: pt.phase1_visual || meatTips.phase1Visual },
      { type: 'temp', text: pt.phase1_temp || meatTips.phase1Temp },
      { type: 'info', text: pt.phase1_info || meatTips.phase1Info },
    ],
    advice: pt.phase1_advice || meatTips.phase1Advice,
  })

  // Phase 2: Stall (~30%)
  if (profile.cues?.stall_temp_min) {
    const phase2Min = totalCookMin * 0.30
    phases.push({
      num: 2,
      title: pt.stall_title || 'Le Stall — la viande transpire',
      duration: formatApproxDuration(phase2Min, tolerance * 100),
      objective: pt.stall_objective || meatTips.stallObjective,
      markers: [
        { type: 'temp', text: `Plateau entre ${profile.cues.stall_temp_min}°C et ${profile.cues.stall_temp_max}°C — la sonde ne bouge plus` },
        { type: 'info', text: pt.stall_info || meatTips.stallInfo },
      ],
      advice: pt.stall_advice || meatTips.stallAdvice,
    })
  }

  // Phase 3: Wrap (si activé)
  if (wrapped && profile.supports_wrap) {
    phases.push({
      num: phases.length + 1,
      title: pt.wrap_title || 'Le Wrap — Texas Crutch',
      duration: null,
      objective: pt.wrap_objective || 'Passer le stall, garder l\'humidité et accélérer la dernière ligne droite',
      markers: [
        { type: 'temp', text: profile.cues?.wrap_temp_min ? `Emballer entre ${profile.cues.wrap_temp_min}°C et ${profile.cues.wrap_temp_max}°C interne` : 'Emballer quand la bark est bien fixée' },
        { type: 'visual', text: profile.cues?.visual_wrap || 'Bark sèche, sombre, ne se raye plus à l\'ongle' },
        { type: 'info', text: pt.wrap_tip || meatTips.wrapTip },
      ],
      advice: pt.wrap_advice || meatTips.wrapAdvice,
    })
  }

  // Phase 4: La Transformation (~25%)
  const phase4Min = totalCookMin * 0.25
  phases.push({
    num: phases.length + 1,
    title: pt.transform_title || 'La Transformation',
    duration: formatApproxDuration(phase4Min, tolerance * 100),
    objective: pt.transform_objective || meatTips.transformObjective,
    markers: [
      { type: 'temp', text: profile.cues?.begin_test_temp ? `Commencer les tests vers ${profile.cues.begin_test_temp}°C` : 'Commencer les tests vers 90°C' },
      { type: 'visual', text: profile.cues?.probe_tender || 'La sonde entre comme dans du beurre' },
      { type: 'temp', text: profile.cues?.target_temp_min ? `Cible : ${profile.cues.target_temp_min}–${profile.cues.target_temp_max}°C` : 'Cible : 92–97°C' },
      { type: 'info', text: pt.transform_info || meatTips.transformInfo },
    ],
    advice: pt.transform_advice || meatTips.transformAdvice,
  })

  // Phase 5: Repos
  const restMarkers = pt.rest_markers_text
    ? pt.rest_markers_text.split('\n').filter(Boolean).map(t => ({ type: 'visual', text: t }))
    : meatTips.restMarkers
  phases.push({
    num: phases.length + 1,
    title: pt.rest_title || 'Le Repos — patience finale',
    duration: formatRange(ctx.restMin, ctx.restMax),
    objective: pt.rest_objective || meatTips.restObjective,
    markers: restMarkers,
    advice: pt.rest_advice || meatTips.restAdvice,
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

  // ── ÉPAULE D'AGNEAU ──
  if (id === 'lamb_shoulder') return {
    phase1Objective: 'Formation de la bark et pénétration de la fumée — l\'agneau absorbe vite les arômes',
    phase1Visual: 'La surface brunit progressivement. Le gras d\'agneau commence à fondre et perle en surface, nourrissant la bark.',
    phase1Temp: 'Température interne : ~50–65°C',
    phase1Info: 'L\'épaule d\'agneau est l\'équivalent du pulled pork pour l\'agneau — très riche en collagène et en gras. Bois fruitier obligatoire : cerisier, pommier ou érable. Le hickory et le chêne écrasent l\'agneau.',
    phase1Advice: 'Le gras d\'agneau a un goût prononcé — le bois fruitier l\'équilibre. Ne mets pas trop de bois : 2-3 petits morceaux suffisent. L\'agneau n\'a pas besoin d\'autant de fumée que le bœuf.',
    stallObjective: 'Le stall de l\'agneau est similaire au porc — la viande transpire et la température stagne',
    stallInfo: 'Le stall est généralement plus court que sur le porc ou le bœuf car l\'épaule d\'agneau est plus petite (1.5-2.5 kg typiquement).',
    stallAdvice: 'L\'épaule d\'agneau est très tolérante. Si tu dépasses un peu les températures, le gras interne compense. C\'est une pièce idéale pour se lancer dans le fumage de l\'agneau.',
    wrapTip: 'Papier boucher de préférence pour garder la bark. Ajoute un filet de bouillon d\'agneau ou de jus de grenade pour braiser.',
    wrapAdvice: 'Le wrap accélère la fin de cuisson de 30-45 min. L\'épaule peut aussi se cuire entièrement à nu — la bark sera exceptionnelle mais il faut plus de patience.',
    transformObjective: 'Le collagène d\'agneau fond — la viande se défait en filaments pour du pulled lamb',
    transformInfo: 'Le collagène d\'agneau fond dès 91°C. L\'épaule est prête quand l\'os se retire tout seul.',
    transformAdvice: 'Essaie de tirer l\'os — s\'il glisse sans résistance, c\'est parfait. Le pulled lamb est plus fin et plus parfumé que le pulled pork. Mélange avec le jus de cuisson récupéré.',
    restObjective: 'Les jus se redistribuent — le repos facilite l\'effilochage',
    restMarkers: [
      { type: 'visual', text: 'Reposer 30 min à 1h à couvert dans l\'emballage' },
      { type: 'visual', text: 'Récupérer le jus pour le mélanger au pulled lamb' },
    ],
    restAdvice: 'Repos de 30 min à 1h en glacière. L\'agneau sèche moins que le bœuf au repos donc pas besoin de pousser au-delà.',
  }

  // ── GIGOT D'AGNEAU ──
  if (id === 'lamb_leg') return {
    phase1Objective: 'Fumage doux pour un goût délicat — le gigot se fume rosé, pas effiloché',
    phase1Visual: 'La surface du gigot prend une teinte cuivrée. Le gras de couverture fond lentement.',
    phase1Temp: 'Température interne : ~30–45°C',
    phase1Info: 'Le gigot est une pièce noble et maigre — on vise rosé à cœur (54-60°C), pas un pulled lamb. Bois fruitier léger : cerisier ou pommier. Pas de hickory.',
    phase1Advice: 'Le gigot est la pièce la moins tolérante de l\'agneau au fumoir. Surveille la sonde de près car la température monte vite une fois passé 45°C.',
    stallObjective: 'Pas de vrai stall sur le gigot — la température monte régulièrement',
    stallInfo: 'Le gigot est trop maigre pour un stall prolongé. La montée en température est assez linéaire, comme pour un reverse sear.',
    stallAdvice: 'Pas de panique si la sonde ne stagne pas — c\'est normal pour le gigot. Concentre-toi sur la température cible.',
    wrapTip: 'Le gigot ne se wrappe pas — on le sort du fumoir quand il atteint la cible.',
    wrapAdvice: 'Pas de wrap pour le gigot. Si la surface sèche trop, spritzer avec un mélange huile d\'olive + jus de citron.',
    transformObjective: 'Atteindre la température cible — le gigot se découpe en tranches fines',
    transformInfo: 'Cible 54°C (rosé) à 63°C (à point). Le gigot continue à monter de 3-5°C après la sortie du fumoir.',
    transformAdvice: 'Sors le gigot 3-5°C avant ta cible pour compenser le carryover. Découpe en tranches fines perpendiculaires à l\'os pour un résultat fondant.',
    restObjective: 'Les jus se redistribuent — repos court pour un résultat rosé et juteux',
    restMarkers: [
      { type: 'visual', text: 'Couvrir de papier alu en tente (sans serrer)' },
      { type: 'visual', text: '15-30 min de repos, pas plus — le gigot est meilleur servi chaud' },
    ],
    restAdvice: 'Repos de 15-30 min sous alu en tente. Découpe en tranches fines avec un bon couteau. Servir avec le jus qui s\'est écoulé sur la planche.',
  }

  // ── SOURIS D'AGNEAU ──
  if (id === 'lamb_shank') return {
    phase1Objective: 'Fumage pour colorer et parfumer cette pièce conjonctive',
    phase1Visual: 'La viande brunit autour de l\'os. La surface devient sèche et mate.',
    phase1Temp: 'Température interne : ~50–65°C',
    phase1Info: 'La souris est la pièce la plus conjonctive de l\'agneau — elle a besoin de temps pour devenir fondante. Le résultat vaut l\'attente : une viande confite qui tombe de l\'os.',
    phase1Advice: 'La souris est petite mais dense. Place-la debout, os vers le haut, pour une cuisson uniforme. Bois fruitier : cerisier ou pommier.',
    stallObjective: 'Stall modéré — les souris sont petites mais très conjonctives',
    stallInfo: 'Le stall est court (30-45 min) mais présent. Les tissus conjonctifs de la souris retiennent beaucoup d\'eau.',
    stallAdvice: 'C\'est le moment de braiser dans le wrap — la souris bénéficie énormément d\'un fond de bouillon ou de vin pour la phase finale.',
    wrapTip: 'Emballer avec un fond de bouillon d\'agneau, un trait de vin rouge et des aromates (thym, romarin, ail). La souris se braise autant qu\'elle se fume.',
    wrapAdvice: 'La souris donne le meilleur résultat avec une combinaison fumage + braisage. 2h de fumée à nu puis wrap avec liquide pour finir — résultat confit et parfumé.',
    transformObjective: 'Le collagène fond complètement — la viande se détache de l\'os toute seule',
    transformInfo: 'Cible 88-96°C. La souris est prête quand la viande glisse de l\'os. C\'est une cuisson de patience — pas de raccourci possible.',
    transformAdvice: 'Soulève la souris par le bout de l\'os — si la viande glisse et se détache, c\'est parfait. La texture doit être confite, presque crémeuse.',
    restObjective: 'Repos court pour stabiliser — la souris se sert entière sur l\'os',
    restMarkers: [
      { type: 'visual', text: 'Reposer 15-30 min dans l\'emballage' },
      { type: 'info', text: 'Récupérer le jus de braisage pour napper la souris au service' },
    ],
    restAdvice: 'La souris se sert entière, un os par personne. Nappe généreusement avec le jus de braisage réduit. Un classique des bistrots français, version fumoir.',
  }

  // ── POITRINE DE PORC ──
  if (id === 'pork_belly') return {
    phase1Objective: 'Caramélisation de la surface et début de fonte du gras',
    phase1Visual: 'La surface de la poitrine dore et commence à caraméliser. Le gras de couverture perle et fond lentement.',
    phase1Temp: 'Température interne : ~55–70°C',
    phase1Info: 'La poitrine de porc est la pièce la plus grasse du BBQ — c\'est un atout. Le gras fond pendant des heures et donne un résultat incroyablement fondant. Bois : hickory, cerisier ou pommier.',
    phase1Advice: 'Si ta poitrine a encore la couenne, score-la en croisillons pour aider le gras à rendre. Côté gras vers le haut pour arroser la viande pendant la cuisson.',
    stallObjective: 'Stall classique — la poitrine transpire comme un gros morceau de porc',
    stallInfo: 'Le stall sur la poitrine est similaire au pulled pork. Le gras abondant aide à passer le plateau.',
    stallAdvice: 'Patience. La poitrine de porc est quasi impossible à rater si tu respectes les températures. Le gras protège la viande du dessèchement.',
    wrapTip: 'Alu avec un filet de miel + vinaigre de cidre = caramel parfait sur la surface.',
    wrapAdvice: 'Le wrap au papier alu fonctionne très bien — ajoute du miel, du sucre brun ou du sirop d\'érable avec un trait de vinaigre de cidre. Le résultat sera laqué et caramélisé.',
    transformObjective: 'Le gras inter-couches fond complètement — chaque tranche est fondante et translucide',
    transformInfo: 'Cible 93-99°C. À cette température, les couches de gras deviennent translucides et fondent en bouche. C\'est le stade « burnt ends » — cubes caramélisés et fondants.',
    transformAdvice: 'Secoue la poitrine — elle doit trembler comme de la gelée. Le gras doit être translucide entre les couches de viande. Si tu veux des burnt ends, coupe en cubes de 3cm avant la dernière heure.',
    restObjective: 'Le gras se stabilise et les jus se redistribuent',
    restMarkers: [
      { type: 'visual', text: 'Reposer 30 min à 1h en glacière à couvert' },
      { type: 'visual', text: 'Le gras va figer légèrement en surface — c\'est normal et souhaité' },
    ],
    restAdvice: 'Repos de 30 min à 1h. Découpe en tranches épaisses de 1-2 cm perpendiculaires aux couches de gras. Chaque tranche doit avoir de la viande ET du gras.',
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
  const pt = profile.phases_text || {}

  // Helper: parse markers text (one per line) or fallback to array
  const parseMarkers = (textKey, fallback) => {
    if (pt[textKey]) return pt[textKey].split('\n').filter(Boolean).map(t => ({ type: 'visual', text: t }))
    return fallback
  }

  if (wrapped) {
    const smokeH = isSpare ? 3 : 2
    const wrapH = 2
    const finishH = 1

    phases.push({
      num: 1,
      title: pt.smoke_title || 'Fumée à nu',
      duration: `~${smokeH}h`,
      objective: pt.smoke_objective || 'Développer la bark et les arômes fumés',
      markers: parseMarkers('smoke_markers_text', [
        { type: 'visual', text: 'La surface fonce et devient sèche' },
        { type: 'temp', text: '110–120°C au fumoir' },
      ]),
      advice: pt.smoke_advice || "Pas besoin de spritzer pendant cette phase. Laisser le feu faire son travail.",
    })

    phases.push({
      num: 2,
      title: pt.wrap_title || 'Emballé (wrap)',
      duration: `~${wrapH}h`,
      objective: pt.wrap_objective || 'Attendrir la viande et accélérer la cuisson',
      markers: parseMarkers('wrap_markers_text', [
        { type: 'visual', text: 'Emballer avec beurre, miel ou jus de pomme' },
        { type: 'visual', text: 'Papier alu ou papier boucher' },
      ]),
      advice: pt.wrap_advice || "C'est pendant cette phase que la viande devient fondante. Ne pas ouvrir.",
    })

    phases.push({
      num: 3,
      title: pt.finish_title || 'Finition / laquage',
      duration: `~${finishH}h`,
      objective: pt.finish_objective || 'Caraméliser la sauce et raffermir légèrement la surface',
      markers: parseMarkers('finish_markers_text', [
        { type: 'visual', text: 'Appliquer la sauce en couches fines' },
        { type: 'visual', text: 'La sauce doit devenir collante et brillante' },
      ]),
      advice: pt.finish_advice || "Remettre à nu dans le fumoir. Badigeonner toutes les 15-20 minutes.",
    })
  } else {
    const totalH = isSpare ? '5 à 6' : '4 à 5'
    phases.push({
      num: 1,
      title: pt.unwrapped_title || 'Fumée complète à nu',
      duration: `~${totalH}h`,
      objective: pt.unwrapped_objective || 'Cuisson lente sans emballage — bark maximale',
      markers: [
        { type: 'visual', text: 'Surface très sombre et sèche' },
        { type: 'temp', text: '110–120°C au fumoir' },
        { type: 'visual', text: profile.cues?.probe_tender || 'Flex test : le rack plie et fissure' },
      ],
      advice: pt.unwrapped_advice || "Sans wrap, la bark est plus prononcée mais la viande est moins fondante. Spritzer toutes les 45 min si nécessaire.",
    })
  }

  // Repos ribs
  phases.push({
    num: phases.length + 1,
    title: pt.rest_title || 'Repos',
    duration: formatRange(ctx.restMin, ctx.restMax),
    objective: pt.rest_objective || 'Laisser les jus se redistribuer',
    markers: parseMarkers('rest_markers_text', [
      { type: 'visual', text: 'Reposer 10-20 minutes à couvert' },
    ]),
    advice: pt.rest_advice || 'Les ribs ne nécessitent pas un long repos comme un brisket.',
  })

  return phases
}

function buildReverseSearPhases(profile, totalCookMin, tolerance, ctx) {
  const phases = []
  const pt = profile.phases_text || {}
  const rs = getReverseSearTexts(profile.id)

  // Phase 1: Cuisson indirecte
  phases.push({
    num: 1,
    title: pt.indirect_title || 'Cuisson indirecte basse température',
    duration: formatApproxDuration(totalCookMin, tolerance * 100),
    objective: pt.indirect_objective || rs.indirectObjective,
    markers: [
      { type: 'temp', text: `Fumoir à ${ctx.cookTempC}°C (zone indirecte)` },
      { type: 'temp', text: ctx.reversePullTemp ? `Sortir ${rs.pieceName} à ${ctx.reversePullTemp}°C interne` : 'Sortir ~8°C avant la cible finale' },
      ...rs.indirectExtraMarkers,
    ],
    advice: pt.indirect_advice || rs.indirectAdvice,
  })

  // Phase 2: Saisie
  phases.push({
    num: 2,
    title: pt.sear_title || 'Saisie finale (sear)',
    duration: `~${ctx.searMinutes} min total`,
    objective: pt.sear_objective || rs.searObjective,
    markers: [
      { type: 'temp', text: rs.searTemp },
      { type: 'visual', text: rs.searDuration },
      { type: 'temp', text: ctx.targetFinalTemp ? `Cible finale : ${ctx.targetFinalTemp}°C` : '' },
    ].filter(m => m.text),
    advice: pt.sear_advice || rs.searAdvice,
  })

  // Phase 3: Repos court
  phases.push({
    num: 3,
    title: pt.rest_title || 'Repos',
    duration: formatRange(ctx.restMin, ctx.restMax),
    objective: pt.rest_objective || rs.restObjective,
    markers: [
      { type: 'visual', text: rs.restMarker },
    ],
    advice: pt.rest_advice || rs.restAdvice,
  })

  return phases
}

/**
 * Textes spécifiques par profil pour les phases reverse sear.
 */
function getReverseSearTexts(id) {

  // ── CARRÉ D'AGNEAU ──
  if (id === 'rack_of_lamb') return {
    pieceName: 'le carré',
    indirectObjective: 'Monter doucement la température du carré pour une cuisson rosée et uniforme',
    indirectExtraMarkers: [
      { type: 'visual', text: 'Placement de la sonde : entre deux côtes, au centre de la partie la plus épaisse' },
    ],
    indirectAdvice: 'Le carré d\'agneau est délicat — bois fruitier léger uniquement (cerisier, pommier). Le chêne et le hickory écrasent l\'agneau. 2-3 petits morceaux suffisent.',
    searObjective: 'Créer une croûte dorée sur le gras du carré (réaction de Maillard)',
    searTemp: 'Grill ou poêle en fonte à 300°C+',
    searDuration: '~1-2 min par face — commencer côté gras',
    searAdvice: 'Saisis côté gras d\'abord pour le rendre croustillant. Le carré a une fine couche de gras qui dore vite — surveille bien pour ne pas brûler.',
    restObjective: 'Les jus se redistribuent — repos très court pour servir chaud',
    restMarker: 'Repos 5-10 min sous alu en tente — le carré refroidit vite',
    restAdvice: 'Découpe entre chaque côte pour des côtelettes individuelles. Le carré d\'agneau se sert rosé — c\'est une pièce noble, ne la sur-cuis pas.',
  }

  // ── FILET MIGNON DE PORC ──
  if (id === 'pork_tenderloin') return {
    pieceName: 'le filet',
    indirectObjective: 'Fumer doucement ce filet maigre sans le dessécher',
    indirectExtraMarkers: [
      { type: 'visual', text: 'Placement de la sonde : au centre du filet, dans la partie la plus épaisse' },
      { type: 'info', text: 'Le filet mignon est très maigre — il sèche vite. Ne dépasse pas la cible.' },
    ],
    indirectAdvice: 'Le filet mignon de porc est fin et maigre — la montée en température est rapide. Surveille la sonde de près à partir de 50°C. Bois fruitier léger : pommier ou cerisier.',
    searObjective: 'Saisie rapide pour caraméliser la surface sans sur-cuire l\'intérieur',
    searTemp: 'Poêle en fonte ou grill à 250°C+',
    searDuration: '~1 min par face — le filet est fin, ça va très vite',
    searAdvice: 'Le filet est rond et fin — fais-le tourner pour saisir toute la surface uniformément. Une minute par « face » suffit largement.',
    restObjective: 'Repos court — le filet refroidit très vite',
    restMarker: 'Repos 5 min sous alu en tente — découper en médaillons de 2 cm',
    restAdvice: 'Découpe en médaillons épais (2 cm). Le filet mignon de porc est excellent rosé (63°C) — safe selon l\'ANSES et l\'USDA, juteux et fondant. À point (68°C) pour ceux qui préfèrent sans rose.',
  }

  // ── MAGRET DE CANARD ──
  if (id === 'duck_breast') return {
    pieceName: 'le magret',
    indirectObjective: 'Fumer le magret côté chair pour absorber la fumée sans brûler le gras',
    indirectExtraMarkers: [
      { type: 'visual', text: 'Placement de la sonde : piquer côté chair, au centre de la partie la plus épaisse' },
      { type: 'info', text: 'Score le gras en croisillons avant de fumer — ça aide à rendre le gras pendant le fumage' },
    ],
    indirectAdvice: 'Fume le magret côté chair vers le bas (gras vers le haut). Le gras fond lentement et arrose la chair. Bois fruitier : cerisier ou érable — pas de hickory.',
    searObjective: 'Crisper la peau et le gras du magret — c\'est ce qui fait toute la différence',
    searTemp: 'Poêle en fonte brûlante à 250–300°C',
    searDuration: '~2-3 min côté peau d\'abord, puis ~1 min côté chair',
    searAdvice: 'Saisie CÔTÉ PEAU D\'ABORD — c\'est le gras qui doit croustiller. Le gras va rendre et grésiller : c\'est normal. Retourne une seule fois. Le magret se mange rosé — 52-57°C max.',
    restObjective: 'Les jus se redistribuent — repos court pour garder le croustillant du gras',
    restMarker: 'Repos 5-10 min sur une planche (pas sous alu, pour garder la peau croustillante)',
    restAdvice: 'Découpe en tranches fines en biais. Le magret fumé se sert rosé, comme un bon steak. Accompagne avec une sauce aux fruits rouges ou au miel pour jouer avec le fumé.',
  }

  // ── CÔTE DE BŒUF ──
  if (id === 'prime_rib') return {
    pieceName: 'la côte',
    indirectObjective: 'Monter doucement en température pour une cuisson uniforme du bord au centre',
    indirectExtraMarkers: [
      { type: 'visual', text: 'Placement de la sonde : au centre de la partie la plus épaisse, loin de l\'os et du gras' },
    ],
    indirectAdvice: 'La côte de bœuf est épaisse — la montée est lente et régulière. C\'est exactement ce qu\'on veut. Bois de choix : chêne ou noyer pour un goût classique.',
    searObjective: 'Créer une croûte intense sur la surface (réaction de Maillard)',
    searTemp: 'Grill à charbon ou fonte à 250–300°C',
    searDuration: '~1-2 min par face — saisie violente et courte',
    searAdvice: 'La côte de bœuf a du gras de surface qui va grésiller et flamber pendant la saisie — c\'est normal. Surveille les flammes et déplace la viande si nécessaire.',
    restObjective: 'Les jus se redistribuent — le repos fait passer la cuisson de bonne à excellente',
    restMarker: 'Repos 10-20 min sous alu en tente (sans serrer)',
    restAdvice: 'Découpe en tranches épaisses perpendiculaires à l\'os. Le jus qui coule sur la planche se récupère et se verse sur les tranches au service.',
  }

  // ── TOMAHAWK ──
  if (id === 'tomahawk') return {
    pieceName: 'le tomahawk',
    indirectObjective: 'Monter lentement ce steak ultra-épais pour une cuisson parfaitement uniforme',
    indirectExtraMarkers: [
      { type: 'visual', text: 'Placement de la sonde : au centre géométrique du steak, loin de l\'os' },
    ],
    indirectAdvice: 'Le tomahawk est très épais — c\'est la pièce idéale pour le reverse sear. La montée lente garantit un intérieur rosé uniforme d\'un bord à l\'autre.',
    searObjective: 'Saisie violente pour une croûte épaisse digne d\'un steakhouse',
    searTemp: 'Grill à charbon très chaud ou fonte fumante à 300°C+',
    searDuration: '~1-2 min par face — manipuler avec des pinces, pas une fourchette',
    searAdvice: 'Le tomahawk impressionne à table — présente-le avec l\'os. Saisis bien les bords aussi (tiens le steak debout avec des pinces). Le gras du bord doit être doré et croustillant.',
    restObjective: 'Repos court — le tomahawk garde bien sa chaleur grâce à son épaisseur',
    restMarker: 'Repos 5-10 min sous alu lâche — l\'os aide à conserver la chaleur',
    restAdvice: 'Tranche perpendiculairement à l\'os en tranches de 1 cm. Le jus va couler — récupère-le pour napper. Service : le tomahawk se partage, c\'est une pièce conviviale.',
  }

  // ── FALLBACK ──
  return {
    pieceName: 'la viande',
    indirectObjective: 'Monter doucement en température pour une cuisson uniforme',
    indirectExtraMarkers: [],
    indirectAdvice: "La patience est la clé. Plus la montée est lente, plus la cuisson est uniforme d'un bord à l'autre.",
    searObjective: 'Créer une croûte caramélisée (réaction de Maillard)',
    searTemp: 'Grill ou poêle en fonte à 250–300°C',
    searDuration: '~45–60 secondes par face',
    searAdvice: "Sécher la surface avant de saisir. Une surface sèche = meilleure croûte.",
    restObjective: 'Redistribution des jus',
    restMarker: 'Repos court sous aluminium',
    restAdvice: "Ne pas couper immédiatement. Même 5 minutes font une différence.",
  }
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

  const d = doneness || profile.default_doneness || 'medium_rare'
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
      bleu: { temp: temps.bleu || 45, label: 'Bleu' },
      rare: { temp: temps.rare || 52, label: 'Saignant' },
      medium_rare: { temp: temps.medium_rare || 54, label: 'À point' },
      medium: { temp: temps.medium || 60, label: 'Bien cuit' },
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
  const pt = profile.phases_text || {}
  const id = profile.id

  // Helper: parse markers text (one per line) or fallback to array
  const parseMarkers = (textKey, fallback) => {
    if (pt[textKey]) return pt[textKey].split('\n').filter(Boolean).map(t => ({ type: 'visual', text: t }))
    return fallback
  }

  // Textes spécifiques par profil volaille
  const texts = getPoultryTexts(id, highTemp)

  // Phase 1: Mise en fumée
  const phase1Min = totalCookMin * 0.35
  phases.push({
    num: 1,
    title: pt.smoke_title || 'Mise en fumée',
    duration: formatApproxDuration(phase1Min, tolerance * 100),
    objective: pt.smoke_objective || texts.smokeObjective,
    markers: parseMarkers('smoke_markers_text', texts.smokeMarkers),
    advice: pt.smoke_advice || texts.smokeAdvice,
  })

  // Phase 2: Cuisson principale
  const phase2Min = totalCookMin * 0.45
  phases.push({
    num: 2,
    title: pt.cook_title || 'Cuisson principale',
    duration: formatApproxDuration(phase2Min, tolerance * 100),
    objective: pt.cook_objective || texts.cookObjective,
    markers: parseMarkers('cook_markers_text', texts.cookMarkers),
    advice: highTemp
      ? (pt.cook_advice_high || texts.cookAdviceHigh)
      : (pt.cook_advice_low || texts.cookAdviceLow),
  })

  // Phase 3: Finition / vérification
  phases.push({
    num: 3,
    title: pt.finish_title || 'Vérification & finition',
    duration: '5–10 min',
    objective: pt.finish_objective || texts.finishObjective,
    markers: parseMarkers('finish_markers_text', texts.finishMarkers),
    advice: !highTemp
      ? (pt.finish_advice_low || texts.finishAdviceLow)
      : (pt.finish_advice_high || texts.finishAdviceHigh),
  })

  // Phase 4: Repos
  phases.push({
    num: 4,
    title: pt.rest_title || 'Repos',
    duration: formatRange(ctx.restMin, ctx.restMax),
    objective: pt.rest_objective || texts.restObjective,
    markers: parseMarkers('rest_markers_text', texts.restMarkers),
    advice: pt.rest_advice || texts.restAdvice,
  })

  return phases
}

/**
 * Textes spécifiques par type de volaille pour buildPoultryPhases.
 * Chaque volaille a ses propres repères visuels et conseils.
 */
function getPoultryTexts(id, highTemp) {

  // ── CUISSES DE POULET ──
  if (id === 'chicken_thighs') return {
    smokeObjective: 'Absorption de la fumée et coloration de la peau des cuisses',
    smokeMarkers: [
      { type: 'visual', text: 'La peau des cuisses commence à dorer et prend une teinte ambrée' },
      { type: 'temp', text: 'Température interne : ~40–55°C' },
      { type: 'visual', text: 'Placement de la sonde : piquer dans la partie la plus épaisse de la cuisse, sans toucher l\'os du fémur' },
    ],
    smokeAdvice: 'Plante la sonde au centre de la partie la plus charnue, loin de l\'os. Les cuisses sont tolérantes — elles pardonnent un peu de sur-cuisson grâce au gras et au collagène.',
    cookObjective: 'Montée en température vers 77–82°C — le dark meat est meilleur au-delà de 74°C',
    cookMarkers: [
      { type: 'temp', text: 'La température monte régulièrement — pas de stall sur les cuisses' },
      { type: 'temp', text: 'Commencer à surveiller à partir de 70°C interne' },
      { type: 'visual', text: 'La viande commence à se rétracter autour de l\'os — c\'est normal' },
    ],
    cookAdviceHigh: 'À 150°C+ au fumoir, la peau croustille bien. C\'est le sweet spot pour des cuisses avec une belle peau.',
    cookAdviceLow: 'En dessous de 135°C, la peau reste molle et caoutchouteuse. Astuce compétition : finis 5 min sur un grill très chaud pour crisper.',
    finishObjective: 'S\'assurer que les cuisses sont cuites à cœur — le dark meat supporte bien la chaleur',
    finishMarkers: [
      { type: 'temp', text: 'Cible : 77–82°C dans la cuisse (74°C minimum sécurité alimentaire)' },
      { type: 'visual', text: 'Le jus qui coule doit être clair, pas rosé' },
      { type: 'visual', text: 'La viande se détache facilement de l\'os quand tu tires dessus' },
    ],
    finishAdviceLow: 'Peau molle ? Finis 5 min sur un grill très chaud (250°C+) pour crisper sans sur-cuire.',
    finishAdviceHigh: 'Les cuisses sont très tolérantes. Tant que tu ne dépasses pas 85°C, elles restent juteuses grâce au gras.',
    restObjective: 'Repos très court — les cuisses se servent chaudes',
    restMarkers: [
      { type: 'visual', text: 'Laisser reposer 5 min sur une planche' },
      { type: 'visual', text: 'Pas besoin d\'aluminium — on veut garder la peau croustillante' },
    ],
    restAdvice: '5 minutes de repos suffisent pour les cuisses. Elles refroidissent vite — sers rapidement.',
  }

  // ── POITRINE DE DINDE ──
  if (id === 'turkey_breast') return {
    smokeObjective: 'Absorption de la fumée et coloration dorée de la poitrine',
    smokeMarkers: [
      { type: 'visual', text: 'La peau de la poitrine dore progressivement' },
      { type: 'temp', text: 'Température interne : ~35–50°C' },
      { type: 'visual', text: 'Placement de la sonde : piquer horizontalement au centre de la partie la plus épaisse de la poitrine, loin de l\'os' },
    ],
    smokeAdvice: 'La dinde absorbe beaucoup de fumée — utilise du bois fruitier léger (pommier, cerisier, érable). Le hickory ou le mesquite donnent un goût amer sur la dinde. 2-3 petits morceaux suffisent.',
    cookObjective: 'Montée en température progressive vers 68–74°C — la poitrine sèche vite au-delà',
    cookMarkers: [
      { type: 'temp', text: 'La température monte régulièrement — pas de stall sur la dinde' },
      { type: 'temp', text: 'Commencer à surveiller à partir de 60°C interne' },
      { type: 'visual', text: 'La peau doit être dorée et tendue. Le jus qui perle doit être clair.' },
    ],
    cookAdviceHigh: 'À 150°C+ la peau croustille et la cuisson est plus rapide. Attention à ne pas dépasser 74°C interne — la poitrine de dinde sèche très vite.',
    cookAdviceLow: 'En dessous de 130°C, la peau reste molle. Prévois une finition 10 min au grill ou au four très chaud pour la crisper.',
    finishObjective: 'S\'assurer que la poitrine est cuite à cœur sans la dessécher',
    finishMarkers: [
      { type: 'temp', text: 'Pull temp : 68°C — le carryover amène à 74°C pendant le repos' },
      { type: 'temp', text: 'Ne PAS dépasser 74°C au fumoir — la poitrine de dinde sèche très rapidement au-delà' },
      { type: 'visual', text: 'Le jus doit être parfaitement clair. La chair ne doit plus être rosée au centre.' },
    ],
    finishAdviceLow: 'Peau molle ? Passe 5–10 min sous le gril du four à 250°C pour crisper sans sur-cuire la chair.',
    finishAdviceHigh: 'Ne pousse pas au-delà de 74°C. La poitrine de dinde est la pièce la moins tolérante — chaque degré de trop se paie en sécheresse.',
    restObjective: 'Les jus se redistribuent — le repos est crucial pour la dinde',
    restMarkers: [
      { type: 'visual', text: 'Couvrir de papier alu en tente (sans serrer)' },
      { type: 'visual', text: 'Le repos est CRUCIAL pour la dinde — c\'est ce qui fait la différence entre juteux et sec' },
    ],
    restAdvice: 'Minimum 15 min de repos, idéalement 20-30 min. La poitrine de dinde bénéficie d\'un long repos. C\'est pendant ce temps que le carryover finit le travail et que les jus se redistribuent.',
  }

  // ── POULET ENTIER (défaut) ──
  return {
    smokeObjective: 'Absorption de la fumée et coloration de la peau',
    smokeMarkers: [
      { type: 'visual', text: 'La peau commence à dorer et prend une teinte ambrée' },
      { type: 'temp', text: 'Température interne : ~40–55°C' },
      { type: 'visual', text: 'Placement de la sonde : piquer dans la partie la plus épaisse de la cuisse, sans toucher l\'os' },
    ],
    smokeAdvice: 'Plante la sonde dans le gras de la cuisse, entre le pilon et le haut de cuisse, en visant le centre de la chair. C\'est la partie la plus longue à cuire — c\'est elle qui décide quand le poulet est prêt.',
    cookObjective: 'Montée en température progressive vers la cible de 74°C',
    cookMarkers: [
      { type: 'temp', text: 'La température monte régulièrement — pas de stall comme le bœuf ou le porc' },
      { type: 'temp', text: 'Commencer à surveiller à partir de 65°C interne' },
      { type: 'visual', text: 'Le jus qui coule de la cuisse doit devenir clair (pas rosé)' },
    ],
    cookAdviceHigh: 'À 150°C+ au fumoir, la peau croustille bien. C\'est le sweet spot pour un poulet fumé avec une belle peau.',
    cookAdviceLow: 'En dessous de 130°C, la peau reste molle et caoutchouteuse. Pense à finir 10 min sur un grill chaud pour la crisper.',
    finishObjective: 'S\'assurer que le poulet est cuit à cœur et que la peau est à ton goût',
    finishMarkers: [
      { type: 'temp', text: 'Cible : 74°C dans la cuisse (sécurité alimentaire)' },
      { type: 'temp', text: 'Vérifier aussi entre le blanc et la cuisse : piquer à la jonction, viser 74°C' },
      { type: 'visual', text: 'Remuer une cuisse — elle doit bouger facilement dans l\'articulation' },
    ],
    finishAdviceLow: 'Peau molle ? Finis 5–10 min sur un grill très chaud (250°C+) ou sous le gril du four pour crisper la peau sans sur-cuire la chair.',
    finishAdviceHigh: 'Si la peau est déjà dorée et croustillante, c\'est prêt. Ne dépasse pas 80°C interne sinon les blancs sèchent.',
    restObjective: 'Les jus se redistribuent — le poulet sera plus juteux à la découpe',
    restMarkers: [
      { type: 'visual', text: 'Couvrir de papier alu en tente (sans serrer, pour garder la peau croustillante)' },
      { type: 'visual', text: 'Laisser reposer sur une planche, pas dans un plat (l\'humidité ramollit le dessous)' },
    ],
    restAdvice: 'Un repos de 10–15 min suffit pour le poulet. Pas besoin de glacière comme pour le brisket — la volaille se découpe vite.',
  }
}

// ── Conseils pitmaster ──────────────────────────────────

function buildTips(profile, wrapped, weightKg, cookTempC) {
  const tips = []

  // Conseils spécifiques volaille — adaptés par profil
  // Le magret est catégorie volaille mais cook_type reverse_sear → tips spécifiques
  if (profile.id === 'duck_breast') {
    tips.push('Score le gras en croisillons avant de fumer — ça aide à rendre le gras et crisper la peau.')
    tips.push('Bois fruitier léger uniquement : cerisier, érable ou pommier. Le hickory écrase le canard.')
    tips.push('Le magret se mange rosé en France : vise 52–57°C max. Au-delà, la viande devient sèche et perd tout intérêt.')
    tips.push('Saisie côté peau d\'abord sur fonte brûlante — c\'est le gras qui croustille, pas la chair.')
    tips.push('Sèche bien la surface avant la saisie. Une surface humide = vapeur au lieu de croûte.')
    tips.push("Chaque cuisson est différente. Les durées sont des estimations — c'est la viande qui décide, pas la montre.")
    return tips
  }

  if (profile.category === 'volaille') {
    if (profile.id === 'turkey_breast') {
      tips.push('Plante la sonde horizontalement au centre de la partie la plus épaisse de la poitrine, loin de l\'os et du bord.')
      tips.push('Pull temp : 68°C. Le carryover amène à 74°C pendant le repos. Ne dépasse JAMAIS 74°C au fumoir — la dinde sèche très vite.')
      tips.push('La dinde absorbe beaucoup de fumée — bois fruitier léger uniquement (pommier, cerisier, érable). Le hickory donne un goût amer.')
      tips.push('Astuce : brine la veille (40g sel + 30g sucre par litre d\'eau, 12h au frigo). Ça fait toute la différence pour le juteux.')
    } else if (profile.id === 'chicken_thighs') {
      tips.push('Plante la sonde au centre de la cuisse, dans la partie la plus charnue, sans toucher l\'os du fémur.')
      tips.push('Les cuisses sont tolérantes : vise 77–82°C pour une texture fondante. Le dark meat est meilleur bien cuit que le blanc.')
      tips.push('Astuce compétition : sèche les cuisses à l\'air libre au frigo 2h avant de fumer. Peau sèche = peau croustillante.')
    } else {
      // Poulet entier
      tips.push('Plante la sonde dans la cuisse, pas dans le blanc. La cuisse est la dernière partie à atteindre 74°C — c\'est elle qui décide.')
      tips.push('74°C dans la cuisse = poulet cuit et juteux. Au-delà de 80°C, les blancs commencent à sécher.')
      tips.push('Astuce pro : sèche bien la peau avec du papier absorbant avant d\'appliquer le rub. Une peau sèche = une peau croustillante.')
    }
    if (cookTempC < 140) {
      tips.push('En dessous de 140°C au fumoir, la peau ne croustillera pas. Prévois une finition au grill ou au four (250°C, 5–10 min).')
    }
    if (cookTempC >= 150) {
      tips.push('À 150°C+ au fumoir, la peau devrait bien crisper.')
    }
    tips.push("Chaque cuisson est différente. Les durées sont des estimations — c'est la viande qui décide, pas la montre.")
    return tips
  }

  // Tips spécifiques carré d'agneau
  if (profile.id === 'rack_of_lamb') {
    tips.push('Bois fruitier léger obligatoire : cerisier ou pommier. Le chêne et le hickory écrasent l\'agneau.')
    tips.push('Le carré d\'agneau se mange rosé (57°C) — c\'est une pièce noble, ne la sur-cuis pas.')
    tips.push('Sonde entre deux côtes, au centre de la chair. L\'os conduit la chaleur et fausse la mesure.')
    tips.push('Saisie côté gras d\'abord pour rendre et crisper le chapeau de gras.')
    tips.push('Sèche bien la surface avant la saisie. Une surface humide = vapeur au lieu de croûte.')
    tips.push("Chaque cuisson est différente. Les durées sont des estimations — c'est la viande qui décide, pas la montre.")
    return tips
  }

  // Tips spécifiques filet mignon de porc
  if (profile.id === 'pork_tenderloin') {
    tips.push('Le filet mignon est la pièce la plus maigre du porc — elle sèche très vite. Rosé (63°C) ou à point (68°C), ne dépasse jamais 74°C.')
    tips.push('Bois fruitier léger : pommier ou cerisier. Le hickory est trop fort pour cette pièce délicate.')
    tips.push('Sonde au centre du filet, dans la partie la plus épaisse. La montée est rapide — surveille de près à partir de 50°C.')
    tips.push('Le filet mignon de porc se mange rosé (60°C) en toute sécurité. C\'est le standard moderne — oublie le porc gris de mamie.')
    tips.push('Sèche bien la surface avant la saisie. Une surface humide = vapeur au lieu de croûte.')
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
