import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../modules/supabase/client'
import { useSnack } from '../../../components/useSnack'
import Snack from '../../../components/Snack'

const css = `
  .adm-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;padding:20px;margin-bottom:12px}
  .member-row{display:grid;grid-template-columns:minmax(0,1.6fr) 120px 120px 140px;gap:12px;padding:12px 0;border-bottom:1px solid #1e1a14;align-items:center}
  .member-row:last-child{border-bottom:none}
  .pm-input{background:#0e0c0a;border:1px solid #252018;border-radius:9px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:13px;padding:9px 12px;outline:none;transition:all 0.15s;width:100%}
  .pm-input:focus{border-color:#e85d04;box-shadow:0 0 0 3px rgba(232,93,4,0.07)}
  select{-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238a7060' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px!important}
  @media(max-width:900px){
    .member-row{grid-template-columns:1fr;gap:8px}
  }
`

const ROLE_STYLES = {
  member: { bg:'rgba(100,100,100,0.15)', border:'rgba(100,100,100,0.3)', color:'#b7aea4' },
  editor: { bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.3)', color:'#fbbf24' },
  admin: { bg:'rgba(232,93,4,0.12)', border:'rgba(232,93,4,0.3)', color:'#e85d04' },
  super_admin: { bg:'rgba(220,38,38,0.12)', border:'rgba(220,38,38,0.3)', color:'#f87171' },
}

const STATUS_STYLES = {
  active: { color:'#22c55e' },
  pending: { color:'#f59e0b' },
  disabled: { color:'#ef4444' },
}

