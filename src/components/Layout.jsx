import { Link } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthContext.jsx'

export default function Layout({ children }) {
  const { isAuthenticated, isAdmin, signOut, profile } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800">
        <nav className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-brand-400 hover:text-brand-300 transition-colors">
            Charbon & Flamme
          </Link>

          <div className="flex items-center gap-4 text-sm">
            {isAdmin && (
              <Link to="/admin" className="text-zinc-400 hover:text-zinc-200 transition-colors">
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={signOut}
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {profile?.display_name || 'Déconnexion'}
              </button>
            ) : (
              <Link to="/login" className="text-zinc-400 hover:text-zinc-200 transition-colors">
                Connexion
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-600">
        Charbon & Flamme — Calculateur BBQ
      </footer>
    </div>
  )
}
