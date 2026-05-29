'use client'

import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'next/navigation'
import { fetchGuideBySlug, fetchGuides } from '../lib/cms.js'
import { renderMarkdown } from '../lib/markdown.js'
import { updateMeta, articleSchema, injectJsonLd } from '../lib/seo.js'
import GuideCard from '../components/content/GuideCard.jsx'
import { CFHeader, CFFooter } from '../components/cf/Chrome.jsx'
import { FireButton, SectionEyebrow } from '../components/cf/Primitives.jsx'

function useMobile() {
  const [mobile, setMobile] = React.useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  )
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => setMobile(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])
  return mobile
}

export default function GuidePage() {
  const mobile = useMobile()
  const { slug } = useParams()
  const [guide, setGuide] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setNotFound(false)

      const data = await fetchGuideBySlug(slug)
      if (cancelled) return

      if (!data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setGuide(data)

      // SEO
      updateMeta({
        title: data.seo_title || data.title,
        description: data.seo_description || data.summary,
        canonical: `https://charbonetflamme.fr/guides/${data.slug}`,
      })
      injectJsonLd('article-schema', articleSchema(data))

      // Related guides
      const all = await fetchGuides({ meatType: data.meat_type, limit: 4 })
      if (!cancelled) {
        setRelated(all.filter(g => g.id !== data.id).slice(0, 2))
      }

      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
      injectJsonLd('article-schema', null)
    }
  }, [slug])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#8B1A1A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span style={{ fontSize: 20 }}>📚</span>
          </div>
          <p style={{ color: '#6E6356', fontSize: 14, fontFamily: 'var(--cf-sans)' }}>Chargement du guide...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 48, fontWeight: 700, color: '#1F1A14', marginBottom: 8 }}>404</p>
          <p style={{ color: '#6E6356', fontSize: 14, marginBottom: 24 }}>Ce guide n'existe pas ou n'est plus disponible.</p>
          <FireButton as={Link} to="/guides" size="sm">Voir tous les guides</FireButton>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14' }}>
      <CFHeader />

      {/* Hero */}
      {guide.cover_url && (
        <div style={{ position: 'relative', height: mobile ? 180 : 260, overflow: 'hidden' }}>
          <img src={guide.cover_url} alt={guide.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(31,26,20,0.55) 0%, rgba(31,26,20,0.25) 50%, transparent 100%)' }} />
        </div>
      )}

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: mobile ? '32px 16px' : '48px 48px' }}>
        <div style={{ maxWidth: 768, margin: '0 auto' }}>

          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6E6356', marginBottom: 24 }}>
            <Link href="/" style={{ color: '#8B1A1A', textDecoration: 'none' }}>Accueil</Link>
            <span style={{ color: 'rgba(31,26,20,0.35)' }}>/</span>
            <Link href="/guides" style={{ color: '#8B1A1A', textDecoration: 'none' }}>Guides</Link>
            <span style={{ color: 'rgba(31,26,20,0.35)' }}>/</span>
            <span style={{ color: '#6E6356' }}>{guide.title}</span>
          </nav>

          {/* Header */}
          <header style={{ marginBottom: 32 }}>
            {guide.category && (
              <SectionEyebrow accent="#8B1A1A">{guide.category}</SectionEyebrow>
            )}
            <h1 style={{
              fontFamily: 'var(--cf-serif)',
              fontSize: mobile ? 28 : 38,
              fontWeight: 700,
              color: '#1F1A14',
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
              margin: '12px 0 12px',
            }}>
              {guide.title}
            </h1>
            {guide.summary && (
              <p style={{ fontSize: 16, color: '#6E6356', lineHeight: 1.65, maxWidth: 580 }}>{guide.summary}</p>
            )}
            {guide.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {guide.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 11,
                    fontFamily: 'var(--cf-mono)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#6E6356',
                    background: '#F5EFE0',
                    border: '1px solid rgba(31,26,20,0.15)',
                    padding: '4px 10px',
                    borderRadius: 2,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <article
            className="prose-cf"
            style={{ color: '#1F1A14' }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(guide.content) }}
          />

          {/* CTA calculateur */}
          <div style={{
            marginTop: 40,
            background: '#F5EFE0',
            border: '1px solid rgba(31,26,20,0.15)',
            borderRadius: 4,
            padding: 28,
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 14, color: '#6E6356', marginBottom: 16 }}>Prêt à planifier ta cuisson ?</p>
            <FireButton as={Link} to="/calculateur" size="md">
              <span>🔥</span>
              Lancer le calculateur
            </FireButton>
          </div>

          {/* Related guides */}
          {related.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <h2 style={{
                fontFamily: 'var(--cf-serif)',
                fontSize: 18,
                fontWeight: 700,
                color: '#1F1A14',
                marginBottom: 16,
              }}>Guides complémentaires</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)',
                gap: 16,
              }}>
                {related.map(g => (
                  <div key={g.id} style={{ background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.15)', borderRadius: 4, overflow: 'hidden' }}>
                    <GuideCard guide={g} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <CFFooter mobile={mobile} />
    </div>
  )
}
