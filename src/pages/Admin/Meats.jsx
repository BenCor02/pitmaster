import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchCalculatorCatalog, upsertCalculatorMeat, upsertCalculatorParameters, upsertCookingMethod } from '../../lib/cms'

const css = `
  .cat-wrap{display:grid;grid-template-columns:320px minmax(0,1fr);gap:18px}
  .cat-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;padding:18px}
  .cat-input,.cat-select,.cat-textarea{background:#0e0c0a;border:1px solid #252018;border-radius:10px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:13px;padding:10px 12px;outline:none;width:100%}
  .cat-textarea{resize:vertical}
  .cat-label{display:block;font-size:10px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#6a5a4a;margin-bottom:7px}
  .cat-item{padding:12px 14px;border:1px solid #1e1a14;border-radius:10px;background:#100d0b;cursor:pointer}
  .cat-item.active{border-color:rgba(232,93,4,0.35);background:rgba(232,93,4,0.08)}
  @media(max-width:980px){.cat-wrap{grid-template-columns:1fr}}
`

const EMPTY_MEAT = { slug: '', name: '', category: 'boeuf', icon: '🥩', description: '', default_weight_kg: 3, is_active: true, display_order: 0 }
const EMPTY_METHOD = {
  method_key: 'low_and_slow',
  label: 'Low & Slow',
  smoker_temp_min: 107,
  smoker_temp_max: 121,
  smoker_temp_default: 110,
  target_internal_temp: 96,
  target_internal_temp_min: 92,
  target_internal_temp_max: 97,
  probe_start_temp: 90,
  wrap_temp: null,
  wrap_time_saved_percent: 0,
  rest_min: 60,
  rest_max: 120,
  stall_min: 65,
  stall_max: 75,
  stall_duration_min: 60,
  notes: '',
  timeline_profile: 'classic_probe',
  fixed_total_min: null,
  fixed_total_max: null,
  sizing_model: 'weighted',
  high_temp_minutes_per_kg: 125,
  low_temp_minutes_per_kg: 165,
  is_active: true,
  display_order: 1,
}

