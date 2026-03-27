import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { HERO_IMAGE, MEAT_IMAGES } from '../lib/images'

const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes flicker{0%,100%{opacity:1}45%{opacity:0.85}50%{opacity:0.95}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
  @keyframes smoke{0%{transform:translateY(0) scaleX(1);opacity:0.5}100%{transform:translateY(-70px) scaleX(2);opacity:0}}
  .fu{animation:fadeUp 0.55s ease both}
  .fu1{animation-delay:0.08s}
  .fu2{animation-delay:0.18s}
  .fu3{animation-delay:0.3s}
  .fu4{animation-delay:0.42s}
  .hcard{transition:border-color 0.2s,transform 0.2s}
  .hcard:hover{transform:translateY(-2px);border-color:rgba(232,93,4,0.3)!important}
  .hmeat{transition:transform 0.2s,border-color 0.2s}
  .hmeat:hover{transform:scale(1.03);border-color:rgba(232,93,4,0.4)!important}
  .hbtn{transition:opacity 0.15s,transform 0.15s}
  .hbtn:hover{opacity:0.9;transform:translateY(-1px)}
  *{box-sizing:border-box}
`

const PAINS = [
  { icon:'⏰', text:'Tu ne sais jamais vraiment à quelle heure lancer la cuisson.' },
  { icon:'🤷', text:"Le stall te surprend à chaque fois — et tu peux pas t'y préparer." },
  { icon:'😰', text:"Tes invités arrivent, la viande n'est pas prête. Encore." },
  { icon:'📱', text:'Tu jonglles entre 3 apps, des notes, et tes souvenirs de la dernière fois.' },
]

const FEATURES = [
  { icon:'🧮', title:'Calculateur BBQ gratuit',     badge:'Utilisable tout de suite', desc:"Entre ton heure de service. Charbon & Flamme te dit quand démarrer, quelle marge garder et à quel moment surveiller les étapes clés." },
  { icon:'📡', title:'Session de cuisson guidée',   badge:'Temps réel',            desc:"Valide les checkpoints au vrai moment de ta cuisson — pit stable, stall, wrap, test de tendreté ou flex test pour les ribs. L'ETA se recalcule à chaque étape." },
  { icon:'🎯', title:'Fenêtre de service claire',   badge:'Anti-stress',           desc:"L'outil ne te donne pas une heure magique. Il te donne une fenêtre crédible avec repos et marge de sécurité déjà intégrés." },
  { icon:'🔥', title:'Vocabulaire pitmaster expliqué', badge:'Débutant friendly',  desc:"Bark, stall, wrap, probe tender, hold: les bons mots sont là, mais toujours traduits en langage simple et utile." },
  { icon:'🍖', title:'Flow adapté selon la viande', badge:'Terrain réel',          desc:"Brisket, pulled pork, chuck, beef ribs ou pork ribs: les étapes et les conseils changent selon la logique réelle de la cuisson." },
  { icon:'📤', title:'Pensé pour être partagé',     badge:'Acquisition',           desc:"Lance un planning, partage-le facilement et reviens pendant la cuisson pour recalculer sans friction ni compte obligatoire." },
]

const STEPS = [
  { num:'01', title:"Tu entres ton heure de service",  desc:"Tu dis simplement quand tu veux servir. L'outil calcule l'heure de départ recommandée." },
  { num:'02', title:"Le planning se construit",        desc:"Température fumoir, marge, repos et étapes clés sont assemblés dans un plan simple à suivre." },
  { num:'03', title:"Tu valides ce qui arrive vraiment", desc:"Pendant la cuisson, tu confirmes les checkpoints réels. L'ETA se recalcule selon ce qui se passe sur ton fumoir." },
  { num:'04', title:"Tu sers plus sereinement",        desc:"La viande est prête dans une vraie fenêtre de service, avec le bon moment pour tester, retirer et laisser reposer." },
]

const FOR_WHO = [
  { icon:'🏡', who:'Backyard pitmasters',       desc:"Tu cuisines le weekend, tu veux bien faire, tu n'as pas le temps de tout calculer à la main." },
  { icon:'🏆', who:'Compétiteurs BBQ',           desc:"Tu as besoin d'une heure de service précise, d'une fenêtre sécurisée, et d'un historique de tes cooks." },
  { icon:'🍽️', who:'Restaurateurs & traiteurs', desc:"Tu prépares pour du monde, tu ne peux pas te permettre d'être en retard." },
  { icon:'🔥', who:'Passionnés qui progressent', desc:"Tu veux comprendre pourquoi le stall dure 4h, pourquoi le butcher paper change tout." },
]

const MEATS_LIST = [
  { key:'brisket',        label:'Brisket',       time:'10-13h' },
  { key:'pork_shoulder',  label:'Pulled Pork',   time:'8-12h'  },
  { key:'ribs_pork',      label:'Spare Ribs',    time:'5-6h'   },
  { key:'ribs_beef',      label:'Beef Ribs',     time:'7-9h'   },
  { key:'ribs_baby_back', label:'Baby Back',     time:'4-5h'   },
  { key:'paleron',        label:'Paleron',       time:'8-11h'  },
  { key:'plat_de_cote',   label:'Plat de Côte',  time:'9-12h'  },
  { key:'lamb_shoulder',  label:'Épaule Agneau', time:'6-8h'   },
]

const Badge = ({ label }) => (
  <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, background:'rgba(232,93,4,0.07)', border:'1px solid rgba(232,93,4,0.15)', fontSize:10, fontWeight:700, color:'#e85d04', fontFamily:"'Syne',sans-serif", letterSpacing:'0.5px', whiteSpace:'nowrap' }}>
    {label}
  </span>
)

export default function Landing() {
  const navigate  = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive:true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  // PATCH: acquisition first — l'utilisateur doit pouvoir utiliser l'outil immédiatement
  const go = () => navigate('/app')

  return (
    <div style={{ background:'radial-gradient(circle at top, rgba(255,123,50,0.10), transparent 22%), linear-gradient(180deg,#110d09 0%, #090705 100%)', fontFamily:"'DM Sans',sans-serif", overflowX:'hidden', color:'var(--text2)' }}>
      <style>{css}</style>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav style={{ height:64, position:'sticky', top:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', background:scrolled?'rgba(10,7,5,0.84)':'transparent', borderBottom:scrolled?'1px solid rgba(255,255,255,0.07)':'1px solid transparent', backdropFilter:scrolled?'blur(18px)':'none', transition:'all 0.3s' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, background:'linear-gradient(135deg,var(--orange-light),var(--orange-deep))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          🔥 Charbon &amp; Flamme
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={() => navigate('/auth')} style={{ padding:'9px 16px', borderRadius:999, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', color:'var(--text2)', fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer' }}>Connexion</button>
          <button onClick={go} className="hbtn" style={{ padding:'10px 18px', borderRadius:999, border:'none', background:'linear-gradient(135deg,var(--orange-light),var(--orange-deep))', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer', boxShadow:'0 12px 24px rgba(216,90,27,0.24)' }}>Ouvrir l’outil</button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div style={{ position:'relative', minHeight:620, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'96px 24px 74px', textAlign:'center', overflow:'hidden' }}>
        {/* Photo fond */}
        <div style={{ position:'absolute', inset:0, zIndex:0 }}>
          <img src={HERO_IMAGE} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.14 }} loading="eager" />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(8,7,6,0.5) 0%, rgba(8,7,6,0.82) 70%, #080706 100%)' }} />
        </div>
        {/* Flamme SVG */}
        <svg style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', opacity:0.05, pointerEvents:'none' }} width="400" height="220" viewBox="0 0 400 220">
          <path d="M200 220 C130 180 100 130 140 85 C155 65 170 72 178 55 C186 38 182 20 190 5 C202 32 196 58 210 75 C218 85 228 80 235 62 C248 35 242 15 255 0 C268 32 260 65 265 88 C272 110 285 95 292 78 C308 112 315 145 290 178 C272 200 240 215 200 220Z" fill="#e85d04" />
        </svg>
        {/* Fumée */}
        <div style={{ position:'absolute', bottom:30, left:'50%', transform:'translateX(-50%)', pointerEvents:'none', display:'flex', gap:24 }}>
          {[0, 0.7, 1.4].map((d,i) => (
            <div key={i} style={{ width:3, height:i===1?45:55, background:'linear-gradient(to top,rgba(200,112,50,0.25),transparent)', animation:`smoke ${2.8+i*0.5}s ${d}s ease-in-out infinite` }} />
          ))}
        </div>
        {/* Glow */}
        <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:300, background:'radial-gradient(ellipse,rgba(232,93,4,0.09),transparent 70%)', animation:'pulse 4s ease-in-out infinite', zIndex:1, pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:2, maxWidth:700 }}>
          <div className="fu" style={{ display:'inline-block', background:'rgba(255,123,50,0.08)', border:'1px solid rgba(255,123,50,0.18)', borderRadius:999, padding:'7px 16px', fontSize:11, fontWeight:700, color:'var(--orange-light)', fontFamily:"'Syne',sans-serif", letterSpacing:'2px', textTransform:'uppercase', marginBottom:24 }}>
            Gratuit · Sans inscription obligatoire
          </div>
          <h1 className="fu fu1" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(38px,6.5vw,68px)', color:'#fff', letterSpacing:'-2.4px', lineHeight:1.02, marginBottom:20 }}>
            Ton brisket arrive parfait.<br />
            <span style={{ color:'var(--orange)', animation:'flicker 5s 3s ease-in-out infinite' }}>Pas par chance — par calcul.</span>
          </h1>
          <p className="fu fu2" style={{ fontSize:18, color:'var(--text2)', lineHeight:1.8, maxWidth:560, margin:'0 auto 36px' }}>
            Charbon &amp; Flamme te dit quand démarrer, quoi faire à chaque étape et quand tester la viande, sans te noyer dans la théorie.
          </p>
          <div className="fu fu3" style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginBottom:14 }}>
            <button onClick={go} className="hbtn" style={{ padding:'15px 32px', borderRadius:16, border:'none', background:'linear-gradient(135deg,var(--orange-light),var(--orange-deep))', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 10px 26px rgba(216,90,27,0.28)' }}>
              🔥 Lancer un planning
            </button>
            <button onClick={() => navigate('/auth')} style={{ padding:'15px 26px', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.02)', color:'var(--text2)', fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, cursor:'pointer' }}>
              Connexion optionnelle
            </button>
          </div>
          <div className="fu fu4" style={{ fontSize:11, color:'var(--text3)', letterSpacing:'0.5px' }}>
            Outil gratuit · Mobile-first · Prêt en moins d'une minute
          </div>
        </div>
      </div>

      {/* ── DEMO CARD ─────────────────────────────────────────── */}
      <div style={{ padding:'0 24px 80px', maxWidth:640, margin:'0 auto' }}>
        <div style={{ background:'linear-gradient(180deg, rgba(35,25,19,0.96), rgba(16,12,9,0.98))', border:'1px solid rgba(255,255,255,0.08)', borderRadius:28, padding:'32px', boxShadow:'0 24px 60px rgba(0,0,0,0.42)' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'#4a3a2e', marginBottom:8, textAlign:'center' }}>Lance ta cuisson à</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:84, fontWeight:800, lineHeight:1, color:'var(--orange)', letterSpacing:'-4px', textAlign:'center', marginBottom:10 }}>6h</div>
          <div style={{ fontSize:13, color:'var(--text3)', textAlign:'center', marginBottom:20 }}>Brisket 5.4kg · Offset 120°C · Service 19h</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginBottom:20 }}>
            {[
              { t:'Stall 65–75°C',       active:false },
              { t:'Wrap papier boucher', active:true  },
              { t:'Début tests 90°C',    active:false },
              { t:'Probe tender 92–97°C', active:false },
              { t:'Repos 1h à 3h',       active:false },
            ].map((b,i) => (
              <span key={i} style={{ padding:'6px 12px', borderRadius:999, fontSize:11, fontFamily:"'DM Mono',monospace", fontWeight:600, background:b.active?'rgba(255,123,50,0.1)':'rgba(255,255,255,0.03)', border:`1px solid ${b.active?'rgba(255,123,50,0.24)':'rgba(255,255,255,0.08)'}`, color:b.active?'var(--orange)':'var(--text3)' }}>{b.t}</span>
            ))}
          </div>
          <div style={{ background:'rgba(255,123,50,0.05)', border:'1px solid rgba(255,123,50,0.1)', borderRadius:14, padding:'12px 16px', textAlign:'center' }}>
            <span style={{ fontSize:12, color:'var(--text3)' }}>Fenêtre de service : </span>
            <strong style={{ color:'var(--orange)', fontFamily:"'DM Mono',monospace", fontSize:13 }}>18h → 19h30</strong>
          </div>
        </div>
      </div>

      {/* ── SCIENCE + GRAPHIQUE ───────────────────────────────── */}
      <div style={{ background:'#050403', borderTop:'1px solid #111009', borderBottom:'1px solid #111009', padding:'70px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:'#e85d04', letterSpacing:'2.5px', textTransform:'uppercase', marginBottom:12 }}>Ce que l’outil prend en compte</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(24px,4vw,36px)', color:'#fff', letterSpacing:'-1px', lineHeight:1.1 }}>
              Pas une règle grossière.<br /><span style={{ color:'#4a3a2e' }}>Un planning crédible pour le terrain.</span>
            </h2>
          </div>
          {/* Courbe température SVG */}
          <div style={{ background:'#0c0a08', border:'1px solid #1e1a14', borderRadius:16, padding:'28px', marginBottom:20 }}>
            <div style={{ fontSize:11, color:'#3a2e24', marginBottom:16, fontFamily:"'DM Mono',monospace", letterSpacing:'1px' }}>COURBE DE CUISSON — BRISKET 5KG @ 120°C</div>
            <svg width="100%" viewBox="0 0 560 185" style={{ overflow:'visible' }}>
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e85d04" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#e85d04" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grille */}
              {[30,75,120,150].map(y => (
                <line key={y} x1="30" y1={y} x2="540" y2={y} stroke="#1a1610" strokeWidth="0.5"/>
              ))}
              {/* Labels Y */}
              <text x="0" y="33" fill="#3a2e24" fontSize="10" fontFamily="DM Mono">95°C</text>
              <text x="0" y="78" fill="#3a2e24" fontSize="10" fontFamily="DM Mono">74°C</text>
              <text x="0" y="123" fill="#3a2e24" fontSize="10" fontFamily="DM Mono">65°C</text>
              {/* Zones */}
              <rect x="30" y="0" width="105" height="160" fill="rgba(232,93,4,0.03)"/>
              <rect x="135" y="0" width="140" height="160" fill="rgba(232,93,4,0.05)"/>
              <rect x="275" y="0" width="230" height="160" fill="rgba(232,93,4,0.03)"/>
              {/* Aire sous la courbe */}
              <path d="M35,155 C80,143 112,128 135,120 C145,117 155,117 165,117 C205,117 215,117 275,119 C295,119 310,88 340,57 C368,30 425,29 505,28 L505,160 L35,160Z" fill="url(#tg)"/>
              {/* Courbe */}
              <path d="M35,155 C80,143 112,128 135,120 C145,117 155,117 165,117 C205,117 215,117 275,119 C295,119 310,88 340,57 C368,30 425,29 505,28" fill="none" stroke="#e85d04" strokeWidth="2" strokeLinecap="round"/>
              {/* Points clés */}
              <circle cx="205" cy="117" r="5" fill="#e85d04"/>
              <text x="212" y="111" fill="#e85d04" fontSize="10" fontFamily="Syne" fontWeight="700">Stall</text>
              <circle cx="275" cy="119" r="5" fill="#f48c06"/>
              <text x="282" y="113" fill="#f48c06" fontSize="10" fontFamily="Syne" fontWeight="700">Wrap</text>
              <circle cx="480" cy="29" r="5" fill="#22c55e"/>
              <text x="432" y="23" fill="#22c55e" fontSize="10" fontFamily="Syne" fontWeight="700">Probe tender</text>
              {/* Labels phases */}
              <text x="82" y="178" fill="#3a2e24" fontSize="9" fontFamily="DM Mono" textAnchor="middle">Bark</text>
              <text x="205" y="178" fill="#3a2e24" fontSize="9" fontFamily="DM Mono" textAnchor="middle">Stall</text>
              <text x="390" y="178" fill="#3a2e24" fontSize="9" fontFamily="DM Mono" textAnchor="middle">Finition</text>
            </svg>
          </div>
          {/* 3 stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {[
              { n:'8',   l:'viandes calibrées' },
              { n:'13',  l:'variables de calcul' },
              { n:'±15', l:'min de précision' },
            ].map((s,i) => (
              <div key={i} style={{ background:'#0c0a08', border:'1px solid #1e1a14', borderRadius:14, padding:'20px', textAlign:'center' }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:36, color:'#e85d04', letterSpacing:'-1px' }}>{s.n}</div>
                <div style={{ fontSize:12, color:'#6a5a4a', marginTop:4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DOULEUR ───────────────────────────────────────────── */}
      <div style={{ padding:'70px 24px' }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:'#e85d04', letterSpacing:'2.5px', textTransform:'uppercase', marginBottom:12 }}>Tu connais ce moment</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(24px,4vw,36px)', color:'#fff', letterSpacing:'-1px', lineHeight:1.1 }}>
              Le BBQ c'est 15h de maîtrise.<br /><span style={{ color:'#4a3a2e' }}>Pas de hasard.</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12 }}>
            {PAINS.map((p,i) => (
              <div key={i} style={{ background:'#0a0806', border:'1px solid #181410', borderRadius:14, padding:'20px', display:'flex', gap:14 }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{p.icon}</span>
                <p style={{ margin:0, fontSize:13, color:'#7a6a5a', lineHeight:1.7 }}>{p.text}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign:'center', fontSize:14, color:'#6a5a4a', lineHeight:1.75, maxWidth:480, margin:'32px auto 0' }}>
            Charbon &amp; Flamme résout exactement ces problèmes avec un assistant cuisson simple, crédible et pensé pour le terrain.
          </p>
        </div>
      </div>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <div style={{ background:'#050403', borderTop:'1px solid #111009', borderBottom:'1px solid #111009', padding:'70px 24px' }}>
        <div style={{ maxWidth:1040, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:'#e85d04', letterSpacing:'2.5px', textTransform:'uppercase', marginBottom:12 }}>Ce que tu obtiens</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(24px,4vw,38px)', color:'#fff', letterSpacing:'-1px' }}>
              Un vrai assistant pitmaster.<br /><span style={{ color:'#4a3a2e' }}>Pas une simple minuterie.</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:12 }}>
            {FEATURES.map((f,i) => (
              <div key={i} className="hcard" style={{ background:'#0c0a08', border:'1px solid #1e1a14', borderRadius:16, padding:'24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <span style={{ fontSize:28 }}>{f.icon}</span>
                  <Badge label={f.badge} />
                </div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'#c4b4a0', marginBottom:8 }}>{f.title}</div>
                <div style={{ fontSize:13, color:'#7a6a5a', lineHeight:1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── POUR QUI ──────────────────────────────────────────── */}
      <div style={{ padding:'70px 24px' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:'#e85d04', letterSpacing:'2.5px', textTransform:'uppercase', marginBottom:12 }}>Pour qui</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(24px,4vw,36px)', color:'#fff', letterSpacing:'-1px' }}>
              Fait pour les gens sérieux.<br /><span style={{ color:'#4a3a2e' }}>Accessible à tous.</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
            {FOR_WHO.map((w,i) => (
              <div key={i} className="hcard" style={{ background:'#0a0806', border:'1px solid #181410', borderRadius:16, padding:'24px', textAlign:'center' }}>
                <div style={{ fontSize:34, marginBottom:14 }}>{w.icon}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'#c4b4a0', marginBottom:8 }}>{w.who}</div>
                <div style={{ fontSize:12, color:'#7a6a5a', lineHeight:1.65 }}>{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COMMENT ÇA MARCHE ─────────────────────────────────── */}
      <div style={{ background:'#050403', borderTop:'1px solid #111009', borderBottom:'1px solid #111009', padding:'70px 24px' }}>
        <div style={{ maxWidth:560, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:'#e85d04', letterSpacing:'2.5px', textTransform:'uppercase', marginBottom:12 }}>En pratique</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(24px,4vw,34px)', color:'#fff', letterSpacing:'-1px' }}>4 étapes. Zéro stress.</h2>
          </div>
          {STEPS.map((s,i) => (
            <div key={i} style={{ display:'flex', gap:20 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:44, flexShrink:0 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#1e1208,#2a1a08)', border:'1px solid rgba(232,93,4,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:'#e85d04', flexShrink:0 }}>
                  {s.num}
                </div>
                {i < STEPS.length-1 && <div style={{ width:1, flex:1, background:'#1e1a14', margin:'6px 0' }} />}
              </div>
              <div style={{ paddingTop:10, paddingBottom:i < STEPS.length-1 ? 28 : 0 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#c4b4a0', marginBottom:6 }}>{s.title}</div>
                <div style={{ fontSize:13, color:'#7a6a5a', lineHeight:1.7 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── VIANDES ───────────────────────────────────────────── */}
      <div style={{ padding:'70px 24px' }}>
        <div style={{ maxWidth:920, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:'#e85d04', letterSpacing:'2.5px', textTransform:'uppercase', marginBottom:12 }}>Le catalogue</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(22px,3.5vw,32px)', color:'#fff', letterSpacing:'-0.5px', marginBottom:8 }}>8 pièces low &amp; slow</h2>
            <p style={{ fontSize:13, color:'#6a5a4a' }}>Chaque viande a son propre comportement. L'outil adapte les étapes pour rester crédible en vraie cuisson.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(195px,1fr))', gap:10 }}>
            {MEATS_LIST.map(m => (
              <div key={m.key} onClick={go} className="hmeat" style={{ borderRadius:14, overflow:'hidden', position:'relative', height:148, cursor:'pointer', border:'1px solid #1e1a14' }}>
                <img src={MEAT_IMAGES[m.key]} alt={m.label} style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 55%)' }} />
                <div style={{ position:'absolute', bottom:12, left:14 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:'#fff' }}>{m.label}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA FINAL ─────────────────────────────────────────── */}
      <div style={{ background:'#050403', borderTop:'1px solid #111009', padding:'100px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:400, background:'radial-gradient(ellipse,rgba(232,93,4,0.07),transparent 70%)', pointerEvents:'none', animation:'pulse 5s ease-in-out infinite' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:540, margin:'0 auto' }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:'#e85d04', letterSpacing:'2.5px', textTransform:'uppercase', marginBottom:18 }}>Prêt ?</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(28px,5vw,48px)', color:'#fff', letterSpacing:'-1.5px', lineHeight:1.08, marginBottom:18 }}>
            Ta prochaine cuisson.<br />
            <span style={{ color:'#e85d04' }}>Calculée. Maîtrisée. Parfaite.</span>
          </h2>
          <p style={{ fontSize:15, color:'#6a5a4a', lineHeight:1.75, marginBottom:36 }}>
            Ouvre l'outil, lance ton planning, puis utilise la session de cuisson pour suivre les étapes sans stress.
          </p>
          <button onClick={go} className="hbtn" style={{ padding:'17px 44px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(232,93,4,0.28)', display:'inline-block', marginBottom:14 }}>
            🔥 Ouvrir le calculateur
          </button>
          <div style={{ fontSize:11, color:'#4a3a2e' }}>
            Gratuit · Session interactive · Partage facile
          </div>
        </div>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ borderTop:'1px solid #141210', padding:'22px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, background:'linear-gradient(135deg,#f48c06,#e85d04)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          🔥 Charbon &amp; Flamme
        </div>
        <div style={{ display:'flex', gap:20 }}>
          {['Calculateur','CGU','Confidentialité','Contact'].map(l => (
            <span key={l} style={{ fontSize:12, color:'#4a3a2e', cursor:'pointer', transition:'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color='#8a7a6a'}
              onMouseLeave={e => e.currentTarget.style.color='#4a3a2e'}
              onClick={() => l==='Calculateur' && navigate('/app')}>
              {l}
            </span>
          ))}
        </div>
        <div style={{ fontSize:11, color:'#2a2218' }}>© 2026 Charbon &amp; Flamme</div>
      </footer>
    </div>
  )
}
