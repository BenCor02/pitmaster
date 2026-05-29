/**
 * ArticleDetailView — Page article complet (CF v3)
 * Composant serveur : rendu du markdown en HTML, structured data SEO
 */

import Link from 'next/link'
import { renderMarkdown } from '../lib/markdown.js'
import { categoryLabel, categoryEmoji } from '../lib/articles.js'

const C = {
  bg: '#FAF6EE', card: '#F0EBE1', cardBorder: 'rgba(31,26,20,0.10)',
  text: '#1F1A14', muted: '#6E6356', red: '#8B1A1A', gold: '#E8A53C',
  borderLight: 'rgba(31,26,20,0.08)',
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Bloc newsletter statique en bas de chaque article */
function NewsletterCta() {
  return (
    <div style={{
      background: C.red, borderRadius: 4, padding: '36px 40px',
      display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
      margin: '60px 0',
    }}>
      <div style={{ flex: 1, minWidth: 240 }}>
        <p style={{ fontFamily: 'var(--cf-mono)', fontSize: 10, fontWeight: 700, color: 'rgba(250,246,238,0.6)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>
          Newsletter pitmaster
        </p>
        <h3 style={{ fontFamily: 'var(--cf-serif)', fontSize: 28, fontWeight: 800, color: '#FAF6EE', textTransform: 'uppercase', lineHeight: 1, margin: '0 0 12px' }}>
          Les meilleures techniques<br />dans ta boîte mail.
        </h3>
        <p style={{ fontSize: 13, color: 'rgba(250,246,238,0.7)', margin: 0, lineHeight: 1.6 }}>
          Un email par semaine — guides, science BBQ, recettes exclusives. Zéro spam.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="email"
          placeholder="ton@email.fr"
          style={{
            padding: '12px 18px', borderRadius: 4, border: '1px solid rgba(250,246,238,0.3)',
            background: 'rgba(250,246,238,0.12)', color: '#FAF6EE', fontSize: 14,
            outline: 'none', minWidth: 220,
          }}
        />
        <button style={{
          padding: '12px 24px', borderRadius: 4, background: C.gold, border: 'none',
          color: '#1F1A14', fontFamily: 'var(--cf-serif)', fontSize: 14, fontWeight: 800,
          textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
        }}>
          S'inscrire
        </button>
      </div>
    </div>
  )
}

export default function ArticleDetailView({ article }) {
  const html = renderMarkdown(article.body || '')

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.seo_title || article.title,
    description: article.seo_description || article.excerpt,
    image: article.cover_url,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: { '@type': 'Person', name: article.author_name || 'Charbon & Flamme' },
    publisher: {
      '@type': 'Organization',
      name: 'Charbon & Flamme',
      logo: { '@type': 'ImageObject', url: 'https://charbonetflamme.fr/logo.png' }
    },
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Cover */}
      {article.cover_url ? (
        <div style={{
          width: '100%', height: 420, maxHeight: '50vh',
          background: `url(${article.cover_url}) center/cover no-repeat`,
        }} />
      ) : (
        <div style={{
          width: '100%', height: 280,
          background: `linear-gradient(135deg, #8B1A1A 0%, #C8801A 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 72,
        }}>
          {categoryEmoji(article.category)}
        </div>
      )}

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ padding: '24px 0 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/articles" style={{ fontSize: 12, color: C.muted, textDecoration: 'none', fontFamily: 'var(--cf-mono)' }}>
            ← Articles
          </Link>
          {article.category && (
            <>
              <span style={{ color: C.borderLight }}>·</span>
              <Link href={`/articles?category=${article.category}`} style={{ fontSize: 12, color: C.red, textDecoration: 'none', fontFamily: 'var(--cf-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {categoryLabel(article.category)}
              </Link>
            </>
          )}
        </div>

        {/* Header */}
        <header style={{ marginBottom: 40, paddingBottom: 32, borderBottom: `1px solid ${C.borderLight}` }}>
          <h1 style={{
            fontFamily: 'var(--cf-serif)', fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.05,
            color: C.text, margin: '0 0 20px',
          }}>
            {article.title}
          </h1>
          {article.excerpt && (
            <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.7, margin: '0 0 24px' }}>
              {article.excerpt}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>
              {article.author_name || 'Charbon & Flamme'}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: 99, background: C.muted, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: C.muted }}>{formatDate(article.published_at)}</span>
            {article.reading_time_min && (
              <>
                <span style={{ width: 3, height: 3, borderRadius: 99, background: C.muted, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: C.muted }}>{article.reading_time_min} min de lecture</span>
              </>
            )}
            {article.ai_generated && (
              <span style={{ fontSize: 10, fontFamily: 'var(--cf-mono)', fontWeight: 700, color: C.gold, background: 'rgba(232,165,60,0.12)', border: `1px solid rgba(232,165,60,0.3)`, padding: '3px 8px', borderRadius: 99 }}>
                Généré par IA
              </span>
            )}
          </div>
        </header>

        {/* Body */}
        <div
          className="article-prose"
          dangerouslySetInnerHTML={{ __html: html }}
          style={{
            fontSize: 16, lineHeight: 1.8, color: C.text,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        />

        {/* Newsletter CTA */}
        {article.show_newsletter_cta && <NewsletterCta />}

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 40, paddingTop: 32, borderTop: `1px solid ${C.borderLight}` }}>
            <span style={{ fontSize: 12, color: C.muted, marginRight: 4 }}>Tags :</span>
            {article.tags.map(tag => (
              <Link key={tag} href={`/articles?tag=${tag}`} style={{ textDecoration: 'none' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--cf-mono)', fontWeight: 700, color: C.muted, background: C.card, border: `1px solid ${C.cardBorder}`, padding: '4px 10px', borderRadius: 99 }}>
                  {tag}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Back link */}
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${C.borderLight}` }}>
          <Link href="/articles" style={{ fontFamily: 'var(--cf-mono)', fontSize: 12, fontWeight: 700, color: C.red, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            ← Retour aux articles
          </Link>
        </div>
      </main>
    </div>
  )
}
