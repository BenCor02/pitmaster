-- ============================================================
-- CHARBON & FLAMME v2 — Guides SEO complets (adapté France)
-- Migration 005 : Guides pour chaque viande + techniques BBQ
-- Vocabulaire validé : sources Le Barbecue de Rafa, French Smoker,
-- BBQ Way of Life, Pit's BBQ (Xavier Pincemin)
-- À exécuter APRÈS 003_cms.sql et 004_cms_seed.sql
-- ============================================================

insert into public.guides (title, slug, summary, content, cover_url, category, tags, meat_type, seo_title, seo_description, sort_order, status) values

-- ══════════════════════════════════════════════════════════
-- PULLED PORK
-- ══════════════════════════════════════════════════════════
('Réussir son pulled pork au fumoir', 'guide-pulled-pork',
'Le guide complet pour un effiloché de porc fondant : quelle pièce demander au boucher, assaisonnement, gestion du stall et effilochage parfait.',
'## Quelle pièce choisir ?

Aux États-Unis, le pulled pork se fait avec le « Boston Butt ». En France, plusieurs pièces conviennent parfaitement — et elles sont toutes faciles à trouver chez votre boucher.

### L''échine de porc (le choix n°1)
C''est la pièce la plus recommandée par la communauté BBQ française (Le Barbecue de Rafa, French Smoker). L''**échine** offre un équilibre parfait entre viande et gras, ce qui garantit un résultat juteux et fondant. Demandez une échine **entière de 2,5 à 4 kg**, avec ou sans os.

### La palette de porc
Un peu plus maigre que l''échine, la **palette** fonctionne très bien. Elle a une texture légèrement différente mais s''effiloche tout aussi facilement. Idéale si votre boucher n''a pas d''échine assez grosse.

### L''épaule de porc entière
L''**épaule entière** (échine + palette ensemble) est le format le plus proche du Boston Butt américain. C''est le choix idéal pour les grandes tablées (5 à 7 kg). Demandez au boucher de la laisser entière avec le gras.

### Ce qu''il faut éviter
- Le filet mignon : beaucoup trop maigre, il sèchera
- Le jambon (cuisse) : trop dense, il ne s''effiloche pas bien
- Le rôti de porc déjà ficelé et paré : pas assez de gras

### Où acheter ?
- Votre **boucher de quartier** : expliquez que c''est pour une cuisson lente de 12h, il saura vous conseiller
- **Maison Lascours** : propose de l''échine calibrée pour le pulled pork
- **Pourdebon** : livraison de viande artisanale partout en France

## L''assaisonnement (rub)

L''épaule de porc supporte des mélanges d''épices plus riches que le bœuf. Une base classique :
- 4 cuillères à soupe de paprika fumé (rayon épices ou en ligne)
- 2 cuillères à soupe de cassonade
- 2 cuillères à soupe de gros sel
- 1 cuillère à soupe de poivre noir moulu
- 1 cuillère à soupe de poudre d''ail
- 1 cuillère à soupe de poudre d''oignon
- 1 cuillère à café de piment de Cayenne (optionnel)

Appliquez généreusement la veille et laissez reposer au frigo une nuit. Le lendemain, sortez la viande **1 heure avant** de la mettre au fumoir.

## La cuisson

### Température du fumoir
- **107°C (225°F)** pour un maximum de saveur fumée
- **121°C (250°F)** pour un bon compromis durée/saveur
- Bois de pommier ou de cerisier — très faciles à trouver en France en morceaux (chunks)

### Le stall (plateau thermique)
Le stall arrive entre **63°C et 74°C** à cœur. Sur une échine, il peut durer 3 à 4 heures. Deux approches :
1. **Sans emballage** : plus de croûte, plus de fumée, mais 2–3 heures de plus
2. **Avec emballage** : papier kraft alimentaire à 74°C à cœur avec un filet de jus de pomme

### Quand c''est prêt
Température cible : **93–96°C** à cœur. L''os (s''il y en a un) doit tourner librement dans la viande. La sonde doit entrer comme dans du beurre.

## L''effilochage

Laissez reposer **30 à 60 minutes** minimum. Effilochez avec des griffes à viande ou deux fourchettes. Retirez les gros morceaux de gras. Mélangez les morceaux du dessus (plus fumés) avec ceux de l''intérieur (plus juteux).

### Idées de service
- En sandwich dans un pain brioché avec un coleslaw maison
- Sur des pommes de terre grenaille rôties
- En tacos avec un guacamole
- Dans une galette de sarrasin (touche bretonne)

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Pièce | Échine, palette ou épaule entière |
| Température fumoir | 107–121°C |
| Température cible | 93–96°C à cœur |
| Emballage | 74°C (optionnel) |
| Repos | 30–60 min minimum |
| Durée totale | 10–14h selon poids |',
'https://images.pexels.com/photos/1212277/pexels-photo-1212277.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{pulled_pork,echine,palette,epaule,low_and_slow,stall,effilochage}', 'pulled_pork',
'Guide pulled pork au fumoir — Échine ou épaule de porc — Charbon & Flamme',
'Comment réussir un pulled pork au fumoir : échine, palette ou épaule entière. Le guide complet adapté aux bouchers français.',
3, 'published'),

