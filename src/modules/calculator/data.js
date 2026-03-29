/**
 * CHARBON & FLAMME — Dataset métier du calculateur BBQ v2
 *
 * Source de vérité = Supabase (plus tard).
 * Ce fichier sert de fallback et de référence.
 *
 * Deux types de cuisson :
 * - low_and_slow : cuisson lente, avec ou sans wrap
 * - reverse_sear : cuisson douce puis saisie finale
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
      { temp_c: 107, min_per_kg: 200 },
      { temp_c: 121, min_per_kg: 160 },
      { temp_c: 135, min_per_kg: 118 },
    ],
    wrap_reduction_percent: 15,
    rest_min: 60,
    rest_max: 180,
    cues: {
      stall_temp_min: 66,
      stall_temp_max: 74,
      wrap_temp_min: 68,
      wrap_temp_max: 74,
      begin_test_temp: 90,
      target_temp_min: 92,
      target_temp_max: 97,
      visual_wrap: "Quand la bark est bien fixée, sombre, sèche et qu'elle ne se raye plus facilement.",
      probe_tender: 'La sonde entre presque comme dans du beurre.',
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
      { temp_c: 107, min_per_kg: 195 },
      { temp_c: 121, min_per_kg: 158 },
      { temp_c: 135, min_per_kg: 125 },
    ],
    wrap_reduction_percent: 10,
    rest_min: 30,
    rest_max: 60,
    cues: {
      stall_temp_min: 66,
      stall_temp_max: 74,
      wrap_temp_min: 68,
      wrap_temp_max: 74,
      begin_test_temp: 92,
      target_temp_min: 93,
      target_temp_max: 98,
      visual_wrap: "Quand l'extérieur est bien pris et que la couleur te plaît.",
      probe_tender: 'La sonde entre avec très peu de résistance entre les fibres.',
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
      { temp_c: 107, min_per_kg: 182 },
      { temp_c: 121, min_per_kg: 142 },
      { temp_c: 135, min_per_kg: 118 },
    ],
    wrap_reduction_percent: 12,
    rest_min: 45,
    rest_max: 120,
    cues: {
      stall_temp_min: 66,
      stall_temp_max: 74,
      wrap_temp_min: 71,
      wrap_temp_max: 77,
      begin_test_temp: 91,
      target_temp_min: 91,
      target_temp_max: 96,
      visual_wrap: 'Quand la bark est bien fixée et la couleur bien développée.',
      probe_tender: 'La sonde entre sans accrocher franchement.',
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
      { temp_c: 107, min_per_kg: 88 },
      { temp_c: 121, min_per_kg: 66 },
      { temp_c: 135, min_per_kg: 44 },
    ],
    rest_min: 5,
    rest_max: 10,
    reverse_sear: {
      pull_before_target_c: 8,
      sear_total_minutes_min: 4,
      sear_total_minutes_max: 8,
    },
    doneness_targets: {
      rare: 52,
      medium_rare: 54,
      medium: 60,
    },
    cues: {
      reverse_note: 'Sortir environ 8°C avant la cible finale, puis saisir fort pour faire la croûte.',
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
      { temp_c: 107, min_per_kg: 50 },
      { temp_c: 121, min_per_kg: 38 },
      { temp_c: 135, min_per_kg: 30 },
    ],
    rest_min: 5,
    rest_max: 8,
    reverse_sear: {
      pull_before_target_c: 8,
      sear_total_minutes_min: 3,
      sear_total_minutes_max: 6,
    },
    doneness_targets: {
      rare: 52,
      medium_rare: 54,
      medium: 60,
    },
    cues: {
      reverse_note: "Le reverse sear est surtout pertinent sur une pièce épaisse ; sur une pièce fine, le résultat est moins net.",
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
      { temp_c: 107, min_per_kg: 242 },
      { temp_c: 121, min_per_kg: 182 },
      { temp_c: 135, min_per_kg: 121 },
    ],
    wrap_reduction_percent: 12,
    rest_min: 45,
    rest_max: 120,
    cues: {
      stall_temp_min: 63,
      stall_temp_max: 74,
      wrap_temp_min: 70,
      wrap_temp_max: 76,
      begin_test_temp: 90,
      target_temp_min: 93,
      target_temp_max: 96,
      visual_wrap: "Quand la couleur est bien posée et que le bark ne semble plus fragile.",
      probe_tender: "L'os tourne facilement ou la sonde entre sans résistance nette.",
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
      wrapped: { min: 330, max: 390 },
      unwrapped: { min: 300, max: 375 },
    },
    rest_min: 10,
    rest_max: 20,
    cues: {
      visual_wrap: "Emballe si la couleur te plaît et si tu veux un rendu plus tendre.",
      probe_tender: 'Flex test : le rack plie franchement et commence à fissurer à la surface.',
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
      wrapped: { min: 270, max: 330 },
      unwrapped: { min: 240, max: 300 },
    },
    rest_min: 10,
    rest_max: 15,
    cues: {
      visual_wrap: "Emballe si la couleur te plaît et si tu veux plus de fondant.",
      probe_tender: 'Flex test + surface légèrement craquelée.',
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
      { temp_c: 135, min_per_kg: 85 },
      { temp_c: 150, min_per_kg: 65 },
      { temp_c: 165, min_per_kg: 52 },
    ],
    rest_min: 10,
    rest_max: 20,
    cues: {
      begin_test_temp: 70,
      target_temp_min: 74,
      target_temp_max: 80,
      visual_warning: 'En dessous de 130°C, peau souvent molle ou caoutchouteuse.',
    },
  },
]

export const DONENESS_LABELS = {
  rare: 'Saignant',
  medium_rare: 'À point (medium rare)',
  medium: 'Bien cuit (medium)',
}
