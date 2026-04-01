/**
 * CHARBON & FLAMME — Guide des Types de BBQ / Fumoirs
 * Page statique avec comparatif détaillé, avantages/inconvénients,
 * recommandations par niveau, SEO optimisé.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { updateMeta, injectJsonLd } from '../lib/seo.js'
import { supabase } from '../lib/supabase.js'

/* ── Données statiques (fallback si table Supabase absente) ── */
const BBQ_TYPES_STATIC = [
  {
    id: 'offset',
    name: 'Offset Smoker',
    altNames: ['Fumoir horizontal', 'Stick burner', 'Barrel smoker'],
    icon: '🏭',
    image: null,
    tagline: 'Le fumoir des puristes. Feu de bois, contrôle manuel, saveur incomparable.',
    description: 'Le offset smoker (fumoir à foyer déporté) est le roi du fumage traditionnel. Le feu brûle dans une chambre latérale (firebox) et la fumée traverse la chambre de cuisson horizontale avant de s\'échapper par la cheminée. C\'est le fumoir utilisé dans les grands restaurants BBQ texans comme Franklin Barbecue ou Snow\'s BBQ.',
    tempRange: '107–135°C',
    fuel: 'Bûches de bois (chêne, hickory, mesquite)',
    priceRange: '300€ – 3 000€+',
    level: 'avance',
    capacity: 'Grande (4–8 pièces)',
    pros: [
      'Saveur de fumée authentique et incomparable — 100% bois',
      'Grande capacité — idéal pour les grosses pièces (brisket entier, épaule complète)',
      'Contrôle total sur le type de bois et l\'intensité de fumée',
      'Le vrai BBQ traditionnel texan / américain',
      'Bark (croûte) exceptionnelle grâce au flux d\'air',
    ],
    cons: [
      'Courbe d\'apprentissage importante — il faut apprendre à gérer le feu',
      'Demande une surveillance constante (toutes les 30–45 min)',
      'Consommation de bois élevée sur les longues cuissons (12h+)',
      'Les modèles bon marché ont des problèmes d\'étanchéité et de chaleur inégale',
      'Encombrant — difficile à déplacer',
    ],
    bestFor: ['Brisket', 'Épaule de porc (pulled pork)', 'Travers de porc (spare ribs)', 'Beef ribs'],
    notIdealFor: ['Cuissons rapides', 'Petits espaces', 'Débutants pressés'],
    brands: ['Oklahoma Joe\'s', 'Lone Star Grillz', 'Yoder', 'Old Country BBQ Pits', 'Horizon'],
    tips: 'Commence avec un petit offset (Highland de Oklahoma Joe\'s ~250€). Apprends à gérer les « splits » de bois (quarts de bûche). La clé : un feu propre qui produit une fumée bleue/transparente, jamais blanche et épaisse.',
  },
  {
    id: 'kamado',
    name: 'Kamado',
    altNames: ['Œuf céramique', 'Big Green Egg', 'Kamado Joe'],
    icon: '🥚',
    image: null,
    tagline: 'Polyvalent, économe en charbon, isolation parfaite. Le couteau suisse du BBQ.',
    description: 'Le kamado est un four en céramique épaisse d\'origine japonaise, popularisé par le Big Green Egg dans les années 70. Sa forme en œuf et son isolation exceptionnelle permettent de maintenir des températures très basses (90°C) comme très hautes (400°C+). Il fonctionne au charbon de bois avec ajout de morceaux de bois pour la fumée.',
    tempRange: '90–400°C+',
    fuel: 'Charbon de bois + morceaux de bois',
    priceRange: '500€ – 2 500€',
    level: 'intermediaire',
    capacity: 'Moyenne (2–4 pièces)',
    pros: [
      'Polyvalence incroyable : fumer, griller, rôtir, cuire du pain, faire une pizza',
      'Isolation céramique — consommation de charbon très faible',
      'Maintien de température stable sur de longues heures sans intervention',
      'Excellente rétention d\'humidité — viande juteuse',
      'Construction solide — dure des décennies',
      'Compact pour sa capacité',
    ],
    cons: [
      'Prix d\'entrée élevé (Big Green Egg Large ~1 200€)',
      'Lourd (60–100+ kg) — difficile à déplacer',
      'Temps de montée en température plus long',
      'Récupération lente si tu ouvres le couvercle trop longtemps',
      'Capacité limitée vs un offset',
      'Risque de flashback à l\'ouverture (bouffée de chaleur)',
    ],
    bestFor: ['Brisket', 'Pulled pork', 'Poulet entier', 'Pizza', 'Côte de bœuf (reverse sear)'],
    notIdealFor: ['Très grosses quantités', 'Cuisson pour 20+ personnes'],
    brands: ['Big Green Egg', 'Kamado Joe', 'Monolith', 'Primo', 'Char-Griller Akorn (entrée de gamme)'],
    tips: 'Le Kamado Joe Classic III (~1 100€) est le meilleur rapport qualité-prix avec sa grille modulaire. Utilise du charbon en morceaux (pas de briquettes) pour un meilleur contrôle de température. Apprends la technique du « low and slow burp » : ouvrir le couvercle légèrement avant d\'ouvrir en grand pour éviter le flashback.',
  },
  {
    id: 'pellet',
    name: 'Pellet Smoker',
    altNames: ['Fumoir à granulés', 'Traeger', 'Smoker automatique'],
    icon: '🤖',
    image: null,
    tagline: 'Le fumoir "set it and forget it". Automatisé, régulier, parfait pour débuter.',
    description: 'Le pellet smoker utilise des granulés de bois compressé (pellets) alimentés par une vis sans fin motorisée. Un contrôleur électronique ajuste automatiquement la température au degré près. C\'est le fumoir le plus simple à utiliser : tu règles la température, tu poses ta viande, tu attends.',
    tempRange: '80–260°C',
    fuel: 'Granulés de bois (pellets)',
    priceRange: '400€ – 2 000€',
    level: 'debutant',
    capacity: 'Grande (4–6 pièces)',
    pros: [
      'Extrêmement simple — réglage au degré près, comme un four',
      'Régulation automatique de la température — pas besoin de surveiller',
      'Bonne capacité de cuisson',
      'Polyvalent : fumer, griller, rôtir',
      'Idéal pour les débutants et les cuissons de nuit',
      'Sonde de température intégrée sur la plupart des modèles',
      'Connecté WiFi/Bluetooth sur les modèles récents',
    ],
    cons: [
      'Saveur de fumée moins prononcée qu\'un offset ou kamado',
      'Dépendance à l\'électricité — pas portable',
      'Les pellets de mauvaise qualité donnent un goût amer',
      'Pas de « bark » aussi profonde qu\'un offset au bois',
      'La vis sans fin et le contrôleur peuvent tomber en panne',
      'Consommation de pellets : ~1 kg/heure en fumage',
    ],
    bestFor: ['Pulled pork', 'Ribs (travers)', 'Poulet', 'Saumon fumé', 'Cuissons longues de nuit'],
    notIdealFor: ['Saisir à très haute température', 'Puristes qui veulent la fumée de bois brut'],
    brands: ['Traeger', 'Weber SmokeFire', 'Camp Chef', 'Pit Boss', 'RecTeq', 'Z Grills (entrée de gamme)'],
    tips: 'Pour débuter, un Pit Boss 850 (~500€) ou un Z Grills 700E (~400€) est excellent. Utilise des pellets 100% bois dur (évite ceux avec des huiles ajoutées). Pour plus de fumée : ajoute un tube fumoir (smoke tube) en inox rempli de pellets sur la grille.',
  },
  {
    id: 'kettle',
    name: 'Bouilloire (Kettle)',
    altNames: ['Weber Kettle', 'BBQ charbon classique', 'Bouilloire Weber'],
    icon: '⚫',
    image: null,
    tagline: 'Le classique indémodable. Simple, abordable, et étonnamment capable en fumage.',
    description: 'Le kettle (bouilloire) est le barbecue à charbon le plus iconique, popularisé par Weber depuis 1952. Sa forme ronde avec couvercle permet le grillage direct ET le fumage indirect en configuration « snake method » (serpentin de charbon). C\'est le point d\'entrée parfait dans le monde du fumage.',
    tempRange: '100–300°C',
    fuel: 'Charbon de bois + morceaux de bois',
    priceRange: '80€ – 400€',
    level: 'debutant',
    capacity: 'Moyenne (2–3 pièces)',
    pros: [
      'Prix imbattable — une Weber Master-Touch coûte ~200€',
      'Léger et portable',
      'Excellente pour grillage ET fumage (snake method)',
      'Simple à comprendre et à utiliser',
      'Communauté énorme, beaucoup de tutos',
      'Pièces de rechange disponibles partout',
    ],
    cons: [
      'Capacité limitée pour le fumage (1 brisket max)',
      'La snake method demande un peu de pratique',
      'Température moins stable qu\'un kamado ou pellet',
      'Rechargement de charbon nécessaire toutes les 4–5h',
      'Pas de jauge de température précise (thermomètre de couvercle basique)',
    ],
    bestFor: ['Poulet entier', 'Ribs (baby back)', 'Cuisson directe (steaks, burgers)', 'Pulled pork (petites épaules)'],
    notIdealFor: ['Brisket entier (trop gros)', 'Cuissons très longues (12h+) sans intervention'],
    brands: ['Weber (Master-Touch, Original Kettle)', 'Napoleon Rodeo', 'Rösle'],
    tips: 'La Weber Master-Touch GBS 57cm (~220€) est LA référence. Apprends la « snake method » : dispose des briquettes en serpentin sur le bord, avec des morceaux de bois dessus. Le charbon se consume lentement sur 6-8h. Investis dans un bon thermomètre à double sonde (ThermoPro ~30€).',
  },
  {
    id: 'wsm',
    name: 'Fumoir Vertical (WSM)',
    altNames: ['Weber Smokey Mountain', 'Bullet smoker', 'Fumoir à eau'],
    icon: '🗼',
    image: null,
    tagline: 'Le fumoir dédié le plus abordable. Stable, fiable, résultats pro.',
    description: 'Le WSM (Weber Smokey Mountain) et ses équivalents sont des fumoirs verticaux à charbon avec un réservoir d\'eau entre le feu et la viande. L\'eau stabilise la température et ajoute de l\'humidité. C\'est LE fumoir recommandé par la communauté pour commencer le « vrai » fumage à charbon.',
    tempRange: '100–135°C',
    fuel: 'Charbon de bois (briquettes) + morceaux de bois',
    priceRange: '300€ – 600€',
    level: 'debutant',
    capacity: 'Moyenne à grande (2 niveaux de grilles)',
    pros: [
      'Température ultra-stable grâce au réservoir d\'eau',
      'Résultats quasi-professionnels pour le prix',
      'Utilisé en compétition KCBS par de nombreuses équipes',
      'Deux niveaux de grilles — bonne capacité',
      'Apprentissage rapide (plus facile qu\'un offset)',
      'Construction robuste — dure des années',
    ],
    cons: [
      'Monofonction — conçu uniquement pour le fumage (pas de grillage)',
      'Nettoyage du bac à eau contraignant',
      'Difficile de recharger le charbon sans démonter',
      'Encombrement vertical (attention au vent)',
      'Pas de fenêtre — tu ne vois pas la viande sans ouvrir',
    ],
    bestFor: ['Brisket', 'Épaule de porc', 'Ribs', 'Poulet fumé', 'Saucisses fumées'],
    notIdealFor: ['Grillades directes', 'Cuissons à haute température', 'Pizza'],
    brands: ['Weber Smokey Mountain (47cm ou 57cm)', 'ProQ Frontier', 'Pit Barrel Cooker'],
    tips: 'Le WSM 47cm (~350€) est parfait pour débuter. Le 57cm si tu reçois souvent. Utilise la « Minion method » : mets quelques briquettes allumées sur un tas de briquettes froides. Le charbon se consume progressivement sur 10-14h. Remplis le bac d\'eau chaude pour atteindre la température plus vite.',
  },
  {
    id: 'electric',
    name: 'Fumoir Électrique',
    altNames: ['Bradley', 'Masterbuilt', 'Fumoir digital'],
    icon: '🔌',
    image: null,
    tagline: 'Le fumoir d\'appartement. Branchez, fumez, sans charbon ni flamme.',
    description: 'Le fumoir électrique utilise une résistance chauffante pour générer de la chaleur et brûler des copeaux ou bisquettes de bois pour la fumée. La température est contrôlée par thermostat. C\'est l\'option la plus simple et la plus sûre, parfaite pour les environnements où le charbon est interdit (balcon, résidence).',
    tempRange: '100–135°C',
    fuel: 'Électricité + copeaux/bisquettes de bois',
    priceRange: '200€ – 800€',
    level: 'debutant',
    capacity: 'Moyenne (3–4 grilles verticales)',
    pros: [
      'Aucune gestion de feu — juste régler la température',
      'Autorisé là où le charbon est interdit (appartement, balcon)',
      'Résultats très constants et reproductibles',
      'Peu d\'entretien',
      'Sûr — pas de flamme ouverte',
      'Silencieux',
    ],
    cons: [
      'Saveur de fumée la moins prononcée de tous les fumoirs',
      'Pas de bark digne de ce nom',
      'Température max souvent limitée à 135°C',
      'Pas de saisie possible',
      'Résultat parfois trop « propre » — manque le côté rustique',
      'Dépendant de l\'électricité',
    ],
    bestFor: ['Saumon fumé', 'Poitrine fumée (bacon)', 'Saucisses fumées', 'Fromage fumé', 'Jerky'],
    notIdealFor: ['Brisket (pas de bark)', 'Toute cuisson nécessitant une saisie', 'Puristes du goût fumé'],
    brands: ['Masterbuilt', 'Bradley (bisquettes)', 'Char-Broil Digital', 'Smokin-It'],
    tips: 'Le Masterbuilt 30" Digital (~250€) est le best-seller. Parfait pour le saumon fumé à froid et le bacon maison. Pré-chauffe les copeaux de bois au four pour qu\'ils fument mieux. Pour le saumon : fume à 80°C max pendant 3–4h.',
  },
  {
    id: 'gas',
    name: 'BBQ Gaz',
    altNames: ['Plancha gaz', 'BBQ propane', 'Gas grill'],
    icon: '🔥',
    image: null,
    tagline: 'Rapide, pratique, et peut fumer avec un smoke box. Le BBQ du quotidien.',
    description: 'Le BBQ gaz est le plus répandu en France et en Europe. Allumage instantané, montée en température rapide, nettoyage facile. Pour le fumage, il suffit d\'ajouter une smoke box (boîte en inox remplie de copeaux de bois) au-dessus d\'un brûleur et de cuire en indirect.',
    tempRange: '100–350°C',
    fuel: 'Propane / Butane',
    priceRange: '150€ – 2 000€+',
    level: 'debutant',
    capacity: 'Variable (petite à très grande)',
    pros: [
      'Allumage instantané — prêt en 10 minutes',
      'Contrôle précis de la température au bouton',
      'Nettoyage facile',
      'Polyvalent : grillades, plancha, fumage en indirect',
      'Idéal pour le quotidien (côtelettes, burgers, légumes)',
      'Grande variété de tailles et de prix',
    ],
    cons: [
      'Saveur moins riche qu\'au charbon ou au bois',
      'Le fumage demande un accessoire supplémentaire (smoke box)',
      'Résultats en fumage nettement inférieurs à un vrai fumoir',
      'Consommation de gaz non négligeable',
      'L\'expérience « feu et braise » est absente',
    ],
    bestFor: ['Grillades quotidiennes', 'Plancha', 'Poulet en indirect', 'Légumes grillés'],
    notIdealFor: ['Vrai fumage low & slow', 'Brisket', 'Compétition BBQ'],
    brands: ['Weber Spirit/Genesis', 'Napoleon', 'Broil King', 'Campingaz', 'Char-Broil'],
    tips: 'Si tu as déjà un BBQ gaz, teste le fumage avec une smoke box (~15€) : remplis-la de copeaux de hickory, pose-la sur le brûleur allumé au max, et cuis ta viande côté éteint (indirect). C\'est un bon moyen de découvrir le fumage sans investir dans un fumoir dédié.',
  },
]

