import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import { adminCms } from '../lib/cms.js'
import AdminShell from '../components/admin/AdminShell.jsx'
import AdminTable, { StatusBadge } from '../components/admin/AdminTable.jsx'
import {
  FormField, TextInput, TextArea, Select, Checkbox, FormActions,
  slugify, MEAT_OPTIONS, METHOD_OPTIONS, STATUS_OPTIONS, CATEGORY_OPTIONS,
} from '../components/admin/AdminForm.jsx'
import MarkdownEditor from '../components/admin/MarkdownEditor.jsx'

// ── Tab mapping ────────────────────────────────────────────

const TABLE_MAP = {
  seo: 'seo_blocks',
  affiliate: 'affiliate_tools',
  guides: 'guides',
  recipes: 'recipes',
  faq: 'faqs',
}

const RECIPE_TYPE_OPTIONS = [
  { value: 'rub', label: 'Rub' },
  { value: 'mop', label: 'Mop' },
  { value: 'marinade', label: 'Marinade' },
  { value: 'injection', label: 'Injection' },
  { value: 'glaze', label: 'Glaze' },
]

const DIFFICULTY_OPTIONS = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'avancé', label: 'Avancé' },
]

// ── Main Admin Page ────────────────────────────────────────

export default function AdminPage() {
  const { profile, signOut } = useAuth()
  const [tab, setTab] = useState('overview')
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null) // null = list view, object = form view
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [counts, setCounts] = useState({})

  const tableName = TABLE_MAP[tab]

  // Load items when tab changes
  useEffect(() => {
    if (!tableName) return
    loadItems()
  }, [tab])

  // Load overview counts
  useEffect(() => {
    if (tab === 'overview') loadCounts()
  }, [tab])

  const loadItems = async () => {
    setLoading(true)
    setEditing(null)
    try {
      const data = await adminCms.list(tableName)
      setItems(data)
    } catch (err) {
      console.error('Load error:', err)
    }
    setLoading(false)
  }

  const loadCounts = async () => {
    try {
      const [seo, aff, guides, recipes, faq] = await Promise.all([
        adminCms.list('seo_blocks'),
        adminCms.list('affiliate_tools'),
        adminCms.list('guides'),
        adminCms.list('recipes'),
        adminCms.list('faqs'),
      ])
      setCounts({
        seo: seo.length,
        seo_pub: seo.filter(i => i.status === 'published').length,
        affiliate: aff.length,
        aff_pub: aff.filter(i => i.status === 'published').length,
        guides: guides.length,
        guides_pub: guides.filter(i => i.status === 'published').length,
        recipes: recipes.length,
        recipes_pub: recipes.filter(i => i.status === 'published').length,
        faq: faq.length,
        faq_pub: faq.filter(i => i.status === 'published').length,
      })
    } catch (err) {
      console.error('Counts error:', err)
    }
  }

  const handleSave = async (record) => {
    setSaving(true)
    try {
      const isNew = !record.id
      // Auto-generate slug if empty
      if (record.title && !record.slug) {
        record.slug = slugify(record.title)
      }
      // Clean empty strings to null
      Object.keys(record).forEach(k => {
        if (record[k] === '') record[k] = null
      })

      if (isNew) {
        delete record.id
        await adminCms.create(tableName, record)
      } else {
        const { id, created_at, updated_at, ...updates } = record
        await adminCms.update(tableName, id, updates)
      }
      await loadItems()
    } catch (err) {
      console.error('Save error:', err)
      alert('Erreur : ' + (err.message || 'Impossible d\'enregistrer'))
    }
    setSaving(false)
  }

  const handleToggle = async (row) => {
    const newStatus = row.status === 'published' ? 'draft' : 'published'
    try {
      await adminCms.toggleStatus(tableName, row.id, newStatus)
      await loadItems()
    } catch (err) {
      console.error('Toggle error:', err)
    }
  }

  const handleDelete = async (row) => {
    if (!confirm(`Supprimer "${row.title || row.question}" ?`)) return
    try {
      await adminCms.remove(tableName, row.id)
      await loadItems()
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const handleNew = () => {
    setEditing(getEmptyRecord(tab))
  }

  return (
    <AdminShell activeTab={tab} onTabChange={setTab}>
      {tab === 'overview' && <OverviewTab counts={counts} onNavigate={setTab} profile={profile} signOut={signOut} />}

      {tableName && !editing && (
        <ListView
          tab={tab}
          items={items}
          loading={loading}
          onNew={handleNew}
          onEdit={setEditing}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}

      {tableName && editing && (
        <FormView
          tab={tab}
          record={editing}
          saving={saving}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </AdminShell>
  )
}

// ── Overview ───────────────────────────────────────────────

function OverviewTab({ counts, onNavigate, profile, signOut }) {
  const cards = [
    { key: 'seo', label: 'Blocs SEO', icon: '🔍', total: counts.seo, pub: counts.seo_pub },
    { key: 'affiliate', label: 'Produits affiliés', icon: '🛠️', total: counts.affiliate, pub: counts.aff_pub },
    { key: 'guides', label: 'Guides', icon: '📚', total: counts.guides, pub: counts.guides_pub },
    { key: 'recipes', label: 'Recettes', icon: '🧂', total: counts.recipes, pub: counts.recipes_pub },
    { key: 'faq', label: 'FAQ', icon: '❓', total: counts.faq, pub: counts.faq_pub },
  ]

  return (
    <div className="space-y-6">
      <div className="surface p-5 flex items-center justify-between">
        <div>
          <p className="text-[13px] text-zinc-400">
            Connecté en tant que <span className="text-white font-medium">{profile?.display_name || profile?.email}</span>
          </p>
          <p className="text-[11px] text-zinc-600">Rôle : {profile?.role}</p>
        </div>
        <button onClick={signOut} className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">
          Déconnexion
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(card => (
          <button
            key={card.key}
            onClick={() => onNavigate(card.key)}
            className="surface p-5 text-left group hover:border-[#ff6b1a]/20 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{card.icon}</span>
              <span className="text-[12px] font-semibold text-zinc-400 group-hover:text-white transition-colors">
                {card.label}
              </span>
            </div>
            <p className="text-[28px] font-bold text-white">{card.total ?? '—'}</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">
              {card.pub ?? 0} publiés
            </p>
          </button>
        ))}
      </div>

      <div className="surface p-5">
        <h3 className="text-[14px] font-bold text-white mb-3">Guide rapide</h3>
        <div className="space-y-2 text-[13px] text-zinc-400 leading-relaxed">
          <p>1. Exécutez <code className="text-[#ff6b1a] bg-[#ff6b1a]/10 px-1.5 py-0.5 rounded text-[11px]">003_cms.sql</code> puis <code className="text-[#ff6b1a] bg-[#ff6b1a]/10 px-1.5 py-0.5 rounded text-[11px]">004_cms_seed.sql</code> dans le SQL Editor de Supabase</p>
          <p>2. Les contenus de démo apparaîtront dans les onglets ci-dessus</p>
          <p>3. Créez, modifiez et publiez vos contenus directement depuis ce panel</p>
          <p>4. Les blocs s'affichent automatiquement sous le calculateur en fonction du contexte (viande, méthode)</p>
        </div>
      </div>
    </div>
  )
}

// ── List View ──────────────────────────────────────────────

function ListView({ tab, items, loading, onNew, onEdit, onToggle, onDelete }) {
  const columns = getColumns(tab)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-zinc-500">{items.length} élément{items.length !== 1 ? 's' : ''}</p>
        <button onClick={onNew} className="btn-primary px-4 py-2 text-[13px]">
          + Ajouter
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-600 text-[13px]">Chargement...</div>
      ) : (
        <div className="surface overflow-hidden">
          <AdminTable
            columns={columns}
            rows={items}
            onEdit={onEdit}
            onToggle={onToggle}
            onDelete={onDelete}
            emptyMessage="Aucun contenu. Cliquez sur + Ajouter pour commencer."
          />
        </div>
      )}
    </div>
  )
}

