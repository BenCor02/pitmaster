import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState(null)

  async function handle(e) {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  const S = {
    page: { minHeight:'100vh', background:'#080706', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'DM Sans',sans-serif" },
    card: { background:'#171410', border:'1px solid #1e1a14', borderRadius:20, padding:32, width:'100%', maxWidth:400, position:'relative', overflow:'hidden' },
    input: { width:'100%', background:'#0e0c0a', border:'1px solid #2a2218', borderRadius:10, color:'#fff', padding:'12px 14px', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:12, fontFamily:"'DM Sans',sans-serif" },
  }

  if (sent) return (
    <div style={S.page}>
      <div style={{ ...S.card, textAlign:'center' }}>
        <div style={{ fontSize:44, marginBottom:14 }}>📬</div>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:'#fff', marginBottom:8 }}>Email envoyé</h2>
        <p style={{ fontSize:13, color:'#7a6a5a', lineHeight:1.7, marginBottom:20 }}>
          Vérifie ta boîte mail — un lien de réinitialisation t'a été envoyé à <strong style={{ color:'#d4c4b0' }}>{email}</strong>
        </p>
        <button onClick={() => navigate('/auth')} style={{ width:'100%', padding:'12px', borderRadius:10, border:'1px solid #2a2218', background:'transparent', color:'#6a5a4a', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:600, cursor:'pointer' }}>
          ← Retour à la connexion
        </button>
      </div>
    </div>
  )

  return (
    <div style={S.page}>
      <div style={{ marginBottom:24, textAlign:'center' }}>
        <div onClick={() => navigate('/')} style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:19, background:'linear-gradient(135deg,#f48c06,#e85d04)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', cursor:'pointer' }}>
          🔥 Charbon &amp; Flamme
        </div>
      </div>
      <div style={S.card}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#e85d04,transparent)' }} />
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:'#fff', marginBottom:6 }}>Mot de passe oublié</h2>
        <p style={{ fontSize:13, color:'#6a5a4a', marginBottom:24, lineHeight:1.6 }}>Entre ton email — on t'envoie un lien de réinitialisation.</p>
        <form onSubmit={handle}>
          <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={S.input} />
          {error && <div style={{ fontSize:12, color:'#f87171', marginBottom:10, padding:'8px 12px', background:'rgba(248,113,113,0.08)', borderRadius:8 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width:'100%', padding:'13px', border:'none', borderRadius:10, background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, cursor:'pointer', opacity:loading?0.7:1, marginBottom:10 }}>
            {loading ? '...' : 'Envoyer le lien'}
          </button>
          <button type="button" onClick={() => navigate('/auth')} style={{ width:'100%', padding:'11px', border:'1px solid #1e1a14', borderRadius:10, background:'transparent', color:'#5a4a3a', fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:600, cursor:'pointer' }}>
            ← Retour
          </button>
        </form>
      </div>
    </div>
  )
}
