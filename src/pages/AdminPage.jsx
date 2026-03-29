import { useAuth } from '../modules/auth/AuthContext.jsx'

export default function AdminPage() {
  const { profile, signOut } = useAuth()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Admin</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Connecté en tant que {profile?.display_name || profile?.email} ({profile?.role})
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <p className="text-zinc-300 text-sm">
          Le panel admin sera construit en Phase 3. Pour l'instant, vous avez accès
          à la gestion des viandes et paramètres directement via le SQL Editor de Supabase.
        </p>

        <div className="text-sm text-zinc-500 space-y-1">
          <p>À venir :</p>
          <p>— Gestion des viandes et méthodes</p>
          <p>— Paramètres de l'algorithme</p>
          <p>— Contenus SEO</p>
          <p>— Produits affiliation</p>
        </div>
      </div>

      <button
        onClick={signOut}
        className="mt-6 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        Se déconnecter
      </button>
    </div>
  )
}
