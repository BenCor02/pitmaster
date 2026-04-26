// Charbon & Flamme — Header / Footer / Newsletter / Sponsor

function CFLogo({ size = 28, color = '#1F1A14', accent = '#8B1A1A' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
      <svg viewBox="0 0 40 40" width={size + 8} height={size + 8}>
        <circle cx="20" cy="20" r="19" fill="none" stroke={color} strokeWidth="1.5"/>
        <circle cx="20" cy="20" r="15" fill="none" stroke={color} strokeWidth="0.6"/>
        <path d="M 20 32 C 14 28, 12 22, 16 16 C 18 14, 20 11, 20 8 C 20 11, 22 14, 24 16 C 28 22, 26 28, 20 32 Z" fill={accent}/>
        <path d="M 20 30 C 17 27, 16 24, 18 20 C 19 18, 20 16, 20 14 C 20 16, 21 18, 22 20 C 24 24, 23 27, 20 30 Z" fill="#E8A53C"/>
      </svg>
      <div style={{ lineHeight: 0.95 }}>
        <div style={{ fontFamily:'var(--cf-serif)', fontSize: size * 0.7, fontWeight: 700, letterSpacing: '0.02em', color }}>CHARBON</div>
        <div style={{ fontFamily:'var(--cf-serif)', fontSize: size * 0.42, fontWeight: 400, letterSpacing: '0.4em', color: accent, fontStyle:'italic' }}>& FLAMME</div>
      </div>
    </div>
  );
}

