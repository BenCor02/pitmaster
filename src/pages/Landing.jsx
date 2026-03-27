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
  .hero-panel { animation: panelFloat 8s ease-in-out infinite; }
  .hero-glow { animation: glowPulse 7s ease-in-out infinite; }
  /* PATCH: landing alignée sur le thème dark premium de l'app */
  .premium-card { background: linear-gradient(180deg, rgba(26,26,26,0.96), rgba(16,16,16,0.98)); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; box-shadow: 0 18px 44px rgba(0,0,0,0.24); }
  .dark-card { background: linear-gradient(180deg, rgba(23,18,15,0.96), rgba(15,12,10,0.98)); border: 1px solid rgba(255,255,255,0.08); border-radius: 30px; box-shadow: 0 22px 54px rgba(25,18,14,0.32); }
  .lift { transition: transform .24s ease, border-color .24s ease, box-shadow .24s ease; }
  .lift:hover { transform: translateY(-3px); border-color: rgba(240,122,47,0.22) !important; box-shadow: 0 24px 52px rgba(0,0,0,0.28); }
  @media (max-width: 1080px) {
    .hero-grid, .feature-grid, .material-grid { grid-template-columns: 1fr; }
    .guide-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 720px) {
    .link-grid, .guide-strip { grid-template-columns: 1fr; }
  }