-- ══════════════════════════════════════════════════════════
-- BEEF SHORT RIBS (PLAT DE CÔTES)
-- ══════════════════════════════════════════════════════════
('Plat de côtes de bœuf au fumoir : le guide ultime', 'guide-beef-short-ribs',
'Le plat de côtes de bœuf (beef ribs) est une pièce spectaculaire au fumoir, qui rivalise avec le brisket en saveur.',
'## Pourquoi le plat de côtes ?

Le **plat de côtes de bœuf** (beef short ribs) est peut-être la pièce la plus sous-estimée du barbecue. Chaque côte est un concentré de gras intramusculaire et de saveur intense.

### Que demander au boucher ?
En France, demandez un **plat de côtes de bœuf** taillé avec **8 à 12 cm de viande par côte**. C''est une coupe que les bouchers français connaissent bien, contrairement au brisket. Précisez que c''est pour une cuisson lente au fumoir et que vous voulez les côtes individuelles, pas un morceau plat.

Si votre boucher n''a pas l''habitude de tailler si épais, montrez-lui une photo de « beef short ribs » ou commandez chez un boucher en ligne (Le Goût du Bœuf, Pourdebon).

### Quelle race ?
Le persillage est essentiel :
- **Angus** : le plus adapté au fumage, bon persillage
- **Aubrac** ou **Salers** : races françaises avec un excellent goût
- Évitez les races très maigres comme la Blonde d''Aquitaine pour cette pièce

## Assaisonnement

Le **dalmatien** (sel + poivre à parts égales, grossièrement moulu) est parfait. Le gras abondant du plat de côtes porte la saveur. Pas besoin de compliquer.

## La cuisson

### Méthode
- Fumoir à **121°C (250°F)**
- Bois de chêne, hêtre ou un mélange hêtre/cerisier
- Placez les côtes **os vers le bas**, gras vers le haut

### Le stall
Le stall arrive entre **65°C et 77°C** à cœur. L''emballage est optionnel — beaucoup de passionnés (Le Barbecue de Rafa inclus) les cuisent **sans emballage** de bout en bout pour une croûte maximale.

### Température cible
- **96–98°C** à cœur pour un résultat fondant
- La sonde doit entrer sans résistance
- L''os doit commencer à se déchausser

## Repos et service

Reposez **30 à 45 minutes** sous aluminium lâche. Servez avec l''os — c''est la présentation qui fait des beef ribs un plat d''exception.

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Pièce | Plat de côtes de bœuf (8–12 cm par côte) |
| Température fumoir | 121°C (250°F) |
| Température cible | 96–98°C à cœur |
| Emballage | optionnel à 74°C |
| Repos | 30–45 min |
| Durée totale | 6–10h selon taille |',
'https://images.pexels.com/photos/8250702/pexels-photo-8250702.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{beef_short_ribs,plat_de_cotes,beef_ribs,low_and_slow,boeuf}', 'beef_short_ribs',
'Guide plat de côtes de bœuf (beef ribs) au fumoir — Charbon & Flamme',
'Comment fumer un plat de côtes de bœuf (beef ribs) au barbecue : découpe, assaisonnement et cuisson lente.',
4, 'published'),

-- ══════════════════════════════════════════════════════════
-- SPARE RIBS
-- ══════════════════════════════════════════════════════════
('Spare ribs au fumoir : la méthode 3-2-1', 'guide-spare-ribs',
'La technique 3-2-1 pour des spare ribs parfaitement tendres avec une croûte croustillante.',
'## Les spare ribs, c''est quoi ?

Les **spare ribs** sont les côtes prélevées sur le flanc du cochon. C''est le format le plus populaire en compétition BBQ. Plus grandes et plus grasses que les baby back ribs, elles développent une saveur incroyable au fumoir.

### Que demander au boucher ?
En France, les spare ribs se trouvent de plus en plus facilement :
- Demandez un **rack de spare ribs entier** (pas de côtes individuelles découpées)
- Précisez que c''est pour le fumoir et que vous voulez le rack **non tranché**
- La coupe **Saint-Louis** (le cartilage du bout est retiré) donne un rack rectangulaire plus régulier
- Comptez **1 rack pour 2 personnes** (ou un rack par personne pour les gros mangeurs)
- **Attention** : ne confondez pas avec les « travers de porc » en boucherie française traditionnelle, qui sont souvent une coupe différente plus épaisse et plus grasse. Précisez bien « spare ribs pour barbecue ».

### Préparation
1. **Retirez la membrane** : retournez le rack, glissez un couteau sous la membrane blanche côté os, attrapez-la avec un essuie-tout et tirez d''un coup sec
2. **Parage** : retirez l''excès de gras et le cartilage dur
3. **Moutarde + rub** : une fine couche de moutarde de Dijon sert de liant pour les épices (elle disparaît à la cuisson)

## La méthode 3-2-1

C''est la méthode la plus fiable pour les débutants :

### Phase 1 — Fumage (3 heures)
- Fumoir à **121°C (250°F)**
- Ribs directement sur la grille, **os vers le bas**
- Bois de pommier, cerisier ou hêtre
- La croûte (bark) se forme pendant cette phase

### Phase 2 — Emballage (2 heures)
- Emballez dans de l''aluminium avec un filet de jus de pomme, miel ou beurre
- Toujours à 121°C
- C''est ici que le collagène fond et que la viande devient tendre

### Phase 3 — Glaçage (1 heure)
- Déballez, badigeonnez de sauce barbecue
- Remettez sur la grille pour caraméliser
- La sauce va devenir collante et brillante

## Le test de cuisson

**Test de flexion** : soulevez le rack par le milieu avec des pinces. Il doit plier nettement et la viande doit se fissurer en surface. Si le rack se casse en deux, c''est trop cuit.

**Test de torsion** : attrapez un os et tournez-le. Il doit tourner facilement mais pas encore sortir.

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Pièce | Rack de spare ribs entier |
| Température fumoir | 121°C (250°F) |
| Méthode | 3-2-1 |
| Test | Flexion + torsion |
| Durée totale | 6 heures |',
'https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{spare_ribs,3-2-1,ribs,low_and_slow,porc}', 'spare_ribs',
'Guide spare ribs au fumoir (méthode 3-2-1) — Charbon & Flamme',
'Comment réussir des spare ribs au fumoir avec la méthode 3-2-1 : préparation, fumage, emballage et glaçage.',
5, 'published'),

