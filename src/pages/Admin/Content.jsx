import { useCallback, useEffect, useMemo, useState } from 'react'
import { deletePageSection, fetchAdminPages, fetchAdminSections, upsertPage, upsertPageSection } from '../../modules/cms/repository'

const css = `
  .cms-wrap{display:grid;grid-template-columns:320px minmax(0,1fr);gap:18px}
  .cms-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;padding:18px}
  .cms-input,.cms-textarea,.cms-select{background:#0e0c0a;border:1px solid #252018;border-radius:10px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:13px;padding:10px 12px;outline:none;width:100%}
  .cms-textarea{resize:vertical}
  .cms-label{display:block;font-size:10px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#6a5a4a;margin-bottom:7px}
  .cms-list-item{padding:12px 14px;border:1px solid #1e1a14;border-radius:10px;background:#100d0b;cursor:pointer}
  .cms-list-item.active{border-color:rgba(232,93,4,0.35);background:rgba(232,93,4,0.08)}
  @media(max-width:980px){.cms-wrap{grid-template-columns:1fr}}
`

const EMPTY_SECTION = {
  section_type: 'text',
  order_index: 0,
  is_enabled: true,
  title: '',
  subtitle: '',
  content: '',
  cta_text: '',
  cta_link: '',
  image_url: '',
  settings_json: '{}',
}

