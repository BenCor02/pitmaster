-- ============================================================
-- Charbon & Flamme — Table articles (média BBQ)
-- Coller dans Supabase Dashboard > SQL Editor et exécuter
-- ============================================================

CREATE TABLE IF NOT EXISTS articles (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title           text        NOT NULL,
  slug            text        UNIQUE NOT NULL,
  excerpt         text,
  body            text,          -- Markdown
  cover_url       text,
  category        text,          -- ex: 'technique', 'recette', 'equipement', 'culture'
  tags            text[]      DEFAULT '{}',
  status          text        DEFAULT 'draft',   -- draft | published
  author_name     text        DEFAULT 'Charbon & Flamme',
  reading_time_min integer,
  ai_generated    boolean     DEFAULT false,
  show_newsletter_cta boolean DEFAULT true,
  linked_profile_ids text[]   DEFAULT '{}',     -- IDs vers cooking_profiles
  seo_title       text,
  seo_description text,
  published_at    timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS articles_updated_at ON articles;
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_articles_updated_at();

-- RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published" ON articles;
CREATE POLICY "Public read published"
  ON articles FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated full access" ON articles;
CREATE POLICY "Authenticated full access"
  ON articles FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles (slug);
CREATE INDEX IF NOT EXISTS articles_status_idx ON articles (status);
CREATE INDEX IF NOT EXISTS articles_category_idx ON articles (category);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON articles (published_at DESC);
