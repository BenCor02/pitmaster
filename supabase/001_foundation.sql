-- ============================================================
-- CHARBON & FLAMME v2 — Fondation Supabase
-- À exécuter sur un NOUVEAU projet Supabase (SQL Editor)
-- ============================================================

-- 1. PROFILES (liés à auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin', 'super_admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_update_admin" on public.profiles
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- Trigger : créer un profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger : updated_at automatique (réutilisé par toutes les tables)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();


-- 2. COOKING PROFILES (profils de cuisson = cœur du calculateur)
-- ============================================================
-- Chaque profil = une viande avec toutes ses données de cuisson
-- Le JSON stocke temp_bands, fixed_times, cues, doneness_targets, reverse_sear
create table public.cooking_profiles (
  id text primary key,                -- ex: 'brisket', 'pulled_pork'
  name text not null,                  -- nom affiché
  category text not null,              -- 'boeuf', 'porc', 'volaille'
  icon text,                           -- emoji
  cook_type text not null default 'low_and_slow', -- 'low_and_slow' ou 'reverse_sear'
  supports_wrap boolean not null default false,
  -- Données de cuisson (JSONB pour flexibilité admin)
  temp_bands jsonb,                    -- [{"temp_c": 107, "min_per_kg": 200}, ...]
  fixed_times jsonb,                   -- {"wrapped": {"min": 330, "max": 390}, "unwrapped": {...}}
  wrap_reduction_percent numeric,
  rest_min integer not null default 10,
  rest_max integer not null default 60,
  -- Reverse sear
  reverse_sear jsonb,                  -- {"pull_before_target_c": 8, "sear_total_minutes_min": 4, ...}
  doneness_targets jsonb,              -- {"rare": 52, "medium_rare": 54, "medium": 60}
  -- Repères
  cues jsonb,                          -- tous les repères de cuisson
  -- Admin
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cooking_profiles enable row level security;

create policy "cooking_profiles_select" on public.cooking_profiles
  for select using (true);

create policy "cooking_profiles_admin_all" on public.cooking_profiles
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create trigger cooking_profiles_updated_at
  before update on public.cooking_profiles
  for each row execute function public.set_updated_at();


-- 3. SITE SETTINGS (paramètres globaux)
-- ============================================================
create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "settings_select" on public.site_settings
  for select using (true);

create policy "settings_admin_all" on public.site_settings
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );
