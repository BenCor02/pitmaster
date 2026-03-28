import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  deleteSeoBlock,
  deleteSeoBlockProduct,
  fetchAdminSeoBlocks,
  fetchCalculatorCatalog,
  fetchSeoBlockProducts,
  upsertSeoBlock,
  upsertSeoBlockProduct,
} from '../../../modules/cms/repository'

const BLOCK_TYPES = [
  { id: 'bloc_recommendation_produit', label: 'Bloc produit recommandé' },
  { id: 'bloc_guide', label: 'Bloc guide' },
  { id: 'bloc_marque', label: 'Bloc marque' },
  { id: 'bloc_conseil', label: 'Bloc conseil' },
]

const POSITIONS = [
  { id: 'after_intro', label: 'Après intro' },
  { id: 'after_calculator', label: 'Après calculateur' },
  { id: 'after_result', label: 'Sous résultat' },
  { id: 'after_timeline', label: 'Sous timeline' },
  { id: 'bottom_page', label: 'Bas de page' },
  { id: 'sidebar', label: 'Sidebar' },
]

const EMPTY_BLOCK = {
  title: '',
  block_type: 'bloc_conseil',
  position: 'after_result',
  page_slug: 'calculator',
  meat_slug: '',
  method_key: '',
  title_secondary: '',
  content: '',
  image_url: '',
  cta_text: '',
  cta_link: '',
  affiliate_link: '',
  badge: '',
  note: '',
  icon: '',
  display_order: 0,
  is_active: true,
  settings_json: '{}',
}

const EMPTY_PRODUCT = {
  name: '',
  image_url: '',
  affiliate_url: '',
  description: '',
  rating: '',
  display_order: 0,
}

const css = `
  .seo-wrap{display:grid;grid-template-columns:320px minmax(0,1fr);gap:18px}
  .seo-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;padding:18px}
  .seo-input,.seo-textarea,.seo-select{background:#0e0c0a;border:1px solid #252018;border-radius:10px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:13px;padding:10px 12px;outline:none;width:100%}
  .seo-textarea{resize:vertical}
  .seo-label{display:block;font-size:10px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#6a5a4a;margin-bottom:7px}
  .seo-list-item{padding:12px 14px;border:1px solid #1e1a14;border-radius:10px;background:#100d0b;cursor:pointer;text-align:left}
  .seo-list-item.active{border-color:rgba(232,93,4,0.35);background:rgba(232,93,4,0.08)}
  @media(max-width:980px){.seo-wrap{grid-template-columns:1fr}}
`

