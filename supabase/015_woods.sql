-- ══════════════════════════════════════════════════════════════
-- 015 — Essences de bois de fumage
-- Sources : AmazingRibs.com, Texas A&M, Traeger, Smokinlicious
-- ══════════════════════════════════════════════════════════════

create table public.woods (
  id text primary key,
  name text not null,
  scientific_name text,
  emoji text,
  intensity text not null check (intensity in ('leger', 'moyen', 'fort')),
  flavor_profile text not null,
  description text not null,
  best_meats text[] not null default '{}',
  avoid_meats text[] not null default '{}',
  burn_characteristics text,
  origin text,
  availability_eu text check (availability_eu in ('excellente', 'bonne', 'moyenne', 'limitee')),
  safety_notes text,
  pitmaster_tips text,
  source text,
  is_toxic boolean not null default false,
  toxic_reason text,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.woods enable row level security;

create policy "woods_select_public" on public.woods
  for select using (status = 'published');

create policy "woods_admin_all" on public.woods
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create trigger woods_updated_at
  before update on public.woods
  for each row execute function public.set_updated_at();
