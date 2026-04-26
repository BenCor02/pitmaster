/**
 * Charbon & Flamme v3 — Primitives
 *
 * Composants visuels partagés du nouveau design (light mode pitmaster).
 * Animations fumée/braises, boutons "tampon", icônes flammes/cuts, eyebrows.
 *
 * Usage : importer depuis '../components/cf/Primitives'.
 */

import React from 'react'

// ───────────────────────────────────────────────
// SmokeBackdrop — fumée animée discrète
// ───────────────────────────────────────────────
export function SmokeBackdrop({ intensity = 0.5, dark = false }) {
  const baseColor = dark ? 'rgba(220,210,195,' : 'rgba(255,245,230,'
  const wisps = React.useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        left: 5 + i * 12 + (i % 2) * 4,
        delay: -i * 1.4,
        duration: 7 + (i % 3),
        size: 60 + (i % 3) * 20,
        opacity: (0.25 + (i % 3) * 0.15) * intensity,
      })),
    [intensity]
  )
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {wisps.map((w, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            bottom: -40,
            left: `${w.left}%`,
            width: w.size,
            height: w.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${baseColor}${w.opacity}) 0%, ${baseColor}0) 70%)`,
            filter: 'blur(14px)',
            animation: `cfSmokeRise ${w.duration}s ease-out infinite`,
            animationDelay: `${w.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// ───────────────────────────────────────────────
// EmberGlow — particules de braises rougeoyantes
// ───────────────────────────────────────────────
export function EmberGlow({ count = 14 }) {
  const embers = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 37) % 100,
        top: (i * 53) % 100,
        size: 2 + (i % 3),
        delay: -i * 0.3,
        duration: 1.4 + (i % 4) * 0.4,
        color: i % 3 === 0 ? '#E8A53C' : i % 3 === 1 ? '#D9692F' : '#A52828',
      })),
    [count]
  )
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {embers.map((e, i) => (
        <div
          key={i}
          className="cf-ember-fast"
          style={{
            position: 'absolute',
            left: `${e.left}%`,
            top: `${e.top}%`,
            width: e.size,
            height: e.size,
            borderRadius: '50%',
            background: e.color,
            boxShadow: `0 0 ${e.size * 3}px ${e.color}`,
            animationDelay: `${e.delay}s`,
            animationDuration: `${e.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

// ───────────────────────────────────────────────
// MeatPlaceholder — gradient charbon + grill marks (fallback sans photo)
// ───────────────────────────────────────────────
export function MeatPlaceholder({ label, height = '100%', dark = true, accent = '#8B1A1A' }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        background: dark
          ? 'radial-gradient(ellipse 80% 60% at 50% 60%, #4A2818 0%, #2A1810 50%, #14100B 100%)'
          : `radial-gradient(ellipse at 35% 40%, ${accent} 0%, #6B1212 40%, #2A1810 90%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(125deg, transparent 0 38px, rgba(0,0,0,0.35) 38px 42px, transparent 42px 80px)',
          mixBlendMode: 'multiply',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(0,0,0,0.5) 1px, transparent 2px),
                           radial-gradient(circle at 70% 60%, rgba(0,0,0,0.4) 1px, transparent 2px),
                           radial-gradient(circle at 40% 80%, rgba(0,0,0,0.5) 1.5px, transparent 2px),
                           radial-gradient(circle at 85% 20%, rgba(0,0,0,0.45) 1px, transparent 2px)`,
          backgroundSize: '40px 40px, 60px 60px, 50px 50px, 70px 70px',
        }}
      />
      <div
        className="cf-ember-pulse"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '40%',
          background:
            'linear-gradient(to top, rgba(232,165,60,0.35), rgba(196,74,31,0.18) 40%, transparent)',
        }}
      />
      <EmberGlow count={10} />
      {label && (
        <div
          style={{
            position: 'absolute',
            left: 12,
            bottom: 10,
            fontFamily: 'var(--cf-mono)',
            fontSize: 10,
            color: 'rgba(255,240,220,0.55)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

// ───────────────────────────────────────────────
// FlameIcon — flamme stylisée pour badges
// ───────────────────────────────────────────────
export function FlameIcon({ variant = 'low', size = 40 }) {
  const flames = {
    low: [{ h: 0.6, c: '#8B1A1A' }],
    hot: [
      { h: 0.8, c: '#A52828' },
      { h: 0.6, c: '#D9692F' },
      { h: 0.4, c: '#E8A53C' },
    ],
    reverse: [
      { h: 0.7, c: '#8B1A1A' },
      { h: 0.5, c: '#E8A53C' },
    ],
  }[variant]
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} style={{ display: 'block', margin: 'auto' }}>
      {flames.map((f, i) => (
        <path
          key={i}
          d={`M 20 ${40 - f.h * 36}
              C ${15 - i * 2} ${28 - i * 4}, ${10 - i} ${22}, ${14 - i} ${14 + i * 2}
              C ${16 - i} ${10 + i}, ${20} ${4 + i * 4}, ${20} ${4 + i * 4}
              C ${20} ${4 + i * 4}, ${24 + i} ${10 + i}, ${26 + i} ${14 + i * 2}
              C ${30 + i} ${22}, ${25 + i * 2} ${28 - i * 4}, ${20} ${40 - f.h * 36} Z`}
          fill={f.c}
          opacity={1 - i * 0.15}
        />
      ))}
    </svg>
  )
}

// ───────────────────────────────────────────────
// CutIcon — silhouettes abstraites pour les cuts
// ───────────────────────────────────────────────
export function CutIcon({ cut, size = 64 }) {
  const shapes = {
    picanha: <path d="M 8 32 Q 20 14, 40 18 Q 56 22, 56 36 Q 50 48, 30 46 Q 12 44, 8 32 Z" fill="#8B1A1A" />,
    brisket: <path d="M 6 36 L 12 22 Q 30 14, 48 22 L 58 36 Q 50 46, 32 46 Q 14 46, 6 36 Z" fill="#6B1212" />,
    ribs: (
      <g>
        <rect x="10" y="22" width="44" height="6" rx="3" fill="#8B1A1A" />
        <rect x="10" y="32" width="44" height="6" rx="3" fill="#8B1A1A" />
        <rect x="10" y="42" width="44" height="6" rx="3" fill="#8B1A1A" />
      </g>
    ),
    poulet: <path d="M 24 12 Q 40 8, 48 20 Q 56 36, 44 50 Q 26 54, 14 42 Q 8 28, 16 18 Q 20 14, 24 12 Z" fill="#A52828" />,
    porc: <path d="M 12 22 Q 24 14, 40 18 Q 54 24, 52 38 Q 44 50, 26 48 Q 10 44, 12 22 Z" fill="#8B1A1A" />,
    boeuf: <path d="M 10 30 Q 18 18, 32 18 Q 50 20, 54 30 Q 50 42, 32 44 Q 14 42, 10 30 Z" fill="#6B1212" />,
    agneau: <path d="M 16 18 Q 32 12, 48 22 Q 52 36, 40 46 Q 22 48, 14 36 Q 10 24, 16 18 Z" fill="#A52828" />,
    saumon: <path d="M 6 32 L 18 22 Q 36 18, 50 26 L 58 32 L 50 38 Q 36 46, 18 42 Z" fill="#C44A1F" />,
    legumes: (
      <g>
        <circle cx="20" cy="32" r="10" fill="#6B1212" />
        <circle cx="38" cy="28" r="8" fill="#A52828" />
        <circle cx="44" cy="40" r="6" fill="#D9692F" />
      </g>
    ),
  }[cut] || <rect x="12" y="20" width="40" height="24" fill="#8B1A1A" />
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      {shapes}
    </svg>
  )
}

// ───────────────────────────────────────────────
// FireButton — bouton "tampon" carré minimaliste
// ───────────────────────────────────────────────
export function FireButton({
  children,
  size = 'md',
  icon,
  fullWidth,
  onClick,
  style,
  type = 'primary',
  as: As = 'button',
  ...rest
}) {
  const sizes = {
    sm: { px: 14, py: 8, fs: 12 },
    md: { px: 20, py: 12, fs: 14 },
    lg: { px: 28, py: 16, fs: 16 },
  }[size]
  const variants = {
    primary: { bg: '#8B1A1A', color: '#F5EFE0', border: '1.5px solid #8B1A1A', hover: '#6B1212' },
    secondary: { bg: '#1F1A14', color: '#F5EFE0', border: '1.5px solid #1F1A14', hover: '#2D261C' },
    ghost: { bg: 'transparent', color: '#1F1A14', border: '1.5px solid #1F1A14', hover: 'rgba(31,26,20,0.06)' },
    cream: { bg: '#F5EFE0', color: '#1F1A14', border: '1.5px solid #1F1A14', hover: '#EFE7D8' },
  }[type]
  const [hover, setHover] = React.useState(false)
  return (
    <As
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? variants.hover : variants.bg,
        color: variants.color,
        border: variants.border,
        padding: `${sizes.py}px ${sizes.px}px`,
        fontFamily: 'var(--cf-serif)',
        fontSize: sizes.fs,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        borderRadius: 2,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: fullWidth ? '100%' : 'auto',
        boxShadow:
          type === 'primary' && hover ? '0 0 24px -4px rgba(139,26,26,0.6)' : 'none',
        transition: 'all .2s',
        cursor: 'pointer',
        ...style,
      }}
      {...rest}
    >
      {children}
      {icon}
    </As>
  )
}

// ───────────────────────────────────────────────
// Pill — petites pastilles catégorie/filtre
// ───────────────────────────────────────────────
export function Pill({ children, active, onClick, dark }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'var(--cf-mono)',
        fontSize: 10,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '6px 10px',
        borderRadius: 999,
        border: `1px solid ${active ? '#8B1A1A' : dark ? 'rgba(245,239,224,0.3)' : 'rgba(31,26,20,0.25)'}`,
        background: active ? '#8B1A1A' : 'transparent',
        color: active ? '#F5EFE0' : dark ? '#F5EFE0' : '#3A3025',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

// ───────────────────────────────────────────────
// SectionEyebrow — petit titre au-dessus des grands titres
// ───────────────────────────────────────────────
export function SectionEyebrow({ children, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 24, height: 1, background: accent || '#8B1A1A' }} />
      <span className="cf-eyebrow" style={{ color: accent || '#8B1A1A' }}>
        {children}
      </span>
    </div>
  )
}
