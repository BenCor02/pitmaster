import { useState, useEffect } from 'react'
import { invalidateSettingsCache } from '../../hooks/useSiteSettings'
import { useSnack } from '../../components/useSnack'
import Snack from '../../components/Snack'
import { fetchSiteSettingsRow, upsertSiteSettingsRow } from '../../modules/cms/repository'

const css = `
  .adm-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;padding:20px;margin-bottom:12px}
  .pm-input{background:#0e0c0a;border:1px solid #252018;border-radius:9px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:13px;padding:9px 12px;outline:none;transition:all 0.15s;width:100%}
  .pm-input:focus{border-color:#e85d04;box-shadow:0 0 0 3px rgba(232,93,4,0.07)}
  .pm-textarea{background:#0e0c0a;border:1px solid #252018;border-radius:9px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:13px;padding:9px 12px;outline:none;transition:all 0.15s;width:100%;resize:vertical}
  .field-label{display:block;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6a5a4a;margin-bottom:7px;font-family:'DM Sans',sans-serif}
  .section-title{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#4a3a2e;margin-bottom:16px;display:flex;align-items:center;gap:8px}
`

const DEFAULT_SETTINGS = {
  site_name: 'PitMaster',
  site_tagline: 'Calculateur BBQ Pro · Low & Slow',
  site_description: 'Application professionnelle de planification de cuisson BBQ. Calculez vos temps de cuisson, gérez vos sessions et devenez un vrai pit-master.',
  seo_title: 'PitMaster — Calculateur BBQ Low & Slow',
  seo_keywords: 'BBQ, fumage, brisket, pulled pork, ribs, calculateur cuisson, low and slow',
  og_image: '',
  support_email: '',
  maintenance_mode: 'false',
  allow_signups: 'true',
  max_sessions_free: '10',
  max_journal_free: '5',
  ask_ai_free_limit: '3',
  ask_ai_pro_limit: '50',
  primary_color: '#e85d04',
  accent_color: '#f48c06',
  announcement: '',
}

