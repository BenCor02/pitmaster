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
  ADD COLUMN IF NOT EXISTS thickness_fallback jsonb,
  ADD COLUMN IF NOT EXISTS fixed_times_by_weight jsonb;

-- ── 2. Low & slow : base_minutes + coeff ───────────────
UPDATE cooking_profiles SET base_minutes = 90,  coeff = 156 WHERE id = 'brisket';
UPDATE cooking_profiles SET base_minutes = 45,  coeff = 138 WHERE id = 'beef_short_ribs';
-- chuck_roast : pas de base+coeff, reste sur temp_bands (écart 107→135°C trop large)
UPDATE cooking_profiles SET base_minutes = 72,  coeff = 150 WHERE id = 'pulled_pork';
UPDATE cooking_profiles SET base_minutes = 0,   coeff = 132 WHERE id = 'pork_belly';
UPDATE cooking_profiles SET base_minutes = 45,  coeff = 138 WHERE id = 'lamb_shoulder';
UPDATE cooking_profiles SET base_minutes = 0,   coeff = 84  WHERE id = 'lamb_leg';
-- Volaille : pas de base+coeff, reste sur temp_bands interpolé
-- (la plage de temp 110-165°C est trop large pour un modèle linéaire)

-- ── 3. Reverse sear : thickness_coeff (min/cm) + fallback épaisseur par famille
UPDATE cooking_profiles SET thickness_coeff = 11, thickness_fallback = '{"min_cm":4,"kg_factor":2.2}'::jsonb   WHERE id = 'prime_rib';
UPDATE cooking_profiles SET thickness_coeff = 11, thickness_fallback = '{"min_cm":4,"kg_factor":2.2}'::jsonb   WHERE id = 'tomahawk';
UPDATE cooking_profiles SET thickness_coeff = 9,  thickness_fallback = '{"min_cm":2.5,"kg_factor":2.0}'::jsonb WHERE id = 'rack_of_lamb';
UPDATE cooking_profiles SET thickness_coeff = 7,  thickness_fallback = '{"min_cm":2,"kg_factor":5.0}'::jsonb   WHERE id = 'duck_breast';
UPDATE cooking_profiles SET thickness_coeff = 8,  thickness_fallback = '{"min_cm":3,"kg_factor":3.5}'::jsonb   WHERE id = 'pork_tenderloin';

-- ── 4. Souris d'agneau : temps fixe par tranche de poids
UPDATE cooking_profiles
  SET fixed_times_by_weight = '[{"max_kg":0.5,"min":50,"max":75},{"max_kg":0.8,"min":75,"max":105},{"max_kg":999,"min":105,"max":140}]'::jsonb
  WHERE id = 'lamb_shank';

-- ── 5. Repos réduit sur pièces fines (refroidissent vite)
UPDATE cooking_profiles SET rest_min = 3, rest_max = 5 WHERE id = 'pork_tenderloin';
UPDATE cooking_profiles SET rest_min = 3, rest_max = 5 WHERE id = 'duck_breast';

-- ── 6. Ribs : aucune modification (méthode 3-2-1 / 2-2-1 inchangée)
-- spare_ribs et baby_back_ribs gardent leurs fixed_times existants
