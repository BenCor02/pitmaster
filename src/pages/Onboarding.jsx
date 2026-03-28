/**
 * Onboarding — Charbon & Flamme
 * Flow ultra-court : aha moment immédiat → compte après résultat
 * "Lance ta cuisson à 05:47" en moins de 30 secondes
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { calculateLowSlow, formatDuration } from '../lib/calculator'

// ── Calcul rapide pour la preview ────────────────────────────
function quickCalc(meatKey, weightKg, smokerTempC, serveHour) {
  try {
    const result = calculateLowSlow(meatKey, weightKg, {
      smokerTempC, smokerType:'offset', wrapType:'butcher_paper',
      marbling:'medium', waterPan:false, startTempC:4,
    })
    if (!result) return null
    const totalMin = result.totalMin || result.cookMin + 60
    const serveDate = new Date()
    serveDate.setHours(serveHour, 0, 0, 0)
    if (serveDate < new Date()) serveDate.setDate(serveDate.getDate() + 1)
    const launch = new Date(serveDate.getTime() - totalMin * 60000)
    return {
      launchH: launch.getHours().toString().padStart(2,'0') + ':' + launch.getMinutes().toString().padStart(2,'0'),
      totalH:  formatDuration(result.cookMin),
      restH:   formatDuration(result.restMin || 60),
      target:  result.targetTempC || 95,
      window:  result.cookMin ? formatDuration(result.cookMin) : null,
    }
  } catch { return null }
}

const MEATS = [
  { key:'brisket',        label:'Brisket',       emoji:'🥩' },
  { key:'pork_shoulder',  label:'Pulled Pork',   emoji:'🐷' },
  { key:'ribs_pork',      label:'Spare Ribs',    emoji:'🍖' },
  { key:'ribs_beef',      label:'Beef Ribs',     emoji:'🦴' },
  { key:'lamb_shoulder',  label:'Épaule Agneau', emoji:'🐑' },
  { key:'paleron',        label:'Paleron',       emoji:'🥩' },
]

export default function Onboarding() {
  const { user, updateProfile } = useAuth()
  const navigate  = useNavigate()

  // ── States ──────────────────────────────────────────────────
  const [phase,      setPhase]      = useState('calc')   // calc | result | account
  const [meatKey,    setMeatKey]    = useState('brisket')
  const [weight,     setWeight]     = useState(5)
  const [smokerTemp, setSmokerTemp] = useState(120)
  const [serveHour,  setServeHour]  = useState(19)
  const [calcResult, setCalcResult] = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [experience, setExperience] = useState(null)

  // Preview live
  useEffect(() => {
    const r = quickCalc(meatKey, weight, smokerTemp, serveHour)
    setCalcResult(r)
  }, [meatKey, weight, smokerTemp, serveHour])

  async function finishOnboarding() {
    setSaving(true)
    // PATCH: ancien flow user_id/plan supprimé. On n'écrit plus dans l'ancien schéma profiles.
    await updateProfile({
      plan_code: 'free',
      first_name: user?.user_metadata?.first_name || '',
      last_name: user?.user_metadata?.last_name || '',
    })
    setSaving(false)
    navigate('/app')
  }

  // ── UI helpers ───────────────────────────────────────────────
  const S = { // styles communs
    card: { background:'#171410', border:'1px solid #1e1a14', borderRadius:20, padding:28, position:'relative', overflow:'hidden', maxWidth:460, width:'100%' },
    label: { fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:'#6a5a4a', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:8, display:'block' },
    input: { width:'100%', background:'#0e0c0a', border:'1px solid #2a2218', borderRadius:12, color:'#fff', padding:'12px 14px', fontSize:16, fontFamily:"'DM Mono',monospace", fontWeight:700, outline:'none', boxSizing:'border-box' },
    btn: { width:'100%', padding:'15px', border:'none', borderRadius:12, fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, cursor:'pointer', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', boxShadow:'0 4px 16px rgba(232,93,4,0.28)' },
    btnSec: { width:'100%', padding:'12px', border:'1px solid #2a2218', borderRadius:12, fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:600, cursor:'pointer', background:'transparent', color:'#6a5a4a' },
  }

  // ── PHASE 1 : CALCULATEUR ─────────────────────────────────
  if (phase === 'calc') return (
    <div style={{ minHeight:'100vh', background:'#080706', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:"'DM Sans',sans-serif" }}>

      {/* Logo */}
      <div style={{ marginBottom:28, textAlign:'center' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, background:'linear-gradient(135deg,#f48c06,#e85d04)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:4 }}>
          🔥 Charbon &amp; Flamme
        </div>
        <div style={{ fontSize:12, color:'#4a3a2e' }}>5 calculs gratuits par mois</div>
      </div>

      <div style={S.card}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#e85d04,transparent)' }} />

        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'#fff', marginBottom:6, textAlign:'center' }}>
          À quelle heure lancer ta cuisson ?
        </h1>
        <p style={{ fontSize:13, color:'#6a5a4a', textAlign:'center', marginBottom:24, lineHeight:1.6 }}>
          Entre tes paramètres — le résultat arrive en direct.
        </p>

        {/* Viande */}
        <div style={{ marginBottom:16 }}>
          <label style={S.label}>Viande</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
            {MEATS.map(m => (
              <button key={m.key} onClick={() => setMeatKey(m.key)} style={{ padding:'10px 8px', borderRadius:10, border:`1px solid ${meatKey===m.key?'rgba(232,93,4,0.4)':'#1e1a14'}`, background:meatKey===m.key?'rgba(232,93,4,0.08)':'#0e0c0a', cursor:'pointer', textAlign:'center', transition:'all 0.15s' }}>
                <div style={{ fontSize:18, marginBottom:3 }}>{m.emoji}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:meatKey===m.key?'#e85d04':'#8a7a6a' }}>{m.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Poids + Heure de service */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          <div>
            <label style={S.label}>Poids (kg)</label>
            <input type="number" value={weight} min={0.5} max={20} step={0.5}
              onChange={e => setWeight(parseFloat(e.target.value)||4)}
              style={S.input} />
          </div>
          <div>
            <label style={S.label}>Service (heure)</label>
            <input type="number" value={serveHour} min={10} max={23} step={1}
              onChange={e => setServeHour(parseInt(e.target.value)||19)}
              style={S.input} />
          </div>
        </div>

        {/* T° fumoir */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <label style={{ ...S.label, marginBottom:0 }}>T° fumoir</label>
            <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:16, color:'#e85d04' }}>{smokerTemp}°C</span>
          </div>
          <input type="range" min={100} max={150} step={5} value={smokerTemp}
            onChange={e => setSmokerTemp(parseInt(e.target.value))}
            style={{ width:'100%' }} />
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#3a2e24', marginTop:4 }}>
            <span>100°C Low & Slow</span><span>150°C Hot & Fast</span>
          </div>
        </div>

        {/* PREVIEW RÉSULTAT LIVE */}
        {calcResult && (
          <div style={{ background:'linear-gradient(135deg,rgba(232,93,4,0.08),rgba(212,78,0,0.04))', border:'1px solid rgba(232,93,4,0.2)', borderRadius:14, padding:'18px 20px', marginBottom:20, textAlign:'center' }}>
            <div style={{ fontSize:11, color:'#e85d04', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:8 }}>Lance ta cuisson à</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:52, color:'#e85d04', letterSpacing:'-2px', lineHeight:1, marginBottom:8 }}>
              {calcResult.launchH}
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
              <span style={{ background:'#0e0c0a', border:'1px solid #1e1a14', borderRadius:6, padding:'3px 10px', fontSize:11, fontFamily:"'DM Mono',monospace", color:'#6a5a4a' }}>Cuisson {calcResult.totalH}</span>
              <span style={{ background:'#0e0c0a', border:'1px solid #1e1a14', borderRadius:6, padding:'3px 10px', fontSize:11, fontFamily:"'DM Mono',monospace", color:'#6a5a4a' }}>Repos {calcResult.restH}</span>
              <span style={{ background:'#0e0c0a', border:'1px solid #1e1a14', borderRadius:6, padding:'3px 10px', fontSize:11, fontFamily:"'DM Mono',monospace", color:'#6a5a4a' }}>Cible {calcResult.target}°C</span>
            </div>
          </div>
        )}

        <button onClick={() => setPhase('result')} style={S.btn}>
          🔥 Voir mon planning complet
        </button>
        <div style={{ textAlign:'center', marginTop:10, fontSize:11, color:'#3a2e24' }}>
          Gratuit · Pas de carte bancaire
        </div>
      </div>
    </div>
  )

  // ── PHASE 2 : RÉSULTAT COMPLET ────────────────────────────
  if (phase === 'result') return (
    <div style={{ minHeight:'100vh', background:'#080706', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:"'DM Sans',sans-serif" }}>

      <div style={{ ...S.card, maxWidth:480 }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#22c55e,transparent)' }} />

        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'#22c55e', marginBottom:8 }}>Ton planning est prêt</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:48, color:'#e85d04', letterSpacing:'-2px', marginBottom:6 }}>
            {calcResult?.launchH || '05:47'}
          </div>
          <div style={{ fontSize:13, color:'#6a5a4a' }}>
            {MEATS.find(m => m.key===meatKey)?.label} {weight}kg · {smokerTemp}°C · Service {serveHour}h00
          </div>
        </div>

        {/* Détail phases */}
        <div style={{ background:'#0e0c0a', border:'1px solid #1e1a14', borderRadius:12, padding:'16px', marginBottom:20 }}>
          {[
            { label:'Durée de cuisson', value:calcResult?.totalH,  icon:'🔥' },
            { label:'Repos minimum',    value:calcResult?.restH,   icon:'😴' },
            { label:'T° cible',         value:`${calcResult?.target}°C probe tender`, icon:'🌡️' },
          ].map((r,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:i<2?'1px solid #1a1610':'none' }}>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <span style={{ fontSize:16 }}>{r.icon}</span>
                <span style={{ fontSize:13, color:'#8a7a6a' }}>{r.label}</span>
              </div>
              <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:13, color:'#d4c4b0' }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Séparateur valeur */}
        <div style={{ background:'rgba(232,93,4,0.05)', border:'1px solid rgba(232,93,4,0.1)', borderRadius:10, padding:'12px 16px', marginBottom:20, textAlign:'center' }}>
          <div style={{ fontSize:12, color:'#6a5a4a', marginBottom:4 }}>Pour sauvegarder ce planning et accéder au suivi live</div>
          <div style={{ fontSize:13, color:'#c4b4a0', fontWeight:600 }}>Crée ton compte — c'est gratuit</div>
        </div>

        <button onClick={() => setPhase('account')} style={S.btn}>
          ✅ Sauvegarder mon planning
        </button>
        <button onClick={finishOnboarding} disabled={saving} style={{ ...S.btnSec, marginTop:8 }}>
          {saving ? '...' : 'Continuer sans compte →'}
        </button>
      </div>
    </div>
  )

  // ── PHASE 3 : CRÉATION COMPTE ─────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'#080706', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:"'DM Sans',sans-serif" }}>

      <div style={{ ...S.card, maxWidth:440 }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#e85d04,transparent)' }} />

        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:42, marginBottom:12 }}>🔥</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:'#fff', marginBottom:6 }}>
            Ton niveau en BBQ ?
          </h2>
          <p style={{ fontSize:13, color:'#6a5a4a', lineHeight:1.6 }}>
            Pour personnaliser tes prochains calculs
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:24 }}>
          {[
            { v:'beginner',    icon:'🌱', label:'Débutant',       desc:"Je commence" },
            { v:'intermediate',icon:'🔥', label:'Intermédiaire',  desc:"Quelques cooks" },
            { v:'advanced',    icon:'⚡', label:'Avancé',         desc:"Je maîtrise" },
            { v:'pro',         icon:'👑', label:'Pro',             desc:"Restau / traiteur" },
          ].map(o => (
            <button key={o.v} onClick={() => setExperience(o.v)} style={{ padding:'14px 12px', borderRadius:12, border:`1px solid ${experience===o.v?'rgba(232,93,4,0.4)':'#1e1a14'}`, background:experience===o.v?'rgba(232,93,4,0.08)':'#0e0c0a', cursor:'pointer', textAlign:'center', transition:'all 0.15s' }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{o.icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:experience===o.v?'#e85d04':'#d4c4b0', marginBottom:3 }}>{o.label}</div>
              <div style={{ fontSize:11, color:'#4a3a2e' }}>{o.desc}</div>
            </button>
          ))}
        </div>

        {/* Ce qu'ils obtiennent */}
        <div style={{ background:'#0e0c0a', border:'1px solid #1e1a14', borderRadius:12, padding:'14px', marginBottom:20 }}>
          <div style={{ fontSize:11, color:'#4a3a2e', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginBottom:10 }}>Inclus dans le plan gratuit</div>
          {[
            '5 calculs BBQ par mois',
            'Calculateur de fumage à froid',
            '1 Cook Party multi-viandes',
            'Journal de cuisson (jusqu\'à 5 calculs)',
          ].map((f,i) => (
            <div key={i} style={{ display:'flex', gap:8, alignItems:'center', padding:'6px 0', borderBottom:i<3?'1px solid #1a1610':'none' }}>
              <span style={{ color:'#22c55e', fontSize:12 }}>✓</span>
              <span style={{ fontSize:12, color:'#8a7a6a' }}>{f}</span>
            </div>
          ))}
        </div>

        <button onClick={finishOnboarding} disabled={saving || !experience} style={{ ...S.btn, opacity:(!experience||saving)?0.5:1, cursor:(!experience||saving)?'not-allowed':'pointer' }}>
          {saving ? '⏳ Configuration...' : '🔥 Lancer Charbon & Flamme'}
        </button>
        <div style={{ textAlign:'center', marginTop:10, fontSize:11, color:'#3a2e24' }}>
          Gratuit · 5 calculs/mois · Pas de carte bancaire
        </div>
      </div>
    </div>
  )
}