-- ══════════════════════════════════════════════════════════
-- BABY BACK RIBS
-- ══════════════════════════════════════════════════════════
('Baby back ribs au fumoir : plus rapides, tout aussi savoureuses', 'guide-baby-back-ribs',
'Les baby back ribs (côtes du dos) sont plus petites et plus tendres que les spare ribs. La méthode 2-2-1 les rend parfaites.',
'## Baby back ribs vs spare ribs

Les **baby back ribs** (aussi appelées loin ribs) sont prélevées en haut du dos du cochon, près de la colonne vertébrale. Elles sont plus courtes, plus courbées et plus maigres que les spare ribs.

### Où les trouver en France ?
- Chez votre **boucher** : demandez les côtes du dos du porc, ou directement « baby back ribs ». Le terme commence à être connu.
- En **boucherie en ligne** : Maison Lascours, Le Goût du Bœuf, ou des sites spécialisés BBQ
- En **grande surface** : certaines enseignes les proposent sous le nom « baby back ribs » ou « côtes de dos » au rayon boucherie, surtout en été

### Avantages
- Cuisson plus rapide (5h au lieu de 6h)
- Plus tendres naturellement
- Portion individuelle plus facile à gérer

### Inconvénient
- Moins de viande par rack
- Moins de gras = moins de marge d''erreur

## Préparation

Identique aux spare ribs :
1. Retirer la membrane dorsale
2. Appliquer les épices (les baby back supportent bien les rubs sucrés)
3. Laisser reposer 1h à température ambiante

## La méthode 2-2-1

Adaptée du 3-2-1 pour les baby back plus fines :

### Phase 1 — Fumage (2 heures)
- Fumoir à **121°C (250°F)**
- Bois de pommier ou cerisier (saveur douce)
- Os vers le bas

### Phase 2 — Emballage (2 heures)
- Aluminium avec un mélange beurre + miel + cassonade
- La viande va devenir très tendre

### Phase 3 — Glaçage (1 heure)
- Déballez et badigeonnez de sauce
- Laissez caraméliser

## Erreurs courantes

- **Trop de fumée** : les baby back sont fines, un excès de fumée les rend amères. Utilisez des bois légers (pommier, cerisier).
- **Surcuisson** : la viande ne doit PAS tomber de l''os (c''est un signe de surcuisson). Elle doit se détacher avec une légère traction.
- **Fumoir trop chaud** : restez à 121°C max.

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Pièce | Rack de baby back ribs |
| Température fumoir | 121°C (250°F) |
| Méthode | 2-2-1 |
| Test | Test de flexion |
| Durée totale | 5 heures |',
'https://images.pexels.com/photos/7613432/pexels-photo-7613432.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{baby_back_ribs,loin_ribs,2-2-1,low_and_slow,porc}', 'baby_back_ribs',
'Guide baby back ribs au fumoir (méthode 2-2-1) — Charbon & Flamme',
'Baby back ribs au fumoir : méthode 2-2-1, préparation, rub et glaçage. Le guide pour des ribs tendres.',
6, 'published'),

