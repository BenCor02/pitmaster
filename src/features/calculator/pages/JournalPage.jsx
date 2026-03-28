import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { deleteJournalEntryById, fetchUserJournalEntries } from '../../../modules/cooks/repository'
import { useSnack } from '../../../components/useSnack'
import Snack from '../../../components/Snack'

const css = `
  .journal-page{font-family:'DM Sans',sans-serif}
  .journal-stat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
  .journal-stat-card{background:linear-gradient(180deg,#1a1a1a,#161616);border:1px solid var(--border);border-radius:16px;padding:16px;box-shadow:var(--shadow-soft)}
  .journal-stat-value{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;line-height:1;color:var(--text)}
  .journal-stat-label{margin-top:6px;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--text3)}
  .journal-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}
  .journal-filters{display:flex;gap:8px;flex-wrap:wrap}
  .journal-filter{padding:10px 14px;border-radius:12px;border:1px solid var(--border);background:linear-gradient(180deg,#1a1a1a,#161616);color:var(--text3);font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s}
  .journal-filter:hover{border-color:var(--border2);color:var(--text)}
  .journal-filter.active{border-color:var(--orange-border);background:var(--orange-bg);color:var(--ember)}
  .journal-entry{background:linear-gradient(180deg,#1a1a1a,#161616);border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-soft);margin-bottom:12px}
  .journal-entry-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px}
  .journal-entry-title{font-family:'Syne',sans-serif;font-weight:800;font-size:18px;color:var(--text);line-height:1.05}
  .journal-entry-meta{font-size:12px;color:var(--text3);margin-top:5px}
  .journal-chip-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
  .journal-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 10px;border-radius:999px;border:1px solid var(--border);background:#111111;color:var(--text2);font-size:11px;font-family:'DM Mono',monospace}
  .journal-note{font-size:13px;color:var(--text2);line-height:1.7;padding:14px 16px;border-radius:14px;background:#111111;border:1px solid var(--border);margin-top:12px}
  .journal-delete{width:36px;height:36px;border-radius:12px;border:1px solid var(--border);background:#111111;color:var(--text3);cursor:pointer;transition:all .15s}
  .journal-delete:hover{border-color:rgba(251,113,133,0.35);color:#fb7185}
  .journal-empty-shell{padding:34px 24px;text-align:center}
  .journal-empty-icon{font-size:46px;margin-bottom:12px}
  .journal-empty-title{font-family:'Syne',sans-serif;font-weight:800;font-size:22px;color:var(--text);margin-bottom:8px}
  .journal-empty-copy{font-size:13px;color:var(--text3);line-height:1.7;max-width:540px;margin:0 auto 18px}
  .journal-empty-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}
  @media(max-width:900px){
    .journal-stat-grid{grid-template-columns:1fr}
  }
`

function Stars({ value }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: 14, color: n <= value ? 'var(--gold)' : '#2b2b2b' }}>★</span>
      ))}
    </div>
  )
}

