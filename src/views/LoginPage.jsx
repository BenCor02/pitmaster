'use client'

import React, { useState } from 'react'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import { useRouter, useLocation } from 'next/navigation'
import { CFLogo } from '../components/cf/Chrome.jsx'
import { FireButton } from '../components/cf/Primitives.jsx'

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
  { id: 'pitmaster', label: 'Pitmaster', desc: "Le feu n'a plus de secret pour moi" },
]

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: '#FFFFFF',
  border: '1px solid rgba(31,26,20,0.15)',
  borderRadius: 8,
  color: '#1F1A14',
  fontFamily: 'var(--cf-sans)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}

export default function LoginPage() {
  const { signIn, signUp, updateProfile } = useAuth()
  const router = useRouter()
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
        router.push(from, { replace: true })
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
      router.push(from, { replace: true })
    } else {
      router.push(from, { replace: true })
    }
  }

  const handleSkipOnboarding = async () => {
    setOnboardingSaving(true)
    const { error: err } = await updateProfile({ onboarding_done: true })
    if (err) {
      try { sessionStorage.setItem('cf_onboarding', JSON.stringify({ onboarding_done: true })) } catch (_) {}
    }
    setOnboardingSaving(false)
    router.push(from, { replace: true })
  }

  // ── Onboarding screen ──
  if (mode === 'onboarding') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#FAF6EE',
          color: '#1F1A14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <CFLogo size={36} />
            </div>
            <h1
              style={{
                fontFamily: 'var(--cf-serif)',
                fontSize: 22,
                fontWeight: 800,
                color: '#1F1A14',
                marginBottom: 6,
                letterSpacing: '-0.01em',
              }}
            >
              Bienvenue, {displayName || 'Pitmaster'} !
            </h1>
            <p style={{ color: '#6E6356', fontSize: 14 }}>
              Dis-nous en plus sur toi pour personnaliser ton expérience
            </p>
          </div>

          {/* Smoker type */}
          <div style={{ marginBottom: 24 }}>
            <p
              style={{
                fontFamily: 'var(--cf-serif)',
                fontSize: 13,
                fontWeight: 600,
                color: '#1F1A14',
                marginBottom: 12,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Ton fumoir principal
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {SMOKER_TYPES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSmokerType(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: smokerType === s.id
                      ? '1.5px solid #8B1A1A'
                      : '1px solid rgba(31,26,20,0.15)',
                    background: smokerType === s.id ? 'rgba(139,26,26,0.06)' : '#FFFFFF',
                    color: smokerType === s.id ? '#8B1A1A' : '#1F1A14',
                    textAlign: 'left',
                    fontSize: 13,
                    fontFamily: 'var(--cf-sans)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <span style={{ lineHeight: 1.3 }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Experience level */}
          <div style={{ marginBottom: 24 }}>
            <p
              style={{
                fontFamily: 'var(--cf-serif)',
                fontSize: 13,
                fontWeight: 600,
                color: '#1F1A14',
                marginBottom: 12,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Ton niveau
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {EXPERIENCE_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setExperienceLevel(lvl.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: experienceLevel === lvl.id
                      ? '1.5px solid #8B1A1A'
                      : '1px solid rgba(31,26,20,0.15)',
                    background: experienceLevel === lvl.id ? 'rgba(139,26,26,0.06)' : '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: 'var(--cf-sans)',
                      color: experienceLevel === lvl.id ? '#8B1A1A' : '#1F1A14',
                    }}
                  >
                    {lvl.label}
                  </span>
                  <span style={{ fontSize: 12, color: '#6E6356', marginTop: 2 }}>{lvl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: '10px 16px',
                marginBottom: 16,
                background: 'rgba(139,26,26,0.06)',
                border: '1px solid rgba(139,26,26,0.2)',
                borderRadius: 8,
              }}
            >
              <p style={{ color: '#8B1A1A', fontSize: 13 }}>{error}</p>
            </div>
          )}

          <FireButton
            onClick={handleOnboardingSubmit}
            disabled={onboardingSaving}
            type="primary"
            fullWidth
            style={{ marginBottom: 12 }}
          >
            {onboardingSaving ? '...' : "C'est parti !"}
          </FireButton>

          <button
            onClick={handleSkipOnboarding}
            disabled={onboardingSaving}
            style={{
              width: '100%',
              padding: '10px',
              background: 'none',
              border: 'none',
              fontSize: 13,
              color: '#6E6356',
              cursor: 'pointer',
              fontFamily: 'var(--cf-sans)',
            }}
          >
            Passer cette étape
          </button>
        </div>
      </div>
    )
  }

  // ── Login / Register screen ──
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FAF6EE', color: '#1F1A14' }}>
      {/* Left: image panel (desktop only) */}
      <div
        style={{
          position: 'relative',
          flex: '0 0 50%',
        }}
        className="hidden lg:block"
      >
        <img
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=1200&fit=crop&q=85"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Light-mode overlay — warm sepia gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, transparent 40%, rgba(250,246,238,0.6))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(31,26,20,0.55) 0%, transparent 60%)',
          }}
        />
        <div style={{ position: 'absolute', bottom: 48, left: 40, right: 40 }}>
          <p
            style={{
              fontFamily: 'var(--cf-serif)',
              fontSize: 28,
              fontWeight: 900,
              color: '#F5EFE0',
              lineHeight: 1.25,
            }}
          >
            "Le feu ne ment pas.
            <br />
            <span style={{ color: '#E8A53C' }}>La viande non plus."</span>
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <CFLogo size={36} />
            </div>
            <h1
              style={{
                fontFamily: 'var(--cf-serif)',
                fontSize: 26,
                fontWeight: 900,
                color: '#1F1A14',
                letterSpacing: '-0.01em',
                marginBottom: 4,
              }}
            >
              {mode === 'login' ? 'Connexion' : 'Créer un compte'}
            </h1>
            <p style={{ color: '#6E6356', fontSize: 14 }}>
              {mode === 'login' ? 'Retrouve ton espace pitmaster' : 'Rejoins la communauté BBQ'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'register' && (
              <input
                type="text"
                placeholder="Nom d'affichage"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={inputStyle}
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={inputStyle}
            />

            {error && (
              <div
                style={{
                  padding: '10px 16px',
                  background: 'rgba(139,26,26,0.06)',
                  border: '1px solid rgba(139,26,26,0.2)',
                  borderRadius: 8,
                }}
              >
                <p style={{ color: '#8B1A1A', fontSize: 13 }}>{error}</p>
              </div>
            )}

            <FireButton
              as="button"
              type="primary"
              fullWidth
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? '...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
            </FireButton>
          </form>

          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{
              width: '100%',
              marginTop: 16,
              background: 'none',
              border: 'none',
              fontSize: 13,
              color: '#6E6356',
              cursor: 'pointer',
              fontFamily: 'var(--cf-sans)',
            }}
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
