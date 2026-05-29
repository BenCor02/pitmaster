import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'next/navigation'
import { useAuth } from './modules/auth/AuthContext.jsx'
import { useSiteSettings } from './hooks/useSiteSettings.jsx'
import Layout from './components/Layout.jsx'
import ChunkErrorBoundary from './components/ChunkErrorBoundary.jsx'
import MaintenancePage from './pages/MaintenancePage.jsx'
import { Analytics } from '@vercel/analytics/react'
import { isNative } from './lib/capacitor.js'

// Code splitting — chaque page est chargée à la demande
const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const CalculatorPage = lazy(() => import('./pages/CalculatorPage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'))
const GuidesListPage = lazy(() => import('./pages/GuidesListPage.jsx'))
const GuidePage = lazy(() => import('./pages/GuidePage.jsx'))
const JournalPage = lazy(() => import('./pages/JournalPage.jsx'))
const PortionCalculatorPage = lazy(() => import('./pages/PortionCalculatorPage.jsx'))
const MultiCookPage = lazy(() => import('./pages/MultiCookPage.jsx'))
const RecipesPage = lazy(() => import('./pages/RecipesPage.jsx'))
const RecipeDetailPage = lazy(() => import('./pages/RecipeDetailPage.jsx'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage.jsx'))
const ComparatorPage = lazy(() => import('./pages/ComparatorPage.jsx'))
const SharedCookPage = lazy(() => import('./pages/SharedCookPage.jsx'))
const WoodGuidePage = lazy(() => import('./pages/WoodGuidePage.jsx'))
const BbqGuidePage = lazy(() => import('./pages/BbqGuidePage.jsx'))
const LiveCookPage = lazy(() => import('./pages/LiveCookPage.jsx'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF6EE' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, background: '#8B1A1A', borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <svg viewBox="0 0 40 40" width={28} height={28}>
            <path d="M 20 32 C 14 28, 12 22, 16 16 C 18 14, 20 11, 20 8 C 20 11, 22 14, 24 16 C 28 22, 26 28, 20 32 Z" fill="#F5EFE0" />
            <path d="M 20 30 C 17 27, 16 24, 18 20 C 19 18, 20 16, 20 14 C 20 16, 21 18, 22 20 C 24 24, 23 27, 20 30 Z" fill="#E8A53C" />
          </svg>
        </div>
        <p style={{ fontFamily: 'var(--cf-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B8AC97' }}>
          Chargement…
        </p>
      </div>
    </div>
  )
}

function MaintenanceGuard({ children }) {
  const { maintenance, loaded } = useSiteSettings()
  const { isAdmin } = useAuth()

  // Pas encore chargé → on laisse passer (le PageLoader gère)
  if (!loaded) return children
  // Maintenance activée et pas admin → page maintenance
  if (maintenance.enabled && !isAdmin) return <MaintenancePage message={maintenance.message} />

  return children
}

function AdminGuard({ children }) {
  const { isLoading, isAuthenticated, isAdmin, profile } = useAuth()

  // 1. Attendre que la session auth soit résolue
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-zinc-400">Chargement...</div>
  // 2. Non connecté → login
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/admin' }} replace />
  // 3. Connecté mais profil pas encore chargé → attendre (CRITIQUE : ne pas vérifier isAdmin ici)
  if (profile === null || profile === undefined) return <div className="min-h-screen flex items-center justify-center text-zinc-400">Chargement du profil...</div>
  // 4. Profil chargé, vérifier le rôle
  if (!isAdmin) return /* redirect to / */null

  return children
}

function PublicRoutes() {
  return (
    <Layout>
      <MaintenanceGuard>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculateur" element={<CalculatorPage />} />
          <Route path="/guides" element={<GuidesListPage />} />
          <Route path="/guides/:slug" element={<GuidePage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/portions" element={<PortionCalculatorPage />} />
          <Route path="/multi" element={<MultiCookPage />} />
          <Route path="/recettes" element={<RecipesPage />} />
          <Route path="/recettes/:slug" element={<RecipeDetailPage />} />
          <Route path="/comparateur" element={<ComparatorPage />} />
          <Route path="/bois" element={<WoodGuidePage />} />
          <Route path="/bbq" element={<BbqGuidePage />} />
          <Route path="/live" element={<LiveCookPage />} />
          <Route path="/carnet" element={<FavoritesPage />} />
          <Route path="/partage/:code" element={<SharedCookPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/confidentialite" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MaintenanceGuard>
    </Layout>
  )
}

export default function App() {
  return (
    <>
      {!isNative && <Analytics />}
      <ChunkErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Admin — standalone, sans Layout public */}
            <Route
              path="/admin/*"
              element={
                <AdminGuard>
                  <AdminPage />
                </AdminGuard>
              }
            />
            {/* Site public — avec Layout + nav */}
            <Route path="*" element={<PublicRoutes />} />
          </Routes>
        </Suspense>
      </ChunkErrorBoundary>
    </>
  )
}
