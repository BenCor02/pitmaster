import { Component } from 'react'
import { useNavigate } from 'react-router-dom'

function ErrorFallback({ error, onRetry }) {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#090909', color: '#f5f1ea', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 620, width: '100%', background: '#161616', border: '1px solid #2b2b2b', borderRadius: 20, padding: 32 }}>
        <div className="pm-kicker" style={{ marginBottom: 12 }}>Erreur isolée</div>
        <h1 style={{ margin: 0, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, lineHeight: 1.05 }}>
          Une page a planté, pas ton compte
        </h1>
        <p style={{ margin: '14px 0 18px', color: '#b7aea4', lineHeight: 1.7, fontSize: 14 }}>
          L’application est restée montée pour éviter de perdre la session ou le rôle admin. Tu peux revenir à un écran sûr sans tout recharger.
        </p>
        {error?.message ? (
          <div style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 12, background: '#0f0f0f', border: '1px solid #2b2b2b', color: '#8a7060', fontSize: 12, lineHeight: 1.6 }}>
            {error.message}
          </div>
        ) : null}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="pm-btn-primary"
            style={{ width: 'auto', minWidth: 220 }}
          >
            Retour au calculateur
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="pm-btn-secondary"
            style={{ width: 'auto', minWidth: 180 }}
          >
            Retour admin
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="pm-btn-secondary"
            style={{ width: 'auto', minWidth: 140 }}
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  )
}

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('AppErrorBoundary caught error', error, info)
  }

  handleRetry = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}

export default AppErrorBoundary
