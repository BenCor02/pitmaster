import { useState } from 'react'

const ITEMS = [
  {
    category: '🥩 Viandes',
    items: [
      { name: 'Brisket (poitrine bœuf)', rawPer: 400, cookedPer: 200, loss: 40, note: 'Perte 35-45% à la cuisson' },
      { name: 'Pulled Pork (épaule)', rawPer: 350, cookedPer: 180, loss: 40, note: 'Perte 40% — effilochage' },
      { name: 'Spare Ribs (rack)', rawPer: 500, cookedPer: 300, loss: 30, note: 'Compter ~500g brut/personne' },
      { name: 'Baby Back Ribs', rawPer: 400, cookedPer: 260, loss: 30, note: 'Un rack = 2-3 personnes' },
      { name: 'Beef Short Ribs', rawPer: 450, cookedPer: 270, loss: 35, note: '1-2 côtes par personne' },
      { name: 'Paleron façon brisket', rawPer: 380, cookedPer: 220, loss: 38, note: 'Similaire brisket' },
      { name: 'Plat de côte', rawPer: 420, cookedPer: 240, loss: 35, note: 'Os inclus dans le poids' },
      { name: 'Poulet entier', rawPer: 400, cookedPer: 260, loss: 30, note: '1 poulet = 3-4 personnes' },
      { name: 'Cuisses de poulet', rawPer: 300, cookedPer: 200, loss: 30, note: '2 cuisses/personne' },
      { name: 'Épaule d\'agneau', rawPer: 380, cookedPer: 220, loss: 38, note: '1 épaule = 4-5 personnes' },
      { name: 'Saucisses / Merguez', rawPer: 200, cookedPer: 170, loss: 10, note: '2-3 saucisses/personne' },
    ]
  },
  {
    category: '🥗 Accompagnements',
    items: [
      { name: 'Coleslaw', rawPer: 120, unit: 'g', note: 'Avec chou, carotte, mayo' },
      { name: 'Haricots BBQ', rawPer: 150, unit: 'g', note: 'Crus, avant cuisson' },
      { name: 'Maïs épi', rawPer: 1, unit: 'épi', note: '1 épi par personne' },
      { name: 'Salade verte', rawPer: 60, unit: 'g', note: 'En accompagnement' },
      { name: 'Pain de maïs', rawPer: 80, unit: 'g', note: '2 tranches/personne env.' },
      { name: 'Frites maison', rawPer: 250, unit: 'g', note: 'Pommes de terre crues' },
      { name: 'Riz', rawPer: 80, unit: 'g', note: 'Cru, gonfle x3 à la cuisson' },
    ]
  },
  {
    category: '🧂 Rubs & Sauces',
    items: [
      { name: 'Rub BBQ (sel + épices)', rawPer: 15, unit: 'g', note: 'Pour 200g de viande' },
      { name: 'Sauce BBQ', rawPer: 50, unit: 'ml', note: 'En sauce de trempage' },
      { name: 'Sauce piquante', rawPer: 20, unit: 'ml', note: 'Pour amateurs de piment' },
      { name: 'Moutarde (liant rub)', rawPer: 10, unit: 'g', note: 'Par kg de viande' },
    ]
  },
]

