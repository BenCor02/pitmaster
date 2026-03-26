import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { HERO_IMAGE, MEAT_IMAGES } from '../lib/images'

const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes glow{0%,100%{opacity:0.4}50%{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
  .fade-up{animation:fadeUp 0.45s ease both}
  .fu1{animation-delay:0.05s}
  .fu2{animation-delay:0.12s}
  .fu3{animation-delay:0.2s}
  .fu4{animation-delay:0.28s}
  .pm-card-hover{transition:all 0.2s}
  .pm-card-hover:hover{transform:translateY(-3px);border-color:rgba(232,93,4,0.35)!important}
  .pm-meat-hover{transition:all 0.22s}
  .pm-meat-hover:hover{transform:translateY(-4px);border-color:rgba(232,93,4,0.5)!important}
  .pm-cta-hover{transition:all 0.15s}
  .pm-cta-hover:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(232,93,4,0.45)!important}
`

const PAINS = [
  { icon:'⏰', text:'Tu ne sais jamais vraiment à quelle heure lancer la cuisson.' },
  { icon:'🤷', text:'Le stall te surprend à chaque fois — et tu peux pas t\'y préparer.' },
  { icon:'😰', text:'Tes invités arrivent, la viande n\'est pas prête. Encore.' },
  { icon:'📱', text:'Tu jonglles entre 3 apps, des notes, et tes souvenirs de la dernière fois.' },
]

const FEATURES = [
  {
    icon: '🧮',
    title: 'Calculateur Reverse BBQ',
    desc: 'Entre ton heure de service. PitMaster remonte le temps et te dit exactement à quelle heure allumer le fumoir. Algorithme calibré sur les données de Franklin, Meathead et Harry Soo.',
    badge: 'Cœur du produit',
  },
  {
    icon: '📡',
    title: 'Session de cuisson live',
    desc: 'Valide chaque checkpoint manuellement — pit stable, stall, wrap, probe test. L\'ETA se recalcule en temps réel à chaque étape. Tu sais toujours où tu en es.',
    badge: 'Temps réel',
  },
  {
    icon: '🎯',
    title: 'Fenêtre de service',
    desc: 'PitMaster ne te donne pas une heure. Il te donne une fenêtre sécurisée avec marge de repos incluse. Tu peux accueillir tes invités sans stress.',
    badge: 'Anti-stress',
  },
  {
    icon: '🧬',
    title: 'Science du BBQ intégrée',
    desc: 'Collagène, stall évaporatif, probe tender — l\'algo comprend la physique de ta cuisson. Pas une simple règle de 1h/lb. Une vraie simulation.',
    badge: 'Scientifique',
  },
  {
    icon: '🍖',
    title: 'Cook Party multi-viandes',
    desc: 'Brisket + ribs + pulled pork en même temps ? PitMaster synchronise tout et te dit quoi lancer en premier pour que tout arrive à table ensemble.',
    badge: 'Pro',
  },
  {
    icon: '📓',
    title: 'Journal de cuisson',
    desc: 'Chaque session est archivée. T° réelles, durées, observations. Tu progresses à chaque cuisson, et tu ne répètes plus les mêmes erreurs.',
    badge: 'Mémoire',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Tu entres ton heure de service',
    desc: 'PitMaster part de ta contrainte — pas de la biologie de la viande. Tu veux servir à 19h00, il calcule à rebours.',
  },
  {
    num: '02',
    title: 'L\'algo calcule tout',
    desc: 'Phase de bark, stall évaporatif, wrap, finition, repos avec marge. Chaque paramètre est pondéré selon le poids, l\'épaisseur, le fumoir et le type de viande.',
  },
  {
    num: '03',
    title: 'Tu lances et valides les checkpoints',
    desc: 'PitMaster t\'accompagne en temps réel. Tu confirmes chaque étape quand elle arrive. L\'ETA se recalcule automatiquement.',
  },
  {
    num: '04',
    title: 'Tu sers à l\'heure',
    desc: 'Probe tender validé, repos fait, viande à température de service. Tes invités arrivent, tout est prêt.',
  },
]

const FOR_WHO = [
  { icon:'🏡', who:'Backyard pitmasters', desc:'Tu cuisines le weekend, tu veux bien faire, tu n\'as pas le temps de tout calculer à la main.' },
  { icon:'🏆', who:'Compétiteurs BBQ', desc:'Tu as besoin d\'une heure de service précise, d\'une fenêtre sécurisée, et d\'un historique de tes cooks.' },
  { icon:'🍽️', who:'Restaurateurs & traiteurs', desc:'Tu prépares pour du monde, tu ne peux pas te permettre d\'être en retard. PitMaster te donne une marge de manœuvre réelle.' },
  { icon:'🔥', who:'Passionnés qui progressent', desc:'Tu veux comprendre pourquoi le stall dure 4h, pourquoi le butcher paper change tout. PitMaster t\'explique pendant que tu cuisines.' },
]

const MEATS = [
  { key:'brisket',        label:'Brisket',        time:'10-13h' },
  { key:'pork_shoulder',  label:'Pulled Pork',    time:'8-12h'  },
  { key:'ribs_pork',      label:'Spare Ribs',     time:'5-6h'   },
  { key:'ribs_beef',      label:'Beef Ribs',      time:'7-9h'   },
  { key:'ribs_baby_back', label:'Baby Back',      time:'4-5h'   },
  { key:'paleron',        label:'Paleron',        time:'8-11h'  },
  { key:'plat_de_cote',   label:'Plat de Côte',   time:'9-12h'  },
  { key:'lamb_shoulder',  label:'Épaule Agneau',  time:'6-8h'   },
]

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const go = () => navigate('/auth')

  return (
    <div style={{ minHeight:'100vh', background:'#080706', fontFamily:"'DM Sans',sans-serif", overflowX:'hidden', color:'#d4c4b0' }}>
      <style>{css}</style>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav style={{
        height:56, position:'sticky', top:0, zIndex:100,
        display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px',
        background: scrolled ? 'rgba(8,7,6,0.96)' : 'transparent',
        borderBottom: scrolled ? '1px solid #1a1410' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        transition:'all 0.3s',
      }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, background:'linear-gradient(135deg,#f48c06,#e85d04)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          🔥 PitMaster
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => navigate('/pricing')} style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #2a2218', background:'transparent', color:'#6a5a4a', fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer' }}>
            Tarifs
          </button>
          <button onClick={go} style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #2a2218', background:'transparent', color:'#6a5a4a', fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer' }}>
            Connexion
          </button>
          <button onClick={go} className="pm-cta-hover" style={{ padding:'6px 14px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 12px rgba(232,93,4,0.3)' }}>
            Essayer gratuitement
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div style={{ position:'relative', minHeight:580, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px 60px', overflow:'hidden', textAlign:'center' }}>
        {/* Photo BBQ en fond */}
        <div style={{ position:'absolute', inset:0, zIndex:0 }}>
          <img src={HERO_IMAGE} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.22 }} loading="eager" />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(8,7,6,0.2) 0%, rgba(8,7,6,0.65) 55%, #080706 100%)' }} />
        </div>
        <div style={{ position:'absolute', top:'-80px', left:'50%', transform:'translateX(-50%)', width:700, height:400, background:'radial-gradient(ellipse,rgba(232,93,4,0.13),transparent 70%)', animation:'glow 4s ease-in-out infinite', zIndex:1, pointerEvents:'none' }} />

        {/* Badge */}
        <div className="fade-up" style={{ position:'relative', zIndex:2, display:'inline-flex', alignItems:'center', gap:6, background:'rgba(232,93,4,0.07)', border:'1px solid rgba(232,93,4,0.18)', borderRadius:20, padding:'5px 14px', fontSize:11, fontWeight:700, color:'#e85d04', fontFamily:"'Syne',sans-serif", letterSpacing:'1px', textTransform:'uppercase', marginBottom:22 }}>
          🔥 Calculateur BBQ professionnel
        </div>

        {/* H1 */}
        <h1 className="fade-up fu1" style={{ position:'relative', zIndex:2, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(38px,7vw,66px)', color:'#fff', letterSpacing:'-2px', lineHeight:1.03, maxWidth:760, marginBottom:22 }}>
          Ton brisket arrive parfait.<br />
          <span style={{ color:'#e85d04' }}>Pas par chance — par calcul.</span>
        </h1>

        {/* Sous-titre */}
        <p className="fade-up fu2" style={{ position:'relative', zIndex:2, fontSize:17, color:'#7a6a5a', lineHeight:1.75, maxWidth:540, marginBottom:36 }}>
          PitMaster calcule à la minute près quand lancer ta cuisson pour que tout arrive à table en même temps. Algorithme calibré sur la science réelle du BBQ — pas des règles approximatives.
        </p>

        {/* CTAs */}
        <div className="fade-up fu3" style={{ position:'relative', zIndex:2, display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', marginBottom:16 }}>
          <button onClick={go} className="pm-cta-hover" style={{ padding:'16px 34px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(232,93,4,0.35)', display:'flex', alignItems:'center', gap:8 }}>
            🔥 Commencer gratuitement
          </button>
          <button onClick={() => navigate('/pricing')} style={{ padding:'16px 28px', borderRadius:12, border:'1px solid #2a2218', background:'rgba(255,255,255,0.02)', color:'#6a5a4a', fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, cursor:'pointer' }}>
            Voir les tarifs →
          </button>
        </div>
        <div className="fade-up fu4" style={{ position:'relative', zIndex:2, fontSize:11, color:'#3a2e24', letterSpacing:'0.5px' }}>
          Gratuit pour toujours · Pas de carte bancaire · Prêt en 30 secondes
        </div>
      </div>

      {/* ── DEMO CARD ────────────────────────────────────────── */}
      <div style={{ maxWidth:680, margin:'0 auto 80px', padding:'0 24px' }}>
        <div style={{ background:'linear-gradient(160deg,#1a1008,#141210)', border:'1px solid rgba(232,93,4,0.15)', borderRadius:20, padding:'32px 28px', textAlign:'center', boxShadow:'0 24px 64px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'#4a3a2e', marginBottom:6 }}>Lance ta cuisson à</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:88, fontWeight:800, lineHeight:1, color:'#e85d04', letterSpacing:'-4px', textShadow:'0 0 80px rgba(232,93,4,0.25)', marginBottom:8 }}>05:47</div>
          <div style={{ fontSize:13, color:'#4a3a2e', marginBottom:16 }}>Brisket 5.4kg · Offset 120°C · Service 19h00</div>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginBottom:16 }}>
            {[
              { label:'Bark ~3h20', active:false },
              { label:'Stall ~2h40', active:false },
              { label:'Wrap papier boucher', active:true },
              { label:'Probe tender ~95°C', active:false },
              { label:'Repos 1h30', active:false },
            ].map((b,i) => (
              <span key={i} style={{ background:b.active?'rgba(232,93,4,0.1)':'#0e0c0a', border:`1px solid ${b.active?'rgba(232,93,4,0.35)':'#1e1a14'}`, borderRadius:6, padding:'4px 10px', fontSize:11, fontFamily:"'DM Mono',monospace", color:b.active?'#e85d04':'#4a3a2e', fontWeight:600 }}>{b.label}</span>
            ))}
          </div>
          <div style={{ background:'rgba(232,93,4,0.06)', border:'1px solid rgba(232,93,4,0.12)', borderRadius:10, padding:'10px 16px', fontSize:12, color:'#8a6a4a' }}>
            Fenêtre de service : <strong style={{ color:'#e85d04' }}>17h53 → 19h00</strong> · Marge de sécurité incluse
          </div>
        </div>
      </div>

      {/* ── SECTION DOULEUR ──────────────────────────────────── */}
      <div style={{ padding:'70px 24px', background:'#060504', borderTop:'1px solid #131008', borderBottom:'1px solid #131008' }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:'#e85d04', letterSpacing:'2px', textTransform:'uppercase', marginBottom:12 }}>Tu connais ce moment</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(26px,4vw,38px)', color:'#fff', letterSpacing:'-0.5px', lineHeight:1.15 }}>
              Le BBQ c'est 15 heures de maîtrise.<br />
              <span style={{ color:'#4a3a2e' }}>Pas de hasard.</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
            {PAINS.map((p,i) => (
              <div key={i} style={{ background:'#0a0806', border:'1px solid #1a1610', borderRadius:14, padding:'20px 20px', display:'flex', gap:14, alignItems:'flex-start' }}>
                <span style={{ fontSize:24, flexShrink:0 }}>{p.icon}</span>
                <p style={{ margin:0, fontSize:13, color:'#5a4a3e', lineHeight:1.65 }}>{p.text}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:32 }}>
            <p style={{ fontSize:15, color:'#6a5a4a', lineHeight:1.7, maxWidth:520, margin:'0 auto' }}>
              PitMaster résout exactement ces problèmes — pas avec des approximations, mais avec un algorithme construit sur la physique réelle du BBQ.
            </p>
          </div>
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <div style={{ maxWidth:1080, margin:'0 auto', padding:'80px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:'#e85d04', letterSpacing:'2px', textTransform:'uppercase', marginBottom:12 }}>Ce que tu obtiens</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(26px,4vw,38px)', color:'#fff', letterSpacing:'-0.5px' }}>
            Un vrai assistant pitmaster.<br />
            <span style={{ color:'#4a3a2e' }}>Pas une simple minuterie.</span>
          </h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
          {FEATURES.map((f,i) => (
            <div key={i} className="pm-card-hover" style={{ background:'#0d0b09', border:'1px solid #1e1a14', borderRadius:16, padding:'24px 22px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <span style={{ fontSize:30 }}>{f.icon}</span>
                <span style={{ background:'rgba(232,93,4,0.08)', border:'1px solid rgba(232,93,4,0.15)', borderRadius:20, padding:'3px 10px', fontSize:10, fontWeight:700, color:'#e85d04', fontFamily:"'Syne',sans-serif", letterSpacing:'0.5px', whiteSpace:'nowrap' }}>{f.badge}</span>
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#d4c4b0', marginBottom:8 }}>{f.title}</div>
              <div style={{ fontSize:13, color:'#4a3a2e', lineHeight:1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── POUR QUI ─────────────────────────────────────────── */}
      <div style={{ padding:'70px 24px', background:'#060504', borderTop:'1px solid #131008', borderBottom:'1px solid #131008' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:'#e85d04', letterSpacing:'2px', textTransform:'uppercase', marginBottom:12 }}>Pour qui</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(26px,4vw,38px)', color:'#fff', letterSpacing:'-0.5px' }}>
              Fait pour les gens sérieux.<br />
              <span style={{ color:'#4a3a2e' }}>Accessible à tous.</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
            {FOR_WHO.map((w,i) => (
              <div key={i} className="pm-card-hover" style={{ background:'#0a0806', border:'1px solid #1a1610', borderRadius:16, padding:'22px 20px', textAlign:'center' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>{w.icon}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'#d4c4b0', marginBottom:8 }}>{w.who}</div>
                <div style={{ fontSize:12, color:'#4a3a2e', lineHeight:1.65 }}>{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COMMENT ÇA MARCHE ────────────────────────────────── */}
      <div style={{ maxWidth:700, margin:'0 auto', padding:'80px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:'#e85d04', letterSpacing:'2px', textTransform:'uppercase', marginBottom:12 }}>En pratique</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(26px,4vw,36px)', color:'#fff', letterSpacing:'-0.5px' }}>
            4 étapes. Zéro stress.
          </h2>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {STEPS.map((s,i) => (
            <div key={i} style={{ display:'flex', gap:16, alignItems:'stretch' }}>
              {/* Ligne verticale */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, width:40 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#f48c06,#e85d04)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:'#fff', flexShrink:0 }}>{s.num}</div>
                {i < STEPS.length - 1 && <div style={{ flex:1, width:2, background:'#1e1a14', margin:'4px 0' }} />}
              </div>
              <div style={{ paddingTop:8, paddingBottom: i < STEPS.length -1 ? 24 : 0 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#d4c4b0', marginBottom:4 }}>{s.title}</div>
                <div style={{ fontSize:13, color:'#4a3a2e', lineHeight:1.7 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── VIANDES ──────────────────────────────────────────── */}
      <div style={{ padding:'70px 24px', background:'#060504', borderTop:'1px solid #131008' }}>
        <div style={{ maxWidth:920, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:'#e85d04', letterSpacing:'2px', textTransform:'uppercase', marginBottom:12 }}>Le catalogue</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(22px,3.5vw,32px)', color:'#fff', letterSpacing:'-0.5px', marginBottom:8 }}>
              8 pièces low & slow
            </h2>
            <p style={{ fontSize:13, color:'#4a3a2e' }}>Chaque viande a son propre algorithme. Calibré sur les données terrain des grands pitmasters.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:10 }}>
            {MEATS.map(m => (
              <div key={m.key} onClick={go} className="pm-meat-hover" style={{ borderRadius:14, overflow:'hidden', position:'relative', height:140, cursor:'pointer', border:'1px solid #1e1a14' }}>
                <img src={MEAT_IMAGES[m.key]} alt={m.label} style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
                <div style={{ position:'absolute', bottom:10, left:12, right:12 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:'#fff' }}>{m.label}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <div style={{ padding:'90px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:400, background:'radial-gradient(ellipse,rgba(232,93,4,0.1),transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:600, margin:'0 auto' }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:'#e85d04', letterSpacing:'2px', textTransform:'uppercase', marginBottom:16 }}>Prêt ?</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(28px,5vw,48px)', color:'#fff', letterSpacing:'-1px', lineHeight:1.1, marginBottom:18 }}>
            Ta prochaine cuisson.<br />
            <span style={{ color:'#e85d04' }}>Calculée. Maîtrisée. Parfaite.</span>
          </h2>
          <p style={{ fontSize:15, color:'#5a4a3a', lineHeight:1.7, marginBottom:32 }}>
            Rejoins les pitmasters qui ne laissent plus rien au hasard.
          </p>
          <button onClick={go} className="pm-cta-hover" style={{ padding:'18px 44px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, cursor:'pointer', boxShadow:'0 8px 28px rgba(232,93,4,0.35)', display:'inline-flex', alignItems:'center', gap:10, marginBottom:14 }}>
            🔥 Commencer gratuitement
          </button>
          <div style={{ fontSize:12, color:'#3a2e24' }}>
            Gratuit pour toujours · Pas de carte bancaire · 30 secondes pour démarrer
          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ borderTop:'1px solid #141210', padding:'24px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, background:'linear-gradient(135deg,#f48c06,#e85d04)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>🔥 PitMaster</div>
        <div style={{ display:'flex', gap:20 }}>
          {['Tarifs','CGU','Confidentialité','Contact'].map(l => (
            <span key={l} style={{ fontSize:12, color:'#3a2e24', cursor:'pointer', transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#6a5a4a'} onMouseLeave={e=>e.currentTarget.style.color='#3a2e24'}
              onClick={() => l==='Tarifs' && navigate('/pricing')}>{l}</span>
          ))}
        </div>
        <div style={{ fontSize:11, color:'#2a2218' }}>© 2026 PitMaster · Tous droits réservés</div>
      </footer>
    </div>
  )
}