import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import AuthShell from '../../../modules/auth/AuthShell'
import {
  signInWithApple,
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
} from '../../../modules/auth/service'

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

const PRIMARY_BUTTON = {
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

const SECONDARY_BUTTON = {
  ...PRIMARY_BUTTON,
  background: '#161616',
  border: '1px solid #2b2b2b',
  boxShadow: 'none',
}

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/app'
  const { user, signOut, profile, roles, reloadProfile } = useAuth()

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleProviderSignIn(provider) {
    setError('')
    setLoading(provider)
    const action = provider === 'google' ? signInWithGoogle : signInWithApple
    const { error: nextError } = await action()
    if (nextError) {
      setError(nextError.message)
      setLoading('')
    }
  }

  async function handleEmailSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading('email')

    if (mode === 'login') {
      const { data, error: nextError } = await signInWithPassword(email, password)
      if (nextError) {
        setError('Email ou mot de passe incorrect')
        setLoading('')
        return
      }
      if (!data?.session?.user) {
        setError('Connexion acceptée, mais aucune session navigateur n’a été créée.')
        setLoading('')
        return
      }
      await reloadProfile()
      navigate(from, { replace: true })
      return
    }

    const { error: nextError } = await signUpWithPassword(email, password)
    if (nextError) {
      setError(nextError.message)
      setLoading('')
      return
    }
    setSent(true)
    setLoading('')
  }

  async function handleSignOut() {
    setLoading('signout')
    setError('')
    try {
      await signOut()
      navigate('/auth', { replace: true })
      setTimeout(() => window.location.reload(), 120)
    } catch (nextError) {
      setError(nextError?.message || 'Impossible de se déconnecter')
    } finally {
      setLoading('')
    }
  }

  if (sent) {
    return (
      <AuthShell
        title="Vérifie ta boîte mail"
        subtitle={`Un lien de confirmation vient d’être envoyé à ${email}. Une fois confirmé, tu pourras te connecter et retrouver tes cuissons.`}
      >
        <button type="button" onClick={() => setSent(false)} style={SECONDARY_BUTTON}>
          Retour
        </button>
      </AuthShell>
    )
  }

  if (user) {
    return (
      <AuthShell
        title="Tu es déjà connecté"
        subtitle="Ton compte est actif. Tu peux continuer vers l’app, recharger le profil ou changer complètement de compte."
      >
        <div style={{ marginBottom: 16, color: '#d4c4b0', lineHeight: 1.7, fontSize: 13 }}>
          {user.email}
          <br />
          Rôle : {profile?.role || 'member'}
          <br />
          User ID : {user.id}
          <br />
          Profile ID : {profile?.id || '—'}
          <br />
          Roles[] : {Array.isArray(roles) && roles.length ? roles.join(', ') : '—'}
        </div>

        {error ? (
          <div style={{ fontSize: 12, color: '#f87171', marginBottom: 12, padding: '10px 12px', background: 'rgba(248,113,113,0.08)', borderRadius: 10 }}>
            {error}
          </div>
        ) : null}

        <div style={{ display: 'grid', gap: 10 }}>
          <button type="button" onClick={() => navigate(from, { replace: true })} style={PRIMARY_BUTTON}>
            Continuer vers l’app
          </button>
          <button type="button" onClick={reloadProfile} style={SECONDARY_BUTTON}>
            Recharger le profil
          </button>
          <button type="button" onClick={handleSignOut} disabled={loading === 'signout'} style={{ ...SECONDARY_BUTTON, color: '#f87171', borderColor: 'rgba(248,113,113,0.22)' }}>
            {loading === 'signout' ? 'Déconnexion…' : 'Se déconnecter et changer de compte'}
          </button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title={mode === 'login' ? 'Connexion' : 'Créer ton compte'}
      subtitle={mode === 'login'
        ? 'Retrouve tes plans, ton journal et tes prochaines cuissons.'
        : 'Crée ton compte pour enregistrer tes cuissons et retrouver ton planning plus tard.'}
      footer={(
        <div style={{ textAlign: 'center', fontSize: 12, color: '#8a7060' }}>
          {mode === 'login' ? 'Pas encore de compte ? ' : 'Tu as déjà un compte ? '}
          <button
            type="button"
            onClick={() => setMode((value) => (value === 'login' ? 'signup' : 'login'))}
            style={{ background: 'transparent', border: 'none', color: '#f5f1ea', fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
          </button>
        </div>
      )}
    >
      <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
        <button type="button" onClick={() => handleProviderSignIn('google')} disabled={Boolean(loading)} style={{ ...SECONDARY_BUTTON, background: '#fff', color: '#111' }}>
          {loading === 'google' ? 'Connexion Google…' : 'Continuer avec Google'}
        </button>
        <button type="button" onClick={() => handleProviderSignIn('apple')} disabled={Boolean(loading)} style={{ ...SECONDARY_BUTTON, background: '#000', color: '#fff', borderColor: '#333' }}>
          {loading === 'apple' ? 'Connexion Apple…' : 'Continuer avec Apple'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
        <div style={{ height: 1, background: '#241d18', flex: 1 }} />
        <span style={{ fontSize: 11, color: '#6a5a4a', letterSpacing: '1.4px', textTransform: 'uppercase' }}>ou</span>
        <div style={{ height: 1, background: '#241d18', flex: 1 }} />
      </div>

      <form onSubmit={handleEmailSubmit}>
        <div style={{ display: 'grid', gap: 10 }}>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ton@email.com" required style={FIELD_STYLE} />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mot de passe" required minLength={6} style={FIELD_STYLE} />
        </div>

        {error ? (
          <div style={{ fontSize: 12, color: '#f87171', margin: '12px 0 0', padding: '10px 12px', background: 'rgba(248,113,113,0.08)', borderRadius: 10 }}>
            {error}
          </div>
        ) : null}

        <button type="submit" disabled={Boolean(loading)} style={{ ...PRIMARY_BUTTON, marginTop: 14 }}>
          {loading === 'email'
            ? (mode === 'login' ? 'Connexion…' : 'Création…')
            : (mode === 'login' ? 'Se connecter' : 'Créer mon compte')}
        </button>
      </form>

      <div style={{ marginTop: 14, textAlign: 'right' }}>
        <Link to="/forgot-password" style={{ color: '#b7aea4', fontSize: 12, textDecoration: 'none' }}>
          Mot de passe oublié ?
        </Link>
      </div>
    </AuthShell>
  )
}