function StateCard({ icon, title, copy, actions }) {
  return (
    <div className="pm-card">
      <div className="journal-empty-shell">
        <div className="journal-empty-icon">{icon}</div>
        <div className="journal-empty-title">{title}</div>
        <div className="journal-empty-copy">{copy}</div>
        {actions ? <div className="journal-empty-actions">{actions}</div> : null}
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
    <div className="journal-page">
      <style>{css}</style>
      <Snack snack={snack} />

      <div className="pm-hero-shell" style={{ marginBottom: 18 }}>
        <div className="pm-kicker" style={{ marginBottom: 12 }}>Journal de cuisson</div>
        <h1 style={{ marginBottom: 8 }}>
          Garde les vraies <span style={{ color: 'var(--ember)' }}>observations terrain</span>
        </h1>
        <p style={{ maxWidth: 760 }}>
          Ici, tu notes ce qui s’est vraiment passé au fumoir : texture, couleur, repos, service, et ce que tu veux retenir pour la prochaine cuisson.
        </p>
      </div>

      {authLoading ? (
        <StateCard icon="⏳" title="Chargement du compte" copy="On vérifie ton profil avant d’ouvrir le journal." />
      ) : !user ? (
        <StateCard
          icon="📓"
          title="Connecte-toi pour ouvrir ton journal"
          copy="Le journal garde tes notes de cuisson, tes observations terrain et tes retours de service. Il est séparé de l’historique des plans."
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
        <StateCard icon="🔥" title="Chargement du journal" copy="On récupère tes entrées de cuisson." />
      ) : error ? (
        <StateCard
          icon="⚠️"
          title="Impossible de charger le journal"
          copy={error}
          actions={(
            <button className="pm-btn-secondary" style={{ width: 'auto', minWidth: 180 }} onClick={() => loadEntries(user.id)}>
              Réessayer
            </button>
          )}
        />
      ) : filteredEntries.length === 0 ? (
        <StateCard
          icon="📝"
          title="Aucune note pour l’instant"
          copy="Ajoute une entrée depuis le calculateur avec le bouton “Ajouter au journal” pour commencer à construire ta mémoire de cuisson."
          actions={(
            <button className="pm-btn-primary" style={{ width: 'auto', minWidth: 220 }} onClick={() => navigate('/app')}>
              Aller au calculateur
            </button>
          )}
        />
      ) : (
        <>
          <div className="journal-stat-grid" style={{ marginBottom: 14 }}>
            {[
              { label: 'Entrées', value: entries.length, color: 'var(--orange-light)' },
              { label: 'Note moyenne', value: avgRating === '—' ? '—' : `${avgRating}★`, color: 'var(--ember)' },
              { label: 'Viandes notées', value: meatCount, color: 'var(--orange-light)' },
            ].map((item) => (
              <div key={item.label} className="journal-stat-card">
                <div className="journal-stat-value" style={{ color: item.color }}>{item.value}</div>
                <div className="journal-stat-label">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="pm-card">
            <div className="journal-toolbar">
              <div>
                <div className="pm-sec-label">📓 Notes enregistrées</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
                  Filtre tes retours de cuisson selon la note que tu as donnée.
                </div>
              </div>
              <div className="journal-filters">
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
            </div>
          </div>

          {filteredEntries.map((entry) => (
            <article key={entry.id} className="journal-entry">
              {entry.photo_url ? (
                <img src={entry.photo_url} alt="Session BBQ" style={{ width: '100%', height: 210, objectFit: 'cover', display: 'block' }} />
              ) : null}
              <div style={{ padding: 18 }}>
                <div className="journal-entry-head">
                  <div>
                    <div className="journal-entry-title">{entry.meat_name || 'Session BBQ'}</div>
                    <div className="journal-entry-meta">
                      {entry.date || '—'} · Service {entry.serve_time || '—'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    disabled={deletingId === entry.id}
                    className="journal-delete"
                    title="Supprimer l’entrée"
                  >
                    {deletingId === entry.id ? '…' : '✕'}
                  </button>
                </div>

                {(entry.rating || 0) > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Stars value={entry.rating} />
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                      {['', 'Décevant', 'Passable', 'Bien', 'Très bien', 'Parfait'][entry.rating] || ''}
                    </span>
                  </div>
                ) : null}

                {entry.notes ? (
                  <div className="journal-note">{entry.notes}</div>
                ) : null}

                <div className="journal-chip-row">
                  <span className="journal-chip">🔥 Départ {entry.start_time || '—'}</span>
                  {entry.smoker_temp ? <span className="journal-chip">{entry.smoker_temp}°C fumoir</span> : null}
                  {entry.weight ? <span className="journal-chip">{entry.weight}kg</span> : null}
                  {entry.cook_min ? <span className="journal-chip">~{Math.floor(entry.cook_min / 60)}h{entry.cook_min % 60 ? `${entry.cook_min % 60}min` : ''}</span> : null}
                </div>
              </div>
            </article>
          ))}
        </>
      )}
    </div>
  )
}
