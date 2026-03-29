-- Charbon & Flamme - Unified Supabase baseline (single source of truth)
-- Idempotent: safe to run on a fresh or partially initialized project.
-- This migration intentionally consolidates auth/profile/CMS/calculator/admin runtime tables.

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Utility trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Core auth/profile/CMS tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  smoker_type text,
  experience_level text,
  bbq_frequency text,
  favorite_meats jsonb not null default '[]'::jsonb,
  marketing_opt_in boolean not null default false,
  source_channel text,
  role text not null default 'member' check (role in ('super_admin', 'admin', 'editor', 'member')),
  status text not null default 'active' check (status in ('active', 'pending', 'disabled')),
  account_status text not null default 'active' check (account_status in ('active', 'pending', 'suspended')),
  plan_code text not null default 'free',
  avatar_url text,
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.profiles add column if not exists email text;
alter table if exists public.profiles add column if not exists first_name text;
alter table if exists public.profiles add column if not exists last_name text;
alter table if exists public.profiles add column if not exists smoker_type text;
alter table if exists public.profiles add column if not exists experience_level text;
alter table if exists public.profiles add column if not exists bbq_frequency text;
alter table if exists public.profiles add column if not exists favorite_meats jsonb not null default '[]'::jsonb;
alter table if exists public.profiles add column if not exists marketing_opt_in boolean not null default false;
alter table if exists public.profiles add column if not exists source_channel text;
alter table if exists public.profiles add column if not exists role text not null default 'member';
alter table if exists public.profiles add column if not exists status text not null default 'active';
alter table if exists public.profiles add column if not exists account_status text not null default 'active';
alter table if exists public.profiles add column if not exists plan_code text not null default 'free';
alter table if exists public.profiles add column if not exists avatar_url text;
alter table if exists public.profiles add column if not exists last_seen_at timestamptz;
alter table if exists public.profiles add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table if exists public.profiles add column if not exists updated_at timestamptz not null default timezone('utc', now());

