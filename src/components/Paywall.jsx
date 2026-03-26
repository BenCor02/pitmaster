/**
 * Paywall — Charbon & Flamme
 * PaywallCalc : blocage calculs (5/mois atteints)
 * PaywallBanner : bandeau discret avec compteur
 * PaywallModal : modal générique feature premium
 */

import { useNavigate } from 'react-router-dom'

// ── Paywall Calculs (blocage complet) ────────────────────────
export function PaywallCalc({ remaining, onClose }) {
  const navigate = useNavigate()
  const isBlocked = remaining === 0

  if (!isBlocked) return null

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(6px)' }} />
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:201, width:440, maxWidth:'92vw', background:'#171410', border:'1px solid rgba(232,93,4,0.25)', borderRadius:22, padding:32, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#e85d04,transparent)', borderRadius:'22px 22px 0 0' }} />

        {/* Icône + titre */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ width:64, height:64, borderRadius:16, background:'rgba(232,93,4,0.1)', border:'1px solid rgba(232,93,4,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 16px' }}>
            🔥
          </div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'#fff', marginBottom:8, lineHeight:1.2 }}>
            Tes 5 calculs gratuits<br />du mois sont utilisés.
          </h2>
          <p style={{ fontSize:13, color:'#7a6a5a', lineHeight:1.7 }}>
            Passe en Pro pour des calculs illimités — et ne plus jamais manquer une cuisson.
          </p>
        </div>

        {/* Ce que Pro débloque */}
        <div style={{ background:'#0e0c0a', border:'1px solid #1e1a14', borderRadius:14, padding:'16px', marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#4a3a2e', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:12 }}>
            Charbon & Flamme Pro
          </div>
          {[
            { icon:'🧮', text:'Calculs BBQ illimités' },
            { icon:'📡', text:'Sessions de cuisson live' },
            { icon:'🍖', text:'Cook Party multi-viandes illimité' },
            { icon:'📓', text:'Journal de cuisson illimité' },
            { icon:'🧬', text:'Accès aux futures fonctionnalités' },
          ].map((f,i) => (
            <div key={i} style={{ display:'flex', gap:10, alignItems:'center', padding:'7px 0', borderBottom:i<4?'1px solid #1a1610':'none' }}>
              <span style={{ fontSize:16, width:22, textAlign:'center' }}>{f.icon}</span>
              <span style={{ fontSize:13, color:'#9a8a7a' }}>{f.text}</span>
              <span style={{ marginLeft:'auto', color:'#22c55e', fontSize:12 }}>✓</span>
            </div>
          ))}
        </div>

        {/* Prix */}
        <div style={{ textAlign:'center', marginBottom:18 }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:'#fff' }}>4.99€</span>
          <span style={{ fontSize:13, color:'#5a4a3a' }}> / mois · Sans engagement</span>
        </div>

        <button onClick={() => { navigate('/pricing'); onClose?.() }} style={{ width:'100%', padding:'15px', border:'none', borderRadius:12, background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(232,93,4,0.3)', marginBottom:8 }}>
          🔥 Passer en Pro — 4.99€/mois
        </button>
        <button onClick={onClose} style={{ width:'100%', padding:'11px', border:'1px solid #1e1a14', borderRadius:12, background:'transparent', color:'#5a4a3a', fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:600, cursor:'pointer' }}>
          Revenir le mois prochain
        </button>
      </div>
    </>
  )
}

// ── Bandeau compteur discret ─────────────────────────────────
export function CalcBanner({ remaining, isPro }) {
  const navigate = useNavigate()
  if (isPro || remaining === null || remaining === undefined) return null

  const urgent = remaining <= 1
  const warn   = remaining <= 2

  return (
    <div style={{
      background: urgent ? 'rgba(232,93,4,0.08)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${urgent ? 'rgba(232,93,4,0.25)' : '#1e1a14'}`,
      borderRadius: 10,
      padding: '10px 14px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    }}>
      <div style={{ fontSize:12, color: urgent ? '#e85d04' : '#5a4a3a' }}>
        {remaining === 0
          ? '🔒 Limite mensuelle atteinte'
          : remaining === 1
          ? '⚠️ Plus qu\'un calcul gratuit ce mois-ci'
          : `🔥 ${remaining} calculs gratuits restants ce mois-ci`
        }
      </div>
      {warn && (
        <button onClick={() => navigate('/pricing')} style={{ padding:'6px 12px', borderRadius:8, border:'1px solid rgba(232,93,4,0.3)', background:'rgba(232,93,4,0.08)', color:'#e85d04', fontFamily:"'Syne',sans-serif", fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
          Passer Pro →
        </button>
      )}
    </div>
  )
}

// ── Paywall Modal générique (features premium) ───────────────
export function PaywallModal({ feature, onClose }) {
  const navigate = useNavigate()

  const LABELS = {
    journal:      { icon:'📓', title:'Journal illimité',        desc:"Tu as atteint la limite d'entrées du plan gratuit." },
    party:        { icon:'🎉', title:'Cook Party illimité',      desc:'Ajoute plus de 2 viandes simultanées.' },
    session_save: { icon:'☁️', title:'Sauvegarde illimitée',     desc:'Sauvegarde et retrouve toutes tes sessions.' },
    ask_ai:       { icon:'🤖', title:'Ask The Pitmaster IA',     desc:'Ta limite quotidienne de questions IA est atteinte.' },
    cold:         { icon:'❄️', title:'Fumage à froid avancé',    desc:'Accède aux recettes et calculs SSV avancés.' },
    export:       { icon:'📄', title:'Export PDF',               desc:'Exporte tes plannings en PDF.' },
  }

  const info = LABELS[feature] || { icon:'⭐', title:'Fonctionnalité Pro', desc:'Cette fonctionnalité est réservée aux membres Pro.' }

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(4px)' }} />
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:201, width:400, maxWidth:'92vw', background:'#171410', border:'1px solid rgba(232,93,4,0.25)', borderRadius:20, padding:28, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#e85d04,transparent)', borderRadius:'20px 20px 0 0' }} />

        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ width:56, height:56, borderRadius:14, background:'rgba(232,93,4,0.1)', border:'1px solid rgba(232,93,4,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 12px' }}>{info.icon}</div>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:'#fff', marginBottom:6 }}>{info.title}</h3>
          <p style={{ fontSize:13, color:'#7a6a5a', lineHeight:1.6 }}>{info.desc}</p>
        </div>

        <div style={{ background:'rgba(232,93,4,0.05)', border:'1px solid rgba(232,93,4,0.1)', borderRadius:10, padding:'12px 14px', marginBottom:18, textAlign:'center' }}>
          <span style={{ fontSize:13, color:'#8a7a6a' }}>Disponible avec </span>
          <strong style={{ color:'#e85d04', fontFamily:"'Syne',sans-serif" }}>Charbon & Flamme Pro</strong>
          <span style={{ fontSize:13, color:'#6a5a4a' }}> — 4.99€/mois</span>
        </div>

        <button onClick={() => { navigate('/pricing'); onClose?.() }} style={{ width:'100%', padding:'14px', border:'none', borderRadius:12, background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:8 }}>
          🔥 Voir les offres Pro
        </button>
        <button onClick={onClose} style={{ width:'100%', padding:'11px', border:'1px solid #1e1a14', borderRadius:12, background:'transparent', color:'#5a4a3a', fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:600, cursor:'pointer' }}>
          Pas maintenant
        </button>
      </div>
    </>
  )
}

// ── Anciens exports conservés pour compatibilité ─────────────
export function PaywallBanner({ feature }) {
  return <PaywallModal feature={feature} onClose={() => {}} />
}