import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MEAT_IMAGES, SMOKE_IMAGE } from '../../../domain/content/images'
import { usePageContent } from '../../../hooks/usePageContent'
import { useSeoBlocks } from '../../../hooks/useSeoBlocks'
import SeoBlocksSection from '../../calculator/components/SeoBlocksSection'
import { useCalculatorCatalog } from '../../../hooks/useCalculatorCatalog'

const FALLBACK_GUIDES = {
  brisket: {
    title: 'Brisket fumee : quand lancer et comment servir a l heure',
    subtitle: 'Guide viande',
    intro: 'Tu prepares une brisket et tu veux savoir quand allumer le fumoir, quand wrapper et combien de repos garder. Cette page te donne une base claire, puis te renvoie vers le calculateur prefiltre sur brisket.',
    bullets: [
      'Lancer assez tot pour garder une vraie marge de repos',
      'Traverser le stall sans paniquer',
      'Wrapper au bon moment si la bark est deja la',
      'Tester la tendrete avant de penser au chiffre exact',
    ],
  },
}

function ensureMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function getSettingsItems(section) {
  return Array.isArray(section?.settings_json?.items) ? section.settings_json.items : []
}

export default function MeatGuidePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { meatsBySlug } = useCalculatorCatalog()
  const { page, sections } = usePageContent(slug)
  const { blocks: topBlocks } = useSeoBlocks({ position: 'after_intro', meatSlug: slug, pageSlug: slug })
  const { blocks: bottomBlocks } = useSeoBlocks({ position: 'bottom_page', meatSlug: slug, pageSlug: slug })

  const meat = meatsBySlug[slug]
  const fallback = useMemo(() => (
    FALLBACK_GUIDES[slug] || {
      title: meat?.full || meat?.name || 'Guide cuisson',
      subtitle: 'Guide viande',
      intro: 'Retrouve les repères utiles de cuisson, puis lance le calculateur avec cette viande déjà préselectionnée.',
      bullets: ['Heure de départ', 'Fenêtre de service', 'Repos', 'Repères de cuisson'],
    }
  ), [slug, meat?.full, meat?.name])

  const heroSection = sections.find((section) => section.section_type === 'hero')
  const tipsSection = sections.find((section) => section.section_type === 'tips')
  const materialSection = sections.find((section) => section.section_type === 'material')
  const image = MEAT_IMAGES[slug] || SMOKE_IMAGE

  useEffect(() => {
    document.title = page?.seo_title || fallback.title
    ensureMeta('description', page?.seo_description || fallback.intro)
  }, [page, fallback])

  return (
    <div style={{ background: '#090909', minHeight: '100vh', color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
      <section className="landing-hero-shell" style={{ minHeight: 'auto', paddingTop: 110, paddingBottom: 80 }}>
        <img src={image} alt={fallback.title} className="pitmaster-hero-image" />
        <div className="pitmaster-hero-overlay" />
        <div className="landing-hero-inner">
          <div className="landing-hero-copy-wrap" style={{ alignItems: 'start', justifyItems: 'start', maxWidth: 860 }}>
            <div className="pm-kicker" style={{ marginBottom: 10 }}>{heroSection?.subtitle || fallback.subtitle}</div>
            <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(42px, 8vw, 88px)', lineHeight: 0.9, textTransform: 'uppercase', margin: 0 }}>
              {heroSection?.title || fallback.title}
            </h1>
            <p className="landing-hero-copy" style={{ maxWidth: 760, margin: '0', textAlign: 'left' }}>
              {heroSection?.content || fallback.intro}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/app', { state: { preselectMeatKey: slug } })}
                className="pm-btn-primary"
                style={{ width: 'auto', minWidth: 240 }}
              >
                Calculer cette cuisson
              </button>
              <button
                onClick={() => navigate('/auth', { state: { from: `/viandes/${slug}`, reason: 'save-planning' } })}
                className="pm-btn-secondary"
                style={{ width: 'auto', minWidth: 220 }}
              >
                Sauvegarder mes plans
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="landing-section-tight">
        <div className="pm-shell">
          <SeoBlocksSection title="Sélection utile pour cette viande" kicker="Matériel & conseils" blocks={topBlocks} />
        </div>
      </div>

      <section className="landing-section-tight">
        <div className="pm-shell premium-card" style={{ padding: 28 }}>
          <div className="pm-eyebrow" style={{ marginBottom: 10, color: 'var(--text3)' }}>Repères terrain</div>
          <h2 className="pm-section-title" style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: 14 }}>
            {tipsSection?.title || 'Les points à surveiller'}
          </h2>
          <p className="pm-section-copy" style={{ maxWidth: 860, marginBottom: 18 }}>
            {tipsSection?.content || fallback.intro}
          </p>
          <div className="feature-grid">
            {(getSettingsItems(tipsSection).length ? getSettingsItems(tipsSection) : fallback.bullets).map((item) => (
              <div key={item} className="feature-slab" style={{ padding: 22 }}>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '.02em' }}>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section-tight">
        <div className="pm-shell dark-card" style={{ padding: 28 }}>
          <div className="pm-eyebrow" style={{ marginBottom: 10, color: 'var(--text3)' }}>Passer à l’action</div>
          <h2 className="pm-section-title" style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: 12 }}>
            {materialSection?.title || 'Passe au calculateur avec cette viande déjà choisie'}
          </h2>
          <p className="pm-section-copy" style={{ maxWidth: 760, marginBottom: 18 }}>
            {materialSection?.content || 'Tu gardes le même moteur de calcul, mais tu arrives directement sur la bonne viande pour gagner du temps.'}
          </p>
          <button
            onClick={() => navigate('/app', { state: { preselectMeatKey: slug } })}
            className="pm-btn-primary"
            style={{ width: 'auto', minWidth: 260 }}
          >
            Ouvrir le calculateur {meat?.full || ''}
          </button>
        </div>
      </section>

      <section className="landing-section">
        <div className="pm-shell">
          <SeoBlocksSection title="Aller plus loin" kicker="Guides & affiliation" blocks={bottomBlocks} />
        </div>
      </section>
    </div>
  )
}
