import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState(null)
  const [ready,     setReady]     = useState(false)

  useEffect(() => {
    // Supabase injecte la session depuis le lien email
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  async function handle(e) {
    e.preventDefault()
    if (password !== password2) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 6)    { setError('Minimum 6 caractères'); return }
    setLoading(true); setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) setError(error.message)
    else setDone(true)
  }

  const S = {
    page: { minHeight:'100vh', background:'#080706', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'DM Sans',sans-serif" },
    card: { background:'#171410', border:'1px solid #1e1a14', borderRadius:20, padding:32, width:'100%', maxWidth:400, position:'relative', overflow:'hidden' },
    input: { width:'100%', background:'#0e0c0a', border:'1px solid #2a2218', borderRadius:10, color:'#fff', padding:'12px 14px', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:10, fontFamily:"'DM Sans',sans-serif" },
  }

  if (done) return (
    <div style={S.page}>
      <div style={{ ...S.card, textAlign:'center' }}>
        <div style={{ fontSize:44, marginBottom:14 }}>✅</div>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:'#fff', marginBottom:8 }}>Mot de passe mis à jour</h2>
        <p style={{ fontSize:13, color:'#7a6a5a', marginBottom:20 }}>Tu peux maintenant te connecter avec ton nouveau mot de passe.</p>
        <button onClick={() => navigate('/auth')} style={{ width:'100%', padding:'13px', border:'none', borderRadius:10, background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, cursor:'pointer' }}>
          🔥 Se connecter
        </button>
      </div>
    </div>
  )

  return (
    <div style={S.page}>
      <div style={{ marginBottom:24, textAlign:'center' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:19, background:'linear-gradient(135deg,#f48c06,#e85d04)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          🔥 Charbon &amp; Flamme
        </div>
      </div>
      <div style={S.card}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#e85d04,transparent)' }} />
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:'#fff', marginBottom:6 }}>Nouveau mot de passe</h2>
        <p style={{ fontSize:13, color:'#6a5a4a', marginBottom:24 }}>Choisis un nouveau mot de passe pour ton compte.</p>
        {!ready && <div style={{ fontSize:12, color:'#6a5a4a', marginBottom:16, textAlign:'center' }}>⏳ Vérification du lien...</div>}
        <form onSubmit={handle}>
          <input type="password" placeholder="Nouveau mot de passe" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} disabled={!ready} style={S.input} />
          <input type="password" placeholder="Confirmer le mot de passe" value={password2} onChange={e => setPassword2(e.target.value)} required minLength={6} disabled={!ready} style={S.input} />
          {error && <div style={{ fontSize:12, color:'#f87171', marginBottom:10, padding:'8px 12px', background:'rgba(248,113,113,0.08)', borderRadius:8 }}>{error}</div>}
          <button type="submit" disabled={loading || !ready} style={{ width:'100%', padding:'13px', border:'none', borderRadius:10, background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, cursor:'pointer', opacity:(!ready||loading)?0.5:1 }}>
            {loading ? '...' : 'Mettre à jour'}
          </button>
        </form>
      </div>
    </div>
  )
}
