-- ══════════════════════════════════════════════════════════════
-- 014 — Cuissons partagées (liens publics)
-- ══════════════════════════════════════════════════════════════

create table public.shared_cooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  share_code text not null unique default encode(gen_random_bytes(6), 'hex'),
  -- Données du calcul (snapshot au moment du partage)
  meat_name text not null,
  weight_kg numeric not null,
  cook_temp_c integer not null,
  wrapped boolean not null default false,
  doneness text,
  rub_name text,
  -- Résultats
  total_estimate text not null,
  cook_minutes integer not null,
  rest_estimate text,
  phases jsonb not null default '[]'::jsonb,
  tips jsonb not null default '[]'::jsonb,
  -- Méta
  user_display_name text,
  created_at timestamptz not null default now()
);

alter table public.shared_cooks enable row level security;

-- Tout le monde peut lire une cuisson partagée (c'est le but)
create policy "shared_cooks_select_public" on public.shared_cooks
  for select using (true);

-- Seul le propriétaire peut créer
create policy "shared_cooks_insert_own" on public.shared_cooks
  for insert with check (auth.uid() = user_id);

-- Seul le propriétaire peut supprimer
create policy "shared_cooks_delete_own" on public.shared_cooks
  for delete using (auth.uid() = user_id);

create index idx_shared_cooks_code on public.shared_cooks(share_code);
create index idx_shared_cooks_user on public.shared_cooks(user_id);
