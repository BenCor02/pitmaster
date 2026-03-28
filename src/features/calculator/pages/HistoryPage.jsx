import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import {
  deleteAllCookSessionsForUser,
  deleteCookSessionById,
  fetchUserCookSessions,
} from '../../../modules/cooks/repository'
import { useSnack } from '../../../components/useSnack'
import Snack from '../../../components/Snack'

const css = `
  .history-page{font-family:'DM Sans',sans-serif}
  .history-stat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
  .history-stat-card{background:linear-gradient(180deg,#1a1a1a,#161616);border:1px solid var(--border);border-radius:16px;padding:16px;box-shadow:var(--shadow-soft)}
  .history-stat-value{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;line-height:1;color:var(--text)}
  .history-stat-label{margin-top:6px;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--text3)}
  .history-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}
  .history-filters{display:flex;gap:8px;flex-wrap:wrap}
  .history-filter{padding:10px 14px;border-radius:12px;border:1px solid var(--border);background:linear-gradient(180deg,#1a1a1a,#161616);color:var(--text3);font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s}
  .history-filter:hover{border-color:var(--border2);color:var(--text)}
  .history-filter.active{border-color:var(--orange-border);background:var(--orange-bg);color:var(--ember)}
  .history-entry{background:linear-gradient(180deg,#1a1a1a,#161616);border:1px solid var(--border);border-radius:20px;padding:18px;box-shadow:var(--shadow-soft);margin-bottom:12px}
  .history-entry-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px}
  .history-entry-title{font-family:'Syne',sans-serif;font-weight:800;font-size:18px;color:var(--text);line-height:1.05}
  .history-entry-meta{font-size:12px;color:var(--text3);margin-top:5px}
  .history-chip-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
  .history-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 10px;border-radius:999px;border:1px solid var(--border);background:#111111;color:var(--text2);font-size:11px;font-family:'DM Mono',monospace}
  .history-progress{height:6px;background:#111111;border-radius:999px;overflow:hidden}
  .history-progress-bar{height:100%;background:linear-gradient(90deg,var(--orange-light),var(--orange-deep));border-radius:999px}
  .history-danger{color:#fb7185;border-color:rgba(251,113,133,0.28)}
  .history-empty-shell{padding:34px 24px;text-align:center}
  .history-empty-icon{font-size:46px;margin-bottom:12px}
  .history-empty-title{font-family:'Syne',sans-serif;font-weight:800;font-size:22px;color:var(--text);margin-bottom:8px}
  .history-empty-copy{font-size:13px;color:var(--text3);line-height:1.7;max-width:540px;margin:0 auto 18px}
  .history-empty-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}
  @media(max-width:900px){
    .history-stat-grid{grid-template-columns:1fr}
  }
`

