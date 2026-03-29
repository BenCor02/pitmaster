import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim()

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase config manquante: définir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY (ou VITE_SUPABASE_PUBLISHABLE_KEY) dans .env.local'
  )
}

const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
const authStorageKey = `cf-supabase-auth-${projectRef}`

// PATCH: single canonical Supabase client for the rebuilt architecture.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Session persistence handled by Supabase Auth only.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: authStorageKey,
  },
})

export const supabaseProjectUrl = supabaseUrl
