import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Snack from '../../../components/Snack'
import { useSnack } from '../../../components/useSnack'
import { useAuth } from '../../../context/AuthContext'
import { deleteJournalEntryById, fetchUserJournalEntries } from '../../../modules/cooks/repository'
import {
  WORKSHOP_PAGE_CSS,
  WorkshopHero,
  WorkshopStatGrid,
  WorkshopStateCard,
  WorkshopToolbar,
} from '../components/WorkshopPrimitives'

function Stars({ value }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: 14, color: n <= value ? 'var(--gold)' : '#2b2b2b' }}>★</span>
      ))}
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

export default function JournalPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { snack, showSnack } = useSnack()

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [deletingId, setDeletingId] = useState(null)

  async function loadEntries(userId) {
    setLoading(true)
    setError('')
    try {
      const data = await withTimeout(fetchUserJournalEntries(userId))
      setEntries(Array.isArray(data) ? data : [])
    } catch (nextError) {
      setEntries([])
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
        setEntries([])
        setError('')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      try {
        const data = await withTimeout(fetchUserJournalEntries(user.id))
        if (!active) return
        setEntries(Array.isArray(data) ? data : [])
      } catch (nextError) {
        if (!active) return
        setEntries([])
        setError(nextError.message || 'Erreur inconnue')
      } finally {
        if (active) setLoading(false)
      }
    }

    void run()
    return () => { active = false }
  }, [authLoading, user?.id])

  async function deleteEntry(id) {
    setDeletingId(id)
    try {
      await deleteJournalEntryById(id)
      setEntries((prev) => prev.filter((entry) => entry.id !== id))
      showSnack('Entree supprimee')
    } catch (nextError) {
      showSnack(`Erreur : ${nextError.message}`, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return entries
    const minRating = parseInt(filter, 10)
    return entries.filter((entry) => (entry.rating || 0) >= minRating)
  }, [entries, filter])

  const ratedEntries = useMemo(() => entries.filter((entry) => (entry.rating || 0) > 0), [entries])
  const avgRating = useMemo(() => {
    if (!ratedEntries.length) return '—'
    return `${(ratedEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0) / ratedEntries.length).toFixed(1)}★`
  }, [ratedEntries])
  const uniqueMeats = useMemo(
    () => new Set(entries.map((entry) => entry.meat_name).filter(Boolean)).size,
    [entries],
  )

  return (
    <div className="workshop-page">
      <style>{WORKSHOP_PAGE_CSS}</style>
      <Snack snack={snack} />

      <WorkshopHero
        kicker="Journal de cuisson"
        title={<>Garde les <span style={{ color: 'var(--ember)' }}>vraies observations terrain</span></>}
        copy="Le journal ne garde pas seulement un plan. Il garde ce que tu as vraiment vu au fumoir: texture, bark, repos, service et tout ce que tu veux retrouver la prochaine fois."
      />

      {authLoading ? (
        <WorkshopStateCard icon="⏳" title="Chargement du compte" copy="On verifie ton profil avant d’ouvrir le journal." />
      ) : !user ? (
        <WorkshopStateCard
          icon="📓"
          title="Connecte-toi pour ouvrir ton journal"
          copy="Tes notes terrain, tes retours de service et tes essais de cuisson restent attaches a ton compte pour construire une vraie memoire de pitmaster."
          actions={(
            <>
              <button className="pm-btn-primary" style={{ width: 'auto', minWidth: 200 }} onClick={() => navigate('/auth', { state: { from: '/app/journal', reason: 'journal-access' } })}>
                Se connecter
              </button>
              <button className="pm-btn-secondary" style={{ width: 'auto', minWidth: 180 }} onClick={() => navigate('/app')}>
                Retour calculateur
              </button>
            </>
          )}
        />
      ) : loading ? (
        <WorkshopStateCard icon="🔥" title="Chargement du journal" copy="On recupere tes notes de cuisson." />
      ) : error ? (
        <WorkshopStateCard
          icon="⚠️"
          title="Impossible de charger le journal"
          copy={error}
          actions={(
            <button className="pm-btn-secondary" style={{ width: 'auto', minWidth: 180 }} onClick={() => loadEntries(user.id)}>
              Reessayer
            </button>
          )}
        />
      ) : !entries.length ? (
        <WorkshopStateCard
          icon="📝"
          title="Aucune note pour l’instant"
          copy="Depuis le calculateur, utilise “Ajouter au journal” quand tu veux garder une observation utile sur une vraie cuisson."
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
                label: 'Entrees',
                value: entries.length,
                color: 'var(--orange-light)',
                copy: 'Chaque entree capture un retour terrain, pas juste un resultat theorique.',
              },
              {
                label: 'Note moyenne',
                value: avgRating,
                color: 'var(--ember)',
                copy: 'Utile pour voir si tu progresses vraiment sur la regularite des cuissons.',
              },
              {
                label: 'Viandes notees',
                value: uniqueMeats,
                color: 'var(--orange-light)',
                copy: 'Plus tu varies, plus ton journal devient un vrai livre de repères.',
              },
            ]}
          />

          <div className="pm-card">
            <WorkshopToolbar
              eyebrow={<>📓 <span>Notes enregistrees</span></>}
              title="Filtrer les retours utiles"
              copy="Isole tes meilleures cuissons ou les plus compliquées pour retrouver plus vite ce qui marche vraiment."
              actions={(
                <div className="workshop-filter-row">
                  {[
                    { value: 'all', label: 'Tout' },
                    { value: '5', label: '★★★★★' },
                    { value: '4', label: '★★★★+' },
                    { value: '3', label: '★★★+' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      className={`workshop-filter${filter === item.value ? ' active' : ''}`}
                      onClick={() => setFilter(item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {filteredEntries.length ? filteredEntries.map((entry) => (
            <article key={entry.id} className="workshop-record">
              {entry.photo_url ? (
                <img
                  src={entry.photo_url}
                  alt={entry.meat_name || 'Session BBQ'}
                  style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block', borderRadius: 16, marginBottom: 14 }}
                />
              ) : null}

              <div className="workshop-record-head">
                <div>
                  <div className="workshop-record-title">{entry.meat_name || 'Session BBQ'}</div>
                  <div className="workshop-record-meta">
                    {entry.date || '—'} · service {entry.serve_time || '—'} · depart {entry.start_time || '—'}
                  </div>
                </div>
                <div className="workshop-filter-row">
                  <button
                    className="workshop-filter"
                    onClick={() => navigate('/app', { state: { preselectMeatKey: entry.tags?.[0] } })}
                  >
                    Repartir sur cette viande
                  </button>
                  <button className="workshop-filter danger" onClick={() => deleteEntry(entry.id)} disabled={deletingId === entry.id}>
                    {deletingId === entry.id ? '...' : 'Supprimer'}
                  </button>
                </div>
              </div>

              <div className="workshop-chip-row">
                {entry.rating ? (
                  <span className="workshop-chip">
                    <Stars value={entry.rating} />
                  </span>
                ) : null}
                {entry.smoker_temp ? <span className="workshop-chip">🌡️ {entry.smoker_temp}°C</span> : null}
                {entry.weight ? <span className="workshop-chip">⚖️ {entry.weight}kg</span> : null}
                {Array.isArray(entry.tags) ? entry.tags.map((tag) => (
                  <span key={tag} className="workshop-chip">#{tag}</span>
                )) : null}
              </div>

              {entry.notes ? (
                <div className="workshop-note">
                  {entry.notes}
                </div>
              ) : null}
            </article>
          )) : (
            <WorkshopStateCard
              icon="🧭"
              title="Aucune entree dans ce filtre"
              copy="Baisse le filtre ou retourne au calculateur pour ajouter un nouveau retour terrain."
            />
          )}
        </>
      )}
    </div>
  )
}
