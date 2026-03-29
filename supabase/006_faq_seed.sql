-- ============================================================
-- CHARBON & FLAMME v2 — FAQ complètes (adapté France)
-- Migration 006 : À exécuter APRÈS 003_cms.sql
-- ============================================================

insert into public.faqs (question, answer, meat_type, cooking_method, is_global, sort_order, status) values

-- ══════════════════════════════════════════════════════════
-- BRISKET
-- ══════════════════════════════════════════════════════════

('Combien de temps pour fumer un brisket de 4 kg ?',
'Comptez environ **8 à 12 heures** à 121°C (250°F), repos inclus. La durée varie selon l''épaisseur, la stabilité du fumoir et la durée du stall. Ne vous fiez jamais au chrono — c''est la sonde qui décide.',
'brisket', 'low_and_slow', false, 10, 'published'),

('Quelle température pour un brisket parfait ?',
'Fumoir entre **107°C et 135°C**. La température cible à cœur est **93–98°C**, mais le vrai test est le **test de la sonde** : elle doit entrer comme dans du beurre, sans aucune résistance.',
'brisket', 'low_and_slow', false, 11, 'published'),

('Où acheter un brisket en France ?',
'Le brisket (pointe de poitrine de bœuf) n''est pas une découpe courante en boucherie française. Commandez chez des bouchers en ligne spécialisés : **Pourdebon**, **Le Goût du Bœuf**, **Maison Lascours**, ou **Guarda Pampa**. Certains bouchers artisans le préparent sur commande si vous le demandez 3–4 jours à l''avance.',
'brisket', 'low_and_slow', false, 12, 'published'),

('Mon brisket est sec, qu''est-ce que j''ai fait de mal ?',
'Les causes les plus fréquentes : fumoir **trop chaud** (>135°C), **pas d''emballage** sur une pièce maigre, **repos insuffisant** (<1h), ou le flat était trop fin. Choisissez une pièce bien persillée (Angus de préférence) et ne négligez jamais le repos en glacière.',
'brisket', 'low_and_slow', false, 13, 'published'),

('Faut-il mettre le gras vers le haut ou vers le bas ?',
'Ça dépend de votre fumoir. **Gras vers le bas** si la source de chaleur est en dessous (le gras protège la viande). **Gras vers le haut** si la chaleur vient du côté (le gras fond et arrose). Dans le doute, gras vers le bas.',
'brisket', 'low_and_slow', false, 14, 'published'),

-- ══════════════════════════════════════════════════════════
-- PULLED PORK
-- ══════════════════════════════════════════════════════════

('Quelle pièce pour un pulled pork en France ?',
'L''**échine de porc** est le choix n°1 de la communauté BBQ française (Le Barbecue de Rafa, French Smoker). La **palette** fonctionne aussi, un peu plus maigre. L''**épaule entière** (échine + palette) est idéale pour les grandes tablées. Évitez le filet mignon et le jambon, beaucoup trop maigres.',
'pulled_pork', 'low_and_slow', false, 20, 'published'),

('Combien de temps pour un pulled pork ?',
'Environ **10 à 14 heures** à 121°C (250°F) pour une échine de 3 à 4 kg. C''est une pièce dense avec beaucoup de collagène — il faut du temps pour que tout se transforme en gélatine fondante.',
'pulled_pork', 'low_and_slow', false, 21, 'published'),

('À quelle température effilocher le pulled pork ?',
'Entre **93°C et 96°C** à cœur. L''os (s''il y en a) doit tourner librement. La sonde doit entrer sans résistance. Si vous devez forcer pour effilocher, remettez au fumoir.',
'pulled_pork', 'low_and_slow', false, 22, 'published'),

