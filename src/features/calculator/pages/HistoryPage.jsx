import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import {
  deleteAllCookSessionsForUser,
  deleteCookSessionById,
  fetchUserCookSessions,
} from '../../../modules/cooks/repository'
import { useSnack } from '../../../components/useSnack'
import Snack from '../../../components/Snack'

function fd(m) { const h = Math.floor(m / 60), mn = m % 60; return mn === 0 ? `${h}h` : `${h}h${String(mn).padStart(2, '0')}` }

const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .fade-up{animation:fadeUp 0.2s ease both}
  .h-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;padding:18px;margin-bottom:10px;transition:border-color 0.15s;cursor:default}
  .h-card:hover{border-color:#2a2418}
  .h-badge{background:#0e0c0a;border:1px solid #1e1a14;border-radius:6px;padding:3px 8px;font-size:11px;font-family:'DM Mono',monospace;color:#8a7060}
  .h-badge-hot{background:rgba(232,93,4,0.08);border:1px solid rgba(232,93,4,0.2);border-radius:6px;padding:3px 8px;font-size:11px;font-family:'DM Mono',monospace;color:#e85d04}
  .del-btn{background:none;border:none;color:#3a3028;cursor:pointer;font-size:15px;padding:4px;line-height:1;transition:color 0.15s}
  .del-btn:hover{color:#ef4444}
  .filter-btn{padding:6px 14px;border-radius:8px;border:1px solid #1e1a14;background:#171410;color:#8a7060;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s}
  .filter-btn.active{border-color:rgba(232,93,4,0.4);background:rgba(232,93,4,0.1);color:#e85d04}
  .filter-btn:hover:not(.active){border-color:#2a2418;color:#d4c4b0}
`

const MEAT_NAMES = {
  brisket: 'Brisket', pork_shoulder: 'Pulled Pork', ribs_pork: 'Spare Ribs',
  ribs_beef: 'Beef Ribs', lamb_shoulder: 'Épaule agneau', }

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, color: '#8a7060', marginBottom: 8 }}>
        Aucune session sauvegardée
      </div>
      <div style={{ fontSize: 13, color: '#6a5a4a', lineHeight: 1.6 }}>
        Lance un calcul et clique sur<br />
        <span style={{ color: '#e85d04' }}>☁️ Historique</span> pour sauvegarder
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const { user } = useAuth()
  const { snack, showSnack } = useSnack()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [deleting, setDeleting] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const loadSessions = useCallback(async () => {
    if (!user) {
      setSessions([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchUserCookSessions(user.id)
      setSessions(data)
    } catch (error) {
      showSnack('Erreur: ' + error.message, 'error')
    }
    setLoading(false)
  }, [showSnack, user])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSessions()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadSessions])

  async function deleteSession(id) {
    setDeleting(id)
    setDeleting(null)
    setConfirmDelete(null)
    try {
      await deleteCookSessionById(id)
      setSessions(prev => prev.filter(s => s.id !== id))
      showSnack('Session supprimée')
    } catch (error) {
      showSnack('Erreur: ' + error.message, 'error')
    }
  }

  async function deleteAll() {
    try {
      await deleteAllCookSessionsForUser(user.id)
      setSessions([])
      showSnack('Historique effacé')
    } catch (error) {
      showSnack('Erreur: ' + error.message, 'error')
    }
  }

  // Filtres
  const allMeats = [...new Set(sessions.map(s => s.meat_key).filter(Boolean))]
  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.meat_key === filter)

  // Stats
  const totalSessions = sessions.length
  const uniqueMeats = [...new Set(sessions.map(s => s.meat_name))].length
  const avgCook = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + (s.cook_min || 0), 0) / sessions.length)
    : 0

  return (
    <div style={{ fontFamily: 'DM Sans,sans-serif' }}>
      <style>{css}</style>
      <Snack snack={snack} />

      {/* TITRE */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '-0.5px' }}>
          Historique <span style={{ color: '#e85d04' }}>·</span>
        </h1>
        <p style={{ fontSize: 11, color: '#8a7060', marginTop: 6, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
          Toutes tes sessions BBQ
        </p>
      </div>

      {/* STATS */}
      {sessions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Sessions', value: totalSessions, color: '#e85d04' },
            { label: 'Viandes', value: uniqueMeats, color: '#f48c06' },
            { label: 'Durée moy.', value: fd(avgCook), color: '#e85d04' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#171410', border: '1px solid #1e1a14', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#6a5a4a', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* FILTRES */}
      {sessions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            <button className={`filter-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
              Tout ({sessions.length})
            </button>
            {allMeats.map(mk => (
              <button key={mk} className={`filter-btn${filter === mk ? ' active' : ''}`} onClick={() => setFilter(mk)}>
                {MEAT_NAMES[mk] || mk} ({sessions.filter(s => s.meat_key === mk).length})
              </button>
            ))}
          </div>

          {/* TOUT EFFACER */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {confirmDelete === 'all' ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#8a7060' }}>Confirmer ?</span>
                <button onClick={deleteAll} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontFamily: 'Syne,sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Oui, effacer
                </button>
                <button onClick={() => setConfirmDelete(null)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #1e1a14', background: 'transparent', color: '#8a7060', fontFamily: 'Syne,sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Annuler
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete('all')} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #1e1a14', background: 'transparent', color: '#4a3a2e', fontFamily: 'Syne,sans-serif', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#4a3a2e'; e.currentTarget.style.borderColor = '#1e1a14' }}>
                🗑 Tout effacer
              </button>
            )}
          </div>
        </div>
      )}

      {/* LISTE */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6a5a4a', fontSize: 13 }}>
          Chargement...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        filtered.map((session, idx) => (
          <div key={session.id} className="h-card fade-up" style={{ animationDelay: `${idx * 0.03}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, color: '#d4c4b0', marginBottom: 3 }}>
                  {session.meat_name}
                </div>
                <div style={{ fontSize: 11, color: '#6a5a4a' }}>
                  {session.date} · Service à {session.serve_time || '—'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {confirmDelete === session.id ? (
                  <>
                    <button onClick={() => deleteSession(session.id)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontFamily: 'Syne,sans-serif', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                      Supprimer
                    </button>
                    <button onClick={() => setConfirmDelete(null)} className="del-btn" style={{ color: '#6a5a4a' }}>✕</button>
                  </>
                ) : (
                  <button className="del-btn" onClick={() => setConfirmDelete(session.id)} disabled={deleting === session.id}>
                    {deleting === session.id ? '⏳' : '🗑'}
                  </button>
                )}
              </div>
            </div>

            {/* META BADGES */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              <span className="h-badge-hot">🔥 {session.start_time || '—'}</span>
              {session.smoker_temp && <span className="h-badge">{session.smoker_temp}°C</span>}
              {session.weight && <span className="h-badge">{session.weight}kg</span>}
              {session.cook_min && <span className="h-badge">~{fd(session.cook_min)}</span>}
            </div>

            {/* BARRE DE PROGRESSION CUISSON */}
            {session.cook_min && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: '#4a3a2e', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Durée de cuisson</span>
                  <span style={{ fontSize: 10, color: '#8a7060', fontFamily: 'DM Mono,monospace' }}>{fd(session.cook_min)}</span>
                </div>
                <div style={{ height: 3, background: '#1e1a14', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, (session.cook_min / 720) * 100)}%`,
                    background: 'linear-gradient(90deg, #f48c06, #e85d04)',
                    borderRadius: 2,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                  <span style={{ fontSize: 9, color: '#3a2e24' }}>0h</span>
                  <span style={{ fontSize: 9, color: '#3a2e24' }}>12h</span>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