// ── Form View ──────────────────────────────────────────────

function FormView({ tab, record, saving, onSave, onCancel }) {
  const [form, setForm] = useState({ ...record })
  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = () => onSave(form)

  return (
    <div className="max-w-2xl space-y-5">
      <button onClick={onCancel} className="text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors">
        ← Retour à la liste
      </button>

      <div className="surface p-6 space-y-5">
        <h2 className="text-[16px] font-bold text-white">
          {form.id ? 'Modifier' : 'Nouveau'} {getFormTitle(tab)}
        </h2>

        {/* Common fields */}
        {tab !== 'faq' && (
          <>
            <FormField label="Titre">
              <TextInput value={form.title} onChange={v => { set('title', v); if (!form.id) set('slug', slugify(v)) }} placeholder="Titre du contenu" />
            </FormField>
            <FormField label="Slug" hint="Identifiant URL unique, auto-généré">
              <TextInput value={form.slug} onChange={v => set('slug', v)} placeholder="slug-auto-genere" />
            </FormField>
          </>
        )}

        {/* Tab-specific fields */}
        {tab === 'seo' && <SeoFields form={form} set={set} />}
        {tab === 'affiliate' && <AffiliateFields form={form} set={set} />}
        {tab === 'guides' && <GuideFields form={form} set={set} />}
        {tab === 'recipes' && <RecipeFields form={form} set={set} />}
        {tab === 'faq' && <FaqFields form={form} set={set} />}

        {/* Common: status + sort */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Statut">
            <Select value={form.status} onChange={v => set('status', v)} options={STATUS_OPTIONS} />
          </FormField>
          <FormField label="Ordre d'affichage">
            <TextInput type="number" value={form.sort_order} onChange={v => set('sort_order', parseInt(v) || 0)} />
          </FormField>
        </div>

        <FormActions onSave={handleSubmit} onCancel={onCancel} saving={saving} />
      </div>
    </div>
  )
}

// ── Form field sets per tab ────────────────────────────────

function SeoFields({ form, set }) {
  return (
    <>
      <FormField label="Contenu (Markdown)">
        <TextArea value={form.content} onChange={v => set('content', v)} rows={10} placeholder="Contenu markdown du bloc SEO..." />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Viande ciblée">
          <Select value={form.meat_type} onChange={v => set('meat_type', v)} options={MEAT_OPTIONS} placeholder="Sélectionner..." />
        </FormField>
        <FormField label="Méthode de cuisson">
          <Select value={form.cooking_method} onChange={v => set('cooking_method', v)} options={METHOD_OPTIONS} placeholder="Sélectionner..." />
        </FormField>
      </div>
      <Checkbox checked={form.is_global} onChange={v => set('is_global', v)} label="Bloc global (affiché partout)" />
    </>
  )
}

function AffiliateFields({ form, set }) {
  return (
    <>
      <FormField label="Description">
        <TextArea value={form.description} onChange={v => set('description', v)} rows={3} placeholder="Description courte du produit..." />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="URL d'affiliation">
          <TextInput value={form.affiliate_url} onChange={v => set('affiliate_url', v)} placeholder="https://..." />
        </FormField>
        <FormField label="Texte du CTA">
          <TextInput value={form.cta_text} onChange={v => set('cta_text', v)} placeholder="Voir le produit" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="URL image">
          <TextInput value={form.image_url} onChange={v => set('image_url', v)} placeholder="https://..." />
        </FormField>
        <FormField label="Badge">
          <TextInput value={form.badge} onChange={v => set('badge', v)} placeholder="Essentiel, Recommandé, Pro..." />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Type de produit">
          <Select value={form.product_type} onChange={v => set('product_type', v)} options={[
            { value: 'thermometre', label: 'Thermomètre' },
            { value: 'fumoir', label: 'Fumoir' },
            { value: 'accessoire', label: 'Accessoire' },
            { value: 'couteau', label: 'Couteau' },
            { value: 'charbon', label: 'Charbon / Pellets' },
          ]} placeholder="Sélectionner..." />
        </FormField>
        <FormField label="Viande ciblée">
          <Select value={form.meat_type} onChange={v => set('meat_type', v)} options={MEAT_OPTIONS} placeholder="Sélectionner..." />
        </FormField>
      </div>
      <Checkbox checked={form.is_global} onChange={v => set('is_global', v)} label="Affiché pour toutes les viandes" />
    </>
  )
}

function GuideFields({ form, set }) {
  return (
    <>
      <FormField label="Résumé" hint="Affiché sur les cards de guide">
        <TextArea value={form.summary} onChange={v => set('summary', v)} rows={2} placeholder="Résumé court..." />
      </FormField>
      <FormField label="Contenu">
        <MarkdownEditor value={form.content} onChange={v => set('content', v)} rows={20} placeholder="Contenu complet du guide..." />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Catégorie">
          <Select value={form.category} onChange={v => set('category', v)} options={CATEGORY_OPTIONS} placeholder="Sélectionner..." />
        </FormField>
        <FormField label="Viande ciblée">
          <Select value={form.meat_type} onChange={v => set('meat_type', v)} options={MEAT_OPTIONS} placeholder="Sélectionner..." />
        </FormField>
      </div>
      <FormField label="Image de couverture (URL)">
        <TextInput value={form.cover_url} onChange={v => set('cover_url', v)} placeholder="https://..." />
      </FormField>
      <FormField label="Tags" hint="Séparés par des virgules">
        <TextInput
          value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags || ''}
          onChange={v => set('tags', v.split(',').map(t => t.trim()).filter(Boolean))}
          placeholder="brisket, stall, wrap"
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="SEO Title">
          <TextInput value={form.seo_title} onChange={v => set('seo_title', v)} placeholder="Titre pour Google" />
        </FormField>
        <FormField label="SEO Description">
          <TextInput value={form.seo_description} onChange={v => set('seo_description', v)} placeholder="Meta description" />
        </FormField>
      </div>
    </>
  )
}

