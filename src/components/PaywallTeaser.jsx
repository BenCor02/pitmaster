import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.7}}
  .fade-up{animation:fadeUp 0.25s ease both}
  .blur-overlay{position:relative;overflow:hidden;border-radius:14px}
  .blur-content{filter:blur(6px);pointer-events:none;user-select:none;opacity:0.4}
  .shimmer-line{height:12px;border-radius:6px;background:linear-gradient(90deg,#1e1a14 25%,#2a2418 50%,#1e1a14 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
`

// ─── LIGNES FAKÉES POUR LE FLOU ───
function FakeTimeline() {
  const lines = [
    { w:'60%', dim:false }, { w:'80%', dim:true }, { w:'70%', dim:false },
    { w:'90%', dim:true }, { w:'55%', dim:false }, { w:'75%', dim:true },
  ]
  return (
    <div style={{ padding:'16px 0' }}>
      {lines.map((l, i) => (
        <div key={i} style={{ display:'grid', gridTemplateColumns:'48px 10px 1fr', gap:'0 10px', padding:'10px 0', position:'relative' }}>
          {i < lines.length - 1 && <div style={{ position:'absolute', left:52, top:26, bottom:-10, width:1, background:'rgba(232,93,4,0.1)' }} />}
          <div style={{ height:10, borderRadius:5, background:'#2a2418', alignSelf:'center' }} />
          <div style={{ width:8, height:8, borderRadius:'50%', background: i===0?'#e85d04':'#2a2418', alignSelf:'center', justifySelf:'center' }} />
          <div>
            <div style={{ height:12, borderRadius:6, background: i===0?'#3a2e24':'#1e1a14', width:l.w, marginBottom:5 }} />
            <div style={{ height:9, borderRadius:5, background:'#181410', width:'70%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function FakeRub() {
  return (
    <div style={{ padding:'4px 0' }}>
      {[['70%','30%'],['60%','25%'],['75%','35%'],['55%','20%'],['65%','28%']].map(([w1,w2], i) => (
        <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #181410' }}>
          <div style={{ height:10, borderRadius:5, background:'#1e1a14', width:w1 }} />
          <div style={{ height:10, borderRadius:5, background:'#2a2418', width:w2 }} />
        </div>
      ))}
    </div>
  )
}

function FakeTips() {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ background:'#0e0c0a', border:'1px solid #1e1a14', borderRadius:10, padding:12 }}>
          <div style={{ height:9, borderRadius:5, background:'#2a2418', width:'60%', marginBottom:8 }} />
          <div style={{ height:9, borderRadius:5, background:'#181410', width:'100%', marginBottom:4 }} />
          <div style={{ height:9, borderRadius:5, background:'#181410', width:'80%' }} />
        </div>
      ))}
    </div>
  )
}

export default function PaywallTeaser({ result, usedCount, freeLimit, onUnlock }) {
  const navigate = useNavigate()
  const [hover, setHover] = useState(false)
  const remaining = freeLimit - usedCount

  return (
    <div className="fade-up" style={{ fontFamily:'DM Sans,sans-serif' }}>

      {/* HERO — TOUJOURS VISIBLE */}
      <div style={{
        background:'linear-gradient(160deg,#1e1208,#171410)',
        border:'1px solid rgba(232,93,4,0.3)',
        borderRadius:16, padding:'28px 20px', textAlign:'center', marginBottom:12,
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% -20%,rgba(232,93,4,0.1),transparent 60%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#e85d04,transparent)' }} />

        <p style={{ fontSize:10, fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'#4a3a2e', marginBottom:8 }}>
          Lance ta cuisson à
        </p>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:80, fontWeight:800, lineHeight:1, color:'#e85d04', letterSpacing:'-3px', textShadow:'0 0 60px rgba(232,93,4,0.35)', marginBottom:8 }}>
          {result.start}
        </div>
        <p style={{ fontSize:12, color:'#4a3a2e' }}>
          {result.meat.full} · {result.weight}kg · {result.smokerTemp}°C
        </p>
        <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:12, flexWrap:'wrap' }}>
          <span style={{ background:'rgba(232,93,4,0.1)', border:'1px solid rgba(232,93,4,0.3)', borderRadius:6, padding:'4px 10px', fontSize:11, fontFamily:'DM Mono,monospace', color:'#e85d04', fontWeight:600 }}>{result.meat.temp}</span>
          <span style={{ background:'#0e0c0a', border:'1px solid #1e1a14', borderRadius:6, padding:'4px 10px', fontSize:11, fontFamily:'DM Mono,monospace', color:'#4a3a2e' }}>{result.smokerTemp}°C fumoir</span>
        </div>

        {/* COMPTEUR UTILISATIONS */}
        {remaining > 0 && (
          <div style={{ marginTop:14, padding:'8px 14px', background:'rgba(232,93,4,0.06)', border:'1px solid rgba(232,93,4,0.15)', borderRadius:8, display:'inline-flex', alignItems:'center', gap:8, fontSize:12 }}>
            <div style={{ display:'flex', gap:4 }}>
              {[...Array(freeLimit)].map((_, i) => (
                <div key={i} style={{ width:8, height:8, borderRadius:'50%', background: i < usedCount ? '#e85d04' : '#2a2418' }} />
              ))}
            </div>
            <span style={{ color:'#6a5a4a' }}>
              {remaining === 1 ? <span style={{ color:'#f48c06', fontWeight:700 }}>⚠️ Dernier calcul gratuit</span> : `${remaining} calcul${remaining>1?'s':''} gratuit${remaining>1?'s':''} restant${remaining>1?'s':''}`}
            </span>
          </div>
        )}
      </div>

      {/* SECTIONS FLOUTÉES + PAYWALL */}
      <div style={{ position:'relative', marginBottom:12 }}>

        {/* CONTENU FLOUTÉ */}
        <div style={{ filter:'blur(5px)', pointerEvents:'none', userSelect:'none', opacity:0.35 }}>

          {/* FAUSSE TIMELINE */}
          <div style={{ background:'#171410', border:'1px solid #1e1a14', borderRadius:14, padding:'18px 20px', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e' }}>📋 PLANNING COMPLET</span>
            </div>
            <FakeTimeline />
          </div>

          {/* FAUX RUB */}
          <div style={{ background:'#171410', border:'1px solid #1e1a14', borderRadius:14, padding:'18px 20px', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e' }}>🧂 RUB & ASSAISONNEMENT</span>
            </div>
            <FakeRub />
          </div>

          {/* FAUX TIPS */}
          <div style={{ background:'#171410', border:'1px solid #1e1a14', borderRadius:14, padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#4a3a2e' }}>💡 CONSEILS PIT-MASTER</span>
            </div>
            <FakeTips />
          </div>
        </div>

        {/* ── PAYWALL OVERLAY ── */}
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(180deg, transparent 0%, rgba(8,7,6,0.6) 25%, rgba(8,7,6,0.97) 50%)',
          display:'flex', alignItems:'flex-end', justifyContent:'center',
          padding:'0 16px 24px',
          borderRadius:14,
        }}>
          <div style={{ width:'100%', maxWidth:420, textAlign:'center' }}>

            {/* LOCK ICON */}
            <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#f48c06,#d44e00)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 14px', boxShadow:'0 6px 20px rgba(232,93,4,0.4)' }}>
              🔒
            </div>

            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, color:'#fff', marginBottom:6, letterSpacing:'-0.3px' }}>
              Débloque le planning complet
            </h3>
            <p style={{ fontSize:13, color:'#6a5a4a', lineHeight:1.6, marginBottom:20 }}>
              Planning détaillé étape par étape, recette de rub, bois de fumage, conseils pro — tout pour réussir ta cuisson.
            </p>

            {/* PREVIEW DES FEATURES BLOQUÉES */}
            <div style={{ display:'flex', gap:6, justifyContent:'center', flexWrap:'wrap', marginBottom:20 }}>
              {['📋 Planning 6 étapes','🧂 Recette rub complète','🪵 Bois de fumage','💡 4 conseils pro','⏱️ Minuteur live'].map((f,i) => (
                <span key={i} style={{ background:'rgba(232,93,4,0.08)', border:'1px solid rgba(232,93,4,0.2)', borderRadius:6, padding:'4px 10px', fontSize:11, color:'#8a7060', fontWeight:600 }}>
                  {f}
                </span>
              ))}
            </div>

            {/* CTA PRINCIPAL */}
            <button
              onClick={() => navigate('/pricing')}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                width:'100%', padding:'15px', border:'none', borderRadius:12,
                fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, letterSpacing:'0.5px',
                cursor:'pointer', color:'#fff',
                background:'linear-gradient(135deg,#f48c06,#d44e00)',
                boxShadow: hover ? '0 8px 28px rgba(232,93,4,0.5)' : '0 4px 16px rgba(232,93,4,0.3)',
                transform: hover ? 'translateY(-1px)' : 'none',
                transition:'all 0.2s cubic-bezier(0.34,1.4,0.64,1)',
                marginBottom:10,
              }}>
              🔥 Passer Pro — 4.99€/mois
            </button>

            {/* CTA SECONDAIRE */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <button onClick={() => navigate('/pricing')} style={{ padding:'11px', borderRadius:10, border:'1px solid rgba(244,140,6,0.3)', background:'rgba(244,140,6,0.08)', color:'#f48c06', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                ⚡ Ultra 9.99€/mois
              </button>
              <button onClick={() => navigate('/pricing')} style={{ padding:'11px', borderRadius:10, border:'1px solid #1e1a14', background:'transparent', color:'#4a3a2e', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.color='#8a7060'}}
                onMouseLeave={e=>{e.currentTarget.style.color='#4a3a2e'}}>
                Voir tous les plans
              </button>
            </div>

            <p style={{ fontSize:11, color:'#2e2218', marginTop:10 }}>
              Sans engagement · Annulation en 1 clic · 7 jours satisfait ou remboursé
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
