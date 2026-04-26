-- ============================================================
-- 033 — calculator_logs : tracking anonyme des calculs
--
-- Objectif : alimenter la page Statistiques de l'admin
--   (nombre de calculs, viandes les plus calculées, tendances).
--
-- Choix :
--   - Pas de PII (pas d'email, pas de user_id obligatoire)
--   - INSERT public (anonyme + connecté)
--   - SELECT/DELETE réservé admin via public.is_admin()
-- ============================================================

create table if not exists public.calculator_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id text,           -- ex: "brisket-low-slow"
  profile_name text,         -- ex: "Brisket low & slow"
  category text,             -- boeuf | porc | agneau | volaille | autre
  weight_kg numeric(5,2),    -- null si profil à temps fixe
  cook_temp_c integer,       -- null si profil à temps fixe
  wrapped boolean default false,
  doneness text,             -- nullable (reverse sear uniquement)
  cook_type text,            -- low_slow | hot_fast | reverse_sear | fixed | ...
  created_at timestamptz default now()
);

-- Index pour les requêtes d'agrégation
create index if not exists idx_calc_logs_created_at on public.calculator_logs (created_at desc);
create index if not exists idx_calc_logs_profile_id on public.calculator_logs (profile_id);
create index if not exists idx_calc_logs_category on public.calculator_logs (category);

-- ── RLS ───────────────────────────────────────────────────
alter table public.calculator_logs enable row level security;

-- Tout le monde (anon + authenticated) peut INSERT (logging)
drop policy if exists "calc_logs_insert_public" on public.calculator_logs;
create policy "calc_logs_insert_public" on public.calculator_logs
  for insert
  to anon, authenticated
  with check (true);

-- Seuls les admins peuvent SELECT (stats)
drop policy if exists "calc_logs_select_admin" on public.calculator_logs;
create policy "calc_logs_select_admin" on public.calculator_logs
  for select
  to authenticated
  using (public.is_admin());

-- Seuls les admins peuvent DELETE (purge éventuelle)
drop policy if exists "calc_logs_delete_admin" on public.calculator_logs;
create policy "calc_logs_delete_admin" on public.calculator_logs
  for delete
  to authenticated
  using (public.is_admin());

-- Pas d'UPDATE : un log est immuable.

-- ── Vue d'agrégation (optionnelle, accélère certaines stats) ─
create or replace view public.calculator_logs_daily as
select
  date_trunc('day', created_at)::date as day,
  count(*)::int as total,
  count(distinct profile_id)::int as unique_profiles
from public.calculator_logs
group by 1
order by 1 desc;

grant select on public.calculator_logs_daily to authenticated;
