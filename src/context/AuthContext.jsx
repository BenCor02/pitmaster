/**
 * AuthContext — Charbon & Flamme
 * Phase 1 : profil complet + rôles + last_seen
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, supabaseProjectUrl } from '../modules/supabase/client'
import {
  fetchMyProfileRpc,
  fetchProfileByUserId,
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

      // PATCH: surtout ne plus écrire un fallback member en base.
      // On préfère un profil mémoire temporaire plutôt que d'écraser un rôle admin.
      if (!nextProfile) {
        nextProfile = {
          id: userId,
          email: authUser.email || null,
          first_name: authUser.user_metadata?.first_name || '',
          last_name: authUser.user_metadata?.last_name || '',
          role: 'member',
          roles: ['member'],
          status: 'active',
          account_status: 'active',
          plan_code: 'free',
          source: 'fallback',
        }
      }

      if (!nextProfile) {
        setProfile(null)
        setRoles([])
        return
      }

      setProfile(nextProfile)
      setRoles(nextProfile.roles || (nextProfile.role ? [nextProfile.role] : []))

      if (nextProfile.source !== 'fallback') {
        await touchProfileLastSeen(userId)
      }
    } catch (e) {
      console.error('loadProfile error', e)
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
      const storageKey = `sb-${new URL(supabaseProjectUrl).hostname.split('.')[0]}-auth-token`
      localStorage.removeItem(storageKey)
      sessionStorage.removeItem(storageKey)
    } catch (error) {
      console.warn('local auth storage cleanup failed:', error)
    }

    setUser(null)
    setProfile(null)
    setRoles([])
  }

  async function updateProfile(updates) {
    if (!user) return
    try {
      const data = await updateProfileByUserId(user.id, updates)
      if (data) setProfile(prev => ({ ...prev, ...data }))
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  return (
    <AuthContext.Provider value={{
      user, profile, roles, loading,
      isAdmin, isEditor, isSupport, isPro,
      signOut, updateProfile, reloadProfile: () => loadProfile(user),
    }}>
      {children}
    </AuthContext.Provider>
  )
}
