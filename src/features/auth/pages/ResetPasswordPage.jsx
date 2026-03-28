import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../../../modules/auth/AuthShell'
import { getCurrentSession, onAuthStateChange, updatePassword } from '../../../modules/auth/service'

const FIELD_STYLE = {
  width: '100%',
  minHeight: 46,
  background: '#0e0c0a',
  border: '1px solid #2a2218',
  borderRadius: 12,
  color: '#fff',
  padding: '0 14px',
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: 'border-box',
  outline: 'none',
}

const BUTTON_STYLE = {
  width: '100%',
  minHeight: 48,
  border: '1px solid #7f1d1d',
  borderRadius: 12,
  background: 'linear-gradient(180deg,#c62828 0%, #9a1b1b 100%)',
  color: '#fff',
  fontFamily: "'Syne', sans-serif",
  fontWeight: 800,
  fontSize: 14,
  cursor: 'pointer',
  boxShadow: '0 10px 24px rgba(197, 40, 40, 0.22)',
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    async function bootstrap() {
      const { data } = await getCurrentSession()
      if (active && data?.session?.user) setReady(true)
    }

    bootstrap()

    const { data } = onAuthStateChange((event, session) => {
      if (!active) return
      if (event === 'PASSWORD_RECOVERY' || session?.user) {
        setReady(true)
      }
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 6) {
      setError('Minimum 6 caractères.')
      return
    }

    setLoading(true)
    setError('')
    const { error: nextError } = await updatePassword(password)
    setLoading(false)
    if (nextError) {
      setError(nextError.message)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <AuthShell
        title="Mot de passe mis à jour"
        subtitle="Ton compte est prêt. Tu peux maintenant te reconnecter avec ton nouveau mot de passe."
      >
        <button type="button" onClick={() => navigate('/auth')} style={BUTTON_STYLE}>
          Se connecter
        </button>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Choisis un nouveau mot de passe"
      subtitle={ready ? 'Entre ton nouveau mot de passe pour finaliser la récupération.' : 'Ouverture du lien de récupération…'}
    >
      {!ready ? (
        <div style={{ fontSize: 12, color: '#8a7060' }}>Vérification de la session de récupération en cours…</div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: 10 }}>
          <input type="password" disabled={!ready} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nouveau mot de passe" minLength={6} required style={FIELD_STYLE} />
          <input type="password" disabled={!ready} value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} placeholder="Confirmer le mot de passe" minLength={6} required style={FIELD_STYLE} />
        </div>
        {error ? (
          <div style={{ fontSize: 12, color: '#f87171', margin: '12px 0 0', padding: '10px 12px', background: 'rgba(248,113,113,0.08)', borderRadius: 10 }}>
            {error}
          </div>
        ) : null}
        <button type="submit" disabled={loading || !ready} style={{ ...BUTTON_STYLE, marginTop: 14, opacity: loading || !ready ? 0.6 : 1 }}>
          {loading ? 'Mise à jour…' : 'Mettre à jour'}
        </button>
      </form>
      <div style={{ marginTop: 14 }}>
        <Link to="/auth" style={{ color: '#b7aea4', fontSize: 12, textDecoration: 'none' }}>
          Retour à la connexion
        </Link>
      </div>
    </AuthShell>
  )
}
