import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useSnack } from '../../components/Snack'
import Snack from '../../components/Snack'

const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .fade-up{animation:fadeUp 0.2s ease both}
  .adm-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;padding:20px;margin-bottom:12px}
  .member-row{display:grid;grid-template-columns:1fr 100px 120px 120px;gap:12px;padding:12px 0;border-bottom:1px solid #1e1a14;align-items:center}
  .member-row:last-child{border-bottom:none}
  .pm-input{background:#0e0c0a;border:1px solid #252018;border-radius:9px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:13px;padding:9px 12px;outline:none;transition:all 0.15s;width:100%}
  .pm-input:focus{border-color:#e85d04;box-shadow:0 0 0 3px rgba(232,93,4,0.07)}
  .plan-badge{display:inline-flex;align-items:center;padding:3px 8px;border-radius:5px;font-size:10px;font-weight:700;letter-spacing:0.5px;font-family:'Syne',sans-serif;text-transform:uppercase}
  .action-btn{padding:5px 10px;border-radius:6px;border:none;font-size:11px;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;transition:all 0.15s}
  select{-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238a7060' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px!important}
`

const PLAN_STYLES = {
  free: { bg:'rgba(100,100,100,0.15)', border:'rgba(100,100,100,0.3)', color:'#8a8a8a' },
  pro: { bg:'rgba(232,93,4,0.12)', border:'rgba(232,93,4,0.3)', color:'#e85d04' },
  ultra: { bg:'rgba(244,140,6,0.12)', border:'rgba(244,140,6,0.3)', color:'#f48c06' },
}

export default function AdminMembers() {
  const { snack, showSnack } = useSnack()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [banReason, setBanReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadMembers() }, [])

  async function loadMembers() {
    setLoading(true)
    // Récupérer les utilisateurs depuis auth.users via sessions
    const { data: sessions } = await supabase.from('sessions').select('user_id, created_at').order('created_at', { ascending:false })
    const { data: journals } = await supabase.from('cook_journal').select('user_id')
    const { data: profiles } = await supabase.from('profiles').select('*')

    // Construire la liste des membres uniques
    const userMap = {}
    sessions?.forEach(s => {
      if (!userMap[s.user_id]) userMap[s.user_id] = { user_id: s.user_id, sessions: 0, journal: 0, last_activity: s.created_at, plan: 'free', banned: false }
      userMap[s.user_id].sessions++
    })
    journals?.forEach(j => {
      if (userMap[j.user_id]) userMap[j.user_id].journal++
    })
    profiles?.forEach(p => {
      if (userMap[p.user_id]) {
        userMap[p.user_id] = { ...userMap[p.user_id], ...p }
      }
    })

    setMembers(Object.values(userMap))
    setLoading(false)
  }

  async function updatePlan(userId, plan) {
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({ user_id: userId, plan }, { onConflict: 'user_id' })
    setSaving(false)
    if (error) { showSnack('Erreur: ' + error.message, 'error'); return }
    setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, plan } : m))
    showSnack('Plan mis à jour !')
  }

  async function banUser(userId) {
    if (!banReason.trim()) { showSnack('Raison du ban obligatoire', 'error'); return }
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({ user_id: userId, banned: true, ban_reason: banReason, banned_at: new Date().toISOString() }, { onConflict: 'user_id' })
    setSaving(false)
    if (error) { showSnack('Erreur: ' + error.message, 'error'); return }
    setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, banned: true, ban_reason: banReason } : m))
    setSelected(null); setBanReason('')
    showSnack('Utilisateur banni.')
  }

  async function unbanUser(userId) {
    const { error } = await supabase.from('profiles').upsert({ user_id: userId, banned: false, ban_reason: null }, { onConflict: 'user_id' })
    if (error) { showSnack('Erreur: ' + error.message, 'error'); return }
    setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, banned: false } : m))
    showSnack('Utilisateur débanni.')
  }

  const filtered = members.filter(m => {
    if (filter === 'banned' && !m.banned) return false
    if (filter === 'pro' && m.plan !== 'pro') return false
    if (filter === 'ultra' && m.plan !== 'ultra') return false
    return true
  })

  const shortId = id => id?.slice(0, 8) + '...'

  return (
    <div className="fade-up" style={{ fontFamily:'DM Sans,sans-serif' }}>
      <style>{css}</style>
      <Snack snack={snack} />

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#fff', letterSpacing:'-0.5px' }}>
          Membres <span style={{ color:'#e85d04' }}>·</span>
        </h1>
        <p style={{ fontSize:11, color:'#8a7060', marginTop:6, letterSpacing:'1.5px', textTransform:'uppercase', fontWeight:600 }}>
          {members.length} utilisateurs · {members.filter(m=>m.plan==='pro').length} Pro · {members.filter(m=>m.banned).length} bannis
        </p>
      </div>

      {/* FILTRES */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {[{v:'all',l:'Tous'},{v:'pro',l:'Pro'},{v:'ultra',l:'Ultra'},{v:'banned',l:'Bannis'}].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)} style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${filter===f.v?'rgba(232,93,4,0.4)':'#1e1a14'}`, background:filter===f.v?'rgba(232,93,4,0.1)':'#171410', color:filter===f.v?'#e85d04':'#6a5a4a', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}>
            {f.l}
          </button>
        ))}
        <input className="pm-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher par ID..." style={{ flex:1, minWidth:200 }} />
      </div>

      {/* TABLE */}
      <div className="adm-card">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 120px 120px', gap:12, padding:'0 0 10px', borderBottom:'1px solid #252018', marginBottom:4 }}>
          {['Utilisateur', 'Sessions', 'Plan', 'Actions'].map(h => (
            <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#3a2e24' }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding:'20px 0', color:'#4a3a2e', fontSize:13 }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'20px 0', color:'#4a3a2e', fontSize:13, textAlign:'center' }}>Aucun membre</div>
        ) : filtered.map((m, i) => (
          <div key={m.user_id} className="member-row">
            <div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:12, color: m.banned ? '#ef4444' : '#d4c4b0' }}>
                {shortId(m.user_id)}
                {m.banned && <span style={{ marginLeft:6, fontSize:10, fontWeight:700, color:'#ef4444' }}>● BANNI</span>}
              </div>
              <div style={{ fontSize:10, color:'#4a3a2e', marginTop:2 }}>
                📓 {m.journal} notes · Dernière: {m.last_activity ? new Date(m.last_activity).toLocaleDateString('fr-FR') : '—'}
              </div>
            </div>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:13, color:'#8a7060' }}>{m.sessions}x</div>
            <div>
              <select value={m.plan || 'free'} onChange={e => updatePlan(m.user_id, e.target.value)}
                style={{ background:PLAN_STYLES[m.plan||'free'].bg, border:`1px solid ${PLAN_STYLES[m.plan||'free'].border}`, borderRadius:6, color:PLAN_STYLES[m.plan||'free'].color, fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, padding:'4px 24px 4px 8px', outline:'none', cursor:'pointer' }}>
                <option value="free" style={{ background:'#171410', color:'#fff' }}>FREE</option>
                <option value="pro" style={{ background:'#171410', color:'#fff' }}>PRO</option>
                <option value="ultra" style={{ background:'#171410', color:'#fff' }}>ULTRA</option>
              </select>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {m.banned ? (
                <button className="action-btn" onClick={() => unbanUser(m.user_id)} style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', color:'#22c55e' }}>
                  Débannir
                </button>
              ) : (
                <button className="action-btn" onClick={() => setSelected(m)} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444' }}>
                  Bannir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL BAN */}
      {selected && (
        <>
          <div onClick={() => setSelected(null)} style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.7)' }} />
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:101, background:'#171410', border:'1px solid rgba(239,68,68,0.3)', borderRadius:16, padding:24, width:400, maxWidth:'90vw' }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, color:'#ef4444', marginBottom:8 }}>🚫 Bannir cet utilisateur</div>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#6a5a4a', marginBottom:16 }}>{shortId(selected.user_id)}</div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#6a5a4a', marginBottom:8 }}>Raison du ban</label>
              <input className="pm-input" value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Spam, abus, violation CGU..." />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <button onClick={() => banUser(selected.user_id)} disabled={saving} style={{ padding:'11px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'#fff', fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                Confirmer le ban
              </button>
              <button onClick={() => { setSelected(null); setBanReason('') }} style={{ padding:'11px', borderRadius:9, border:'1px solid #252018', background:'transparent', color:'#8a7060', fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                Annuler
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
