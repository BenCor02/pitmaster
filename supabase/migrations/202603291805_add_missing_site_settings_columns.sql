-- Hotfix: add missing site_settings columns used by Admin Settings UI.
-- Safe to run multiple times.

begin;

alter table if exists public.site_settings add column if not exists site_description text;
alter table if exists public.site_settings add column if not exists seo_title text;
alter table if exists public.site_settings add column if not exists seo_keywords text;
alter table if exists public.site_settings add column if not exists og_image text;
alter table if exists public.site_settings add column if not exists maintenance_mode boolean not null default false;
alter table if exists public.site_settings add column if not exists allow_signups boolean not null default true;
alter table if exists public.site_settings add column if not exists max_sessions_free integer not null default 10;
alter table if exists public.site_settings add column if not exists max_journal_free integer not null default 5;
alter table if exists public.site_settings add column if not exists ask_ai_free_limit integer not null default 3;
alter table if exists public.site_settings add column if not exists ask_ai_pro_limit integer not null default 50;
alter table if exists public.site_settings add column if not exists primary_color text not null default '#e85d04';
alter table if exists public.site_settings add column if not exists accent_color text not null default '#f48c06';
alter table if exists public.site_settings add column if not exists announcement text;

update public.site_settings
set
  site_description = coalesce(site_description, default_seo_description),
  seo_title = coalesce(seo_title, default_seo_title),
  og_image = coalesce(og_image, logo_url),
  updated_at = timezone('utc', now())
where id = 1;

commit;