-- ══════════════════════════════════════════════════════════
-- CHUCK ROAST (PALERON)
-- ══════════════════════════════════════════════════════════
('Paleron au fumoir : le brisket du malin', 'guide-chuck-roast',
'Le paleron est une alternative économique au brisket avec un résultat tout aussi impressionnant. Disponible chez tous les bouchers.',
'## Pourquoi le paleron ?

Le **paleron de bœuf** (chuck roast en anglais) est le secret le mieux gardé du BBQ en France. C''est une pièce plus persillée que le brisket, moins chère, plus rapide à cuire et surtout **disponible chez tous les bouchers français sans commande spéciale**.

### Avantages vs brisket
- **2 à 3 fois moins cher** au kilo
- Cuisson en **4 à 6 heures** au lieu de 8 à 14
- Plus tolérant aux erreurs de température
- Disponible **partout** : boucher, supermarché, marché
- C''est la même pièce utilisée pour le bœuf bourguignon — votre boucher la connaît par cœur

### Que demander au boucher ?
- Un **paleron de bœuf entier** de 1,5 à 3 kg
- Demandez-lui de laisser le gras
- Pas besoin de commande spéciale, c''est une pièce standard en boucherie française

## Assaisonnement

Le dalmatien (sel + poivre) fonctionne, mais le paleron supporte aussi des rubs plus complexes : paprika fumé, ail en poudre, cassonade.

## La cuisson

### Température
- Fumoir à **121°C (250°F)**
- Bois de chêne ou hêtre (les bois les plus courants en France, parfaits pour le bœuf)

### Sans emballage
Le paleron a assez de gras pour tenir sans emballage. La croûte sera spectaculaire. Comptez **5 à 6 heures**.

### Avec emballage
Pour accélérer ou si la pièce est maigre, emballez à **74°C** à cœur dans du papier kraft alimentaire. Comptez **4 à 5 heures** au total.

### Température cible
- **96°C** à cœur pour un paleron effiloché (pulled beef)
- **93°C** pour un paleron tranché

## Service

Le paleron fumé se prête à deux présentations :
- **Tranché** : comme un brisket, en tranches épaisses contre le grain
- **Effiloché** : en pulled beef pour des sandwichs

C''est la pièce parfaite pour **débuter le BBQ bœuf** avant de se lancer sur un brisket entier.

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Pièce | Paleron de bœuf (1,5–3 kg) |
| Température fumoir | 121°C (250°F) |
| Température cible | 93–96°C à cœur |
| Emballage | optionnel à 74°C |
| Repos | 20–30 min |
| Durée totale | 4–6h selon poids |',
'https://images.pexels.com/photos/4765772/pexels-photo-4765772.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{chuck_roast,paleron,pulled_beef,low_and_slow,boeuf,debutant}', 'chuck_roast',
'Guide paleron de bœuf au fumoir — Charbon & Flamme',
'Comment fumer un paleron de bœuf : le brisket du malin disponible chez tous les bouchers français. Guide complet.',
7, 'published'),

-- ══════════════════════════════════════════════════════════
-- POULET ENTIER
-- ══════════════════════════════════════════════════════════
('Poulet entier au fumoir : peau croustillante, chair juteuse', 'guide-poulet-entier',
'Fumer un poulet entier demande une approche différente du low & slow classique. Plus chaud, plus rapide, et une peau qui craque.',
'## Le défi du poulet fumé

Le poulet au fumoir pose un défi unique : comment obtenir une **peau croustillante** avec une cuisson basse température ? La réponse : on fume **plus chaud** que le bœuf.

En dessous de 130°C, la graisse sous-cutanée du poulet ne rend pas assez et la peau reste **molle et caoutchouteuse**. C''est l''erreur numéro 1 des débutants.

### Quel poulet choisir ?
On a la chance en France d''avoir une volaille de qualité exceptionnelle :
- **Label Rouge** : minimum recommandé, élevé en plein air, chair ferme
- **Fermier** (Bresse, Loué, Gers, Challans, Landes) : le top — peau épaisse, chair dense, goût incomparable
- Poids idéal : **1,5 à 2,5 kg**
- Un bon poulet fermier fera une différence énorme au fumoir — la qualité de la viande se sent vraiment

## Préparation

### La technique du papillon (spatchcock)
Retirez la colonne vertébrale avec des ciseaux de cuisine et aplatissez le poulet. Avantages :
- Cuisson **30% plus rapide**
- Peau uniformément exposée à la chaleur
- Plus de surface de croûte

### Assaisonnement
1. **Séchez bien** le poulet (essuie-tout partout, dedans et dehors)
2. Appliquez une fine couche d''huile d''olive
3. Rub : paprika fumé, ail en poudre, oignon en poudre, sel, poivre, thym séché ou herbes de Provence
4. Optionnel : laissez sécher au frigo une nuit à découvert (peau encore plus croustillante)

## La cuisson

### Température
- **150–165°C (300–325°F)** — plus chaud que le low & slow classique
- Bois fruitiers : pommier, cerisier, ou **sarments de vigne** (faciles à trouver en France viticole et parfaits pour la volaille)

### Durée
- Poulet entier (1,5–2,5 kg) : **2 à 3 heures**
- En papillon : **1 h 30 à 2 h 30**

### Température cible
- **74°C** dans la cuisse (partie la plus épaisse, sans toucher l''os)
- La poitrine atteindra environ 71°C — c''est parfait

### Astuce peau croustillante
Les 10 dernières minutes, montez à **200°C** ou finissez sous le grill du four pour crisper la peau.

## Repos

5 à 10 minutes maximum. Contrairement au bœuf, le poulet n''a pas besoin d''un long repos. Servez rapidement pour garder la peau croustillante.

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Pièce | Poulet fermier (1,5–2,5 kg) |
| Température fumoir | 150–165°C |
| Température cible | 74°C (cuisse) |
| Format | Papillon recommandé |
| Bois | Pommier, cerisier, vigne |
| Durée totale | 1 h 30 – 3h |',
'https://images.pexels.com/photos/13458086/pexels-photo-13458086.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{whole_chicken,poulet,papillon,volaille,peau_croustillante}', 'whole_chicken',
'Guide poulet entier au fumoir — Charbon & Flamme',
'Comment fumer un poulet entier au barbecue : technique du papillon, bois de vigne et peau croustillante.',
8, 'published'),

