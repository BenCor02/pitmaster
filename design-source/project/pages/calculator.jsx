// Charbon & Flamme — Calculator (functional, with timer)

const CUTS = [
  { id:'picanha', name:'Picanha', cat:'Bœuf', img: RECIPE_IMAGES.picanha, basicTemp: 54, tempLabel:'Saignant', desc:'Pièce brésilienne, capeline grasse' },
  { id:'brisket', name:'Brisket', cat:'Bœuf', img: RECIPE_IMAGES.brisket, basicTemp: 95, tempLabel:'Effiloché', desc:'Poitrine de bœuf, low & slow obligé' },
  { id:'ribs', name:'Travers', cat:'Porc', img: RECIPE_IMAGES.ribs, basicTemp: 92, tempLabel:'Tendre', desc:'Spare ribs ou St Louis' },
  { id:'pulled', name:'Épaule porc', cat:'Porc', img: RECIPE_IMAGES.pulled, basicTemp: 95, tempLabel:'Effiloché', desc:'Pulled pork, fonte longue' },
  { id:'poulet', name:'Poulet entier', cat:'Volaille', img: RECIPE_IMAGES.poulet, basicTemp: 74, tempLabel:'À cœur', desc:'Volaille fermière 1.5 à 2kg' },
  { id:'boeuf', name:'Côte de bœuf', cat:'Bœuf', img: RECIPE_IMAGES.steak, basicTemp: 54, tempLabel:'Saignant', desc:'Tomahawk ou côte épaisse' },
  { id:'agneau', name:'Gigot d\'agneau', cat:'Agneau', img: RECIPE_IMAGES.steak, basicTemp: 60, tempLabel:'Rosé', desc:'Gigot entier ou semi-désossé' },
  { id:'saumon', name:'Saumon', cat:'Poisson', img: RECIPE_IMAGES.saumon, basicTemp: 52, tempLabel:'Nacré', desc:'Filet ou pavé' },
  { id:'legumes', name:'Légumes', cat:'Veggie', img: RECIPE_IMAGES.legumes, basicTemp: 0, tempLabel:'Marqués', desc:'Maïs, courges, poivrons' },
];

const METHODS = [
  { id:'low', name:'Low & Slow', subtitle:'95–135°C', factorMin: 240, prep: 30, repos: 0.18, ambient: 110, color:'#8B1A1A' },
  { id:'hot', name:'Hot & Fast', subtitle:'220–280°C', factorMin: 9, prep: 15, repos: 0.30, ambient: 250, color:'#C44A1F' },
  { id:'reverse', name:'Reverse Sear', subtitle:'110°C → 280°C', factorMin: 75, prep: 20, repos: 0.20, ambient: 110, color:'#E8A53C' },
];

function calculate(cutId, methodId, weightKg, doneness) {
  const cut = CUTS.find(c => c.id === cutId);
  const method = METHODS.find(m => m.id === methodId);
  const cookMin = Math.round(weightKg * method.factorMin * (cutId === 'saumon' || cutId === 'legumes' ? 0.4 : 1) * (1 + (doneness - 50) / 200));
  const reposMin = Math.max(8, Math.round(cookMin * method.repos));
  const totalMin = method.prep + cookMin + reposMin;
  const internalTemp = cut.basicTemp + Math.round((doneness - 50) / 4);
  return {
    cut, method, weightKg, doneness,
    prepMin: method.prep,
    cookMin, reposMin, totalMin,
    ambientTemp: method.ambient,
    internalTemp,
    phases: [
      { name:'Préchauffage', minutes: method.prep, temp: method.ambient, action:'Fais monter le grill, prépare la chambre' },
      { name:'Cuisson', minutes: cookMin, temp: method.ambient, action: methodId === 'reverse' ? 'Cuisson douce à 110°C jusqu\'à T° interne -10°C' : 'Surveille la sonde, retourne si nécessaire' },
      ...(methodId === 'reverse' ? [{ name:'Saisie', minutes: 4, temp: 280, action:'Feu vif 2 min par face, croûte épaisse' }] : []),
      { name:'Repos', minutes: reposMin, temp: 0, action:'Sous papier alu, libère les jus' },
    ],
  };
}

