-- PATCH: phase 1 Supabase-first pour Charbon & Flamme
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select coalesce((
    select role
    from public.profiles
    where id = auth.uid()
    order by updated_at desc nulls last, created_at desc nulls last
    limit 1
  ), 'member');
$$;

create or replace function public.is_adminish()
returns boolean
language sql
stable
as $$
  select public.current_user_role() in ('super_admin', 'admin', 'editor');
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  role text not null default 'member' check (role in ('super_admin', 'admin', 'editor', 'member')),
  status text not null default 'active' check (status in ('active', 'disabled', 'pending')),
  account_status text not null default 'active' check (account_status in ('active', 'suspended', 'pending')),
  plan_code text not null default 'free',
  avatar_url text,
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
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

create or replace function public.get_my_profile()
returns jsonb
language sql
security definer
stable
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
  order by p.updated_at desc nulls last, p.created_at desc nulls last
  limit 1;
$$;

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

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists set_pages_updated_at on public.pages;
create trigger set_pages_updated_at before update on public.pages for each row execute procedure public.set_updated_at();
drop trigger if exists set_page_sections_updated_at on public.page_sections;
create trigger set_page_sections_updated_at before update on public.page_sections for each row execute procedure public.set_updated_at();
drop trigger if exists set_faqs_updated_at on public.faqs;
create trigger set_faqs_updated_at before update on public.faqs for each row execute procedure public.set_updated_at();
drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at before update on public.articles for each row execute procedure public.set_updated_at();
drop trigger if exists set_meats_updated_at on public.meats;
create trigger set_meats_updated_at before update on public.meats for each row execute procedure public.set_updated_at();
drop trigger if exists set_cooking_methods_updated_at on public.cooking_methods;
create trigger set_cooking_methods_updated_at before update on public.cooking_methods for each row execute procedure public.set_updated_at();
drop trigger if exists set_calculator_parameters_updated_at on public.calculator_parameters;
create trigger set_calculator_parameters_updated_at before update on public.calculator_parameters for each row execute procedure public.set_updated_at();
drop trigger if exists set_member_saved_cooks_updated_at on public.member_saved_cooks;
create trigger set_member_saved_cooks_updated_at before update on public.member_saved_cooks for each row execute procedure public.set_updated_at();

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

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles
for select using (auth.uid() = id or public.is_adminish());

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin" on public.profiles
for update using (auth.uid() = id or public.current_user_role() in ('super_admin', 'admin'))
with check (auth.uid() = id or public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "profiles_insert_admin_only" on public.profiles;
create policy "profiles_insert_admin_only" on public.profiles
for insert with check (public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
for select using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write" on public.site_settings
for all using (public.current_user_role() in ('super_admin', 'admin'))
with check (public.current_user_role() in ('super_admin', 'admin'));

drop policy if exists "pages_public_read" on public.pages;
create policy "pages_public_read" on public.pages
for select using (status in ('published', 'active'));

drop policy if exists "pages_admin_write" on public.pages;
create policy "pages_admin_write" on public.pages
for all using (public.is_adminish())
with check (public.is_adminish());

drop policy if exists "sections_public_read" on public.page_sections;
create policy "sections_public_read" on public.page_sections
for select using (
  is_enabled = true
  and exists (
    select 1 from public.pages p
    where p.id = page_sections.page_id
      and p.status in ('published', 'active')
  )
);

drop policy if exists "sections_admin_write" on public.page_sections;
create policy "sections_admin_write" on public.page_sections
for all using (public.is_adminish())
with check (public.is_adminish());

drop policy if exists "faqs_public_read" on public.faqs;
create policy "faqs_public_read" on public.faqs
for select using (is_published = true);

drop policy if exists "faqs_admin_write" on public.faqs;
create policy "faqs_admin_write" on public.faqs
for all using (public.is_adminish())
with check (public.is_adminish());

drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read" on public.articles
for select using (status = 'published');

drop policy if exists "articles_admin_write" on public.articles;
create policy "articles_admin_write" on public.articles
for all using (public.is_adminish())
with check (public.is_adminish());

drop policy if exists "meats_public_read" on public.meats;
create policy "meats_public_read" on public.meats
for select using (is_active = true);

drop policy if exists "meats_admin_write" on public.meats;
create policy "meats_admin_write" on public.meats
for all using (public.is_adminish())
with check (public.is_adminish());

drop policy if exists "methods_public_read" on public.cooking_methods;
create policy "methods_public_read" on public.cooking_methods
for select using (is_active = true);

drop policy if exists "methods_admin_write" on public.cooking_methods;
create policy "methods_admin_write" on public.cooking_methods
for all using (public.is_adminish())
with check (public.is_adminish());

drop policy if exists "params_public_read" on public.calculator_parameters;
create policy "params_public_read" on public.calculator_parameters
for select using (true);

drop policy if exists "params_admin_write" on public.calculator_parameters;
create policy "params_admin_write" on public.calculator_parameters
for all using (public.is_adminish())
with check (public.is_adminish());

drop policy if exists "media_public_read" on public.media_library;
create policy "media_public_read" on public.media_library
for select using (true);

drop policy if exists "media_admin_write" on public.media_library;
create policy "media_admin_write" on public.media_library
for all using (public.is_adminish())
with check (public.is_adminish());

drop policy if exists "saved_cooks_self_read" on public.member_saved_cooks;
create policy "saved_cooks_self_read" on public.member_saved_cooks
for select using (auth.uid() = user_id or public.is_adminish());

drop policy if exists "saved_cooks_self_write" on public.member_saved_cooks;
create policy "saved_cooks_self_write" on public.member_saved_cooks
for all using (auth.uid() = user_id or public.is_adminish())
with check (auth.uid() = user_id or public.is_adminish());

insert into storage.buckets (id, name, public)
values
  ('site-media', 'site-media', true),
  ('article-media', 'article-media', true),
  ('calculator-media', 'calculator-media', true),
  ('user-uploads', 'user-uploads', false)
on conflict (id) do nothing;

drop policy if exists "public_read_site_media" on storage.objects;
create policy "public_read_site_media" on storage.objects
for select using (bucket_id in ('site-media', 'article-media', 'calculator-media'));

drop policy if exists "admin_manage_site_media" on storage.objects;
create policy "admin_manage_site_media" on storage.objects
for all using (
  public.is_adminish()
  and bucket_id in ('site-media', 'article-media', 'calculator-media')
)
with check (
  public.is_adminish()
  and bucket_id in ('site-media', 'article-media', 'calculator-media')
);

drop policy if exists "users_manage_own_uploads" on storage.objects;
create policy "users_manage_own_uploads" on storage.objects
for all using (
  auth.uid() is not null
  and bucket_id = 'user-uploads'
  and owner = auth.uid()
)
with check (
  auth.uid() is not null
  and bucket_id = 'user-uploads'
  and owner = auth.uid()
);
