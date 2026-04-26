/**
 * CHARBON & FLAMME — Stats du calculateur
 *
 * Toutes les requêtes d'agrégation pour la page Statistiques de l'admin.
 * Données brutes lues depuis calculator_logs (RLS = admin only).
 */

import { supabase } from './supabase.js'

const PERIODS = {
  '24h':  1,
  '7d':   7,
  '30d':  30,
  '90d':  90,
  'all':  null,
}

function sinceDate(period) {
  const days = PERIODS[period]
  if (days == null) return null
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

/**
 * Récupère tous les logs filtrés par période.
 * Retourne un tableau (paginé pour gros volumes).
 */
async function fetchLogs(period = 'all') {
  let query = supabase
    .from('calculator_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50000)

  const since = sinceDate(period)
  if (since) query = query.gte('created_at', since)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * KPIs principaux (totaux par fenêtre).
 * On fait 4 count(*) head:true en parallèle (efficace côté serveur).
 */
export async function getKpis() {
  const ranges = ['24h', '7d', '30d', 'all']
  const results = await Promise.all(
    ranges.map(async (key) => {
      let q = supabase
        .from('calculator_logs')
        .select('*', { count: 'exact', head: true })
      const since = sinceDate(key)
      if (since) q = q.gte('created_at', since)
      const { count, error } = await q
      if (error) throw error
      return [key, count ?? 0]
    })
  )
  return Object.fromEntries(results)
}

/**
 * Stats agrégées sur une période donnée.
 * Retourne :
 *   - total
 *   - topProfiles : [{ profile_id, profile_name, count }]
 *   - byCategory  : [{ category, count }]
 *   - daily       : [{ day: 'YYYY-MM-DD', count }]
 *   - hourly      : [{ hour: 0..23, count }]
 *   - avgWeight, avgTemp, wrapPct
 *   - topDoneness : [{ doneness, count }]
 *   - byCookType  : [{ cook_type, count }]
 */
export async function getStats(period = '30d') {
  const logs = await fetchLogs(period)

  const total = logs.length

  // Top profils
  const profileMap = new Map()
  logs.forEach((l) => {
    const key = l.profile_id || 'unknown'
    if (!profileMap.has(key)) {
      profileMap.set(key, {
        profile_id: l.profile_id,
        profile_name: l.profile_name || l.profile_id || 'Inconnu',
        category: l.category,
        count: 0,
      })
    }
    profileMap.get(key).count += 1
  })
  const topProfiles = [...profileMap.values()].sort((a, b) => b.count - a.count)

  // Par catégorie
  const catMap = new Map()
  logs.forEach((l) => {
    const k = l.category || 'autre'
    catMap.set(k, (catMap.get(k) || 0) + 1)
  })
  const byCategory = [...catMap.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  // Par cook_type
  const ctMap = new Map()
  logs.forEach((l) => {
    const k = l.cook_type || 'autre'
    ctMap.set(k, (ctMap.get(k) || 0) + 1)
  })
  const byCookType = [...ctMap.entries()]
    .map(([cook_type, count]) => ({ cook_type, count }))
    .sort((a, b) => b.count - a.count)

  // Par doneness
  const dnMap = new Map()
  logs.forEach((l) => {
    if (!l.doneness) return
    dnMap.set(l.doneness, (dnMap.get(l.doneness) || 0) + 1)
  })
  const topDoneness = [...dnMap.entries()]
    .map(([doneness, count]) => ({ doneness, count }))
    .sort((a, b) => b.count - a.count)

  // Série journalière
  const dayMap = new Map()
  logs.forEach((l) => {
    const day = (l.created_at || '').slice(0, 10)
    if (!day) return
    dayMap.set(day, (dayMap.get(day) || 0) + 1)
  })
  // Combler les jours sans data sur la fenêtre demandée
  const days = PERIODS[period] || 90
  const daily = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    daily.push({ day: key, count: dayMap.get(key) || 0 })
  }

  // Heatmap horaire (0-23)
  const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }))
  logs.forEach((l) => {
    const d = new Date(l.created_at)
    if (!isNaN(d)) hourly[d.getHours()].count += 1
  })

  // Moyennes
  const weights = logs.map((l) => l.weight_kg).filter((w) => w != null && w > 0)
  const temps = logs.map((l) => l.cook_temp_c).filter((t) => t != null && t > 0)
  const wrappedCount = logs.filter((l) => l.wrapped).length
  const avgWeight = weights.length ? weights.reduce((a, b) => a + b, 0) / weights.length : 0
  const avgTemp = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : 0
  const wrapPct = total ? (wrappedCount / total) * 100 : 0

  return {
    total,
    topProfiles,
    byCategory,
    byCookType,
    topDoneness,
    daily,
    hourly,
    avgWeight: Number(avgWeight.toFixed(2)),
    avgTemp: Math.round(avgTemp),
    wrapPct: Number(wrapPct.toFixed(1)),
  }
}

export const STATS_PERIODS = [
  { value: '24h', label: '24 h' },
  { value: '7d',  label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '90 jours' },
  { value: 'all', label: 'Tout' },
]
