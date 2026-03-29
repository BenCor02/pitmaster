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
    temp_bands: [
      { temp_c: 107, min_per_kg: 150 },   // ~225°F — Franklin standard, 1h15-1h30/lb → ~150min/kg
      { temp_c: 121, min_per_kg: 120 },   // ~250°F — compétition standard
      { temp_c: 135, min_per_kg: 90 },    // ~275°F — hot & fast style (Myron Mixon)
    ],
    wrap_reduction_percent: 15,
    rest_min: 60,
    rest_max: 240,   // Franklin recommande 2-4h de rest en cooler, consensus reddit = 3-4h optimal
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
    temp_bands: [
      { temp_c: 107, min_per_kg: 160 },   // pièces épaisses, collagène dense
      { temp_c: 121, min_per_kg: 130 },   // sweet spot compétition
      { temp_c: 135, min_per_kg: 100 },
    ],
    wrap_reduction_percent: 10,
    rest_min: 30,
    rest_max: 90,    // augmenté : les short ribs bénéficient d'un bon repos
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
    temp_bands: [
      { temp_c: 107, min_per_kg: 140 },   // plus rapide que brisket (moins de tissu conjonctif)
      { temp_c: 121, min_per_kg: 110 },
      { temp_c: 135, min_per_kg: 85 },
    ],
    wrap_reduction_percent: 12,
    rest_min: 45,
    rest_max: 120,
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
    name: 'Côte de bœuf / Prime Rib',
    category: 'boeuf',
    icon: '🥩',
    cook_type: 'reverse_sear',
    supports_wrap: false,
    temp_bands: [
      { temp_c: 107, min_per_kg: 77 },    // low & slow smoke phase
      { temp_c: 121, min_per_kg: 60 },
      { temp_c: 135, min_per_kg: 44 },
    ],
    rest_min: 15,    // augmenté : une côte de bœuf a besoin de repos après le sear
    rest_max: 30,
    reverse_sear: {
      pull_before_target_c: 6,   // réduit de 8 à 6 — le carryover sur pièce épaisse monte de ~5-6°C
      sear_total_minutes_min: 4,
      sear_total_minutes_max: 8,
    },
    doneness_targets: {
      rare: 52,
      medium_rare: 54,
      medium: 60,
    },
    cues: {
      reverse_note: "Sors la pièce quand la sonde indique 6°C sous ta cible. La température va continuer à monter pendant le repos. Pour le sear : feu maximum, 1-2 min par face, avec du beurre clarifié et des aromates si tu veux.",
    },
  },
  {
    id: 'tomahawk',
    name: 'Tomahawk / steak épais',
    category: 'boeuf',
    icon: '🥩',
    cook_type: 'reverse_sear',
    supports_wrap: false,
    temp_bands: [
      { temp_c: 107, min_per_kg: 55 },    // légèrement augmenté — les tomahawks sont très épais
      { temp_c: 121, min_per_kg: 40 },
      { temp_c: 135, min_per_kg: 30 },
    ],
    rest_min: 5,
    rest_max: 10,
    reverse_sear: {
      pull_before_target_c: 6,   // aligné avec prime rib
      sear_total_minutes_min: 3,
      sear_total_minutes_max: 6,
    },
    doneness_targets: {
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
    temp_bands: [
      { temp_c: 107, min_per_kg: 264 },   // 225°F — le standard. Environ 2h/lb → 264min/kg. Consensus Franklin + Malcom Reed
      { temp_c: 121, min_per_kg: 198 },   // 250°F — compétition speed
      { temp_c: 135, min_per_kg: 132 },   // 275°F — hot & fast
    ],
    wrap_reduction_percent: 12,
    rest_min: 45,
    rest_max: 180,   // augmenté : le pulled pork tient très bien en cooler 2-3h
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
    temp_bands: [
      { temp_c: 135, min_per_kg: 66 },    // réduit : à 135°C le poulet va plus vite qu'estimé avant
      { temp_c: 150, min_per_kg: 55 },    // 300°F — sweet spot pour peau croustillante
      { temp_c: 165, min_per_kg: 44 },    // 325°F — rapide, peau bien crispy
    ],
    rest_min: 10,
    rest_max: 20,
    cues: {
      begin_test_temp: 70,
      target_temp_min: 74,    // 165°F — sécurité alimentaire USDA
      target_temp_max: 80,    // au-delà de 80°C la cuisse est encore juteuse mais la poitrine sèche
      visual_warning: "En dessous de 130°C au fumoir, la peau reste molle et caoutchouteuse. Privilégie 150°C+ si tu veux une peau dorée et croustillante. Astuce pro : finis 10 min à feu vif ou au grill pour crisper la peau.",
    },
  },
]

export const DONENESS_LABELS = {
  rare: 'Saignant',
  medium_rare: 'À point (medium rare)',
  medium: 'Bien cuit (medium)',
}
