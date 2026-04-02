/**
 * CHARBON & FLAMME — Dataset métier du calculateur BBQ v2
 *
 * Recalibré à partir de données croisées :
 * - Aaron Franklin (Franklin BBQ, MasterClass)
 * - Meathead Goldwyn (AmazingRibs.com)
 * - Malcom Reed (HowToBBQRight)
 * - Harry Soo (Slap Yo' Daddy BBQ)
 * - Tuffy Stone (Cool Smoke)
 * - Myron Mixon (Winningest Man in BBQ)
 * - Reddit r/smoking, r/BBQ (milliers de retours terrain)
 * - BBQ forums (SmokingMeatForums, TheBBQBrethren)
 * - Sources FR : Le Fumoir, BBQ Québec, Weber Academy
 *
 * min_per_kg = minutes par kg à la température de fumoir indiquée.
 * Valeurs médianes — les tolérances (+/-10-20%) sont gérées par engine.js.
 *
 * Source de vérité future = Supabase.
 * Ce fichier sert de fallback et de référence.
 */

export const MEAT_PROFILES = [
  // ── BOEUF ──────────────────────────────────────────────
  {
    id: 'brisket',
    name: 'Brisket',
    category: 'boeuf',
    icon: '🥩',
    cook_type: 'low_and_slow',
    supports_wrap: true,
    // Nouveau modèle : temps = base_minutes + (poids_kg × coeff)
    base_minutes: 90,
    coeff: 156,
    temp_bands: [
      { temp_c: 107, min_per_kg: 202 },   // fallback legacy
      { temp_c: 121, min_per_kg: 165 },
      { temp_c: 135, min_per_kg: 120 },
    ],
    wrap_reduction_percent: 15,
    rest_min: 60,
    rest_max: 120,   // 1-2h de rest typique. Au-delà c'est un bonus, pas la norme
    cues: {
      stall_temp_min: 65,    // stall commence parfois dès 65°C (150°F) — consensus élargi
      stall_temp_max: 77,    // peut durer jusqu'à 77°C (170°F) sur gros brisket
      wrap_temp_min: 68,     // Texas crutch classique : wrapper entre 68-74°C
      wrap_temp_max: 74,
      begin_test_temp: 90,
      target_temp_min: 93,   // 200°F — seuil minimum Aaron Franklin
      target_temp_max: 98,   // 208°F — certains compétiteurs poussent jusque-là
      visual_wrap: "La bark est sombre, sèche au toucher, presque noire. Elle ne se raye plus à l'ongle. Le gras de surface a rendu et s'est figé en une croûte ferme. Si tu hésites, attends encore 15 min — mieux vaut wrapper trop tard que trop tôt.",
      probe_tender: "La sonde thermique entre comme dans du beurre mou, sans aucune résistance. Teste au point le plus épais du flat. Si ça accroche encore, remets 30 min et reteste.",
    },
  },
  {
    id: 'beef_short_ribs',
    name: 'Beef Short Ribs',
    category: 'boeuf',
    icon: '🥩',
    cook_type: 'low_and_slow',
    supports_wrap: true,
    base_minutes: 45,
    coeff: 138,
    temp_bands: [
      { temp_c: 107, min_per_kg: 222 },   // fallback legacy
      { temp_c: 121, min_per_kg: 168 },
      { temp_c: 135, min_per_kg: 122 },
    ],
    wrap_reduction_percent: 10,
    rest_min: 30,
    rest_max: 60,    // short ribs : repos modéré
    cues: {
      stall_temp_min: 65,
      stall_temp_max: 77,
      wrap_temp_min: 68,
      wrap_temp_max: 74,
      begin_test_temp: 92,
      target_temp_min: 93,
      target_temp_max: 99,   // poussé à 99 — le collagène fond mieux au-delà de 96
      visual_wrap: "L'extérieur est bien caramélisé, la bark a viré au brun-noir profond. La viande a rétréci et les os dépassent nettement. C'est le moment.",
      probe_tender: "La sonde entre entre les fibres avec une résistance minimale. La viande tremble comme de la gelée quand tu secoues légèrement le rack.",
    },
  },
  {
    id: 'chuck_roast',
    name: 'Paleron / Chuck Roast',
    category: 'boeuf',
    icon: '🥩',
    cook_type: 'low_and_slow',
    supports_wrap: true,
    // Paleron : retour sur temp_bands — l'écart 107→135°C est trop large pour base+coeff
    temp_bands: [
      { temp_c: 107, min_per_kg: 270 },   // 225°F — 2kg ≈ 9h
      { temp_c: 121, min_per_kg: 210 },   // 250°F — 2kg ≈ 7h
      { temp_c: 135, min_per_kg: 150 },   // 275°F — 2kg ≈ 5h
    ],
    wrap_reduction_percent: 12,
    rest_min: 30,
    rest_max: 60,
    cues: {
      stall_temp_min: 65,
      stall_temp_max: 77,
      wrap_temp_min: 71,
      wrap_temp_max: 77,
      begin_test_temp: 91,
      target_temp_min: 91,
      target_temp_max: 96,
      visual_wrap: "La bark est bien formée, couleur acajou à brun foncé. Le morceau a visiblement réduit de volume. Le gras de surface a rendu.",
      probe_tender: "La sonde entre sans résistance franche. La viande se défait facilement en tirant avec deux fourchettes — c'est prêt pour du pulled beef.",
    },
  },
  {
    id: 'prime_rib',
    name: 'Côte de bœuf',
    category: 'boeuf',
    icon: '🥩',
    cook_type: 'reverse_sear',
    supports_wrap: false,
    // Nouveau modèle reverse sear : épaisseur_cm × thickness_coeff
    thickness_coeff: 11,   // min par cm d'épaisseur
    thickness_fallback: { min_cm: 4, kg_factor: 2.2 }, // epaisseur = max(4, poids×2.2)
    temp_bands: [
      { temp_c: 107, min_per_kg: 48 },    // fallback legacy
      { temp_c: 121, min_per_kg: 38 },
      { temp_c: 135, min_per_kg: 27 },
    ],
    rest_min: 10,
    rest_max: 20,
    reverse_sear: {
      pull_before_target_c: 8,   // côte de bœuf FR : carryover ~6-8°C, on pull plus tôt
      sear_total_minutes_min: 3,
      sear_total_minutes_max: 6,
    },
    doneness_targets: {
      bleu: 45,
      rare: 52,
      medium_rare: 54,
      medium: 60,
    },
    cues: {
      reverse_note: "Place la côte en zone indirecte à 110°C avec des copeaux de bois. Ferme le couvercle et surveille la sonde. Sors la viande 8°C sous ta cible. Saisie violente 1-2 min par face à 250°C+. Repos 10 min sous alu lâche.",
    },
  },
  {
    id: 'tomahawk',
    name: 'Tomahawk / steak épais',
    category: 'boeuf',
    icon: '🥩',
    cook_type: 'reverse_sear',
    supports_wrap: false,
    thickness_coeff: 11,   // même que côte de bœuf
    thickness_fallback: { min_cm: 4, kg_factor: 2.2 }, // epaisseur = max(4, poids×2.2)
    temp_bands: [
      { temp_c: 107, min_per_kg: 58 },    // fallback legacy
      { temp_c: 121, min_per_kg: 46 },
      { temp_c: 135, min_per_kg: 33 },
    ],
    rest_min: 5,
    rest_max: 10,
    reverse_sear: {
      pull_before_target_c: 6,   // aligné avec prime rib
      sear_total_minutes_min: 3,
      sear_total_minutes_max: 6,
    },
    doneness_targets: {
      bleu: 45,
      rare: 52,
      medium_rare: 54,
      medium: 60,
    },
    cues: {
      reverse_note: "Le tomahawk est épais : le reverse sear est la méthode idéale. Monte lentement en température au fumoir, puis saisie violente au charbon ou à la fonte brûlante. Repos court, 5-10 min sous aluminium lâche.",
    },
  },

  // ── PORC ───────────────────────────────────────────────
  {
    id: 'pulled_pork',
    name: 'Pulled Pork / Pork Butt',
    category: 'porc',
    icon: '🐷',
    cook_type: 'low_and_slow',
    supports_wrap: true,
    base_minutes: 72,
    coeff: 150,
    temp_bands: [
      { temp_c: 107, min_per_kg: 212 },   // fallback legacy
      { temp_c: 121, min_per_kg: 180 },
      { temp_c: 135, min_per_kg: 140 },
    ],
    wrap_reduction_percent: 12,
    rest_min: 45,
    rest_max: 90,    // 45min-1h30 typique. Au-delà c'est du bonus en cooler
    cues: {
      stall_temp_min: 63,    // le porc stalle parfois dès 63°C (145°F)
      stall_temp_max: 74,
      wrap_temp_min: 70,
      wrap_temp_max: 76,
      begin_test_temp: 90,
      target_temp_min: 93,   // 200°F minimum
      target_temp_max: 96,   // 205°F sweet spot
      visual_wrap: "La bark est brun foncé, ferme et sèche. Le bone a commencé à dépasser. Si tu passes le doigt sur la bark, elle ne bouge pas. Moment idéal pour emballer.",
      probe_tender: "L'os tourne librement et se retire presque tout seul. La sonde entre partout sans résistance, comme dans du beurre fondu. C'est prêt à être effiloché.",
    },
  },
  {
    id: 'spare_ribs',
    name: 'Spare Ribs',
    category: 'porc',
    icon: '🍖',
    cook_type: 'low_and_slow',
    supports_wrap: true,
    fixed_times: {
      wrapped: { min: 330, max: 390 },     // 3-2-1 method : 5h30-6h30 total
      unwrapped: { min: 300, max: 360 },   // ajusté max à 360 (6h) — au-delà ça sèche
    },
    rest_min: 10,
    rest_max: 20,
    cues: {
      visual_wrap: "Les ribs ont pris une belle couleur acajou. La viande a rétréci et les os dépassent d'environ 1-2 cm. La surface est sèche et mate. C'est le bon moment pour emballer avec un peu de jus de pomme ou de miel.",
      probe_tender: "Flex test : soulève le rack par le milieu avec des pinces. Il doit plier nettement et la surface commencer à se fissurer. La viande se détache de l'os proprement mais ne tombe pas — c'est du competition-style, pas fall-off-the-bone.",
    },
  },
  {
    id: 'baby_back_ribs',
    name: 'Baby Back Ribs',
    category: 'porc',
    icon: '🍖',
    cook_type: 'low_and_slow',
    supports_wrap: true,
    fixed_times: {
      wrapped: { min: 270, max: 330 },     // 2-2-1 method : 4h30-5h30 total
      unwrapped: { min: 240, max: 300 },   // 4-5h unwrapped
    },
    rest_min: 10,
    rest_max: 15,
    cues: {
      visual_wrap: "Les baby backs sont plus petits et cuisent plus vite. Emballe quand la couleur est acajou et que les os dépassent bien. Ne sur-cuis pas — elles sèchent plus facilement que des spare ribs.",
      probe_tender: "Flex test : le rack plie bien et la surface craquelle légèrement. Entre les os, la sonde entre facilement. La viande doit se détacher proprement mais garder de la tenue.",
    },
  },

  // ── VOLAILLE ───────────────────────────────────────────
  {
    id: 'whole_chicken',
    name: 'Poulet entier',
    category: 'volaille',
    icon: '🍗',
    cook_type: 'low_and_slow',
    supports_wrap: false,
    // Volaille : pas de base+coeff, la plage de temp (110-165°C) est trop large
    // On reste sur l'interpolation temp_bands qui gère bien chaque palier
    // Recalibré avril 2026 — sources : ThermoWorks, Traeger, AmazingRibs, terrain FR
    temp_bands: [
      { temp_c: 110, min_per_kg: 98 },    // 2kg ≈ 3h16 (terrain: 3h00-3h30)
      { temp_c: 135, min_per_kg: 78 },    // 2kg ≈ 2h36 (terrain: 2h30-3h00)
      { temp_c: 150, min_per_kg: 56 },    // 2kg ≈ 1h52 (terrain: 1h45-2h00)
      { temp_c: 165, min_per_kg: 45 },    // 2kg ≈ 1h30 (terrain: 1h30-1h45)
    ],
    rest_min: 10,
    rest_max: 20,
    cues: {
      begin_test_temp: 65,
      target_temp_min: 74,    // 165°F — sécurité alimentaire
      target_temp_max: 80,    // au-delà de 80°C les blancs sèchent
      probe_position: "Plante la sonde dans la partie la plus épaisse de la cuisse, entre le pilon et le haut de cuisse, sans toucher l'os. C'est la dernière zone à atteindre 74°C.",
      visual_warning: "En dessous de 130°C au fumoir, la peau reste molle et caoutchouteuse. Privilégie 150°C+ si tu veux une peau dorée et croustillante. Astuce pro : finis 10 min à feu vif ou au grill pour crisper la peau.",
    },
  },

  // ── AGNEAU ──────────────────────────────────────────────
  {
    id: 'lamb_shoulder',
    name: 'Épaule d\'agneau',
    category: 'agneau',
    icon: '🐑',
    cook_type: 'low_and_slow',
    supports_wrap: true,
    base_minutes: 45,
    coeff: 138,
    temp_bands: [
      { temp_c: 107, min_per_kg: 198 },   // fallback legacy
      { temp_c: 121, min_per_kg: 162 },
      { temp_c: 135, min_per_kg: 120 },
    ],
    wrap_reduction_percent: 12,
    rest_min: 30,
    rest_max: 60,    // 30min à 1h — l'agneau sèche moins que le bœuf au repos
    cues: {
      stall_temp_min: 63,    // stall agneau similaire au porc — 63-74°C
      stall_temp_max: 74,
      wrap_temp_min: 68,
      wrap_temp_max: 75,
      begin_test_temp: 88,
      target_temp_min: 91,   // 195°F — le collagène d'agneau fond dès 91°C
      target_temp_max: 96,   // 205°F — au-delà la viande s'assèche
      visual_wrap: "L'os de l'épaule commence à dépasser, la viande a rétréci. La bark est acajou foncé, mate et sèche au toucher. Le gras de surface a rendu. C'est le moment d'emballer — papier boucher de préférence pour garder la bark.",
      probe_tender: "La sonde entre comme dans du beurre partout dans l'épaule. L'os bouge librement et se retire presque seul. La viande se défait en tirant avec deux fourchettes — c'est prêt pour du pulled lamb.",
    },
  },
  {
    id: 'lamb_leg',
    name: 'Gigot d\'agneau',
    category: 'agneau',
    icon: '🐑',
    cook_type: 'low_and_slow',
    supports_wrap: false,
    base_minutes: 0,
    coeff: 84,
    temp_bands: [
      { temp_c: 107, min_per_kg: 115 },   // fallback legacy
      { temp_c: 121, min_per_kg: 94 },
      { temp_c: 135, min_per_kg: 71 },
    ],
    rest_min: 15,
    rest_max: 30,
    cues: {
      begin_test_temp: 52,
      target_temp_min: 54,    // medium rare — consensus FR pour le gigot fumé (rosé)
      target_temp_max: 63,    // medium — au-delà le gigot perd tout intérêt
      probe_position: "Plante la sonde au centre de la partie la plus épaisse du gigot, loin de l'os. L'os conduit la chaleur et fausse la mesure.",
      visual_warning: "Le gigot ne se cuit pas comme un brisket — pas de pulled lamb ici. On vise rosé à cœur (54-60°C). Si tu veux de l'effiloché, prends l'épaule.",
    },
  },
  {
    id: 'lamb_shank',
    name: 'Souris d\'agneau',
    category: 'agneau',
    icon: '🐑',
    cook_type: 'low_and_slow',
    supports_wrap: true,
    // Souris : temps fixe par tranche de poids (le modèle per-kg donne des résultats absurdes)
    fixed_times_by_weight: [
      { max_kg: 0.5, min: 50, max: 75 },      // <500g : ~1h (50-75min)
      { max_kg: 0.8, min: 75, max: 105 },     // 500-800g : ~1h30 (75-105min)
      { max_kg: Infinity, min: 105, max: 140 }, // >800g : ~2h (105-140min)
    ],
    temp_bands: [
      { temp_c: 107, min_per_kg: 660 },   // fallback legacy (non utilisé si fixed_times_by_weight)
      { temp_c: 121, min_per_kg: 540 },
      { temp_c: 135, min_per_kg: 420 },
    ],
    wrap_reduction_percent: 10,
    rest_min: 15,
    rest_max: 30,
    cues: {
      stall_temp_min: 65,
      stall_temp_max: 74,
      wrap_temp_min: 70,
      wrap_temp_max: 76,
      begin_test_temp: 85,
      target_temp_min: 88,   // 190°F — le collagène de la souris commence à fondre
      target_temp_max: 96,   // 205°F — fork tender, la viande se détache de l'os
      visual_wrap: "La viande a rétréci autour de l'os, exposant le bout de l'os. La surface est brun-acajou. C'est le moment d'emballer — ajoute un fond de bouillon ou de jus de pomme dans le papier pour braiser.",
      probe_tender: "La viande glisse de l'os quand tu soulèves la souris par le bout de l'os. La sonde entre sans résistance dans la partie la plus épaisse. La texture est fondante, presque confite.",
    },
  },
  {
    id: 'rack_of_lamb',
    name: 'Carré d\'agneau',
    category: 'agneau',
    icon: '🐑',
    cook_type: 'reverse_sear',
    supports_wrap: false,
    thickness_coeff: 9,   // min par cm d'épaisseur
    thickness_fallback: { min_cm: 2.5, kg_factor: 2.0 }, // epaisseur = max(2.5, poids×2.0)
    temp_bands: [
      { temp_c: 107, min_per_kg: 50 },    // fallback legacy
      { temp_c: 121, min_per_kg: 40 },
      { temp_c: 135, min_per_kg: 31 },
    ],
    rest_min: 5,
    rest_max: 10,
    reverse_sear: {
      pull_before_target_c: 8,   // carryover ~6-8°C, comme la côte de bœuf
      sear_total_minutes_min: 2,
      sear_total_minutes_max: 4,
    },
    doneness_targets: {
      bleu: 46,       // agneau bleu légèrement plus haut que bœuf (American Lamb Board)
      rare: 52,       // 125°F — saignant (consensus FR)
      medium_rare: 57, // 135°F — rosé, le sweet spot pour le carré (consensus pitmasters US + FR)
      medium: 63,      // 145°F — à point, encore acceptable pour l'agneau
    },
    cues: {
      reverse_note: "Le carré d'agneau se fume à basse température (100-120°C) avec du bois fruitier — cerisier ou pommier idéalement. Le chêne et le hickory sont trop forts pour l'agneau. Sors le carré 8°C sous ta cible. Saisie violente 1-2 min par face à 300°C+ pour une croûte dorée.",
    },
  },

  // ── PORC (compléments) ────────────────────────────────
  {
    id: 'pork_belly',
    name: 'Poitrine de porc',
    category: 'porc',
    icon: '🐷',
    cook_type: 'low_and_slow',
    supports_wrap: true,
    base_minutes: 0,
    coeff: 132,
    temp_bands: [
      { temp_c: 107, min_per_kg: 182 },   // fallback legacy
      { temp_c: 121, min_per_kg: 148 },
      { temp_c: 135, min_per_kg: 110 },
    ],
    wrap_reduction_percent: 12,
    rest_min: 30,
    rest_max: 60,    // repos en cooler recommandé pour redistribuer le gras
    cues: {
      stall_temp_min: 63,
      stall_temp_max: 74,
      wrap_temp_min: 71,     // wrapper à ~160°F (AmazingRibs, Craft Beering)
      wrap_temp_max: 77,
      begin_test_temp: 88,
      target_temp_min: 93,   // 200°F — le minimum pour un résultat fondant
      target_temp_max: 99,   // 210°F — burnt ends territory, le gras est complètement fondu
      visual_wrap: "La surface de la poitrine est caramélisée, brun foncé à noir. Le gras a commencé à rendre et la couenne (si présente) est croustillante. La viande a visiblement réduit. C'est le moment d'emballer pour la dernière phase de cuisson.",
      probe_tender: "La sonde entre dans le gras et la viande sans résistance. Si tu secoues la poitrine, elle tremble comme de la gelée. Le gras inter-couches est complètement fondu et translucide. Résultat : fondant en bouche, chaque tranche se tient mais se défait à la fourchette.",
    },
  },
  {
    id: 'pork_tenderloin',
    name: 'Filet mignon de porc',
    category: 'porc',
    icon: '🐷',
    cook_type: 'reverse_sear',
    supports_wrap: false,
    thickness_coeff: 8,   // min par cm d'épaisseur
    thickness_fallback: { min_cm: 3, kg_factor: 3.5 }, // epaisseur = max(3, poids×3.5)
    temp_bands: [
      { temp_c: 107, min_per_kg: 55 },    // fallback legacy
      { temp_c: 121, min_per_kg: 42 },
      { temp_c: 135, min_per_kg: 31 },
    ],
    rest_min: 3,
    rest_max: 5,   // pièce fine, refroidit très vite
    reverse_sear: {
      pull_before_target_c: 5,   // carryover modéré — pièce fine
      sear_total_minutes_min: 2,
      sear_total_minutes_max: 4,
    },
    doneness_targets: {
      rose: 63,         // Rosé — standard français moderne, juteux et légèrement rosé (USDA 63°C, ANSES idem)
      a_point: 68,      // À point — plus de rose, encore juteux, cuisson préférée en France
      bien_cuit: 74,    // Bien cuit — aucune trace de rose, texture plus ferme
    },
    default_doneness: 'rose',
    cues: {
      reverse_note: "Le filet mignon de porc est une pièce très maigre et fine — elle sèche vite. Fume à basse température (110°C) avec du bois fruitier léger (pommier, cerisier). Sors le filet 5°C sous ta cible. Saisie rapide 1 min par face à 250°C+. Ne dépasse jamais 68°C interne pour garder le juteux. En France, le porc se mange rosé (63°C) ou à point (68°C) — jamais saignant.",
    },
  },

  // ── VOLAILLE (compléments) ────────────────────────────
  {
    id: 'chicken_thighs',
    name: 'Cuisses de poulet',
    category: 'volaille',
    icon: '🍗',
    cook_type: 'low_and_slow',
    supports_wrap: false,
    // Recalibré avril 2026 — cuisses = pièces individuelles, le temps
    // dépend de l'épaisseur de chaque cuisse, pas du poids total
    temp_bands: [
      { temp_c: 135, min_per_kg: 80 },    // 1kg ≈ 1h24 (terrain: 1h15-1h30)
      { temp_c: 150, min_per_kg: 58 },    // 1kg ≈ 1h01 (terrain: ~1h)
      { temp_c: 165, min_per_kg: 44 },    // 1kg ≈ 46min (terrain: 45min-1h)
    ],
    rest_min: 5,
    rest_max: 10,
    cues: {
      begin_test_temp: 65,
      target_temp_min: 74,     // 165°F — sécurité alimentaire (USDA)
      target_temp_max: 82,     // 180°F — dark meat est meilleur à 77-82°C, le collagène fond (consensus compétition BBQ)
      probe_position: "Plante la sonde dans la partie la plus épaisse de la cuisse, sans toucher l'os. Les cuisses sont plus tolérantes que les blancs — vise 77°C+ pour une texture fondante.",
      visual_warning: "En dessous de 135°C au fumoir, la peau de poulet reste molle et caoutchouteuse. Fumoir à 150°C+ pour une peau dorée. Astuce compétition : sèche les cuisses au frigo à l'air libre 2h avant de fumer.",
    },
  },
  {
    id: 'turkey_breast',
    name: 'Poitrine de dinde',
    category: 'volaille',
    icon: '🦃',
    cook_type: 'low_and_slow',
    supports_wrap: false,
    // Recalibré avril 2026 — 30min/lb @225F, 25min/lb @250F (consensus US)
    temp_bands: [
      { temp_c: 107, min_per_kg: 110 },   // 2kg ≈ 3h40 (terrain: 3h30-4h)
      { temp_c: 121, min_per_kg: 90 },    // 2kg ≈ 3h00 (terrain: 2h45-3h15)
      { temp_c: 135, min_per_kg: 66 },    // 2kg ≈ 2h12 (terrain: 2h00-2h30)
    ],
    rest_min: 15,
    rest_max: 30,    // le repos est crucial pour la dinde — les jus se redistribuent
    cues: {
      begin_test_temp: 60,
      target_temp_min: 68,     // 155°F — pull temp, carryover amène à 74°C (astuce compétition BBQ)
      target_temp_max: 74,     // 165°F — safe temp USDA. Au-delà la chair sèche
      probe_position: "Plante la sonde au centre de la partie la plus épaisse de la poitrine, horizontalement. Évite le bord et l'os.",
      visual_warning: "La dinde absorbe beaucoup de fumée — attention au goût amer si tu utilises du bois fort (mesquite, hickory). Privilégie cerisier, pommier ou érable. Brine la veille (sel + sucre + eau) pour un résultat juteux.",
    },
  },
  {
    id: 'duck_breast',
    name: 'Magret de canard',
    category: 'volaille',
    icon: '🦆',
    cook_type: 'reverse_sear',
    supports_wrap: false,
    thickness_coeff: 7,   // min par cm d'épaisseur
    thickness_fallback: { min_cm: 2, kg_factor: 5.0 }, // epaisseur = max(2, poids×5.0)
    temp_bands: [
      { temp_c: 107, min_per_kg: 45 },    // fallback legacy
      { temp_c: 121, min_per_kg: 34 },
      { temp_c: 135, min_per_kg: 25 },
    ],
    rest_min: 3,
    rest_max: 5,   // pièce fine, ne pas couvrir d'alu pour garder le croustillant
    reverse_sear: {
      pull_before_target_c: 5,   // pièce fine, carryover modéré
      sear_total_minutes_min: 3,
      sear_total_minutes_max: 5,
    },
    doneness_targets: {
      rose: 54,        // Rosé — le standard français pour le magret, coeur rose vif
      a_point: 58,     // À point — encore rosé au centre mais plus cuit sur les bords
      bien_cuit: 65,   // Bien cuit — déconseillé, le magret devient sec au-delà de 63°C
    },
    default_doneness: 'rose',
    cues: {
      reverse_note: "Le magret a une épaisse couche de gras côté peau — score-la en croisillons avant de fumer pour qu'elle rende son gras. Fume côté chair vers le bas à 110°C avec du bois fruitier (cerisier, érable). Sors à 5°C sous ta cible. Saisie côté peau d'abord, 2-3 min sur fonte brûlante pour crisper le gras. Le magret se mange rosé (54°C) — ne dépasse pas 58°C pour garder le fondant.",
    },
  },
]

export const DONENESS_LABELS = {
  // Boeuf / Agneau
  bleu: 'Bleu',
  rare: 'Saignant',
  medium_rare: 'À point',
  medium: 'Bien cuit',
  well_done: 'Très bien cuit',
  // Porc (en France : rosé ou cuit, jamais saignant)
  rose: 'Rosé',
  a_point: 'À point',
  bien_cuit: 'Bien cuit',
}
