import { useNavigate } from 'react-router-dom'
import { HERO_IMAGE, MEAT_IMAGES } from '../lib/images'
import { useState, useEffect } from 'react'

const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes glow{0%,100%{opacity:0.5}50%{opacity:1}}
  .fade-up{animation:fadeUp 0.4s ease both}
  .feature-card{background:#0e0c0a;border:1px solid #1e1a14;border-radius:16px;padding:24px;transition:all 0.2s}
  .feature-card:hover{border-color:rgba(232,93,4,0.3);background:rgba(232,93,4,0.03);transform:translateY(-2px)}
  .step-num{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#f48c06,#e85d04);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:16px;color:#fff;flex-shrink:0}
`

const FEATURES = [
  { icon:'🔥', title:'Calculateur Reverse BBQ', desc:'Entre ton heure de service, PitMaster calcule exactement quand lancer ta cuisson. Brisket, pulled pork, ribs, agneau — toutes les viandes.' },
  { icon:'⏱️', title:'Planning multi-viandes', desc:'Cook Party : jusqu\'à 10 viandes simultanées avec un planning synchronisé. Tout arrive parfait en même temps.' },
  { icon:'🤖', title:'Ask The Pitmaster AI', desc:'Un expert BBQ disponible 24h/24. Stall, écorce, température, bois de fumage... il répond à tout instantanément.' },
  { icon:'❄️', title:'Fumage à froid & SSV', desc:'Calculateur de saumurage SSV avec la règle 4-2-1. Saumon, bacon, jambon, fromages — ratios pros précis au gramme.' },
  { icon:'📓', title:'Journal de cuisson', desc:'Note tes sessions, attribue des étoiles, observe tes progrès. Deviens un meilleur pit-master à chaque cuisson.' },
  { icon:'📚', title:'Base de données BBQ', desc:'Glossaire complet, guide des bois de fumage, conversions °C/°F, recettes de rubs et sauces pros.' },
]

const STEPS = [
  { title:'Choisis ta viande', desc:'Sélectionne la pièce et entre le poids.' },
  { title:'Règle le fumoir', desc:'Température, marge de sécurité, heure de service.' },
  { title:'Lance la cuisson', desc:'PitMaster te donne l\'heure exacte de démarrage.' },
  { title:'Profite', desc:'Ton BBQ arrive parfait, sans stress.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div style={{ minHeight:'100vh', background:'#080706', fontFamily:'DM Sans,sans-serif', overflowX:'hidden' }}>
      <style>{css}</style>

      {/* NAV */}
      <nav style={{ height:56, borderBottom:`1px solid ${scrolled?'#181410':'transparent'}`, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', position:'sticky', top:0, background:scrolled?'rgba(8,7,6,0.97)':'transparent', backdropFilter:scrolled?'blur(20px)':'none', zIndex:50, transition:'all 0.3s' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, background:'linear-gradient(135deg,#f48c06,#e85d04)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          🔥 PitMaster
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => navigate('/pricing')} style={{ padding:'7px 16px', borderRadius:8, border:'1px solid #1e1a14', background:'transparent', color:'#8a7060', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            Tarifs
          </button>
          <button onClick={() => navigate('/auth')} style={{ padding:'7px 16px', borderRadius:8, border:'1px solid #1e1a14', background:'transparent', color:'#8a7060', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            Connexion
          </button>
          <button onClick={() => navigate('/auth')} style={{ padding:'7px 16px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 12px rgba(232,93,4,0.3)' }}>
            Essayer gratuitement
          </button>
        </div>
      </nav>

      {/* HERO avec photo background */}
      <div style={{ textAlign:'center', padding:'80px 24px 60px', position:'relative', overflow:'hidden', minHeight: 520 }}>
        {/* Photo background */}
        <div style={{ position:'absolute', inset:0, zIndex:0 }}>
          <img src={HERO_IMAGE} alt="BBQ Pitmaster" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.18 }} loading="eager" />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(8,7,6,0.3) 0%, rgba(8,7,6,0.7) 60%, #080706 100%)' }} />
        </div>
        {/* GLOW */}
        <div style={{ position:'absolute', top:'-100px', left:'50%', transform:'translateX(-50%)', width:'600px', height:'400px', background:'radial-gradient(ellipse,rgba(232,93,4,0.15),transparent 70%)', pointerEvents:'none', animation:'glow 3s ease-in-out infinite', zIndex:1 }} />

        <div className="fade-up" style={{ position:'relative', zIndex:2, display:'inline-flex', alignItems:'center', gap:6, background:'rgba(232,93,4,0.08)', border:'1px solid rgba(232,93,4,0.2)', borderRadius:20, padding:'5px 14px', fontSize:12, fontWeight:700, color:'#e85d04', fontFamily:'Syne,sans-serif', letterSpacing:'0.5px', marginBottom:20 }}>
          🔥 L'outil BBQ que tu attendais
        </div>

        <h1 className="fade-up" style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:58, color:'#fff', letterSpacing:'-2px', lineHeight:1.05, marginBottom:20, animationDelay:'0.1s', maxWidth:700, margin:'0 auto 20px' }}>
          Le BBQ parfait,<br /><span style={{ color:'#e85d04' }}>calculé à la minute.</span>
        </h1>

        <p className="fade-up" style={{ fontSize:18, color:'#6a5a4a', lineHeight:1.7, maxWidth:520, margin:'0 auto 36px', animationDelay:'0.2s' }}>
          PitMaster calcule exactement quand lancer ta cuisson pour que tout arrive parfait à table. Brisket, ribs, pulled pork — fini le stress.
        </p>

        <div className="fade-up" style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', animationDelay:'0.3s' }}>
          <button onClick={() => navigate('/auth')} style={{ padding:'15px 32px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(232,93,4,0.35)', display:'flex', alignItems:'center', gap:8 }}>
            🔥 Commencer gratuitement
          </button>
          <button onClick={() => navigate('/pricing')} style={{ padding:'15px 32px', borderRadius:12, border:'1px solid #1e1a14', background:'transparent', color:'#8a7060', fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, cursor:'pointer' }}>
            Voir les tarifs →
          </button>
        </div>

        <div className="fade-up" style={{ marginTop:16, fontSize:12, color:'#3a2e24', animationDelay:'0.4s' }}>
          Gratuit pour toujours · Pas de carte bancaire
        </div>
      </div>

      {/* DEMO VISUELLE */}
      <div className="fade-up" style={{ maxWidth:700, margin:'0 auto 80px', padding:'0 24px', animationDelay:'0.3s' }}>
        <div style={{ background:'linear-gradient(160deg,#1e1208,#171410)', border:'1px solid rgba(232,93,4,0.2)', borderRadius:20, padding:'32px 28px', textAlign:'center', boxShadow:'0 20px 60px rgba(232,93,4,0.08)' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'#4a3a2e', marginBottom:8 }}>Lance ta cuisson à</div>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:80, fontWeight:800, lineHeight:1, color:'#e85d04', letterSpacing:'-3px', textShadow:'0 0 60px rgba(232,93,4,0.3)', marginBottom:8 }}>06:30</div>
          <div style={{ fontSize:13, color:'#4a3a2e' }}>Brisket 5kg · Fumoir 110°C · Service à 19h00</div>
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:14, flexWrap:'wrap' }}>
            {['93-96°C','12h30 cuisson','1h repos','marge +1h'].map((b,i) => (
              <span key={i} style={{ background:i===0?'rgba(232,93,4,0.1)':'#0e0c0a', border:`1px solid ${i===0?'rgba(232,93,4,0.3)':'#1e1a14'}`, borderRadius:6, padding:'4px 10px', fontSize:11, fontFamily:'DM Mono,monospace', color:i===0?'#e85d04':'#4a3a2e', fontWeight:600 }}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px 80px' }}>
        <div className="fade-up" style={{ textAlign:'center', marginBottom:40 }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:36, color:'#fff', letterSpacing:'-0.5px', marginBottom:8 }}>Tout ce dont tu as besoin</h2>
          <p style={{ fontSize:15, color:'#4a3a2e' }}>Calculateur, IA, journal, fumage à froid — tout en un.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className={`feature-card fade-up`} style={{ animationDelay:`${i*0.08}s` }}>
              <div style={{ fontSize:28, marginBottom:12 }}>{f.icon}</div>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:'#d4c4b0', marginBottom:6 }}>{f.title}</div>
              <div style={{ fontSize:13, color:'#4a3a2e', lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* COMMENT ÇA MARCHE */}
      <div style={{ maxWidth:700, margin:'0 auto', padding:'0 24px 80px' }}>
        <div className="fade-up" style={{ textAlign:'center', marginBottom:36 }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:32, color:'#fff', letterSpacing:'-0.5px' }}>Comment ça marche ?</h2>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {STEPS.map((s, i) => (
            <div key={i} className="fade-up" style={{ display:'flex', gap:14, alignItems:'flex-start', animationDelay:`${i*0.1}s` }}>
              <div className="step-num">{i+1}</div>
              <div style={{ flex:1, paddingTop:6 }}>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:'#d4c4b0', marginBottom:3 }}>{s.title}</div>
                <div style={{ fontSize:13, color:'#4a3a2e' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION VIANDES avec photos */}
      <div style={{ padding:'60px 24px', background:'#060504' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#fff', marginBottom:8 }}>
              Toutes les pièces <span style={{ color:'#e85d04' }}>low & slow</span>
            </div>
            <div style={{ fontSize:14, color:'#6a5a4a' }}>8 coupes calibrées sur les données des grands pitmasters</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12 }}>
            {[
              { key:'brisket',        label:'Brisket' },
              { key:'pork_shoulder',  label:'Pulled Pork' },
              { key:'ribs_pork',      label:'Spare Ribs' },
              { key:'ribs_beef',      label:'Beef Ribs' },
              { key:'ribs_baby_back', label:'Baby Back' },
              { key:'paleron',        label:'Paleron' },
              { key:'plat_de_cote',   label:'Plat de Côte' },
              { key:'lamb_shoulder',  label:'Épaule Agneau' },
            ].map(m => (
              <div key={m.key} onClick={() => navigate('/auth')} style={{ borderRadius:14, overflow:'hidden', position:'relative', height:130, cursor:'pointer', border:'1px solid #1e1a14', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='rgba(232,93,4,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='#1e1a14' }}
              >
                <img src={MEAT_IMAGES[m.key]} alt={m.label} style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }} />
                <div style={{ position:'absolute', bottom:10, left:12, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#fff' }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid #181410', padding:'28px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, background:'linear-gradient(135deg,#f48c06,#e85d04)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>🔥 PitMaster</div>
        <div style={{ display:'flex', gap:20 }}>
          {['Tarifs','CGU','Confidentialité','Contact'].map(l => (
            <span key={l} style={{ fontSize:12, color:'#3a2e24', cursor:'pointer' }}
              onMouseEnter={e=>e.currentTarget.style.color='#6a5a4a'} onMouseLeave={e=>e.currentTarget.style.color='#3a2e24'}
              onClick={() => l==='Tarifs'&&navigate('/pricing')}>{l}</span>
          ))}
        </div>
        <div style={{ fontSize:11, color:'#2a2218' }}>© 2026 PitMaster · Tous droits réservés</div>
      </footer>
    </div>
  )
}