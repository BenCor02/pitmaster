import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { HERO_IMAGE, MEAT_IMAGES } from '../lib/images'

const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes glow{0%,100%{opacity:0.3}50%{opacity:0.8}}
  .fu{animation:fadeUp 0.5s ease both}
  .fu1{animation-delay:0.08s}
  .fu2{animation-delay:0.16s}
  .fu3{animation-delay:0.24s}
  .fu4{animation-delay:0.32s}
  .hover-card{transition:border-color 0.2s,transform 0.2s}
  .hover-card:hover{transform:translateY(-2px);border-color:rgba(232,93,4,0.3)!important}
  .hover-meat{transition:transform 0.2s,border-color 0.2s}
  .hover-meat:hover{transform:scale(1.02);border-color:rgba(232,93,4,0.4)!important}
  .hover-btn{transition:opacity 0.15s,transform 0.15s,box-shadow 0.15s}
  .hover-btn:hover{opacity:0.92;transform:translateY(-1px)}
  * { box-sizing: border-box; }
`

// ── Données ────────────────────────────────────────────────────
const PAINS = [
  { icon:'⏰', text:'Tu ne sais jamais vraiment à quelle heure lancer la cuisson.' },
  { icon:'🤷', text:'Le stall te surprend à chaque fois — et tu peux pas t\'y préparer.' },
  { icon:'😰', text:'Tes invités arrivent, la viande n\'est pas prête. Encore.' },
  { icon:'📱', text:'Tu jonglles entre 3 apps, des notes, et tes souvenirs de la dernière fois.' },
]

const FEATURES = [
  { icon:'🧮', title:'Calculateur Reverse BBQ',     badge:'Cœur du produit', desc:'Entre ton heure de service. Charbon & Flamme remonte le temps et te dit exactement à quelle heure allumer le fumoir. Algorithme calibré sur les données de Franklin, Meathead et Harry Soo.' },
  { icon:'📡', title:'Session de cuisson live',      badge:'Temps réel',       desc:'Valide chaque checkpoint manuellement — pit stable, stall, wrap, probe test. L\'ETA se recalcule à chaque étape. Tu sais toujours où tu en es.' },
  { icon:'🎯', title:'Fenêtre de service',           badge:'Anti-stress',      desc:'Charbon & Flamme ne te donne pas une heure. Il te donne une fenêtre sécurisée avec marge de repos incluse. Tu peux accueillir tes invités sans stress.' },
  { icon:'🧬', title:'Science du BBQ intégrée',      badge:'Scientifique',     desc:'Collagène, stall évaporatif, probe tender — l\'algo comprend la physique de ta cuisson. Pas une règle de 1h/lb. Une vraie simulation.' },
  { icon:'🍖', title:'Cook Party multi-viandes',     badge:'Pro',              desc:'Brisket + ribs + pulled pork en même temps ? Charbon & Flamme synchronise tout et te dit quoi lancer en premier.' },
  { icon:'📓', title:'Journal de cuisson',           badge:'Mémoire',          desc:'Chaque session est archivée. T° réelles, durées, observations. Tu progresses à chaque cuisson et ne répètes plus les mêmes erreurs.' },
]

const STEPS = [
  { num:'01', title:'Tu entres ton heure de service',   desc:'Charbon & Flamme part de ta contrainte — pas de la biologie de la viande. Tu veux servir à 19h00, il calcule à rebours.' },
  { num:'02', title:'L\'algo calcule tout',             desc:'Phase de bark, stall évaporatif, wrap, finition, repos avec marge. Chaque paramètre pondéré selon le poids, l\'épaisseur, le fumoir et le type de viande.' },
  { num:'03', title:'Tu valides les checkpoints',       desc:'Charbon & Flamme t\'accompagne en temps réel. Tu confirmes chaque étape quand elle arrive. L\'ETA se recalcule automatiquement.' },
  { num:'04', title:'Tu sers à l\'heure',               desc:'Probe tender validé, repos fait, viande à température de service. Tes invités arrivent, tout est prêt.' },
]

const FOR_WHO = [
  { icon:'🏡', who:'Backyard pitmasters',    desc:'Tu cuisines le weekend, tu veux bien faire, tu n\'as pas le temps de tout calculer à la main.' },
  { icon:'🏆', who:'Compétiteurs BBQ',        desc:'Tu as besoin d\'une heure de service précise, d\'une fenêtre sécurisée, et d\'un historique de tes cooks.' },
  { icon:'🍽️', who:'Restaurateurs & traiteurs', desc:'Tu prépares pour du monde, tu ne peux pas te permettre d\'être en retard.' },
  { icon:'🔥', who:'Passionnés qui progressent', desc:'Tu veux comprendre pourquoi le stall dure 4h, pourquoi le butcher paper change tout.' },
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

// ── Composants réutilisables ───────────────────────────────────
const Section = ({ children, dark, style = {} }) => (
  <div style={{
    padding: '80px 24px',
    background: dark ? '#050403' : '#080706',
    borderTop: '1px solid #111009',
    ...style,
  }}>
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      {children}
    </div>
  </div>
)

const SectionHeader = ({ eyebrow, title, sub }) => (
  <div style={{ textAlign: 'center', marginBottom: 52 }}>
    {eyebrow && (
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:'#e85d04', letterSpacing:'2.5px', textTransform:'uppercase', marginBottom:14 }}>
        {eyebrow}
      </div>
    )}
    <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(26px,4vw,40px)', color:'#fff', letterSpacing:'-1px', lineHeight:1.1, margin:'0 auto', maxWidth:640 }}>
      {title}
    </h2>
    {sub && (
      <p style={{ fontSize:14, color:'#4a3a2e', marginTop:14, lineHeight:1.7, maxWidth:500, margin:'14px auto 0' }}>
        {sub}
      </p>
    )}
  </div>
)

const Badge = ({ label }) => (
  <span style={{
    display:'inline-block', padding:'3px 10px', borderRadius:20,
    background:'rgba(232,93,4,0.07)', border:'1px solid rgba(232,93,4,0.15)',
    fontSize:10, fontWeight:700, color:'#e85d04', fontFamily:"'Syne',sans-serif",
    letterSpacing:'0.5px', whiteSpace:'nowrap',
  }}>
    {label}
  </span>
)

// ── Page ────────────────────────────────────────────────────────
export default function Landing() {
  const navigate  = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive:true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const go = () => navigate('/auth')

  return (
    <div style={{ background:'#080706', fontFamily:"'DM Sans',sans-serif", overflowX:'hidden', color:'#d4c4b0' }}>
      <style>{css}</style>

      {/* ── NAV ────────────────────────────────────────────── */}
      <nav style={{
        height:58, position:'sticky', top:0, zIndex:100,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 32px',
        background: scrolled ? 'rgba(6,5,4,0.96)' : 'transparent',
        borderBottom: scrolled ? '1px solid #181410' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition:'background 0.3s, border-color 0.3s',
      }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, background:'linear-gradient(135deg,#f48c06,#e85d04)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', letterSpacing:'-0.3px' }}>
          🔥 Charbon & Flamme
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={() => navigate('/pricing')} style={{ padding:'7px 16px', borderRadius:8, border:'none', background:'transparent', color:'#5a4a3a', fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer' }}>
            Tarifs
          </button>
          <button onClick={go} style={{ padding:'7px 16px', borderRadius:8, border:'1px solid #2a2218', background:'transparent', color:'#7a6a5a', fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer' }}>
            Connexion
          </button>
          <button onClick={go} className="hover-btn" style={{ padding:'7px 18px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer' }}>
            Commencer
          </button>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <div style={{ position:'relative', minHeight:600, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'90px 24px 80px', textAlign:'center', overflow:'hidden' }}>
        {/* Fond photo */}
        <div style={{ position:'absolute', inset:0, zIndex:0 }}>
          <img src={HERO_IMAGE} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.15 }} loading="eager" />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(8,7,6,0.5) 0%, rgba(8,7,6,0.8) 70%, #080706 100%)' }} />
        </div>
        {/* Glow orange central */}
        <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)', width:500, height:300, background:'radial-gradient(ellipse,rgba(232,93,4,0.1),transparent 70%)', animation:'glow 4s ease-in-out infinite', zIndex:1, pointerEvents:'none' }} />

        {/* Contenu */}
        <div style={{ position:'relative', zIndex:2, maxWidth:700 }}>
          <div className="fu" style={{ display:'inline-block', background:'rgba(232,93,4,0.07)', border:'1px solid rgba(232,93,4,0.15)', borderRadius:20, padding:'5px 16px', fontSize:11, fontWeight:700, color:'#c87040', fontFamily:"'Syne',sans-serif", letterSpacing:'2px', textTransform:'uppercase', marginBottom:24 }}>
            Calculateur BBQ professionnel
          </div>

          <h1 className="fu fu1" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(36px,6.5vw,64px)', color:'#fff', letterSpacing:'-2px', lineHeight:1.05, marginBottom:20 }}>
            Ton brisket arrive parfait.<br />
            <span style={{ color:'#e85d04' }}>Pas par chance — par calcul.</span>
          </h1>

          <p className="fu fu2" style={{ fontSize:17, color:'#6a5a4a', lineHeight:1.8, maxWidth:500, margin:'0 auto 36px' }}>
            Charbon & Flamme calcule à la minute près quand lancer ta cuisson pour que tout arrive à table en même temps. Algorithme calibré sur la science réelle du BBQ.
          </p>

          <div className="fu fu3" style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginBottom:14 }}>
            <button onClick={go} className="hover-btn" style={{ padding:'15px 32px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 20px rgba(232,93,4,0.3)' }}>
              🔥 Commencer gratuitement
            </button>
            <button onClick={() => navigate('/pricing')} style={{ padding:'15px 26px', borderRadius:12, border:'1px solid #2a2218', background:'transparent', color:'#5a4a3a', fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, cursor:'pointer' }}>
              Voir les tarifs →
            </button>
          </div>

          <div className="fu fu4" style={{ fontSize:11, color:'#3a2e24', letterSpacing:'0.5px' }}>
            Gratuit pour toujours · Pas de carte bancaire · Prêt en 30 secondes
          </div>
        </div>
      </div>

      {/* ── DEMO CARD ──────────────────────────────────────── */}
      <div style={{ padding:'0 24px 80px' }}>
        <div style={{ maxWidth:600, margin:'0 auto', background:'#0c0a08', border:'1px solid #1e1a14', borderRadius:20, padding:'32px', boxShadow:'0 24px 60px rgba(0,0,0,0.6)' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'#3a2e24', marginBottom:8, textAlign:'center' }}>
            Lance ta cuisson à
          </div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:80, fontWeight:800, lineHeight:1, color:'#e85d04', letterSpacing:'-4px', textAlign:'center', marginBottom:10 }}>
            05:47
          </div>
          <div style={{ fontSize:13, color:'#3a2e24', textAlign:'center', marginBottom:20 }}>
            Brisket 5.4kg · Offset 120°C · Service 19h00
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', marginBottom:18 }}>
            {[
              { t:'Bark ~3h20',           active:false },
              { t:'Stall ~2h40',          active:false },
              { t:'Wrap papier boucher',  active:true  },
              { t:'Probe tender ~95°C',   active:false },
              { t:'Repos 1h30',           active:false },
            ].map((b,i) => (
              <span key={i} style={{
                padding:'4px 12px', borderRadius:6, fontSize:11,
                fontFamily:"'DM Mono',monospace", fontWeight:600,
                background: b.active ? 'rgba(232,93,4,0.1)' : '#111009',
                border: `1px solid ${b.active ? 'rgba(232,93,4,0.3)' : '#1e1a14'}`,
                color: b.active ? '#e85d04' : '#3a2e24',
              }}>{b.t}</span>
            ))}
          </div>
          <div style={{ background:'rgba(232,93,4,0.05)', border:'1px solid rgba(232,93,4,0.1)', borderRadius:10, padding:'12px 16px', textAlign:'center' }}>
            <span style={{ fontSize:12, color:'#5a4a3a' }}>Fenêtre de service : </span>
            <strong style={{ color:'#e85d04', fontFamily:"'DM Mono',monospace", fontSize:13 }}>17h53 → 19h00</strong>
            <span style={{ fontSize:12, color:'#3a2e24' }}> · Marge incluse</span>
          </div>
        </div>
      </div>

      {/* ── SECTION DOULEUR ────────────────────────────────── */}
      <Section dark>
        <SectionHeader
          eyebrow="Tu connais ce moment"
          title={<>Le BBQ c'est 15h de maîtrise.<br /><span style={{ color:'#3a2e24' }}>Pas de hasard.</span></>}
        />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12, maxWidth:720, margin:'0 auto' }}>
          {PAINS.map((p,i) => (
            <div key={i} style={{ background:'#080706', border:'1px solid #181410', borderRadius:14, padding:'20px' }}>
              <div style={{ fontSize:22, marginBottom:10 }}>{p.icon}</div>
              <p style={{ margin:0, fontSize:13, color:'#5a4a3a', lineHeight:1.7 }}>{p.text}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign:'center', fontSize:14, color:'#5a4a3a', lineHeight:1.7, maxWidth:480, margin:'36px auto 0' }}>
          Charbon & Flamme résout exactement ces problèmes — avec un algorithme construit sur la physique réelle du BBQ.
        </p>
      </Section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <Section>
        <SectionHeader
          eyebrow="Ce que tu obtiens"
          title={<>Un vrai assistant pitmaster.<br /><span style={{ color:'#3a2e24' }}>Pas une simple minuterie.</span></>}
        />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:12 }}>
          {FEATURES.map((f,i) => (
            <div key={i} className="hover-card" style={{ background:'#0c0a08', border:'1px solid #1e1a14', borderRadius:16, padding:'24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <span style={{ fontSize:28 }}>{f.icon}</span>
                <Badge label={f.badge} />
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'#c4b4a0', marginBottom:8 }}>{f.title}</div>
              <div style={{ fontSize:13, color:'#4a3a2e', lineHeight:1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── POUR QUI ───────────────────────────────────────── */}
      <Section dark>
        <SectionHeader
          eyebrow="Pour qui"
          title={<>Fait pour les gens sérieux.<br /><span style={{ color:'#3a2e24' }}>Accessible à tous.</span></>}
        />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
          {FOR_WHO.map((w,i) => (
            <div key={i} className="hover-card" style={{ background:'#080706', border:'1px solid #181410', borderRadius:16, padding:'24px', textAlign:'center' }}>
              <div style={{ fontSize:34, marginBottom:14 }}>{w.icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'#c4b4a0', marginBottom:8 }}>{w.who}</div>
              <div style={{ fontSize:12, color:'#4a3a2e', lineHeight:1.65 }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── COMMENT ÇA MARCHE ──────────────────────────────── */}
      <Section>
        <SectionHeader eyebrow="En pratique" title="4 étapes. Zéro stress." />
        <div style={{ maxWidth:580, margin:'0 auto', display:'flex', flexDirection:'column', gap:0 }}>
          {STEPS.map((s,i) => (
            <div key={i} style={{ display:'flex', gap:20 }}>
              {/* Numéro + ligne */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:44, flexShrink:0 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#1e1208,#2a1a08)', border:'1px solid rgba(232,93,4,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:'#e85d04', flexShrink:0 }}>
                  {s.num}
                </div>
                {i < STEPS.length-1 && (
                  <div style={{ width:1, flex:1, background:'#1e1a14', margin:'6px 0' }} />
                )}
              </div>
              {/* Texte */}
              <div style={{ paddingTop:10, paddingBottom: i < STEPS.length-1 ? 28 : 0 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#c4b4a0', marginBottom:6 }}>{s.title}</div>
                <div style={{ fontSize:13, color:'#4a3a2e', lineHeight:1.7 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── VIANDES ────────────────────────────────────────── */}
      <Section dark>
        <SectionHeader
          eyebrow="Le catalogue"
          title="8 pièces low & slow"
          sub="Chaque viande a son propre algorithme. Calibré sur les données terrain des grands pitmasters."
        />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
          {MEATS_LIST.map(m => (
            <div key={m.key} onClick={go} className="hover-meat" style={{ borderRadius:14, overflow:'hidden', position:'relative', height:150, cursor:'pointer', border:'1px solid #1e1a14' }}>
              <img src={MEAT_IMAGES[m.key]} alt={m.label} style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 55%)' }} />
              <div style={{ position:'absolute', bottom:12, left:14 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:'#fff' }}>{m.label}</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA FINAL ──────────────────────────────────────── */}
      <div style={{ padding:'100px 24px', textAlign:'center', position:'relative', overflow:'hidden', background:'#080706' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:400, background:'radial-gradient(ellipse,rgba(232,93,4,0.08),transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:560, margin:'0 auto' }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:'#e85d04', letterSpacing:'2.5px', textTransform:'uppercase', marginBottom:18 }}>Prêt ?</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(28px,5vw,50px)', color:'#fff', letterSpacing:'-1.5px', lineHeight:1.08, marginBottom:18 }}>
            Ta prochaine cuisson.<br />
            <span style={{ color:'#e85d04' }}>Calculée. Maîtrisée. Parfaite.</span>
          </h2>
          <p style={{ fontSize:15, color:'#4a3a2e', lineHeight:1.75, marginBottom:36 }}>
            Rejoins les pitmasters qui ne laissent plus rien au hasard.
          </p>
          <button onClick={go} className="hover-btn" style={{ padding:'17px 44px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(232,93,4,0.3)', display:'inline-block', marginBottom:14 }}>
            🔥 Commencer gratuitement
          </button>
          <div style={{ fontSize:11, color:'#2e2418' }}>
            Gratuit pour toujours · Pas de carte bancaire · 30 secondes pour démarrer
          </div>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer style={{ borderTop:'1px solid #141210', padding:'22px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, background:'linear-gradient(135deg,#f48c06,#e85d04)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          🔥 Charbon & Flamme
        </div>
        <div style={{ display:'flex', gap:20 }}>
          {['Tarifs','CGU','Confidentialité','Contact'].map(l => (
            <span key={l} style={{ fontSize:12, color:'#2e2418', cursor:'pointer', transition:'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color='#5a4a3a'}
              onMouseLeave={e => e.currentTarget.style.color='#2e2418'}
              onClick={() => l==='Tarifs' && navigate('/pricing')}>
              {l}
            </span>
          ))}
        </div>
        <div style={{ fontSize:11, color:'#1e1a14' }}>© 2026 Charbon & Flamme</div>
      </footer>
    </div>
  )
}