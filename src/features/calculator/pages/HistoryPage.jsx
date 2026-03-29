import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Snack from '../../../components/Snack'
import { useSnack } from '../../../components/useSnack'
import { useAuth } from '../../../context/AuthContext'
import { MEATS } from '../../../domain/content/meats'
import {
  deleteAllCookSessionsForUser,
  deleteCookSessionById,
  fetchUserCookSessions,
} from '../../../modules/cooks/repository'
import {
  WORKSHOP_PAGE_CSS,
  WorkshopHero,
  WorkshopStatGrid,
  WorkshopStateCard,
  WorkshopToolbar,
} from '../components/WorkshopPrimitives'

function formatDuration(minutes) {
  const safeMinutes = Math.max(Math.round(Number(minutes) || 0), 0)
  const hours = Math.floor(safeMinutes / 60)
  const mins = safeMinutes % 60
  if (!hours) return `${mins}min`
  if (!mins) return `${hours}h`
  return `${hours}h${String(mins).padStart(2, '0')}`
}

function getMeatLabel(session) {
  return session.meat_name || MEATS[session.meat_key]?.name || session.meat_key || 'Cuisson BBQ'
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
  }, [authLoading, user?.id])

  async function deleteSession(id) {
    setDeletingId(id)
    setConfirmDelete(null)
    try {
      await deleteCookSessionById(id)
      setSessions((prev) => prev.filter((session) => session.id !== id))
      showSnack('Plan supprime')
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
      showSnack('Historique vide')
    } catch (nextError) {
      showSnack(`Erreur : ${nextError.message}`, 'error')
    }
  }

  const meatFilters = useMemo(
    () => [...new Set(sessions.map((session) => session.meat_key).filter(Boolean))],
    [sessions],
  )

  const filteredSessions = useMemo(
    () => (filter === 'all' ? sessions : sessions.filter((session) => session.meat_key === filter)),
    [filter, sessions],
  )

  const averageCook = useMemo(() => {
    const values = sessions.map((session) => session.cook_min || 0).filter(Boolean)
    if (!values.length) return '—'
    return formatDuration(values.reduce((sum, value) => sum + value, 0) / values.length)
  }, [sessions])

  const uniqueMeats = useMemo(
    () => new Set(sessions.map((session) => getMeatLabel(session))).size,
    [sessions],
  )

  const earliestStart = useMemo(() => {
    const starts = sessions.map((session) => session.start_time).filter(Boolean)
    return starts[0] || '—'
  }, [sessions])

  return (
    <div className="workshop-page">
      <style>{WORKSHOP_PAGE_CSS}</style>
      <Snack snack={snack} />

      <WorkshopHero
        kicker="Historique des plans"
        title={<>Retrouve les <span style={{ color: 'var(--ember)' }}>plans gardés</span></>}
        copy="Ici tu gardes les plans de cuisson que tu as choisi d’enregistrer. Ce n’est pas le journal terrain: c’est ta bibliothèque de départs, de températures et de fenêtres de service."
      />

      {authLoading ? (
        <WorkshopStateCard icon="⏳" title="Chargement du compte" copy="On verifie ton profil avant d’ouvrir l’historique." />
      ) : !user ? (
        <WorkshopStateCard
          icon="☁️"
          title="Connecte-toi pour retrouver tes plans"
          copy="Chaque plan garde ton heure de depart, la temperature fumoir et la fenetre de service pour que tu puisses repartir plus vite sur une prochaine cuisson."
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
        <WorkshopStateCard icon="🔥" title="Chargement de l’historique" copy="On recupere tes plans sauvegardes." />
      ) : error ? (
        <WorkshopStateCard
          icon="⚠️"
          title="Impossible de charger l’historique"
          copy={error}
          actions={(
            <button className="pm-btn-secondary" style={{ width: 'auto', minWidth: 180 }} onClick={() => loadSessions(user.id)}>
              Reessayer
            </button>
          )}
        />
      ) : !sessions.length ? (
        <WorkshopStateCard
          icon="📖"
          title="Aucun plan garde pour l’instant"
          copy="Depuis le calculateur, utilise “Garder dans l’historique” quand tu veux conserver un plan de depart et de service pour plus tard."
          actions={(
            <button className="pm-btn-primary" style={{ width: 'auto', minWidth: 220 }} onClick={() => navigate('/app')}>
              Aller au calculateur
            </button>
          )}
        />
      ) : (
        <>
          <WorkshopStatGrid
            items={[
              {
                label: 'Plans gardes',
                value: sessions.length,
                color: 'var(--orange-light)',
                copy: 'Chaque plan est un point de depart sauvegarde pour une prochaine cuisson.',
              },
              {
                label: 'Viandes',
                value: uniqueMeats,
                color: 'var(--ember)',
                copy: 'Tu vois tout de suite si ton historique est vraiment varie ou concentre sur deux ou trois pieces.',
              },
              {
                label: 'Cuisson moyenne',
                value: averageCook,
                color: 'var(--orange-light)',
                copy: `Premier depart garde: ${earliestStart}. Lis surtout ces chiffres comme des reperes, pas comme une science exacte.`,
              },
            ]}
          />

          <div className="pm-card">
            <WorkshopToolbar
              eyebrow={<>🕘 <span>Plans sauvegardes</span></>}
              title="Filtrer et relancer vite"
              copy="Retrouve une piece, relis ses repères et renvoie-toi vers le calculateur pour repartir d’une base connue."
              actions={(
                <div className="workshop-filter-row">
                  <button className={`workshop-filter${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
                    Tout ({sessions.length})
                  </button>
                  {meatFilters.map((meatKey) => (
                    <button key={meatKey} className={`workshop-filter${filter === meatKey ? ' active' : ''}`} onClick={() => setFilter(meatKey)}>
                      {MEATS[meatKey]?.name || meatKey}
                    </button>
                  ))}
                </div>
              )}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              {confirmDelete === 'all' ? (
                <div className="workshop-filter-row">
                  <span style={{ alignSelf: 'center', fontSize: 12, color: 'var(--text3)' }}>Confirmer ?</span>
                  <button className="workshop-filter active danger" onClick={deleteAll}>Oui, tout vider</button>
                  <button className="workshop-filter" onClick={() => setConfirmDelete(null)}>Annuler</button>
                </div>
              ) : (
                <button className="workshop-filter danger" onClick={() => setConfirmDelete('all')}>
                  Tout effacer
                </button>
              )}
            </div>
          </div>

          {filteredSessions.length ? filteredSessions.map((session) => (
            <article key={session.id} className="workshop-record">
              <div className="workshop-record-head">
                <div>
                  <div className="workshop-record-title">{getMeatLabel(session)}</div>
                  <div className="workshop-record-meta">
                    {session.date || '—'} · service {session.serve_time || '—'}
                  </div>
                </div>
                <div className="workshop-filter-row">
                  <button
                    className="workshop-filter"
                    onClick={() => navigate('/app', { state: { preselectMeatKey: session.meat_key } })}
                  >
                    Repartir sur cette viande
                  </button>
                  {confirmDelete === session.id ? (
                    <>
                      <button className="workshop-filter active danger" onClick={() => deleteSession(session.id)}>
                        Confirmer
                      </button>
                      <button className="workshop-filter" onClick={() => setConfirmDelete(null)}>
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button className="workshop-filter danger" onClick={() => setConfirmDelete(session.id)} disabled={deletingId === session.id}>
                      {deletingId === session.id ? '...' : 'Supprimer'}
                    </button>
                  )}
                </div>
              </div>

              <div className="workshop-chip-row">
                <span className="workshop-chip">🔥 depart {session.start_time || '—'}</span>
                {session.smoker_temp ? <span className="workshop-chip">🌡️ {session.smoker_temp}°C</span> : null}
                {session.weight ? <span className="workshop-chip">⚖️ {session.weight}kg</span> : null}
                {session.cook_min ? <span className="workshop-chip">⏱️ {formatDuration(session.cook_min)}</span> : null}
              </div>

              <div className="workshop-note">
                Plan garde pour servir vers <strong style={{ color: 'var(--text)' }}>{session.serve_time || '—'}</strong> avec un lancement conseille vers <strong style={{ color: 'var(--text)' }}>{session.start_time || '—'}</strong>.
              </div>
            </article>
          )) : (
            <WorkshopStateCard
              icon="🧭"
              title="Aucun plan dans ce filtre"
              copy="Change le filtre ou retourne au calculateur pour garder un nouveau plan."
            />
          )}
        </>
      )}
    </div>
  )
}
