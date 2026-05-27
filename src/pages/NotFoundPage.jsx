import React from 'react'
import { Link } from 'react-router-dom'
import { CFHeader } from '../components/cf/Chrome.jsx'
import { FireButton } from '../components/cf/Primitives.jsx'

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14' }}>
      <CFHeader />
      <main
        style={{
          minHeight: 'calc(100vh - 65px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          {/* Big 404 */}
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <span
              style={{
                fontSize: 'clamp(120px, 20vw, 180px)',
                fontFamily: 'var(--cf-serif)',
                fontWeight: 900,
                color: 'rgba(31,26,20,0.06)',
                lineHeight: 1,
                display: 'block',
                userSelect: 'none',
              }}
            >
              404
            </span>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 16,
                  background: '#8B1A1A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px -4px rgba(139,26,26,0.4)',
                }}
              >
                <span style={{ fontSize: 32 }}>🔥</span>
              </div>
            </div>
          </div>

          <h1
            style={{
              fontFamily: 'var(--cf-serif)',
              fontSize: 'clamp(22px, 4vw, 30px)',
              fontWeight: 800,
              color: '#1F1A14',
              marginBottom: 12,
              letterSpacing: '-0.01em',
            }}
          >
            Cette page a{' '}
            <span style={{ color: '#8B1A1A' }}>brûlé.</span>
          </h1>

          <p
            style={{
              fontSize: 14,
              color: '#6E6356',
              lineHeight: 1.65,
              marginBottom: 32,
              maxWidth: 360,
              margin: '0 auto 32px',
            }}
          >
            On dirait que le feu a été un peu trop fort par ici. La page que tu cherches n'existe pas ou a été déplacée.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <FireButton
              as={Link}
              to="/"
              type="primary"
              size="md"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              }
            >
              Retour au calculateur
            </FireButton>
            <FireButton
              as={Link}
              to="/recettes"
              type="ghost"
              size="md"
            >
              🧂 Explorer les recettes
            </FireButton>
          </div>

          <p
            style={{
              fontFamily: 'var(--cf-mono)',
              fontSize: 11,
              color: 'rgba(31,26,20,0.35)',
              marginTop: 48,
              fontStyle: 'italic',
              letterSpacing: '0.02em',
            }}
          >
            "Si tu ne trouves pas la viande, retourne au feu." — Sagesse de pitmaster
          </p>
        </div>
      </main>
    </div>
  )
}
