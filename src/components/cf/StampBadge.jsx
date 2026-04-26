/**
 * Charbon & Flamme v3 — Badges tampons
 *
 * Badges SVG circulaires style "microbrasserie US" avec texte courbe,
 * étoiles latérales et symbole central. Utilisés sur la landing,
 * en-tête de pages, étapes calculateur.
 */

import React from 'react'
import { FlameIcon } from './Primitives.jsx'

// ───────────────────────────────────────────────
// StampBadge — tampon générique
// ───────────────────────────────────────────────
export function StampBadge({
  size = 96,
  topText = 'CHARBON & FLAMME',
  bottomText = 'PITMASTER',
  center = '★',
  accent = '#8B1A1A',
  tone = 'dark',
  borderStyle = 'double',
}) {
  const id = React.useId()
  const r = size / 2
  const innerR = r - 8
  const textR = r - 16
  const colorMain = tone === 'dark' ? '#1F1A14' : '#F5EFE0'
  const colorAccent = accent
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block' }}>
      <defs>
        <path id={`top-${id}`} d={`M ${r - textR} ${r} A ${textR} ${textR} 0 0 1 ${r + textR} ${r}`} fill="none" />
        <path id={`bot-${id}`} d={`M ${r - textR} ${r} A ${textR} ${textR} 0 0 0 ${r + textR} ${r}`} fill="none" />
      </defs>
      <circle cx={r} cy={r} r={r - 1} fill="none" stroke={colorMain} strokeWidth="1.5" />
      {borderStyle === 'double' && (
        <circle cx={r} cy={r} r={r - 4} fill="none" stroke={colorMain} strokeWidth="0.7" />
      )}
      {borderStyle === 'dashed' && (
        <circle cx={r} cy={r} r={r - 5} fill="none" stroke={colorMain} strokeWidth="0.6" strokeDasharray="2 2" />
      )}
      <circle cx={r} cy={r} r={innerR - 4} fill="none" stroke={colorMain} strokeWidth="0.5" opacity="0.5" />
      <text fill={colorMain} fontFamily="var(--cf-serif)" fontSize={size * 0.11} fontWeight="600" letterSpacing={size * 0.018}>
        <textPath href={`#top-${id}`} startOffset="50%" textAnchor="middle">
          {topText}
        </textPath>
      </text>
      <text fill={colorMain} fontFamily="var(--cf-serif)" fontSize={size * 0.10} fontWeight="500" letterSpacing={size * 0.015}>
        <textPath href={`#bot-${id}`} startOffset="50%" textAnchor="middle">
          {bottomText}
        </textPath>
      </text>
      <text x={6} y={r + size * 0.04} fill={colorAccent} fontSize={size * 0.14} fontFamily="serif">
        ✦
      </text>
      <text x={size - 14} y={r + size * 0.04} fill={colorAccent} fontSize={size * 0.14} fontFamily="serif">
        ✦
      </text>
      <text
        x={r}
        y={r + size * 0.05}
        textAnchor="middle"
        fontSize={size * 0.32}
        fontFamily="var(--cf-serif)"
        fontWeight="700"
        fill={colorAccent}
      >
        {center}
      </text>
    </svg>
  )
}

// ───────────────────────────────────────────────
// MethodBadge — tampon dédié aux méthodes pitmaster
// ───────────────────────────────────────────────
export function MethodBadge({ method = 'low', size = 120 }) {
  const config = {
    low: { icon: <FlameIcon variant="low" size={size * 0.4} />, top: 'LOW & SLOW', bottom: '· FUMÉE LENTE ·' },
    hot: { icon: <FlameIcon variant="hot" size={size * 0.4} />, top: 'HOT & FAST', bottom: '· FEU VIF ·' },
    reverse: {
      icon: <FlameIcon variant="reverse" size={size * 0.4} />,
      top: 'REVERSE SEAR',
      bottom: '· DOUBLE CUISSON ·',
    },
    fixed: { icon: <FlameIcon variant="low" size={size * 0.4} />, top: 'TEMPS FIXE', bottom: '· RECETTE ·' },
  }[method] || { icon: <FlameIcon variant="low" size={size * 0.4} />, top: 'PITMASTER', bottom: '· CUISSON ·' }

  const id = React.useId()
  const r = size / 2
  const textR = r - 14
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <defs>
        <path id={`m-top-${id}`} d={`M ${r - textR} ${r} A ${textR} ${textR} 0 0 1 ${r + textR} ${r}`} fill="none" />
        <path id={`m-bot-${id}`} d={`M ${r - textR} ${r} A ${textR} ${textR} 0 0 0 ${r + textR} ${r}`} fill="none" />
      </defs>
      <circle cx={r} cy={r} r={r - 1} fill="#EFE7D8" stroke="#1F1A14" strokeWidth="1.5" />
      <circle cx={r} cy={r} r={r - 5} fill="none" stroke="#1F1A14" strokeWidth="0.6" />
      <text fill="#1F1A14" fontFamily="var(--cf-serif)" fontSize={size * 0.11} fontWeight="600" letterSpacing={size * 0.02}>
        <textPath href={`#m-top-${id}`} startOffset="50%" textAnchor="middle">
          {config.top}
        </textPath>
      </text>
      <text fill="#8B1A1A" fontFamily="var(--cf-serif)" fontSize={size * 0.085} fontWeight="500" letterSpacing={size * 0.015}>
        <textPath href={`#m-bot-${id}`} startOffset="50%" textAnchor="middle">
          {config.bottom}
        </textPath>
      </text>
      <g transform={`translate(${r}, ${r})`}>
        <foreignObject x={-size * 0.2} y={-size * 0.22} width={size * 0.4} height={size * 0.4}>
          {config.icon}
        </foreignObject>
      </g>
    </svg>
  )
}
