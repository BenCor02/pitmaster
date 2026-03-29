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

function getMissingColumn(error) {
  if (error?.code !== '42703') return null
  const raw = `${error?.message || ''} ${error?.details || ''}`.trim()
  const match = raw.match(/column "([^"]+)"/i)
  return match?.[1] || null
}

function withoutField(payload, field) {
  if (!field || !(field in payload)) return null
  const next = { ...payload }
  delete next[field]
  return next
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
    .upsert(payload, { onConflict: 'id', ignoreDuplicates: true })
    .select('*')
    .maybeSingle()

  if (error) throw error
  if (data) return data
  return fetchProfileByUserId(userId)
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
    let updatePayload = { ...safeUpdates, updated_at: updatedAt }

    let { data, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      const missingColumn = getMissingColumn(error)
      const fallbackPayload = withoutField(updatePayload, missingColumn)
      if (fallbackPayload) {
        updatePayload = fallbackPayload
        const retry = await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', userId)
          .select()
          .single()
        data = retry.data
        error = retry.error
      }
    }

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

  let insertPayload = payload
  let { data, error } = await supabase
    .from('profiles')
    .insert(insertPayload)
    .select()
    .single()

  if (error) {
    const missingColumn = getMissingColumn(error)
    const fallbackInsert = withoutField(insertPayload, missingColumn)
    if (fallbackInsert) {
      insertPayload = fallbackInsert
      const retryInsert = await supabase
        .from('profiles')
        .insert(insertPayload)
        .select()
        .single()
      data = retryInsert.data
      error = retryInsert.error
    }
  }

  if (error) {
    if (error.code === '23505') {
      // Row appeared concurrently; never overwrite role/plan with a fallback payload.
      const { data: retryData, error: retryError } = await supabase
        .from('profiles')
        .update({ ...safeUpdates, updated_at: updatedAt })
        .eq('id', userId)
        .select()
        .single()

      if (retryError) throw retryError
      return retryData
    }
    throw error
  }
  return data
}
