-- ============================================================
-- CHARBON & FLAMME v2 — Journal de cuisson
-- Table pour stocker les sessions de cuisson des utilisateurs
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

create table public.cook_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Infos cuisson (pré-rempli depuis le calculateur)
  meat_name text not null,
  meat_profile_id text,
  weight_kg numeric(4,1),
  cook_temp_c integer,
  wrapped boolean default false,
  doneness text,
  rub_used text,

  -- Résultats réels
  actual_duration_hours numeric(4,1),
  internal_temp_reached integer,
  rest_duration_minutes integer,

  -- Journal / notes
  notes text,
  what_went_well text,
  what_to_improve text,
  rating integer check (rating >= 1 and rating <= 5),

  -- Météo / contexte (optionnel)
  weather text,
  smoker_type text,
  wood_type text,

  -- Dates
  cook_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index pour les requêtes par utilisateur
create index cook_sessions_user_id_idx on public.cook_sessions(user_id);
create index cook_sessions_cook_date_idx on public.cook_sessions(cook_date desc);

-- RLS : chaque utilisateur ne voit que ses propres sessions
alter table public.cook_sessions enable row level security;

create policy "cook_sessions_select_own" on public.cook_sessions
  for select using (auth.uid() = user_id);

create policy "cook_sessions_insert_own" on public.cook_sessions
  for insert with check (auth.uid() = user_id);

create policy "cook_sessions_update_own" on public.cook_sessions
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cook_sessions_delete_own" on public.cook_sessions
  for delete using (auth.uid() = user_id);

-- Trigger updated_at
create trigger cook_sessions_updated_at
  before update on public.cook_sessions
  for each row execute function public.set_updated_at();
