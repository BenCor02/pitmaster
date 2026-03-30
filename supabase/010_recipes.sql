-- ══════════════════════════════════════════════════════════════
-- 010 — Table recipes (rubs, mops, marinades)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS recipes (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title         text NOT NULL,
  slug          text UNIQUE NOT NULL,
  type          text NOT NULL CHECK (type IN ('rub', 'mop', 'marinade', 'injection', 'glaze')),
  summary       text,
  description   text,
  ingredients   jsonb NOT NULL DEFAULT '[]',
  steps         jsonb DEFAULT '[]',
  yield_amount  text,
  prep_time     text,
  meat_types    text[] DEFAULT '{}',
  origin        text,
  difficulty    text DEFAULT 'facile' CHECK (difficulty IN ('facile', 'moyen', 'avancé')),
  tags          text[] DEFAULT '{}',
  cover_url     text,
  status        text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order    integer DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipes_public_read"
  ON recipes FOR SELECT
  USING (status = 'published');

CREATE POLICY "recipes_admin_all"
  ON recipes FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'super_admin'))
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'super_admin'))
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_recipes_type ON recipes(type);
CREATE INDEX IF NOT EXISTS idx_recipes_status ON recipes(status);
CREATE INDEX IF NOT EXISTS idx_recipes_slug ON recipes(slug);
