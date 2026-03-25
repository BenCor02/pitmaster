import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError('Email ou mot de passe incorrect.')
    } else {
      if (password.length < 6) { setError('Mot de passe trop court (6 min).'); setLoading(false); return }
      const { error } = await signUp(email, password)
      if (error) setError('Erreur : ' + error.message)
      else setSuccess('Compte créé ! Vérifie ton email.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      
      {/* BG GLOW */}
      <div style={{ position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(232,93,4,0.08), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px' }}>
        
        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔥</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '36px', lineHeight: 1, letterSpacing: '-1px', background: 'linear-gradient(135deg, #f48c06, #e85d04)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            PitMaster
          </h1>
          <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '3px', color: 'var(--text-3)', marginTop: '8px', textTransform: 'uppercase' }}>
            Calculateur BBQ Pro
          </p>
        </div>

        {/* CARD */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(232,93,4,0.7), transparent)' }} />

          {/* TABS */}
          <div style={{ display: 'flex', background: 'var(--card)', borderRadius: '12px', padding: '3px', marginBottom: '24px', border: '1px solid var(--border)' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
                style={{
                  flex: 1, padding: '9px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 700,
                  background: mode === m ? 'linear-gradient(135deg, #f48c06, #e85d04)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--text-3)',
                  transition: 'all 0.2s',
                }}>
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {error && <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>{error}</div>}
          {success && <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#86efac' }}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={L}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.com" required style={I} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={L}>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={I} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
              fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, letterSpacing: '0.5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #f48c06, #e85d04)', color: '#fff',
              opacity: loading ? 0.7 : 1, boxShadow: '0 4px 16px rgba(232,93,4,0.3)',
            }}>
              {loading ? '...' : mode === 'login' ? 'SE CONNECTER' : 'CRÉER MON COMPTE'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const L = { display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '7px' }
const I = { width: '100%', background: 'var(--card)', border: '1px solid var(--border-2)', borderRadius: '10px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', fontSize: '15px', padding: '12px 14px', outline: 'none' }