export default function AdminMeats() {
  const [catalog, setCatalog] = useState({ meats: [], methods: [], parameters: [] })
  const [selectedSlug, setSelectedSlug] = useState(null)
  const [meatForm, setMeatForm] = useState(EMPTY_MEAT)
  const [methodForm, setMethodForm] = useState(EMPTY_METHOD)

  const selectMeat = useCallback((slug, source = catalog) => {
    const meat = source.meats.find((entry) => entry.slug === slug)
    const method = source.methods.find((entry) => entry.meat_id === meat?.id) || EMPTY_METHOD
    const param = source.parameters.find((entry) => entry.method_id === method?.id)
    setSelectedSlug(slug)
    setMeatForm(meat || EMPTY_MEAT)
    setMethodForm({
      ...EMPTY_METHOD,
      ...method,
      high_temp_minutes_per_kg: param?.high_temp_minutes_per_kg ?? method?.high_temp_minutes_per_kg ?? EMPTY_METHOD.high_temp_minutes_per_kg,
      low_temp_minutes_per_kg: param?.low_temp_minutes_per_kg ?? method?.low_temp_minutes_per_kg ?? EMPTY_METHOD.low_temp_minutes_per_kg,
    })
  }, [catalog])

  const loadCatalog = useCallback(async (nextSlug = null) => {
    const next = await fetchCalculatorCatalog()
    setCatalog(next)
    const slug = nextSlug || selectedSlug || next.meats[0]?.slug || null
    if (slug) selectMeat(slug, next)
  }, [selectedSlug, selectMeat])

  async function saveMeat() {
    const saved = await upsertCalculatorMeat({
      ...meatForm,
      default_weight_kg: Number(meatForm.default_weight_kg) || 3,
      display_order: Number(meatForm.display_order) || 0,
    })
    await loadCatalog(saved.slug)
  }

  async function saveMethod() {
    const meat = catalog.meats.find((entry) => entry.slug === selectedSlug) || meatForm
    if (!meat.id) return
    const savedMethod = await upsertCookingMethod({
      ...methodForm,
      meat_id: meat.id,
      smoker_temp_min: Number(methodForm.smoker_temp_min),
      smoker_temp_max: Number(methodForm.smoker_temp_max),
      smoker_temp_default: Number(methodForm.smoker_temp_default),
      target_internal_temp: methodForm.target_internal_temp ? Number(methodForm.target_internal_temp) : null,
      target_internal_temp_min: methodForm.target_internal_temp_min ? Number(methodForm.target_internal_temp_min) : null,
      target_internal_temp_max: methodForm.target_internal_temp_max ? Number(methodForm.target_internal_temp_max) : null,
      probe_start_temp: methodForm.probe_start_temp ? Number(methodForm.probe_start_temp) : null,
      wrap_temp: methodForm.wrap_temp ? Number(methodForm.wrap_temp) : null,
      wrap_time_saved_percent: Number(methodForm.wrap_time_saved_percent) || 0,
      rest_min: Number(methodForm.rest_min) || 0,
      rest_max: Number(methodForm.rest_max) || 0,
      stall_min: methodForm.stall_min ? Number(methodForm.stall_min) : null,
      stall_max: methodForm.stall_max ? Number(methodForm.stall_max) : null,
      stall_duration_min: Number(methodForm.stall_duration_min) || 0,
      fixed_total_min: methodForm.fixed_total_min ? Number(methodForm.fixed_total_min) : null,
      fixed_total_max: methodForm.fixed_total_max ? Number(methodForm.fixed_total_max) : null,
      high_temp_minutes_per_kg: Number(methodForm.high_temp_minutes_per_kg) || null,
      low_temp_minutes_per_kg: Number(methodForm.low_temp_minutes_per_kg) || null,
      display_order: Number(methodForm.display_order) || 1,
    })

    await upsertCalculatorParameters({
      method_id: savedMethod.id,
      low_temp_minutes_per_kg: Number(methodForm.low_temp_minutes_per_kg) || 0,
      high_temp_minutes_per_kg: Number(methodForm.high_temp_minutes_per_kg) || 0,
      buffer_percent: 0,
      buffer_min_minutes: 0,
      buffer_max_minutes: 0,
      weight_adjustment_json: { overweight_from_kg: 6, overweight_percent_per_kg: 0.03 },
      special_rules_json: { sizing_model: methodForm.sizing_model || 'weighted' },
    })

    await loadCatalog(selectedSlug)
  }

  const methodsForSelected = useMemo(
    () => catalog.methods.filter((entry) => entry.meat_id === meatForm.id),
    [catalog.methods, meatForm.id]
  )

  useEffect(() => {
    const timer = setTimeout(() => { loadCatalog() }, 0)
    return () => clearTimeout(timer)
  }, [loadCatalog])

  return (
    <div style={{ fontFamily: 'DM Sans,sans-serif' }}>
      <style>{css}</style>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: '#fff' }}>
          Calculateur <span style={{ color: '#e85d04' }}>catalogue</span>
        </h1>
        <p style={{ fontSize: 11, color: '#8a7060', marginTop: 6, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
          Viandes · méthodes · paramètres depuis Supabase
        </p>
      </div>

      <div className="cat-wrap">
        <aside className="cat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#fff' }}>Viandes</div>
            <button className="pm-btn-secondary" style={{ width: 'auto', padding: '10px 12px', fontSize: 12 }} onClick={() => { setSelectedSlug(null); setMeatForm(EMPTY_MEAT); setMethodForm(EMPTY_METHOD) }}>
              Nouvelle
            </button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {catalog.meats.map((meat) => (
              <button key={meat.id} className={`cat-item${selectedSlug === meat.slug ? ' active' : ''}`} style={{ textAlign: 'left', color: 'inherit' }} onClick={() => selectMeat(meat.slug)}>
                <div style={{ color: '#f5f1ea', fontWeight: 700 }}>{meat.icon} {meat.name}</div>
                <div style={{ color: '#8a7060', fontSize: 12, marginTop: 4 }}>{meat.slug} · {meat.category}</div>
              </button>
            ))}
          </div>
        </aside>

        <div style={{ display: 'grid', gap: 18 }}>
          <section className="cat-card">
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#fff', marginBottom: 14 }}>Viande</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 12 }}>
              <div>
                <label className="cat-label">Slug</label>
                <input className="cat-input" value={meatForm.slug || ''} onChange={(e) => setMeatForm((prev) => ({ ...prev, slug: e.target.value }))} />
              </div>
              <div>
                <label className="cat-label">Nom</label>
                <input className="cat-input" value={meatForm.name || ''} onChange={(e) => setMeatForm((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <label className="cat-label">Icône</label>
                <input className="cat-input" value={meatForm.icon || ''} onChange={(e) => setMeatForm((prev) => ({ ...prev, icon: e.target.value }))} />
              </div>
              <div>
                <label className="cat-label">Catégorie</label>
                <input className="cat-input" value={meatForm.category || ''} onChange={(e) => setMeatForm((prev) => ({ ...prev, category: e.target.value }))} />
              </div>
              <div>
                <label className="cat-label">Poids défaut kg</label>
                <input className="cat-input" value={meatForm.default_weight_kg || ''} onChange={(e) => setMeatForm((prev) => ({ ...prev, default_weight_kg: e.target.value }))} />
              </div>
              <div>
                <label className="cat-label">Ordre</label>
                <input className="cat-input" value={meatForm.display_order || 0} onChange={(e) => setMeatForm((prev) => ({ ...prev, display_order: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="cat-label">Description</label>
              <textarea className="cat-textarea" rows={4} value={meatForm.description || ''} onChange={(e) => setMeatForm((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="pm-btn-primary" style={{ width: 'auto', padding: '12px 18px' }} onClick={saveMeat}>
                Sauvegarder la viande
              </button>
            </div>
          </section>

          <section className="cat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#fff' }}>Méthodes</div>
              <div style={{ color: '#8a7060', fontSize: 12 }}>{methodsForSelected.length} méthode(s)</div>
            </div>
            {methodsForSelected.length ? (
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                {methodsForSelected.map((method) => (
                  <button key={method.id} className="pm-btn-secondary" style={{ width: 'auto', padding: '10px 12px', fontSize: 12 }} onClick={() => setMethodForm({
                    ...method,
                    high_temp_minutes_per_kg: catalog.parameters.find((entry) => entry.method_id === method.id)?.high_temp_minutes_per_kg ?? method.high_temp_minutes_per_kg,
                    low_temp_minutes_per_kg: catalog.parameters.find((entry) => entry.method_id === method.id)?.low_temp_minutes_per_kg ?? method.low_temp_minutes_per_kg,
                  })}>
                    {method.label}
                  </button>
                ))}
              </div>
            ) : null}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label className="cat-label">Method key</label>
                <select className="cat-select" value={methodForm.method_key || 'low_and_slow'} onChange={(e) => setMethodForm((prev) => ({ ...prev, method_key: e.target.value }))}>
                  <option value="low_and_slow">low_and_slow</option>
                  <option value="hot_and_fast">hot_and_fast</option>
                  <option value="texas_crutch">texas_crutch</option>
                </select>
              </div>
              <div>
                <label className="cat-label">Label</label>
                <input className="cat-input" value={methodForm.label || ''} onChange={(e) => setMethodForm((prev) => ({ ...prev, label: e.target.value }))} />
              </div>
              <div>
                <label className="cat-label">Timeline profile</label>
                <input className="cat-input" value={methodForm.timeline_profile || ''} onChange={(e) => setMethodForm((prev) => ({ ...prev, timeline_profile: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
              {[
                ['smoker_temp_min', 'Temp min'],
                ['smoker_temp_max', 'Temp max'],
                ['smoker_temp_default', 'Temp défaut'],
                ['wrap_temp', 'Wrap temp'],
                ['target_internal_temp', 'Target'],
                ['target_internal_temp_min', 'Tender min'],
                ['target_internal_temp_max', 'Tender max'],
                ['probe_start_temp', 'Début tests'],
                ['rest_min', 'Repos min'],
                ['rest_max', 'Repos max'],
                ['stall_min', 'Stall min'],
                ['stall_max', 'Stall max'],
                ['high_temp_minutes_per_kg', 'min/kg chaud'],
                ['low_temp_minutes_per_kg', 'min/kg froid'],
                ['fixed_total_min', 'Fixe min'],
                ['fixed_total_max', 'Fixe max'],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="cat-label">{label}</label>
                  <input className="cat-input" value={methodForm[key] ?? ''} onChange={(e) => setMethodForm((prev) => ({ ...prev, [key]: e.target.value }))} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="cat-label">Notes pitmaster</label>
              <textarea className="cat-textarea" rows={5} value={methodForm.notes || ''} onChange={(e) => setMethodForm((prev) => ({ ...prev, notes: e.target.value }))} />
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="pm-btn-primary" style={{ width: 'auto', padding: '12px 18px' }} onClick={saveMethod}>
                Sauvegarder la méthode
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
