import { useState, useEffect } from 'react'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import { Link, useSearchParams } from 'react-router-dom'
import { journal } from '../lib/journal.js'

// ── Rating stars ──────────────────────────────────────────
function Stars({ value, onChange, readonly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          className={`text-lg transition-all ${
            n <= value
              ? 'text-orange-400 scale-110'
              : 'text-zinc-700 hover:text-zinc-500'
          } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────
export default function JournalPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [searchParams] = useSearchParams()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // list | form | detail
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  // Charger les sessions
  useEffect(() => {
    if (!isAuthenticated) return
    loadSessions()
  }, [isAuthenticated])

  // Pré-remplir depuis le calculateur (via ?prefill=...)
  useEffect(() => {
    const prefill = searchParams.get('prefill')
    if (prefill && isAuthenticated) {
      try {
        const data = JSON.parse(decodeURIComponent(prefill))
        setEditing({
          ...emptySession(),
          ...data,
        })
        setView('form')
      } catch (e) {
        console.error('Prefill error:', e)
      }
    }
  }, [searchParams, isAuthenticated])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const data = await journal.list()
      setSessions(data)
    } catch (err) {
      console.error('Journal load error:', err)
    }
    setLoading(false)
  }

  // ── Gate : non connecté ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Chargement...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📓</span>
          </div>
          <h1 className="text-[20px] font-bold text-white mb-2">Journal de cuisson</h1>
          <p className="text-[14px] text-zinc-400 mb-6 leading-relaxed">
            Connecte-toi pour enregistrer tes sessions de cuisson, noter ce qui a marché et ce qu'il faut améliorer.
          </p>
          <Link
            to="/login"
            state={{ from: '/journal' }}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-[14px]"
          >
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  // ── Handlers ──
  const handleNew = () => {
    setEditing(emptySession())
    setView('form')
  }

  const handleEdit = (session) => {
    setEditing({ ...session })
    setView('form')
  }

  const handleDetail = (session) => {
    setEditing(session)
    setView('detail')
  }

  const handleSave = async (data) => {
    setSaving(true)
    try {
      if (data.id) {
        await journal.update(data.id, data)
      } else {
        await journal.create(data)
      }
      await loadSessions()
      setView('list')
      setEditing(null)
    } catch (err) {
      console.error('Save error:', err)
      alert('Erreur : ' + (err.message || 'Impossible de sauvegarder'))
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette session ?')) return
    try {
      await journal.remove(id)
      await loadSessions()
      setView('list')
      setEditing(null)
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 lg:px-10 py-6 border-b border-white/[0.06]">
        <div className="max-w-3xl flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-white tracking-tight">Journal de cuisson</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} enregistrée{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
          {view !== 'list' ? (
            <button
              onClick={() => { setView('list'); setEditing(null) }}
              className="text-[13px] font-medium text-zinc-400 hover:text-white px-4 py-2 rounded-xl hover:bg-white/[0.04] transition-all"
            >
              ← Retour
            </button>
          ) : (
            <button onClick={handleNew} className="btn-primary px-4 py-2.5 text-[13px]">
              + Nouvelle session
            </button>
          )}
        </div>
      </div>

      <div className="px-6 lg:px-10 py-8 max-w-3xl">
        {view === 'list' && (
          <SessionList
            sessions={sessions}
            loading={loading}
            onView={handleDetail}
            onNew={handleNew}
          />
        )}

        {view === 'form' && (
          <SessionForm
            session={editing}
            saving={saving}
            onSave={handleSave}
            onCancel={() => { setView('list'); setEditing(null) }}
          />
        )}

        {view === 'detail' && editing && (
          <SessionDetail
            session={editing}
            onEdit={() => handleEdit(editing)}
            onDelete={() => handleDelete(editing.id)}
          />
        )}
      </div>
    </div>
  )
}

// ── Liste ──────────────────────────────────────────────────
function SessionList({ sessions, loading, onView, onNew }) {
  if (loading) {
    return <div className="text-center py-12 text-zinc-600 text-[13px]">Chargement...</div>
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📓</span>
        </div>
        <p className="text-[15px] font-semibold text-white mb-1">Aucune session</p>
        <p className="text-[13px] text-zinc-500 mb-6">Lance une cuisson et enregistre ta session ici.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onNew} className="btn-primary px-5 py-2.5 text-[13px]">
            + Nouvelle session
          </button>
          <Link to="/" className="px-5 py-2.5 text-[13px] font-medium text-zinc-400 hover:text-white border border-white/[0.08] rounded-xl hover:bg-white/[0.03] transition-all">
            Lancer le calculateur
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sessions.map(s => (
        <button
          key={s.id}
          onClick={() => onView(s)}
          className="surface w-full text-left p-4 hover:border-orange-500/15 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-lg shrink-0">
              🥩
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[14px] font-semibold text-white truncate">{s.meat_name}</p>
                {s.rating && <Stars value={s.rating} readonly />}
              </div>
              <p className="text-[12px] text-zinc-500">
                {formatDate(s.cook_date)}
                {s.weight_kg ? ` · ${s.weight_kg}kg` : ''}
                {s.cook_temp_c ? ` · ${s.cook_temp_c}°C` : ''}
                {s.wood_type ? ` · ${s.wood_type}` : ''}
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  )
}

// ── Détail ─────────────────────────────────────────────────
function SessionDetail({ session, onEdit, onDelete }) {
  const s = session

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="surface p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-2xl">🥩</div>
            <div>
              <h2 className="text-[18px] font-bold text-white">{s.meat_name}</h2>
              <p className="text-[12px] text-zinc-500">{formatDate(s.cook_date)}</p>
            </div>
          </div>
          {s.rating && <Stars value={s.rating} readonly />}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {s.weight_kg && <Tag label={`${s.weight_kg} kg`} />}
          {s.cook_temp_c && <Tag label={`${s.cook_temp_c}°C`} />}
          {s.wrapped && <Tag label="Wrappé" />}
          {s.doneness && <Tag label={s.doneness} />}
          {s.wood_type && <Tag label={s.wood_type} />}
          {s.smoker_type && <Tag label={s.smoker_type} />}
          {s.actual_duration_hours && <Tag label={`${s.actual_duration_hours}h réelles`} />}
          {s.internal_temp_reached && <Tag label={`${s.internal_temp_reached}°C atteint`} />}
        </div>
      </div>

      {/* Rub */}
      {s.rub_used && (
        <div className="surface p-5">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Rub utilisé</p>
          <p className="text-[14px] text-zinc-200 leading-relaxed">{s.rub_used}</p>
        </div>
      )}

      {/* Notes */}
      {s.notes && (
        <div className="surface p-5">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Notes</p>
          <p className="text-[14px] text-zinc-300 leading-relaxed whitespace-pre-wrap">{s.notes}</p>
        </div>
      )}

      {/* Bilan */}
      {(s.what_went_well || s.what_to_improve) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {s.what_went_well && (
            <div className="surface p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">✅</span>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Ce qui a marché</p>
              </div>
              <p className="text-[13px] text-zinc-300 leading-relaxed whitespace-pre-wrap">{s.what_went_well}</p>
            </div>
          )}
          {s.what_to_improve && (
            <div className="surface p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">🔧</span>
                <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">À améliorer</p>
              </div>
              <p className="text-[13px] text-zinc-300 leading-relaxed whitespace-pre-wrap">{s.what_to_improve}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onEdit} className="btn-primary px-5 py-2.5 text-[13px]">Modifier</button>
        <button onClick={onDelete} className="px-5 py-2.5 text-[13px] font-medium text-red-400/70 hover:text-red-400 border border-white/[0.06] rounded-xl hover:bg-red-500/5 transition-all">
          Supprimer
        </button>
      </div>
    </div>
  )
}

// ── Formulaire ─────────────────────────────────────────────
function SessionForm({ session, saving, onSave, onCancel }) {
  const [form, setForm] = useState({ ...session })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-5 animate-fade-up max-w-2xl">
      <h2 className="text-[16px] font-bold text-white">
        {form.id ? 'Modifier la session' : 'Nouvelle session de cuisson'}
      </h2>

      {/* Viande + date */}
      <div className="surface p-5 space-y-4">
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Infos cuisson</p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Viande">
            <Input value={form.meat_name} onChange={v => set('meat_name', v)} placeholder="Brisket, Pulled pork..." />
          </Field>
          <Field label="Date">
            <Input type="date" value={form.cook_date} onChange={v => set('cook_date', v)} />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Poids (kg)">
            <Input type="number" step="0.1" value={form.weight_kg || ''} onChange={v => set('weight_kg', v ? parseFloat(v) : null)} placeholder="4.5" />
          </Field>
          <Field label="Temp. fumoir (°C)">
            <Input type="number" value={form.cook_temp_c || ''} onChange={v => set('cook_temp_c', v ? parseInt(v) : null)} placeholder="110" />
          </Field>
          <Field label="Wrappé ?">
            <div className="flex gap-2 mt-1">
              <SmallBtn active={form.wrapped === true} onClick={() => set('wrapped', true)}>Oui</SmallBtn>
              <SmallBtn active={form.wrapped === false} onClick={() => set('wrapped', false)}>Non</SmallBtn>
            </div>
          </Field>
        </div>

        <Field label="Rub utilisé">
          <Input value={form.rub_used || ''} onChange={v => set('rub_used', v)} placeholder="Dalmatien, Memphis dry rub..." />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Type de fumoir">
            <Input value={form.smoker_type || ''} onChange={v => set('smoker_type', v)} placeholder="Weber Smokey, Offset, Kamado..." />
          </Field>
          <Field label="Bois utilisé">
            <Input value={form.wood_type || ''} onChange={v => set('wood_type', v)} placeholder="Chêne, hêtre, vigne..." />
          </Field>
        </div>
      </div>

      {/* Résultats réels */}
      <div className="surface p-5 space-y-4">
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Résultats réels</p>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Durée réelle (h)">
            <Input type="number" step="0.5" value={form.actual_duration_hours || ''} onChange={v => set('actual_duration_hours', v ? parseFloat(v) : null)} placeholder="12" />
          </Field>
          <Field label="Temp. atteinte (°C)">
            <Input type="number" value={form.internal_temp_reached || ''} onChange={v => set('internal_temp_reached', v ? parseInt(v) : null)} placeholder="96" />
          </Field>
          <Field label="Repos (min)">
            <Input type="number" value={form.rest_duration_minutes || ''} onChange={v => set('rest_duration_minutes', v ? parseInt(v) : null)} placeholder="60" />
          </Field>
        </div>
      </div>

      {/* Journal */}
      <div className="surface p-5 space-y-4">
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Journal</p>

        <Field label="Notes libres">
          <Textarea value={form.notes || ''} onChange={v => set('notes', v)} placeholder="Fumée légère les 3 premières heures, bark magnifique, stall passé à 73°C..." rows={3} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="✅ Ce qui a bien marché">
            <Textarea value={form.what_went_well || ''} onChange={v => set('what_went_well', v)} placeholder="Croûte bien formée, bonne gestion du feu..." rows={3} />
          </Field>
          <Field label="🔧 À améliorer">
            <Textarea value={form.what_to_improve || ''} onChange={v => set('what_to_improve', v)} placeholder="Wrapper plus tôt, plus de bois de chêne..." rows={3} />
          </Field>
        </div>

        <Field label="Note globale">
          <Stars value={form.rating || 0} onChange={v => set('rating', v)} />
        </Field>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.meat_name}
          className="btn-primary px-6 py-3 text-[14px] disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : form.id ? 'Mettre à jour' : 'Enregistrer la session'}
        </button>
        <button onClick={onCancel} className="px-5 py-3 text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">
          Annuler
        </button>
      </div>
    </div>
  )
}

// ── Petits composants ──────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-zinc-500 mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}

function Input({ type = 'text', value, onChange, placeholder, ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[13px] text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500/30 transition-all"
      {...props}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[13px] text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500/30 transition-all resize-none"
    />
  )
}

function SmallBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-[12px] font-medium border transition-all ${
        active
          ? 'border-orange-500/30 bg-orange-500/8 text-orange-400'
          : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {children}
    </button>
  )
}

function Tag({ label }) {
  return (
    <span className="text-[11px] font-medium text-zinc-400 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-lg">
      {label}
    </span>
  )
}

function emptySession() {
  return {
    meat_name: '',
    meat_profile_id: '',
    weight_kg: null,
    cook_temp_c: null,
    wrapped: false,
    doneness: null,
    rub_used: '',
    actual_duration_hours: null,
    internal_temp_reached: null,
    rest_duration_minutes: null,
    notes: '',
    what_went_well: '',
    what_to_improve: '',
    rating: 0,
    weather: '',
    smoker_type: '',
    wood_type: '',
    cook_date: new Date().toISOString().split('T')[0],
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
