import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import BrandMark from './BrandMark'

const NAV = [
  { section: 'CUISSON', items: [
    // PATCH: vrais pictos lisibles au lieu d'abréviations techniques
    { path: '/app', icon: '🔥', label: 'Calculateur', end: true },
    { path: '/app/party', icon: '🍽️', label: 'Cook Party' },
    { path: '/app/cold', icon: '❄️', label: 'Fumage à froid' },
    { path: '/app/session', icon: '🎯', label: 'Session active' },
    { path: '/app/timer', icon: '⏱️', label: 'Minuteur' },
  ]},
  { section: 'OUTILS', items: [
    { path: '/app/quantity', icon: '⚖️', label: 'Quantités' },
    { path: '/app/journal', icon: '📓', label: 'Journal' },
    { path: '/app/history', icon: '🕘', label: 'Historique' },
    { path: '/app/ask', icon: '🤠', label: 'Conseil pitmaster' },
  ]},
]

const MOBILE_NAV = [
  { path: '/app', icon: '🔥', label: 'Cuisson', end: true },
  { path: '/app/party', icon: '🍽️', label: 'Party' },
  { path: '/app/journal', icon: '📓', label: 'Journal' },
  { path: '/app/cold', icon: '❄️', label: 'Froid' },
]

const HIDDEN_PAGE_LABELS = {
  '/app/profile': 'Mon profil',
  '/app/access': 'Accès atelier',
  '/app/billing': 'Accès atelier',
}

const css = `
  .pm-sb { display: flex; }
  .pm-main { margin-left: 264px; }
  .pm-tb { display: flex; }
  .pm-mb, .pm-bn { display: none; }
  .pm-pg { padding: 36px 44px; max-width: 980px; }

  @media(max-width:900px) {
    .pm-sb { display: none !important; }
    .pm-main { margin-left: 0 !important; }
    .pm-tb { display: none !important; }
    .pm-mb { display: flex !important; }
    .pm-bn { display: flex !important; }
    .pm-pg { padding: 20px 16px 88px !important; max-width: 100% !important; }
  }

  .nav-link { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 16px; margin-bottom: 5px; cursor: pointer; transition: all 0.18s; text-decoration: none; border:1px solid transparent; }
  .nav-link:hover { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.08); transform: translateX(2px); }
  .nav-link.active { background: linear-gradient(135deg, rgba(232,69,11,0.18), rgba(232,69,11,0.05)); border-color: var(--orange-border); box-shadow: inset 0 1px 0 rgba(255,255,255,0.04); }
  .nav-icon { width: 28px; height: 28px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--text3); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); flex-shrink: 0; }
  .nav-link.active .nav-icon { color: var(--ember); border-color: rgba(240,122,47,0.18); background: rgba(240,122,47,0.08); }

  .nav-label-active  { color: var(--text); font-weight: 700; font-family: 'DM Sans',sans-serif; font-size: 14px; }
  .nav-label-default { color: var(--text2); font-weight: 500; font-family: 'DM Sans',sans-serif; font-size: 14px; }

  @keyframes slideUp { from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1} }
`