/* ── Niveau config ── */
const LEVEL_CONFIG = {
  debutant: { label: 'Débutant', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: '🌱' },
  intermediaire: { label: 'Intermédiaire', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '🔥' },
  avance: { label: 'Avancé', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: '🏆' },
}

/* ── Tableau comparatif ── */
function ComparisonTable({ bbqTypes }) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-4">
      <table className="w-full text-[13px] border-collapse min-w-[700px]">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="text-left py-3 px-3 text-stone-400 font-medium">Type</th>
            <th className="text-left py-3 px-3 text-stone-400 font-medium">Saveur fumée</th>
            <th className="text-left py-3 px-3 text-stone-400 font-medium">Facilité</th>
            <th className="text-left py-3 px-3 text-stone-400 font-medium">Prix entrée</th>
            <th className="text-left py-3 px-3 text-stone-400 font-medium">Polyvalence</th>
            <th className="text-left py-3 px-3 text-stone-400 font-medium">Niveau</th>
          </tr>
        </thead>
        <tbody>
          {bbqTypes.map(bbq => {
            const lev = LEVEL_CONFIG[bbq.level]
            return (
              <tr key={bbq.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 font-medium text-stone-200">{bbq.icon} {bbq.name}</td>
                <td className="py-3 px-3">{bbq.id === 'offset' ? '⭐⭐⭐⭐⭐' : bbq.id === 'kamado' ? '⭐⭐⭐⭐' : bbq.id === 'wsm' ? '⭐⭐⭐⭐' : bbq.id === 'kettle' ? '⭐⭐⭐' : bbq.id === 'pellet' ? '⭐⭐⭐' : bbq.id === 'gas' ? '⭐⭐' : '⭐⭐'}</td>
                <td className="py-3 px-3">{bbq.id === 'pellet' ? '⭐⭐⭐⭐⭐' : bbq.id === 'electric' ? '⭐⭐⭐⭐⭐' : bbq.id === 'gas' ? '⭐⭐⭐⭐' : bbq.id === 'kamado' ? '⭐⭐⭐' : bbq.id === 'kettle' ? '⭐⭐⭐⭐' : bbq.id === 'wsm' ? '⭐⭐⭐' : '⭐⭐'}</td>
                <td className="py-3 px-3 text-stone-300">{(bbq.priceRange || '').split('–')[0].trim()}</td>
                <td className="py-3 px-3">{bbq.id === 'kamado' ? '⭐⭐⭐⭐⭐' : bbq.id === 'gas' ? '⭐⭐⭐⭐' : bbq.id === 'pellet' ? '⭐⭐⭐⭐' : bbq.id === 'kettle' ? '⭐⭐⭐' : bbq.id === 'offset' ? '⭐⭐' : bbq.id === 'wsm' ? '⭐⭐' : '⭐⭐'}</td>
                <td className="py-3 px-3"><span className={`text-[11px] px-2 py-0.5 rounded-full ${lev.bg} ${lev.color} ${lev.border} border`}>{lev.icon} {lev.label}</span></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ── Card individuelle ── */
function BbqCard({ bbq, isExpanded, onToggle }) {
  const lev = LEVEL_CONFIG[bbq.level]

  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-[#ff6b1a]/20 bg-[#111]/80' : 'border-white/[0.05] bg-[#0e0e0e]/60 hover:border-white/[0.08]'}`}>
      {/* Header — toujours visible */}
      <button onClick={onToggle} className="w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span className="text-3xl shrink-0">{bbq.icon}</span>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-stone-100 font-display">{bbq.name}</h3>
            <p className="text-[11px] text-stone-500 mt-0.5">{bbq.altNames.join(' · ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-[11px] px-2.5 py-1 rounded-full ${lev.bg} ${lev.color} ${lev.border} border font-medium`}>{lev.icon} {lev.label}</span>
          <span className="text-[12px] text-stone-500">{bbq.priceRange}</span>
          <svg className={`w-4 h-4 text-stone-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>

      {/* Tagline */}
      <div className="px-5 sm:px-6 pb-4 -mt-2">
        <p className="text-[13px] text-[#ff8c4a] italic">{bbq.tagline}</p>
      </div>

      {/* Contenu expansible */}
      {isExpanded && (
        <div className="px-5 sm:px-6 pb-6 space-y-6 border-t border-white/[0.04] pt-5">
          {/* Description */}
          <p className="text-[13px] leading-relaxed text-stone-400">{bbq.description}</p>

          {/* Specs rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Température', value: bbq.tempRange },
              { label: 'Combustible', value: bbq.fuel },
              { label: 'Capacité', value: bbq.capacity },
              { label: 'Budget', value: bbq.priceRange },
            ].map(spec => (
              <div key={spec.label} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
                <p className="text-[10px] uppercase tracking-wider text-stone-600 mb-1">{spec.label}</p>
                <p className="text-[12px] text-stone-300 font-medium">{spec.value}</p>
              </div>
            ))}
          </div>

          {/* + et - */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-green-500/[0.04] border border-green-500/[0.08] p-4">
              <h4 className="text-[13px] font-bold text-green-400 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-[10px]">+</span>
                Avantages
              </h4>
              <ul className="space-y-2">
                {bbq.pros.map((pro, i) => (
                  <li key={i} className="text-[12px] text-stone-400 leading-relaxed flex gap-2">
                    <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-red-500/[0.04] border border-red-500/[0.08] p-4">
              <h4 className="text-[13px] font-bold text-red-400 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-[10px]">−</span>
                Inconvénients
              </h4>
              <ul className="space-y-2">
                {bbq.cons.map((con, i) => (
                  <li key={i} className="text-[12px] text-stone-400 leading-relaxed flex gap-2">
                    <span className="text-red-500 shrink-0 mt-0.5">✗</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Idéal pour / Pas idéal pour */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-stone-600 mb-2">Idéal pour</p>
              <div className="flex flex-wrap gap-1.5">
                {bbq.bestFor.map(item => (
                  <span key={item} className="text-[11px] px-2.5 py-1 rounded-lg bg-[#ff6b1a]/10 text-[#ff8c4a] border border-[#ff6b1a]/10">{item}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-stone-600 mb-2">Pas idéal pour</p>
              <div className="flex flex-wrap gap-1.5">
                {bbq.notIdealFor.map(item => (
                  <span key={item} className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.03] text-stone-500 border border-white/[0.05]">{item}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Marques */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-stone-600 mb-2">Marques recommandées</p>
            <p className="text-[12px] text-stone-400">{bbq.brands.join(' · ')}</p>
          </div>

          {/* Conseil terrain */}
          <div className="rounded-xl bg-[#ff6b1a]/[0.04] border border-[#ff6b1a]/[0.10] p-4">
            <p className="text-[11px] uppercase tracking-wider text-[#ff6b1a] mb-2 flex items-center gap-1.5">🔥 Conseil terrain</p>
            <p className="text-[12px] text-stone-400 leading-relaxed">{bbq.tips}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Page principale ── */
export default function BbqGuidePage() {
  const [bbqTypes, setBbqTypes] = useState(BBQ_TYPES_STATIC)
  const [expandedId, setExpandedId] = useState(null)
  const [levelFilter, setLevelFilter] = useState('all')

  // Fetch from Supabase, fallback to static
  useEffect(() => {
    supabase.from('bbq_types').select('*').eq('status', 'published').order('sort_order')
      .then(({ data }) => {
        if (data?.length) {
          // Map DB columns (snake_case) to component props (camelCase)
          setBbqTypes(data.map(d => ({
            id: d.id, name: d.name, altNames: d.alt_names || [], icon: d.icon,
            tagline: d.tagline, description: d.description, tempRange: d.temp_range,
            fuel: d.fuel, priceRange: d.price_range, level: d.level, capacity: d.capacity,
            pros: d.pros || [], cons: d.cons || [], bestFor: d.best_for || [],
            notIdealFor: d.not_ideal_for || [], brands: d.brands || [], tips: d.tips,
          })))
        }
      })
      .catch(() => {}) // silently fallback to static
  }, [])

  useEffect(() => {
    updateMeta({
      title: 'Quel BBQ choisir ? Comparatif fumoirs 2025 (offset, kamado, pellet)',
      description: 'Comparatif complet des types de BBQ et fumoirs : offset, kamado, pellet, bouilloire, WSM, électrique. Avantages, inconvénients, prix et recommandations par niveau.',
      canonical: 'https://charbonetflamme.fr/bbq',
    })
    injectJsonLd('bbq-guide-schema', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Quel BBQ choisir ? Guide comparatif des fumoirs 2025',
      description: 'Comparatif détaillé des types de barbecue et fumoirs avec avantages, inconvénients et recommandations.',
      author: { '@type': 'Organization', name: 'Charbon & Flamme' },
      publisher: { '@type': 'Organization', name: 'Charbon & Flamme', url: 'https://charbonetflamme.fr' },
    })
    return () => injectJsonLd('bbq-guide-schema', null)
  }, [])

  const filtered = levelFilter === 'all' ? bbqTypes : bbqTypes.filter(b => b.level === levelFilter)

  return (
    <div className="min-h-screen bg-[#080808]">

      {/* ── Hero ── */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff6b1a]/[0.03] via-transparent to-transparent" />
        <div className="absolute inset-0 smoke-bg opacity-30" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff6b1a]/10 border border-[#ff6b1a]/15 text-[#ff8c4a] text-[11px] font-semibold tracking-wide uppercase mb-6">
            Guide comparatif 2025
          </p>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-stone-100 leading-[1.1] mb-4">
            Quel <span className="text-[#ff6b1a]">BBQ</span> choisir ?
          </h1>
          <p className="text-stone-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Offset, kamado, pellet, bouilloire, fumoir vertical... Chaque type de barbecue a ses forces et ses limites. On t'aide à trouver celui qui correspond à ton niveau et à tes envies.
          </p>
        </div>
      </section>

      {/* ── Contenu ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 space-y-12">

        {/* Tableau comparatif */}
        <section>
          <h2 className="text-xl font-display font-bold text-stone-200 mb-4">Comparatif rapide</h2>
          <div className="rounded-2xl border border-white/[0.05] bg-[#0e0e0e]/60 p-4">
            <ComparisonTable bbqTypes={bbqTypes} />
          </div>
        </section>

        {/* Filtre par niveau */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-xl font-display font-bold text-stone-200">Tous les types de BBQ</h2>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Tous' },
                { key: 'debutant', label: '🌱 Débutant' },
                { key: 'intermediaire', label: '🔥 Intermédiaire' },
                { key: 'avance', label: '🏆 Avancé' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setLevelFilter(f.key)}
                  className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors ${levelFilter === f.key ? 'bg-[#ff6b1a]/15 border-[#ff6b1a]/20 text-[#ff8c4a]' : 'bg-white/[0.02] border-white/[0.05] text-stone-500 hover:text-stone-300'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map(bbq => (
              <BbqCard
                key={bbq.id}
                bbq={bbq}
                isExpanded={expandedId === bbq.id}
                onToggle={() => setExpandedId(expandedId === bbq.id ? null : bbq.id)}
              />
            ))}
          </div>
        </section>

        {/* Guide de choix rapide */}
        <section className="rounded-2xl border border-[#ff6b1a]/10 bg-gradient-to-br from-[#ff6b1a]/[0.04] to-transparent p-6 sm:p-8">
          <h2 className="text-xl font-display font-bold text-stone-200 mb-4">Notre recommandation par profil</h2>
          <div className="space-y-4">
            {[
              { profile: 'Tu débutes et tu veux un résultat garanti', pick: 'Pellet smoker', why: 'Zéro gestion de feu, résultats constants dès la première cuisson. Un Pit Boss ou Z Grills et c\'est parti.' },
              { profile: 'Tu veux fumer au charbon sans te ruiner', pick: 'Weber Smokey Mountain (WSM)', why: 'Le meilleur rapport qualité/résultat. Température stable, prix accessible, utilisé en compétition.' },
              { profile: 'Tu veux la polyvalence totale', pick: 'Kamado', why: 'Fumer, griller, rôtir, pizza. Un seul appareil qui fait tout. Investissement, mais pour la vie.' },
              { profile: 'Tu veux la saveur ultime, 100% bois', pick: 'Offset smoker', why: 'Le graal du fumage. Demande du temps et de la pratique, mais rien n\'égale cette saveur.' },
              { profile: 'Tu as un balcon en appartement', pick: 'Fumoir électrique', why: 'Pas de flamme, pas de fumée excessive. Parfait pour le saumon fumé et le bacon maison.' },
            ].map((rec, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#ff6b1a]/15 flex items-center justify-center text-[#ff6b1a] font-bold text-[12px] shrink-0 mt-0.5">{i + 1}</div>
                <div>
                  <p className="text-[13px] text-stone-300 font-medium">{rec.profile}</p>
                  <p className="text-[13px] mt-1"><span className="text-[#ff8c4a] font-bold">→ {rec.pick}</span> <span className="text-stone-500">— {rec.why}</span></p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-stone-500 text-sm mb-4">Tu as choisi ton fumoir ? Lance ta première cuisson.</p>
          <Link to="/calculateur" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff6b1a] to-[#dc2626] text-white font-bold text-sm hover:shadow-lg hover:shadow-[#ff6b1a]/25 transition-all">
            🔥 Ouvrir le calculateur
          </Link>
        </section>
      </div>
    </div>
  )
}