export default function QuantityPage() {
  const [guests, setGuests] = useState(8)
  const [appetite, setAppetite] = useState('normal') // light | normal | big
  const [event, setEvent] = useState('dinner') // lunch | dinner | party
  const [openCat, setOpenCat] = useState({ '🥩 Viandes': true })

  const appetiteMulti = { light: 0.75, normal: 1.0, big: 1.35 }[appetite]
  const eventMulti = { lunch: 0.85, dinner: 1.0, party: 1.2 }[event]
  const multi = appetiteMulti * eventMulti

  function qty(rawPer) {
    const total = Math.round(rawPer * guests * multi)
    if (total >= 1000) return `${(total / 1000).toFixed(1)} kg`
    return `${total} g`
  }

  function qtyUnit(rawPer, unit) {
    const total = rawPer * guests * multi
    if (unit === 'épi' || unit === 'ml') return `${Math.ceil(total)} ${unit}`
    return `${Math.round(total)} ${unit}`
  }

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif" }}>
      <div style={{ marginBottom:28 }}>
        <h1>Quantités <span style={{ color:'var(--orange)' }}>BBQ</span></h1>
        <p style={{ fontSize:11, color:'var(--text3)', marginTop:6, letterSpacing:'1.5px', textTransform:'uppercase', fontWeight:600 }}>
          Calculateur de portions · Viandes et accompagnements
        </p>
      </div>

      {/* CONFIG */}
      <div className="pm-card">
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--text3)', marginBottom:16 }}>⚙️ Paramètres</div>

        {/* NOMBRE D'INVITÉS */}
        <div style={{ marginBottom:18 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <label className="pm-field-label" style={{ marginBottom:0 }}>Nombre de convives</label>
            <div style={{ fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:36, color:'var(--orange)', lineHeight:1 }}>{guests}</div>
          </div>
          <input type="range" value={guests} min={2} max={50} step={1} onChange={e => setGuests(parseInt(e.target.value))} />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:5 }}>
            <span style={{ fontSize:10, color:'var(--text3)' }}>2</span>
            <span style={{ fontSize:10, color:'var(--text3)' }}>50</span>
          </div>
        </div>

        {/* APPÉTIT */}
        <div style={{ marginBottom:14 }}>
          <label className="pm-field-label">Appétit</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[{id:'light',label:'🥗 Léger',desc:'Repas mixte'},{id:'normal',label:'🍽️ Normal',desc:'BBQ classique'},{id:'big',label:'🏋️ Gros',desc:'Gros mangeurs'}].map(a => (
              <button key={a.id} onClick={() => setAppetite(a.id)}
                style={{ padding:'10px 8px', borderRadius:14, border:`1.5px solid ${appetite===a.id?'var(--orange-border)':'var(--border)'}`, background: appetite===a.id?'var(--orange-bg)':'var(--surface2)', cursor:'pointer', transition:'all 0.15s', textAlign:'center' }}>
                <div style={{ fontSize:16, marginBottom:3 }}>{a.label.split(' ')[0]}</div>
                <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:11, color: appetite===a.id?'var(--orange)':'var(--text2)' }}>{a.label.split(' ')[1]}</div>
                <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>{a.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* TYPE D'ÉVÉNEMENT */}
        <div>
          <label className="pm-field-label">Type d'événement</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[{id:'lunch',label:'☀️ Déjeuner'},{id:'dinner',label:'🌙 Dîner'},{id:'party',label:'🎉 Fête'}].map(e => (
              <button key={e.id} onClick={() => setEvent(e.id)}
                style={{ padding:'10px', borderRadius:50, border:`1.5px solid ${event===e.id?'var(--orange-border)':'var(--border)'}`, background: event===e.id?'var(--orange-bg)':'var(--surface2)', color: event===e.id?'var(--orange)':'var(--text2)', fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:12, cursor:'pointer', transition:'all 0.15s' }}>
                {e.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RÉSUMÉ */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'16px 20px', marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:13, color:'var(--text)' }}>Multiplicateur appliqué</div>
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>
            {guests} pers. × appétit {appetiteMulti} × event {eventMulti}
          </div>
        </div>
        <div style={{ fontFamily:'DM Mono, monospace', fontWeight:700, fontSize:22, color:'var(--orange)' }}>×{(multi).toFixed(2)}</div>
      </div>

      {/* TABLEAUX */}
      {ITEMS.map(cat => (
        <div key={cat.category} className="pm-card" style={{ marginBottom:10 }}>
          <div onClick={() => setOpenCat(p => ({...p, [cat.category]: !p[cat.category]}))}
            style={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', userSelect:'none', marginBottom: openCat[cat.category] ? 16 : 0 }}>
            <div style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:14, color:'var(--text)' }}>{cat.category}</div>
            <span style={{ fontSize:12, color:'var(--text3)', transform: openCat[cat.category] ? 'rotate(180deg)' : 'none', display:'inline-block', transition:'transform 0.2s' }}>▼</span>
          </div>

          {openCat[cat.category] && cat.items.map((item, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: i < cat.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ flex:1, paddingRight:16 }}>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{item.name}</div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{item.note}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                {item.unit ? (
                  <div style={{ fontFamily:'DM Mono, monospace', fontWeight:700, fontSize:16, color:'var(--orange)' }}>
                    {qtyUnit(item.rawPer, item.unit)}
                  </div>
                ) : (
                  <>
                    <div style={{ fontFamily:'DM Mono, monospace', fontWeight:700, fontSize:16, color:'var(--orange)' }}>
                      {qty(item.rawPer)}
                    </div>
                    <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>
                      cuit ~{qty(item.cookedPer)}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* NOTE */}
      <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:14, padding:'12px 16px', fontSize:12, color:'var(--text3)', lineHeight:1.7 }}>
        💡 <strong style={{ color:'var(--text2)' }}>Conseil :</strong> Toujours prévoir 10-15% de plus pour les retardataires ou les gros appétits surprise. Pour le brisket et le pulled pork, comptez la perte à la cuisson — une pièce de 4kg brut donne ~2.4kg cuit.
      </div>
    </div>
  )
}
