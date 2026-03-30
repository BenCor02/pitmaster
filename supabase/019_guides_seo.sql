-- ══════════════════════════════════════════════════════════════
-- 019 — Guides SEO : articles UNIQUES (pas de doublon avec 005)
-- Sujets absents de 005 : brisket, agneau, bois, burnt ends,
-- bark, overnight cook, erreurs débutant, hot & fast, sel, sauces
-- ══════════════════════════════════════════════════════════════

INSERT INTO guides (title, slug, summary, content, category, meat_type, tags, seo_title, seo_description, status, sort_order) VALUES

-- ═══════════════════════════════════════════════════════════
-- 1. BRISKET — absent de 005
-- ═══════════════════════════════════════════════════════════

('La poitrine de bœuf (brisket) au fumoir : guide complet', 'guide-brisket-poitrine-boeuf',
 'Tout savoir sur le brisket : quelle pièce chez le boucher français, parer le gras, assaisonner, cuire, trancher.',
 '## La poitrine de bœuf : le morceau roi du BBQ

La **poitrine de bœuf** — le fameux **brisket** — est la pièce maîtresse du barbecue texan. C''est un muscle pectoral situé sous l''épaule (paleron), traversé de collagène qui fond lentement au fumoir pour donner cette texture fondante.

### Comment la demander chez ton boucher

En France, le terme exact varie selon les régions :
- **« Poitrine de bœuf entière »** : c''est le terme le plus courant. Précise que tu veux le morceau **non paré** avec le gras
- **« Flanchet-tendron désossé »** : certains bouchers utilisent ce nom pour la partie basse
- **« Plate de bœuf »** : autre appellation courante dans certaines régions
- Poids idéal : **4 à 7 kg** avec la couche de gras

Si ton boucher ne connaît pas, montre-lui une photo de brisket américain — il comprendra immédiatement.

### Le flat et le point

La poitrine entière se compose de deux muscles superposés séparés par une couche de gras :
- **Le flat (plat)** : partie fine et large. Plus maigre, c''est celle qu''on tranche en belles tranches régulières. Risque de sécher si mal cuite.
- **Le point (pointe)** : partie épaisse et grasse. Plus goûteuse, souvent utilisée pour les burnt ends ou tranchée en morceaux épais.

### Quelle race de bœuf ?

Le persillé (gras dans le muscle) fait toute la différence :
- **Angus** : le meilleur rapport persillé/prix en France. Facile à trouver.
- **Simmental** : excellent persillé, race sous-estimée. Demande à ton boucher.
- **Charolaise** : persillé moyen, goût prononcé. Ça marche, mais injecte pour compenser.
- **Limousine** : très maigre. Possible, mais il faut injecter et surveiller de près.
- **Wagyu** : le rêve absolu. Disponible chez les grossistes spécialisés (~60€/kg).

### Parer le brisket

1. Pose le brisket fat cap (couche de gras) vers le haut
2. Retire le gras dur et jaunâtre qui ne fondra pas
3. Laisse **6 à 8 mm de gras** uniforme sur le dessus
4. Retourne : retire la membrane argentée (silver skin) côté viande
5. Arrondis les coins pour une cuisson plus régulière

### Le fumage

- **Fumoir à 107°C** (225°F) : la méthode traditionnelle texane. 12-16h.
- **Fumoir à 121°C** (250°F) : le compromis moderne. 10-12h.
- **Bois** : chêne (la base), chêne + cerisier, ou hickory pour plus d''intensité
- **Fat cap en haut ou en bas ?** Ça dépend de ton fumoir. Si la chaleur vient d''en bas : gras en bas. Si elle vient d''en haut : gras en haut.

### Le wrap

Quand la bark est formée et que l''interne atteint **68-74°C** :
- **Papier boucher rose** (butcher paper) : laisse la bark croustillante, laisse passer un peu de vapeur. Le choix préféré.
- **Papier alu** : traverse le stall plus vite, mais la bark ramollit.

### Température cible et tranchage

- **93-98°C interne** et la sonde glisse comme dans du beurre
- Repos **2 à 4 heures** en glacière (sans glace) enveloppé de serviettes
- Tranche **contre le grain** (perpendiculaire aux fibres), épaisseur d''un crayon
- Attention : les fibres du flat et du point vont dans des directions différentes

*Utilise le [calculateur](/) avec le profil Brisket pour un timing précis.*',
 'viande', 'brisket',
 '{poitrine-de-boeuf,brisket,fumage,bbq,texas,flat,point,boucher}',
 'Poitrine de bœuf (brisket) au fumoir : guide complet de cuisson',
 'Comment réussir son brisket au fumoir ? Quelle pièce demander au boucher français, parer le gras, température, wrap, repos et tranchage.',
 'published', 20),


-- ═══════════════════════════════════════════════════════════
-- 2. AGNEAU — absent de 005
-- ═══════════════════════════════════════════════════════════

