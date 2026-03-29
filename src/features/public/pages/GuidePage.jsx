import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SMOKE_IMAGE } from '../../../domain/content/images'
import { usePageContent } from '../../../hooks/usePageContent'
import { useSeoBlocks } from '../../../hooks/useSeoBlocks'
import SeoBlocksSection from '../../calculator/components/SeoBlocksSection'
import {
  EDITORIAL_GUIDE_CSS,
  EditorialGuideCards,
  EditorialGuideCta,
  EditorialGuideHero,
  EditorialGuideHighlights,
  EditorialGuideSection,
} from '../components/EditorialGuidePrimitives'

const GUIDE_FALLBACKS = {
  'quand-wrapper': {
    kicker: 'Guide cuisson',
    title: 'Quand wrapper sans ruiner ta bark',
    intro: 'Le wrap ne se decide pas a la minute. Il sert surtout a gerer la marge de service et le rendu final. Si la bark te plait deja, tu peux emballer. Si elle manque encore, attends un peu.',
    chips: ['Couleur d abord', 'Papier ou alu', 'Pas de minute magique'],
    stats: [
      { label: 'Le vrai signal', value: 'Bark', copy: 'La couleur, la secheresse de surface et la tenue du rub passent avant l horloge.' },
      { label: 'Papier boucher', value: 'Equilibre', copy: 'Tu acceleres un peu la fin tout en gardant une bark plus propre.' },
      { label: 'Alu', value: 'Plus rapide', copy: 'Pratique si tu es serre sur l heure, avec un rendu souvent plus humide.' },
    ],
    reminders: [
      { title: 'Ne wrappe pas pale', copy: 'Si la surface est encore claire ou molle, tu risques surtout de cuire une bark inachevee.' },
      { title: 'Le stall n est pas une alerte', copy: 'Le plateau fait partie du jeu. On wrappe pour gerer le rendu ou gagner du temps, pas parce qu on panique.' },
      { title: 'Le papier garde mieux le caractere', copy: 'Sur brisket et grosses pieces, il aide a accelerer sans tout ramollir.' },
      { title: 'L alu sert quand le service pousse', copy: 'Si tu dois absolument tenir l heure, l alu donne une vraie marge supplementaire.' },
    ],
    workflow: [
      { title: 'Observe la surface', copy: 'Cherche une bark deja placee, seche au toucher, avec la bonne couleur.' },
      { title: 'Choisis selon ton rendu', copy: 'Papier pour garder plus de bark, alu pour finir plus vite, ou rien si tu as beaucoup de marge.' },
      { title: 'Reprends les tests en fin de cuisson', copy: 'Une fois wrappee, la piece continue a se lire a la sonde et a la texture, pas a l heure.' },
    ],
    highlights: [
      { label: 'Ce qu il faut retenir', value: 'Pas de minute fixe', copy: 'Le bon moment vient de la viande, pas d une heure precise inventee.' },
      { label: 'Quand ca aide', value: 'Service serre', copy: 'Le wrap est surtout utile quand tu veux securiser une arrivee a table.' },
      { label: 'Risque a eviter', value: 'Wrap trop tot', copy: 'C est la facon la plus simple de perdre une bark qui n etait pas encore installee.' },
    ],
    ctaText: 'Tester sur le calculateur',
    ctaLink: '/app',
    secondaryText: 'Voir la page brisket',
    secondaryLink: '/viandes/brisket',
  },
  'repos-hold-bbq': {
    kicker: 'Guide service',
    title: 'Repos et hold: ta meilleure marge pour servir a l heure',
    intro: 'Finir un peu tot est souvent un avantage. Le repos et le hold permettent de laisser la viande se poser, tout en gardant une vraie securite de service.',
    chips: ['Finir en avance', 'Repos utile', 'Hold propre'],
    stats: [
      { label: 'Ce qui rassure', value: 'Marge', copy: 'Une cuisson qui finit un peu avant reste plus facile a servir qu une cuisson qui finit juste.' },
      { label: 'Repos', value: 'Indispensable', copy: 'Il participe a la texture, a la jutosite et a la serenite au moment de couper.' },
      { label: 'Hold', value: 'Plan B premium', copy: 'S il est propre, il te permet d absorber les variations naturelles des longues cuissons.' },
    ],
    reminders: [
      { title: 'Le repos fait partie du plan', copy: 'Ne le traite pas comme une option de derniere minute.' },
      { title: 'Le hold n est pas un aveu d echec', copy: 'C est souvent la strategie des cuissons serieuses pour mieux tenir l heure.' },
      { title: 'Finir juste est plus risqué', copy: 'Une grosse piece peut vite te faire perdre la table si tu n as aucune marge.' },
      { title: 'Coupe seulement quand tout est pret', copy: 'Quand la table, les accompagnements et toi etes alignes, le service est meilleur.' },
    ],
    workflow: [
      { title: 'Planifie ton heure de depart large', copy: 'L idee est d arriver vers la fin avec du temps, pas avec de la peur.' },
      { title: 'Laisse reposer avant de toucher', copy: 'La piece se detend, les jus se redistribuent et la coupe devient plus nette.' },
      { title: 'Utilise le hold si tu es en avance', copy: 'Un maintien propre vaut mieux qu une tranchee precipitee pour respecter la table.' },
    ],
    highlights: [
      { label: 'Ce qu il faut retenir', value: 'Mieux tot que tard', copy: 'Sur du low and slow, la vraie tranquillite vient d une marge de service reelle.' },
      { label: 'Repos', value: 'Texture + serenite', copy: 'Le repos sert autant le gout que l organisation.' },
      { label: 'Hold', value: 'Filet de securite', copy: 'Quand il est propre, il t aide a absorber le naturel imprevisible des longues cuissons.' },
    ],
    ctaText: 'Preparer mon service',
    ctaLink: '/app',
    secondaryText: 'Voir la brisket',
    secondaryLink: '/viandes/brisket',
  },
  'thermometre-bbq': {
    kicker: 'Materiel recommande',
    title: 'Quel thermometre BBQ choisir pour de vraies longues cuissons',
    intro: 'Une bonne sonde ne sert pas a te vendre une fausse precision. Elle sert surtout a mieux lire la chambre, eviter d ouvrir sans arret, et garder le service sous controle.',
    chips: ['Chambre + viande', 'Lecture claire', 'Pas de gadget inutile'],
    stats: [
      { label: 'Le plus utile', value: 'Double lecture', copy: 'Une sonde pour le bbq et une pour la viande changent vraiment la gestion des longues cuissons.' },
      { label: 'Lecture instantanee', value: 'Controle fin', copy: 'Parfait pour verifier rapidement une zone de fin ou confirmer un doute.' },
      { label: 'Le vrai benefice', value: 'Moins d ouvertures', copy: 'Tu gardes plus de stabilite et tu stresses moins sur l avancement.' },
    ],
    reminders: [
      { title: 'Priorite a la lisibilite', copy: 'Un ecran clair et une lecture stable valent mieux qu une fiche technique trop longue.' },
      { title: 'Sonde chambre + sonde viande', copy: 'C est la base la plus utile pour les cuissons longues.' },
      { title: 'Lecture instantanee en plus', copy: 'Tres pratique pour valider un point de tendrete ou une finition.' },
      { title: 'Pas besoin de dix gadgets', copy: 'Mieux vaut deux bons outils qu un setup trop charge.' },
    ],
    workflow: [
      { title: 'Lis d abord la stabilite du bbq', copy: 'Une chambre qui bouge fort te mettra toujours plus de desordre qu un detail de sonde.' },
      { title: 'Suis l evolution sans ouvrir', copy: 'Tu gardes de la regularite et tu vois venir les ralentissements de cuisson.' },
      { title: 'Valide la fin autrement', copy: 'La temperature aide, mais la vraie fin se confirme toujours a la texture et a la sonde.' },
    ],
    highlights: [
      { label: 'Ce qu il faut retenir', value: 'Lire, pas deviner', copy: 'Une bonne sonde te donne du contexte, pas une verite minute par minute.' },
      { label: 'Le meilleur duo', value: 'Pit + viande', copy: 'C est le couple le plus rentable pour un bbq serieux.' },
      { label: 'A eviter', value: 'Ouvrir sans fin', copy: 'Plus tu ouvres, plus tu perds la stabilite qui t aide vraiment.' },
    ],
    ctaText: 'Revenir au calculateur',
    ctaLink: '/app',
    secondaryText: 'Voir le guide wrap',
    secondaryLink: '/guides/quand-wrapper',
  },
  'materiel-brisket': {
    kicker: 'Brisket',
    title: 'Le materiel utile pour une brisket propre',
    intro: 'Pas besoin de remplir le fumoir de gadgets. Quelques bons outils suffisent pour mieux tenir ta cuisson, proteger la bark et servir plus proprement.',
    chips: ['Papier boucher', 'Bonne sonde', 'Couteau long'],
    stats: [
      { label: 'Priorite', value: 'Sonde fiable', copy: 'Tu gardes un oeil sur la chambre et la progression sans ouvrir sans arret.' },
      { label: 'Wrap', value: 'Papier boucher', copy: 'Le meilleur compromis si tu veux accelerer un peu sans perdre tout le caractere.' },
      { label: 'Service', value: 'Couteau net', copy: 'Une belle tranche depend aussi d une coupe propre au bon moment.' },
    ],
    reminders: [
      { title: 'Commence par la sonde', copy: 'C est l outil qui t aidera le plus sur une longue cuisson.' },
      { title: 'Le papier boucher a du sens', copy: 'Surtout si tu veux garder une bark plus seche et plus propre.' },
      { title: 'Le couteau compte au service', copy: 'Une tranche mal coupee peut gacher une cuisson pourtant reussie.' },
      { title: 'Le plan reste plus important', copy: 'Le meilleur accessoire reste encore une vraie marge de cuisson et de repos.' },
    ],
    workflow: [
      { title: 'Lis ta cuisson proprement', copy: 'Une bonne sonde t evite les ouvertures inutiles et les approximations.' },
      { title: 'Secure ton wrap si besoin', copy: 'Le papier t aide a garder un rendu plus serieux sur brisket.' },
      { title: 'Sers proprement', copy: 'Quand la viande est reposée et la coupe nette, le service change tout.' },
    ],
    highlights: [
      { label: 'Ce qu il faut retenir', value: 'Peu, mais bien choisi', copy: 'Une brisket ne demande pas beaucoup d outils. Elle demande surtout les bons.' },
      { label: 'Le plus rentable', value: 'Bonne sonde', copy: 'C est ce qui t apporte le plus de serenite en vrai usage.' },
      { label: 'Au service', value: 'Coupe nette', copy: 'Une belle tranche fait autant d effet qu une belle bark.' },
    ],
    ctaText: 'Ouvrir la page brisket',
    ctaLink: '/viandes/brisket',
    secondaryText: 'Calculer une brisket',
    secondaryLink: '/app',
  },
  'quand-wrapper-brisket': {
    kicker: 'Brisket',
    title: 'Brisket: quand wrapper sans courir apres l horloge',
    intro: 'Sur brisket, le wrap sert surtout a gerer la bark et la marge de service. Tu ne cherches pas une heure parfaite. Tu cherches une surface deja bien posee et un plan qui te laisse respirer.',
    chips: ['Bark d abord', 'Papier boucher', 'Depart prudent'],
    stats: [
      { label: 'Le vrai signal', value: 'Bark posee', copy: 'Quand la couleur et la surface te plaisent deja, le wrap devient logique.' },
      { label: 'Le meilleur choix', value: 'Papier boucher', copy: 'C est souvent le compromis prefere pour garder du caractere.' },
      { label: 'Le vrai enjeu', value: 'Service', copy: 'On wrappe surtout pour mieux tenir l heure sans ruiner le rendu.' },
    ],
    reminders: [
      { title: 'Ne wrappe pas sur reflexe', copy: 'Le simple passage d une heure n est pas une raison suffisante.' },
      { title: 'Le stall ne decide pas a ta place', copy: 'C est un repere classique, pas un ordre.' },
      { title: 'Le papier garde mieux la bark', copy: 'C est souvent ce qu on cherche sur brisket.' },
      { title: 'La fin reste a la tendrete', copy: 'Une brisket finie se lit toujours a la texture et a la sonde.' },
    ],
    workflow: [
      { title: 'Cherche une bark deja serieuse', copy: 'Couleur, secheresse et tenue du rub passent avant le reste.' },
      { title: 'Wrappe pour gerer ta marge', copy: 'Si ton service demande un peu plus de securite, c est le bon moment d utiliser le papier.' },
      { title: 'Reprends les tests en fin de cuisson', copy: 'La piece doit devenir tendre, pas juste atteindre un nombre.' },
    ],
    highlights: [
      { label: 'Ce qu il faut retenir', value: 'Pas de minute magique', copy: 'Le wrap sur brisket se pilote a la bark, pas a une heure inventee.' },
      { label: 'Le bon compromis', value: 'Papier boucher', copy: 'Tu gagnes du temps sans ecraser tout le caractere de la surface.' },
      { label: 'Le vrai cap', value: 'Sonde tendre', copy: 'Le service se gagne a la fin sur la texture, pas au moment du wrap.' },
    ],
    ctaText: 'Calculer une brisket',
    ctaLink: '/viandes/brisket',
    secondaryText: 'Retour au calculateur',
    secondaryLink: '/app',
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

function navigateOrOpen(navigate, link) {
  if (!link) return
  if (link.startsWith('/')) {
    navigate(link)
    return
  }
  window.open(link, '_blank', 'noopener,noreferrer')
}

export default function GuidePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { page, sections } = usePageContent(slug)
  const { blocks: topBlocks } = useSeoBlocks({ position: 'after_intro', pageSlug: slug })
  const { blocks: bottomBlocks } = useSeoBlocks({ position: 'bottom_page', pageSlug: slug })

  const fallback = useMemo(() => (
    GUIDE_FALLBACKS[slug] || {
      kicker: 'Guide BBQ',
      title: 'Guide cuisson',
      intro: 'Retrouve un repere clair, puis retourne vers le calculateur pour obtenir une vraie heure de depart et une fenetre de service realiste.',
      chips: ['Repères utiles', 'Fenetre de service', 'Conseils terrain'],
      stats: [
        { label: 'Depart', value: 'Clair', copy: 'Le but est d obtenir une vraie marge, pas une impression de precision.' },
        { label: 'Cuisson', value: 'Lisible', copy: 'Les grandes etapes et les repères utiles te servent plus qu une timeline mensongere.' },
        { label: 'Service', value: 'A l heure', copy: 'Le plan doit surtout t aider a servir proprement.' },
      ],
      reminders: [
        { title: 'Partir assez tot', copy: 'Le meilleur moyen de servir a l heure reste de prendre une vraie marge.' },
        { title: 'Regarder la viande', copy: 'Les repères visuels et thermiques comptent plus que l illusion d une minute exacte.' },
        { title: 'Integrer le repos', copy: 'Le repos fait partie du service, pas d un bonus optionnel.' },
      ],
      workflow: [
        { title: 'Pose ton heure de service', copy: 'Commence toujours par le moment ou tu veux vraiment servir.' },
        { title: 'Laisse le plan te donner une marge', copy: 'Le calculateur sert a partir au bon moment, pas a t enfermer.' },
        { title: 'Ajuste ensuite au terrain', copy: 'La cuisson se confirme ensuite avec la viande, la bark et la sonde.' },
      ],
      highlights: [
        { label: 'Ce qu il faut retenir', value: 'Prendre de la marge', copy: 'Une cuisson bien geree respire. Elle ne joue pas sa vie a 20 minutes pres.' },
        { label: 'A eviter', value: 'Precision mensongere', copy: 'Le bbq n est pas une horloge parfaite, surtout sur les grosses pieces.' },
        { label: 'Objectif', value: 'Servir serein', copy: 'Tout le reste doit te rapprocher de ce moment-la.' },
      ],
      ctaText: 'Retour au calculateur',
      ctaLink: '/app',
      secondaryText: 'Voir la landing',
      secondaryLink: '/',
    }
  ), [slug])

  const heroSection = getSectionByTypes(sections, ['hero'])
  const tipsSection = getSectionByTypes(sections, ['tips', 'summary'])
  const workflowSection = getSectionByTypes(sections, ['material', 'workflow', 'application'])
  const ctaSection = getSectionByTypes(sections, ['cta'])

  const tipsItems = getSettingsItems(tipsSection)
  const workflowItems = getSettingsItems(workflowSection)

  useEffect(() => {
    document.title = page?.seo_title || fallback.title
    ensureMeta('description', page?.seo_description || fallback.intro)
  }, [page, fallback])

  return (
    <div className="editorial-guide-page">
      <style>{EDITORIAL_GUIDE_CSS}</style>
      <div className="editorial-guide-shell">
        <EditorialGuideHero
          image={SMOKE_IMAGE}
          kicker={heroSection?.subtitle || fallback.kicker}
          title={heroSection?.title || fallback.title}
          copy={heroSection?.content || fallback.intro}
          chips={fallback.chips}
          stats={fallback.stats}
          primaryAction={(
            <button
              type="button"
              className="pm-btn-primary"
              style={{ width: 'auto', minWidth: 220 }}
              onClick={() => navigateOrOpen(navigate, fallback.ctaLink)}
            >
              {fallback.ctaText}
            </button>
          )}
          secondaryAction={(
            <button
              type="button"
              className="pm-btn-secondary"
              style={{ width: 'auto', minWidth: 210 }}
              onClick={() => navigateOrOpen(navigate, fallback.secondaryLink)}
            >
              {fallback.secondaryText}
            </button>
          )}
        />

        <SeoBlocksSection
          title="A lire ou regarder avec ce guide"
          kicker="Conseils & materiel"
          blocks={topBlocks}
        />

        <EditorialGuideSection
          eyebrow="A retenir"
          title={tipsSection?.title || 'Ce qu il faut vraiment garder en tete'}
          copy={tipsSection?.content || 'Le but n est pas de memoriser une suite de chiffres. Il faut surtout garder quelques repères solides qui t aident a prendre les bonnes decisions au bon moment.'}
          tone="panel"
        >
          <EditorialGuideCards items={tipsItems.length ? tipsItems : fallback.reminders} fallbackLabel="Point" />
        </EditorialGuideSection>

        <EditorialGuideSection
          eyebrow="Devant le fumoir"
          title={workflowSection?.title || 'Comment t en servir pendant la cuisson'}
          copy={workflowSection?.content || 'Un bon guide n est utile que s il t aide dans la vraie vie: savoir quoi regarder, quand accepter de patienter, et a quel moment revenir vers le calculateur pour verifier ta marge.'}
        >
          <EditorialGuideCards items={workflowItems.length ? workflowItems : fallback.workflow} fallbackLabel="Etape" />
        </EditorialGuideSection>

        <EditorialGuideSection
          eyebrow="En clair"
          title="Le guide doit te simplifier la cuisson, pas te noyer"
          copy="On garde les grands repères, les vrais signes de terrain et le bon point de retour vers le calculateur. Pas de pseudo-science, pas de minute miraculeuse."
        >
          <EditorialGuideHighlights items={fallback.highlights} />
        </EditorialGuideSection>

        <EditorialGuideCta
          eyebrow="Passer a l action"
          title={ctaSection?.title || 'Reviens sur un plan de cuisson clair'}
          copy={ctaSection?.content || 'Quand tu as lu l essentiel, reviens sur le calculateur pour poser ton heure de service, ta viande et recuperer un vrai depart recommande.'}
          primaryAction={(
            <button
              type="button"
              className="pm-btn-primary"
              style={{ width: 'auto', minWidth: 220 }}
              onClick={() => navigateOrOpen(navigate, fallback.ctaLink)}
            >
              {fallback.ctaText}
            </button>
          )}
          secondaryAction={(
            <button
              type="button"
              className="pm-btn-secondary"
              style={{ width: 'auto', minWidth: 200 }}
              onClick={() => navigateOrOpen(navigate, fallback.secondaryLink)}
            >
              {fallback.secondaryText}
            </button>
          )}
        />

        <SeoBlocksSection
          title="Pour aller plus loin"
          kicker="Guides, materiel, affiliation utile"
          blocks={bottomBlocks}
        />
      </div>
    </div>
  )
}
