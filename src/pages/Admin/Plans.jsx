import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useSnack } from '../../components/Snack'
import Snack from '../../components/Snack'

const FEATURE_KEYS = [
  { key:'calc_uses',       icon:'🔥', label:'Calculs BBQ',           desc:'Nombre de calculs de cuisson autorisés', period:'total' },
  { key:'session_saves',   icon:'☁️', label:'Sessions sauvegardées', desc:'Historique des sessions', period:'total' },
  { key:'journal_entries', icon:'📓', label:'Entrées journal',       desc:'Notes de cuisson', period:'total' },
  { key:'party_meats',     icon:'🎉', label:'Viandes Cook Party',    desc:'Viandes simultanées', period:'total' },
  { key:'cold_uses',       icon:'❄️', label:'Fumage à froid',        desc:'Calculs SSV et fumage', period:'total' },
  { key:'ask_ai_daily',    icon:'🤖', label:'Questions IA / jour',   desc:'Ask The Pitmaster IA', period:'daily' },
  { key:'history_access',  icon:'📖', label:'Accès historique',      desc:'Consultation de l\'historique', period:'total' },
  { key:'export_pdf',      icon:'📄', label:'Export PDF',            desc:'Téléchargement PDF', period:'total' },
  { key:'custom_meats',    icon:'🥩', label:'Viandes custom',        desc:'Ajouter ses propres viandes', period:'total' },
  { key:'advanced_stats',  icon:'📊', label:'Stats avancées',        desc:'Statistiques détaillées', period:'total' },
]

const css = `
  .adm-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;padding:20px;margin-bottom:12px}
  .pm-input{background:#0e0c0a;border:1px solid #252018;border-radius:9px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:13px;padding:8px 12px;outline:none;transition:all 0.15s;width:100%}
  .pm-input:focus{border-color:#e85d04;box-shadow:0 0 0 3px rgba(232,93,4,0.07)}
  .field-label{display:block;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6a5a4a;margin-bottom:6px;font-family:'DM Sans',sans-serif}
  .plan-tab{padding:8px 16px;border-radius:8px;border:1px solid;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s}
  .feature-grid{display:grid;grid-template-columns:1fr 120px 120px 120px;gap:0;border:1px solid #1e1a14;border-radius:12px;overflow:hidden}
  .feature-header{background:#0e0c0a;padding:10px 14px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#3a2e24;font-family:'DM Sans',sans-serif}
  .feature-row{display:contents}
  .feature-cell{padding:12px 14px;border-top:1px solid #1e1a14;display:flex;align-items:center;background:#171410}
  .feature-cell:hover{background:#1a1610}
  .limit-input{background:#0e0c0a;border:1px solid #252018;border-radius:7px;color:#d4c4b0;font-family:'DM Mono',monospace;font-size:13px;padding:6px 10px;outline:none;width:80px;text-align:center;transition:all 0.15s}
  .limit-input:focus{border-color:#e85d04}
`