const MEAT_NAMES = {
  brisket: 'Brisket',
  pork_shoulder: 'Pulled Pork',
  ribs_pork: 'Spare Ribs',
  ribs_beef: 'Beef Ribs',
  lamb_shoulder: 'Épaule agneau',
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

function StateCard({ icon, title, copy, actions }) {
  return (
    <div className="pm-card">
      <div className="history-empty-shell">
        <div className="history-empty-icon">{icon}</div>
        <div className="history-empty-title">{title}</div>
        <div className="history-empty-copy">{copy}</div>
        {actions ? <div className="history-empty-actions">{actions}</div> : null}
      </div>
    </div>
  )
}

async function withTimeout(promise, timeoutMs = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error('Le chargement a pris trop de temps.')), timeoutMs)
    }),
  ])
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { snack, showSnack } = useSnack()

  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function loadSessions(userId) {
    setLoading(true)
    setError('')
    try {
      const data = await withTimeout(fetchUserCookSessions(userId))
      setSessions(Array.isArray(data) ? data : [])
    } catch (nextError) {
      setSessions([])
      setError(nextError.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function run() {
      if (authLoading) return
      if (!user?.id) {
        if (!active) return
        setSessions([])
        setError('')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      try {
        const data = await withTimeout(fetchUserCookSessions(user.id))
        if (!active) return
        setSessions(Array.isArray(data) ? data : [])
      } catch (nextError) {
        if (!active) return
        setSessions([])
        setError(nextError.message || 'Erreur inconnue')
      } finally {
        if (active) setLoading(false)
      }
    }

    void run()
    return () => { active = false }
  }, [user?.id, authLoading])

  async function deleteSession(id) {
    setDeletingId(id)
    setConfirmDelete(null)
    try {
      await deleteCookSessionById(id)
      setSessions((prev) => prev.filter((session) => session.id !== id))
      showSnack('Session supprimée')
    } catch (nextError) {
      showSnack(`Erreur : ${nextError.message}`, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  async function deleteAll() {
    if (!user?.id) return
    try {
      await deleteAllCookSessionsForUser(user.id)
      setSessions([])
      setConfirmDelete(null)
      showSnack('Historique effacé')
    } catch (nextError) {
      showSnack(`Erreur : ${nextError.message}`, 'error')
    }
  }

  const meats = useMemo(() => [...new Set(sessions.map((session) => session.meat_key).filter(Boolean))], [sessions])
  const filteredSessions = useMemo(() => filter === 'all' ? sessions : sessions.filter((session) => session.meat_key === filter), [sessions, filter])
  const avgCook = useMemo(() => {
    const cookValues = sessions.map((session) => session.cook_min || 0).filter(Boolean)
    if (!cookValues.length) return 0
    return Math.round(cookValues.reduce((sum, value) => sum + value, 0) / cookValues.length)
  }, [sessions])
  const uniqueMeats = useMemo(() => new Set(sessions.map((session) => session.meat_name).filter(Boolean)).size, [sessions])

  return (
    <div className="history-page">
      <style>{css}</style>
      <Snack snack={snack} />

      <div className="pm-hero-shell" style={{ marginBottom: 18 }}>
        <div className="pm-kicker" style={{ marginBottom: 12 }}>Historique des plans</div>
        <h1 style={{ marginBottom: 8 }}>
          Retrouve les <span style={{ color: 'var(--ember)' }}>cuissons sauvegardées</span>
        </h1>
        <p style={{ maxWidth: 760 }}>
          L’historique garde les plans de cuisson que tu as décidé d’enregistrer depuis le calculateur. Il est séparé du journal, qui lui sert aux notes terrain et au retour d’expérience.
        </p>
      </div>

      {authLoading ? (
        <StateCard icon="⏳" title="Chargement du compte" copy="On vérifie ton profil avant d’ouvrir l’historique." />
      ) : !user ? (
        <StateCard
          icon="☁️"
          title="Connecte-toi pour voir ton historique"
          copy="Tes plans enregistrés sont liés à ton compte pour que tu puisses les retrouver facilement d’une session à l’autre."
          actions={(
            <>
              <button className="pm-btn-primary" style={{ width: 'auto', minWidth: 200 }} onClick={() => navigate('/auth', { state: { from: '/app/history', reason: 'history-access' } })}>
                Se connecter
              </button>
              <button className="pm-btn-secondary" style={{ width: 'auto', minWidth: 180 }} onClick={() => navigate('/app')}>
                Retour calculateur
              </button>
            </>
          )}
        />
      ) : loading ? (
        <StateCard icon="🔥" title="Chargement de l’historique" copy="On récupère tes plans sauvegardés." />
      ) : error ? (
        <StateCard
          icon="⚠️"
          title="Impossible de charger l’historique"
          copy={error}
          actions={(
            <button className="pm-btn-secondary" style={{ width: 'auto', minWidth: 180 }} onClick={() => loadSessions(user.id)}>
              Réessayer
            </button>
          )}
        />
      ) : filteredSessions.length === 0 ? (
        <StateCard
          icon="📖"
          title="Aucune session sauvegardée"
          copy="Lance un calcul puis utilise le bouton “Garder dans l’historique” pour revoir cette cuisson plus tard."
          actions={(
            <button className="pm-btn-primary" style={{ width: 'auto', minWidth: 220 }} onClick={() => navigate('/app')}>
              Aller au calculateur
            </button>
          )}
        />
      ) : (
        <>
          <div className="history-stat-grid" style={{ marginBottom: 14 }}>
            {[
              { label: 'Sessions', value: sessions.length, color: 'var(--orange-light)' },
              { label: 'Viandes', value: uniqueMeats, color: 'var(--ember)' },
              { label: 'Durée moyenne', value: avgCook ? formatDuration(avgCook) : '—', color: 'var(--orange-light)' },
            ].map((item) => (
              <div key={item.label} className="history-stat-card">
                <div className="history-stat-value" style={{ color: item.color }}>{item.value}</div>
                <div className="history-stat-label">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="pm-card">
            <div className="history-toolbar">
              <div>
                <div className="pm-sec-label">🕘 Plans sauvegardés</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
                  Filtre par type de viande et garde uniquement les sessions utiles.
                </div>
              </div>
              <div className="history-filters">
                <button className={`history-filter${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
                  Tout ({sessions.length})
                </button>
                {meats.map((meatKey) => (
                  <button key={meatKey} className={`history-filter${filter === meatKey ? ' active' : ''}`} onClick={() => setFilter(meatKey)}>
                    {MEAT_NAMES[meatKey] || meatKey}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              {confirmDelete === 'all' ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>Confirmer ?</span>
                  <button className="history-filter active history-danger" onClick={deleteAll}>Oui, effacer</button>
                  <button className="history-filter" onClick={() => setConfirmDelete(null)}>Annuler</button>
                </div>
              ) : (
                <button className="history-filter history-danger" onClick={() => setConfirmDelete('all')}>
                  Tout effacer
                </button>
              )}
            </div>
          </div>

          {filteredSessions.map((session) => (
            <article key={session.id} className="history-entry">
              <div className="history-entry-head">
                <div>
                  <div className="history-entry-title">{session.meat_name || 'Session BBQ'}</div>
                  <div className="history-entry-meta">
                    {session.date || '—'} · Service {session.serve_time || '—'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {confirmDelete === session.id ? (
                    <>
                      <button className="history-filter active history-danger" onClick={() => deleteSession(session.id)}>Supprimer</button>
                      <button className="history-filter" onClick={() => setConfirmDelete(null)}>Annuler</button>
                    </>
                  ) : (
                    <button className="history-filter history-danger" onClick={() => setConfirmDelete(session.id)} disabled={deletingId === session.id}>
                      {deletingId === session.id ? '…' : 'Supprimer'}
                    </button>
                  )}
                </div>
              </div>

              <div className="history-chip-row">
                <span className="history-chip">🔥 Départ {session.start_time || '—'}</span>
                {session.smoker_temp ? <span className="history-chip">{session.smoker_temp}°C fumoir</span> : null}
                {session.weight ? <span className="history-chip">{session.weight}kg</span> : null}
                {session.cook_min ? <span className="history-chip">~{formatDuration(session.cook_min)}</span> : null}
              </div>

              {session.cook_min ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                      Durée estimée
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'DM Mono,monospace' }}>
                      {formatDuration(session.cook_min)}
                    </span>
                  </div>
                  <div className="history-progress">
                    <div className="history-progress-bar" style={{ width: `${Math.min(100, (session.cook_min / 720) * 100)}%` }} />
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </>
      )}
    </div>
  )
}
