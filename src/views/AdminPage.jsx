'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import { adminCms } from '../lib/cms.js'
import { fetchAllSettings, updateSetting } from '../lib/siteSettings.js'
import { setSiteBranding } from '../lib/seo.js'
import { useSiteSettings } from '../hooks/useSiteSettings.jsx'
import AdminShell from '../components/admin/AdminShell.jsx'
import AdminTable, { StatusBadge } from '../components/admin/AdminTable.jsx'
import { slugify, MEAT_OPTIONS, METHOD_OPTIONS, STATUS_OPTIONS, CATEGORY_OPTIONS } from '../components/admin/AdminForm.jsx'
import MarkdownEditor from '../components/admin/MarkdownEditor.jsx'
import StatisticsTab from '../components/admin/StatisticsTab.jsx'

const TABLE_MAP = {
  seo: 'seo_blocks', affiliate: 'affiliate_tools', guides: 'guides',
  recipes: 'recipes', faq: 'faqs', woods: 'woods', bbq: 'bbq_types', profiles: 'cooking_profiles',
}
const RECIPE_TYPE_OPTIONS = [
  { value: 'rub', label: 'Rub' }, { value: 'mop', label: 'Mop' },
  { value: 'marinade', label: 'Marinade' }, { value: 'injection', label: 'Injection' }, { value: 'glaze', label: 'Glaze' },
]
const DIFFICULTY_OPTIONS = [
  { value: 'facile', label: 'Facile' }, { value: 'moyen', label: 'Moyen' }, { value: 'avance', label: 'Avancé' },
]
const INTENSITY_OPTIONS = [
  { value: 'leger', label: 'Léger' }, { value: 'moyen', label: 'Moyen' }, { value: 'fort', label: 'Fort' },
]
const AVAILABILITY_OPTIONS = [
  { value: 'excellente', label: 'Excellente' }, { value: 'bonne', label: 'Bonne' },
  { value: 'moyenne', label: 'Moyenne' }, { value: 'limitee', label: 'Limitée' },
]
const LEVEL_OPTIONS = [
  { value: 'debutant', label: 'Débutant' }, { value: 'intermediaire', label: 'Intermédiaire' }, { value: 'avance', label: 'Avancé' },
]
const COOK_TYPE_OPTIONS = [
  { value: 'low_and_slow', label: 'Low & Slow' }, { value: 'reverse_sear', label: 'Reverse Sear' },
]
const CATEGORY_PROFILE_OPTIONS = [
  { value: 'boeuf', label: 'Boeuf' }, { value: 'porc', label: 'Porc' }, { value: 'volaille', label: 'Volaille' },
]

