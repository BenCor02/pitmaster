import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { MEATS } from '../../lib/meats'
import { useSnack } from '../../components/Snack'
import Snack from '../../components/Snack'

const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .fade-up{animation:fadeUp 0.2s ease both}
  .adm-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;padding:20px;margin-bottom:12px}
  .pm-input{background:#0e0c0a;border:1px solid #252018;border-radius:9px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:13px;padding:9px 12px;outline:none;transition:all 0.15s;width:100%}
  .pm-input:focus{border-color:#e85d04;box-shadow:0 0 0 3px rgba(232,93,4,0.07)}
  .pm-textarea{background:#0e0c0a;border:1px solid #252018;border-radius:9px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:13px;padding:9px 12px;outline:none;transition:all 0.15s;width:100%;resize:vertical}
  .pm-textarea:focus{border-color:#e85d04}
  .field-label{display:block;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6a5a4a;margin-bottom:7px;font-family:'DM Sans',sans-serif}
  .meat-item{background:#0e0c0a;border:1px solid #1e1a14;border-radius:10px;padding:14px;margin-bottom:8px;cursor:pointer;transition:all 0.15s;display:flex;justify-content:space-between;align-items:center}
  .meat-item:hover{border-color:rgba(232,93,4,0.3);background:rgba(232,93,4,0.03)}
  .meat-item.selected{border-color:rgba(232,93,4,0.4);background:rgba(232,93,4,0.06)}
`

// Viandes par défaut depuis meats.js + custom depuis Supabase
export default function AdminMeats() {
  const { snack, showSnack } = useSnack()
  const [meats, setMeats] = useState([])
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('list') // list | edit | new

  useEffect(() => { loadMeats() }, [])

  async function loadMeats() {
    // Charger les overrides depuis Supabase
    const { data } = await supabase.from('meat_configs').select('*')
    const overrides = {}
    data?.forEach(d => { overrides[d.meat_key] = d })

    // Merger avec les données par défaut
    const list = Object.entries(MEATS).map(([key, m]) => ({
      key,
      name: m.name,
      full: m.full,
      temp: m.temp,
      bMin: m.bMin,
      stall: m.stall,
      rest: m.rest,
      tips: m.tips,
      rubs: m.rubs,
      woods: m.woods,
      hasStall: m.hasStall,
      source: 'default',
      ...overrides[key] ? { ...overrides[key], source: 'custom' } : {},
    }))

    // Ajouter les viandes 100% custom (pas dans MEATS)
    data?.filter(d => !MEATS[d.meat_key]).forEach(d => {
      list.push({ ...d, key: d.meat_key, source: 'custom' })
    })

    setMeats(list)
  }

  function startEdit(meat) {
    setEditing({
      key: meat.key,
      name: meat.name || '',
      full: meat.full || '',
      temp: meat.temp || '',
      bMin: meat.bMin || 0,
      stall: meat.stall || 0,
      rest: meat.rest || 30,
      hasStall: meat.hasStall || false,
      tips: meat.tips?.map(t => `${t.t}|${t.b}`).join('\n') || '',
      rubs_json: JSON.stringify(meat.rubs || [], null, 2),
      woods_json: JSON.stringify(meat.woods || [], null, 2),
    })
    setTab('edit')
    setSelected(meat.key)
  }

  function startNew() {
    setEditing({
      key: 'new_' + Date.now(),
      name: '',
      full: '',
      temp: '',
      bMin: 60,
      stall: 60,
      rest: 30,
      hasStall: false,
      tips: 'Température cible|Indique la T° optimale\nConseils bois|Recommandations bois',
      rubs_json: JSON.stringify([{ name: 'Rub de base', ingr: [{ n: 'Sel', q: '2 c.a.s' }], note: 'Appliquer 4h avant.' }], null, 2),
      woods_json: JSON.stringify([{ e: '🌳', n: 'Chene', d: 'Fumee longue', i: 4 }], null, 2),
    })
    setTab('edit')
    setSelected(null)
  }

  async function saveMeat() {
    if (!editing.name || !editing.key) { showSnack('Nom et clé obligatoires', 'error'); return }
    setSaving(true)

    let tips, rubs, woods
    try {
      tips = editing.tips.split('\n').filter(Boolean).map(line => {
        const [t, b] = line.split('|')
        return { t: t?.trim(), b: b?.trim() || '' }
      })
      rubs = JSON.parse(editing.rubs_json)
      woods = JSON.parse(editing.woods_json)
    } catch(e) {
      showSnack('JSON invalide dans Rubs ou Bois', 'error')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('meat_configs').upsert({
      meat_key: editing.key,
      name: editing.name,
      full: editing.full,
      temp: editing.temp,
      bMin: parseInt(editing.bMin),
      stall: parseInt(editing.stall),
      rest: parseInt(editing.rest),
      hasStall: editing.hasStall,
      tips,
      rubs,
      woods,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'meat_key' })

    setSaving(false)
    if (error) { showSnack('Erreur: ' + error.message, 'error'); return }
    showSnack('✅ Viande sauvegardée !')
    await loadMeats()
    setTab('list')
  }

  async function resetToDefault(key) {
    if (!confirm('Supprimer les modifications et revenir aux valeurs par défaut ?')) return
    await supabase.from('meat_configs').delete().eq('meat_key', key)
    showSnack('Réinitialisé aux valeurs par défaut')
    await loadMeats()
    setTab('list')
  }

  async function deleteMeat(key) {
    if (!confirm('Supprimer cette viande ? Cette action est irréversible.')) return
    await supabase.from('meat_configs').delete().eq('meat_key', key)
    showSnack('Viande supprimée')
    await loadMeats()
    setTab('list')
  }

  return (
    <div className="fade-up" style={{ fontFamily:'DM Sans,sans-serif' }}>
      <style>{css}</style>
      <Snack snack={snack} />

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#fff', letterSpacing:'-0.5px' }}>
          Viandes <span style={{ color:'#e85d04' }}>&</span> Calculs
        </h1>
        <p style={{ fontSize:11, color:'#8a7060', marginTop:6, letterSpacing:'1.5px', textTransform:'uppercase', fontWeight:600 }}>
          Modifier les viandes · Temps de cuisson · Rubs · Conseils
        </p>
      </div>

      {/* TABS */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        <button onClick={() => setTab('list')} style={{ padding:'8px 16px', borderRadius:8, border:`1px solid ${tab==='list'?'rgba(232,93,4,0.4)':'#1e1a14'}`, background:tab==='list'?'rgba(232,93,4,0.1)':'#171410', color:tab==='list'?'#e85d04':'#6a5a4a', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          Liste ({meats.length})
        </button>
        <button onClick={startNew} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid rgba(34,197,94,0.3)', background:'rgba(34,197,94,0.08)', color:'#22c55e', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          + Nouvelle viande
        </button>
      </div>

      {tab === 'list' && (
        <div className="adm-card">
          {meats.map(m => (
            <div key={m.key} className={`meat-item${selected===m.key?' selected':''}`} onClick={() => startEdit(m)}>
              <div>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'#d4c4b0', marginBottom:3 }}>
                  {m.name}
                  {m.source === 'custom' && <span style={{ marginLeft:8, fontSize:10, fontWeight:700, color:'#f48c06', background:'rgba(244,140,6,0.1)', border:'1px solid rgba(244,140,6,0.2)', borderRadius:4, padding:'1px 6px' }}>MODIFIÉ</span>}
                </div>
                <div style={{ fontSize:11, color:'#4a3a2e' }}>{m.full} · {m.temp} · Repos: {m.rest} min</div>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#6a5a4a' }}>bMin: {m.bMin}</span>
                <span style={{ fontSize:14, color:'#4a3a2e' }}>✏️</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'edit' && editing && (
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            <button onClick={() => setTab('list')} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #1e1a14', background:'transparent', color:'#6a5a4a', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              ← Retour
            </button>
            {selected && meats.find(m=>m.key===selected)?.source === 'custom' && (
              <button onClick={() => resetToDefault(selected)} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.07)', color:'#ef4444', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                Réinitialiser
              </button>
            )}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {/* INFOS DE BASE */}
            <div className="adm-card">
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e', marginBottom:16 }}>📋 Informations de base</div>
              <div style={{ marginBottom:12 }}>
                <label className="field-label">Nom court (ex: Brisket)</label>
                <input className="pm-input" value={editing.name} onChange={e => setEditing(p=>({...p,name:e.target.value}))} />
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="field-label">Nom complet (ex: Poitrine de boeuf)</label>
                <input className="pm-input" value={editing.full} onChange={e => setEditing(p=>({...p,full:e.target.value}))} />
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="field-label">Température cible (ex: 93-96°C)</label>
                <input className="pm-input" value={editing.temp} onChange={e => setEditing(p=>({...p,temp:e.target.value}))} />
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="field-label">Clé unique (ex: brisket, pork_belly)</label>
                <input className="pm-input" value={editing.key} onChange={e => setEditing(p=>({...p,key:e.target.value}))} disabled={!!selected} style={{ opacity: selected ? 0.5 : 1 }} />
              </div>
            </div>

            {/* PARAMÈTRES DE CUISSON */}
            <div className="adm-card">
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e', marginBottom:16 }}>⏱️ Paramètres de cuisson</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                <div>
                  <label className="field-label">bMin (min/kg à 110°C)</label>
                  <input className="pm-input" type="number" value={editing.bMin} onChange={e => setEditing(p=>({...p,bMin:e.target.value}))} />
                </div>
                <div>
                  <label className="field-label">Stall (min fixes)</label>
                  <input className="pm-input" type="number" value={editing.stall} onChange={e => setEditing(p=>({...p,stall:e.target.value}))} />
                </div>
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="field-label">Repos (minutes)</label>
                <input className="pm-input" type="number" value={editing.rest} onChange={e => setEditing(p=>({...p,rest:e.target.value}))} />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#0e0c0a', border:'1px solid #1e1a14', borderRadius:9 }}>
                <input type="checkbox" checked={editing.hasStall} onChange={e => setEditing(p=>({...p,hasStall:e.target.checked}))} style={{ width:16, height:16, accentColor:'#e85d04', cursor:'pointer' }} />
                <span style={{ fontSize:13, color:'#d4c4b0' }}>Afficher l'avertissement stall</span>
              </div>
              <div style={{ marginTop:12, padding:'10px', background:'rgba(244,140,6,0.05)', border:'1px solid rgba(244,140,6,0.1)', borderRadius:8, fontSize:11, color:'#6a5a4a', lineHeight:1.6 }}>
                💡 <strong style={{color:'#f48c06'}}>Formule :</strong> durée = (bMin × poids + stall) × facteur_température
              </div>
            </div>
          </div>

          {/* CONSEILS */}
          <div className="adm-card">
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e', marginBottom:12 }}>💡 Conseils (un par ligne, format: Titre|Description)</div>
            <textarea className="pm-textarea" rows={5} value={editing.tips} onChange={e => setEditing(p=>({...p,tips:e.target.value}))} placeholder="Température cible|93-96°C ET sonde sans résistance&#10;Sens du grain|Couper perpendiculairement aux fibres" />
            <div style={{ fontSize:11, color:'#4a3a2e', marginTop:6 }}>Format : Titre|Description — un conseil par ligne</div>
          </div>

          {/* RUBS JSON */}
          <div className="adm-card">
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e', marginBottom:12 }}>🧂 Rubs (JSON)</div>
            <textarea className="pm-textarea" rows={8} value={editing.rubs_json} onChange={e => setEditing(p=>({...p,rubs_json:e.target.value}))} style={{ fontFamily:'DM Mono,monospace', fontSize:12 }} />
          </div>

          {/* BOIS JSON */}
          <div className="adm-card">
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e', marginBottom:12 }}>🪵 Bois de fumage (JSON)</div>
            <textarea className="pm-textarea" rows={6} value={editing.woods_json} onChange={e => setEditing(p=>({...p,woods_json:e.target.value}))} style={{ fontFamily:'DM Mono,monospace', fontSize:12 }} />
            <div style={{ fontSize:11, color:'#4a3a2e', marginTop:6 }}>Format : {`[{"e":"🌳","n":"Chene","d":"Description","i":4}]`} — i = intensité (1-5)</div>
          </div>

          {/* ACTIONS */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <button onClick={saveMeat} disabled={saving} style={{ padding:'14px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(232,93,4,0.25)' }}>
              {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
            </button>
            {selected && (
              <button onClick={() => deleteMeat(selected)} style={{ padding:'14px', borderRadius:12, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#ef4444', fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                🗑 Supprimer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