('L''agneau au fumoir : épaule, souris, gigot', 'guide-agneau-fumoir',
 'L''agneau est le grand oublié du BBQ. L''épaule fumée donne un effiloché spectaculaire. Voici comment.',
 '## Pourquoi fumer de l''agneau ?

L''agneau est **quasi absent du BBQ américain** mais c''est une pièce parfaite pour le fumoir. Son collagène fond comme celui du porc, son gras est savoureux, et sa viande absorbe magnifiquement la fumée. En France, on a accès à des agneaux d''exception — c''est un avantage énorme.

### Les morceaux à fumer

#### Épaule d''agneau (le pulled lamb)
- **Poids** : 1,5 à 2,5 kg avec l''os
- **Cuisson** : low & slow à 121°C, cible 93°C interne
- **Temps** : 5 à 7 heures
- **Résultat** : un effiloché d''agneau fondant, à servir en pita ou en tacos

#### Souris d''agneau (jarret arrière)
- **Poids** : 300 à 500 g par souris (1 par personne)
- **Cuisson** : 121°C, cible 93°C
- **Temps** : 4 à 5 heures
- **Résultat** : la viande tombe de l''os. Spectaculaire en présentation.

#### Gigot d''agneau (le reverse sear)
- **Poids** : 1,5 à 2,5 kg
- **Cuisson** : fumage doux à 110°C puis saisie au grill
- **Cible** : 55°C pour rosé, 63°C pour à point
- **Temps** : 2 à 3 heures de fumage
- **Résultat** : tranches roses avec une saveur fumée subtile

#### Collier d''agneau
- Le morceau le plus collagéneux et le moins cher
- Parfait pour un effiloché à petit budget
- 5 à 6 heures à 121°C

### Les agneaux français d''exception

- **Pré-salé** (Mont-Saint-Michel) : élevé sur les prés salés par les marées. Goût unique, légèrement iodé. Rare et cher (~30€/kg).
- **Agneau de Sisteron** (IGP) : doux, tendre, élevé en plein air dans les Alpes de Haute-Provence.
- **Agneau du Quercy** (Label Rouge) : persillé, goûteux, nourri au lait maternel minimum 70 jours.
- **Agneau de lait des Pyrénées** : très jeune (30-45 jours). À fumer très doucement à 100°C.

### Assaisonnement

L''agneau appelle les herbes méditerranéennes :
- **Classique** : herbes de Provence + sel + poivre + ail
- **Oriental** : cumin + coriandre + sumac + za''atar
- **Tandoori** : yaourt + curcuma + garam masala (marinade 12h)

### Le bois pour l''agneau

- **Cerisier** : doux, fruité — le meilleur choix
- **Vigne** : sarments de vigne secs, goût méditerranéen puissant
- **Olivier** : complexe, herbacé. Le luxe absolu.
- Évite le hickory et le mesquite — trop forts pour l''agneau.

### Service

- **Effiloché en pita** : tzatziki, tomates, oignon rouge, menthe fraîche
- **Souris entière** : purée de patate douce, jus de cuisson réduit
- **Gigot tranché** : ratatouille, polenta crémeuse
- **Pulled lamb burger** : focaccia, roquette, feta, confiture de figues

*Configure le [calculateur](/) sur "Épaule d''agneau" pour estimer le temps.*',
 'viande', 'lamb_shoulder',
 '{agneau,épaule-agneau,souris,gigot,fumoir,pulled-lamb,français}',
 'Agneau au fumoir (épaule, souris, gigot) : guide complet en français',
 'Comment réussir l''agneau au fumoir ? Épaule, souris, gigot, collier. Quel agneau français choisir, quel bois, quel assaisonnement. Guide complet.',
 'published', 21),


-- ═══════════════════════════════════════════════════════════
-- 3. BOIS DE FUMAGE — absent de 005
-- ═══════════════════════════════════════════════════════════

