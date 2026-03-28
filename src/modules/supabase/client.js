import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://stsvkjveuhfvsfxjowcu.supabase.co'
const supabaseKey = 'sb_publishable_CZrjgKG6Vlo3mSj5HH9_iw_dUiCu85g'
const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
export const supabaseStorageKey = `cf-supabase-auth-${projectRef}`

// PATCH: single canonical Supabase client for the rebuilt architecture.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: supabaseStorageKey,
  },
})

export const supabaseProjectUrl = supabaseUrl
