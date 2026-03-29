import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Snack from '../../../components/Snack'
import { useSnack } from '../../../components/useSnack'
import { useAuth } from '../../../context/AuthContext'
import { MEAT_IMAGES, SMOKE_IMAGE } from '../../../domain/content/images'
import { MEATS } from '../../../domain/content/meats'
import {
  COOKING_METHODS,
  DONENESS_LEVELS,
  PHASE_BASES,
  formatDuration,
  getCookingProfile,
  getMethodConfig,
  recalibrate,
  validateInput,
} from '../../../domain/calculator/engine'
import { useCalculatorCatalog } from '../../../hooks/useCalculatorCatalog'
import { useSeoBlocks } from '../../../hooks/useSeoBlocks'
import { buildCookResult } from '../../../modules/calculator/planner'
import { saveCookSession, saveJournalEntry } from '../../../modules/cooks/repository'
import SeoBlocksSection from '../components/SeoBlocksSection'

const DEFAULT_MEAT = 'brisket'
const DEFAULT_METHOD = 'low_and_slow'

const REVERSE_SEAR_MEATS = {
  cote_de_boeuf: {
    label: 'Cote de boeuf',
    category: 'beef',
    defaultThicknessCm: 5,
    indirectTempDefaultC: 110,
    defaultDoneness: 'medium_rare',
    copy: 'Montee douce en indirect, puis saisie tres chaude a la fin.',
  },
  tomahawk: {
    label: 'Tomahawk',
    category: 'beef',
    defaultThicknessCm: 5.5,
    indirectTempDefaultC: 110,
    defaultDoneness: 'medium_rare',
    copy: 'Une grosse cote qui gagne a etre pilotee a l’epaisseur et a la sonde.',
  },
  picanha: {
    label: 'Picanha',
    category: 'beef',
    defaultThicknessCm: 3.5,
    indirectTempDefaultC: 110,
    defaultDoneness: 'medium_rare',
    copy: 'Parfaite pour une montee douce puis une saisie rapide sur gras bien colore.',
  },
  tri_tip: {
    label: 'Tri-tip',
    category: 'beef',
    defaultThicknessCm: 4,
    indirectTempDefaultC: 110,
    defaultDoneness: 'medium_rare',
    copy: 'Piece courte a servir tranchee, avec pilotage simple et precis.',
  },
  entrecote: {
    label: 'Entrecote epaisse',
    category: 'beef',
    defaultThicknessCm: 3,
    indirectTempDefaultC: 110,
    defaultDoneness: 'medium_rare',
    copy: 'Plus courte qu’une cote, mais tres lisible avec une bonne sonde.',
  },
}

const SMOKER_TYPES = [
  { id: 'pellet', label: 'Pellet' },
  { id: 'kamado', label: 'Kamado' },
  { id: 'offset', label: 'Offset' },
  { id: 'kettle', label: 'Kettle' },
  { id: 'electric', label: 'Electrique' },
  { id: 'gas', label: 'Gaz' },
]

const WRAP_TYPES = [
  { id: 'none', label: 'Sans wrap', copy: 'Tu laisses le stall complet et la bark se construire plus longtemps.' },
  { id: 'butcher_paper', label: 'Papier boucher', copy: 'Le plus classique pour accelerer un peu sans tuer la bark.' },
  { id: 'foil_boat', label: 'Foil boat', copy: 'Protège la base tout en gardant la bark exposée au-dessus.' },
  { id: 'foil', label: 'Alu', copy: 'Le plus rapide, plus humide, bark un peu moins seche.' },
]

const MARBLING_TYPES = [
  { id: 'low', label: 'Peu persille' },
  { id: 'medium', label: 'Moyen' },
  { id: 'high', label: 'Tres persille' },
]

const CATEGORY_LABELS = {
  beef: 'Boeuf',
  pork: 'Porc',
  lamb: 'Agneau',
  chicken: 'Volaille',
  poultry: 'Volaille',
  reverse: 'Reverse sear',
  other: 'Autres',
}

const PAGE_CSS = `
  .calculator-page {
    font-family: 'DM Sans', sans-serif;
    display: grid;
    gap: 18px;
  }

  .calculator-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.12fr) minmax(320px, 0.88fr);
    gap: 14px;
    align-items: start;
  }

  .calculator-stack {
    display: grid;
    gap: 12px;
  }

  .calculator-mini-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .calculator-triple-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .calculator-choices {
    display: grid;
    gap: 8px;
  }

  .calculator-chip-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .calculator-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 11px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: var(--text2);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .calculator-choice {
    width: 100%;
    text-align: left;
    padding: 14px 15px;
    border-radius: 16px;
    border: 1px solid var(--border);
    background: linear-gradient(180deg, rgba(32,32,32,0.96), rgba(20,20,20,0.98));
    color: var(--text);
    cursor: pointer;
    transition: border-color 150ms ease, transform 150ms ease, background 150ms ease;
  }

  .calculator-choice:hover {
    transform: translateY(-1px);
    border-color: var(--border2);
  }

  .calculator-choice.is-active {
    border-color: var(--orange-border);
    background: linear-gradient(180deg, rgba(198,40,40,0.16), rgba(34,18,18,0.96));
  }

  .calculator-choice-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 800;
    color: var(--text);
    line-height: 1.1;
  }

  .calculator-choice-copy {
    margin-top: 6px;
    font-size: 12px;
    color: var(--text3);
    line-height: 1.6;
  }

  .calculator-preview {
    position: relative;
    overflow: hidden;
    min-height: 320px;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.08);
    background: linear-gradient(180deg, rgba(24,24,24,0.98), rgba(10,10,10,0.98));
  }

  .calculator-preview-media {
    position: absolute;
    inset: 0;
  }

  .calculator-preview-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: saturate(0.96) contrast(1.04);
  }

  .calculator-preview-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(10,10,10,0.22), rgba(10,10,10,0.88)),
      linear-gradient(90deg, rgba(8,8,8,0.94), rgba(8,8,8,0.26));
  }

  .calculator-preview-body {
    position: relative;
    z-index: 1;
    height: 100%;
    padding: 22px;
    display: grid;
    align-content: end;
    gap: 14px;
  }

  .calculator-summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .calculator-summary-card {
    padding: 12px 14px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(11,11,11,0.55);
    backdrop-filter: blur(12px);
  }

  .calculator-summary-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.3px;
    font-weight: 700;
    color: rgba(255,255,255,0.58);
    margin-bottom: 6px;
  }

  .calculator-summary-value {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    line-height: 1;
    color: var(--text);
  }

  .calculator-summary-copy {
    margin-top: 7px;
    font-size: 11px;
    line-height: 1.6;
    color: rgba(255,255,255,0.76);
  }

  .calculator-kpi-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .calculator-kpi {
    padding: 13px 14px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
  }

  .calculator-kpi-value {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 800;
    line-height: 1;
    color: var(--ember);
  }

  .calculator-kpi-copy {
    margin-top: 7px;
    font-size: 11px;
    color: var(--text3);
    line-height: 1.55;
  }

  .calculator-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .calculator-roadmap {
    display: grid;
    gap: 10px;
  }

  .calculator-roadmap-item {
    display: grid;
    grid-template-columns: 42px 1fr;
    gap: 12px;
    padding: 14px 0;
  }

  .calculator-roadmap-item + .calculator-roadmap-item {
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .calculator-roadmap-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, rgba(229,57,53,0.18), rgba(198,40,40,0.08));
    border: 1px solid rgba(229,57,53,0.22);
    box-shadow: 0 0 18px rgba(198,40,40,0.14);
    font-size: 18px;
  }

  .calculator-roadmap-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: var(--ember);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.1px;
    white-space: nowrap;
  }

  .calculator-cues {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .calculator-cue-card {
    padding: 16px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: linear-gradient(180deg, rgba(27,27,27,0.98), rgba(15,15,15,0.98));
  }

  .calculator-cue-value {
    margin-top: 8px;
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    line-height: 1;
    color: var(--text);
  }

  .calculator-visuals {
    display: grid;
    gap: 8px;
  }

  .calculator-visual-item {
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: var(--text2);
    line-height: 1.6;
    font-size: 12px;
  }

  .calculator-warning {
    padding: 13px 15px;
    border-radius: 16px;
    border: 1px solid rgba(245,158,11,0.24);
    background: rgba(245,158,11,0.08);
    color: #f8d7a3;
    font-size: 12px;
    line-height: 1.65;
  }

  .calculator-stale {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    padding: 13px 15px;
    border-radius: 16px;
    border: 1px solid rgba(229,57,53,0.22);
    background: rgba(198,40,40,0.08);
    color: var(--text2);
    font-size: 12px;
  }

  .calculator-recal-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .calculator-sticky-bar {
    display: none;
  }

  @media (max-width: 980px) {
    .calculator-grid,
    .calculator-cues,
    .calculator-kpi-grid,
    .calculator-summary-grid,
    .calculator-triple-grid,
    .calculator-recal-grid {
      grid-template-columns: 1fr;
    }

    .calculator-actions,
    .calculator-mini-grid {
      grid-template-columns: 1fr;
    }

    .calculator-sticky-bar {
      display: block;
      position: sticky;
      bottom: 82px;
      z-index: 25;
    }
  }
`

