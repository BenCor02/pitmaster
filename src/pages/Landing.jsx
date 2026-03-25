import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const FEATURES = [
    { icon: '🔥', title: 'Calculateur Reverse', desc: 'Anticipe le "stall". PitMaster calcule l\'heure exacte de mise à feu selon le poids, la densité de la viande et l\'essence de bois choisie.' },
    { icon: '⏱️', title: 'Multi-cuisson Sync', desc: 'Gérez jusqu\'à 10 viandes simultanément. Un tableau de bord unique synchronise les temps pour que tout soit prêt en même temps.' },
    { icon: '🤖', title: 'Expert IA 24/7', desc: 'Une question sur l\'écorce (bark), le saumurage ou le flux d\'air ? Notre IA spécialisée BBQ vous répond instantanément.' },
    { icon: '❄️', title: 'Fumage & Salaison', desc: 'Règle pro 4-2-1 et calculateurs de sel nitrité au gramme près pour des charcuteries et fumages à froid parfaits.' },
    { icon: '📓', title: 'Cloud Journal', desc: 'Historique illimité de vos sessions. Enregistrez vos courbes de température et vos photos pour reproduire chaque succès.' },
    { icon: '📚', title: 'Masterclass & Rubs', desc: 'Accédez à notre guide complet des bois, un lexique technique et des recettes secrètes de rubs de compétition.' },
  ]

  return (
    <div style={{ background: '#050505', color: '#fff', fontFamily: "'DM Sans', sans-serif", minHeight: '100vh' }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=DM+Sans:wght@400;500;700&display=swap');
        .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        .hero-title { font-family: 'Syne', sans-serif; font-size: clamp(40px, 8vw, 85px); line-height: 0.9; letter-spacing: -3px; text-transform: uppercase; }
        .btn-primary { background: #f06030; color: white; border: none; padding: 18px 36px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px rgba(240,96,48,0.3); }
        .btn-primary:hover { transform: scale(1.02); box-shadow: 0 15px 30px rgba(240,96,48,0.5); }
        .card { background: linear-gradient(145deg, #111, #080808); border: 1px solid #1a1a1a; border-radius: 28px; padding: 35px; transition: 0.3s; }
        .card:hover { border-color: #f06030; transform: translateY(-5px); }
        .img-hero { width: 100%; height: 550px; object-fit: cover; border-radius: 40px; border: 1px solid #222; filter: brightness(0.8) contrast(1.1); }
      `}</style>

      {/* NAV */}
      <nav style={{ height: 80, display: 'flex', alignItems: 'center', position: 'fixed', width: '100%', top: 0, zIndex: 1000, background: scrolled ? 'rgba(5,5,5,0.9)' : 'transparent', backdropFilter: 'blur(10px)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800 }}>PIT<span style={{ color: '#f06030' }}>MASTER</span></div>
          <button onClick={() => navigate('/auth')} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>Essai Gratuit</button>
        </div>
      </nav>

      {/* HERO SECTION - BRISKET JUTEUSE */}
      <section style={{ paddingTop: 140, paddingBottom: 80 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="hero-title">Dominez le feu,<br /><span style={{ color: '#f06030' }}>Maîtrisez le temps.</span></h1>
          <p style={{ color: '#aaa', fontSize: 20, maxWidth: 700, margin: '24px auto 40px', lineHeight: 1.6 }}>
            L'algorithme prédictif qui garantit une viande légendaire. Calculez votre planning de cuisson pour Brisket, Ribs et Pulled Pork.
          </p>
          <button className="btn-primary" onClick={() => navigate('/auth')} style={{ marginBottom: 60, fontSize: 18 }}>Lancer ma session de cuisson</button>
          
          <img 
            src="https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?q=80&w=1600&auto=format&fit=crop" 
            className="img-hero"
            alt="Close up juicy brisket barbecue"
          />
        </div>
      </section>

      {/* SECTION MÉTHODE (INDICATEURS CLÉS) */}
      <section style={{ padding: '60px 0', borderY: '1px solid #1a1a1a', background: '#080808' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 40 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#f06030', fontFamily: 'Syne' }}>110°C</div>
              <div style={{ fontSize: 12, color: '#666', fontWeight: 700 }}>TEMPÉRATURE DE FUMAGE</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#f06030', fontFamily: 'Syne' }}>94°C</div>
              <div style={{ fontSize: 12, color: '#666', fontWeight: 700 }}>CIBLE DE TENDRETÉ</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#f06030', fontFamily: 'Syne' }}>12H+</div>
              <div style={{ fontSize: 12, color: '#666', fontWeight: 700 }}>CUISSON "LOW & SLOW"</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES (RETOUR DES 6 BLOCS) */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontFamily: 'Syne', fontSize: 42 }}>L'arsenal du Pitmaster.</h2>
            <p style={{ color: '#555', marginTop: 10 }}>Chaque outil a été pensé pour la précision ultime.</p>
          </div>
          <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card">
                <div style={{ fontSize: 42, marginBottom: 25 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Syne', fontSize: 24, color: '#f06030', marginBottom: 15 }}>{f.title}</h3>
                <p style={{ color: '#888', fontSize: 16, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMAGE CONTEXTUELLE 2 - PULLED PORK OU RIBS */}
      <section style={{ padding: '40px 0 100px' }}>
        <div className="container">
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
              <img 
                src="https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=1000&auto=format&fit=crop" 
                style={{ width: '100%', borderRadius: 32, border: '1px solid #222' }}
                alt="Delicious smoked barbecue ribs"
              />
              <div>
                <h2 style={{ fontFamily: 'Syne', fontSize: 48, lineHeight: 1, marginBottom: 25 }}>Le secret est dans la <span style={{ color: '#f06030' }}>patience.</span></h2>
                <p style={{ color: '#aaa', fontSize: 19, lineHeight: 1.6 }}>
                  Ne laissez plus le hasard décider du résultat de vos 12 heures de travail. PitMaster analyse la physique thermique de votre session pour vous dire exactement quand emballer, arroser et sortir la viande.
                </p>
                <button className="btn-primary" style={{ marginTop: 30 }} onClick={() => navigate('/auth')}>Essayer le calculateur</button>
              </div>
           </div>
        </div>
      </section>

      {/* FOOTER AVEC COPYRIGHT ORANGE */}
      <footer style={{ padding: '100px 0 60px', borderTop: '1px solid #111', background: '#030303', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Syne', fontSize: 36, fontWeight: 800, color: '#f06030', marginBottom: 15 }}>
          PITMASTER © 2026
        </div>
        <div style={{ color: '#333', letterSpacing: 3, fontWeight: 700, fontSize: 13 }}>
          L'ART DU FEU — LA SCIENCE DU TEMPS — LA MAÎTRISE DU GOÛT
        </div>
      </footer>
    </div>
  )
}