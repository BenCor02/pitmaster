/**
 * CHARBON & FLAMME — Inkbird iBBQ BLE (Bluetooth Low Energy)
 *
 * Connexion directe aux thermomètres Inkbird iBBQ via Bluetooth.
 * Supporte les modèles : IBT-4XS, IBT-2X, IBBQ-4BW, IBT-26S, etc.
 *
 * Protocole BLE iBBQ (reverse-engineered) :
 * - Service: 0xFFF0
 * - Credentials → FFF2 : envoyer le login bytes
 * - Realtime data enable → FFF5 : activer le stream
 * - Temperature notifications → FFF4 : 2 bytes par sonde (little-endian, °C × 10)
 * - Battery → FFF1 : subscribe pour le niveau de batterie
 *
 * Sources :
 * - github.com/sworisbreathing/go-ibbq
 * - github.com/cookejames/uibbq
 * - gist.github.com/uucidl/b9c60b6d36d8080d085a8e3310621d64
 */

import { BleClient } from '@capacitor-community/bluetooth-le'
import { isNative } from './capacitor.js'

const IBBQ_SERVICE = '0000fff0-0000-1000-8000-00805f9b34fb'
const IBBQ_CREDENTIALS_CHAR = '0000fff2-0000-1000-8000-00805f9b34fb'
const IBBQ_REALTIME_CHAR = '0000fff4-0000-1000-8000-00805f9b34fb'
const IBBQ_SETTINGS_CHAR = '0000fff5-0000-1000-8000-00805f9b34fb'

// Séquence de login obligatoire (credentials message)
const CREDENTIALS_MSG = new Uint8Array([
  0x21, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01,
  0xb8, 0x22, 0x00, 0x00, 0x00, 0x00, 0x00
])

// Activer le stream temps réel
const REALTIME_ENABLE_MSG = new Uint8Array([0x0b, 0x01, 0x00, 0x00, 0x00, 0x00])

// Configurer les unités en Celsius
const UNITS_CELSIUS_MSG = new Uint8Array([0x02, 0x00, 0x00, 0x00, 0x00, 0x00])

let _connectedDevice = null
let _disconnectCallback = null

/**
 * Vérifie si le BLE est dispo (natif uniquement)
 */
export function isBLEAvailable() {
  return isNative
}

/**
 * Scanne les thermomètres Inkbird iBBQ à proximité.
 * Les Inkbird s'annoncent avec le service 0xFFF0.
 */
export async function scanForProbes(timeoutMs = 8000) {
  if (!isNative) throw new Error('BLE disponible uniquement sur Android')

  await BleClient.initialize()

  const devices = []

  await BleClient.requestLEScan(
    { services: [IBBQ_SERVICE] },
    (result) => {
      if (result.device && !devices.find(d => d.deviceId === result.device.deviceId)) {
        devices.push({
          deviceId: result.device.deviceId,
          name: result.device.name || 'Inkbird iBBQ',
          rssi: result.rssi,
        })
      }
    }
  )

  await new Promise(resolve => setTimeout(resolve, timeoutMs))
  await BleClient.stopLEScan()

  return devices
}

/**
 * Se connecte à un thermomètre Inkbird et initialise le protocole.
 * L'ordre est strict : connect → login → set units → enable realtime
 */
export async function connectToProbe(deviceId) {
  if (!isNative) throw new Error('BLE disponible uniquement sur Android')

  await BleClient.initialize()
  await BleClient.connect(deviceId, () => {
    _connectedDevice = null
    if (_disconnectCallback) _disconnectCallback({ connected: false, deviceId })
  })

  _connectedDevice = deviceId

  // 1. Envoyer les credentials (obligatoire, sinon le device ignore tout)
  await BleClient.write(deviceId, IBBQ_SERVICE, IBBQ_CREDENTIALS_CHAR, CREDENTIALS_MSG)

  // Petit délai pour que le device accepte
  await new Promise(r => setTimeout(r, 500))

  // 2. Configurer en Celsius
  await BleClient.write(deviceId, IBBQ_SERVICE, IBBQ_SETTINGS_CHAR, UNITS_CELSIUS_MSG)

  await new Promise(r => setTimeout(r, 200))

  // 3. Activer le stream temps réel
  await BleClient.write(deviceId, IBBQ_SERVICE, IBBQ_SETTINGS_CHAR, REALTIME_ENABLE_MSG)

  return { connected: true, deviceId }
}

/**
 * Démarre le streaming de température.
 * Les données arrivent via notifications sur FFF4.
 * Format : 2 bytes par sonde, little-endian, valeur = temp°C × 10
 * Exemple : 4 sondes = 8 bytes
 */
export async function startTemperatureStream(onData) {
  if (!_connectedDevice) throw new Error('Aucun thermomètre connecté')

  _disconnectCallback = onData

  await BleClient.startNotifications(
    _connectedDevice,
    IBBQ_SERVICE,
    IBBQ_REALTIME_CHAR,
    (value) => {
      const data = new DataView(value.buffer)
      const probes = []

      // Chaque sonde = 2 bytes (little-endian), temp en °C × 10
      const numProbes = Math.floor(data.byteLength / 2)
      for (let i = 0; i < numProbes; i++) {
        const raw = data.getInt16(i * 2, true) // signed little-endian
        const tempC = raw / 10

        // Valeurs < -200 ou > 400 = sonde non branchée
        if (tempC > -200 && tempC < 400) {
          probes.push({
            index: i,
            temp: Math.round(tempC * 10) / 10,
          })
        }
      }

      // Utiliser la première sonde comme "interne" et la deuxième comme "ambiante"
      const tipTemp = probes[0]?.temp ?? 0
      const ambientTemp = probes[1]?.temp ?? null

      onData({
        connected: true,
        tipTemp,
        ambientTemp,
        probes, // toutes les sondes pour affichage détaillé
        timestamp: Date.now(),
      })
    }
  )
}

/**
 * Déconnecte le thermomètre.
 */
export async function disconnect() {
  if (_connectedDevice) {
    try {
      await BleClient.stopNotifications(_connectedDevice, IBBQ_SERVICE, IBBQ_REALTIME_CHAR)
      await BleClient.disconnect(_connectedDevice)
    } catch {}
    _connectedDevice = null
  }
  _disconnectCallback = null
}

/**
 * Retourne true si un thermomètre est connecté.
 */
export function isProbeConnected() {
  return !!_connectedDevice
}
