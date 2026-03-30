/**
 * CHARBON & FLAMME — Guide des Essences de Bois
 * Page interactive avec filtrage par intensité, cartes expansibles,
 * section bois toxiques avec avertissement.
 */

import { useState, useEffect, useMemo } from 'react'
import { fetchWoods } from '../lib/woods.js'

/* ── Intensity config ── */
const INTENSITY_CONFIG = {
  leger: { label: 'Léger', color: '#22c55e', bg: 'from-green-500/10 to-green-600/5', border: 'border-green-500/20', dot: 'bg-green-500' },
  moyen: { label: 'Moyen', color: '#f59e0b', bg: 'from-amber-500/10 to-amber-600/5', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  fort:  { label: 'Fort',  color: '#ef4444', bg: 'from-red-500/10 to-red-600/5', border: 'border-red-500/20', dot: 'bg-red-500' },
}

/* ── Availability labels ── */
const AVAIL_LABELS = {
  excellente: { text: 'Excellente', color: 'text-green-400' },
  bonne: { text: 'Bonne', color: 'text-emerald-400' },
  moyenne: { text: 'Moyenne', color: 'text-amber-400' },
  limitee: { text: 'Limitée', color: 'text-red-400' },
}

export default function WoodGuidePage() {
  const [woods, setWoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchWoods().then(data => { setWoods(data); setLoading(false) })
  }, [])

  /* Séparer bois de fumage et bois toxiques */
  const smokingWoods = useMemo(() => woods.filter(w => !w.is_toxic), [woods])
  const toxicWoods = useMemo(() => woods.filter(w => w.is_toxic), [woods])

  /* Filtrage */
  const filtered = useMemo(() => {
    let list = smokingWoods
    if (filter !== 'all') list = list.filter(w => w.intensity === filter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.flavor_profile.toLowerCase().includes(q) ||
        w.best_meats.some(m => m.toLowerCase().includes(q))
      )
    }
    return list
  }, [smokingWoods, filter, searchQuery])

  /* Compteurs par intensité */
  const counts = useMemo(() => {
    const c = { all: smokingWoods.length, leger: 0, moyen: 0, fort: 0 }
    smokingWoods.forEach(w => { if (c[w.intensity] !== undefined) c[w.intensity]++ })
    return c
  }, [smokingWoods])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" /></svg>
          Chargement des essences...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* ── Hero with image ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1587049016823-69ef9d68f4e0?w=1400&h=400&fit=crop&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-[#0a0a0a]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/20" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="animate-fade-up">
            <div className="badge badge-accent mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b1a] mr-2 animate-pulse" />
              Guide du fumage
            </div>
            <h1 className="font-display text-[30px] lg:text-[40px] font-black text-white tracking-tight leading-[1.1] mb-3">
              Essences de <span className="text-gradient">Bois</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-[16px] max-w-xl leading-relaxed">
              Chaque bois donne un caractère unique à ta viande. Intensité, profil aromatique,
              meilleurs accords.
            </p>

            {/* Légende intensité */}
            <div className="flex items-center gap-6 mt-6">
              {Object.entries(INTENSITY_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  <span className="text-xs text-zinc-400 font-medium">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* ── Filtres ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Boutons intensité */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Toutes' },
              { key: 'leger', label: 'Léger' },
              { key: 'moyen', label: 'Moyen' },
              { key: 'fort', label: 'Fort' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === key
                    ? 'bg-[#ff6b1a] text-white shadow-lg shadow-[#ff6b1a]/20'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 border border-white/[0.06]'
                }`}
              >
                {label}
                <span className="ml-1.5 text-[10px] opacity-70">{counts[key]}</span>
              </button>
            ))}
          </div>

          {/* Recherche */}
          <div className="relative sm:ml-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              placeholder="Chercher une essence, viande..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-lg bg-zinc-800/60 border border-white/[0.06] text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#ff6b1a]/30 focus:ring-1 focus:ring-[#ff6b1a]/20"
            />
          </div>
        </div>

        {/* ── Grille de bois ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <p className="text-lg">Aucune essence trouvée</p>
            <p className="text-sm mt-1">Essaie un autre filtre ou terme de recherche</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map(wood => (
              <WoodCard
                key={wood.id}
                wood={wood}
                expanded={expandedId === wood.id}
                onToggle={() => setExpandedId(expandedId === wood.id ? null : wood.id)}
              />
            ))}
          </div>
        )}

        {/* ── Section bois toxiques ── */}
        {toxicWoods.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-400">Bois à éviter absolument</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Toxiques, dangereux ou nocifs pour la santé</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {toxicWoods.map(wood => (
                <div
                  key={wood.id}
                  className="p-4 rounded-xl bg-red-500/[0.04] border border-red-500/[0.15] hover:border-red-500/25 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0">{wood.emoji || '☠️'}</span>
                    <div>
                      <h3 className="font-bold text-red-300 text-sm">{wood.name}</h3>
                      {wood.scientific_name && (
                        <p className="text-[10px] text-zinc-600 italic">{wood.scientific_name}</p>
                      )}
                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{wood.toxic_reason || wood.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Note pédagogique ── */}
        <div className="mt-16 p-6 rounded-2xl bg-gradient-to-r from-[#ff6b1a]/[0.05] to-[#ef4444]/[0.03] border border-[#ff6b1a]/[0.10]">
          <div className="flex items-start gap-4">
            <span className="text-2xl shrink-0">💡</span>
            <div>
              <h3 className="font-bold text-zinc-200 text-sm mb-2">Le mythe du trempage</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Contrairement à une idée reçue, tremper les copeaux ne prolonge pas la fumée — ça retarde juste le moment
                où ils commencent à fumer. L'eau ne pénètre que la surface du bois. Pour un fumage constant,
                mieux vaut utiliser des chunks secs et contrôler la ventilation.
              </p>
              <p className="text-[10px] text-zinc-600 mt-2">
                Source : Meathead Goldwyn — AmazingRibs.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   WoodCard — Carte expansible pour chaque bois
   ══════════════════════════════════════════════ */

function WoodCard({ wood, expanded, onToggle }) {
  const cfg = INTENSITY_CONFIG[wood.intensity] || INTENSITY_CONFIG.moyen
  const avail = wood.availability_eu ? AVAIL_LABELS[wood.availability_eu] : null

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        expanded
          ? `bg-gradient-to-r ${cfg.bg} ${cfg.border}`
          : 'bg-zinc-900/40 border-white/[0.06] hover:border-white/[0.12] hover:bg-zinc-900/60'
      }`}
    >
      {/* En-tête cliquable */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <span className="text-2xl shrink-0">{wood.emoji || '🪵'}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-white text-sm">{wood.name}</h3>
            <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 truncate">{wood.flavor_profile}</p>
        </div>

        {/* Best meats preview */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          {wood.best_meats.slice(0, 3).map((meat, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 border border-white/[0.04]">
              {meat}
            </span>
          ))}
          {wood.best_meats.length > 3 && (
            <span className="text-[10px] text-zinc-600">+{wood.best_meats.length - 3}</span>
          )}
        </div>

        {/* Chevron */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`shrink-0 text-zinc-600 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Contenu expansible */}
      {expanded && (
        <div className="px-5 pb-5 animate-fade">
          <div className="h-px bg-white/[0.06] mb-4" />

          {/* Description */}
          <p className="text-sm text-zinc-300 leading-relaxed mb-4">{wood.description}</p>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Colonne gauche */}
            <div className="space-y-3">
              {/* Viandes recommandées */}
              <DetailBlock title="Viandes recommandées" icon="✅">
                <div className="flex flex-wrap gap-1.5">
                  {wood.best_meats.map((m, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/15">
                      {m}
                    </span>
                  ))}
                </div>
              </DetailBlock>

              {/* Viandes à éviter */}
              {wood.avoid_meats.length > 0 && (
                <DetailBlock title="À éviter" icon="⚠️">
                  <div className="flex flex-wrap gap-1.5">
                    {wood.avoid_meats.map((m, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/15">
                        {m}
                      </span>
                    ))}
                  </div>
                </DetailBlock>
              )}

              {/* Disponibilité EU */}
              {avail && (
                <DetailBlock title="Disponibilité en Europe" icon="🇪🇺">
                  <span className={`text-xs font-semibold ${avail.color}`}>{avail.text}</span>
                </DetailBlock>
              )}
            </div>

            {/* Colonne droite */}
            <div className="space-y-3">
              {/* Caractéristiques de combustion */}
              {wood.burn_characteristics && (
                <DetailBlock title="Combustion" icon="🔥">
                  <p className="text-xs text-zinc-400 leading-relaxed">{wood.burn_characteristics}</p>
                </DetailBlock>
              )}

              {/* Origine */}
              {wood.origin && (
                <DetailBlock title="Origine" icon="🌍">
                  <p className="text-xs text-zinc-400">{wood.origin}</p>
                </DetailBlock>
              )}

              {/* Nom scientifique */}
              {wood.scientific_name && (
                <DetailBlock title="Nom scientifique" icon="🔬">
                  <p className="text-xs text-zinc-400 italic">{wood.scientific_name}</p>
                </DetailBlock>
              )}
            </div>
          </div>

          {/* Tips du pitmaster */}
          {wood.pitmaster_tips && (
            <div className="mt-4 p-3.5 rounded-xl bg-[#ff6b1a]/[0.06] border border-[#ff6b1a]/[0.12]">
              <div className="flex items-start gap-2.5">
                <span className="text-sm shrink-0">🎯</span>
                <div>
                  <p className="text-[10px] font-bold text-[#ff6b1a]/80 uppercase tracking-wider mb-1">Tip Pitmaster</p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{wood.pitmaster_tips}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes de sécurité */}
          {wood.safety_notes && (
            <div className="mt-3 p-3 rounded-lg bg-amber-500/[0.05] border border-amber-500/[0.10]">
              <p className="text-[10px] text-amber-400/80 font-medium">⚠️ {wood.safety_notes}</p>
            </div>
          )}

          {/* Source */}
          {wood.source && (
            <p className="mt-3 text-[10px] text-zinc-600">
              Source : {wood.source}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Detail block sub-component ── */
function DetailBlock({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs">{icon}</span>
        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  )
}
