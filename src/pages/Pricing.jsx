import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePlan } from '../hooks/usePlan'
// Limites définies localement pour la page Pricing (statiques)
const PLAN_LIMITS = {
  free:  { sessions: 10, journal: 5, ask_ai_daily: 3, party_meats: 2, export_pdf: false, custom_meats: false },
  pro:   { sessions: Infinity, journal: Infinity, ask_ai_daily: 50, party_meats: Infinity, export_pdf: true, custom_meats: false },
  ultra: { sessions: Infinity, journal: Infinity, ask_ai_daily: Infinity, party_meats: Infinity, export_pdf: true, custom_meats: true },
}


const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .fade-up{animation:fadeUp 0.3s ease both}
  .plan-card{border-radius:18px;padding:28px;border:1px solid;position:relative;overflow:hidden;transition:transform 0.2s,box-shadow 0.2s}
  .plan-card:hover{transform:translateY(-3px)}
  .feat-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px}
  .feat-row:last-child{border-bottom:none}
  .faq-item{border-bottom:1px solid #1e1a14;overflow:hidden}
  .faq-q{display:flex;justify-content:space-between;align-items:center;padding:16px 0;cursor:pointer;font-weight:600;font-size:14px;color:#d4c4b0}
  .faq-a{padding:0 0 16px;font-size:13px;color:#6a5a4a;line-height:1.7}
`

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    color: '#6a5a4a',
    border: '#2a2418',
    bg: '#0e0c0a',
    desc: 'Pour découvrir PitMaster',
    features: [
      { label: 'Calculateur BBQ complet', ok: true },
      { label: 'Fumage à froid & SSV', ok: true },
      { label: 'Cook Party (2 viandes max)', ok: true },
      { label: '10 sessions sauvegardées', ok: true },
      { label: '5 entrées journal', ok: true },
      { label: '3 questions IA / jour', ok: true },
      { label: 'Sessions illimitées', ok: false },
      { label: 'Export PDF', ok: false },
      { label: 'IA illimitée', ok: false },
    ],
    cta: 'Commencer gratuitement',
    ctaStyle: { border:'1px solid #2a2418', background:'transparent', color:'#8a7060' },
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 4.99,
    price_yearly: 39.99,
    color: '#e85d04',
    border: 'rgba(232,93,4,0.4)',
    bg: 'linear-gradient(160deg,#1e1208,#171410)',
    desc: 'Pour les pit-masters sérieux',
    badge: 'POPULAIRE',
    features: [
      { label: 'Tout le plan Free', ok: true },
      { label: 'Sessions illimitées', ok: true },
      { label: 'Journal illimité', ok: true },
      { label: 'Cook Party illimité', ok: true },
      { label: '50 questions IA / jour', ok: true },
      { label: 'Export PDF', ok: true },
      { label: 'Support prioritaire', ok: true },
      { label: 'Viandes personnalisées', ok: false },
      { label: 'IA illimitée', ok: false },
    ],
    cta: 'Passer Pro',
    ctaStyle: { border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', boxShadow:'0 4px 20px rgba(232,93,4,0.35)' },
  },
  {
    key: 'ultra',
    name: 'Ultra',
    price: 9.99,
    price_yearly: 79.99,
    color: '#f48c06',
    border: 'rgba(244,140,6,0.4)',
    bg: 'linear-gradient(160deg,#1a1608,#171410)',
    desc: 'Pour les professionnels & restaurateurs',
    badge: 'COMPLET',
    features: [
      { label: 'Tout le plan Pro', ok: true },
      { label: 'IA illimitée', ok: true },
      { label: 'Viandes personnalisées', ok: true },
      { label: 'API access', ok: true },
      { label: 'Custom branding', ok: true },
      { label: 'Multi-utilisateurs', ok: true },
      { label: 'Export PDF avancé', ok: true },
      { label: 'Support dédié 24/7', ok: true },
      { label: 'Onboarding personnalisé', ok: true },
    ],
    cta: 'Passer Ultra',
    ctaStyle: { border:'none', background:'linear-gradient(135deg,#f48c06,#e85d04)', color:'#fff', boxShadow:'0 4px 20px rgba(244,140,6,0.3)' },
  },
]

const FAQS = [
  { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui, vous pouvez upgrader ou downgrader à tout moment. Le changement est immédiat. En cas de downgrade, votre plan actuel reste actif jusqu\'à la fin de la période en cours.' },
  { q: 'Comment fonctionne le plan Free ?', a: 'Le plan Free est gratuit pour toujours. Vous avez accès au calculateur BBQ complet, au fumage à froid, et à toutes les fonctionnalités de base avec des limites raisonnables.' },
  { q: 'Les données sont-elles sécurisées ?', a: 'Oui. Toutes les données sont hébergées sur Supabase (infrastructure sécurisée) avec chiffrement en transit et au repos. Nous ne revendons jamais vos données.' },
  { q: 'Proposez-vous des réductions pour les restaurants ?', a: 'Oui ! Pour les restaurants et professionnels avec plusieurs utilisateurs, contactez-nous pour un tarif personnalisé.' },
  { q: 'Y a-t-il un essai gratuit Pro ?', a: 'Le plan Free est déjà très complet pour commencer. Un essai Pro de 7 jours sera bientôt disponible.' },
]

export default function Pricing() {
  const { user } = useAuth()
  const { plan: currentPlan } = usePlan()
  const navigate = useNavigate()
  const [yearly, setYearly] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  function handleCTA(planKey) {
    if (!user) { navigate('/auth'); return }
    if (planKey === 'free') { navigate('/app'); return }
    // TODO: Stripe checkout
    navigate('/app') // Temporaire avant intégration Stripe
  }

  return (
    <div style={{ minHeight:'100vh', background:'#080706', fontFamily:'DM Sans,sans-serif', overflowX:'hidden' }}>
      <style>{css}</style>

      {/* NAV */}
      <nav style={{ height:54, borderBottom:'1px solid #181410', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', position:'sticky', top:0, background:'rgba(8,7,6,0.95)', backdropFilter:'blur(20px)', zIndex:50 }}>
        <div onClick={() => navigate('/app')} style={{ cursor:'pointer', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, background:'linear-gradient(135deg,#f48c06,#e85d04)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          🔥 PitMaster
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {user ? (
            <button onClick={() => navigate('/app')} style={{ padding:'7px 16px', borderRadius:8, border:'1px solid #1e1a14', background:'transparent', color:'#8a7060', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              ← Retour à l'app
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/auth')} style={{ padding:'7px 16px', borderRadius:8, border:'1px solid #1e1a14', background:'transparent', color:'#8a7060', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                Connexion
              </button>
              <button onClick={() => navigate('/auth')} style={{ padding:'7px 16px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                Essayer gratuitement
              </button>
            </>
          )}
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'60px 24px' }}>

        {/* HEADER */}
        <div className="fade-up" style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(232,93,4,0.08)', border:'1px solid rgba(232,93,4,0.2)', borderRadius:20, padding:'5px 14px', fontSize:12, fontWeight:700, color:'#e85d04', fontFamily:'Syne,sans-serif', letterSpacing:'0.5px', marginBottom:16 }}>
            🔥 TARIFS SIMPLES ET TRANSPARENTS
          </div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:44, color:'#fff', letterSpacing:'-1px', lineHeight:1.1, marginBottom:12 }}>
            Devenez un vrai<br /><span style={{ color:'#e85d04' }}>Pit-Master</span>
          </h1>
          <p style={{ fontSize:16, color:'#6a5a4a', lineHeight:1.6, maxWidth:500, margin:'0 auto 28px' }}>
            Commencez gratuitement. Upgradez quand vous êtes prêt.
          </p>

          {/* TOGGLE MENSUEL/ANNUEL */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, background:'#0e0c0a', border:'1px solid #1e1a14', borderRadius:12, padding:'6px 8px' }}>
            <button onClick={() => setYearly(false)} style={{ padding:'7px 16px', borderRadius:8, border:'none', background:!yearly?'#e85d04':'transparent', color:!yearly?'#fff':'#6a5a4a', fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
              Mensuel
            </button>
            <button onClick={() => setYearly(true)} style={{ padding:'7px 16px', borderRadius:8, border:'none', background:yearly?'#e85d04':'transparent', color:yearly?'#fff':'#6a5a4a', fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', gap:6 }}>
              Annuel
              <span style={{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', color:'#22c55e', fontSize:10, fontWeight:800, padding:'1px 6px', borderRadius:4 }}>-33%</span>
            </button>
          </div>
        </div>

        {/* PLANS */}
        <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:60 }}>
          {PLANS.map((p, i) => (
            <div key={p.key} className="plan-card" style={{ background:p.bg, borderColor:p.border, boxShadow: p.key==='pro'?'0 0 40px rgba(232,93,4,0.1)':'none', animationDelay:`${i*0.1}s` }}>
              {p.badge && (
                <div style={{ position:'absolute', top:16, right:16, background:p.color, color:'#fff', fontSize:9, fontWeight:800, letterSpacing:'1.5px', padding:'3px 8px', borderRadius:5, fontFamily:'Syne,sans-serif' }}>{p.badge}</div>
              )}
              {currentPlan === p.key && (
                <div style={{ position:'absolute', top:16, left:16, background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', color:'#22c55e', fontSize:9, fontWeight:800, letterSpacing:'1px', padding:'3px 8px', borderRadius:5, fontFamily:'Syne,sans-serif' }}>PLAN ACTUEL</div>
              )}

              <div style={{ marginBottom:20, paddingTop: (p.badge || currentPlan===p.key) ? 8 : 0 }}>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, color:p.color, marginBottom:4 }}>{p.name}</div>
                <div style={{ fontSize:12, color:'#4a3a2e', marginBottom:16 }}>{p.desc}</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                  <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:40, color:'#fff', lineHeight:1, letterSpacing:'-1px' }}>
                    {p.price === 0 ? 'Gratuit' : `${yearly ? (p.price_yearly/12).toFixed(2) : p.price}€`}
                  </span>
                  {p.price !== 0 && <span style={{ fontSize:12, color:'#4a3a2e' }}>/mois</span>}
                </div>
                {p.price !== 0 && yearly && (
                  <div style={{ fontSize:11, color:'#22c55e', marginTop:3 }}>Facturé {p.price_yearly}€/an — économisez {Math.round((p.price*12-p.price_yearly)/p.price*100/12)}%</div>
                )}
                {p.price !== 0 && !yearly && (
                  <div style={{ fontSize:11, color:'#4a3a2e', marginTop:3 }}>ou {p.price_yearly}€/an (-33%)</div>
                )}
              </div>

              <button onClick={() => handleCTA(p.key)} style={{ width:'100%', padding:'13px', borderRadius:10, fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:20, transition:'all 0.15s', ...p.ctaStyle }}>
                {currentPlan === p.key ? '✓ Plan actuel' : p.cta}
              </button>

              <div>
                {p.features.map((f, fi) => (
                  <div key={fi} className="feat-row">
                    <span style={{ fontSize:13, color: f.ok ? '#22c55e' : '#2a2418', flexShrink:0 }}>{f.ok ? '✓' : '✗'}</span>
                    <span style={{ color: f.ok ? '#d4c4b0' : '#3a2e24' }}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* SOCIAL PROOF */}
        <div className="fade-up" style={{ textAlign:'center', marginBottom:60 }}>
          <div style={{ fontSize:12, color:'#4a3a2e', letterSpacing:'1px', textTransform:'uppercase', fontWeight:600, marginBottom:20 }}>Ils font confiance à PitMaster</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {[
              { name:'Thomas R.', role:'Passionné BBQ', text:'Le calculateur de brisket est incroyable. Plus jamais de stall surprise. Le meilleur outil BBQ que j\'ai utilisé.', plan:'Pro' },
              { name:'Marie L.', role:'Restauratrice', text:'J\'utilise PitMaster pour tous mes événements. La Cook Party multi-viandes me sauve à chaque fois.', plan:'Ultra' },
              { name:'Julien K.', role:'Pit-master amateur', text:'L\'IA répond à toutes mes questions BBQ. Le journal me permet de progresser vraiment.', plan:'Pro' },
            ].map((t, i) => (
              <div key={i} style={{ background:'#0e0c0a', border:'1px solid #1e1a14', borderRadius:14, padding:20, textAlign:'left' }}>
                <div style={{ display:'flex', gap:3, marginBottom:10 }}>
                  {[1,2,3,4,5].map(n => <span key={n} style={{ color:'#f48c06', fontSize:13 }}>★</span>)}
                </div>
                <p style={{ fontSize:13, color:'#8a7060', lineHeight:1.7, marginBottom:14, fontStyle:'italic' }}>"{t.text}"</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#d4c4b0' }}>{t.name}</div>
                    <div style={{ fontSize:11, color:'#4a3a2e' }}>{t.role}</div>
                  </div>
                  <div style={{ background:'rgba(232,93,4,0.1)', border:'1px solid rgba(232,93,4,0.2)', borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:700, color:'#e85d04', fontFamily:'Syne,sans-serif' }}>
                    Plan {t.plan}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="fade-up" style={{ maxWidth:680, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#fff', letterSpacing:'-0.5px' }}>Questions fréquentes</h2>
          </div>
          {FAQS.map((faq, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => setOpenFaq(openFaq===i?null:i)}>
                <span style={{ fontFamily:'Syne,sans-serif' }}>{faq.q}</span>
                <span style={{ fontSize:18, color:'#e85d04', transform:openFaq===i?'rotate(45deg)':'none', transition:'transform 0.2s', flexShrink:0 }}>+</span>
              </div>
              {openFaq===i && <div className="faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>

        {/* CTA FINAL */}
        <div className="fade-up" style={{ textAlign:'center', marginTop:60, padding:'40px', background:'linear-gradient(160deg,#1a1208,#171410)', border:'1px solid rgba(232,93,4,0.2)', borderRadius:20 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'2px', color:'#e85d04', textTransform:'uppercase', marginBottom:12 }}>PRÊT À DEVENIR UN PIT-MASTER ?</div>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:32, color:'#fff', letterSpacing:'-0.5px', marginBottom:8 }}>Commencez gratuitement</h2>
          <p style={{ fontSize:14, color:'#6a5a4a', marginBottom:24 }}>Aucune carte bancaire requise · Upgrade quand vous voulez</p>
          <button onClick={() => navigate('/auth')} style={{ padding:'15px 40px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#f48c06,#d44e00)', color:'#fff', fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(232,93,4,0.35)' }}>
            🔥 Créer mon compte gratuit
          </button>
        </div>
      </div>
    </div>
  )
}