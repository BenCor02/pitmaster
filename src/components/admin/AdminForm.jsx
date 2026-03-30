/**
 * AdminForm — Composant formulaire réutilisable pour le CMS
 */

export function FormField({ label, children, hint }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-2">
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-zinc-600 mt-1">{hint}</p>}
    </div>
  )
}

export function TextInput({ value, onChange, placeholder, ...props }) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[13px] text-white placeholder-zinc-700 focus:outline-none focus:border-[#ff6b1a]/30 transition-all"
      {...props}
    />
  )
}

export function TextArea({ value, onChange, placeholder, rows = 6, ...props }) {
  return (
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[13px] text-white placeholder-zinc-700 focus:outline-none focus:border-[#ff6b1a]/30 transition-all font-mono leading-relaxed resize-y"
      {...props}
    />
  )
}

export function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[13px] text-white focus:outline-none focus:border-[#ff6b1a]/30 transition-all appearance-none"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

export function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
        checked
          ? 'bg-[#ff6b1a] border-[#ff6b1a]'
          : 'bg-white/[0.03] border-white/[0.1] group-hover:border-white/[0.2]'
      }`}>
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span className="text-[13px] text-zinc-300">{label}</span>
    </label>
  )
}

export function FormActions({ onSave, onCancel, saving }) {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
      <button
        onClick={onSave}
        disabled={saving}
        className="btn-primary px-6 py-2.5 text-[13px] disabled:opacity-50"
      >
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
      {onCancel && (
        <button
          onClick={onCancel}
          className="px-4 py-2.5 text-[13px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Annuler
        </button>
      )}
    </div>
  )
}

/** Helper : génère un slug depuis un titre */
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Options communes pour les selects */
export const MEAT_OPTIONS = [
  { value: '', label: 'Tous (global)' },
  { value: 'brisket', label: 'Brisket' },
  { value: 'beef_short_ribs', label: 'Beef Short Ribs' },
  { value: 'chuck_roast', label: 'Chuck Roast' },
  { value: 'prime_rib', label: 'Prime Rib' },
  { value: 'tomahawk', label: 'Tomahawk' },
  { value: 'pulled_pork', label: 'Pulled Pork' },
  { value: 'spare_ribs', label: 'Spare Ribs' },
  { value: 'baby_back_ribs', label: 'Baby Back Ribs' },
  { value: 'whole_chicken', label: 'Poulet entier' },
]

export const METHOD_OPTIONS = [
  { value: '', label: 'Toutes' },
  { value: 'low_and_slow', label: 'Low & slow' },
  { value: 'reverse_sear', label: 'Reverse sear' },
]

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publié' },
  { value: 'archived', label: 'Archivé' },
]

export const CATEGORY_OPTIONS = [
  { value: 'viande', label: 'Viande' },
  { value: 'technique', label: 'Technique' },
  { value: 'equipement', label: 'Équipement' },
]
