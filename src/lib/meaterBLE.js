// Stub web — BLE non disponible sur Next.js
export const startMeaterScan = () => () => {}
export const connectMeater = async () => null
export const disconnectMeater = async () => {}
export const isProbeConnected = false
export const disconnect = async () => {}
export const scanForProbes = async () => []
export const connectToProbe = async () => null
export const startTemperatureStream = () => () => {}
export default { startMeaterScan, connectMeater, disconnectMeater, isProbeConnected, disconnect, scanForProbes, connectToProbe, startTemperatureStream }
