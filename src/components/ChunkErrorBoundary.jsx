import { Component } from 'react'

/**
 * Error boundary spécifique aux erreurs de chargement de chunks Vite.
 *
 * Quand un déploiement invalide les anciens chunks (hash différent),
 * le dynamic import() échoue avec un TypeError ou ChunkLoadError.
 * Ce composant :
 * 1. Détecte l'erreur
 * 2. Tente un reload automatique (1 seule fois)
 * 3. Si ça échoue encore, affiche un bouton "Recharger"
 */
export default class ChunkErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error) {
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('load failed') ||
      error?.message?.includes('Importing a module script failed')

    if (isChunkError) {
      // Auto-reload une seule fois
      const key = 'chunk_reload_ts'
      const last = sessionStorage.getItem(key)
      const now = Date.now()

      if (!last || now - parseInt(last, 10) > 10000) {
        sessionStorage.setItem(key, String(now))
        window.location.reload()
        return
      }
    }
  }

  handleReload = () => {
    sessionStorage.removeItem('chunk_reload_ts')
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#ff6b1a]/20 to-red-600/10 flex items-center justify-center text-3xl">
              🔄
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              Mise à jour détectée
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Une nouvelle version est disponible. Recharge la page pour continuer.
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff6b1a] to-[#dc2626] hover:opacity-90 transition-opacity"
            >
              Recharger la page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
