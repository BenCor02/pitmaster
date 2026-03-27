import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HERO_IMAGE, MEAT_IMAGES, SMOKE_IMAGE, SMOKER_IMAGE } from '../lib/images'

const css = `
  @keyframes heroEnter { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes panelFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes glowPulse { 0%, 100% { opacity: .45; transform: scale(1); } 50% { opacity: .85; transform: scale(1.04); } }
  @keyframes emberSweep { 0% { transform: translateX(-14px); opacity: .16; } 100% { transform: translateX(14px); opacity: .32; } }
  .hero-item { animation: heroEnter .65s ease both; }
  .hero-item:nth-child(2) { animation-delay: .08s; }
  .hero-item:nth-child(3) { animation-delay: .16s; }
  .hero-item:nth-child(4) { animation-delay: .24s; }
  .hero-grid { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(380px, .92fr); gap: 34px; align-items: end; }
  .feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .link-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .material-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
  .guide-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
  .landing-split { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center; }
  .landing-footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .landing-section { padding: 0 24px 78px; }
  .landing-section-tight { padding: 0 24px 54px; }
  .hero-media { min-height: 620px; }
  .hero-panel { animation: panelFloat 8s ease-in-out infinite; }
  .hero-glow { animation: glowPulse 7s ease-in-out infinite; }
  .landing-topnav { display:flex; align-items:center; gap:18px; flex-wrap:wrap; }
  .landing-shell-pad { padding: 34px 24px 62px; }
  .landing-brand-sub { display:block; }
  .landing-hero-copy { max-width: 580px; font-size: 18px; color: #b7aea4; line-height: 1.65; margin-bottom: 30px; }
  .landing-hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(76px, 10.2vw, 148px); line-height: .84; letter-spacing: 0.035em; color: #f5f1ea; max-width: 760px; text-shadow: 0 12px 38px rgba(0,0,0,0.40); }
  .landing-hero-content { padding: 42px 20px 36px 28px; }
  .landing-cook-card { height: 240px; }
  .landing-hero-shell { position: relative; background: radial-gradient(circle at top right, rgba(229,57,53,0.18), transparent 26%), linear-gradient(180deg, #141414, #090909 72%); border: 1px solid #2b2b2b; border-radius: 18px; box-shadow: 0 28px 78px rgba(0,0,0,0.38); overflow: hidden; isolation:isolate; }
  .landing-hero-shell::before { content: ""; position: absolute; inset: 0; background: linear-gradient(120deg, transparent 0%, rgba(229,57,53,0.05) 46%, transparent 100%); mix-blend-mode: screen; animation: emberSweep 6s ease-in-out infinite alternate; pointer-events: none; }
  .landing-hero-shell::after { content:""; position:absolute; inset:0; background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0); background-size: 24px 24px; opacity:.18; pointer-events:none; }
  .landing-poster-frame { position: relative; min-height: 620px; border-radius: 16px; overflow: hidden; border: 1px solid #2b2b2b; background: #080808; box-shadow: 0 20px 44px rgba(0,0,0,0.28); }
  .landing-poster-overlay { position:absolute; inset:0; background: linear-gradient(180deg, rgba(9,9,9,0.08), rgba(9,9,9,0.34) 38%, rgba(9,9,9,0.92) 100%), linear-gradient(90deg, rgba(9,9,9,0.04), rgba(9,9,9,0.44) 55%, rgba(9,9,9,0.92)); }
  .landing-poster-copy { position:absolute; left:24px; right:24px; bottom:24px; display:grid; gap:14px; }
  .landing-hero-rail { display:grid; gap:12px; }
  .landing-stat-rail { display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:14px; }
  .landing-hero-stage { position:relative; padding: 18px 18px 16px; }
  .landing-hero-stage::before { content:""; position:absolute; inset:18px auto auto 18px; width:72px; height:1px; background:linear-gradient(90deg, rgba(245,241,234,.55), transparent); }
  .landing-hero-stage::after { content:""; position:absolute; right:18px; bottom:18px; width:110px; height:110px; border-radius:50%; background: radial-gradient(circle, rgba(249,115,22,.14), transparent 68%); pointer-events:none; }
  .landing-benefit-grid { display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap:18px; }
  /* PATCH: cartes plus denses, moins template, avec vraie matière sombre */
  .premium-card { background: linear-gradient(180deg, #1a1a1a, #161616); border: 1px solid #2b2b2b; border-radius: 14px; box-shadow: 0 14px 30px rgba(0,0,0,0.22); position: relative; overflow: hidden; transition: background 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease; }
  .premium-card::before { content: ""; position: absolute; inset: 0 auto auto 0; width: 100%; height: 1px; background: linear-gradient(90deg, rgba(249,115,22,0.22), transparent 60%); pointer-events: none; }
  .premium-card:hover { background: linear-gradient(180deg, #1f1f1f, #1b1b1b); border-color: #3a3a3a; }
  .dark-card { background: linear-gradient(180deg, #181818, #111111); border: 1px solid #2b2b2b; border-radius: 14px; box-shadow: 0 16px 34px rgba(0,0,0,0.22); position: relative; overflow: hidden; transition: background 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease; }
  .dark-card::before { content: ""; position: absolute; inset: 0 auto auto 0; width: 100%; height: 1px; background: linear-gradient(90deg, rgba(249,115,22,0.18), transparent 52%); pointer-events: none; }
  .dark-card:hover { background: linear-gradient(180deg, #1d1d1d, #161616); border-color: #3a3a3a; }
  .landing-metal-card { background: linear-gradient(180deg, #1a1a1a, #161616); border: 1px solid #2b2b2b; border-radius: 14px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 24px rgba(0,0,0,0.20); position: relative; overflow: hidden; transition: background 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease; }
  .landing-metal-card::after { content: ""; position: absolute; inset: auto 0 0 0; height: 2px; background: linear-gradient(90deg, rgba(198,40,40,0.8), rgba(249,115,22,0.38), transparent 80%); }
  .landing-metal-card:hover { background: linear-gradient(180deg, #1f1f1f, #1b1b1b); border-color: #3a3a3a; }
  .landing-steel-rule { height: 1px; width: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent); }
  .landing-fire-chip { padding: 8px 12px; border-radius: 12px; background: linear-gradient(180deg, rgba(198,40,40,0.14), rgba(198,40,40,0.05)); border: 1px solid rgba(198,40,40,0.18); color: #f5f1ea; font-size: 12px; font-weight: 700; letter-spacing: .02em; }
  .lift { transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease; }
  .lift:hover { transform: translateY(-2px); border-color: #3a3a3a !important; box-shadow: 0 18px 34px rgba(0,0,0,0.24); }
  @media (max-width: 1080px) {
    .hero-grid, .feature-grid, .material-grid, .landing-split, .landing-footer-grid, .landing-benefit-grid { grid-template-columns: 1fr; }
    .guide-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .hero-media { min-height: 440px; }
    .landing-stat-rail { grid-template-columns: 1fr; }
  }
  @media (max-width: 720px) {
    .link-grid, .guide-strip { grid-template-columns: 1fr; }
    .landing-topnav { gap: 10px; justify-content: flex-end; }
    .landing-topnav > button:not(.landing-cta) { display:none; }
    .landing-brand-sub { display:none; }
    .landing-shell-pad { padding: 20px 16px 52px; }
    .landing-section { padding: 0 16px 54px; }
    .landing-section-tight { padding: 0 16px 40px; }
    .hero-media, .landing-poster-frame { min-height: 360px; }
    .landing-hero-content { padding: 24px 8px 18px 8px; }
    .landing-hero-title { font-size: 72px; line-height: .9; }
    .landing-hero-copy { font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
    .landing-cook-card { height: 210px; }
    .landing-poster-copy { left: 14px; right: 14px; bottom: 14px; }
    .landing-hero-stage { padding: 16px 14px 14px; }
  }
`

