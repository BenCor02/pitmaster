/**
 * CHARBON & FLAMME — Meater BLE (Bluetooth Low Energy)
 *
 * Connexion directe aux sondes Meater via Bluetooth,
 * sans passer par le cloud. Fonctionne uniquement en mode natif (Capacitor).
 *
 * Protocole BLE Meater :
 * - Service UUID: a75cc7fc-c956-488f-ac2a-2dbc08b63a04
 * - Characteristic (temp): 7edda774-045e-4bbf-909b-45d1991571f8
 *   → 8 bytes : [tipRaw (2)] [ambientRaw (2)] [reserved (4)]
 *   → tipTemp°C  = tipRaw / 32 + 8
 *   → ambientTemp°C = ambientRaw / 32 + 8 + tipTemp
 *
 * Sources : reverse-engineering communautaire (GitHub, Home Assistant)
 */

import { BleClient } from '@capacitor-community/bluetooth-le'
import { isNative } from './capacitor.js'

const MEATER_SERVICE = 'a75cc7fc-c956-488f-ac2a-2dbc08b63a04'
const MEATER_TEMP_CHAR = '7edda774-045e-4bbf-909b-45d1991571f8'

// Noms connus des sondes Meater en BLE advertising
const MEATER_NAME_PREFIXES = ['MEATER', 'Meater']

let _connectedDevice = null
let _notifyCallback = null

/**
 * Vérifie si le BLE est dispo (natif uniquement)
 */
export function isBLEAvailable() {
  return isNative
}

/**
 * Scanne les sondes Meater à proximité.
 * Retourne un tableau de { deviceId, name, rssi }
 */
export async function scanForProbes(timeoutMs = 8000) {
  if (!isNative) throw new Error('BLE disponible uniquement sur Android')

  await BleClient.initialize()

  const devices = []

  await BleClient.requestLEScan(
    { services: [MEATER_SERVICE] },
    (result) => {
      if (result.device && !devices.find(d => d.deviceId === result.device.deviceId)) {
        devices.push({
          deviceId: result.device.deviceId,
          name: result.device.name || 'Sonde Meater',
          rssi: result.rssi,
        })
      }
    }
  )

  // Attendre le timeout puis arrêter le scan
  await new Promise(resolve => setTimeout(resolve, timeoutMs))
  await BleClient.stopLEScan()

  return devices
}

/**
 * Se connecte à une sonde Meater par son deviceId.
 */
export async function connectToProbe(deviceId) {
  if (!isNative) throw new Error('BLE disponible uniquement sur Android')

  await BleClient.initialize()
  await BleClient.connect(deviceId, () => {
    // Callback de déconnexion
    _connectedDevice = null
    if (_notifyCallback) {
      _notifyCallback({ connected: false, deviceId })
    }
  })

  _connectedDevice = deviceId
  return { connected: true, deviceId }
}

/**
 * Démarre le streaming de température en temps réel.
 * Appelle onData({ tipTemp, ambientTemp }) à chaque notification BLE.
 */
export async function startTemperatureStream(onData) {
  if (!_connectedDevice) throw new Error('Aucune sonde connectée')

  _notifyCallback = onData

  await BleClient.startNotifications(
    _connectedDevice,
    MEATER_SERVICE,
    MEATER_TEMP_CHAR,
    (value) => {
      const data = new DataView(value.buffer)
      const tipRaw = data.getUint16(0, true)      // little-endian
      const ambientRaw = data.getUint16(2, true)

      const tipTemp = tipRaw / 32 + 8
      const ambientTemp = ambientRaw / 32 + 8 + tipTemp

      onData({
        connected: true,
        tipTemp: Math.round(tipTemp * 10) / 10,
        ambientTemp: Math.round(ambientTemp * 10) / 10,
        timestamp: Date.now(),
      })
    }
  )
}

/**
 * Arrête le streaming et déconnecte la sonde.
 */
export async function disconnect() {
  if (_connectedDevice) {
    try {
      await BleClient.stopNotifications(_connectedDevice, MEATER_SERVICE, MEATER_TEMP_CHAR)
      await BleClient.disconnect(_connectedDevice)
    } catch {}
    _connectedDevice = null
  }
  _notifyCallback = null
}

/**
 * Retourne true si une sonde est connectée.
 */
export function isProbeConnected() {
  return !!_connectedDevice
}