export default function AdminPlansV2() {
  const { snack, showSnack } = useSnack()
  const [plans, setPlans] = useState([])
  const [features, setFeatures] = useState({})  // { plan_key: { feature_key: limit_value } }
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('features')  // features | pricing | display

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [plansRes, featuresRes] = await Promise.all([
      supabase.from('plans').select('*').order('sort_order'),
      supabase.from('plan_features').select('*'),
    ])

    setPlans(plansRes.data || [])

    // Organiser features par plan
    const featMap = {}
    featuresRes.data?.forEach(f => {
      if (!featMap[f.plan_key]) featMap[f.plan_key] = {}
      featMap[f.plan_key][f.feature_key] = f.limit_value
    })
    setFeatures(featMap)
    setLoading(false)
  }

  function setLimit(planKey, featureKey, value) {
    setFeatures(prev => ({
      ...prev,
      [planKey]: { ...prev[planKey], [featureKey]: value }
    }))
  }

  function updatePlan(planKey, field, value) {
    setPlans(prev => prev.map(p => p.key === planKey ? { ...p, [field]: value } : p))
  }

  async function saveAll() {
    setSaving(true)

    // Sauvegarder les plans
    for (const plan of plans) {
      await supabase.from('plans').upsert({
        ...plan,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' })
    }

    // Sauvegarder les features
    const rows = []
    Object.entries(features).forEach(([planKey, feats]) => {
      Object.entries(feats).forEach(([featureKey, limitValue]) => {
        rows.push({
          plan_key: planKey,
          feature_key: featureKey,
          limit_value: parseInt(limitValue),
          updated_at: new Date().toISOString(),
        })
      })
    })
    const { error } = await supabase.from('plan_features').upsert(rows, { onConflict: 'plan_key,feature_key' })

    setSaving(false)
    if (error) { showSnack('Erreur: ' + error.message, 'error'); return }
    showSnack('✅ Plans sauvegardés ! Les changements sont immédiats.')
  }

  const getLimitDisplay = (val) => {
    if (val === -1 || val === undefined) return '∞'
    if (val === 0) return '🚫'
    return val
  }

  const PLAN_COLORS = { free:'#6a5a4a', pro:'#e85d04', ultra:'#f48c06' }

  if (loading) return <div style={{ color:'#4a3a2e', padding:40, fontFamily:'DM Sans,sans-serif' }}>Chargement...</div>

  return (
    <div style={{ fontFamily:'DM Sans,sans-serif' }}>
      <style>{css}</style>
      <Snack snack={snack} />

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#fff', letterSpacing:'-0.5px' }}>
          Plans <span style={{ color:'#e85d04' }}>&</span> Pricing
        </h1>
        <p style={{ fontSize:11, color:'#8a7060', marginTop:6, letterSpacing:'1.5px', textTransform:'uppercase', fontWeight:600 }}>
          Tout configurable · Changements en temps réel
        </p>
      </div>

      {/* TABS */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[
          { id:'features', label:'🎛️ Limites & Features' },
          { id:'pricing', label:'💳 Prix & Affichage' },
          { id:'preview', label:'👁️ Aperçu' },
        ].map(t => (
          <button key={t.id} className="plan-tab"
            onClick={() => setActiveTab(t.id)}
            style={{ borderColor: activeTab===t.id?'rgba(232,93,4,0.4)':'#1e1a14', background: activeTab===t.id?'rgba(232,93,4,0.1)':'#171410', color: activeTab===t.id?'#e85d04':'#6a5a4a' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB FEATURES ═══ */}
      {activeTab === 'features' && (
        <div>
          <div style={{ background:'rgba(244,140,6,0.05)', border:'1px solid rgba(244,140,6,0.15)', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:12, color:'#8a7060', lineHeight:1.7 }}>
            💡 <strong style={{color:'#f48c06'}}>Guide des valeurs :</strong>
            &nbsp; <code style={{background:'#0e0c0a',padding:'1px 6px',borderRadius:4,fontFamily:'DM Mono,monospace',color:'#e85d04'}}>-1</code> = Illimité &nbsp;
            <code style={{background:'#0e0c0a',padding:'1px 6px',borderRadius:4,fontFamily:'DM Mono,monospace',color:'#ef4444'}}>0</code> = Bloqué (feature désactivée) &nbsp;
            <code style={{background:'#0e0c0a',padding:'1px 6px',borderRadius:4,fontFamily:'DM Mono,monospace',color:'#d4c4b0'}}>3</code> = Limite à 3 utilisations
          </div>

          {/* TABLEAU FEATURES */}
          <div className="feature-grid" style={{ marginBottom:16 }}>
            {/* HEADERS */}
            <div className="feature-header">Feature</div>
            {plans.map(p => (
              <div key={p.key} className="feature-header" style={{ color: PLAN_COLORS[p.key], textAlign:'center' }}>
                {p.name}
              </div>
            ))}

            {/* ROWS */}
            {FEATURE_KEYS.map(feat => (
              <div key={feat.key} className="feature-row">
                <div className="feature-cell">
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>{feat.icon}</span>
                    <div>
                      <div style={{ fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:13, color:'#d4c4b0' }}>{feat.label}</div>
                      <div style={{ fontSize:10, color:'#3a2e24', marginTop:1 }}>
                        {feat.desc}
                        {feat.period === 'daily' && <span style={{ marginLeft:4, color:'#e85d04', fontWeight:700 }}>· DAILY</span>}
                      </div>
                    </div>
                  </div>
                </div>
                {plans.map(p => {
                  const val = features[p.key]?.[feat.key] ?? 0
                  return (
                    <div key={p.key} className="feature-cell" style={{ justifyContent:'center' }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                        <input
                          type="number"
                          className="limit-input"
                          value={val}
                          min={-1}
                          onChange={e => setLimit(p.key, feat.key, parseInt(e.target.value))}
                          style={{ borderColor: val === -1 ? 'rgba(34,197,94,0.3)' : val === 0 ? 'rgba(239,68,68,0.3)' : 'rgba(232,93,4,0.3)', color: val === -1 ? '#22c55e' : val === 0 ? '#ef4444' : '#d4c4b0' }}
                        />
                        <span style={{ fontSize:10, color: val===-1?'#22c55e':val===0?'#ef4444':'#6a5a4a', fontFamily:'Syne,sans-serif', fontWeight:700 }}>
                          {getLimitDisplay(val)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* RÉSUMÉ VISUEL */}
          <div className="adm-card">
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e', marginBottom:14 }}>📊 Résumé des plans</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {plans.map(p => (
                <div key={p.key} style={{ background:'#0e0c0a', border:`1px solid ${PLAN_COLORS[p.key]}30`, borderRadius:10, padding:14 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:14, color:PLAN_COLORS[p.key], marginBottom:10 }}>{p.name}</div>
                  {FEATURE_KEYS.map(f => {
                    const val = features[p.key]?.[f.key] ?? 0
                    return (
                      <div key={f.key} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:'1px solid #1a1610', fontSize:11 }}>
                        <span style={{ color:'#4a3a2e' }}>{f.icon} {f.label}</span>
                        <span style={{ fontFamily:'DM Mono,monospace', fontWeight:700, color: val===-1?'#22c55e':val===0?'#ef4444':'#f48c06' }}>
                          {getLimitDisplay(val)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB PRICING ═══ */}
      {activeTab === 'pricing' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {plans.map(p => (
            <div key={p.key} className="adm-card" style={{ border:`1px solid ${PLAN_COLORS[p.key]}30` }}>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, color:PLAN_COLORS[p.key], marginBottom:16 }}>{p.name}</div>

              <div style={{ marginBottom:12 }}>
                <label className="field-label">Nom affiché</label>
                <input className="pm-input" value={p.name} onChange={e => updatePlan(p.key, 'name', e.target.value)} />
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="field-label">Description</label>
                <input className="pm-input" value={p.description || ''} onChange={e => updatePlan(p.key, 'description', e.target.value)} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                <div>
                  <label className="field-label">Prix mensuel (€)</label>
                  <input className="pm-input" type="number" step="0.01" value={p.price_monthly} onChange={e => updatePlan(p.key, 'price_monthly', e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Prix annuel (€)</label>
                  <input className="pm-input" type="number" step="0.01" value={p.price_yearly} onChange={e => updatePlan(p.key, 'price_yearly', e.target.value)} />
                </div>
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="field-label">Badge (ex: POPULAIRE)</label>
                <input className="pm-input" value={p.badge || ''} onChange={e => updatePlan(p.key, 'badge', e.target.value)} placeholder="Laisser vide si aucun" />
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="field-label">Couleur accent</label>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input type="color" value={p.color || '#6a5a4a'} onChange={e => updatePlan(p.key, 'color', e.target.value)} style={{ width:36, height:36, borderRadius:7, border:'1px solid #252018', cursor:'pointer' }} />
                  <input className="pm-input" value={p.color || ''} onChange={e => updatePlan(p.key, 'color', e.target.value)} style={{ fontFamily:'DM Mono,monospace', flex:1 }} />
                </div>
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="field-label">Stripe Price ID (mensuel)</label>
                <input className="pm-input" value={p.stripe_price_monthly || ''} onChange={e => updatePlan(p.key, 'stripe_price_monthly', e.target.value)} placeholder="price_xxxx" style={{ fontFamily:'DM Mono,monospace', fontSize:12 }} />
              </div>
              <div>
                <label className="field-label">Stripe Price ID (annuel)</label>
                <input className="pm-input" value={p.stripe_price_yearly || ''} onChange={e => updatePlan(p.key, 'stripe_price_yearly', e.target.value)} placeholder="price_xxxx" style={{ fontFamily:'DM Mono,monospace', fontSize:12 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ TAB PREVIEW ═══ */}
      {activeTab === 'preview' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {plans.map(p => (
            <div key={p.key} style={{ background:`linear-gradient(160deg,${p.color}10,#171410)`, border:`1px solid ${p.color}40`, borderRadius:16, padding:24, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${p.color},transparent)` }} />
              {p.badge && <div style={{ position:'absolute', top:12, right:12, background:p.color, color:'#fff', fontSize:9, fontWeight:800, letterSpacing:'1px', padding:'2px 8px', borderRadius:4, fontFamily:'Syne,sans-serif' }}>{p.badge}</div>}
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:p.color, marginBottom:4 }}>{p.name}</div>
              <div style={{ fontSize:11, color:'#4a3a2e', marginBottom:14 }}>{p.description}</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:18 }}>
                <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:36, color:'#fff', lineHeight:1 }}>
                  {parseFloat(p.price_monthly) === 0 ? 'Gratuit' : `${p.price_monthly}€`}
                </span>
                {parseFloat(p.price_monthly) > 0 && <span style={{ fontSize:11, color:'#4a3a2e' }}>/mois</span>}
              </div>
              {FEATURE_KEYS.map(f => {
                const val = features[p.key]?.[f.key] ?? 0
                const enabled = val !== 0
                return (
                  <div key={f.key} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:12 }}>
                    <span style={{ color: enabled?'#22c55e':'#2a2218', fontSize:11 }}>{enabled?'✓':'✗'}</span>
                    <span style={{ color: enabled?'#d4c4b0':'#2a2218' }}>
                      {val === -1 ? `${f.label} illimité` : val === 0 ? f.label : `${f.label} (${val}${f.period==='daily'?' /j':''})`}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* SAVE */}
      <button onClick={saveAll} disabled={saving} style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(232,93,4,0.25)', marginTop:16 }}>
        {saving ? '⏳ Sauvegarde en cours...' : '💾 Sauvegarder et appliquer immédiatement'}
      </button>
    </div>
  )
}