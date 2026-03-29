/**
 * AuthContext — Charbon & Flamme
 * Phase 1 : profil complet + rôles + last_seen
 */

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase, supabaseProjectUrl, supabaseStorageKey } from '../modules/supabase/client'
import {
  fetchMyProfileRpc,
  fetchProfileByUserId,
  ensureProfileForAuthUser,
  touchProfileLastSeen,
  updateProfileByUserId,
} from '../modules/auth/repository'
import { isAdminRole, isEditorRole } from '../modules/auth/profileAccess'
import { PROFILE_STATUS, SESSION_STATUS, isProfilePending } from '../modules/auth/state'

const AuthContext = createContext({})
// PATCH: hook export conservé ici pour ne pas casser tout le projet pendant la migration Supabase-first.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [roles,   setRoles]   = useState([])
  const [sessionStatus, setSessionStatus] = useState(SESSION_STATUS.LOADING)
  const [profileStatus, setProfileStatus] = useState(PROFILE_STATUS.IDLE)
  const [profileError, setProfileError] = useState(null)
  const loadProfileSeqRef = useRef(0)
  const lastStableProfileRef = useRef(null)

  function clearResolvedProfile() {
    setProfile(null)
    setRoles([])
    setProfileStatus(PROFILE_STATUS.IDLE)
    setProfileError(null)
    lastStableProfileRef.current = null
  }

  function setResolvedProfile(nextProfile, nextStatus = PROFILE_STATUS.LOADED) {
    const nextRoles = nextProfile?.roles || (nextProfile?.role ? [nextProfile.role] : [])
    setProfile(nextProfile)
    setRoles(nextRoles)
    setProfileStatus(nextStatus)
    setProfileError(null)
    if (nextProfile?.id && nextProfile?.role) {
      lastStableProfileRef.current = {
        ...nextProfile,
        roles: nextRoles,
      }
    }
    return nextProfile
  }

  function getLastStableProfile(userId) {
    const stableProfile = lastStableProfileRef.current
    if (stableProfile?.id === userId) return stableProfile
    return null
  }

  const loadProfile = useCallback(async (authUser) => {
    const currentSeq = ++loadProfileSeqRef.current
    const userId = authUser?.id
    if (!userId) {
      clearResolvedProfile()
      return null
    }

    setProfileStatus(PROFILE_STATUS.LOADING)
    setProfileError(null)

    try {
      let nextProfile = null
      try {
        const directProfile = await fetchProfileByUserId(userId)
        if (directProfile) {
          nextProfile = {
            ...directProfile,
            roles: directProfile.role ? [directProfile.role] : [],
            source: 'profiles',
          }
        }
      } catch (directProfileError) {
        console.warn('profiles direct select failed', directProfileError)
      }

      // PATCH: on garde le RPC en secours seulement, pour les cas où RLS ou schéma
      // existant renvoient mieux via la fonction security definer.
      if (!nextProfile) {
        try {
          const rpcProfile = await fetchMyProfileRpc()
          if (rpcProfile && !rpcProfile.error) {
            nextProfile = {
              ...rpcProfile,
              roles: rpcProfile.roles || (rpcProfile.role ? [rpcProfile.role] : []),
              source: 'rpc',
            }
          }
        } catch (rpcError) {
          console.warn('get_my_profile rpc failed', rpcError)
        }
      }

      // PATCH: base saine après reset.
      // Si auth.users existe mais que public.profiles manque, on répare la ligne self.
      if (!nextProfile) {
        try {
          const bootstrappedProfile = await ensureProfileForAuthUser(authUser)
          if (bootstrappedProfile) {
            nextProfile = {
              ...bootstrappedProfile,
              roles: bootstrappedProfile.role ? [bootstrappedProfile.role] : [],
              source: 'bootstrap',
            }
          }
        } catch (bootstrapError) {
          console.warn('profile bootstrap failed', bootstrapError)
        }
      }

      if (currentSeq !== loadProfileSeqRef.current) return

      if (nextProfile) {
        const resolvedProfile = setResolvedProfile(nextProfile, PROFILE_STATUS.LOADED)
        await touchProfileLastSeen(userId)
        return resolvedProfile
      }

      const stableProfile = getLastStableProfile(userId)
      if (stableProfile) {
        setProfile(stableProfile)
        setRoles(stableProfile.roles || (stableProfile.role ? [stableProfile.role] : []))
        setProfileStatus(PROFILE_STATUS.ERROR)
        setProfileError(new Error('Le profil n’a pas pu être relu depuis Supabase. Le dernier rôle valide est conservé.'))
        return stableProfile
      }

      setProfile(null)
      setRoles([])
      setProfileStatus(PROFILE_STATUS.MISSING)
      setProfileError(null)
      return null
    } catch (e) {
      console.error('loadProfile error', e)
      if (currentSeq !== loadProfileSeqRef.current) return

      const stableProfile = getLastStableProfile(userId)
      if (stableProfile) {
        setProfile(stableProfile)
        setRoles(stableProfile.roles || (stableProfile.role ? [stableProfile.role] : []))
        setProfileStatus(PROFILE_STATUS.ERROR)
        setProfileError(e)
        return stableProfile
      }

      setProfile(null)
      setRoles([])
      setProfileStatus(PROFILE_STATUS.ERROR)
      setProfileError(e)
      return null
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    // Session initiale
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return
        const nextUser = session?.user ?? null
        setUser(nextUser)
        setSessionStatus(nextUser ? SESSION_STATUS.AUTHENTICATED : SESSION_STATUS.UNAUTHENTICATED)
        if (!nextUser) {
          clearResolvedProfile()
          return null
        }
        return loadProfile(nextUser)
      })
      .catch((error) => {
        console.error('getSession error', error)
        if (!isMounted) return
        setUser(null)
        setSessionStatus(SESSION_STATUS.UNAUTHENTICATED)
        clearResolvedProfile()
      })

    // Écouter les changements auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return
        const nextUser = session?.user ?? null
        setUser(nextUser)
        setSessionStatus(nextUser ? SESSION_STATUS.AUTHENTICATED : SESSION_STATUS.UNAUTHENTICATED)
        if (!nextUser) {
          clearResolvedProfile()
          return
        }
        await loadProfile(nextUser)
      }
    )
    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  // Helpers rôles
  const roleSet = new Set([
    ...(Array.isArray(roles) ? roles : []),
    ...(profile?.role ? [profile.role] : []),
  ])

  const isAdmin   = isAdminRole(profile, [...roleSet])
  const isEditor  = isEditorRole(profile, [...roleSet])
  const isSupport = roleSet.has('support') || roleSet.has('super_admin') || roleSet.has('admin')
  const isPro     = profile?.plan_code !== 'free'
  const role = profile?.role || null
  const loading =
    sessionStatus === SESSION_STATUS.LOADING ||
    (sessionStatus === SESSION_STATUS.AUTHENTICATED && isProfilePending(profileStatus))

  async function signOut() {
    // PATCH: déconnexion locale forcée pour éviter les sessions qui restent accrochées dans le navigateur.
    try {
      await Promise.race([
        supabase.auth.signOut({ scope: 'local' }),
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ])
    } catch (error) {
      console.warn('signOut fallback:', error)
    }

    try {
      const legacyProjectKey = `sb-${new URL(supabaseProjectUrl).hostname.split('.')[0]}-auth-token`
      const knownKeys = [
        legacyProjectKey,
        'cf-supabase-auth',
        supabaseStorageKey,
      ]
      knownKeys.forEach((key) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
    } catch (error) {
      console.warn('local auth storage cleanup failed:', error)
    }

    setUser(null)
    setSessionStatus(SESSION_STATUS.UNAUTHENTICATED)
    clearResolvedProfile()
  }

  async function updateProfile(updates) {
    if (!user) return { data: null, error: new Error('Aucun utilisateur connecté') }
    try {
      const data = await updateProfileByUserId(user.id, updates)
      if (data) {
        setProfile(prev => ({ ...prev, ...data }))
        await loadProfile(user)
      }
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  return (
    <AuthContext.Provider value={{
      user, profile, roles, role, loading,
      sessionStatus, profileStatus, profileError,
      isAdmin, isEditor, isSupport, isPro,
      signOut, updateProfile, reloadProfile: (nextUser = user) => loadProfile(nextUser),
    }}>
      {children}
    </AuthContext.Provider>
  )
}
