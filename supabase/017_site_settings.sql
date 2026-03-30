-- ═══════════════════════════════════════════════════════════
-- 017 — Table site_settings : configuration globale du site
-- ═══════════════════════════════════════════════════════════

create table if not exists public.site_settings (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  value       jsonb not null default '{}',
  updated_at  timestamptz default now()
);

-- Trigger auto updated_at
create or replace function update_site_settings_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_site_settings_updated
  before update on public.site_settings
  for each row execute function update_site_settings_timestamp();

-- RLS
alter table public.site_settings enable row level security;

-- Lecture publique (le front a besoin du titre, logo, toggles)
create policy "site_settings_read" on public.site_settings
  for select using (true);

-- Écriture admin uniquement
create policy "site_settings_admin_update" on public.site_settings
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create policy "site_settings_admin_insert" on public.site_settings
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- ── Données initiales ──────────────────────────────────────

-- Branding
insert into public.site_settings (key, value) values
  ('branding', '{
    "site_name_line1": "CHARBON",
    "site_name_line2": "& FLAMME",
    "tagline": "L'\''arsenal du pitmaster",
    "logo_url": null
  }'::jsonb);

-- Modules toggles (activer/désactiver des sections entières)
insert into public.site_settings (key, value) values
  ('modules', '{
    "seo_blocks": true,
    "affiliate": false,
    "faq": true,
    "guides": true,
    "recipes": true,
    "wood_guide": true,
    "comparator": true,
    "favorites": true,
    "shared_cooks": true,
    "journal": true
  }'::jsonb);
