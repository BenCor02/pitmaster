-- Charbon & Flamme
-- Reset propre Supabase pour la reconstruction feature-first
-- Destructif : supprime les tables publiques de l'app, les policies associees
-- et recree une base saine coherente avec l'app reconstruite.

begin;

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- Storage policies
-- ─────────────────────────────────────────────────────────────
drop policy if exists "public_read_site_media" on storage.objects;
drop policy if exists "public_read_article_media" on storage.objects;
drop policy if exists "public_read_calculator_media" on storage.objects;
drop policy if exists "admin_manage_site_media" on storage.objects;
drop policy if exists "admin_manage_article_media" on storage.objects;
drop policy if exists "admin_manage_calculator_media" on storage.objects;
drop policy if exists "users_manage_own_uploads" on storage.objects;

-- ─────────────────────────────────────────────────────────────
-- Triggers / functions
-- ─────────────────────────────────────────────────────────────
drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.set_updated_at() cascade;
drop function if exists public.current_user_role() cascade;
drop function if exists public.is_adminish() cascade;
drop function if exists public.get_my_profile() cascade;
drop function if exists public.check_and_increment_quota(uuid) cascade;

-- ─────────────────────────────────────────────────────────────
-- Tables publiques utilisées par l'app
-- ─────────────────────────────────────────────────────────────
drop table if exists public.cook_history cascade;
drop table if exists public.approved_adjustments cascade;
drop table if exists public.coefficient_suggestions cascade;
drop table if exists public.algorithm_versions cascade;
drop table if exists public.base_coefficients cascade;
drop table if exists public.active_cook_sessions cascade;
drop table if exists public.cook_parties cascade;
drop table if exists public.cook_journal cascade;
drop table if exists public.sessions cascade;
drop table if exists public.user_usage_monthly cascade;
drop table if exists public.user_usage cascade;
drop table if exists public.plan_features cascade;
drop table if exists public.plans cascade;
drop table if exists public.member_saved_cooks cascade;
drop table if exists public.media_library cascade;
drop table if exists public.calculator_parameters cascade;
drop table if exists public.cooking_methods cascade;
drop table if exists public.meats cascade;
drop table if exists public.articles cascade;
drop table if exists public.faqs cascade;
drop table if exists public.page_sections cascade;
drop table if exists public.pages cascade;
drop table if exists public.site_settings cascade;
drop table if exists public.banned_ips cascade;
drop table if exists public.profiles cascade;

