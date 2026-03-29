import { useState, useEffect, useRef } from 'react'
import { MEATS } from '../../../domain/content/meats'
import { calculateLowSlow, buildTimeline, formatDuration } from '../../../domain/calculator/engine'

function calculateCookTime(meatKey, weightKg, thicknessCm, smokerTempC = 120, method, willWrap) {
  const calc = calculateLowSlow(meatKey, weightKg, { thicknessCm, smokerTempC, wrapType: willWrap ? 'butcher_paper' : 'none' })
  return { ...calc, phases: buildTimeline(calc, smokerTempC) }
}
import { useSnack } from '../../../components/useSnack'
import Snack from '../../../components/Snack'

function playBeep(ctx, freq = 880, dur = 0.3, vol = 0.5) {
  if (!ctx) return
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.connect(g); g.connect(ctx.destination)
  o.frequency.value = freq
  g.gain.setValueAtTime(vol, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
  o.start(ctx.currentTime); o.stop(ctx.currentTime + dur)
}

function playAlarm(ctx) {
  if (!ctx) return
  [0, 0.4, 0.8].forEach(d => setTimeout(() => {
    playBeep(ctx, 880, 0.2, 0.6)
    setTimeout(() => playBeep(ctx, 1100, 0.3, 0.6), 150)
  }, d * 1000))
}

function fmt(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

function TimerCard({ timer, onRemove, onToggle, onReset }) {
  const [open, setOpen] = useState(false)
  const pct = timer.total > 0 ? Math.max(0, Math.min(100, (timer.total - timer.remaining) / timer.total * 100)) : 0
  const isDone = timer.remaining === 0
  const isWarning = timer.remaining <= 300 && timer.remaining > 0 && timer.running
  const circ = 2 * Math.PI * 54
  const dash = circ * (1 - pct / 100)

  return (
    <div style={{ background:'var(--surface)', border:`1px solid ${isDone ? 'var(--green)' : isWarning ? 'var(--orange-border)' : 'var(--border)'}`, borderRadius:20, padding:20, marginBottom:10, position:'relative', transition:'border-color 0.3s' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      {isDone && <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'var(--green)', borderRadius:'20px 20px 0 0' }} />}
      {isWarning && !isDone && <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'var(--orange)', borderRadius:'20px 20px 0 0', animation:'pulse 1s infinite' }} />}

      <button onClick={() => onRemove(timer.id)} style={{ position:'absolute', top:12, right:12, background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:15, padding:4, borderRadius:6, transition:'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.color='var(--red)'; e.currentTarget.style.background='rgba(248,113,113,0.1)' }}
        onMouseLeave={e => { e.currentTarget.style.color='var(--text3)'; e.currentTarget.style.background='none' }}>✕</button>

      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        {/* CERCLE */}
        <div style={{ position:'relative', flexShrink:0, width:120, height:120 }}>
          <svg width="120" height="120" style={{ transform:'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--surface2)" strokeWidth="8" />
            <circle cx="60" cy="60" r="54" fill="none"
              stroke={isDone ? 'var(--green)' : 'var(--orange)'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={dash}
              style={{ transition:'stroke-dashoffset 1s linear, stroke 0.3s' }} />
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div style={{ fontFamily:'DM Mono, monospace', fontWeight:700, fontSize: timer.remaining >= 3600 ? 16 : 22, color: isDone ? 'var(--green)' : 'var(--text)', lineHeight:1, letterSpacing:'-1px' }}>
              {isDone ? '✓' : fmt(timer.remaining)}
            </div>
            {!isDone && <div style={{ fontSize:9, color:'var(--text3)', marginTop:3, textTransform:'uppercase' }}>{Math.round(pct)}%</div>}
          </div>
        </div>

        {/* INFOS */}
        <div style={{ flex:1, minWidth:0, paddingRight:24 }}>
          <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{timer.label}</div>
          <div style={{ fontSize:11, color:'var(--text3)', marginBottom:10 }}>Total : {formatDuration(Math.floor(timer.total / 60))}</div>

          {/* Température cible visible directement */}
          {timer.targetTemp && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', background:'var(--orange-bg)', border:'1px solid var(--orange-border)', borderRadius:50, marginBottom:10 }}>
              <span style={{ fontSize:12 }}>🌡️</span>
              <span style={{ fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:14, color:'var(--orange)' }}>{timer.targetTemp}°C</span>
              <span style={{ fontSize:11, color:'var(--text3)' }}>interne</span>
            </div>
          )}

          {isDone ? (
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.25)', borderRadius:50 }}>
              <span>✅</span>
              <span style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:12, color:'var(--green)' }}>Terminé !</span>
            </div>
          ) : (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <button onClick={() => onToggle(timer.id)} style={{ padding:'8px 16px', borderRadius:50, border:'none', background: timer.running ? 'var(--surface2)' : 'var(--orange)', color: timer.running ? 'var(--text2)' : '#fff', fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:12, cursor:'pointer', transition:'all 0.15s' }}>
                {timer.running ? '⏸ Pause' : '▶ Start'}
              </button>
              <button onClick={() => onReset(timer.id)} style={{ padding:'8px 14px', borderRadius:50, border:'1px solid var(--border)', background:'transparent', color:'var(--text3)', fontFamily:'Syne, sans-serif', fontWeight:600, fontSize:12, cursor:'pointer' }}>
                ↺
              </button>
              {(timer.tempLabel || timer.description) && (
                <button onClick={() => setOpen(o => !o)} style={{ padding:'8px 14px', borderRadius:50, border:`1px solid ${open ? 'var(--orange-border)' : 'var(--border)'}`, background: open ? 'var(--orange-bg)' : 'transparent', color: open ? 'var(--orange)' : 'var(--text3)', fontFamily:'Syne, sans-serif', fontWeight:600, fontSize:12, cursor:'pointer', transition:'all 0.15s' }}>
                  {open ? '▲ Masquer' : '▼ Détails'}
                </button>
              )}
            </div>
          )}

          {/* DÉTAILS */}
          {open && (
            <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)' }}>
              {timer.isStall && (
                <div style={{ display:'flex', gap:10, padding:'10px 14px', background:'rgba(232,146,10,0.08)', border:'1px solid rgba(232,146,10,0.2)', borderRadius:12, marginBottom:10 }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>⚠️</span>
                  <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>
                    <strong style={{ color:'var(--gold)' }}>Le stall est normal.</strong> La température peut stagner 2-3h. Ne monte pas le fumoir. Wrapper dans du papier boucher à <strong style={{ color:'var(--gold)' }}>70-74°C interne</strong> pour accélérer.
                  </div>
                </div>
              )}
              {timer.isRest && (
                <div style={{ display:'flex', gap:10, padding:'10px 14px', background:'rgba(96,165,250,0.08)', border:'1px solid rgba(96,165,250,0.2)', borderRadius:12, marginBottom:10 }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>😴</span>
                  <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>
                    <strong style={{ color:'var(--blue)' }}>Repos obligatoire.</strong> Papier boucher + serviette + glacière. Ne pas couper avant la fin.
                  </div>
                </div>
              )}
              {timer.tempLabel && (
                <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>📋 {timer.tempLabel}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TimerPage() {
  const { snack, showSnack } = useSnack()
  const [timers, setTimers] = useState([])
  const [mode, setMode] = useState('manual')
  const [label, setLabel] = useState('')
  const [hours, setHours] = useState(0)
  const [mins, setMins] = useState(30)
  const [secs, setSecs] = useState(0)
  const [meatKey, setMeatKey] = useState('brisket')
  const [meatWeight, setMeatWeight] = useState(3)
  const [smokerTemp, setSmokerTemp] = useState(110)
  const audioRef = useRef(null)

  function initAudio() {
    if (!audioRef.current) audioRef.current = new (window.AudioContext || window.webkitAudioContext)()
    if (audioRef.current.state === 'suspended') audioRef.current.resume()
  }

  // Tick global
  useEffect(() => {
    const id = setInterval(() => {
      setTimers(prev => prev.map(t => {
        if (!t.running || t.remaining <= 0) return t
        const next = t.remaining - 1
        if (next === 300) playBeep(audioRef.current, 660, 0.4, 0.4)
        if (next === 60)  playBeep(audioRef.current, 880, 0.4, 0.5)
        if (next === 0) {
          playAlarm(audioRef.current)
          if (Notification.permission === 'granted') new Notification('🔥 Minuteur terminé !', { body: t.label + ' est prêt !' })
        }
        return { ...t, remaining: next, running: next > 0 }
      }))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
  }, [])

  function addManual() {
    const total = hours * 3600 + mins * 60 + secs
    if (total <= 0) { showSnack('Durée invalide', 'error'); return }
    initAudio()
    setTimers(p => [...p, { id: Date.now(), label: label || formatDuration(Math.floor(total / 60)), total, remaining: total, running: false }])
    setLabel(''); setHours(0); setMins(30); setSecs(0)
  }

  function addFromBBQ() {
    initAudio()
    const weight = parseFloat(meatWeight) || 3
    const temp = parseInt(smokerTemp) || 110
    const meat = MEATS[meatKey]
    if (!meat) { showSnack('Viande introuvable', 'error'); return }

    let calc
    try {
      calc = calculateCookTime(meatKey, weight, null, temp, 'shred', true)
    } catch(e) {
      showSnack('Erreur calcul: ' + e.message, 'error')
      return
    }

    if (!calc || !Array.isArray(calc.phases) || calc.phases.length === 0) {
      showSnack('Aucune phase calculée', 'error')
      return
    }

    let added = 0
    calc.phases.forEach((phase, i) => {
      if (!phase.durationMin || phase.durationMin <= 0) return
      added++

      let targetTemp = null
      let tempLabel = ''
      if (phase.isStall) {
        targetTemp = 72
        tempLabel = 'Plateau 70-74°C interne — wrapper dans du papier boucher'
      } else if (phase.isRest) {
        tempLabel = 'Papier boucher + serviette + glacière fermée'
      } else if (phase.isCrisp) {
        targetTemp = calc.targetTempC
        tempLabel = 'Monter la température pour la peau croustillante'
      } else if (i === 0) {
        tempLabel = 'Fumoir à ' + temp + '°C — formation de l\'écorce, fumée continue'
      } else {
        targetTemp = calc.targetTempC
        tempLabel = 'Cible : ' + calc.targetTempC + '°C interne — sonder toutes les 30 min'
      }

      setTimeout(() => {
        setTimers(p => [...p, {
          id: Date.now() + i * 13,
          label: meat.name + ' — ' + phase.label,
          description: phase.description || '',
          targetTemp,
          tempLabel,
          isStall: !!phase.isStall,
          isRest: !!phase.isRest,
          isCrisp: !!phase.isCrisp,
          total: phase.durationMin * 60,
          remaining: phase.durationMin * 60,
          running: false,
        }])
      }, i * 100)
    })

    if (added > 0) showSnack(added + ' minuteur' + (added > 1 ? 's' : '') + ' importé' + (added > 1 ? 's' : '') + ' !')
    else showSnack('Aucune phase à importer', 'error')
  }

  function quick(sec) {
    initAudio()
    setTimers(p => [...p, { id: Date.now(), label: formatDuration(sec / 60), total: sec, remaining: sec, running: false }])
  }

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif" }}>
      <Snack snack={snack} />

      <div style={{ marginBottom:28 }}>
        <h1>Minuteur <span style={{ color:'var(--orange)' }}>BBQ</span></h1>
        <p style={{ fontSize:11, color:'var(--text3)', marginTop:6, letterSpacing:'1.5px', textTransform:'uppercase', fontWeight:600 }}>
          Timers multiples · Alertes sonores · Notifications
        </p>
      </div>

      {/* CONTRÔLES GLOBAUX */}
      {timers.length > 1 && (
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {timers.some(t => !t.running && t.remaining > 0) && (
            <button onClick={() => { initAudio(); setTimers(p => p.map(t => t.remaining > 0 ? {...t, running:true} : t)) }}
              className="pm-btn-primary" style={{ flex:1, padding:'10px' }}>▶ Tout démarrer</button>
          )}
          {timers.some(t => t.running) && (
            <button onClick={() => setTimers(p => p.map(t => ({...t, running:false})))}
              className="pm-btn-secondary" style={{ flex:1, padding:'10px' }}>⏸ Tout mettre en pause</button>
          )}
        </div>
      )}

      {/* TIMERS */}
      {timers.length === 0 ? (
        <div style={{ textAlign:'center', padding:'32px 20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, marginBottom:16 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>⏱️</div>
          <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:15, color:'var(--text)', marginBottom:6 }}>Aucun minuteur actif</div>
          <div style={{ fontSize:13, color:'var(--text3)' }}>Crée un minuteur manuel ou importe depuis le calculateur BBQ</div>
        </div>
      ) : timers.map(t => (
        <TimerCard key={t.id} timer={t}
          onRemove={id => setTimers(p => p.filter(x => x.id !== id))}
          onToggle={id => { initAudio(); setTimers(p => p.map(x => x.id === id ? {...x, running: !x.running} : x)) }}
          onReset={id => setTimers(p => p.map(x => x.id === id ? {...x, remaining: x.total, running:false} : x))} />
      ))}

      {/* AJOUTER */}
      <div className="pm-card">
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--text3)', marginBottom:14 }}>+ Nouveau minuteur</div>

        <div style={{ display:'flex', background:'var(--surface2)', borderRadius:50, padding:3, marginBottom:16, gap:3 }}>
          {[{id:'manual',label:'⏱️ Manuel'},{id:'bbq',label:'🔥 Depuis BBQ'}].map(tab => (
            <button key={tab.id} onClick={() => setMode(tab.id)}
              style={{ flex:1, padding:'8px', borderRadius:50, border:'none', background: mode===tab.id?'var(--orange)':'transparent', color: mode===tab.id?'#fff':'var(--text3)', fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:12, cursor:'pointer', transition:'all 0.15s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {mode === 'manual' && (
          <div>
            <div style={{ marginBottom:12 }}>
              <label className="pm-field-label">Label</label>
              <input className="pm-input" value={label} onChange={e => setLabel(e.target.value)} placeholder="Phase fumée, Repos, Wrap..." />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
              {[{l:'Heures', v:hours, s:setHours, max:23},{l:'Minutes', v:mins, s:setMins, max:59},{l:'Secondes', v:secs, s:setSecs, max:59}].map(f => (
                <div key={f.l}>
                  <label className="pm-field-label">{f.l}</label>
                  <input className="pm-input" type="number" value={f.v} min={0} max={f.max}
                    onChange={e => f.s(Math.min(f.max, Math.max(0, parseInt(e.target.value)||0)))}
                    style={{ textAlign:'center', fontFamily:'DM Mono, monospace', fontSize:18 }} />
                </div>
              ))}
            </div>
            <button onClick={addManual} className="pm-btn-primary" style={{ width:'100%', padding:'12px' }}>Ajouter ce minuteur</button>
          </div>
        )}

        {mode === 'bbq' && (
          <div>
            <div style={{ marginBottom:12 }}>
              <label className="pm-field-label">Viande</label>
              <select className="pm-input" value={meatKey} onChange={e => setMeatKey(e.target.value)}>
                {Object.entries(MEATS).map(([k, m]) => <option key={k} value={k}>{m.full}</option>)}
              </select>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              <div>
                <label className="pm-field-label">Poids (kg)</label>
                <input className="pm-input" type="number" value={meatWeight} min={0.5} max={20} step={0.5}
                  onChange={e => setMeatWeight(e.target.value)} />
              </div>
              <div>
                <label className="pm-field-label">Fumoir (°C)</label>
                <input className="pm-input" type="number" value={smokerTemp} min={100} max={160} step={5}
                  onChange={e => setSmokerTemp(e.target.value)} />
              </div>
            </div>
            <div style={{ padding:'10px 14px', background:'var(--orange-bg)', border:'1px solid var(--orange-border)', borderRadius:12, marginBottom:12, fontSize:12, color:'var(--text2)' }}>
              💡 Crée automatiquement un minuteur par phase — chaque timer affiche la température cible et les instructions
            </div>
            <button onClick={addFromBBQ} className="pm-btn-primary" style={{ width:'100%', padding:'12px' }}>
              🔥 Importer les phases
            </button>
          </div>
        )}
      </div>

      {/* RAPIDES */}
      <div className="pm-card">
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--text3)', marginBottom:12 }}>⚡ Minuteurs rapides</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {[[30,'30 min'],[45,'45 min'],[60,'1h'],[90,'1h30'],[120,'2h'],[180,'3h']].map(([m,l]) => (
            <button key={m} onClick={() => quick(m * 60)}
              style={{ padding:'10px', borderRadius:50, border:'1px solid var(--border)', background:'var(--surface2)', color:'var(--text2)', fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:12, cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--orange-border)'; e.currentTarget.style.color='var(--orange)'; e.currentTarget.style.background='var(--orange-bg)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text2)'; e.currentTarget.style.background='var(--surface2)' }}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