const USER_QUESTIONS = [
  'À quelle heure allumer le fumoir ?',
  'Quand wrapper ?',
  'La viande sera-t-elle prête à temps ?',
  'Combien de repos prévoir ?',
]

const BENEFITS = [
  {
    title: 'Savoir quand démarrer',
    copy: 'Tu entres ta viande, son poids et ton heure de service. Le site te dit quand lancer la cuisson.',
  },
  {
    title: 'Prévoir le repos',
    copy: 'Le repos fait partie du plan. Tu vois plus facilement si tu es large ou si tu joues trop serré.',
  },
  {
    title: 'Mieux gérer le wrap',
    copy: 'Le plan te rappelle les bons repères de stall, de wrap et de fin de cuisson sans te noyer dans les chiffres.',
  },
  {
    title: 'Servir à l’heure',
    copy: 'Le vrai but, c’est de sortir une viande prête au bon moment quand les gens s’installent à table.',
  },
]

const HERO_METRICS = [
  ['Allumage', '06h00'],
  ['Viande au fumoir', '06h30'],
  ['Service visé', '19h00'],
]

const COOKS = [
  { key: 'brisket', title: 'Brisket', subtitle: 'Longue cuisson, stall, wrap, repos' },
  { key: 'ribs_pork', title: 'Ribs', subtitle: 'Couleur, pullback, flex test' },
  { key: 'pork_shoulder', title: 'Pulled pork', subtitle: 'Temps long, tendreté, effilochage' },
  { key: 'paleron', title: 'Paleron', subtitle: 'Alternative généreuse, très BBQ' },
  { key: 'ribs_beef', title: 'Short ribs', subtitle: 'Bark, tendreté, service' },
  { key: 'chicken_pieces', title: 'Poulet', subtitle: 'Cuisson plus vive, peau plus propre' },
  { key: 'lamb_shoulder', title: 'Agneau', subtitle: 'Version fondante, plus douce, plus souple' },
]

function ensureMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function IconFrame({ children, dark = false }) {
  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 14,
        display: 'grid',
        placeItems: 'center',
        background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(240,122,47,0.08)',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(240,122,47,0.12)'}`,
        color: dark ? '#fff5eb' : 'var(--orange)',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  )
}

function FireIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13.5 2.5c.4 2-1 3.7-2.3 5.1-1.2 1.2-2.2 2.4-2.2 4.2 0 1.9 1.4 3.2 3 3.2 2 0 3.5-1.6 3.5-3.8 0-1.2-.4-2.2-.9-3.4 2 1 4.4 3.3 4.4 6.8 0 4.2-3 7.4-7.3 7.4-4 0-7.2-3-7.2-7 0-3.8 2.2-6.2 4.1-8.2 1.8-1.8 3.4-3.4 3.8-5.9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.8v4.7l3 1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GaugeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 16a7 7 0 1 1 14 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 12l3.2-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 4.5h9l3 3v12H6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 4.5v5h6v-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  // PATCH: fallback visuel pour éviter un hero cassé si une image distante ne répond pas
  const [heroVisual, setHeroVisual] = useState(SMOKER_IMAGE)
  const [cardImageFallbacks, setCardImageFallbacks] = useState({})

  useEffect(() => {
    document.title = 'Calculateur BBQ Pitmaster | Charbon & Flamme'
    ensureMeta('description', 'Brisket, ribs, pulled pork : entre ta viande, ton poids et ton heure de service. Charbon & Flamme te dit quand lancer la cuisson.')
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // PATCH: la landing peut envoyer une viande déjà choisie vers le calculateur
  const openCalculator = (preselectMeatKey = null) =>
    navigate('/app', { state: preselectMeatKey ? { preselectMeatKey } : undefined })
  const saveCook = () => navigate('/auth', { state: { from: '/app', reason: 'save-planning' } })
  // PATCH: les liens de la landing font soit un vrai scroll, soit une vraie navigation app
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const getCardImage = (key) => cardImageFallbacks[key] || MEAT_IMAGES[key] || SMOKE_IMAGE

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
      <style>{css}</style>

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 80,
          height: 76,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 22px',
          background: scrolled ? 'rgba(9,9,9,0.94)' : 'rgba(9,9,9,0.76)',
          borderBottom: '1px solid #2b2b2b',
          backdropFilter: 'blur(20px)',
        }}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg,var(--orange-light),var(--orange-deep))', border: '1px solid #7f1d1d', color: '#fff', boxShadow: '0 10px 20px rgba(198,40,40,0.18)', fontFamily: 'Rajdhani, sans-serif', fontSize: 16, fontWeight: 700, letterSpacing: '.08em' }}>
            CF
          </div>
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 18, fontWeight: 700, lineHeight: 1, letterSpacing: '.03em' }}>Charbon &amp; Flamme</div>
            <div className="pm-eyebrow landing-brand-sub" style={{ marginTop: 3, color:'var(--text3)' }}>planifier sa cuisson bbq</div>
          </div>
        </button>

        <nav className="landing-topnav">
          {[
            ['Calculateur', () => scrollToSection('calculateur')],
            ['Cuissons', () => scrollToSection('cuissons')],
            ['Comment ça marche', () => scrollToSection('comment-ca-marche')],
            ['Ouvrir l’app', openCalculator],
          ].map(([label, action]) => (
            <button key={label} onClick={action} style={{ background:'none', border:'none', padding:0, color:'var(--text2)', fontSize: 13, fontWeight: 600, cursor:'pointer', letterSpacing: '.02em' }}>
              {label}
            </button>
          ))}
          <button onClick={saveCook} className="pm-btn-secondary landing-cta" style={{ width: 'auto', padding: '12px 16px', fontSize: 12 }}>
            Mes cuissons
          </button>
        </nav>
      </header>

      <section className="landing-shell-pad">
        {/* PATCH: hero transformé en vraie affiche premium, moins app générique et plus univers pitmaster */}
        <div className="pm-shell landing-hero-shell landing-hero-stage">
          <div className="hero-glow" style={{ position: 'absolute', right: -80, top: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,57,53,0.30), transparent 68%)', pointerEvents: 'none' }} />
          <div className="hero-grid" style={{ position: 'relative', zIndex: 1 }}>
            <div className="landing-hero-content">
              <div className="hero-item pm-kicker" style={{ marginBottom: 18 }}>charbon · acier noirci · feu maîtrisé</div>
              <div className="hero-item" style={{ marginBottom: 14 }}>
                <h1 className="landing-hero-title">
                  À QUELLE HEURE
                  <br />
                  LANCER TA
                  <br />
                  <span style={{ color: 'var(--ember)' }}>CUISSON BBQ ?</span>
                </h1>
              </div>
              <p className="hero-item landing-hero-copy">
                Brisket, ribs, pulled pork, paleron. Tu choisis la pièce, le poids et l’heure de service. Charbon &amp; Flamme te donne quand allumer le fumoir, quand poser la viande et comment rester large jusqu’au service.
              </p>
              <div className="hero-item" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                <button onClick={() => openCalculator()} className="pm-btn-primary" style={{ width: 'auto', minWidth: 240 }}>
                  Calculer ma cuisson
                </button>
                <button onClick={() => scrollToSection('comment-ca-marche')} className="pm-btn-secondary" style={{ width: 'auto' }}>
                  Voir comment ça marche
                </button>
              </div>
              <div className="hero-item" style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom: 20 }}>
                {['À quelle heure lancer ?', 'Quand wrapper ?', 'Peut-on dormir tranquille ?'].map((item) => (
                  <span key={item} className="landing-fire-chip">{item}</span>
                ))}
              </div>
              <div className="landing-steel-rule hero-item" style={{ marginBottom: 18 }} />
              <div className="hero-item landing-benefit-grid" style={{ marginTop: 8 }}>
                {BENEFITS.map(({ title, copy }) => (
                  <div key={title} style={{ display: 'grid', gap: 8 }}>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 20, fontWeight: 700, color: '#f5f1ea', letterSpacing: '.02em' }}>{title}</div>
                    <p style={{ fontSize: 14, color: '#b7aea4', lineHeight: 1.6 }}>{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: 8 }}>
              <div className="landing-poster-frame hero-panel">
                <img
                  src={heroVisual}
                  alt="Fumoir en action"
                  onError={() => {
                    if (heroVisual !== HERO_IMAGE) {
                      setHeroVisual(HERO_IMAGE)
                      return
                    }
                    if (heroVisual !== SMOKE_IMAGE) {
                      setHeroVisual(SMOKE_IMAGE)
                    }
                  }}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.92) contrast(1.06)' }}
                />
                <div className="landing-poster-overlay" />
                <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="pm-kicker">service sous contrôle</div>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    {[0, 1, 2].map((dot) => (
                      <span key={dot} style={{ width: 8, height: 8, borderRadius: '50%', background: dot === 0 ? 'var(--orange)' : 'rgba(255,255,255,0.34)' }} />
                    ))}
                  </div>
                </div>
                <div className="landing-poster-copy">
                  <div style={{ display:'grid', gap: 8 }}>
                    <div className="pm-eyebrow" style={{ color: 'rgba(255,245,235,0.60)' }}>exemple de service</div>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(48px, 8vw, 84px)', lineHeight: .9, letterSpacing: '.04em', color: '#fff5eb' }}>
                      BRISKET
                      <br />
                      PRÊTE POUR 19H
                    </div>
                  </div>
                  <div className="landing-stat-rail">
                    {HERO_METRICS.map(([label, value]) => (
                      <div key={label} className="landing-metal-card" style={{ padding: '16px 18px', background: 'rgba(17,17,17,0.70)', backdropFilter: 'blur(12px)' }}>
                        <div className="pm-eyebrow" style={{ color: 'rgba(255,245,235,0.56)', marginBottom: 8 }}>{label}</div>
                        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 28, fontWeight: 700, color: '#fff5eb', letterSpacing: '.02em' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="landing-hero-rail">
                    <div className="landing-metal-card" style={{ padding: '16px 18px', background: 'rgba(17,17,17,0.76)', backdropFilter: 'blur(14px)' }}>
                      <div className="pm-eyebrow" style={{ color: 'rgba(255,245,235,0.56)', marginBottom: 8 }}>repères pitmaster</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {['Stall 65–75°C', 'Wrap 70–75°C', 'Tests dès 90°C'].map((item) => (
                          <span key={item} style={{ padding: '7px 11px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,245,235,0.82)', fontSize: 11, fontWeight: 700 }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ color: '#b7aea4', fontSize: 14, maxWidth: 320, lineHeight: 1.6 }}>
                        Plus besoin de deviner si tu dois te lever à 4h ou si ta viande sortira trop tard.
                      </div>
                      <button onClick={() => openCalculator()} className="pm-btn-primary" style={{ width: 'auto', minWidth: 200 }}>
                        Lancer maintenant
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section-tight">
        <div className="pm-shell" style={{ padding: '0 4px' }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div className="pm-kicker">Pourquoi c’est utile</div>
            <h2 className="pm-section-title" style={{ fontSize: 'clamp(30px, 4.8vw, 48px)' }}>
              Plus besoin de deviner.
            </h2>
            <p className="pm-section-copy" style={{ maxWidth: 760 }}>
              Tu n’as plus à choisir au hasard entre finir trop tard ou te lever à 4h. Le site t’aide à prévoir large, à mieux gérer le repos et à servir une viande prête au bon moment.
            </p>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop: 2 }}>
              {USER_QUESTIONS.map((item) => (
                <span key={item} className="landing-fire-chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="calculateur" className="landing-section">
        <div className="pm-shell premium-card" style={{ padding: 30 }}>
          <div className="landing-split">
            <div>
              <div className="pm-eyebrow" style={{ marginBottom: 10, color:'var(--text3)' }}>Le calculateur</div>
              <h2 className="pm-section-title" style={{ fontSize: 'clamp(34px, 4.8vw, 58px)', marginBottom: 14 }}>
                Entre ta cuisson.
                <br />
                Reçois ton plan.
              </h2>
              <p className="pm-section-copy" style={{ maxWidth: 540 }}>
                Choisis la viande, entre le poids, règle ton fumoir et ton heure de service. En quelques secondes, tu sais quand lancer la cuisson.
              </p>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop: 18 }}>
                <button onClick={() => openCalculator()} className="pm-btn-primary" style={{ width: 'auto', padding: '14px 22px' }}>
                  Calculer maintenant
                </button>
                <button onClick={saveCook} className="pm-btn-secondary" style={{ width: 'auto', padding: '14px 18px' }}>
                  Retrouver mes plans
                </button>
              </div>
            </div>
            <div className="feature-grid">
              {[
                ['Tu sais quand démarrer', <ClockIcon key="clock" />],
                ['Tu prévois le repos', <GaugeIcon key="gauge" />],
                ['Tu retrouves tes cuissons', <SaveIcon key="save" />],
              ].map(([label, icon]) => (
                <div key={label} className="landing-metal-card lift" style={{ padding: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <IconFrame>{icon}</IconFrame>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 21, fontWeight: 700, color: 'var(--text)', letterSpacing: '.02em' }}>{label}</div>
                  </div>
                  <p style={{ fontSize: 14, color:'var(--text2)', lineHeight: 1.6 }}>
                    Une réponse claire à une vraie question de cuisson, sans te noyer dans le détail.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="pm-shell feature-grid">
          {[
            ['Tu ne rates plus ton départ', 'Tu vois rapidement si ton service demande un lancement la veille, un réveil tôt ou un départ confortable le matin.'],
            ['Tu gères mieux ton repos', 'Le plan n’oublie pas le hold. C’est souvent lui qui sauve un service propre et une viande plus sereine.'],
            ['Tu cuisines avec une vraie ligne de conduite', 'Repères de stall, wrap, tests de tendreté et fenêtre de service : tu avances avec des points concrets.'],
          ].map(([title, copy]) => (
            <div key={title} style={{ paddingTop: 22, borderTop: '1px solid #2b2b2b' }}>
              <h3 style={{ fontSize: 24, color: 'var(--text)', marginBottom: 10, fontFamily: 'Rajdhani, sans-serif', letterSpacing: '.02em' }}>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="cuissons" className="landing-section">
        <div className="pm-shell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <div className="pm-eyebrow" style={{ marginBottom: 10, color:'var(--text3)' }}>Pour quelles cuissons ?</div>
              <h2 className="pm-section-title" style={{ fontSize: 'clamp(30px, 4.5vw, 52px)' }}>Les cuissons qui comptent vraiment.</h2>
            </div>
            <p className="pm-section-copy" style={{ maxWidth: 420 }}>
              Brisket, ribs, pulled pork, paleron, short ribs, poulet, agneau. Tu te projettes tout de suite dans ta prochaine cuisson.
            </p>
          </div>

          <div className="guide-strip">
            {COOKS.map((item) => (
              <button
                key={item.key}
                onClick={() => openCalculator(item.key)}
                className="dark-card lift"
                style={{ overflow: 'hidden', cursor: 'pointer', textAlign: 'left', color: 'inherit', padding: 0 }}
              >
                <div className="landing-cook-card" style={{ position: 'relative' }}>
                  <img
                    src={getCardImage(item.key)}
                    alt={item.title}
                    onError={() => setCardImageFallbacks(prev => ({ ...prev, [item.key]: SMOKE_IMAGE }))}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter:'saturate(.92) contrast(1.02)' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(23,18,15,0.9), rgba(23,18,15,0.08) 60%)' }} />
                  <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
                    <div className="pm-eyebrow" style={{ color: 'rgba(255,245,235,0.58)', marginBottom: 8 }}>Cuisson</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#fff5eb', marginBottom: 6 }}>{item.title}</div>
                    <p style={{ color: 'rgba(255,245,235,0.76)', fontSize: 13 }}>{item.subtitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="comment-ca-marche" className="landing-section">
        <div className="pm-shell premium-card" style={{ padding: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <div className="pm-eyebrow" style={{ marginBottom: 10, color:'var(--text3)' }}>Comment ça marche ?</div>
              <h2 className="pm-section-title" style={{ fontSize: 'clamp(30px, 4.5vw, 52px)' }}>Trois étapes, pas plus.</h2>
            </div>
            <p className="pm-section-copy" style={{ maxWidth: 420 }}>
              Le but n’est pas de t’impressionner. Le but, c’est de t’aider à lancer ta cuisson au bon moment.
            </p>
          </div>

          <div className="material-grid">
            {[
              ['01', 'Choisis ta viande', 'Brisket, ribs, pulled pork, poulet, agneau… commence par la cuisson que tu prépares.'],
              ['02', 'Entre ton poids et ton heure', 'Tu donnes le poids, la méthode et l’heure à laquelle tu veux servir.'],
              ['03', 'Reçois ton plan', 'Le site te donne l’heure de départ, la fenêtre de service et les repères utiles.'],
            ].map(([step, title, copy]) => (
              <div key={title} className="landing-metal-card lift" style={{ padding: 22 }}>
                <div style={{ display: 'inline-flex', marginBottom: 12, padding: '6px 10px', borderRadius: 10, background: 'var(--orange-bg)', border: '1px solid var(--orange-border)', color: 'var(--orange)', fontSize: 11, fontWeight: 800 }}>
                  {step}
                </div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 10, letterSpacing: '.02em' }}>{title}</div>
                <p style={{ marginBottom: 16 }}>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="guides" className="landing-section">
        <div className="pm-shell">
          <div className="premium-card" style={{ padding: 28 }}>
            <div className="pm-eyebrow" style={{ marginBottom: 10, color:'var(--text3)' }}>À garder en tête</div>
            <h2 className="pm-section-title" style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: 12 }}>
              Le BBQ reste vivant.
            </h2>
            <p className="pm-section-copy" style={{ maxWidth: 760, marginBottom: 18 }}>
              La viande, le fumoir et la météo peuvent faire bouger la cuisson. Le but est de prévoir large, de garder une vraie marge de repos et de préférer une viande prête un peu tôt qu’un service en retard.
            </p>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {[
                'Prévoir large',
                'Le repos compte',
                'Le wrap aide',
                'Mieux vaut finir un peu tôt',
              ].map((item) => (
                <span key={item} className="landing-fire-chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #2b2b2b', padding: '32px 16px 56px' }}>
        <div className="pm-shell">
          <div className="landing-footer-grid">
            <div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: '.03em' }}>Charbon &amp; Flamme</div>
              <p className="pm-section-copy" style={{ maxWidth: 420 }}>
                Lance ta cuisson avec un vrai plan. Prépare ton prochain service sans deviner.
              </p>
              <div style={{ marginTop: 16, display:'flex', gap:10, flexWrap:'wrap' }}>
                <button onClick={() => openCalculator()} className="pm-btn-primary" style={{ width:'auto', padding:'14px 18px' }}>
                  Tester le calculateur
                </button>
                <button onClick={saveCook} className="pm-btn-secondary" style={{ width:'auto', padding:'14px 18px' }}>
                  Retrouver mes cuissons
                </button>
              </div>
            </div>
            <div className="link-grid">
              {USER_QUESTIONS.concat(['Brisket', 'Ribs']).map((label) => (
                <button
                  key={label}
                  onClick={() => openCalculator()}
                  style={{ textAlign: 'left', background: 'none', border: 'none', padding: '0 0 8px', cursor: 'pointer', color: 'var(--text2)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
