'use client'
import { AuthProvider } from '../src/modules/auth/AuthContext.jsx'
import { SiteSettingsProvider } from '../src/hooks/useSiteSettings.jsx'
import { ToastProvider } from '../src/components/Toast.jsx'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <SiteSettingsProvider>
        <ToastProvider>{children}</ToastProvider>
      </SiteSettingsProvider>
    </AuthProvider>
  )
}
