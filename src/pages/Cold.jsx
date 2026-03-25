import { useState } from 'react'
import { useSnack } from '../components/Snack'
import Snack from '../components/Snack'

const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fade-up{animation:fadeUp 0.22s ease both}
  .pm-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;padding:20px;margin-bottom:10px}
  .pm-input{background:#0e0c0a;border:1px solid #252018;border-radius:10px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:14px;padding:11px 14px;outline:none;transition:all 0.15s;width:100%}
  .pm-input:focus{border-color:#e85d04;box-shadow:0 0 0 3px rgba(232,93,4,0.07)}
  .pm-field-label{display:block;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8a7060;margin-bottom:8px;font-family:'DM Sans',sans-serif}
  .pm-sec-label{display:flex;align-items:center;gap:8px;margin-bottom:18px}
  .pm-sec-label span:first-child{color:#e85d04;font-size:14px}
  .pm-sec-label span:last-child{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8a7060;font-family:'DM Sans',sans-serif}
  .method-btn{flex:1;padding:11px;border-radius:10px;border:1px solid #1e1a14;background:#0e0c0a;color:#6a5a4a;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s}
  .method-btn.active{background:linear-gradient(135deg,rgba(232,93,4,0.15),rgba(244,140,6,0.08));border-color:rgba(232,93,4,0.35);color:#e85d04}
  .result-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #1e1a14;font-size:13px}
  .result-row:last-child{border-bottom:none}
  .result-val{font-family:'DM Mono',monospace;font-weight:700;color:#f48c06;font-size:14px}
  .step-item{display:flex;align-items:flex-start;gap:12px;padding:11px 0;border-bottom:1px solid #1e1a14}
  .step-item:last-child{border-bottom:none}
  .step-num{width:26px;height:26px;border-radius:7px;background:rgba(232,93,4,0.1);border:1px solid rgba(232,93,4,0.2);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:12px;font-weight:800;color:#e85d04;flex-shrink:0}
  .warning-box{background:rgba(232,93,4,0.05);border:1px solid rgba(232,93,4,0.15);border-radius:10px;padding:12px 14px;font-size:12px;color:#8a7060;line-height:1.6;display:flex;gap:10px}
  .info-box{background:rgba(244,140,6,0.05);border:1px solid rgba(244,140,6,0.15);border-radius:10px;padding:12px 14px;font-size:12px;color:#8a7060;line-height:1.6}
  select{-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238a7060' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:40px!important;cursor:pointer}
`

// ─── DONNÉES PAR PRODUIT ───
// Ratios basés sur méthode EQ (Equilibrium Curing) — standard pro international
// Sources : eatcuredmeat.com, America's Test Kitchen, Smoking Meat Forums
const PRODUCTS = {
  salmon: {
    name: 'Saumon / Truite',
    icon: '🐟',
    ssv: {
      desc: 'Méthode EQ (Equilibrium Curing). 2.5% sel — sel sequilibre dans la chair, impossible de sur-saler. Résultat homogène garanti.',
      saltPct: 2.5,   // Nova lox standard — gastrochemist + eatcuredmeat
      sugarPct: 1.5,  // Cassonade de préférence
      timePerCm: 12,  // 12h par cm d'épaisseur
      minTime: 12,
      maxTime: 48,
      rinse: true,
      dry: true,
      dryTime: 2,
    },
    saltage: {
      desc: 'Saumure sèche traditionnelle (gravlax scandinave). 4.5% sel — méthode rapide, rincer obligatoirement.',
      saltRatio: 0.045,   // 4.5% méthode traditionnelle — plus rapide que EQ
      sugarRatio: 0.025,  // 2.5% sucre
      timePerCm: 6,       // 6h par cm — bien moins que EQ
      minTime: 6,
      maxTime: 18,        // max 18h sinon trop salé
      rinse: true,
      dry: true,
      dryTime: 2,
    },
    spices: [
      { name: 'Poivre blanc entier (toasté puis moulu)', pct: 0.3, unit: 'g/kg', note: 'Toaster à sec 3-5 min avant de moudre' },
      { name: 'Coriandre entière (toastée puis moulue)', pct: 0.2, unit: 'g/kg', note: 'Duo classique pro — Northern Waters Smokehaus' },
      { name: 'Aneth frais', pct: null, unit: 'genereux', note: 'Sur toute la surface côté chair' },
      { name: 'Piment de Jamaïque (allspice)', pct: 0.1, unit: 'g/kg', note: 'Optionnel — touch nordique' },
      { name: 'Zeste de citron', pct: null, unit: '1 citron/kg', note: 'Optionnel — apporte fraîcheur' },
    ],
    woods: ['Aulne', 'Hêtre', 'Cerisier', 'Érable'],
    smokeTemp: '< 18°C',
    smokeTime: '8 à 14h',
    tips: [
      'Pellicule obligatoire avant fumage — 12h à découvert au frigo',
      'Toaster les épices entières à sec avant de moudre (3-5 min)',
      'Trancher finement à 45° contre le grain — couteau à saumon',
      'Conservation : 1 semaine frigo sous vide / 3 mois congélateur',
    ],
  },
  pork_belly: {
    name: 'Poitrine de porc (Bacon)',
    icon: '🥓',
    ssv: {
      desc: 'Méthode EQ standard. 2.25% sel + 1% sucre. Ratio sucre/sel max 50% selon les pros.',
      saltPct: 2.25,  // eatcuredmeat.com bacon calculator standard
      sugarPct: 1.0,  // "ratio 2:1 sel/sucre — 1:1 trop sucré" — eatcuredmeat
      timePerCm: 24,  // 1 jour par 6mm = 4 jours par cm
      minTime: 96,    // 4 jours minimum recommandé
      maxTime: 168,   // 7 jours max
      rinse: true,
      dry: true,
      dryTime: 4,
    },
    saltage: {
      desc: 'Saumure sèche classique charcuterie. 4% sel — méthode traditionnelle, rincer soigneusement après.',
      saltRatio: 0.04,    // 4% méthode traditionnelle bacon
      sugarRatio: 0.015,  // 1.5% sucre
      timePerCm: 18,
      minTime: 72,
      maxTime: 120,
      rinse: true,
      dry: true,
      dryTime: 3,
    },
    spices: [
      { name: 'Poivre noir concassé', pct: 0.5, unit: 'g/kg', note: 'Classique bacon américain — appuyer sur la chair' },
      { name: 'Ail en poudre', pct: 0.2, unit: 'g/kg', note: 'Optionnel — apporte profondeur' },
      { name: 'Paprika fumé', pct: 0.3, unit: 'g/kg', note: 'Optionnel — renforce le côté fumé' },
      { name: 'Piment de Cayenne', pct: 0.05, unit: 'g/kg', note: 'Optionnel — pour un bacon épicé' },
      { name: 'Thym séché', pct: 0.15, unit: 'g/kg', note: 'Optionnel — style bacon artisanal français' },
    ],
    woods: ['Hêtre', 'Érable', 'Pommier', 'Chêne'],
    smokeTemp: '< 20°C',
    smokeTime: '6 à 12h',
    tips: [
      'Sel kosher ou gros sel non iodé uniquement — sel iodé altère la couleur',
      '10-14 jours de cure recommandés pour développement des arômes',
      'Congeler 1-2h avant de trancher finement à la trancheuse',
      'Conservation : 2 semaines frigo sous vide / 6 mois congélateur',
    ],
  },
  ham: {
    name: 'Jambon / Épaule',
    icon: '🍖',
    ssv: {
      desc: 'Règle 4-2-1 : 4% sel + 2% sucre + 1% epices du poids. Standard pro sous vide.',
      saltPct: 4.0,
      sugarPct: 2.0,
      spicePct: 1.0,
      timePerCm: 48,
      minTime: 96,
      maxTime: 336,
      rinse: true,
      dry: true,
      dryTime: 6,
    },
    saltage: {
      desc: 'Saumure sèche traditionnelle. 5% sel — méthode classique charcuterie française.',
      saltRatio: 0.05,    // 5% jambon traditionnel
      sugarRatio: 0.01,
      timePerCm: 36,
      minTime: 72,
      maxTime: 240,
      rinse: true,
      dry: true,
      dryTime: 4,
    },
    spices: [
      { name: 'Poivre noir grossièrement concassé', pct: 0.4, unit: 'g/kg', note: 'Frotter sur toute la surface' },
      { name: 'Baies de genièvre écrasées', pct: 0.2, unit: 'g/kg', note: 'Classique jambon fumé alsacien' },
      { name: 'Laurier moulu', pct: 0.1, unit: 'g/kg', note: 'Ou 2-3 feuilles entières sur la pièce' },
      { name: 'Ail en poudre', pct: 0.2, unit: 'g/kg', note: 'Optionnel' },
      { name: 'Muscade râpée', pct: 0.05, unit: 'g/kg', note: 'Petite touche — typique charcuterie française' },
    ],
    woods: ['Hêtre', 'Chêne', 'Pommier'],
    smokeTemp: '< 22°C',
    smokeTime: '12 à 24h',
    tips: [
      'Injection possible pour pièces > 5kg — accélère la pénétration',
      'Dessalage obligatoire : 2-4h en eau froide, changer l eau 2x',
      'Repos minimum 24h au frigo avant fumage',
      'Le sel kosher donne un meilleur résultat que le sel fin',
    ],
  },
  cheese: {
    name: 'Fromages',
    icon: '🧀',
    ssv: null,
    saltage: {
      desc: 'Aucun saumurage — fumage direct. Sortir 1h avant pour surface sèche.',
      saltRatio: 0,
      sugarRatio: 0,
      timePerCm: 0,
      minTime: 0,
      maxTime: 0,
      rinse: false,
      dry: false,
      dryTime: 1,
    },
    spices: [
      { name: 'Poivre noir concassé', pct: null, unit: 'au goût', note: 'Optionnel — à appliquer après fumage' },
      { name: 'Herbes de Provence', pct: null, unit: 'au goût', note: 'Optionnel — pour fromages frais' },
    ],
    woods: ['Pommier', 'Érable', 'Hêtre', 'Cerisier'],
    smokeTemp: '< 15°C !!!',
    smokeTime: '1 à 4h selon intensité',
    tips: [
      'Repos 48h au frigo OBLIGATOIRE — sorti direct = goût agressif',
      'Gouda, cheddar, mozzarella séchée, comté — idéaux',
      'Bac de glaçons sous la grille en été',
      'Ne pas dépasser 4h — le fromage absorbe rapidement',
    ],
  },
  salt: {
    name: 'Sel & épices fumés',
    icon: '🧂',
    ssv: null,
    saltage: null,
    spices: [
      { name: 'Paprika doux ou fumé', pct: null, unit: 'mélanger au sel', note: 'Ratio 70% sel / 30% paprika pour sel papriké' },
      { name: 'Ail en poudre', pct: null, unit: 'mélanger au sel', note: 'Ratio 80/20 pour sel à l ail' },
      { name: 'Poivre noir moulu', pct: null, unit: 'mélanger au sel', note: 'Ou fumer directement les grains entiers' },
      { name: 'Cumin moulu', pct: null, unit: 'mélanger', note: 'Pour sel BBQ rub base' },
    ],
    woods: ['Cerisier', 'Hickory', 'Érable'],
    smokeTemp: '< 30°C',
    smokeTime: '2 à 4h',
    tips: [
      'Couche fine 5mm max — remuer toutes les heures',
      'Fleur de sel = résultat premium / Gros sel gris = économique',
      'Bocal hermétique — se conserve 6 mois',
      'Base parfaite pour rubs BBQ maison',
    ],
    noSaltage: true,
  },
  butter: {
    name: 'Beurre fumé',
    icon: '🧈',
    ssv: null,
    saltage: null,
    spices: [
      { name: 'Fleur de sel', pct: null, unit: 'pincée', note: 'Incorporer après fumage — beurre composé' },
      { name: 'Herbes fraîches (thym, romarin)', pct: null, unit: 'au goût', note: 'Pour beurre composé aux herbes' },
      { name: 'Ail rôti écrasé', pct: null, unit: 'au goût', note: 'Classique — rouler en boudin et congeler' },
    ],
    woods: ['Pommier', 'Érable'],
    smokeTemp: '< 10°C !!!',
    smokeTime: '1 à 2h',
    tips: [
      'T° CRITIQUE — fond à 32°C. Uniquement en hiver ou avec beaucoup de glace',
      'Bac de glaçons renouvelé toutes les 30 min',
      'Rouler en boudin dans film alimentaire — congeler — trancher à la demande',
      'Exceptionnel sur steak au repos, légumes grillés, sauces',
    ],
    noSaltage: true,
  },
}

function formatTime(hours) {
  if (hours < 24) return `${hours}h`
  const d = Math.floor(hours / 24), h = hours % 24
  return h === 0 ? `${d} jour${d > 1 ? 's' : ''}` : `${d}j ${h}h`
}

export default function Cold() {
  const { snack, showSnack } = useSnack()
  const [product, setProduct] = useState('salmon')
  const [method, setMethod] = useState('ssv')
  const [weight, setWeight] = useState(1.0)
  const [thickness, setThickness] = useState(3)
  const [result, setResult] = useState(null)
  const [endTime, setEndTime] = useState('08:00')
  const [intensity, setIntensity] = useState('medium')

  const prod = PRODUCTS[product]
  const hasSSV = !!prod.ssv
  const hasSaltage = !!prod.saltage && !prod.noSaltage
  const noSaltage = prod.noSaltage

  function calculate() {
    const p = PRODUCTS[product]
    const smokeHours = { light: 6, medium: 10, strong: 14 }[intensity]

    if (noSaltage) {
      // Pas de saumurage
      const totalH = p.name === 'Beurre fumé' ? 2 : p.name === 'Sel & épices fumés' ? 3 : smokeHours
      const today = new Date()
      const [eh, em] = endTime.split(':').map(Number)
      const end = new Date(today); end.setHours(eh, em, 0, 0)
      if (end < today) end.setDate(end.getDate() + 1)
      const start = new Date(end.getTime() - totalH * 3600000)
      setResult({
        method: 'direct',
        smokeH: totalH,
        totalH,
        startSmoke: start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        endStr: endTime,
        saltG: 0, sugarG: 0,
        saltageH: 0, rinseH: 0, dryH: 0,
      })
      return
    }

    const m = method === 'ssv' ? p.ssv : p.saltage
    if (!m) return

    // Calcul sel/sucre
    let saltG = 0, sugarG = 0, spiceG = 0
    if (method === 'ssv') {
      saltG = Math.round(weight * 1000 * m.saltPct / 100)
      sugarG = Math.round(weight * 1000 * m.sugarPct / 100)
      spiceG = m.spicePct ? Math.round(weight * 1000 * m.spicePct / 100) : 0
    } else {
      saltG = Math.round(weight * 1000 * m.saltRatio)
      sugarG = Math.round(weight * 1000 * m.sugarRatio)
    }

    // Calcul durée saumurage
    let saltageH = Math.round(thickness * m.timePerCm)
    saltageH = Math.max(m.minTime, Math.min(m.maxTime, saltageH))

    const rinseH = m.rinse ? 1 : 0
    const dryH = m.dry ? m.dryTime : 0
    const totalH = saltageH + rinseH + dryH + smokeHours

    // Calcul heures
    const today = new Date()
    const [eh, em] = endTime.split(':').map(Number)
    const end = new Date(today); end.setHours(eh, em, 0, 0)
    if (end < today) end.setDate(end.getDate() + 1)

    const startDate = new Date(end.getTime() - totalH * 3600000)
    const afterSaltage = new Date(startDate.getTime() + saltageH * 3600000)
    const afterRinse = new Date(afterSaltage.getTime() + rinseH * 3600000)
    const afterDry = new Date(afterRinse.getTime() + dryH * 3600000)
    const endSmoke = new Date(afterDry.getTime() + smokeHours * 3600000)

    const ftt = d => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

    setResult({
      method,
      saltG, sugarG, spiceG,
      saltageH, rinseH, dryH, smokeH: smokeHours, totalH,
      startStr: ftt(startDate),
      afterSaltageStr: ftt(afterSaltage),
      afterRinseStr: ftt(afterRinse),
      afterDryStr: ftt(afterDry),
      endStr: endTime,
      steps: [
        m.minTime > 0 && { n: 1, title: method === 'ssv' ? 'Mise sous vide avec le sel' : 'Application saumure sèche', desc: `Applique ${saltG}g de sel + ${sugarG}g de sucre. ${method === 'ssv' ? 'Scelle sous vide hermétiquement.' : 'Masse bien dans la chair.'} Frigo.`, time: ftt(startDate), duration: formatTime(saltageH) },
        m.rinse && { n: 2, title: 'Rinçage', desc: 'Rincer abondamment sous eau froide. Éliminer tout le sel de surface.', time: ftt(afterSaltage), duration: '15-30 min' },
        m.dry && { n: m.rinse ? 3 : 2, title: 'Séchage', desc: `Sécher au papier absorbant. Poser sur grille au frigo ${dryH}h à découvert. La pellicule se forme — essentielle pour la prise de fumée.`, time: ftt(afterRinse), duration: formatTime(dryH) },
        { n: (m.rinse ? 1 : 0) + (m.dry ? 1 : 0) + 2, title: 'Mise en fumoir', desc: `Fumoir < ${p.smokeTemp}. Générateur de fumée froide. Bois : ${p.woods.slice(0, 2).join(' ou ')}.`, time: ftt(afterDry), duration: formatTime(smokeHours) },
        { n: (m.rinse ? 1 : 0) + (m.dry ? 1 : 0) + 3, title: '✅ Prêt', desc: 'Retirer du fumoir. Repos au frigo avant dégustation.', time: endTime, duration: '' },
      ].filter(Boolean),
    })

    setTimeout(() => document.getElementById('cold-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  return (
    <div style={{ fontFamily: 'DM Sans,sans-serif' }}>
      <style>{css}</style>
      <Snack snack={snack} />

      {/* TITRE */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '-0.5px' }}>
          Fumage <span style={{ color: '#e85d04' }}>à froid</span>
        </h1>
        <p style={{ fontSize: 11, color: '#8a7060', marginTop: 6, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
          Calculateur salage · SSV · Fumage froid
        </p>
      </div>

      {/* AVERTISSEMENT */}
      <div className="warning-box" style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>❄️</span>
        <span>Le fumage à froid <strong style={{ color: '#f48c06' }}>ne cuit pas</strong>. La température doit rester <strong style={{ color: '#f48c06' }}>sous 25°C</strong> (sous 20°C pour les fromages, sous 15°C pour le beurre). Nécessite un générateur de fumée froide.</span>
      </div>

      {/* PRODUIT */}
      <div className="pm-sec-label"><span>🎯</span><span>Produit à fumer</span></div>
      <div className="pm-card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {Object.entries(PRODUCTS).map(([k, p]) => (
            <button key={k} onClick={() => { setProduct(k); setResult(null); setMethod(PRODUCTS[k].ssv ? 'ssv' : 'direct') }}
              style={{
                padding: '10px 8px', borderRadius: 10, border: `1px solid ${product === k ? 'rgba(232,93,4,0.35)' : '#1e1a14'}`,
                background: product === k ? 'rgba(232,93,4,0.1)' : '#0e0c0a',
                cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
              }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{p.icon}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, fontWeight: 700, color: product === k ? '#e85d04' : '#6a5a4a', lineHeight: 1.2 }}>{p.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* MÉTHODE */}
      {!noSaltage && (
        <>
          <div className="pm-sec-label"><span>⚗️</span><span>Méthode de salage</span></div>
          <div className="pm-card">
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {hasSSV && (
                <button className={`method-btn${method === 'ssv' ? ' active' : ''}`} onClick={() => { setMethod('ssv'); setResult(null) }}>
                  🔬 SSV (Sous-Sel-Vide)
                </button>
              )}
              {hasSaltage && (
                <button className={`method-btn${method === 'saltage' ? ' active' : ''}`} onClick={() => { setMethod('saltage'); setResult(null) }}>
                  🧂 Saumure sèche
                </button>
              )}
            </div>
            <div className="info-box">
              <strong style={{ color: method === 'ssv' ? '#e85d04' : '#f48c06', fontFamily: 'Syne,sans-serif', fontSize: 12 }}>
                {method === 'ssv' ? '🔬 Sous-Sel-Vide (SSV)' : '🧂 Saumure sèche'}
              </strong>
              <div style={{ marginTop: 4, fontSize: 12 }}>
                {method === 'ssv' && prod.ssv ? prod.ssv.desc : prod.saltage ? prod.saltage.desc : ''}
              </div>
            </div>
          </div>
        </>
      )}

      {/* PARAMÈTRES */}
      <div className="pm-sec-label"><span>⚙️</span><span>Paramètres</span></div>
      <div className="pm-card">
        {!noSaltage && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label className="pm-field-label">Poids (kg)</label>
              <input className="pm-input" type="number" value={weight} min="0.1" max="20" step="0.1"
                onChange={e => { setWeight(parseFloat(e.target.value) || 0.1); setResult(null) }} />
            </div>
            <div>
              <label className="pm-field-label">Épaisseur (cm)</label>
              <input className="pm-input" type="number" value={thickness} min="0.5" max="20" step="0.5"
                onChange={e => { setThickness(parseFloat(e.target.value) || 1); setResult(null) }} />
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label className="pm-field-label">Prêt pour</label>
            <input className="pm-input" type="time" value={endTime} onChange={e => { setEndTime(e.target.value); setResult(null) }} />
          </div>
          <div>
            <label className="pm-field-label">Intensité fumée</label>
            <select className="pm-input" value={intensity} onChange={e => { setIntensity(e.target.value); setResult(null) }}>
              <option value="light" style={{ background: '#171410' }}>🌿 Légère</option>
              <option value="medium" style={{ background: '#171410' }}>🌲 Moyenne</option>
              <option value="strong" style={{ background: '#171410' }}>💪 Intense</option>
            </select>
          </div>
        </div>

        <button onClick={calculate} style={{
          width: '100%', padding: '13px', border: 'none', borderRadius: 12,
          fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '0.5px',
          cursor: 'pointer', color: '#fff',
          background: 'linear-gradient(135deg,#f48c06,#d44e00)',
          boxShadow: '0 4px 16px rgba(232,93,4,0.25)',
        }}>
          ❄️ Calculer le planning
        </button>
      </div>

      {/* RÉSULTATS */}
      {result && (
        <div id="cold-result" className="fade-up">
          <div className="pm-sec-label"><span>📊</span><span>Planning fumage à froid</span></div>

          {/* HERO */}
          {result.saltG > 0 && (
            <div style={{ background: 'linear-gradient(160deg,#0e1018,#171410)', border: '1px solid rgba(100,180,255,0.15)', borderRadius: 16, padding: '20px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(100,180,255,0.4),transparent)' }} />
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#4a5a6a', marginBottom: 12, fontFamily: 'DM Sans,sans-serif' }}>
                Quantités de salage pour {weight}kg
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#0e0c0a', border: '1px solid #1e1a14', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 32, color: '#64b4ff', lineHeight: 1 }}>{result.saltG}g</div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#3a4a5a', marginTop: 4 }}>Sel non iodé</div>
                </div>
                <div style={{ background: '#0e0c0a', border: '1px solid #1e1a14', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 32, color: '#f48c06', lineHeight: 1 }}>{result.sugarG}g</div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#3a4a5a', marginTop: 4 }}>Sucre / Cassonade</div>
                </div>
              </div>
              {result.spiceG > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginTop: 10 }}>
                  <div style={{ background: '#0e0c0a', border: '1px solid rgba(232,93,4,0.2)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: '#e85d04', lineHeight: 1 }}>{result.spiceG}g</div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#3a4a5a', marginTop: 4 }}>Épices total (1%)</div>
                    <div style={{ fontSize: 11, color: '#4a3a2e', marginTop: 4, fontStyle: 'italic' }}>Poivre · Herbes · Ail · selon recette</div>
                  </div>
                </div>
              )}
              {method === 'ssv' && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#4a6a8a', fontStyle: 'italic', textAlign: 'center' }}>
                  Peser précisément · Mélanger · Sous vide hermétique
                </div>
              )}
            </div>
          )}

          {/* HERO TIMING */}
          <div style={{ background: 'linear-gradient(160deg,#1e1208,#171410)', border: '1px solid rgba(232,93,4,0.2)', borderRadius: 16, padding: '20px 20px', textAlign: 'center', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% -20%,rgba(232,93,4,0.07),transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#4a3a2e', marginBottom: 8 }}>
              {result.saltageH > 0 ? 'Commence le salage à' : 'Mets en fumoir à'}
            </div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 68, fontWeight: 800, lineHeight: 1, color: '#e85d04', letterSpacing: '-2px', textShadow: '0 0 40px rgba(232,93,4,0.3)' }}>
              {result.startStr || result.afterDryStr}
            </div>
            <div style={{ fontSize: 12, color: '#6a5a4a', marginTop: 8 }}>
              Durée totale : {formatTime(result.totalH)} · Prêt à {result.endStr}
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
              {result.saltageH > 0 && <span style={{ background: '#0e0c0a', border: '1px solid #1e1a14', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontFamily: 'DM Mono,monospace', color: '#6a5a4a' }}>🧂 {formatTime(result.saltageH)} salage</span>}
              <span style={{ background: 'rgba(232,93,4,0.08)', border: '1px solid rgba(232,93,4,0.2)', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontFamily: 'DM Mono,monospace', color: '#e85d04' }}>❄️ {formatTime(result.smokeH)} fumée</span>
              <span style={{ background: '#0e0c0a', border: '1px solid #1e1a14', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontFamily: 'DM Mono,monospace', color: '#6a5a4a' }}>{prod.smokeTemp}</span>
            </div>
          </div>

          {/* ÉTAPES */}
          {result.steps && result.steps.length > 0 && (
            <div className="pm-card" style={{ marginBottom: 10 }}>
              <div className="pm-sec-label"><span>📋</span><span>Étapes détaillées</span></div>
              {result.steps.map((step, i) => (
                <div key={i} className="step-item">
                  <div className="step-num">{step.n}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, color: '#d4c4b0' }}>{step.title}</div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 12, color: '#e85d04', fontWeight: 700 }}>{step.time}</div>
                        {step.duration && <div style={{ fontSize: 10, color: '#4a3a2e', marginTop: 1 }}>{step.duration}</div>}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#6a5a4a', marginTop: 4, lineHeight: 1.5 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ÉPICES */}
          {prod.spices && prod.spices.length > 0 && (
            <div className="pm-card" style={{ marginBottom: 10 }}>
              <div className="pm-sec-label"><span>🌶️</span><span>Épices & aromates</span></div>
              <div style={{ marginBottom: 10, padding: '10px 12px', background: 'rgba(244,140,6,0.05)', border: '1px solid rgba(244,140,6,0.12)', borderRadius: 8, fontSize: 12, color: '#8a7060' }}>
                💡 Quantités calculées pour <strong style={{ color: '#f48c06' }}>{weight}kg</strong> — peser précisément pour un résultat optimal
              </div>
              {prod.spices.map((sp, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: i < prod.spices.length - 1 ? '1px solid #1e1a14' : 'none', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: 13, color: '#c4b4a0' }}>{sp.name}</div>
                    <div style={{ fontSize: 11, color: '#6a5a4a', marginTop: 2 }}>{sp.note}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {sp.pct ? (
                      <>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontWeight: 700, fontSize: 14, color: '#f48c06' }}>
                          {Math.round(weight * 1000 * sp.pct / 100)}g
                        </div>
                        <div style={{ fontSize: 10, color: '#4a3a2e', marginTop: 1 }}>{sp.pct}% du poids</div>
                      </>
                    ) : (
                      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 12, color: '#6a5a4a', fontStyle: 'italic' }}>{sp.unit}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BOIS */}
          <div className="pm-card" style={{ marginBottom: 10 }}>
            <div className="pm-sec-label"><span>🪵</span><span>Bois recommandés</span></div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {prod.woods.map((w, i) => (
                <span key={i} style={{ background: i === 0 ? 'rgba(232,93,4,0.1)' : '#0e0c0a', border: `1px solid ${i === 0 ? 'rgba(232,93,4,0.3)' : '#1e1a14'}`, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: i === 0 ? '#e85d04' : '#6a5a4a', fontFamily: 'Syne,sans-serif' }}>
                  {i === 0 ? '⭐ ' : ''}{w}
                </span>
              ))}
            </div>
          </div>

          {/* CONSEILS */}
          <div className="pm-card">
            <div className="pm-sec-label"><span>💡</span><span>Conseils essentiels</span></div>
            {prod.tips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < prod.tips.length - 1 ? '1px solid #1e1a14' : 'none' }}>
                <span style={{ color: '#e85d04', flexShrink: 0, fontSize: 13 }}>→</span>
                <span style={{ fontSize: 13, color: '#8a7060', lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}