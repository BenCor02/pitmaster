/**
 * StatisticsTab — Page admin "Statistiques calculateur"
 *
 * Affiche : KPIs, top viandes, répartition catégorie, série temporelle,
 * heatmap horaire, moyennes (poids, temp, wrap), top doneness.
 */

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { getKpis, getStats, STATS_PERIODS } from '../../lib/stats.js'

const CAT_LABELS = {
  boeuf:    { label: 'Boeuf',    icon: '🥩', color: '#ff6b1a' },
  porc:     { label: 'Porc',     icon: '🐷', color: '#f5a623' },
  agneau:   { label: 'Agneau',   icon: '🐑', color: '#d65d4e' },
  volaille: { label: 'Volaille', icon: '🍗', color: '#e8b341' },
  autre:    { label: 'Autre',    icon: '🍴', color: '#6b7280' },
}

const COOK_TYPE_LABELS = {
  low_slow:     'Low & Slow',
  hot_fast:     'Hot & Fast',
  reverse_sear: 'Reverse Sear',
  fixed:        'Temps fixe',
  autre:        'Autre',
}

const DONENESS_LABELS_FR = {
  bleu:         'Bleu',
  rare:         'Saignant',
  medium_rare:  'Medium-rare',
  medium:       'À point',
  medium_well:  'Medium-well',
  well_done:    'Bien cuit',
  rose:         'Rosé',
  a_point:      'À point',
  bien_cuit:    'Bien cuit',
}

