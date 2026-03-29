import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MEAT_IMAGES, SMOKE_IMAGE } from '../../../domain/content/images'
import { MEATS } from '../../../domain/content/meats'
import { usePageContent } from '../../../hooks/usePageContent'
import { useSeoBlocks } from '../../../hooks/useSeoBlocks'
import { useCalculatorCatalog } from '../../../hooks/useCalculatorCatalog'
import SeoBlocksSection from '../../calculator/components/SeoBlocksSection'
import {
  EDITORIAL_GUIDE_CSS,
  EditorialGuideCards,
  EditorialGuideCta,
  EditorialGuideHero,
  EditorialGuideHighlights,
  EditorialGuideSection,
} from '../components/EditorialGuidePrimitives'

const GUIDE_OVERRIDES = {
  brisket: {
    subtitle: 'Guide viande',
    title: 'Brisket fumee: pars large, repose long, sers serein',
    intro: 'Pour une brisket, le plus important n est pas de viser une minute magique. Il faut surtout partir assez tot, laisser la bark se construire, puis garder une vraie marge de repos pour servir sans stress.',
    chips: ['Stall attendu', 'Wrap selon bark', 'Probe tender', 'Repos long'],
    stats: [
      { label: 'Heure de depart', value: 'Prudente', copy: 'Sur brisket, mieux vaut finir un peu tot et tenir au chaud.' },
      { label: 'Wrap', value: 'Repere bark', copy: 'Souvent vers 70 a 77°C, mais la couleur passe avant l horloge.' },
      { label: 'Repos', value: 'Long', copy: 'Une vraie marge de repos aide autant que la cuisson elle-meme.' },
    ],
    highlights: [
      { label: 'Ce qui compte', value: 'Partir large', copy: 'Une brisket ratee au service vient plus souvent d un depart trop tardif que d un mauvais rub.' },
      { label: 'Moment cle', value: 'Bark d abord', copy: 'Si la bark ne te plait pas encore, ne wrappe pas juste parce qu une heure est tombee.' },
      { label: 'Fin de cuisson', value: 'Sonde tendre', copy: 'La vraie fin, c est quand la sonde glisse proprement dans plusieurs zones.' },
    ],
    ctaTitle: 'Passe sur le calculateur avec brisket deja choisie',
    ctaCopy: 'Tu gardes le bon plan de depart, la fenetre de service et les repères terrain, sans repartir de zero.',
  },
  pork_shoulder: {
    subtitle: 'Guide viande',
    title: 'Pulled pork: garde de la marge et vise le fondant',
    intro: 'Une epaule de porc pardonne beaucoup, a condition de ne pas jouer trop serre. Le bon reflexe, c est de partir large, accepter le stall et viser une texture qui s effiloche proprement.',
    chips: ['Cuisson longue', 'Stall normal', 'Repos utile', 'Effilochage propre'],
    stats: [
      { label: 'Depart', value: 'Tot', copy: 'Le porc supporte tres bien de finir en avance avec un hold propre.' },
      { label: 'Wrap', value: 'Optionnel', copy: 'Utile si tu veux accelerer, pas obligatoire si tu as de la marge.' },
      { label: 'Fin', value: 'Tendre et juteux', copy: 'Vise une epaule qui s ouvre sans lutter, pas un simple chiffre.' },
    ],
    highlights: [
      { label: 'Ce qui compte', value: 'Marge de service', copy: 'Le pulled pork se vit bien quand tu peux le garder chaud sans courir.' },
      { label: 'Moment cle', value: 'Fin fondante', copy: 'Quand l os bouge librement ou que la sonde glisse partout, tu es au bon endroit.' },
      { label: 'Repos', value: 'Vraiment utile', copy: 'Le repos aide les jus a se redistribuer avant l effilochage.' },
    ],
    ctaTitle: 'Lance ton plan pulled pork',
    ctaCopy: 'Poids, heure de repas, type de bbq: tu recuperes un depart clair et une vraie fenetre de service.',
  },
  ribs_pork: {
    subtitle: 'Guide viande',
    title: 'Ribs porc: couleur, bend test et service propre',
    intro: 'Sur des ribs, le but n est pas de suivre une montre. Il faut surtout surveiller la couleur, la bark, le pullback et la souplesse du rack au bon moment.',
    chips: ['Couleur', 'Bend test', 'Pullback', 'Laquage final'],
    stats: [
      { label: 'Depart', value: 'Souple', copy: 'Les ribs se gerent mieux avec des repères visuels qu avec une minute fixe.' },
      { label: 'Wrap', value: 'Selon rendu', copy: 'Plus fondant si tu wrapes, plus de bark si tu laisses nus plus longtemps.' },
      { label: 'Service', value: 'Fenetre courte', copy: 'Le bon moment est celui ou le rack plie bien sans se casser net.' },
    ],
    highlights: [
      { label: 'Ce qui compte', value: 'Regarde la viande', copy: 'Le bend test et le pullback te disent plus que l horloge.' },
      { label: 'Moment cle', value: 'Bark propre', copy: 'Si la surface est deja belle, tu peux passer en wrap ou rester nu selon le rendu voulu.' },
      { label: 'Service', value: 'Pas trop tard', copy: 'Des ribs qui attendent trop perdent leur cote brillant et net au service.' },
    ],
    ctaTitle: 'Caler des ribs sans deviner',
    ctaCopy: 'Le calculateur te donne ton heure de lancement et la bonne fenetre pour ne pas laquer trop tot ni servir trop tard.',
  },
  ribs_beef: {
    subtitle: 'Guide viande',
    title: 'Short ribs: bark solide, cuisson longue, service memorable',
    intro: 'Les short ribs demandent du temps et un peu de patience. Le vrai cap, c est une bark bien en place, puis une cuisson jusqu a tendrete franche au probe.',
    chips: ['Bark epaisse', 'Probe tendre', 'Repos utile', 'Piece spectaculaire'],
    stats: [
      { label: 'Depart', value: 'Tot et calme', copy: 'Comme pour brisket, la marge de repos t aide beaucoup au service.' },
      { label: 'Wrap', value: 'Si besoin', copy: 'Tu peux accelerer la fin, mais beaucoup les preferent plus longtemps a nu.' },
      { label: 'Fin', value: 'Texture', copy: 'Quand la sonde rentre sans lutter entre les fibres, tu approches.' },
    ],
    highlights: [
      { label: 'Ce qui compte', value: 'Temps et bark', copy: 'Les short ribs aiment les cuissons stables et les surfaces bien seches au depart.' },
      { label: 'Moment cle', value: 'Probe tender', copy: 'La sensation a la sonde reste le meilleur signal de fin.' },
      { label: 'Repos', value: 'Vaut la peine', copy: 'Un peu de repos aide la graisse et les jus a se poser avant la coupe.' },
    ],
    ctaTitle: 'Calculer tes short ribs',
    ctaCopy: 'Tu arrives directement sur la bonne viande avec un depart prudent et une vraie plage de service.',
  },
  paleron: {
    subtitle: 'Guide viande',
    title: 'Paleron fume: l esprit brisket, en plus simple a trouver',
    intro: 'Le paleron se gere comme une grosse cuisson de boeuf: depart large, bark bien prise, puis fin a la tendrete. C est souvent la piece parfaite pour un service serieux sans te lancer sur une enorme brisket.',
    chips: ['Esprit brisket', 'Cuisson longue', 'Probe tender', 'Repos large'],
    stats: [
      { label: 'Depart', value: 'Prudent', copy: 'Traite le comme une vraie grosse piece, pas comme un roti rapide.' },
      { label: 'Wrap', value: 'Quand la bark est la', copy: 'Papier boucher si tu veux accelerer sans trop casser la surface.' },
      { label: 'Service', value: 'Plus serein', copy: 'Le paleron accepte bien une vraie marge de repos avant tranchage.' },
    ],
    highlights: [
      { label: 'Ce qui compte', value: 'Surface bien prise', copy: 'Ne te presse pas de wrapper tant que la bark est encore pale.' },
      { label: 'Moment cle', value: 'Tendre partout', copy: 'Teste plusieurs points de la piece, pas seulement le centre.' },
      { label: 'Repos', value: 'Tres utile', copy: 'Tu gagnes en regularite de tranche et en jutosite.' },
    ],
    ctaTitle: 'Planifier un paleron sans stress',
    ctaCopy: 'Le calculateur te replace directement sur paleron avec un depart conseille et une fenetre de service claire.',
  },
  lamb_shoulder: {
    subtitle: 'Guide viande',
    title: 'Epaule d agneau: fondante, souple et plus facile a servir',
    intro: 'L epaule d agneau se prete tres bien a une logique low and slow. L important, c est de savoir si tu la veux plutot fondante a effilocher ou simplement tres tendre a trancher.',
    chips: ['Deux styles possibles', 'Repos propre', 'Herbes et fumee douce', 'Service plus souple'],
    stats: [
      { label: 'Depart', value: 'Selon rendu', copy: 'Effiloche = plus long. Tranche = plus court et plus direct.' },
      { label: 'Wrap', value: 'Option de marge', copy: 'Utile si tu veux securiser ton heure de service sur une cuisson longue.' },
      { label: 'Service', value: 'Texture choisie', copy: 'Decide d abord ton rendu avant de penser a l heure exacte.' },
    ],
    highlights: [
      { label: 'Ce qui compte', value: 'Rendu final', copy: 'Agneau tranche ou agneau effiloche ne se pilotent pas avec la meme fin.' },
      { label: 'Moment cle', value: 'Texture voulue', copy: 'Quand la viande cede a la sonde ou se tient encore selon ton objectif.' },
      { label: 'Repos', value: 'Toujours utile', copy: 'Le repos aide a garder les jus avant coupe ou effilochage.' },
    ],
    ctaTitle: 'Preparer ton agneau au bon rythme',
    ctaCopy: 'Choisis le poids, ton style de cuisson et ton heure de service: le plan s ajuste autour de ca.',
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

function getSectionByTypes(sections, types) {
  return sections.find((section) => types.includes(section.section_type)) || null
}

function getSettingsItems(section) {
  return Array.isArray(section?.settings_json?.items) ? section.settings_json.items : []
}

function getMeatFallback(slug, catalogMeat, legacyMeat) {
  const override = GUIDE_OVERRIDES[slug] || {}
  const label = catalogMeat?.full || catalogMeat?.name || legacyMeat?.full || legacyMeat?.name || 'Cette viande'
  const watchItems = legacyMeat?.tips?.slice(0, 4)?.map((item) => ({
    title: item.t,
    copy: item.b,
  })) || [
    { title: 'Depart', copy: 'Prevois de la marge avant le service, surtout sur une cuisson longue.' },
    { title: 'Repos', copy: 'Le repos fait partie du plan et t evite de servir dans la precipitation.' },
  ]

  const woodItems = legacyMeat?.woods?.slice(0, 3)?.map((item) => ({
    title: item.n,
    copy: item.d,
  })) || [
    { title: 'Fumee douce', copy: 'Si tu hesites, reste sur un bois plus propre et plus facile a doser.' },
    { title: 'Couleur', copy: 'Choisis un bois qui accompagne la viande sans l ecraser.' },
  ]

  return {
    subtitle: override.subtitle || 'Guide viande',
    title: override.title || `${label}: quand lancer et comment servir sans deviner`,
    intro: override.intro || `Tu prevois ${label.toLowerCase()} et tu veux surtout savoir quand allumer le fumoir, quand garder de la marge et comment ne pas servir trop tard.`,
    chips: override.chips || ['Heure de depart', 'Fenetre de service', 'Repères terrain'],
    stats: override.stats || [
      { label: 'Depart', value: 'Prudent', copy: 'L objectif est de garder de la marge plutot que de courir apres la cuisson.' },
      { label: 'Cuisson', value: 'Repères utiles', copy: 'Observe la surface, la texture et la sonde avant de croire a une minute fixe.' },
      { label: 'Service', value: 'A temps', copy: 'Une bonne cuisson se joue aussi sur le repos et la fenetre de service.' },
    ],
    watchItems,
    woodItems,
    highlights: override.highlights || [
      { label: 'Heure de lancement', value: 'Large', copy: 'Mieux vaut finir un peu tot et tenir chaud que couper la viande a la va-vite.' },
      { label: 'Wrap', value: 'Repere', copy: 'Le wrap se decide surtout a la bark, pas a une heure exacte inventee.' },
      { label: 'Repos', value: 'Partie du plan', copy: 'Le repos sert la texture et la tranquillite au moment de servir.' },
    ],
    ctaTitle: override.ctaTitle || `Ouvre le calculateur avec ${catalogMeat?.name || legacyMeat?.name || 'cette viande'} deja choisie`,
    ctaCopy: override.ctaCopy || 'Tu retrouves un depart conseille, une vraie fenetre de service et les repères utiles sans re-saisir toute ta cuisson.',
  }
}

export default function MeatGuidePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { meatsBySlug } = useCalculatorCatalog()
  const { page, sections } = usePageContent(slug)
  const { blocks: topBlocks } = useSeoBlocks({ position: 'after_intro', meatSlug: slug, pageSlug: slug })
  const { blocks: bottomBlocks } = useSeoBlocks({ position: 'bottom_page', meatSlug: slug, pageSlug: slug })

  const catalogMeat = meatsBySlug[slug]
  const legacyMeat = MEATS[slug]
  const image = MEAT_IMAGES[slug] || SMOKE_IMAGE

  const fallback = useMemo(
    () => getMeatFallback(slug, catalogMeat, legacyMeat),
    [slug, catalogMeat, legacyMeat]
  )

  const heroSection = getSectionByTypes(sections, ['hero'])
  const watchSection = getSectionByTypes(sections, ['tips', 'watch'])
  const woodsSection = getSectionByTypes(sections, ['material', 'woods'])
  const ctaSection = getSectionByTypes(sections, ['cta'])

  const watchItems = getSettingsItems(watchSection)
  const woodsItems = getSettingsItems(woodsSection)

  useEffect(() => {
    document.title = page?.seo_title || fallback.title
    ensureMeta('description', page?.seo_description || fallback.intro)
  }, [page, fallback])

  return (
    <div className="editorial-guide-page">
      <style>{EDITORIAL_GUIDE_CSS}</style>
      <div className="editorial-guide-shell">
        <EditorialGuideHero
          image={image}
          kicker={heroSection?.subtitle || fallback.subtitle}
          title={heroSection?.title || fallback.title}
          copy={heroSection?.content || fallback.intro}
          chips={fallback.chips}
          stats={fallback.stats}
          primaryAction={(
            <button
              type="button"
              className="pm-btn-primary"
              style={{ width: 'auto', minWidth: 230 }}
              onClick={() => navigate('/app', { state: { preselectMeatKey: slug } })}
            >
              Calculer cette cuisson
            </button>
          )}
          secondaryAction={(
            <button
              type="button"
              className="pm-btn-secondary"
              style={{ width: 'auto', minWidth: 220 }}
              onClick={() => navigate('/auth', { state: { from: `/viandes/${slug}`, reason: 'save-planning' } })}
            >
              Sauvegarder mes plans
            </button>
          )}
        />

        <SeoBlocksSection
          title="Ce qui peut vraiment t aider sur cette cuisson"
          kicker="Selection utile"
          blocks={topBlocks}
        />

        <EditorialGuideSection
          eyebrow="Repères terrain"
          title={watchSection?.title || 'Ce que tu surveilles vraiment devant le fumoir'}
          copy={watchSection?.content || 'Le plan sert a partir au bon moment. Ensuite, la cuisson se pilote avec des signes concrets: surface, couleur, sonde, tension de service.'}
          tone="panel"
        >
          <EditorialGuideCards items={watchItems.length ? watchItems : fallback.watchItems} fallbackLabel="Repère" />
        </EditorialGuideSection>

        <EditorialGuideSection
          eyebrow="Caractere de cuisson"
          title={woodsSection?.title || 'Bois, fumee et style de rendu'}
          copy={woodsSection?.content || 'Ce n est pas la peine d en faire trop. Un ou deux bois bien choisis et une fumee propre valent mieux qu un melange qui ecrase la viande.'}
        >
          <EditorialGuideCards items={woodsItems.length ? woodsItems : fallback.woodItems} fallbackLabel="Bois" />
        </EditorialGuideSection>

        <EditorialGuideSection
          eyebrow="En clair"
          title="Le vrai plan pour servir a l heure"
          copy="Le calculateur ne te promet pas une minute magique. Il te donne surtout un bon depart, une marge de repos et les repères qui comptent vraiment quand la cuisson avance."
        >
          <EditorialGuideHighlights items={fallback.highlights} />
        </EditorialGuideSection>

        <EditorialGuideCta
          eyebrow="Passer a l action"
          title={ctaSection?.title || fallback.ctaTitle}
          copy={ctaSection?.content || fallback.ctaCopy}
          primaryAction={(
            <button
              type="button"
              className="pm-btn-primary"
              style={{ width: 'auto', minWidth: 240 }}
              onClick={() => navigate('/app', { state: { preselectMeatKey: slug } })}
            >
              Ouvrir le calculateur
            </button>
          )}
          secondaryAction={(
            <button
              type="button"
              className="pm-btn-secondary"
              style={{ width: 'auto', minWidth: 200 }}
              onClick={() => navigate('/guides/quand-wrapper')}
            >
              Lire le guide wrap
            </button>
          )}
        />

        <SeoBlocksSection
          title="Materiel, guides et suites utiles"
          kicker="Aller plus loin"
          blocks={bottomBlocks}
        />
      </div>
    </div>
  )
}
