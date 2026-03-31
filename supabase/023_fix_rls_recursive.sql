-- ============================================================
-- 023 — Corriger le RLS récursif sur profiles
--
-- Problème : les policies admin font un SELECT sur profiles
-- qui est elle-même protégée par RLS → boucle récursive.
-- Le profil ne se charge plus → isAdmin = false → admin cassé.
--
-- Solution : créer une fonction SECURITY DEFINER qui bypass RLS
-- pour vérifier le rôle admin, puis l'utiliser dans les policies.
-- ============================================================

-- 1. Fonction sécurisée pour vérifier le rôle admin (bypass RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  )
$$;

-- Restreindre l'accès à la fonction
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 2. Recréer les policies SELECT sur profiles (sans récursion)
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;

-- Chaque user lit son propre profil
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Les admins lisent tous les profils (via la fonction SECURITY DEFINER)
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

-- 3. Recréer les policies UPDATE (même fix)
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;

-- L'user update son profil sauf le champ role
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select p.role from public.profiles p where p.id = auth.uid()));

-- Les admins peuvent update tous les profils
create policy "profiles_update_admin" on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- 4. S'assurer que wood_guide est activé dans site_settings
-- (au cas où il aurait été désactivé par erreur)
update public.site_settings
set value = jsonb_set(
  coalesce(value, '{}'::jsonb),
  '{wood_guide}',
  'true'::jsonb
)
where key = 'modules' and (value->>'wood_guide') = 'false';
