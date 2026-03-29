# Baseline Supabase canonique

La reference SQL unique pour stabiliser le projet est:

- [202603291730_unified_supabase_baseline.sql](/Users/benjamincorette/pitmaster/supabase/migrations/202603291730_unified_supabase_baseline.sql)

Ce fichier couvre:

- schema complet (tables runtime reellement utilisees)
- fonctions auth/profil/roles/quota
- triggers `updated_at`
- RLS + policies
- buckets/policies Storage
- seed minimal runtime (`site_settings`, `plans`, `plan_features`)

Les scripts dans `supabase/manual/` restent en historique, mais ne sont plus la source de verite.

Si ta base a deja ete initialisee avant cette baseline, execute aussi:

- [202603291805_add_missing_site_settings_columns.sql](/Users/benjamincorette/pitmaster/supabase/migrations/202603291805_add_missing_site_settings_columns.sql)
