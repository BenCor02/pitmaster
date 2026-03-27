/**
 * AuthContext — Charbon & Flamme
 * Phase 1 : profil complet + rôles + last_seen
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

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

      const { data } = await supabase.rpc('get_my_profile')
      if (data && !data.error) {
        nextProfile = data
      }

      // PATCH: fallback robuste pour les comptes existants avant la migration profiles/roles
      if (!nextProfile) {
        const { data: directProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (directProfile) {
          nextProfile = {
            ...directProfile,
            roles: directProfile.role ? [directProfile.role] : [],
          }
        }
      }

      // PATCH: si le profil n'existe pas encore, on le crée côté app pour éviter un admin noir sur les anciens comptes
      if (!nextProfile) {
        const fallbackProfile = {
          id: userId,
          email: authUser.email || null,
          first_name: authUser.user_metadata?.first_name || '',
          last_name: authUser.user_metadata?.last_name || '',
          role: 'member',
          roles: ['member'],
          status: 'active',
          account_status: 'active',
          plan_code: 'free',
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { data: insertedProfile } = await supabase
          .from('profiles')
          .upsert({
            id: fallbackProfile.id,
            email: fallbackProfile.email,
            first_name: fallbackProfile.first_name,
            last_name: fallbackProfile.last_name,
            role: fallbackProfile.role,
            status: fallbackProfile.status,
            account_status: fallbackProfile.account_status,
            plan_code: fallbackProfile.plan_code,
            last_seen_at: fallbackProfile.last_seen_at,
          })
          .select()
          .single()

        if (insertedProfile) {
          nextProfile = {
            ...insertedProfile,
            roles: insertedProfile.role ? [insertedProfile.role] : ['member'],
          }
        } else {
          nextProfile = fallbackProfile
        }
      }

      setProfile(nextProfile)
      setRoles(nextProfile.roles || (nextProfile.role ? [nextProfile.role] : []))

      await supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', userId)
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
  const isAdmin   = roles.includes('super_admin') || roles.includes('admin')
  const isEditor  = roles.includes('editor') || roles.includes('super_admin') || roles.includes('admin')
  const isSupport = roles.includes('support') || roles.includes('super_admin') || roles.includes('admin')
  const isPro     = profile?.plan_code !== 'free'

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setRoles([])
  }

  async function updateProfile(updates) {
    if (!user) return
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()
    if (!error && data) setProfile(prev => ({ ...prev, ...data }))
    return { data, error }
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