function formatTime(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min/60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2,'0')}`;
}

function StepDots({ current, total }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
      {Array.from({length: total}).map((_, i) => (
        <React.Fragment key={i}>
          <div style={{
            width: 28, height: 28,
            borderRadius:'50%',
            border: `1.5px solid ${i <= current ? '#8B1A1A' : 'rgba(31,26,20,0.2)'}`,
            background: i < current ? '#8B1A1A' : 'transparent',
            color: i < current ? '#F5EFE0' : (i === current ? '#8B1A1A' : '#968A7A'),
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--cf-serif)', fontSize: 13, fontWeight: 700,
          }}>{i < current ? '✓' : i + 1}</div>
          {i < total - 1 && <div style={{ width: 16, height: 1.5, background: i < current ? '#8B1A1A' : 'rgba(31,26,20,0.2)' }}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

function Timer({ totalSec, running, onToggle, onReset }) {
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    if (!running) return;
    const i = setInterval(() => setElapsed(e => Math.min(e + 1, totalSec)), 1000);
    return () => clearInterval(i);
  }, [running, totalSec]);
  React.useEffect(() => { setElapsed(0); }, [totalSec]);
  const remaining = Math.max(0, totalSec - elapsed);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const pct = totalSec > 0 ? (elapsed / totalSec) * 100 : 0;
  return (
    <div style={{
      background:'#14100B', color:'#F5EFE0',
      padding: 20,
      position:'relative', overflow:'hidden',
      border:'2px solid #8B1A1A',
    }}>
      <EmberGlow count={6}/>
      <div style={{ position:'relative' }}>
        <div className="cf-eyebrow" style={{ color:'#E8A53C', marginBottom: 8 }}>⏱ Timer pitmaster</div>
        <div className={running ? 'cf-flicker' : ''} style={{
          fontFamily:'var(--cf-serif)', fontSize: 56, fontWeight: 700, lineHeight: 1,
          color: running ? '#E8A53C' : '#F5EFE0',
          fontVariantNumeric:'tabular-nums',
          textShadow: running ? '0 0 20px rgba(232,165,60,0.5)' : 'none',
        }}>
          {h.toString().padStart(2,'0')}<span style={{ color:'#6E6356' }}>:</span>{m.toString().padStart(2,'0')}<span style={{ color:'#6E6356' }}>:</span>{s.toString().padStart(2,'0')}
        </div>
        <div style={{
          height: 4, background:'rgba(245,239,224,0.1)', marginTop: 12, position:'relative', overflow:'hidden',
        }}>
          <div style={{
            position:'absolute', left: 0, top: 0, bottom: 0,
            width: `${pct}%`,
            background:'linear-gradient(to right, #8B1A1A, #E8A53C)',
            transition:'width 1s linear',
          }}/>
        </div>
        <div style={{ display:'flex', gap: 8, marginTop: 16 }}>
          <FireButton size="sm" type={running ? 'cream' : 'primary'} onClick={onToggle} fullWidth>
            {running ? '❚❚ Pause' : '▶ Démarrer'}
          </FireButton>
          <FireButton size="sm" type="ghost" onClick={onReset} style={{ color:'#F5EFE0', borderColor:'rgba(245,239,224,0.3)' }}>↺</FireButton>
        </div>
      </div>
    </div>
  );
}

function CookTimeline({ result, mobile }) {
  const total = result.totalMin;
  return (
    <div style={{ position:'relative', padding: mobile ? '12px 0' : '20px 0' }}>
      {!mobile && (
        <div style={{ position:'relative', display:'flex', alignItems:'stretch', gap: 0, marginBottom: 16 }}>
          {result.phases.map((p, i) => (
            <div key={i} style={{
              flex: p.minutes / total,
              minWidth: 0,
              padding:'14px 12px',
              background: i % 2 === 0 ? '#1F1A14' : '#3A3025',
              color:'#F5EFE0',
              borderRight: i < result.phases.length - 1 ? '1px solid rgba(245,239,224,0.15)' : 'none',
              position:'relative',
            }}>
              <div className="cf-eyebrow" style={{ color:'#E8A53C', fontSize: 9 }}>Phase 0{i+1}</div>
              <div style={{ fontFamily:'var(--cf-serif)', fontSize: 18, fontWeight: 600, textTransform:'uppercase', marginTop: 4 }}>{p.name}</div>
              <div style={{ fontFamily:'var(--cf-mono)', fontSize: 11, color:'#D9CDB5', marginTop: 4 }}>{formatTime(p.minutes)} {p.temp > 0 && `· ${p.temp}°C`}</div>
            </div>
          ))}
        </div>
      )}
      {mobile && (
        <div style={{ display:'flex', flexDirection:'column', gap: 0 }}>
          {result.phases.map((p, i) => (
            <div key={i} style={{
              padding: 14,
              background: i % 2 === 0 ? '#1F1A14' : '#3A3025',
              color:'#F5EFE0',
              display:'flex', alignItems:'center', gap: 14,
              borderBottom: i < result.phases.length - 1 ? '1px solid rgba(245,239,224,0.1)' : 'none',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius:'50%',
                border:'1.5px solid #E8A53C', color:'#E8A53C',
                fontFamily:'var(--cf-serif)', fontWeight: 700, fontSize: 16,
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink: 0,
              }}>{i+1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily:'var(--cf-serif)', fontSize: 18, fontWeight: 600, textTransform:'uppercase' }}>{p.name}</div>
                <div style={{ fontFamily:'var(--cf-mono)', fontSize: 11, color:'#D9CDB5', marginTop: 2 }}>{formatTime(p.minutes)} {p.temp > 0 && `· ${p.temp}°C`}</div>
                <div style={{ fontSize: 12, color:'#B8AC97', marginTop: 4, lineHeight: 1.4 }}>{p.action}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!mobile && (
        <div style={{ display:'flex', gap: 0 }}>
          {result.phases.map((p, i) => (
            <div key={i} style={{ flex: p.minutes / total, padding:'12px 12px', borderRight: i < result.phases.length - 1 ? '1px solid rgba(31,26,20,0.1)' : 'none' }}>
              <div style={{ fontSize: 12, color:'#3A3025', lineHeight: 1.5 }}>{p.action}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CalculatorPage({ mobile }) {
  const [step, setStep] = React.useState(0); // 0 cut, 1 method, 2 params, 3 result
  const [cut, setCut] = React.useState('brisket');
  const [method, setMethod] = React.useState('low');
  const [weight, setWeight] = React.useState(2.5);
  const [doneness, setDoneness] = React.useState(50);
  const [running, setRunning] = React.useState(false);
  const [check, setCheck] = React.useState({});

  const result = calculate(cut, method, weight, doneness);
  const stepLabels = ['Choisir le cut', 'Méthode', 'Paramètres', 'Résultat'];

  const checklist = [
    'Sors la viande 1h avant — température ambiante',
    'Allume les braises 30 min avant',
    'Sonde calibrée et branchée',
    'Bac d\'eau dans le smoker',
    'Bois choisi : chêne, hickory, ou pommier',
    'Glaçage / mop sauce préparé si besoin',
  ];

  const PageHeader = (
    <div style={{ padding: mobile ? '24px 20px 16px' : '40px 64px 24px', maxWidth: 1280, margin:'0 auto' }}>
      <SectionEyebrow>Le calculateur</SectionEyebrow>
      <h1 style={{ fontSize: mobile ? 40 : 72, lineHeight: 0.95, textTransform:'uppercase', fontWeight: 700, marginTop: 12 }}>
        Calcule ta cuisson<br/>au <span style={{ color:'#8B1A1A', fontStyle:'italic' }}>degré près</span>.
      </h1>
      <div style={{ marginTop: mobile ? 20 : 32, display:'flex', alignItems:'center', justifyContent: mobile ? 'flex-start' : 'space-between', gap: 16, flexWrap:'wrap' }}>
        <StepDots current={step} total={4}/>
        <div className="cf-eyebrow" style={{ color:'#3A3025' }}>Étape {Math.min(step+1, 4)} / 4 — {stepLabels[Math.min(step, 3)]}</div>
      </div>
    </div>
  );

  // STEP 0: cut selection
  const StepCut = (
    <div style={{ padding: mobile ? '8px 20px 32px' : '16px 64px 64px', maxWidth: 1280, margin:'0 auto' }}>
      <div style={{ display:'grid', gridTemplateColumns: mobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: mobile ? 10 : 16 }}>
        {CUTS.map(c => (
          <button key={c.id} onClick={() => setCut(c.id)} style={{
            position:'relative',
            padding: 0,
            background:'#FAF6EE',
            border: cut === c.id ? '2.5px solid #8B1A1A' : '1.5px solid rgba(31,26,20,0.15)',
            cursor:'pointer',
            textAlign:'left',
            overflow:'hidden',
            transition:'all .15s',
            transform: cut === c.id ? 'translateY(-2px)' : 'none',
            boxShadow: cut === c.id ? '0 8px 20px rgba(139,26,26,0.18)' : 'none',
          }}>
            <div style={{
              aspectRatio:'5/3',
              backgroundImage:`url(${c.img})`,
              backgroundSize:'cover', backgroundPosition:'center',
              position:'relative',
            }}>
              {cut === c.id && (
                <div style={{ position:'absolute', top: 8, right: 8, background:'#8B1A1A', color:'#F5EFE0', width: 28, height: 28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight: 700, fontSize: 14 }}>✓</div>
              )}
              <div style={{ position:'absolute', top: 8, left: 8, fontFamily:'var(--cf-mono)', fontSize: 9, letterSpacing:'0.12em', textTransform:'uppercase', color:'#F5EFE0', background:'rgba(20,16,11,0.7)', padding:'3px 6px' }}>{c.cat}</div>
            </div>
            <div style={{ padding: mobile ? 10 : 14 }}>
              <div style={{ fontFamily:'var(--cf-serif)', fontSize: mobile ? 18 : 22, fontWeight: 600, textTransform:'uppercase', lineHeight: 1, color:'#1F1A14' }}>{c.name}</div>
              {!mobile && <div style={{ fontSize: 12, color:'#6E6356', marginTop: 4 }}>{c.desc}</div>}
            </div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 24, display:'flex', justifyContent:'flex-end' }}>
        <FireButton size="lg" onClick={() => setStep(1)} icon={<span>→</span>} fullWidth={mobile}>Méthode</FireButton>
      </div>
    </div>
  );

  // STEP 1: method
  const StepMethod = (
    <div style={{ padding: mobile ? '8px 20px 32px' : '16px 64px 64px', maxWidth: 1280, margin:'0 auto' }}>
      <div style={{ display:'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3,1fr)', gap: 16 }}>
        {METHODS.map(m => (
          <button key={m.id} onClick={() => setMethod(m.id)} style={{
            padding: 0,
            background: method === m.id ? '#1F1A14' : '#FAF6EE',
            color: method === m.id ? '#F5EFE0' : '#1F1A14',
            border: method === m.id ? `2.5px solid ${m.color}` : '1.5px solid rgba(31,26,20,0.15)',
            cursor:'pointer',
            textAlign:'left',
            overflow:'hidden',
            position:'relative',
            transition:'all .15s',
          }}>
            <div style={{ padding: 24, display:'flex', flexDirection:'column', alignItems:'flex-start', gap: 14 }}>
              <MethodBadge method={m.id} size={method === m.id ? 96 : 80}/>
              <div>
                <div className="cf-eyebrow" style={{ color: method === m.id ? '#E8A53C' : '#8B1A1A' }}>{m.subtitle}</div>
                <div style={{ fontFamily:'var(--cf-serif)', fontSize: 28, fontWeight: 700, textTransform:'uppercase', marginTop: 4 }}>{m.name}</div>
              </div>
            </div>
            {method === m.id && <EmberGlow count={6}/>}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 24, display:'flex', gap: 12, justifyContent:'space-between' }}>
        <FireButton size="md" type="ghost" onClick={() => setStep(0)}>← Cut</FireButton>
        <FireButton size="lg" onClick={() => setStep(2)} icon={<span>→</span>}>Paramètres</FireButton>
      </div>
    </div>
  );

  // STEP 2: params
  const StepParams = (
    <div style={{ padding: mobile ? '8px 20px 32px' : '16px 64px 64px', maxWidth: 900, margin:'0 auto' }}>
      <div style={{ background:'#FAF6EE', border:'1.5px solid rgba(31,26,20,0.15)', padding: mobile ? 20 : 32, display:'flex', flexDirection:'column', gap: 28 }}>
        <div>
          <div className="cf-eyebrow" style={{ marginBottom: 14 }}>Poids de la pièce</div>
          <div style={{ fontFamily:'var(--cf-serif)', fontSize: 56, fontWeight: 700, color:'#8B1A1A', lineHeight: 1 }}>
            {weight.toFixed(1)} <span style={{ fontSize: 24, color:'#1F1A14' }}>kg</span>
          </div>
          <input type="range" min="0.4" max="6" step="0.1" value={weight} onChange={e => setWeight(parseFloat(e.target.value))}
            style={{ width:'100%', accentColor:'#8B1A1A', marginTop: 14 }}/>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--cf-mono)', fontSize: 10, letterSpacing:'0.1em', color:'#6E6356', textTransform:'uppercase', marginTop: 4 }}>
            <span>400 g</span><span>3 kg</span><span>6 kg</span>
          </div>
        </div>
        <hr className="cf-divider"/>
        <div>
          <div className="cf-eyebrow" style={{ marginBottom: 14 }}>Cuisson désirée</div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <div style={{ fontFamily:'var(--cf-serif)', fontSize: 32, fontWeight: 600 }}>
              {doneness < 30 ? 'Bleu' : doneness < 45 ? 'Saignant' : doneness < 65 ? 'À point' : doneness < 85 ? 'Bien cuit' : 'Très cuit'}
            </div>
            <div style={{ fontFamily:'var(--cf-mono)', fontSize: 14, color:'#8B1A1A' }}>{result.internalTemp}°C à cœur</div>
          </div>
          <input type="range" min="0" max="100" step="5" value={doneness} onChange={e => setDoneness(parseFloat(e.target.value))}
            style={{ width:'100%', accentColor:'#8B1A1A', marginTop: 14 }}/>
        </div>
        <hr className="cf-divider"/>
        <div>
          <div className="cf-eyebrow" style={{ marginBottom: 14 }}>Paramètres avancés</div>
          <div style={{ display:'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 10 }}>
            {['Chêne','Hickory','Pommier','Mesquite'].map(w => (
              <Pill key={w}>{w}</Pill>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 24, display:'flex', gap: 12, justifyContent:'space-between' }}>
        <FireButton size="md" type="ghost" onClick={() => setStep(1)}>← Méthode</FireButton>
        <FireButton size="lg" onClick={() => setStep(3)} icon={<span>→</span>}>Calculer</FireButton>
      </div>
    </div>
  );

  // STEP 3: result
  const StepResult = (
    <div style={{ padding: mobile ? '8px 20px 48px' : '16px 64px 96px', maxWidth: 1280, margin:'0 auto' }}>
      {/* Hero result */}
      <div style={{ background:'#1F1A14', color:'#F5EFE0', padding: mobile ? 20 : 32, marginBottom: 20, position:'relative', overflow:'hidden', border:'2px solid #8B1A1A' }}>
        <SmokeBackdrop intensity={0.3} dark={true}/>
        <EmberGlow count={10}/>
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 16, flexWrap:'wrap' }}>
            <div className="cf-eyebrow" style={{ color:'#E8A53C' }}>Ton plan de cuisson</div>
            <div style={{ height: 1, flex: 1, background:'rgba(245,239,224,0.15)', minWidth: 40 }}/>
            <div style={{ fontFamily:'var(--cf-serif)', fontSize: 14, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.08em', color:'#B8AC97' }}>{result.cut.name} · {result.method.name} · {weight}kg</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: mobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: mobile ? 16 : 24 }}>
            <div>
              <div style={{ fontFamily:'var(--cf-serif)', fontSize: mobile ? 48 : 72, fontWeight: 700, lineHeight: 1, color:'#E8A53C' }}>{formatTime(result.totalMin)}</div>
              <div className="cf-eyebrow" style={{ color:'#B8AC97', marginTop: 6 }}>Durée totale</div>
            </div>
            <div>
              <div style={{ fontFamily:'var(--cf-serif)', fontSize: mobile ? 48 : 72, fontWeight: 700, lineHeight: 1, color:'#F5EFE0' }}>{result.ambientTemp}<span style={{ fontSize: mobile ? 22 : 32, color:'#B8AC97' }}>°C</span></div>
              <div className="cf-eyebrow" style={{ color:'#B8AC97', marginTop: 6 }}>Temp. chambre</div>
            </div>
            <div>
              <div style={{ fontFamily:'var(--cf-serif)', fontSize: mobile ? 48 : 72, fontWeight: 700, lineHeight: 1, color:'#F5EFE0' }}>{result.internalTemp}<span style={{ fontSize: mobile ? 22 : 32, color:'#B8AC97' }}>°C</span></div>
              <div className="cf-eyebrow" style={{ color:'#B8AC97', marginTop: 6 }}>À cœur</div>
            </div>
            <div>
              <div style={{ fontFamily:'var(--cf-serif)', fontSize: mobile ? 48 : 72, fontWeight: 700, lineHeight: 1, color:'#F5EFE0' }}>{Math.round(weight * 0.78 * 10) / 10}<span style={{ fontSize: mobile ? 22 : 32, color:'#B8AC97' }}>kg</span></div>
              <div className="cf-eyebrow" style={{ color:'#B8AC97', marginTop: 6 }}>Rendement estimé</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns: mobile ? '1fr' : '1.5fr 1fr', gap: 20 }}>
        {/* Timeline */}
        <div style={{ background:'#FAF6EE', border:'1.5px solid rgba(31,26,20,0.15)' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1.5px solid rgba(31,26,20,0.1)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div className="cf-eyebrow">Timeline pitmaster</div>
            <div style={{ fontFamily:'var(--cf-mono)', fontSize: 11, color:'#8B1A1A' }}>{result.phases.length} phases</div>
          </div>
          <CookTimeline result={result} mobile={mobile}/>
        </div>

        {/* Timer + Actions */}
        <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>
          <Timer
            totalSec={result.totalMin * 60}
            running={running}
            onToggle={() => setRunning(r => !r)}
            onReset={() => { setRunning(false); }}
          />
          <div style={{ background:'#FAF6EE', border:'1.5px solid rgba(31,26,20,0.15)', padding: 18 }}>
            <div className="cf-eyebrow" style={{ marginBottom: 12 }}>Checklist pitmaster</div>
            <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
              {checklist.map((c, i) => (
                <label key={i} style={{ display:'flex', alignItems:'flex-start', gap: 10, cursor:'pointer', fontSize: 13, lineHeight: 1.4 }}>
                  <input type="checkbox" checked={!!check[i]} onChange={e => setCheck({ ...check, [i]: e.target.checked })} style={{ accentColor:'#8B1A1A', marginTop: 2 }}/>
                  <span style={{ color: check[i] ? '#968A7A' : '#1F1A14', textDecoration: check[i] ? 'line-through' : 'none' }}>{c}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions row */}
      <div style={{ marginTop: 20, display:'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10 }}>
        <FireButton size="md" type="cream" icon="↓">PDF</FireButton>
        <FireButton size="md" type="cream" icon="♥">Sauver</FireButton>
        <FireButton size="md" type="cream" icon="↗">Partager</FireButton>
        <FireButton size="md" type="primary" onClick={() => setStep(0)} icon="↺">Refaire</FireButton>
      </div>
    </div>
  );

  return (
    <div className="cf-root cf-paper-bg" style={{ width:'100%', minHeight:'100%' }}>
      <Header mobile={mobile} dark={false} currentPage="calc"/>
      {PageHeader}
      {step === 0 && StepCut}
      {step === 1 && StepMethod}
      {step === 2 && StepParams}
      {step === 3 && StepResult}
      <Footer mobile={mobile}/>
    </div>
  );
}

Object.assign(window, { CalculatorPage, CUTS, METHODS, calculate });