`

const SEO_LINKS = [
  'Temps cuisson brisket',
  'Temps cuisson ribs',
  'Température pulled pork',
  'Guide fumoir',
  'Calculateur BBQ',
  'Matériel recommandé BBQ',
]

const MATERIAL = [
  { title: 'Thermomètre', copy: 'Lecture fiable du pit et de la température interne pendant toute la cuisson.', action: 'Voir les modèles' },
  { title: 'Fumoir', copy: 'Comparer pellet, offset et kamado selon ton budget et ton terrain de jeu.', action: 'Comparer les fumoirs' },
  { title: 'Pellet', copy: 'Choisir le bon combustible selon la viande et le profil de fumée recherché.', action: 'Choisir mes pellets' },
]

const GUIDES = [
  { key: 'brisket', title: 'Brisket', subtitle: 'Timing, stall, wrap, repos' },
  { key: 'pork_shoulder', title: 'Pulled Pork', subtitle: 'Texture, hold, service' },
  { key: 'ribs_beef', title: 'Beef Ribs', subtitle: 'Finition, tendreté, coupe' },
  { key: 'ribs_pork', title: 'Ribs', subtitle: 'Pullback, flex test, glaze' },
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
    ensureMeta('description', 'Calculateur BBQ pitmaster gratuit pour brisket, ribs et pulled pork. Temps de cuisson précis, guides, recettes et matériel recommandé.')
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
            <div className="pm-eyebrow" style={{ marginTop: 3, color:'var(--text3)' }}>outil gratuit de reference</div>
          </div>
        </button>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          {[
            ['Calculateur', () => scrollToSection('calculateur')],
            ['Guides BBQ', () => scrollToSection('guides')],
            ['Matériel', () => scrollToSection('materiel')],
            ['Ouvrir l’app', openCalculator],
          ].map(([label, action]) => (
            <button key={label} onClick={action} style={{ background:'none', border:'none', padding:0, color:'var(--text2)', fontSize: 13, fontWeight: 600, cursor:'pointer' }}>
              {label}
            </button>
          ))}
          <button onClick={saveCook} className="pm-btn-secondary" style={{ width: 'auto', padding: '12px 16px', fontSize: 12 }}>
            Sauvegarder ma cuisson
          </button>
        </nav>
      </header>

      <section style={{ padding: '34px 24px 62px' }}>
        <div className="pm-shell dark-card" style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
          <div className="hero-glow" style={{ position: 'absolute', right: -80, top: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,122,47,0.28), transparent 68%)', pointerEvents: 'none' }} />
          <div className="hero-grid" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ padding: '28px 16px 18px 20px' }}>
              <div className="hero-item pm-kicker" style={{ marginBottom: 18 }}>calculateur bbq premium et utile</div>
              <div className="hero-item" style={{ marginBottom: 14 }}>
                <h1 style={{ fontSize: 'clamp(46px, 8vw, 96px)', lineHeight: 0.92, letterSpacing: '-4px', color: '#fff5eb', maxWidth: 820 }}>
                  Calculateur BBQ
                  <br />
                  <span style={{ color: 'var(--ember)' }}>Pitmaster</span>
                </h1>
              </div>
              <p className="hero-item" style={{ maxWidth: 560, fontSize: 18, color: 'rgba(255,245,235,0.76)', lineHeight: 1.7, marginBottom: 26 }}>
                Temps de cuisson précis pour brisket, ribs, pulled pork. Une interface claire pour calculer vite, mieux servir, et revenir avant chaque nouvelle cuisson.
              </p>
              <div className="hero-item" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
                <button onClick={openCalculator} className="pm-btn-primary" style={{ width: 'auto', padding: '16px 28px', fontSize: 15 }}>
                  Calculer maintenant
                </button>
                <button onClick={saveCook} className="pm-btn-secondary" style={{ width: 'auto', padding: '15px 20px', fontSize: 15, background: 'rgba(255,255,255,0.06)', color: '#fff5eb', border: '1px solid rgba(255,255,255,0.12)' }}>
                  Sauvegarder ma cuisson
                </button>
              </div>
              <div className="hero-item feature-grid" style={{ marginTop: 8 }}>
                {[
                  ['Heure de départ', '06h00', <ClockIcon key="clock" />],
                  ['Fenêtre de service', '18h00 → 19h30', <FireIcon key="fire" />],
                  ['Repère pit', '110°C stabilisés', <GaugeIcon key="gauge" />],
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
                <div style={{ position: 'relative', minHeight: 520 }}>
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
                          <div className="pm-eyebrow" style={{ color: 'rgba(255,245,235,0.56)', marginBottom: 6 }}>heure de départ recommandée</div>
                          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, lineHeight: .92, color: '#fff5eb' }}>06h00</div>
                        </div>
                        <div className="link-grid">
                          <div style={{ padding: '12px 14px', borderRadius: 18, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="pm-eyebrow" style={{ color: 'rgba(255,245,235,0.56)', marginBottom: 6 }}>fin cuisson</div>
                            <div style={{ fontFamily: 'DM Mono, monospace', color: '#fff5eb', fontWeight: 700 }}>17h10</div>
                          </div>
                          <div style={{ padding: '12px 14px', borderRadius: 18, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="pm-eyebrow" style={{ color: 'rgba(255,245,235,0.56)', marginBottom: 6 }}>service window</div>
                            <div style={{ fontFamily: 'DM Mono, monospace', color: '#fff5eb', fontWeight: 700 }}>18h00 → 19h30</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {['Stall 65-75°C', 'Wrap papier', 'Début tests 90°C'].map((item) => (
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

      <section id="calculateur" style={{ padding: '0 24px 58px' }}>
        <div className="pm-shell premium-card" style={{ padding: 26 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
            <div>
              <div className="pm-eyebrow" style={{ marginBottom: 10, color:'var(--text3)' }}>section principale</div>
              <h2 className="pm-section-title" style={{ fontSize: 'clamp(34px, 4.8vw, 58px)', marginBottom: 14 }}>
                Un outil de référence.
                <br />
                Pas un formulaire triste.
              </h2>
              <p className="pm-section-copy" style={{ maxWidth: 540 }}>
                Grands champs, hiérarchie nette, résultat premium et actions utiles. On comprend quoi faire, quoi attendre et quoi sauvegarder sans se perdre.
              </p>
            </div>
            <div className="feature-grid">
              {[
                ['Temps de cuisson précis', <ClockIcon key="clock" />],
                ['Timeline verticale claire', <GaugeIcon key="gauge" />],
                ['Sauvegarde et retour', <SaveIcon key="save" />],
              ].map(([label, icon]) => (
                <div key={label} className="premium-card lift" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <IconFrame>{icon}</IconFrame>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{label}</div>
                  </div>
                  <p style={{ fontSize: 14, color:'var(--text2)' }}>Un bloc bien rangé, lisible, et directement utile dans le parcours de cuisson.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 58px' }}>
        <div className="pm-shell feature-grid">
          {[
            ['Compréhension immédiate', 'Tu entres ton service, tu obtiens un départ, une fenêtre et des repères actionnables.'],
            ['Scroll utile', 'Les blocs prolongent l’outil avec des guides et du matériel au bon endroit, sans casser le rythme.'],
            ['Affiliation discrète', 'Le produit recommandé ressemble à une aide de pitmaster, pas à une pub plaquée.'],
          ].map(([title, copy]) => (
            <div key={title} style={{ paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: 24, color: 'var(--text)', marginBottom: 10 }}>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="guides" style={{ padding: '0 24px 58px' }}>
        <div className="pm-shell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <div className="pm-eyebrow" style={{ marginBottom: 10, color:'var(--text3)' }}>guides bbq</div>
              <h2 className="pm-section-title" style={{ fontSize: 'clamp(30px, 4.5vw, 52px)' }}>Blocs rangés, utiles, lisibles.</h2>
            </div>
            <p className="pm-section-copy" style={{ maxWidth: 420 }}>
              Les sections sous le calculateur doivent prolonger l’usage, pas détourner l’attention.
            </p>
          </div>

          <div className="guide-strip">
            {GUIDES.map((item) => (
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
                    <div className="pm-eyebrow" style={{ color: 'rgba(255,245,235,0.58)', marginBottom: 8 }}>guide</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#fff5eb', marginBottom: 6 }}>{item.title}</div>
                    <p style={{ color: 'rgba(255,245,235,0.76)', fontSize: 13 }}>{item.subtitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="materiel" style={{ padding: '0 24px 60px' }}>
        <div className="pm-shell premium-card" style={{ padding: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <div className="pm-eyebrow" style={{ marginBottom: 10, color:'var(--text3)' }}>materiel recommande</div>
              <h2 className="pm-section-title" style={{ fontSize: 'clamp(30px, 4.5vw, 52px)' }}>Des cartes produits précises et propres.</h2>
            </div>
            <div style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: 999, background: 'rgba(240,122,47,0.08)', border: '1px solid rgba(240,122,47,0.14)', color: 'var(--orange)', fontSize: 11, fontWeight: 700 }}>
              Matériel recommandé par pitmasters
            </div>
          </div>

          <div className="material-grid">
            {MATERIAL.map((item) => (
              <div key={item.title} className="premium-card lift" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <IconFrame><FireIcon /></IconFrame>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{item.title}</div>
                </div>
                <p style={{ marginBottom: 16 }}>{item.copy}</p>
                <button onClick={openCalculator} className="pm-btn-secondary" style={{ width: 'auto', padding: '12px 14px' }}>
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '28px 24px 48px' }}>
        <div className="pm-shell">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Charbon &amp; Flamme</div>
              <p className="pm-section-copy" style={{ maxWidth: 420 }}>
                Le calculateur BBQ gratuit pensé pour devenir le point d’entrée premium, simple et fiable avant chaque cuisson.
              </p>
            </div>
            <div className="link-grid">
              {SEO_LINKS.map((label) => (
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
