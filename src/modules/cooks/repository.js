import { supabase } from '../supabase/client'

export async function saveCookSession(payload) {
  const { data, error } = await supabase.from('sessions').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function fetchUserCookSessions(userId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function deleteCookSessionById(id) {
  const { error } = await supabase.from('sessions').delete().eq('id', id)
  if (error) throw error
}

export async function deleteAllCookSessionsForUser(userId) {
  const { error } = await supabase.from('sessions').delete().eq('user_id', userId)
  if (error) throw error
}

export async function fetchUserJournalEntries(userId) {
  const { data, error } = await supabase
    .from('cook_journal')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function saveJournalEntry(payload) {
  const { data, error } = await supabase
    .from('cook_journal')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteJournalEntryById(id) {
  const { error } = await supabase.from('cook_journal').delete().eq('id', id)
  if (error) throw error
}

export async function saveCookParty(payload) {
  const { data, error } = await supabase.from('cook_parties').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function fetchActiveCookSession(userId) {
  const { data, error } = await supabase
    .from('active_cook_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createActiveCookSession(payload) {
  const { data, error } = await supabase
    .from('active_cook_sessions')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateActiveCookSession(id, payload) {
  const { data, error } = await supabase
    .from('active_cook_sessions')
    .update(payload)
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

export async function fetchCookDashboardMetrics() {
  const [sessionUsersRes, sessionsRes, journalRes, partiesRes, uniqueUsersRes, recentSessionsRes, allSessionsRes] = await Promise.all([
    supabase.from('sessions').select('user_id', { count: 'exact', head: true }),
    supabase.from('sessions').select('*', { count: 'exact', head: true }),
    supabase.from('cook_journal').select('*', { count: 'exact', head: true }),
    supabase.from('cook_parties').select('*', { count: 'exact', head: true }),
    supabase.from('sessions').select('user_id'),
    supabase.from('sessions').select('*').order('created_at', { ascending: false }).limit(8),
    supabase.from('sessions').select('meat_name, meat_key'),
  ])

  if (sessionUsersRes.error) throw sessionUsersRes.error
  if (sessionsRes.error) throw sessionsRes.error
  if (journalRes.error) throw journalRes.error
  if (partiesRes.error) throw partiesRes.error
  if (uniqueUsersRes.error) throw uniqueUsersRes.error
  if (recentSessionsRes.error) throw recentSessionsRes.error
  if (allSessionsRes.error) throw allSessionsRes.error

  const uniqueUsers = new Set((uniqueUsersRes.data || []).map((entry) => entry.user_id)).size
  const allSessions = allSessionsRes.data || []
  const meatCounts = {}

  allSessions.forEach((session) => {
    const key = session.meat_name || session.meat_key || 'Inconnu'
    meatCounts[key] = (meatCounts[key] || 0) + 1
  })

  const totalSessions = allSessions.length || 1
  const meatStats = Object.entries(meatCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / totalSessions) * 100),
    }))

  return {
    stats: {
      users: uniqueUsers,
      sessions: sessionsRes.count || 0,
      journal: journalRes.count || 0,
      parties: partiesRes.count || 0,
    },
    recentSessions: recentSessionsRes.data || [],
    meatStats,
  }
}
