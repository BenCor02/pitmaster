import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { deleteJournalEntryById, fetchUserJournalEntries } from '../modules/cooks/repository'
import { useSnack } from '../components/useSnack'
import Snack from '../components/Snack'

const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .fade-up{animation:fadeUp 0.2s ease both}
  .pm-card{background:#171410;border-radius:14px;border:1px solid #1e1a14;padding:20px;margin-bottom:10px}
  .pm-input{background:#0e0c0a;border:1px solid #252018;border-radius:10px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:14px;padding:11px 14px;outline:none;transition:all 0.15s;width:100%}
  .pm-input:focus{border-color:#f48c06;box-shadow:0 0 0 3px rgba(244,140,6,0.07)}
  .pm-field-label{display:block;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8a7060;margin-bottom:8px;font-family:'DM Sans',sans-serif}
  .pm-btn-ghost{padding:12px;border-radius:10px;border:1px solid #2a2418;background:#171410;color:#8a7060;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.15s;width:100%}
  .pm-btn-ghost:hover{border-color:#8a7060;background:#1e1a14;color:#d4c4b0}
  .journal-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;overflow:hidden;margin-bottom:10px;transition:border-color 0.15s}
  .journal-card:hover{border-color:#252018}
`

function Stars({ value }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ fontSize: 13, color: n <= value ? '#f48c06' : '#252018' }}>★</span>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📓</div>
      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, color: '#9a8870', marginBottom: 8 }}>
        Journal vide
      </div>
      <div style={{ fontSize: 13, color: '#8a7060', lineHeight: 1.6 }}>
        Lance un calcul de cuisson et utilise<br />
        le bouton <span style={{ color: '#f48c06' }}>📓 Journal</span> pour noter tes sessions
      </div>
    </div>
  )
}

export default function Journal() {
  const { user } = useAuth()
  const { snack, showSnack } = useSnack()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [deleting, setDeleting] = useState(null)

  const loadJournal = useCallback(async () => {
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchUserJournalEntries(user.id)
      setEntries(data)
    } catch (error) {
      showSnack('Erreur: ' + error.message, 'error')
    }
    setLoading(false)
  }, [showSnack, user])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadJournal()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadJournal])

  async function deleteEntry(id) {
    setDeleting(id)
    setDeleting(null)
    try {
      await deleteJournalEntryById(id)
      setEntries(prev => prev.filter(e => e.id !== id))
      showSnack('Entrée supprimée')
    } catch (error) {
      showSnack('Erreur: ' + error.message, 'error')
    }
  }

  const filtered = filter === 'all' ? entries : entries.filter(e => e.rating >= parseInt(filter))

  // Stats
  const avgRating = entries.length ? (entries.reduce((a,e)=>a+(e.rating||0),0)/entries.filter(e=>e.rating>0).length||0).toFixed(1) : '—'
  const meatCount = [...new Set(entries.map(e=>e.meat_name))].length
  const totalSessions = entries.length

  return (
    <div style={{ fontFamily: 'DM Sans,sans-serif' }}>
      <style>{css}</style>
      <Snack snack={snack} />

      {/* TITRE */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '-0.5px' }}>
          Mon <span style={{ color: '#f48c06' }}>Journal</span>
        </h1>
        <p style={{ fontSize: 11, color: '#8a7060', marginTop: 6, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
          Historique de tes sessions BBQ
        </p>
      </div>

      {/* STATS */}
      {entries.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Sessions', value: totalSessions, color: '#e85d04' },
            { label: 'Note moy.', value: avgRating !== 'NaN' ? avgRating + '★' : '—', color: '#f48c06' },
            { label: 'Viandes', value: meatCount, color: '#e85d04' },
          ].map((s,i) => (
            <div key={i} style={{ background: '#171410', border: '1px solid #1e1a14', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#8a7060', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* FILTRE */}
      {entries.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {[{v:'all',l:'Tout'},{v:'5',l:'★★★★★'},{v:'4',l:'★★★★+'},{v:'3',l:'★★★+'}].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)} style={{
              padding: '6px 14px', borderRadius: 8, border: `1px solid ${filter===f.v?'rgba(244,140,6,0.4)':'#1e1a14'}`,
              background: filter===f.v?'rgba(244,140,6,0.1)':'#171410',
              color: filter===f.v?'#f48c06':'#5a4a3a',
              fontFamily: 'Syne,sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s',
            }}>{f.l}</button>
          ))}
        </div>
      )}

      {/* LISTE */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8a7060', fontSize: 13 }}>
          Chargement...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        filtered.map(entry => (
          <div key={entry.id} className="journal-card fade-up">
            {/* PHOTO */}
            {entry.photo_url && (
              <img src={entry.photo_url} alt="Session BBQ" style={{ width: '100%', height: 180, objectFit: 'cover' }} />
            )}

            <div style={{ padding: 16 }}>
              {/* HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, color: '#d4c4b0', marginBottom: 3 }}>
                    {entry.meat_name}
                  </div>
                  <div style={{ fontSize: 11, color: '#8a7060' }}>
                    {entry.date} · Service {entry.serve_time || '—'}
                  </div>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  disabled={deleting === entry.id}
                  style={{ background: 'none', border: 'none', color: deleting===entry.id?'#3a2e24':'#3a2e24', cursor: 'pointer', fontSize: 16, padding: 4, lineHeight: 1, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color='#3a2e24'}
                >
                  ✕
                </button>
              </div>

              {/* RATING */}
              {entry.rating > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <Stars value={entry.rating} />
                  <span style={{ fontSize: 11, color: '#9a8870', marginLeft: 6 }}>
                    {['','Décevant','Passable','Bien','Très bien','Parfait !'][entry.rating]}
                  </span>
                </div>
              )}

              {/* NOTES */}
              {entry.notes && (
                <div style={{ fontSize: 13, color: '#9a8870', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 10, padding: '10px 12px', background: '#0e0c0a', borderRadius: 8, borderLeft: '2px solid rgba(244,140,6,0.3)' }}>
                  "{entry.notes}"
                </div>
              )}

              {/* META */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(232,93,4,0.08)', border: '1px solid rgba(232,93,4,0.2)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, fontFamily: 'DM Mono,monospace', color: '#e85d04' }}>
                  🔥 {entry.start_time || '—'}
                </span>
                {entry.smoker_temp && (
                  <span style={{ background: '#0e0c0a', border: '1px solid #1e1a14', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontFamily: 'DM Mono,monospace', color: '#9a8870' }}>
                    {entry.smoker_temp}°C
                  </span>
                )}
                {entry.weight && (
                  <span style={{ background: '#0e0c0a', border: '1px solid #1e1a14', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontFamily: 'DM Mono,monospace', color: '#9a8870' }}>
                    {entry.weight}kg
                  </span>
                )}
                {entry.cook_min && (
                  <span style={{ background: '#0e0c0a', border: '1px solid #1e1a14', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontFamily: 'DM Mono,monospace', color: '#9a8870' }}>
                    ~{Math.floor(entry.cook_min/60)}h{entry.cook_min%60>0?entry.cook_min%60+'min':''}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