('Quel bois de fumage choisir ? Guide par viande', 'guide-bois-fumage-par-viande',
 'Chêne, hickory, cerisier, pommier, vigne, hêtre... Chaque bois donne un goût différent. Le tableau complet.',
 '## Le bois : l''ingrédient invisible du BBQ

Le bois de fumage est au barbecue ce que le cépage est au vin. C''est l''élément qui donne la **saveur fumée**, la **couleur de la viande** et même la **texture de la bark**. Mal choisir son bois peut ruiner 12 heures de cuisson.

### Les règles absolues

1. **Jamais de résineux** (pin, sapin, épicéa, cèdre) : la résine est toxique et donne un goût amer impossible à enlever
2. **Bois sec** : séché 6 à 12 mois minimum. Le bois vert produit une fumée blanche âcre qui donne un goût de cendrier
3. **Pas de bois traité** : palettes, contreplaqué, bois vernis ou peint = toxique
4. **La bonne fumée** : bleue/transparente = bonne. Blanche et épaisse = mauvaise.

### Les essences disponibles en France

#### Chêne — le polyvalent (★★★★★)
Le chêne pédonculé et le chêne sessile sont les plus courants en France. C''est le bois le plus utilisé au monde pour le fumage.
- **Saveur** : fumée ronde, équilibrée, légèrement sucrée
- **Intensité** : moyenne
- **Pour** : brisket, bœuf, porc — tout
- **Où trouver** : partout en France, bûches de chauffage en chêne

#### Hêtre — l''européen (★★★★)
Le bois le plus utilisé en charcuterie européenne. Base du jambon fumé, du saumon fumé scandinave.
- **Saveur** : douce, noisettée, subtile
- **Intensité** : légère
- **Pour** : porc, charcuterie, poisson fumé, volaille
- **Où trouver** : très courant en France

#### Cerisier — le fruité (★★★★★)
Le favori de beaucoup de pitmasters. Donne une couleur acajou magnifique.
- **Saveur** : douce, fruitée, légèrement sucrée
- **Intensité** : légère à moyenne
- **Pour** : ribs, poulet, porc, agneau
- **Où trouver** : vergers, ébénistes, spécialistes BBQ

#### Pommier — le délicat (★★★★)
Le bois le plus doux. Parfait pour les viandes qui n''ont pas besoin d''un goût fumé puissant.
- **Saveur** : très douce, fruitée, presque sucrée
- **Intensité** : légère
- **Pour** : volaille, baby back ribs, poisson
- **Où trouver** : vergers normands, cidreries

#### Hickory — l''américain (★★★★)
LE goût « BBQ classique » américain. Rappelle le bacon fumé.
- **Saveur** : intense, rappelle le bacon et la noisette grillée
- **Intensité** : forte
- **Pour** : pulled pork, spare ribs, épaule — le porc en général
- **Où trouver** : importé. Spécialistes BBQ en ligne (BBQ Land, BBQ Experience)
- **Attention** : trop de hickory = goût amer. Mélange avec du chêne (50/50).

#### Vigne — le méditerranéen (★★★)
Les sarments de vigne sont une spécificité française sous-exploitée en BBQ.
- **Saveur** : terreuse, intense, tannique
- **Intensité** : forte
- **Pour** : agneau, bœuf, saucisses
- **Où trouver** : vignobles, jardineries dans le sud
- **Usage** : en complément d''un bois doux (cerisier + vigne = excellent)

#### Olivier — le luxe (★★★★)
Un bois rare et précieux qui donne un fumage méditerranéen unique.
- **Saveur** : complexe, herbacée, légèrement fruitée
- **Intensité** : moyenne
- **Pour** : agneau, poulet, poisson
- **Où trouver** : Provence, Corse, spécialistes

### Tableau : quel bois pour quelle viande

| Viande | Bois principal | Bois secondaire |
|--------|---------------|-----------------|
| Brisket (poitrine de bœuf) | Chêne | Hickory, noyer |
| Épaule de porc | Cerisier | Hickory, pommier |
| Travers de porc | Cerisier + hickory | Chêne |
| Poulet | Pommier | Cerisier, hêtre |
| Agneau | Cerisier | Vigne, olivier |
| Saumon | Hêtre | Aulne, pommier |
| Charcuterie | Hêtre | Chêne |

### Les formats de bois

- **Bûches (splits)** : pour les offset smokers. Quart de bûche (~10 cm de diamètre)
- **Morceaux (chunks)** : poing fermé. Pour kamado, kettle, WSM. Le format le plus polyvalent.
- **Copeaux (chips)** : petits éclats. Pour smoke box sur BBQ gaz. Brûlent vite.
- **Pellets (granulés)** : bois compressé. Uniquement pour pellet smoker.

*Consulte notre [guide des essences](/bois) pour les fiches détaillées de chaque bois.*',
 'technique', NULL,
 '{bois,fumage,chêne,hickory,cerisier,pommier,hêtre,vigne,olivier}',
 'Quel bois de fumage choisir ? Guide complet par viande (chêne, cerisier, hickory)',
 'Chêne, hickory, cerisier, pommier, hêtre, vigne : quel bois pour quel fumage ? Tableau par viande, où acheter en France, formats. Guide BBQ complet.',
 'published', 22),


-- ═══════════════════════════════════════════════════════════
-- 4. LES BURNT ENDS — absent de 005
-- ═══════════════════════════════════════════════════════════

('Les burnt ends : les bonbons du pitmaster', 'guide-burnt-ends',
 'Des cubes de poitrine de bœuf caramélisés au fumoir. Le snack BBQ le plus addictif qui existe.',
 '## Qu''est-ce que les burnt ends ?

Les **burnt ends** (littéralement « bouts brûlés ») sont des cubes de viande caramélisés issus de la **pointe** (point) de la poitrine de bœuf. À l''origine, c''étaient les morceaux que les pitmasters découpaient et offraient aux clients qui attendaient. Aujourd''hui, c''est devenu un plat culte — certains disent le **meilleur produit du BBQ**.

### L''histoire

Tout commence à **Kansas City** dans les années 70-80, chez Arthur Bryant''s et Gates BBQ. Les pitmasters découpaient les bouts plus cuits et plus gras du brisket et les servaient gratuitement en attendant. Les clients ont commencé à venir uniquement pour ça. Le plat est devenu une spécialité de Kansas City.

### La technique classique (brisket burnt ends)

1. **Fume un brisket entier** normalement jusqu''à 93-96°C interne
2. **Sépare le point du flat** : coupe le long de la couche de gras qui les sépare
3. **Cube le point** en morceaux de 2-3 cm
4. **Assaisonne** : badigeonne de sauce BBQ, ajoute du beurre et de la cassonade
5. **Remets au fumoir** dans une barquette alu à 135°C pendant 1h30-2h
6. **Remue** toutes les 30 min pour que tous les morceaux caramélisent

### La version rapide (pork burnt ends)

Pas de brisket ? Les **burnt ends de poitrine de porc** sont tout aussi bons et beaucoup plus simples :
1. **Achète de la poitrine de porc** (lard frais) chez ton boucher — 1 à 1,5 kg
2. **Cube** en morceaux de 3 cm
3. **Assaisonne** avec un rub de ton choix
4. **Fume à 121°C** pendant 2h (formation de la bark)
5. **Transfère dans une barquette alu** avec beurre (30g), sauce BBQ (60ml), miel (30ml)
6. **Couvre et remets au fumoir** 1h30 à 135°C
7. **Découvre** et remets 30 min pour caraméliser
8. **Résultat** : des cubes fondants et collants de porc laqué fumé

### L''assaisonnement des burnt ends

La sauce de glaçage classique :
- 60 ml de sauce BBQ (style Kansas City, sucrée)
- 30 g de beurre
- 30 g de cassonade ou miel
- 15 ml de sauce piquante (optionnel)

### Service

- **Nature** : dans un bol, avec des cure-dents. Le snack BBQ ultime.
- **Sur du pain blanc** : tradition Kansas City — du pain de mie blanc basique
- **En mac & cheese** : burnt ends mélangés à des macaroni au fromage
- **Sur des frites** : loaded fries avec burnt ends, cheddar fondu et oignons frits

*Configure le [calculateur](/) sur Brisket pour la première phase de cuisson.*',
 'technique', 'brisket',
 '{burnt-ends,poitrine,boeuf,porc,caramélisé,kansas-city,snack}',
 'Burnt ends : recette et technique au fumoir (bœuf et porc)',
 'Comment faire des burnt ends au fumoir ? Cubes de poitrine de bœuf ou de porc caramélisés. Recette classique Kansas City et version rapide au porc.',
 'published', 23),