-- ─────────────────────────────────────────────────────────────
-- Fonctions utilitaires
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Tables coeur auth / CMS / calculateur
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  role text not null default 'member' check (role in ('super_admin', 'admin', 'editor', 'member')),
  status text not null default 'active' check (status in ('active', 'pending', 'disabled')),
  account_status text not null default 'active' check (account_status in ('active', 'pending', 'suspended')),
  plan_code text not null default 'free',
  avatar_url text,
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  site_name text not null default 'Charbon & Flamme',
  site_tagline text,
  default_seo_title text,
  default_seo_description text,
  logo_url text,
  favicon_url text,
  support_email text,
  social_links_json jsonb not null default '{}'::jsonb,
  branding_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  page_type text not null default 'page',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived', 'active')),
  seo_title text,
  seo_description text,
  og_image_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  section_type text not null,
  order_index integer not null default 0,
  is_enabled boolean not null default true,
  title text,
  subtitle text,
  content text,
  cta_text text,
  cta_link text,
  image_url text,
  settings_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  order_index integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  seo_title text,
  seo_description text,
  featured_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.meats (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  icon text,
  description text,
  default_weight_kg numeric(6,2),
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.cooking_methods (
  id uuid primary key default gen_random_uuid(),
  meat_id uuid not null references public.meats(id) on delete cascade,
  method_key text not null,
  label text not null,
  smoker_temp_min integer not null,
  smoker_temp_max integer not null,
  smoker_temp_default integer not null,
  target_internal_temp integer,
  target_internal_temp_min integer,
  target_internal_temp_max integer,
  probe_start_temp integer,
  wrap_temp integer,
  wrap_time_saved_percent integer not null default 0,
  rest_min integer,
  rest_max integer,
  stall_min integer,
  stall_max integer,
  stall_duration_min integer not null default 0,
  notes text,
  timeline_profile text,
  fixed_total_min integer,
  fixed_total_max integer,
  sizing_model text,
  high_temp_minutes_per_kg numeric(8,2),
  low_temp_minutes_per_kg numeric(8,2),
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (meat_id, method_key)
);

create table public.calculator_parameters (
  id uuid primary key default gen_random_uuid(),
  method_id uuid not null unique references public.cooking_methods(id) on delete cascade,
  low_temp_minutes_per_kg numeric(8,2) not null,
  high_temp_minutes_per_kg numeric(8,2) not null,
  buffer_percent numeric(5,2) not null default 0,
  buffer_min_minutes integer not null default 0,
  buffer_max_minutes integer not null default 0,
  weight_adjustment_json jsonb not null default '{}'::jsonb,
  special_rules_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.media_library (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_path text not null unique,
  public_url text not null,
  alt_text text,
  title text,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.member_saved_cooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  cook_data_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- ─────────────────────────────────────────────────────────────
-- Acces / capacites / quotas
-- ─────────────────────────────────────────────────────────────
create table public.plans (
  key text primary key,
  name text not null,
  description text,
  badge text,
  color text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  price_monthly numeric(8,2),
  price_yearly numeric(8,2),
  stripe_price_monthly text,
  stripe_price_yearly text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.plan_features (
  plan_key text not null references public.plans(key) on delete cascade,
  feature_key text not null,
  label text,
  limit_value integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (plan_key, feature_key)
);

create table public.user_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  feature_key text not null,
  period text not null default 'total',
  count integer not null default 0,
  reset_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, feature_key, period)
);

create table public.user_usage_monthly (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  period_start date not null,
  calculations_used integer not null default 0,
  calculations_limit integer not null default 5,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, period_start)
);

-- ─────────────────────────────────────────────────────────────
-- Donnees membres / cuisson
-- ─────────────────────────────────────────────────────────────
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  meat_key text,
  meat_name text,
  weight numeric(8,2),
  smoker_temp integer,
  serve_time text,
  start_time text,
  cook_min integer,
  date text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.cook_journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  meat_name text,
  date text,
  serve_time text,
  start_time text,
  smoker_temp integer,
  weight numeric(8,2),
  cook_min integer,
  rating integer,
  notes text,
  photo_url text,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.cook_parties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text,
  serve_time text,
  smoker_temp integer,
  meats jsonb not null default '[]'::jsonb,
  date text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.active_cook_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  meat_key text,
  meat_label text,
  weight_kg numeric(8,2),
  smoker_temp_c integer,
  smoker_type text,
  wrap_type text,
  marbling text,
  water_pan boolean,
  started_at timestamptz,
  service_time text,
  phase1_min integer,
  stall_min integer,
  phase3_min integer,
  cook_min integer,
  buffer_min integer,
  rest_min integer,
  total_min integer,
  stall_start_c integer,
  target_c integer,
  wrap_temp_c integer,
  checkpoints jsonb not null default '[]'::jsonb,
  cook_log jsonb not null default '[]'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- ─────────────────────────────────────────────────────────────
-- Atelier algorithme / calibration
-- ─────────────────────────────────────────────────────────────
create table public.base_coefficients (
  id uuid primary key default gen_random_uuid(),
  meat_type text,
  phase text,
  parameter text not null,
  description text,
  value numeric(10,3) not null,
  unit text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.coefficient_suggestions (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  parameter text not null,
  current_value numeric(10,3) not null,
  suggested_value numeric(10,3) not null,
  delta_percent numeric(10,2),
  sample_size integer not null default 0,
  confidence_score integer not null default 0,
  rationale text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.approved_adjustments (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  parameter text not null,
  base_value numeric(10,3),
  adjustment_value numeric(10,3) not null,
  suggestion_id uuid references public.coefficient_suggestions(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.algorithm_versions (
  id uuid primary key default gen_random_uuid(),
  version_name text not null,
  description text,
  snapshot jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  rollback_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.cook_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  meat_type text,
  weight_kg numeric(8,2),
  thickness_cm numeric(8,2),
  pit_temp_c integer,
  smoker_type text,
  wrap_type text,
  marbling text,
  predicted_min integer,
  real_min integer,
  error_pct numeric(8,2),
  error_min integer,
  stall_real_min integer,
  confidence_score integer,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.banned_ips (
  id uuid primary key default gen_random_uuid(),
  ip text not null unique,
  reason text,
  banned_at timestamptz not null default timezone('utc', now())
);

-- ─────────────────────────────────────────────────────────────
-- Triggers updated_at
-- ─────────────────────────────────────────────────────────────
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_pages_updated_at before update on public.pages for each row execute function public.set_updated_at();
create trigger set_page_sections_updated_at before update on public.page_sections for each row execute function public.set_updated_at();
create trigger set_faqs_updated_at before update on public.faqs for each row execute function public.set_updated_at();
create trigger set_articles_updated_at before update on public.articles for each row execute function public.set_updated_at();
create trigger set_meats_updated_at before update on public.meats for each row execute function public.set_updated_at();
create trigger set_cooking_methods_updated_at before update on public.cooking_methods for each row execute function public.set_updated_at();
create trigger set_calculator_parameters_updated_at before update on public.calculator_parameters for each row execute function public.set_updated_at();
create trigger set_member_saved_cooks_updated_at before update on public.member_saved_cooks for each row execute function public.set_updated_at();
create trigger set_plans_updated_at before update on public.plans for each row execute function public.set_updated_at();
create trigger set_plan_features_updated_at before update on public.plan_features for each row execute function public.set_updated_at();
create trigger set_user_usage_updated_at before update on public.user_usage for each row execute function public.set_updated_at();
create trigger set_user_usage_monthly_updated_at before update on public.user_usage_monthly for each row execute function public.set_updated_at();
create trigger set_sessions_updated_at before update on public.sessions for each row execute function public.set_updated_at();
create trigger set_cook_journal_updated_at before update on public.cook_journal for each row execute function public.set_updated_at();
create trigger set_cook_parties_updated_at before update on public.cook_parties for each row execute function public.set_updated_at();
create trigger set_active_cook_sessions_updated_at before update on public.active_cook_sessions for each row execute function public.set_updated_at();
create trigger set_base_coefficients_updated_at before update on public.base_coefficients for each row execute function public.set_updated_at();
create trigger set_coefficient_suggestions_updated_at before update on public.coefficient_suggestions for each row execute function public.set_updated_at();
create trigger set_algorithm_versions_updated_at before update on public.algorithm_versions for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Fonctions auth / roles / quota
-- ─────────────────────────────────────────────────────────────
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select role
    from public.profiles
    where id = auth.uid()
    limit 1
  ), 'member');
$$;

create or replace function public.is_adminish()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('super_admin', 'admin', 'editor');
$$;

create or replace function public.get_my_profile()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', p.id,
    'email', p.email,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'role', p.role,
    'roles', jsonb_build_array(p.role),
    'status', p.status,
    'account_status', p.account_status,
    'plan_code', p.plan_code,
    'avatar_url', p.avatar_url,
    'last_seen_at', p.last_seen_at,
    'created_at', p.created_at,
    'updated_at', p.updated_at
  )
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, first_name, last_name, role, status, account_status, plan_code
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    'member',
    'active',
    'active',
    'free'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.check_and_increment_quota(p_user_id uuid default auth.uid())
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_code text;
  v_limit integer := 5;
  v_period_start date := date_trunc('month', timezone('utc', now()))::date;
  v_row public.user_usage_monthly%rowtype;
begin
  if p_user_id is null then
    return jsonb_build_object('allowed', false, 'reason', 'not_authenticated');
  end if;

  select plan_code into v_plan_code
  from public.profiles
  where id = p_user_id
  limit 1;

  if v_plan_code is null then
    return jsonb_build_object('allowed', false, 'reason', 'profile_missing');
  end if;

  select limit_value into v_limit
  from public.plan_features
  where plan_key = v_plan_code and feature_key = 'calc_uses'
  limit 1;

  if v_limit is null then
    v_limit := 5;
  end if;

  if v_limit = -1 then
    return jsonb_build_object('allowed', true, 'used', 0, 'remaining', null);
  end if;

  insert into public.user_usage_monthly (user_id, period_start, calculations_used, calculations_limit)
  values (p_user_id, v_period_start, 0, v_limit)
  on conflict (user_id, period_start) do nothing;

  select * into v_row
  from public.user_usage_monthly
  where user_id = p_user_id and period_start = v_period_start
  limit 1;

  if v_row.calculations_used >= v_row.calculations_limit then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'quota_exceeded',
      'used', v_row.calculations_used,
      'remaining', 0
    );
  end if;

  update public.user_usage_monthly
  set calculations_used = calculations_used + 1,
      calculations_limit = v_limit,
      updated_at = timezone('utc', now())
  where user_id = p_user_id and period_start = v_period_start
  returning * into v_row;

  return jsonb_build_object(
    'allowed', true,
    'used', v_row.calculations_used,
    'remaining', greatest(v_row.calculations_limit - v_row.calculations_used, 0)
  );
end;
$$;

grant usage on schema public to anon, authenticated;
grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.is_adminish() to anon, authenticated;
grant execute on function public.get_my_profile() to anon, authenticated;
grant execute on function public.check_and_increment_quota(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.faqs enable row level security;
alter table public.articles enable row level security;
alter table public.meats enable row level security;
alter table public.cooking_methods enable row level security;
alter table public.calculator_parameters enable row level security;
alter table public.media_library enable row level security;
alter table public.member_saved_cooks enable row level security;
alter table public.plans enable row level security;
alter table public.plan_features enable row level security;
alter table public.user_usage enable row level security;
alter table public.user_usage_monthly enable row level security;
alter table public.sessions enable row level security;
alter table public.cook_journal enable row level security;
alter table public.cook_parties enable row level security;
alter table public.active_cook_sessions enable row level security;
alter table public.base_coefficients enable row level security;
alter table public.coefficient_suggestions enable row level security;
alter table public.approved_adjustments enable row level security;
alter table public.algorithm_versions enable row level security;
alter table public.cook_history enable row level security;
alter table public.banned_ips enable row level security;

-- Profiles
create policy "profiles_select_self_or_admin" on public.profiles
for select to authenticated
using (auth.uid() = id or public.is_adminish());

create policy "profiles_update_self_or_admin" on public.profiles
for update to authenticated
using (auth.uid() = id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = id or public.current_user_role() in ('super_admin', 'admin'));

create policy "profiles_insert_self_or_admin" on public.profiles
for insert to authenticated
with check (auth.uid() = id or public.current_user_role() in ('super_admin', 'admin'));

-- Public read CMS / catalogue / access metadata
create policy "site_settings_public_read" on public.site_settings for select to anon, authenticated using (true);
create policy "pages_public_read" on public.pages for select to anon, authenticated using (status in ('published', 'active'));
create policy "sections_public_read" on public.page_sections for select to anon, authenticated using (is_enabled = true);
create policy "faqs_public_read" on public.faqs for select to anon, authenticated using (is_published = true);
create policy "articles_public_read" on public.articles for select to anon, authenticated using (status = 'published');
create policy "meats_public_read" on public.meats for select to anon, authenticated using (is_active = true);
create policy "methods_public_read" on public.cooking_methods for select to anon, authenticated using (is_active = true);
create policy "params_public_read" on public.calculator_parameters for select to anon, authenticated using (true);
create policy "media_public_read" on public.media_library for select to anon, authenticated using (true);
create policy "plans_public_read" on public.plans for select to anon, authenticated using (is_active = true);
create policy "plan_features_public_read" on public.plan_features for select to anon, authenticated using (true);
create policy "approved_adjustments_public_read" on public.approved_adjustments for select to anon, authenticated using (true);

-- Admin write tables
create policy "site_settings_admin_write" on public.site_settings for all to authenticated using (public.current_user_role() in ('super_admin', 'admin')) with check (public.current_user_role() in ('super_admin', 'admin'));
create policy "pages_admin_write" on public.pages for all to authenticated using (public.current_user_role() in ('super_admin', 'admin', 'editor')) with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));
create policy "sections_admin_write" on public.page_sections for all to authenticated using (public.current_user_role() in ('super_admin', 'admin', 'editor')) with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));
create policy "faqs_admin_write" on public.faqs for all to authenticated using (public.current_user_role() in ('super_admin', 'admin', 'editor')) with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));
create policy "articles_admin_write" on public.articles for all to authenticated using (public.current_user_role() in ('super_admin', 'admin', 'editor')) with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));
create policy "meats_admin_write" on public.meats for all to authenticated using (public.current_user_role() in ('super_admin', 'admin')) with check (public.current_user_role() in ('super_admin', 'admin'));
create policy "methods_admin_write" on public.cooking_methods for all to authenticated using (public.current_user_role() in ('super_admin', 'admin')) with check (public.current_user_role() in ('super_admin', 'admin'));
create policy "params_admin_write" on public.calculator_parameters for all to authenticated using (public.current_user_role() in ('super_admin', 'admin')) with check (public.current_user_role() in ('super_admin', 'admin'));
create policy "media_admin_write" on public.media_library for all to authenticated using (public.current_user_role() in ('super_admin', 'admin', 'editor')) with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));
create policy "plans_admin_write" on public.plans for all to authenticated using (public.current_user_role() in ('super_admin', 'admin')) with check (public.current_user_role() in ('super_admin', 'admin'));
create policy "plan_features_admin_write" on public.plan_features for all to authenticated using (public.current_user_role() in ('super_admin', 'admin')) with check (public.current_user_role() in ('super_admin', 'admin'));
create policy "base_coefficients_admin_read_write" on public.base_coefficients for all to authenticated using (public.current_user_role() in ('super_admin', 'admin')) with check (public.current_user_role() in ('super_admin', 'admin'));
create policy "coefficient_suggestions_admin_read_write" on public.coefficient_suggestions for all to authenticated using (public.current_user_role() in ('super_admin', 'admin')) with check (public.current_user_role() in ('super_admin', 'admin'));
create policy "approved_adjustments_admin_write" on public.approved_adjustments for all to authenticated using (public.current_user_role() in ('super_admin', 'admin')) with check (public.current_user_role() in ('super_admin', 'admin'));
create policy "algorithm_versions_admin_read_write" on public.algorithm_versions for all to authenticated using (public.current_user_role() in ('super_admin', 'admin')) with check (public.current_user_role() in ('super_admin', 'admin'));
create policy "banned_ips_admin_only" on public.banned_ips for all to authenticated using (public.current_user_role() in ('super_admin', 'admin')) with check (public.current_user_role() in ('super_admin', 'admin'));
create policy "cook_history_admin_read" on public.cook_history for select to authenticated using (public.current_user_role() in ('super_admin', 'admin'));
create policy "cook_history_self_insert" on public.cook_history for insert to authenticated with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

