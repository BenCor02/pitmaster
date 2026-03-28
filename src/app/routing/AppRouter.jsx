import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute, LoadingScreen, PrivateRoute } from './guards'

const AppShell = lazy(() => import('../../features/app/AppShell'))
const AdminShell = lazy(() => import('../../features/admin/AdminShell'))

const LandingPage = lazy(() => import('../../features/public/pages/LandingPage'))
const MeatGuidePage = lazy(() => import('../../features/public/pages/MeatGuidePage'))
const AuthPage = lazy(() => import('../../features/auth/pages/AuthPage'))
const ForgotPasswordPage = lazy(() => import('../../features/auth/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../../features/auth/pages/ResetPasswordPage'))
const OnboardingPage = lazy(() => import('../../features/public/pages/OnboardingPage'))

const CalculatorPage = lazy(() => import('../../features/calculator/pages/CalculatorPage'))
const PartyPage = lazy(() => import('../../features/calculator/pages/PartyPage'))
const JournalPage = lazy(() => import('../../features/calculator/pages/JournalPage'))
const ColdSmokingPage = lazy(() => import('../../features/calculator/pages/ColdSmokingPage'))
const TimerPage = lazy(() => import('../../features/calculator/pages/TimerPage'))
const QuantityPage = lazy(() => import('../../features/calculator/pages/QuantityPage'))
const CookSessionPage = lazy(() => import('../../features/calculator/pages/CookSessionPage'))
const HistoryPage = lazy(() => import('../../features/calculator/pages/HistoryPage'))
const AskPitmasterPage = lazy(() => import('../../features/calculator/pages/AskPitmasterPage'))
const ProfilePage = lazy(() => import('../../features/calculator/pages/ProfilePage'))
const AccountPage = lazy(() => import('../../features/calculator/pages/AccountPage'))

const AdminDashboardPage = lazy(() => import('../../features/admin/pages/AdminDashboardPage'))
const AdminContentPage = lazy(() => import('../../features/admin/pages/AdminContentPage'))
const AdminSeoBlocksPage = lazy(() => import('../../features/admin/pages/AdminSeoBlocksPage'))
const AdminMediaPage = lazy(() => import('../../features/admin/pages/AdminMediaPage'))
const AdminMembersPage = lazy(() => import('../../features/admin/pages/AdminMembersPage'))
const AdminMeatsPage = lazy(() => import('../../features/admin/pages/AdminMeatsPage'))
const AdminSettingsPage = lazy(() => import('../../features/admin/pages/AdminSettingsPage'))
const AdminSecurityPage = lazy(() => import('../../features/admin/pages/AdminSecurityPage'))
const AdminAccessPage = lazy(() => import('../../features/admin/pages/AdminAccessPage'))
const AdminAlgorithmPage = lazy(() => import('../../features/admin/pages/AdminAlgorithmPage'))

export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/viandes/:slug" element={<MeatGuidePage />} />
        <Route path="/pricing" element={<Navigate to="/app" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/onboarding" element={<PrivateRoute redirectTo="/auth"><OnboardingPage /></PrivateRoute>} />

        <Route path="/app" element={<AppShell />}>
          <Route index element={<CalculatorPage />} />
          <Route path="party" element={<PartyPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="cold" element={<ColdSmokingPage />} />
          <Route path="timer" element={<TimerPage />} />
          <Route path="quantity" element={<QuantityPage />} />
          <Route path="session" element={<CookSessionPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="ask" element={<AskPitmasterPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="billing" element={<AccountPage />} />
        </Route>

        <Route path="/admin" element={<AdminRoute><AdminShell /></AdminRoute>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="seo" element={<AdminSeoBlocksPage />} />
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
