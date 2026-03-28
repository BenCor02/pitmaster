export const ACCESS_LEVEL_META = {
  free: {
    key: 'free',
    label: 'Mode decouverte',
    shortLabel: 'Decouverte',
    tone: '#8a7060',
    accent: 'rgba(138,112,96,0.2)',
    description: 'Pour tester le calculateur, preparer un service simple et garder quelques reperes.',
  },
  pro: {
    key: 'pro',
    label: 'Atelier pitmaster',
    shortLabel: 'Atelier',
    tone: '#e85d04',
    accent: 'rgba(232,93,4,0.2)',
    description: 'Pour cuisiner souvent, garder ses sessions et travailler avec plus de marge.',
  },
  ultra: {
    key: 'ultra',
    label: 'Service feu',
    shortLabel: 'Service',
    tone: '#f48c06',
    accent: 'rgba(244,140,6,0.2)',
    description: 'Pour les gros volumes, les essais nombreux et les usages intensifs.',
  },
}

export const CAPABILITY_INFO = {
  calc_uses:        { icon: '🔥', label: 'Calculs BBQ', period: 'total', unit: 'calculs' },
  session_saves:    { icon: '☁️', label: 'Sessions sauvegardees', period: 'total', unit: 'sessions' },
  journal_entries:  { icon: '📓', label: 'Entrees journal', period: 'total', unit: 'entrees' },
  party_meats:      { icon: '🍽️', label: 'Viandes simultanees', period: 'total', unit: 'viandes' },
  cold_uses:        { icon: '❄️', label: 'Fumage a froid', period: 'total', unit: 'calculs' },
  ask_ai_daily:     { icon: '🤠', label: 'Questions pitmaster', period: 'daily', unit: 'questions' },
  history_access:   { icon: '🕘', label: 'Historique', period: 'total', unit: 'acces' },
  export_pdf:       { icon: '📄', label: 'Exports', period: 'total', unit: 'exports' },
  custom_meats:     { icon: '🥩', label: 'Viandes personnalisees', period: 'total', unit: 'viandes' },
  advanced_stats:   { icon: '📊', label: 'Stats cuisson', period: 'total', unit: 'acces' },
}

export function getAccessMeta(planKey = 'free') {
  return ACCESS_LEVEL_META[planKey] || ACCESS_LEVEL_META.free
}

export function formatCapabilityLimit(limitValue, capabilityKey) {
  if (limitValue === undefined || limitValue === null) return 'Libre'
  if (limitValue === -1 || limitValue === Infinity) return 'Illimite'
  if (limitValue === 0) return 'Desactive'

  const info = CAPABILITY_INFO[capabilityKey]
  if (!info) return String(limitValue)
  if (info.period === 'daily') return `${limitValue} / jour`
  return `${limitValue}`
}
