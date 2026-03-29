import { useState } from 'react'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogoIcon } from '../components/Logo.jsx'

const SMOKER_TYPES = [
  { id: 'offset', label: 'Offset Smoker', icon: '🔥' },
  { id: 'wsm', label: 'Weber Smokey Mountain', icon: '⚫' },
  { id: 'kamado', label: 'Kamado (Big Green Egg…)', icon: '🥚' },
  { id: 'kettle', label: 'Bouilloire / Kettle', icon: '🫧' },
  { id: 'pellet', label: 'Pellet Grill', icon: '🪵' },
  { id: 'electric', label: 'Fumoir électrique', icon: '⚡' },
  { id: 'gas', label: 'Gaz', icon: '🔵' },
  { id: 'other', label: 'Autre', icon: '🍖' },
]

const EXPERIENCE_LEVELS = [
  { id: 'debutant', label: 'Débutant', desc: 'Je débute le low & slow' },
  { id: 'intermediaire', label: 'Intermédiaire', desc: 'Quelques cuissons à mon actif' },
  { id: 'avance', label: 'Avancé', desc: 'Je maîtrise la plupart des cuissons' },
  { id: 'pitmaster', label: 'Pitmaster', desc: 'Le feu n\'a plus de secret pour moi' },
]

export default function LoginPage() {
  const { signIn, signUp, updateProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const [mode, setMode] = useState('login') // login | register | onboarding
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Onboarding state
  const [smokerType, setSmokerType] = useState(null)
  const [experienceLevel, setExperienceLevel] = useState(null)
  const [onboardingSaving, setOnboardingSaving] = useState(false)

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
    } else if (mode === 'register') {
      // Après inscription → onboarding
      setMode('onboarding')
    } else {
      navigate(from, { replace: true })
    }
  }

  const handleOnboardingSubmit = async () => {
    setOnboardingSaving(true)
    setError(null)

    const updates = { onboarding_done: true }
    if (smokerType) updates.smoker_type = smokerType
    if (experienceLevel) updates.experience_level = experienceLevel

    const { error: err } = await updateProfile(updates)
    setOnboardingSaving(false)

    if (err) {
      setError(typeof err === 'string' ? err : err.message)
    } else {
      navigate(from, { replace: true })
    }
  }

  const handleSkipOnboarding = async () => {
    setOnboardingSaving(true)
    await updateProfile({ onboarding_done: true })
    setOnboardingSaving(false)
    navigate(from, { replace: true })
  }

  // ── Onboarding screen ──
  if (mode === 'onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <LogoIcon size={48} />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight mb-1">
              Bienvenue, {displayName || 'Pitmaster'} !
            </h1>
            <p className="text-zinc-500 text-sm">
              Dis-nous en plus sur toi pour personnaliser ton expérience
            </p>
          </div>

          {/* Smoker type */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-zinc-300 mb-3">Ton fumoir principal</p>
            <div className="grid grid-cols-2 gap-2">
              {SMOKER_TYPES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSmokerType(s.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${
                    smokerType === s.id
                      ? 'border-orange-500 bg-orange-500/10 text-orange-300'
                      : 'border-zinc-700/50 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="leading-tight">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Experience level */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-zinc-300 mb-3">Ton niveau</p>
            <div className="flex flex-col gap-2">
              {EXPERIENCE_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setExperienceLevel(lvl.id)}
                  className={`flex flex-col px-4 py-3 rounded-xl border text-left transition-all ${
                    experienceLevel === lvl.id
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-zinc-700/50 bg-zinc-900/60 hover:border-zinc-600'
                  }`}
                >
                  <span className={`text-sm font-semibold ${experienceLevel === lvl.id ? 'text-orange-300' : 'text-zinc-300'}`}>
                    {lvl.label}
                  </span>
                  <span className="text-xs text-zinc-500 mt-0.5">{lvl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="px-4 py-2.5 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleOnboardingSubmit}
            disabled={onboardingSaving}
            className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-red-600 hover:from-brand-500 hover:to-red-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-brand-600/20 disabled:opacity-50"
          >
            {onboardingSaving ? '...' : 'C\'est parti !'}
          </button>

          <button
            onClick={handleSkipOnboarding}
            disabled={onboardingSaving}
            className="w-full mt-3 text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Passer cette étape
          </button>
        </div>
      </div>
    )
  }

  // ── Login / Register screen ──
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogoIcon size={52} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-0.5">CHARBON <span className="text-orange-400">&</span> FLAMME</h1>
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
