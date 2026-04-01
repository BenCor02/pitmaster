import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../modules/auth/AuthContext.jsx'
import { adminCms } from '../lib/cms.js'
import { fetchAllSettings, updateSetting } from '../lib/siteSettings.js'
import { setSiteBranding } from '../lib/seo.js'
import { useSiteSettings } from '../hooks/useSiteSettings.jsx'
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
  woods: 'woods',
  bbq: 'bbq_types',
  profiles: 'cooking_profiles',
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

const INTENSITY_OPTIONS = [
  { value: 'leger', label: 'Léger' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'fort', label: 'Fort' },
]

const AVAILABILITY_OPTIONS = [
  { value: 'excellente', label: 'Excellente' },
  { value: 'bonne', label: 'Bonne' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'limitee', label: 'Limitée' },
]

const LEVEL_OPTIONS = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
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
      const [seo, aff, guides, recipes, faq, woods, bbq, profiles] = await Promise.all([
        adminCms.list('seo_blocks'),
        adminCms.list('affiliate_tools'),
        adminCms.list('guides'),
        adminCms.list('recipes'),
        adminCms.list('faqs'),
        adminCms.list('woods').catch(() => []),
        adminCms.list('bbq_types').catch(() => []),
        adminCms.list('cooking_profiles').catch(() => []),
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
        woods: woods.length,
        woods_pub: woods.filter(i => i.status === 'published').length,
        bbq: bbq.length,
        bbq_pub: bbq.filter(i => i.status === 'published').length,
        profiles: profiles.length,
        profiles_active: profiles.filter(i => i.is_active).length,
      })
    } catch (err) {
      console.error('Counts error:', err)
    }
  }

  const handleSave = async (record) => {
    setSaving(true)
    try {
      const isTextIdTable = tab === 'woods' || tab === 'bbq' || tab === 'profiles'
      const isNew = isTextIdTable ? !record._existing : !record.id
      // Auto-generate slug if empty
      if (record.title && !record.slug) {
        record.slug = slugify(record.title)
      }
      // Clean empty strings to null (but not id for text-id tables)
      Object.keys(record).forEach(k => {
        if (record[k] === '' && !(isTextIdTable && k === 'id')) record[k] = null
      })

      // Remove internal flag
      const { _existing, ...cleanRecord } = record

      if (isNew) {
        if (!isTextIdTable) delete cleanRecord.id
        await adminCms.create(tableName, cleanRecord)
      } else {
        const { id, created_at, updated_at, ...updates } = cleanRecord
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
    try {
      if (tab === 'profiles') {
        await adminCms.update(tableName, row.id, { is_active: !row.is_active })
      } else {
        const newStatus = row.status === 'published' ? 'draft' : 'published'
        await adminCms.toggleStatus(tableName, row.id, newStatus)
      }
      await loadItems()
    } catch (err) {
      console.error('Toggle error:', err)
    }
  }

  const handleDelete = async (row) => {
    if (!confirm(`Supprimer "${row.title || row.name || row.question}" ?`)) return
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
      {tab === 'settings' && <SettingsTab />}

      {tableName && !editing && (
        <ListView
          tab={tab}
          items={items}
          loading={loading}
          onNew={handleNew}
          onEdit={(item) => setEditing((tab === 'woods' || tab === 'bbq' || tab === 'profiles') ? { ...item, _existing: true } : item)}
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
    { key: 'woods', label: 'Essences de bois', icon: '🪵', total: counts.woods, pub: counts.woods_pub },
    { key: 'bbq', label: 'Types BBQ', icon: '🏭', total: counts.bbq, pub: counts.bbq_pub },
    { key: 'profiles', label: 'Profils cuisson', icon: '🔥', total: counts.profiles, pub: counts.profiles_active },
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
        {(tab === 'woods' || tab === 'bbq' || tab === 'profiles') ? (
          <>
            <FormField label="Identifiant (id)" hint="Unique, minuscule, sans espaces. Non modifiable après création.">
              <TextInput value={form.id} onChange={v => set('id', v)} placeholder="offset, chene, etc." disabled={!!record.id && record._existing} />
            </FormField>
            <FormField label="Nom">
              <TextInput value={form.name} onChange={v => set('name', v)} placeholder="Nom affiché" />
            </FormField>
          </>
        ) : tab !== 'faq' ? (
          <>
            <FormField label="Titre">
              <TextInput value={form.title} onChange={v => { set('title', v); if (!form.id) set('slug', slugify(v)) }} placeholder="Titre du contenu" />
            </FormField>
            <FormField label="Slug" hint="Identifiant URL unique, auto-généré">
              <TextInput value={form.slug} onChange={v => set('slug', v)} placeholder="slug-auto-genere" />
            </FormField>
          </>
        ) : null}

        {/* Tab-specific fields */}
        {tab === 'seo' && <SeoFields form={form} set={set} />}
        {tab === 'affiliate' && <AffiliateFields form={form} set={set} />}
        {tab === 'guides' && <GuideFields form={form} set={set} />}
        {tab === 'recipes' && <RecipeFields form={form} set={set} />}
        {tab === 'faq' && <FaqFields form={form} set={set} />}
        {tab === 'woods' && <WoodFields form={form} set={set} />}
        {tab === 'bbq' && <BbqFields form={form} set={set} />}
        {tab === 'profiles' && <ProfileFields form={form} set={set} />}

        {/* Common: status + sort (profiles uses is_active instead) */}
        {tab !== 'profiles' && (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Statut">
              <Select value={form.status} onChange={v => set('status', v)} options={STATUS_OPTIONS} />
            </FormField>
            <FormField label="Ordre d'affichage">
              <TextInput type="number" value={form.sort_order} onChange={v => set('sort_order', parseInt(v) || 0)} />
            </FormField>
          </div>
        )}

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

function WoodFields({ form, set }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Emoji">
          <TextInput value={form.emoji} onChange={v => set('emoji', v)} placeholder="🌳" />
        </FormField>
        <FormField label="Intensité">
          <Select value={form.intensity} onChange={v => set('intensity', v)} options={INTENSITY_OPTIONS} />
        </FormField>
      </div>
      <FormField label="Nom scientifique">
        <TextInput value={form.scientific_name} onChange={v => set('scientific_name', v)} placeholder="Quercus robur" />
      </FormField>
      <FormField label="Profil de saveur">
        <TextInput value={form.flavor_profile} onChange={v => set('flavor_profile', v)} placeholder="Fumée ronde, légèrement sucrée" />
      </FormField>
      <FormField label="Description">
        <TextArea value={form.description} onChange={v => set('description', v)} rows={4} placeholder="Description détaillée..." />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Viandes recommandées" hint="Séparées par des virgules">
          <TextInput
            value={Array.isArray(form.best_meats) ? form.best_meats.join(', ') : form.best_meats || ''}
            onChange={v => set('best_meats', v.split(',').map(t => t.trim()).filter(Boolean))}
            placeholder="Bœuf, Porc, Volaille"
          />
        </FormField>
        <FormField label="Viandes à éviter" hint="Séparées par des virgules">
          <TextInput
            value={Array.isArray(form.avoid_meats) ? form.avoid_meats.join(', ') : form.avoid_meats || ''}
            onChange={v => set('avoid_meats', v.split(',').map(t => t.trim()).filter(Boolean))}
            placeholder="Poisson, Fromage"
          />
        </FormField>
      </div>
      <FormField label="Caractéristiques de combustion">
        <TextInput value={form.burn_characteristics} onChange={v => set('burn_characteristics', v)} placeholder="Braise longue, chaleur régulière" />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Origine">
          <TextInput value={form.origin} onChange={v => set('origin', v)} placeholder="Europe, Amérique du Nord" />
        </FormField>
        <FormField label="Disponibilité en Europe">
          <Select value={form.availability_eu} onChange={v => set('availability_eu', v)} options={AVAILABILITY_OPTIONS} placeholder="Sélectionner..." />
        </FormField>
      </div>
      <FormField label="Conseils pitmaster">
        <TextArea value={form.pitmaster_tips} onChange={v => set('pitmaster_tips', v)} rows={3} placeholder="Astuces terrain..." />
      </FormField>
      <FormField label="Notes de sécurité">
        <TextInput value={form.safety_notes} onChange={v => set('safety_notes', v)} placeholder="Aucune toxicité connue" />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <Checkbox checked={form.is_toxic} onChange={v => set('is_toxic', v)} label="Bois toxique (interdit fumage)" />
        {form.is_toxic && (
          <FormField label="Raison de toxicité">
            <TextInput value={form.toxic_reason} onChange={v => set('toxic_reason', v)} placeholder="Résine toxique, fumée irritante" />
          </FormField>
        )}
      </div>
      <FormField label="Source">
        <TextInput value={form.source} onChange={v => set('source', v)} placeholder="AmazingRibs.com, Texas A&M" />
      </FormField>
    </>
  )
}

function BbqFields({ form, set }) {
  const prosText = Array.isArray(form.pros) ? form.pros.join('\n') : form.pros || ''
  const consText = Array.isArray(form.cons) ? form.cons.join('\n') : form.cons || ''
  const bestForText = Array.isArray(form.best_for) ? form.best_for.join(', ') : form.best_for || ''
  const notIdealText = Array.isArray(form.not_ideal_for) ? form.not_ideal_for.join(', ') : form.not_ideal_for || ''
  const brandsText = Array.isArray(form.brands) ? form.brands.join(', ') : form.brands || ''
  const altNamesText = Array.isArray(form.alt_names) ? form.alt_names.join(', ') : form.alt_names || ''

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Icône (emoji)">
          <TextInput value={form.icon} onChange={v => set('icon', v)} placeholder="🏭" />
        </FormField>
        <FormField label="Niveau recommandé">
          <Select value={form.level} onChange={v => set('level', v)} options={LEVEL_OPTIONS} />
        </FormField>
      </div>
      <FormField label="Noms alternatifs" hint="Séparés par des virgules">
        <TextInput
          value={altNamesText}
          onChange={v => set('alt_names', v.split(',').map(t => t.trim()).filter(Boolean))}
          placeholder="Fumoir horizontal, Stick burner"
        />
      </FormField>
      <FormField label="Tagline" hint="Phrase d'accroche courte">
        <TextInput value={form.tagline} onChange={v => set('tagline', v)} placeholder="Le fumoir des puristes." />
      </FormField>
      <FormField label="Description">
        <TextArea value={form.description} onChange={v => set('description', v)} rows={5} placeholder="Description complète du type de BBQ..." />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Plage de température">
          <TextInput value={form.temp_range} onChange={v => set('temp_range', v)} placeholder="107–135°C" />
        </FormField>
        <FormField label="Combustible">
          <TextInput value={form.fuel} onChange={v => set('fuel', v)} placeholder="Bûches de bois" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Fourchette de prix">
          <TextInput value={form.price_range} onChange={v => set('price_range', v)} placeholder="300€ – 3 000€+" />
        </FormField>
        <FormField label="Capacité">
          <TextInput value={form.capacity} onChange={v => set('capacity', v)} placeholder="Grande (4–8 pièces)" />
        </FormField>
      </div>
      <FormField label="Avantages" hint="Un par ligne">
        <TextArea
          value={prosText}
          onChange={v => set('pros', v.split('\n').filter(Boolean))}
          rows={6}
          placeholder="Saveur authentique&#10;Grande capacité&#10;..."
        />
      </FormField>
      <FormField label="Inconvénients" hint="Un par ligne">
        <TextArea
          value={consText}
          onChange={v => set('cons', v.split('\n').filter(Boolean))}
          rows={6}
          placeholder="Courbe d'apprentissage&#10;Surveillance constante&#10;..."
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Idéal pour" hint="Séparés par des virgules">
          <TextInput
            value={bestForText}
            onChange={v => set('best_for', v.split(',').map(t => t.trim()).filter(Boolean))}
            placeholder="Brisket, Pulled pork, Ribs"
          />
        </FormField>
        <FormField label="Pas idéal pour" hint="Séparés par des virgules">
          <TextInput
            value={notIdealText}
            onChange={v => set('not_ideal_for', v.split(',').map(t => t.trim()).filter(Boolean))}
            placeholder="Cuissons rapides, Petits espaces"
          />
        </FormField>
      </div>
      <FormField label="Marques recommandées" hint="Séparées par des virgules">
        <TextInput
          value={brandsText}
          onChange={v => set('brands', v.split(',').map(t => t.trim()).filter(Boolean))}
          placeholder="Oklahoma Joe's, Yoder, Horizon"
        />
      </FormField>
      <FormField label="Conseil terrain">
        <TextArea value={form.tips} onChange={v => set('tips', v)} rows={3} placeholder="Astuce pour bien débuter avec ce type de BBQ..." />
      </FormField>
    </>
  )
}

const COOK_TYPE_OPTIONS = [
  { value: 'low_and_slow', label: 'Low & Slow' },
  { value: 'reverse_sear', label: 'Reverse Sear' },
]

const CATEGORY_PROFILE_OPTIONS = [
  { value: 'boeuf', label: 'Boeuf' },
  { value: 'porc', label: 'Porc' },
  { value: 'volaille', label: 'Volaille' },
]

function JsonField({ value, onChange, rows = 6, placeholder }) {
  const text = typeof value === 'string' ? value : JSON.stringify(value || null, null, 2)
  const [error, setError] = useState(null)

  const handleChange = (v) => {
    try {
      const parsed = JSON.parse(v)
      onChange(parsed)
      setError(null)
    } catch {
      onChange(v)
      setError('JSON invalide')
    }
  }

  return (
    <div>
      <TextArea value={text} onChange={handleChange} rows={rows} placeholder={placeholder} />
      {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  )
}

function ProfileFields({ form, set }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Catégorie">
          <Select value={form.category} onChange={v => set('category', v)} options={CATEGORY_PROFILE_OPTIONS} />
        </FormField>
        <FormField label="Type de cuisson">
          <Select value={form.cook_type} onChange={v => set('cook_type', v)} options={COOK_TYPE_OPTIONS} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Icône">
          <TextInput value={form.icon} onChange={v => set('icon', v)} placeholder="🥩" />
        </FormField>
        <FormField label="Wrap supporté">
          <Checkbox checked={form.supports_wrap} onChange={v => set('supports_wrap', v)} label="Ce profil supporte le wrap (Texas Crutch)" />
        </FormField>
      </div>

      {/* Temp bands */}
      <FormField label="Bandes de température (temp_bands)" hint='[{"temp_c":107,"min_per_kg":175},{"temp_c":121,"min_per_kg":135}]'>
        <JsonField
          value={form.temp_bands}
          onChange={v => set('temp_bands', v)}
          rows={6}
          placeholder='[{"temp_c": 107, "min_per_kg": 175}]'
        />
      </FormField>

      {/* Fixed times (for ribs) */}
      <FormField label="Temps fixes (fixed_times)" hint='{"wrapped":{"min":330,"max":390},"unwrapped":{"min":300,"max":360}} — Pour les ribs'>
        <JsonField
          value={form.fixed_times}
          onChange={v => set('fixed_times', v)}
          rows={4}
          placeholder='{"wrapped":{"min":330,"max":390},"unwrapped":{"min":300,"max":360}}'
        />
      </FormField>

      {/* Wrap + Rest */}
      <div className="grid grid-cols-3 gap-4">
        <FormField label="Réduction wrap (%)" hint="% de temps gagné avec wrap">
          <TextInput type="number" value={form.wrap_reduction_percent} onChange={v => set('wrap_reduction_percent', parseInt(v) || 0)} />
        </FormField>
        <FormField label="Repos min (minutes)">
          <TextInput type="number" value={form.rest_min} onChange={v => set('rest_min', parseInt(v) || 0)} />
        </FormField>
        <FormField label="Repos max (minutes)">
          <TextInput type="number" value={form.rest_max} onChange={v => set('rest_max', parseInt(v) || 0)} />
        </FormField>
      </div>

      {/* Reverse sear */}
      <FormField label="Reverse Sear (JSON)" hint='{"pull_before_target_c":8,"sear_total_minutes_min":3,"sear_total_minutes_max":6}'>
        <JsonField
          value={form.reverse_sear}
          onChange={v => set('reverse_sear', v)}
          rows={4}
          placeholder='{"pull_before_target_c": 8, "sear_total_minutes_min": 3, "sear_total_minutes_max": 6}'
        />
      </FormField>

      {/* Doneness targets */}
      <FormField label="Cibles de cuisson (doneness_targets)" hint='{"rare":52,"medium_rare":54,"medium":60}'>
        <JsonField
          value={form.doneness_targets}
          onChange={v => set('doneness_targets', v)}
          rows={4}
          placeholder='{"rare": 52, "medium_rare": 54, "medium": 60}'
        />
      </FormField>

      {/* Cues */}
      <FormField label="Repères visuels et conseils (cues)" hint="JSON complet des indicateurs de cuisson">
        <JsonField
          value={form.cues}
          onChange={v => set('cues', v)}
          rows={12}
          placeholder='{"stall_temp_min":65,"stall_temp_max":77,"wrap_temp_min":68,"wrap_temp_max":74,...}'
        />
      </FormField>

      {/* Active + Sort */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Ordre d'affichage">
          <TextInput type="number" value={form.sort_order} onChange={v => set('sort_order', parseInt(v) || 0)} />
        </FormField>
        <FormField label="Actif">
          <Checkbox checked={form.is_active !== false} onChange={v => set('is_active', v)} label="Profil actif dans le calculateur" />
        </FormField>
      </div>
    </>
  )
}

// ── Settings Tab ──────────────────────────────────────────────

const MODULE_LABELS = {
  seo_blocks:    { label: 'Blocs SEO',         icon: '🔍', desc: 'Contenus SEO contextuels sous le calculateur' },
  affiliate:     { label: 'Affiliation',        icon: '🛠️', desc: 'Recommandations de produits avec liens affiliés' },
  faq:           { label: 'FAQ',                icon: '❓', desc: 'Questions fréquentes contextuelles' },
  guides:        { label: 'Guides',             icon: '📚', desc: 'Articles et guides BBQ' },
  recipes:       { label: 'Recettes',           icon: '🧂', desc: 'Rubs, mops, marinades et glazes' },
  wood_guide:    { label: 'Essences de bois',   icon: '🪵', desc: 'Guide des bois de fumage' },
  comparator:    { label: 'Comparateur',        icon: '📊', desc: 'Comparaison côte à côte de recettes' },
  favorites:     { label: 'Favoris / Carnet',   icon: '❤️', desc: 'Sauvegarde de recettes favorites' },
  shared_cooks:  { label: 'Partage social',     icon: '🔗', desc: 'Liens de partage de cuissons' },
  journal:       { label: 'Journal de cuisson', icon: '📋', desc: 'Historique des sessions de cuisson' },
}

function SettingsTab() {
  const { refresh } = useSiteSettings()
  const [branding, setBranding] = useState({
    site_name_line1: 'CHARBON',
    site_name_line2: '& FLAMME',
    tagline: "L'arsenal du pitmaster",
    logo_url: '',
  })
  const [modules, setModules] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchAllSettings().then(all => {
      if (all.branding) setBranding(prev => ({ ...prev, ...all.branding }))
      if (all.modules) setModules(all.modules)
      setLoading(false)
    })
  }, [])

  const handleSaveBranding = async () => {
    setSaving(true)
    try {
      const b = { ...branding, logo_url: branding.logo_url || null }
      await updateSetting('branding', b)
      setSiteBranding(b.site_name_line1, b.site_name_line2, b.tagline)
      document.title = [b.site_name_line1, b.site_name_line2].filter(Boolean).join(' ') + (b.tagline ? ` — ${b.tagline}` : '')
      await refresh()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Save branding error:', err)
      alert('Erreur : ' + (err.message || 'Impossible de sauvegarder'))
    }
    setSaving(false)
  }

  const handleToggleModule = async (key) => {
    const newModules = { ...modules, [key]: !modules[key] }
    setModules(newModules)
    try {
      await updateSetting('modules', newModules)
      await refresh()
    } catch (err) {
      console.error('Toggle module error:', err)
      // Rollback
      setModules(modules)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-zinc-600 text-[13px]">Chargement des réglages...</div>
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* ── Branding ── */}
      <div className="surface p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xl">🎨</span>
          <div>
            <h2 className="text-[16px] font-bold text-white">Identité du site</h2>
            <p className="text-[12px] text-zinc-500 mt-0.5">Logo, nom et tagline affichés dans la navigation</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nom ligne 1" hint="Texte principal (ex: CHARBON)">
              <TextInput
                value={branding.site_name_line1}
                onChange={v => setBranding(p => ({ ...p, site_name_line1: v }))}
                placeholder="CHARBON"
              />
            </FormField>
            <FormField label="Nom ligne 2" hint="Texte secondaire (ex: & FLAMME)">
              <TextInput
                value={branding.site_name_line2}
                onChange={v => setBranding(p => ({ ...p, site_name_line2: v }))}
                placeholder="& FLAMME"
              />
            </FormField>
          </div>

          <FormField label="Tagline" hint="Sous-titre / slogan">
            <TextInput
              value={branding.tagline}
              onChange={v => setBranding(p => ({ ...p, tagline: v }))}
              placeholder="L'arsenal du pitmaster"
            />
          </FormField>

          <FormField label="URL du logo" hint="Image externe (PNG/SVG). Laisser vide = flamme par défaut">
            <TextInput
              value={branding.logo_url || ''}
              onChange={v => setBranding(p => ({ ...p, logo_url: v }))}
              placeholder="https://..."
            />
          </FormField>

          {/* Aperçu */}
          <div className="p-4 rounded-xl bg-zinc-800/40 border border-white/[0.06]">
            <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">Aperçu</p>
            <div className="flex items-center gap-3">
              {branding.logo_url ? (
                <img src={branding.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff6b1a] to-[#ef4444] flex items-center justify-center text-white text-xs font-bold">🔥</div>
              )}
              <div className="leading-none">
                <span className="text-[14px] font-extrabold tracking-wide text-white block">
                  {branding.site_name_line1 || 'CHARBON'}
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#ff6b1a] block">
                  {branding.site_name_line2 || '& FLAMME'}
                </span>
              </div>
            </div>
            {branding.tagline && (
              <p className="text-[11px] text-zinc-500 mt-2">{branding.tagline}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveBranding}
              disabled={saving}
              className="btn-primary px-5 py-2 text-[13px] disabled:opacity-50"
            >
              {saving ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
            {saved && (
              <span className="text-[12px] text-green-400 font-medium animate-fade">✓ Sauvegardé</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Modules ── */}
      <div className="surface p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xl">🧩</span>
          <div>
            <h2 className="text-[16px] font-bold text-white">Modules</h2>
            <p className="text-[12px] text-zinc-500 mt-0.5">Active ou désactive les fonctionnalités du site. Effet immédiat.</p>
          </div>
        </div>

        <div className="space-y-1">
          {Object.entries(MODULE_LABELS).map(([key, { label, icon, desc }]) => {
            const enabled = modules[key] !== false
            return (
              <button
                key={key}
                onClick={() => handleToggleModule(key)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all ${
                  enabled
                    ? 'bg-zinc-800/40 hover:bg-zinc-800/60'
                    : 'bg-zinc-900/20 opacity-60 hover:opacity-80'
                }`}
              >
                <span className="text-lg shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-white">{label}</span>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{desc}</p>
                </div>
                {/* Toggle switch */}
                <div className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${
                  enabled ? 'bg-[#ff6b1a]' : 'bg-zinc-700'
                }`} style={{ width: 40, height: 22 }}>
                  <div className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${
                    enabled ? 'translate-x-[20px]' : 'translate-x-0.5'
                  }`} />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
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
    case 'woods':
      return [
        { key: 'name', label: 'Essence', render: row => (
          <div className="flex items-center gap-2">
            <span>{row.emoji}</span>
            <span className="font-medium text-white">{row.name}</span>
            {row.is_toxic && <span className="text-[9px] font-bold uppercase text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Toxique</span>}
          </div>
        )},
        { key: 'intensity', label: 'Intensité', render: row => {
          const colors = { leger: 'text-green-400', moyen: 'text-amber-400', fort: 'text-red-400' }
          const labels = { leger: 'Léger', moyen: 'Moyen', fort: 'Fort' }
          return <span className={`text-[12px] font-semibold ${colors[row.intensity] || ''}`}>{labels[row.intensity] || row.intensity}</span>
        }},
        { key: 'flavor_profile', label: 'Saveur' },
        statusCol,
      ]
    case 'bbq':
      return [
        { key: 'name', label: 'Type', render: row => (
          <div className="flex items-center gap-2">
            <span>{row.icon}</span>
            <div>
              <span className="font-medium text-white">{row.name}</span>
              <p className="text-[11px] text-zinc-600 mt-0.5">{row.price_range}</p>
            </div>
          </div>
        )},
        { key: 'level', label: 'Niveau', render: row => {
          const colors = { debutant: 'text-green-400', intermediaire: 'text-amber-400', avance: 'text-red-400' }
          const labels = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' }
          return <span className={`text-[12px] font-semibold ${colors[row.level] || ''}`}>{labels[row.level] || row.level}</span>
        }},
        { key: 'fuel', label: 'Combustible' },
        statusCol,
      ]
    case 'profiles':
      return [
        { key: 'name', label: 'Profil', render: row => (
          <div className="flex items-center gap-2">
            <span>{row.icon}</span>
            <div>
              <span className="font-medium text-white">{row.name}</span>
              <p className="text-[11px] text-zinc-600 mt-0.5">{row.id} — {row.cook_type}</p>
            </div>
          </div>
        )},
        { key: 'category', label: 'Catégorie', render: row => {
          const labels = { boeuf: 'Boeuf', porc: 'Porc', volaille: 'Volaille' }
          return <span className="text-[12px] font-semibold">{labels[row.category] || row.category}</span>
        }},
        { key: 'cook_type', label: 'Type', render: row => {
          const labels = { low_and_slow: 'Low & Slow', reverse_sear: 'Reverse Sear' }
          const colors = { low_and_slow: 'text-amber-400', reverse_sear: 'text-rose-400' }
          return <span className={`text-[12px] font-semibold ${colors[row.cook_type] || ''}`}>{labels[row.cook_type] || row.cook_type}</span>
        }},
        { key: 'is_active', label: 'Statut', render: row => (
          <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${row.is_active !== false ? 'text-green-400 bg-green-500/10' : 'text-zinc-500 bg-zinc-800'}`}>
            {row.is_active !== false ? 'Actif' : 'Inactif'}
          </span>
        )},
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
    case 'woods': return { ...base, id: '', name: '', scientific_name: '', emoji: '', intensity: 'moyen', flavor_profile: '', description: '', best_meats: [], avoid_meats: [], burn_characteristics: '', origin: '', availability_eu: '', safety_notes: '', pitmaster_tips: '', source: '', is_toxic: false, toxic_reason: '' }
    case 'bbq': return { ...base, id: '', name: '', alt_names: [], icon: '', tagline: '', description: '', temp_range: '', fuel: '', price_range: '', level: 'debutant', capacity: '', pros: [], cons: [], best_for: [], not_ideal_for: [], brands: [], tips: '' }
    case 'profiles': return { sort_order: 0, id: '', name: '', category: 'boeuf', icon: '🥩', cook_type: 'low_and_slow', supports_wrap: true, temp_bands: [{ temp_c: 107, min_per_kg: 120 }, { temp_c: 121, min_per_kg: 90 }, { temp_c: 135, min_per_kg: 70 }], fixed_times: null, wrap_reduction_percent: 12, rest_min: 30, rest_max: 60, reverse_sear: null, doneness_targets: null, cues: { stall_temp_min: 65, stall_temp_max: 77, wrap_temp_min: 68, wrap_temp_max: 74, begin_test_temp: 90, target_temp_min: 93, target_temp_max: 98 }, is_active: true }
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
    case 'woods': return 'essence de bois'
    case 'bbq': return 'type de BBQ'
    case 'profiles': return 'profil de cuisson'
    default: return 'contenu'
  }
}
