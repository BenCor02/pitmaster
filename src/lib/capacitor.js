/**
 * Capacitor bridge — stub pour Next.js (web only)
 * Sur le web, tout retourne false / 'web'.
 */

export const isNative = false
export const platform = 'web'
export const isAvailable = () => false

export function requestPermission() { return Promise.resolve({ receive: 'denied' }) }
export function registerPushToken() { return Promise.resolve() }
export function onPushNotification() { return () => {} }
export function scheduleLocalNotification() { return Promise.resolve() }
export function cancelAllLocalNotifications() { return Promise.resolve() }
export function getNetworkStatus() { return Promise.resolve({ connected: true }) }
export function onNetworkChange() { return () => {} }
