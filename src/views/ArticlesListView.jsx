/**
 * ArticlesListView — Page liste des articles (CF v3, light)
 * Composant serveur : pas de 'use client', rendu statique
 */

import Link from 'next/link'
import { categoryLabel, categoryEmoji, ARTICLE_CATEGORIES } from '../lib/articles.js'

const C = {
  bg: '#FAF6EE', card: '#F0EBE1', cardBorder: 'rgba(31,26,20,0.10)',
  text: '#1F1A14', muted: '#6E6356', red: '#8B1A1A', gold: '#E8A53C',
  borderLight: 'rgba(31,26,20,0.08)',
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function ArticleCard({ article, featured = false }) {
  return (
    <Link href={`/articles/${article.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className={featured ? 'al-featured-card' : ''}
        style={{
          background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 4,
          overflow: 'hidden', transition: 'border-color 0.15s',
          height: '100%', display: 'flex', flexDirection: featured ? 'row' : 'column',
        }}
      >
        {/* Cover */}
        {article.coverUrl && (
          <div
            className={featured ? 'al-featured-img' : ''}
            style={{
              flexShrink: 0,
              width: featured ? '45%' : '100%',
              aspectRatio: featured ? 'auto' : '16/9',
              minHeight: featured ? 260 : 'auto',
              background: `url(${article.coverUrl}) center/cover no-repeat, #E8DECE`,
            }}
          />
        )}
        {!article.coverUrl && (
          <div
            className={featured ? 'al-featured-img' : ''}
            style={{
              flexShrink: 0,
              width: featured ? '45%' : '100%',
              height: featured ? 'auto' : 180,
              minHeight: featured ? 260 : 180,
              background: `linear-gradient(135deg, #8B1A1A 0%, #C8801A 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: featured ? 64 : 48,
            }}
          >
            {categoryEmoji(article.category)}
          </div>
        )}

        {/* Content */}
        <div
          className={featured ? 'al-featured-content' : ''}
          style={{ padding: featured ? '28px 32px' : '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {/* Category + time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {article.category && (
              <span style={{ fontFamily: 'var(--cf-mono)', fontSize: 10, fontWeight: 700, color: C.red, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                {categoryLabel(article.category)}
              </span>
            )}
            {article.reading_time_min && (
              <span style={{ fontSize: 10, color: C.muted }}>· {article.reading_time_min} min</span>
            )}
            {article.ai_generated && (
              <span style={{ fontSize: 9, fontFamily: 'var(--cf-mono)', color: C.gold, background: 'rgba(232,165,60,0.12)', padding: '2px 6px', borderRadius: 99 }}>IA</span>
            )}
          </div>

          {/* Title */}
          <h2
            className={featured ? 'al-featured-title' : ''}
            style={{
              fontFamily: 'var(--cf-serif)', fontWeight: 800, color: C.text, margin: 0,
              textTransform: 'uppercase', lineHeight: 1.1,
              fontSize: featured ? 32 : 18,
            }}
          >
            {article.title}
          </h2>

          {/* Excerpt */}
          {article.excerpt && (
            <p style={{ fontSize: featured ? 15 : 13, color: C.muted, lineHeight: 1.6, margin: 0, flex: 1 }}>
              {article.excerpt}
            </p>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: C.muted }}>{formatDate(article.published_at)}</span>
            <span style={{ fontFamily: 'var(--cf-mono)', fontSize: 11, fontWeight: 700, color: C.red }}>
              Lire →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ArticlesListView({ articles, categories, activeCategory }) {
  const featured = articles[0]
  const rest = articles.slice(1)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <style>{`
        .al-hero { padding: 56px 0 40px; }
        .al-hero h1 { font-size: 48px; }
        .al-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 40px; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
        .al-featured-card { flex-direction: row; }
        .al-featured-img { width: 45%; min-height: 260px; }
        .al-featured-content { padding: 28px 32px; }
        .al-featured-title { font-size: 32px; }
        .al-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        @media (max-width: 700px) {
          .al-hero { padding: 32px 0 28px; }
          .al-hero h1 { font-size: 30px; }
          .al-hero p { font-size: 14px; }
          .al-filters { flex-wrap: nowrap; margin-bottom: 28px; }
          .al-featured-card { flex-direction: column !important; }
          .al-featured-img { width: 100% !important; min-height: 200px !important; aspect-ratio: 16/9; }
          .al-featured-content { padding: 16px !important; }
          .al-featured-title { font-size: 22px !important; }
          .al-grid { grid-template-columns: 1fr; gap: 14px; }
        }
      `}</style>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 80px' }}>

        {/* Hero */}
        <div className="al-hero" style={{ borderBottom: `1px solid ${C.borderLight}`, marginBottom: 40 }}>
          <p style={{ fontFamily: 'var(--cf-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.red, marginBottom: 12 }}>
            Le mag BBQ
          </p>
          <h1 className="al-hero" style={{ fontFamily: 'var(--cf-serif)', fontWeight: 800, lineHeight: 1, textTransform: 'uppercase', color: C.text, margin: '0 0 16px' }}>
            Articles & Techniques
          </h1>
          <p className="al-hero" style={{ color: C.muted, lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
            Guides, science du BBQ, comparatifs d'équipement et culture du fumage — tout ce qu'il faut pour maîtriser le feu.
          </p>
        </div>

        {/* Category filter */}
        <div className="al-filters">
          <Link href="/articles" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'var(--cf-mono)', fontSize: 11, fontWeight: 700,
              padding: '7px 14px', borderRadius: 99, cursor: 'pointer',
              border: !activeCategory ? `2px solid ${C.red}` : `2px solid ${C.cardBorder}`,
              background: !activeCategory ? C.red : 'transparent',
              color: !activeCategory ? '#FAF6EE' : C.muted,
            }}>
              Tous
            </span>
          </Link>
          {(categories || ARTICLE_CATEGORIES).map(cat => {
            const val = cat.value || cat.name
            const label = cat.label || categoryLabel(val)
            const active = activeCategory === val
            return (
              <Link key={val} href={`/articles?category=${val}`} style={{ textDecoration: 'none' }}>
                <span style={{
                  fontFamily: 'var(--cf-mono)', fontSize: 11, fontWeight: 700,
                  padding: '7px 14px', borderRadius: 99, cursor: 'pointer',
                  border: active ? `2px solid ${C.red}` : `2px solid ${C.cardBorder}`,
                  background: active ? C.red : 'transparent',
                  color: active ? '#FAF6EE' : C.muted,
                }}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Empty state */}
        {articles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔥</div>
            <p style={{ fontSize: 16 }}>Les articles arrivent bientôt.</p>
          </div>
        )}

        {/* Featured article */}
        {featured && (
          <div style={{ marginBottom: 40 }}>
            <ArticleCard article={featured} featured />
          </div>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="al-grid">
            {rest.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        )}
      </main>
    </div>
  )
}