-- ═══════════════════════════════════════════════════════════
-- 5. LA BARK — absent de 005
-- ═══════════════════════════════════════════════════════════

('La bark : comment obtenir une croûte parfaite au fumoir', 'guide-bark-croute-fumoir',
 'La bark est cette croûte sombre et savoureuse qui se forme sur la viande fumée. Voici comment l''obtenir parfaite.',
 '## La bark : qu''est-ce que c''est ?

La **bark** (écorce) est la **croûte extérieure** qui se forme sur la viande pendant le fumage. C''est un mélange de rub caramélisé, de graisse rendue, de protéines de surface (réaction de Maillard) et de dépôts de fumée. Une bonne bark est **sombre, croustillante et ultra-savoureuse**. C''est souvent la meilleure partie de la viande.

### La science derrière la bark

La bark se forme grâce à trois réactions chimiques simultanées :

1. **Réaction de Maillard** : les protéines de surface réagissent avec les sucres du rub à partir de 110°C. C''est ce qui donne la couleur brune et les arômes complexes.

2. **Caramélisation** : les sucres du rub (cassonade, paprika) caramélisent entre 160-180°C à la surface. C''est ce qui donne le côté croquant et brillant.

3. **Polymérisation de la fumée** : les composés de la fumée (phénols, carbonyls) se déposent sur la surface humide de la viande et forment une couche protectrice.

### Comment obtenir une bark parfaite

#### 1. Le rub fait tout
- **Plus de rub = plus de bark.** N''aie pas peur d''en mettre une couche épaisse.
- Les rubs avec de la **cassonade** donnent une bark plus sombre et caramélisée
- Les rubs avec du **paprika** donnent une bark rouge/noire magnifique
- Le **poivre concassé gros** crée de la texture sur la bark

#### 2. La surface doit être sèche
- Éponge la viande avant d''appliquer le rub
- Laisse le rub « suer » 15-30 min avant d''enfourner
- Ou mieux : applique le rub la veille et laisse au frigo à découvert toute la nuit (la surface sèche)

#### 3. Le flux d''air
- La bark a besoin d''air qui circule autour de la viande
- Ne surcharge pas ton fumoir — laisse de l''espace entre les pièces
- Les fumoirs offset ont le meilleur flux d''air pour la bark

#### 4. La température
- **107-121°C** : bark lente mais profonde (12h+)
- **135°C+** : bark plus rapide mais risque de brûler le sucre du rub

#### 5. Ne spraye pas trop tôt
- Les 2 premières heures : laisse la bark se former sans rien toucher
- Après 2h, un spray léger (vinaigre de cidre / jus de pomme) aide à fixer la fumée
- Trop de spray = bark molle

#### 6. Le wrap au bon moment
- Si tu wrapes trop tôt : la bark n''a pas eu le temps de se former → molle
- Si tu wrapes trop tard : inutile, le stall est presque fini
- **Le bon moment** : quand la bark est **sombre et sèche au toucher** (vers 68-74°C interne)
- **Papier boucher > alu** pour préserver la bark

### Problèmes courants

**Bark molle :** wrap trop tôt, trop de spray, fumoir trop humide (bac à eau trop plein)
**Bark noire (brûlée) :** température trop haute, trop de sucre dans le rub, viande trop près de la source de chaleur
**Pas de bark :** pas assez de rub, pas assez de temps, surface trop humide

*Utilise notre [guide des rubs](/recettes?type=rub) pour trouver le rub qui donnera la bark que tu veux.*',
 'technique', NULL,
 '{bark,croûte,fumoir,rub,maillard,caramélisation,fumée,technique}',
 'La bark au fumoir : comment obtenir une croûte parfaite sur la viande',
 'Qu''est-ce que la bark en BBQ ? Comment obtenir une croûte parfaite au fumoir : rub, température, flux d''air, timing du wrap. Guide technique complet.',
 'published', 24),


-- ═══════════════════════════════════════════════════════════
-- 6. LES TEMPÉRATURES — angle différent de 005 (pas thermomètre, mais zones)
-- ═══════════════════════════════════════════════════════════

