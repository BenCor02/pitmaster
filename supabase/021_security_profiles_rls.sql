-- ============================================================
-- 021 — Restreindre la lecture des profils (RLS)
-- Avant : using (true) → tout le monde voit emails + rôles
-- Après : chaque user ne voit que son propre profil (+ admins voient tout)
-- ============================================================

drop policy if exists "profiles_select" on public.profiles;

-- Chaque utilisateur ne peut lire que son propre profil
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Les admins peuvent lire tous les profils
create policy "profiles_select_admin" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );
