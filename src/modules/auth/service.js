import { supabase } from '../supabase/client'

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
