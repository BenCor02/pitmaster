-- ============================================================
-- CHARBON & FLAMME v2 — Champs profil supplémentaires
-- Type de fumoir + niveau d'expérience
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS smoker_type text,
  ADD COLUMN IF NOT EXISTS experience_level text check (experience_level in ('debutant', 'intermediaire', 'avance', 'pitmaster')),
  ADD COLUMN IF NOT EXISTS onboarding_done boolean not null default false;