-- ══════════════════════════════════════════════════════════
-- PRIME RIB (CÔTE DE BŒUF)
-- ══════════════════════════════════════════════════════════
('Côte de bœuf au fumoir : le rôti de fête ultime', 'guide-prime-rib',
'La côte de bœuf fumée puis saisie — le plat le plus impressionnant que vous puissiez servir.',
'## La pièce royale

Le **train de côtes de bœuf** (prime rib en anglais) est le rôti le plus noble. Fumé au bois puis saisi à haute température, c''est un plat spectaculaire pour les grandes occasions.

### Que demander au boucher ?
La côte de bœuf est une pièce parfaitement connue des bouchers français :
- Demandez un **train de côtes** de 3 à 4 côtes (2,5 à 5 kg) pour 6 à 10 personnes
- Précisez que vous voulez les côtes **côté filet** (plus tendres) plutôt que côté collier
- Demandez au boucher de **parer et ficeler** les os
- Races recommandées : **Charolaise** bien persillée, **Aubrac**, **Salers**, **Angus**

## Assaisonnement

- Gros sel généreux (10g par kg)
- Poivre noir concassé
- Ail en poudre
- Romarin frais haché (optionnel)

Salez la veille et laissez reposer à découvert au frigo.

## La cuisson (saisie inversée)

### Phase 1 — Fumage
- Fumoir à **107°C (225°F)**
- Bois de chêne ou hêtre
- Sonde dans le centre de la viande, loin des os
- Sortez à **6°C avant** votre cible :
  - Saignant : sortir à **46°C**
  - À point rosé : sortir à **48°C** (recommandé)
  - À point : sortir à **54°C**

### Phase 2 — Repos
- 20 à 30 minutes sous aluminium lâche

### Phase 3 — Saisie
- Four à **260°C** ou barbecue au maximum
- 8 à 12 minutes pour une croûte dorée
- Alternative : chalumeau de cuisine

## Découpe

Retirez la ficelle, séparez les os. Tranchez en tranches de **1 à 1,5 cm**. Fleur de sel au service.

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Pièce | Train de côtes (2,5–5 kg) |
| Température fumoir | 107°C (225°F) |
| Cible à point rosé | 54°C à cœur |
| Méthode | Saisie inversée |
| Repos | 20–30 min |
| Durée totale | 3–5h + saisie |',
'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{prime_rib,cote_de_boeuf,saisie_inversee,roti,fete}', 'prime_rib',
'Guide côte de bœuf au fumoir (saisie inversée) — Charbon & Flamme',
'Comment fumer une côte de bœuf (train de côtes) au barbecue avec la saisie inversée.',
9, 'published'),

-- ══════════════════════════════════════════════════════════
-- TOMAHAWK
-- ══════════════════════════════════════════════════════════
('Tomahawk au fumoir : le steak spectaculaire', 'guide-tomahawk',
'Le tomahawk fumé avec saisie inversée — une présentation digne d''un restaurant avec le goût du feu de bois.',
'## Le tomahawk, c''est quoi ?

Le **tomahawk** est une entrecôte géante avec l''os du manche laissé entier (environ 30 cm). C''est un **ribeye avec os** de 800 g à 1,5 kg. L''os ne change pas le goût mais la présentation est spectaculaire.

### Où le trouver en France ?
Le tomahawk se démocratise en France :
- **Boucher artisan** : la plupart des bons bouchers savent le préparer sur commande (2–3 jours à l''avance)
- **Boucheries en ligne** : Pourdebon, Le Goût du Bœuf, Maison Lascours
- **Grandes surfaces** : de plus en plus disponible au rayon boucherie, surtout l''été
- Races : **Angus** pour le persillage, **Aubrac** ou **Salers** pour le goût français

### Choisir son tomahawk
- Épaisseur minimum **5 cm** (essentiel pour la saisie inversée)
- Bon persillage visible
- Sortez-le du frigo **1 heure** avant

## Assaisonnement

Minimaliste : fleur de sel + poivre noir concassé. Le beurre et les herbes viendront à la fin.

## La cuisson (saisie inversée)

### Phase 1 — Fumage indirect
- Fumoir ou barbecue en zone indirecte à **107–120°C**
- Un morceau de chêne ou cerisier pour une fumée légère
- Sonde dans le centre, loin de l''os

### Température de sortie
Retirez **6°C avant** la cible :
- Bleu : sortir à **40°C**
- Saignant : sortir à **46°C**
- À point rosé : sortir à **48°C**
- À point : sortir à **54°C**

### Phase 2 — Saisie
- Barbecue au max, poêle en fonte, ou chalumeau
- **45 à 90 secondes par face**
- La surface DOIT être sèche avant la saisie

### Phase 3 — Finition
- Repos 5 à 8 minutes
- Noisette de beurre + romarin + ail écrasé
- Fleur de sel au service

## Découpe

Détachez la viande de l''os. Tranchez en lamelles de 1 cm contre le grain. Replacez contre l''os pour le dressage.

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Pièce | Tomahawk (800 g – 1,5 kg, ≥5 cm) |
| Température fumoir | 107–120°C |
| Cible à point rosé | 54°C à cœur |
| Saisie | 45–90 sec / face |
| Durée totale | 1 h 30 – 2 h 30 + saisie |',
'https://images.pexels.com/photos/12261087/pexels-photo-12261087.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{tomahawk,steak,saisie_inversee,entrecote,boeuf}', 'tomahawk',
'Guide tomahawk au fumoir (saisie inversée) — Charbon & Flamme',
'Comment fumer et saisir un tomahawk parfait : saisie inversée, températures et finition au beurre.',
10, 'published'),


