import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HERO_IMAGE, MEAT_IMAGES, SMOKER_IMAGE } from '../lib/images'

const css = `
  @keyframes introFade { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes softFloat { 0%, 100% { transform: translate3d(0, 0, 0); } 50% { transform: translate3d(0, -10px, 0); } }
  @keyframes emberDrift { 0%, 100% { opacity: .36; transform: scale(1); } 50% { opacity: .7; transform: scale(1.06); } }
  .intro-item { animation: introFade .7s ease both; }
  .intro-item:nth-child(2) { animation-delay: .08s; }
  .intro-item:nth-child(3) { animation-delay: .16s; }
  .intro-item:nth-child(4) { animation-delay: .24s; }
  .intro-item:nth-child(5) { animation-delay: .32s; }
  .seo-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
  .story-grid { display: grid; grid-template-columns: 1.08fr .92fr; gap: 28px; }
  .link-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .product-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
  .guide-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
  .recipe-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
  .meat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
  .soft-panel { background: linear-gradient(180deg, rgba(29,24,20,0.66), rgba(18,15,13,0.78)); border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(18px); }
  .section-divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent); }
  .hover-rise { transition: transform .24s ease, border-color .24s ease, background .24s ease; }
  .hover-rise:hover { transform: translateY(-3px); border-color: rgba(240,122,47,0.24) !important; }
  .photo-lift img { transition: transform .4s ease; }
  .photo-lift:hover img { transform: scale(1.04); }
  .hero-glow { animation: emberDrift 6s ease-in-out infinite; }
  .hero-smoke { animation: softFloat 7s ease-in-out infinite; }
  @media (max-width: 1080px) {
    .seo-grid, .guide-grid, .recipe-grid, .product-grid { grid-template-columns: 1fr; }
    .story-grid { grid-template-columns: 1fr; }
    .meat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 780px) {
    .link-grid { grid-template-columns: 1fr; }
    .meat-grid { grid-template-columns: 1fr; }
  }
`

const GUIDES = [
  { title: 'Guide brisket low & slow', copy: 'Timing, bark, stall, wrap et repose longue pour servir proprement.', href: '/app' },
  { title: 'Guide ribs pitmaster', copy: 'Pullback, flex test, glaze et texture selon le style de service.', href: '/app' },
  { title: 'Guide fumoir et températures', copy: 'Offset, pellet, kamado: comment garder une courbe stable pendant des heures.', href: '/app' },
]

const RECIPES = [
  { title: 'Rub brisket simple', copy: 'Sel, poivre, ail et équilibre pour une bark nette.', meat: 'Brisket' },
  { title: 'Pulled pork de service', copy: 'Profil plus rond pour sandwich, buns ou service à l’assiette.', meat: 'Pulled Pork' },
  { title: 'Ribs glaze légère', copy: 'Finition brillante sans masquer la fumée.', meat: 'Ribs' },
]

const PRODUCTS = [
  { title: 'Thermomètre à sonde', tag: 'Affiliation', copy: 'Le vrai achat qui change la lecture des cuissons longues.', cta: 'Voir les thermomètres' },
  { title: 'Fumoir / smoker', tag: 'Guide achat', copy: 'Offset, pellet ou kamado selon ton usage et ton budget.', cta: 'Comparer les fumoirs' },
  { title: 'Pellets et bois', tag: 'Consommables', copy: 'Choisir le bon combustible selon la viande et le style de fumée.', cta: 'Choisir mes pellets' },
]

const PITMASTER_TIPS = [
  'Ne poursuis pas un horaire fixe pendant le stall. Poursuis la cuisson juste.',
  'Le wrap est une décision de texture et de rythme, pas une obligation.',
  'Une bonne fenêtre de service vaut mieux qu’une heure “parfaite” impossible à tenir.',
]

const SEO_LINKS = [
  'Temps cuisson brisket',
  'Temps cuisson ribs',
  'Température pulled pork',
  'Guide fumoir',
  'Calculateur BBQ',
  'Temps cuisson beef ribs',
]

