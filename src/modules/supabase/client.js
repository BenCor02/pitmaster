import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://stsvkjveuhfvsfxjowcu.supabase.co'
const supabaseKey = 'sb_publishable_CZrjgKG6Vlo3mSj5HH9_iw_dUiCu85g'

// PATCH: single canonical Supabase client for the rebuilt architecture.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'cf-supabase-auth',
  },
})

export const supabaseProjectUrl = supabaseUrl
