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

const AuthContext = createContext({})
// PATCH: hook export conservé ici pour ne pas casser tout le projet pendant la migration Supabase-first.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [roles,   setRoles]   = useState([])
  const [loading, setLoading] = useState(true)
  const profileRef = useRef(null)
  const rolesRef = useRef([])

  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  useEffect(() => {
    rolesRef.current = roles
  }, [roles])

  const loadProfile = useCallback(async (authUser) => {
    const userId = authUser?.id
    if (!userId) { setProfile(null); setRoles([]); return }
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

      if (!nextProfile) {
        const previousProfile = profileRef.current
        if (previousProfile?.id === userId) {
          setProfile(previousProfile)
          setRoles(rolesRef.current || (previousProfile.role ? [previousProfile.role] : []))
          return
        }

        nextProfile = {
          id: userId,
          email: authUser.email || null,
          first_name: authUser.user_metadata?.first_name || '',
          last_name: authUser.user_metadata?.last_name || '',
          role: null,
          roles: [],
          status: 'active',
          account_status: 'active',
          plan_code: 'free',
          source: 'missing-profile',
        }
      }

      setProfile(nextProfile)
      setRoles(nextProfile.roles || (nextProfile.role ? [nextProfile.role] : []))

      if (nextProfile.source !== 'fallback') {
        await touchProfileLastSeen(userId)
      }
    } catch (e) {
      console.error('loadProfile error', e)
      const previousProfile = profileRef.current
      if (previousProfile?.id === userId) {
        setProfile(previousProfile)
        setRoles(rolesRef.current || (previousProfile.role ? [previousProfile.role] : []))
        return
      }
      setProfile(null)
      setRoles([])
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const safetyTimer = setTimeout(() => {
      if (isMounted) setLoading(false)
    }, 4000)

    // Session initiale
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return
        setUser(session?.user ?? null)
        return loadProfile(session?.user ?? null)
      })
      .catch((error) => {
        console.error('getSession error', error)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    // Écouter les changements auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return
        setUser(session?.user ?? null)
        try {
          await loadProfile(session?.user ?? null)
        } finally {
          if (isMounted) setLoading(false)
        }
      }
    )
    return () => {
      isMounted = false
      clearTimeout(safetyTimer)
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
    setProfile(null)
    setRoles([])
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
      user, profile, roles, loading,
      isAdmin, isEditor, isSupport, isPro,
      signOut, updateProfile, reloadProfile: (nextUser = user) => loadProfile(nextUser),
    }}>
      {children}
    </AuthContext.Provider>
  )
}
