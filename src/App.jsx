import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './modules/auth/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import ChunkErrorBoundary from './components/ChunkErrorBoundary.jsx'

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
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff6b1a] to-red-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-xl">🔥</span>
        </div>
        <p className="text-zinc-500 text-sm font-medium">Chargement...</p>
      </div>
    </div>
  )
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
  if (!isAdmin) return <Navigate to="/" replace />

  return children
}

export default function App() {
  return (
    <Layout>
      <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
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
        <Route
          path="/admin/*"
          element={
            <AdminGuard>
              <AdminPage />
            </AdminGuard>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      </ChunkErrorBoundary>
    </Layout>
  )
}
