import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './modules/auth/AuthContext.jsx'
import { SiteSettingsProvider } from './hooks/useSiteSettings.jsx'
import { ToastProvider } from './components/Toast.jsx'
import App from './App.jsx'
import './index.css'
import { setupChannels, requestPermission } from './lib/notifications.js'
import { isNative } from './lib/capacitor.js'

// Register service worker for PWA (web uniquement)
if (!isNative && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

// Initialisation Capacitor (Android)
if (isNative) {
  setupChannels().then(() => requestPermission()).catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SiteSettingsProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </SiteSettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
)
