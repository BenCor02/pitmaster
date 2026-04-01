import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts'
import * as meater from '../lib/meater.js'
import * as fireboard from '../lib/fireboard.js'
import * as meaterBLE from '../lib/meaterBLE.js'
import * as inkbirdBLE from '../lib/inkbirdBLE.js'
import { isNative } from '../lib/capacitor.js'
import { sendNotification } from '../lib/notifications.js'
import { MEAT_PROFILES } from '../modules/calculator/data.js'
import { calculateCookPlan } from '../modules/calculator/engine.js'

// ── Provider abstraction ────────────────────────────────

const PROVIDERS = {
  ...(isNative ? {
    meater_ble: {
      id: 'meater_ble',
      name: 'Meater Bluetooth',
      icon: '📶',
      color: '#3b82f6',
      mode: 'ble',
      loginFields: [], // Pas de login — connexion directe BLE
      login: async () => true,
      logout: () => meaterBLE.disconnect(),
      isConnected: meaterBLE.isProbeConnected,
      // Le polling BLE est géré différemment (notifications push, pas de polling)
      startPolling: ({ onData, onError }) => {
        let running = true
        ;(async () => {
          try {
            const probes = await meaterBLE.scanForProbes(8000)
            if (!probes.length) {
              onError(new Error('Aucune sonde Meater détectée. Vérifie que ta sonde est allumée et à proximité.'))
              return
            }
            await meaterBLE.connectToProbe(probes[0].deviceId)
            await meaterBLE.startTemperatureStream((data) => {
              if (!running) return
              onData([{
                id: probes[0].deviceId,
                provider: 'meater_ble',
                name: probes[0].name,
                temperature: { internal: data.tipTemp, ambient: data.ambientTemp },
                cook: null, // Pas de state cook en BLE direct
              }])
            })
          } catch (err) {
            onError(err)
          }
        })()
        return () => { running = false; meaterBLE.disconnect() }
      },
      getCookState: meater.getCookState,
      normalize: (devices) => devices,
      helpText: 'Connexion Bluetooth directe — pas besoin de l\'app Meater ni d\'internet.',
    },
    inkbird_ble: {
      id: 'inkbird_ble',
      name: 'Inkbird iBBQ',
      icon: '🔗',
      color: '#10b981',
      mode: 'ble',
      loginFields: [],
      login: async () => true,
      logout: () => inkbirdBLE.disconnect(),
      isConnected: inkbirdBLE.isProbeConnected,
      startPolling: ({ onData, onError }) => {
        let running = true
        ;(async () => {
          try {
            const probes = await inkbirdBLE.scanForProbes(8000)
            if (!probes.length) {
              onError(new Error('Aucun thermomètre Inkbird détecté. Vérifie qu\'il est allumé et à proximité.'))
              return
            }
            await inkbirdBLE.connectToProbe(probes[0].deviceId)
            await inkbirdBLE.startTemperatureStream((data) => {
              if (!running) return
              if (!data.connected) {
                onError(new Error('Inkbird déconnecté'))
                return
              }
              onData([{
                id: probes[0].deviceId,
                provider: 'inkbird_ble',
                name: probes[0].name,
                temperature: { internal: data.tipTemp, ambient: data.ambientTemp },
                cook: null,
              }])
            })
          } catch (err) {
            onError(err)
          }
        })()
        return () => { running = false; inkbirdBLE.disconnect() }
      },
      getCookState: meater.getCookState,
      normalize: (devices) => devices,
      helpText: 'Connexion Bluetooth directe aux thermomètres Inkbird iBBQ (IBT-4XS, IBT-2X, IBBQ-4BW…).',
    },
  } : {}),
  meater: {
    id: 'meater',
    name: 'Meater Cloud',
    icon: '🌡️',
    color: '#ff6b1a',
    mode: 'cloud',
    loginFields: [
      { key: 'email', label: 'Email Meater', type: 'email', placeholder: 'ton@email.com' },
      { key: 'password', label: 'Mot de passe', type: 'password', placeholder: '••••••••' },
    ],
    login: (fields) => meater.login(fields.email, fields.password),
    logout: meater.logout,
    isConnected: meater.isConnected,
    startPolling: meater.startPolling,
    getCookState: meater.getCookState,
    normalize: (devices) => devices.map(d => ({
      ...d,
      provider: 'meater',
      name: d.cook?.name || `Sonde ${d.id.slice(-4)}`,
    })),
    helpText: 'Ta sonde doit être connectée via l\'app Meater sur ton téléphone (Bluetooth → Cloud).',
  },
  fireboard: {
    id: 'fireboard',
    name: 'FireBoard',
    icon: '🔥',
    color: '#e74c3c',
    loginFields: [
      { key: 'username', label: 'Email / Username FireBoard', type: 'email', placeholder: 'ton@email.com' },
      { key: 'password', label: 'Mot de passe', type: 'password', placeholder: '••••••••' },
    ],
    login: (fields) => fireboard.login(fields.username, fields.password),
    logout: fireboard.logout,
    isConnected: fireboard.isConnected,
    startPolling: fireboard.startPolling,
    getCookState: (state) => meater.getCookState(state), // réutilise les labels
    normalize: (devices) => devices, // déjà normalisé dans fireboard.js
    helpText: 'Ton FireBoard doit être connecté en WiFi et synchronisé avec FireBoard Cloud.',
  },
}

