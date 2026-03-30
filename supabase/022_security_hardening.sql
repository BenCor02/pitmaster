-- ============================================================
-- 022 — Hardening sécurité pré-lancement
-- ============================================================

-- 1. shared_cooks : ajouter UPDATE policy (manquante)
create policy "shared_cooks_update_own" on public.shared_cooks
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. affiliate_tools : contraindre les URLs à http/https
alter table public.affiliate_tools
  add constraint affiliate_url_protocol
  check (affiliate_url ~ '^https?://');

-- 3. guides : contraindre cover_url si non null
alter table public.guides
  add constraint cover_url_protocol
  check (cover_url is null or cover_url ~ '^https?://');

-- 4. profiles : contraindre avatar_url si non null
alter table public.profiles
  add constraint avatar_url_protocol
  check (avatar_url is null or avatar_url ~ '^https?://');
