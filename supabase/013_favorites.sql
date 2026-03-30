-- ══════════════════════════════════════════════════════════════
-- 013 — Table favoris (Mon Carnet)
-- ══════════════════════════════════════════════════════════════

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, recipe_id)
);

alter table public.favorites enable row level security;

-- Chaque user ne voit que ses favoris
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);

create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

create index idx_favorites_user on public.favorites(user_id);
create index idx_favorites_recipe on public.favorites(recipe_id);