export default function AdminSeoBlocksPage() {
  const [blocks, setBlocks] = useState([])
  const [selectedBlockId, setSelectedBlockId] = useState(null)
  const [blockForm, setBlockForm] = useState(EMPTY_BLOCK)
  const [products, setProducts] = useState([])
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT)
  const [catalog, setCatalog] = useState({ meats: [] })

  const loadBlocks = useCallback(async (nextSelectedId = null) => {
    const data = await fetchAdminSeoBlocks()
    setBlocks(data)
    const target = nextSelectedId || selectedBlockId || data[0]?.id || null
    if (target) {
      const current = data.find((entry) => entry.id === target)
      if (current) {
        setSelectedBlockId(current.id)
        setBlockForm({
          ...current,
          meat_slug: current.meat_slug || '',
          method_key: current.method_key || '',
          title_secondary: current.title_secondary || '',
          content: current.content || '',
          image_url: current.image_url || '',
          cta_text: current.cta_text || '',
          cta_link: current.cta_link || '',
          affiliate_link: current.affiliate_link || '',
          badge: current.badge || '',
          note: current.note || '',
          icon: current.icon || '',
          settings_json: JSON.stringify(current.settings_json || {}, null, 2),
        })
        setProducts(await fetchSeoBlockProducts(current.id))
      }
    } else {
      setSelectedBlockId(null)
      setBlockForm(EMPTY_BLOCK)
      setProducts([])
    }
  }, [selectedBlockId])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBlocks()
      fetchCalculatorCatalog().then(setCatalog).catch(() => {})
    }, 0)
    return () => clearTimeout(timer)
  }, [loadBlocks])

  const currentBlock = useMemo(() => blocks.find((entry) => entry.id === selectedBlockId), [blocks, selectedBlockId])

  async function saveBlock() {
    let settingsJson = {}
    try {
      settingsJson = blockForm.settings_json ? JSON.parse(blockForm.settings_json) : {}
    } catch {
      return
    }
    const saved = await upsertSeoBlock({
      ...blockForm,
      meat_slug: blockForm.meat_slug || null,
      method_key: blockForm.method_key || null,
      title_secondary: blockForm.title_secondary || null,
      content: blockForm.content || null,
      image_url: blockForm.image_url || null,
      cta_text: blockForm.cta_text || null,
      cta_link: blockForm.cta_link || null,
      affiliate_link: blockForm.affiliate_link || null,
      badge: blockForm.badge || null,
      note: blockForm.note || null,
      icon: blockForm.icon || null,
      settings_json: settingsJson,
    })
    await loadBlocks(saved.id)
  }

  async function removeBlock(id) {
    await deleteSeoBlock(id)
    await loadBlocks()
  }

  async function saveProduct() {
    if (!selectedBlockId) return
    await upsertSeoBlockProduct({
      ...productForm,
      seo_block_id: selectedBlockId,
    })
    setProductForm(EMPTY_PRODUCT)
    setProducts(await fetchSeoBlockProducts(selectedBlockId))
  }

  async function removeProduct(id) {
    await deleteSeoBlockProduct(id)
    if (selectedBlockId) setProducts(await fetchSeoBlockProducts(selectedBlockId))
  }

  return (
    <div style={{ fontFamily: 'DM Sans,sans-serif' }}>
      <style>{css}</style>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: '#fff' }}>
          SEO & <span style={{ color: '#e85d04' }}>Affiliation</span>
        </h1>
        <p style={{ fontSize: 11, color: '#8a7060', marginTop: 6, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
          Blocs éditoriaux dynamiques, produits recommandés et guides administrables
        </p>
      </div>

      <div className="seo-wrap">
        <aside className="seo-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#fff' }}>Blocs</div>
            <button
              className="pm-btn-secondary"
              style={{ width: 'auto', padding: '10px 12px', fontSize: 12 }}
              onClick={() => {
                setSelectedBlockId(null)
                setBlockForm(EMPTY_BLOCK)
                setProducts([])
              }}
            >
              Nouveau
            </button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {blocks.map((block) => (
              <button
                key={block.id}
                className={`seo-list-item${block.id === selectedBlockId ? ' active' : ''}`}
                onClick={async () => {
                  setSelectedBlockId(block.id)
                  setBlockForm({
                    ...block,
                    meat_slug: block.meat_slug || '',
                    method_key: block.method_key || '',
                    title_secondary: block.title_secondary || '',
                    content: block.content || '',
                    image_url: block.image_url || '',
                    cta_text: block.cta_text || '',
                    cta_link: block.cta_link || '',
                    affiliate_link: block.affiliate_link || '',
                    badge: block.badge || '',
                    note: block.note || '',
                    icon: block.icon || '',
                    settings_json: JSON.stringify(block.settings_json || {}, null, 2),
                  })
                  setProducts(await fetchSeoBlockProducts(block.id))
                }}
              >
                <div style={{ fontWeight: 700, color: '#f5f1ea' }}>{block.title}</div>
                <div style={{ fontSize: 12, color: '#8a7060', marginTop: 4 }}>
                  {block.position} · {block.block_type} · {block.meat_slug || 'global'}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div style={{ display: 'grid', gap: 18 }}>
          <section className="seo-card">
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#fff', marginBottom: 14 }}>
              {currentBlock ? `Bloc : ${currentBlock.title}` : 'Nouveau bloc SEO'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="seo-label">Titre</label>
                <input className="seo-input" value={blockForm.title || ''} onChange={(e) => setBlockForm((prev) => ({ ...prev, title: e.target.value }))} />
              </div>
              <div>
                <label className="seo-label">Type de bloc</label>
                <select className="seo-select" value={blockForm.block_type} onChange={(e) => setBlockForm((prev) => ({ ...prev, block_type: e.target.value }))}>
                  {BLOCK_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </div>
              <div>
                <label className="seo-label">Position</label>
                <select className="seo-select" value={blockForm.position} onChange={(e) => setBlockForm((prev) => ({ ...prev, position: e.target.value }))}>
                  {POSITIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </div>
              <div>
                <label className="seo-label">Page</label>
                <input className="seo-input" value={blockForm.page_slug || ''} onChange={(e) => setBlockForm((prev) => ({ ...prev, page_slug: e.target.value }))} />
              </div>
              <div>
                <label className="seo-label">Viande ciblée</label>
                <select className="seo-select" value={blockForm.meat_slug || ''} onChange={(e) => setBlockForm((prev) => ({ ...prev, meat_slug: e.target.value }))}>
                  <option value="">Toutes</option>
                  {(catalog.meats || []).map((meat) => <option key={meat.id} value={meat.slug}>{meat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="seo-label">Méthode</label>
                <select className="seo-select" value={blockForm.method_key || ''} onChange={(e) => setBlockForm((prev) => ({ ...prev, method_key: e.target.value }))}>
                  <option value="">Toutes</option>
                  <option value="low_and_slow">low_and_slow</option>
                  <option value="hot_and_fast">hot_and_fast</option>
                </select>
              </div>
              <div>
                <label className="seo-label">Badge</label>
                <input className="seo-input" value={blockForm.badge || ''} onChange={(e) => setBlockForm((prev) => ({ ...prev, badge: e.target.value }))} />
              </div>
              <div>
                <label className="seo-label">Icône</label>
                <input className="seo-input" value={blockForm.icon || ''} onChange={(e) => setBlockForm((prev) => ({ ...prev, icon: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="seo-label">Titre secondaire</label>
              <input className="seo-input" value={blockForm.title_secondary || ''} onChange={(e) => setBlockForm((prev) => ({ ...prev, title_secondary: e.target.value }))} />
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="seo-label">Contenu</label>
              <textarea className="seo-textarea" rows={5} value={blockForm.content || ''} onChange={(e) => setBlockForm((prev) => ({ ...prev, content: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div>
                <label className="seo-label">Image URL</label>
                <input className="seo-input" value={blockForm.image_url || ''} onChange={(e) => setBlockForm((prev) => ({ ...prev, image_url: e.target.value }))} />
              </div>
              <div>
                <label className="seo-label">Note</label>
                <input className="seo-input" value={blockForm.note || ''} onChange={(e) => setBlockForm((prev) => ({ ...prev, note: e.target.value }))} />
              </div>
              <div>
                <label className="seo-label">CTA text</label>
                <input className="seo-input" value={blockForm.cta_text || ''} onChange={(e) => setBlockForm((prev) => ({ ...prev, cta_text: e.target.value }))} />
              </div>
              <div>
                <label className="seo-label">CTA link</label>
                <input className="seo-input" value={blockForm.cta_link || ''} onChange={(e) => setBlockForm((prev) => ({ ...prev, cta_link: e.target.value }))} />
              </div>
              <div>
                <label className="seo-label">Lien affiliation</label>
                <input className="seo-input" value={blockForm.affiliate_link || ''} onChange={(e) => setBlockForm((prev) => ({ ...prev, affiliate_link: e.target.value }))} />
              </div>
              <div>
                <label className="seo-label">Ordre</label>
                <input className="seo-input" type="number" value={blockForm.display_order || 0} onChange={(e) => setBlockForm((prev) => ({ ...prev, display_order: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#d4c4b0', fontSize: 13 }}>
                <input type="checkbox" checked={blockForm.is_active !== false} onChange={(e) => setBlockForm((prev) => ({ ...prev, is_active: e.target.checked }))} />
                Bloc actif
              </label>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="seo-label">settings_json</label>
              <textarea className="seo-textarea" rows={6} value={blockForm.settings_json || '{}'} onChange={(e) => setBlockForm((prev) => ({ ...prev, settings_json: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="pm-btn-primary" style={{ width: 'auto', padding: '12px 18px' }} onClick={saveBlock}>
                Sauvegarder le bloc
              </button>
              {currentBlock ? (
                <button className="pm-btn-secondary" style={{ width: 'auto', padding: '12px 18px' }} onClick={() => removeBlock(currentBlock.id)}>
                  Supprimer le bloc
                </button>
              ) : null}
            </div>
          </section>

          <section className="seo-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#fff' }}>Produits associés</div>
              <div style={{ fontSize: 12, color: '#8a7060' }}>{products.length} produit(s)</div>
            </div>

            {selectedBlockId ? (
              <>
                <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
                  {products.map((product) => (
                    <div key={product.id} className="seo-list-item" style={{ cursor: 'default' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ color: '#f5f1ea', fontWeight: 700 }}>{product.name}</div>
                          <div style={{ color: '#8a7060', fontSize: 12, marginTop: 4 }}>{product.rating ? `Note ${product.rating}/5` : 'Sans note'}</div>
                        </div>
                        <button className="pm-btn-secondary" style={{ width: 'auto', padding: '10px 12px', fontSize: 12 }} onClick={() => removeProduct(product.id)}>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#fff' }}>Ajouter un produit</div>
                  <div>
                    <label className="seo-label">Nom</label>
                    <input className="seo-input" value={productForm.name} onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="seo-label">Description</label>
                    <textarea className="seo-textarea" rows={3} value={productForm.description} onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="seo-label">Image URL</label>
                      <input className="seo-input" value={productForm.image_url} onChange={(e) => setProductForm((prev) => ({ ...prev, image_url: e.target.value }))} />
                    </div>
                    <div>
                      <label className="seo-label">Lien affiliation</label>
                      <input className="seo-input" value={productForm.affiliate_url} onChange={(e) => setProductForm((prev) => ({ ...prev, affiliate_url: e.target.value }))} />
                    </div>
                    <div>
                      <label className="seo-label">Note</label>
                      <input className="seo-input" type="number" step="0.1" value={productForm.rating} onChange={(e) => setProductForm((prev) => ({ ...prev, rating: e.target.value }))} />
                    </div>
                    <div>
                      <label className="seo-label">Ordre</label>
                      <input className="seo-input" type="number" value={productForm.display_order} onChange={(e) => setProductForm((prev) => ({ ...prev, display_order: e.target.value }))} />
                    </div>
                  </div>
                  <button className="pm-btn-primary" style={{ width: 'auto', padding: '12px 18px' }} onClick={saveProduct}>
                    Ajouter le produit
                  </button>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: '#8a7060', lineHeight: 1.7 }}>
                Crée ou sélectionne d’abord un bloc SEO pour lui rattacher des produits affiliés.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
