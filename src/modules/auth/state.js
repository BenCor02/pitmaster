export const SESSION_STATUS = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
}

export const PROFILE_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  LOADED: 'loaded',
  MISSING: 'missing',
  ERROR: 'error',
}

export function getRoleDisplayLabel(profileStatus, role) {
  if (profileStatus === PROFILE_STATUS.LOADED) return role || 'sans rôle'
  if (profileStatus === PROFILE_STATUS.MISSING) return 'profil manquant'
  if (profileStatus === PROFILE_STATUS.ERROR) return 'lecture en erreur'
  if (profileStatus === PROFILE_STATUS.LOADING || profileStatus === PROFILE_STATUS.IDLE) return 'chargement'
  return 'état inconnu'
}

export function isProfilePending(profileStatus) {
  return profileStatus === PROFILE_STATUS.IDLE || profileStatus === PROFILE_STATUS.LOADING
}

export function hasStableProfile(profileStatus) {
  return profileStatus === PROFILE_STATUS.LOADED || profileStatus === PROFILE_STATUS.MISSING || profileStatus === PROFILE_STATUS.ERROR
}
