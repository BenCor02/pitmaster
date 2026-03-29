import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://stsvkjveuhfvsfxjowcu.supabase.co'
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_CZrjgKG6Vlo3mSj5HH9_iw_dUiCu85g'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY
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
