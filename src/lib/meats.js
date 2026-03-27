/**
 * MEATS.JS — Données complètes de toutes les viandes PitMaster
 * Rubs, bois, conseils, températures
 */

export const MEATS = {
  brisket: {
    name: 'Brisket',
    full: 'Poitrine de bœuf (Brisket)',
    emoji: '🥩',
    category: 'beef',
    temp: '93-96°C',
    woods: [
      { e:'🌳', n:'Chêne', d:'Fumée longue et intense — classique Texas BBQ', i:4 },
      { e:'🌿', n:'Hickory', d:'Note bacon prononcée, très américain', i:5 },
      { e:'🍒', n:'Cerisier', d:'Adoucit le chêne, belle couleur acajou sur l\'écorce', i:2 },
      { e:'🍎', n:'Pommier', d:'Fumée douce et fruitée, se marie bien en mix', i:2 },
    ],
    tips: [
      { t:'Probe tender', b:'La sonde doit s\'enfoncer sans résistance comme dans du beurre. T° secondaire.' },
      { t:'Trim le gras', b:'Laisser 5-7mm de gras. Moins = bark plus uniforme, plus = protection humidité.' },
      { t:'Wrapper à 70-74°C', b:'Papier boucher (meilleure bark) ou alu (plus rapide). Économise 1h environ.' },
      { t:'Repos glacière', b:'Minimum 1h, idéal 2h en glacière. La viande reste chaude 4h facilement.' },
      { t:'Sens du grain', b:'Plat et pointe ont des grains perpendiculaires. Couper les deux séparément.' },
      { t:'Injection', b:'Bouillon bœuf + beurre fondu pour les pièces > 6kg. Uniformise la cuisson.' },
    ],
    rubs: [{
      name: 'Aaron Franklin Rub',
      ingr: [
        { n:'Sel casher', q:'50%' }, { n:'Poivre noir grossier', q:'50%' },
      ],
      note: 'Le grand classique Texas BBQ. Rien d\'autre. Appliquer généreusement 4h avant.',
    }, {
      name: 'Rub BBQ complet',
      ingr: [
        { n:'Sel fin', q:'2 c.à.s' }, { n:'Poivre noir moulu', q:'2 c.à.s' },
        { n:'Paprika fumé', q:'1 c.à.s' }, { n:'Ail en poudre', q:'1 c.à.s' },
        { n:'Oignon en poudre', q:'1 c.à.s' }, { n:'Cassonade', q:'1 c.à.s' },
        { n:'Cayenne', q:'1/2 c.à.c' },
      ],
      note: 'Version plus complexe. Moutarde jaune comme liant avant application.',
    }],
  },
  paleron: {
    name: 'Paleron',
    full: 'Paleron de bœuf façon brisket',
    emoji: '🥩',
    category: 'beef',
    temp: '92-93°C',
    woods: [
      { e:'🌳', n:'Chêne', d:'Classique, fumée longue et profonde', i:4 },
      { e:'🍒', n:'Cerisier', d:'Adoucit la fumée, belle couleur acajou', i:3 },
      { e:'🌿', n:'Hickory', d:'Puissant, à doser avec soin', i:5 },
    ],
    tips: [
      { t:'Alternative au brisket', b:'Plus facile à trouver en France, résultat excellent. Nerf central devient fondant.' },
      { t:'Cible 92-93°C', b:'Légèrement moins que le brisket américain. Texture guimauve = parfait.' },
      { t:'Wrapper au plateau', b:'Identique au brisket : papier boucher à 71-74°C. French Smoker confirme.' },
      { t:'Repos obligatoire', b:'1h minimum en glacière. La gélatine se redistribue.' },
    ],
    rubs: [{
      name: 'Rub Paleron',
      ingr: [
        { n:'Sel', q:'2 c.à.s' }, { n:'Poivre noir', q:'2 c.à.s' },
        { n:'Paprika fumé', q:'1 c.à.s' }, { n:'Ail en poudre', q:'1 c.à.s' },
        { n:'Herbes de Provence', q:'1 c.à.c' },
      ],
      note: 'Touch française avec les herbes. Appliquer 4-8h avant sur toutes les faces.',
    }],
  },
  plat_de_cote: {
    name: 'Plat de côte',
    full: 'Plat de côte de bœuf fumé',
    emoji: '🦴',
    category: 'beef',
    temp: '92-95°C',
    woods: [
      { e:'🌳', n:'Chêne', d:'Parfait pour le bœuf, longue cuisson', i:4 },
      { e:'🌿', n:'Hickory', d:'Note bacon prononcée', i:4 },
      { e:'🍒', n:'Cerisier', d:'Couleur acajou sur l\'écorce', i:2 },
    ],
    tips: [
      { t:'Coupe française idéale', b:'Moins cher que le brisket, plus de collagène. Os qui se dégage = cuit.' },
      { t:'Cotés os vers le bas', b:'L\'os conduit la chaleur et protège la viande de la dessication.' },
      { t:'Spray régulier', b:'Eau + vinaigre de cidre (50/50) toutes les heures pour l\'humidité de surface.' },
      { t:'T° interne cible', b:'93-95°C pour effiloché. Sonde glisse sans résistance.' },
    ],
    rubs: [{
      name: 'Rub Plat de côte',
      ingr: [
        { n:'Sel casher', q:'2 c.à.s' }, { n:'Poivre noir', q:'2 c.à.s' },
        { n:'Paprika fumé', q:'1 c.à.s' }, { n:'Cumin', q:'1 c.à.c' },
        { n:'Ail en poudre', q:'1 c.à.s' },
      ],
      note: 'Couche généreuse. Laisser 12h au frigo si possible pour pénétration maximale.',
    }],
  },
  ribs_beef: {
    name: 'Beef Ribs',
    full: 'Côtes courtes de bœuf (Beef Short Ribs)',
    emoji: '🦴',
    category: 'beef',
    temp: '95-98°C',
    woods: [
      { e:'🌳', n:'Chêne', d:'Le meilleur pour beef ribs — longue fumée intense', i:5 },
      { e:'🌿', n:'Hickory', d:'Bacon + bœuf = combo parfait', i:4 },
      { e:'🍒', n:'Cerisier', d:'Pour adoucir le chêne en mélange', i:2 },
    ],
    tips: [
      { t:'Mâchoire de dinosaure', b:'Présentation spectaculaire. Retirer la membrane du côté os avant cuisson.' },
      { t:'Côté os vers le bas', b:'Toujours. L\'os conduit la chaleur vers le centre de la viande.' },
      { t:'Gelée = prêt', b:'Secouer la côte — si elle oscille comme de la gelée c\'est parfait.' },
      { t:'Wrapper à 74°C', b:'Papier boucher avec un peu de beurre. Économise 1h sur la cuisson.' },
    ],
    rubs: [{
      name: 'Texas Rub Beef Ribs',
      ingr: [
        { n:'Sel casher', q:'2 c.à.s' }, { n:'Poivre grossier', q:'2 c.à.s' },
        { n:'Ail en poudre', q:'1 c.à.s' }, { n:'Paprika fumé', q:'1 c.à.s' },
      ],
      note: 'Simple et efficace. Moutarde jaune comme liant. 6h minimum au frigo.',
    }],
  },
  pork_shoulder: {
    name: 'Pulled Pork',
    full: 'Épaule de porc (Pulled Pork)',
    emoji: '🐷',
    category: 'pork',
    temp: '95-98°C',
    woods: [
      { e:'🍎', n:'Pommier', d:'Classique pulled pork — fruité et doux', i:3 },
      { e:'🌿', n:'Hickory', d:'Plus intense, note fumée prononcée', i:4 },
      { e:'🍒', n:'Cerisier', d:'Belle couleur, légèrement sucré', i:2 },
      { e:'🌳', n:'Érable', d:'Douceur et rondeur — canadien style', i:2 },
    ],
    tips: [
      { t:'Bone probe test', b:'L\'os pivote librement et se retire proprement = prêt à effilocher.' },
      { t:'Scorer le gras', b:'Quadriller la couche de gras en losanges 2cm pour pénétration du rub.' },
      { t:'Repos en glacière', b:'45-60 min minimum. La viande reste à bonne température 3-4h.' },
      { t:'Spritz régulier', b:'Jus de pomme + ACV (50/50) toutes les heures. Aide la bark et l\'humidité.' },
    ],
    rubs: [{
      name: 'Rub Pulled Pork Classique',
      ingr: [
        { n:'Cassonade', q:'3 c.à.s' }, { n:'Paprika fumé', q:'2 c.à.s' },
        { n:'Sel fin', q:'1 c.à.s' }, { n:'Poivre noir', q:'1 c.à.s' },
        { n:'Ail en poudre', q:'1 c.à.s' }, { n:'Oignon poudre', q:'1 c.à.s' },
        { n:'Moutarde sèche', q:'1 c.à.c' }, { n:'Cayenne', q:'1/2 c.à.c' },
      ],
      note: 'Moutarde jaune comme liant avant application. 8-12h au frigo. Généreux.',
    }],
    sauce: {
      name: 'Sauce Carolina vinegar',
      ingr: [
        { n:'Vinaigre de cidre', q:'250ml' }, { n:'Ketchup', q:'60ml' },
        { n:'Cassonade', q:'2 c.à.s' }, { n:'Sel', q:'1 c.à.c' },
        { n:'Piment rouge', q:'1 c.à.c' }, { n:'Poivre noir', q:'1/2 c.à.c' },
      ],
    },
  },
  ribs_pork: {
    name: 'Spare Ribs',
    full: 'Spare Ribs (Saint-Louis) — méthode 3-2-1',
    emoji: '🍖',
    category: 'pork',
    temp: '88-93°C',
    woods: [
      { e:'🍎', n:'Pommier', d:'Doux et fruité — parfait pour le porc', i:3 },
      { e:'🍒', n:'Cerisier', d:'Belle couleur acajou sur les ribs', i:2 },
      { e:'🌿', n:'Hickory', d:'Plus intense, classique américain', i:4 },
      { e:'🌳', n:'Érable', d:'Douceur naturelle', i:2 },
    ],
    tips: [
      { t:'Méthode 3-2-1', b:'3h fumée directe → 2h wrap beurre/miel → 1h laquage découverte.' },
      { t:'Retirer la membrane', b:'Glisse une cuillère sous la membrane au dos et arrache d\'un coup.' },
      { t:'Bend test', b:'Soulève le rack au milieu — courbure à 45° + légère fissure = parfait.' },
      { t:'Saint-Louis style', b:'Retailler en rectangle après avoir retiré le bout de côtes cartilagineux.' },
    ],
    rubs: [{
      name: 'Rub Spare Ribs',
      ingr: [
        { n:'Cassonade', q:'3 c.à.s' }, { n:'Paprika fumé', q:'2 c.à.s' },
        { n:'Sel fin', q:'1 c.à.s' }, { n:'Poivre noir', q:'1 c.à.s' },
        { n:'Ail en poudre', q:'1 c.à.s' }, { n:'Oignon en poudre', q:'1 c.à.s' },
        { n:'Moutarde sèche', q:'1 c.à.c' }, { n:'Cayenne', q:'1/2 c.à.c' },
      ],
      note: 'Moutarde jaune comme liant. 4h minimum au frigo.',
    }],
    sauce: {
      name: 'Laque Phase 3',
      ingr: [
        { n:'Ketchup', q:'150ml' }, { n:'Miel', q:'3 c.à.s' },
        { n:'Sauce Worcestershire', q:'2 c.à.s' }, { n:'Moutarde de Dijon', q:'1 c.à.s' },
        { n:'Cassonade', q:'1 c.à.s' }, { n:'Paprika fumé', q:'1 c.à.c' },
        { n:'Ail en poudre', q:'1/2 c.à.c' },
      ],
    },
  },
  ribs_baby_back: {
    name: 'Baby Back Ribs',
    full: 'Baby Back Ribs — méthode 2-2-1',
    emoji: '🍖',
    category: 'pork',
    temp: '88-90°C',
    woods: [
      { e:'🍒', n:'Cerisier', d:'Parfait pour baby back — couleur et douceur', i:2 },
      { e:'🍎', n:'Pommier', d:'Fruité et léger', i:2 },
      { e:'🌿', n:'Hickory', d:'Plus intense — bien doser', i:3 },
    ],
    tips: [
      { t:'Méthode 2-2-1', b:'2h fumée → 2h wrap → 1h laquage. Plus courts que spare ribs.' },
      { t:'Côtes du dos', b:'Plus maigres, plus tendres naturellement. Cuisson légèrement plus courte.' },
      { t:'Bend test identique', b:'45° + légère fissure. Mais se plie plus facilement que spare ribs.' },
      { t:'Membrane', b:'Retirer la membrane côté os comme pour les spare ribs.' },
    ],
    rubs: [{
      name: 'Rub Baby Back',
      ingr: [
        { n:'Cassonade', q:'2 c.à.s' }, { n:'Paprika doux', q:'2 c.à.s' },
        { n:'Sel', q:'1 c.à.s' }, { n:'Poivre', q:'1 c.à.s' },
        { n:'Ail poudre', q:'1 c.à.s' },
      ],
      note: 'Plus doux que spare ribs. Convient très bien aux enfants.',
    }],
  },
  lamb_shoulder: {
    name: 'Épaule agneau',
    full: 'Épaule d\'agneau fumée',
    emoji: '🐑',
    category: 'lamb',
    temp: '90°C effiloché / 74°C tranché',
    woods: [
      { e:'🌿', n:'Romarin (bois)', d:'Alliance classique agneau-romarin. Quelques brins seulement.' , i:2 },
      { e:'🍎', n:'Pommier', d:'Doux et légèrement sucré — respecte l\'agneau', i:2 },
      { e:'🌳', n:'Chêne', d:'Pour une fumée plus profonde', i:3 },
    ],
    tips: [
      { t:'Deux objectifs possibles', b:'90°C = effiloché spectaculaire. 74°C = tranché rosé délicat.' },
      { t:'Piquer et mariner', b:'Piquer et insérer des gousses d\'ail + romarin avant cuisson.' },
      { t:'Os qui se dégage', b:'L\'os se retire proprement sans forcer = prêt à effilocher.' },
      { t:'Herbes méditerranéennes', b:'Thym, romarin, origan dans le rub pour une note française authentique.' },
    ],
    rubs: [{
      name: 'Rub Agneau Méditerranéen',
      ingr: [
        { n:'Sel', q:'1 c.à.s' }, { n:'Poivre', q:'1 c.à.s' },
        { n:'Herbes de Provence', q:'2 c.à.s' }, { n:'Ail en poudre', q:'1 c.à.s' },
        { n:'Paprika doux', q:'1 c.à.s' }, { n:'Cumin', q:'1/2 c.à.c' },
      ],
      note: 'Huile d\'olive comme liant. Style Provence + BBQ. Laisser 12h minimum.',
    }],
  },
  // PATCH: nouvelles viandes branchées sur le nouveau moteur pitmaster-first
  whole_chicken: {
    name: 'Poulet entier',
    full: 'Poulet entier fumé',
    emoji: '🍗',
    category: 'poultry',
    temp: '74-76°C',
    woods: [
      { e:'🍎', n:'Pommier', d:'Fumée douce, parfaite pour ne pas couvrir la volaille', i:2 },
      { e:'🍒', n:'Cerisier', d:'Belle couleur et profil léger', i:2 },
      { e:'🌳', n:'Chêne léger', d:'En petite dose pour plus de caractère', i:3 },
    ],
    tips: [
      { t:'Température plus haute', b:'La volaille aime les cuissons plus vives. Beaucoup de pitmasters visent 135°C ou plus.' },
      { t:'Peau plus nette', b:'À basse température, la peau reste souvent molle. Monte un peu le pit si tu veux une peau plus propre.' },
      { t:'Point de sortie', b:'Contrôle surtout la cuisse et la jointure. 74-76°C donnent un bon compromis jutosité / sécurité.' },
    ],
    rubs: [{
      name: 'Rub volaille simple',
      ingr: [
        { n:'Sel fin', q:'1 c.à.s' }, { n:'Paprika doux', q:'1 c.à.s' },
        { n:'Ail en poudre', q:'1 c.à.c' }, { n:'Poivre noir', q:'1 c.à.c' },
        { n:'Thym', q:'1 c.à.c' },
      ],
      note: 'Huile neutre ou beurre fondu comme liant. Très bien avec une petite saumure préalable.',
    }],
  },
  chicken_pieces: {
    name: 'Cuisses / pilons',
    full: 'Cuisses et pilons de poulet',
    emoji: '🍗',
    category: 'poultry',
    temp: '74-78°C',
    woods: [
      { e:'🍎', n:'Pommier', d:'Très doux, laisse la place au rub', i:2 },
      { e:'🍒', n:'Cerisier', d:'Couleur propre et fumée légère', i:2 },
      { e:'🌳', n:'Chêne', d:'En petite dose pour une volaille plus marquée', i:3 },
    ],
    tips: [
      { t:'Très bon en hot & fast', b:'C’est souvent la méthode la plus simple pour avoir une peau propre et un résultat régulier.' },
      { t:'La cuisse aime cuire un peu plus', b:'Les morceaux bruns supportent bien 76-78°C sans se dessécher.' },
      { t:'Reste simple', b:'Une cuisson courte, une bonne couleur et un repos bref suffisent souvent.' },
    ],
    rubs: [{
      name: 'Rub cuisses BBQ',
      ingr: [
        { n:'Paprika', q:'1 c.à.s' }, { n:'Sel fin', q:'1 c.à.c' },
        { n:'Ail poudre', q:'1 c.à.c' }, { n:'Poivre noir', q:'1 c.à.c' },
        { n:'Cassonade', q:'1 c.à.c' },
      ],
      note: 'Une fine couche suffit. Trop de sucre colore trop vite sur une volaille cuite chaud.',
    }],
  },
  lamb_leg: {
    name: 'Gigot',
    full: 'Gigot d’agneau fumé',
    emoji: '🐑',
    category: 'lamb',
    temp: '57-63°C rosé',
    woods: [
      { e:'🍎', n:'Pommier', d:'Respecte bien le goût de l’agneau', i:2 },
      { e:'🌿', n:'Romarin', d:'Quelques brins seulement pour renforcer le côté méditerranéen', i:2 },
      { e:'🌳', n:'Chêne doux', d:'À petite dose pour plus de profondeur', i:3 },
    ],
    tips: [
      { t:'Ne pas le traiter comme une épaule', b:'Le gigot se sert souvent rosé. La texture et la coupe comptent plus qu’un rendu effiloché.' },
      { t:'Commence à contrôler tôt', b:'Dès que tu approches la bonne zone, surveille souvent pour éviter de dépasser.' },
      { t:'Repos utile', b:'Même un gigot a besoin de se poser avant découpe pour garder ses jus.' },
    ],
    rubs: [{
      name: 'Rub gigot fumé',
      ingr: [
        { n:'Sel', q:'1 c.à.s' }, { n:'Poivre', q:'1 c.à.c' },
        { n:'Ail en poudre', q:'1 c.à.c' }, { n:'Romarin', q:'1 c.à.c' },
        { n:'Thym', q:'1 c.à.c' },
      ],
      note: 'Très bien avec huile d’olive et zeste de citron. Style plus net et plus premium que les rubs sucrés.',
    }],
  },
}
