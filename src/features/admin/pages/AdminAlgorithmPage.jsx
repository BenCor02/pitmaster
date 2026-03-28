import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../modules/supabase/client'
import { invalidateAdjustmentsCache } from '../../../lib/engineLoader'
import { BASE_COEFFS, PHASE_BASES } from '../../../lib/calculator'

const MEAT_LABELS = {
  brisket:'Brisket', pork_shoulder:'Épaule Porc', ribs_pork:'Spare Ribs',
  ribs_baby_back:'Baby Back', ribs_beef:'Beef Ribs', paleron:'Paleron',
  plat_de_cote:'Plat de Côte', lamb_shoulder:'Épaule Agneau',
}

function Card({ children, style }) {
  return <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:20, marginBottom:12, ...style }}>{children}</div>
}

function Badge({ status }) {
  const cfg = {
    pending:  { bg:'rgba(232,146,10,0.12)',  color:'var(--gold)',  label:'En attente' },
    approved: { bg:'rgba(52,211,153,0.12)',  color:'var(--green)', label:'Approuvé' },
    rejected: { bg:'rgba(248,113,113,0.12)', color:'var(--red)',   label:'Rejeté' },
  }[status] || { bg:'var(--surface2)', color:'var(--text3)', label:status }
  return <span style={{ padding:'3px 10px', borderRadius:50, background:cfg.bg, color:cfg.color, fontSize:11, fontWeight:700 }}>{cfg.label}</span>
}

// ─── ONGLET 1 : COEFFICIENTS ──────────────────────────────────────────────
function TabCoefficients({ coeffs, onRefresh }) {
  const [editing, setEditing] = useState(null) // { id, value }
  const [saving, setSaving] = useState(false)
  const [snack, setSnack] = useState('')

  async function saveEdit() {
    if (!editing) return
    setSaving(true)
    const { error } = await supabase
      .from('base_coefficients')
      .update({ value: parseFloat(editing.value) })
      .eq('id', editing.id)
    setSaving(false)
    if (error) { setSnack('❌ Erreur : ' + error.message); return }
    setSnack('✅ Coefficient mis à jour')
    setEditing(null)
    onRefresh()
    setTimeout(() => setSnack(''), 3000)
  }

  // Grouper par phase
  const grouped = {}
  coeffs.forEach(c => {
    const key = c.meat_type || 'global'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(c)
  })

  return (
    <div>
      {snack && <div style={{ padding:'10px 14px', background:'var(--surface2)', borderRadius:10, marginBottom:12, fontSize:12, color:'var(--text2)' }}>{snack}</div>}
      {Object.entries(grouped).map(([group, rows]) => (
        <Card key={group}>
          <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:14 }}>
            {MEAT_LABELS[group] || group.toUpperCase()}
          </div>
          {rows.map(row => (
            <div key={row.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{row.parameter}</div>
                <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>{row.description || row.phase}</div>
              </div>
              {editing?.id === row.id ? (
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input type="number" value={editing.value} step="0.01"
                    onChange={e => setEditing(ev => ({...ev, value: e.target.value}))}
                    style={{ width:80, padding:'5px 8px', borderRadius:8, border:'1.5px solid var(--orange)', background:'var(--surface2)', color:'var(--text)', fontSize:13, fontFamily:'DM Mono, monospace' }} />
                  <button onClick={saveEdit} disabled={saving}
                    style={{ padding:'5px 12px', borderRadius:50, background:'var(--orange)', color:'#fff', border:'none', fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:11, cursor:'pointer' }}>
                    {saving ? '...' : 'OK'}
                  </button>
                  <button onClick={() => setEditing(null)}
                    style={{ padding:'5px 10px', borderRadius:50, background:'var(--surface2)', color:'var(--text3)', border:'1px solid var(--border)', fontSize:11, cursor:'pointer' }}>
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontFamily:'DM Mono, monospace', fontWeight:700, fontSize:16, color:'var(--orange)' }}>{row.value}</span>
                  <span style={{ fontSize:10, color:'var(--text3)' }}>{row.unit}</span>
                  <button onClick={() => setEditing({ id: row.id, value: row.value })}
                    style={{ padding:'4px 10px', borderRadius:50, border:'1px solid var(--border)', background:'var(--surface2)', color:'var(--text3)', fontSize:11, cursor:'pointer' }}>
                    ✏️
                  </button>
                </div>
              )}
            </div>
          ))}
        </Card>
      ))}
    </div>
  )
}

