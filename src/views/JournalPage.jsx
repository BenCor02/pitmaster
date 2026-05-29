'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { journal } from '../lib/journal.js'
import { CFHeader, CFFooter } from '../components/cf/Chrome.jsx'
import { FireButton, SectionEyebrow } from '../components/cf/Primitives.jsx'

/* ── useMobile ── */
function useMobile() {
  const [mobile, setMobile] = React.useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  )
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => setMobile(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])
  return mobile
}

// ── Rating stars ──────────────────────────────────────────
function Stars({ value, onChange, readonly = false }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          style={{
            fontSize: 20,
            background: 'none',
            border: 'none',
            cursor: readonly ? 'default' : 'pointer',
            color: n <= value ? '#E8A53C' : 'rgba(31,26,20,0.25)',
            transform: n <= value ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.15s',
            padding: 0,
          }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────
export default function JournalPage() {
  const mobile = useMobile()
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
  const PREFILL_ALLOWED = ['meat_name', 'weight_kg', 'cook_temp_c', 'wrapped', 'cook_date', 'smoker_type', 'wood_type', 'rub_used']
  useEffect(() => {
    const prefill = searchParams.get('prefill')
    if (prefill && isAuthenticated) {
      try {
        const raw = JSON.parse(decodeURIComponent(prefill))
        // Whitelist : n'accepter que les champs autorisés
        const safe = Object.fromEntries(
          Object.entries(raw).filter(([k]) => PREFILL_ALLOWED.includes(k))
        )
        setEditing({ ...emptySession(), ...safe })
        setView('form')
      } catch (e) {
        // Ignore prefill invalide
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
      <div style={{ minHeight: '100vh', background: '#FAF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6E6356', fontSize: 14 }}>Chargement...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(139,26,26,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 26 }}>
            📓
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1F1A14', fontFamily: 'var(--cf-serif)', marginBottom: 10 }}>Journal de cuisson</h1>
          <p style={{ fontSize: 14, color: '#6E6356', marginBottom: 24, lineHeight: 1.7 }}>
            Connecte-toi pour enregistrer tes sessions de cuisson, noter ce qui a marché et ce qu'il faut améliorer.
          </p>
          <Link href="/login" state={{ from: '/journal' }} style={{ textDecoration: 'none' }}>
            <FireButton>Se connecter</FireButton>
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
    <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14' }}>
      <CFHeader />
      <main>
        {/* ── Header page ── */}
        <div style={{ borderBottom: '1px solid rgba(31,26,20,0.10)', background: '#FAF6EE' }}>
          <div style={{ maxWidth: 768, margin: '0 auto', padding: mobile ? '24px 16px' : '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <SectionEyebrow>Pitmaster</SectionEyebrow>
              <h1 style={{ fontSize: mobile ? 22 : 26, fontWeight: 800, color: '#1F1A14', fontFamily: 'var(--cf-serif)', margin: '8px 0 4px' }}>
                Journal de cuisson
              </h1>
              <p style={{ fontSize: 13, color: '#6E6356' }}>
                {sessions.length} session{sessions.length !== 1 ? 's' : ''} enregistrée{sessions.length !== 1 ? 's' : ''}
              </p>
            </div>
            {view !== 'list' ? (
              <button
                onClick={() => { setView('list'); setEditing(null) }}
                style={{ fontSize: 13, fontWeight: 600, color: '#6E6356', padding: '8px 16px', borderRadius: 12, background: 'none', border: '1px solid rgba(31,26,20,0.15)', cursor: 'pointer' }}
              >
                ← Retour
              </button>
            ) : (
              <FireButton onClick={handleNew}>+ Nouvelle session</FireButton>
            )}
          </div>
        </div>

        {/* ── Contenu ── */}
        <div style={{ maxWidth: 768, margin: '0 auto', padding: mobile ? '24px 16px 64px' : '32px 24px 80px' }}>
          {view === 'list' && (
            <SessionList
              sessions={sessions}
              loading={loading}
              onView={handleDetail}
              onNew={handleNew}
              mobile={mobile}
            />
          )}

          {view === 'form' && (
            <SessionForm
              session={editing}
              saving={saving}
              onSave={handleSave}
              onCancel={() => { setView('list'); setEditing(null) }}
              mobile={mobile}
            />
          )}

          {view === 'detail' && editing && (
            <SessionDetail
              session={editing}
              onEdit={() => handleEdit(editing)}
              onDelete={() => handleDelete(editing.id)}
              mobile={mobile}
            />
          )}
        </div>
      </main>
      <CFFooter mobile={mobile} />
    </div>
  )
}

// ── Liste ──────────────────────────────────────────────────
function SessionList({ sessions, loading, onView, onNew, mobile }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0', color: '#6E6356', fontSize: 14 }}>
        Chargement...
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>
          📓
        </div>
        <p style={{ fontSize: 17, fontWeight: 700, color: '#1F1A14', marginBottom: 6 }}>Aucune session</p>
        <p style={{ fontSize: 13, color: '#6E6356', marginBottom: 24 }}>Lance une cuisson et enregistre ta session ici.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <FireButton onClick={onNew}>+ Nouvelle session</FireButton>
          <Link
            href="/calculateur"
            style={{ padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#6E6356', border: '1px solid rgba(31,26,20,0.15)', borderRadius: 12, textDecoration: 'none' }}
          >
            Lancer le calculateur
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sessions.map(s => (
        <button
          key={s.id}
          onClick={() => onView(s)}
          style={{
            width: '100%', textAlign: 'left', padding: 16, borderRadius: 14,
            background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.12)', cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(139,26,26,0.20)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(31,26,20,0.12)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,26,26,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              🥩
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1F1A14', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{s.meat_name}</p>
                {s.rating > 0 && <Stars value={s.rating} readonly />}
              </div>
              <p style={{ fontSize: 12, color: '#6E6356', margin: 0 }}>
                {formatDate(s.cook_date)}
                {s.weight_kg ? ` · ${s.weight_kg}kg` : ''}
                {s.cook_temp_c ? ` · ${s.cook_temp_c}°C` : ''}
                {s.wood_type ? ` · ${s.wood_type}` : ''}
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6E6356" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  )
}

// ── Détail ─────────────────────────────────────────────────
function SessionDetail({ session, onEdit, onDelete, mobile }) {
  const s = session

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.12)', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(139,26,26,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🥩</div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1F1A14', fontFamily: 'var(--cf-serif)', margin: 0 }}>{s.meat_name}</h2>
              <p style={{ fontSize: 12, color: '#6E6356', margin: 0 }}>{formatDate(s.cook_date)}</p>
            </div>
          </div>
          {s.rating > 0 && <Stars value={s.rating} readonly />}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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
        <div style={{ background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.12)', borderRadius: 16, padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Rub utilisé</p>
          <p style={{ fontSize: 14, color: '#1F1A14', lineHeight: 1.7, margin: 0 }}>{s.rub_used}</p>
        </div>
      )}

      {/* Notes */}
      {s.notes && (
        <div style={{ background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.12)', borderRadius: 16, padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Notes</p>
          <p style={{ fontSize: 14, color: '#1F1A14', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{s.notes}</p>
        </div>
      )}

      {/* Bilan */}
      {(s.what_went_well || s.what_to_improve) && (
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          {s.what_went_well && (
            <div style={{ background: 'rgba(45,106,79,0.06)', border: '1px solid rgba(45,106,79,0.15)', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>✅</span>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Ce qui a marché</p>
              </div>
              <p style={{ fontSize: 13, color: '#1F1A14', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{s.what_went_well}</p>
            </div>
          )}
          {s.what_to_improve && (
            <div style={{ background: 'rgba(232,165,60,0.06)', border: '1px solid rgba(232,165,60,0.20)', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>🔧</span>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#E8A53C', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>À améliorer</p>
              </div>
              <p style={{ fontSize: 13, color: '#1F1A14', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{s.what_to_improve}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <FireButton onClick={onEdit}>Modifier</FireButton>
        <button
          onClick={onDelete}
          style={{ padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#8B1A1A', background: 'rgba(139,26,26,0.06)', border: '1px solid rgba(139,26,26,0.20)', borderRadius: 12, cursor: 'pointer' }}
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}

// ── Formulaire ─────────────────────────────────────────────
function SessionForm({ session, saving, onSave, onCancel, mobile }) {
  const [form, setForm] = useState({ ...session })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1F1A14', fontFamily: 'var(--cf-serif)', margin: 0 }}>
        {form.id ? 'Modifier la session' : 'Nouvelle session de cuisson'}
      </h2>

      {/* Viande + date */}
      <div style={{ background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.12)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Infos cuisson</p>

        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          <Field label="Viande">
            <Input value={form.meat_name} onChange={v => set('meat_name', v)} placeholder="Brisket, Pulled pork..." />
          </Field>
          <Field label="Date">
            <Input type="date" value={form.cook_date} onChange={v => set('cook_date', v)} />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: 12 }}>
          <Field label="Poids (kg)">
            <Input type="number" step="0.1" value={form.weight_kg || ''} onChange={v => set('weight_kg', v ? parseFloat(v) : null)} placeholder="4.5" />
          </Field>
          <Field label="Temp. fumoir (°C)">
            <Input type="number" value={form.cook_temp_c || ''} onChange={v => set('cook_temp_c', v ? parseInt(v) : null)} placeholder="110" />
          </Field>
          <Field label="Wrappé ?">
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <SmallBtn active={form.wrapped === true} onClick={() => set('wrapped', true)}>Oui</SmallBtn>
              <SmallBtn active={form.wrapped === false} onClick={() => set('wrapped', false)}>Non</SmallBtn>
            </div>
          </Field>
        </div>

        <Field label="Rub utilisé">
          <Input value={form.rub_used || ''} onChange={v => set('rub_used', v)} placeholder="Dalmatien, Memphis dry rub..." />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          <Field label="Type de fumoir">
            <Input value={form.smoker_type || ''} onChange={v => set('smoker_type', v)} placeholder="Weber Smokey, Offset, Kamado..." />
          </Field>
          <Field label="Bois utilisé">
            <Input value={form.wood_type || ''} onChange={v => set('wood_type', v)} placeholder="Chêne, hêtre, vigne..." />
          </Field>
        </div>
      </div>

      {/* Résultats réels */}
      <div style={{ background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.12)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Résultats réels</p>

        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: 12 }}>
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
      <div style={{ background: '#F5EFE0', border: '1px solid rgba(31,26,20,0.12)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#6E6356', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Journal</p>

        <Field label="Notes libres">
          <Textarea value={form.notes || ''} onChange={v => set('notes', v)} placeholder="Fumée légère les 3 premières heures, bark magnifique, stall passé à 73°C..." rows={3} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 12 }}>
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
      <div style={{ display: 'flex', gap: 12 }}>
        <FireButton
          onClick={() => onSave(form)}
          disabled={saving || !form.meat_name}
        >
          {saving ? 'Enregistrement...' : form.id ? 'Mettre à jour' : 'Enregistrer la session'}
        </FireButton>
        <button
          onClick={onCancel}
          style={{ padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#6E6356', background: 'none', border: 'none', cursor: 'pointer' }}
        >
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
      <label style={{ fontSize: 11, fontWeight: 700, color: '#6E6356', display: 'block', marginBottom: 6 }}>{label}</label>
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
      style={{
        width: '100%', padding: '10px 12px', background: '#FAF6EE',
        border: '1px solid rgba(31,26,20,0.15)', borderRadius: 10,
        fontSize: 13, color: '#1F1A14', outline: 'none', boxSizing: 'border-box',
        fontFamily: 'var(--cf-sans)',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(139,26,26,0.35)'}
      onBlur={e => e.target.style.borderColor = 'rgba(31,26,20,0.15)'}
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
      style={{
        width: '100%', padding: '10px 12px', background: '#FAF6EE',
        border: '1px solid rgba(31,26,20,0.15)', borderRadius: 10,
        fontSize: 13, color: '#1F1A14', outline: 'none', boxSizing: 'border-box',
        fontFamily: 'var(--cf-sans)', resize: 'none', lineHeight: 1.6,
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(139,26,26,0.35)'}
      onBlur={e => e.target.style.borderColor = 'rgba(31,26,20,0.15)'}
    />
  )
}

function SmallBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
        border: active ? '1px solid rgba(139,26,26,0.30)' : '1px solid rgba(31,26,20,0.15)',
        background: active ? 'rgba(139,26,26,0.08)' : 'transparent',
        color: active ? '#8B1A1A' : '#6E6356',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function Tag({ label }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, color: '#6E6356',
      background: 'rgba(31,26,20,0.06)', border: '1px solid rgba(31,26,20,0.12)',
      padding: '4px 10px', borderRadius: 8,
    }}>
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