-- ══════════════════════════════════════════════════════════
-- GUIDES TECHNIQUES TRANSVERSAUX
-- ══════════════════════════════════════════════════════════

-- STALL
('Comprendre et gérer le stall en barbecue', 'guide-stall-bbq',
'Le stall (plateau thermique) est le cauchemar des débutants. Voici la science et les méthodes pour le gérer.',
'## Qu''est-ce que le stall ?

Le **stall** (ou plateau thermique) est ce moment frustrant où la température à cœur de votre viande **cesse de monter** pendant 2 à 4 heures. Il se produit entre **65°C et 77°C** et touche toutes les grosses pièces : brisket, échine de porc, paleron, plat de côtes.

## La science

Le phénomène s''appelle **refroidissement par évaporation**. À 65°C, l''humidité à la surface s''évapore massivement. Cette évaporation refroidit la surface, comme la transpiration refroidit la peau. Le fumoir chauffe, l''évaporation refroidit → la température stagne.

## Les 3 stratégies

### 1. La patience
Laissez passer. Le stall finit toujours quand l''humidité de surface est épuisée. Résultat : la croûte la plus développée.

### 2. L''emballage (Texas Crutch)
Emballez dans du **papier kraft alimentaire** (préserve la croûte) ou de l''**aluminium** (plus rapide mais ramollit la croûte). Emballez vers **68–76°C** à cœur.

### 3. La cuisson hot & fast
Fumez à **135–150°C**. Le stall existe toujours mais dure beaucoup moins longtemps.

## Quelles viandes sont touchées ?

| Viande | Stall typique |
|--------|---------------|
| Brisket (poitrine de bœuf) | 65–77°C, 2–5h |
| Pulled pork (échine/épaule) | 63–74°C, 2–4h |
| Paleron | 65–77°C, 1–3h |
| Plat de côtes (beef ribs) | 65–77°C, 1–3h |
| Poulet | Pas de stall notable |
| Ribs | Stall léger possible |',
'https://images.pexels.com/photos/1927383/pexels-photo-1927383.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'technique', '{stall,plateau_thermique,emballage,texas_crutch,debutant}', null,
'Comprendre le stall (plateau thermique) en BBQ — Charbon & Flamme',
'Le stall expliqué : pourquoi la température stagne, combien de temps ça dure et comment le gérer.',
11, 'published'),

-- WRAP
('Papier kraft vs aluminium : le guide de l''emballage', 'guide-wrap-papier-alu',
'Quand emballer, avec quoi, et pourquoi. Tout ce qu''il faut savoir sur le Texas Crutch.',
'## Pourquoi emballer ?

L''emballage en cours de cuisson (Texas Crutch) a deux objectifs :
1. **Raccourcir le stall** en bloquant l''évaporation
2. **Accélérer la cuisson** de 1 à 3 heures

## Papier kraft vs aluminium

### Papier kraft alimentaire
- La croûte reste **sèche et croustillante**
- C''est le choix d''Aaron Franklin et de la majorité des compétiteurs
- **Où en trouver en France ?** Amazon, sites BBQ spécialisés (Esprit Barbecue), ou en rouleau de papier kraft alimentaire non blanchi en magasin pro (Metro)

### Aluminium
- Cuisson **plus rapide** mais la croûte **ramollit**
- Résultat plus juteux et tendre
- Idéal pour les ribs (méthode 3-2-1) et le pulled pork
- Disponible partout — alu ménager épais

### Pas d''emballage
- La croûte la plus développée
- Parfait pour le plat de côtes et les pièces très persillées

## Quand emballer ?

Emballez quand la **croûte est formée** :
- **Brisket** : 68–74°C à cœur
- **Pulled pork** : 74–76°C à cœur
- **Ribs** : après 3h de fumage (méthode 3-2-1)

## Résumé

| | Papier kraft | Aluminium | Sans emballage |
|---|---|---|---|
| Croûte | Croustillante | Ramollie | Maximale |
| Vitesse | Rapide | Plus rapide | Lent |
| Jutosité | Bonne | Excellente | Variable |
| Idéal pour | Brisket | Ribs, pulled pork | Beef ribs |',
'https://images.pexels.com/photos/5237010/pexels-photo-5237010.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'technique', '{emballage,texas_crutch,papier_kraft,aluminium,croute}', null,
'Papier kraft vs aluminium pour l''emballage au fumoir — Charbon & Flamme',
'Papier kraft ou aluminium ? Quand et comment emballer sa viande au fumoir.',
12, 'published'),

