import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import { useSiteSettings } from '../hooks/useSiteSettings.jsx'
import { LogoIcon, LogoFull } from './Logo.jsx'

/* ── Icon components ── */
function IconCalculator({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#ff6b1a' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M7 7h10" /><path d="M7 12h3" /><path d="M14 12h3" />
      <path d="M7 17h3" /><path d="M14 17h3" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function Layout({ children }) {
  const { isAuthenticated, isAdmin, signOut, profile } = useAuth()
  const { isModuleEnabled } = useSiteSettings()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path) => location.pathname === path
  const userName = profile?.display_name || profile?.email || 'Utilisateur'
  const userInitial = userName[0].toUpperCase()
  const userRole = profile?.role === 'admin' || profile?.role === 'super_admin' ? 'Pit Master' : 'Membre'

  const SMOKER_LABELS = { offset: 'Offset', wsm: 'WSM', kamado: 'Kamado', kettle: 'Kettle', pellet: 'Pellet', electric: 'Électrique', gas: 'Gaz', other: 'Autre' }
  const LEVEL_LABELS = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé', pitmaster: 'Pitmaster' }
  const smokerLabel = profile?.smoker_type ? SMOKER_LABELS[profile.smoker_type] : null
  const levelLabel = profile?.experience_level ? LEVEL_LABELS[profile.experience_level] : null

  return (
    <div className="min-h-screen flex bg-[#080808]">

      {/* ══════════ SIDEBAR DESKTOP ══════════ */}
      <aside aria-label="Navigation principale" className="hidden lg:flex flex-col w-[280px] shrink-0 bg-[#0c0c0c] border-r border-white/[0.04] relative overflow-hidden sticky top-0 h-screen overflow-y-auto texture-grain z-40">
        {/* Ambient glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#ff6b1a]/[0.02] rounded-full blur-[100px] pointer-events-none animate-fire-breathe" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#dc2626]/[0.015] rounded-full blur-[60px] pointer-events-none" />

        {/* ── Brand header ── */}
        <div className="relative z-10 px-5 pt-7 pb-4">
          <Link to="/" className="group">
            <LogoFull iconSize={30} className="group-hover:opacity-90 transition-opacity" />
          </Link>
        </div>

        {/* ── Fire separator ── */}
        <div className="mx-5 fire-divider" />

        {/* ── Status card ── */}
        <div className="relative z-10 mx-4 mt-4 mb-2 rounded-xl overflow-hidden bg-gradient-to-br from-[#ff6b1a]/[0.08] to-[#dc2626]/[0.04] border border-[#ff6b1a]/[0.10] p-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#ff6b1a] to-[#dc2626] flex items-center justify-center shadow-lg shadow-[#ff6b1a]/20 shrink-0">
              <span className="text-base">🔥</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#ff8c4a]">Prêt à fumer</p>
              <p className="text-[9px] text-stone-500">Calculateur actif</p>
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="relative z-10 flex-1 px-3 mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-600 px-3 mb-2">Outils</p>

          <NavItem
            to="/"
            icon={<IconCalculator active={isActive('/')} />}
            label="Calculateur"
            sublabel="BBQ & Fumage"
            active={isActive('/')}
          />
          <NavItem
            to="/portions"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive('/portions') ? '#ff6b1a' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
            label="Quantités"
            sublabel="Kg par personne"
            active={isActive('/portions')}
          />
          <NavItem
            to="/multi"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive('/multi') ? '#ff6b1a' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="9" y1="4" x2="9" y2="22" /></svg>}
            label="Multi-cuisson"
            sublabel="Tout prêt en même temps"
            active={isActive('/multi')}
          />

          {isModuleEnabled('recipes') && (
            <NavItem
              to="/recettes"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={location.pathname.startsWith('/recettes') ? '#ff6b1a' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M8 12l2 2 4-4" /></svg>}
              label="Recettes"
              sublabel="Rubs, Mops & Marinades"
              active={location.pathname.startsWith('/recettes')}
            />
          )}
          {isModuleEnabled('comparator') && (
            <NavItem
              to="/comparateur"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive('/comparateur') ? '#ff6b1a' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
              label="Comparateur"
              sublabel="Côte à côte"
              active={isActive('/comparateur')}
            />
          )}
          {isModuleEnabled('wood_guide') && (
            <NavItem
              to="/bois"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive('/bois') ? '#ff6b1a' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>}
              label="Essences de bois"
              sublabel="Guide du fumage"
              active={isActive('/bois')}
            />
          )}

          <NavItem
            to="/bbq"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive('/bbq') ? '#ff6b1a' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><path d="M8 14h8" /><circle cx="12" cy="18" r="1" /></svg>}
            label="Types de BBQ"
            sublabel="Comparatif fumoirs"
            active={isActive('/bbq')}
          />

          <NavItem
            to="/live"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive('/live') ? '#ff6b1a' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"><path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><circle cx="12" cy="12" r="4" /></svg>}
            label="Live Cook"
            sublabel="Sonde Meater"
            active={isActive('/live')}
          />

          {/* Mon espace */}
          {isAuthenticated && (isModuleEnabled('favorites') || isModuleEnabled('journal')) && (
            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-600 px-3 mb-2">Mon espace</p>
              {isModuleEnabled('favorites') && (
                <NavItem
                  to="/carnet"
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill={isActive('/carnet') ? '#ff6b1a' : 'none'} stroke={isActive('/carnet') ? '#ff6b1a' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>}
                  label="Mon Carnet"
                  sublabel="Recettes favorites"
                  active={isActive('/carnet')}
                />
              )}
              {isModuleEnabled('journal') && (
                <NavItem
                  to="/journal"
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={location.pathname === '/journal' ? '#ff6b1a' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></svg>}
                  label="Mon journal"
                  sublabel="Sessions de cuisson"
                  active={location.pathname === '/journal'}
                />
              )}
            </div>
          )}

          {/* Guides */}
          {isModuleEnabled('guides') && (
            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-600 px-3 mb-2">Contenu</p>
              <NavItem
                to="/guides"
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive('/guides') ? '#ff6b1a' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                label="Guides"
                sublabel="BBQ & Techniques"
                active={location.pathname.startsWith('/guides')}
              />
            </div>
          )}

          {/* Admin */}
          {isAdmin && (
            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-600 px-3 mb-2">Admin</p>
              <NavItem
                to="/admin"
                icon={<IconSettings />}
                label="Atelier"
                sublabel="CMS & Profils"
                active={isActive('/admin')}
              />
            </div>
          )}
        </nav>

        {/* ── Fire separator ── */}
        <div className="mx-5 fire-divider" />

        {/* ── User section ── */}
        <div className="relative z-10 p-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff6b1a] to-[#dc2626] flex items-center justify-center text-[13px] font-bold text-white shadow-lg shadow-[#ff6b1a]/20 shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-zinc-200 truncate">{userName}</p>
                <p className="text-[10px] text-zinc-600 font-medium">{userRole}</p>
                {(smokerLabel || levelLabel) && (
                  <div className="flex items-center gap-1.5 mt-1">
                    {smokerLabel && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#ff6b1a]/10 text-[#ff6b1a] font-medium">{smokerLabel}</span>}
                    {levelLabel && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-700/50 text-zinc-400 font-medium">{levelLabel}</span>}
                  </div>
                )}
              </div>
              <button
                onClick={signOut}
                className="text-zinc-600 hover:text-zinc-400 transition-colors p-1.5 rounded-lg hover:bg-white/[0.04]"
                title="Déconnexion"
                aria-label="Se déconnecter"
              >
                <IconLogout />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-zinc-800/60 border border-white/[0.06] flex items-center justify-center">
                <IconUser />
              </div>
              <div>
                <span className="text-[13px] font-medium">Se connecter</span>
                <p className="text-[10px] text-zinc-600">Sauvegarder ses cuissons</p>
              </div>
            </Link>
          )}
        </div>
      </aside>

      {/* ══════════ MOBILE HEADER ══════════ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/">
            <LogoFull iconSize={22} />
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-zinc-400 p-2 -mr-2 hover:text-white transition-colors"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <nav aria-label="Navigation mobile" className="animate-fade border-t border-white/[0.05] px-4 py-3 space-y-1 bg-[#0e0e0e]">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                isActive('/') ? 'text-white bg-white/[0.06] font-medium' : 'text-zinc-400'
              }`}
            >
              <IconCalculator active={isActive('/')} />
              Calculateur
            </Link>
            <Link
              to="/portions"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                isActive('/portions') ? 'text-white bg-white/[0.06] font-medium' : 'text-zinc-400'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              Quantités
            </Link>
            <Link
              to="/multi"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                isActive('/multi') ? 'text-white bg-white/[0.06] font-medium' : 'text-zinc-400'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="9" y1="4" x2="9" y2="22" /></svg>
              Multi-cuisson
            </Link>
            {isModuleEnabled('recipes') && (
              <Link
                to="/recettes"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                  location.pathname.startsWith('/recettes') ? 'text-white bg-white/[0.06] font-medium' : 'text-zinc-400'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M8 12l2 2 4-4" /></svg>
                Recettes
              </Link>
            )}
            {isModuleEnabled('comparator') && (
              <Link
                to="/comparateur"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                  isActive('/comparateur') ? 'text-white bg-white/[0.06] font-medium' : 'text-zinc-400'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                Comparateur
              </Link>
            )}
            {isModuleEnabled('wood_guide') && (
              <Link
                to="/bois"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                  isActive('/bois') ? 'text-white bg-white/[0.06] font-medium' : 'text-zinc-400'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                Essences de bois
              </Link>
            )}
            <Link
              to="/bbq"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                isActive('/bbq') ? 'text-white bg-white/[0.06] font-medium' : 'text-zinc-400'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><path d="M8 14h8" /><circle cx="12" cy="18" r="1" /></svg>
              Types de BBQ
            </Link>
            <Link
              to="/live"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                isActive('/live') ? 'text-white bg-white/[0.06] font-medium' : 'text-zinc-400'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><circle cx="12" cy="12" r="4" /></svg>
              Live Cook
            </Link>
            {isAuthenticated && isModuleEnabled('favorites') && (
              <Link
                to="/carnet"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                  isActive('/carnet') ? 'text-white bg-white/[0.06] font-medium' : 'text-zinc-400'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                Mon Carnet
              </Link>
            )}
            {isModuleEnabled('guides') && (
              <Link
                to="/guides"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                  location.pathname.startsWith('/guides') ? 'text-white bg-white/[0.06] font-medium' : 'text-zinc-400'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Guides
              </Link>
            )}
            {isModuleEnabled('journal') && (
              <Link
                to="/journal"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                  isActive('/journal') ? 'text-white bg-white/[0.06] font-medium' : 'text-zinc-400'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></svg>
                Mon journal
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                  isActive('/admin') ? 'text-white bg-white/[0.06] font-medium' : 'text-zinc-400'
                }`}
              >
                <IconSettings />
                Admin
              </Link>
            )}
            <div className="h-px bg-white/[0.06] my-2" />
            {isAuthenticated ? (
              <button
                onClick={() => { signOut(); setMobileOpen(false) }}
                className="flex items-center gap-3 px-3 py-2.5 text-[14px] text-zinc-500 w-full"
              >
                <IconLogout />
                Déconnexion
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-[14px] text-zinc-400"
              >
                <IconUser />
                Se connecter
              </Link>
            )}
          </nav>
        )}
      </div>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0 smoke-bg texture-grain">
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}

/* ── Nav item component ── */
function NavItem({ to, icon, label, sublabel, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
        active
          ? 'bg-gradient-to-r from-[#ff6b1a]/[0.10] to-[#dc2626]/[0.05] text-white border border-[#ff6b1a]/[0.15]'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
      }`}
    >
      <span className={`transition-colors ${active ? 'text-[#ff6b1a]' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <span className={`text-[13px] ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
        {sublabel && (
          <p className={`text-[10px] ${active ? 'text-[#ff6b1a]/60' : 'text-zinc-600'}`}>{sublabel}</p>
        )}
      </div>
      {active && <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-[#ff6b1a] to-[#dc2626] shadow-lg shadow-[#ff6b1a]/30" />}
    </Link>
  )
}
