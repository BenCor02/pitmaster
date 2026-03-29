import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { calculateLowSlow, formatDuration } from '../../../domain/calculator/engine'

function quickCalc(meatKey, weightKg, smokerTempC, serveHour) {
  try {
    const result = calculateLowSlow(meatKey, weightKg, {
      smokerTempC,
      smokerType: 'offset',
      wrapType: 'butcher_paper',
      marbling: 'medium',
      waterPan: false,
      startTempC: 4,
    })
    if (!result) return null
    const totalMin = result.totalMin || result.cookMin + 60
    const serveDate = new Date()
    serveDate.setHours(serveHour, 0, 0, 0)
    if (serveDate < new Date()) serveDate.setDate(serveDate.getDate() + 1)
    const launch = new Date(serveDate.getTime() - totalMin * 60000)
    return {
      launchH: `${launch.getHours().toString().padStart(2, '0')}:${launch.getMinutes().toString().padStart(2, '0')}`,
      totalH: formatDuration(result.cookMin),
      restH: formatDuration(result.restMin || 60),
      target: result.targetTempC || 95,
    }
  } catch {
    return null
  }
}

const MEATS = [
  { key: 'brisket', label: 'Brisket', emoji: '🥩' },
  { key: 'pork_shoulder', label: 'Pulled Pork', emoji: '🐷' },
  { key: 'ribs_pork', label: 'Spare Ribs', emoji: '🍖' },
  { key: 'ribs_beef', label: 'Beef Ribs', emoji: '🦴' },
  { key: 'lamb_shoulder', label: 'Épaule Agneau', emoji: '🐑' },
  { key: 'paleron', label: 'Paleron', emoji: '🥩' },
]

const SMOKER_TYPES = [
  { value: 'pellet', label: 'Pellet' },
  { value: 'offset', label: 'Offset' },
  { value: 'kamado', label: 'Kamado' },
  { value: 'kettle', label: 'Kettle' },
  { value: 'electric', label: 'Électrique' },
  { value: 'gas', label: 'Gaz / hybride' },
]

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Débutant', emoji: '🌱', desc: 'Je commence' },
  { value: 'intermediate', label: 'Intermédiaire', emoji: '🔥', desc: 'Quelques cuissons' },
  { value: 'advanced', label: 'Avancé', emoji: '⚡', desc: 'Je maîtrise déjà bien' },
  { value: 'pro', label: 'Expert', emoji: '👑', desc: 'Usage régulier et très à l’aise' },
]

const BBQ_FREQUENCIES = [
  { value: 'occasional', label: 'Occasionnel', desc: '1 à 2 fois par mois' },
  { value: 'regular', label: 'Régulier', desc: 'Plusieurs cuissons par mois' },
  { value: 'weekly', label: 'Hebdomadaire', desc: 'Presque chaque semaine' },
  { value: 'intensive', label: 'Intensif', desc: 'Très fréquent / gros volume' },
]