('Échine ou épaule pour le pulled pork ?',
'L''**échine** est plus persillée et plus facile à trouver chez le boucher. L''**épaule entière** (échine + palette) est plus grosse et donne plus de viande. La **palette** seule est un peu plus maigre mais fonctionne bien. Toutes ces pièces sont disponibles chez n''importe quel boucher en France.',
'pulled_pork', 'low_and_slow', false, 23, 'published'),

('Quel bois utiliser pour le pulled pork ?',
'**Pommier** ou **cerisier** pour une saveur douce et fruitée — très faciles à trouver en morceaux en France. Le **hêtre** donne un goût plus neutre mais très propre. Évitez le mesquite, trop intense pour le porc.',
'pulled_pork', 'low_and_slow', false, 24, 'published'),

-- ══════════════════════════════════════════════════════════
-- BEEF SHORT RIBS (PLAT DE CÔTES)
-- ══════════════════════════════════════════════════════════

('Que demander au boucher pour des beef ribs ?',
'Demandez un **plat de côtes de bœuf** taillé avec **8 à 12 cm de viande par côte**. Précisez que c''est pour une cuisson lente au fumoir. Si votre boucher n''a pas l''habitude de cette coupe épaisse, commandez chez un boucher en ligne (Le Goût du Bœuf, Pourdebon).',
'beef_short_ribs', 'low_and_slow', false, 30, 'published'),

('Combien de temps pour fumer des beef ribs ?',
'Entre **6 et 10 heures** à 121°C (250°F) selon l''épaisseur. La température cible est **96–98°C** à cœur — la sonde doit glisser sans résistance.',
'beef_short_ribs', 'low_and_slow', false, 31, 'published'),

('Faut-il emballer les beef ribs ?',
'C''est optionnel. Beaucoup de pitmasters les cuisent **sans emballage** de bout en bout car elles ont assez de gras pour rester juteuses. Résultat : une croûte spectaculaire. Si vous emballez, faites-le à 74°C à cœur.',
'beef_short_ribs', 'low_and_slow', false, 32, 'published'),

('Les beef ribs sont-elles meilleures que le brisket ?',
'Question de goût ! Les beef ribs ont **plus de gras intramusculaire**, donc un résultat souvent plus juteux et plus tolérant. Elles cuisent aussi plus vite. Et surtout, le plat de côtes est plus facile à trouver chez un boucher français qu''un brisket entier.',
'beef_short_ribs', 'low_and_slow', false, 33, 'published'),

-- ══════════════════════════════════════════════════════════
-- SPARE RIBS
-- ══════════════════════════════════════════════════════════

('Quelle est la différence entre spare ribs et baby back ribs ?',
'Les **spare ribs** viennent du flanc, sont plus grandes, plus grasses et plus savoureuses. Les **baby back ribs** viennent du dos, sont plus courtes, plus tendres et cuisent plus vite. Attention : ne confondez pas avec les « travers de porc » français en boucherie traditionnelle, qui sont souvent une coupe différente.',
'spare_ribs', 'low_and_slow', false, 40, 'published'),

('C''est quoi la méthode 3-2-1 pour les ribs ?',
'**3 heures** de fumage direct, **2 heures** emballées dans l''alu (avec jus de pomme/beurre), **1 heure** déballées avec la sauce pour caraméliser. C''est la méthode la plus fiable. Pour les baby back, utilisez **2-2-1** (elles sont plus fines).',
'spare_ribs', 'low_and_slow', false, 41, 'published'),

('Comment savoir si les ribs sont cuites ?',
'**Test de flexion** : soulevez le rack par le milieu, il doit plier nettement et la viande se fissurer. **Test de torsion** : un os doit tourner facilement mais pas encore sortir. Si le rack se casse en deux, c''est trop cuit.',
'spare_ribs', 'low_and_slow', false, 42, 'published'),

('Faut-il retirer la membrane des ribs ?',
'**Oui, toujours.** La membrane blanche côté os bloque la fumée et reste caoutchouteuse. Glissez un couteau en dessous, attrapez avec un essuie-tout et tirez d''un coup sec.',
'spare_ribs', 'low_and_slow', false, 43, 'published'),

