/**
 * Charbon & Flamme v3 — Cards éditoriales
 *
 * RecipeCard, FeaturedRecipe, MethodCard, StepCard.
 */

import React from 'react'
import { FireButton, SectionEyebrow, EmberGlow } from './Primitives.jsx'
import { StampBadge, MethodBadge } from './StampBadge.jsx'

// ───────────────────────────────────────────────
// RecipeCard — carte recette/article (compact ou portrait)
// ───────────────────────────────────────────────
export function RecipeCard({ image, category, title, time, difficulty, sponsor, compact, onClick }) {
  return (
    <article
      onClick={onClick}
      style={{
        background: '#FAF6EE',
        border: '1px solid rgba(31,26,20,0.08)',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform .2s, box-shadow .2s',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: compact ? '4/3' : '3/4',
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {category && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              background: '#1F1A14',
              color: '#F5EFE0',
              fontFamily: 'var(--cf-mono)',
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '4px 8px',
            }}
          >
            {category}
          </div>
        )}
        {sponsor && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: '#E8A53C',
              color: '#1F1A14',
              fontFamily: 'var(--cf-mono)',
              fontSize: 9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '4px 6px',
              fontWeight: 600,
            }}
          >
            ★ Sponsor
          </div>
        )}
      </div>
      <div style={{ padding: compact ? 14 : 18, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <h3
          style={{
            fontSize: compact ? 18 : 22,
            lineHeight: 1.05,
            fontWeight: 600,
            textTransform: 'uppercase',
            fontFamily: 'var(--cf-serif)',
            margin: 0,
            color: '#1F1A14',
          }}
        >
          {title}
        </h3>
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            gap: 12,
            fontFamily: 'var(--cf-mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            color: '#6E6356',
            textTransform: 'uppercase',
          }}
        >
          {time && <span>⏱ {time}</span>}
          {difficulty && <span>· {difficulty}</span>}
        </div>
      </div>
    </article>
  )
}

// ───────────────────────────────────────────────
// FeaturedRecipe — bannière "à la une"
// ───────────────────────────────────────────────
export function FeaturedRecipe({ image, eyebrow, title, dek, meta = [], mobile, onClick }) {
  return (
    <article
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : '1.2fr 1fr',
        background: '#FAF6EE',
        border: '1px solid rgba(31,26,20,0.1)',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: mobile ? 240 : 380,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            background: '#8B1A1A',
            color: '#F5EFE0',
            fontFamily: 'var(--cf-mono)',
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            padding: '6px 10px',
            fontWeight: 600,
          }}
        >
          ★ À LA UNE
        </div>
      </div>
      <div
        style={{
          padding: mobile ? 24 : 40,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 14,
        }}
      >
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
        <h2
          style={{
            fontSize: mobile ? 32 : 44,
            lineHeight: 1.0,
            textTransform: 'uppercase',
            fontWeight: 600,
            fontFamily: 'var(--cf-serif)',
            color: '#1F1A14',
            margin: 0,
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: mobile ? 14 : 16, lineHeight: 1.55, color: '#3A3025', margin: 0 }}>{dek}</p>
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 8,
            fontFamily: 'var(--cf-mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            color: '#6E6356',
            textTransform: 'uppercase',
            flexWrap: 'wrap',
          }}
        >
          {meta.map((m, i) => (
            <span key={i}>
              {i > 0 && '· '}
              {m}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <FireButton size="md">Lire l'article</FireButton>
        </div>
      </div>
    </article>
  )
}

// ───────────────────────────────────────────────
// MethodCard — grande tile méthode pitmaster
// ───────────────────────────────────────────────
export function MethodCard({ method, title, subtitle, range, image, mobile, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        background: '#1F1A14',
        color: '#F5EFE0',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        minHeight: mobile ? 320 : 440,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(to top, rgba(20,16,11,0.95) 0%, rgba(20,16,11,0.6) 50%, rgba(20,16,11,0.3) 100%), url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <EmberGlow count={8} />
      <div
        style={{
          position: 'relative',
          padding: mobile ? 20 : 28,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flex: 1,
        }}
      >
        <div style={{ marginBottom: 'auto' }}>
          <MethodBadge method={method} size={mobile ? 88 : 110} />
        </div>
        <div>
          <div className="cf-eyebrow" style={{ color: '#E8A53C', marginBottom: 6 }}>
            Méthode {method === 'low' ? '01' : method === 'hot' ? '02' : '03'}
          </div>
          <h3
            style={{
              fontSize: mobile ? 30 : 40,
              lineHeight: 1,
              textTransform: 'uppercase',
              fontWeight: 700,
              color: '#F5EFE0',
              marginBottom: 8,
              fontFamily: 'var(--cf-serif)',
              margin: 0,
            }}
          >
            {title}
          </h3>
          <p style={{ fontSize: mobile ? 13 : 14, lineHeight: 1.5, color: '#B8AC97', marginBottom: 14, marginTop: 8 }}>
            {subtitle}
          </p>
          <div
            style={{
              fontFamily: 'var(--cf-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              color: '#E8A53C',
              textTransform: 'uppercase',
            }}
          >
            {range}
          </div>
        </div>
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────
// StepCard — carte étape numérotée (cercle + tampon)
// ───────────────────────────────────────────────
export function StepCard({ num, title, body, badge = '★' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            border: '1.5px solid #1F1A14',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--cf-serif)',
            fontSize: 28,
            fontWeight: 700,
            color: '#8B1A1A',
            flexShrink: 0,
          }}
        >
          {num}
        </div>
        <StampBadge size={56} topText="ÉTAPE" bottomText="·" center={badge} accent="#8B1A1A" />
      </div>
      <h3
        style={{
          fontSize: 22,
          lineHeight: 1.05,
          textTransform: 'uppercase',
          fontWeight: 600,
          fontFamily: 'var(--cf-serif)',
          color: '#1F1A14',
          margin: 0,
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: '#3A3025', margin: 0 }}>{body}</p>
    </div>
  )
}