const S = {
  card: { background: '#171410', border: '1px solid #1e1a14', borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden', maxWidth: 520, width: '100%' },
  label: { fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, color: '#6a5a4a', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8, display: 'block' },
  input: { width: '100%', background: '#0e0c0a', border: '1px solid #2a2218', borderRadius: 12, color: '#fff', padding: '12px 14px', fontSize: 15, fontFamily: "'DM Sans',sans-serif", outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '15px', border: 'none', borderRadius: 12, fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg,#f48c06,#d44e00)', color: '#fff', boxShadow: '0 4px 16px rgba(232,93,4,0.28)' },
  btnSec: { width: '100%', padding: '12px', border: '1px solid #2a2218', borderRadius: 12, fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#6a5a4a' },
}

export default function OnboardingPage() {
  const { user, profile, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [phase, setPhase] = useState('calc')
  const [meatKey, setMeatKey] = useState('brisket')
  const [weight, setWeight] = useState(5)
  const [smokerTemp, setSmokerTemp] = useState(120)
  const [serveHour, setServeHour] = useState(19)
  const [saving, setSaving] = useState(false)

  const [firstName, setFirstName] = useState(profile?.first_name || user?.user_metadata?.first_name || '')
  const [lastName, setLastName] = useState(profile?.last_name || user?.user_metadata?.last_name || '')
  const [smokerType, setSmokerType] = useState(profile?.smoker_type || 'kamado')
  const [experience, setExperience] = useState(profile?.experience_level || 'intermediate')
  const [bbqFrequency, setBbqFrequency] = useState(profile?.bbq_frequency || 'regular')
  const [marketingOptIn, setMarketingOptIn] = useState(Boolean(profile?.marketing_opt_in))
  const [saveError, setSaveError] = useState('')

  const calcResult = useMemo(
    () => quickCalc(meatKey, weight, smokerTemp, serveHour),
    [meatKey, weight, smokerTemp, serveHour]
  )

  async function finishOnboarding() {
    setSaving(true)
    setSaveError('')
    try {
      const { error } = await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        smoker_type: smokerType,
        experience_level: experience,
        bbq_frequency: bbqFrequency,
        favorite_meats: [meatKey],
        marketing_opt_in: marketingOptIn,
        source_channel: 'onboarding',
      })
      if (error) throw error
      navigate('/app')
    } catch {
      setSaveError("Le profil n'a pas pu être enregistré pour l'instant. Exécute le patch SQL marketing/profil, puis réessaie.")
    } finally {
      setSaving(false)
    }
  }

  if (phase === 'calc') {
    return (
      <div style={{ minHeight: '100vh', background: '#080706', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, background: 'linear-gradient(135deg,#f48c06,#e85d04)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 4 }}>
            🔥 Charbon & Flamme
          </div>
          <div style={{ fontSize: 12, color: '#4a3a2e' }}>Prépare ton premier plan en moins d’une minute</div>
        </div>

        <div style={S.card}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#e85d04,transparent)' }} />

          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, color: '#fff', marginBottom: 6, textAlign: 'center' }}>
            À quelle heure lancer ta cuisson ?
          </h1>
          <p style={{ fontSize: 13, color: '#6a5a4a', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
            On te donne tout de suite un premier repère, puis on te propose d’enregistrer ton profil BBQ.
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Viande</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {MEATS.map((meat) => (
                <button
                  key={meat.key}
                  onClick={() => setMeatKey(meat.key)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 10,
                    border: `1px solid ${meatKey === meat.key ? 'rgba(232,93,4,0.4)' : '#1e1a14'}`,
                    background: meatKey === meat.key ? 'rgba(232,93,4,0.08)' : '#0e0c0a',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 3 }}>{meat.emoji}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, color: meatKey === meat.key ? '#e85d04' : '#8a7a6a' }}>{meat.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div>
              <label style={S.label}>Poids (kg)</label>
              <input type="number" value={weight} min={0.5} max={20} step={0.5} onChange={(e) => setWeight(parseFloat(e.target.value) || 4)} style={S.input} />
            </div>
            <div>
              <label style={S.label}>Service (heure)</label>
              <input type="number" value={serveHour} min={10} max={23} step={1} onChange={(e) => setServeHour(parseInt(e.target.value, 10) || 19)} style={S.input} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ ...S.label, marginBottom: 0 }}>T° fumoir</label>
              <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 16, color: '#e85d04' }}>{smokerTemp}°C</span>
            </div>
            <input type="range" min={100} max={150} step={5} value={smokerTemp} onChange={(e) => setSmokerTemp(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
          </div>

          {calcResult ? (
            <div style={{ background: 'linear-gradient(135deg,rgba(232,93,4,0.08),rgba(212,78,0,0.04))', border: '1px solid rgba(232,93,4,0.2)', borderRadius: 14, padding: '18px 20px', marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#e85d04', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Lance ta cuisson à</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 52, color: '#e85d04', letterSpacing: '-2px', lineHeight: 1, marginBottom: 8 }}>
                {calcResult.launchH}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: '#0e0c0a', border: '1px solid #1e1a14', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontFamily: "'DM Mono',monospace", color: '#6a5a4a' }}>Cuisson {calcResult.totalH}</span>
                <span style={{ background: '#0e0c0a', border: '1px solid #1e1a14', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontFamily: "'DM Mono',monospace", color: '#6a5a4a' }}>Repos {calcResult.restH}</span>
                <span style={{ background: '#0e0c0a', border: '1px solid #1e1a14', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontFamily: "'DM Mono',monospace", color: '#6a5a4a' }}>Cible {calcResult.target}°C</span>
              </div>
            </div>
          ) : null}

          <button onClick={() => setPhase('profile')} style={S.btn}>
            🔥 Enregistrer mon profil BBQ
          </button>
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: '#3a2e24' }}>
            Gratuit · pas de carte · utile pour personnaliser tes recommandations
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080706', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ ...S.card, maxWidth: 560 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#e85d04,transparent)' }} />

        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>🧭</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, color: '#fff', marginBottom: 6 }}>
            Ton profil pitmaster
          </h2>
          <p style={{ fontSize: 13, color: '#6a5a4a', lineHeight: 1.6 }}>
            Ces infos nous servent à personnaliser les prochains calculs, les guides et les recommandations matériel.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div>
            <label style={S.label}>Prénom</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={S.input} placeholder="Benjamin" />
          </div>
          <div>
            <label style={S.label}>Nom</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={S.input} placeholder="Corette" />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Quel BBQ / fumoir utilises-tu le plus ?</label>
          <select value={smokerType} onChange={(e) => setSmokerType(e.target.value)} style={S.input}>
            {SMOKER_TYPES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Ton niveau</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {EXPERIENCE_LEVELS.map((item) => (
              <button
                key={item.value}
                onClick={() => setExperience(item.value)}
                style={{
                  padding: '14px 12px',
                  borderRadius: 12,
                  border: `1px solid ${experience === item.value ? 'rgba(232,93,4,0.4)' : '#1e1a14'}`,
                  background: experience === item.value ? 'rgba(232,93,4,0.08)' : '#0e0c0a',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{item.emoji}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: experience === item.value ? '#e85d04' : '#d4c4b0', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#4a3a2e' }}>{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={S.label}>À quelle fréquence fais-tu du BBQ ?</label>
          <div style={{ display: 'grid', gap: 8 }}>
            {BBQ_FREQUENCIES.map((item) => (
              <button
                key={item.value}
                onClick={() => setBbqFrequency(item.value)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: `1px solid ${bbqFrequency === item.value ? 'rgba(232,93,4,0.4)' : '#1e1a14'}`,
                  background: bbqFrequency === item.value ? 'rgba(232,93,4,0.08)' : '#0e0c0a',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: bbqFrequency === item.value ? '#e85d04' : '#d4c4b0' }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#4a3a2e', marginTop: 2 }}>{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 18, color: '#b7aea4', fontSize: 13, lineHeight: 1.6 }}>
          <input type="checkbox" checked={marketingOptIn} onChange={(e) => setMarketingOptIn(e.target.checked)} style={{ marginTop: 2 }} />
          <span>Je veux recevoir des conseils cuisson, des guides et des sélections matériel utiles. Pas de spam.</span>
        </label>

        {saveError ? (
          <div style={{ marginBottom: 12, fontSize: 12, color: '#f87171', background: 'rgba(248,113,113,0.08)', borderRadius: 10, padding: '10px 12px' }}>
            {saveError}
          </div>
        ) : null}

        <button onClick={finishOnboarding} disabled={saving || !firstName.trim()} style={S.btn}>
          {saving ? 'Enregistrement…' : '✅ Sauvegarder mon profil BBQ'}
        </button>
        <button onClick={() => navigate('/app')} style={{ ...S.btnSec, marginTop: 8 }}>
          Continuer sans compléter
        </button>
      </div>
    </div>
  )
}