function RecipeFields({ form, set }) {
  // Ingredients as editable JSON text
  const ingredientsText = typeof form.ingredients === 'string' ? form.ingredients : JSON.stringify(form.ingredients || [], null, 2)
  const stepsText = typeof form.steps === 'string' ? form.steps : JSON.stringify(form.steps || [], null, 2)

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Type de recette">
          <Select value={form.type} onChange={v => set('type', v)} options={RECIPE_TYPE_OPTIONS} placeholder="Sélectionner..." />
        </FormField>
        <FormField label="Difficulté">
          <Select value={form.difficulty} onChange={v => set('difficulty', v)} options={DIFFICULTY_OPTIONS} />
        </FormField>
      </div>
      <FormField label="Résumé" hint="Affiché sur les cards">
        <TextArea value={form.summary} onChange={v => set('summary', v)} rows={2} placeholder="Résumé court de la recette..." />
      </FormField>
      <FormField label="Description complète">
        <MarkdownEditor value={form.description} onChange={v => set('description', v)} rows={8} placeholder="Détails, histoire, conseils..." />
      </FormField>
      <FormField label="Ingrédients (JSON)" hint='[{"name":"Sel","qty":"30g","note":"optionnel"}]'>
        <TextArea
          value={ingredientsText}
          onChange={v => {
            try { set('ingredients', JSON.parse(v)) } catch { set('ingredients', v) }
          }}
          rows={10}
          placeholder='[{"name":"Ingrédient","qty":"Quantité","note":"Note optionnelle"}]'
        />
      </FormField>
      <FormField label="Étapes (JSON)" hint='["Étape 1","Étape 2",...]'>
        <TextArea
          value={stepsText}
          onChange={v => {
            try { set('steps', JSON.parse(v)) } catch { set('steps', v) }
          }}
          rows={8}
          placeholder='["Mélanger les ingrédients","Appliquer sur la viande"]'
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Rendement">
          <TextInput value={form.yield_amount} onChange={v => set('yield_amount', v)} placeholder="~200g — 3 cuissons" />
        </FormField>
        <FormField label="Temps de préparation">
          <TextInput value={form.prep_time} onChange={v => set('prep_time', v)} placeholder="5 min + 4h marinade" />
        </FormField>
      </div>
      <FormField label="Viandes compatibles" hint="Séparées par des virgules (brisket, pulled_pork, whole_chicken...)">
        <TextInput
          value={Array.isArray(form.meat_types) ? form.meat_types.join(', ') : form.meat_types || ''}
          onChange={v => set('meat_types', v.split(',').map(t => t.trim()).filter(Boolean))}
          placeholder="brisket, pulled_pork, spare_ribs"
        />
      </FormField>
      <FormField label="Origine / Inspiration">
        <TextInput value={form.origin} onChange={v => set('origin', v)} placeholder="Aaron Franklin — Austin, Texas" />
      </FormField>
      <FormField label="Image de couverture (URL)">
        <TextInput value={form.cover_url} onChange={v => set('cover_url', v)} placeholder="https://..." />
      </FormField>
      <FormField label="Tags" hint="Séparés par des virgules">
        <TextInput
          value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags || ''}
          onChange={v => set('tags', v.split(',').map(t => t.trim()).filter(Boolean))}
          placeholder="texas, brisket, sel-poivre"
        />
      </FormField>
    </>
  )
}

