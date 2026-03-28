import { Link } from 'react-router-dom'
import { useState } from 'react'
import AuthShell from '../../../modules/auth/AuthShell'
import { requestPasswordReset } from '../../../modules/auth/service'

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const { error: nextError } = await requestPasswordReset(email)
    setLoading(false)
    if (nextError) {
      setError(nextError.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthShell
        title="Email envoyé"
        subtitle={`Si un compte existe pour ${email}, tu vas recevoir un lien de réinitialisation. Vérifie aussi tes spams.`}
      >
        <Link to="/auth" style={{ display: 'inline-flex', minHeight: 46, alignItems: 'center', justifyContent: 'center', width: '100%', textDecoration: 'none', color: '#f5f1ea', border: '1px solid #2b2b2b', borderRadius: 12, background: '#161616', fontWeight: 700 }}>
          Retour à la connexion
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Entre ton email. On t’envoie un lien pour choisir un nouveau mot de passe."
    >
      <form onSubmit={handleSubmit}>
        <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ton@email.com" style={FIELD_STYLE} />
        {error ? (
          <div style={{ fontSize: 12, color: '#f87171', margin: '12px 0 0', padding: '10px 12px', background: 'rgba(248,113,113,0.08)', borderRadius: 10 }}>
            {error}
          </div>
        ) : null}
        <button type="submit" disabled={loading} style={{ ...BUTTON_STYLE, marginTop: 14 }}>
          {loading ? 'Envoi…' : 'Envoyer le lien'}
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
