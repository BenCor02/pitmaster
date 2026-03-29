# Baseline Supabase canonique

La référence SQL unique pour stabiliser le projet est:

- [202603291730_unified_supabase_baseline.sql](/Users/benjamincorette/pitmaster/supabase/migrations/202603291730_unified_supabase_baseline.sql)

Ce fichier couvre:

- schéma complet (tables runtime réellement utilisées)
- fonctions auth/profil/rôles/quota
- triggers `updated_at`
- RLS + policies
- buckets/policies Storage
- seed minimal runtime (`site_settings`, `plans`, `plan_features`)

Les scripts dans `supabase/manual/` restent en historique, mais ne sont plus la source de vérité.
