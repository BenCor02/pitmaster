/**
 * Profile — Charbon & Flamme
 * Page profil utilisateur + compteur calculs + abonnement
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useCalcLimit } from '../../../hooks/useCalcLimit'
import { getAccessMeta } from '../../../modules/access/catalog'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, signOut, updateProfile } = useAuth()
  const { count, remaining, isPro, FREE_LIMIT } = useCalcLimit()
  const access = getAccessMeta(isPro ? 'pro' : 'free')

  const [editing,   setEditing]   = useState(false)
  const [firstName, setFirstName] = useState(profile?.first_name || '')
  const [lastName,  setLastName]  = useState(profile?.last_name || '')
  const [saving,    setSaving]    = useState(false)
  const [message,   setMessage]   = useState(null)

  async function handleSave() {
    setSaving(true)
    const { error } = await updateProfile({ first_name: firstName, last_name: lastName })
    setSaving(false)
    if (!error) { setEditing(false); setMessage('✓ Profil mis à jour') }
    else setMessage('Erreur : ' + error.message)
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const usedPct = isPro ? 0 : Math.round((count / FREE_LIMIT) * 100)

  const S = {
    card: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:20, marginBottom:12 },
    label: { fontSize:10, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--text3)', marginBottom:8, display:'block' },
    input: { width:'100%', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text)', padding:'11px 14px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:"'DM Sans',sans-serif" },
  }

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", maxWidth:520, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'var(--text)', marginBottom:4 }}>
          Mon profil
        </h1>
        <p style={{ fontSize:12, color:'var(--text3)' }}>{user?.email}</p>
      </div>

      {message && (
        <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:13, color:'#22c55e' }}>
          {message}
        </div>
      )}

      {/* Acces + compteur */}
      <div style={{ ...S.card, border:`1px solid ${isPro ? 'rgba(232,93,4,0.3)' : 'var(--border)'}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:'var(--text)', marginBottom:2 }}>
              {access.label}
            </div>
            <div style={{ fontSize:12, color:'var(--text3)' }}>
              {isPro ? 'Capacites etendues dans l atelier' : `${FREE_LIMIT} calculs dans la fenetre decouverte`}
            </div>
          </div>
          {!isPro && (
            <button onClick={() => navigate('/app/billing')} style={{ padding:'8px 16px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer' }}>
              Voir l&apos;acces
            </button>
          )}
        </div>

        {!isPro && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text3)', marginBottom:6 }}>
              <span>Calculs ce mois-ci</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, color: remaining <= 1 ? '#e85d04' : 'var(--text)' }}>
                {count} / {FREE_LIMIT}
              </span>
            </div>
            <div style={{ height:6, background:'var(--surface2)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${usedPct}%`, background: usedPct >= 80 ? 'linear-gradient(90deg,#f48c06,#e85d04)' : 'var(--orange)', borderRadius:3, transition:'width 0.4s' }} />
            </div>
            <div style={{ fontSize:11, color: remaining === 0 ? '#e85d04' : 'var(--text3)', marginTop:6 }}>
              {remaining === 0
                ? '🔒 Limite atteinte — ouvre un acces atelier plus large pour continuer'
                : `${remaining} calcul${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''} ce mois`
              }
            </div>
          </>
        )}
      </div>

      {/* Infos profil */}
      <div style={S.card}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:16 }}>
          Informations
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={S.label}>Prénom</label>
          {editing ? (
            <input value={firstName} onChange={e => setFirstName(e.target.value)} style={S.input} placeholder="Ton prénom" />
          ) : (
            <div style={{ fontSize:14, color: profile?.first_name ? 'var(--text)' : 'var(--text3)', padding:'11px 0' }}>
              {profile?.first_name || 'Non renseigné'}
            </div>
          )}
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={S.label}>Nom</label>
          {editing ? (
            <input value={lastName} onChange={e => setLastName(e.target.value)} style={S.input} placeholder="Ton nom" />
          ) : (
            <div style={{ fontSize:14, color: profile?.last_name ? 'var(--text)' : 'var(--text3)', padding:'11px 0' }}>
              {profile?.last_name || 'Non renseigné'}
            </div>
          )}
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={S.label}>Email</label>
          <div style={{ fontSize:14, color:'var(--text)', padding:'11px 0' }}>{user?.email}</div>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={S.label}>Rôle</label>
          <div style={{ fontSize:13, color:'var(--text2)', padding:'11px 0' }}>
            {profile?.role || 'member'}
          </div>
        </div>

        {editing ? (
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex:1, padding:'11px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, cursor:'pointer' }}>
              {saving ? '...' : 'Sauvegarder'}
            </button>
            <button onClick={() => setEditing(false)} style={{ flex:1, padding:'11px', borderRadius:10, border:'1px solid var(--border)', background:'transparent', color:'var(--text3)', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Annuler
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} style={{ width:'100%', padding:'11px', borderRadius:10, border:'1px solid var(--border)', background:'transparent', color:'var(--text2)', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:600, cursor:'pointer' }}>
            ✏️ Modifier mon profil
          </button>
        )}
      </div>

      {/* Sécurité */}
      {Boolean(user?.email) && (
        <div style={S.card}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:14 }}>
            Sécurité
          </div>
          <button onClick={() => navigate('/forgot-password')} style={{ width:'100%', padding:'11px', borderRadius:10, border:'1px solid var(--border)', background:'transparent', color:'var(--text2)', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:600, cursor:'pointer' }}>
            🔑 Changer mon mot de passe
          </button>
        </div>
      )}

      {/* Déconnexion */}
      <div style={S.card}>
        <button onClick={handleSignOut} style={{ width:'100%', padding:'11px', borderRadius:10, border:'1px solid rgba(248,113,113,0.2)', background:'rgba(248,113,113,0.04)', color:'#f87171', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:600, cursor:'pointer' }}>
          Se déconnecter
        </button>
      </div>

    </div>
  )
}