export default function AdminSettings() {
  const { snack, showSnack } = useSnack()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  async function loadSettings() {
    const data = await fetchSiteSettingsRow()
    if (data) setSettings(prev => ({ ...prev, ...data }))
  }

  async function saveSettings() {
    setSaving(true)
    let error = null
    try {
      await upsertSiteSettingsRow(settings)
    } catch (err) {
      error = err
    }
    setSaving(false)
    if (error) { showSnack('Erreur: ' + error.message, 'error'); return }
    invalidateSettingsCache()
    showSnack('✅ Paramètres sauvegardés !')
  }

  const S = (key) => settings[key] || ''
  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }))

  const tabs = [
    { id:'general', label:'Général', icon:'⚙️' },
    { id:'seo', label:'SEO & Meta', icon:'🔍' },
    { id:'limits', label:'Limites & Plans', icon:'📊' },
    { id:'appearance', label:'Apparence', icon:'🎨' },
    { id:'system', label:'Système', icon:'🛠️' },
  ]

  useEffect(() => {
    const timer = setTimeout(() => { loadSettings() }, 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ fontFamily:'DM Sans,sans-serif' }}>
      <style>{css}</style>
      <Snack snack={snack} />

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#fff', letterSpacing:'-0.5px' }}>
          Paramètres <span style={{ color:'#e85d04' }}>·</span>
        </h1>
        <p style={{ fontSize:11, color:'#8a7060', marginTop:6, letterSpacing:'1.5px', textTransform:'uppercase', fontWeight:600 }}>
          Configuration générale du site
        </p>
      </div>

      {/* TABS */}
      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding:'8px 14px', borderRadius:8, border:`1px solid ${activeTab===t.id?'rgba(232,93,4,0.4)':'#1e1a14'}`, background:activeTab===t.id?'rgba(232,93,4,0.1)':'#171410', color:activeTab===t.id?'#e85d04':'#6a5a4a', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="adm-card">
          <div className="section-title"><span>⚙️</span> Informations générales</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div>
              <label className="field-label">Nom du site</label>
              <input className="pm-input" value={S('site_name')} onChange={e=>set('site_name',e.target.value)} />
            </div>
            <div>
              <label className="field-label">Tagline</label>
              <input className="pm-input" value={S('site_tagline')} onChange={e=>set('site_tagline',e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label className="field-label">Description du site</label>
            <textarea className="pm-textarea" rows={3} value={S('site_description')} onChange={e=>set('site_description',e.target.value)} />
          </div>
          <div style={{ marginBottom:12 }}>
            <label className="field-label">Email de support</label>
            <input className="pm-input" type="email" value={S('support_email')} onChange={e=>set('support_email',e.target.value)} placeholder="support@pitmaster.fr" />
          </div>
          <div style={{ marginBottom:12 }}>
            <label className="field-label">Annonce (bandeau en haut de l'app)</label>
            <input className="pm-input" value={S('announcement')} onChange={e=>set('announcement',e.target.value)} placeholder="Nouvelle fonctionnalité disponible ! 🔥" />
            <div style={{ fontSize:11, color:'#4a3a2e', marginTop:4 }}>Laisser vide pour désactiver</div>
          </div>
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="adm-card">
          <div className="section-title"><span>🔍</span> SEO & Méta-données</div>
          <div style={{ marginBottom:12 }}>
            <label className="field-label">Titre SEO (balise title)</label>
            <input className="pm-input" value={S('seo_title')} onChange={e=>set('seo_title',e.target.value)} />
            <div style={{ fontSize:11, color: S('seo_title').length > 60 ? '#ef4444' : '#4a3a2e', marginTop:4 }}>{S('seo_title').length}/60 caractères recommandés</div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label className="field-label">Mots-clés SEO</label>
            <input className="pm-input" value={S('seo_keywords')} onChange={e=>set('seo_keywords',e.target.value)} placeholder="BBQ, fumage, brisket..." />
          </div>
          <div style={{ marginBottom:12 }}>
            <label className="field-label">Description méta (Open Graph)</label>
            <textarea className="pm-textarea" rows={3} value={S('site_description')} onChange={e=>set('site_description',e.target.value)} />
            <div style={{ fontSize:11, color: S('site_description').length > 160 ? '#ef4444' : '#4a3a2e', marginTop:4 }}>{S('site_description').length}/160 caractères recommandés</div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label className="field-label">Image Open Graph (URL)</label>
            <input className="pm-input" value={S('og_image')} onChange={e=>set('og_image',e.target.value)} placeholder="https://..." />
          </div>
          <div style={{ padding:'12px', background:'rgba(244,140,6,0.05)', border:'1px solid rgba(244,140,6,0.1)', borderRadius:8, fontSize:12, color:'#6a5a4a', lineHeight:1.7 }}>
            💡 <strong style={{color:'#f48c06'}}>Aperçu Google :</strong><br />
            <span style={{color:'#4a8fff'}}>{S('seo_title') || 'Titre non défini'}</span><br />
            <span style={{color:'#22c55e', fontSize:11}}>pitmaster.fr</span><br />
            <span style={{color:'#8a8a8a', fontSize:11}}>{S('site_description')?.slice(0,160) || '—'}</span>
          </div>
        </div>
      )}

      {activeTab === 'limits' && (
        <div>
          <div className="adm-card">
            <div className="section-title"><span>🆓</span> Plan Free</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              <div>
                <label className="field-label">Max sessions sauvegardées</label>
                <input className="pm-input" type="number" value={S('max_sessions_free')} onChange={e=>set('max_sessions_free',e.target.value)} />
              </div>
              <div>
                <label className="field-label">Max entrées journal</label>
                <input className="pm-input" type="number" value={S('max_journal_free')} onChange={e=>set('max_journal_free',e.target.value)} />
              </div>
              <div>
                <label className="field-label">Questions IA / jour</label>
                <input className="pm-input" type="number" value={S('ask_ai_free_limit')} onChange={e=>set('ask_ai_free_limit',e.target.value)} />
              </div>
            </div>
          </div>
          <div className="adm-card">
            <div className="section-title"><span>🔥</span> Plan Pro</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              <div>
                <label className="field-label">Max sessions</label>
                <input className="pm-input" value="Illimité" disabled style={{ opacity:0.5 }} />
              </div>
              <div>
                <label className="field-label">Max journal</label>
                <input className="pm-input" value="Illimité" disabled style={{ opacity:0.5 }} />
              </div>
              <div>
                <label className="field-label">Questions IA / jour</label>
                <input className="pm-input" type="number" value={S('ask_ai_pro_limit')} onChange={e=>set('ask_ai_pro_limit',e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="adm-card">
          <div className="section-title"><span>🎨</span> Couleurs & Thème</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            <div>
              <label className="field-label">Couleur principale (ember)</label>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <input type="color" value={S('primary_color')} onChange={e=>set('primary_color',e.target.value)} style={{ width:40, height:40, borderRadius:8, border:'1px solid #252018', cursor:'pointer', background:'none' }} />
                <input className="pm-input" value={S('primary_color')} onChange={e=>set('primary_color',e.target.value)} style={{ flex:1, fontFamily:'DM Mono,monospace' }} />
              </div>
            </div>
            <div>
              <label className="field-label">Couleur accent (gold)</label>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <input type="color" value={S('accent_color')} onChange={e=>set('accent_color',e.target.value)} style={{ width:40, height:40, borderRadius:8, border:'1px solid #252018', cursor:'pointer', background:'none' }} />
                <input className="pm-input" value={S('accent_color')} onChange={e=>set('accent_color',e.target.value)} style={{ flex:1, fontFamily:'DM Mono,monospace' }} />
              </div>
            </div>
          </div>
          <div style={{ padding:'16px', background:'#0e0c0a', border:'1px solid #1e1a14', borderRadius:10, textAlign:'center' }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24, background:`linear-gradient(135deg,${S('accent_color')},${S('primary_color')})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>🔥 PitMaster</div>
            <div style={{ fontSize:11, color:'#4a3a2e', marginTop:4 }}>Aperçu logo</div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="adm-card">
          <div className="section-title"><span>🛠️</span> Système</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
            <div style={{ padding:'14px', background:'#0e0c0a', border:`1px solid ${S('maintenance_mode')==='true'?'rgba(239,68,68,0.3)':'#1e1a14'}`, borderRadius:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#d4c4b0' }}>Mode maintenance</div>
                  <div style={{ fontSize:11, color:'#4a3a2e', marginTop:2 }}>Bloque l accès aux utilisateurs</div>
                </div>
                <div onClick={() => set('maintenance_mode', S('maintenance_mode')==='true'?'false':'true')} style={{ width:44, height:26, borderRadius:13, background:S('maintenance_mode')==='true'?'#ef4444':'#2a2218', cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
                  <div style={{ position:'absolute', top:3, left:S('maintenance_mode')==='true'?22:3, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }} />
                </div>
              </div>
            </div>
            <div style={{ padding:'14px', background:'#0e0c0a', border:`1px solid ${S('allow_signups')==='false'?'rgba(239,68,68,0.3)':'#1e1a14'}`, borderRadius:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#d4c4b0' }}>Inscriptions ouvertes</div>
                  <div style={{ fontSize:11, color:'#4a3a2e', marginTop:2 }}>Autoriser les nouveaux comptes</div>
                </div>
                <div onClick={() => set('allow_signups', S('allow_signups')==='true'?'false':'true')} style={{ width:44, height:26, borderRadius:13, background:S('allow_signups')==='true'?'#e85d04':'#2a2218', cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
                  <div style={{ position:'absolute', top:3, left:S('allow_signups')==='true'?22:3, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAVE */}
      <button onClick={saveSettings} disabled={saving} style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(232,93,4,0.25)', marginTop:8 }}>
        {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder tous les paramètres'}
      </button>
    </div>
  )
}