('Les températures de cuisson au fumoir : tableau complet par viande', 'guide-temperatures-cuisson-fumoir',
 'Température du fumoir, température cible, zone de danger : tout savoir pour ne jamais rater une cuisson.',
 '## Maîtriser les températures au fumoir

La température est la **variable la plus importante** du fumage. Deux températures à gérer : celle du **fumoir** (chambre de cuisson) et celle de la **viande** (à cœur).

### La zone de danger sanitaire

Les bactéries se multiplient entre **4°C et 60°C**. La viande ne doit pas rester dans cette zone plus de **4 heures cumulées** (sortie du frigo → viande à 60°C interne).

En pratique, avec un fumoir à 107°C+ : la viande met 2-3h pour traverser la zone → tu es dans les clous. Mais si ton fumoir descend sous 90°C, attention.

### Tableau des températures par viande

| Morceau | Fumoir | Cible interne | Résultat |
|---------|--------|--------------|----------|
| Poitrine de bœuf (brisket) | 107-121°C | 93-98°C | Fondant, tranché |
| Épaule de porc | 107-121°C | 93-96°C | Effiloché (pulled) |
| Travers de porc (spare ribs) | 107-121°C | Test de flexion | Tendre, décollé de l''os |
| Baby back ribs | 121-135°C | Test de flexion | Tendre, bouchée nette |
| Côte de bœuf (reverse sear) | 110°C | 49°C (avant saisie) | Rosé uniforme |
| Tomahawk (reverse sear) | 110°C | 49°C (avant saisie) | Rosé uniforme |
| Poulet entier | 135-150°C | 74°C (cuisse) | Peau croustillante |
| Épaule d''agneau (effilochée) | 121°C | 93°C | Fondant, effiloché |
| Gigot d''agneau (tranché rosé) | 110°C | 55-63°C | Rosé à à point |
| Saumon fumé à chaud | 80-90°C | 60°C | Fondant, fumé |
| Saumon fumé à froid | 20-28°C | — | Soyeux, cru fumé |

### Low & slow vs hot & fast

#### Low & slow (107-121°C)
La méthode traditionnelle. Le collagène fond lentement, la fumée pénètre profondément, la bark se développe progressivement.
- **Pour** : brisket, épaule de porc, beef ribs, travers
- **Durée** : 10-16h selon la pièce
- **Bois** : bûches, chunks — pas de chips (brûlent trop vite)

#### Hot & fast (135-165°C)
Plus rapide, bark plus épaisse, mais moins de marge d''erreur. Popularisée par Myron Mixon.
- **Pour** : poulet, baby back ribs, certains pitmasters font le brisket hot & fast
- **Durée** : 4-8h selon la pièce
- **Avantage** : peau de volaille croustillante (impossible en low & slow)

### La cuisson la nuit (overnight cook)

Beaucoup de pitmasters lancent leur cuisson le soir et dorment pendant le fumage :
1. **22h** : allume le fumoir, stabilise à 107°C
2. **23h** : pose la viande, sonde thermomètre en place
3. **7h** : vérifie la température (devrait être vers 65-70°C = stall)
4. **8h** : wrape si nécessaire
5. **12-14h** : la viande atteint la cible

**Indispensable** : un thermomètre à alarme (ThermoPro TP25 ~40€) qui te réveille si la température du fumoir sort de la plage.

*Le [calculateur Charbon & Flamme](/) calcule les temps de cuisson et te donne l''heure de lancement idéale selon l''heure du repas.*',
 'technique', NULL,
 '{température,fumoir,cuisson,low-and-slow,hot-and-fast,zone-de-danger,tableau}',
 'Températures de cuisson au fumoir : tableau complet par viande (brisket, porc, ribs)',
 'Quelle température au fumoir pour chaque viande ? Tableau complet : brisket, épaule de porc, ribs, poulet, agneau, saumon. Low & slow vs hot & fast.',
 'published', 25),


-- ═══════════════════════════════════════════════════════════
-- 7. ERREURS DE DÉBUTANT — absent de 005
-- ═══════════════════════════════════════════════════════════

('Les 10 erreurs de débutant au fumoir (et comment les éviter)', 'erreurs-debutant-fumoir',
 'Température instable, viande sèche, fumée blanche... Les pièges les plus courants quand on débute le fumage.',
 '## Les erreurs qui gâchent tes cuissons

On est tous passés par là. Voici les **10 erreurs les plus fréquentes** chez les débutants au fumoir, et comment les éviter.

### 1. Faire confiance au thermomètre du couvercle

Le thermomètre intégré à ton fumoir mesure la température **en haut**, là où l''air est le plus chaud. Au niveau de la grille, là où ta viande cuit, il peut faire **15 à 30°C de moins**. Achète un thermomètre à double sonde (ThermoPro TP20, ~30€) : une sonde dans la viande, une au niveau de la grille.

### 2. Ouvrir le couvercle trop souvent

Chaque ouverture fait chuter la température de 10-20°C et ajoute 15-30 min à ta cuisson. La règle : **« If you''re lookin'', you ain''t cookin'' »** (si tu regardes, ça cuit pas). Fais confiance à ta sonde thermomètre et ouvre uniquement pour sprayer ou wrapper.

### 3. Trop de fumée

La fumée doit être **bleue ou presque transparente**. Si elle est **blanche et épaisse**, tu brûles ton bois (pas assez d''oxygène) ou ton bois est trop humide. Résultat : un goût amer de cendrier. Ouvre tes entrées d''air, utilise du bois sec, et ne surcharge pas la chambre de combustion.

### 4. Ne pas laisser reposer la viande

Tu as attendu 12 heures. Normal d''avoir envie de trancher direct. Mais **si tu tranches un brisket à la sortie du fumoir**, les jus coulent sur la planche et ta viande est sèche. Le repos redistribue les jus dans toute la pièce. Minimum 1h pour un brisket, 30 min pour une épaule.

### 5. Paniquer pendant le stall

Vers 65-75°C, la température interne arrête de monter. Ça peut durer 2-4 heures. C''est **normal** : c''est l''évaporation de l''eau en surface. Ne monte pas la température de ton fumoir en panique. Soit tu attends, soit tu wrapes (papier boucher rose). Le collagène est en train de fondre — c''est le moment le plus important.

### 6. Viande trop froide au départ

Sortir la viande du frigo et la mettre directement au fumoir ralentit la montée en température et allonge le temps dans la zone de danger (4-60°C). Sors ta viande **1 heure avant** pour qu''elle soit à température ambiante.

### 7. Mauvais bois ou bois humide

Le bois doit être séché **6-12 mois**. Du bois fraîchement coupé (vert) produit une fumée âcre et créosotée qui donne un goût horrible. Et évidemment : **jamais de résineux** (pin, sapin, épicéa), jamais de bois traité, jamais de palettes.

### 8. Trop de rub… ou pas assez

Pas assez de rub = pas de bark, pas de saveur en surface. Trop de rub concentré en sel = viande trop salée. La bonne dose : une couche épaisse et **uniforme** qui couvre toute la surface sans former de tas.

### 9. Ne pas parer le gras

Le gras épais et dur (celui qui est blanc et cireux) **ne fond pas** au fumoir. Si tu ne le retires pas, il reste tel quel et empêche le rub et la fumée d''atteindre la viande. Pare à 6-8 mm de gras mou sur un brisket, retire le gras dur des ribs (et la membrane côté os !).

### 10. Cuire au temps, pas à la température

« Mon voisin a dit que son brisket était prêt en 10h, donc le mien aussi. » **Faux.** Chaque pièce est différente : épaisseur, gras, race, température ambiante... Le **seul indicateur fiable est la température interne** (et le test de la sonde pour le brisket/épaule). Le temps n''est qu''une estimation.

*Le [calculateur Charbon & Flamme](/) te donne une estimation de temps, mais rappelle-toi : la sonde est reine.*',
 'technique', NULL,
 '{erreurs,débutant,fumoir,conseils,température,stall,repos,fumée,bark}',
 'Les 10 erreurs de débutant au fumoir et comment les éviter',
 'Température instable, fumée blanche, viande sèche, oublier le repos : les 10 erreurs les plus fréquentes quand on débute le fumage BBQ. Solutions.',
 'published', 26),


-- ═══════════════════════════════════════════════════════════
-- 8. SAUCES BBQ — absent de 005
-- ═══════════════════════════════════════════════════════════

('Les styles de sauce BBQ : de Kansas City au vinaigre de Caroline', 'guide-sauces-bbq-styles',
 'Kansas City, Carolina, Texas, Alabama white sauce... Chaque région a sa sauce. Voici comment s''y retrouver.',
 '## Les sauces BBQ : une géographie du goût

Aux États-Unis, chaque région a **sa propre tradition de sauce BBQ**. La sauce que tu mets sur tes ribs raconte d''où tu viens — ou du moins, quel style de BBQ tu préfères. Voici les 6 grands styles.

### Kansas City — la sucrée (la plus connue)

C''est la sauce que tu trouves au supermarché. Épaisse, sucrée, à base de tomate.
- **Base** : ketchup ou tomate, cassonade, mélasse
- **Caractère** : sucré, fumé, légèrement épicé
- **Texture** : épaisse, collante
- **Sur quoi** : ribs, pulled pork, burnt ends
- **Marques** : Sweet Baby Ray''s, KC Masterpiece, Bull''s-Eye

### Caroline du Nord — le vinaigre

Le plus ancien style de sauce BBQ américain. Pas de tomate, juste du vinaigre.
- **Base** : vinaigre de cidre, piment, sel, poivre
- **Caractère** : acide, piquant, léger
- **Texture** : liquide comme une vinaigrette
- **Sur quoi** : pulled pork (versée sur le porc effiloché)
- **Pourquoi** : le vinaigre coupe le gras du porc et relance les papilles

### Caroline du Sud — la moutarde

La « Gold sauce ». Unique en son genre.
- **Base** : moutarde jaune, vinaigre, cassonade
- **Caractère** : acidulé, moutardé, légèrement sucré
- **Texture** : moyenne
- **Sur quoi** : pulled pork, saucisses
- **Origine** : influence allemande des colons de Caroline du Sud

### Texas — le jus de viande

Au Texas, la sauce est secondaire. La viande parle d''elle-même. Si sauce il y a, c''est fine et à base de jus de cuisson.
- **Base** : jus de viande, vinaigre, tomate légère, cumin
- **Caractère** : salé, légèrement piquant, peu sucré
- **Texture** : fine
- **Sur quoi** : brisket (en accompagnement, jamais dessus)
- **La règle texane** : si ta viande a besoin de sauce, c''est qu''elle est ratée

### Alabama — la white sauce

La plus surprenante. Une sauce blanche à base de mayonnaise.
- **Base** : mayonnaise, vinaigre de cidre, raifort, poivre
- **Caractère** : crémeux, acidulé, piquant (raifort)
- **Texture** : semi-liquide
- **Sur quoi** : poulet fumé (le poulet est trempé dedans à la sortie du fumoir)
- **Origine** : Big Bob Gibson''s BBQ à Decatur, Alabama (1925)

### Memphis — le sec

À Memphis, beaucoup de restaurants servent les ribs **dry** (sans sauce), avec juste un rub épais.
- **Le style dry** : rub sucré-épicé caramélisé, pas de sauce
- **Le style wet** : sauce tomate fine, appliquée juste à la fin
- **Sur quoi** : ribs exclusivement
- **Le test** : les meilleurs ribs de Memphis n''ont pas besoin de sauce

### Faire ta propre sauce

La recette de base (style Kansas City maison) :
- 200 ml de ketchup
- 60 g de cassonade
- 30 ml de vinaigre de cidre
- 15 ml de Worcestershire
- 10 ml de sauce piquante
- 5 g de paprika fumé, 3 g d''ail en poudre, 3 g d''oignon en poudre
- Sel, poivre

Mélange, chauffe 15 min à feu doux, laisse refroidir. Se conserve 2 semaines au frigo.

*Découvre nos [recettes de glazes et sauces](/recettes) pour les versions détaillées.*',
 'technique', NULL,
 '{sauce-bbq,kansas-city,carolina,texas,alabama,memphis,vinaigre,moutarde}',
 'Les styles de sauce BBQ : Kansas City, Carolina, Texas, Alabama (guide complet)',
 'Sauce BBQ Kansas City, vinaigre Carolina, moutarde, Alabama white sauce, Memphis dry rub : tous les styles de sauce barbecue expliqués. Recettes incluses.',
 'published', 27),


