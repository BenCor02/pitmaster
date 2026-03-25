import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zkjfuzclkrwyustgsezd.supabase.co'
const supabaseKey = 'sb_publishable_wRxwUgOzktFOOXSr5Wr13g_EjCWqF2h'

export const supabase = createClient(supabaseUrl, supabaseKey)
