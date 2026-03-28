import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zkjfuzclkrwyustgsezd.supabase.co'
const supabaseKey = 'sb_publishable_wRxwUgOzktFOOXSr5Wr13g_EjCWqF2h'

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