-- ═══════════════════════════════════════════════════════════
-- 9. MÉTHODE 3-2-1 vs 2-2-1 — angle différent de 005
-- (005 couvre la cuisson des ribs, mais pas la comparaison détaillée des méthodes)
-- ═══════════════════════════════════════════════════════════

('Méthode 3-2-1, 2-2-1 ou sans wrap : quelle méthode pour tes ribs ?', 'methode-3-2-1-ribs-comparaison',
 'Trois approches pour les travers de porc au fumoir. Comparaison détaillée avec timing et résultat.',
 '## Les 3 méthodes de cuisson des ribs

Il y a un débat éternel dans la communauté BBQ : faut-il wrapper ses ribs ou pas ? Voici les trois méthodes, leurs résultats, et comment choisir.

### Méthode 3-2-1 (spare ribs avec wrap)

La méthode la plus populaire pour les travers de porc (spare ribs) :

- **3 heures** à découvert au fumoir (107-121°C) → formation de la bark et absorption de la fumée
- **2 heures** enveloppées en papier alu avec du liquide (jus de pomme, beurre, cassonade) → attendrissement
- **1 heure** à découvert avec glaçage (sauce BBQ ou glaze) → caramélisation

**Résultat** : ribs très tendres, viande qui se détache presque de l''os. Bark modérée. C''est la méthode la plus « safe » pour un débutant.

**Le piège** : si tu laisses 2h30 dans l''alu au lieu de 2h, les ribs deviennent trop molles — la viande tombe de l''os (« fall off the bone »). C''est ce que beaucoup de gens aiment, mais en compétition, c''est considéré comme **trop cuit**. L''idéal : la viande se détache d''une bouchée nette en laissant une marque propre sur l''os.

### Méthode 2-2-1 (baby back ribs avec wrap)

Même principe que le 3-2-1, mais pour les côtes de dos (baby back ribs) qui sont plus fines :

- **2 heures** à découvert
- **2 heures** en papier alu
- **1 heure** à découvert avec glaze

**Résultat** : similaire au 3-2-1 mais adapté à une viande plus petite et plus tendre.

### Sans wrap (la méthode compétition)

Beaucoup de pitmasters de compétition ne wrappent jamais leurs ribs :

- **5 à 6 heures** à découvert au fumoir à 121°C
- Spray léger toutes les 45 min (vinaigre de cidre + jus de pomme)
- Glaze dans les 30 dernières minutes

**Résultat** : bark épaisse et croustillante, saveur de fumée maximale, viande qui a plus de « bite » (de mâche). C''est la méthode des puristes.

**L''inconvénient** : plus de risque de sécher si tu ne surveilles pas. Et le timing est moins prévisible.

### Tableau comparatif

| Critère | 3-2-1 | 2-2-1 | Sans wrap |
|---------|-------|-------|-----------|
| Durée totale | 6h | 5h | 5-6h |
| Difficulté | Facile | Facile | Intermédiaire |
| Bark | Modérée | Modérée | Maximale |
| Tendreté | Très tendre | Très tendre | Ferme avec mâche |
| Saveur fumée | Bonne | Bonne | Maximale |
| Style | Comfort food | Comfort food | Compétition |

### Comment choisir

- **Tu débutes** → 3-2-1 pour les spare ribs, 2-2-1 pour les baby back
- **Tu veux de la bark** → sans wrap, spray régulier
- **Tu reçois du monde** → 3-2-1, c''est le plus prévisible
- **Tu prépares une compétition** → sans wrap ou wrap court (3-1-1)

### Le compromis : le wrap court (3-1-1)

Beaucoup de pitmasters expérimentés utilisent un **wrap court** :
- 3 heures à découvert
- 1 heure en papier boucher (pas alu — préserve la bark)
- 1 heure à découvert avec glaze

C''est le meilleur des deux mondes : bark préservée ET viande tendre.

*Utilise le [calculateur](/) avec le profil Spare Ribs ou Baby Back pour estimer le timing exact.*',
 'technique', 'spare_ribs',
 '{ribs,3-2-1,2-2-1,sans-wrap,travers,spare-ribs,baby-back,méthode,comparaison}',
 'Méthode 3-2-1, 2-2-1 ou sans wrap : comparaison pour cuire des ribs au fumoir',
 'Méthode 3-2-1 vs 2-2-1 vs sans wrap pour les ribs au fumoir : comparaison détaillée, timing, résultat. Quelle méthode choisir pour tes travers de porc ?',
 'published', 28),


