import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AdminRoute, LoadingScreen } from './guards'

const AppShell = lazy(() => import('../../features/app/AppShell'))
const AdminLayout = lazy(() => import('../../pages/Admin/Layout'))

const LandingPage = lazy(() => import('../../features/public/pages/LandingPage'))
const AuthPage = lazy(() => import('../../features/auth/pages/AuthPage'))
const ForgotPasswordPage = lazy(() => import('../../features/auth/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../../features/auth/pages/ResetPasswordPage'))
const OnboardingPage = lazy(() => import('../../pages/Onboarding'))

const CalculatorPage = lazy(() => import('../../pages/Calc'))
const PartyPage = lazy(() => import('../../pages/Party'))
const JournalPage = lazy(() => import('../../pages/Journal'))
const ColdSmokingPage = lazy(() => import('../../pages/Cold'))
const TimerPage = lazy(() => import('../../pages/Timer'))
const QuantityPage = lazy(() => import('../../pages/Quantity'))
const CookSessionPage = lazy(() => import('../../pages/CookSession'))
const HistoryPage = lazy(() => import('../../pages/History'))
const AskPitmasterPage = lazy(() => import('../../pages/AskAI'))
const ProfilePage = lazy(() => import('../../features/calculator/pages/ProfilePage'))
const AccountPage = lazy(() => import('../../features/calculator/pages/AccountPage'))

const AdminDashboardPage = lazy(() => import('../../pages/Admin/Dashboard'))
const AdminContentPage = lazy(() => import('../../pages/Admin/Content'))
const AdminMediaPage = lazy(() => import('../../pages/Admin/Media'))
const AdminMembersPage = lazy(() => import('../../pages/Admin/Members'))
const AdminMeatsPage = lazy(() => import('../../pages/Admin/Meats'))
const AdminSettingsPage = lazy(() => import('../../pages/Admin/Settings'))
const AdminSecurityPage = lazy(() => import('../../pages/Admin/Security'))
const AdminAccessPage = lazy(() => import('../../features/admin/pages/AdminAccessPage'))
const AdminAlgorithmPage = lazy(() => import('../../pages/Admin/Algorithm'))

function Placeholder({ name }) {
  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif" }}>
      <h1 style={{ fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:28, color:'var(--text)', marginBottom:8 }}>
        {name} <span style={{ color:'var(--orange)' }}>·</span>
      </h1>
      <p style={{ fontSize:11, color:'var(--text3)', letterSpacing:'1.5px', textTransform:'uppercase', fontWeight:600 }}>
        Module en reconstruction propre
      </p>
    </div>
  )
}

export default function AppRouter() {
  const { user } = useAuth()

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<Navigate to="/app" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/onboarding" element={user ? <OnboardingPage /> : <Navigate to="/auth" replace />} />

        <Route path="/app" element={<AppShell />}>
          <Route index element={<CalculatorPage />} />
          <Route path="party" element={<PartyPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="cold" element={<ColdSmokingPage />} />
          <Route path="timer" element={<TimerPage />} />
          <Route path="quantity" element={<QuantityPage />} />
          <Route path="session" element={<CookSessionPage />} />
          <Route path="reference" element={<Placeholder name="Référence" />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="ask" element={<AskPitmasterPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="billing" element={<AccountPage />} />
        </Route>

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="members" element={<AdminMembersPage />} />
          <Route path="meats" element={<AdminMeatsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="security" element={<AdminSecurityPage />} />
          <Route path="plans" element={<AdminAccessPage />} />
          <Route path="algorithm" element={<AdminAlgorithmPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
