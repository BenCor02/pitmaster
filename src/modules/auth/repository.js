import { supabase } from '../supabase/client'

const SAFE_PROFILE_FIELDS = new Set([
  'first_name',
  'last_name',
  'smoker_type',
  'experience_level',
  'bbq_frequency',
  'favorite_meats',
  'marketing_opt_in',
  'source_channel',
  'avatar_url',
])

function pickSafeProfileUpdates(updates = {}) {
  return Object.fromEntries(
    Object.entries(updates).filter(([key]) => SAFE_PROFILE_FIELDS.has(key))
  )
}

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

export async function ensureProfileForAuthUser(authUser) {
  const userId = authUser?.id
  if (!userId) return null

  const existingProfile = await fetchProfileByUserId(userId)
  if (existingProfile) return existingProfile

  const payload = {
    id: userId,
    email: authUser.email || null,
    first_name: authUser.user_metadata?.first_name || '',
    last_name: authUser.user_metadata?.last_name || '',
    role: 'member',
    status: 'active',
    account_status: 'active',
    plan_code: 'free',
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert(payload)
    .select('*')
    .single()

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
  if (!userId) throw new Error('Missing user id')

  const safeUpdates = pickSafeProfileUpdates(updates)
  const updatedAt = new Date().toISOString()

  const existingProfile = await fetchProfileByUserId(userId)

  if (existingProfile) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...safeUpdates, updated_at: updatedAt })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError

  const authUser = authData?.user
  if (!authUser || authUser.id !== userId) {
    throw new Error('Impossible de reconstruire le profil pour cet utilisateur')
  }

  const payload = {
    id: userId,
    email: authUser.email || null,
    first_name: authUser.user_metadata?.first_name || '',
    last_name: authUser.user_metadata?.last_name || '',
    role: 'member',
    status: 'active',
    account_status: 'active',
    plan_code: 'free',
    updated_at: updatedAt,
    ...safeUpdates,
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw error
  return data
}