-- ═══════════════════════════════════════════════════════════
-- 10. LE SEL ET LA SALAISON — absent de 005
-- ═══════════════════════════════════════════════════════════

('Le sel en BBQ : sel casher, saumure, salaison sèche', 'guide-sel-bbq-saumure-salaison',
 'Sel casher, sel de mer, saumure humide, salaison sèche : comprendre le rôle du sel en barbecue.',
 '## Le sel : l''ingrédient le plus important du BBQ

Avant le rub, avant la fumée, avant la sauce : il y a le **sel**. C''est l''ingrédient qui fait la plus grande différence entre un BBQ moyen et un BBQ exceptionnel. Et pourtant, c''est le moins bien compris.

### Quel sel utiliser ?

#### Sel casher (kosher salt) — le choix des pitmasters
- **Pourquoi** : gros cristaux irréguliers qui adhèrent bien à la viande, dissolution lente
- **Le standard** : Morton Coarse Kosher Salt ou Diamond Crystal
- **En France** : difficile à trouver en grande surface. Alternative : **gros sel de Guérande** moulu grossièrement
- **Dosage** : ~15g par kg de viande (environ 1.5% du poids)

#### Sel de mer fin
- Bon pour les rubs mélangés (se répartit uniformément)
- Se dissout plus vite que le sel casher
- Attention au dosage : plus dense que le sel casher → réduire de 30%

#### Fleur de sel
- Trop chère et trop fine pour le rub BBQ
- Parfaite **en finition** : quelques cristaux sur les tranches juste avant de servir

### La saumure humide (brining)

Plonger la viande dans une solution d''eau salée. L''osmose fait pénétrer le sel en profondeur.

**Pour la volaille (poulet entier) :**
- 40g de sel par litre d''eau
- Immerger 4 à 8 heures au réfrigérateur
- Rincer et éponger avant le rub
- Résultat : viande 10-15% plus juteuse, assaisonnée de part en part

**Pour le porc (côtes, épaule) :**
- 50g de sel + 25g de sucre par litre d''eau
- Immerger 8 à 12 heures
- La cassonade dans la saumure aide à la caramélisation au fumoir

### La salaison sèche (dry brining)

Plus simple que la saumure humide et tout aussi efficace. Le sel est appliqué directement sur la viande et le temps fait le travail.

**Technique :**
1. Sale la viande à **1% de son poids** (10g par kg)
2. Place sur une grille dans un plat au réfrigérateur
3. Laisse **12 à 24 heures** à découvert
4. **Ne rince pas** — le sel a été absorbé
5. Applique le rub par-dessus

**Ce qui se passe :**
- Heure 1-2 : le sel tire l''humidité de surface (la viande « transpire »)
- Heure 2-12 : le sel se dissout dans cette humidité et est réabsorbé avec les jus
- Résultat : viande assaisonnée en profondeur + surface sèche = meilleure bark

### Le dry brine est la meilleure technique pour le brisket

Les meilleurs restaurants BBQ (Franklin, Goldee''s) salent leur brisket la veille :
1. Sel casher uniquement (pas de rub complet) : 10-12g par kg
2. Réfrigérateur à découvert sur grille, 12-24h
3. Le lendemain : ajoute le poivre et les autres épices du rub
4. Avantage : le sel a pénétré, mais le poivre reste en surface (pas d''amertume)

### Erreurs courantes avec le sel

- **Pas assez de sel** : la cause n°1 de BBQ fade. N''aie pas peur du sel.
- **Sel appliqué trop tard** : appliquer le sel 10 min avant cuisson ne sert quasi à rien. Il faut minimum 1h, idéalement 12-24h.
- **Double salage** : injection salée + rub salé + saumure = catastrophe. Choisis UNE méthode.
- **Rub commercial trop salé** : beaucoup de rubs du commerce sont 40-50% de sel. Lis les ingrédients.

*Découvre nos [rubs faits maison](/recettes?type=rub) avec les bons dosages de sel.*',
 'technique', NULL,
 '{sel,casher,saumure,salaison-sèche,dry-brine,brisket,assaisonnement}',
 'Le sel en BBQ : sel casher, saumure, salaison sèche (dry brine) — guide complet',
 'Quel sel pour le BBQ ? Sel casher, saumure humide, salaison sèche (dry brine). Dosages par viande, technique pour un brisket parfaitement assaisonné.',
 'published', 29);
