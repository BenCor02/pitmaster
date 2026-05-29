// Stub web — Fireboard non disponible sur Next.js
export const isConnected = false
export const connectFireboard = async () => null
export const disconnectFireboard = async () => {}
export const subscribeFireboard = () => () => {}
export const getLatestTemps = async () => []
export const logout = async () => {}
export const login = async () => null
export const startPolling = async () => {}
export const isProbeConnected = false
export const disconnect = async () => {}
export default { isConnected, connectFireboard, disconnectFireboard, subscribeFireboard, getLatestTemps, logout, login, startPolling, isProbeConnected, disconnect }
