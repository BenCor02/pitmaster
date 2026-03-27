import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HERO_IMAGE, MEAT_IMAGES, SMOKER_IMAGE } from '../lib/images'

const css = `
  @keyframes heroEnter { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes panelFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes glowPulse { 0%, 100% { opacity: .45; transform: scale(1); } 50% { opacity: .85; transform: scale(1.04); } }
  .hero-item { animation: heroEnter .65s ease both; }
  .hero-item:nth-child(2) { animation-delay: .08s; }
  .hero-item:nth-child(3) { animation-delay: .16s; }
  .hero-item:nth-child(4) { animation-delay: .24s; }
  .hero-grid { display: grid; grid-template-columns: 1.08fr .92fr; gap: 28px; }
  .feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .link-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .material-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .guide-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
  .landing-split { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center; }
  .landing-footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .hero-media { min-height: 520px; }
  .hero-panel { animation: panelFloat 8s ease-in-out infinite; }
  .hero-glow { animation: glowPulse 7s ease-in-out infinite; }
  .landing-topnav { display:flex; align-items:center; gap:18px; flex-wrap:wrap; }
  .landing-shell-pad { padding: 34px 24px 62px; }
  /* PATCH: landing alignée sur le thème dark premium de l'app */
  .premium-card { background: linear-gradient(180deg, rgba(26,26,26,0.96), rgba(16,16,16,0.98)); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; box-shadow: 0 18px 44px rgba(0,0,0,0.24); }
  .dark-card { background: linear-gradient(180deg, rgba(23,18,15,0.96), rgba(15,12,10,0.98)); border: 1px solid rgba(255,255,255,0.08); border-radius: 30px; box-shadow: 0 22px 54px rgba(25,18,14,0.32); }
  .lift { transition: transform .24s ease, border-color .24s ease, box-shadow .24s ease; }
  .lift:hover { transform: translateY(-3px); border-color: rgba(240,122,47,0.22) !important; box-shadow: 0 24px 52px rgba(0,0,0,0.28); }
  @media (max-width: 1080px) {
    .hero-grid, .feature-grid, .material-grid, .landing-split, .landing-footer-grid { grid-template-columns: 1fr; }
    .guide-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .hero-media { min-height: 440px; }
  }
  @media (max-width: 720px) {
    .link-grid, .guide-strip { grid-template-columns: 1fr; }
    .landing-topnav { gap: 10px; justify-content: flex-end; }
    .landing-topnav > button:not(.landing-cta) { display:none; }
    .landing-shell-pad { padding: 20px 16px 44px; }
    .hero-media { min-height: 360px; }
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

  useEffect(() => {
    document.title = 'Calculateur BBQ Pitmaster | Charbon & Flamme'
    ensureMeta('description', 'Brisket, ribs, pulled pork : entre ta viande, ton poids et ton heure de service. Charbon & Flamme te dit quand lancer la cuisson.')
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openCalculator = () => navigate('/app')
  const saveCook = () => navigate('/auth', { state: { from: '/app', reason: 'save-planning' } })
  // PATCH: les liens de la landing font soit un vrai scroll, soit une vraie navigation app
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
          background: scrolled ? 'rgba(12,12,12,0.92)' : 'rgba(12,12,12,0.72)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg,var(--orange-light),var(--orange-deep))', color: '#fff', boxShadow: '0 16px 34px rgba(197,83,25,0.22)', fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 800 }}>
            CF
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, lineHeight: 1 }}>Charbon &amp; Flamme</div>
            <div className="pm-eyebrow" style={{ marginTop: 3, color:'var(--text3)' }}>planifier sa cuisson bbq</div>
          </div>
        </button>

        <nav className="landing-topnav">
          {[
            ['Calculateur', () => scrollToSection('calculateur')],
            ['Cuissons', () => scrollToSection('cuissons')],
            ['Comment ça marche', () => scrollToSection('comment-ca-marche')],
            ['Ouvrir l’app', openCalculator],
          ].map(([label, action]) => (
            <button key={label} onClick={action} style={{ background:'none', border:'none', padding:0, color:'var(--text2)', fontSize: 13, fontWeight: 600, cursor:'pointer' }}>
              {label}
            </button>
          ))}
          <button onClick={saveCook} className="pm-btn-secondary landing-cta" style={{ width: 'auto', padding: '12px 16px', fontSize: 12 }}>
            Mes cuissons
          </button>
        </nav>
      </header>

      <section className="landing-shell-pad">
        <div className="pm-shell dark-card" style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
          <div className="hero-glow" style={{ position: 'absolute', right: -80, top: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,122,47,0.28), transparent 68%)', pointerEvents: 'none' }} />
          <div className="hero-grid" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ padding: '28px 16px 18px 20px' }}>
              <div className="hero-item pm-kicker" style={{ marginBottom: 18 }}>brisket · ribs · pulled pork · agneau</div>
              <div className="hero-item" style={{ marginBottom: 14 }}>
                <h1 style={{ fontSize: 'clamp(46px, 8vw, 96px)', lineHeight: 0.92, letterSpacing: '-4px', color: '#fff5eb', maxWidth: 820 }}>
                  À quelle heure
                  <br />
                  <span style={{ color: 'var(--ember)' }}>lancer ton BBQ ?</span>
                </h1>
              </div>
              <p className="hero-item" style={{ maxWidth: 560, fontSize: 18, color: 'rgba(255,245,235,0.76)', lineHeight: 1.7, marginBottom: 26 }}>
                Entre ta viande, son poids et ton heure de service. On te dit quand allumer le fumoir, quand poser la viande et quelle fenêtre viser pour servir à temps.
              </p>
              <div className="hero-item" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
                <button onClick={openCalculator} className="pm-btn-primary" style={{ width: 'auto', padding: '16px 28px', fontSize: 15 }}>
                  Calculer ma cuisson
                </button>
                <button onClick={() => scrollToSection('comment-ca-marche')} className="pm-btn-secondary" style={{ width: 'auto', padding: '15px 20px', fontSize: 15, background: 'rgba(255,255,255,0.06)', color: '#fff5eb', border: '1px solid rgba(255,255,255,0.12)' }}>
                  Voir comment ça marche
                </button>
              </div>
              <div className="hero-item feature-grid" style={{ marginTop: 8 }}>
                {[
                  ['Départ', '06h00', <ClockIcon key="clock" />],
                  ['Service', '18h00 → 19h30', <FireIcon key="fire" />],
                  ['Fumoir', '110°C stables', <GaugeIcon key="gauge" />],
                ].map(([label, value, icon]) => (
                  <div key={label} style={{ padding: '14px 14px 16px', borderRadius: 22, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <IconFrame dark>{icon}</IconFrame>
                      <div className="pm-eyebrow" style={{ color: 'rgba(255,245,235,0.56)' }}>{label}</div>
                    </div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff5eb', lineHeight: 1.02 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: 12 }}>
              <div className="hero-panel premium-card" style={{ overflow: 'hidden' }}>
                <div className="hero-media" style={{ position: 'relative' }}>
                  <img src={SMOKER_IMAGE} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.84) contrast(1.04)' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(23,18,15,0.9), rgba(23,18,15,0.06) 56%)' }} />
                  <div style={{ position: 'absolute', top: 18, left: 18, right: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="pm-kicker">resultat premium</div>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      {[0, 1, 2].map((dot) => (
                        <span key={dot} style={{ width: 8, height: 8, borderRadius: '50%', background: dot === 0 ? 'var(--orange)' : 'rgba(255,255,255,0.34)' }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ position: 'absolute', left: 18, right: 18, bottom: 18 }}>
                    <div style={{ padding: '18px 18px 16px', borderRadius: 24, background: 'rgba(20,16,13,0.8)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(18px)' }}>
                      <div style={{ display: 'grid', gap: 12 }}>
                        <div>
                          <div className="pm-eyebrow" style={{ color: 'rgba(255,245,235,0.56)', marginBottom: 6 }}>heure de lancement</div>
                          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, lineHeight: .92, color: '#fff5eb' }}>06h00</div>
                        </div>
                        <div className="link-grid">
                          <div style={{ padding: '12px 14px', borderRadius: 18, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="pm-eyebrow" style={{ color: 'rgba(255,245,235,0.56)', marginBottom: 6 }}>mise au repos</div>
                            <div style={{ fontFamily: 'DM Mono, monospace', color: '#fff5eb', fontWeight: 700 }}>17h10</div>
                          </div>
                          <div style={{ padding: '12px 14px', borderRadius: 18, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="pm-eyebrow" style={{ color: 'rgba(255,245,235,0.56)', marginBottom: 6 }}>fenêtre service</div>
                            <div style={{ fontFamily: 'DM Mono, monospace', color: '#fff5eb', fontWeight: 700 }}>18h00 → 19h30</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {['Stall 65–75°C', 'Wrap papier', 'Tests dès 90°C'].map((item) => (
                            <span key={item} style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,245,235,0.8)', fontSize: 11, fontWeight: 600 }}>
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 42px' }}>
        <div className="pm-shell premium-card" style={{ padding: 22 }}>
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
                <span key={item} style={{ padding:'8px 12px', borderRadius:999, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', color:'var(--text2)', fontSize:12, fontWeight:600 }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="calculateur" style={{ padding: '0 24px 58px' }}>
        <div className="pm-shell premium-card" style={{ padding: 26 }}>
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
                <button onClick={openCalculator} className="pm-btn-primary" style={{ width: 'auto', padding: '14px 22px' }}>
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
                <div key={label} className="premium-card lift" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <IconFrame>{icon}</IconFrame>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{label}</div>
                  </div>
                  <p style={{ fontSize: 14, color:'var(--text2)' }}>
                    Une réponse claire à une vraie question de cuisson, sans te noyer dans le détail.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 58px' }}>
        <div className="pm-shell feature-grid">
          {BENEFITS.map(({ title, copy }) => (
            <div key={title} style={{ paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: 24, color: 'var(--text)', marginBottom: 10 }}>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="cuissons" style={{ padding: '0 24px 58px' }}>
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
                onClick={openCalculator}
                className="dark-card lift"
                style={{ overflow: 'hidden', cursor: 'pointer', textAlign: 'left', color: 'inherit', padding: 0 }}
              >
                <div style={{ position: 'relative', height: 240 }}>
                  <img src={MEAT_IMAGES[item.key]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter:'saturate(.92) contrast(1.02)' }} />
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

      <section id="comment-ca-marche" style={{ padding: '0 24px 58px' }}>
        <div className="pm-shell premium-card" style={{ padding: 26 }}>
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
              <div key={title} className="premium-card lift" style={{ padding: 18 }}>
                <div style={{ display: 'inline-flex', marginBottom: 12, padding: '6px 10px', borderRadius: 999, background: 'var(--orange-bg)', border: '1px solid var(--orange-border)', color: 'var(--orange)', fontSize: 11, fontWeight: 800 }}>
                  {step}
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>{title}</div>
                <p style={{ marginBottom: 16 }}>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="guides" style={{ padding: '0 24px 58px' }}>
        <div className="pm-shell">
          <div className="premium-card" style={{ padding: 24 }}>
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
                <span key={item} style={{ padding:'8px 12px', borderRadius:999, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', color:'var(--text2)', fontSize:12, fontWeight:600 }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '28px 24px 48px' }}>
        <div className="pm-shell">
          <div className="landing-footer-grid">
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Charbon &amp; Flamme</div>
              <p className="pm-section-copy" style={{ maxWidth: 420 }}>
                Lance ta cuisson avec un vrai plan. Prépare ton prochain service sans deviner.
              </p>
              <div style={{ marginTop: 16, display:'flex', gap:10, flexWrap:'wrap' }}>
                <button onClick={openCalculator} className="pm-btn-primary" style={{ width:'auto', padding:'14px 18px' }}>
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
                  onClick={openCalculator}
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