const MEAT_SHOWCASE = [
  { key: 'brisket', title: 'Brisket', subtitle: 'Longue cuisson, service précis' },
  { key: 'pork_shoulder', title: 'Pulled Pork', subtitle: 'Repos généreux, grande souplesse' },
  { key: 'ribs_beef', title: 'Beef Ribs', subtitle: 'Finition et tendreté' },
  { key: 'ribs_pork', title: 'Ribs', subtitle: 'Flex test et service minute' },
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
    ensureMeta('description', 'Calculateur BBQ pitmaster gratuit pour brisket, ribs et pulled pork. Temps de cuisson, fenêtre de service, conseils et matériel recommandé.')
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openCalculator = () => navigate('/app')
  const saveCook = () => navigate('/auth', { state: { from: '/app', reason: 'save-planning' } })

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
      <style>{css}</style>

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 70,
          height: 74,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 22px',
          background: scrolled ? 'rgba(10,9,8,0.82)' : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
          transition: 'all .24s ease',
        }}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div style={{ width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg,var(--orange-light),var(--orange-deep))', color: '#fff', fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 800, boxShadow: '0 12px 28px rgba(197,83,25,0.28)' }}>
            CF
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, lineHeight: 1 }}>Charbon &amp; Flamme</div>
            <div className="pm-eyebrow" style={{ marginTop: 3 }}>outil gratuit de reference</div>
          </div>
        </button>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          {[
            ['Calculateur', '#calculateur'],
            ['Guides BBQ', '#guides'],
            ['Recettes', '#recettes'],
            ['Matériel recommandé', '#materiel'],
          ].map(([label, href]) => (
            <a key={label} href={href} style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              {label}
            </a>
          ))}
          <button onClick={saveCook} className="pm-btn-secondary" style={{ width: 'auto', padding: '12px 16px', fontSize: 12 }}>
            Sauvegarder ma cuisson
          </button>
        </nav>
      </header>

      <section style={{ position: 'relative', minHeight: 'calc(100svh - 74px)', display: 'flex', alignItems: 'stretch' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <img src={HERO_IMAGE} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28, filter: 'saturate(.8) contrast(1.06)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,9,8,0.96) 0%, rgba(10,9,8,0.78) 38%, rgba(10,9,8,0.58) 70%, rgba(10,9,8,0.86) 100%)' }} />
          <div className="hero-glow" style={{ position: 'absolute', right: '18%', top: '24%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,122,47,0.24), transparent 66%)', pointerEvents: 'none' }} />
          <div className="hero-smoke" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 72% 24%, rgba(255,255,255,0.07), transparent 18%), radial-gradient(circle at 68% 16%, rgba(255,255,255,0.05), transparent 14%)', pointerEvents: 'none' }} />
        </div>

        <div className="pm-shell" style={{ position: 'relative', zIndex: 1, width: '100%', padding: '44px 24px 40px', display: 'grid', gridTemplateColumns: 'minmax(0, 620px) minmax(0, 1fr)', gap: 28, alignItems: 'end' }}>
          <div style={{ maxWidth: 620 }}>
            <div className="intro-item pm-kicker" style={{ marginBottom: 18 }}>trafic seo, retention, affiliation bbq</div>
            <div className="intro-item" style={{ marginBottom: 14 }}>
              <div className="pm-eyebrow" style={{ marginBottom: 12 }}>charbon &amp; flamme</div>
              <h1 style={{ fontSize: 'clamp(42px, 7.5vw, 104px)', lineHeight: 0.92, letterSpacing: '-4px', maxWidth: 820 }}>
                Calculateur BBQ
                <br />
                <span style={{ color: 'var(--ember)' }}>Pitmaster</span>
              </h1>
            </div>
            <p className="intro-item pm-section-copy" style={{ maxWidth: 540, fontSize: 18, marginBottom: 28 }}>
              Temps de cuisson précis pour brisket, ribs, pulled pork. Un outil gratuit pensé pour calculer vite, comprendre mieux et revenir à chaque nouvelle cuisson.
            </p>
            <div className="intro-item" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <button onClick={openCalculator} className="pm-btn-primary" style={{ width: 'auto', padding: '17px 28px', fontSize: 15 }}>
                Calculer maintenant
              </button>
              <button onClick={saveCook} className="pm-btn-secondary" style={{ width: 'auto', padding: '16px 22px', fontSize: 15 }}>
                Sauvegarder ma cuisson
              </button>
            </div>
            <div className="intro-item" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, color: 'var(--text3)', fontSize: 12 }}>
              <span>Gratuit</span>
              <span>Compréhension immédiate</span>
              <span>Retour simple sur mobile</span>
            </div>
          </div>

          <div style={{ alignSelf: 'end' }}>
            <div className="soft-panel" style={{ borderRadius: 28, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ position: 'relative', minHeight: 430 }}>
                <img src={SMOKER_IMAGE} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.62, filter: 'saturate(.82) contrast(1.04)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,9,8,0.96), rgba(10,9,8,0.18) 62%)' }} />
                <div style={{ position: 'absolute', left: 22, right: 22, bottom: 22 }}>
                  <div className="pm-kicker" style={{ marginBottom: 12 }}>service window</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(34px, 5vw, 56px)', lineHeight: .95, marginBottom: 8 }}>
                    18h00 → 19h30
                  </div>
                  <p style={{ maxWidth: 360, marginBottom: 18 }}>
                    Une lecture claire du départ, du repos et de la fenêtre de service pour ne plus piloter à l’aveugle.
                  </p>
                  <div className="link-grid">
                    {[
                      ['Départ recommandé', '06h00'],
                      ['Repère pit', '110°C'],
                      ['Stall', '65-75°C'],
                      ['Début des tests', '90°C'],
                    ].map(([label, value]) => (
                      <div key={label} style={{ padding: '12px 14px', borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="pm-eyebrow" style={{ marginBottom: 6 }}>{label}</div>
                        <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: 'var(--text)' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="calculateur" style={{ padding: '44px 24px 96px' }}>
        <div className="pm-shell">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start', marginBottom: 34 }}>
            <div>
              <div className="pm-eyebrow" style={{ marginBottom: 12 }}>section principale</div>
              <h2 className="pm-section-title" style={{ maxWidth: 680, marginBottom: 16 }}>
                Le calculateur est l’entrée.
                <br />
                Les contenus font revenir.
              </h2>
            </div>
            <p className="pm-section-copy" style={{ justifySelf: 'end' }}>
              L’outil reste la star. Mais toute l’UX autour doit encourager le scroll, la sauvegarde, la consultation de guides, et l’exposition naturelle à du matériel recommandé.
            </p>
          </div>

          <div className="story-grid">
            <div className="soft-panel" style={{ borderRadius: 28, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 18, marginBottom: 20, flexWrap: 'wrap' }}>
                <div>
                  <div className="pm-kicker" style={{ marginBottom: 10 }}>calculateur bbq pitmaster</div>
                  <h3 style={{ fontSize: 30, color: 'var(--text)', lineHeight: 1.02, marginBottom: 10 }}>Interface claire, rapide et lisible.</h3>
                  <p style={{ maxWidth: 440 }}>De gros champs, une progression évidente et un bouton calculer visible dès l’arrivée.</p>
                </div>
                <button onClick={openCalculator} className="pm-btn-primary" style={{ width: 'auto', padding: '14px 18px' }}>
                  Ouvrir le calculateur
                </button>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                {[
                  ['Viande', 'Brisket'],
                  ['Poids', '5.4 kg'],
                  ['Température fumoir', '110°C'],
                  ['Heure de service', '19:00'],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: '16px 18px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div className="pm-eyebrow">{label}</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="soft-panel photo-lift" style={{ borderRadius: 28, overflow: 'hidden' }}>
              <div style={{ position: 'relative', minHeight: 100, height: '100%' }}>
                <img src={MEAT_IMAGES.brisket} alt="Brisket barbecue" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,9,8,0.94), rgba(10,9,8,0.28) 58%)' }} />
                <div style={{ position: 'absolute', left: 22, right: 22, bottom: 22 }}>
                  <div className="pm-kicker" style={{ marginBottom: 10 }}>resultat premium</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, lineHeight: 1.02, marginBottom: 10 }}>
                    Timeline verticale,
                    <br />
                    phases détaillées,
                    <br />
                    partage et sauvegarde.
                  </div>
                  <p>Le résultat ne doit pas juste afficher une heure: il doit donner de la confiance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 96px' }}>
        <div className="pm-shell">
          <div className="seo-grid">
            <div style={{ paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="pm-eyebrow" style={{ color: 'var(--ember)', marginBottom: 10 }}>Compréhension immédiate</div>
              <h3 style={{ fontSize: 24, color: 'var(--text)', marginBottom: 10 }}>On comprend en quelques secondes.</h3>
              <p>Promesse claire, CTA visible, calculateur mis au centre et signaux de cuisson traduits en actions concrètes.</p>
            </div>
            <div style={{ paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="pm-eyebrow" style={{ color: 'var(--ember)', marginBottom: 10 }}>Rétention</div>
              <h3 style={{ fontSize: 24, color: 'var(--text)', marginBottom: 10 }}>L’utilisateur a une raison de revenir.</h3>
              <p>Sauvegarde des cuissons, lecture mobile, contenus utiles et nouveaux points d’entrée SEO après le calcul.</p>
            </div>
            <div style={{ paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="pm-eyebrow" style={{ color: 'var(--ember)', marginBottom: 10 }}>Affiliation discrète</div>
              <h3 style={{ fontSize: 24, color: 'var(--text)', marginBottom: 10 }}>Le matériel s’intègre naturellement.</h3>
              <p>Le produit conseillé apparaît comme prolongement de l’usage, pas comme bannière qui casse la confiance.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="guides" style={{ padding: '0 24px 96px' }}>
        <div className="pm-shell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <div className="pm-eyebrow" style={{ marginBottom: 12 }}>conseils pitmaster</div>
              <h2 className="pm-section-title" style={{ maxWidth: 720 }}>Des contenus qui prolongent l’outil.</h2>
            </div>
            <p className="pm-section-copy" style={{ maxWidth: 420 }}>
              Chaque bloc SEO doit sembler utile avant de sembler “stratégique”. C’est ce qui garde l’expérience premium.
            </p>
          </div>

          <div className="guide-grid" style={{ marginBottom: 28 }}>
            {GUIDES.map((guide) => (
              <button
                key={guide.title}
                onClick={() => navigate(guide.href)}
                className="soft-panel hover-rise"
                style={{ borderRadius: 24, padding: 22, textAlign: 'left', cursor: 'pointer', color: 'inherit' }}
              >
                <div className="pm-eyebrow" style={{ marginBottom: 10 }}>guide bbq</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, lineHeight: 1.04, color: 'var(--text)', marginBottom: 10 }}>{guide.title}</div>
                <p>{guide.copy}</p>
              </button>
            ))}
          </div>

          <div className="soft-panel" style={{ borderRadius: 28, padding: 24 }}>
            <div className="pm-eyebrow" style={{ marginBottom: 14 }}>conseils pitmaster</div>
            <div className="link-grid">
              {PITMASTER_TIPS.map((tip, index) => (
                <div key={tip} style={{ padding: '16px 18px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="pm-eyebrow" style={{ marginBottom: 10 }}>{String(index + 1).padStart(2, '0')}</div>
                  <div style={{ color: 'var(--text)', lineHeight: 1.65 }}>{tip}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="recettes" style={{ padding: '0 24px 96px' }}>
        <div className="pm-shell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <div className="pm-eyebrow" style={{ marginBottom: 12 }}>recettes</div>
              <h2 className="pm-section-title">Recettes, rubs et profils de cuisson.</h2>
            </div>
            <p className="pm-section-copy" style={{ maxWidth: 420 }}>
              Des points d’entrée éditoriaux pour enrichir le trafic organique et nourrir les retours utilisateur.
            </p>
          </div>

          <div className="recipe-grid">
            {RECIPES.map((recipe, index) => (
              <div key={recipe.title} className="soft-panel hover-rise" style={{ borderRadius: 24, padding: 22 }}>
                <div className="pm-eyebrow" style={{ marginBottom: 10 }}>recette {String(index + 1).padStart(2, '0')}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, lineHeight: 1.05, color: 'var(--text)', marginBottom: 10 }}>{recipe.title}</div>
                <p style={{ marginBottom: 14 }}>{recipe.copy}</p>
                <div style={{ display: 'inline-flex', padding: '5px 10px', borderRadius: 999, border: '1px solid rgba(240,122,47,0.18)', background: 'rgba(240,122,47,0.08)', color: 'var(--ember)', fontSize: 11, fontWeight: 700 }}>
                  {recipe.meat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="materiel" style={{ padding: '0 24px 96px' }}>
        <div className="pm-shell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <div className="pm-eyebrow" style={{ marginBottom: 12 }}>materiel recommande</div>
              <h2 className="pm-section-title">Affiliation discrète, utile, crédible.</h2>
            </div>
            <p className="pm-section-copy" style={{ maxWidth: 420 }}>
              Le bloc produit ressemble à une recommandation pitmaster, pas à une interruption publicitaire.
            </p>
          </div>

          <div style={{ marginBottom: 16, display: 'inline-flex', padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text2)', fontSize: 12, fontWeight: 600 }}>
            Matériel recommandé par pitmasters
          </div>

          <div className="product-grid">
            {PRODUCTS.map((product) => (
              <div key={product.title} className="soft-panel hover-rise" style={{ borderRadius: 24, padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div className="pm-eyebrow">{product.tag}</div>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>BBQ gear</span>
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, lineHeight: 1.04, color: 'var(--text)', marginBottom: 10 }}>{product.title}</div>
                <p style={{ marginBottom: 18 }}>{product.copy}</p>
                <button onClick={openCalculator} className="pm-btn-secondary" style={{ width: 'auto', padding: '12px 16px' }}>
                  {product.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 110px' }}>
        <div className="pm-shell">
          <div className="meat-grid">
            {MEAT_SHOWCASE.map((item) => (
              <button
                key={item.key}
                onClick={openCalculator}
                className="soft-panel hover-rise photo-lift"
                style={{ borderRadius: 24, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', color: 'inherit' }}
              >
                <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                  <img src={MEAT_IMAGES[item.key]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,9,8,0.92), rgba(10,9,8,0.18) 58%)' }} />
                  <div style={{ position: 'absolute', left: 18, right: 18, bottom: 18 }}>
                    <div className="pm-eyebrow" style={{ color: 'var(--ember)', marginBottom: 8 }}>cuisson</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{item.title}</div>
                    <p style={{ marginTop: 8, color: 'rgba(255,245,235,0.76)' }}>{item.subtitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '34px 24px 60px' }}>
        <div className="pm-shell">
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg,var(--orange-light),var(--orange-deep))', color: '#fff', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 800 }}>
                  CF
                </div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16 }}>Charbon &amp; Flamme</div>
                  <div className="pm-eyebrow" style={{ marginTop: 3 }}>plateforme bbq gratuite</div>
                </div>
              </div>
              <p className="pm-section-copy" style={{ maxWidth: 460 }}>
                Calculateur BBQ, guides, recettes, matériel recommandé et contenus pitmaster conçus pour devenir un réflexe avant chaque cuisson.
              </p>
            </div>

            <div>
              <div className="pm-eyebrow" style={{ marginBottom: 14 }}>liens seo</div>
              <div className="link-grid">
                {SEO_LINKS.map((label) => (
                  <button key={label} onClick={openCalculator} style={{ textAlign: 'left', background: 'none', border: 'none', color: 'var(--text2)', padding: '0 0 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', fontSize: 14 }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
