import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zkjfuzclkrwyustgsezd.supabase.co'
const supabaseKey = 'sb_publishable_wRxwUgOzktFOOXSr5Wr13g_EjCWqF2h'

// PATCH: client Supabase explicitement configuré pour fiabiliser la persistance
// de session sur les navigateurs qui restaurent mal l'état auth.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'cf-supabase-auth',
  },
})
