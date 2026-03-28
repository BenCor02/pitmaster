import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { deleteJournalEntryById, fetchUserJournalEntries } from '../../../modules/cooks/repository'
import { useSnack } from '../../../components/useSnack'
import Snack from '../../../components/Snack'

const css = `
  .journal-shell{font-family:'DM Sans',sans-serif}
  .journal-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;overflow:hidden;margin-bottom:10px;transition:border-color .15s}
  .journal-card:hover{border-color:#252018}
  .journal-chip{background:#0e0c0a;border:1px solid #1e1a14;border-radius:6px;padding:3px 8px;font-size:11px;font-family:'DM Mono',monospace;color:#9a8870}
  .journal-chip-hot{background:rgba(232,93,4,0.08);border:1px solid rgba(232,93,4,0.2);border-radius:6px;padding:3px 8px;font-size:11px;font-family:'DM Mono',monospace;color:#e85d04}
  .journal-filter{padding:6px 14px;border-radius:8px;border:1px solid #1e1a14;background:#171410;color:#8a7060;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s}
  .journal-filter.active{border-color:rgba(244,140,6,0.4);background:rgba(244,140,6,0.1);color:#f48c06}
  .journal-filter:hover:not(.active){border-color:#2a2418;color:#d4c4b0}
  .journal-action{padding:12px 16px;border-radius:12px;border:1px solid #2a2418;background:#171410;color:#d4c4b0;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s}
  .journal-action:hover{border-color:rgba(244,140,6,0.35);color:#fff}
`

function GuestState({ onAuth, onBack }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📓</div>
      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, color: '#d4c4b0', marginBottom: 8 }}>
        Connecte-toi pour ouvrir ton journal
      </div>
      <div style={{ fontSize: 13, color: '#8a7060', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 18px' }}>
        Le journal garde tes notes de cuisson, tes observations terrain et tes photos pour t’aider à progresser de session en session.
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button className="journal-action" onClick={onAuth}>Se connecter</button>
        <button className="journal-action" onClick={onBack}>Retour au calculateur</button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, color: '#d4c4b0', marginBottom: 8 }}>
        Aucun journal pour l’instant
      </div>
      <div style={{ fontSize: 13, color: '#8a7060', lineHeight: 1.7 }}>
        Le journal sera utile dès que l’on branchera l’écriture complète des notes de cuisson.<br />
        La lecture est maintenant stable, même sans donnée.
      </div>
    </div>
  )
}

function LoadingState({ label = 'Chargement du journal…' }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8a7060', fontSize: 13 }}>
      {label}
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <div style={{ fontSize: 42, marginBottom: 14 }}>⚠️</div>
      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, color: '#d4c4b0', marginBottom: 8 }}>
        Impossible de charger le journal
      </div>
      <div style={{ fontSize: 13, color: '#8a7060', lineHeight: 1.7, marginBottom: 16 }}>
        {message}
      </div>
      <button className="journal-action" onClick={onRetry}>Réessayer</button>
    </div>
  )
}

function Stars({ value }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: 13, color: n <= value ? '#f48c06' : '#252018' }}>★</span>
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
  }, [user?.id, authLoading])

  async function deleteEntry(id) {
    setDeletingId(id)
    try {
      await deleteJournalEntryById(id)
      setEntries((prev) => prev.filter((entry) => entry.id !== id))
      showSnack('Entrée supprimée')
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
    return (ratedEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0) / ratedEntries.length).toFixed(1)
  }, [ratedEntries])
  const meatCount = useMemo(() => new Set(entries.map((entry) => entry.meat_name).filter(Boolean)).size, [entries])

  return (
    <div className="journal-shell">
      <style>{css}</style>
      <Snack snack={snack} />

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '-0.5px' }}>
          Mon <span style={{ color: '#f48c06' }}>Journal</span>
        </h1>
        <p style={{ fontSize: 11, color: '#8a7060', marginTop: 6, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
          Notes et observations de cuisson
        </p>
      </div>

      {authLoading ? (
        <LoadingState label="Chargement du compte…" />
      ) : !user ? (
        <GuestState
          onAuth={() => navigate('/auth', { state: { from: '/app/journal', reason: 'journal-access' } })}
          onBack={() => navigate('/app')}
        />
      ) : loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadEntries(user.id)} />
      ) : filteredEntries.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8, marginBottom: 20 }}>
            {[
              { label: 'Entrées', value: entries.length, color: '#e85d04' },
              { label: 'Note moy.', value: avgRating === '—' ? '—' : `${avgRating}★`, color: '#f48c06' },
              { label: 'Viandes', value: meatCount, color: '#e85d04' },
            ].map((item) => (
              <div key={item.label} style={{ background: '#171410', border: '1px solid #1e1a14', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, color: item.color, lineHeight: 1 }}>{item.value}</div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#8a7060', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { value: 'all', label: 'Tout' },
              { value: '5', label: '★★★★★' },
              { value: '4', label: '★★★★+' },
              { value: '3', label: '★★★+' },
            ].map((item) => (
              <button
                key={item.value}
                className={`journal-filter${filter === item.value ? ' active' : ''}`}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {filteredEntries.map((entry) => (
            <div key={entry.id} className="journal-card">
              {entry.photo_url ? (
                <img src={entry.photo_url} alt="Session BBQ" style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              ) : null}
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, color: '#d4c4b0', marginBottom: 3 }}>
                      {entry.meat_name || 'Session BBQ'}
                    </div>
                    <div style={{ fontSize: 11, color: '#8a7060' }}>
                      {entry.date || '—'} · Service {entry.serve_time || '—'}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    disabled={deletingId === entry.id}
                    style={{ background: 'none', border: 'none', color: deletingId === entry.id ? '#8a7060' : '#3a2e24', cursor: 'pointer', fontSize: 16, padding: 4, lineHeight: 1 }}
                  >
                    {deletingId === entry.id ? '…' : '✕'}
                  </button>
                </div>

                {(entry.rating || 0) > 0 ? (
                  <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Stars value={entry.rating} />
                    <span style={{ fontSize: 11, color: '#9a8870' }}>
                      {['', 'Décevant', 'Passable', 'Bien', 'Très bien', 'Parfait !'][entry.rating] || ''}
                    </span>
                  </div>
                ) : null}

                {entry.notes ? (
                  <div style={{ fontSize: 13, color: '#9a8870', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 10, padding: '10px 12px', background: '#0e0c0a', borderRadius: 8, borderLeft: '2px solid rgba(244,140,6,0.3)' }}>
                    “{entry.notes}”
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="journal-chip-hot">🔥 {entry.start_time || '—'}</span>
                  {entry.smoker_temp ? <span className="journal-chip">{entry.smoker_temp}°C</span> : null}
                  {entry.weight ? <span className="journal-chip">{entry.weight}kg</span> : null}
                  {entry.cook_min ? <span className="journal-chip">~{Math.floor(entry.cook_min / 60)}h{entry.cook_min % 60 ? `${entry.cook_min % 60}min` : ''}</span> : null}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