function toNumber(value, fallback = 0) {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function toOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  const next = Number(value)
  return Number.isFinite(next) ? next : null
}

function cToF(value) {
  if (!Number.isFinite(value)) return null
  return Math.round((value * 9) / 5 + 32)
}

function formatTempC(value) {
  if (!Number.isFinite(value)) return null
  const fahrenheit = cToF(value)
  return `${value}°C${fahrenheit ? ` · ${fahrenheit}°F` : ''}`
}

function buildTransientVisitorId() {
  return `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function getFallbackCategory(slug) {
  if (REVERSE_SEAR_MEATS[slug]) return 'reverse'
  const localCategory = MEATS[slug]?.category
  if (localCategory === 'beef') return 'beef'
  if (localCategory === 'pork') return 'pork'
  if (localCategory === 'lamb') return 'lamb'
  if (localCategory === 'chicken') return 'chicken'
  if (slug === 'lamb_shoulder' || slug === 'lamb_leg') return 'lamb'
  if (slug === 'whole_chicken' || slug === 'chicken_pieces') return 'chicken'
  if (slug === 'pork_shoulder' || slug.includes('ribs')) return slug === 'ribs_beef' ? 'beef' : 'pork'
  return 'other'
}

function getMeatLabel(slug, catalogEntry) {
  return (
    catalogEntry?.name ||
    REVERSE_SEAR_MEATS[slug]?.label ||
    MEATS[slug]?.name ||
    getCookingProfile(slug)?.label ||
    slug.replaceAll('_', ' ')
  )
}

function getMeatCopy(slug, catalogEntry) {
  return (
    catalogEntry?.description ||
    REVERSE_SEAR_MEATS[slug]?.copy ||
    MEATS[slug]?.full ||
    getCookingProfile(slug)?.notes ||
    ''
  )
}

function buildMeatOptions(catalogMeats) {
  const source = Array.isArray(catalogMeats) ? catalogMeats : []
  const catalogBySlug = Object.fromEntries(source.filter((entry) => entry?.slug).map((entry) => [entry.slug, entry]))
  const keys = Array.from(
    new Set([
      ...Object.keys(PHASE_BASES),
      ...Object.keys(REVERSE_SEAR_MEATS),
      ...source.map((entry) => entry.slug).filter(Boolean),
    ]),
  )

  return keys
    .map((slug, index) => {
      const catalogEntry = catalogBySlug[slug]
      const categoryKey = catalogEntry?.category || getFallbackCategory(slug)
      return {
        slug,
        name: getMeatLabel(slug, catalogEntry),
        copy: getMeatCopy(slug, catalogEntry),
        categoryKey,
        categoryLabel: CATEGORY_LABELS[categoryKey] || CATEGORY_LABELS.other,
        displayOrder: catalogEntry?.display_order ?? index,
      }
    })
    .sort((a, b) => {
      if (a.categoryLabel !== b.categoryLabel) return a.categoryLabel.localeCompare(b.categoryLabel, 'fr')
      if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder
      return a.name.localeCompare(b.name, 'fr')
    })
}

function buildMeatGroups(options) {
  return options.reduce((acc, option) => {
    if (!acc[option.categoryLabel]) acc[option.categoryLabel] = []
    acc[option.categoryLabel].push(option)
    return acc
  }, {})
}

function clockToMinutes(value) {
  if (typeof value !== 'string') return null
  const normalized = value.replace('h', ':')
  const [hours, minutes = '0'] = normalized.split(':').map((part) => parseInt(part, 10))
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  return hours * 60 + minutes
}

function getSleepNote(result) {
  const startMinutes = clockToMinutes(result?.startTime)
  if (startMinutes === null) return null
  if (startMinutes < 5 * 60) {
    return {
      title: 'Cuisson de nuit probable',
      copy: 'Prevois un reveil tres matinal ou lance la veille avec un vrai hold.',
    }
  }
  if (startMinutes < 7 * 60) {
    return {
      title: 'Debut assez tot',
      copy: 'Pas besoin de nuit blanche, mais prevois un depart matinal et un fumoir stable.',
    }
  }
  return {
    title: 'Journée gérable',
    copy: 'Tu peux lancer dans la journee sans depart absurde au milieu de la nuit.',
  }
}

function getResultIntro(result) {
  if (!result) return null
  if (result.method === 'reverse_sear') {
    return `Pour servir vers ${result.serve}, lance la chauffe vers ${result.startTime}. La saisie finale reste courte: surveille surtout la sonde et la croûte.`
  }

  return `Pour servir vers ${result.serve}, prends comme base un depart prudent a ${result.startTime}. Le reste se pilote ensuite avec la bark, la texture et la sonde.`
}

function buildSummaryCards(result) {
  if (!result) return []

  const sleep = getSleepNote(result)

  return [
    {
      label: 'Allumer le fumoir',
      value: result.startTime,
      copy: 'C’est l’heure prudente pour ne pas servir en retard.',
    },
    {
      label: 'Mettre la viande',
      value: result.meatOnSmokerTime,
      copy: `Viande chargee une fois le pit bien stabilise a ${result.smokerTempC}°C.`,
    },
    {
      label: 'Fenetre de service',
      value: `${result.serviceWindowStart} → ${result.serviceWindowEnd}`,
      copy: 'Lis-la comme une vraie fenetre, pas comme une minute magique.',
    },
    {
      label: sleep?.title || 'Repos',
      value: formatDuration(result.restMin),
      copy: sleep?.copy || 'Le repos fait partie du plan. Ne le grignote pas au dernier moment.',
    },
  ]
}

function buildDisplayRoadmap(result) {
  if (!result) return []

  const icon = result.meatKey === 'ribs_pork' || result.meatKey === 'ribs_baby_back' ? '🍖' : '🥩'
  const steps = [
    {
      id: 'preheat',
      icon: '🔥',
      title: 'Prechauffage',
      badge: result.startTime,
      copy: 'Allume, laisse le fumoir se poser, puis charge seulement quand la temperature est stable.',
    },
    {
      id: 'load',
      icon,
      title: 'Mise en cuisson',
      badge: result.meatOnSmokerTime,
      copy: `Pose la viande vers ${result.meatOnSmokerTime} a ${result.smokerTempC}°C.`,
    },
  ]

  ;(result.timeline || [])
    .filter((step) => step.id !== 'service')
    .forEach((step) => {
      if (step.id === 'bark') {
        steps.push({
          id: step.id,
          icon: '🌫️',
          title: 'Prise de couleur',
          badge: 'Repere visuel',
          copy: 'Laisse la bark se construire. L’horloge compte moins que la couleur et la surface.',
        })
        return
      }

      if (step.id === 'stall') {
        steps.push({
          id: step.id,
          icon: '📍',
          title: 'Stall possible',
          badge: 'Normal',
          copy: 'La courbe peut ralentir franchement. Garde surtout un pit stable et evite de paniquer.',
        })
        return
      }

      if (step.id === 'wrap') {
        steps.push({
          id: step.id,
          icon: '📦',
          title: 'Wrap si tu le veux',
          badge: 'Quand la bark plait',
          copy: 'Emballe seulement quand la couleur et la bark te conviennent. Pas a une minute precise.',
        })
        return
      }

      if (step.id === 'pullback') {
        steps.push({
          id: step.id,
          icon: '🦴',
          title: 'Retrait sur l’os',
          badge: 'Regarde la rack',
          copy: 'Sur les ribs, le retrait de viande et la souplesse sont plus utiles qu’un chiffre sec.',
        })
        return
      }

      if (step.id === 'flex') {
        steps.push({
          id: step.id,
          icon: '🔍',
          title: 'Flex test',
          badge: 'Test terrain',
          copy: 'Souleve la rack: elle doit plier franchement et legerement fissurer en surface.',
        })
        return
      }

      if (step.id === 'probe') {
        steps.push({
          id: step.id,
          icon: '🌡️',
          title: 'Tests de tendrete',
          badge: 'Quand la sonde glisse',
          copy: 'Commence les tests dans la bonne zone, puis retire des que la texture te dit oui.',
        })
        return
      }

      if (step.id === 'indirect') {
        steps.push({
          id: step.id,
          icon: '🔥',
          title: 'Montee douce',
          badge: `Environ ${formatDuration(step.durationMin)}`,
          copy: step.description,
        })
        return
      }

      if (step.id === 'sear') {
        steps.push({
          id: step.id,
          icon: '⚡',
          title: 'Saisie finale',
          badge: 'Tres courte',
          copy: step.description,
        })
        return
      }

      if (step.id === 'rest') {
        steps.push({
          id: step.id,
          icon: '😴',
          title: 'Repos',
          badge: formatDuration(step.durationMin),
          copy: step.description,
        })
      }
    })

  steps.push({
    id: 'service',
    icon: '🍽️',
    title: 'Service',
    badge: `${result.serviceWindowStart} → ${result.serviceWindowEnd}`,
    copy: 'Sers dans cette fenetre. Si tu as de l’avance, mets-la a profit pour un vrai repos.',
  })

  return steps
}

function buildCueCards(result) {
  if (!result) return []

  if (result.method === 'reverse_sear' || result.method === 'direct') {
    return [
      {
        title: 'Sortie avant saisie',
        value: formatTempC(result.pullTemp),
        copy: 'Sors de l’indirect un peu avant le rendu final. La saisie et le carryover feront le reste.',
      },
      {
        title: 'Cible finale',
        value: formatTempC(result.targetTemp),
        copy: 'Coupe la saisie des que tu es au rendu voulu. Sur ces pieces, la sonde reste le vrai juge.',
      },
      {
        title: 'Epaisseur',
        value: `${result.thicknessCm} cm`,
        copy: 'Ici, le timing depend surtout de l’epaisseur et pas du poids seul.',
      },
      {
        title: 'Repos',
        value: formatDuration(result.restMin),
        copy: 'Court mais important pour garder les jus et une coupe propre.',
      },
    ]
  }

  return [
    {
      title: 'Stall attendu',
      value: result.cues?.stallRange || 'Possible',
      copy: 'Ralentissement normal sur les grosses pieces. Ce n’est pas un signal d’alerte en soi.',
    },
    {
      title: result.wrapType === 'none' ? 'Sans wrap' : 'Zone de wrap',
      value: result.wrapType === 'none' ? 'Bark libre' : result.cues?.wrapRange || 'Quand la bark te plait',
      copy: result.wrapType === 'none'
        ? 'Tu laisses la cuisson suivre son rythme complet pour garder une bark plus marquee.'
        : 'Emballe quand la couleur te convient. Le repere visuel reste plus fiable que l’heure.',
    },
    {
      title: 'Commencer les tests',
      value: result.cues?.probeStart || result.cues?.probeTenderRange || 'Dans la bonne zone',
      copy: 'Commence a sonder, puis retire uniquement quand la texture te dit que c’est pret.',
    },
    {
      title: 'Repos a prevoir',
      value: result.cues?.restRange || formatDuration(result.restMin),
      copy: 'Prevois vraiement cette plage dans ton planning: elle fait partie du resultat final.',
    },
  ]
}

function buildVisualNotes(result) {
  if (!result) return []
  return result.meta?.visuals || result.cues?.visuals || []
}

function buildDownloadLines(result, roadmap, cueCards, meatLabel) {
  return [
    'Charbon & Flamme - Plan de cuisson BBQ',
    '',
    `Viande: ${meatLabel}`,
    `Service vise: ${result.serve}`,
    `Allumer le fumoir: ${result.startTime}`,
    `Mettre la viande: ${result.meatOnSmokerTime}`,
    `Fenetre de service: ${result.serviceWindowStart} -> ${result.serviceWindowEnd}`,
    `Temperature fumoir: ${result.smokerTempC}°C`,
    '',
    'Grandes etapes:',
    ...roadmap.map((step) => `- ${step.title}: ${step.copy}`),
    '',
    'Repères utiles:',
    ...cueCards.map((cue) => `- ${cue.title}: ${cue.value} - ${cue.copy}`),
  ]
}

function PreviewCard({ meatLabel, methodLabel, serveTime, copy, imageSrc, onImageError, isReverseSear }) {
  return (
    <div className="calculator-preview">
      <div className="calculator-preview-media">
        <img src={imageSrc} alt={meatLabel} onError={onImageError} />
      </div>
      <div className="calculator-preview-overlay" />
      <div className="calculator-preview-body">
        <div className="pm-kicker">{isReverseSear ? 'Reverse sear' : 'Plan de cuisson'}</div>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, lineHeight: 0.98, color: '#fff' }}>
            {meatLabel}
          </div>
          <div style={{ marginTop: 8, maxWidth: 420, fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
            {copy}
          </div>
        </div>
        <div className="calculator-summary-grid">
          <div className="calculator-summary-card">
            <div className="calculator-summary-label">Type de cuisson</div>
            <div className="calculator-summary-value" style={{ fontSize: 24 }}>{methodLabel}</div>
            <div className="calculator-summary-copy">Une lecture simple, pensee pour savoir quand lancer et quoi surveiller.</div>
          </div>
          <div className="calculator-summary-card">
            <div className="calculator-summary-label">Service vise</div>
            <div className="calculator-summary-value" style={{ fontSize: 24 }}>{serveTime.replace(':', 'h')}</div>
            <div className="calculator-summary-copy">Tu renseignes l’heure du repas, le plan remonte ensuite vers le bon depart.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChoiceTile({ active, title, copy, onClick }) {
  return (
    <button type="button" className={`calculator-choice${active ? ' is-active' : ''}`} onClick={onClick}>
      <div className="calculator-choice-title">{title}</div>
      {copy ? <div className="calculator-choice-copy">{copy}</div> : null}
    </button>
  )
}

function ResultHero({ result, meatLabel }) {
  const summaryCards = buildSummaryCards(result)
  const intro = getResultIntro(result)

  return (
    <div className="pm-hero-shell" id="calc-result">
      <div className="pm-kicker" style={{ marginBottom: 12 }}>Plan conseille</div>
      <div style={{ marginBottom: 8, fontFamily: 'Syne', fontSize: 'clamp(30px, 5vw, 54px)', fontWeight: 800, lineHeight: 0.95, color: 'var(--text)' }}>
        Lance le fumoir vers <span style={{ color: 'var(--ember)' }}>{result.startTime}</span>
      </div>
      <p style={{ maxWidth: 760, marginBottom: 16 }}>{intro}</p>

      <div className="calculator-summary-grid">
        {summaryCards.map((card) => (
          <div key={card.label} className="calculator-summary-card">
            <div className="calculator-summary-label">{card.label}</div>
            <div className="calculator-summary-value">{card.value}</div>
            <div className="calculator-summary-copy">{card.copy}</div>
          </div>
        ))}
      </div>

      <div className="calculator-kpi-grid" style={{ marginTop: 12 }}>
        {[
          {
            label: 'Cuisson estimee',
            value: formatDuration(result.cookMin),
            copy: 'Scenario moyen de cuisson active.',
          },
          {
            label: 'Repos',
            value: formatDuration(result.restMin),
            copy: 'A integrer au plan, pas a decouper en urgence.',
          },
          {
            label: 'Methode',
            value: result.methodVariantLabel || result.methodLabel,
            copy: `Plan calcule pour ${meatLabel} a ${result.smokerTempC}°C.`,
          },
        ].map((item) => (
          <div key={item.label} className="calculator-kpi">
            <div className="calculator-summary-label">{item.label}</div>
            <div className="calculator-kpi-value">{item.value}</div>
            <div className="calculator-kpi-copy">{item.copy}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CalculatorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { snack, showSnack } = useSnack()
  const { meats: catalogMeats, meatsBySlug } = useCalculatorCatalog()

  const [meatKey, setMeatKey] = useState(DEFAULT_MEAT)
  const [weight, setWeight] = useState(4)
  const [thickness, setThickness] = useState('')
  const [smokerTemp, setSmokerTemp] = useState(115)
  const [serveTime, setServeTime] = useState('19:00')
  const [cookMethod, setCookMethod] = useState(DEFAULT_METHOD)
  const [smokerType, setSmokerType] = useState('pellet')
  const [wrapType, setWrapType] = useState('none')
  const [marbling, setMarbling] = useState('medium')
  const [startTemp, setStartTemp] = useState(4)
  const [lambLegStyle, setLambLegStyle] = useState('medium')
  const [donenessId, setDonenessId] = useState('medium_rare')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showRecal, setShowRecal] = useState(false)
  const [currentTempC, setCurrentTempC] = useState('')
  const [elapsedMin, setElapsedMin] = useState('')
  const [currentPitTemp, setCurrentPitTemp] = useState('')
  const [recalResult, setRecalResult] = useState(null)
  const [result, setResult] = useState(null)
  const [warnings, setWarnings] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingJournal, setSavingJournal] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [heroImageSrc, setHeroImageSrc] = useState(MEAT_IMAGES[DEFAULT_MEAT] || SMOKE_IMAGE)

  const meatOptions = useMemo(() => buildMeatOptions(catalogMeats), [catalogMeats])
  const meatGroups = useMemo(() => buildMeatGroups(meatOptions), [meatOptions])
  const selectedCatalogMeat = meatsBySlug[meatKey] || null
  const selectedProfile = useMemo(() => getCookingProfile(meatKey), [meatKey])
  const isReverseSearMeat = Boolean(REVERSE_SEAR_MEATS[meatKey])
  const reverseProfile = REVERSE_SEAR_MEATS[meatKey] || null
  const selectedMethodProfile = useMemo(() => {
    if (!selectedProfile) return null
    return selectedProfile.methods.find((entry) => entry.method === cookMethod) || selectedProfile.methods[0] || null
  }, [selectedProfile, cookMethod])
  const methodConfig = useMemo(() => {
    if (isReverseSearMeat) {
      return {
        smokerTempRange: [105, 121],
        smokerTempDefault: reverseProfile?.indirectTempDefaultC || 110,
        notes: 'Montee douce puis saisie courte. L’epaisseur et la sonde pilotent le plan.',
      }
    }
    return getMethodConfig(meatKey, cookMethod)
  }, [cookMethod, isReverseSearMeat, meatKey, reverseProfile])
  const smokerRange = useMemo(() => methodConfig?.smokerTempRange || [105, 160], [methodConfig])
  const showWrapChoices = !isReverseSearMeat && (selectedMethodProfile?.wrapFriendly || selectedProfile?.family === 'ribs')
  const meatLabel = getMeatLabel(meatKey, selectedCatalogMeat)
  const meatCopy = getMeatCopy(meatKey, selectedCatalogMeat)
  const localMeatData = MEATS[meatKey] || null
  const serveTimeDisplay = useMemo(() => serveTime.replace(':', 'h'), [serveTime])

  const availableMethods = useMemo(() => {
    if (isReverseSearMeat) {
      return COOKING_METHODS.filter((option) => option.id === 'reverse_sear')
    }
    if (!selectedProfile) return COOKING_METHODS.filter((option) => option.id === DEFAULT_METHOD)
    return COOKING_METHODS.filter((option) => selectedProfile.methods.some((entry) => entry.method === option.id))
  }, [isReverseSearMeat, selectedProfile])

  const seoTargetMeat = result?.meatKey || meatKey
  const seoTargetMethod = result?.method || cookMethod
  const { blocks: introSeoBlocks } = useSeoBlocks({ position: 'after_intro', meatSlug: seoTargetMeat, methodKey: seoTargetMethod })
  const { blocks: afterCalculatorSeoBlocks } = useSeoBlocks({ position: 'after_calculator', meatSlug: seoTargetMeat, methodKey: seoTargetMethod })
  const { blocks: afterResultSeoBlocks } = useSeoBlocks({ position: 'after_result', meatSlug: seoTargetMeat, methodKey: seoTargetMethod })
  const { blocks: afterTimelineSeoBlocks } = useSeoBlocks({ position: 'after_timeline', meatSlug: seoTargetMeat, methodKey: seoTargetMethod })
  const { blocks: bottomSeoBlocks } = useSeoBlocks({ position: 'bottom_page', meatSlug: seoTargetMeat, methodKey: seoTargetMethod })

  const roadmap = useMemo(() => buildDisplayRoadmap(result), [result])
  const cueCards = useMemo(() => buildCueCards(result), [result])
  const visualNotes = useMemo(() => buildVisualNotes(result), [result])

  const resultIsStale = useMemo(() => {
    if (!result) return false
    if (result.meatKey !== meatKey) return true
    if (result.method !== (isReverseSearMeat ? 'reverse_sear' : cookMethod)) return true
    if (result.smokerTempC !== smokerTemp) return true
    if (result.serve !== serveTimeDisplay) return true
    if (!isReverseSearMeat && Math.abs((result.weightKg || 0) - Number(weight || 0)) > 0.1) return true
    if (isReverseSearMeat && Math.abs((result.thicknessCm || 0) - Number(thickness || 0)) > 0.1) return true
    if (meatKey === 'lamb_leg' && result.targetTempC >= 90 && lambLegStyle !== 'pulled') return true
    if (meatKey === 'lamb_leg' && result.targetTempC < 90 && lambLegStyle === 'pulled') return true
    if (result.wrapType !== (showWrapChoices ? wrapType : 'none')) return true
    if (result.marbling !== marbling) return true
    return false
  }, [cookMethod, isReverseSearMeat, lambLegStyle, marbling, meatKey, result, serveTimeDisplay, showWrapChoices, smokerTemp, thickness, weight, wrapType])

  function resetDerivedState() {
    setWarnings([])
    setRecalResult(null)
    setShowRecal(false)
    setResult(null)
  }

  function applyDefaultsForMeat(nextMeatKey) {
    const nextReverse = REVERSE_SEAR_MEATS[nextMeatKey]
    const nextProfile = getCookingProfile(nextMeatKey)

    if (nextReverse) {
      setCookMethod('reverse_sear')
      setSmokerTemp(nextReverse.indirectTempDefaultC)
      setThickness(String(nextReverse.defaultThicknessCm))
      setWeight(1)
      setWrapType('none')
      setDonenessId(nextReverse.defaultDoneness || 'medium_rare')
      setLambLegStyle('medium')
      return
    }

    const nextMethod = nextProfile?.methods?.[0]?.method || DEFAULT_METHOD
    const nextMethodConfig = getMethodConfig(nextMeatKey, nextMethod)
    setCookMethod(nextMethod)
    setSmokerTemp(nextMethodConfig?.smokerTempDefault || 115)
    setWeight(nextProfile?.defaultWeightKg || 3)
    setThickness('')
    setWrapType('none')
    setDonenessId('medium_rare')
    setLambLegStyle('medium')
  }

  useEffect(() => {
    setHeroImageSrc(MEAT_IMAGES[meatKey] || SMOKE_IMAGE)
  }, [meatKey])

  useEffect(() => {
    const preselectedMeatKey = location.state?.preselectMeatKey
    if (!preselectedMeatKey || preselectedMeatKey === meatKey) return
    const exists = meatOptions.some((option) => option.slug === preselectedMeatKey)
    if (!exists) return
    setMeatKey(preselectedMeatKey)
    applyDefaultsForMeat(preselectedMeatKey)
    resetDerivedState()
  }, [location.state, meatKey, meatOptions])

  useEffect(() => {
    if (isReverseSearMeat) {
      if (cookMethod !== 'reverse_sear') setCookMethod('reverse_sear')
      setSmokerTemp((current) => clamp(current, smokerRange[0], smokerRange[1]))
      if (!thickness) setThickness(String(reverseProfile?.defaultThicknessCm || 4))
      if (wrapType !== 'none') setWrapType('none')
      return
    }

    if (!selectedProfile) return

    if (!selectedProfile.methods.some((entry) => entry.method === cookMethod)) {
      const fallbackMethod = selectedProfile.methods[0]?.method || DEFAULT_METHOD
      setCookMethod(fallbackMethod)
      const fallbackConfig = getMethodConfig(meatKey, fallbackMethod)
      setSmokerTemp(fallbackConfig?.smokerTempDefault || 115)
    }

    setSmokerTemp((current) => clamp(current, smokerRange[0], smokerRange[1]))

    if (!showWrapChoices && wrapType !== 'none') {
      setWrapType('none')
    }
  }, [cookMethod, isReverseSearMeat, meatKey, reverseProfile, selectedProfile, showWrapChoices, smokerRange, thickness, wrapType])

  async function calculate() {
    setLoading(true)
    setRecalResult(null)

    window.setTimeout(() => {
      try {
        const safeWeight = isReverseSearMeat ? 1 : Math.max(toNumber(weight, 1), 0.3)
        const safeThickness = toOptionalNumber(thickness)
        const safeSmokerTemp = clamp(toNumber(smokerTemp, 115), smokerRange[0], smokerRange[1])
        const nextWarnings = validateInput(meatKey, safeWeight, safeSmokerTemp, safeThickness)
        const nextResult = buildCookResult(
          meatKey,
          safeWeight,
          {
            method: isReverseSearMeat ? 'reverse_sear' : cookMethod,
            thicknessCm: safeThickness,
            smokerTempC: safeSmokerTemp,
            startTempC: startTemp,
            smokerType,
            wrapType: showWrapChoices ? wrapType : 'none',
            marbling,
            lambLegStyle,
            donenessId,
          },
          serveTime,
        )

        const enrichedResult = {
          ...nextResult,
          analyticsContext: {
            visitorId: user?.id || buildTransientVisitorId(),
            calculatedAt: new Date().toISOString(),
            isAnonymous: !user,
            entryPoint: 'calculator_rebuild',
            smokerType,
            wrapType: showWrapChoices ? wrapType : 'none',
            marbling,
          },
        }

        setWarnings(nextWarnings)
        setResult(enrichedResult)
        window.setTimeout(() => {
          document.getElementById('calc-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 120)
      } catch (error) {
        showSnack(`Erreur : ${error.message}`, 'error')
      } finally {
        setLoading(false)
      }
    }, 180)
  }

  function runRecalibration() {
    if (!result) return
    const next = recalibrate(
      result,
      toOptionalNumber(currentTempC),
      toOptionalNumber(elapsedMin),
      toOptionalNumber(currentPitTemp),
    )
    setRecalResult(next)
  }

  async function saveSession() {
    if (!result) return
    if (!user) {
      showSnack('Creer un compte permet de garder ce plan dans ton historique.', 'info')
      navigate('/auth', { state: { from: '/app', reason: 'save-plan' } })
      return
    }

    setSaving(true)
    try {
      await saveCookSession({
        user_id: user.id,
        meat_key: result.meatKey,
        meat_name: meatLabel,
        weight: result.weightKg || null,
        smoker_temp: result.smokerTempC,
        serve_time: result.serve,
        start_time: result.startTime,
        cook_min: result.cookMin,
        date: new Date().toLocaleDateString('fr-FR'),
      })
      showSnack('Plan ajoute a l’historique')
    } catch (error) {
      showSnack(`Erreur : ${error.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function addToJournal() {
    if (!result) return
    if (!user) {
      showSnack('Connecte-toi pour garder des notes dans ton journal.', 'info')
      navigate('/auth', { state: { from: '/app', reason: 'journal-plan' } })
      return
    }

    setSavingJournal(true)
    try {
      await saveJournalEntry({
        user_id: user.id,
        meat_name: meatLabel,
        date: new Date().toLocaleDateString('fr-FR'),
        serve_time: result.serve,
        start_time: result.startTime,
        smoker_temp: result.smokerTempC,
        weight: result.weightKg || null,
        cook_min: result.cookMin,
        notes: [
          `Plan ${meatLabel}`,
          `Methode: ${result.methodVariantLabel || result.methodLabel}`,
          `Fenetre: ${result.serviceWindowStart} -> ${result.serviceWindowEnd}`,
        ].join(' · '),
        tags: [result.meatKey, result.method].filter(Boolean),
      })
      showSnack('Entree ajoutee au journal')
    } catch (error) {
      showSnack(`Erreur : ${error.message}`, 'error')
    } finally {
      setSavingJournal(false)
    }
  }

  async function sharePlan() {
    if (!result) return
    setSharing(true)
    const shareText = `${meatLabel} · fumoir ${result.smokerTempC}°C · prechauffe ${result.startTime} · service ${result.serviceWindowStart} -> ${result.serviceWindowEnd}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Plan BBQ ${meatLabel}`,
          text: shareText,
          url: window.location.href,
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText} · ${window.location.href}`)
        showSnack('Lien de partage copie')
      }
    } catch {
      // L’utilisateur peut annuler sans bruit.
    } finally {
      setSharing(false)
    }
  }

  function downloadPlan() {
    if (!result) return
    const lines = buildDownloadLines(result, roadmap, cueCards, meatLabel)
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `plan-bbq-${result.meatKey || meatKey}.txt`
    link.click()
    URL.revokeObjectURL(url)
    showSnack('Planning telecharge')
  }

  const actionPreviewText = isReverseSearMeat
    ? 'Epaisseur, cuisson indirecte et temperature interne pilotent le plan.'
    : 'Tu obtiens une heure de depart prudente, une vraie fenetre de service et les grands reperes a surveiller.'

  const showRecalibration = Boolean(result && result.totalMin >= 180 && result.method !== 'reverse_sear' && result.method !== 'direct')

  return (
    <div className="calculator-page">
      <style>{PAGE_CSS}</style>
      <Snack snack={snack} />

      <div className="pm-hero-shell">
        <div className="pm-kicker" style={{ marginBottom: 12 }}>Calculateur BBQ</div>
        <div style={{ maxWidth: 860, marginBottom: 12 }}>
          <h1 style={{ marginBottom: 8 }}>
            Savoir quand lancer, <span style={{ color: 'var(--ember)' }}>pas deviner</span>
          </h1>
          <p>
            Tu choisis la viande, le mode de cuisson et l’heure du repas. Ensuite on te donne un depart prudent, une fenetre realiste et les repères terrain a suivre sans fausse precision minute par minute.
          </p>
        </div>
        <div className="calculator-chip-row">
          <span className="calculator-chip">Heure de lancement claire</span>
          <span className="calculator-chip">Fenetre de service realiste</span>
          <span className="calculator-chip">Repères visuels et thermiques</span>
          <span className="calculator-chip">Pas d’heure magique pour le wrap</span>
        </div>
      </div>

      <SeoBlocksSection title="Avant de lancer" kicker="Guides et conseils utiles" blocks={introSeoBlocks} />

      <div className="calculator-grid">
        <div className="calculator-stack">
          <div className="pm-card">
            <div className="pm-sec-label"><span>01</span><span>Choisir la viande</span></div>
            <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--text3)', lineHeight: 1.65 }}>
              Choisis ta piece. Ensuite l’outil adapte la logique de cuisson et les bons repères.
            </div>
            <label className="pm-field-label">Viande</label>
            <select
              className="pm-input"
              value={meatKey}
              onChange={(event) => {
                const nextMeatKey = event.target.value
                setMeatKey(nextMeatKey)
                applyDefaultsForMeat(nextMeatKey)
                resetDerivedState()
              }}
            >
              {Object.entries(meatGroups).map(([groupLabel, options]) => (
                <optgroup key={groupLabel} label={groupLabel}>
                  {options.map((option) => (
                    <option key={option.slug} value={option.slug}>{option.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {meatCopy ? (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
                {meatCopy}
              </div>
            ) : null}
          </div>

          <div className="pm-card">
            <div className="pm-sec-label"><span>02</span><span>Type de cuisson</span></div>
            <div className="calculator-choices">
              {availableMethods.map((option) => (
                <ChoiceTile
                  key={option.id}
                  active={cookMethod === option.id}
                  title={option.label}
                  copy={option.short}
                  onClick={() => {
                    setCookMethod(option.id)
                    if (!isReverseSearMeat) {
                      const nextConfig = getMethodConfig(meatKey, option.id)
                      setSmokerTemp(nextConfig?.smokerTempDefault || smokerTemp)
                    }
                    resetDerivedState()
                  }}
                />
              ))}
            </div>
            {methodConfig?.notes ? (
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>
                {methodConfig.notes}
              </div>
            ) : null}
          </div>

          <div className="pm-card">
            <div className="pm-sec-label"><span>03</span><span>Parametres utiles</span></div>
            <div className="calculator-mini-grid">
              {!isReverseSearMeat ? (
                <div>
                  <label className="pm-field-label">Poids</label>
                  <input
                    className="pm-input"
                    type="number"
                    min="0.3"
                    max="30"
                    step="0.1"
                    value={weight}
                    onChange={(event) => {
                      setWeight(event.target.value)
                      setResult(null)
                    }}
                  />
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                    Pour les grosses pieces, le poids donne l’amplitude. L’epaisseur aide ensuite a ajuster.
                  </div>
                </div>
              ) : null}

              <div>
                <label className="pm-field-label">
                  {isReverseSearMeat ? 'Epaisseur' : 'Epaisseur max'}
                </label>
                <input
                  className="pm-input"
                  type="number"
                  min="1.5"
                  max="20"
                  step="0.1"
                  value={thickness}
                  placeholder={isReverseSearMeat ? 'Ex: 4.5' : 'Optionnel'}
                  onChange={(event) => {
                    setThickness(event.target.value)
                    setResult(null)
                  }}
                />
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                  {isReverseSearMeat
                    ? 'Sur ces pieces, l’epaisseur compte plus que le poids pour estimer la duree.'
                    : 'Option utile si la piece est vraiment epaisse ou atypique.'}
                </div>
              </div>
            </div>

            {meatKey === 'lamb_leg' ? (
              <div style={{ marginTop: 14 }}>
                <label className="pm-field-label">Style de gigot</label>
                <div className="calculator-mini-grid">
                  {[
                    {
                      id: 'medium',
                      title: 'Rosé / tranche',
                      copy: 'Cuisson de roti, courte, service tranche.',
                    },
                    {
                      id: 'pulled',
                      title: 'Effiloche',
                      copy: 'Version longue, texture plus fondante et plus proche d’une epaule.',
                    },
                  ].map((option) => (
                    <ChoiceTile
                      key={option.id}
                      active={lambLegStyle === option.id}
                      title={option.title}
                      copy={option.copy}
                      onClick={() => {
                        setLambLegStyle(option.id)
                        resetDerivedState()
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {isReverseSearMeat ? (
              <div style={{ marginTop: 14 }}>
                <label className="pm-field-label">Cuisson voulue</label>
                <div className="calculator-mini-grid">
                  {DONENESS_LEVELS.map((level) => (
                    <ChoiceTile
                      key={level.id}
                      active={donenessId === level.id}
                      title={level.label}
                      copy={`Sortie finale vers ${level.tempFinal}°C`}
                      onClick={() => {
                        setDonenessId(level.id)
                        resetDerivedState()
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="pm-card">
            <div className="pm-sec-label"><span>04</span><span>Fumoir et service</span></div>
            <div className="calculator-mini-grid">
              <div>
                <label className="pm-field-label">Temperature fumoir</label>
                <input
                  className="pm-input"
                  type="range"
                  min={smokerRange[0]}
                  max={smokerRange[1]}
                  step="1"
                  value={smokerTemp}
                  onChange={(event) => {
                    setSmokerTemp(toNumber(event.target.value, smokerTemp))
                    setResult(null)
                  }}
                />
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{smokerRange[0]}°C min</div>
                  <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: 'var(--ember)', lineHeight: 1 }}>
                    {smokerTemp}°C
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{smokerRange[1]}°C max</div>
                </div>
              </div>

              <div>
                <label className="pm-field-label">Heure de service</label>
                <input
                  className="pm-input"
                  type="time"
                  value={serveTime}
                  onChange={(event) => {
                    setServeTime(event.target.value)
                    setResult(null)
                  }}
                />
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                  C’est l’heure a laquelle tu veux servir, pas l’heure a laquelle tu veux commencer a tester.
                </div>
              </div>
            </div>

            {showWrapChoices ? (
              <div style={{ marginTop: 14 }}>
                <label className="pm-field-label">Wrap</label>
                <div className="calculator-choices">
                  {WRAP_TYPES.map((option) => (
                    <ChoiceTile
                      key={option.id}
                      active={wrapType === option.id}
                      title={option.label}
                      copy={option.copy}
                      onClick={() => {
                        setWrapType(option.id)
                        setResult(null)
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="pm-btn-secondary"
            onClick={() => setShowAdvanced((current) => !current)}
          >
            {showAdvanced ? 'Masquer les reglages avances' : 'Afficher les reglages avances'}
          </button>

          {showAdvanced ? (
            <div className="pm-card fade-up">
              <div className="calculator-mini-grid">
                <div>
                  <label className="pm-field-label">Type de fumoir</label>
                  <select
                    className="pm-input"
                    value={smokerType}
                    onChange={(event) => {
                      setSmokerType(event.target.value)
                      setResult(null)
                    }}
                  >
                    {SMOKER_TYPES.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </div>
                {!isReverseSearMeat ? (
                  <div>
                    <label className="pm-field-label">Persillage</label>
                    <select
                      className="pm-input"
                      value={marbling}
                      onChange={(event) => {
                        setMarbling(event.target.value)
                        setResult(null)
                      }}
                    >
                      {MARBLING_TYPES.map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>

              {!isReverseSearMeat ? (
                <div style={{ marginTop: 14 }}>
                  <label className="pm-field-label">Temperature de depart de la viande</label>
                  <div className="calculator-mini-grid">
                    {[
                      { value: 4, label: 'Sortie frigo' },
                      { value: 12, label: 'Temperee' },
                      { value: 20, label: 'Presque ambiante' },
                    ].map((option) => (
                      <ChoiceTile
                        key={option.value}
                        active={startTemp === option.value}
                        title={option.label}
                        copy={`${option.value}°C`}
                        onClick={() => {
                          setStartTemp(option.value)
                          setResult(null)
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {warnings.length > 0 ? (
            <div className="calculator-warning">
              {warnings.map((warning) => (
                <div key={warning}>• {warning}</div>
              ))}
            </div>
          ) : null}

          <button type="button" className="pm-btn-primary" onClick={calculate} disabled={loading}>
            {loading ? 'Calcul en cours...' : 'Calculer mon plan'}
          </button>
        </div>

        <div className="calculator-stack">
          {result ? (
            <>
              <ResultHero result={result} meatLabel={meatLabel} />

              {resultIsStale ? (
                <div className="calculator-stale">
                  <span>Des reglages ont change depuis le dernier calcul. Le plan affiche n’est peut-etre plus le bon.</span>
                  <button type="button" className="pm-btn-secondary" style={{ width: 'auto' }} onClick={calculate}>
                    Recalculer
                  </button>
                </div>
              ) : null}

              <div className="pm-card">
                <div className="pm-sec-label"><span>Actions</span><span>Garder et partager</span></div>
                <div className="calculator-actions">
                  <button type="button" className="pm-btn-primary" onClick={saveSession} disabled={saving}>
                    {saving ? 'Sauvegarde...' : user ? 'Garder dans l’historique' : 'Se connecter pour garder'}
                  </button>
                  <button type="button" className="pm-btn-secondary" onClick={addToJournal} disabled={savingJournal}>
                    {savingJournal ? 'Ajout...' : user ? 'Ajouter au journal' : 'Se connecter pour noter'}
                  </button>
                  <button type="button" className="pm-btn-secondary" onClick={sharePlan} disabled={sharing}>
                    {sharing ? 'Partage...' : 'Partager'}
                  </button>
                  <button type="button" className="pm-btn-secondary" onClick={downloadPlan}>
                    Exporter le plan
                  </button>
                </div>
                {!user ? (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>
                    Sans compte tu peux utiliser le calculateur librement. Le compte sert surtout a retrouver tes plans et construire ton journal de cuisson.
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <PreviewCard
              meatLabel={meatLabel}
              methodLabel={availableMethods[0]?.label || 'Plan de cuisson'}
              serveTime={serveTime}
              copy={actionPreviewText}
              imageSrc={heroImageSrc}
              onImageError={() => setHeroImageSrc(SMOKE_IMAGE)}
              isReverseSear={isReverseSearMeat}
            />
          )}

          <div className="pm-card">
            <div className="pm-sec-label"><span>Ce que tu vas obtenir</span><span>Lecture simple</span></div>
            <div className="calculator-visuals">
              {[
                'Une heure de depart prudente pour ne pas courir apres le service.',
                'Une vraie fenetre de service, pas une minute magique inventee.',
                'Des reperes a surveiller: bark, stall, texture, sonde, repos.',
                'Des blocs guides et materiel relies a la viande sans casser le flow.',
              ].map((item) => (
                <div key={item} className="calculator-visual-item">{item}</div>
              ))}
            </div>
          </div>

          {localMeatData?.woods?.length ? (
            <div className="pm-card">
              <div className="pm-sec-label"><span>Bois utiles</span><span>Base de depart</span></div>
              <div className="calculator-visuals">
                {localMeatData.woods.slice(0, 4).map((wood) => (
                  <div key={wood.n} className="calculator-visual-item">
                    <strong style={{ color: 'var(--text)' }}>{wood.e} {wood.n}</strong>
                    <div style={{ marginTop: 6 }}>{wood.d}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="calculator-sticky-bar">
        <button type="button" className="pm-btn-primary" style={{ width: '100%' }} onClick={calculate} disabled={loading}>
          {loading ? 'Calcul en cours...' : 'Calculer le plan'}
        </button>
      </div>

      <SeoBlocksSection title="Guides et materiel" kicker="Apres le calculateur" blocks={afterCalculatorSeoBlocks} />

      {result ? (
        <>
          <SeoBlocksSection title="Pour cette cuisson" kicker="Guides et recommandations" blocks={afterResultSeoBlocks} />

          <div className="pm-card">
            <div className="pm-sec-label"><span>Roadmap</span><span>Grandes etapes</span></div>
            <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>
              Une feuille de route simple: on donne les heures utiles au depart et au service, puis des reperes honnêtes entre les deux.
            </div>
            <div className="calculator-roadmap">
              {roadmap.map((step) => (
                <div key={step.id} className="calculator-roadmap-item">
                  <div className="calculator-roadmap-icon">{step.icon}</div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>{step.title}</div>
                      {step.badge ? <div className="calculator-roadmap-badge">{step.badge}</div> : null}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{step.copy}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SeoBlocksSection title="Sous la roadmap" kicker="FAQ, guides et affiliation" blocks={afterTimelineSeoBlocks} />

          <div className="pm-card">
            <div className="pm-sec-label"><span>Ce qu’il faut surveiller</span><span>Repères utiles</span></div>
            <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>
              Les temperatures t’aident. Les vrais verdicts restent la bark, la texture, la souplesse et la sonde.
            </div>
            <div className="calculator-cues">
              {cueCards.map((cue) => (
                <div key={cue.title} className="calculator-cue-card">
                  <div className="calculator-summary-label">{cue.title}</div>
                  <div className="calculator-cue-value">{cue.value}</div>
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>{cue.copy}</div>
                </div>
              ))}
            </div>

            {visualNotes.length ? (
              <div style={{ marginTop: 14 }}>
                <div className="pm-field-label" style={{ marginBottom: 10 }}>Repères visuels</div>
                <div className="calculator-visuals">
                  {visualNotes.map((note) => (
                    <div key={note} className="calculator-visual-item">{note}</div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {showRecalibration ? (
            <div className="pm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div className="pm-sec-label" style={{ marginBottom: 4 }}><span>Recalage</span><span>En cours de cuisson</span></div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>
                    Si tu veux savoir si la cuisson est en avance ou en retard, rentre la temperature interne actuelle.
                  </div>
                </div>
                <button type="button" className="pm-btn-secondary" style={{ width: 'auto' }} onClick={() => setShowRecal((current) => !current)}>
                  {showRecal ? 'Masquer' : 'Afficher'}
                </button>
              </div>

              {showRecal ? (
                <>
                  <div className="calculator-recal-grid">
                    <div>
                      <label className="pm-field-label">Temperature interne</label>
                      <input className="pm-input" type="number" value={currentTempC} placeholder="Ex: 68" onChange={(event) => setCurrentTempC(event.target.value)} />
                    </div>
                    <div>
                      <label className="pm-field-label">Temps ecoule</label>
                      <input className="pm-input" type="number" value={elapsedMin} placeholder="Ex: 240" onChange={(event) => setElapsedMin(event.target.value)} />
                    </div>
                    <div>
                      <label className="pm-field-label">Temperature pit reelle</label>
                      <input className="pm-input" type="number" value={currentPitTemp} placeholder="Optionnel" onChange={(event) => setCurrentPitTemp(event.target.value)} />
                    </div>
                  </div>

                  <button type="button" className="pm-btn-secondary" onClick={runRecalibration}>
                    Recaler la cuisson
                  </button>

                  {recalResult ? (
                    <div style={{ marginTop: 12 }} className="calculator-kpi-grid">
                      {[
                        { label: 'T° attendue', value: recalResult.expectedTempC != null ? `${recalResult.expectedTempC}°C` : '—', copy: recalResult.currentPhase },
                        { label: 'Ecart', value: recalResult.deviation != null ? `${recalResult.deviation > 0 ? '+' : ''}${recalResult.deviation}°C` : '—', copy: recalResult.alert || 'Lecture terrain par rapport au scenario moyen.' },
                        { label: 'Temps restant', value: formatDuration(recalResult.remainingTotalMin), copy: recalResult.action || 'Continue a piloter surtout a la texture.' },
                      ].map((item) => (
                        <div key={item.label} className="calculator-kpi">
                          <div className="calculator-summary-label">{item.label}</div>
                          <div className="calculator-kpi-value">{item.value}</div>
                          <div className="calculator-kpi-copy">{item.copy}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}

          {(localMeatData?.rubs?.length || localMeatData?.woods?.length) ? (
            <div className="calculator-triple-grid">
              {localMeatData?.rubs?.length ? (
                <div className="pm-card" style={{ marginBottom: 0 }}>
                  <div className="pm-sec-label"><span>Rub</span><span>Base utile</span></div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>
                    {localMeatData.rubs[0].name}
                  </div>
                  <div className="calculator-visuals">
                    {localMeatData.rubs[0].ingr.slice(0, 5).map((item) => (
                      <div key={`${item.n}-${item.q}`} className="calculator-visual-item">
                        <strong style={{ color: 'var(--text)' }}>{item.n}</strong> · {item.q}
                      </div>
                    ))}
                  </div>
                  {localMeatData.rubs[0].note ? (
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>
                      {localMeatData.rubs[0].note}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {localMeatData?.woods?.length ? (
                <div className="pm-card" style={{ marginBottom: 0 }}>
                  <div className="pm-sec-label"><span>Bois</span><span>Qui collent bien</span></div>
                  <div className="calculator-visuals">
                    {localMeatData.woods.slice(0, 4).map((wood) => (
                      <div key={wood.n} className="calculator-visual-item">
                        <strong style={{ color: 'var(--text)' }}>{wood.e} {wood.n}</strong>
                        <div style={{ marginTop: 6 }}>{wood.d}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="pm-card" style={{ marginBottom: 0 }}>
                <div className="pm-sec-label"><span>Suite</span><span>Passer en mode cuisson</span></div>
                <div className="calculator-visuals">
                  <div className="calculator-visual-item">Tu veux suivre la cuisson en temps reel ? Lance ensuite la session et garde ce plan comme reference terrain.</div>
                  <div className="calculator-visual-item">Si tu as de l’avance, donne-la au repos plutot que de pousser la viande jusqu’au service.</div>
                </div>
                <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                  <button
                    type="button"
                    className="pm-btn-primary"
                    onClick={() => {
                      navigate('/app/session', {
                        state: {
                          schedule: { ...result },
                          startedAt: new Date().toISOString(),
                        },
                      })
                    }}
                  >
                    Lancer la session
                  </button>
                  <button
                    type="button"
                    className="pm-btn-secondary"
                    onClick={() => {
                      resetDerivedState()
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    Nouveau calcul
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <SeoBlocksSection title="Pour aller plus loin" kicker="Guides, conseils et affiliation" blocks={bottomSeoBlocks} />
    </div>
  )
}
