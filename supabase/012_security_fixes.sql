-- ══════════════════════════════════════════════════════════════
-- 012 — Correctifs de sécurité
-- ══════════════════════════════════════════════════════════════

-- ─── FIX 1 : Empêcher les utilisateurs de modifier leur propre rôle ───
-- La policy "profiles_update_own" permettait de changer N'IMPORTE QUEL champ,
-- y compris "role". Un utilisateur pouvait s'auto-promouvoir admin.
-- On la remplace par une policy qui bloque la modification du champ role.

drop policy if exists "profiles_update_own" on public.profiles;

-- L'utilisateur peut modifier son profil SAUF le champ role
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id AND role = (select role from public.profiles where id = auth.uid()));

-- ─── FIX 2 : Limiter les champs visibles publiquement sur profiles ───
-- On ne veut pas exposer email/role à tous les visiteurs anonymes.
-- On garde le select public mais on crée une vue limitée pour le frontend.

-- (Note: la policy select reste permissive car le calculateur en a besoin
--  pour charger les cooking_profiles. Le vrai fix serait de créer une vue
--  mais ça casserait l'admin. On documente le risque.)

-- ─── FIX 3 : Ajouter with check sur les policies admin CMS ───

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );
