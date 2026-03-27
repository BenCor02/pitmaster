import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HERO_IMAGE, MEAT_IMAGES, SMOKER_IMAGE } from '../lib/images'

const css = `
  @keyframes heroRise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes emberPulse { 0%, 100% { opacity: .45; transform: scale(1); } 50% { opacity: .85; transform: scale(1.05); } }
  @keyframes drift { 0%, 100% { transform: translate3d(0, 0, 0); } 50% { transform: translate3d(0, -10px, 0); } }
  .landing-hero-item { animation: heroRise .6s ease both; }
  .landing-hero-item:nth-child(2) { animation-delay: .08s; }
  .landing-hero-item:nth-child(3) { animation-delay: .16s; }
  .landing-hero-item:nth-child(4) { animation-delay: .24s; }
  .landing-link { color: inherit; text-decoration: none; }
  .landing-stat { border-left: 1px solid rgba(255,255,255,0.08); padding-left: 18px; }
  .landing-number { font-family: 'Syne', sans-serif; font-size: clamp(32px, 6vw, 82px); font-weight: 800; line-height: .94; letter-spacing: -2px; color: var(--text); }
  .landing-divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); }
  .landing-kv { display: grid; grid-template-columns: 1.1fr .9fr; gap: 24px; }
  .landing-meat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
  .landing-proof-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; }
  .landing-editorial-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .landing-glow { animation: emberPulse 6s ease-in-out infinite; }
  .landing-smoke { animation: drift 7s ease-in-out infinite; }
  .landing-outline:hover { border-color: rgba(240,122,47,0.28) !important; }
  .landing-photo:hover img { transform: scale(1.04); }
  @media (max-width: 980px) {
    .landing-kv, .landing-editorial-grid, .landing-proof-grid { grid-template-columns: 1fr; }
    .landing-meat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .landing-stat { border-left: none; border-top: 1px solid rgba(255,255,255,0.08); padding-left: 0; padding-top: 16px; }
  }
  @media (max-width: 700px) {
    .landing-meat-grid { grid-template-columns: 1fr; }
  }
`

const DECISIONS = [
  {
    label: 'Heure de départ',
    title: 'Le bon démarrage, pas une intuition',
    body: 'Tu poses ton heure de service. L’app tranche quand allumer, quand lancer la pièce et combien de marge garder.',
  },
  {
    label: 'Fenêtre crédible',
    title: 'Une vraie lecture du service',
    body: 'On ne te vend pas une heure magique. On te donne une fenêtre réaliste avec cuisson, repos et variabilité terrain.',
  },
  {
    label: 'Repères pitmaster',
    title: 'Des signaux utiles pendant la cook',
    body: 'Stall, bark, wrap, probe tender, flex test: le jargon est traduit en décisions concrètes au bon moment.',
  },
]

const WORKFLOW = [
  'Tu annonces quand tu veux servir.',
  'Le planning calcule départ, cuisson et repos.',
  'Pendant la cook, tu lis les vrais repères terrain.',
  'Tu sers dans une fenêtre propre, plus sereinement.',
]

const MEATS = [
  { key: 'brisket', name: 'Brisket', note: 'Longue cuisson, bark et probe tender.' },
  { key: 'pork_shoulder', name: 'Pulled Pork', note: 'Hold souple, service généreux.' },
  { key: 'ribs_beef', name: 'Beef Ribs', note: 'Texture fondante, finition précise.' },
  { key: 'ribs_pork', name: 'Spare Ribs', note: 'Couleur, pullback et flex test.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openApp = () => navigate('/app')

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
      <style>{css}</style>

      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 60,
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 22px',
          background: scrolled ? 'rgba(10,9,8,0.82)' : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
          transition: 'all .25s ease',
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'var(--text)',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(180deg, rgba(255,159,97,0.95), rgba(197,83,25,0.95))',
              boxShadow: '0 12px 28px rgba(197,83,25,0.28)',
              fontFamily: 'Syne, sans-serif',
              fontSize: 15,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            CF
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, lineHeight: 1 }}>Charbon &amp; Flamme</div>
            <div className="pm-eyebrow" style={{ marginTop: 3 }}>pitmaster planning app</div>
          </div>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('/auth')}
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--text2)',
              borderRadius: 999,
              padding: '11px 16px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Connexion
          </button>
          <button onClick={openApp} className="pm-btn-primary" style={{ width: 'auto', padding: '12px 18px', fontSize: 12 }}>
            Ouvrir l&apos;app
          </button>
        </div>
      </nav>

      <section
        style={{
          position: 'relative',
          minHeight: 'calc(100svh - 72px)',
          display: 'flex',
          alignItems: 'stretch',
          padding: '0 0 42px',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <img
            src={HERO_IMAGE}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.26, filter: 'saturate(.82) contrast(1.05)' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(10,9,8,0.94) 0%, rgba(10,9,8,0.78) 38%, rgba(10,9,8,0.54) 66%, rgba(10,9,8,0.82) 100%)',
            }}
          />
          <div
            className="landing-glow"
            style={{
              position: 'absolute',
              left: '52%',
              top: '50%',
              width: 520,
              height: 520,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(240,122,47,0.18), transparent 62%)',
              pointerEvents: 'none',
            }}
          />
          <div
            className="landing-smoke"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.05), transparent 24%), radial-gradient(circle at 64% 18%, rgba(255,255,255,0.03), transparent 18%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        <div
          className="pm-shell"
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 620px) minmax(0, 1fr)',
            gap: 24,
            alignItems: 'end',
            padding: '44px 24px 0',
          }}
        >
          <div style={{ paddingBottom: 10 }}>
            <div className="landing-hero-item pm-kicker" style={{ marginBottom: 18 }}>
              cook plan premium, clair, pitmaster
            </div>
            <div className="landing-hero-item" style={{ marginBottom: 14 }}>
              <div className="pm-eyebrow" style={{ marginBottom: 10 }}>charbon &amp; flamme</div>
              <h1 style={{ fontSize: 'clamp(44px, 7vw, 102px)', lineHeight: 0.92, letterSpacing: '-3.8px', maxWidth: 760 }}>
                Le feu se respecte.<br />
                <span style={{ color: 'var(--ember)' }}>Le service se calcule.</span>
              </h1>
            </div>
            <p className="landing-hero-item pm-section-copy" style={{ maxWidth: 520, marginBottom: 28 }}>
              Une app pensée comme un vrai assistant pitmaster: heure de départ, fenêtre de service, étapes de cuisson et repères utiles, sans bruit ni folklore inutile.
            </p>
            <div className="landing-hero-item" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 26 }}>
              <button onClick={openApp} className="pm-btn-primary" style={{ width: 'auto', padding: '16px 28px', fontSize: 14 }}>
                Lancer un planning
              </button>
              <button onClick={() => navigate('/auth')} className="pm-btn-secondary" style={{ width: 'auto', padding: '15px 22px', fontSize: 14 }}>
                Créer un compte
              </button>
            </div>
            <div className="landing-hero-item" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, color: 'var(--text3)', fontSize: 12 }}>
              <span>Gratuit pour démarrer</span>
              <span>Mobile-first en cuisson</span>
              <span>Conçu pour le low &amp; slow</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <div
              style={{
                width: 'min(100%, 470px)',
                padding: '24px 0 0',
                display: 'grid',
                gap: 16,
              }}
            >
              <div className="landing-divider" />
              <div style={{ display: 'grid', gap: 16 }}>
                <div className="landing-stat">
                  <div className="pm-eyebrow" style={{ marginBottom: 8 }}>heure de départ</div>
                  <div className="landing-number">06h</div>
                  <p style={{ maxWidth: 260, marginTop: 10 }}>Pour un brisket servi à 19h, avec marge et repos intégrés.</p>
                </div>
                <div className="landing-stat">
                  <div className="pm-eyebrow" style={{ marginBottom: 8 }}>service window</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 30, color: 'var(--ember)', lineHeight: 1.1 }}>18h00 → 19h30</div>
                  <p style={{ maxWidth: 260, marginTop: 10 }}>Une lecture réaliste de la fin de cuisson, pas une promesse fragile.</p>
                </div>
                <div className="landing-stat">
                  <div className="pm-eyebrow" style={{ marginBottom: 8 }}>terrain</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>stall, wrap, probe tender</div>
                  <p style={{ maxWidth: 280, marginTop: 10 }}>Le vocabulaire pitmaster devient actionnable et lisible pendant la cook.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '34px 24px 90px' }}>
        <div className="pm-shell">
          <div className="landing-kv">
            <div>
              <div className="pm-eyebrow" style={{ marginBottom: 12 }}>ce que l&apos;app décide pour toi</div>
              <h2 className="pm-section-title" style={{ maxWidth: 700, marginBottom: 18 }}>
                Moins d&apos;effets.<br />
                Plus de maîtrise.
              </h2>
            </div>
            <p className="pm-section-copy" style={{ justifySelf: 'end' }}>
              Le problème du BBQ n&apos;est pas le manque de passion. C&apos;est l&apos;excès d&apos;incertitude. Le redesign recentre tout sur trois décisions critiques: quand démarrer, quoi surveiller, quand servir.
            </p>
          </div>

          <div className="landing-proof-grid" style={{ marginTop: 42 }}>
            {DECISIONS.map((item) => (
              <div key={item.label} style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="pm-eyebrow" style={{ marginBottom: 12, color: 'var(--ember)' }}>{item.label}</div>
                <h3 style={{ fontSize: 24, lineHeight: 1.08, marginBottom: 12, color: 'var(--text)' }}>{item.title}</h3>
                <p style={{ color: 'var(--text2)', maxWidth: 340 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 90px' }}>
        <div className="pm-shell landing-editorial-grid">
          <div
            style={{
              position: 'relative',
              minHeight: 520,
              borderRadius: 30,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'var(--bg-elev)',
            }}
          >
            <img
              src={SMOKER_IMAGE}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.56, filter: 'saturate(.75) contrast(1.06)' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,9,8,0.92), rgba(10,9,8,0.28) 55%, rgba(10,9,8,0.7))' }} />
            <div className="pm-dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.12 }} />
            <div style={{ position: 'absolute', left: 22, right: 22, bottom: 24 }}>
              <div className="pm-kicker" style={{ marginBottom: 12 }}>workflow pitmaster</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, lineHeight: 1, marginBottom: 10 }}>
                L&apos;app accompagne la cuisson.<br />
                Elle ne concurrence pas ton instinct.
              </div>
              <p style={{ maxWidth: 420 }}>
                Le design laisse respirer l&apos;essentiel: le plan, les repères, les timings, puis la décision de service.
              </p>
            </div>
          </div>

          <div style={{ alignSelf: 'center' }}>
            <div className="pm-eyebrow" style={{ marginBottom: 12 }}>comment ca marche</div>
            <h2 className="pm-section-title" style={{ marginBottom: 18 }}>
              Une lecture claire du low &amp; slow.
            </h2>
            <p className="pm-section-copy" style={{ marginBottom: 28 }}>
              Le ton devient plus premium parce que l&apos;interface arrête de sur-expliquer. Chaque bloc doit aider a cuire, pas a remplir la page.
            </p>
            <div>
              {WORKFLOW.map((step, index) => (
                <div key={step} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 16, padding: '16px 0', borderTop: index === 0 ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--ember)' }}>{String(index + 1).padStart(2, '0')}</div>
                  <p style={{ fontSize: 16, color: 'var(--text)', lineHeight: 1.55 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 96px' }}>
        <div className="pm-shell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 26 }}>
            <div>
              <div className="pm-eyebrow" style={{ marginBottom: 12 }}>viandes et signatures</div>
              <h2 className="pm-section-title" style={{ maxWidth: 760 }}>
                Une esthétique plus premium,<br />
                mais toujours tres barbecue.
              </h2>
            </div>
            <p className="pm-section-copy" style={{ maxWidth: 420 }}>
              L&apos;identité s&apos;appuie sur la matière: viande, braise, acier, fumee. Pas sur des widgets génériques ou des cartes répétitives.
            </p>
          </div>

          <div className="landing-meat-grid">
            {MEATS.map((meat) => (
              <button
                key={meat.key}
                onClick={openApp}
                className="landing-outline landing-photo"
                style={{
                  textAlign: 'left',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'linear-gradient(180deg, rgba(28,22,18,0.82), rgba(16,13,11,0.9))',
                  borderRadius: 24,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  transition: 'border-color .18s ease',
                }}
              >
                <div style={{ height: 240, overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={MEAT_IMAGES[meat.key]}
                    alt={meat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .35s ease' }}
                    loading="lazy"
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,9,8,0.9), rgba(10,9,8,0.08) 58%)' }} />
                </div>
                <div style={{ padding: '18px 18px 20px' }}>
                  <div className="pm-eyebrow" style={{ marginBottom: 8, color: 'var(--ember)' }}>piece</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, lineHeight: 1, marginBottom: 10 }}>{meat.name}</div>
                  <p style={{ color: 'var(--text2)' }}>{meat.note}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 120px' }}>
        <div
          className="pm-shell"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 32,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(135deg, rgba(27,21,18,0.95), rgba(16,13,11,0.98))',
            padding: '34px 24px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: -40,
              top: -70,
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(240,122,47,0.18), transparent 66%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="pm-eyebrow" style={{ marginBottom: 14 }}>prochaine etape</div>
            <h2 className="pm-section-title" style={{ maxWidth: 760, marginBottom: 18 }}>
              Une app plus claire, plus premium,
              <br />
              plus pitmaster.
            </h2>
            <p className="pm-section-copy" style={{ maxWidth: 620, marginBottom: 24 }}>
              Le redesign retire le bruit, renforce la hiérarchie et donne plus de place aux vraies décisions de cuisson. L&apos;outil devient plus crédible visuellement sans perdre sa chaleur.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button onClick={openApp} className="pm-btn-primary" style={{ width: 'auto', padding: '16px 26px' }}>
                Ouvrir le calculateur
              </button>
              <button onClick={() => navigate('/auth')} className="pm-btn-secondary" style={{ width: 'auto', padding: '15px 22px' }}>
                Sauvegarder mes cuissons
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
