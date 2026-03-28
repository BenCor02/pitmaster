import { useNavigate } from 'react-router-dom'
import { useCalcLimit } from '../../../hooks/useCalcLimit'
import { getAccessMeta } from '../../../modules/access/catalog'

const DISCOVERY_CAPABILITIES = [
  'Calculateur BBQ principal',
  'Quelques sauvegardes de sessions',
  'Journal de cuisson de base',
  'Premiers essais Cook Party',
]

const EXTENDED_CAPABILITIES = [
  'Plus de marge pour cuisiner souvent',
  'Sessions de cuisson live',
  'Historique complet',
  'Cook Party plus large',
  'Journal plus confortable',
  'Capacites etendues de l atelier',
]

export default function AccountPage() {
  const navigate = useNavigate()
  const { count, remaining, isPro, FREE_LIMIT } = useCalcLimit()
  const hasWorkshopAccess = isPro
  const access = getAccessMeta(hasWorkshopAccess ? 'pro' : 'free')

  const S = {
    card: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:22, marginBottom:12 },
  }

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", maxWidth:560, margin:'0 auto' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'var(--text)', marginBottom:4 }}>
          Acces & capacites
        </h1>
        <p style={{ fontSize:12, color:'var(--text3)' }}>
          Ce que ton compte peut faire aujourd&apos;hui dans l&apos;atelier Charbon &amp; Flamme
        </p>
      </div>

      <div style={{ ...S.card, border:`1px solid ${hasWorkshopAccess ? 'rgba(232,93,4,0.3)' : 'var(--border)'}`, background: hasWorkshopAccess ? 'rgba(232,93,4,0.04)' : 'var(--surface)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, gap:16 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color: hasWorkshopAccess ? '#e85d04' : 'var(--text3)', marginBottom:6 }}>
              Niveau actuel
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'var(--text)' }}>
              {access.label}
            </div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:6, lineHeight:1.6, maxWidth:360 }}>
              {access.description}
            </div>
          </div>
          <div style={{ background:hasWorkshopAccess ? 'rgba(34,197,94,0.1)' : 'var(--surface2)', border:hasWorkshopAccess ? '1px solid rgba(34,197,94,0.2)' : '1px solid var(--border)', borderRadius:8, padding:'4px 12px', fontSize:11, fontWeight:700, color:hasWorkshopAccess ? '#22c55e' : 'var(--text3)' }}>
            {hasWorkshopAccess ? 'Actif' : 'Découverte'}
          </div>
        </div>

        <div style={{ display:'grid', gap:6 }}>
          {(hasWorkshopAccess ? EXTENDED_CAPABILITIES : DISCOVERY_CAPABILITIES).map((label) => (
            <div key={label} style={{ display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ color:'#22c55e', fontSize:12 }}>✓</span>
              <span style={{ fontSize:13, color:'var(--text2)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {!hasWorkshopAccess && (
        <div style={S.card}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:14 }}>
            Fenetre de calcul actuelle
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text3)', marginBottom:8 }}>
            <span>Utilises</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, color:'var(--text)' }}>
              {count} / {FREE_LIMIT}
            </span>
          </div>
          <div style={{ height:8, background:'var(--surface2)', borderRadius:4, overflow:'hidden', marginBottom:8 }}>
            <div style={{ height:'100%', width:`${Math.round((count / FREE_LIMIT) * 100)}%`, background:'linear-gradient(90deg,#f48c06,#e85d04)', borderRadius:4, transition:'width 0.4s' }} />
          </div>
          <div style={{ fontSize:12, color: remaining === 0 ? '#e85d04' : 'var(--text3)' }}>
            {remaining === 0
              ? 'Fenetre decouverte atteinte'
              : `${remaining} calcul${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`
            }
          </div>
        </div>
      )}

      {!hasWorkshopAccess && (
        <div style={{ background:'linear-gradient(135deg,rgba(232,93,4,0.08),rgba(212,78,0,0.04))', border:'1px solid rgba(232,93,4,0.2)', borderRadius:16, padding:22, marginBottom:12 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:'var(--text)', marginBottom:8, lineHeight:1.2 }}>
            Besoin de plus de marge ?
          </div>
          <p style={{ fontSize:13, color:'var(--text3)', lineHeight:1.7, marginBottom:18 }}>
            Si tu cuisines souvent ou si tu testes beaucoup de sessions, il te faut un accès atelier plus large. Ici, on parle de capacité réelle à cuisiner, pas d’une logique SaaS.
          </p>
          <button onClick={() => navigate('/app/profile')} style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(232,93,4,0.25)' }}>
            Revenir à mon compte
          </button>
        </div>
      )}

      <div style={S.card}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:14 }}>
          Ajuster un compte
        </div>
        <p style={{ fontSize:13, color:'var(--text3)', lineHeight:1.6, marginBottom:14 }}>
          Si tu veux changer les capacites de ce compte, le plus propre est de passer par l&apos;atelier admin ou de nous contacter directement.
        </p>
        <a href="mailto:contact@charbonetflamme.fr" style={{ display:'block', width:'100%', padding:'11px', borderRadius:10, border:'1px solid var(--border)', background:'transparent', color:'var(--text2)', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:600, cursor:'pointer', textAlign:'center', textDecoration:'none' }}>
          ✉️ Contacter l&apos;atelier
        </a>
      </div>
    </div>
  )
}
