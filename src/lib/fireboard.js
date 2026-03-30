/**
 * CHARBON & FLAMME — Service FireBoard Cloud API
 *
 * Connexion aux sondes FireBoard via leur API REST.
 * Auth par Token, polling toutes les 30s, températures en °C.
 *
 * API docs : https://docs.fireboard.io/reference/restapi.html
 */

const BASE_URL = 'https://fireboard.io/api/v1'
const AUTH_URL = 'https://fireboard.io/api/rest-auth/login/'

// ── Auth ────────────────────────────────────────────────

let _token = null

export function getToken() {
  if (_token) return _token
  try {
    _token = sessionStorage.getItem('fireboard_token') || null
  } catch {}
  return _token
}

export function isConnected() {
  return !!getToken()
}

export async function login(username, password) {
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'CharbonFlamme/2.0',
    },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Erreur ${res.status} — identifiants FireBoard invalides`)
  }

  const json = await res.json()
  if (!json.key) {
    throw new Error('Pas de token dans la réponse FireBoard')
  }

  _token = json.key
  try { sessionStorage.setItem('fireboard_token', _token) } catch {}

  return { token: _token }
}

export function logout() {
  _token = null
  try { sessionStorage.removeItem('fireboard_token') } catch {}
}

// ── Headers ─────────────────────────────────────────────

function authHeaders() {
  const token = getToken()
  if (!token) throw new Error('Non connecté à FireBoard')
  return {
    'Authorization': `Token ${token}`,
    'User-Agent': 'CharbonFlamme/2.0',
  }
}

// ── Devices ─────────────────────────────────────────────

/**
 * Récupère tous les FireBoards du compte.
 * Retourne un tableau de devices avec channels et températures.
 */
export async function getDevices() {
  const res = await fetch(`${BASE_URL}/devices.json`, {
    headers: authHeaders(),
  })

  if (res.status === 401) {
    logout()
    throw new Error('Session FireBoard expirée')
  }

  if (!res.ok) throw new Error(`Erreur API FireBoard: ${res.status}`)

  return await res.json()
}

/**
 * Récupère les températures actuelles d'un device.
 * Retourne les channels avec temp actuelle (< 1 min).
 */
export async function getDeviceTemps(uuid) {
  const res = await fetch(`${BASE_URL}/devices/${uuid}/temps.json`, {
    headers: authHeaders(),
  })

  if (res.status === 401) {
    logout()
    throw new Error('Session FireBoard expirée')
  }

  if (!res.ok) throw new Error(`Erreur API FireBoard: ${res.status}`)

  return await res.json()
}

// ── Normalisation → format unifié ───────────────────────

/**
 * Convertit les données FireBoard au format unifié LiveCook.
 * Un device FireBoard peut avoir plusieurs channels (sondes).
 *
 * Format unifié :
 * {
 *   id: string,
 *   provider: 'fireboard',
 *   name: string,
 *   temperature: { internal: number (°C), ambient: number (°C) },
 *   cook: { state, time: { elapsed, remaining } } | null,
 *   updated_at: number
 * }
 */
export function normalizeDevices(fbDevices) {
  const normalized = []

  for (const device of fbDevices) {
    if (!device.latest_temps || device.latest_temps.length === 0) continue

    // Channel 1 = interne (sonde à viande), Channel 2+ = ambiante
    const channels = device.latest_temps.sort((a, b) => a.channel - b.channel)
    const internalChannel = channels[0]
    const ambientChannel = channels.length > 1 ? channels[1] : null

    // FireBoard retourne en °F ou °C selon le degreetype
    const toC = (temp, degreeType) => {
      if (degreeType === 2 || degreeType === 'F') return (temp - 32) * 5 / 9
      return temp // déjà en °C
    }

    const internal = toC(internalChannel.temp, internalChannel.degreetype)
    const ambient = ambientChannel ? toC(ambientChannel.temp, ambientChannel.degreetype) : 0

    // Determine cook state from active session
    let cook = null
    if (device.active_session) {
      cook = {
        id: device.active_session.id,
        name: device.active_session.title || device.title || 'Session FireBoard',
        state: 'Started',
        temperature: { target: null, peak: internal },
        time: {
          elapsed: device.active_session.duration || null,
          remaining: null,
        },
      }
    }

    normalized.push({
      id: device.uuid || device.id?.toString() || `fb-${device.hardware_id}`,
      provider: 'fireboard',
      name: device.title || `FireBoard ${device.hardware_id || ''}`,
      temperature: { internal, ambient },
      cook,
      updated_at: Date.now(),
      channels: channels.map(ch => ({
        channel: ch.channel,
        temp: toC(ch.temp, ch.degreetype),
        label: ch.channel === 1 ? 'Interne' : ch.channel === 2 ? 'Ambiante' : `Sonde ${ch.channel}`,
      })),
    })
  }

  return normalized
}

// ── Polling ─────────────────────────────────────────────

export function startPolling({ onData, onError, intervalMs = 30000 }) {
  let running = true
  let timeoutId = null

  async function tick() {
    if (!running) return

    try {
      const rawDevices = await getDevices()
      const devices = normalizeDevices(rawDevices)
      if (running) onData(devices)
    } catch (err) {
      if (running && onError) onError(err)
    }

    if (running) {
      timeoutId = setTimeout(tick, intervalMs)
    }
  }

  tick()

  return function stop() {
    running = false
    if (timeoutId) clearTimeout(timeoutId)
  }
}
