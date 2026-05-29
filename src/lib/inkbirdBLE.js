// Stub web — BLE non disponible sur Next.js
export const startInkbirdScan = () => () => {}
export const connectInkbird = async () => null
export const disconnectInkbird = async () => {}
export const isProbeConnected = false
export const disconnect = async () => {}
export const scanForProbes = async () => []
export const connectToProbe = async () => null
export const startTemperatureStream = () => () => {}
export default { startInkbirdScan, connectInkbird, disconnectInkbird, isProbeConnected, disconnect, scanForProbes, connectToProbe, startTemperatureStream }