export default function AdminContent() {
  const [pages, setPages] = useState([])
  const [pageId, setPageId] = useState(null)
  const [pageForm, setPageForm] = useState({ title: '', slug: '', page_type: 'landing', status: 'draft', seo_title: '', seo_description: '' })
  const [sections, setSections] = useState([])
  const [sectionForm, setSectionForm] = useState(EMPTY_SECTION)

  const loadPages = useCallback(async (nextPageId = null) => {
    const data = await fetchAdminPages()
    setPages(data)
    const target = nextPageId || pageId || data[0]?.id || null
    if (target) {
      const current = data.find((entry) => entry.id === target)
      if (current) {
        setPageId(current.id)
        setPageForm(current)
        const nextSections = await fetchAdminSections(current.id)
        setSections(nextSections)
      }
    }
  }, [pageId])

  async function savePage() {
    const saved = await upsertPage(pageForm)
    await loadPages(saved.id)
  }

  async function saveSection() {
    let settingsJson = {}
    try {
      settingsJson = sectionForm.settings_json ? JSON.parse(sectionForm.settings_json) : {}
    } catch {
      return
    }
    await upsertPageSection({
      ...sectionForm,
      page_id: pageId,
      order_index: Number(sectionForm.order_index) || 0,
      is_enabled: sectionForm.is_enabled !== false,
      settings_json: settingsJson,
    })
    setSectionForm(EMPTY_SECTION)
    const nextSections = await fetchAdminSections(pageId)
    setSections(nextSections)
  }

  async function removeSection(id) {
    await deletePageSection(id)
    const nextSections = await fetchAdminSections(pageId)
    setSections(nextSections)
  }

  const currentPage = useMemo(() => pages.find((entry) => entry.id === pageId), [pages, pageId])

  useEffect(() => {
    const timer = setTimeout(() => { loadPages() }, 0)
    return () => clearTimeout(timer)
  }, [loadPages])

  return (
    <div style={{ fontFamily: 'DM Sans,sans-serif' }}>
      <style>{css}</style>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: '#fff' }}>
          Pages <span style={{ color: '#e85d04' }}>CMS</span>
        </h1>
        <p style={{ fontSize: 11, color: '#8a7060', marginTop: 6, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
          Supabase = source de vérité du front public
        </p>
      </div>

      <div className="cms-wrap">
        <aside className="cms-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#fff' }}>Pages</div>
            <button
              className="pm-btn-secondary"
              style={{ width: 'auto', padding: '10px 12px', fontSize: 12 }}
              onClick={() => {
                setPageId(null)
                setPageForm({ title: '', slug: '', page_type: 'page', status: 'draft', seo_title: '', seo_description: '' })
                setSections([])
              }}
            >
              Nouvelle
            </button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {pages.map((page) => (
              <button
                key={page.id}
                className={`cms-list-item${page.id === pageId ? ' active' : ''}`}
                onClick={async () => {
                  setPageId(page.id)
                  setPageForm(page)
                  setSections(await fetchAdminSections(page.id))
                }}
                style={{ textAlign: 'left', color: 'inherit' }}
              >
                <div style={{ fontWeight: 700, color: '#f5f1ea' }}>{page.title}</div>
                <div style={{ fontSize: 12, color: '#8a7060', marginTop: 4 }}>{page.slug} · {page.status}</div>
              </button>
            ))}
          </div>
        </aside>

        <div style={{ display: 'grid', gap: 18 }}>
          <section className="cms-card">
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#fff', marginBottom: 14 }}>
              {currentPage ? `Page : ${currentPage.title}` : 'Nouvelle page'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="cms-label">Titre</label>
                <input className="cms-input" value={pageForm.title || ''} onChange={(e) => setPageForm((prev) => ({ ...prev, title: e.target.value }))} />
              </div>
              <div>
                <label className="cms-label">Slug</label>
                <input className="cms-input" value={pageForm.slug || ''} onChange={(e) => setPageForm((prev) => ({ ...prev, slug: e.target.value }))} />
              </div>
              <div>
                <label className="cms-label">Type</label>
                <input className="cms-input" value={pageForm.page_type || ''} onChange={(e) => setPageForm((prev) => ({ ...prev, page_type: e.target.value }))} />
              </div>
              <div>
                <label className="cms-label">Statut</label>
                <select className="cms-select" value={pageForm.status || 'draft'} onChange={(e) => setPageForm((prev) => ({ ...prev, status: e.target.value }))}>
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="active">active</option>
                  <option value="archived">archived</option>
                </select>
              </div>
              <div>
                <label className="cms-label">SEO title</label>
                <input className="cms-input" value={pageForm.seo_title || ''} onChange={(e) => setPageForm((prev) => ({ ...prev, seo_title: e.target.value }))} />
              </div>
              <div>
                <label className="cms-label">SEO description</label>
                <input className="cms-input" value={pageForm.seo_description || ''} onChange={(e) => setPageForm((prev) => ({ ...prev, seo_description: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="pm-btn-primary" style={{ width: 'auto', padding: '12px 18px' }} onClick={savePage}>
                Sauvegarder la page
              </button>
            </div>
          </section>

          <section className="cms-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#fff' }}>Sections</div>
              <div style={{ fontSize: 12, color: '#8a7060' }}>{sections.length} section(s)</div>
            </div>
            <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
              {sections.map((section) => (
                <div key={section.id} className="cms-list-item" style={{ cursor: 'default' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ color: '#f5f1ea', fontWeight: 700 }}>{section.section_type}</div>
                      <div style={{ color: '#8a7060', fontSize: 12, marginTop: 4 }}>{section.title || 'Sans titre'} · ordre {section.order_index}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="pm-btn-secondary" style={{ width: 'auto', padding: '10px 12px', fontSize: 12 }} onClick={() => setSectionForm({ ...section, settings_json: JSON.stringify(section.settings_json || {}, null, 2) })}>
                        Modifier
                      </button>
                      <button className="pm-btn-secondary" style={{ width: 'auto', padding: '10px 12px', fontSize: 12 }} onClick={() => removeSection(section.id)}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pageId ? (
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#fff' }}>
                  {sectionForm.id ? 'Modifier la section' : 'Nouvelle section'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="cms-label">Type</label>
                    <input className="cms-input" value={sectionForm.section_type || ''} onChange={(e) => setSectionForm((prev) => ({ ...prev, section_type: e.target.value }))} />
                  </div>
                  <div>
                    <label className="cms-label">Ordre</label>
                    <input className="cms-input" value={sectionForm.order_index || 0} onChange={(e) => setSectionForm((prev) => ({ ...prev, order_index: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'end' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#d4c4b0', fontSize: 13 }}>
                      <input type="checkbox" checked={sectionForm.is_enabled !== false} onChange={(e) => setSectionForm((prev) => ({ ...prev, is_enabled: e.target.checked }))} />
                      Section active
                    </label>
                  </div>
                </div>
                <div>
                  <label className="cms-label">Titre</label>
                  <input className="cms-input" value={sectionForm.title || ''} onChange={(e) => setSectionForm((prev) => ({ ...prev, title: e.target.value }))} />
                </div>
                <div>
                  <label className="cms-label">Sous-titre</label>
                  <input className="cms-input" value={sectionForm.subtitle || ''} onChange={(e) => setSectionForm((prev) => ({ ...prev, subtitle: e.target.value }))} />
                </div>
                <div>
                  <label className="cms-label">Contenu</label>
                  <textarea className="cms-textarea" rows={4} value={sectionForm.content || ''} onChange={(e) => setSectionForm((prev) => ({ ...prev, content: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="cms-label">CTA text</label>
                    <input className="cms-input" value={sectionForm.cta_text || ''} onChange={(e) => setSectionForm((prev) => ({ ...prev, cta_text: e.target.value }))} />
                  </div>
                  <div>
                    <label className="cms-label">CTA link</label>
                    <input className="cms-input" value={sectionForm.cta_link || ''} onChange={(e) => setSectionForm((prev) => ({ ...prev, cta_link: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="cms-label">Image URL</label>
                  <input className="cms-input" value={sectionForm.image_url || ''} onChange={(e) => setSectionForm((prev) => ({ ...prev, image_url: e.target.value }))} />
                </div>
                <div>
                  <label className="cms-label">settings_json</label>
                  <textarea className="cms-textarea" rows={8} value={sectionForm.settings_json || '{}'} onChange={(e) => setSectionForm((prev) => ({ ...prev, settings_json: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="pm-btn-primary" style={{ width: 'auto', padding: '12px 18px' }} onClick={saveSection}>
                    Sauvegarder la section
                  </button>
                  {sectionForm.id ? (
                    <button className="pm-btn-secondary" style={{ width: 'auto', padding: '12px 18px' }} onClick={() => setSectionForm(EMPTY_SECTION)}>
                      Nouvelle section
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <p style={{ color: '#8a7060', fontSize: 13 }}>Sauvegarde d’abord une page pour pouvoir y rattacher des sections.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
