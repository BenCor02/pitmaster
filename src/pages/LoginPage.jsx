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

  // Rate limiting : max 5 tentatives, puis blocage 2 min
  const [attempts, setAttempts] = useState(0)
  const [blockedUntil, setBlockedUntil] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Anti brute-force
    if (Date.now() < blockedUntil) {
      const secs = Math.ceil((blockedUntil - Date.now()) / 1000)
      setError(`Trop de tentatives. Réessaie dans ${secs}s.`)
      return
    }

    setLoading(true)

    let result
    if (mode === 'login') {
      result = await signIn(email, password)
    } else {
      result = await signUp(email, password, displayName)
    }

    setLoading(false)
    if (result.error) {
      const next = attempts + 1
      setAttempts(next)
      if (next >= 5) {
        setBlockedUntil(Date.now() + 120_000) // 2 min
        setAttempts(0)
        setError('Trop de tentatives. Réessaie dans 2 minutes.')
      } else {
        setError(result.error.message)
      }
    } else {
      setAttempts(0)
      if (mode === 'register') {
        setMode('onboarding')
      } else {
        navigate(from, { replace: true })
      }
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
      // Si pas de session (email non confirmé), sauvegarder pour plus tard
      try {
        sessionStorage.setItem('cf_onboarding', JSON.stringify(updates))
      } catch (_) {}
      navigate(from, { replace: true })
    } else {
      navigate(from, { replace: true })
    }
  }

  const handleSkipOnboarding = async () => {
    setOnboardingSaving(true)
    const { error: err } = await updateProfile({ onboarding_done: true })
    if (err) {
      try { sessionStorage.setItem('cf_onboarding', JSON.stringify({ onboarding_done: true })) } catch (_) {}
    }
    setOnboardingSaving(false)
    navigate(from, { replace: true })
  }

  // ── Onboarding screen ──
  if (mode === 'onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#ff6b1a]/[0.04] rounded-full blur-[100px] pointer-events-none animate-fire-breathe" />
        <div className="w-full max-w-md animate-fade-in-up relative">
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
                      ? 'border-[#ff6b1a] bg-[#ff6b1a]/10 text-[#ff8c4a]'
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
                      ? 'border-[#ff6b1a] bg-[#ff6b1a]/10'
                      : 'border-zinc-700/50 bg-zinc-900/60 hover:border-zinc-600'
                  }`}
                >
                  <span className={`text-sm font-semibold ${experienceLevel === lvl.id ? 'text-[#ff8c4a]' : 'text-zinc-300'}`}>
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
            className="w-full py-3.5 bg-gradient-to-r from-[#ff6b1a] to-[#ef4444] hover:from-[#ff7a33] hover:to-[#f55] shadow-lg shadow-[#ff6b1a]/20 hover:shadow-[#ff6b1a]/30 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-brand-600/20 disabled:opacity-50"
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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left: image panel (desktop only) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=1200&fit=crop&q=85"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#080808]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/60 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="font-display text-[28px] font-black text-white leading-tight">
            "Le feu ne ment pas.<br/>
            <span className="text-[#ff6b1a]">La viande non plus."</span>
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-6 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#ff6b1a]/[0.03] rounded-full blur-[100px] pointer-events-none animate-fire-breathe" />
      <div className="w-full max-w-sm animate-fade-in-up relative">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <LogoIcon size={52} />
          </div>
          <h1 className="font-display text-2xl font-black text-white tracking-tight mb-1">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="text-zinc-500 text-sm">
            {mode === 'login' ? 'Retrouve ton espace pitmaster' : 'Rejoins la communauté BBQ'}
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
            className="w-full py-3.5 bg-gradient-to-r from-[#ff6b1a] to-[#ef4444] hover:from-[#ff7a33] hover:to-[#f55] shadow-lg shadow-[#ff6b1a]/20 hover:shadow-[#ff6b1a]/30 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-brand-600/20 disabled:opacity-50"
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
    </div>
  )
}
