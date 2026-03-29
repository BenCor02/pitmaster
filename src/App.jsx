import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './modules/auth/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import CalculatorPage from './pages/CalculatorPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import GuidesListPage from './pages/GuidesListPage.jsx'
import GuidePage from './pages/GuidePage.jsx'

function AdminGuard({ children }) {
  const { isLoading, isAuthenticated, isAdmin } = useAuth()

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-zinc-400">Chargement...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
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
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin/*"
          element={
            <AdminGuard>
              <AdminPage />
            </AdminGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