// ─── ONGLET 2 : SUGGESTIONS ───────────────────────────────────────────────
function TabSuggestions({ suggestions, onRefresh }) {
  const [editVal, setEditVal] = useState({})
  const [loading, setLoading] = useState(null)

  async function review(id, status, modifiedValue = null) {
    setLoading(id)
    const updates = { status, reviewed_by: (await supabase.auth.getUser()).data.user?.id, reviewed_at: new Date().toISOString() }
    if (modifiedValue) updates.suggested_value = parseFloat(modifiedValue)

    const { error } = await supabase.from('coefficient_suggestions').update(updates).eq('id', id)
    if (!error && status === 'approved') {
      // Créer l'ajustement approuvé + nouvelle version
      const s = suggestions.find(s => s.id === id)
      const finalVal = modifiedValue ? parseFloat(modifiedValue) : s.suggested_value
      await supabase.from('approved_adjustments').insert({
        category: s.category, parameter: s.parameter,
        base_value: s.current_value, adjustment_value: finalVal,
        suggestion_id: id, approved_by: updates.reviewed_by,
      })
      await supabase.from('algorithm_versions').insert({
        version_name: `v${new Date().toISOString().slice(0,10)}-${s.category}`,
        description: `Ajustement ${s.parameter} pour ${s.category} : ${s.current_value} → ${finalVal}`,
        snapshot: { approved_at: new Date().toISOString(), parameter: s.parameter, old: s.current_value, new: finalVal },
        is_active: false,
      })
      invalidateAdjustmentsCache()
    }
    setLoading(null)
    onRefresh()
  }

  const pending   = suggestions.filter(s => s.status === 'pending')
  const reviewed  = suggestions.filter(s => s.status !== 'pending')

  return (
    <div>
      <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:15, color:'var(--text)', marginBottom:16 }}>
        {pending.length} suggestion{pending.length !== 1 ? 's' : ''} en attente
      </div>
      {pending.length === 0 && <div style={{ textAlign:'center', padding:'32px', color:'var(--text3)', fontSize:13 }}>Aucune suggestion en attente</div>}
      {pending.map(s => (
        <Card key={s.id} style={{ border:'1px solid var(--orange-border)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
            <div>
              <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:14, color:'var(--text)' }}>
                {MEAT_LABELS[s.category] || s.category} · {s.parameter}
              </div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>{s.rationale}</div>
            </div>
            <Badge status={s.status} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
            {[
              { label:'Valeur actuelle', val:s.current_value, color:'var(--text2)' },
              { label:'Suggestion',      val:s.suggested_value, color:'var(--orange)' },
              { label:'Δ',               val:(s.delta_percent > 0 ? '+' : '') + s.delta_percent + '%', color: s.delta_percent > 0 ? 'var(--green)' : 'var(--red)' },
            ].map(f => (
              <div key={f.label} style={{ background:'var(--surface2)', borderRadius:10, padding:'10px', textAlign:'center' }}>
                <div style={{ fontSize:9, color:'var(--text3)', textTransform:'uppercase', marginBottom:4 }}>{f.label}</div>
                <div style={{ fontFamily:'DM Mono, monospace', fontWeight:700, fontSize:18, color:f.color }}>{f.val}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:10, color:'var(--text3)', marginBottom:12 }}>
            {s.sample_size} cuissons · confiance {s.confidence_score}%
          </div>
          {/* Valeur modifiable avant approbation */}
          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12 }}>
            <span style={{ fontSize:11, color:'var(--text3)', flexShrink:0 }}>Valeur à appliquer :</span>
            <input type="number" step="0.001"
              value={editVal[s.id] ?? s.suggested_value}
              onChange={e => setEditVal(v => ({...v, [s.id]: e.target.value}))}
              style={{ width:90, padding:'5px 10px', borderRadius:8, border:'1.5px solid var(--border)', background:'var(--surface2)', color:'var(--text)', fontSize:13, fontFamily:'DM Mono, monospace' }} />
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => review(s.id, 'approved', editVal[s.id])} disabled={loading===s.id}
              style={{ flex:1, padding:'10px', borderRadius:50, background:'var(--green)', color:'#fff', border:'none', fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:12, cursor:'pointer', opacity: loading===s.id?0.6:1 }}>
              {loading===s.id ? '...' : '✓ Approuver'}
            </button>
            <button onClick={() => review(s.id, 'rejected')} disabled={loading===s.id}
              style={{ flex:1, padding:'10px', borderRadius:50, background:'var(--surface2)', color:'var(--red)', border:'1px solid var(--red)', fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:12, cursor:'pointer' }}>
              ✕ Rejeter
            </button>
          </div>
        </Card>
      ))}
      {reviewed.length > 0 && (
        <div style={{ marginTop:24 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--text3)', marginBottom:12 }}>Historique</div>
          {reviewed.map(s => (
            <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize:12, color:'var(--text2)' }}>{MEAT_LABELS[s.category] || s.category} · {s.parameter}</span>
                <span style={{ fontSize:11, color:'var(--text3)', marginLeft:8 }}>{s.current_value} → {s.suggested_value}</span>
              </div>
              <Badge status={s.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── ONGLET 3 : VERSIONS ──────────────────────────────────────────────────
function TabVersions({ versions, onRefresh }) {
  const [loading, setLoading] = useState(null)

  async function rollback(versionId) {
    if (!confirm('Confirmer le rollback vers cette version ?')) return
    setLoading(versionId)
    // Désactiver toutes les versions, activer celle-ci
    await supabase.from('algorithm_versions').update({ is_active: false }).neq('id', versionId)
    await supabase.from('algorithm_versions').update({ is_active: true }).eq('id', versionId)
    invalidateAdjustmentsCache()
    setLoading(null)
    onRefresh()
  }

  return (
    <div>
      {versions.map((v) => (
        <Card key={v.id}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <span style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:14, color:'var(--text)' }}>{v.version_name}</span>
                {v.is_active && <span style={{ padding:'3px 10px', borderRadius:50, background:'rgba(52,211,153,0.12)', color:'var(--green)', fontSize:11, fontWeight:700 }}>Active</span>}
              </div>
              <div style={{ fontSize:12, color:'var(--text2)', marginBottom:6 }}>{v.description}</div>
              <div style={{ fontSize:10, color:'var(--text3)' }}>{new Date(v.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
            </div>
            {!v.is_active && v.rollback_available && (
              <button onClick={() => rollback(v.id)} disabled={loading===v.id}
                style={{ padding:'8px 14px', borderRadius:50, border:'1px solid var(--border)', background:'var(--surface2)', color:'var(--text2)', fontFamily:'Syne, sans-serif', fontWeight:600, fontSize:11, cursor:'pointer', flexShrink:0 }}>
                {loading===v.id ? '...' : '↩ Rollback'}
              </button>
            )}
          </div>
          {v.snapshot && (
            <div style={{ marginTop:10, padding:'8px 12px', background:'var(--surface2)', borderRadius:8, fontFamily:'DM Mono, monospace', fontSize:10, color:'var(--text3)', whiteSpace:'pre-wrap', maxHeight:60, overflow:'hidden' }}>
              {JSON.stringify(v.snapshot, null, 2).slice(0, 150)}...
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

// ─── ONGLET 4 : STATISTIQUES ──────────────────────────────────────────────
function TabStats({ history }) {
  if (!history.length) return <div style={{ textAlign:'center', padding:'32px', color:'var(--text3)', fontSize:13 }}>Aucune donnée disponible</div>

  const withReal = history.filter(h => h.real_min && h.predicted_min)
  const avgError = withReal.length ? (withReal.reduce((a,b) => a + Math.abs(b.error_pct || 0), 0) / withReal.length).toFixed(1) : '-'
  const avgDelta = withReal.length ? Math.round(withReal.reduce((a,b) => a + Math.abs(b.error_min || 0), 0) / withReal.length) : '-'
  const within1h = withReal.filter(h => Math.abs(h.error_min || 0) <= 60).length
  const accuracy1h = withReal.length ? Math.round((within1h / withReal.length) * 100) : '-'

  // Par viande
  const byMeat = {}
  withReal.forEach(h => {
    if (!byMeat[h.meat_type]) byMeat[h.meat_type] = []
    byMeat[h.meat_type].push(Math.abs(h.error_pct || 0))
  })

  return (
    <div>
      {/* KPIs globaux */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10, marginBottom:20 }}>
        {[
          { label:'Cuissons', val:withReal.length, color:'var(--orange)' },
          { label:'Erreur moy.', val:avgError + '%', color:'var(--gold)' },
          { label:'Écart moy.', val:avgDelta + 'min', color: parseFloat(avgDelta) <= 60 ? 'var(--green)' : 'var(--red)' },
          { label:'Précision ±1h', val:accuracy1h + '%', color: parseFloat(accuracy1h) >= 70 ? 'var(--green)' : 'var(--red)' },
        ].map(k => (
          <div key={k.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'14px', textAlign:'center' }}>
            <div style={{ fontSize:9, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>{k.label}</div>
            <div style={{ fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:22, color:k.color }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Par viande */}
      <Card>
        <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:14 }}>Précision par viande</div>
        {Object.entries(byMeat).map(([meat, errors]) => {
          const avg = (errors.reduce((a,b) => a+b, 0) / errors.length).toFixed(1)
          const pct = parseFloat(avg)
          return (
            <div key={meat} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:120, fontSize:12, color:'var(--text2)' }}>{MEAT_LABELS[meat] || meat}</div>
              <div style={{ flex:1, height:6, background:'var(--surface2)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.min(pct * 5, 100)}%`, background: pct <= 10 ? 'var(--green)' : pct <= 20 ? 'var(--gold)' : 'var(--red)', borderRadius:3 }} />
              </div>
              <div style={{ fontFamily:'DM Mono, monospace', fontSize:12, color: pct <= 10 ? 'var(--green)' : pct <= 20 ? 'var(--gold)' : 'var(--red)', width:50, textAlign:'right' }}>±{avg}%</div>
              <div style={{ fontSize:10, color:'var(--text3)', width:40, textAlign:'right' }}>{errors.length}x</div>
            </div>
          )
        })}
      </Card>

      {/* Dernières cuissons */}
      <Card>
        <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:14 }}>Dernières cuissons</div>
        {history.slice(0, 10).map(h => (
          <div key={h.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:12 }}>
            <div style={{ flex:1, color:'var(--text2)' }}>{MEAT_LABELS[h.meat_type] || h.meat_type} · {h.weight_kg}kg · {h.smoker_type}</div>
            <div style={{ fontFamily:'DM Mono, monospace', color:'var(--text3)' }}>{Math.floor((h.predicted_min||0)/60)}h</div>
            <div style={{ fontFamily:'DM Mono, monospace', color:'var(--text)' }}>{Math.floor((h.real_min||0)/60)}h</div>
            <div style={{ fontFamily:'DM Mono, monospace', fontSize:11, color: Math.abs(h.error_min||0) <= 60 ? 'var(--green)' : 'var(--red)', width:55, textAlign:'right' }}>
              {h.error_min > 0 ? '+' : ''}{h.error_min}min
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────
export default function AdminAlgorithmPage() {
  const [tab, setTab] = useState('coeffs')
  const [coeffs, setCoeffs]           = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [versions, setVersions]       = useState([])
  const [history, setHistory]         = useState([])
  const [loading, setLoading]         = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [c, s, v, h] = await Promise.all([
      supabase.from('base_coefficients').select('*').order('meat_type').order('phase').order('parameter'),
      supabase.from('coefficient_suggestions').select('*').order('created_at', { ascending:false }).limit(50),
      supabase.from('algorithm_versions').select('*').order('created_at', { ascending:false }).limit(20),
      supabase.from('cook_history').select('*').order('created_at', { ascending:false }).limit(100),
    ])
    setCoeffs(c.data || [])
    setSuggestions(s.data || [])
    setVersions(v.data || [])
    setHistory(h.data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [load])

  const pendingCount = suggestions.filter(s => s.status === 'pending').length

  const TABS = [
    { id:'coeffs',      label:'⚙️ Coefficients' },
    { id:'suggestions', label:`💡 Suggestions${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    { id:'versions',    label:'📦 Versions' },
    { id:'stats',       label:'📊 Statistiques' },
  ]

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif" }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:22, color:'var(--text)' }}>
          Algorithme <span style={{ color:'var(--orange)' }}>BBQ</span>
        </h2>
        <p style={{ fontSize:11, color:'var(--text3)', marginTop:4, letterSpacing:'1.5px', textTransform:'uppercase', fontWeight:600 }}>
          Coefficients · Suggestions · Versioning · Statistiques
        </p>
      </div>

      {/* TABS */}
      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:'9px 16px', borderRadius:50, border:`1.5px solid ${tab===t.id?'var(--orange-border)':'var(--border)'}`, background: tab===t.id?'var(--orange-bg)':'var(--surface2)', color: tab===t.id?'var(--orange)':'var(--text2)', fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:12, cursor:'pointer', transition:'all 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'40px', color:'var(--text3)' }}>
          <div style={{ width:24, height:24, border:'2px solid var(--orange)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 12px' }} />
          Chargement...
        </div>
      ) : (
        <>
          {tab === 'coeffs'      && <TabCoefficients  coeffs={coeffs}           onRefresh={load} />}
          {tab === 'suggestions' && <TabSuggestions   suggestions={suggestions} onRefresh={load} />}
          {tab === 'versions'    && <TabVersions      versions={versions}       onRefresh={load} />}
          {tab === 'stats'       && <TabStats         history={history} />}
        </>
      )}
    </div>
  )
}