export default function AdminMembersPage() {
  const { snack, showSnack } = useSnack()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  const loadMembers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, status, account_status, plan_code, created_at, last_seen_at')
      .order('created_at', { ascending: false })

    if (error) {
      showSnack(`Erreur chargement membres : ${error.message}`, 'error')
      setMembers([])
      setLoading(false)
      return
    }

    setMembers(data || [])
    setLoading(false)
  }, [showSnack])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMembers()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadMembers])

  async function updateMember(id, patch) {
    setSavingId(id)
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, email, first_name, last_name, role, status, account_status, plan_code, created_at, last_seen_at')
      .single()

    setSavingId(null)

    if (error) {
      showSnack(`Erreur : ${error.message}`, 'error')
      return
    }

    setMembers((prev) => prev.map((row) => (row.id === id ? data : row)))
    showSnack('Membre mis à jour')
  }

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return members.filter((m) => {
      if (filterRole !== 'all' && m.role !== filterRole) return false
      if (!needle) return true
      const fullName = [m.first_name, m.last_name].filter(Boolean).join(' ').toLowerCase()
      return (
        String(m.id || '').toLowerCase().includes(needle) ||
        String(m.email || '').toLowerCase().includes(needle) ||
        fullName.includes(needle)
      )
    })
  }, [members, search, filterRole])

  return (
    <div style={{ fontFamily:'DM Sans,sans-serif' }}>
      <style>{css}</style>
      <Snack snack={snack} />

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#fff', letterSpacing:'-0.5px' }}>
          Membres <span style={{ color:'#e85d04' }}>·</span>
        </h1>
        <p style={{ fontSize:11, color:'#8a7060', marginTop:6, letterSpacing:'1.5px', textTransform:'uppercase', fontWeight:600 }}>
          {members.length} profils Supabase · rôles et statuts en direct
        </p>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {['all', 'member', 'editor', 'admin', 'super_admin'].map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            style={{
              padding:'6px 14px',
              borderRadius:8,
              border:`1px solid ${filterRole === role ? 'rgba(232,93,4,0.4)' : '#1e1a14'}`,
              background:filterRole === role ? 'rgba(232,93,4,0.1)' : '#171410',
              color:filterRole === role ? '#e85d04' : '#6a5a4a',
              fontFamily:'Syne,sans-serif',
              fontSize:12,
              fontWeight:700,
              cursor:'pointer',
            }}
          >
            {role === 'all' ? 'Tous' : role}
          </button>
        ))}

        <input
          className="pm-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Rechercher par email, nom ou UUID..."
          style={{ flex:1, minWidth:220 }}
        />
      </div>

      <div className="adm-card">
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1.6fr) 120px 120px 140px', gap:12, padding:'0 0 10px', borderBottom:'1px solid #252018', marginBottom:4 }}>
          {['Utilisateur', 'Rôle', 'Statut', 'Plan'].map((h) => (
            <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#3a2e24' }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding:'20px 0', color:'#4a3a2e', fontSize:13 }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'20px 0', color:'#4a3a2e', fontSize:13, textAlign:'center' }}>Aucun profil</div>
        ) : filtered.map((m) => {
          const roleStyle = ROLE_STYLES[m.role] || ROLE_STYLES.member
          const statusStyle = STATUS_STYLES[m.status] || STATUS_STYLES.active
          const fullName = [m.first_name, m.last_name].filter(Boolean).join(' ')
          return (
            <div key={m.id} className="member-row">
              <div>
                <div style={{ fontSize:14, color:'#f5f1ea', fontWeight:600 }}>{fullName || 'Utilisateur sans nom'}</div>
                <div style={{ fontSize:12, color:'#b7aea4', marginTop:2 }}>{m.email || 'Email absent'}</div>
                <div style={{ fontFamily:'DM Mono, monospace', fontSize:11, color:'#6a5a4a', marginTop:4 }}>{m.id}</div>
                <div style={{ fontSize:11, color:'#6a5a4a', marginTop:4 }}>
                  Créé le {m.created_at ? new Date(m.created_at).toLocaleDateString('fr-FR') : '—'}
                  {' · '}
                  Vu le {m.last_seen_at ? new Date(m.last_seen_at).toLocaleDateString('fr-FR') : '—'}
                </div>
              </div>

              <div>
                <select
                  value={m.role || 'member'}
                  onChange={(e) => updateMember(m.id, { role: e.target.value })}
                  disabled={savingId === m.id}
                  style={{
                    width:'100%',
                    background:roleStyle.bg,
                    border:`1px solid ${roleStyle.border}`,
                    borderRadius:8,
                    color:roleStyle.color,
                    fontFamily:'Syne,sans-serif',
                    fontSize:11,
                    fontWeight:700,
                    padding:'8px 28px 8px 10px',
                    outline:'none',
                    cursor:'pointer',
                  }}
                >
                  <option value="member">member</option>
                  <option value="editor">editor</option>
                  <option value="admin">admin</option>
                  <option value="super_admin">super_admin</option>
                </select>
              </div>

              <div>
                <select
                  value={m.status || 'active'}
                  onChange={(e) => updateMember(m.id, { status: e.target.value, account_status: e.target.value === 'disabled' ? 'suspended' : 'active' })}
                  disabled={savingId === m.id}
                  style={{
                    width:'100%',
                    background:'#0e0c0a',
                    border:'1px solid #252018',
                    borderRadius:8,
                    color:statusStyle.color,
                    fontFamily:'Syne,sans-serif',
                    fontSize:11,
                    fontWeight:700,
                    padding:'8px 28px 8px 10px',
                    outline:'none',
                    cursor:'pointer',
                  }}
                >
                  <option value="active">active</option>
                  <option value="pending">pending</option>
                  <option value="disabled">disabled</option>
                </select>
              </div>

              <div>
                <select
                  value={m.plan_code || 'free'}
                  onChange={(e) => updateMember(m.id, { plan_code: e.target.value })}
                  disabled={savingId === m.id}
                  style={{
                    width:'100%',
                    background:'#0e0c0a',
                    border:'1px solid #252018',
                    borderRadius:8,
                    color:'#d4c4b0',
                    fontFamily:'Syne,sans-serif',
                    fontSize:11,
                    fontWeight:700,
                    padding:'8px 28px 8px 10px',
                    outline:'none',
                    cursor:'pointer',
                  }}
                >
                  <option value="free">free</option>
                  <option value="pro">pro</option>
                  <option value="ultra">ultra</option>
                </select>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
