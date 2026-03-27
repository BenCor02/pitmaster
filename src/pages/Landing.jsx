import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HERO_IMAGE, MEAT_IMAGES } from '../lib/images'

const css = `
  @keyframes introFade { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
  .intro-item { animation: introFade .6s ease both; }
  .intro-item:nth-child(2) { animation-delay: .08s; }
  .intro-item:nth-child(3) { animation-delay: .16s; }
  .intro-item:nth-child(4) { animation-delay: .24s; }
  .landing-grid { display: grid; grid-template-columns: 1.05fr .95fr; gap: 32px; }
  .three-up { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .product-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .link-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .meat-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
  .soft-block { background: rgba(255,252,247,0.82); border: 1px solid rgba(42,33,27,0.08); border-radius: 28px; box-shadow: var(--shadow-soft); }
  .hover-lift { transition: transform .2s ease, border-color .2s ease; }
  .hover-lift:hover { transform: translateY(-2px); border-color: rgba(240,122,47,0.18) !important; }
  @media (max-width: 980px) {
    .landing-grid, .three-up, .product-grid { grid-template-columns: 1fr; }
    .meat-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 700px) {
    .link-grid, .meat-strip { grid-template-columns: 1fr; }
  }
`

const BENEFITS = [
  {
    title: 'Compréhension immédiate',
    copy: 'Tu entres ton service. L’outil te donne un départ, une fenêtre crédible et les bons repères.',
  },
  {
    title: 'Pensé pour revenir',
    copy: 'Sauvegarde, partage et consultation mobile transforment l’outil en réflexe avant chaque cuisson.',
  },
  {
    title: 'Affiliation discrète',
    copy: 'Le matériel recommandé s’intègre comme une aide utile, jamais comme une bannière agressive.',
  },
]

const PRODUCTS = [
  { title: 'Thermomètre', copy: 'Le matériel qui change le plus la lecture d’une cuisson longue.' },
  { title: 'Fumoir', copy: 'Choisir le bon smoker selon ton niveau, ton espace et ton budget.' },
  { title: 'Pellet', copy: 'Un combustible cohérent avec la viande et le style de fumée voulu.' },
]

const SEO_LINKS = [
  'Temps cuisson brisket',
  'Temps cuisson ribs',
  'Température pulled pork',
  'Guide fumoir',
  'Calculateur BBQ',
  'Matériel recommandé BBQ',
]

