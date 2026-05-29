'use client'

import React, { useState, useEffect } from 'react'
import { sanityClient } from '../lib/sanity.js'
import { updateMeta } from '../lib/seo.js'
import GuideCard from '../components/content/GuideCard.jsx'
import { CFHeader, CFFooter, NewsletterBlock } from '../components/cf/Chrome.jsx'
import { SectionEyebrow } from '../components/cf/Primitives.jsx'

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

export default function GuidesListPage() {
  const mobile = useMobile()
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updateMeta({
      title: 'Guides BBQ & Fumage',
      description: 'Guides pratiques pour maîtriser le barbecue low & slow, le reverse sear, le stall, le wrap et toutes les techniques de pitmaster.',
    })

    sanityClient
      .fetch(`*[_type == "guide" && status == "published"] | order(publishedAt desc) {
        _id,
        title,
        "slug": slug.current,
        summary,
        "coverUrl": coalesce(coverImage.asset->url, coverUrl),
        category,
        meatType,
        tags
      }`)
      .then(data => {
        setGuides(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6E6356', fontSize: 14 }}>Chargement...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14' }}>
      <CFHeader />

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', height: mobile ? 200 : 280 }}>
        <img
          src="https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1400&h=400&fit=crop&q=80"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(31,26,20,0.72) 0%, rgba(31,26,20,0.45) 60%, rgba(31,26,20,0.15) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: mobile ? '0 20px' : '0 64px' }}>
          <SectionEyebrow accent="#E8A53C">Guides Pitmaster</SectionEyebrow>
          <h1 style={{
            fontFamily: 'var(--cf-serif)',
            fontSize: mobile ? 30 : 42,
            fontWeight: 700,
            color: '#F5EFE0',
            margin: '12px 0 8px',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}>
            Guides BBQ & Fumage
          </h1>
          <p style={{ color: 'rgba(245,239,224,0.75)', fontSize: mobile ? 13 : 15, maxWidth: 480, lineHeight: 1.6 }}>
            Tout ce qu'il faut savoir pour maîtriser la cuisson au fumoir. Des techniques aux astuces terrain.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: mobile ? '32px 16px' : '48px 48px' }}>
        {guides.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <p style={{ color: '#6E6356', fontSize: 14 }}>Aucun guide disponible pour le moment.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 20,
          }}>
            {guides.map(guide => (
              <div
                key={guide._id}
                style={{
                  background: '#F5EFE0',
                  border: '1px solid rgba(31,26,20,0.15)',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <GuideCard guide={guide} />
              </div>
            ))}
          </div>
        )}
      </main>

      <NewsletterBlock mobile={mobile} />
      <CFFooter mobile={mobile} />
    </div>
  )
}
