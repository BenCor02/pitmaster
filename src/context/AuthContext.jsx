/**
 * AuthContext — Charbon & Flamme
 * Phase 1 : profil complet + rôles + last_seen
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [roles,   setRoles]   = useState([])
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); setRoles([]); return }
    try {
      const { data } = await supabase.rpc('get_my_profile')
      if (data && !data.error) {
        setProfile(data)
        setRoles(data.roles || [])
        // Mettre à jour last_seen
        await supabase
          .from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', userId)
      }
    } catch (e) {
      console.error('loadProfile error', e)
    }
  }, [])

  useEffect(() => {
    // Session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      loadProfile(session?.user?.id).finally(() => setLoading(false))
    })

    // Écouter les changements auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        await loadProfile(session?.user?.id)
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [loadProfile])

  // Helpers rôles
  const isAdmin   = roles.includes('admin')
  const isEditor  = roles.includes('editor') || roles.includes('admin')
  const isSupport = roles.includes('support') || roles.includes('admin')
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
      signOut, updateProfile, reloadProfile: () => loadProfile(user?.id),
    }}>
      {children}
    </AuthContext.Provider>
  )
}