create table if not exists public.site_settings (
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

alter table if exists public.site_settings add column if not exists site_name text not null default 'Charbon & Flamme';
alter table if exists public.site_settings add column if not exists site_tagline text;
alter table if exists public.site_settings add column if not exists default_seo_title text;
alter table if exists public.site_settings add column if not exists default_seo_description text;
alter table if exists public.site_settings add column if not exists logo_url text;
alter table if exists public.site_settings add column if not exists favicon_url text;
alter table if exists public.site_settings add column if not exists support_email text;
alter table if exists public.site_settings add column if not exists social_links_json jsonb not null default '{}'::jsonb;
alter table if exists public.site_settings add column if not exists branding_json jsonb not null default '{}'::jsonb;
alter table if exists public.site_settings add column if not exists updated_at timestamptz not null default timezone('utc', now());

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  page_type text not null default 'page',
  status text not null default 'draft' check (status in ('draft', 'published', 'active', 'archived')),
  seo_title text,
  seo_description text,
  og_image_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.page_sections (
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

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  order_index integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.articles (
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

create table if not exists public.seo_blocks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  block_type text not null check (block_type in ('bloc_recommendation_produit', 'bloc_guide', 'bloc_marque', 'bloc_conseil')),
  position text not null check (position in ('after_result', 'after_timeline', 'bottom_page', 'sidebar', 'after_intro', 'after_calculator')),
  page_slug text,
  meat_slug text,
  method_key text,
  title_secondary text,
  content text,
  image_url text,
  cta_text text,
  cta_link text,
  affiliate_link text,
  badge text,
  note text,
  icon text,
  settings_json jsonb not null default '{}'::jsonb,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.seo_block_products (
  id uuid primary key default gen_random_uuid(),
  seo_block_id uuid not null references public.seo_blocks(id) on delete cascade,
  name text not null,
  image_url text,
  affiliate_url text,
  description text,
  rating numeric(3,2),
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.meats (
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

create table if not exists public.cooking_methods (
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

create table if not exists public.calculator_parameters (
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

create table if not exists public.media_library (
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

create table if not exists public.member_saved_cooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  cook_data_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- Access / quotas / members runtime tables
-- ---------------------------------------------------------------------------
create table if not exists public.plans (
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

create table if not exists public.plan_features (
  plan_key text not null references public.plans(key) on delete cascade,
  feature_key text not null,
  label text,
  limit_value integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (plan_key, feature_key)
);

create table if not exists public.user_usage (
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

create table if not exists public.user_usage_monthly (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  period_start date not null,
  calculations_used integer not null default 0,
  calculations_limit integer not null default 5,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, period_start)
);

create table if not exists public.sessions (
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

create table if not exists public.cook_journal (
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

create table if not exists public.cook_parties (
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

create table if not exists public.active_cook_sessions (
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

create table if not exists public.base_coefficients (
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

create table if not exists public.coefficient_suggestions (
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

create table if not exists public.approved_adjustments (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  parameter text not null,
  base_value numeric(10,3),
  adjustment_value numeric(10,3) not null,
  suggestion_id uuid references public.coefficient_suggestions(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.algorithm_versions (
  id uuid primary key default gen_random_uuid(),
  version_name text not null,
  description text,
  snapshot jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  rollback_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cook_history (
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

create table if not exists public.banned_ips (
  id uuid primary key default gen_random_uuid(),
  ip text not null unique,
  reason text,
  banned_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- Updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
drop trigger if exists set_pages_updated_at on public.pages;
create trigger set_pages_updated_at before update on public.pages for each row execute function public.set_updated_at();
drop trigger if exists set_page_sections_updated_at on public.page_sections;
create trigger set_page_sections_updated_at before update on public.page_sections for each row execute function public.set_updated_at();
drop trigger if exists set_faqs_updated_at on public.faqs;
create trigger set_faqs_updated_at before update on public.faqs for each row execute function public.set_updated_at();
drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at before update on public.articles for each row execute function public.set_updated_at();
drop trigger if exists set_seo_blocks_updated_at on public.seo_blocks;
create trigger set_seo_blocks_updated_at before update on public.seo_blocks for each row execute function public.set_updated_at();
drop trigger if exists set_seo_block_products_updated_at on public.seo_block_products;
create trigger set_seo_block_products_updated_at before update on public.seo_block_products for each row execute function public.set_updated_at();
drop trigger if exists set_meats_updated_at on public.meats;
create trigger set_meats_updated_at before update on public.meats for each row execute function public.set_updated_at();
drop trigger if exists set_cooking_methods_updated_at on public.cooking_methods;
create trigger set_cooking_methods_updated_at before update on public.cooking_methods for each row execute function public.set_updated_at();
drop trigger if exists set_calculator_parameters_updated_at on public.calculator_parameters;
create trigger set_calculator_parameters_updated_at before update on public.calculator_parameters for each row execute function public.set_updated_at();
drop trigger if exists set_member_saved_cooks_updated_at on public.member_saved_cooks;
create trigger set_member_saved_cooks_updated_at before update on public.member_saved_cooks for each row execute function public.set_updated_at();
drop trigger if exists set_plans_updated_at on public.plans;
create trigger set_plans_updated_at before update on public.plans for each row execute function public.set_updated_at();
drop trigger if exists set_plan_features_updated_at on public.plan_features;
create trigger set_plan_features_updated_at before update on public.plan_features for each row execute function public.set_updated_at();
drop trigger if exists set_user_usage_updated_at on public.user_usage;
create trigger set_user_usage_updated_at before update on public.user_usage for each row execute function public.set_updated_at();
drop trigger if exists set_user_usage_monthly_updated_at on public.user_usage_monthly;
create trigger set_user_usage_monthly_updated_at before update on public.user_usage_monthly for each row execute function public.set_updated_at();
drop trigger if exists set_sessions_updated_at on public.sessions;
create trigger set_sessions_updated_at before update on public.sessions for each row execute function public.set_updated_at();
drop trigger if exists set_cook_journal_updated_at on public.cook_journal;
create trigger set_cook_journal_updated_at before update on public.cook_journal for each row execute function public.set_updated_at();
drop trigger if exists set_cook_parties_updated_at on public.cook_parties;
create trigger set_cook_parties_updated_at before update on public.cook_parties for each row execute function public.set_updated_at();
drop trigger if exists set_active_cook_sessions_updated_at on public.active_cook_sessions;
create trigger set_active_cook_sessions_updated_at before update on public.active_cook_sessions for each row execute function public.set_updated_at();
drop trigger if exists set_base_coefficients_updated_at on public.base_coefficients;
create trigger set_base_coefficients_updated_at before update on public.base_coefficients for each row execute function public.set_updated_at();
drop trigger if exists set_coefficient_suggestions_updated_at on public.coefficient_suggestions;
create trigger set_coefficient_suggestions_updated_at before update on public.coefficient_suggestions for each row execute function public.set_updated_at();
drop trigger if exists set_algorithm_versions_updated_at on public.algorithm_versions;
create trigger set_algorithm_versions_updated_at before update on public.algorithm_versions for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth/profile functions
-- ---------------------------------------------------------------------------
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select (
    select role
    from public.profiles
    where id = auth.uid()
    order by updated_at desc nulls last, created_at desc nulls last
    limit 1
  );
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
    'smoker_type', p.smoker_type,
    'experience_level', p.experience_level,
    'bbq_frequency', p.bbq_frequency,
    'favorite_meats', p.favorite_meats,
    'marketing_opt_in', p.marketing_opt_in,
    'source_channel', p.source_channel,
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
  order by p.updated_at desc nulls last, p.created_at desc nulls last
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
    id, email, first_name, last_name, role, status, account_status, plan_code, created_at, updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    'member',
    'active',
    'active',
    'free',
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (id) do update
  set email = excluded.email,
      updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (
  id, email, first_name, last_name, role, status, account_status, plan_code
)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'first_name', ''),
  coalesce(u.raw_user_meta_data ->> 'last_name', ''),
  coalesce(p.role, 'member'),
  coalesce(p.status, 'active'),
  coalesce(p.account_status, 'active'),
  coalesce(p.plan_code, 'free')
from auth.users u
left join public.profiles p on p.id = u.id
on conflict (id) do update
set email = excluded.email,
    updated_at = timezone('utc', now());

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

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.faqs enable row level security;
alter table public.articles enable row level security;
alter table public.seo_blocks enable row level security;
alter table public.seo_block_products enable row level security;
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

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles
for select to authenticated
using (auth.uid() = id or public.is_adminish());

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin" on public.profiles
for update to authenticated
using (auth.uid() = id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = id or public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "profiles_insert_self_or_admin" on public.profiles;
drop policy if exists "profiles_insert_admin_only" on public.profiles;
create policy "profiles_insert_self_or_admin" on public.profiles
for insert to authenticated
with check (auth.uid() = id or public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
for select to anon, authenticated
using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write" on public.site_settings
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin'))
with check (public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "pages_public_read" on public.pages;
create policy "pages_public_read" on public.pages
for select to anon, authenticated
using (status in ('published', 'active'));

drop policy if exists "pages_admin_write" on public.pages;
create policy "pages_admin_write" on public.pages
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin', 'editor'))
with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "sections_public_read" on public.page_sections;
create policy "sections_public_read" on public.page_sections
for select to anon, authenticated
using (is_enabled = true);

drop policy if exists "sections_admin_write" on public.page_sections;
create policy "sections_admin_write" on public.page_sections
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin', 'editor'))
with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "faqs_public_read" on public.faqs;
create policy "faqs_public_read" on public.faqs
for select to anon, authenticated
using (is_published = true);

drop policy if exists "faqs_admin_write" on public.faqs;
create policy "faqs_admin_write" on public.faqs
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin', 'editor'))
with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read" on public.articles
for select to anon, authenticated
using (status = 'published');

drop policy if exists "articles_admin_write" on public.articles;
create policy "articles_admin_write" on public.articles
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin', 'editor'))
with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "seo_blocks_public_read" on public.seo_blocks;
create policy "seo_blocks_public_read" on public.seo_blocks
for select to anon, authenticated
using (is_active = true);

drop policy if exists "seo_block_products_public_read" on public.seo_block_products;
create policy "seo_block_products_public_read" on public.seo_block_products
for select to anon, authenticated
using (
  exists (
    select 1 from public.seo_blocks b
    where b.id = seo_block_id
      and b.is_active = true
  )
);

drop policy if exists "seo_blocks_admin_write" on public.seo_blocks;
create policy "seo_blocks_admin_write" on public.seo_blocks
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin', 'editor'))
with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "seo_block_products_admin_write" on public.seo_block_products;
create policy "seo_block_products_admin_write" on public.seo_block_products
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin', 'editor'))
with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "meats_public_read" on public.meats;
create policy "meats_public_read" on public.meats
for select to anon, authenticated
using (is_active = true);

drop policy if exists "meats_admin_write" on public.meats;
create policy "meats_admin_write" on public.meats
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin'))
with check (public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "methods_public_read" on public.cooking_methods;
create policy "methods_public_read" on public.cooking_methods
for select to anon, authenticated
using (is_active = true);

drop policy if exists "methods_admin_write" on public.cooking_methods;
create policy "methods_admin_write" on public.cooking_methods
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin'))
with check (public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "params_public_read" on public.calculator_parameters;
create policy "params_public_read" on public.calculator_parameters
for select to anon, authenticated
using (true);

drop policy if exists "params_admin_write" on public.calculator_parameters;
create policy "params_admin_write" on public.calculator_parameters
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin'))
with check (public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "media_public_read" on public.media_library;
create policy "media_public_read" on public.media_library
for select to anon, authenticated
using (true);

drop policy if exists "media_admin_write" on public.media_library;
create policy "media_admin_write" on public.media_library
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin', 'editor'))
with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "saved_cooks_self_read_write" on public.member_saved_cooks;
drop policy if exists "saved_cooks_self_read" on public.member_saved_cooks;
drop policy if exists "saved_cooks_self_write" on public.member_saved_cooks;
create policy "saved_cooks_self_read_write" on public.member_saved_cooks
for all to authenticated
using (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "plans_public_read" on public.plans;
create policy "plans_public_read" on public.plans
for select to anon, authenticated
using (is_active = true);

drop policy if exists "plan_features_public_read" on public.plan_features;
create policy "plan_features_public_read" on public.plan_features
for select to anon, authenticated
using (true);

drop policy if exists "plans_admin_write" on public.plans;
create policy "plans_admin_write" on public.plans
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin'))
with check (public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "plan_features_admin_write" on public.plan_features;
create policy "plan_features_admin_write" on public.plan_features
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin'))
with check (public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "user_usage_self_read_write" on public.user_usage;
create policy "user_usage_self_read_write" on public.user_usage
for all to authenticated
using (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "user_usage_monthly_self_read_write" on public.user_usage_monthly;
create policy "user_usage_monthly_self_read_write" on public.user_usage_monthly
for all to authenticated
using (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "sessions_self_read_write" on public.sessions;
create policy "sessions_self_read_write" on public.sessions
for all to authenticated
using (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "journal_self_read_write" on public.cook_journal;
create policy "journal_self_read_write" on public.cook_journal
for all to authenticated
using (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "parties_self_read_write" on public.cook_parties;
create policy "parties_self_read_write" on public.cook_parties
for all to authenticated
using (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "active_sessions_self_read_write" on public.active_cook_sessions;
create policy "active_sessions_self_read_write" on public.active_cook_sessions
for all to authenticated
using (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "base_coefficients_admin_read_write" on public.base_coefficients;
create policy "base_coefficients_admin_read_write" on public.base_coefficients
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin'))
with check (public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "coefficient_suggestions_admin_read_write" on public.coefficient_suggestions;
create policy "coefficient_suggestions_admin_read_write" on public.coefficient_suggestions
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin'))
with check (public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "approved_adjustments_public_read" on public.approved_adjustments;
create policy "approved_adjustments_public_read" on public.approved_adjustments
for select to anon, authenticated
using (true);

drop policy if exists "approved_adjustments_admin_write" on public.approved_adjustments;
create policy "approved_adjustments_admin_write" on public.approved_adjustments
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin'))
with check (public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "algorithm_versions_admin_read_write" on public.algorithm_versions;
create policy "algorithm_versions_admin_read_write" on public.algorithm_versions
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin'))
with check (public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "cook_history_admin_read" on public.cook_history;
create policy "cook_history_admin_read" on public.cook_history
for select to authenticated
using (public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "cook_history_self_insert" on public.cook_history;
create policy "cook_history_self_insert" on public.cook_history
for insert to authenticated
with check (auth.uid() = user_id or public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "banned_ips_admin_only" on public.banned_ips;
create policy "banned_ips_admin_only" on public.banned_ips
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin'))
with check (public.current_user_role() in ('super_admin', 'admin'));

-- ---------------------------------------------------------------------------
-- Storage buckets + policies
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('site-media', 'site-media', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('seo-media', 'seo-media', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('article-media', 'article-media', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('affiliate-media', 'affiliate-media', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('calculator-media', 'calculator-media', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('user-uploads', 'user-uploads', false) on conflict (id) do nothing;

drop policy if exists "public_read_site_media" on storage.objects;
drop policy if exists "public_read_article_media" on storage.objects;
drop policy if exists "public_read_calculator_media" on storage.objects;
drop policy if exists "public_read_public_media" on storage.objects;
create policy "public_read_public_media" on storage.objects
for select to anon, authenticated
using (bucket_id in ('site-media', 'seo-media', 'article-media', 'affiliate-media', 'calculator-media'));

drop policy if exists "admin_manage_site_media" on storage.objects;
drop policy if exists "admin_manage_article_media" on storage.objects;
drop policy if exists "admin_manage_calculator_media" on storage.objects;
drop policy if exists "admin_manage_public_media" on storage.objects;
create policy "admin_manage_public_media" on storage.objects
for all to authenticated
using (
  bucket_id in ('site-media', 'seo-media', 'article-media', 'affiliate-media', 'calculator-media')
  and public.current_user_role() in ('super_admin', 'admin', 'editor')
)
with check (
  bucket_id in ('site-media', 'seo-media', 'article-media', 'affiliate-media', 'calculator-media')
  and public.current_user_role() in ('super_admin', 'admin', 'editor')
);

drop policy if exists "users_manage_own_uploads" on storage.objects;
create policy "users_manage_own_uploads" on storage.objects
for all to authenticated
using (bucket_id = 'user-uploads' and owner = auth.uid())
with check (bucket_id = 'user-uploads' and owner = auth.uid());

-- ---------------------------------------------------------------------------
-- Baseline seed rows required by runtime
-- ---------------------------------------------------------------------------
insert into public.site_settings (id, site_name, site_tagline)
values (1, 'Charbon & Flamme', 'Assistant de planification BBQ')
on conflict (id) do nothing;

insert into public.plans (key, name, description, badge, color, sort_order, is_active)
values
  ('free', 'Decouverte', 'Pour demarrer avec le calculateur', null, '#8a7060', 1, true),
  ('pro', 'Atelier Feu', 'Pour cuisiner souvent et sauvegarder plus', 'PRO', '#e85d04', 2, true),
  ('ultra', 'Service Braise', 'Pour usage intensif et equipe', 'ULTRA', '#f48c06', 3, true)
on conflict (key) do nothing;

insert into public.plan_features (plan_key, feature_key, label, limit_value)
values
  ('free', 'calc_uses', 'Calculs BBQ', 5),
  ('free', 'session_saves', 'Sessions sauvegardees', 3),
  ('free', 'journal_entries', 'Entrees journal', 10),
  ('free', 'party_meats', 'Viandes simultanees', 3),
  ('free', 'cold_uses', 'Fumage a froid', 5),
  ('free', 'ask_ai_daily', 'Questions pitmaster', 3),
  ('free', 'history_access', 'Historique', 1),
  ('free', 'export_pdf', 'Exports', 0),
  ('free', 'custom_meats', 'Viandes custom', 0),
  ('free', 'advanced_stats', 'Stats cuisson', 0),
  ('pro', 'calc_uses', 'Calculs BBQ', -1),
  ('pro', 'session_saves', 'Sessions sauvegardees', -1),
  ('pro', 'journal_entries', 'Entrees journal', -1),
  ('pro', 'party_meats', 'Viandes simultanees', 8),
  ('pro', 'cold_uses', 'Fumage a froid', -1),
  ('pro', 'ask_ai_daily', 'Questions pitmaster', 40),
  ('pro', 'history_access', 'Historique', -1),
  ('pro', 'export_pdf', 'Exports', -1),
  ('pro', 'custom_meats', 'Viandes custom', 25),
  ('pro', 'advanced_stats', 'Stats cuisson', 1),
  ('ultra', 'calc_uses', 'Calculs BBQ', -1),
  ('ultra', 'session_saves', 'Sessions sauvegardees', -1),
  ('ultra', 'journal_entries', 'Entrees journal', -1),
  ('ultra', 'party_meats', 'Viandes simultanees', -1),
  ('ultra', 'cold_uses', 'Fumage a froid', -1),
  ('ultra', 'ask_ai_daily', 'Questions pitmaster', -1),
  ('ultra', 'history_access', 'Historique', -1),
  ('ultra', 'export_pdf', 'Exports', -1),
  ('ultra', 'custom_meats', 'Viandes custom', -1),
  ('ultra', 'advanced_stats', 'Stats cuisson', -1)
on conflict (plan_key, feature_key) do nothing;

commit;
