-- ============================================================
-- SEED DATA — Profils de cuisson du calculateur BBQ
-- ============================================================

insert into public.cooking_profiles (id, name, category, icon, cook_type, supports_wrap, temp_bands, fixed_times, wrap_reduction_percent, rest_min, rest_max, reverse_sear, doneness_targets, cues, sort_order) values

-- BOEUF
('brisket', 'Brisket', 'boeuf', '🥩', 'low_and_slow', true,
  '[{"temp_c": 107, "min_per_kg": 200}, {"temp_c": 121, "min_per_kg": 160}, {"temp_c": 135, "min_per_kg": 118}]',
  null, 15, 60, 180, null, null,
  '{"stall_temp_min": 66, "stall_temp_max": 74, "wrap_temp_min": 68, "wrap_temp_max": 74, "begin_test_temp": 90, "target_temp_min": 92, "target_temp_max": 97, "visual_wrap": "Quand la bark est bien fixée, sombre, sèche.", "probe_tender": "La sonde entre presque comme dans du beurre."}',
  1),

('beef_short_ribs', 'Beef Short Ribs', 'boeuf', '🥩', 'low_and_slow', true,
  '[{"temp_c": 107, "min_per_kg": 195}, {"temp_c": 121, "min_per_kg": 158}, {"temp_c": 135, "min_per_kg": 125}]',
  null, 10, 30, 60, null, null,
  '{"stall_temp_min": 66, "stall_temp_max": 74, "wrap_temp_min": 68, "wrap_temp_max": 74, "begin_test_temp": 92, "target_temp_min": 93, "target_temp_max": 98, "visual_wrap": "Quand l''extérieur est bien pris.", "probe_tender": "La sonde entre avec très peu de résistance."}',
  2),

('chuck_roast', 'Paleron / Chuck Roast', 'boeuf', '🥩', 'low_and_slow', true,
  '[{"temp_c": 107, "min_per_kg": 182}, {"temp_c": 121, "min_per_kg": 142}, {"temp_c": 135, "min_per_kg": 118}]',
  null, 12, 45, 120, null, null,
  '{"stall_temp_min": 66, "stall_temp_max": 74, "wrap_temp_min": 71, "wrap_temp_max": 77, "begin_test_temp": 91, "target_temp_min": 91, "target_temp_max": 96, "visual_wrap": "Quand la bark est bien fixée et la couleur développée.", "probe_tender": "La sonde entre sans accrocher."}',
  3),

('prime_rib', 'Côte de bœuf / Prime Rib', 'boeuf', '🥩', 'reverse_sear', false,
  '[{"temp_c": 107, "min_per_kg": 88}, {"temp_c": 121, "min_per_kg": 66}, {"temp_c": 135, "min_per_kg": 44}]',
  null, null, 5, 10,
  '{"pull_before_target_c": 8, "sear_total_minutes_min": 4, "sear_total_minutes_max": 8}',
  '{"rare": 52, "medium_rare": 54, "medium": 60}',
  '{"reverse_note": "Sortir environ 8°C avant la cible finale, puis saisir fort."}',
  4),

('tomahawk', 'Tomahawk / steak épais', 'boeuf', '🥩', 'reverse_sear', false,
  '[{"temp_c": 107, "min_per_kg": 50}, {"temp_c": 121, "min_per_kg": 38}, {"temp_c": 135, "min_per_kg": 30}]',
  null, null, 5, 8,
  '{"pull_before_target_c": 8, "sear_total_minutes_min": 3, "sear_total_minutes_max": 6}',
  '{"rare": 52, "medium_rare": 54, "medium": 60}',
  '{"reverse_note": "Surtout pertinent sur pièce épaisse ; sur pièce fine, résultat moins net."}',
  5),

-- PORC
('pulled_pork', 'Pulled Pork / Pork Butt', 'porc', '🐷', 'low_and_slow', true,
  '[{"temp_c": 107, "min_per_kg": 242}, {"temp_c": 121, "min_per_kg": 182}, {"temp_c": 135, "min_per_kg": 121}]',
  null, 12, 45, 120, null, null,
  '{"stall_temp_min": 63, "stall_temp_max": 74, "wrap_temp_min": 70, "wrap_temp_max": 76, "begin_test_temp": 90, "target_temp_min": 93, "target_temp_max": 96, "visual_wrap": "Quand la couleur est bien posée.", "probe_tender": "L''os tourne facilement ou la sonde entre sans résistance."}',
  10),

('spare_ribs', 'Spare Ribs', 'porc', '🍖', 'low_and_slow', true,
  null,
  '{"wrapped": {"min": 330, "max": 390}, "unwrapped": {"min": 300, "max": 375}}',
  null, 10, 20, null, null,
  '{"visual_wrap": "Emballe si la couleur te plaît.", "probe_tender": "Flex test : le rack plie franchement."}',
  11),

('baby_back_ribs', 'Baby Back Ribs', 'porc', '🍖', 'low_and_slow', true,
  null,
  '{"wrapped": {"min": 270, "max": 330}, "unwrapped": {"min": 240, "max": 300}}',
  null, 10, 15, null, null,
  '{"visual_wrap": "Emballe si la couleur te plaît.", "probe_tender": "Flex test + surface craquelée."}',
  12),

-- VOLAILLE
('whole_chicken', 'Poulet entier', 'volaille', '🍗', 'low_and_slow', false,
  '[{"temp_c": 135, "min_per_kg": 85}, {"temp_c": 150, "min_per_kg": 65}, {"temp_c": 165, "min_per_kg": 52}]',
  null, null, 10, 20, null, null,
  '{"begin_test_temp": 70, "target_temp_min": 74, "target_temp_max": 80, "visual_warning": "En dessous de 130°C, peau souvent molle."}',
  20);
