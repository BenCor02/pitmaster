/**
 * Vercel Serverless Function — Suppression de compte
 *
 * Supprime le profil utilisateur + le compte auth Supabase.
 * Nécessite SUPABASE_SERVICE_ROLE_KEY en variable d'env Vercel.
 */

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  // Vérifier le token d'authentification
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  const token = authHeader.replace('Bearer ', '')

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[delete-account] SUPABASE_SERVICE_ROLE_KEY manquant')
    return res.status(500).json({ error: 'Configuration serveur incomplète' })
  }

  // Client avec le token de l'utilisateur pour vérifier son identité
  const supabaseUser = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token)

  if (authError || !user) {
    return res.status(401).json({ error: 'Token invalide' })
  }

  // Client admin pour supprimer le compte
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    // 1. Supprimer le profil (les données utilisateur)
    await supabaseAdmin.from('profiles').delete().eq('id', user.id)

    // 2. Supprimer les favoris
    await supabaseAdmin.from('favorites').delete().eq('user_id', user.id)

    // 3. Supprimer les cook_logs
    await supabaseAdmin.from('cook_logs').delete().eq('user_id', user.id)

    // 4. Supprimer le compte auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteError) throw deleteError

    console.log(`[delete-account] Compte supprimé: ${user.id}`)
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[delete-account] Erreur:', err)
    return res.status(500).json({ error: 'Erreur lors de la suppression du compte' })
  }
}
