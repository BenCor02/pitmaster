/**
 * Auth — Charbon & Flamme
 * Login / Signup avec Google, Apple, Email
 * Utilisé après le flou du résultat calcul
 */

import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const REDIRECT = `${window.location.origin}/app`
const PROJECT_URL = 'https://zkjfuzclkrwyustgsezd.supabase.co'

export default function Auth() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || '/app'
  const { user, signOut, profile, roles, reloadProfile } = useAuth()

  const [mode,     setMode]     = useState('login') // login | signup
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(null) // null | 'google' | 'apple' | 'email'
  const [error,    setError]    = useState(null)
  const [sent,     setSent]     = useState(false)
  const [debug,    setDebug]    = useState(null)

  async function loadDebug() {
    if (!user?.id) {
      setDebug(null)
      return
    }

    const [profileRes, rpcRes, sessionRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id),
      supabase.rpc('get_my_profile'),
      supabase.auth.getSession(),
    ])

    setDebug({
      projectUrl: PROJECT_URL,
      profileQuery: {
        data: profileRes.data || null,
        error: profileRes.error ? {
          message: profileRes.error.message,
          code: profileRes.error.code,
          details: profileRes.error.details,
        } : null,
      },
      rpcQuery: {
        data: rpcRes.data || null,
        error: rpcRes.error ? {
          message: rpcRes.error.message,
          code: rpcRes.error.code,
          details: rpcRes.error.details,
        } : null,
      },
      sessionUserId: sessionRes.data?.session?.user?.id || null,
      sessionEmail: sessionRes.data?.session?.user?.email || null,
    })
  }

  useEffect(() => {
    if (user?.id) {
      loadDebug()
    } else {
      setDebug(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function signInGoogle() {
    setLoading('google'); setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: REDIRECT },
    })
    if (error) { setError(error.message); setLoading(null) }
  }

  async function signInApple() {
    setLoading('apple'); setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: REDIRECT },
    })
    if (error) { setError(error.message); setLoading(null) }
  }

  async function handleEmail(e) {
    e.preventDefault()
    setLoading('email'); setError(null)
    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email ou mot de passe incorrect')
        setLoading(null)
      } else if (!data?.session?.user) {
        setError('Connexion acceptée, mais aucune session n’a été créée côté navigateur.')
        setLoading(null)
      } else {
        await reloadProfile()
        navigate(from, { replace: true })
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: REDIRECT },
      })
      if (error) { setError(error.message); setLoading(null) }
      else setSent(true)
    }
  }

  async function handleSignOut() {
    setError(null)
    setLoading('email')
    try {
      await signOut()
      navigate('/auth', { replace: true })
      setTimeout(() => {
        window.location.reload()
      }, 120)
    } catch (err) {
      setError(err?.message || 'Impossible de se déconnecter')
    } finally {
      setLoading(null)
    }
  }

  const S = {
    page:  { minHeight:'100vh', background:'#080706', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:"'DM Sans',sans-serif" },
    card:  { background:'#171410', border:'1px solid #1e1a14', borderRadius:20, padding:32, width:'100%', maxWidth:400, position:'relative', overflow:'hidden' },
    input: { width:'100%', background:'#0e0c0a', border:'1px solid #2a2218', borderRadius:10, color:'#fff', padding:'12px 14px', fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box', marginBottom:10 },
    btn:   { width:'100%', padding:'13px', borderRadius:10, border:'none', fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:8, display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'opacity 0.15s' },
  }

  if (sent) return (
    <div style={S.page}>
      <div style={{ ...S.card, textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📬</div>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:'#fff', marginBottom:8 }}>Vérifie tes emails</h2>
        <p style={{ fontSize:13, color:'#7a6a5a', lineHeight:1.7, marginBottom:20 }}>
          Un lien de confirmation a été envoyé à <strong style={{ color:'#d4c4b0' }}>{email}</strong>
        </p>
        <button onClick={() => setSent(false)} style={{ ...S.btn, background:'transparent', border:'1px solid #2a2218', color:'#6a5a4a' }}>
          ← Retour
        </button>
      </div>
    </div>
  )

  if (user) {
    return (
      <div style={S.page}>
        <div style={{ marginBottom:28, textAlign:'center' }}>
          <div onClick={() => navigate('/')} style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, background:'linear-gradient(135deg,#f48c06,#e85d04)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', cursor:'pointer', marginBottom:6 }}>
            🔥 Charbon &amp; Flamme
          </div>
        </div>

        <div style={{ ...S.card, textAlign:'center' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#e85d04,transparent)' }} />
          <div style={{ fontSize:42, marginBottom:14 }}>👋</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:'#fff', marginBottom:8 }}>
            Déjà connecté
          </h2>
          <p style={{ fontSize:13, color:'#7a6a5a', lineHeight:1.7, marginBottom:10 }}>
            Compte actif :
          </p>
          <div style={{ fontSize:14, color:'#d4c4b0', marginBottom:6 }}>{user.email}</div>
          <div style={{ fontSize:12, color:'#5a4a3a', marginBottom:22 }}>
            Rôle : {profile?.role || 'member'}
            <br />
            User ID : {user.id}
            <br />
            Profile ID : {profile?.id || '—'}
            <br />
            Roles[] : {Array.isArray(roles) && roles.length ? roles.join(', ') : '—'}
          </div>

          {debug && (
            <div style={{ textAlign:'left', background:'#0f0d0b', border:'1px solid #241d18', borderRadius:12, padding:12, marginBottom:16 }}>
              <div style={{ fontSize:11, color:'#e85d04', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>
                Debug Supabase
              </div>
              <div style={{ fontSize:11, color:'#8a7060', lineHeight:1.6, marginBottom:8 }}>
                Projet : {debug.projectUrl}
                <br />
                Session email : {debug.sessionEmail || '—'}
                <br />
                Session user id : {debug.sessionUserId || '—'}
              </div>
              <div style={{ fontSize:11, color:'#d4c4b0', marginBottom:6 }}>Select `profiles` :</div>
              <pre style={{ whiteSpace:'pre-wrap', wordBreak:'break-word', fontSize:10, color:'#b7aea4', background:'#090807', border:'1px solid #1b1713', borderRadius:8, padding:10, margin:'0 0 10px' }}>
                {JSON.stringify(debug.profileQuery, null, 2)}
              </pre>
              <div style={{ fontSize:11, color:'#d4c4b0', marginBottom:6 }}>RPC `get_my_profile` :</div>
              <pre style={{ whiteSpace:'pre-wrap', wordBreak:'break-word', fontSize:10, color:'#b7aea4', background:'#090807', border:'1px solid #1b1713', borderRadius:8, padding:10, margin:0 }}>
                {JSON.stringify(debug.rpcQuery, null, 2)}
              </pre>
            </div>
          )}

          {error && <div style={{ fontSize:12, color:'#f87171', marginBottom:12, padding:'8px 12px', background:'rgba(248,113,113,0.08)', borderRadius:8 }}>{error}</div>}

          <button onClick={() => navigate(from, { replace: true })} style={{ ...S.btn, background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', boxShadow:'0 4px 16px rgba(232,93,4,0.25)' }}>
            Continuer
          </button>
          <button onClick={reloadProfile} style={{ ...S.btn, background:'transparent', border:'1px solid #2a2218', color:'#d4c4b0' }}>
            Recharger le profil
          </button>
          <button onClick={loadDebug} style={{ ...S.btn, background:'transparent', border:'1px solid #2a2218', color:'#d4c4b0' }}>
            Recharger le debug Supabase
          </button>
          <button onClick={() => navigate('/app/profile')} style={{ ...S.btn, background:'transparent', border:'1px solid #2a2218', color:'#d4c4b0' }}>
            Ouvrir mon profil
          </button>
          <button onClick={handleSignOut} disabled={!!loading} style={{ ...S.btn, background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.22)', color:'#f87171', marginBottom:0, opacity:loading ? 0.7 : 1 }}>
            {loading ? '...' : 'Se déconnecter et changer de compte'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={S.page}>
      {/* Logo */}
      <div style={{ marginBottom:28, textAlign:'center' }}>
        <div onClick={() => navigate('/')} style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, background:'linear-gradient(135deg,#f48c06,#e85d04)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', cursor:'pointer', marginBottom:6 }}>
          🔥 Charbon &amp; Flamme
        </div>
        {location.state?.calcResult && (
          <div style={{ background:'rgba(232,93,4,0.07)', border:'1px solid rgba(232,93,4,0.15)', borderRadius:10, padding:'8px 16px', display:'inline-block' }}>
            <span style={{ fontSize:12, color:'#8a7a6a' }}>Lance ta cuisson à </span>
            <strong style={{ fontFamily:"'Syne',sans-serif", color:'#e85d04', fontSize:16 }}>{location.state.calcResult}</strong>
          </div>
        )}
      </div>

      <div style={S.card}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#e85d04,transparent)' }} />

        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:'#fff', marginBottom:6, textAlign:'center' }}>
          {mode === 'login' ? 'Connexion' : 'Créer mon compte gratuit'}
        </h2>
        <p style={{ fontSize:12, color:'#5a4a3a', textAlign:'center', marginBottom:24, lineHeight:1.6 }}>
          {mode === 'login' ? 'Retrouve tes calculs et sessions.' : '5 calculs gratuits par mois · Pas de carte bancaire'}
        </p>

        {/* SOCIAL LOGIN */}
        <button onClick={signInGoogle} disabled={!!loading} style={{ ...S.btn, background:'#fff', color:'#1a1410', opacity:loading==='google'?0.7:1 }}>
          {loading === 'google' ? '...' : <>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.83l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continuer avec Google
          </>}
        </button>

        <button onClick={signInApple} disabled={!!loading} style={{ ...S.btn, background:'#000', color:'#fff', border:'1px solid #333', opacity:loading==='apple'?0.7:1 }}>
          {loading === 'apple' ? '...' : <>
            <svg width="16" height="18" viewBox="0 0 814 1000" fill="white"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-143.9-93.1c-44.5-63.3-87.2-161.3-87.2-253.4 0-154.1 100.7-235.6 199.6-235.6 52.8 0 96.8 34.7 130 34.7 31.6 0 81.5-37 142.8-37 23.1 0 108.2 1.9 164.1 86.2zm-85.1-199.9c27.7-32.4 47.7-78.2 47.7-124 0-6.4-.6-12.8-1.9-18.5-45.1 1.9-98.2 30.3-130.6 65.7-25.8 29.1-49.3 74.2-49.3 120.7 0 7.1 1.3 14.2 1.9 16.5 2.6.6 6.4 1.3 10.3 1.3 40.8 0 90.8-27.1 121.9-61.7z"/></svg>
            Continuer avec Apple
          </>}
        </button>

        {/* Séparateur */}
        <div style={{ display:'flex', alignItems:'center', gap:10, margin:'16px 0' }}>
          <div style={{ flex:1, height:1, background:'#1e1a14' }} />
          <span style={{ fontSize:11, color:'#3a2e24', whiteSpace:'nowrap' }}>ou avec email</span>
          <div style={{ flex:1, height:1, background:'#1e1a14' }} />
        </div>

        {/* EMAIL FORM */}
        <form onSubmit={handleEmail}>
          <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={S.input} />
          <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={S.input} />
          {error && <div style={{ fontSize:12, color:'#f87171', marginBottom:8, padding:'8px 12px', background:'rgba(248,113,113,0.08)', borderRadius:8 }}>{error}</div>}
          <button type="submit" disabled={!!loading} style={{ ...S.btn, background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', opacity:loading==='email'?0.7:1, boxShadow:'0 4px 16px rgba(232,93,4,0.25)', marginTop:4 }}>
            {loading === 'email' ? '...' : mode === 'login' ? '🔥 Se connecter' : '🔥 Créer mon compte'}
          </button>
        </form>

        {/* Forgot password */}
        {mode === 'login' && (
          <div style={{ textAlign:'right', marginTop:-4, marginBottom:10 }}>
            <button onClick={() => navigate('/forgot-password')} style={{ background:'none', border:'none', color:'#5a4a3a', fontFamily:"'DM Sans',sans-serif", fontSize:12, cursor:'pointer' }}>
              Mot de passe oublié ?
            </button>
          </div>
        )}

        {/* Toggle login/signup */}
        <div style={{ textAlign:'center', marginTop:14 }}>
          <span style={{ fontSize:12, color:'#4a3a2e' }}>
            {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
          </span>
          <button onClick={() => { setMode(mode==='login'?'signup':'login'); setError(null) }} style={{ background:'none', border:'none', color:'#e85d04', fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer' }}>
            {mode === 'login' ? 'Créer un compte gratuit' : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
  )
}
