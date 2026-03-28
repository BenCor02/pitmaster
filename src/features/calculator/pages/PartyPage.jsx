import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { saveCookParty } from '../../../modules/cooks/repository'
import { MEATS } from '../../../lib/meats'
import { calculateLowSlow, buildTimeline, formatDuration, formatTime, addMinutes } from '../../../domain/calculator/engine'

// Wrapper local — ancienne signature : (meatKey, weight, thickness, smokerTempC, method, wrap)
function calculateCookTime(meatKey, weightKg, thicknessCm, smokerTempC = 120, method, willWrap) {
  const options = {
    thicknessCm,
    smokerTempC,
    wrapType: willWrap ? 'butcher_paper' : 'none',
  }
  const calc = calculateLowSlow(meatKey, weightKg, options)
  const phases = buildTimeline(calc, smokerTempC)
  return { ...calc, phases }
}
import { useSnack } from '../../../components/useSnack'
import Snack from '../../../components/Snack'

export default function PartyPage() {
  const { user } = useAuth()
  const { snack, showSnack } = useSnack()
  const [partyName, setPartyName] = useState('')
  const [serveTime, setServeTime] = useState('19:00')
  const [smokerTemp, setSmokerTemp] = useState(110)
  const [meatList, setMeatList] = useState([])
  const [selectedMeat, setSelectedMeat] = useState('brisket')
  const [selectedWeight, setSelectedWeight] = useState(2)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [openSteps, setOpenSteps] = useState({})

  function toggleSteps(id) { setOpenSteps(p => ({ ...p, [id]: !p[id] })) }

  function addMeat() {
    const meat = MEATS[selectedMeat]
    if (!meat) return
    setMeatList(prev => [...prev, {
      id: Date.now(),
      key: selectedMeat,
      name: meat.name,
      full: meat.full,
      emoji: meat.emoji || '🥩',
      weight: selectedWeight,
    }])
  }

  function removeMeat(id) {
    setMeatList(prev => prev.filter(m => m.id !== id))
    setResult(null)
  }

  function calculate() {
    if (meatList.length === 0) { showSnack('Ajoute au moins une viande', 'error'); return }
    setLoading(true)
    setTimeout(() => {
      try {
        const today = new Date()
        const [sh, sm] = serveTime.split(':').map(Number)
        const serve = new Date(today)
        serve.setHours(sh, sm, 0, 0)
        if (serve < today) serve.setDate(serve.getDate() + 1)

        const computed = meatList.map(m => {
          const calc = calculateCookTime(m.key, m.weight, null, smokerTemp, 'shred', true)
          // PATCH: retire la marge de sécurité explicite pour garder un planning plus simple et cohérent
          const startDate = addMinutes(serve, -calc.totalMin)

          // Construire la timeline horaire
          let cursor = new Date(startDate)
          const timeline = calc.phases.map(phase => {
            const startStr = formatTime(cursor)
            const endDate = phase.durationMin ? addMinutes(cursor, phase.durationMin) : cursor
            if (phase.durationMin) cursor = endDate
            return { ...phase, startStr }
          })

          return {
            ...m,
            cookMin: calc.cookMin,
            restMin: calc.restMin,
            totalMin: calc.totalMin,
            startDate,
            startStr: formatTime(startDate),
            targetTempC: calc.targetTempC,
            stallMin: calc.stallMin,
            timeline,
          }
        }).sort((a, b) => a.startDate - b.startDate)

        setResult({ computed, serveStr: serveTime, smokerTemp })
        setLoading(false)
        setTimeout(() => document.getElementById('party-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      } catch(e) {
        showSnack('Erreur: ' + e.message, 'error')
        setLoading(false)
      }
    }, 350)
  }

  async function saveParty() {
    if (!result || !user) { showSnack('Lance dabord un calcul', 'error'); return }
    setSaving(true)
    setSaving(false)
    try {
      await saveCookParty({
        user_id: user.id,
        name: partyName || 'Cook Party',
        serve_time: result.serveStr,
        smoker_temp: result.smokerTemp,
        meats: result.computed.map(m => ({ key: m.key, name: m.name, weight: m.weight, start: m.startStr, cook_min: m.cookMin })),
        date: new Date().toLocaleDateString('fr-FR'),
      })
      showSnack('🎉 Cook Party sauvegardée !')
    } catch (error) {
      showSnack('Erreur: ' + error.message, 'error')
    }
  }

  const phaseColor = (p) => {
    if (p.isRest) return 'var(--blue)'
    if (p.isStall) return 'var(--gold)'
    if (p.isCrisp) return 'var(--green)'
    return 'var(--orange)'
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Snack snack={snack} />

      <div style={{ marginBottom: 28 }}>
        <h1>Cook <span style={{ color: 'var(--orange)' }}>Party</span></h1>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
          Planning multi-viandes simultané
        </p>
      </div>

      {/* CONFIG */}
      <div className="pm-sec-label">⚙️ Configuration</div>

      <div className="pm-card">
        <label className="pm-field-label">Nom de la session (optionnel)</label>
        <input className="pm-input" type="text" value={partyName} onChange={e => setPartyName(e.target.value)} placeholder="BBQ du 14 juillet, Anniversaire..." />
      </div>

      <div className="pm-card">
        <label className="pm-field-label">Service à</label>
        <input className="pm-input" type="time" value={serveTime} onChange={e => setServeTime(e.target.value)} />
      </div>

      <div className="pm-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <label className="pm-field-label" style={{ marginBottom: 0 }}>Température fumoir</label>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--orange)' }}>{smokerTemp}°C</span>
        </div>
        <input type="range" value={smokerTemp} min="100" max="160" step="5" onChange={e => setSmokerTemp(parseInt(e.target.value))} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>Low & slow</span>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>Hot & fast</span>
        </div>
      </div>

      {/* VIANDES */}
      <div className="pm-sec-label" style={{ marginTop: 8 }}>🥩 Viandes ({meatList.length})</div>

      <div className="pm-card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10, marginBottom: 12 }}>
          <div>
            <label className="pm-field-label">Viande</label>
            <select className="pm-input" value={selectedMeat} onChange={e => setSelectedMeat(e.target.value)}>
              {Object.entries(MEATS).map(([k, m]) => (
                <option key={k} value={k}>{m.full}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="pm-field-label">kg</label>
            <input className="pm-input" type="number" value={selectedWeight} min="0.5" max="20" step="0.5"
              onChange={e => setSelectedWeight(parseFloat(e.target.value) || 1)} />
          </div>
        </div>
        <button onClick={addMeat} style={{ width:'100%', padding:'11px', borderRadius:50, border:'1.5px solid var(--orange-border)', background:'var(--orange-bg)', color:'var(--orange)', fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(240,96,48,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background='var(--orange-bg)'}>
          + Ajouter cette viande
        </button>
      </div>

      {/* LISTE */}
      {meatList.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {meatList.map(m => (
            <div key={m.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, marginBottom:6 }}>
              <span style={{ fontSize: 20 }}>{m.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{m.full}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{m.weight} kg</div>
              </div>
              <button onClick={() => removeMeat(m.id)} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:16, padding:4, borderRadius:6, transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color='var(--red)'; e.currentTarget.style.background='rgba(248,113,113,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.color='var(--text3)'; e.currentTarget.style.background='none' }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {meatList.length === 0 && (
        <div style={{ textAlign:'center', padding:'20px', color:'var(--text3)', fontSize:13, marginBottom:16 }}>
          Ajoute au moins une viande pour calculer
        </div>
      )}

      {/* BOUTON CALCULER */}
      <button onClick={calculate} disabled={loading || meatList.length === 0}
        className="pm-btn-primary"
        style={{ width:'100%', padding:'14px', marginBottom:32, fontSize:14, opacity: meatList.length === 0 ? 0.4 : 1 }}>
        {loading
          ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} /> Calcul...</>
          : `🎉 Calculer le planning (${meatList.length} viande${meatList.length > 1 ? 's' : ''})`
        }
      </button>

      {/* RÉSULTATS */}
      {result && (
        <div id="party-result" className="fade-up">
          <div className="pm-sec-label">📊 Planning Cook Party</div>

          {/* HERO */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'24px 20px', textAlign:'center', marginBottom:12, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'var(--orange)', borderRadius:'20px 20px 0 0' }} />
            {partyName && <div style={{ fontSize:11, fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--orange)', marginBottom:6 }}>{partyName}</div>}
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--text3)', marginBottom:8 }}>Premier lancement à</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:72, fontWeight:800, lineHeight:1, color:'var(--orange)', letterSpacing:'-3px' }}>
              {result.computed[0]?.startStr}
            </div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:8 }}>
              {result.computed.length} viande{result.computed.length > 1 ? 's' : ''} · Service à {result.serveStr}
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:12, flexWrap:'wrap' }}>
              <span style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:50, padding:'4px 12px', fontSize:11, fontFamily:'DM Mono, monospace', color:'var(--text2)' }}>{result.smokerTemp}°C fumoir</span>
            </div>
          </div>

          {/* PLANNING PAR VIANDE */}
          <div className="pm-card" style={{ marginBottom:10 }}>
            <div className="pm-sec-label">⏰ Ordre de lancement — cliquer pour les étapes</div>
            {result.computed.map((m, i) => {
              const isOpen = openSteps[m.id]
              return (
                <div key={m.id} style={{ background:'var(--surface2)', border:`1px solid ${isOpen ? 'var(--orange-border)' : 'var(--border)'}`, borderRadius:14, padding:14, marginBottom:8, transition:'border-color 0.2s' }}>
                  <div onClick={() => toggleSteps(m.id)} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', cursor:'pointer', userSelect:'none' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                        <span style={{ fontSize:18 }}>{m.emoji}</span>
                        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'var(--text)' }}>{m.full}</span>
                      </div>
                      <div style={{ fontSize:11, color:'var(--text3)', marginLeft:26 }}>{m.weight}kg · {formatDuration(m.cookMin)} cuisson + {formatDuration(m.restMin)} repos</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, marginLeft:12 }}>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:'var(--orange)', lineHeight:1 }}>{m.startStr}</div>
                        {i === 0 && <div style={{ fontSize:9, fontWeight:700, color:'var(--gold)', textTransform:'uppercase', marginTop:2 }}>En premier</div>}
                      </div>
                      <div style={{ width:24, height:24, borderRadius:8, background: isOpen ? 'var(--orange-bg)' : 'var(--surface3)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
                        <span style={{ fontSize:10, color: isOpen ? 'var(--orange)' : 'var(--text3)', transform: isOpen ? 'rotate(180deg)' : 'none', display:'inline-block', transition:'transform 0.2s' }}>▼</span>
                      </div>
                    </div>
                  </div>

                  {/* MINI BARRE */}
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10 }}>
                    <span style={{ fontFamily:'DM Mono, monospace', fontSize:10, color:'var(--orange)', whiteSpace:'nowrap' }}>{m.startStr}</span>
                    <div style={{ flex:1, height:4, background:'var(--surface3)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(m.cookMin / m.totalMin) * 100}%`, background:'var(--orange)', borderRadius:2 }} />
                    </div>
                    <span style={{ fontFamily:'DM Mono, monospace', fontSize:10, color:'var(--text3)', whiteSpace:'nowrap' }}>{result.serveStr}</span>
                  </div>

                  {/* ÉTAPES ACCORDÉON */}
                  {isOpen && (
                    <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)', animation:'fadeUp 0.2s ease' }}>
                      {m.timeline.map((step, si) => (
                        <div key={si} style={{ display:'grid', gridTemplateColumns:'50px 10px 1fr', gap:'0 10px', padding:'8px 0', position:'relative' }}>
                          {si < m.timeline.length - 1 && <div style={{ position:'absolute', left:54, top:22, bottom:-8, width:1, background:'var(--border)' }} />}
                          <div style={{ fontFamily:'DM Mono, monospace', fontSize:10, color:'var(--text3)', textAlign:'right', paddingTop:2 }}>{step.startStr}</div>
                          <div style={{ width:8, height:8, borderRadius:'50%', background: phaseColor(step), marginTop:3, justifySelf:'center', boxShadow:`0 0 5px ${phaseColor(step)}60` }} />
                          <div>
                            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:12, color:'var(--text)', lineHeight:1.3 }}>{step.label}</div>
                            <div style={{ fontSize:11, color:'var(--text3)', marginTop:2, lineHeight:1.5 }}>{step.description}</div>
                          </div>
                        </div>
                      ))}
                      {m.stallMin > 0 && (
                        <div style={{ background:'var(--orange-bg)', border:'1px solid var(--orange-border)', borderRadius:10, padding:10, marginTop:8, fontSize:11, color:'var(--text2)', display:'flex', gap:8, lineHeight:1.5 }}>
                          <span>⚠️</span><span>Stall estimé ~{formatDuration(m.stallMin)}. Wrapper dans du papier boucher à 70-74°C pour gagner du temps.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* ORDRE CHRONOLOGIQUE */}
          <div className="pm-card" style={{ marginBottom:12 }}>
            <div className="pm-sec-label">✅ Ordre chronologique</div>
            {result.computed.map((m, i) => (
              <div key={m.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i < result.computed.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width:30, height:30, borderRadius:10, background: i === 0 ? 'var(--orange-bg)' : 'var(--surface2)', border:`1px solid ${i === 0 ? 'var(--orange-border)' : 'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13, color: i === 0 ? 'var(--orange)' : 'var(--text3)' }}>{i + 1}</span>
                </div>
                <span style={{ fontSize:18 }}>{m.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13, color:'var(--text)' }}>{m.name}</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>{m.weight}kg</div>
                </div>
                <div style={{ fontFamily:'DM Mono, monospace', fontSize:15, fontWeight:700, color: i === 0 ? 'var(--orange)' : 'var(--text2)' }}>{m.startStr}</div>
              </div>
            ))}
          </div>

          {/* ACTIONS */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:8 }}>
            <button onClick={saveParty} disabled={saving} className="pm-btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? '⏳...' : '☁️ Sauvegarder'}
            </button>
            <button onClick={() => { setResult(null); setMeatList([]); setPartyName(''); window.scrollTo({ top:0, behavior:'smooth' }) }} className="pm-btn-secondary">
              ↩ Recommencer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
