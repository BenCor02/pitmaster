import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCookDashboardMetrics } from '../../../modules/cooks/repository'

const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .fade-up{animation:fadeUp 0.2s ease both}
  .stat-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;padding:22px;position:relative;overflow:hidden;transition:border-color 0.15s}
  .stat-card:hover{border-color:#252018}
  .adm-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;padding:20px;margin-bottom:12px}
  .adm-table-row{display:grid;padding:10px 0;border-bottom:1px solid #1e1a14;font-size:13px;align-items:center}
  .adm-table-row:last-child{border-bottom:none}
  .badge-plan{display:inline-flex;align-items:center;padding:3px 8px;border-radius:5px;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;font-family:'Syne',sans-serif}
`

function StatCard({ label, value, sub, color = '#e85d04', icon, trend }) {
  return (
    <div className="stat-card">
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${color},transparent)`, opacity:0.5 }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e', fontFamily:'DM Sans,sans-serif' }}>{label}</span>
        <span style={{ fontSize:18 }}>{icon}</span>
      </div>
      <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:36, color, lineHeight:1, letterSpacing:'-1px' }}>{value}</div>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
        {trend && <span style={{ fontSize:11, fontWeight:700, color: trend > 0 ? '#22c55e' : '#ef4444' }}>{trend > 0 ? '+' : ''}{trend}%</span>}
        {sub && <span style={{ fontSize:11, color:'#4a3a2e' }}>{sub}</span>}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ users:0, sessions:0, journal:0, parties:0 })
  const [recentSessions, setRecentSessions] = useState([])
  const [meatStats, setMeatStats] = useState([])
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const metrics = await fetchCookDashboardMetrics()
      setStats(metrics.stats)
      setRecentSessions(metrics.recentSessions)
      setMeatStats(metrics.meatStats)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadStats()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadStats])

  const MEAT_EMOJIS = { Brisket:'🥩', 'Pulled Pork':'🐷', 'Spare Ribs':'🍖', 'Beef Ribs':'🦴', 'Poulet entier':'🐔', 'Cuisses poulet':'🐓', 'Epaule agneau':'🐑', 'Poitrine porc':'🥓' }

  return (
    <div className="fade-up" style={{ fontFamily:'DM Sans,sans-serif' }}>
      <style>{css}</style>

      {/* TITRE */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#fff', letterSpacing:'-0.5px' }}>
          Dashboard <span style={{ color:'#e85d04' }}>·</span>
        </h1>
        <p style={{ fontSize:11, color:'#8a7060', marginTop:6, letterSpacing:'1.5px', textTransform:'uppercase', fontWeight:600 }}>
          Vue globale Charbon & Flamme
        </p>
      </div>

      {/* STATS GRID */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        <StatCard label="Utilisateurs actifs" value={loading ? '...' : stats.users} icon="👥" color="#e85d04" trend={8} sub="ce mois" />
        <StatCard label="Sessions totales" value={loading ? '...' : stats.sessions} icon="🔥" color="#f48c06" trend={12} sub="calculs" />
        <StatCard label="Entrées journal" value={loading ? '...' : stats.journal} icon="📓" color="#22c55e" sub="notes" />
        <StatCard label="Cook Parties" value={loading ? '...' : stats.parties} icon="🎉" color="#3b82f6" sub="parties" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* VIANDES LES PLUS CUISINÉES */}
        <div className="adm-card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e' }}>🏆 Top viandes</div>
          </div>
          {loading ? <div style={{ color:'#4a3a2e', fontSize:13 }}>Chargement...</div> :
            meatStats.length === 0 ? <div style={{ color:'#4a3a2e', fontSize:13 }}>Aucune session</div> :
            meatStats.map((m, i) => (
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:14 }}>{MEAT_EMOJIS[m.name] || '🥩'}</span>
                    <span style={{ fontSize:13, color:'#c4b4a0', fontWeight: i === 0 ? 600 : 400, fontFamily: i === 0 ? 'Syne,sans-serif' : 'DM Sans,sans-serif' }}>{m.name}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:'#8a7060' }}>{m.count}x</span>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color: i === 0 ? '#e85d04' : '#4a3a2e' }}>{m.pct}%</span>
                  </div>
                </div>
                <div style={{ height:3, background:'#1e1a14', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${m.pct}%`, background: i === 0 ? 'linear-gradient(90deg,#f48c06,#e85d04)' : '#2a2418', borderRadius:2, transition:'width 0.5s ease' }} />
                </div>
              </div>
            ))
          }
        </div>

        {/* SESSIONS RÉCENTES */}
        <div className="adm-card">
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e', marginBottom:16 }}>⏱️ Sessions récentes</div>
          {loading ? <div style={{ color:'#4a3a2e', fontSize:13 }}>Chargement...</div> :
            recentSessions.length === 0 ? <div style={{ color:'#4a3a2e', fontSize:13 }}>Aucune session</div> :
            recentSessions.map((s, i) => (
              <div key={i} className="adm-table-row" style={{ gridTemplateColumns:'1fr auto auto' }}>
                <div>
                  <div style={{ fontSize:13, color:'#d4c4b0', fontWeight:500, fontFamily:'Syne,sans-serif' }}>{s.meat_name}</div>
                  <div style={{ fontSize:10, color:'#4a3a2e', marginTop:1 }}>{s.date} · {s.serve_time}</div>
                </div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#e85d04' }}>{s.start_time}</div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#6a5a4a' }}>{s.smoker_temp}°C</div>
              </div>
            ))
          }
        </div>
      </div>

      {/* ACTIONS RAPIDES */}
      <div className="adm-card" style={{ marginTop:12 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e', marginBottom:16 }}>⚡ Actions rapides</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {[
            { label:'Ajouter une viande', icon:'🥩', path:'/admin/meats' },
            { label:'Gérer les membres', icon:'👥', path:'/admin/members' },
            { label:'Modifier les plans', icon:'💳', path:'/admin/plans' },
            { label:'Paramètres SEO', icon:'⚙️', path:'/admin/settings' },
          ].map((a, i) => (
            <div key={i} onClick={() => navigate(a.path)} style={{ padding:'14px 12px', borderRadius:10, border:'1px solid #1e1a14', background:'#0e0c0a', textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:8, cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(232,93,4,0.3)'; e.currentTarget.style.background='rgba(232,93,4,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#1e1a14'; e.currentTarget.style.background='#0e0c0a' }}>
              <span style={{ fontSize:22 }}>{a.icon}</span>
              <span style={{ fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, color:'#6a5a4a', textAlign:'center', lineHeight:1.3 }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
