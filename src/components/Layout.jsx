import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import FlameIcon from './FlameIcon.jsx'
import EmberParticles from './EmberParticles.jsx'

const NAV_SECTIONS = [
  {
    label: 'CUISSON',
    items: [
      { path: '/', label: 'Calculateur', icon: '🔥', active: true },
    ],
  },
]

const ADMIN_SECTION = {
  label: null,
  items: [
    { path: '/admin', label: 'Atelier admin', icon: '🔧' },
  ],
}

export default function Layout({ children }) {
  const { isAuthenticated, isAdmin, signOut, profile } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen flex">
      {/* ── SIDEBAR DESKTOP ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-zinc-800/40 bg-zinc-950 relative overflow-hidden">
        <EmberParticles count={4} />

        {/* Brand */}
        <div className="px-5 pt-6 pb-5">
          <Link to="/" className="flex items-center gap-3">
            <FlameIcon size={32} />
            <div>
              <h1 className="font-display text-lg font-bold text-zinc-100 leading-tight">
                Charbon &<br />Flamme
              </h1>
              <p className="text-[9px] uppercase tracking-[0.15em] text-zinc-500 mt-0.5">
                Calculateur BBQ / Fumage
              </p>
            </div>
          </Link>
        </div>

        {/* Pitmaster brief */}
        <div className="mx-4 mb-4 px-4 py-3 rounded-xl bg-brand-500/8 border border-brand-500/10">
          <p className="text-[10px] uppercase tracking-wider text-brand-400/70 font-semibold mb-1">Pitmaster brief</p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Heure de départ, fenêtre de service et repères terrain. Rien de plus.
          </p>
        </div>

        {/* Navigation sections */}
        <nav className="flex-1 px-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold px-3 mb-2">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive(item.path)
                        ? 'bg-zinc-800/80 text-zinc-100 font-medium'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                    }`}
                  >
                    <span className="text-base w-6 text-center">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin */}
        {isAdmin && (
          <div className="px-3 mb-3">
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive('/admin')
                  ? 'bg-brand-600/15 text-brand-400 border border-brand-500/20'
                  : 'bg-zinc-900/40 text-brand-400/60 hover:text-brand-400 border border-zinc-800/40 hover:border-brand-500/20'
              }`}
            >
              <span className="text-base w-6 text-center">🔧</span>
              <span className="font-medium">Atelier admin</span>
            </Link>
          </div>
        )}

        {/* User profile */}
        <div className="px-4 py-4 border-t border-zinc-800/40">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-semibold shrink-0">
                {(profile?.display_name || profile?.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-200 truncate">
                  {profile?.display_name || profile?.email}
                </p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
                  {profile?.role === 'admin' || profile?.role === 'super_admin' ? 'Pit Master' : 'Membre'}
                </p>
              </div>
              <button
                onClick={signOut}
                className="text-zinc-600 hover:text-zinc-400 transition-colors p-1"
                title="Déconnexion"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-3 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs">
                🔐
              </div>
              <span>Connexion</span>
            </Link>
          )}
        </div>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/40">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <FlameIcon size={24} />
            <span className="font-display text-sm font-bold text-zinc-100">Charbon & Flamme</span>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-zinc-400 p-2">
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
        {mobileOpen && (
          <div className="animate-fade-in border-t border-zinc-800/40 px-4 py-3 space-y-1">
            <Link to="/" onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm ${isActive('/') ? 'text-zinc-100 bg-zinc-800/60' : 'text-zinc-500'}`}>
              🔥 Calculateur
            </Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm ${isActive('/admin') ? 'text-brand-400 bg-brand-500/10' : 'text-zinc-500'}`}>
                🔧 Admin
              </Link>
            )}
            {isAuthenticated ? (
              <button onClick={() => { signOut(); setMobileOpen(false) }}
                className="block w-full text-left px-3 py-2 text-sm text-zinc-600">
                Déconnexion
              </button>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-zinc-500">
                🔐 Connexion
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── MAIN ── */}
      <main className="flex-1 min-w-0 lg:pt-0 pt-14">
        {/* Top bar desktop */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-zinc-800/30">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link to="/" className="hover:text-zinc-300 transition-colors">Charbon & Flamme</Link>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-300">Calculateur</span>
          </div>
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <Link to="/login" className="px-5 py-2 text-sm font-medium text-brand-400 bg-brand-500/10 hover:bg-brand-500/15 border border-brand-500/20 rounded-full transition-all">
                Mon compte
              </Link>
            )}
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
