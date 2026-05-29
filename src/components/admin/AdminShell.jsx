'use client'

/**
 * AdminShell — Layout CMS style WordPress
 * Sidebar fixe gauche + header top + zone de contenu principale
 */

import { useState } from 'react'
import Link from 'next/link'

const NAV = [
  { id: 'overview', label: 'Tableau de bord', icon: '📊' },
  { id: 'stats',    label: 'Statistiques',    icon: '📈' },
  { type: 'section', label: 'CONTENU' },
  { id: 'articles', label: 'Articles (Studio)', icon: '📰', href: 'https://studio.charbonetflamme.fr' },
  { id: 'guides',   label: 'Guides',          icon: '📚' },
  { id: 'recipes',  label: 'Recettes',        icon: '🧂' },
  { id: 'seo',      label: 'Blocs SEO',       icon: '🔍' },
  { id: 'faq',      label: 'FAQ',             icon: '❓' },
  { id: 'affiliate',label: 'Affiliation',     icon: '🛠️' },
  { type: 'section', label: 'CALCULATEUR' },
  { id: 'profiles', label: 'Profils cuisson', icon: '🔥' },
  { id: 'bbq',      label: 'Types BBQ',       icon: '🏭' },
  { id: 'woods',    label: 'Essences de bois',icon: '🪵' },
  { type: 'section', label: 'SITE' },
  { id: 'settings', label: 'Réglages',        icon: '⚙️' },
]

const COUNT_KEYS = ['articles', 'guides', 'recipes', 'seo', 'faq', 'affiliate', 'profiles', 'bbq', 'woods']

export default function AdminShell({ activeTab, onTabChange, profile, signOut, counts = {}, children }) {
  const currentNav = NAV.find(n => n.id === activeTab)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0c0c0c', color: '#e4e4e7' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 228,
        background: '#111113',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        flexShrink: 0,
        zIndex: 20,
      }}>

        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg, #ff6b1a 0%, #c93322 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 2px 8px rgba(255,107,26,0.3)',
            }}>🔥</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '0.05em', lineHeight: 1 }}>CHARBON</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#ff6b1a', letterSpacing: '0.25em', lineHeight: 1.6 }}>& FLAMME</div>
            </div>
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 10, color: '#3f3f46', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
              Atelier CMS
            </div>
            <div style={{ fontSize: 11, color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.display_name || profile?.email || 'Admin'}
            </div>
            <div style={{ fontSize: 10, color: '#52525b', marginTop: 1 }}>
              {profile?.role || 'admin'}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '10px 8px' }}>
          {NAV.map((item, i) => {
            if (item.type === 'section') {
              return (
                <div key={i} style={{
                  fontSize: 9, fontWeight: 700, color: '#3f3f46',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '16px 10px 5px',
                }}>
                  {item.label}
                </div>
              )
            }

            const active = activeTab === item.id
            const count  = COUNT_KEYS.includes(item.id) ? counts[item.id] : undefined

            if (item.href) {
              return (
                <a key={item.id} href={item.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <NavItem icon={item.icon} label={item.label} active={false} count={count} onClick={() => {}} />
                </a>
              )
            }

            return (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={active}
                count={count}
                onClick={() => onTabChange(item.id)}
              />
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Link
            href="/"
            style={{ fontSize: 11, color: '#52525b', textDecoration: 'none' }}
          >
            ← Voir le site
          </Link>
          <button
            onClick={signOut}
            style={{ fontSize: 11, color: '#52525b', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          padding: '0 28px',
          height: 50,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#111113',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15 }}>{currentNav?.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7' }}>
              {currentNav?.label || 'Admin'}
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#3f3f46' }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

/* ── NavItem ── */
function NavItem({ icon, label, active, count, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '7px 10px',
        borderRadius: 6,
        background: active ? 'rgba(255,107,26,0.13)' : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
        transition: 'background 0.12s',
        marginBottom: 1,
      }}
    >
      <span style={{ fontSize: 14, flexShrink: 0, opacity: active ? 1 : 0.7 }}>{icon}</span>
      <span style={{
        fontSize: 13, flex: 1,
        color: active ? '#ff8c4a' : hovered ? '#d4d4d8' : '#a1a1aa',
        fontWeight: active ? 600 : 400,
        transition: 'color 0.12s',
      }}>
        {label}
      </span>
      {count !== undefined && (
        <span style={{
          fontSize: 10, fontWeight: 600,
          color: active ? '#ff8c4a' : '#52525b',
          background: active ? 'rgba(255,107,26,0.15)' : 'rgba(255,255,255,0.04)',
          padding: '1px 7px', borderRadius: 10,
          minWidth: 22, textAlign: 'center',
        }}>
          {count ?? 0}
        </span>
      )}
    </button>
  )
}
