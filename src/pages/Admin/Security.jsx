import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../modules/supabase/client'
import { useSnack } from '../../components/useSnack'
import Snack from '../../components/Snack'

const css = `
  .adm-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;padding:20px;margin-bottom:12px}
  .pm-input{background:#0e0c0a;border:1px solid #252018;border-radius:9px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:13px;padding:9px 12px;outline:none;transition:all 0.15s;width:100%}
  .pm-input:focus{border-color:#e85d04;box-shadow:0 0 0 3px rgba(232,93,4,0.07)}
  .field-label{display:block;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6a5a4a;margin-bottom:7px;font-family:'DM Sans',sans-serif}
  .ip-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #1e1a14;gap:12px}
  .ip-row:last-child{border-bottom:none}
`

export default function AdminSecurity() {
  const { snack, showSnack } = useSnack()
  const [bannedIPs, setBannedIPs] = useState([])
  const [newIP, setNewIP] = useState('')
  const [newReason, setNewReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadBannedIPs = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('banned_ips').select('*').order('banned_at', { ascending:false })
    setBannedIPs(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadBannedIPs()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadBannedIPs])

  async function banIP() {
    if (!newIP.trim()) { showSnack('IP obligatoire', 'error'); return }
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(newIP.trim())) { showSnack('Format IP invalide (ex: 192.168.1.1)', 'error'); return }
    setSaving(true)
    const { error } = await supabase.from('banned_ips').insert({ ip: newIP.trim(), reason: newReason.trim() || 'Non spécifié', banned_at: new Date().toISOString() })
    setSaving(false)
    if (error) { showSnack('Erreur: ' + error.message, 'error'); return }
    showSnack('IP bannie !')
    setNewIP(''); setNewReason('')
    await loadBannedIPs()
  }

  async function unbanIP(id) {
    await supabase.from('banned_ips').delete().eq('id', id)
    showSnack('IP débannie')
    await loadBannedIPs()
  }

  return (
    <div style={{ fontFamily:'DM Sans,sans-serif' }}>
      <style>{css}</style>
      <Snack snack={snack} />

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#fff', letterSpacing:'-0.5px' }}>
          Sécurité <span style={{ color:'#e85d04' }}>·</span>
        </h1>
        <p style={{ fontSize:11, color:'#8a7060', marginTop:6, letterSpacing:'1.5px', textTransform:'uppercase', fontWeight:600 }}>
          IPs bannies · Logs · Accès
        </p>
      </div>

      {/* STATS */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
        {[
          { label:'IPs bannies', value: bannedIPs.length, color:'#ef4444', icon:'🚫' },
          { label:'Dernière menace', value: bannedIPs[0] ? new Date(bannedIPs[0].banned_at).toLocaleDateString('fr-FR') : '—', color:'#f48c06', icon:'⚠️' },
          { label:'Statut', value:'Opérationnel', color:'#22c55e', icon:'✅' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#171410', border:'1px solid #1e1a14', borderRadius:12, padding:'16px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${s.color},transparent)`, opacity:0.5 }} />
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:10, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e' }}>{s.label}</span>
              <span style={{ fontSize:16 }}>{s.icon}</span>
            </div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* BANNIR IP */}
      <div className="adm-card">
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e', marginBottom:16 }}>🚫 Bannir une IP</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:10 }}>
          <div>
            <label className="field-label">Adresse IP</label>
            <input className="pm-input" value={newIP} onChange={e=>setNewIP(e.target.value)} placeholder="192.168.1.1" />
          </div>
          <div>
            <label className="field-label">Raison</label>
            <input className="pm-input" value={newReason} onChange={e=>setNewReason(e.target.value)} placeholder="Spam, attaque, abus..." />
          </div>
          <div style={{ display:'flex', alignItems:'flex-end' }}>
            <button onClick={banIP} disabled={saving} style={{ padding:'9px 16px', borderRadius:9, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.1)', color:'#ef4444', fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', height:40 }}>
              Bannir
            </button>
          </div>
        </div>
      </div>

      {/* LISTE IPs */}
      <div className="adm-card">
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e', marginBottom:16 }}>
          Liste des IPs bannies ({bannedIPs.length})
        </div>
        {loading ? (
          <div style={{ color:'#4a3a2e', fontSize:13 }}>Chargement...</div>
        ) : bannedIPs.length === 0 ? (
          <div style={{ color:'#4a3a2e', fontSize:13, textAlign:'center', padding:'20px 0' }}>✅ Aucune IP bannie</div>
        ) : bannedIPs.map(ip => (
          <div key={ip.id} className="ip-row">
            <div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:14, color:'#ef4444', fontWeight:600 }}>{ip.ip}</div>
              <div style={{ fontSize:11, color:'#4a3a2e', marginTop:2 }}>
                {ip.reason} · {new Date(ip.banned_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <button onClick={() => unbanIP(ip.id)} style={{ padding:'5px 12px', borderRadius:7, border:'1px solid rgba(34,197,94,0.3)', background:'rgba(34,197,94,0.08)', color:'#22c55e', fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, cursor:'pointer' }}>
              Débannir
            </button>
          </div>
        ))}
      </div>

      {/* INFO SUPABASE ROW LEVEL SECURITY */}
      <div style={{ background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:12, padding:'16px', marginTop:4 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#60a5fa', marginBottom:8 }}>ℹ️ Note sur la sécurité</div>
        <div style={{ fontSize:12, color:'#4a6a8a', lineHeight:1.7 }}>
          Les IPs bannies sont stockées dans Supabase. Pour un blocage effectif au niveau réseau, configure les règles dans ton hébergeur (Vercel, Netlify, o2switch).<br/>
          Le ban utilisateur dans "Membres" bloque l accès applicatif immédiatement.
        </div>
      </div>
    </div>
  )
}
