import { supabase } from '../supabase/client'

export async function fetchProfileByUserId(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function fetchMyProfileRpc() {
  const { data, error } = await supabase.rpc('get_my_profile')
  if (error) throw error
  return data
}

export async function touchProfileLastSeen(userId) {
  if (!userId) return
  await supabase
    .from('profiles')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', userId)
}

export async function updateProfileByUserId(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
