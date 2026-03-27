import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import Calc from './pages/Calc'
import Journal from './pages/Journal'
import History from './pages/History'
import Party from './pages/Party'
import AskAI from './pages/AskAI'
import Cold from './pages/Cold'
import Landing from './pages/Landing'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Pricing from './pages/Pricing'
import Onboarding from './pages/Onboarding'
import TimerPage from './pages/Timer'
import CookSession from './pages/CookSession'
import Quantity from './pages/Quantity'
import Profile from './pages/Profile'
import Billing from './pages/Billing'
import AdminLayout from './pages/Admin/Layout'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminMembers from './pages/Admin/Members'
import AdminMeats from './pages/Admin/Meats'
import AdminContent from './pages/Admin/Content'
import AdminMedia from './pages/Admin/Media'
import AdminSettings from './pages/Admin/Settings'
import AdminSecurity from './pages/Admin/Security'
import AdminPlans from './pages/Admin/Plans'
import AdminAlgorithm from './pages/Admin/Algorithm'

const Placeholder = ({ name }) => (
  <div style={{ fontFamily:"'DM Sans', sans-serif" }}>
    <h1 style={{ fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:28, color:'var(--text)', marginBottom:8 }}>
      {name} <span style={{ color:'var(--orange)' }}>·</span>
    </h1>
    <p style={{ fontSize:11, color:'var(--text3)', letterSpacing:'1.5px', textTransform:'uppercase', fontWeight:600 }}>Module en construction</p>
  </div>
)

function PrivateRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#080706', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, color:'#4a3a2e' }}>Chargement...</div>
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  if (profile?.account_status === 'suspended') return (
    <div style={{ minHeight:'100vh', background:'#080706', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <div style={{ fontSize:44, marginBottom:16 }}>🔒</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:'#fff', marginBottom:8 }}>Compte suspendu</div>
        <div style={{ fontSize:13, color:'#6a5a4a' }}>Contacte le support pour plus d'informations.</div>
      </div>
    </div>
  )
  return children
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading, profile, roles } = useAuth()
  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:'#080706', display:'flex', alignItems:'center', justifyContent:'center', color:'#d4c4b0', fontFamily:"'DM Sans', sans-serif" }}>
        Chargement de l’admin…
      </div>
    )
  }
  if (!user) return <Navigate to="/app" replace />
  if (!isAdmin) {
    return (
      <div style={{ minHeight:'100vh', background:'#080706', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ maxWidth:460, width:'100%', background:'#14110f', border:'1px solid #241d18', borderRadius:16, padding:24, color:'#f5f1ea', fontFamily:"'DM Sans', sans-serif" }}>
          <div style={{ fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:28, marginBottom:10 }}>Accès admin refusé</div>
          <div style={{ color:'#b7aea4', lineHeight:1.7, marginBottom:18 }}>
            Ton compte est connecté, mais il n’a pas encore un rôle admin reconnu par l’application.
          </div>
          <div style={{ color:'#8a7060', fontSize:13, marginBottom:18 }}>
            Rôle actuel : {profile?.role || 'member'}
          </div>
          <div style={{ color:'#8a7060', fontSize:12, marginBottom:18, lineHeight:1.6 }}>
            Email détecté : {user?.email || '—'}<br />
            User ID : {user?.id || '—'}<br />
            Profile ID : {profile?.id || '—'}<br />
            Roles[] : {Array.isArray(roles) && roles.length ? roles.join(', ') : '—'}
          </div>
          <a href="/app" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', minHeight:44, padding:'0 18px', borderRadius:12, border:'1px solid #2b2b2b', background:'#161616', color:'#f5f1ea', textDecoration:'none', fontWeight:700 }}>
            Retour au calculateur
          </a>
        </div>
      </div>
    )
  }
  return children
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      {/* PUBLIQUES */}
      <Route path="/"           element={<Landing />} />
      <Route path="/pricing"    element={<Navigate to="/app" replace />} />
      <Route path="/auth"            element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />
      <Route path="/onboarding" element={user ? <Onboarding /> : <Navigate to="/auth" replace />} />

      {/* APP PRINCIPALE */}
      <Route path="/app" element={<Layout />}>
        <Route index         element={<Calc />} />
        <Route path="party"    element={<Party />} />
        <Route path="journal"  element={<Journal />} />
        <Route path="cold"     element={<Cold />} />
        <Route path="timer"    element={<TimerPage />} />
        <Route path="quantity" element={<Quantity />} />
        <Route path="session" element={<CookSession />} />
        <Route path="reference" element={<Placeholder name="Référence" />} />
        <Route path="history"  element={<History />} />
        <Route path="ask"      element={<AskAI />} />
        <Route path="profile"  element={<Profile />} />
        <Route path="billing"  element={<Billing />} />
      </Route>

      {/* ADMIN */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index             element={<AdminDashboard />} />
        <Route path="content"    element={<AdminContent />} />
        <Route path="media"      element={<AdminMedia />} />
        <Route path="members"    element={<AdminMembers />} />
        <Route path="meats"      element={<AdminMeats />} />
        <Route path="settings"   element={<AdminSettings />} />
        <Route path="security"   element={<AdminSecurity />} />
        <Route path="plans"      element={<AdminPlans />} />
        <Route path="algorithm"  element={<AdminAlgorithm />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
