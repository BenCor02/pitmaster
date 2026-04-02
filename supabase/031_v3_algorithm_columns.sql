-- 031_v3_algorithm_columns.sql
-- Ajout des colonnes pour le modèle de calcul v3 :
-- - base_minutes + coeff pour low & slow
-- - thickness_coeff pour reverse sear
-- - fixed_times_by_weight pour souris d'agneau

-- ── 1. Nouvelles colonnes ──────────────────────────────
ALTER TABLE cooking_profiles
  ADD COLUMN IF NOT EXISTS base_minutes integer,
  ADD COLUMN IF NOT EXISTS coeff integer,
  ADD COLUMN IF NOT EXISTS thickness_coeff integer,
  ADD COLUMN IF NOT EXISTS default_thickness_cm numeric,
  ADD COLUMN IF NOT EXISTS fixed_times_by_weight jsonb;

-- ── 2. Low & slow : base_minutes + coeff ───────────────
UPDATE cooking_profiles SET base_minutes = 90,  coeff = 156 WHERE id = 'brisket';
UPDATE cooking_profiles SET base_minutes = 45,  coeff = 138 WHERE id = 'beef_short_ribs';
UPDATE cooking_profiles SET base_minutes = 45,  coeff = 144 WHERE id = 'chuck_roast';
UPDATE cooking_profiles SET base_minutes = 72,  coeff = 150 WHERE id = 'pulled_pork';
UPDATE cooking_profiles SET base_minutes = 0,   coeff = 132 WHERE id = 'pork_belly';
UPDATE cooking_profiles SET base_minutes = 45,  coeff = 138 WHERE id = 'lamb_shoulder';
UPDATE cooking_profiles SET base_minutes = 0,   coeff = 84  WHERE id = 'lamb_leg';
UPDATE cooking_profiles SET base_minutes = 0,   coeff = 90  WHERE id = 'whole_chicken';
UPDATE cooking_profiles SET base_minutes = 0,   coeff = 78  WHERE id = 'chicken_thighs';
UPDATE cooking_profiles SET base_minutes = 0,   coeff = 102 WHERE id = 'turkey_breast';

-- ── 3. Reverse sear : thickness_coeff (min/cm) + épaisseur par défaut
UPDATE cooking_profiles SET thickness_coeff = 11, default_thickness_cm = 5   WHERE id = 'prime_rib';
UPDATE cooking_profiles SET thickness_coeff = 11, default_thickness_cm = 6   WHERE id = 'tomahawk';
UPDATE cooking_profiles SET thickness_coeff = 9,  default_thickness_cm = 4   WHERE id = 'rack_of_lamb';
UPDATE cooking_profiles SET thickness_coeff = 7,  default_thickness_cm = 2.5 WHERE id = 'duck_breast';
UPDATE cooking_profiles SET thickness_coeff = 8,  default_thickness_cm = 5   WHERE id = 'pork_tenderloin';

-- ── 4. Souris d'agneau : temps fixe par tranche de poids
UPDATE cooking_profiles
  SET fixed_times_by_weight = '[{"max_kg":0.5,"min":50,"max":75},{"max_kg":0.8,"min":75,"max":105},{"max_kg":999,"min":105,"max":140}]'::jsonb
  WHERE id = 'lamb_shank';

-- ── 5. Ribs : aucune modification (méthode 3-2-1 / 2-2-1 inchangée)
-- spare_ribs et baby_back_ribs gardent leurs fixed_times existants
