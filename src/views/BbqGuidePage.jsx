'use client'

/**
 * CHARBON & FLAMME — Guide des Types de BBQ / Fumoirs
 * Page statique avec comparatif détaillé, avantages/inconvénients,
 * recommandations par niveau, SEO optimisé.
 */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { updateMeta, injectJsonLd } from '../lib/seo.js'
import { supabase } from '../lib/supabase.js'
import { CFHeader, CFFooter, NewsletterBlock } from '../components/cf/Chrome.jsx'
import { FireButton, SectionEyebrow, Pill } from '../components/cf/Primitives.jsx'

/* ── useMobile ── */
function useMobile() {
  const [mobile, setMobile] = React.useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  )
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => setMobile(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])
  return mobile
}

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
  debutant: { label: 'Débutant', color: '#2D6A4F', bg: 'rgba(45,106,79,0.12)', border: 'rgba(45,106,79,0.25)', icon: '🌱' },
  intermediaire: { label: 'Intermédiaire', color: '#E8A53C', bg: 'rgba(232,165,60,0.12)', border: 'rgba(232,165,60,0.25)', icon: '🔥' },
  avance: { label: 'Avancé', color: '#8B1A1A', bg: 'rgba(139,26,26,0.10)', border: 'rgba(139,26,26,0.25)', icon: '🏆' },
}

