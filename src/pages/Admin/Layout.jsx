import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { path: '/admin',           icon: '📊', label: 'Dashboard',        end: true },
  { section: 'BUSINESS' },
  { path: '/admin/members',   icon: '👥', label: 'Membres' },
  { path: '/admin/plans',     icon: '💳', label: 'Plans & Pricing' },
  { section: 'CONTENU' },
  { path: '/admin/meats',     icon: '🥩', label: 'Viandes & Calculs' },
  { path: '/admin/algorithm', icon: '🧮', label: 'Algorithme BBQ' },
  { section: 'TECHNIQUE' },
  { path: '/admin/settings',  icon: '⚙️', label: 'Paramètres site' },
  { path: '/admin/security',  icon: '🛡️', label: 'Sécurité & IPs' },
]

const css = `
  @keyframes spin{to{transform:rotate(360deg)}}
  .adm-nav-item{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:8px;margin-bottom:1px;text-decoration:none;transition:background 0.15s;cursor:pointer;border:1px solid transparent}
  .adm-nav-item:hover{background:rgba(255,255,255,0.03)}
  .adm-nav-item.active{background:rgba(232,93,4,0.12);border-color:rgba(232,93,4,0.2)}
  .adm-sidebar{display:flex}
  .adm-main{margin-left:240px}
  .adm-topbar{display:flex}
  .adm-page{padding:36px 40px}
  @media(max-width:900px){
    .adm-sidebar{display:none!important}
    .adm-main{margin-left:0!important}
    .adm-page{padding:16px!important}
  }
`

export default function AdminLayout() {
  const { user, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!isAdmin) return null

  const currentPage = location.pathname.split('/').pop() || 'Dashboard'

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#080706', fontFamily:"'DM Sans', sans-serif" }}>
      <style>{css}</style>

      {/* SIDEBAR */}
      <aside className="adm-sidebar" style={{ width:240, flexShrink:0, background:'#0c0a08', borderRight:'1px solid #181410', flexDirection:'column', position:'fixed', inset:'0 auto 0 0', zIndex:40 }}>
        {/* LOGO */}
        <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid #181410' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#f48c06,#c04400)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, boxShadow:'0 4px 12px rgba(232,93,4,0.3)' }}>👑</div>
            <div>
              <div style={{ fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:14, color:'#fff', lineHeight:1 }}>Admin Panel</div>
              <div style={{ fontSize:9, color:'#2e2820', fontWeight:600, marginTop:2, letterSpacing:'1.5px', textTransform:'uppercase' }}>PitMaster Pro</div>
            </div>
          </div>
          <div style={{ marginTop:10, padding:'6px 10px', borderRadius:7, background:'rgba(232,93,4,0.08)', border:'1px solid rgba(232,93,4,0.15)', fontSize:11, color:'#e85d04', fontFamily:"'DM Mono', monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {user?.email}
          </div>
        </div>

        {/* NAV */}
        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
          {NAV.map((item, i) => {
            if (item.section) return (
              <div key={i} style={{ fontSize:9, fontWeight:700, letterSpacing:'2px', color:'#2a2218', padding:'12px 10px 4px', textTransform:'uppercase' }}>{item.section}</div>
            )
            return (
              <NavLink key={item.path} to={item.path} end={item.end}
                className={({ isActive }) => `adm-nav-item${isActive ? ' active' : ''}`}>
                {({ isActive }) => (<>
                  <span style={{ fontSize:14, width:20, textAlign:'center', opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
                  <span style={{ fontSize:13, fontWeight: isActive ? 600 : 400, color: isActive ? '#e85d04' : '#5a4a40', fontFamily: isActive ? "'Syne', sans-serif" : "'DM Sans', sans-serif" }}>{item.label}</span>
                  {isActive && <div style={{ marginLeft:'auto', width:5, height:5, borderRadius:'50%', background:'#e85d04' }} />}
                </>)}
              </NavLink>
            )
          })}
        </nav>

        {/* FOOTER */}
        <div style={{ padding:'12px 8px', borderTop:'1px solid #181410' }}>
          <button onClick={() => navigate('/app')} style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid #1e1a14', background:'transparent', color:'#5a4a40', fontFamily:"'Syne', sans-serif", fontSize:12, fontWeight:700, cursor:'pointer', marginBottom:6, display:'flex', alignItems:'center', gap:8, transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.color='#d4c4b0' }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#5a4a40' }}>
            ← Retour à l&apos;app
          </button>
          <button onClick={signOut} style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.05)', color:'#ef4444', fontFamily:"'Syne', sans-serif", fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.05)' }}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="adm-main" style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <header className="adm-topbar" style={{ height:50, background:'rgba(8,7,6,0.95)', backdropFilter:'blur(20px)', borderBottom:'1px solid #181410', alignItems:'center', justifyContent:'space-between', padding:'0 40px', position:'sticky', top:0, zIndex:30 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:10, color:'#3a2e24', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase' }}>Admin</span>
            <span style={{ color:'#2a2218' }}>/</span>
            <span style={{ fontSize:12, color:'#8a7060', fontWeight:600 }}>{currentPage}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 6px rgba(34,197,94,0.5)' }} />
            <span style={{ fontSize:11, color:'#6a5a4a' }}>Système opérationnel</span>
          </div>
        </header>

        <main className="adm-page" style={{ flex:1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}