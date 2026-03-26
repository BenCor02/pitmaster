/**
 * Billing — Charbon & Flamme
 * Page abonnement utilisateur
 * Stripe-ready (webhook à brancher plus tard)
 */

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCalcLimit } from '../hooks/useCalcLimit'

const FEATURES_FREE = [
  '5 calculs BBQ par mois',
  'Calculateur de fumage à froid',
  '1 Cook Party test',
  'Journal (5 entrées max)',
]

const FEATURES_PRO = [
  'Calculs BBQ illimités',
  'Sessions de cuisson live',
  'Cook Party illimité',
  'Journal illimité',
  'Historique complet',
  'Accès aux futures fonctionnalités',
]

export default function Billing() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { count, remaining, isPro, FREE_LIMIT } = useCalcLimit()

  const S = {
    card: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:22, marginBottom:12 },
  }

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", maxWidth:520, margin:'0 auto' }}>

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'var(--text)', marginBottom:4 }}>
          Abonnement
        </h1>
        <p style={{ fontSize:12, color:'var(--text3)' }}>Gère ton plan Charbon &amp; Flamme</p>
      </div>

      {/* Plan actuel */}
      <div style={{ ...S.card, border:`1px solid ${isPro ? 'rgba(232,93,4,0.3)' : 'var(--border)'}`, background: isPro ? 'rgba(232,93,4,0.04)' : 'var(--surface)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color: isPro ? '#e85d04' : 'var(--text3)', marginBottom:6 }}>
              Plan actuel
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'var(--text)' }}>
              {isPro ? '⭐ Pro' : '🆓 Gratuit'}
            </div>
          </div>
          {isPro ? (
            <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:8, padding:'4px 12px', fontSize:11, fontWeight:700, color:'#22c55e' }}>
              Actif
            </div>
          ) : (
            <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'4px 12px', fontSize:11, fontWeight:700, color:'var(--text3)' }}>
              Free
            </div>
          )}
        </div>

        {/* Features incluses */}
        <div style={{ display:'grid', gap:6 }}>
          {(isPro ? FEATURES_PRO : FEATURES_FREE).map((f,i) => (
            <div key={i} style={{ display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ color: isPro ? '#22c55e' : 'var(--text3)', fontSize:12 }}>✓</span>
              <span style={{ fontSize:13, color:'var(--text2)' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Compteur calculs si free */}
      {!isPro && (
        <div style={S.card}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:14 }}>
            Calculs ce mois-ci
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text3)', marginBottom:8 }}>
            <span>Utilisés</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, color:'var(--text)' }}>
              {count} / {FREE_LIMIT}
            </span>
          </div>
          <div style={{ height:8, background:'var(--surface2)', borderRadius:4, overflow:'hidden', marginBottom:8 }}>
            <div style={{ height:'100%', width:`${Math.round((count/FREE_LIMIT)*100)}%`, background:'linear-gradient(90deg,#f48c06,#e85d04)', borderRadius:4, transition:'width 0.4s' }} />
          </div>
          <div style={{ fontSize:12, color: remaining === 0 ? '#e85d04' : 'var(--text3)' }}>
            {remaining === 0
              ? '🔒 Limite mensuelle atteinte'
              : `${remaining} calcul${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`
            }
          </div>
        </div>
      )}

      {/* CTA upgrade si free */}
      {!isPro && (
        <div style={{ background:'linear-gradient(135deg,rgba(232,93,4,0.08),rgba(212,78,0,0.04))', border:'1px solid rgba(232,93,4,0.2)', borderRadius:16, padding:22, marginBottom:12 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:'var(--text)', marginBottom:8, lineHeight:1.2 }}>
            Passe en Pro
          </div>
          <p style={{ fontSize:13, color:'var(--text3)', lineHeight:1.7, marginBottom:18 }}>
            Calculs illimités, sessions live, journal complet — sans jamais être bloqué en pleine cuisson.
          </p>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:18 }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:'var(--text)' }}>4.99€</span>
            <span style={{ fontSize:13, color:'var(--text3)' }}>/mois · Sans engagement</span>
          </div>
          <button onClick={() => navigate('/pricing')} style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(232,93,4,0.25)' }}>
            🔥 Passer en Pro — 4.99€/mois
          </button>
        </div>
      )}

      {/* Gestion abonnement si Pro */}
      {isPro && (
        <div style={S.card}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:14 }}>
            Gestion
          </div>
          <p style={{ fontSize:13, color:'var(--text3)', lineHeight:1.6, marginBottom:14 }}>
            Pour gérer ou annuler ton abonnement, contacte-nous.
          </p>
          <a href="mailto:contact@charbonetflamme.fr" style={{ display:'block', width:'100%', padding:'11px', borderRadius:10, border:'1px solid var(--border)', background:'transparent', color:'var(--text2)', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:600, cursor:'pointer', textAlign:'center', textDecoration:'none' }}>
            ✉️ Contacter le support
          </a>
        </div>
      )}

    </div>
  )
}
