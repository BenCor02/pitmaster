'use client'

import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'next/navigation'
import { fetchSharedCook } from '../lib/sharedCooks.js'
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

const cardStyle = {
  background: '#F5EFE0',
  border: '1px solid rgba(31,26,20,0.15)',
  borderRadius: 12,
  padding: '20px',
}

export default function SharedCookPage() {
  const { code } = useParams()
  const [cook, setCook] = useState(null)
  const [loading, setLoading] = useState(true)
  const mobile = useMobile()

  useEffect(() => {
    fetchSharedCook(code).then(data => { setCook(data); setLoading(false) })
  }, [code])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14' }}>
        <CFHeader />
        <div
          style={{
            minHeight: 'calc(100vh - 65px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: '#8B1A1A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <span style={{ fontSize: 22 }}>🔥</span>
            </div>
            <p style={{ color: '#6E6356', fontSize: 14 }}>Chargement du plan...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!cook) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14' }}>
        <CFHeader />
        <div
          style={{
            minHeight: 'calc(100vh - 65px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 16 }}>😕</span>
            <p style={{ color: '#6E6356', fontSize: 15, marginBottom: 20 }}>
              Ce lien de partage n'existe pas ou a expiré
            </p>
            <FireButton as={Link} to="/calculateur" type="primary" size="sm">
              Retour au calculateur
            </FireButton>
          </div>
        </div>
      </div>
    )
  }

  const phases = typeof cook.phases === 'string' ? JSON.parse(cook.phases) : cook.phases
  const tips = typeof cook.tips === 'string' ? JSON.parse(cook.tips) : cook.tips
  const shareUrl = window.location.href

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14' }}>
      <CFHeader />
      <main>
        {/* Hero */}
        <div
          style={{
            borderBottom: '1px solid rgba(31,26,20,0.15)',
            padding: mobile ? '32px 20px' : '48px 64px',
            background: '#F5EFE0',
          }}
        >
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {cook.user_display_name && (
              <p style={{ fontSize: 12, color: '#6E6356', marginBottom: 10 }}>
                Partagé par{' '}
                <span style={{ color: '#8B1A1A', fontWeight: 700 }}>{cook.user_display_name}</span>
              </p>
            )}
            <h1
              style={{
                fontFamily: 'var(--cf-serif)',
                fontSize: mobile ? 28 : 38,
                fontWeight: 800,
                color: '#1F1A14',
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              {cook.meat_name}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              <span
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: '#FFFFFF',
                  border: '1px solid rgba(31,26,20,0.15)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1F1A14',
                }}
              >
                {cook.weight_kg} kg
              </span>
              <span
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: '#FFFFFF',
                  border: '1px solid rgba(31,26,20,0.15)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1F1A14',
                }}
              >
                {cook.cook_temp_c}°C
              </span>
              {cook.wrapped && (
                <span
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: 'rgba(139,26,26,0.08)',
                    border: '1px solid rgba(139,26,26,0.2)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#8B1A1A',
                  }}
                >
                  Wrapped
                </span>
              )}
              {cook.rub_name && (
                <span
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: 'rgba(232,165,60,0.1)',
                    border: '1px solid rgba(232,165,60,0.25)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#B07820',
                  }}
                >
                  🧂 {cook.rub_name}
                </span>
              )}
            </div>

            {/* Estimation totale */}
            <div
              style={{
                padding: '20px 24px',
                borderRadius: 10,
                background: '#FFFFFF',
                border: '1.5px solid rgba(139,26,26,0.2)',
                borderLeft: '4px solid #8B1A1A',
              }}
            >
              <SectionEyebrow>Durée totale estimée</SectionEyebrow>
              <p
                style={{
                  fontFamily: 'var(--cf-serif)',
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#1F1A14',
                  marginTop: 8,
                  marginBottom: cook.rest_estimate ? 4 : 0,
                }}
              >
                {cook.total_estimate}
              </p>
              {cook.rest_estimate && (
                <p style={{ fontSize: 12, color: '#6E6356' }}>dont repos : {cook.rest_estimate}</p>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            padding: mobile ? '32px 20px 64px' : '48px 64px 80px',
          }}
        >
          {/* Phases */}
          {phases?.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontFamily: 'var(--cf-serif)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1F1A14',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <span>📋</span> Phases de cuisson
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {phases.map((phase, idx) => (
                  <div key={idx} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: '#8B1A1A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 900,
                          color: '#F5EFE0',
                          flexShrink: 0,
                          fontFamily: 'var(--cf-serif)',
                        }}
                      >
                        {phase.num || idx + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h3
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: '#1F1A14',
                              fontFamily: 'var(--cf-serif)',
                              margin: 0,
                            }}
                          >
                            {phase.title}
                          </h3>
                          {phase.duration && (
                            <span style={{ fontSize: 11, color: '#8B1A1A', fontWeight: 700 }}>
                              {phase.duration}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: '#6E6356', marginBottom: 8 }}>{phase.objective}</p>
                        {phase.markers?.map((m, i) => (
                          <p
                            key={i}
                            style={{
                              fontSize: 11,
                              color: '#6E6356',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              marginBottom: 4,
                            }}
                          >
                            <span
                              style={{
                                color: m.type === 'temp' ? '#8B1A1A' : m.type === 'visual' ? '#E8A53C' : '#6E6356',
                              }}
                            >
                              {m.type === 'temp' ? '🌡️' : m.type === 'visual' ? '👁️' : 'ℹ️'}
                            </span>
                            {m.text}
                          </p>
                        ))}
                        {phase.advice && (
                          <p style={{ fontSize: 11, color: '#6E6356', marginTop: 8, fontStyle: 'italic' }}>
                            💡 {phase.advice}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {tips?.length > 0 && (
            <div style={{ ...cardStyle, marginBottom: 32 }}>
              <h2
                style={{
                  fontFamily: 'var(--cf-serif)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1F1A14',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <span>🎯</span> Conseils pitmaster
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tips.map((tip, idx) => (
                  <p
                    key={idx}
                    style={{
                      fontSize: 13,
                      color: '#6E6356',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      margin: 0,
                    }}
                  >
                    <span style={{ color: '#8B1A1A', flexShrink: 0, marginTop: 2 }}>•</span>
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Share buttons */}
          <div style={cardStyle}>
            <h2
              style={{
                fontFamily: 'var(--cf-serif)',
                fontSize: 16,
                fontWeight: 700,
                color: '#1F1A14',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <span>🔗</span> Partager ce plan
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                onClick={() => { navigator.clipboard.writeText(shareUrl) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: '#FFFFFF',
                  border: '1px solid rgba(31,26,20,0.15)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#1F1A14',
                  cursor: 'pointer',
                  fontFamily: 'var(--cf-sans)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copier le lien
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`J'ai planifié ma cuisson de ${cook.meat_name} (${cook.weight_kg}kg) sur Charbon & Flamme ! ${cook.total_estimate} de fumée`)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: 'rgba(14,165,233,0.08)',
                  border: '1px solid rgba(14,165,233,0.2)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#0284C7',
                  textDecoration: 'none',
                  fontFamily: 'var(--cf-sans)',
                }}
              >
                𝕏 Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#2563EB',
                  textDecoration: 'none',
                  fontFamily: 'var(--cf-sans)',
                }}
              >
                Facebook
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Ma cuisson ${cook.meat_name} planifiée sur Charbon & Flamme : ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#16A34A',
                  textDecoration: 'none',
                  fontFamily: 'var(--cf-sans)',
                }}
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <FireButton as={Link} to="/calculateur" type="primary" size="lg">
              Planifier ma propre cuisson
            </FireButton>
            <p
              style={{
                fontFamily: 'var(--cf-mono)',
                fontSize: 11,
                color: '#6E6356',
                marginTop: 12,
                letterSpacing: '0.04em',
              }}
            >
              charbonetflamme.fr — L'arsenal du pitmaster
            </p>
          </div>
        </div>
      </main>
      <CFFooter mobile={mobile} />
    </div>
  )
}
