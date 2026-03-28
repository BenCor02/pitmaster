begin;

create table if not exists public.seo_blocks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  block_type text not null check (block_type in ('bloc_recommendation_produit', 'bloc_guide', 'bloc_marque', 'bloc_conseil')),
  position text not null check (position in ('after_result', 'after_timeline', 'bottom_page', 'sidebar', 'after_intro', 'after_calculator')),
  page_slug text,
  meat_slug text,
  method_key text,
  title_secondary text,
  content text,
  image_url text,
  cta_text text,
  cta_link text,
  affiliate_link text,
  badge text,
  note text,
  icon text,
  settings_json jsonb not null default '{}'::jsonb,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.seo_block_products (
  id uuid primary key default gen_random_uuid(),
  seo_block_id uuid not null references public.seo_blocks(id) on delete cascade,
  name text not null,
  image_url text,
  affiliate_url text,
  description text,
  rating numeric(3,2),
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_seo_blocks_updated_at on public.seo_blocks;
create trigger set_seo_blocks_updated_at
before update on public.seo_blocks
for each row execute function public.set_updated_at();

drop trigger if exists set_seo_block_products_updated_at on public.seo_block_products;
create trigger set_seo_block_products_updated_at
before update on public.seo_block_products
for each row execute function public.set_updated_at();

alter table public.seo_blocks enable row level security;
alter table public.seo_block_products enable row level security;

drop policy if exists "seo_blocks_public_read" on public.seo_blocks;
create policy "seo_blocks_public_read" on public.seo_blocks
for select to anon, authenticated
using (is_active = true);

drop policy if exists "seo_block_products_public_read" on public.seo_block_products;
create policy "seo_block_products_public_read" on public.seo_block_products
for select to anon, authenticated
using (
  exists (
    select 1
    from public.seo_blocks b
    where b.id = seo_block_id
      and b.is_active = true
  )
);

drop policy if exists "seo_blocks_admin_write" on public.seo_blocks;
create policy "seo_blocks_admin_write" on public.seo_blocks
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin', 'editor'))
with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "seo_block_products_admin_write" on public.seo_block_products;
create policy "seo_block_products_admin_write" on public.seo_block_products
for all to authenticated
using (public.current_user_role() in ('super_admin', 'admin', 'editor'))
with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

commit;
