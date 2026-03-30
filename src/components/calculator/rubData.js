/**
 * Rubs inspirés de grands pitmasters — adaptés au public français
 * Sources : Aaron Franklin, Malcom Reed, Tuffy Stone, Myron Mixon,
 * Le Barbecue de Rafa, Pit's BBQ (Xavier Pincemin)
 */

export const RUB_SUGGESTIONS = {
  brisket: [
    {
      name: 'Dalmatien (Aaron Franklin)',
      origin: 'Franklin Barbecue, Austin TX',
      ingredients: 'Sel + poivre noir concassé, parts égales',
      tip: 'Le rub le plus simple et le plus respecté. Laisse le bœuf parler. ~60g de chaque pour un 5kg.',
      badge: 'Classique',
    },
    {
      name: 'Texas Bold',
      origin: 'Inspiré Harry Soo',
      ingredients: 'Sel, poivre noir, ail en poudre, oignon en poudre, piment de Cayenne',
      tip: 'Un cran au-dessus du dalmatien. L\'ail et l\'oignon renforcent la bark.',
      badge: 'Pitmaster',
    },
  ],
  pulled_pork: [
    {
      name: 'Sweet Smoke (Malcom Reed)',
      origin: 'HowToBBQRight',
      ingredients: 'Paprika fumé, cassonade, sel, poivre, ail, oignon, cumin, moutarde en poudre',
      tip: 'La cassonade caramélise et forme une bark sombre et sucrée-salée. Badigeonner de moutarde jaune avant d\'appliquer.',
      badge: 'Classique',
    },
    {
      name: 'Le Rafa (style français)',
      origin: 'Le Barbecue de Rafa',
      ingredients: 'Paprika doux, sel, poivre, herbes de Provence, miel en finition',
      tip: 'Version française plus subtile. Les herbes de Provence apportent une touche méditerranéenne unique.',
      badge: 'FR',
    },
  ],
  beef_short_ribs: [
    {
      name: 'Dalmatien (Aaron Franklin)',
      origin: 'Franklin Barbecue, Austin TX',
      ingredients: 'Sel + poivre noir concassé, parts égales',
      tip: 'Comme pour le brisket — le bœuf de qualité n\'a besoin de rien d\'autre.',
      badge: 'Classique',
    },
    {
      name: 'Coffee Rub',
      origin: 'Inspiré Tuffy Stone',
      ingredients: 'Café moulu fin, poivre noir, sel, cacao en poudre, paprika fumé',
      tip: 'Le café crée une bark sombre et profonde. Aucun goût de café dans le résultat, juste de l\'umami.',
      badge: 'Audacieux',
    },
  ],
  spare_ribs: [
    {
      name: 'Memphis Dry Rub',
      origin: 'Tradition Memphis',
      ingredients: 'Paprika, cassonade, sel, poivre, ail, oignon, cumin, piment de Cayenne',
      tip: 'Le rub classique des compétitions Memphis. Appliquer généreusement la veille.',
      badge: 'Classique',
    },
    {
      name: 'Kansas City Sweet',
      origin: 'Inspiré Myron Mixon',
      ingredients: 'Paprika, cassonade, moutarde en poudre, ail, oignon, cumin, poivre, cannelle',
      tip: 'Plus sucré que Memphis. Parfait avec un glaze BBQ en fin de cuisson.',
      badge: 'Compétition',
    },
  ],
  baby_back_ribs: [
    {
      name: 'Memphis Dry Rub',
      origin: 'Tradition Memphis',
      ingredients: 'Paprika, cassonade, sel, poivre, ail, oignon, cumin, piment de Cayenne',
      tip: 'Même base que les spare ribs. Les baby back étant plus tendres, réduire légèrement le sel.',
      badge: 'Classique',
    },
    {
      name: 'Honey Garlic',
      origin: 'Inspiré Malcom Reed',
      ingredients: 'Ail en poudre, paprika doux, sel, poivre, miel en finition',
      tip: 'Badigeonner de miel 30 min avant la fin pour un glacé doré. Simple et efficace.',
      badge: 'Facile',
    },
  ],
  chuck_roast: [
    {
      name: 'Dalmatien renforcé',
      origin: 'Inspiré Aaron Franklin',
      ingredients: 'Sel, poivre noir, ail en poudre',
      tip: 'Le paleron est une pièce persillée — l\'ail en poudre sublime le gras fondu.',
      badge: 'Classique',
    },
    {
      name: 'Chili Rub',
      origin: 'Style Tex-Mex',
      ingredients: 'Piment ancho, cumin, ail, oignon, paprika fumé, sel, poivre, origan',
      tip: 'Parfait si tu veux effilocher le paleron façon tacos. L\'ancho apporte un côté fruité sans trop de piquant.',
      badge: 'Audacieux',
    },
  ],
  whole_chicken: [
    {
      name: 'Poulet fumé classique',
      origin: 'Weber Academy',
      ingredients: 'Paprika, sel, poivre, ail, oignon, thym séché, un filet d\'huile d\'olive',
      tip: 'Glisser du beurre aux herbes sous la peau pour un résultat juteux. Poulet fermier Label Rouge obligatoire.',
      badge: 'Classique',
    },
    {
      name: 'Cajun',
      origin: 'Louisiane',
      ingredients: 'Paprika, ail, oignon, thym, origan, cayenne, sel, poivre blanc',
      tip: 'Plus relevé. Le poivre blanc fait la différence — il pique sans dominer.',
      badge: 'Épicé',
    },
  ],
  prime_rib: [
    {
      name: 'Sel + herbes (Rafa style)',
      origin: 'Le Barbecue de Rafa',
      ingredients: 'Gros sel, poivre concassé, romarin frais, ail frais haché, huile d\'olive',
      tip: 'Appliquer 12h avant et laisser au frigo à découvert. La surface sèche = meilleure croûte.',
      badge: 'Classique',
    },
    {
      name: 'Au Roquefort (finition)',
      origin: 'Tradition française',
      ingredients: 'Sel, poivre pour la cuisson. Beurre + Roquefort fondu en finition',
      tip: 'Après la saisie inversée, napper d\'un beurre au Roquefort. Accord bœuf + fromage puissant.',
      badge: 'FR',
    },
  ],
  tomahawk: [
    {
      name: 'Dalmatien (Aaron Franklin)',
      origin: 'La référence pour le bœuf',
      ingredients: 'Sel + poivre noir concassé, parts égales',
      tip: 'Sur une pièce de cette qualité, la simplicité est reine. Saler 1h avant minimum.',
      badge: 'Classique',
    },
    {
      name: 'Beurre noisette & ail',
      origin: 'Finition Pitmaster',
      ingredients: 'Sel, poivre pour la cuisson. Beurre noisette, ail, thym et romarin pour arroser',
      tip: 'Pendant la saisie finale, arroser à la cuillère avec un beurre noisette + ail écrasé + herbes fraîches.',
      badge: 'Premium',
    },
  ],
}