export default function Layout() {
  const { user, signOut, isAdmin } = useAuth()
  const { get } = useSiteSettings()
  const siteName = get('site_name', 'Charbon & Flamme')
  const siteTagline = get('site_tagline', 'Planification BBQ')
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()
  // PATCH: mode invité assumé pour réduire la friction; l'auth reste optionnelle
  const username = user?.email?.split('@')[0] || 'Invité'
  const allItems = NAV.flatMap(s => s.items)
  const currentPage = allItems.find(i => i.end ? location.pathname === i.path : location.pathname.startsWith(i.path))
  const currentPageLabel = currentPage?.label || HIDDEN_PAGE_LABELS[location.pathname] || 'Atelier'

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)', fontFamily:"'DM Sans',sans-serif", position:'relative' }}>
      <style>{css}</style>
      {/* PATCH: fond atmosphérique global pour donner plus de profondeur à l’app */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', background:'radial-gradient(circle at top right, rgba(232,69,11,0.12), transparent 22%), radial-gradient(circle at 12% 18%, rgba(245,166,35,0.06), transparent 18%)' }} />

      {/* ═══ SIDEBAR ═══ */}
      <aside className="pm-sb" style={{
        width: 264, flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(18,18,18,0.98), rgba(10,10,10,1))',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        flexDirection: 'column',
        position: 'fixed', inset: '0 auto 0 0', zIndex: 40,
        boxShadow: '20px 0 40px rgba(0,0,0,0.28)',
      }}>
        {/* LOGO */}
        <div style={{ padding:'24px 18px 18px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <BrandMark size={42} />
              <div>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17, color:'var(--text)', letterSpacing:'-0.3px', lineHeight:1.1 }}>{siteName}</div>
                <div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, marginTop:3, letterSpacing:'1.2px', textTransform:'uppercase' }}>{siteTagline}</div>
              </div>
            </div>
          <div style={{ marginTop:14, padding:'10px 12px', borderRadius:16, background:'rgba(232,69,11,0.08)', border:'1px solid rgba(232,69,11,0.16)' }}>
            <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:4 }}>Pitmaster brief</div>
            <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>
              Heure de départ, fenêtre de service et repères terrain. Rien de plus.
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav style={{ flex:1, padding:'14px 10px', overflowY:'auto' }}>
          {NAV.map(({ section, items }) => (
            <div key={section} style={{ marginBottom:24 }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'1.5px', color:'var(--text3)', padding:'0 14px', marginBottom:6, textTransform:'uppercase' }}>
                {section}
              </div>
              {items.map(item => (
                <NavLink key={item.path} to={item.path} end={item.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  {({ isActive }) => (<>
                    <span className="nav-icon">{item.icon}</span>
                    <span className={isActive ? 'nav-label-active' : 'nav-label-default'}>{item.label}</span>
                  </>)}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* USER */}
        <div style={{ padding:'12px 10px 18px', borderTop:'1px solid var(--border)' }}>
          {isAdmin && (
            <NavLink to="/admin" style={{ textDecoration:'none', display:'block', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px', borderRadius:50, background:'var(--orange-bg)', border:'1px solid var(--orange-border)', cursor:'pointer', transition:'all 0.15s' }}>
                <span style={{ fontSize:14 }}>👑</span>
                <span style={{ fontSize:13, fontWeight:700, color:'var(--orange)', fontFamily:'Syne,sans-serif' }}>Atelier admin</span>
              </div>
            </NavLink>
          )}
          {/* PATCH: accès compte visible sans rendre l'auth obligatoire */}
          {!user && (
            <NavLink to="/auth" style={{ textDecoration:'none', display:'block', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'10px 14px', borderRadius:14, background:'linear-gradient(180deg,var(--surface3),var(--surface))', border:'1px solid var(--orange-border)', cursor:'pointer', transition:'all 0.15s' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:14 }}>🔐</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--orange)', fontFamily:'Syne,sans-serif' }}>Connexion</div>
                    <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>Sauvegarder et retrouver tes cuissons</div>
                  </div>
                </div>
                <span style={{ fontSize:12, color:'var(--orange)' }}>→</span>
              </div>
            </NavLink>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 4px' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--orange)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:13, color:'#fff', flexShrink:0 }}>
              {username[0]?.toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{username}</div>
              <div style={{ fontSize:10, color:'var(--text3)', marginTop:1, letterSpacing:'0.5px', textTransform:'uppercase' }}>
                {user ? 'Pit Master' : 'Mode libre'}
              </div>
            </div>
            {/* PATCH: la connexion reste optionnelle; on n'affiche plus une déconnexion vide en mode invité */}
            {user ? (
              <button onClick={signOut}
                style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:16, padding:'6px', lineHeight:1, borderRadius:'50%', transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'center' }}
                title="Déconnexion"
                onMouseEnter={e => { e.currentTarget.style.background='var(--surface2)'; e.currentTarget.style.color='var(--text)' }}
                onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--text3)' }}>
                ⏏
              </button>
            ) : null}
          </div>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div className="pm-main" style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

        {/* DESKTOP TOPBAR */}
        <header className="pm-tb" style={{
          height:60, background:'rgba(14,14,14,0.82)', backdropFilter:'blur(20px)',
          borderBottom:'1px solid var(--border)',
          alignItems:'center', justifyContent:'space-between',
          padding:'0 44px', position:'sticky', top:0, zIndex:30, gap:16,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'var(--text3)' }}>{siteName}</span>
            <span style={{ color:'var(--border2)', fontSize:16 }}>/</span>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text2)' }}>{currentPageLabel}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:50, padding:'9px 18px', display:'flex', alignItems:'center', gap:8, color:'var(--text3)', fontSize:13, minWidth:180 }}>
              <span>🔍</span><span>Rechercher...</span>
            </div>
            {/* PATCH: bouton connexion/compte visible dans le header desktop */}
            {user ? (
              <NavLink to="/app/profile" style={{ textDecoration:'none' }}>
                <div style={{ padding:'9px 16px', borderRadius:50, border:'1px solid var(--orange-border)', background:'var(--orange-bg)', color:'var(--orange)', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700 }}>
                  Mon compte
                </div>
              </NavLink>
            ) : (
              <NavLink to="/auth" style={{ textDecoration:'none' }}>
                <div style={{ padding:'9px 16px', borderRadius:50, border:'1px solid var(--orange-border)', background:'rgba(255,255,255,0.03)', color:'var(--orange)', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700 }}>
                  Se connecter
                </div>
              </NavLink>
            )}
          </div>
        </header>

        {/* MOBILE TOPBAR */}
        <header className="pm-mb" style={{
          height:58, background:'rgba(14,14,14,0.88)', backdropFilter:'blur(20px)',
          borderBottom:'1px solid var(--border)',
          alignItems:'center', justifyContent:'space-between',
          padding:'0 16px', position:'sticky', top:0, zIndex:30,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <BrandMark size={34} compact />
            <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17, color:'var(--text)' }}>{siteName}</span>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {isAdmin && <NavLink to="/admin"><button style={mBtn}>👑</button></NavLink>}
            {/* PATCH: accès compte explicite et visible sur mobile */}
            <NavLink to={user ? '/app/profile' : '/auth'}>
              <button style={mBtn}>{user ? '👤' : '🔐'}</button>
            </NavLink>
            {user ? <button onClick={signOut} style={mBtn}>⏏</button> : null}
          </div>
        </header>

        {/* PAGE */}
        <main className="pm-pg" style={{ flex:1 }}>
          <Outlet />
        </main>

        {/* MOBILE BOTTOM NAV */}
        <nav className="pm-bn" style={{
          position:'fixed', bottom:0, left:0, right:0, zIndex:50,
          background:'rgba(14,14,14,0.94)', backdropFilter:'blur(20px)',
          borderTop:'1px solid var(--border)',
          height:64, alignItems:'center',
          paddingBottom:'env(safe-area-inset-bottom,0)',
        }}>
          {MOBILE_NAV.map(item => (
            <NavLink key={item.path} to={item.path} end={item.end} style={{ flex:1, textDecoration:'none' }}>
              {({ isActive }) => (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 4px' }}>
                  <div style={{ width:36, height:36, borderRadius:12, background: isActive ? 'rgba(240,122,47,0.14)' : 'transparent', border: isActive ? '1px solid rgba(240,122,47,0.18)' : '1px solid transparent', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Mono, monospace', fontSize:11, fontWeight:700, color: isActive ? 'var(--ember)' : 'var(--text3)', transition:'all 0.2s' }}>{item.icon}</div>
                  <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.5px', textTransform:'uppercase', color: isActive ? 'var(--orange)' : 'var(--text3)', transition:'color 0.2s' }}>{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
          <button onClick={() => setMoreOpen(o => !o)} style={{ flex:1, background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 4px' }}>
            <div style={{ width:36, height:36, borderRadius:12, background: moreOpen ? 'var(--orange-bg)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, transition:'all 0.2s' }}>☰</div>
            <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', color: moreOpen ? 'var(--orange)' : 'var(--text3)' }}>Plus</span>
          </button>
        </nav>

        {/* MORE MENU */}
        {moreOpen && <>
          <div onClick={() => setMoreOpen(false)} style={{ position:'fixed', inset:0, zIndex:48, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }} />
          <div style={{ position:'fixed', bottom:64, left:12, right:12, zIndex:49, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:22, padding:'8px 0 12px', animation:'slideUp 0.2s ease', boxShadow:'0 8px 32px rgba(0,0,0,0.48)' }}>
            {allItems.filter(i => !MOBILE_NAV.find(m => m.path === i.path)).map(item => (
              <NavLink key={item.path} to={item.path} onClick={() => setMoreOpen(false)} style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:14, padding:'12px 20px', color:'var(--text2)', fontSize:15 }}
                onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <span style={{ fontSize:20, width:26, textAlign:'center' }}>{item.icon}</span>
                <span style={{ fontWeight:500, color:'var(--text)' }}>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </>}
      </div>
    </div>
  )
}

const mBtn = { width:34, height:34, borderRadius:10, border:'1px solid var(--border)', background:'rgba(255,255,255,0.03)', color:'var(--text2)', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }
