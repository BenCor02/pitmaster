import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../modules/supabase/client'
import { useSnack } from '../../../components/useSnack'
import Snack from '../../../components/Snack'
import { formatCapabilityLimit, getAccessMeta } from '../../../modules/access/catalog'

const CAPABILITIES = [
  { key:'calc_uses',       icon:'🔥', label:'Calculs BBQ',           desc:'Nombre de calculs de cuisson autorises', period:'total' },
  { key:'session_saves',   icon:'☁️', label:'Sessions sauvegardees', desc:'Historique des sessions', period:'total' },
  { key:'journal_entries', icon:'📓', label:'Entrees journal',       desc:'Notes de cuisson', period:'total' },
  { key:'party_meats',     icon:'🍽️', label:'Viandes simultanees',   desc:'Nombre de viandes dans Cook Party', period:'total' },
  { key:'cold_uses',       icon:'❄️', label:'Fumage a froid',        desc:'Calculs SSV et fumage', period:'total' },
  { key:'ask_ai_daily',    icon:'🤠', label:'Questions pitmaster',   desc:'Assistant de questions BBQ', period:'daily' },
  { key:'history_access',  icon:'🕘', label:'Historique',            desc:'Consultation de l historique', period:'total' },
  { key:'export_pdf',      icon:'📄', label:'Exports',               desc:'Telechargements PDF', period:'total' },
  { key:'custom_meats',    icon:'🥩', label:'Viandes custom',        desc:'Ajout de viandes perso', period:'total' },
  { key:'advanced_stats',  icon:'📊', label:'Stats cuisson',         desc:'Statistiques detaillees', period:'total' },
]

const css = `
  .adm-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;padding:20px;margin-bottom:12px}
  .pm-input{background:#0e0c0a;border:1px solid #252018;border-radius:9px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:13px;padding:8px 12px;outline:none;transition:all 0.15s;width:100%}
  .pm-input:focus{border-color:#e85d04;box-shadow:0 0 0 3px rgba(232,93,4,0.07)}
  .field-label{display:block;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6a5a4a;margin-bottom:6px;font-family:'DM Sans',sans-serif}
  .panel-tab{padding:8px 16px;border-radius:8px;border:1px solid;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s}
  .cap-grid{display:grid;grid-template-columns:1.3fr repeat(3, minmax(110px, 1fr));gap:0;border:1px solid #1e1a14;border-radius:12px;overflow:hidden}
  .cap-header{background:#0e0c0a;padding:10px 14px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#3a2e24;font-family:'DM Sans',sans-serif}
  .cap-row{display:contents}
  .cap-cell{padding:12px 14px;border-top:1px solid #1e1a14;display:flex;align-items:center;background:#171410}
  .cap-cell:hover{background:#1a1610}
  .limit-input{background:#0e0c0a;border:1px solid #252018;border-radius:7px;color:#d4c4b0;font-family:'DM Mono',monospace;font-size:13px;padding:6px 10px;outline:none;width:80px;text-align:center;transition:all 0.15s}
  .limit-input:focus{border-color:#e85d04}
`

export default function AdminAccessPage() {
  const { snack, showSnack } = useSnack()
  const [tiers, setTiers] = useState([])
  const [limits, setLimits] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('capabilities')

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [tiersRes, limitsRes] = await Promise.all([
      supabase.from('plans').select('*').order('sort_order'),
      supabase.from('plan_features').select('*'),
    ])

    setTiers(tiersRes.data || [])

    const next = {}
    limitsRes.data?.forEach((row) => {
      if (!next[row.plan_key]) next[row.plan_key] = {}
      next[row.plan_key][row.feature_key] = row.limit_value
    })
    setLimits(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAll()
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadAll])

  function setLimit(planKey, featureKey, value) {
    setLimits((prev) => ({
      ...prev,
      [planKey]: { ...prev[planKey], [featureKey]: Number.isFinite(parseInt(value, 10)) ? parseInt(value, 10) : 0 },
    }))
  }

  function updateTier(planKey, field, value) {
    setTiers((prev) => prev.map((tier) => (tier.key === planKey ? { ...tier, [field]: value } : tier)))
  }

  async function saveAll() {
    setSaving(true)

    for (const tier of tiers) {
      const { error } = await supabase.from('plans').upsert({
        ...tier,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' })
      if (error) {
        setSaving(false)
        showSnack(`Erreur plans: ${error.message}`, 'error')
        return
      }
    }

    const rows = []
    Object.entries(limits).forEach(([planKey, capabilityMap]) => {
      Object.entries(capabilityMap).forEach(([featureKey, limitValue]) => {
        rows.push({
          plan_key: planKey,
          feature_key: featureKey,
          limit_value: parseInt(limitValue, 10),
          updated_at: new Date().toISOString(),
        })
      })
    })

    const { error } = await supabase.from('plan_features').upsert(rows, { onConflict: 'plan_key,feature_key' })
    setSaving(false)

    if (error) {
      showSnack(`Erreur limites: ${error.message}`, 'error')
      return
    }

    showSnack('Acces atelier mis a jour.')
  }

  const PLAN_COLORS = {
    free: '#6a5a4a',
    pro: '#e85d04',
    ultra: '#f48c06',
  }

  if (loading) {
    return <div style={{ color:'#4a3a2e', padding:40, fontFamily:'DM Sans,sans-serif' }}>Chargement…</div>
  }

  return (
    <div style={{ fontFamily:'DM Sans,sans-serif' }}>
      <style>{css}</style>
      <Snack snack={snack} />

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#fff', letterSpacing:'-0.5px' }}>
          Acces <span style={{ color:'#e85d04' }}>&</span> capacites
        </h1>
        <p style={{ fontSize:11, color:'#8a7060', marginTop:6, letterSpacing:'1.5px', textTransform:'uppercase', fontWeight:600 }}>
          Regles atelier · Changements immediats
        </p>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[
          { id:'capabilities', label:'🎛️ Limites & capacites' },
          { id:'display', label:'🪪 Niveaux & affichage' },
          { id:'preview', label:'👁️ Apercu' },
        ].map((tab) => (
          <button
            key={tab.id}
            className="panel-tab"
            onClick={() => setActiveTab(tab.id)}
            style={{
              borderColor: activeTab === tab.id ? 'rgba(232,93,4,0.4)' : '#1e1a14',
              background: activeTab === tab.id ? 'rgba(232,93,4,0.1)' : '#171410',
              color: activeTab === tab.id ? '#e85d04' : '#6a5a4a',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'capabilities' && (
        <div>
          <div style={{ background:'rgba(244,140,6,0.05)', border:'1px solid rgba(244,140,6,0.15)', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:12, color:'#8a7060', lineHeight:1.7 }}>
            <strong style={{ color:'#f48c06' }}>Guide des valeurs :</strong>
            <span style={{ marginLeft:8 }}><code style={{ background:'#0e0c0a', padding:'1px 6px', borderRadius:4, fontFamily:'DM Mono,monospace', color:'#e85d04' }}>-1</code> = Illimite</span>
            <span style={{ marginLeft:8 }}><code style={{ background:'#0e0c0a', padding:'1px 6px', borderRadius:4, fontFamily:'DM Mono,monospace', color:'#ef4444' }}>0</code> = Desactive</span>
            <span style={{ marginLeft:8 }}><code style={{ background:'#0e0c0a', padding:'1px 6px', borderRadius:4, fontFamily:'DM Mono,monospace', color:'#d4c4b0' }}>3</code> = Limite simple</span>
          </div>

          <div className="cap-grid" style={{ marginBottom:16 }}>
            <div className="cap-header">Capacite</div>
            {tiers.map((tier) => (
              <div key={tier.key} className="cap-header" style={{ color: PLAN_COLORS[tier.key], textAlign:'center' }}>
                {tier.name}
              </div>
            ))}

            {CAPABILITIES.map((capability) => (
              <div key={capability.key} className="cap-row">
                <div className="cap-cell">
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>{capability.icon}</span>
                    <div>
                      <div style={{ fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:13, color:'#d4c4b0' }}>{capability.label}</div>
                      <div style={{ fontSize:10, color:'#3a2e24', marginTop:1 }}>{capability.desc}</div>
                    </div>
                  </div>
                </div>
                {tiers.map((tier) => {
                  const value = limits[tier.key]?.[capability.key] ?? 0
                  return (
                    <div key={tier.key} className="cap-cell" style={{ justifyContent:'center' }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                        <input
                          type="number"
                          className="limit-input"
                          value={value}
                          min={-1}
                          onChange={(event) => setLimit(tier.key, capability.key, event.target.value)}
                          style={{
                            borderColor: value === -1 ? 'rgba(34,197,94,0.3)' : value === 0 ? 'rgba(239,68,68,0.3)' : 'rgba(232,93,4,0.3)',
                            color: value === -1 ? '#22c55e' : value === 0 ? '#ef4444' : '#d4c4b0',
                          }}
                        />
                        <span style={{ fontSize:10, color: value === -1 ? '#22c55e' : value === 0 ? '#ef4444' : '#6a5a4a', fontFamily:'Syne,sans-serif', fontWeight:700 }}>
                          {formatCapabilityLimit(value, capability.key)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'display' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {tiers.map((tier) => (
            <div key={tier.key} className="adm-card" style={{ border:`1px solid ${PLAN_COLORS[tier.key]}30` }}>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, color:PLAN_COLORS[tier.key], marginBottom:16 }}>{tier.name}</div>

              <div style={{ marginBottom:12 }}>
                <label className="field-label">Nom affiche</label>
                <input className="pm-input" value={tier.name} onChange={(event) => updateTier(tier.key, 'name', event.target.value)} />
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="field-label">Description</label>
                <input className="pm-input" value={tier.description || ''} onChange={(event) => updateTier(tier.key, 'description', event.target.value)} />
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="field-label">Badge</label>
                <input className="pm-input" value={tier.badge || ''} onChange={(event) => updateTier(tier.key, 'badge', event.target.value)} placeholder="Optionnel" />
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="field-label">Couleur accent</label>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input type="color" value={tier.color || PLAN_COLORS[tier.key] || '#6a5a4a'} onChange={(event) => updateTier(tier.key, 'color', event.target.value)} style={{ width:36, height:36, borderRadius:7, border:'1px solid #252018', cursor:'pointer' }} />
                  <input className="pm-input" value={tier.color || ''} onChange={(event) => updateTier(tier.key, 'color', event.target.value)} style={{ fontFamily:'DM Mono,monospace', flex:1 }} />
                </div>
              </div>
              <div>
                <label className="field-label">Code interne</label>
                <input className="pm-input" value={tier.key || ''} disabled style={{ fontFamily:'DM Mono,monospace', fontSize:12, opacity:0.7 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'preview' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {tiers.map((tier) => (
            <div key={tier.key} style={{ background:`linear-gradient(160deg,${(tier.color || PLAN_COLORS[tier.key])}10,#171410)`, border:`1px solid ${(tier.color || PLAN_COLORS[tier.key])}40`, borderRadius:16, padding:24, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${tier.color || PLAN_COLORS[tier.key]},transparent)` }} />
              {tier.badge ? <div style={{ position:'absolute', top:12, right:12, background:tier.color || PLAN_COLORS[tier.key], color:'#fff', fontSize:9, fontWeight:800, letterSpacing:'1px', padding:'2px 8px', borderRadius:4, fontFamily:'Syne,sans-serif' }}>{tier.badge}</div> : null}

              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:tier.color || PLAN_COLORS[tier.key], marginBottom:4 }}>{tier.name}</div>
              <div style={{ fontSize:11, color:'#4a3a2e', marginBottom:14 }}>{tier.description}</div>
              <div style={{ fontSize:12, color:'#d4c4b0', marginBottom:18, lineHeight:1.6 }}>
                {getAccessMeta(tier.key)?.description || 'Niveau d acces configure pour l atelier.'}
              </div>

              {CAPABILITIES.map((capability) => {
                const value = limits[tier.key]?.[capability.key] ?? 0
                const enabled = value !== 0
                return (
                  <div key={capability.key} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:12 }}>
                    <span style={{ color: enabled ? '#22c55e' : '#2a2218', fontSize:11 }}>{enabled ? '✓' : '✗'}</span>
                    <span style={{ color: enabled ? '#d4c4b0' : '#2a2218' }}>
                      {value === -1 ? `${capability.label} illimite` : value === 0 ? capability.label : `${capability.label} (${formatCapabilityLimit(value, capability.key)})`}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      <button onClick={saveAll} disabled={saving} style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(232,93,4,0.25)', marginTop:16 }}>
        {saving ? 'Sauvegarde en cours...' : 'Sauvegarder et appliquer'}
      </button>
    </div>
  )
}
