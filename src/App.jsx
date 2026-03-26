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
import Pricing from './pages/Pricing'
import Onboarding from './pages/Onboarding'
import TimerPage from './pages/Timer'
import CookSession from './pages/CookSession'
import Quantity from './pages/Quantity'
import AdminLayout from './pages/Admin/Layout'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminMembers from './pages/Admin/Members'
import AdminMeats from './pages/Admin/Meats'
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
  const { user, loading, checkingAdmin } = useAuth()
  if (loading || checkingAdmin) return (
    <div style={{ minHeight:'100vh', background:'#080706', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:24, height:24, border:'2px solid var(--orange)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
    </div>
  )
  return user ? children : <Navigate to="/" replace />
}

function AdminRoute({ children }) {
  const { user, isAdmin, checkingAdmin } = useAuth()
  if (checkingAdmin) return (
    <div style={{ minHeight:'100vh', background:'#080706', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:24, height:24, border:'2px solid var(--orange)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  if (!isAdmin) return <Navigate to="/app" replace />
  return children
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      {/* PUBLIQUES */}
      <Route path="/"           element={<Landing />} />
      <Route path="/pricing"    element={<Pricing />} />
      <Route path="/auth"       element={user ? <Navigate to="/app" replace /> : <Auth />} />
      <Route path="/onboarding" element={user ? <Onboarding /> : <Navigate to="/auth" replace />} />

      {/* APP PRINCIPALE */}
      <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
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
      </Route>

      {/* ADMIN */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index             element={<AdminDashboard />} />
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