function FaqFields({ form, set }) {
  return (
    <>
      <FormField label="Question">
        <TextInput value={form.question} onChange={v => set('question', v)} placeholder="Comment savoir si..." />
      </FormField>
      <FormField label="Réponse (Markdown)">
        <TextArea value={form.answer} onChange={v => set('answer', v)} rows={6} placeholder="Réponse en markdown..." />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Viande ciblée">
          <Select value={form.meat_type} onChange={v => set('meat_type', v)} options={MEAT_OPTIONS} placeholder="Sélectionner..." />
        </FormField>
        <FormField label="Méthode de cuisson">
          <Select value={form.cooking_method} onChange={v => set('cooking_method', v)} options={METHOD_OPTIONS} placeholder="Sélectionner..." />
        </FormField>
      </div>
      <Checkbox checked={form.is_global} onChange={v => set('is_global', v)} label="FAQ globale (affichée partout)" />
    </>
  )
}

// ── Helpers ─────────────────────────────────────────────────

function getColumns(tab) {
  const statusCol = { key: 'status', label: 'Statut', render: row => <StatusBadge status={row.status} /> }
  const meatCol = { key: 'meat_type', label: 'Viande', render: row => row.meat_type || (row.is_global ? '🌐 Global' : '—') }

  switch (tab) {
    case 'seo':
      return [
        { key: 'title', label: 'Titre', render: row => <span className="font-medium text-white">{row.title}</span> },
        meatCol,
        { key: 'cooking_method', label: 'Méthode', render: row => row.cooking_method || '—' },
        statusCol,
      ]
    case 'affiliate':
      return [
        { key: 'title', label: 'Produit', render: row => (
          <div className="flex items-center gap-3">
            {row.image_url && <img src={row.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />}
            <span className="font-medium text-white">{row.title}</span>
            {row.badge && <span className="text-[9px] font-bold uppercase text-[#ff6b1a] bg-[#ff6b1a]/10 px-1.5 py-0.5 rounded">{row.badge}</span>}
          </div>
        )},
        { key: 'product_type', label: 'Type', render: row => row.product_type || '—' },
        meatCol,
        statusCol,
      ]
    case 'guides':
      return [
        { key: 'title', label: 'Guide', render: row => (
          <div>
            <span className="font-medium text-white">{row.title}</span>
            <p className="text-[11px] text-zinc-600 mt-0.5">/guides/{row.slug}</p>
          </div>
        )},
        { key: 'category', label: 'Catégorie', render: row => row.category || '—' },
        meatCol,
        statusCol,
      ]
    case 'recipes':
      return [
        { key: 'title', label: 'Recette', render: row => (
          <div>
            <span className="font-medium text-white">{row.title}</span>
            <p className="text-[11px] text-zinc-600 mt-0.5">/recettes/{row.slug}</p>
          </div>
        )},
        { key: 'type', label: 'Type', render: row => {
          const colors = { rub: 'text-amber-400', mop: 'text-blue-400', marinade: 'text-purple-400', injection: 'text-green-400', glaze: 'text-rose-400' }
          return <span className={`text-[12px] font-semibold ${colors[row.type] || ''}`}>{row.type}</span>
        }},
        { key: 'difficulty', label: 'Difficulté' },
        statusCol,
      ]
    case 'faq':
      return [
        { key: 'question', label: 'Question', render: row => <span className="font-medium text-white">{row.question}</span> },
        meatCol,
        statusCol,
      ]
    default:
      return []
  }
}

function getEmptyRecord(tab) {
  const base = { status: 'draft', sort_order: 0 }
  switch (tab) {
    case 'seo': return { ...base, title: '', slug: '', content: '', meat_type: '', cooking_method: '', is_global: false }
    case 'affiliate': return { ...base, title: '', slug: '', description: '', image_url: '', affiliate_url: '', cta_text: 'Voir le produit', badge: '', product_type: '', meat_type: '', is_global: true }
    case 'guides': return { ...base, title: '', slug: '', summary: '', content: '', cover_url: '', category: '', tags: [], meat_type: '', seo_title: '', seo_description: '' }
    case 'recipes': return { ...base, title: '', slug: '', type: 'rub', summary: '', description: '', ingredients: [], steps: [], yield_amount: '', prep_time: '', meat_types: [], origin: '', difficulty: 'facile', tags: [], cover_url: '' }
    case 'faq': return { ...base, question: '', answer: '', meat_type: '', cooking_method: '', is_global: false }
    default: return base
  }
}

function getFormTitle(tab) {
  switch (tab) {
    case 'seo': return 'bloc SEO'
    case 'affiliate': return 'produit affilié'
    case 'guides': return 'guide'
    case 'recipes': return 'recette'
    case 'faq': return 'FAQ'
    default: return 'contenu'
  }
}