('Où trouver des spare ribs en France ?',
'De plus en plus de bouchers connaissent les spare ribs. Demandez un **rack entier non tranché** pour le barbecue. En grande surface, cherchez au rayon libre-service ou commandez au rayon boucherie. En ligne : Maison Lascours, Pourdebon, sites BBQ spécialisés.',
'spare_ribs', 'low_and_slow', false, 44, 'published'),

-- ══════════════════════════════════════════════════════════
-- BABY BACK RIBS
-- ══════════════════════════════════════════════════════════

('Pourquoi mes baby back sont caoutchouteuses ?',
'Cuisson **trop courte** ou fumoir **pas assez chaud**. Les baby back ont moins de gras que les spare ribs, il faut que le collagène fonde bien. Vérifiez avec le test de flexion.',
'baby_back_ribs', 'low_and_slow', false, 50, 'published'),

('Méthode 3-2-1 ou 2-2-1 pour les baby back ?',
'**2-2-1** pour les baby back. Elles sont plus fines que les spare ribs, la phase initiale de fumage est réduite d''1 heure. Avec la 3-2-1, elles risquent de trop cuire.',
'baby_back_ribs', 'low_and_slow', false, 51, 'published'),

('Quel rub pour les baby back ribs ?',
'Les baby back supportent bien les **rubs sucrés** : paprika fumé + cassonade + sel + poivre + ail en poudre + oignon en poudre. Appliquez après une fine couche de moutarde de Dijon.',
'baby_back_ribs', 'low_and_slow', false, 52, 'published'),

-- ══════════════════════════════════════════════════════════
-- CHUCK ROAST (PALERON)
-- ══════════════════════════════════════════════════════════

('Le paleron, c''est quoi exactement ?',
'Le **paleron** est un morceau de l''épaule de bœuf, très persillé. C''est la pièce du bœuf bourguignon — disponible chez **tous les bouchers français** sans commande spéciale. Au fumoir, il donne un résultat proche du brisket pour 2 à 3 fois moins cher.',
'chuck_roast', 'low_and_slow', false, 60, 'published'),

('Combien de temps pour un paleron au fumoir ?',
'**4 à 6 heures** à 121°C (250°F). C''est bien plus rapide qu''un brisket. Température cible : 93°C pour trancher, 96°C pour effilocher en pulled beef.',
'chuck_roast', 'low_and_slow', false, 61, 'published'),

('Paleron ou brisket : lequel choisir ?',
'Le **paleron** est plus persillé, plus rapide, moins cher et disponible partout en France. Le **brisket** offre une croûte plus développée et un prestige plus grand, mais il faut le commander spécialement. Pour débuter, commencez par le paleron.',
'chuck_roast', 'low_and_slow', false, 62, 'published'),

('Peut-on faire du pulled beef avec un paleron ?',
'**Absolument.** Fumez jusqu''à 96°C à cœur, effilochez comme un pulled pork. Le résultat est spectaculaire en sandwich. C''est même la meilleure utilisation du paleron au fumoir.',
'chuck_roast', 'low_and_slow', false, 63, 'published'),

-- ══════════════════════════════════════════════════════════
-- POULET ENTIER
-- ══════════════════════════════════════════════════════════

('À quelle température fumer un poulet ?',
'**150°C à 165°C** (300–325°F). C''est plus chaud que le low & slow classique. En dessous de 130°C, la peau reste molle et caoutchouteuse.',
'whole_chicken', 'low_and_slow', false, 70, 'published'),

('Comment avoir une peau croustillante au fumoir ?',
'Trois astuces : **séchez bien** le poulet avant cuisson (essuie-tout), fumez à **150°C minimum**, et finissez **10 min à feu vif** (200°C+). Bonus : laissez sécher au frigo une nuit à découvert.',
'whole_chicken', 'low_and_slow', false, 71, 'published'),

