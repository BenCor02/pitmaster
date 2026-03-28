import { supabase, supabaseProjectUrl } from '../supabase/client'

const configuredAppUrl = import.meta.env.VITE_APP_URL || 'https://www.charbonetflamme.fr'
const appOrigin = configuredAppUrl.replace(/\/+$/, '')

export const authRedirectUrl = `${appOrigin}/app`
export const resetPasswordRedirectUrl = `${appOrigin}/reset-password`

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: authRedirectUrl },
  })
}

export async function signInWithApple() {
  return supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: authRedirectUrl },
  })
}

export async function signInWithPassword(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithPassword(email, password) {
  return supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: authRedirectUrl },
  })
}

export async function requestPasswordReset(email) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetPasswordRedirectUrl,
  })
}

export async function updatePassword(password) {
  return supabase.auth.updateUser({ password })
}

export async function getCurrentSession() {
  return supabase.auth.getSession()
}

export function onAuthStateChange(handler) {
  return supabase.auth.onAuthStateChange(handler)
}

export async function fetchAuthDebugSnapshot(userId) {
  if (!userId) {
    return {
      projectUrl: supabaseProjectUrl,
      sessionEmail: null,
      sessionUserId: null,
      profileQuery: null,
      rpcQuery: null,
      localStorage: {},
    }
  }

  const [profileRes, rpcRes, sessionRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId),
    supabase.rpc('get_my_profile'),
    supabase.auth.getSession(),
  ])

  let storageSnapshot = {}
  try {
    storageSnapshot = Object.fromEntries(
      Object.keys(localStorage)
        .filter((key) => key.includes('supabase') || key.includes('sb-') || key.includes('cf-supabase-auth'))
        .map((key) => [key, localStorage.getItem(key)])
    )
  } catch (error) {
    storageSnapshot = { error: error.message }
  }

  return {
    projectUrl: supabaseProjectUrl,
    sessionEmail: sessionRes.data?.session?.user?.email || null,
    sessionUserId: sessionRes.data?.session?.user?.id || null,
    localStorage: storageSnapshot,
    profileQuery: {
      data: profileRes.data || null,
      error: profileRes.error || null,
    },
    rpcQuery: {
      data: rpcRes.data || null,
      error: rpcRes.error || null,
    },
  }
}
