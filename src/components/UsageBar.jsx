// Composant barre d'usage réutilisable — à afficher dans l'app
import { useNavigate } from 'react-router-dom'
import { FEATURE_INFO } from '../hooks/usePlan'

export function UsageBar({ featureKey, plan, used, limit, compact = false }) {
  const navigate = useNavigate()
  const info = FEATURE_INFO[featureKey] || { icon:'⭐', label:'Feature' }
  const isUnlimited = limit === -1 || limit === Infinity
  const isBlocked = limit === 0
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const isWarning = pct >= 70
  const isFull = pct >= 100

  if (compact) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:13 }}>{info.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ height:3, background:'#1e1a14', borderRadius:2, overflow:'hidden' }}>
            {!isUnlimited && (
              <div style={{ height:'100%', width:`${pct}%`, background: isFull?'#ef4444':isWarning?'#f48c06':'linear-gradient(90deg,#f48c06,#e85d04)', borderRadius:2, transition:'width 0.4s ease' }} />
            )}
          </div>
        </div>
        <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color: isFull?'#ef4444':isWarning?'#f48c06':'#4a3a2e', whiteSpace:'nowrap' }}>
          {isUnlimited ? '∞' : isBlocked ? '—' : `${used}/${limit}`}
        </span>
      </div>
    )
  }

  return (
    <div style={{ background:'#0e0c0a', border:`1px solid ${isFull?'rgba(239,68,68,0.3)':isWarning?'rgba(244,140,6,0.2)':'#1e1a14'}`, borderRadius:10, padding:'12px 14px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:15 }}>{info.icon}</span>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:12, color:'#d4c4b0' }}>{info.label}</span>
        </div>
        <span style={{ fontFamily:'DM Mono,monospace', fontSize:12, fontWeight:700, color: isFull?'#ef4444':isWarning?'#f48c06':'#6a5a4a' }}>
          {isUnlimited ? '∞ illimité' : isBlocked ? 'Bloqué' : `${used} / ${limit}`}
        </span>
      </div>
      {!isUnlimited && !isBlocked && (
        <>
          <div style={{ height:4, background:'#1e1a14', borderRadius:2, overflow:'hidden', marginBottom:6 }}>
            <div style={{ height:'100%', width:`${pct}%`, background: isFull?'linear-gradient(90deg,#ef4444,#dc2626)':isWarning?'linear-gradient(90deg,#f48c06,#e85d04)':'linear-gradient(90deg,#22c55e,#16a34a)', borderRadius:2, transition:'width 0.5s ease' }} />
          </div>
          {isFull && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:11, color:'#ef4444' }}>Limite atteinte</span>
              <button onClick={() => navigate('/pricing')} style={{ padding:'3px 10px', borderRadius:6, border:'none', background:'#e85d04', color:'#fff', fontFamily:'Syne,sans-serif', fontSize:10, fontWeight:700, cursor:'pointer' }}>
                Upgrader →
              </button>
            </div>
          )}
          {isWarning && !isFull && (
            <span style={{ fontSize:11, color:'#f48c06' }}>{limit - used} restant{limit - used > 1 ? 's' : ''}</span>
          )}
        </>
      )}
    </div>
  )
}

// Widget compact pour la sidebar ou le header
export function UsageSummary({ usePlanData }) {
  const { plan, features, getUsage, getLimit, can } = usePlanData
  const navigate = useNavigate()

  const keyFeatures = ['calc_uses', 'ask_ai_daily', 'session_saves']
  const hasWarning = keyFeatures.some(k => {
    const limit = getLimit(k)
    return limit !== Infinity && limit > 0 && (getUsage(k) / limit) >= 0.7
  })

  if (plan !== 'free') return null

  return (
    <div style={{ background:'#0e0c0a', border:`1px solid ${hasWarning?'rgba(244,140,6,0.3)':'#1e1a14'}`, borderRadius:10, padding:'12px 14px', marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <span style={{ fontFamily:'Syne,sans-serif', fontSize:10, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color:'#3a2e24' }}>Plan Free</span>
        <button onClick={() => navigate('/pricing')} style={{ padding:'3px 10px', borderRadius:6, border:'1px solid rgba(232,93,4,0.3)', background:'rgba(232,93,4,0.08)', color:'#e85d04', fontFamily:'Syne,sans-serif', fontSize:10, fontWeight:700, cursor:'pointer' }}>
          Upgrader
        </button>
      </div>
      {keyFeatures.map(k => (
        <div key={k} style={{ marginBottom:6 }}>
          <UsageBar featureKey={k} used={getUsage(k)} limit={getLimit(k)} compact />
        </div>
      ))}
    </div>
  )
}
