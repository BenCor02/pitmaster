import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import FlameIcon from './FlameIcon.jsx'
import EmberParticles from './EmberParticles.jsx'

export default function Layout({ children }) {
  const { isAuthenticated, isAdmin, signOut, profile } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Calculateur', icon: '🔥', description: 'Planifier une cuisson' },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: '⚙️', description: 'Gérer le site' }] : []),
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen flex relative">
      {/* ── Sidebar Desktop ── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm relative overflow-hidden">
        {/* Glow en bas de la sidebar */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-orange-950/10 to-transparent pointer-events-none" />
        <EmberParticles count={5} />

        {/* Logo */}
        <div className="p-6 border-b border-zinc-800/50">
          <Link to="/" className="flex items-center gap-3 group">
            <FlameIcon size={36} />
            <div>
              <h1 className="text-lg font-bold brand-gradient">Charbon & Flamme</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Calculateur BBQ</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-brand-600/10 border border-brand-600/20 text-brand-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-[11px] text-zinc-500">{item.description}</p>
              </div>
            </Link>
          ))}
        </nav>

        {/* Bloc ambiance bas de sidebar */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <p className="text-xs text-zinc-500 italic leading-relaxed">
            "Le secret d'un bon BBQ, c'est la patience et un bon thermomètre."
          </p>
          <p className="text-[10px] text-zinc-600 mt-1">— Pitmaster proverb</p>
        </div>

        {/* User */}
        <div className="p-4 border-t border-zinc-800/50">
          {isAuthenticated ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center text-xs text-brand-400 shrink-0">
                  {(profile?.display_name || profile?.email || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-300 truncate">
                    {profile?.display_name || profile?.email}
                  </p>
                  <p className="text-[10px] text-zinc-600">{profile?.role}</p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="text-zinc-500 hover:text-zinc-300 transition-colors text-xs"
                title="Déconnexion"
              >
                ↗
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-brand-400 transition-colors"
            >
              <span>🔐</span>
              <span>Connexion</span>
            </Link>
          )}
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <FlameIcon size={28} />
            <span className="text-sm font-bold brand-gradient">Charbon & Flamme</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-zinc-400 hover:text-zinc-200"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {sidebarOpen && (
          <div className="animate-fade-in border-t border-zinc-800/50 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'bg-brand-600/10 text-brand-400'
                    : 'text-zinc-400'
                }`}
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                onClick={() => { signOut(); setSidebarOpen(false) }}
                className="w-full text-left flex items-center gap-3 px-4 py-3 text-zinc-500 text-sm"
              >
                <span>↗</span>
                <span>Déconnexion</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-zinc-400 text-sm"
              >
                <span>🔐</span>
                <span>Connexion</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-orange-900/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-red-900/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Grill texture overlay */}
        <div className="absolute inset-0 grill-texture pointer-events-none" />

        <div className="relative z-10 lg:pt-0 pt-16">
          {children}
        </div>
      </main>
    </div>
  )
}