const MEATS = [
  { key: 'brisket', label: 'Brisket' },
  { key: 'pork_shoulder', label: 'Pulled Pork' },
  { key: 'ribs_beef', label: 'Beef Ribs' },
  { key: 'ribs_pork', label: 'Ribs' },
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

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    document.title = 'Calculateur BBQ Pitmaster | Charbon & Flamme'
    ensureMeta('description', 'Calculateur BBQ pitmaster gratuit pour brisket, ribs et pulled pork. Temps de cuisson, conseils et matériel recommandé.')
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openCalculator = () => navigate('/app')
  const saveCook = () => navigate('/auth', { state: { from: '/app', reason: 'save-planning' } })

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <style>{css}</style>

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 70,
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 22px',
          background: scrolled ? 'rgba(245,241,234,0.88)' : 'rgba(245,241,234,0.62)',
          borderBottom: '1px solid rgba(42,33,27,0.08)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div style={{ width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg,var(--orange-light),var(--orange-deep))', color: '#fff', fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 800 }}>
            CF
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, lineHeight: 1 }}>Charbon &amp; Flamme</div>
            <div className="pm-eyebrow" style={{ marginTop: 3 }}>outil gratuit de reference</div>
          </div>
        </button>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          {[
            ['Calculateur', '#calculateur'],
            ['Guides BBQ', '#guides'],
            ['Recettes', '#guides'],
            ['Matériel recommandé', '#materiel'],
          ].map(([label, href]) => (
            <a key={label} href={href} style={{ textDecoration: 'none', color: 'var(--text2)', fontSize: 13, fontWeight: 600 }}>
              {label}
            </a>
          ))}
          <button onClick={saveCook} className="pm-btn-secondary" style={{ width: 'auto', padding: '12px 16px', fontSize: 12 }}>
            Sauvegarder ma cuisson
          </button>
        </nav>
      </header>

      <section style={{ padding: '42px 24px 56px' }}>
        <div className="pm-shell landing-grid" style={{ alignItems: 'center' }}>
          <div>
            <div className="intro-item pm-kicker" style={{ marginBottom: 16 }}>calculateur bbq gratuit</div>
            <div className="intro-item" style={{ marginBottom: 14 }}>
              <h1 style={{ fontSize: 'clamp(40px, 7vw, 86px)', lineHeight: 0.95, letterSpacing: '-3px', maxWidth: 760 }}>
                Calculateur BBQ
                <br />
                <span style={{ color: 'var(--orange)' }}>Pitmaster</span>
              </h1>
            </div>
            <p className="intro-item pm-section-copy" style={{ maxWidth: 560, fontSize: 18, marginBottom: 24 }}>
              Temps de cuisson précis pour brisket, ribs, pulled pork. Une interface claire pour calculer vite, comprendre tout de suite et revenir à chaque nouvelle cuisson.
            </p>
            <div className="intro-item" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
              <button onClick={openCalculator} className="pm-btn-primary" style={{ width: 'auto', padding: '16px 26px', fontSize: 15 }}>
                Calculer maintenant
              </button>
              <button onClick={saveCook} className="pm-btn-secondary" style={{ width: 'auto', padding: '15px 20px', fontSize: 15 }}>
                Sauvegarder ma cuisson
              </button>
            </div>
            <div className="intro-item" style={{ display: 'flex', gap: 22, flexWrap: 'wrap', color: 'var(--text3)', fontSize: 12 }}>
              <span>Gratuit</span>
              <span>Clair dès la première lecture</span>
              <span>Mobile friendly</span>
            </div>
          </div>

          <div className="soft-block" style={{ overflow: 'hidden' }}>
            <div style={{ position: 'relative', minHeight: 420 }}>
              <img src={HERO_IMAGE} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.9) contrast(1.02)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(28,22,18,0.72), rgba(255,250,245,0.02) 60%)' }} />
              <div style={{ position: 'absolute', left: 20, right: 20, bottom: 20 }}>
                <div className="pm-kicker" style={{ marginBottom: 10 }}>exemple de resultat</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, lineHeight: .98, color: '#fff', marginBottom: 10 }}>
                  Départ 06h00
                  <br />
                  Service 18h00 → 19h30
                </div>
                <p style={{ maxWidth: 360, color: 'rgba(255,255,255,0.86)' }}>
                  Une lecture simple du départ, du repos et de la bonne fenêtre pour servir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="calculateur" style={{ padding: '0 24px 56px' }}>
        <div className="pm-shell">
          <div className="soft-block" style={{ padding: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
              <div>
                <div className="pm-eyebrow" style={{ marginBottom: 10 }}>section principale</div>
                <h2 className="pm-section-title" style={{ fontSize: 'clamp(30px, 4vw, 54px)', marginBottom: 14 }}>
                  Le calculateur doit faire une seule chose:
                  <br />
                  te donner confiance.
                </h2>
                <p className="pm-section-copy">
                  De grands champs, un CTA net, un résultat lisible, puis seulement après des contenus utiles et du matériel recommandé.
                </p>
              </div>
              <div className="link-grid">
                {[
                  ['Viande', 'Brisket'],
                  ['Poids', '5.4 kg'],
                  ['Température fumoir', '110°C'],
                  ['Service', '19:00'],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: '16px 18px', borderRadius: 20, background: 'rgba(255,255,255,0.58)', border: '1px solid rgba(42,33,27,0.08)' }}>
                    <div className="pm-eyebrow" style={{ marginBottom: 6 }}>{label}</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 56px' }}>
        <div className="pm-shell three-up">
          {BENEFITS.map((item) => (
            <div key={item.title} style={{ paddingTop: 16, borderTop: '1px solid rgba(42,33,27,0.1)' }}>
              <h3 style={{ fontSize: 24, color: 'var(--text)', marginBottom: 10 }}>{item.title}</h3>
              <p>{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="guides" style={{ padding: '0 24px 56px' }}>
        <div className="pm-shell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <div className="pm-eyebrow" style={{ marginBottom: 10 }}>guides et contenus</div>
              <h2 className="pm-section-title" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>Des contenus utiles, pas du bruit.</h2>
            </div>
            <p className="pm-section-copy" style={{ maxWidth: 420 }}>
              Juste assez pour encourager le scroll et le retour, sans charger la page.
            </p>
          </div>

          <div className="meat-strip">
            {MEATS.map((item) => (
              <button
                key={item.key}
                onClick={openCalculator}
                className="soft-block hover-lift"
                style={{ overflow: 'hidden', cursor: 'pointer', textAlign: 'left', color: 'inherit' }}
              >
                <div style={{ position: 'relative', height: 180 }}>
                  <img src={MEAT_IMAGES[item.key]} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(28,22,18,0.82), rgba(28,22,18,0.04) 56%)' }} />
                  <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
                    <div className="pm-eyebrow" style={{ color: 'rgba(255,255,255,0.72)', marginBottom: 6 }}>guide</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#fff' }}>{item.label}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="materiel" style={{ padding: '0 24px 56px' }}>
        <div className="pm-shell soft-block" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <div className="pm-eyebrow" style={{ marginBottom: 10 }}>materiel recommande</div>
              <h2 className="pm-section-title" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>Affiliation discrète et crédible.</h2>
            </div>
            <div style={{ display: 'inline-flex', padding: '5px 10px', borderRadius: 999, background: 'rgba(240,122,47,0.08)', border: '1px solid rgba(240,122,47,0.14)', color: 'var(--orange)', fontSize: 11, fontWeight: 700 }}>
              Matériel recommandé par pitmasters
            </div>
          </div>

          <div className="product-grid">
            {PRODUCTS.map((product) => (
              <div key={product.title} style={{ padding: '18px 18px 20px', borderRadius: 22, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(42,33,27,0.08)' }}>
                <h3 style={{ fontSize: 24, color: 'var(--text)', marginBottom: 10 }}>{product.title}</h3>
                <p style={{ marginBottom: 14 }}>{product.copy}</p>
                <button onClick={openCalculator} className="pm-btn-secondary" style={{ width: 'auto', padding: '12px 14px' }}>
                  Voir la sélection
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(42,33,27,0.08)', padding: '28px 24px 48px' }}>
        <div className="pm-shell">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Charbon &amp; Flamme</div>
              <p className="pm-section-copy" style={{ maxWidth: 420 }}>
                Le calculateur BBQ gratuit pensé pour devenir le point d’entrée simple et fiable avant chaque cuisson.
              </p>
            </div>
            <div className="link-grid">
              {SEO_LINKS.map((label) => (
                <button
                  key={label}
                  onClick={openCalculator}
                  style={{ textAlign: 'left', background: 'none', border: 'none', padding: '0 0 8px', cursor: 'pointer', color: 'var(--text2)', borderBottom: '1px solid rgba(42,33,27,0.08)' }}
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