export default function StatisticsTab() {
  const [period, setPeriod] = useState('30d')
  const [kpis, setKpis] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    Promise.all([getKpis(), getStats(period)])
      .then(([k, s]) => {
        if (!alive) return
        setKpis(k)
        setStats(s)
      })
      .catch((err) => {
        if (!alive) return
        setError(err.message || 'Erreur de chargement')
      })
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [period])

  if (loading && !stats) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff6b1a] to-red-600 flex items-center justify-center mx-auto mb-3 animate-pulse">
          <span className="text-lg">📊</span>
        </div>
        <p className="text-zinc-500 text-sm">Chargement des statistiques…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4">
        <p className="text-[13px] text-red-300">Erreur : {error}</p>
        <p className="text-[12px] text-zinc-500 mt-1">
          Vérifie que la migration <code>033_calculator_logs.sql</code> est exécutée.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ── Header + filtre période ───────────────────── */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-white tracking-tight">Statistiques calculateur</h2>
          <p className="text-[13px] text-zinc-500 mt-0.5">Usage anonyme — basé sur les logs publics</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          {STATS_PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all ${
                period === p.value
                  ? 'bg-[#ff6b1a]/15 text-[#ff8c4a]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPIs (toujours globaux) ──────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Aujourd'hui (24 h)" value={kpis?.['24h']} icon="⏱️" />
        <KpiCard label="7 derniers jours"   value={kpis?.['7d']}  icon="📅" />
        <KpiCard label="30 derniers jours"  value={kpis?.['30d']} icon="📈" />
        <KpiCard label="Total cumulé"       value={kpis?.['all']} icon="🔥" highlight />
      </div>

      {/* ── Activité dans le temps ───────────────────── */}
      <Card title="Activité dans le temps" subtitle={`Calculs par jour (${labelOf(period)})`}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.daily || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#52525b" fontSize={11} tickFormatter={shortDate} />
              <YAxis stroke="#52525b" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={fullDate} />
              <Line type="monotone" dataKey="count" stroke="#ff6b1a" strokeWidth={2} dot={{ fill: '#ff6b1a', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── Top viandes + Catégories (côte à côte) ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card title="Top viandes calculées" subtitle="Les 10 profils les plus populaires">
            {(stats?.topProfiles?.length || 0) === 0 ? (
              <Empty />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.topProfiles.slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="#52525b" fontSize={11} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="profile_name"
                      stroke="#a1a1aa"
                      fontSize={11}
                      width={140}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {stats.topProfiles.slice(0, 10).map((row, i) => (
                        <Cell key={i} fill={CAT_LABELS[row.category]?.color || '#ff6b1a'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        <Card title="Répartition par catégorie" subtitle="Toutes viandes confondues">
          {(stats?.byCategory?.length || 0) === 0 ? (
            <Empty />
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.byCategory}
                      dataKey="count"
                      nameKey="category"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {stats.byCategory.map((entry, i) => (
                        <Cell key={i} fill={CAT_LABELS[entry.category]?.color || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-3">
                {stats.byCategory.map((c) => {
                  const meta = CAT_LABELS[c.category] || CAT_LABELS.autre
                  const pct = stats.total ? ((c.count / stats.total) * 100).toFixed(1) : 0
                  return (
                    <div key={c.category} className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                        <span className="text-zinc-300">{meta.icon} {meta.label}</span>
                      </div>
                      <div className="text-zinc-500">
                        <span className="text-zinc-300 font-medium">{c.count}</span>
                        <span className="ml-2 tabular-nums">{pct}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* ── Stats détaillées : moyennes ──────────────── */}
      <Card title="Paramètres moyens" subtitle="Sur la période sélectionnée">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStat label="Poids moyen" value={stats?.avgWeight ? `${stats.avgWeight} kg` : '—'} />
          <MiniStat label="Température moyenne" value={stats?.avgTemp ? `${stats.avgTemp} °C` : '—'} />
          <MiniStat label="Cuissons avec wrap" value={`${stats?.wrapPct ?? 0}%`} />
          <MiniStat label="Total période" value={stats?.total ?? 0} />
        </div>
      </Card>

      {/* ── Heatmap horaire ──────────────────────────── */}
      <Card title="Activité par heure" subtitle="Quand les utilisateurs calculent (heure locale serveur)">
        {(stats?.total || 0) === 0 ? (
          <Empty />
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.hourly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="#52525b" fontSize={11} tickFormatter={(h) => `${h}h`} />
                <YAxis stroke="#52525b" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(h) => `${h}h00`} />
                <Bar dataKey="count" fill="#ff6b1a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* ── Top doneness + cook_type ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Cuissons préférées" subtitle="Reverse-sear et profils avec doneness">
          {(stats?.topDoneness?.length || 0) === 0 ? (
            <Empty hint="Aucune donnée de doneness sur cette période." />
          ) : (
            <div className="space-y-2">
              {stats.topDoneness.map((d) => {
                const max = stats.topDoneness[0].count
                const pct = (d.count / max) * 100
                return (
                  <div key={d.doneness}>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="text-zinc-300">{DONENESS_LABELS_FR[d.doneness] || d.doneness}</span>
                      <span className="text-zinc-500 tabular-nums">{d.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#ff6b1a] to-[#ff8c4a] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card title="Type de cuisson" subtitle="Low&Slow vs Hot&Fast vs Reverse Sear…">
          {(stats?.byCookType?.length || 0) === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-2">
              {stats.byCookType.map((c) => {
                const max = stats.byCookType[0].count
                const pct = (c.count / max) * 100
                return (
                  <div key={c.cook_type}>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="text-zinc-300">{COOK_TYPE_LABELS[c.cook_type] || c.cook_type}</span>
                      <span className="text-zinc-500 tabular-nums">{c.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-[#ff6b1a] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Tableau complet ──────────────────────────── */}
      <Card title="Tous les profils calculés" subtitle="Tableau détaillé">
        {(stats?.topProfiles?.length || 0) === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-zinc-500 border-b border-white/[0.06]">
                  <th className="py-2 pr-3 font-medium">#</th>
                  <th className="py-2 pr-3 font-medium">Profil</th>
                  <th className="py-2 pr-3 font-medium">Catégorie</th>
                  <th className="py-2 pr-3 font-medium text-right">Calculs</th>
                  <th className="py-2 pr-3 font-medium text-right">% du total</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProfiles.map((p, i) => {
                  const meta = CAT_LABELS[p.category] || CAT_LABELS.autre
                  const pct = stats.total ? ((p.count / stats.total) * 100).toFixed(1) : 0
                  return (
                    <tr key={p.profile_id || i} className="border-b border-white/[0.04]">
                      <td className="py-2 pr-3 text-zinc-600 tabular-nums">{i + 1}</td>
                      <td className="py-2 pr-3 text-zinc-200">{p.profile_name}</td>
                      <td className="py-2 pr-3 text-zinc-400">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-zinc-200 text-right tabular-nums font-medium">{p.count}</td>
                      <td className="py-2 pr-3 text-zinc-500 text-right tabular-nums">{pct}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

// ── Sous-composants ──────────────────────────────────

function KpiCard({ label, value, icon, highlight }) {
  return (
    <div className={`rounded-2xl border p-4 ${
      highlight
        ? 'border-[#ff6b1a]/25 bg-gradient-to-br from-[#ff6b1a]/[0.08] to-transparent'
        : 'border-white/[0.06] bg-white/[0.02]'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-zinc-500 uppercase tracking-wider">{label}</span>
        <span className="text-base">{icon}</span>
      </div>
      <div className="text-[26px] font-bold text-white tabular-nums tracking-tight">
        {value != null ? value.toLocaleString('fr-FR') : '—'}
      </div>
    </div>
  )
}

function Card({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <header className="mb-4">
        <h3 className="text-[14px] font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-[12px] text-zinc-500 mt-0.5">{subtitle}</p>}
      </header>
      {children}
    </section>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
      <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[18px] font-semibold text-white tabular-nums">{value}</div>
    </div>
  )
}

function Empty({ hint = 'Pas encore de données sur cette période.' }) {
  return (
    <div className="py-8 text-center text-zinc-500 text-[13px]">
      {hint}
    </div>
  )
}

// ── Utils ───────────────────────────────────────────

const tooltipStyle = {
  background: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  fontSize: 12,
  color: '#e4e4e7',
}

function shortDate(iso) {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

function fullDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function labelOf(period) {
  return STATS_PERIODS.find((p) => p.value === period)?.label || period
}
