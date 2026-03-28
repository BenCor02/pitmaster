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
  .history-shell{font-family:'DM Sans',sans-serif}
  .history-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;padding:18px;margin-bottom:10px;transition:border-color .15s}
  .history-card:hover{border-color:#2a2418}
  .history-chip{background:#0e0c0a;border:1px solid #1e1a14;border-radius:6px;padding:3px 8px;font-size:11px;font-family:'DM Mono',monospace;color:#8a7060}
  .history-chip-hot{background:rgba(232,93,4,0.08);border:1px solid rgba(232,93,4,0.2);border-radius:6px;padding:3px 8px;font-size:11px;font-family:'DM Mono',monospace;color:#e85d04}
  .history-filter{padding:6px 14px;border-radius:8px;border:1px solid #1e1a14;background:#171410;color:#8a7060;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s}
  .history-filter.active{border-color:rgba(232,93,4,0.4);background:rgba(232,93,4,0.1);color:#e85d04}
  .history-filter:hover:not(.active){border-color:#2a2418;color:#d4c4b0}
  .history-action{padding:12px 16px;border-radius:12px;border:1px solid #2a2418;background:#171410;color:#d4c4b0;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s}
  .history-action:hover{border-color:rgba(244,140,6,0.35);color:#fff}
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

async function withTimeout(promise, timeoutMs = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error('Le chargement a pris trop de temps.')), timeoutMs)
    }),
  ])
}

function GuestState({ onAuth, onBack }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>☁️</div>
      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, color: '#d4c4b0', marginBottom: 8 }}>
        Connecte-toi pour voir ton historique
      </div>
      <div style={{ fontSize: 13, color: '#8a7060', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 18px' }}>
        L’historique garde les sessions que tu as explicitement sauvegardées depuis le calculateur.
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button className="history-action" onClick={onAuth}>Se connecter</button>
        <button className="history-action" onClick={onBack}>Retour au calculateur</button>
      </div>
    </div>
  )
}

function LoadingState({ label = 'Chargement de l’historique…' }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6a5a4a', fontSize: 13 }}>
      {label}
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <div style={{ fontSize: 42, marginBottom: 14 }}>⚠️</div>
      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, color: '#d4c4b0', marginBottom: 8 }}>
        Impossible de charger l’historique
      </div>
      <div style={{ fontSize: 13, color: '#8a7060', lineHeight: 1.7, marginBottom: 16 }}>
        {message}
      </div>
      <button className="history-action" onClick={onRetry}>Réessayer</button>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, color: '#d4c4b0', marginBottom: 8 }}>
        Aucune session sauvegardée
      </div>
      <div style={{ fontSize: 13, color: '#6a5a4a', lineHeight: 1.7 }}>
        Lance un calcul puis utilise le bouton de sauvegarde pour garder tes cuissons ici.
      </div>
    </div>
  )
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

  const meats = useMemo(
    () => [...new Set(sessions.map((session) => session.meat_key).filter(Boolean))],
    [sessions]
  )

  const filteredSessions = useMemo(() => {
    if (filter === 'all') return sessions
    return sessions.filter((session) => session.meat_key === filter)
  }, [sessions, filter])

  const avgCook = useMemo(() => {
    const cookValues = sessions.map((session) => session.cook_min || 0).filter(Boolean)
    if (!cookValues.length) return 0
    return Math.round(cookValues.reduce((sum, value) => sum + value, 0) / cookValues.length)
  }, [sessions])

  const uniqueMeats = useMemo(
    () => new Set(sessions.map((session) => session.meat_name).filter(Boolean)).size,
    [sessions]
  )

  return (
    <div className="history-shell">
      <style>{css}</style>
      <Snack snack={snack} />

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '-0.5px' }}>
          Historique <span style={{ color: '#e85d04' }}>·</span>
        </h1>
        <p style={{ fontSize: 11, color: '#8a7060', marginTop: 6, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
          Sessions sauvegardées
        </p>
      </div>

      {authLoading ? (
        <LoadingState label="Chargement du compte…" />
      ) : !user ? (
        <GuestState
          onAuth={() => navigate('/auth', { state: { from: '/app/history', reason: 'history-access' } })}
          onBack={() => navigate('/app')}
        />
      ) : loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadSessions(user.id)} />
      ) : filteredSessions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8, marginBottom: 20 }}>
            {[
              { label: 'Sessions', value: sessions.length, color: '#e85d04' },
              { label: 'Viandes', value: uniqueMeats, color: '#f48c06' },
              { label: 'Durée moy.', value: avgCook ? formatDuration(avgCook) : '—', color: '#e85d04' },
            ].map((item) => (
              <div key={item.label} style={{ background: '#171410', border: '1px solid #1e1a14', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, color: item.color, lineHeight: 1 }}>{item.value}</div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#6a5a4a', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            <button className={`history-filter${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
              Tout ({sessions.length})
            </button>
            {meats.map((meatKey) => (
              <button key={meatKey} className={`history-filter${filter === meatKey ? ' active' : ''}`} onClick={() => setFilter(meatKey)}>
                {MEAT_NAMES[meatKey] || meatKey} ({sessions.filter((session) => session.meat_key === meatKey).length})
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            {confirmDelete === 'all' ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#8a7060' }}>Confirmer ?</span>
                <button className="history-filter active" onClick={deleteAll}>Oui, effacer</button>
                <button className="history-filter" onClick={() => setConfirmDelete(null)}>Annuler</button>
              </div>
            ) : (
              <button className="history-filter" onClick={() => setConfirmDelete('all')}>
                🗑 Tout effacer
              </button>
            )}
          </div>

          {filteredSessions.map((session) => (
            <div key={session.id} className="history-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 10 }}>
                <div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, color: '#d4c4b0', marginBottom: 3 }}>
                    {session.meat_name || 'Session BBQ'}
                  </div>
                  <div style={{ fontSize: 11, color: '#6a5a4a' }}>
                    {session.date || '—'} · Service {session.serve_time || '—'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {confirmDelete === session.id ? (
                    <>
                      <button className="history-filter active" onClick={() => deleteSession(session.id)}>Supprimer</button>
                      <button className="history-filter" onClick={() => setConfirmDelete(null)}>Annuler</button>
                    </>
                  ) : (
                    <button className="history-filter" onClick={() => setConfirmDelete(session.id)} disabled={deletingId === session.id}>
                      {deletingId === session.id ? '…' : '🗑'}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                <span className="history-chip-hot">🔥 {session.start_time || '—'}</span>
                {session.smoker_temp ? <span className="history-chip">{session.smoker_temp}°C</span> : null}
                {session.weight ? <span className="history-chip">{session.weight}kg</span> : null}
                {session.cook_min ? <span className="history-chip">~{formatDuration(session.cook_min)}</span> : null}
              </div>

              {session.cook_min ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: '#4a3a2e', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Durée de cuisson</span>
                    <span style={{ fontSize: 10, color: '#8a7060', fontFamily: 'DM Mono,monospace' }}>{formatDuration(session.cook_min)}</span>
                  </div>
                  <div style={{ height: 3, background: '#1e1a14', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (session.cook_min / 720) * 100)}%`,
                        background: 'linear-gradient(90deg,#f48c06,#e85d04)',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