('C''est quoi le spatchcock (papillon) ?',
'Retirez la colonne vertébrale du poulet aux ciseaux et aplatissez-le. Résultat : cuisson **30% plus rapide**, peau uniformément croustillante et viande plus juteuse. C''est LA technique pour le fumoir.',
'whole_chicken', 'low_and_slow', false, 72, 'published'),

('Quel poulet choisir pour le fumoir ?',
'Privilégiez un poulet **Label Rouge** minimum, idéalement **fermier** (Bresse, Loué, Gers, Challans). La qualité de la volaille se sent énormément au fumoir. Un bon poulet fermier français est imbattable.',
'whole_chicken', 'low_and_slow', false, 73, 'published'),

('Quel bois pour fumer le poulet ?',
'Des bois **légers** : pommier, cerisier, ou **sarments de vigne** (faciles à trouver en France et parfaits pour la volaille). Le hêtre en petite quantité fonctionne aussi. Évitez le mesquite et le noyer, trop intenses.',
'whole_chicken', 'low_and_slow', false, 74, 'published'),

-- ══════════════════════════════════════════════════════════
-- PRIME RIB (CÔTE DE BŒUF)
-- ══════════════════════════════════════════════════════════

('Combien de côtes commander ?',
'Comptez **1 côte pour 2 personnes**. Donc 3 côtes pour 6 personnes, 4 pour 8. Demandez les côtes **côté filet**, elles sont plus tendres.',
'prime_rib', 'reverse_sear', false, 80, 'published'),

('Saisie inversée ou cuisson directe pour la côte de bœuf ?',
'**Saisie inversée sans hésitation.** Fumage à 107°C puis saisie au four à 260°C. La cuisson est parfaitement uniforme du bord au centre — pas de bande grise de viande trop cuite.',
'prime_rib', 'reverse_sear', false, 81, 'published'),

('Quand saler la côte de bœuf ?',
'**La veille.** Salez généreusement (10g/kg) et laissez à découvert au frigo. Le sel pénètre en profondeur et la surface sèche — meilleure croûte à la saisie.',
'prime_rib', 'reverse_sear', false, 82, 'published'),

('Quelle température cible pour une côte de bœuf à point rosé ?',
'Sortez du fumoir à **48°C** à cœur (6°C avant la cible). Après repos + saisie, vous atteindrez **54°C** = à point rosé parfait, rose uniforme.',
'prime_rib', 'reverse_sear', false, 83, 'published'),

-- ══════════════════════════════════════════════════════════
-- TOMAHAWK
-- ══════════════════════════════════════════════════════════

('Quelle épaisseur pour un tomahawk ?',
'Minimum **5 cm**. En dessous, la pièce est trop fine pour la saisie inversée. Idéal : 6 à 8 cm, soit 800 g à 1,5 kg. Commandez 2–3 jours à l''avance chez votre boucher.',
'tomahawk', 'reverse_sear', false, 90, 'published'),

('Combien de temps pour fumer un tomahawk ?',
'**1 h 30 à 2 h 30** à 107–120°C en zone indirecte. Utilisez une sonde — le chrono est un très mauvais indicateur pour les steaks.',
'tomahawk', 'reverse_sear', false, 91, 'published'),

('Comment saisir un tomahawk sans le surcuire ?',
'Trois clés : surface **parfaitement sèche** (essuie-tout), feu au **maximum absolu** (poêle en fonte, barbecue, chalumeau), et saisie de **45 à 90 secondes par face** seulement.',
'tomahawk', 'reverse_sear', false, 92, 'published'),

('Où trouver un tomahawk en France ?',
'Chez votre **boucher artisan** sur commande (2–3 jours). En ligne : Pourdebon, Le Goût du Bœuf, Maison Lascours. En **grande surface** au rayon boucherie, surtout l''été. Privilégiez l''Angus pour le persillage, ou l''Aubrac/Salers pour le goût.',
'tomahawk', 'reverse_sear', false, 93, 'published'),