-- Donnees membres
create policy "saved_cooks_self_read_write" on public.member_saved_cooks
for all to authenticated
using (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

create policy "user_usage_self_read_write" on public.user_usage
for all to authenticated
using (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

create policy "user_usage_monthly_self_read_write" on public.user_usage_monthly
for all to authenticated
using (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

create policy "sessions_self_read_write" on public.sessions
for all to authenticated
using (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

create policy "journal_self_read_write" on public.cook_journal
for all to authenticated
using (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

create policy "parties_self_read_write" on public.cook_parties
for all to authenticated
using (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

create policy "active_sessions_self_read_write" on public.active_cook_sessions
for all to authenticated
using (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

-- ─────────────────────────────────────────────────────────────
-- Buckets storage
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('site-media', 'site-media', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('article-media', 'article-media', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('calculator-media', 'calculator-media', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('user-uploads', 'user-uploads', false) on conflict (id) do nothing;

create policy "public_read_site_media" on storage.objects
for select to anon, authenticated
using (bucket_id = 'site-media');

create policy "public_read_article_media" on storage.objects
for select to anon, authenticated
using (bucket_id = 'article-media');

create policy "public_read_calculator_media" on storage.objects
for select to anon, authenticated
using (bucket_id = 'calculator-media');

create policy "admin_manage_site_media" on storage.objects
for all to authenticated
using (bucket_id = 'site-media' and public.current_user_role() in ('super_admin', 'admin', 'editor'))
with check (bucket_id = 'site-media' and public.current_user_role() in ('super_admin', 'admin', 'editor'));

create policy "admin_manage_article_media" on storage.objects
for all to authenticated
using (bucket_id = 'article-media' and public.current_user_role() in ('super_admin', 'admin', 'editor'))
with check (bucket_id = 'article-media' and public.current_user_role() in ('super_admin', 'admin', 'editor'));

create policy "admin_manage_calculator_media" on storage.objects
for all to authenticated
using (bucket_id = 'calculator-media' and public.current_user_role() in ('super_admin', 'admin', 'editor'))
with check (bucket_id = 'calculator-media' and public.current_user_role() in ('super_admin', 'admin', 'editor'));

create policy "users_manage_own_uploads" on storage.objects
for all to authenticated
using (bucket_id = 'user-uploads' and owner = auth.uid())
with check (bucket_id = 'user-uploads' and owner = auth.uid());

commit;
