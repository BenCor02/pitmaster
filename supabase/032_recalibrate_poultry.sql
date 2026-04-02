-- ============================================================
-- 032 — Recalibration volaille (avril 2026)
--
-- Sources : ThermoWorks, Traeger, AmazingRibs, BBQ Brethren,
--           terrain FR (FrenchSmoker, BBQ Québec)
-- ============================================================

-- ── Poulet entier : min_per_kg trop élevés surtout à basse temp ──
UPDATE cooking_profiles SET
  temp_bands = '[
    {"temp_c": 110, "min_per_kg": 98},
    {"temp_c": 135, "min_per_kg": 78},
    {"temp_c": 150, "min_per_kg": 56},
    {"temp_c": 165, "min_per_kg": 45}
  ]'::jsonb
WHERE id = 'whole_chicken';

-- ── Cuisses de poulet : pièces individuelles, temps surestimé ──
UPDATE cooking_profiles SET
  temp_bands = '[
    {"temp_c": 135, "min_per_kg": 80},
    {"temp_c": 150, "min_per_kg": 58},
    {"temp_c": 165, "min_per_kg": 44}
  ]'::jsonb
WHERE id = 'chicken_thighs';

-- ── Poitrine de dinde : surestimation >2kg ──
UPDATE cooking_profiles SET
  temp_bands = '[
    {"temp_c": 107, "min_per_kg": 110},
    {"temp_c": 121, "min_per_kg": 90},
    {"temp_c": 135, "min_per_kg": 66}
  ]'::jsonb
WHERE id = 'turkey_breast';
