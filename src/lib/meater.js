/**
 * CHARBON & FLAMME — Service Meater Cloud API
 *
 * Connexion aux sondes Meater via leur API REST publique.
 * Auth par JWT, polling toutes les 30s, températures en °C.
 *
 * API docs : https://github.com/apption-labs/meater-cloud-public-rest-api
 */

const BASE_URL = 'https://public-api.cloud.meater.com/v1'

// ── Auth ────────────────────────────────────────────────

let _token = null
let _userId = null

export function getMeaterToken() {
  if (_token) return _token
  try {
    const saved = JSON.parse(sessionStorage.getItem('meater_auth') || 'null')
    if (saved?.token) {
      _token = saved.token
      _userId = saved.userId
    }
  } catch {}
  return _token
}

export function isConnected() {
  return !!getMeaterToken()
}

export async function login(email, password) {
  let res
  try {
    res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  } catch (err) {
    // Erreur réseau (CORS, serveur down, offline…)
    throw new Error('Impossible de joindre le serveur Meater. Vérifie ta connexion internet.')
  }

  let json
  try {
    json = await res.json()
  } catch {
    throw new Error(`Réponse invalide du serveur Meater (HTTP ${res.status})`)
  }

  if (json.statusCode !== 200 || !json.data?.token) {
    throw new Error(json.message || 'Identifiants Meater invalides')
  }

  _token = json.data.token
  _userId = json.data.userId

  // Persister en session (pas localStorage — sécurité)
  try {
    sessionStorage.setItem('meater_auth', JSON.stringify({ token: _token, userId: _userId }))
  } catch {}

  return { token: _token, userId: _userId }
}

export function logout() {
  _token = null
  _userId = null
  try { sessionStorage.removeItem('meater_auth') } catch {}
}

// ── Devices (sondes) ────────────────────────────────────

/**
 * Récupère toutes les sondes connectées.
 * Retourne un tableau de devices avec :
 * - id: string
 * - temperature: { internal: number (°C), ambient: number (°C) }
 * - cook: { id, name, state, temperature: { target, peak }, time: { elapsed, remaining } } | null
 * - updated_at: number (timestamp)
 */
export async function getDevices() {
  const token = getMeaterToken()
  if (!token) throw new Error('Non connecté à Meater')

  let res
  try {
    res = await fetch(`${BASE_URL}/devices`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
  } catch {
    throw new Error('Impossible de joindre le serveur Meater. Vérifie ta connexion internet.')
  }

  let json
  try {
    json = await res.json()
  } catch {
    throw new Error(`Réponse invalide du serveur Meater (HTTP ${res.status})`)
  }

  if (json.statusCode === 401) {
    logout()
    throw new Error('Session Meater expirée')
  }

  if (json.statusCode !== 200) {
    throw new Error(json.message || 'Erreur API Meater')
  }

  return json.data?.devices || []
}

export async function getDevice(deviceId) {
  const token = getMeaterToken()
  if (!token) throw new Error('Non connecté à Meater')

  let res
  try {
    res = await fetch(`${BASE_URL}/devices/${deviceId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
  } catch {
    throw new Error('Impossible de joindre le serveur Meater. Vérifie ta connexion internet.')
  }

  let json
  try {
    json = await res.json()
  } catch {
    throw new Error(`Réponse invalide du serveur Meater (HTTP ${res.status})`)
  }

  if (json.statusCode === 401) {
    logout()
    throw new Error('Session Meater expirée')
  }

  if (json.statusCode !== 200) {
    throw new Error(json.message || 'Erreur API Meater')
  }

  return json.data || null
}

// ── Polling manager ─────────────────────────────────────

/**
 * Lance un polling sur les devices toutes les intervalMs (défaut 30s).
 * Appelle onData(devices) à chaque tick.
 * Appelle onError(err) en cas d'erreur.
 * Retourne une fonction stop() pour arrêter le polling.
 */
export function startPolling({ onData, onError, intervalMs = 30000 }) {
  let running = true
  let timeoutId = null

  async function tick() {
    if (!running) return

    try {
      const devices = await getDevices()
      if (running) onData(devices)
    } catch (err) {
      if (running && onError) onError(err)
    }

    if (running) {
      timeoutId = setTimeout(tick, intervalMs)
    }
  }

  // Premier appel immédiat
  tick()

  return function stop() {
    running = false
    if (timeoutId) clearTimeout(timeoutId)
  }
}

// ── Cook states (traduction FR) ─────────────────────────

export const COOK_STATES = {
  'Not Started': { label: 'Pas commencé', color: '#71717a', icon: '⏸' },
  'Configured': { label: 'Configuré', color: '#3b82f6', icon: '⚙️' },
  'Started': { label: 'En cuisson', color: '#ff6b1a', icon: '🔥' },
  'Ready For Resting': { label: 'Repos recommandé', color: '#eab308', icon: '⏰' },
  'Resting': { label: 'Au repos', color: '#22c55e', icon: '😴' },
  'Slightly Underdone': { label: 'Légèrement en dessous', color: '#f59e0b', icon: '🔽' },
  'Finished': { label: 'Terminé !', color: '#22c55e', icon: '✅' },
  'Slightly Overdone': { label: 'Légèrement au dessus', color: '#f97316', icon: '🔼' },
  'OVERCOOK!': { label: 'Sur-cuit !', color: '#dc2626', icon: '🚨' },
}

export function getCookState(state) {
  return COOK_STATES[state] || { label: state || 'Inconnu', color: '#71717a', icon: '❓' }
}
