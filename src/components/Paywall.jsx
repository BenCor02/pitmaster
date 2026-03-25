import { useNavigate } from 'react-router-dom'
import { FEATURE_INFO } from '../hooks/usePlan'

const FEATURE_LABELS = {
  save_session: { icon: '☁️', label: 'Sauvegarder des sessions', desc: 'Tu as atteint la limite de sessions sauvegardées.' },
  save_journal: { icon: '📓', label: 'Journal BBQ illimité', desc: 'Tu as atteint la limite d\'entrées dans ton journal.' },
  ask_ai: { icon: '🤖', label: 'Ask The Pitmaster IA', desc: 'Tu as atteint ta limite quotidienne de questions IA.' },
  export_pdf: { icon: '📄', label: 'Export PDF', desc: 'L\'export PDF est réservé aux membres Pro et Ultra.' },
  custom_meats: { icon: '🥩', label: 'Viandes personnalisées', desc: 'Ajoute tes propres viandes avec tes temps de cuisson.' },
  unlimited_party: { icon: '🎉', label: 'Cook Party illimité', desc: 'Ajoute plus de 2 viandes simultanées dans une Cook Party.' },
}

export function PaywallModal({ feature, onClose }) {
  const navigate = useNavigate()
  const info = FEATURE_LABELS[feature] || { icon: '⭐', label: 'Fonctionnalité premium', desc: 'Cette fonctionnalité nécessite un abonnement.' }

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(4px)' }} />
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:201, width:420, maxWidth:'92vw', background:'#171410', border:'1px solid rgba(232,93,4,0.3)', borderRadius:20, padding:28, fontFamily:'DM Sans,sans-serif' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#e85d04,transparent)', borderRadius:'20px 20px 0 0' }} />

        {/* ICON */}
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ width:64, height:64, borderRadius:16, background:'rgba(232,93,4,0.1)', border:'1px solid rgba(232,93,4,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 12px' }}>{info.icon}</div>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:'#fff', marginBottom:6 }}>{info.label}</div>
          <div style={{ fontSize:13, color:'#6a5a4a', lineHeight:1.6 }}>{info.desc}</div>
        </div>

        {/* PLANS */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
          {['pro', 'ultra'].map(p => (
            <div key={p} style={{ background:'#0e0c0a', border:`1px solid ${PLAN_COLORS[p]}40`, borderRadius:12, padding:'14px 12px', textAlign:'center' }}>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, color:PLAN_COLORS[p], marginBottom:4 }}>{PLAN_NAMES[p]}</div>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:'#fff', marginBottom:8 }}>
                {p === 'pro' ? '4.99€' : '9.99€'}<span style={{ fontSize:11, color:'#4a3a2e', fontWeight:400 }}>/mois</span>
              </div>
              {Object.entries(PLAN_LIMITS[p]).slice(0, 4).map(([k, v]) => (
                <div key={k} style={{ fontSize:11, color:'#6a5a4a', marginBottom:3, display:'flex', alignItems:'center', gap:4, justifyContent:'center' }}>
                  <span style={{ color:'#22c55e', fontSize:10 }}>✓</span>
                  {k === 'sessions' ? (v === Infinity ? 'Sessions illimitées' : `${v} sessions`) :
                   k === 'journal' ? (v === Infinity ? 'Journal illimité' : `${v} entrées`) :
                   k === 'ask_ai_daily' ? (v === Infinity ? 'IA illimitée' : `${v} IA/jour`) :
                   k === 'party_meats' ? (v === Infinity ? 'Party illimité' : `${v} viandes max`) : null}
                </div>
              ))}
            </div>
          ))}
        </div>

        <button onClick={() => { navigate('/pricing'); onClose() }} style={{ width:'100%', padding:'14px', border:'none', borderRadius:12, background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(232,93,4,0.3)', marginBottom:8 }}>
          🔥 Voir les offres
        </button>
        <button onClick={onClose} style={{ width:'100%', padding:'11px', border:'1px solid #1e1a14', borderRadius:12, background:'transparent', color:'#6a5a4a', fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          Continuer en Free
        </button>
      </div>
    </>
  )
}

export function PaywallBanner({ feature, plan }) {
  const navigate = useNavigate()
  const info = FEATURE_LABELS[feature] || { icon: '⭐', label: 'Fonctionnalité premium' }
  return (
    <div style={{ background:'rgba(232,93,4,0.06)', border:'1px solid rgba(232,93,4,0.2)', borderRadius:12, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:20 }}>{info.icon}</span>
        <div>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#d4c4b0' }}>{info.label}</div>
          <div style={{ fontSize:11, color:'#6a5a4a', marginTop:2 }}>Disponible à partir du plan {PLAN_NAMES[plan || 'pro']}</div>
        </div>
      </div>
      <button onClick={() => navigate('/pricing')} style={{ padding:'8px 14px', borderRadius:8, border:'1px solid rgba(232,93,4,0.4)', background:'rgba(232,93,4,0.1)', color:'#e85d04', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
        Passer Pro →
      </button>
    </div>
  )
}