function Header({ mobile, dark, currentPage = 'home' }) {
  const items = [
    { id:'calc', label:'Calculateur' },
    { id:'recettes', label:'Recettes' },
    { id:'rubs', label:'Rubs' },
    { id:'articles', label:'Articles' },
    { id:'compte', label:'Mon compte' },
  ];
  const bg = dark ? 'rgba(20,16,11,0.92)' : 'rgba(239,231,216,0.92)';
  const fg = dark ? '#F5EFE0' : '#1F1A14';
  const accent = '#8B1A1A';
  if (mobile) {
    return (
      <header style={{
        position:'sticky', top:0, zIndex: 50,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 16px',
        background: bg,
        backdropFilter:'blur(8px)',
        borderBottom: `1px solid ${dark ? 'rgba(245,239,224,0.1)' : 'rgba(31,26,20,0.12)'}`,
      }}>
        <CFLogo size={20} color={fg} accent={accent}/>
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          <button style={{ background:'none', border:'none', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </button>
          <button style={{ background:'none', border:'none', padding: 4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.8"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
        </div>
      </header>
    );
  }
  return (
    <header style={{
      position:'sticky', top:0, zIndex: 50,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'18px 48px',
      background: bg,
      backdropFilter:'blur(8px)',
      borderBottom: `1px solid ${dark ? 'rgba(245,239,224,0.1)' : 'rgba(31,26,20,0.12)'}`,
    }}>
      <CFLogo size={26} color={fg} accent={accent}/>
      <nav style={{ display:'flex', gap: 4 }}>
        {items.map(item => (
          <a key={item.id} style={{
            fontFamily:'var(--cf-serif)', fontSize: 14, fontWeight: 500,
            letterSpacing: '0.06em', textTransform:'uppercase',
            padding: '8px 14px',
            color: currentPage === item.id ? accent : fg,
            borderBottom: currentPage === item.id ? `2px solid ${accent}` : '2px solid transparent',
            cursor: 'pointer',
          }}>{item.label}</a>
        ))}
      </nav>
      <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
        <button style={{ background:'none', border:'none', padding: 6, color: fg }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        </button>
        <FireButton size="sm" type={dark ? 'cream' : 'primary'}>Newsletter</FireButton>
      </div>
    </header>
  );
}

function NewsletterBlock({ mobile }) {
  return (
    <section style={{
      position:'relative',
      padding: mobile ? '40px 20px' : '80px 64px',
      overflow:'hidden',
      background: '#14100B',
      color:'#F5EFE0',
    }}>
      <div className="cf-charcoal-bg" style={{ position:'absolute', inset:0 }}/>
      <SmokeBackdrop intensity={0.4} dark={true}/>
      <EmberGlow count={20}/>
      <div style={{ position:'relative', maxWidth: 720, margin:'0 auto', textAlign:'center' }}>
        <SectionEyebrow accent="#E8A53C">La newsletter</SectionEyebrow>
        <h2 style={{
          fontSize: mobile ? 42 : 72,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          textTransform:'uppercase',
          margin: '16px 0',
          color: '#F5EFE0',
          textShadow: '0 0 20px rgba(232,165,60,0.2)',
        }}>La gazette<br/>des pitmasters</h2>
        <p style={{ fontSize: mobile ? 14 : 16, color:'#B8AC97', maxWidth: 480, margin:'0 auto 28px', lineHeight: 1.6 }}>
          Chaque dimanche matin : une recette, une technique, un coup de cœur produit. <span style={{ color:'#E8A53C' }}>Pas de spam, jamais.</span>
        </p>
        <div style={{
          display:'flex', flexDirection: mobile ? 'column' : 'row',
          gap: 8, maxWidth: 480, margin:'0 auto',
        }}>
          <input placeholder="ton.email@charbon.fr" style={{
            flex: 1,
            padding:'14px 16px',
            background:'rgba(245,239,224,0.06)',
            border:'1px solid rgba(245,239,224,0.2)',
            color:'#F5EFE0',
            fontFamily:'var(--cf-sans)', fontSize: 14,
            outline:'none',
          }}/>
          <FireButton type="primary" size="md">Je m'abonne</FireButton>
        </div>
        <div style={{ display:'flex', gap: 16, justifyContent:'center', marginTop: 20, fontFamily:'var(--cf-mono)', fontSize: 11, letterSpacing:'0.08em', color:'#6E6356', textTransform:'uppercase' }}>
          <span>· 4 200+ inscrits</span>
          <span>· hebdomadaire</span>
          <span>· 100% bbq</span>
        </div>
      </div>
    </section>
  );
}

function Footer({ mobile }) {
  return (
    <footer style={{
      background:'#1F1A14',
      color:'#B8AC97',
      padding: mobile ? '32px 20px 20px' : '56px 64px 28px',
      borderTop:'4px solid #8B1A1A',
    }}>
      <div style={{
        display:'grid',
        gridTemplateColumns: mobile ? '1fr' : '1.4fr 1fr 1fr 1fr',
        gap: mobile ? 28 : 48,
        marginBottom: 40,
      }}>
        <div>
          <CFLogo size={22} color="#F5EFE0" accent="#E8A53C"/>
          <p style={{ marginTop: 16, fontSize: 13, lineHeight: 1.6, maxWidth: 280 }}>
            Le calculateur et le média BBQ français. Pour ceux qui aiment cuisiner au feu.
          </p>
        </div>
        {[
          { title:'Naviguer', items:['Calculateur','Recettes','Rubs','Articles'] },
          { title:'Pour les marques', items:['Partenariats','Sponsoring','Kit média','Contact'] },
          { title:'Suivre', items:['Instagram','YouTube','TikTok','Pinterest'] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily:'var(--cf-serif)', fontSize: 13, fontWeight: 600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#F5EFE0', marginBottom: 12 }}>{col.title}</div>
            <ul style={{ listStyle:'none', padding: 0, margin: 0, display:'flex', flexDirection:'column', gap: 8 }}>
              {col.items.map(item => <li key={item} style={{ fontSize: 13 }}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{
        paddingTop: 24, borderTop:'1px solid rgba(245,239,224,0.1)',
        display:'flex', flexDirection: mobile ? 'column' : 'row', justifyContent:'space-between',
        gap: 12,
        fontFamily:'var(--cf-mono)', fontSize: 11, letterSpacing:'0.08em', color:'#6E6356', textTransform:'uppercase',
      }}>
        <div>© 2026 Charbon & Flamme · Site indépendant — soutenu par nos partenaires</div>
        <div style={{ display:'flex', gap: 16 }}>
          <span>Mentions légales</span>
          <span>Cookies</span>
          <span>RGPD</span>
        </div>
      </div>
    </footer>
  );
}

function SponsorSlot({ label = 'Sponsorisé par', name = 'Weber Genesis EX-435', mobile, big }) {
  return (
    <div style={{
      border:'1px dashed rgba(31,26,20,0.3)',
      background:'#FAF6EE',
      padding: big ? (mobile ? 20 : 32) : (mobile ? 14 : 18),
      display:'flex', alignItems:'center', gap: big ? 20 : 14,
      flexDirection: big && mobile ? 'column' : 'row',
      textAlign: big && mobile ? 'center' : 'left',
    }}>
      <div style={{
        width: big ? 64 : 40, height: big ? 64 : 40,
        background:'#1F1A14', color:'#E8A53C',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'var(--cf-serif)', fontWeight: 700, fontSize: big ? 24 : 16,
        letterSpacing:'0.05em',
        flexShrink: 0,
      }}>W</div>
      <div style={{ flex: 1 }}>
        <div className="cf-eyebrow" style={{ marginBottom: 4 }}>{label}</div>
        <div style={{ fontFamily:'var(--cf-serif)', fontSize: big ? 22 : 15, fontWeight: 600, color:'#1F1A14' }}>{name}</div>
        {big && <div style={{ fontSize: 13, color:'#6E6356', marginTop: 4 }}>Le grill connecté qui cuit comme un pitmaster du Texas, dans ton jardin.</div>}
      </div>
      {big && !mobile && <FireButton size="sm" type="ghost">Découvrir →</FireButton>}
    </div>
  );
}

Object.assign(window, { CFLogo, Header, NewsletterBlock, Footer, SponsorSlot });