// ── Helpers ─────────────────────────────────────────────

function formatElapsed(seconds) {
  if (!seconds && seconds !== 0) return '--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}min`
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// ── Provider selector ───────────────────────────────────

function ProviderSelector({ selected, onSelect }) {
  const providerList = Object.values(PROVIDERS)
  const cols = providerList.length > 2 ? 'grid-cols-3' : 'grid-cols-2'
  return (
    <div className="max-w-lg mx-auto mb-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 text-center">Connecte ta sonde</p>
      <div className={`grid ${cols} gap-3`}>
        {providerList.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
              selected === p.id
                ? 'border-[#ff6b1a]/30 bg-[#ff6b1a]/[0.08]'
                : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
          >
            <span className="text-2xl">{p.icon}</span>
            <div className="text-left">
              <span className="text-sm font-bold text-white">{p.name}</span>
              <p className="text-[10px] text-zinc-500">{p.mode === 'ble' ? 'Bluetooth direct' : 'Cloud API'}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Login form (generic) ────────────────────────────────

function ProbeLogin({ provider, onConnected }) {
  const prov = PROVIDERS[provider]
  const [fields, setFields] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function updateField(key, value) {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await prov.login(fields)
      onConnected()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Mode BLE : pas de formulaire, juste un bouton scan
  if (prov.mode === 'ble') {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-3xl">
              📶
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Connexion Bluetooth</h2>
            <p className="text-sm text-zinc-500">Recherche automatique des sondes à proximité</p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? '🔍 Recherche en cours...' : '📶 Scanner les sondes Meater'}
          </button>

          <div className="mt-5 p-4 rounded-xl bg-blue-500/[0.05] border border-blue-500/10">
            <p className="text-xs text-zinc-400 leading-relaxed">
              <span className="text-blue-400 font-semibold">Bluetooth direct :</span> {prov.helpText}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#ff6b1a]/20 to-[#dc2626]/10 flex items-center justify-center text-3xl">
            {prov.icon}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Connexion {prov.name}</h2>
          <p className="text-sm text-zinc-500">Utilise les identifiants de ton compte {prov.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {prov.loginFields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">{f.label}</label>
              <input
                type={f.type}
                value={fields[f.key] || ''}
                onChange={e => updateField(f.key, e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:border-[#ff6b1a]/40 focus:outline-none transition-colors"
                placeholder={f.placeholder}
              />
            </div>
          ))}

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff6b1a] to-[#dc2626] hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Connexion...' : `Se connecter à ${prov.name}`}
          </button>
        </form>

        <div className="mt-5 p-4 rounded-xl bg-[#ff6b1a]/[0.05] border border-[#ff6b1a]/10">
          <p className="text-xs text-zinc-400 leading-relaxed">
            <span className="text-[#ff6b1a] font-semibold">Important :</span> {prov.helpText}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Device selector ─────────────────────────────────────

function DeviceSelector({ devices, selectedId, onSelect }) {
  if (!devices.length) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">📡</div>
        <p className="text-zinc-400 text-sm">Aucune sonde détectée</p>
        <p className="text-zinc-600 text-xs mt-1">Vérifie que ta sonde est connectée dans l'app Meater</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {devices.map(d => {
        const state = meater.getCookState(d.cook?.state)
        const isActive = d.id === selectedId
        return (
          <button
            key={d.id}
            onClick={() => onSelect(d.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              isActive
                ? 'border-[#ff6b1a]/30 bg-[#ff6b1a]/[0.08]'
                : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
          >
            <div className="text-2xl">{d.cook ? state.icon : '🌡️'}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {d.cook?.name || `Sonde ${d.id.slice(-4)}`}
                </span>
                {d.cook && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: state.color + '20', color: state.color }}
                  >
                    {state.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-zinc-400">
                  Interne : <span className="text-[#ff6b1a] font-bold">{Math.round(d.temperature.internal)}°C</span>
                </span>
                <span className="text-xs text-zinc-400">
                  Ambiante : <span className="text-zinc-300 font-medium">{Math.round(d.temperature.ambient)}°C</span>
                </span>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-[#ff6b1a]' : 'bg-zinc-700'}`} />
          </button>
        )
      })}
    </div>
  )
}

// ── Temp gauge ──────────────────────────────────────────

function TempGauge({ value, target, label, color = '#ff6b1a' }) {
  const pct = target ? Math.min((value / target) * 100, 100) : 0
  return (
    <div className="flex-1 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">{label}</p>
      <p className="text-3xl font-black text-white">
        {Math.round(value)}<span className="text-lg text-zinc-500">°C</span>
      </p>
      {target > 0 && (
        <>
          <div className="mt-2 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
          <p className="text-[10px] text-zinc-600 mt-1">Cible : {Math.round(target)}°C</p>
        </>
      )}
    </div>
  )
}

// ── Alerts engine ───────────────────────────────────────

function useAlerts(device, profile) {
  const [alerts, setAlerts] = useState([])
  const firedRef = useRef(new Set())

  useEffect(() => {
    if (!device || !profile) return

    const internal = device.temperature?.internal
    if (!internal) return

    const newAlerts = []

    // Stall alert + notification
    if (profile.cues?.stall_temp_min && internal >= profile.cues.stall_temp_min && internal <= profile.cues.stall_temp_max) {
      if (!firedRef.current.has('stall')) {
        firedRef.current.add('stall')
        newAlerts.push({
          id: 'stall',
          type: 'info',
          icon: '⏳',
          title: 'Stall détecté',
          message: `La température stagne autour de ${Math.round(internal)}°C — c'est normal. Patience.`,
        })
        sendNotification({
          title: '⏳ Stall détecté',
          body: `La sonde est à ${Math.round(internal)}°C — zone de stall (${profile.cues.stall_temp_min}-${profile.cues.stall_temp_max}°C). C'est normal, patience !`,
          channelId: 'cuisson',
        })
      }
    }

    // Stall passé — notification de sortie
    if (profile.cues?.stall_temp_max && internal > profile.cues.stall_temp_max) {
      if (firedRef.current.has('stall') && !firedRef.current.has('stall_exit')) {
        firedRef.current.add('stall_exit')
        newAlerts.push({
          id: 'stall_exit',
          type: 'info',
          icon: '🎉',
          title: 'Stall terminé !',
          message: `La température repart à la hausse (${Math.round(internal)}°C). La dernière ligne droite commence.`,
        })
        sendNotification({
          title: '🎉 Stall terminé !',
          body: `${Math.round(internal)}°C — la température repart. Dernière ligne droite !`,
          channelId: 'cuisson',
        })
      }
    }

    // Wrap alert
    if (profile.cues?.wrap_temp_min && internal >= profile.cues.wrap_temp_min && internal <= profile.cues.wrap_temp_max) {
      if (!firedRef.current.has('wrap')) {
        firedRef.current.add('wrap')
        newAlerts.push({
          id: 'wrap',
          type: 'action',
          icon: '📦',
          title: 'Moment de wrapper',
          message: profile.cues.visual_wrap || `Température idéale pour emballer : ${Math.round(internal)}°C`,
        })
      }
    }

    // Begin test alert
    if (profile.cues?.begin_test_temp && internal >= profile.cues.begin_test_temp) {
      if (!firedRef.current.has('test')) {
        firedRef.current.add('test')
        newAlerts.push({
          id: 'test',
          type: 'action',
          icon: '🔍',
          title: 'Commence les tests',
          message: profile.cues.probe_tender || 'Teste la tendreté avec une sonde — elle doit entrer comme dans du beurre.',
        })
      }
    }

    // Target reached alert
    if (profile.cues?.target_temp_min && internal >= profile.cues.target_temp_min) {
      if (!firedRef.current.has('target')) {
        firedRef.current.add('target')
        newAlerts.push({
          id: 'target',
          type: 'success',
          icon: '✅',
          title: 'Température cible atteinte !',
          message: `${Math.round(internal)}°C — Vérifie la tendreté. Si la sonde entre sans résistance, c'est prêt pour le repos.`,
        })
        // Push notification
        sendPushNotification('Cuisson terminée !', `Ta viande a atteint ${Math.round(internal)}°C — il est temps de la sortir.`)
      }
    }

    // Reverse sear pull temp
    if (profile.cook_type === 'reverse_sear' && profile.doneness_targets) {
      const selectedDoneness = profile.default_doneness || Object.keys(profile.doneness_targets)[0] || 'medium_rare'
      const pullTemp = (profile.doneness_targets[selectedDoneness] || 54) - (profile.reverse_sear?.pull_before_target_c || 6)
      if (internal >= pullTemp) {
        if (!firedRef.current.has('pull')) {
          firedRef.current.add('pull')
          newAlerts.push({
            id: 'pull',
            type: 'action',
            icon: '🔥',
            title: 'Prêt pour la saisie !',
            message: `${Math.round(internal)}°C atteint — sors la viande et lance la saisie à feu vif.`,
          })
          sendPushNotification('Prêt pour le sear !', `Température interne : ${Math.round(internal)}°C`)
        }
      }
    }

    // Overcook warning
    if (profile.cues?.target_temp_max && internal > profile.cues.target_temp_max + 3) {
      if (!firedRef.current.has('overcook')) {
        firedRef.current.add('overcook')
        newAlerts.push({
          id: 'overcook',
          type: 'danger',
          icon: '🚨',
          title: 'Attention — température élevée',
          message: `${Math.round(internal)}°C dépasse la cible. Sors la viande maintenant !`,
        })
        sendPushNotification('Température trop élevée !', `${Math.round(internal)}°C — sors la viande immédiatement !`)
      }
    }

    if (newAlerts.length) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10))
    }
  }, [device?.temperature?.internal, profile])

  return alerts
}

function sendPushNotification(title, body) {
  // Utilise le système natif Capacitor ou fallback web
  sendNotification(title, body, { channelId: 'cuisson' }).catch(() => {})
}

// ── Live phases (guide étape par étape) ────────────────

const PHASE_ICONS = ['🔥', '🥵', '📦', '🧈', '🍽️', '😴']

function StallProgressBar({ profile, internal }) {
  if (!profile?.cues?.stall_temp_min) return null
  const min = profile.cues.stall_temp_min
  const max = profile.cues.stall_temp_max
  const range = max - min
  if (range <= 0) return null

  const progress = Math.max(0, Math.min(1, (internal - min) / range))
  const inStall = internal >= min && internal <= max
  const pastStall = internal > max

  return (
    <div className="mt-2 px-2.5 py-2 rounded-lg bg-amber-500/[0.06] border border-amber-500/[0.15]">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">🌡️</span>
          <span className="text-[11px] font-semibold text-amber-400">Zone Stall</span>
        </div>
        <span className="text-[11px] font-bold text-amber-300">
          {pastStall ? '✓ Passé' : inStall ? `${Math.round(internal)}°C` : `Début à ${min}°C`}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-zinc-800 overflow-hidden">
        {/* Zone markers */}
        <div className="absolute inset-0 flex items-center justify-between px-0.5 z-10">
          <span className="text-[7px] text-zinc-500 font-bold">{min}°</span>
          <span className="text-[7px] text-zinc-500 font-bold">{max}°</span>
        </div>
        {/* Progress fill */}
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${
            pastStall ? 'bg-green-500' : 'bg-gradient-to-r from-amber-600 to-amber-400'
          }`}
          style={{ width: `${(pastStall ? 100 : progress * 100)}%` }}
        />
        {/* Animated pulse on active */}
        {inStall && !pastStall && (
          <div
            className="absolute top-0 h-full w-3 rounded-full bg-amber-300/40 animate-pulse"
            style={{ left: `calc(${progress * 100}% - 6px)` }}
          />
        )}
      </div>
      {inStall && (
        <p className="text-[10px] text-zinc-500 mt-1.5">
          La température stagne — c'est normal. {internal < (min + max) / 2 ? 'Début du stall, ça peut durer un moment.' : 'Tu approches de la sortie !'}
        </p>
      )}
    </div>
  )
}

function LivePhases({ phases, profile, device, cookPlan }) {
  const internal = device?.temperature?.internal || 0

  // Déterminer quelle phase est active
  function getPhaseState(phase) {
    if (phase.title.includes('Repos')) {
      const st = device?.cook?.state
      if (st === 'Resting' || st === 'Ready For Resting') return 'active'
      if (profile?.cues?.target_temp_min && internal >= profile.cues.target_temp_min) return 'done'
      return 'upcoming'
    }
    if (phase.title.includes('Stall') && profile?.cues?.stall_temp_min) {
      if (internal > profile.cues.stall_temp_max) return 'done'
      if (internal >= profile.cues.stall_temp_min) return 'active'
      return 'upcoming'
    }
    if (phase.title.includes('Wrap') && profile?.cues?.wrap_temp_min) {
      if (internal > profile.cues.wrap_temp_max + 5) return 'done'
      if (internal >= profile.cues.wrap_temp_min) return 'active'
      return 'upcoming'
    }
    if (phase.title.includes('collagène') && profile?.cues?.begin_test_temp) {
      if (profile?.cues?.target_temp_min && internal >= profile.cues.target_temp_min) return 'done'
      if (internal >= profile.cues.begin_test_temp) return 'active'
      return 'upcoming'
    }
    if (phase.title.includes('Montée')) {
      if (internal >= (profile?.cues?.stall_temp_min || 65)) return 'done'
      return 'active'
    }
    if (phase.title.includes('Saisie') || phase.title.includes('Sear')) {
      if (profile?.doneness_targets) {
        const d = profile.default_doneness || Object.keys(profile.doneness_targets)[0]
        const pullTemp = (profile.doneness_targets[d] || 54) - (profile.reverse_sear?.pull_before_target_c || 6)
        if (internal >= pullTemp) return 'active'
      }
      return 'upcoming'
    }
    return 'upcoming'
  }

  return (
    <div className="surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">📋</span>
          <h3 className="text-[13px] font-bold text-white">Étapes de cuisson</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500">Cuisson {cookPlan.cookEstimate}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-[10px] text-zinc-500">Total {cookPlan.totalEstimate}</span>
        </div>
      </div>

      <div className="space-y-0">
        {phases.map((phase, i) => {
          const state = getPhaseState(phase)
          const icon = PHASE_ICONS[i] || '🔥'
          const isLast = i === phases.length - 1

          return (
            <div key={i} className="flex gap-3">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                  state === 'active' ? 'bg-[#ff6b1a] shadow-lg shadow-[#ff6b1a]/20' :
                  state === 'done' ? 'bg-green-600/80' :
                  'bg-zinc-800'
                }`}>
                  {state === 'done' ? '✓' : icon}
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 my-1 min-h-[16px] ${
                    state === 'done' ? 'bg-green-600/40' :
                    state === 'active' ? 'bg-[#ff6b1a]/30' :
                    'bg-zinc-800'
                  }`} />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 pb-3 ${isLast ? '' : ''}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[13px] font-semibold ${
                    state === 'active' ? 'text-[#ff6b1a]' :
                    state === 'done' ? 'text-green-400' :
                    'text-zinc-400'
                  }`}>
                    {phase.title}
                  </span>
                  {state === 'active' && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#ff6b1a]/20 text-[#ff6b1a] animate-pulse">
                      EN COURS
                    </span>
                  )}
                  {state === 'done' && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                      FAIT
                    </span>
                  )}
                  {phase.duration && (
                    <span className="text-[10px] text-zinc-600 font-medium">{phase.duration}</span>
                  )}
                </div>
                {phase.objective && (
                  <p className={`text-[11px] mt-1 leading-relaxed ${
                    state === 'active' ? 'text-zinc-300' : 'text-zinc-600'
                  }`}>
                    {phase.objective}
                  </p>
                )}
                {/* Marqueurs de température pour la phase active */}
                {state === 'active' && phase.markers?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {phase.markers.map((m, j) => (
                      <div key={j} className="flex items-start gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.05]">
                        <span className="text-[10px] mt-0.5">{m.type === 'temp' ? '🌡️' : '👁️'}</span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{m.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* Barre de progression stall */}
                {phase.title.includes('Stall') && (state === 'active' || state === 'done') && (
                  <StallProgressBar profile={profile} internal={internal} />
                )}
                {state === 'active' && phase.advice && (
                  <div className="mt-2 px-2.5 py-1.5 rounded-md bg-[#ff6b1a]/[0.05] border border-[#ff6b1a]/[0.1]">
                    <p className="text-[11px] text-zinc-400">
                      <span className="text-[#ff6b1a] font-semibold">Conseil :</span> {phase.advice}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Alert badge colors ──────────────────────────────────

const ALERT_COLORS = {
  info: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  action: { bg: 'bg-[#ff6b1a]/10', border: 'border-[#ff6b1a]/20', text: 'text-[#ff6b1a]' },
  success: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
  danger: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
}

// ── Custom tooltip ──────────────────────────────────────

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 shadow-xl text-xs">
      <p className="text-zinc-500 mb-1">{d.time}</p>
      <p className="text-[#ff6b1a] font-bold">Interne : {d.internal?.toFixed(1)}°C</p>
      {d.ambient != null && <p className="text-zinc-400">Ambiante : {d.ambient?.toFixed(1)}°C</p>}
    </div>
  )
}

// ── MAIN PAGE ───────────────────────────────────────────

export default function LiveCookPage() {
  const location = useLocation()

  // Pre-fill from calculator
  const preSelectedProfile = location.state?.profileId || null
  const preWeight = location.state?.weightKg || null
  const preCookTemp = location.state?.cookTempC || null
  const preWrapped = location.state?.wrapped ?? false

  // Provider
  const [provider, setProvider] = useState(() => {
    // Auto-detect if already connected
    if (meaterBLE.isProbeConnected()) return 'meater_ble'
    if (meater.isConnected()) return 'meater'
    if (fireboard.isConnected()) return 'fireboard'
    // Sur Android, proposer BLE en premier
    return isNative ? 'meater_ble' : 'meater'
  })
  const prov = PROVIDERS[provider]

  // State
  const [connected, setConnected] = useState(() => meaterBLE.isProbeConnected() || meater.isConnected() || fireboard.isConnected())
  const [devices, setDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)
  const [polling, setPolling] = useState(false)
  const [cookStartTime, setCookStartTime] = useState(null)

  // Profile selection for phase overlay
  const [profileId, setProfileId] = useState(preSelectedProfile || '')
  const [weightKg, setWeightKg] = useState(preWeight || '')
  const [cookTempC, setCookTempC] = useState(preCookTemp || '')
  const [wrapped, setWrapped] = useState(preWrapped)

  const stopRef = useRef(null)

  const selectedDevice = devices.find(d => d.id === selectedDeviceId) || null
  const selectedProfile = MEAT_PROFILES.find(p => p.id === profileId) || null

  // Compute cook plan for phase overlay
  const cookPlan = selectedProfile && weightKg && cookTempC
    ? calculateCookPlan({
        profile: selectedProfile,
        weightKg: parseFloat(weightKg),
        cookTempC: parseInt(cookTempC),
        wrapped,
      })
    : null

  // Alerts
  const alerts = useAlerts(selectedDevice, selectedProfile)

  // Request notification permission (natif ou web)
  useEffect(() => {
    import('../lib/notifications.js').then(({ requestPermission }) => {
      requestPermission().catch(() => {})
    })
  }, [])

  // Start polling when connected
  const startLive = useCallback(() => {
    if (stopRef.current) stopRef.current()

    setPolling(true)
    setError(null)
    if (!cookStartTime) setCookStartTime(new Date())

    stopRef.current = prov.startPolling({
      intervalMs: 30000,
      onData: (rawDevs) => {
        const devs = prov.normalize(rawDevs)
        setDevices(devs)
        // Auto-select first device
        if (devs.length && !selectedDeviceId) {
          setSelectedDeviceId(devs[0].id)
        }
        // Record history for selected device
        const active = devs.find(d => d.id === selectedDeviceId) || devs[0]
        if (active) {
          setHistory(prev => {
            const point = {
              ts: Date.now(),
              time: formatTime(new Date()),
              internal: active.temperature.internal,
              ambient: active.temperature.ambient,
              cookState: active.cook?.state || null,
              elapsed: active.cook?.time?.elapsed || null,
            }
            return [...prev, point].slice(-360) // keep ~3h at 30s intervals
          })
        }
      },
      onError: (err) => {
        setError(err.message)
        if (err.message.includes('expirée')) {
          setConnected(false)
          setPolling(false)
        }
      },
    })
  }, [selectedDeviceId, cookStartTime, prov])

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (stopRef.current) stopRef.current() }
  }, [])

  function handleDisconnect() {
    if (stopRef.current) stopRef.current()
    prov.logout()
    setConnected(false)
    setPolling(false)
    setDevices([])
    setHistory([])
    setSelectedDeviceId(null)
  }

  function handleReset() {
    setHistory([])
    setCookStartTime(new Date())
  }

  // ── Render ────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            <span className="text-[#ff6b1a]">Live</span> Cook
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Suivi temps réel avec ta sonde {connected ? prov.name : 'connectée'}
          </p>
        </div>
        {connected && (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${polling ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
            <span className="text-xs text-zinc-500">{polling ? 'En direct' : 'Connecté'}</span>
            <button
              onClick={handleDisconnect}
              className="ml-2 text-xs text-zinc-600 hover:text-red-400 transition-colors"
            >
              Déconnecter
            </button>
          </div>
        )}
      </div>

      {/* Not connected → Provider selector + Login */}
      {!connected && (
        <>
          <ProviderSelector selected={provider} onSelect={setProvider} />
          <ProbeLogin provider={provider} onConnected={() => setConnected(true)} />
        </>
      )}

      {/* Connected */}
      {connected && (
        <div className="space-y-6">

          {/* Config row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="col-span-2 lg:col-span-1">
              <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Viande</label>
              <select
                value={profileId}
                onChange={e => setProfileId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:border-[#ff6b1a]/40 focus:outline-none"
              >
                <option value="">— Choisir —</option>
                {MEAT_PROFILES.map(p => (
                  <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Poids (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="15"
                value={weightKg}
                onChange={e => setWeightKg(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:border-[#ff6b1a]/40 focus:outline-none"
                placeholder="5.0"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Temp fumoir</label>
              <input
                type="number"
                min="80"
                max="200"
                value={cookTempC}
                onChange={e => setCookTempC(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:border-[#ff6b1a]/40 focus:outline-none"
                placeholder="121"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 py-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wrapped}
                  onChange={e => setWrapped(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/[0.04] text-[#ff6b1a] focus:ring-[#ff6b1a]/30"
                />
                <span className="text-sm text-zinc-300">Wrap</span>
              </label>
            </div>
            <div className="flex items-end">
              {!polling ? (
                <button
                  onClick={startLive}
                  className="w-full py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff6b1a] to-[#dc2626] hover:opacity-90 transition-opacity text-sm"
                >
                  Lancer le live
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-xl font-medium text-zinc-400 border border-white/[0.08] hover:bg-white/[0.04] transition-colors text-sm"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Device selector */}
          {polling && <DeviceSelector devices={devices} selectedId={selectedDeviceId} onSelect={setSelectedDeviceId} />}

          {/* Live dashboard */}
          {selectedDevice && (
            <>
              {/* Temp gauges */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <TempGauge
                  value={selectedDevice.temperature.internal}
                  target={selectedProfile?.cues?.target_temp_min || selectedDevice.cook?.temperature?.target || 0}
                  label="Temp. interne"
                  color="#ff6b1a"
                />
                <TempGauge
                  value={selectedDevice.temperature.ambient}
                  target={cookTempC ? parseInt(cookTempC) : 0}
                  label="Temp. ambiante"
                  color="#3b82f6"
                />
                {selectedDevice.cook?.time?.elapsed != null && (
                  <div className="flex-1 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Temps écoulé</p>
                    <p className="text-3xl font-black text-white">{formatElapsed(selectedDevice.cook.time.elapsed)}</p>
                  </div>
                )}
                {selectedDevice.cook?.time?.remaining != null && selectedDevice.cook.time.remaining > 0 && (
                  <div className="flex-1 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Temps restant</p>
                    <p className="text-3xl font-black text-[#22c55e]">{formatElapsed(selectedDevice.cook.time.remaining)}</p>
                    {cookPlan && (
                      <p className="text-[10px] text-zinc-600 mt-1">Estimé C&F : {cookPlan.totalEstimate}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Phases de cuisson (guide étape par étape) */}
              {cookPlan && (
                <LivePhases phases={cookPlan.phases} profile={selectedProfile} device={selectedDevice} cookPlan={cookPlan} />
              )}

              {/* Pas de profil sélectionné → inciter à en choisir un */}
              {!cookPlan && polling && (
                <div className="px-4 py-3 rounded-xl bg-[#ff6b1a]/[0.06] border border-[#ff6b1a]/[0.12] flex items-center gap-3">
                  <span className="text-lg">💡</span>
                  <p className="text-xs text-zinc-400">
                    <span className="text-[#ff6b1a] font-semibold">Conseil :</span> sélectionne ta viande, le poids et la température au-dessus pour voir les étapes de cuisson en temps réel.
                  </p>
                </div>
              )}

              {/* Cook state badge */}
              {selectedDevice.cook && (
                <div className="flex items-center gap-3">
                  {(() => {
                    const st = meater.getCookState(selectedDevice.cook.state)
                    return (
                      <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
                        style={{ backgroundColor: st.color + '15', color: st.color, borderColor: st.color + '30', borderWidth: 1 }}
                      >
                        <span className="text-lg">{st.icon}</span>
                        {st.label}
                      </div>
                    )
                  })()}
                  {selectedDevice.cook.name && (
                    <span className="text-sm text-zinc-500">"{selectedDevice.cook.name}"</span>
                  )}
                </div>
              )}

              {/* Chart */}
              {history.length > 1 && (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Courbe de température</h3>
                    <span className="text-[10px] text-zinc-600">{history.length} points</span>
                  </div>
                  <div className="h-[300px] lg:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis
                          dataKey="time"
                          tick={{ fill: '#71717a', fontSize: 10 }}
                          tickLine={false}
                          axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fill: '#71717a', fontSize: 10 }}
                          tickLine={false}
                          axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                          domain={['auto', 'auto']}
                          unit="°"
                        />
                        <Tooltip content={<ChartTooltip />} />

                        {/* Phase reference lines from calculator */}
                        {selectedProfile?.cues?.stall_temp_min && (
                          <ReferenceArea
                            y1={selectedProfile.cues.stall_temp_min}
                            y2={selectedProfile.cues.stall_temp_max}
                            fill="#eab308"
                            fillOpacity={0.06}
                            label={{ value: 'Stall', position: 'right', fill: '#eab308', fontSize: 10 }}
                          />
                        )}
                        {selectedProfile?.cues?.wrap_temp_min && (
                          <ReferenceLine
                            y={selectedProfile.cues.wrap_temp_min}
                            stroke="#3b82f6"
                            strokeDasharray="6 3"
                            label={{ value: 'Wrap', position: 'right', fill: '#3b82f6', fontSize: 10 }}
                          />
                        )}
                        {selectedProfile?.cues?.target_temp_min && (
                          <ReferenceLine
                            y={selectedProfile.cues.target_temp_min}
                            stroke="#22c55e"
                            strokeDasharray="6 3"
                            label={{ value: 'Cible', position: 'right', fill: '#22c55e', fontSize: 10 }}
                          />
                        )}
                        {/* Reverse sear pull temp */}
                        {selectedProfile?.cook_type === 'reverse_sear' && selectedProfile?.doneness_targets && (
                          <ReferenceLine
                            y={(selectedProfile.doneness_targets[selectedProfile.default_doneness || Object.keys(selectedProfile.doneness_targets)[0]] || 54) - (selectedProfile.reverse_sear?.pull_before_target_c || 6)}
                            stroke="#f59e0b"
                            strokeDasharray="6 3"
                            label={{ value: 'Sear', position: 'right', fill: '#f59e0b', fontSize: 10 }}
                          />
                        )}

                        {/* Ambient temp line */}
                        <Line
                          type="monotone"
                          dataKey="ambient"
                          stroke="#3b82f6"
                          strokeWidth={1.5}
                          dot={false}
                          strokeDasharray="4 2"
                          name="Ambiante"
                        />

                        {/* Internal temp line — main */}
                        <Line
                          type="monotone"
                          dataKey="internal"
                          stroke="#ff6b1a"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 4, fill: '#ff6b1a' }}
                          name="Interne"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-6 mt-3 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-[#ff6b1a] rounded" />
                      <span className="text-[10px] text-zinc-500">Interne</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-[#3b82f6] rounded" style={{ borderTop: '1px dashed #3b82f6' }} />
                      <span className="text-[10px] text-zinc-500">Ambiante</span>
                    </div>
                    {selectedProfile?.cues?.stall_temp_min && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#eab308]/20 rounded-sm" />
                        <span className="text-[10px] text-zinc-500">Zone stall</span>
                      </div>
                    )}
                    {selectedProfile?.cues?.target_temp_min && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-[#22c55e] rounded" />
                        <span className="text-[10px] text-zinc-500">Cible</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Alerts */}
              {alerts.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white">Alertes</h3>
                  {alerts.map((alert, i) => {
                    const colors = ALERT_COLORS[alert.type] || ALERT_COLORS.info
                    return (
                      <div
                        key={`${alert.id}-${i}`}
                        className={`flex items-start gap-3 p-4 rounded-xl border ${colors.bg} ${colors.border}`}
                      >
                        <span className="text-xl shrink-0">{alert.icon}</span>
                        <div>
                          <p className={`font-bold text-sm ${colors.text}`}>{alert.title}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{alert.message}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* (phases déplacées au-dessus du graphique) */}
            </>
          )}

          {/* Waiting state */}
          {polling && !selectedDevice && devices.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4 animate-pulse">📡</div>
              <p className="text-zinc-400">Recherche de sondes...</p>
              <p className="text-xs text-zinc-600 mt-2">Assure-toi que ta sonde Meater est allumée et connectée via l'app</p>
            </div>
          )}

          {/* Not polling yet */}
          {!polling && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🌡️</div>
              <p className="text-zinc-400 mb-2">Configure ta cuisson et lance le live</p>
              <p className="text-xs text-zinc-600">
                Sélectionne ta viande et tes paramètres, puis clique sur "Lancer le live"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
