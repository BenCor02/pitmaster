import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './modules/auth/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import CalculatorPage from './pages/CalculatorPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import GuidesListPage from './pages/GuidesListPage.jsx'
import GuidePage from './pages/GuidePage.jsx'
import JournalPage from './pages/JournalPage.jsx'
import PortionCalculatorPage from './pages/PortionCalculatorPage.jsx'
import MultiCookPage from './pages/MultiCookPage.jsx'
import RecipesPage from './pages/RecipesPage.jsx'
import RecipeDetailPage from './pages/RecipeDetailPage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import ComparatorPage from './pages/ComparatorPage.jsx'
import SharedCookPage from './pages/SharedCookPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

function AdminGuard({ children }) {
  const { isLoading, isAuthenticated, isAdmin, profile } = useAuth()

  // Attendre que la session ET le profil soient chargés
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-zinc-400">Chargement...</div>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/admin' }} replace />
  // Profil pas encore chargé → attendre (ne pas rediriger trop tôt)
  if (isAuthenticated && profile === null) return <div className="min-h-screen flex items-center justify-center text-zinc-400">Chargement du profil...</div>
  if (!isAdmin) return <Navigate to="/" replace />

  return children
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CalculatorPage />} />
        <Route path="/guides" element={<GuidesListPage />} />
        <Route path="/guides/:slug" element={<GuidePage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/portions" element={<PortionCalculatorPage />} />
        <Route path="/multi" element={<MultiCookPage />} />
        <Route path="/recettes" element={<RecipesPage />} />
        <Route path="/recettes/:slug" element={<RecipeDetailPage />} />
        <Route path="/comparateur" element={<ComparatorPage />} />
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
    </Layout>
  )
}
