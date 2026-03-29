import { createClient } from '@supabase/supabase-js'

// Source de vérité runtime: projet Supabase actuel fourni par l'équipe.
// On évite les bascules involontaires vers d'anciennes clés locales.
const SUPABASE_URL = 'https://stsvkjveuhfvsfxjowcu.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_CZrjgKG6Vlo3mSj5HH9_iw_dUiCu85g'

const supabaseUrl = SUPABASE_URL.trim()
const supabaseKey = SUPABASE_PUBLISHABLE_KEY.trim()

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase config manquante: vérifier SUPABASE_URL et SUPABASE_PUBLISHABLE_KEY dans src/modules/supabase/client.js'
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