-- ══════════════════════════════════════════════════════════
-- FAQ GLOBALES
-- ══════════════════════════════════════════════════════════

('C''est quoi le low & slow ?',
'Le **low & slow** (bas et lent) est une cuisson entre **95°C et 135°C** pendant plusieurs heures. La chaleur basse transforme le collagène (tissu conjonctif dur) en gélatine (fondant et juteux). C''est la base du barbecue américain.',
null, null, true, 100, 'published'),

('Quelle est la différence entre griller et fumer ?',
'**Griller** = chaleur directe, haute température (200°C+), cuisson rapide. **Fumer** = chaleur indirecte, basse température (95–135°C), cuisson lente avec de la fumée de bois. Le fumage ajoute de la saveur et transforme le collagène.',
null, null, true, 101, 'published'),

('Faut-il tremper les copeaux de bois ?',
'**Non.** C''est un mythe. Le trempage retarde simplement le début de la combustion. Utilisez des **morceaux secs** (chunks de 5–8 cm) qui fument lentement et régulièrement.',
null, null, true, 102, 'published'),

('Comment éviter une fumée âcre ?',
'Visez une fumée **bleue fine et presque invisible** (thin blue smoke). La fumée blanche épaisse rend la viande amère. Gardez la **cheminée toujours ouverte** pour évacuer les gaz.',
null, null, true, 103, 'published'),

('Peut-on fumer avec un barbecue bouilloire (kettle) ?',
'**Oui.** La méthode du serpent (briquettes en arc de cercle) permet de maintenir 120°C pendant 6 à 8 heures sur une Weber bouilloire. Placez les briquettes en arc, ajoutez des morceaux de bois, allumez un bout.',
null, null, true, 104, 'published'),

('Faut-il spritzer (vaporiser) la viande ?',
'C''est optionnel. Le spritz (vinaigre de cidre, jus de pomme) aide à garder l''humidité de surface et favorise la croûte. Commencez **après 2 heures** quand la surface est sèche. Attention : chaque ouverture du fumoir coûte 10-15 min de récupération.',
null, null, true, 105, 'published'),

('Combien de bois utiliser ?',
'Moins que vous ne pensez. **2 à 4 morceaux** (de la taille d''un poing) suffisent pour 8–12 heures. La viande absorbe la fumée surtout dans les **3 premières heures**. Après, c''est le charbon qui fait le travail.',
null, null, true, 106, 'published'),

('Quels bois de fumage trouve-t-on facilement en France ?',
'Le **hêtre** et le **chêne** sont les plus courants et polyvalents. Le **pommier** et le **cerisier** sont faciles à trouver aussi. Les **sarments de vigne** sont une spécialité française qui donne un goût raffiné. Le hickory et le mesquite se trouvent en ligne uniquement.',
null, null, true, 107, 'published'),

('Comment calculer les quantités par personne ?',
'Comptez **250 à 350g de viande crue par personne** pour les grosses pièces (ribs, brisket, pulled pork). La viande perd environ **30 à 40%** de son poids à la cuisson.',
null, null, true, 108, 'published'),

('Peut-on fumer de la viande surgelée ?',
'**Non, décongelez toujours avant.** Une viande surgelée reste trop longtemps dans la zone de danger (4–60°C). Décongelez au frigo (24h pour 2 kg) ou sous l''eau froide courante.',
null, null, true, 109, 'published'),

('Où trouver du matériel BBQ en France ?',
'**Weber Store** (boutiques + en ligne), **Esprit Barbecue**, **Barbecue & Co** pour le matériel spécialisé. **Jardiland**, **Leroy Merlin**, **Castorama** pour les barbecues et fumoirs. **Amazon France** pour les thermomètres et accessoires.',
null, null, true, 110, 'published');
