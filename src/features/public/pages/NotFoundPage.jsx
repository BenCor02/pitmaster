import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#090909', color: '#f5f1ea', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 560, width: '100%', background: '#161616', border: '1px solid #2b2b2b', borderRadius: 20, padding: 32, textAlign: 'center' }}>
        <div className="pm-kicker" style={{ marginBottom: 12 }}>Route introuvable</div>
        <h1 style={{ margin: 0, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 34, lineHeight: 1.05 }}>
          Cette page n’existe pas
        </h1>
        <p style={{ margin: '14px 0 22px', color: '#b7aea4', lineHeight: 1.7, fontSize: 14 }}>
          On préfère t’afficher une vraie erreur plutôt que de te renvoyer silencieusement ailleurs.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
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
            onClick={() => navigate('/')}
            className="pm-btn-secondary"
            style={{ width: 'auto', minWidth: 180 }}
          >
            Accueil
          </button>
        </div>
      </div>
    </div>
  )
}