// ── Toast System ──────────────────────────────────────────────
function ToastContainer({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderRadius: 8,
          background: t.type === 'error' ? '#1a0808' : t.type === 'success' ? '#081a0f' : '#1a1a1a',
          border: `1px solid ${t.type === 'error' ? 'rgba(239,68,68,0.3)' : t.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)', color: '#e4e4e7', fontSize: 13, maxWidth: 340,
        }}>
          <span>{t.type === 'error' ? '❌' : t.type === 'success' ? '✅' : 'ℹ️'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
function useToast() {
  const [toasts, setToasts] = useState([])
  const add = (message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }
  return { toasts, success: msg => add(msg, 'success'), error: msg => add(msg, 'error'), info: msg => add(msg, 'info') }
}

// ── Primitives ────────────────────────────────────────────────
function SI({ value, onChange, placeholder, type = 'text', disabled = false }) {
  return (
    <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
      style={{ width: '100%', padding: '7px 11px', boxSizing: 'border-box', background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 7, color: disabled ? '#52525b' : '#e4e4e7', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
  )
}
function STA({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: '100%', padding: '7px 11px', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 7, color: '#e4e4e7', fontSize: 13, outline: 'none', fontFamily: 'ui-monospace,monospace', lineHeight: 1.6, resize: 'vertical' }} />
  )
}
function SS({ value, onChange, options, placeholder }) {
  return (
    <select value={value ?? ''} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '7px 11px', background: '#111113', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 7, color: '#e4e4e7', fontSize: 13, outline: 'none' }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value} style={{ background: '#111113' }}>{o.label}</option>)}
    </select>
  )
}
function SCB({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <div onClick={() => onChange(!checked)} style={{ width: 17, height: 17, borderRadius: 4, flexShrink: 0, background: checked ? '#ff6b1a' : 'rgba(255,255,255,0.06)', border: `1px solid ${checked ? '#ff6b1a' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        {checked && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13, color: '#a1a1aa' }}>{label}</span>
    </label>
  )
}
function F({ label, hint, children }) {
  return (
    <div>
      <div style={{ marginBottom: 5 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
        {hint && <div style={{ fontSize: 10, color: '#52525b', marginTop: 1 }}>{hint}</div>}
      </div>
      {children}
    </div>
  )
}
function G2({ children }) { return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div> }
function ImagePreview({ url }) {
  if (!url) return null
  return (
    <div style={{ marginTop: 7, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', maxHeight: 130 }}>
      <img src={url} alt="Aperçu" style={{ width: '100%', maxHeight: 130, objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none' }} />
    </div>
  )
}
function MetaCard({ title, children }) {
  return (
    <div style={{ padding: 16, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</div>
      {children}
    </div>
  )
}
function Code({ children }) {
  return <code style={{ fontSize: 11, color: '#ff8c4a', background: 'rgba(255,107,26,0.1)', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace' }}>{children}</code>
}

// ── JsonField ─────────────────────────────────────────────────
function JsonField({ value, onChange, rows = 6, placeholder }) {
  const [error, setError] = useState(null)
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? null, null, 2)
  return (
    <div>
      <STA value={text} onChange={v => { try { onChange(JSON.parse(v)); setError(null) } catch { onChange(v); setError('JSON invalide') } }} rows={rows} placeholder={placeholder} />
      {error && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 3 }}>{error}</p>}
    </div>
  )
}

// ── IngredientsEditor ──────────────────────────────────────────
function IngredientsEditor({ value, onChange }) {
  const ingredients = Array.isArray(value) ? value : []
  const update = (i, field, val) => { const next = [...ingredients]; next[i] = { ...next[i], [field]: val }; onChange(next) }
  const add = () => onChange([...ingredients, { name: '', qty: '', note: '' }])
  const remove = i => { const next = [...ingredients]; next.splice(i, 1); onChange(next) }
  const inpStyle = { padding: '6px 9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6, color: '#e4e4e7', fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box' }
  return (
    <div style={{ padding: 20, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ingrédients ({ingredients.length})</span>
        <button onClick={add} style={{ fontSize: 12, color: '#ff8c4a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Ajouter</button>
      </div>
      {ingredients.length === 0 && <p style={{ fontSize: 12, color: '#52525b', textAlign: 'center', padding: '10px 0' }}>Aucun ingrédient. Cliquez sur + Ajouter.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {ingredients.map((ing, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 1fr auto', gap: 6, alignItems: 'center' }}>
            <input value={ing.name || ''} onChange={e => update(i, 'name', e.target.value)} placeholder="Ingrédient" style={inpStyle} />
            <input value={ing.qty || ''} onChange={e => update(i, 'qty', e.target.value)} placeholder="Qté" style={inpStyle} />
            <input value={ing.note || ''} onChange={e => update(i, 'note', e.target.value)} placeholder="Note (optionnel)" style={inpStyle} />
            <button onClick={() => remove(i)} style={{ color: '#52525b', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '0 3px' }}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── StepsEditor ───────────────────────────────────────────────
function StepsEditor({ value, onChange }) {
  const steps = Array.isArray(value) ? value : []
  const update = (i, val) => { const next = [...steps]; next[i] = val; onChange(next) }
  const add = () => onChange([...steps, ''])
  const remove = i => { const next = [...steps]; next.splice(i, 1); onChange(next) }
  const taStyle = { padding: '6px 9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6, color: '#e4e4e7', fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }
  return (
    <div style={{ padding: 20, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Étapes ({steps.length})</span>
        <button onClick={add} style={{ fontSize: 12, color: '#ff8c4a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Ajouter</button>
      </div>
      {steps.length === 0 && <p style={{ fontSize: 12, color: '#52525b', textAlign: 'center', padding: '10px 0' }}>Aucune étape. Cliquez sur + Ajouter.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#52525b', minWidth: 20, paddingTop: 9 }}>{i + 1}.</span>
            <textarea value={step} onChange={e => update(i, e.target.value)} placeholder={`Étape ${i + 1}...`} rows={2} style={{ ...taStyle, flex: 1 }} />
            <button onClick={() => remove(i)} style={{ color: '#52525b', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '5px 3px', flexShrink: 0 }}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── PhasesTextEditor ──────────────────────────────────────────
function PT({ label, value, onChange }) { return <F label={label}><SI value={value || ''} onChange={onChange} placeholder={label} /></F> }
function PTX({ label, value, onChange, rows = 2, hint }) { return <F label={label} hint={hint}><STA value={value || ''} onChange={onChange} rows={rows} placeholder={label} /></F> }
function PBlock({ color, label, children }) {
  const c = { orange: '#ff6b1a', amber: '#f59e0b', blue: '#3b82f6', red: '#ef4444', green: '#22c55e', zinc: '#71717a' }[color] || '#71717a'
  return (
    <div style={{ padding: 14, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{label}</p>
      {children}
    </div>
  )
}
function PhasesTextEditor({ cookType, fixedTimes, value, onChange }) {
  const pt = (typeof value === 'object' && value !== null) ? value : {}
  const u = (key, val) => onChange({ ...pt, [key]: val })
  const isRibs = !!fixedTimes
  const isRS = cookType === 'reverse_sear'
  if (!isRibs && !isRS) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <PBlock color="orange" label="Phase 1 — Prise de fumée">
        <PT label="Titre" value={pt.phase1_title} onChange={v => u('phase1_title', v)} />
        <PTX label="Objectif" value={pt.phase1_objective} onChange={v => u('phase1_objective', v)} />
        <PTX label="Repère visuel" value={pt.phase1_visual} onChange={v => u('phase1_visual', v)} />
        <PTX label="Repère température" value={pt.phase1_temp} onChange={v => u('phase1_temp', v)} rows={1} />
        <PTX label="Info complémentaire" value={pt.phase1_info} onChange={v => u('phase1_info', v)} />
        <PTX label="Conseil pitmaster" value={pt.phase1_advice} onChange={v => u('phase1_advice', v)} rows={3} />
      </PBlock>
      <PBlock color="amber" label="Phase 2 — Stall">
        <PT label="Titre" value={pt.stall_title} onChange={v => u('stall_title', v)} />
        <PTX label="Objectif" value={pt.stall_objective} onChange={v => u('stall_objective', v)} />
        <PTX label="Info complémentaire" value={pt.stall_info} onChange={v => u('stall_info', v)} />
        <PTX label="Conseil pitmaster" value={pt.stall_advice} onChange={v => u('stall_advice', v)} rows={3} />
      </PBlock>
      <PBlock color="blue" label="Phase 3 — Wrap">
        <PT label="Titre" value={pt.wrap_title} onChange={v => u('wrap_title', v)} />
        <PTX label="Objectif" value={pt.wrap_objective} onChange={v => u('wrap_objective', v)} />
        <PTX label="Astuce wrap" value={pt.wrap_tip} onChange={v => u('wrap_tip', v)} />
        <PTX label="Conseil pitmaster" value={pt.wrap_advice} onChange={v => u('wrap_advice', v)} rows={3} />
      </PBlock>
      <PBlock color="red" label="Phase 4 — La Transformation">
        <PT label="Titre" value={pt.transform_title} onChange={v => u('transform_title', v)} />
        <PTX label="Objectif" value={pt.transform_objective} onChange={v => u('transform_objective', v)} />
        <PTX label="Info" value={pt.transform_info} onChange={v => u('transform_info', v)} />
        <PTX label="Conseil pitmaster" value={pt.transform_advice} onChange={v => u('transform_advice', v)} rows={3} />
      </PBlock>
      <PBlock color="green" label="Phase 5 — Repos">
        <PT label="Titre" value={pt.rest_title} onChange={v => u('rest_title', v)} />
        <PTX label="Objectif" value={pt.rest_objective} onChange={v => u('rest_objective', v)} />
        <PTX label="Repères (un par ligne)" value={pt.rest_markers_text} onChange={v => u('rest_markers_text', v)} rows={4} />
        <PTX label="Conseil pitmaster" value={pt.rest_advice} onChange={v => u('rest_advice', v)} rows={3} />
      </PBlock>
    </div>
  )
  if (isRibs) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <PBlock color="orange" label="Phase 1 — Fumée à nu"><PT label="Titre" value={pt.smoke_title} onChange={v => u('smoke_title', v)} /><PTX label="Objectif" value={pt.smoke_objective} onChange={v => u('smoke_objective', v)} /><PTX label="Repères" value={pt.smoke_markers_text} onChange={v => u('smoke_markers_text', v)} rows={3} /><PTX label="Conseil" value={pt.smoke_advice} onChange={v => u('smoke_advice', v)} /></PBlock>
      <PBlock color="blue" label="Phase 2 — Wrap"><PT label="Titre" value={pt.wrap_title} onChange={v => u('wrap_title', v)} /><PTX label="Objectif" value={pt.wrap_objective} onChange={v => u('wrap_objective', v)} /><PTX label="Repères" value={pt.wrap_markers_text} onChange={v => u('wrap_markers_text', v)} rows={3} /><PTX label="Conseil" value={pt.wrap_advice} onChange={v => u('wrap_advice', v)} /></PBlock>
      <PBlock color="amber" label="Phase 3 — Finition"><PT label="Titre" value={pt.finish_title} onChange={v => u('finish_title', v)} /><PTX label="Objectif" value={pt.finish_objective} onChange={v => u('finish_objective', v)} /><PTX label="Repères" value={pt.finish_markers_text} onChange={v => u('finish_markers_text', v)} rows={3} /><PTX label="Conseil" value={pt.finish_advice} onChange={v => u('finish_advice', v)} /></PBlock>
      <PBlock color="zinc" label="Alternative — Sans wrap"><PT label="Titre" value={pt.unwrapped_title} onChange={v => u('unwrapped_title', v)} /><PTX label="Objectif" value={pt.unwrapped_objective} onChange={v => u('unwrapped_objective', v)} /><PTX label="Conseil" value={pt.unwrapped_advice} onChange={v => u('unwrapped_advice', v)} /></PBlock>
      <PBlock color="green" label="Repos"><PT label="Titre" value={pt.rest_title} onChange={v => u('rest_title', v)} /><PTX label="Objectif" value={pt.rest_objective} onChange={v => u('rest_objective', v)} /><PTX label="Repères" value={pt.rest_markers_text} onChange={v => u('rest_markers_text', v)} /><PTX label="Conseil" value={pt.rest_advice} onChange={v => u('rest_advice', v)} /></PBlock>
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <PBlock color="orange" label="Phase 1 — Cuisson indirecte"><PT label="Titre" value={pt.indirect_title} onChange={v => u('indirect_title', v)} /><PTX label="Objectif" value={pt.indirect_objective} onChange={v => u('indirect_objective', v)} /><PTX label="Conseil" value={pt.indirect_advice} onChange={v => u('indirect_advice', v)} rows={3} /></PBlock>
      <PBlock color="red" label="Phase 2 — Saisie"><PT label="Titre" value={pt.sear_title} onChange={v => u('sear_title', v)} /><PTX label="Objectif" value={pt.sear_objective} onChange={v => u('sear_objective', v)} /><PTX label="Conseil" value={pt.sear_advice} onChange={v => u('sear_advice', v)} rows={3} /></PBlock>
      <PBlock color="green" label="Repos"><PT label="Titre" value={pt.rest_title} onChange={v => u('rest_title', v)} /><PTX label="Objectif" value={pt.rest_objective} onChange={v => u('rest_objective', v)} /><PTX label="Conseil" value={pt.rest_advice} onChange={v => u('rest_advice', v)} /></PBlock>
    </div>
  )
}

// ── Tab-specific form field sets ──────────────────────────────
function SeoFields({ form, set }) {
  return (
    <>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contenu Markdown</span>
        </div>
        <MarkdownEditor value={form.content} onChange={v => set('content', v)} rows={14} placeholder="Contenu markdown du bloc SEO..." />
      </div>
      <G2>
        <F label="Viande ciblée"><SS value={form.meat_type} onChange={v => set('meat_type', v)} options={MEAT_OPTIONS} placeholder="Sélectionner..." /></F>
        <F label="Méthode de cuisson"><SS value={form.cooking_method} onChange={v => set('cooking_method', v)} options={METHOD_OPTIONS} placeholder="Sélectionner..." /></F>
      </G2>
      <SCB checked={!!form.is_global} onChange={v => set('is_global', v)} label="Bloc global (affiché pour toutes les viandes)" />
    </>
  )
}
const PLACEMENT_OPTIONS = [
  { key: 'home',       label: "Page d'accueil",           desc: 'Affiché en bas de la home' },
  { key: 'calculator', label: 'Calculateur BBQ',           desc: 'Affiché sous les résultats de cuisson' },
  { key: 'guides',     label: 'Pages Guides',              desc: 'Affiché en bas de chaque guide' },
  { key: 'recipes',    label: 'Pages Recettes & Rubs',     desc: 'Affiché en bas de chaque recette' },
  { key: 'sponsor',    label: 'Bloc Sponsorisé par',       desc: 'Encart dédié entre les sections — un seul actif à la fois' },
]

function PlacementToggle({ label, desc, active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '12px 14px', borderRadius: 8, width: '100%', textAlign: 'left',
        background: active ? 'rgba(255,107,26,0.1)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? 'rgba(255,107,26,0.35)' : 'rgba(255,255,255,0.07)'}`,
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
        background: active ? '#ff6b1a' : 'rgba(255,255,255,0.08)',
        border: `2px solid ${active ? '#ff6b1a' : 'rgba(255,255,255,0.15)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {active && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: active ? '#ff8c4a' : '#e4e4e7', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 11, color: '#71717a' }}>{desc}</div>
      </div>
    </button>
  )
}

function AffiliateFields({ form, set }) {
  const placements = Array.isArray(form.placements) ? form.placements : []

  function togglePlacement(key) {
    if (placements.includes(key)) {
      set('placements', placements.filter(p => p !== key))
    } else {
      set('placements', [...placements, key])
    }
  }

  const hasCalculator = placements.includes('calculator')

  return (
    <>
      {/* Produit */}
      <F label="Lien affilié" hint="L'URL vers le produit avec votre code">
        <SI value={form.affiliate_url} onChange={v => set('affiliate_url', v)} placeholder="https://amzn.to/..." />
      </F>
      <F label="Accroche" hint="Une phrase qui donne envie de cliquer">
        <STA value={form.description} onChange={v => set('description', v)} rows={2} placeholder="Le meilleur thermomètre pour ne plus rater une cuisson..." />
      </F>
      <G2>
        <F label="Texte du bouton">
          <SI value={form.cta_text} onChange={v => set('cta_text', v)} placeholder="Voir le produit" />
        </F>
        <F label="Badge" hint="Optionnel — ex: Coup de cœur">
          <SI value={form.badge} onChange={v => set('badge', v)} placeholder="Recommandé" />
        </F>
      </G2>
      <F label="Image du produit" hint="URL d'une photo du produit">
        <SI value={form.image_url} onChange={v => set('image_url', v)} placeholder="https://..." />
        <ImagePreview url={form.image_url} />
      </F>

      {/* Emplacements */}
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          Où afficher ce bloc ?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PLACEMENT_OPTIONS.map(({ key, label, desc }) => (
            <PlacementToggle
              key={key}
              label={label}
              desc={desc}
              active={placements.includes(key)}
              onToggle={() => togglePlacement(key)}
            />
          ))}
        </div>
      </div>

      {/* Viande ciblée — si calculateur sélectionné */}
      {hasCalculator && (
        <F label="Restreindre à une viande" hint="Laisser vide = affiché pour tous les calculs">
          <SS value={form.meat_type} onChange={v => set('meat_type', v)} options={MEAT_OPTIONS} placeholder="Toutes les viandes" />
        </F>
      )}

      {placements.includes('sponsor') && (
        <div style={{ padding: '10px 14px', background: 'rgba(255,107,26,0.07)', border: '1px solid rgba(255,107,26,0.2)', borderRadius: 6, fontSize: 12, color: '#ff8c4a' }}>
          ⚡ Un seul sponsor actif à la fois — le premier par ordre de tri. Assurez-vous que ce produit est publié.
        </div>
      )}
    </>
  )
}
function GuideMainFields({ form, set }) {
  return (
    <>
      <div style={{ padding: 20, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
        <F label="Résumé" hint="Affiché sur les cards (1-2 phrases)"><STA value={form.summary} onChange={v => set('summary', v)} rows={2} placeholder="Résumé court..." /></F>
      </div>
      <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '13px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contenu</span>
        </div>
        <MarkdownEditor value={form.content} onChange={v => set('content', v)} rows={24} placeholder="Contenu complet du guide en Markdown..." />
      </div>
    </>
  )
}
function GuideMetaFields({ form, set }) {
  return (
    <>
      <MetaCard title="Catégorisation">
        <F label="Catégorie"><SS value={form.category} onChange={v => set('category', v)} options={CATEGORY_OPTIONS} placeholder="Sélectionner..." /></F>
        <F label="Viande ciblée"><SS value={form.meat_type} onChange={v => set('meat_type', v)} options={MEAT_OPTIONS} placeholder="Sélectionner..." /></F>
        <F label="Tags" hint="Séparés par des virgules">
          <SI value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags || ''} onChange={v => set('tags', v.split(',').map(t => t.trim()).filter(Boolean))} placeholder="brisket, stall, wrap" />
        </F>
      </MetaCard>
      <MetaCard title="SEO">
        <F label="Titre SEO"><SI value={form.seo_title} onChange={v => set('seo_title', v)} placeholder="Titre Google" /></F>
        <F label="Description SEO"><STA value={form.seo_description} onChange={v => set('seo_description', v)} rows={2} placeholder="Meta description (155 car.)" /></F>
      </MetaCard>
    </>
  )
}
function RecipeMainFields({ form, set }) {
  return (
    <>
      <div style={{ padding: 20, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <G2>
          <F label="Type"><SS value={form.type} onChange={v => set('type', v)} options={RECIPE_TYPE_OPTIONS} placeholder="Sélectionner..." /></F>
          <F label="Difficulté"><SS value={form.difficulty} onChange={v => set('difficulty', v)} options={DIFFICULTY_OPTIONS} /></F>
        </G2>
        <F label="Résumé" hint="Affiché sur les cards"><STA value={form.summary} onChange={v => set('summary', v)} rows={2} placeholder="Résumé court..." /></F>
        <G2>
          <F label="Rendement"><SI value={form.yield_amount} onChange={v => set('yield_amount', v)} placeholder="~200g — 3 cuissons" /></F>
          <F label="Temps de préparation"><SI value={form.prep_time} onChange={v => set('prep_time', v)} placeholder="5 min + 4h marinade" /></F>
        </G2>
        <F label="Origine"><SI value={form.origin} onChange={v => set('origin', v)} placeholder="Aaron Franklin — Austin, Texas" /></F>
      </div>
      <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '13px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description complète</span>
        </div>
        <MarkdownEditor value={form.description} onChange={v => set('description', v)} rows={12} placeholder="Histoire, conseils, détails en Markdown..." />
      </div>
      <IngredientsEditor value={form.ingredients} onChange={v => set('ingredients', v)} />
      <StepsEditor value={form.steps} onChange={v => set('steps', v)} />
    </>
  )
}
function RecipeMetaFields({ form, set }) {
  return (
    <MetaCard title="Catégorisation">
      <F label="Viandes compatibles" hint="Séparées par des virgules">
        <SI value={Array.isArray(form.meat_types) ? form.meat_types.join(', ') : form.meat_types || ''} onChange={v => set('meat_types', v.split(',').map(t => t.trim()).filter(Boolean))} placeholder="brisket, pulled_pork..." />
      </F>
      <F label="Tags" hint="Séparés par des virgules">
        <SI value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags || ''} onChange={v => set('tags', v.split(',').map(t => t.trim()).filter(Boolean))} placeholder="texas, brisket, sel-poivre" />
      </F>
    </MetaCard>
  )
}
function FaqFields({ form, set }) {
  return (
    <>
      <F label="Question"><SI value={form.question} onChange={v => set('question', v)} placeholder="Comment savoir si..." /></F>
      <F label="Réponse (Markdown)"><STA value={form.answer} onChange={v => set('answer', v)} rows={6} placeholder="Réponse en markdown..." /></F>
      <G2>
        <F label="Viande ciblée"><SS value={form.meat_type} onChange={v => set('meat_type', v)} options={MEAT_OPTIONS} placeholder="Sélectionner..." /></F>
        <F label="Méthode de cuisson"><SS value={form.cooking_method} onChange={v => set('cooking_method', v)} options={METHOD_OPTIONS} placeholder="Sélectionner..." /></F>
      </G2>
      <SCB checked={!!form.is_global} onChange={v => set('is_global', v)} label="FAQ globale (affichée partout)" />
    </>
  )
}
function WoodFields({ form, set }) {
  return (
    <>
      <G2>
        <F label="Emoji"><SI value={form.emoji} onChange={v => set('emoji', v)} placeholder="🌳" /></F>
        <F label="Intensité"><SS value={form.intensity} onChange={v => set('intensity', v)} options={INTENSITY_OPTIONS} /></F>
      </G2>
      <F label="Nom scientifique"><SI value={form.scientific_name} onChange={v => set('scientific_name', v)} placeholder="Quercus robur" /></F>
      <F label="Profil de saveur"><SI value={form.flavor_profile} onChange={v => set('flavor_profile', v)} placeholder="Fumée ronde, légèrement sucrée" /></F>
      <F label="Description"><STA value={form.description} onChange={v => set('description', v)} rows={4} placeholder="Description détaillée..." /></F>
      <G2>
        <F label="Viandes recommandées" hint="Séparées par des virgules">
          <SI value={Array.isArray(form.best_meats) ? form.best_meats.join(', ') : form.best_meats || ''} onChange={v => set('best_meats', v.split(',').map(t => t.trim()).filter(Boolean))} placeholder="Bœuf, Porc, Volaille" />
        </F>
        <F label="Viandes à éviter" hint="Séparées par des virgules">
          <SI value={Array.isArray(form.avoid_meats) ? form.avoid_meats.join(', ') : form.avoid_meats || ''} onChange={v => set('avoid_meats', v.split(',').map(t => t.trim()).filter(Boolean))} placeholder="Poisson, Fromage" />
        </F>
      </G2>
      <F label="Caractéristiques de combustion"><SI value={form.burn_characteristics} onChange={v => set('burn_characteristics', v)} placeholder="Braise longue, chaleur régulière" /></F>
      <G2>
        <F label="Origine"><SI value={form.origin} onChange={v => set('origin', v)} placeholder="Europe, Amérique du Nord" /></F>
        <F label="Disponibilité en Europe"><SS value={form.availability_eu} onChange={v => set('availability_eu', v)} options={AVAILABILITY_OPTIONS} placeholder="Sélectionner..." /></F>
      </G2>
      <F label="Conseils pitmaster"><STA value={form.pitmaster_tips} onChange={v => set('pitmaster_tips', v)} rows={3} placeholder="Astuces terrain..." /></F>
      <F label="Notes de sécurité"><SI value={form.safety_notes} onChange={v => set('safety_notes', v)} placeholder="Aucune toxicité connue" /></F>
      <SCB checked={!!form.is_toxic} onChange={v => set('is_toxic', v)} label="Bois toxique (interdit fumage)" />
      {form.is_toxic && <F label="Raison de toxicité"><SI value={form.toxic_reason} onChange={v => set('toxic_reason', v)} placeholder="Résine toxique, fumée irritante" /></F>}
      <F label="Source"><SI value={form.source} onChange={v => set('source', v)} placeholder="AmazingRibs.com, Texas A&M" /></F>
    </>
  )
}
function BbqFields({ form, set }) {
  return (
    <>
      <G2>
        <F label="Icône (emoji)"><SI value={form.icon} onChange={v => set('icon', v)} placeholder="🏭" /></F>
        <F label="Niveau recommandé"><SS value={form.level} onChange={v => set('level', v)} options={LEVEL_OPTIONS} /></F>
      </G2>
      <F label="Noms alternatifs" hint="Séparés par des virgules">
        <SI value={Array.isArray(form.alt_names) ? form.alt_names.join(', ') : form.alt_names || ''} onChange={v => set('alt_names', v.split(',').map(t => t.trim()).filter(Boolean))} placeholder="Fumoir horizontal, Stick burner" />
      </F>
      <F label="Tagline"><SI value={form.tagline} onChange={v => set('tagline', v)} placeholder="Le fumoir des puristes." /></F>
      <F label="Description"><STA value={form.description} onChange={v => set('description', v)} rows={5} placeholder="Description complète..." /></F>
      <G2>
        <F label="Plage de température"><SI value={form.temp_range} onChange={v => set('temp_range', v)} placeholder="107–135°C" /></F>
        <F label="Combustible"><SI value={form.fuel} onChange={v => set('fuel', v)} placeholder="Bûches de bois" /></F>
      </G2>
      <G2>
        <F label="Fourchette de prix"><SI value={form.price_range} onChange={v => set('price_range', v)} placeholder="300€ – 3 000€+" /></F>
        <F label="Capacité"><SI value={form.capacity} onChange={v => set('capacity', v)} placeholder="Grande (4–8 pièces)" /></F>
      </G2>
      <F label="Avantages" hint="Un par ligne">
        <STA value={Array.isArray(form.pros) ? form.pros.join('\n') : form.pros || ''} onChange={v => set('pros', v.split('\n').filter(Boolean))} rows={5} placeholder={"Saveur authentique\nGrande capacité\n..."} />
      </F>
      <F label="Inconvénients" hint="Un par ligne">
        <STA value={Array.isArray(form.cons) ? form.cons.join('\n') : form.cons || ''} onChange={v => set('cons', v.split('\n').filter(Boolean))} rows={5} placeholder={"Courbe d'apprentissage\nSurveillance constante\n..."} />
      </F>
      <G2>
        <F label="Idéal pour" hint="Séparés par des virgules">
          <SI value={Array.isArray(form.best_for) ? form.best_for.join(', ') : form.best_for || ''} onChange={v => set('best_for', v.split(',').map(t => t.trim()).filter(Boolean))} placeholder="Brisket, Pulled pork, Ribs" />
        </F>
        <F label="Pas idéal pour" hint="Séparés par des virgules">
          <SI value={Array.isArray(form.not_ideal_for) ? form.not_ideal_for.join(', ') : form.not_ideal_for || ''} onChange={v => set('not_ideal_for', v.split(',').map(t => t.trim()).filter(Boolean))} placeholder="Cuissons rapides, Petits espaces" />
        </F>
      </G2>
      <F label="Marques recommandées" hint="Séparées par des virgules">
        <SI value={Array.isArray(form.brands) ? form.brands.join(', ') : form.brands || ''} onChange={v => set('brands', v.split(',').map(t => t.trim()).filter(Boolean))} placeholder="Oklahoma Joe's, Yoder, Horizon" />
      </F>
      <F label="Conseil terrain"><STA value={form.tips} onChange={v => set('tips', v)} rows={3} placeholder="Astuce pour bien débuter..." /></F>
    </>
  )
}
function ProfileFields({ form, set }) {
  return (
    <>
      <G2>
        <F label="Catégorie"><SS value={form.category} onChange={v => set('category', v)} options={CATEGORY_PROFILE_OPTIONS} /></F>
        <F label="Type de cuisson"><SS value={form.cook_type} onChange={v => set('cook_type', v)} options={COOK_TYPE_OPTIONS} /></F>
      </G2>
      <G2>
        <F label="Icône"><SI value={form.icon} onChange={v => set('icon', v)} placeholder="🥩" /></F>
        <div style={{ display: 'flex', alignItems: 'center', paddingTop: 22 }}>
          <SCB checked={!!form.supports_wrap} onChange={v => set('supports_wrap', v)} label="Supporte le wrap" />
        </div>
      </G2>
      <F label="Bandes de température (temp_bands)" hint='[{"temp_c":107,"min_per_kg":175}]'>
        <JsonField value={form.temp_bands} onChange={v => set('temp_bands', v)} rows={5} placeholder='[{"temp_c": 107, "min_per_kg": 175}]' />
      </F>
      <F label="Temps fixes (fixed_times)" hint="Pour les ribs uniquement">
        <JsonField value={form.fixed_times} onChange={v => set('fixed_times', v)} rows={3} placeholder='{"wrapped":{"min":330,"max":390},"unwrapped":{"min":300,"max":360}}' />
      </F>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <F label="Réduction wrap (%)"><SI type="number" value={form.wrap_reduction_percent ?? 0} onChange={v => set('wrap_reduction_percent', parseInt(v) || 0)} /></F>
        <F label="Repos min (min)"><SI type="number" value={form.rest_min ?? 0} onChange={v => set('rest_min', parseInt(v) || 0)} /></F>
        <F label="Repos max (min)"><SI type="number" value={form.rest_max ?? 0} onChange={v => set('rest_max', parseInt(v) || 0)} /></F>
      </div>
      <F label="Reverse Sear (JSON)"><JsonField value={form.reverse_sear} onChange={v => set('reverse_sear', v)} rows={3} placeholder='{"pull_before_target_c": 8, "sear_total_minutes_min": 3, "sear_total_minutes_max": 6}' /></F>
      <F label="Cibles de cuisson (doneness_targets)"><JsonField value={form.doneness_targets} onChange={v => set('doneness_targets', v)} rows={4} placeholder='{"rare": 52, "medium_rare": 54, "medium": 60}' /></F>
      <F label="Repères (cues) JSON"><JsonField value={form.cues} onChange={v => set('cues', v)} rows={8} placeholder='{"stall_temp_min":65,"stall_temp_max":77,...}' /></F>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span>📝</span>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7', margin: 0 }}>Textes de la Timeline</h3>
            <p style={{ fontSize: 11, color: '#52525b', margin: '2px 0 0' }}>Textes affichés dans les phases du calculateur</p>
          </div>
        </div>
        <PhasesTextEditor cookType={form.cook_type} fixedTimes={form.fixed_times} value={form.phases_text} onChange={v => set('phases_text', v)} />
      </div>
      <G2>
        <F label="Ordre d'affichage"><SI type="number" value={form.sort_order ?? 0} onChange={v => set('sort_order', parseInt(v) || 0)} /></F>
        <div style={{ display: 'flex', alignItems: 'center', paddingTop: 22 }}>
          <SCB checked={form.is_active !== false} onChange={v => set('is_active', v)} label="Profil actif dans le calculateur" />
        </div>
      </G2>
    </>
  )
}

// ── List view column definitions ──────────────────────────────
function TitleCell({ title, sub, cover }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {cover && <img src={cover} alt="" style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />}
      <div>
        <div style={{ fontWeight: 600, color: '#e4e4e7', fontSize: 13 }}>{title}</div>
        {sub && <div style={{ fontSize: 10, color: '#52525b', fontFamily: 'monospace', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  )
}
function getColumns(tab) {
  const statusCol = { key: 'status', label: 'Statut', render: row => <StatusBadge status={row.status} /> }
  const meatCol = { key: 'meat_type', label: 'Viande', render: row => row.meat_type || (row.is_global ? '🌐 Global' : '—') }
  switch (tab) {
    case 'seo': return [
      { key: 'title', label: 'Titre', render: row => <TitleCell title={row.title} sub={row.meat_type || (row.is_global ? 'Global' : '')} /> },
      meatCol, { key: 'cooking_method', label: 'Méthode', render: row => row.cooking_method || '—' }, statusCol,
    ]
    case 'affiliate': return [
      { key: 'title', label: 'Produit', render: row => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {row.image_url && <img src={row.image_url} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />}
          <div>
            <div style={{ fontWeight: 600, color: '#e4e4e7', fontSize: 13 }}>{row.title}</div>
            {row.badge && <span style={{ fontSize: 9, fontWeight: 700, color: '#ff8c4a', background: 'rgba(255,107,26,0.1)', padding: '1px 6px', borderRadius: 3, textTransform: 'uppercase' }}>{row.badge}</span>}
          </div>
        </div>
      )},
      { key: 'placements', label: 'Emplacements', render: row => { const p = row.placements || []; return p.length ? p.map(k => ({ home:'Accueil', calculator:'Calculateur', guides:'Guides', recipes:'Recettes', sponsor:'Sponsor' })[k] || k).join(', ') : '—' } }, statusCol,
    ]
    case 'guides': return [
      { key: 'title', label: 'Guide', render: row => <TitleCell title={row.title} sub={`/guides/${row.slug}`} cover={row.cover_url} /> },
      { key: 'category', label: 'Catégorie', render: row => row.category || '—' }, meatCol, statusCol,
    ]
    case 'recipes': return [
      { key: 'title', label: 'Recette', render: row => <TitleCell title={row.title} sub={`/recettes/${row.slug}`} cover={row.cover_url} /> },
      { key: 'type', label: 'Type', render: row => {
        const c = { rub: '#f59e0b', mop: '#3b82f6', marinade: '#a855f7', injection: '#22c55e', glaze: '#f43f5e' }
        return <span style={{ fontSize: 12, fontWeight: 600, color: c[row.type] || '#e4e4e7' }}>{row.type}</span>
      }},
      { key: 'difficulty', label: 'Difficulté' }, statusCol,
    ]
    case 'faq': return [
      { key: 'question', label: 'Question', render: row => <span style={{ fontWeight: 500, color: '#e4e4e7', fontSize: 13 }}>{row.question}</span> },
      meatCol, statusCol,
    ]
    case 'woods': return [
      { key: 'name', label: 'Essence', render: row => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{row.emoji}</span>
          <div>
            <div style={{ fontWeight: 600, color: '#e4e4e7', fontSize: 13 }}>{row.name}</div>
            {row.is_toxic && <span style={{ fontSize: 9, color: '#ef4444', fontWeight: 700 }}>TOXIQUE</span>}
          </div>
        </div>
      )},
      { key: 'intensity', label: 'Intensité', render: row => {
        const c = { leger: '#22c55e', moyen: '#f59e0b', fort: '#ef4444' }
        const l = { leger: 'Léger', moyen: 'Moyen', fort: 'Fort' }
        return <span style={{ fontSize: 12, fontWeight: 600, color: c[row.intensity] || '#e4e4e7' }}>{l[row.intensity] || row.intensity}</span>
      }},
      { key: 'flavor_profile', label: 'Saveur', render: row => <span style={{ fontSize: 12, color: '#a1a1aa' }}>{row.flavor_profile}</span> }, statusCol,
    ]
    case 'bbq': return [
      { key: 'name', label: 'Type', render: row => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{row.icon}</span>
          <div>
            <div style={{ fontWeight: 600, color: '#e4e4e7', fontSize: 13 }}>{row.name}</div>
            <div style={{ fontSize: 11, color: '#71717a' }}>{row.price_range}</div>
          </div>
        </div>
      )},
      { key: 'level', label: 'Niveau', render: row => {
        const c = { debutant: '#22c55e', intermediaire: '#f59e0b', avance: '#ef4444' }
        const l = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' }
        return <span style={{ fontSize: 12, fontWeight: 600, color: c[row.level] || '#e4e4e7' }}>{l[row.level] || row.level}</span>
      }},
      { key: 'fuel', label: 'Combustible', render: row => <span style={{ fontSize: 12, color: '#a1a1aa' }}>{row.fuel}</span> }, statusCol,
    ]
    case 'profiles': return [
      { key: 'name', label: 'Profil', render: row => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{row.icon}</span>
          <div>
            <div style={{ fontWeight: 600, color: '#e4e4e7', fontSize: 13 }}>{row.name}</div>
            <div style={{ fontSize: 11, color: '#71717a' }}>{row.id} — {row.cook_type}</div>
          </div>
        </div>
      )},
      { key: 'category', label: 'Catégorie', render: row => ({ boeuf: 'Boeuf', porc: 'Porc', volaille: 'Volaille' })[row.category] || row.category },
      { key: 'cook_type', label: 'Type', render: row => {
        const c = { low_and_slow: '#f59e0b', reverse_sear: '#f43f5e' }
        const l = { low_and_slow: 'Low & Slow', reverse_sear: 'Reverse Sear' }
        return <span style={{ fontSize: 12, fontWeight: 600, color: c[row.cook_type] || '#e4e4e7' }}>{l[row.cook_type] || row.cook_type}</span>
      }},
      { key: 'is_active', label: 'Statut', render: row => (
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4, color: row.is_active !== false ? '#22c55e' : '#71717a', background: row.is_active !== false ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)' }}>
          {row.is_active !== false ? 'Actif' : 'Inactif'}
        </span>
      )},
    ]
    default: return []
  }
}

// ── Empty records ──────────────────────────────────────────────
function getEmptyRecord(tab) {
  const base = { status: 'draft', sort_order: 0 }
  switch (tab) {
    case 'seo':       return { ...base, title: '', slug: '', content: '', meat_type: '', cooking_method: '', is_global: false }
    case 'affiliate': return { ...base, title: '', slug: '', description: '', image_url: '', affiliate_url: '', cta_text: 'Voir le produit', badge: '', meat_type: '', placements: [] }
    case 'guides':    return { ...base, title: '', slug: '', summary: '', content: '', cover_url: '', category: '', tags: [], meat_type: '', seo_title: '', seo_description: '' }
    case 'recipes':   return { ...base, title: '', slug: '', type: 'rub', summary: '', description: '', ingredients: [], steps: [], yield_amount: '', prep_time: '', meat_types: [], origin: '', difficulty: 'facile', tags: [], cover_url: '' }
    case 'faq':       return { ...base, question: '', answer: '', meat_type: '', cooking_method: '', is_global: false }
    case 'woods':     return { ...base, id: '', name: '', scientific_name: '', emoji: '', intensity: 'moyen', flavor_profile: '', description: '', best_meats: [], avoid_meats: [], burn_characteristics: '', origin: '', availability_eu: '', safety_notes: '', pitmaster_tips: '', source: '', is_toxic: false, toxic_reason: '' }
    case 'bbq':       return { ...base, id: '', name: '', alt_names: [], icon: '', tagline: '', description: '', temp_range: '', fuel: '', price_range: '', level: 'debutant', capacity: '', pros: [], cons: [], best_for: [], not_ideal_for: [], brands: [], tips: '' }
    case 'profiles':  return { sort_order: 0, id: '', name: '', category: 'boeuf', icon: '🥩', cook_type: 'low_and_slow', supports_wrap: true, temp_bands: [{ temp_c: 107, min_per_kg: 120 }, { temp_c: 121, min_per_kg: 90 }, { temp_c: 135, min_per_kg: 70 }], fixed_times: null, wrap_reduction_percent: 12, rest_min: 30, rest_max: 60, reverse_sear: null, doneness_targets: null, cues: { stall_temp_min: 65, stall_temp_max: 77, wrap_temp_min: 68, wrap_temp_max: 74, begin_test_temp: 90, target_temp_min: 93, target_temp_max: 98 }, phases_text: null, is_active: true }
    default: return base
  }
}
function getFormTitle(tab) {
  return { seo: 'bloc SEO', affiliate: 'produit affilié', guides: 'guide', recipes: 'recette', faq: 'FAQ', woods: 'essence de bois', bbq: 'type BBQ', profiles: 'profil de cuisson' }[tab] || 'contenu'
}

// ── Main AdminPage ─────────────────────────────────────────────
export default function AdminPage() {
  const { profile, signOut } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('overview')
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [counts, setCounts] = useState({})

  const tableName = TABLE_MAP[tab]

  useEffect(() => { if (tableName) loadItems() }, [tab])
  useEffect(() => { if (tab === 'overview') loadCounts() }, [tab])

  const loadItems = async () => {
    setLoading(true); setEditing(null)
    try { const data = await adminCms.list(tableName); setItems(data) }
    catch (err) { toast.error('Erreur de chargement : ' + err.message) }
    setLoading(false)
  }

  const loadCounts = async () => {
    try {
      const [seo, aff, guides, recipes, faq, woods, bbq, profiles] = await Promise.all([
        adminCms.list('seo_blocks'), adminCms.list('affiliate_tools'), adminCms.list('guides'),
        adminCms.list('recipes'), adminCms.list('faqs'),
        adminCms.list('woods').catch(() => []), adminCms.list('bbq_types').catch(() => []), adminCms.list('cooking_profiles').catch(() => []),
      ])
      setCounts({
        seo: seo.length, seo_pub: seo.filter(i => i.status === 'published').length,
        affiliate: aff.length, aff_pub: aff.filter(i => i.status === 'published').length,
        guides: guides.length, guides_pub: guides.filter(i => i.status === 'published').length,
        recipes: recipes.length, recipes_pub: recipes.filter(i => i.status === 'published').length,
        faq: faq.length, faq_pub: faq.filter(i => i.status === 'published').length,
        woods: woods.length, woods_pub: woods.filter(i => i.status === 'published').length,
        bbq: bbq.length, bbq_pub: bbq.filter(i => i.status === 'published').length,
        profiles: profiles.length, profiles_active: profiles.filter(i => i.is_active).length,
      })
    } catch (err) { console.error('Counts error:', err) }
  }

  const handleSave = async (record) => {
    setSaving(true)
    try {
      const isTextIdTable = tab === 'woods' || tab === 'bbq' || tab === 'profiles'
      const isNew = isTextIdTable ? !record._existing : !record.id
      if (record.title && !record.slug) record.slug = slugify(record.title)
      Object.keys(record).forEach(k => { if (record[k] === '' && !(isTextIdTable && k === 'id')) record[k] = null })
      const { _existing, ...cleanRecord } = record
      if (isNew) { if (!isTextIdTable) delete cleanRecord.id; await adminCms.create(tableName, cleanRecord); toast.success('Contenu créé') }
      else { const { id, created_at, updated_at, ...updates } = cleanRecord; await adminCms.update(tableName, id, updates); toast.success('Modifications enregistrées') }
      await loadItems()
    } catch (err) { toast.error('Erreur : ' + (err.message || 'Impossible d\'enregistrer')) }
    setSaving(false)
  }

  const handleToggle = async (row) => {
    try {
      if (tab === 'profiles') await adminCms.update(tableName, row.id, { is_active: !row.is_active })
      else await adminCms.toggleStatus(tableName, row.id, row.status === 'published' ? 'draft' : 'published')
      await loadItems()
    } catch (err) { toast.error('Erreur : ' + err.message) }
  }

  const handleDelete = async (row) => {
    if (!confirm(`Supprimer "${row.title || row.name || row.question}" ?`)) return
    try { await adminCms.remove(tableName, row.id); toast.success('Supprimé'); await loadItems() }
    catch (err) { toast.error('Erreur : ' + err.message) }
  }

  const handleNew = () => setEditing(getEmptyRecord(tab))
  const shellCounts = { guides: counts.guides, recipes: counts.recipes, seo: counts.seo, faq: counts.faq, affiliate: counts.affiliate, profiles: counts.profiles, bbq: counts.bbq, woods: counts.woods }

  return (
    <>
      <AdminShell activeTab={tab} onTabChange={setTab} profile={profile} signOut={signOut} counts={shellCounts}>
        {tab === 'overview' && <OverviewTab counts={counts} on={setTab} />}
        {tab === 'stats'    && <StatisticsTab />}
        {tab === 'settings' && <SettingsTab toast={toast} />}
        {tableName && !editing && (
          <ListView tab={tab} items={items} loading={loading} onNew={handleNew}
            onEdit={item => setEditing((tab === 'woods' || tab === 'bbq' || tab === 'profiles') ? { ...item, _existing: true } : item)}
            onToggle={handleToggle} onDelete={handleDelete} />
        )}
        {tableName && editing && (
          <FormView tab={tab} record={editing} saving={saving} onSave={handleSave} onCancel={() => setEditing(null)} />
        )}
      </AdminShell>
      <ToastContainer toasts={toast.toasts} />
    </>
  )
}

// ── Overview ──────────────────────────────────────────────────
function OverviewTab({ counts, on }) {
  const cards = [
    { key: 'guides', label: 'Guides', icon: '📚', total: counts.guides, pub: counts.guides_pub },
    { key: 'recipes', label: 'Recettes', icon: '🧂', total: counts.recipes, pub: counts.recipes_pub },
    { key: 'seo', label: 'Blocs SEO', icon: '🔍', total: counts.seo, pub: counts.seo_pub },
    { key: 'faq', label: 'FAQ', icon: '❓', total: counts.faq, pub: counts.faq_pub },
    { key: 'affiliate', label: 'Affiliation', icon: '🛠️', total: counts.affiliate, pub: counts.aff_pub },
    { key: 'woods', label: 'Essences de bois', icon: '🪵', total: counts.woods, pub: counts.woods_pub },
    { key: 'bbq', label: 'Types BBQ', icon: '🏭', total: counts.bbq, pub: counts.bbq_pub },
    { key: 'profiles', label: 'Profils cuisson', icon: '🔥', total: counts.profiles, pub: counts.profiles_active },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e4e4e7', marginBottom: 4, marginTop: 0 }}>Bienvenue dans l'Atelier CMS</h2>
        <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>Gérez vos contenus, guides, recettes et réglages depuis ici.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {cards.map(card => (
          <button key={card.key} onClick={() => on(card.key)}
            style={{ padding: '18px 20px', background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,107,26,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>{card.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#e4e4e7', lineHeight: 1 }}>{card.total ?? '—'}</div>
            <div style={{ fontSize: 11, color: '#52525b', marginTop: 4 }}>{card.pub ?? 0} publiés</div>
          </button>
        ))}
      </div>
      <div style={{ padding: '20px 24px', background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#71717a', lineHeight: 1.6 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7', margin: '0 0 8px' }}>Démarrage rapide</h3>
        <p>1. Exécutez <Code>003_cms.sql</Code> puis <Code>004_cms_seed.sql</Code> dans le SQL Editor de Supabase.</p>
        <p>2. Créez vos <strong style={{ color: '#a1a1aa' }}>Guides</strong> et <strong style={{ color: '#a1a1aa' }}>Recettes</strong> — ils apparaissent automatiquement sur le site.</p>
        <p>3. Les <strong style={{ color: '#a1a1aa' }}>Blocs SEO</strong> et la <strong style={{ color: '#a1a1aa' }}>FAQ</strong> s'affichent sous le calculateur selon le contexte.</p>
        <p>4. Les <strong style={{ color: '#a1a1aa' }}>Profils cuisson</strong> alimentent directement le moteur du calculateur.</p>
      </div>
    </div>
  )
}

// ── List View ──────────────────────────────────────────────────
function ListView({ tab, items, loading, onNew, onEdit, onToggle, onDelete }) {
  const [search, setSearch] = useState('')
  const columns = getColumns(tab)
  const filtered = search.trim() ? items.filter(item => (item.title || item.name || item.question || '').toLowerCase().includes(search.toLowerCase())) : items
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 7, color: '#e4e4e7', fontSize: 13, outline: 'none', width: 220 }} />
          <span style={{ fontSize: 12, color: '#52525b' }}>{filtered.length} élément{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <button onClick={onNew}
          style={{ padding: '8px 18px', background: '#ff6b1a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          + Nouveau
        </button>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '48px 0', color: '#52525b', fontSize: 13 }}>Chargement...</div> : (
        <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
          <AdminTable columns={columns} rows={filtered} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} emptyMessage="Aucun contenu. Cliquez sur + Nouveau pour commencer." />
        </div>
      )}
    </div>
  )
}

// ── Form View ──────────────────────────────────────────────────
function FormView({ tab, record, saving, onSave, onCancel }) {
  const [form, setForm] = useState({ ...record })
  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))
  const isNew = (tab === 'woods' || tab === 'bbq' || tab === 'profiles') ? !record._existing : !record.id
  const isWide = tab === 'guides' || tab === 'recipes'

  const SaveBtn = ({ full }) => (
    <button onClick={() => onSave(form)} disabled={saving}
      style={{ padding: full ? '10px' : '8px 20px', width: full ? '100%' : 'auto', background: '#ff6b1a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
      {saving ? 'Enregistrement...' : isNew ? 'Créer' : 'Enregistrer'}
    </button>
  )

  return (
    <div style={{ maxWidth: isWide ? 1100 : 720 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={onCancel} style={{ fontSize: 13, color: '#71717a', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Retour à la liste</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#a1a1aa', fontSize: 13, cursor: 'pointer' }}>Annuler</button>
          <SaveBtn />
        </div>
      </div>

      {/* Title field */}
      {tab !== 'faq' && tab !== 'woods' && tab !== 'bbq' && tab !== 'profiles' && (
        <div style={{ marginBottom: 20 }}>
          <input value={form.title || ''} onChange={e => { set('title', e.target.value); if (!record.id && !record.slug) set('slug', slugify(e.target.value)) }}
            placeholder={`Titre du ${getFormTitle(tab)}...`}
            style={{ width: '100%', padding: '11px 0', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#e4e4e7', fontSize: 22, fontWeight: 700, outline: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span style={{ fontSize: 11, color: '#52525b' }}>Slug :</span>
            <input value={form.slug || ''} onChange={e => set('slug', e.target.value)}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: '2px 8px', color: '#71717a', fontSize: 11, outline: 'none', fontFamily: 'monospace', width: 260 }} />
          </div>
        </div>
      )}

      {/* Text-id header (woods/bbq/profiles) */}
      {(tab === 'woods' || tab === 'bbq' || tab === 'profiles') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div style={{ padding: 18, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
            <F label="Identifiant (id)" hint="Non modifiable après création."><SI value={form.id} onChange={v => set('id', v)} placeholder="ex: chene, offset..." disabled={!!record.id && record._existing} /></F>
          </div>
          <div style={{ padding: 18, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
            <F label="Nom affiché"><SI value={form.name} onChange={v => set('name', v)} placeholder="Nom lisible" /></F>
          </div>
        </div>
      )}

      {/* Two-column layout for guides/recipes */}
      {isWide ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tab === 'guides'  && <GuideMainFields form={form} set={set} />}
            {tab === 'recipes' && <RecipeMainFields form={form} set={set} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <MetaCard title="Publication">
              <F label="Statut"><SS value={form.status} onChange={v => set('status', v)} options={STATUS_OPTIONS} /></F>
              <F label="Ordre d'affichage"><SI type="number" value={form.sort_order ?? 0} onChange={v => set('sort_order', parseInt(v) || 0)} /></F>
            </MetaCard>
            <MetaCard title="Image de couverture">
              <SI value={form.cover_url || ''} onChange={v => set('cover_url', v)} placeholder="https://..." />
              <ImagePreview url={form.cover_url} />
            </MetaCard>
            {tab === 'guides'  && <GuideMetaFields form={form} set={set} />}
            {tab === 'recipes' && <RecipeMetaFields form={form} set={set} />}
            <SaveBtn full />
          </div>
        </div>
      ) : (
        /* Single-column */
        <div style={{ padding: 24, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tab === 'seo'       && <SeoFields       form={form} set={set} />}
          {tab === 'affiliate' && <AffiliateFields form={form} set={set} />}
          {tab === 'faq'       && <FaqFields       form={form} set={set} />}
          {tab === 'woods'     && <WoodFields      form={form} set={set} />}
          {tab === 'bbq'       && <BbqFields       form={form} set={set} />}
          {tab === 'profiles'  && <ProfileFields   form={form} set={set} />}
          {tab !== 'profiles' && (
            <G2>
              <F label="Statut"><SS value={form.status} onChange={v => set('status', v)} options={STATUS_OPTIONS} /></F>
              <F label="Ordre d'affichage"><SI type="number" value={form.sort_order ?? 0} onChange={v => set('sort_order', parseInt(v) || 0)} /></F>
            </G2>
          )}
          <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}><SaveBtn /></div>
        </div>
      )}
    </div>
  )
}

// ── Settings Tab ───────────────────────────────────────────────
const MODULE_LABELS = {
  seo_blocks:   { label: 'Blocs SEO',         icon: '🔍', desc: 'Contenus SEO contextuels sous le calculateur' },
  affiliate:    { label: 'Affiliation',        icon: '🛠️', desc: 'Recommandations de produits avec liens affiliés' },
  faq:          { label: 'FAQ',                icon: '❓', desc: 'Questions fréquentes contextuelles' },
  guides:       { label: 'Guides',             icon: '📚', desc: 'Articles et guides BBQ' },
  recipes:      { label: 'Recettes',           icon: '🧂', desc: 'Rubs, mops, marinades et glazes' },
  wood_guide:   { label: 'Essences de bois',   icon: '🪵', desc: 'Guide des bois de fumage' },
  comparator:   { label: 'Comparateur',        icon: '📊', desc: 'Comparaison côte à côte' },
  favorites:    { label: 'Favoris / Carnet',   icon: '❤️', desc: 'Sauvegarde de recettes favorites' },
  shared_cooks: { label: 'Partage social',     icon: '🔗', desc: 'Liens de partage de cuissons' },
  journal:      { label: 'Journal de cuisson', icon: '📋', desc: 'Historique des sessions de cuisson' },
}

function ToggleSwitch({ on, color = '#ff6b1a' }) {
  return (
    <div style={{ width: 36, height: 20, borderRadius: 10, background: on ? color : '#3f3f46', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
      <div style={{ width: 16, height: 16, borderRadius: 8, background: '#fff', position: 'absolute', top: 2, left: on ? 18 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </div>
  )
}

function SCard({ icon, title, desc, children }) {
  return (
    <div style={{ padding: '22px', background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#e4e4e7', margin: 0 }}>{title}</h2>
          <p style={{ fontSize: 12, color: '#71717a', margin: '3px 0 0' }}>{desc}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function SettingsTab({ toast }) {
  const { refresh } = useSiteSettings()
  const [branding, setBranding] = useState({ site_name_line1: 'CHARBON', site_name_line2: '& FLAMME', tagline: "L'arsenal du pitmaster", logo_url: '' })
  const [modules, setModules] = useState({})
  const [maintenance, setMaintenance] = useState({ enabled: false, message: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAllSettings().then(all => {
      if (all.branding)    setBranding(prev => ({ ...prev, ...all.branding }))
      if (all.modules)     setModules(all.modules)
      if (all.maintenance) setMaintenance(prev => ({ ...prev, ...all.maintenance }))
      setLoading(false)
    })
  }, [])

  const saveBranding = async () => {
    setSaving(true)
    try {
      const b = { ...branding, logo_url: branding.logo_url || null }
      await updateSetting('branding', b); setSiteBranding(b.site_name_line1, b.site_name_line2, b.tagline)
      document.title = [b.site_name_line1, b.site_name_line2].filter(Boolean).join(' ') + (b.tagline ? ` — ${b.tagline}` : '')
      await refresh(); toast.success("Identité enregistrée")
    } catch (err) { toast.error('Erreur : ' + err.message) }
    setSaving(false)
  }

  const toggleModule = async key => {
    const nm = { ...modules, [key]: !modules[key] }; setModules(nm)
    try { await updateSetting('modules', nm); await refresh() }
    catch (err) { toast.error('Erreur module'); setModules(modules) }
  }

  const toggleMaintenance = async () => {
    const nm = { ...maintenance, enabled: !maintenance.enabled }; setMaintenance(nm)
    try { await updateSetting('maintenance', nm); await refresh(); toast.success(nm.enabled ? 'Maintenance activée' : 'Maintenance désactivée') }
    catch (err) { toast.error('Erreur'); setMaintenance(maintenance) }
  }

  const saveMaintMsg = async () => {
    try { await updateSetting('maintenance', maintenance); await refresh(); toast.success('Message enregistré') }
    catch (err) { toast.error('Erreur : ' + err.message) }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '48px 0', color: '#52525b', fontSize: 13 }}>Chargement...</div>

  return (
    <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <SCard icon="🎨" title="Identité du site" desc="Logo, nom et tagline affichés dans la navigation">
        <G2>
          <F label="Nom ligne 1"><SI value={branding.site_name_line1} onChange={v => setBranding(p => ({ ...p, site_name_line1: v }))} placeholder="CHARBON" /></F>
          <F label="Nom ligne 2"><SI value={branding.site_name_line2} onChange={v => setBranding(p => ({ ...p, site_name_line2: v }))} placeholder="& FLAMME" /></F>
        </G2>
        <F label="Tagline"><SI value={branding.tagline} onChange={v => setBranding(p => ({ ...p, tagline: v }))} placeholder="L'arsenal du pitmaster" /></F>
        <F label="URL du logo" hint="Laisser vide = flamme par défaut">
          <SI value={branding.logo_url || ''} onChange={v => setBranding(p => ({ ...p, logo_url: v }))} placeholder="https://..." />
          <ImagePreview url={branding.logo_url} />
        </F>
        <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Aperçu</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {branding.logo_url ? <img src={branding.logo_url} alt="Logo" style={{ width: 30, height: 30, borderRadius: 6, objectFit: 'contain' }} /> : <div style={{ width: 30, height: 30, borderRadius: 6, background: 'linear-gradient(135deg,#ff6b1a,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🔥</div>}
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>{branding.site_name_line1 || 'CHARBON'}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#ff6b1a', letterSpacing: '0.2em' }}>{branding.site_name_line2 || '& FLAMME'}</div>
            </div>
          </div>
          {branding.tagline && <p style={{ fontSize: 11, color: '#71717a', marginTop: 6, marginBottom: 0 }}>{branding.tagline}</p>}
        </div>
        <button onClick={saveBranding} disabled={saving} style={{ padding: '9px 22px', background: '#ff6b1a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Enregistrement...' : "Enregistrer l'identité"}
        </button>
      </SCard>

      <SCard icon="🔧" title="Mode maintenance" desc="Affiche une page de maintenance aux visiteurs. Les admins gardent l'accès.">
        <button onClick={toggleMaintenance} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: maintenance.enabled ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${maintenance.enabled ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
          <span style={{ fontSize: 17 }}>{maintenance.enabled ? '🚧' : '🔧'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: maintenance.enabled ? '#fca5a5' : '#e4e4e7' }}>{maintenance.enabled ? 'Maintenance activée' : 'Maintenance désactivée'}</div>
            <div style={{ fontSize: 11, color: '#71717a', marginTop: 1 }}>{maintenance.enabled ? 'Seuls les admins voient le contenu' : 'Site accessible à tous'}</div>
          </div>
          <ToggleSwitch on={maintenance.enabled} color="#ef4444" />
        </button>
        {maintenance.enabled && (
          <>
            <F label="Message de maintenance">
              <SI value={maintenance.message || ''} onChange={v => setMaintenance(p => ({ ...p, message: v }))} placeholder="Le site est en cours de maintenance..." />
            </F>
            <button onClick={saveMaintMsg} style={{ padding: '8px 18px', background: '#ff6b1a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Enregistrer le message</button>
          </>
        )}
      </SCard>

      <SCard icon="🧩" title="Modules" desc="Active ou désactive les fonctionnalités. Effet immédiat.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {Object.entries(MODULE_LABELS).map(([key, { label, icon, desc }]) => {
            const on = modules[key] !== false
            return (
              <button key={key} onClick={() => toggleModule(key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', background: on ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, cursor: 'pointer', textAlign: 'left', width: '100%', opacity: on ? 1 : 0.55 }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#71717a', marginTop: 1 }}>{desc}</div>
                </div>
                <ToggleSwitch on={on} />
              </button>
            )
          })}
        </div>
      </SCard>
    </div>
  )
}