/* ── Tableau comparatif ── */
function ComparisonTable({ bbqTypes }) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-4">
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', minWidth: 700 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(31,26,20,0.15)' }}>
            {['Type', 'Saveur fumée', 'Facilité', 'Prix entrée', 'Polyvalence', 'Niveau'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#6E6356', fontWeight: 500 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bbqTypes.map(bbq => {
            const lev = LEVEL_CONFIG[bbq.level]
            return (
              <tr key={bbq.id} style={{ borderBottom: '1px solid rgba(31,26,20,0.07)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1F1A14' }}>{bbq.icon} {bbq.name}</td>
                <td style={{ padding: '10px 12px' }}>{bbq.id === 'offset' ? '⭐⭐⭐⭐⭐' : bbq.id === 'kamado' ? '⭐⭐⭐⭐' : bbq.id === 'wsm' ? '⭐⭐⭐⭐' : bbq.id === 'kettle' ? '⭐⭐⭐' : bbq.id === 'pellet' ? '⭐⭐⭐' : bbq.id === 'gas' ? '⭐⭐' : '⭐⭐'}</td>
                <td style={{ padding: '10px 12px' }}>{bbq.id === 'pellet' ? '⭐⭐⭐⭐⭐' : bbq.id === 'electric' ? '⭐⭐⭐⭐⭐' : bbq.id === 'gas' ? '⭐⭐⭐⭐' : bbq.id === 'kamado' ? '⭐⭐⭐' : bbq.id === 'kettle' ? '⭐⭐⭐⭐' : bbq.id === 'wsm' ? '⭐⭐⭐' : '⭐⭐'}</td>
                <td style={{ padding: '10px 12px', color: '#6E6356' }}>{(bbq.priceRange || '').split('–')[0].trim()}</td>
                <td style={{ padding: '10px 12px' }}>{bbq.id === 'kamado' ? '⭐⭐⭐⭐⭐' : bbq.id === 'gas' ? '⭐⭐⭐⭐' : bbq.id === 'pellet' ? '⭐⭐⭐⭐' : bbq.id === 'kettle' ? '⭐⭐⭐' : bbq.id === 'offset' ? '⭐⭐' : bbq.id === 'wsm' ? '⭐⭐' : '⭐⭐'}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: lev.bg, color: lev.color, border: `1px solid ${lev.border}`, fontWeight: 600 }}>
                    {lev.icon} {lev.label}
                  </span>
                </td>
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
    <div style={{
      borderRadius: 16,
      border: isExpanded ? '1px solid rgba(139,26,26,0.25)' : '1px solid rgba(31,26,20,0.12)',
      background: '#F5EFE0',
      overflow: 'hidden',
      transition: 'all 0.3s',
    }}>
      {/* Header — toujours visible */}
      <button onClick={onToggle} style={{ width: '100%', textAlign: 'left', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, background: 'none', border: 'none', cursor: 'pointer' }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>{bbq.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1F1A14', fontFamily: 'var(--cf-serif)', margin: 0 }}>{bbq.name}</h3>
          <p style={{ fontSize: 11, color: '#6E6356', marginTop: 2 }}>{bbq.altNames.join(' · ')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: lev.bg, color: lev.color, border: `1px solid ${lev.border}`, fontWeight: 600 }}>{lev.icon} {lev.label}</span>
          <span style={{ fontSize: 12, color: '#6E6356' }}>{bbq.priceRange}</span>
          <svg style={{ width: 16, height: 16, color: '#6E6356', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>

      {/* Tagline */}
      <div style={{ padding: '0 24px 16px' }}>
        <p style={{ fontSize: 13, color: '#8B1A1A', fontStyle: 'italic' }}>{bbq.tagline}</p>
      </div>

      {/* Contenu expansible */}
      {isExpanded && (
        <div style={{ padding: '20px 24px 24px', borderTop: '1px solid rgba(31,26,20,0.10)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Description */}
          <p style={{ fontSize: 13, lineHeight: 1.7, color: '#6E6356', margin: 0 }}>{bbq.description}</p>

          {/* Specs rapides */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
            {[
              { label: 'Température', value: bbq.tempRange },
              { label: 'Combustible', value: bbq.fuel },
              { label: 'Capacité', value: bbq.capacity },
              { label: 'Budget', value: bbq.priceRange },
            ].map(spec => (
              <div key={spec.label} style={{ borderRadius: 12, background: 'rgba(31,26,20,0.04)', border: '1px solid rgba(31,26,20,0.10)', padding: 12 }}>
                <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6E6356', marginBottom: 4 }}>{spec.label}</p>
                <p style={{ fontSize: 12, color: '#1F1A14', fontWeight: 600, margin: 0 }}>{spec.value}</p>
              </div>
            ))}
          </div>

          {/* + et - */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ borderRadius: 12, background: 'rgba(45,106,79,0.06)', border: '1px solid rgba(45,106,79,0.15)', padding: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#2D6A4F', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(45,106,79,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>+</span>
                Avantages
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {bbq.pros.map((pro, i) => (
                  <li key={i} style={{ fontSize: 12, color: '#6E6356', lineHeight: 1.6, display: 'flex', gap: 6 }}>
                    <span style={{ color: '#2D6A4F', flexShrink: 0 }}>✓</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ borderRadius: 12, background: 'rgba(139,26,26,0.04)', border: '1px solid rgba(139,26,26,0.12)', padding: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#8B1A1A', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(139,26,26,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>−</span>
                Inconvénients
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {bbq.cons.map((con, i) => (
                  <li key={i} style={{ fontSize: 12, color: '#6E6356', lineHeight: 1.6, display: 'flex', gap: 6 }}>
                    <span style={{ color: '#8B1A1A', flexShrink: 0 }}>✗</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Idéal pour / Pas idéal pour */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6E6356', marginBottom: 8 }}>Idéal pour</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {bbq.bestFor.map(item => (
                  <span key={item} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: 'rgba(232,165,60,0.12)', color: '#8B1A1A', border: '1px solid rgba(232,165,60,0.20)' }}>{item}</span>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6E6356', marginBottom: 8 }}>Pas idéal pour</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {bbq.notIdealFor.map(item => (
                  <span key={item} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: 'rgba(31,26,20,0.05)', color: '#6E6356', border: '1px solid rgba(31,26,20,0.10)' }}>{item}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Marques */}
          <div>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6E6356', marginBottom: 6 }}>Marques recommandées</p>
            <p style={{ fontSize: 12, color: '#6E6356', margin: 0 }}>{bbq.brands.join(' · ')}</p>
          </div>

          {/* Conseil terrain */}
          <div style={{ borderRadius: 12, background: 'rgba(232,165,60,0.08)', border: '1px solid rgba(232,165,60,0.20)', padding: 16 }}>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E8A53C', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>🔥 Conseil terrain</p>
            <p style={{ fontSize: 12, color: '#6E6356', lineHeight: 1.7, margin: 0 }}>{bbq.tips}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Page principale ── */
export default function BbqGuidePage() {
  const mobile = useMobile()
  const [bbqTypes, setBbqTypes] = useState(BBQ_TYPES_STATIC)
  const [expandedId, setExpandedId] = useState(null)
  const [levelFilter, setLevelFilter] = useState('all')

  // Fetch from Supabase, fallback to static
  useEffect(() => {
    supabase.from('bbq_types').select('*').eq('status', 'published').order('sort_order')
      .then(({ data }) => {
        if (data?.length) {
          setBbqTypes(data.map(d => ({
            id: d.id, name: d.name, altNames: d.alt_names || [], icon: d.icon,
            tagline: d.tagline, description: d.description, tempRange: d.temp_range,
            fuel: d.fuel, priceRange: d.price_range, level: d.level, capacity: d.capacity,
            pros: d.pros || [], cons: d.cons || [], bestFor: d.best_for || [],
            notIdealFor: d.not_ideal_for || [], brands: d.brands || [], tips: d.tips,
          })))
        }
      })
      .catch(() => {})
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
    <div style={{ minHeight: '100vh', background: '#FAF6EE', color: '#1F1A14' }}>
      <CFHeader />
      <main>
        {/* ── Hero ── */}
        <section style={{ paddingTop: mobile ? 64 : 96, paddingBottom: mobile ? 48 : 72, textAlign: 'center' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
            <SectionEyebrow>Guide comparatif 2025</SectionEyebrow>
            <h1 style={{ fontSize: mobile ? 32 : 48, fontWeight: 900, fontFamily: 'var(--cf-serif)', color: '#1F1A14', lineHeight: 1.1, margin: '16px 0' }}>
              Quel <span style={{ color: '#8B1A1A' }}>BBQ</span> choisir ?
            </h1>
            <p style={{ color: '#6E6356', fontSize: mobile ? 15 : 17, maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
              Offset, kamado, pellet, bouilloire, fumoir vertical... Chaque type de barbecue a ses forces et ses limites. On t'aide à trouver celui qui correspond à ton niveau et à tes envies.
            </p>
          </div>
        </section>

        {/* ── Contenu ── */}
        <div style={{ maxWidth: 864, margin: '0 auto', padding: '0 16px 80px', display: 'flex', flexDirection: 'column', gap: 48 }}>

          {/* Tableau comparatif */}
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--cf-serif)', color: '#1F1A14', marginBottom: 16 }}>Comparatif rapide</h2>
            <div style={{ borderRadius: 16, border: '1px solid rgba(31,26,20,0.12)', background: '#F5EFE0', padding: 16 }}>
              <ComparisonTable bbqTypes={bbqTypes} />
            </div>
          </section>

          {/* Filtre par niveau */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--cf-serif)', color: '#1F1A14', margin: 0 }}>Tous les types de BBQ</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { key: 'all', label: 'Tous' },
                  { key: 'debutant', label: '🌱 Débutant' },
                  { key: 'intermediaire', label: '🔥 Intermédiaire' },
                  { key: 'avance', label: '🏆 Avancé' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setLevelFilter(f.key)}
                    style={{
                      fontSize: 11, padding: '6px 12px', borderRadius: 8,
                      border: levelFilter === f.key ? '1px solid rgba(139,26,26,0.25)' : '1px solid rgba(31,26,20,0.12)',
                      background: levelFilter === f.key ? 'rgba(139,26,26,0.08)' : 'transparent',
                      color: levelFilter === f.key ? '#8B1A1A' : '#6E6356',
                      cursor: 'pointer', fontWeight: 500,
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
          <section style={{ borderRadius: 16, border: '1px solid rgba(232,165,60,0.20)', background: 'rgba(232,165,60,0.06)', padding: mobile ? 24 : 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--cf-serif)', color: '#1F1A14', marginBottom: 20 }}>Notre recommandation par profil</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { profile: 'Tu débutes et tu veux un résultat garanti', pick: 'Pellet smoker', why: 'Zéro gestion de feu, résultats constants dès la première cuisson. Un Pit Boss ou Z Grills et c\'est parti.' },
                { profile: 'Tu veux fumer au charbon sans te ruiner', pick: 'Weber Smokey Mountain (WSM)', why: 'Le meilleur rapport qualité/résultat. Température stable, prix accessible, utilisé en compétition.' },
                { profile: 'Tu veux la polyvalence totale', pick: 'Kamado', why: 'Fumer, griller, rôtir, pizza. Un seul appareil qui fait tout. Investissement, mais pour la vie.' },
                { profile: 'Tu veux la saveur ultime, 100% bois', pick: 'Offset smoker', why: 'Le graal du fumage. Demande du temps et de la pratique, mais rien n\'égale cette saveur.' },
                { profile: 'Tu as un balcon en appartement', pick: 'Fumoir électrique', why: 'Pas de flamme, pas de fumée excessive. Parfait pour le saumon fumé et le bacon maison.' },
              ].map((rec, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(139,26,26,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1A1A', fontWeight: 700, fontSize: 12, flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                  <div>
                    <p style={{ fontSize: 13, color: '#1F1A14', fontWeight: 600, margin: 0 }}>{rec.profile}</p>
                    <p style={{ fontSize: 13, marginTop: 4 }}>
                      <span style={{ color: '#8B1A1A', fontWeight: 700 }}>→ {rec.pick}</span>
                      <span style={{ color: '#6E6356' }}> — {rec.why}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Newsletter */}
          <NewsletterBlock />

          {/* CTA */}
          <section style={{ textAlign: 'center' }}>
            <p style={{ color: '#6E6356', fontSize: 14, marginBottom: 16 }}>Tu as choisi ton fumoir ? Lance ta première cuisson.</p>
            <Link href="/calculateur">
              <FireButton>🔥 Ouvrir le calculateur</FireButton>
            </Link>
          </section>
        </div>
      </main>
      <CFFooter mobile={mobile} />
    </div>
  )
}
