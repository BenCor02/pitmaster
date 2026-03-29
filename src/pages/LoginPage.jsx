import { useState } from 'react'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import FlameIcon from '../components/FlameIcon.jsx'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    let result
    if (mode === 'login') {
      result = await signIn(email, password)
    } else {
      result = await signUp(email, password, displayName)
    }

    setLoading(false)
    if (result.error) {
      setError(result.error.message)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <FlameIcon size={48} />
          </div>
          <h1 className="text-2xl font-bold brand-gradient mb-1">Charbon & Flamme</h1>
          <p className="text-zinc-500 text-sm">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Nom d'affichage"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900/80 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-zinc-900/80 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 bg-zinc-900/80 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all"
          />

          {error && (
            <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-red-600 hover:from-brand-500 hover:to-red-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-brand-600/20 disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="w-full mt-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {mode === 'login'
            ? "Pas encore de compte ? S'inscrire"
            : 'Déjà un compte ? Se connecter'}
        </button>
      </div>
    </div>
  )
}