-- GESTION DU FEU
('Maîtriser son feu : la clé d''un bon barbecue', 'guide-gestion-feu',
'Le feu est l''outil principal du pitmaster. Charbon, bois, ventilation — voici comment le dompter.',
'## Le triangle du feu

Trois paramètres contrôlent votre cuisson :
1. **Le combustible** : charbon, bois ou granulés
2. **L''oxygène** : ventilation haute et basse
3. **La chaleur** : température du fumoir

## Les bois de fumage disponibles en France

| Bois | Intensité | Idéal pour | Dispo en France |
|------|-----------|------------|-----------------|
| Pommier | Légère, sucrée | Volaille, porc | Très facile |
| Cerisier | Légère, fruitée | Porc, volaille | Facile |
| Hêtre | Moyenne, douce | Tout | Très facile (bois national) |
| Chêne | Moyenne, polyvalente | Tout | Très facile |
| Sarments de vigne | Moyenne, parfumée | Bœuf, agneau | Facile (régions viticoles) |
| Noyer | Forte | Viandes rouges | Assez facile |
| Hickory | Moyenne, bacon | Porc, bœuf | En ligne uniquement |
| Mesquite | Forte, terreuse | Bœuf texan | En ligne uniquement |

Le **hêtre** et le **chêne** sont les bois les plus accessibles et polyvalents en France. Les **sarments de vigne** sont une spécialité française qui donne un goût unique et raffiné.

## Le charbon

### Briquettes vs charbon naturel
- **Briquettes** : température constante, longue durée, idéal pour les cuissons longues
- **Charbon de bois naturel** : monte plus vite, saveur plus propre, brûle plus vite
- Privilégiez le charbon **français** issu de forêts gérées durablement

## La ventilation

- **Arrivée d''air (bas)** : contrôle principal. Plus ouverte = plus chaud.
- **Cheminée (haut)** : toujours **au moins à moitié ouverte** pour évacuer la fumée âcre

Règle d''or : ajustez par le bas, laissez le haut ouvert.

## La méthode Minion

Pour les fumoirs au charbon (Weber Smokey Mountain, bouilloire) :
1. Remplissez le panier de charbon non allumé
2. Ajoutez 10-15 briquettes allumées sur le dessus
3. Le feu se propage lentement → **8 à 12 heures de cuisson stable**

## Température stable

- Visez **±5°C** autour de votre cible
- Ajustez par **petits incréments**, attendez 15 minutes avant de retoucher
- N''ouvrez le couvercle que si nécessaire (chaque ouverture = 10-15 min de récupération)',
'https://images.pexels.com/photos/69056/pexels-photo-69056.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'technique', '{feu,charbon,bois,ventilation,temperature,minion,fumoir}', null,
'Maîtriser le feu au barbecue — Charbon & Flamme',
'Gérer le feu au fumoir : charbon, bois français, ventilation et méthode Minion.',
13, 'published'),

-- REPOS
('Le repos de la viande : pourquoi c''est non négociable', 'guide-repos-viande',
'Le repos est souvent négligé mais c''est l''étape qui transforme une bonne cuisson en cuisson exceptionnelle.',
'## Pourquoi reposer ?

Pendant la cuisson, les fibres se contractent et poussent les jus vers le centre. Si vous tranchez immédiatement, les jus coulent sur la planche. Le repos permet aux fibres de se détendre et aux jus de se redistribuer.

## Combien de temps ?

| Pièce | Repos minimum | Repos idéal |
|-------|---------------|-------------|
| Entrecôte / tomahawk | 5 min | 8–10 min |
| Côte de bœuf entière | 15 min | 20–30 min |
| Brisket | 60 min | 1–2 heures |
| Pulled pork (échine) | 30 min | 45–60 min |
| Ribs | 10 min | 15 min |
| Poulet | 5 min | 10 min |

## La méthode de la glacière

Pour les grosses pièces (brisket, pulled pork) :
1. Emballez dans du papier kraft
2. Enveloppez dans une serviette éponge
3. Placez dans une glacière **préchauffée** (eau chaude, videz, séchez)
4. Fermez le couvercle

La viande restera à **70°C+** pendant **4 à 6 heures**. N''importe quelle glacière rigide du commerce fonctionne.

## La cuisson résiduelle (carryover)

La température continue à monter pendant le repos :
- Entrecôtes fines : +2°C
- Tomahawk / côte de bœuf : +3 à 5°C
- Brisket / pulled pork : +1 à 2°C',
'https://images.pexels.com/photos/9424951/pexels-photo-9424951.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'technique', '{repos,carryover,glaciere,jus,tendrete}', null,
'Le repos de la viande au barbecue — Charbon & Flamme',
'Pourquoi et comment reposer sa viande : durées, méthode de la glacière et cuisson résiduelle.',
14, 'published'),

