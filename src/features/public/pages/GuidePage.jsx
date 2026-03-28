import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePageContent } from '../../../hooks/usePageContent'
import SeoBlocksSection from '../../calculator/components/SeoBlocksSection'
import { useSeoBlocks } from '../../../hooks/useSeoBlocks'

const FALLBACK_GUIDES = {
  'quand-wrapper': {
    kicker: 'Guide cuisson',
    title: 'Quand wrapper une grosse pièce BBQ ?',
    intro: 'Le wrap se décide surtout sur la couleur et la bark. Si la surface te plaît déjà, tu peux emballer pour accélérer la fin de cuisson. Si la bark manque encore, laisse prendre un peu plus.',
    bullets: [
      'Ne wrappe pas trop tôt si la bark est encore pâle',
      'Papier boucher : garde mieux la bark',
      'Aluminium : plus rapide, plus fondant',
      'Sans wrap : plus de bark, mais service plus tendu',
    ],
    ctaText: 'Tester sur le calculateur',
    ctaLink: '/app',
  },
  'repos-hold-bbq': {
    kicker: 'Guide service',
    title: 'Repos et hold : comment servir à l’heure',
    intro: 'Sur une grosse cuisson, finir un peu tôt est souvent une bonne nouvelle. Le repos et le hold te donnent une vraie marge pour servir proprement sans courir après la viande.',
    bullets: [
      'Mieux vaut finir un peu tôt que finir en retard',
      'Le repos fait partie du plan',
      'Un hold propre aide beaucoup les grosses pièces',
      'Le calculateur doit te donner de la marge, pas du stress',
    ],
    ctaText: 'Préparer mon service',
    ctaLink: '/app',
  },
  'thermometre-bbq': {
    kicker: 'Matériel recommandé',
    title: 'Quel thermomètre BBQ choisir ?',
    intro: 'Une bonne sonde te simplifie les longues cuissons : moins d’ouvertures inutiles, meilleur suivi de la chambre, et plus de sérénité sur la fenêtre de service.',
    bullets: [
      'Double sonde pour suivre pit + viande',
      'Lecture instantanée pour les contrôles rapides',
      'Stabilité et lisibilité avant gadgets',
      'Le bon thermomètre vaut plus qu’un accessoire de plus',
    ],
    ctaText: 'Revenir au calculateur',
    ctaLink: '/app',
  },
  'materiel-brisket': {
    kicker: 'Brisket',
    title: 'Le matériel utile pour une brisket propre',
    intro: 'Papier boucher, grande sonde et bon couteau à trancher : peu d’outils, mais les bons. Le but n’est pas d’acheter plus, c’est de mieux gérer la cuisson et le service.',
    bullets: [
      'Papier boucher pour une bark plus propre',
      'Grande sonde fiable pour suivre la cuisson',
      'Couteau long pour une tranche nette',
      'Plan de cuisson + repos = vrai service maîtrisé',
    ],
    ctaText: 'Ouvrir la page brisket',
    ctaLink: '/viandes/brisket',
  },
  'quand-wrapper-brisket': {
    kicker: 'Brisket',
    title: 'Brisket : quand wrapper sans ruiner la bark',
    intro: 'Sur brisket, le bon moment vient quand la bark te plaît déjà. Si tu wrapes trop tôt, tu perds du caractère. Si tu attends trop, tu perds de la marge au service.',
    bullets: [
      'Cherche d’abord la couleur',
      'Le stall n’est pas une urgence',
      'Papier boucher si tu veux garder la bark',
      'Teste toujours la tendreté avant de servir',
    ],
    ctaText: 'Calculer une brisket',
    ctaLink: '/viandes/brisket',
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

export default function GuidePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { page, sections } = usePageContent(slug)
  const { blocks: topBlocks } = useSeoBlocks({ position: 'after_intro', pageSlug: slug })
  const { blocks: bottomBlocks } = useSeoBlocks({ position: 'bottom_page', pageSlug: slug })

  const fallback = FALLBACK_GUIDES[slug] || {
    kicker: 'Guide BBQ',
    title: 'Guide cuisson',
    intro: 'Retrouve un repère simple, puis retourne vers le calculateur pour obtenir ton heure de départ et ta fenêtre de service.',
    bullets: ['Heure de départ', 'Wrap', 'Repos', 'Fenêtre de service'],
    ctaText: 'Retour au calculateur',
    ctaLink: '/app',
  }

  const heroSection = sections.find((section) => section.section_type === 'hero')
  const tipsSection = sections.find((section) => section.section_type === 'tips')

  useEffect(() => {
    document.title = page?.seo_title || fallback.title
    ensureMeta('description', page?.seo_description || fallback.intro)
  }, [page, fallback])

  return (
    <div style={{ background: '#090909', minHeight: '100vh', color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
      <section className="landing-section" style={{ paddingTop: 110 }}>
        <div className="pm-shell premium-card" style={{ padding: 28 }}>
          <div className="pm-kicker" style={{ marginBottom: 10 }}>{heroSection?.subtitle || fallback.kicker}</div>
          <h1 style={{ margin: 0, fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(38px, 7vw, 76px)', lineHeight: 0.95, textTransform: 'uppercase' }}>
            {heroSection?.title || fallback.title}
          </h1>
          <p className="pm-section-copy" style={{ maxWidth: 760, marginTop: 14, marginBottom: 18 }}>
            {heroSection?.content || fallback.intro}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate(fallback.ctaLink)}
              className="pm-btn-primary"
              style={{ width: 'auto', minWidth: 240 }}
            >
              {fallback.ctaText}
            </button>
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="pm-btn-secondary"
              style={{ width: 'auto', minWidth: 220 }}
            >
              Ouvrir le calculateur
            </button>
          </div>
        </div>
      </section>

      <section className="landing-section-tight">
        <div className="pm-shell">
          <SeoBlocksSection title="À lire avec ce guide" kicker="Conseils & matériel" blocks={topBlocks} />
        </div>
      </section>

      <section className="landing-section-tight">
        <div className="pm-shell dark-card" style={{ padding: 28 }}>
          <div className="pm-eyebrow" style={{ marginBottom: 10, color: 'var(--text3)' }}>Repères terrain</div>
          <h2 className="pm-section-title" style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: 14 }}>
            {tipsSection?.title || 'Ce qu’il faut retenir'}
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

      <section className="landing-section">
        <div className="pm-shell">
          <SeoBlocksSection title="Aller plus loin" kicker="Monétisation utile" blocks={bottomBlocks} />
        </div>
      </section>
    </div>
  )
}
