-- ============================================================
-- CHARBON & FLAMME v2 — CMS / Contenu / Affiliation
-- Migration 003 : Tables pour blocs SEO, guides, FAQ, affiliation
-- ============================================================

-- ── 1. SEO BLOCKS ──────────────────────────────────────────
-- Blocs de contenu éditorial contextuels (affichés sous le calculateur)
create table public.seo_blocks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text not null,                -- markdown
  meat_type text,                       -- ex: 'brisket', 'pulled_pork', null = global
  cooking_method text,                  -- 'low_and_slow', 'reverse_sear', null = tous
  is_global boolean not null default false,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.seo_blocks enable row level security;

create policy "seo_blocks_public_read" on public.seo_blocks
  for select using (status = 'published');

create policy "seo_blocks_admin_all" on public.seo_blocks
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create trigger seo_blocks_updated_at
  before update on public.seo_blocks
  for each row execute function public.set_updated_at();


-- ── 2. GUIDES ──────────────────────────────────────────────
-- Articles / guides pédagogiques complets
create table public.guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  summary text,                         -- résumé court pour cards
  content text not null,                -- markdown complet
  cover_url text,                       -- image de couverture
  category text,                        -- 'technique', 'viande', 'equipement'
  tags text[] default '{}',             -- ex: {'brisket', 'stall', 'wrap'}
  meat_type text,                       -- ciblage contextuel optionnel
  seo_title text,
  seo_description text,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.guides enable row level security;

create policy "guides_public_read" on public.guides
  for select using (status = 'published');

create policy "guides_admin_all" on public.guides
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create trigger guides_updated_at
  before update on public.guides
  for each row execute function public.set_updated_at();


-- ── 3. FAQ ─────────────────────────────────────────────────
-- Questions/réponses contextuelles
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,                 -- markdown
  meat_type text,                       -- ciblage
  cooking_method text,
  is_global boolean not null default false,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.faqs enable row level security;

create policy "faqs_public_read" on public.faqs
  for select using (status = 'published');

create policy "faqs_admin_all" on public.faqs
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create trigger faqs_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();


-- ── 4. AFFILIATE TOOLS ────────────────────────────────────
-- Produits / outils recommandés avec liens d'affiliation
create table public.affiliate_tools (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  image_url text,
  affiliate_url text not null,
  cta_text text not null default 'Voir le produit',
  badge text,                           -- 'Essentiel', 'Recommandé', 'Pro', null
  product_type text,                    -- 'thermometre', 'fumoir', 'accessoire', 'couteau'
  meat_type text,                       -- ciblage par viande
  is_global boolean not null default false,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.affiliate_tools enable row level security;

create policy "affiliate_tools_public_read" on public.affiliate_tools
  for select using (status = 'published');

create policy "affiliate_tools_admin_all" on public.affiliate_tools
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create trigger affiliate_tools_updated_at
  before update on public.affiliate_tools
  for each row execute function public.set_updated_at();


-- ── 5. INDEX ───────────────────────────────────────────────
create index idx_seo_blocks_meat on public.seo_blocks(meat_type) where status = 'published';
create index idx_seo_blocks_global on public.seo_blocks(is_global) where status = 'published';
create index idx_guides_slug on public.guides(slug) where status = 'published';
create index idx_guides_meat on public.guides(meat_type) where status = 'published';
create index idx_guides_tags on public.guides using gin(tags) where status = 'published';
create index idx_faqs_meat on public.faqs(meat_type) where status = 'published';
create index idx_faqs_global on public.faqs(is_global) where status = 'published';
create index idx_affiliate_meat on public.affiliate_tools(meat_type) where status = 'published';
create index idx_affiliate_global on public.affiliate_tools(is_global) where status = 'published';