-- CHOISIR SON FUMOIR
('Quel fumoir choisir pour débuter ?', 'guide-choisir-fumoir',
'Weber, offset, granulés, kamado — chaque fumoir a ses avantages. Le guide pour choisir en France.',
'## Les types de fumoirs

### Weber Smokey Mountain (fumoir vertical)
Le **meilleur rapport qualité/prix** pour débuter.
- Prix en France : **350–550€** (Jardiland, Leroy Merlin, Weber Store)
- 8+ heures de cuisson stable
- Compact, idéal terrasse ou jardin
- Très bonne communauté francophone (French Smoker, BBQ Way of Life)

### Fumoir offset (horizontal)
Le fumoir traditionnel des pitmasters texans.
- Prix : 500€ à 3 000€+
- Saveur fumée inégalable
- Demande plus d''expérience
- Investissez minimum 800€ pour un modèle qui ne fuit pas

### Weber bouilloire (Kettle)
Le barbecue le plus polyvalent. Grillades, fumage, saisie inversée.
- Prix : **150–400€** (disponible partout en France)
- Méthode du serpent pour la cuisson lente
- Parfait pour débuter sans gros investissement

### Fumoir à granulés (Traeger, Weber SmokeFire)
Le « allumez et oubliez ». Un contrôleur électronique gère la température.
- Prix : **600–2 500€**
- Ultra pratique, température stable
- Saveur fumée moins intense
- Nécessite une prise électrique

### Kamado (Big Green Egg, Kamado Joe, Monolith)
Fumoir céramique polyvalent et performant.
- Prix : **800–3 000€**
- Isolation exceptionnelle, polyvalent (pizza, grillades, fumage)
- Lourd et fragile

## Quel fumoir pour quel profil ?

| Profil | Fumoir recommandé |
|--------|-------------------|
| Débutant absolu | Weber bouilloire |
| Passionné low & slow | Weber Smokey Mountain |
| Confort maximum | Fumoir à granulés |
| Puriste | Offset (budget 1 000€+) |
| Tout terrain | Kamado |

## Où acheter en France ?

- **Weber Store** : boutiques + en ligne, excellent SAV
- **Jardiland, Leroy Merlin, Castorama** : Weber, Char-Broil
- **Esprit Barbecue, Barbecue & Co** : sites spécialisés avec du choix
- **Kamado** : revendeurs agréés Big Green Egg ou Kamado Joe

Le meilleur fumoir est celui que vous **utilisez**. Une bouilloire à 200€ entre de bonnes mains bat un offset à 2 000€ qui reste au garage.',
'https://images.pexels.com/photos/2491272/pexels-photo-2491272.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'equipement', '{fumoir,weber,offset,granules,kamado,bouilloire,debutant}', null,
'Quel fumoir choisir pour débuter en France ? — Charbon & Flamme',
'Comparatif des fumoirs en France : offset, bouilloire, granulés, vertical et kamado.',
15, 'published'),

-- THERMOMÈTRE
('Le thermomètre : l''outil indispensable du pitmaster', 'guide-thermometre',
'Sans thermomètre précis, vous cuisinez à l''aveugle. Voici lesquels choisir et comment les utiliser.',
'## Pourquoi un thermomètre est indispensable

Règle n°1 du barbecue : **c''est la sonde qui décide, pas le chrono**. Deux briskets du même poids peuvent avoir 2 heures d''écart.

## Les deux types essentiels

### 1. Thermomètre instantané (à main)
- **Référence** : ThermoWorks Thermapen ONE (1 sec, ±0,3°C) — en ligne, livré en France
- **Budget** : ThermoPro TP19 (Amazon France, ~15€)

### 2. Thermomètre à sonde fixe
- **Filaire** : ThermoPro TP20 — fiable et abordable (~30€ sur Amazon France)
- **Bluetooth** : MEATER — pratique, sans fil
- **WiFi** : ThermoWorks Signals, FireBoard — le top, surveillance depuis le smartphone

## Où placer la sonde ?

- **Brisket** : partie la plus épaisse du flat, horizontalement
- **Échine / épaule** : au centre, loin de l''os
- **Ribs** : entre deux os, partie la plus charnue
- **Poulet** : dans la cuisse, sans toucher l''os
- **Entrecôte / tomahawk** : par le côté, sonde au centre

Règle : évitez les poches de gras et les os (ils faussent la lecture).

## Le test de la sonde (probe test)

Pour les grosses pièces, la température ne suffit pas. Insérez le thermomètre : il doit entrer **comme dans du beurre mou**. Si vous sentez une résistance, continuez la cuisson.

## Calibration

- **Eau glacée** : doit afficher 0°C
- **Eau bouillante** : doit afficher 100°C',
'https://images.pexels.com/photos/792027/pexels-photo-792027.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'equipement', '{thermometre,sonde,temperature,thermoworks,thermopro}', null,
'Guide thermomètre barbecue — Charbon & Flamme',
'Quel thermomètre BBQ choisir, où placer la sonde et comment faire le test de tendreté.',
16, 'published');
