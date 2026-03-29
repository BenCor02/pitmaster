import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)

  // Écouter les changements de session Supabase
  useEffect(() => {
    // Récupérer la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Écouter les changements
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (!session) setProfile(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Charger le profil depuis Supabase quand la session change
  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null)
      return
    }

    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('Erreur chargement profil:', error)
        setProfile(null)
      } else {
        setProfile(data)
      }
    }

    loadProfile()
  }, [session?.user?.id])

  const signIn = async (email, password) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && data?.user?.id) {
      // Charger le profil immédiatement pour éviter la race condition
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      if (p) setProfile(p)
    }
    return { error }
  }

  const signUp = async (email, password, displayName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const isLoading = session === undefined
  const isAuthenticated = !!session
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isLoading,
        isAuthenticated,
        isAdmin,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}
