// Charbon & Flamme — Recipe list, Rub fiche, Article pages

// ─────────────────────────────────────────────────────────────
// 3. RECIPE LIST PAGE
// ─────────────────────────────────────────────────────────────
function RecipeListPage({ mobile }) {
  const [filter, setFilter] = React.useState('all');
  const cats = ['Tout', 'Bœuf', 'Porc', 'Volaille', 'Agneau', 'Poisson', 'Légumes'];
  const methods = ['Toutes méthodes', 'Low & Slow', 'Hot & Fast', 'Reverse Sear'];

  const recipes = [
    { img: RECIPE_IMAGES.brisket, cat:'Bœuf', title:'Brisket fumé 14h', time:'14h', diff:'Avancé' },
    { img: RECIPE_IMAGES.picanha, cat:'Bœuf', title:'Picanha au sel gros', time:'45 min', diff:'Facile' },
    { img: RECIPE_IMAGES.ribs, cat:'Porc', title:'Travers Memphis', time:'5h', diff:'Inter.' },
    { img: RECIPE_IMAGES.poulet, cat:'Volaille', title:'Poulet beer can', time:'1h30', diff:'Facile', sponsor:true },
    { img: RECIPE_IMAGES.pulled, cat:'Porc', title:'Pulled pork', time:'12h', diff:'Avancé' },
    { img: RECIPE_IMAGES.steak, cat:'Bœuf', title:'Côte de bœuf reverse', time:'2h', diff:'Inter.' },
    { img: RECIPE_IMAGES.saumon, cat:'Poisson', title:'Saumon planche cèdre', time:'30 min', diff:'Facile' },
    { img: RECIPE_IMAGES.legumes, cat:'Légumes', title:'Maïs grillé chimichurri', time:'20 min', diff:'Facile' },
    { img: RECIPE_IMAGES.burger, cat:'Bœuf', title:'Smashburger jus', time:'15 min', diff:'Facile' },
  ];

  return (
    <div className="cf-root cf-paper-bg" style={{ width:'100%' }}>
      <Header mobile={mobile} currentPage="recettes"/>
      <section style={{ padding: mobile ? '32px 20px 16px' : '64px 64px 32px', maxWidth: 1400, margin:'0 auto' }}>
        <SectionEyebrow>Le mag · Recettes & articles</SectionEyebrow>
        <h1 style={{ fontSize: mobile ? 56 : 120, lineHeight: 0.92, textTransform:'uppercase', fontWeight: 700, marginTop: 12, letterSpacing:'-0.015em' }}>
          Recettes<br/>de <span style={{ color:'#8B1A1A', fontStyle:'italic' }}>feu</span>.
        </h1>
        <p style={{ marginTop: 16, fontSize: mobile ? 14 : 16, color:'#3A3025', maxWidth: 560, lineHeight: 1.5 }}>
          De la côte de bœuf reverse au pulled pork de 12 heures. Toutes nos recettes sont reliées au calculateur — un clic et tu cuisines.
        </p>
      </section>

      <section style={{ padding: mobile ? '0 20px 16px' : '0 64px 24px', maxWidth: 1400, margin:'0 auto' }}>
        <div style={{ display:'flex', gap: 8, overflowX:'auto', paddingBottom: 8 }} className="cf-noscroll">
          {cats.map(c => <Pill key={c} active={c === 'Tout'}>{c}</Pill>)}
        </div>
        {!mobile && (
          <div style={{ display:'flex', gap: 8, marginTop: 8 }}>
            {methods.map(m => <Pill key={m} active={m === 'Toutes méthodes'}>{m}</Pill>)}
            <div style={{ flex: 1 }}/>
            <Pill>⏱ Temps ▾</Pill>
            <Pill>★ Difficulté ▾</Pill>
          </div>
        )}
      </section>

      <section style={{ padding: mobile ? '0 20px 32px' : '0 64px 32px', maxWidth: 1400, margin:'0 auto' }}>
        <FeaturedRecipe
          mobile={mobile}
          image={RECIPE_IMAGES.brisket}
          eyebrow="À la une · Reportage"
          title="J'ai dormi dehors avec un brisket"
          dek="14 heures de fumée, 3 réveils nocturnes, et la conviction que le low & slow se mérite. Récit d'une nuit blanche à 110°C."
          meta={['8 min de lecture', 'Mathieu R.', '15 mars']}
        />
      </section>

      <section style={{ padding: mobile ? '0 20px 24px' : '0 64px 32px', maxWidth: 1400, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: mobile ? 12 : 20 }}>
          {recipes.slice(0, 4).map((r, i) => (
            <RecipeCard key={i} compact image={r.img} category={r.cat} title={r.title} time={r.time} difficulty={r.diff} sponsor={r.sponsor}/>
          ))}
        </div>
      </section>

      <section style={{ padding: mobile ? '0 20px 24px' : '0 64px 32px', maxWidth: 1400, margin:'0 auto' }}>
        <SponsorSlot mobile={mobile} label="Cette grille vous est offerte par" name="Big Green Egg · Carbon Steel"/>
      </section>

      <section style={{ padding: mobile ? '0 20px 48px' : '0 64px 64px', maxWidth: 1400, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: mobile ? 12 : 20 }}>
          {recipes.slice(4).map((r, i) => (
            <RecipeCard key={i} compact image={r.img} category={r.cat} title={r.title} time={r.time} difficulty={r.diff} sponsor={r.sponsor}/>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop: 32 }}>
          <FireButton size="md" type="ghost">Charger plus de recettes</FireButton>
        </div>
      </section>

      <NewsletterBlock mobile={mobile}/>
      <Footer mobile={mobile}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. RUB PAGE
// ─────────────────────────────────────────────────────────────
function RubPage({ mobile }) {
  const ingredients = [
    { name:'Paprika fumé', pct: 28, color:'#8B1A1A' },
    { name:'Cassonade brune', pct: 22, color:'#6B4423' },
    { name:'Sel de mer', pct: 15, color:'#E5DBC6' },
    { name:'Poivre noir mignonette', pct: 12, color:'#1F1A14' },
    { name:'Ail granulé', pct: 9, color:'#D9CDB5' },
    { name:'Cumin moulu', pct: 6, color:'#A0763A' },
    { name:'Moutarde sèche', pct: 5, color:'#C4942C' },
    { name:'Cayenne', pct: 3, color:'#C44A1F' },
  ];

  return (
    <div className="cf-root cf-paper-bg" style={{ width:'100%' }}>
      <Header mobile={mobile} currentPage="rubs"/>

      {/* Hero */}
      <section style={{
        position:'relative',
        padding: mobile ? '32px 20px 40px' : '64px 64px 80px',
        background:'#1F1A14', color:'#F5EFE0', overflow:'hidden',
      }}>
        <div style={{
          position:'absolute', inset: 0,
          backgroundImage:`linear-gradient(to right, rgba(20,16,11,0.85) 0%, rgba(20,16,11,0.5) 100%), url(${RECIPE_IMAGES.rub})`,
          backgroundSize:'cover', backgroundPosition:'center',
        }}/>
        <SmokeBackdrop intensity={0.3} dark={true}/>
        <div style={{ position:'relative', maxWidth: 1280, margin:'0 auto', display:'grid', gridTemplateColumns: mobile ? '1fr' : '1.6fr 1fr', gap: 32, alignItems:'center' }}>
          <div>
            <div className="cf-eyebrow" style={{ color:'#E8A53C' }}>Fiche rub · 02 / Bœuf & porc</div>
            <h1 style={{ fontSize: mobile ? 64 : 132, lineHeight: 0.9, textTransform:'uppercase', fontWeight: 700, marginTop: 14, letterSpacing:'-0.02em' }}>
              Magic<br/>Dust
            </h1>
            <p style={{ marginTop: 18, fontSize: mobile ? 15 : 18, color:'#D9CDB5', maxWidth: 560, lineHeight: 1.5 }}>
              Le rub de référence des compétitions BBQ américaines, version Charbon & Flamme. Sucré-fumé, légèrement piquant, polyvalent. Ton point de départ pour tout ce qui passe au feu.
            </p>
            <div style={{ marginTop: 24, display:'flex', gap: 16, fontFamily:'var(--cf-mono)', fontSize: 11, letterSpacing:'0.1em', color:'#B8AC97', textTransform:'uppercase', flexWrap:'wrap' }}>
              <span><span style={{ color:'#E8A53C' }}>★★★★</span>☆ <span style={{ color:'#F5EFE0' }}>4.6 / 5</span></span>
              <span>· 8 ingrédients</span>
              <span>· Niveau pitmaster</span>
            </div>
          </div>
          {!mobile && (
            <div style={{ display:'flex', justifyContent:'center' }}>
              <StampBadge size={220} topText="MAGIC DUST" bottomText="· EST. 1989 ·" center="C&F" accent="#E8A53C" tone="light" borderStyle="dashed"/>
            </div>
          )}
        </div>
      </section>

      {/* Composition */}
      <section style={{ padding: mobile ? '40px 20px' : '80px 64px', maxWidth: 1280, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1.2fr', gap: mobile ? 32 : 64 }}>
          <div>
            <SectionEyebrow>Composition</SectionEyebrow>
            <h2 style={{ fontSize: mobile ? 36 : 56, lineHeight: 0.95, textTransform:'uppercase', fontWeight: 700, marginTop: 12 }}>
              Huit<br/>ingrédients,<br/><span style={{ color:'#8B1A1A', fontStyle:'italic' }}>zéro</span> compromis.
            </h2>
            <p style={{ marginTop: 18, fontSize: 14, color:'#3A3025', lineHeight: 1.6 }}>
              Le sucre brun construit la croûte. Le paprika fumé donne la couleur. Le cumin et la moutarde tiennent l'ensemble. Le cayenne ferme la marche, sans dominer.
            </p>
          </div>
          <div style={{ background:'#FAF6EE', border:'1.5px solid rgba(31,26,20,0.15)', padding: mobile ? 20 : 28 }}>
            <div className="cf-eyebrow" style={{ marginBottom: 16 }}>Proportions · base 100g</div>
            <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
              {ingredients.map((ing, i) => (
                <div key={i}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 4 }}>
                    <span style={{ fontFamily:'var(--cf-serif)', fontSize: 16, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.02em' }}>{ing.name}</span>
                    <span style={{ fontFamily:'var(--cf-mono)', fontSize: 12, color:'#8B1A1A', fontWeight: 600 }}>{ing.pct}g</span>
                  </div>
                  <div style={{ height: 6, background:'rgba(31,26,20,0.08)', position:'relative' }}>
                    <div style={{ position:'absolute', left: 0, top: 0, bottom: 0, width: `${ing.pct * 3}%`, background: ing.color, maxWidth:'100%' }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dosage + Compatibilité */}
      <section style={{ padding: mobile ? '0 20px 40px' : '0 64px 80px', maxWidth: 1280, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: mobile ? 16 : 20 }}>
          <div style={{ background:'#1F1A14', color:'#F5EFE0', padding: 24 }}>
            <div className="cf-eyebrow" style={{ color:'#E8A53C' }}>Dosage</div>
            <div style={{ marginTop: 14, display:'flex', flexDirection:'column', gap: 12, fontFamily:'var(--cf-serif)' }}>
              <div><span style={{ fontSize: 32, fontWeight: 700, color:'#E8A53C' }}>20g/kg</span><div style={{ fontSize: 12, color:'#B8AC97', marginTop: 2, fontFamily:'var(--cf-mono)', letterSpacing:'0.08em' }}>LOW & SLOW</div></div>
              <div><span style={{ fontSize: 32, fontWeight: 700, color:'#E8A53C' }}>12g/kg</span><div style={{ fontSize: 12, color:'#B8AC97', marginTop: 2, fontFamily:'var(--cf-mono)', letterSpacing:'0.08em' }}>HOT & FAST</div></div>
              <div><span style={{ fontSize: 32, fontWeight: 700, color:'#E8A53C' }}>15g/kg</span><div style={{ fontSize: 12, color:'#B8AC97', marginTop: 2, fontFamily:'var(--cf-mono)', letterSpacing:'0.08em' }}>REVERSE SEAR</div></div>
            </div>
          </div>
          <div style={{ background:'#FAF6EE', border:'1.5px solid rgba(31,26,20,0.15)', padding: 24 }}>
            <div className="cf-eyebrow">Cuts compatibles</div>
            <div style={{ marginTop: 14, display:'flex', flexWrap:'wrap', gap: 8 }}>
              {['Brisket','Travers','Pulled pork','Picanha','Côte de bœuf','Poulet entier'].map(t => <Pill key={t} active>{t}</Pill>)}
            </div>
            <div className="cf-eyebrow" style={{ marginTop: 24 }}>À éviter sur</div>
            <div style={{ marginTop: 8, display:'flex', flexWrap:'wrap', gap: 8 }}>
              {['Poisson','Légumes verts'].map(t => <Pill key={t}>{t}</Pill>)}
            </div>
          </div>
          <div style={{ background:'#FAF6EE', border:'1.5px solid rgba(31,26,20,0.15)', padding: 24, display:'flex', flexDirection:'column' }}>
            <div className="cf-eyebrow">L'origine</div>
            <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, color:'#3A3025', flex: 1 }}>
              Inventé par Mike Mills dans l'Illinois pour ses compétitions. La recette a fuité dans les années 90, chacun a sa version. La nôtre tire vers le fumé et adoucit le sucre — version française, version BBQ.
            </p>
            <FireButton size="sm" type="ghost" style={{ marginTop: 16, alignSelf:'flex-start' }}>Lire l'histoire complète →</FireButton>
          </div>
        </div>
      </section>

      {/* Affiliate */}
      <section style={{ padding: mobile ? '0 20px 40px' : '0 64px 64px', maxWidth: 1280, margin:'0 auto' }}>
        <div style={{
          background:'#FAF6EE',
          border:'2px dashed #8B1A1A',
          padding: mobile ? 24 : 36,
          display:'flex', flexDirection: mobile ? 'column' : 'row',
          alignItems:'center', gap: 24,
        }}>
          <StampBadge size={mobile ? 90 : 120} topText="ACHAT MALIN" bottomText="· LIEN PARTENAIRE ·" center="€" accent="#8B1A1A"/>
          <div style={{ flex: 1, textAlign: mobile ? 'center' : 'left' }}>
            <div className="cf-eyebrow" style={{ marginBottom: 6 }}>Acheter ce rub · lien affilié</div>
            <h3 style={{ fontSize: mobile ? 24 : 32, textTransform:'uppercase', fontWeight: 700, lineHeight: 1.05 }}>Magic Dust prêt à l'emploi · Pot de 250g</h3>
            <p style={{ marginTop: 8, fontSize: 14, color:'#3A3025' }}>Préparé par notre partenaire <strong>Pitmaster Supply</strong>. On touche une commission, ça finance le calculateur.</p>
          </div>
          <FireButton size="lg" type="primary">14,90€ · Commander</FireButton>
        </div>
      </section>

      {/* Recipes using this rub */}
      <section style={{ padding: mobile ? '0 20px 48px' : '0 64px 80px', maxWidth: 1400, margin:'0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <SectionEyebrow>Avec ce rub</SectionEyebrow>
          <h2 style={{ fontSize: mobile ? 32 : 48, textTransform:'uppercase', fontWeight: 700, marginTop: 12 }}>5 recettes, 5 ambiances</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: mobile ? 12 : 20 }}>
          <RecipeCard compact image={RECIPE_IMAGES.brisket} category="Bœuf" title="Brisket Magic Dust" time="14h" difficulty="Avancé"/>
          <RecipeCard compact image={RECIPE_IMAGES.ribs} category="Porc" title="Travers caramélisés" time="5h" difficulty="Inter."/>
          <RecipeCard compact image={RECIPE_IMAGES.pulled} category="Porc" title="Pulled pork classique" time="12h" difficulty="Avancé"/>
          <RecipeCard compact image={RECIPE_IMAGES.poulet} category="Volaille" title="Poulet rôti" time="1h30" difficulty="Facile"/>
        </div>
      </section>

      <Footer mobile={mobile}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. ARTICLE / RECIPE PAGE
// ─────────────────────────────────────────────────────────────
function ArticlePage({ mobile }) {
  return (
    <div className="cf-root cf-paper-bg" style={{ width:'100%' }}>
      <Header mobile={mobile} currentPage="articles"/>

      <article>
        {/* Hero */}
        <header style={{ padding: mobile ? '32px 20px 24px' : '72px 64px 32px', maxWidth: 920, margin:'0 auto' }}>
          <div className="cf-eyebrow" style={{ color:'#8B1A1A' }}>Reportage · Texas · Long format</div>
          <h1 style={{ fontSize: mobile ? 44 : 88, lineHeight: 0.95, textTransform:'uppercase', fontWeight: 700, marginTop: 16, letterSpacing:'-0.02em' }}>
            J'ai dormi<br/>dehors avec<br/>un <span style={{ color:'#8B1A1A', fontStyle:'italic' }}>brisket</span>.
          </h1>
          <p style={{ marginTop: 20, fontSize: mobile ? 17 : 22, lineHeight: 1.45, color:'#3A3025', fontWeight: 400 }}>
            14 heures de fumée, 3 réveils nocturnes, et la conviction que le low & slow se mérite. Récit d'une nuit blanche à 110°C, quelque part entre Lockhart et l'aurore.
          </p>
          <div style={{ marginTop: 24, display:'flex', gap: 16, fontFamily:'var(--cf-mono)', fontSize: 11, letterSpacing:'0.1em', color:'#6E6356', textTransform:'uppercase', flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ width: 36, height: 36, background:'#1F1A14', color:'#E8A53C', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--cf-serif)', fontWeight: 700 }}>MR</div>
            <span><strong style={{ color:'#1F1A14' }}>Mathieu Ratel</strong> · 15 mars 2026</span>
            <span>· 8 min de lecture</span>
            <span>· ★ Pitmaster</span>
          </div>
        </header>

        {/* Hero image */}
        <div style={{
          width: mobile ? '100%' : 'calc(100% - 64px)',
          maxWidth: 1200,
          margin:'0 auto',
          aspectRatio: mobile ? '4/3' : '16/9',
          backgroundImage:`url(${RECIPE_IMAGES.brisket})`,
          backgroundSize:'cover', backgroundPosition:'center',
          marginBottom: mobile ? 32 : 48,
        }}/>

        {/* Body */}
        <div style={{ padding: mobile ? '0 20px' : '0 64px', maxWidth: 720, margin:'0 auto' }}>
          <p style={{ fontSize: mobile ? 17 : 19, lineHeight: 1.65, color:'#1F1A14' }}>
            <span style={{ fontFamily:'var(--cf-serif)', fontSize: mobile ? 56 : 80, fontWeight: 700, float:'left', lineHeight: 0.85, paddingTop: 4, paddingRight: 12, color:'#8B1A1A' }}>I</span>
            l est 23h47 quand je sors le brisket du frigo. 4,2 kilos de poitrine de bœuf, gras épais, marbrure correcte sans plus. J'ai acheté la pièce ce matin chez Mickaël, le boucher de la rue Saint-Maur, qui m'a regardé comme si j'étais fou de vouloir cuire ça toute une nuit.
          </p>
          <p style={{ fontSize: mobile ? 17 : 19, lineHeight: 1.65, marginTop: 20, color:'#1F1A14' }}>
            « Tu vas dormir sur ton balcon ? » Oui, Mickaël. C'est exactement le plan.
          </p>

          <h2 style={{ fontSize: mobile ? 32 : 44, textTransform:'uppercase', fontWeight: 700, marginTop: 48, marginBottom: 16, lineHeight: 1 }}>
            Préparer la nuit
          </h2>
          <p style={{ fontSize: mobile ? 17 : 19, lineHeight: 1.65, color:'#1F1A14' }}>
            Le brisket américain a ceci de particulier qu'il refuse l'à-peu-près. Tu peux ruiner une côte de bœuf en 4 minutes ; un brisket te punit pendant 14 heures, à raison d'un degré de trop par heure.
          </p>

          {/* Pull quote */}
          <blockquote style={{
            margin: mobile ? '36px -20px' : '48px -64px',
            padding: mobile ? '32px 24px' : '48px 80px',
            background:'#1F1A14', color:'#E8A53C',
            fontFamily:'var(--cf-serif)',
            fontSize: mobile ? 28 : 42,
            lineHeight: 1.15,
            fontWeight: 500,
            fontStyle:'italic',
            textAlign:'center',
            position:'relative', overflow:'hidden',
          }}>
            <EmberGlow count={8}/>
            <span style={{ position:'relative' }}>« Le low & slow ne te demande pas du talent. Il te demande de la patience, et la patience, ça se mérite plus que ça ne s'apprend. »</span>
            <div style={{ marginTop: 14, fontFamily:'var(--cf-mono)', fontSize: 11, letterSpacing:'0.16em', color:'#B8AC97', textTransform:'uppercase', fontStyle:'normal' }}>— Aaron Franklin, à un journaliste épuisé</div>
          </blockquote>

          <p style={{ fontSize: mobile ? 17 : 19, lineHeight: 1.65, color:'#1F1A14' }}>
            J'allume les braises à minuit. Chêne et un peu de hickory pour la fumée. Le smoker monte en dix minutes à 110°C. Je trim le brisket — j'enlève le gras dur, je laisse une couche d'un demi-pouce sur le dessus. Frottage généreux : Magic Dust, double dose côté fat cap.
          </p>
        </div>

        {/* Calculator embed */}
        <div style={{ padding: mobile ? '32px 20px' : '48px 64px', maxWidth: 720, margin:'0 auto' }}>
          <div style={{ background:'#1F1A14', color:'#F5EFE0', padding: 24, position:'relative', overflow:'hidden', border:'2px solid #8B1A1A' }}>
            <EmberGlow count={6}/>
            <div style={{ position:'relative', display:'flex', flexDirection: mobile ? 'column' : 'row', alignItems: mobile ? 'flex-start' : 'center', gap: 16 }}>
              <MethodBadge method="low" size={88}/>
              <div style={{ flex: 1 }}>
                <div className="cf-eyebrow" style={{ color:'#E8A53C', marginBottom: 4 }}>Cuisson de cette recette</div>
                <h3 style={{ fontFamily:'var(--cf-serif)', fontSize: 24, textTransform:'uppercase', fontWeight: 700, color:'#F5EFE0', lineHeight: 1.05 }}>Brisket · Low & Slow · 4,2 kg</h3>
                <div style={{ fontFamily:'var(--cf-mono)', fontSize: 12, color:'#B8AC97', marginTop: 6, letterSpacing:'0.08em' }}>≈ 14h · 110°C · 95°C à cœur</div>
              </div>
              <FireButton size="md" type="primary">Lancer →</FireButton>
            </div>
          </div>
        </div>

        <div style={{ padding: mobile ? '0 20px' : '0 64px', maxWidth: 720, margin:'0 auto' }}>
          <h2 style={{ fontSize: mobile ? 32 : 44, textTransform:'uppercase', fontWeight: 700, marginTop: 48, marginBottom: 16, lineHeight: 1 }}>Le stall, et l'humilité</h2>
          <p style={{ fontSize: mobile ? 17 : 19, lineHeight: 1.65, color:'#1F1A14' }}>
            À 4h du matin, la sonde marque 71°C. Une heure plus tard, toujours 71°C. C'est le stall — quand l'évaporation à la surface refroidit la viande aussi vite qu'elle chauffe. Tous les pitmasters connaissent ça. Tous les pitmasters mauvais paniquent. Les bons attendent.
          </p>
          <p style={{ fontSize: mobile ? 17 : 19, lineHeight: 1.65, marginTop: 20, color:'#1F1A14' }}>
            J'attends. Je remets une bûche. Je dors trente minutes dans la chaise longue. Le ciel commence à pâlir, le balcon sent la fumée de bois. À 6h12, la sonde repart : 73, 74, 76. La courbe du stall est cassée.
          </p>
        </div>

        {/* Newsletter mid-article */}
        <div style={{ padding: mobile ? '32px 20px' : '48px 64px', maxWidth: 720, margin:'0 auto' }}>
          <div style={{ background:'#E5DBC6', border:'1.5px solid rgba(31,26,20,0.2)', padding: mobile ? 20 : 28, display:'flex', flexDirection: mobile ? 'column' : 'row', alignItems:'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div className="cf-eyebrow" style={{ color:'#8B1A1A' }}>★ La gazette</div>
              <h3 style={{ fontSize: 22, textTransform:'uppercase', fontWeight: 700, marginTop: 6, lineHeight: 1.1 }}>On t'envoie une recette comme ça chaque dimanche.</h3>
            </div>
            <FireButton size="md">Je m'abonne</FireButton>
          </div>
        </div>

        <div style={{ padding: mobile ? '0 20px 48px' : '0 64px 64px', maxWidth: 720, margin:'0 auto' }}>
          <p style={{ fontSize: mobile ? 17 : 19, lineHeight: 1.65, color:'#1F1A14' }}>
            À 8h45, le brisket atteint 95°C à cœur. Il a une croûte presque noire, une fumée bleue qui s'accroche au doigt. Je l'enveloppe dans le papier kraft, je le laisse reposer une heure dans la glacière. Le jus se redistribue. La fibre se détend.
          </p>
          <p style={{ fontSize: mobile ? 17 : 19, lineHeight: 1.65, marginTop: 20, color:'#1F1A14' }}>
            À 10h, je tranche. La première coupe est parfaite — un anneau rose de fumée d'un centimètre, une mie qui tient sans s'effriter. Je rappelle Mickaël plus tard dans la journée. « Tu m'apportes une part ? » Bien sûr.
          </p>
        </div>

        {/* Tags */}
        <div style={{ padding: mobile ? '0 20px 32px' : '0 64px 48px', maxWidth: 720, margin:'0 auto', display:'flex', flexWrap:'wrap', gap: 8 }}>
          {['#brisket','#low-and-slow','#texas','#reportage','#pitmaster','#nuit-blanche'].map(t => <Pill key={t}>{t}</Pill>)}
        </div>
      </article>

      {/* Related */}
      <section style={{ padding: mobile ? '32px 20px 48px' : '64px 64px 80px', maxWidth: 1400, margin:'0 auto', borderTop:'1px solid rgba(31,26,20,0.12)' }}>
        <div style={{ marginBottom: 24 }}>
          <SectionEyebrow>À lire ensuite</SectionEyebrow>
          <h2 style={{ fontSize: mobile ? 32 : 48, textTransform:'uppercase', fontWeight: 700, marginTop: 12 }}>Dans le même feu</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: mobile ? 12 : 20 }}>
          <RecipeCard compact image={RECIPE_IMAGES.pulled} category="Recette · Porc" title="Pulled pork de 12h" time="12h" difficulty="Avancé"/>
          <RecipeCard compact image={RECIPE_IMAGES.ribs} category="Recette · Porc" title="Travers Memphis" time="5h" difficulty="Inter."/>
          <RecipeCard compact image={RECIPE_IMAGES.smoke} category="Article" title="Le bois qui change tout" time="6 min"/>
          <RecipeCard compact image={RECIPE_IMAGES.steak} category="Recette · Bœuf" title="Côte de bœuf reverse" time="2h" difficulty="Inter."/>
        </div>
      </section>

      <NewsletterBlock mobile={mobile}/>
      <Footer mobile={mobile}/>
    </div>
  );
}

Object.assign(window, { RecipeListPage, RubPage, ArticlePage });
