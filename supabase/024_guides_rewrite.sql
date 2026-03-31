-- ══════════════════════════════════════════════════════════════
-- 024 — Réécriture complète des guides
-- Fusion des doublons (005 + 019), coupes françaises, langage FR
-- 20 guides → 15 guides consolidés
-- ══════════════════════════════════════════════════════════════

-- Nettoyage : on supprime tout et on repart propre
DELETE FROM public.guides;

INSERT INTO public.guides (title, slug, summary, content, cover_url, category, tags, meat_type, seo_title, seo_description, sort_order, status) VALUES

-- ═══════════════════════════════════════════════════════════
-- 1. POITRINE DE BŒUF (BRISKET)
-- ═══════════════════════════════════════════════════════════

('La poitrine de bœuf au fumoir', 'guide-poitrine-boeuf-brisket',
'La pièce reine du barbecue. Comment la trouver chez ton boucher, la parer, la fumer et la trancher.',
'## La poitrine de bœuf, c''est quoi ?

La **poitrine de bœuf** est un muscle pectoral situé sous le paleron, traversé de collagène. Au fumoir, ce collagène fond lentement et donne cette texture fondante que tout le monde recherche.

### Comment la demander chez ton boucher

Le vocabulaire change selon les régions :
- **« Poitrine de bœuf entière »** — le terme le plus courant. Précise que tu veux le morceau **non paré** avec le gras
- **« Flanchet-tendron désossé »** — certains bouchers utilisent ce nom pour la partie basse
- **« Plate de bœuf »** — autre appellation courante
- Poids idéal : **4 à 7 kg** avec la couche de gras

Si ton boucher ne connaît pas, montre-lui une photo de brisket américain. Il comprendra immédiatement.

### Le flat et le point

La poitrine entière se compose de deux muscles superposés :
- **Le flat (plat)** : partie fine et large, plus maigre. C''est celle qu''on tranche.
- **Le point (pointe)** : partie épaisse et grasse, plus goûteuse. Sert pour les burnt ends.

### Quelle race ?

Le persillé fait toute la différence :
- **Angus** : meilleur rapport persillé/prix en France
- **Simmental** : excellent persillé, sous-estimée
- **Charolaise** : persillé moyen, goût prononcé
- **Limousine** : très maigre, il faut surveiller de près

### Parer la poitrine

1. Pose la poitrine gras vers le haut
2. Retire le gras dur et jaunâtre qui ne fondra pas
3. Laisse **6 à 8 mm de gras** uniforme sur le dessus
4. Retourne : retire la membrane argentée côté viande
5. Arrondis les coins pour une cuisson régulière

## L''assaisonnement

La base texane fonctionne parfaitement : **sel + poivre** à parts égales, grossièrement moulu. C''est le fameux « dalmatien ». Avec une bonne poitrine persillée, il n''en faut pas plus.

Pour plus de profondeur : ajoute du paprika fumé et de l''ail en poudre.

**Salaison sèche (recommandée)** : sale la veille (10-12 g/kg), laisse au frigo à découvert sur une grille. Le lendemain, ajoute le poivre et les épices.

## Le fumage

- **107°C** : la méthode traditionnelle texane. 12-16h.
- **121°C** : le compromis moderne. 10-12h.
- **Bois** : chêne (la base), chêne + cerisier, ou hêtre

### Le stall

La température interne stagne entre **65°C et 77°C** pendant 2 à 5 heures. C''est l''évaporation de l''eau en surface. Deux choix : attendre (meilleure croûte) ou emballer en papier boucher rose (plus rapide).

### Le wrap

Quand la croûte est sombre, sèche au toucher et que l''interne atteint **68-74°C** :
- **Papier boucher rose** : préserve la croûte. Le choix préféré.
- **Papier alu** : traverse le stall plus vite mais ramollit la croûte.

### Température cible et repos

- **93-98°C** à cœur et la sonde glisse comme dans du beurre
- Repos **1 à 2 heures** en glacière (sans glace), enveloppé de serviettes
- Tranche **contre le grain**, épaisseur d''un crayon
- Les fibres du flat et du point vont dans des directions différentes

| Paramètre | Valeur |
|-----------|--------|
| Pièce | Poitrine de bœuf (4-7 kg) |
| Température fumoir | 107-121°C |
| Température cible | 93-98°C à cœur |
| Emballage | 68-74°C (optionnel) |
| Repos | 1-2 heures |
| Durée totale | 10-16h selon poids et température |

*Utilise le [calculateur](/) avec le profil Brisket pour un timing précis.*',
'https://images.pexels.com/photos/8753690/pexels-photo-8753690.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{poitrine-de-boeuf,brisket,fumage,bbq,texas,flat,point,boucher}', 'brisket',
'Poitrine de bœuf au fumoir : guide complet — Charbon & Flamme',
'Comment réussir sa poitrine de bœuf au fumoir : pièce chez le boucher français, parage, assaisonnement, cuisson, repos et tranchage.',
1, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 2. ÉCHINE DE PORC (PULLED PORK)
-- ═══════════════════════════════════════════════════════════

('L''échine de porc au fumoir (pulled pork)', 'guide-echine-porc-pulled-pork',
'Le guide complet pour un effiloché de porc fondant : quelle pièce chez le boucher, assaisonnement, gestion du stall et effilochage.',
'## Quelle pièce choisir ?

En France, plusieurs pièces conviennent parfaitement pour le pulled pork :

### L''échine de porc (le choix n°1)
C''est la pièce la plus recommandée par la communauté BBQ française. L''**échine** offre un équilibre parfait entre viande et gras. Demande une échine **entière de 2,5 à 4 kg**, avec ou sans os.

### La palette de porc
Un peu plus maigre que l''échine, la **palette** fonctionne très bien. Idéale si ton boucher n''a pas d''échine assez grosse.

### L''épaule entière
L''**épaule entière** (échine + palette ensemble) est le format le plus proche du Boston Butt américain. C''est le choix idéal pour les grandes tablées (5 à 7 kg).

### Ce qu''il faut éviter
- Le filet mignon : trop maigre, il sèchera
- Le jambon (cuisse) : trop dense, il ne s''effiloche pas bien
- Le rôti déjà ficelé et paré : pas assez de gras

## L''assaisonnement

L''épaule de porc supporte des mélanges riches. Une base classique :
- 4 c. à soupe de paprika fumé
- 2 c. à soupe de cassonade
- 2 c. à soupe de gros sel
- 1 c. à soupe de poivre noir moulu
- 1 c. à soupe de poudre d''ail
- 1 c. à soupe de poudre d''oignon
- 1 c. à café de piment de Cayenne (optionnel)

Applique la veille et laisse reposer au frigo. Sors la viande **1 heure avant** le fumoir.

## La cuisson

### Température du fumoir
- **107°C** pour un maximum de saveur fumée
- **121°C** pour un bon compromis durée/saveur
- Bois de pommier ou de cerisier — faciles à trouver en France

### Le stall
Le stall arrive entre **63°C et 74°C** à cœur. Sur une échine, il peut durer 3 à 4 heures. Deux approches :
1. **Sans emballage** : plus de croûte, 2-3 heures de plus
2. **Avec emballage** : papier kraft alimentaire à 74°C avec un filet de jus de pomme

### Température cible
**93-96°C** à cœur. L''os (s''il y en a un) doit tourner librement. La sonde entre comme dans du beurre.

## L''effilochage

Repos **30 à 60 minutes**. Effiloche avec des griffes à viande ou deux fourchettes. Mélange les morceaux du dessus (plus fumés) avec ceux de l''intérieur (plus juteux).

### Idées de service
- En sandwich dans un pain brioché avec un coleslaw maison
- Sur des pommes de terre grenaille rôties
- En tacos avec un guacamole
- Dans une galette de sarrasin

| Paramètre | Valeur |
|-----------|--------|
| Pièce | Échine, palette ou épaule entière |
| Température fumoir | 107-121°C |
| Température cible | 93-96°C à cœur |
| Emballage | 74°C (optionnel) |
| Repos | 30-60 min |
| Durée totale | 10-14h selon poids |

*Utilise le [calculateur](/) avec le profil Pulled Pork pour un timing précis.*',
'https://images.pexels.com/photos/1212277/pexels-photo-1212277.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{pulled-pork,echine,palette,epaule,low-and-slow,stall,effilochage}', 'pulled_pork',
'Échine de porc au fumoir (pulled pork) — Charbon & Flamme',
'Comment réussir un pulled pork au fumoir : échine, palette ou épaule. Guide complet adapté aux bouchers français.',
2, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 3. PLAT DE CÔTES (BEEF SHORT RIBS)
-- ═══════════════════════════════════════════════════════════

('Le plat de côtes de bœuf au fumoir', 'guide-plat-de-cotes-boeuf',
'Le plat de côtes (beef ribs) est une pièce spectaculaire au fumoir, qui rivalise avec la poitrine en saveur.',
'## Pourquoi le plat de côtes ?

Le **plat de côtes de bœuf** est peut-être la pièce la plus sous-estimée du barbecue. Chaque côte est un concentré de gras intramusculaire et de saveur intense.

### Que demander au boucher ?
En France, demande un **plat de côtes de bœuf** taillé avec **8 à 12 cm de viande par côte**. C''est une coupe que les bouchers français connaissent bien. Précise que c''est pour une cuisson lente au fumoir et que tu veux les côtes individuelles, pas un morceau plat.

### Quelle race ?
- **Angus** : le plus adapté au fumage, bon persillage
- **Aubrac** ou **Salers** : races françaises avec un excellent goût
- Évite les races très maigres comme la Blonde d''Aquitaine pour cette pièce

## Assaisonnement

Le **dalmatien** (sel + poivre à parts égales) est parfait. Le gras abondant du plat de côtes porte la saveur tout seul.

## La cuisson

- Fumoir à **121°C**
- Bois de chêne, hêtre ou un mélange hêtre/cerisier
- Côtes **os vers le bas**, gras vers le haut
- Le stall arrive entre **65°C et 77°C**
- L''emballage est optionnel — beaucoup les cuisent **sans emballage** pour une croûte maximale
- Cible : **96-98°C** à cœur, la sonde entre sans résistance

## Repos et service

Repos **30 à 45 minutes** sous aluminium lâche. Sers avec l''os — c''est la présentation qui fait du plat de côtes un plat d''exception.

| Paramètre | Valeur |
|-----------|--------|
| Pièce | Plat de côtes de bœuf (8-12 cm par côte) |
| Température fumoir | 121°C |
| Température cible | 96-98°C à cœur |
| Emballage | Optionnel à 74°C |
| Repos | 30-45 min |
| Durée totale | 6-10h selon taille |

*Utilise le [calculateur](/) avec le profil Beef Short Ribs pour un timing précis.*',
'https://images.pexels.com/photos/8250702/pexels-photo-8250702.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{plat-de-cotes,beef-ribs,boeuf,low-and-slow,fumage}', 'beef_short_ribs',
'Plat de côtes de bœuf au fumoir — Charbon & Flamme',
'Comment fumer un plat de côtes de bœuf : découpe française, assaisonnement et cuisson lente.',
3, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 4. PALERON
-- ═══════════════════════════════════════════════════════════

('Le paleron au fumoir : l''alternative au brisket', 'guide-paleron-fumoir',
'Le paleron est une alternative économique à la poitrine avec un résultat tout aussi impressionnant. Disponible chez tous les bouchers.',
'## Pourquoi le paleron ?

Le **paleron de bœuf** est le secret le mieux gardé du BBQ en France. Plus persillé que la poitrine, moins cher, plus rapide à cuire et surtout **disponible chez tous les bouchers** sans commande spéciale.

### Avantages par rapport à la poitrine
- **2 à 3 fois moins cher** au kilo
- Cuisson en **4 à 6 heures** au lieu de 10 à 14
- Plus tolérant aux erreurs de température
- C''est la même pièce que le bœuf bourguignon — ton boucher la connaît par cœur

### Que demander au boucher ?
Un **paleron de bœuf entier** de 1,5 à 3 kg. Demande de laisser le gras. Pas besoin de commande spéciale.

## Assaisonnement

Le dalmatien (sel + poivre) fonctionne, mais le paleron supporte aussi des rubs plus complexes : paprika fumé, ail en poudre, cassonade.

## La cuisson

- Fumoir à **121°C**
- Bois de chêne ou hêtre
- Sans emballage : 5-6 heures (croûte spectaculaire)
- Avec emballage à **74°C** : 4-5 heures
- Cible : **93°C** (tranché) à **96°C** (effiloché)

## Service

Deux présentations possibles :
- **Tranché** : comme une poitrine, en tranches épaisses contre le grain
- **Effiloché** : en pulled beef pour des sandwichs

C''est la pièce parfaite pour **débuter le BBQ bœuf** avant de se lancer sur une poitrine entière.

| Paramètre | Valeur |
|-----------|--------|
| Pièce | Paleron de bœuf (1,5-3 kg) |
| Température fumoir | 121°C |
| Température cible | 93-96°C à cœur |
| Emballage | Optionnel à 74°C |
| Repos | 20-30 min |
| Durée totale | 4-6h selon poids |

*Utilise le [calculateur](/) avec le profil Paleron pour un timing précis.*',
'https://images.pexels.com/photos/4765772/pexels-photo-4765772.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{paleron,chuck-roast,pulled-beef,boeuf,debutant,low-and-slow}', 'chuck_roast',
'Paleron de bœuf au fumoir — Charbon & Flamme',
'Comment fumer un paleron de bœuf : l''alternative économique à la poitrine, disponible chez tous les bouchers français.',
4, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 5. CÔTE DE BŒUF ET TOMAHAWK (FUSIONNÉ)
-- ═══════════════════════════════════════════════════════════

('Côte de bœuf et tomahawk au fumoir', 'guide-cote-de-boeuf-tomahawk',
'La saisie inversée : fumage doux puis saisie violente. La méthode idéale pour une côte de bœuf ou un tomahawk parfait.',
'## Deux pièces, une méthode

La **côte de bœuf** et le **tomahawk** sont la même viande : une entrecôte épaisse avec l''os. Le tomahawk a simplement le manche de l''os laissé entier (~30 cm) pour la présentation. La technique de cuisson est identique.

### Que demander au boucher ?

#### Côte de bœuf
- **1 à 1,5 kg** par pièce, épaisseur 4-5 cm
- Races : **Charolaise** bien persillée, **Aubrac**, **Salers**, **Angus**
- Précise que c''est pour une cuisson indirecte au barbecue

#### Tomahawk
- **800 g à 1,5 kg** avec l''os du manche
- Épaisseur minimum **5 cm** (indispensable pour la saisie inversée)
- Commande 2-3 jours à l''avance chez ton boucher artisan
- De plus en plus disponible en boucherie en ligne (Pourdebon, Le Goût du Bœuf)

## Assaisonnement

Minimaliste : **gros sel + poivre noir concassé**. Sale la veille et laisse reposer à découvert au frigo pour une surface bien sèche.

## La cuisson (saisie inversée)

### Phase 1 — Fumage indirect
- Barbecue ou fumoir en zone indirecte à **110°C**
- Un morceau de chêne ou cerisier pour une fumée légère
- Sonde dans le centre, loin de l''os

### Température de sortie
Retire **8°C avant** ta cible (la température continue de monter) :
- Saignant (52°C final) : sortir à **44°C**
- À point rosé (54°C final) : sortir à **46°C**
- À point (60°C final) : sortir à **52°C**

### Phase 2 — Saisie
- Barbecue au maximum, poêle en fonte ou chalumeau
- **1 à 2 minutes par face** pour une croûte caramélisée
- La surface **doit être sèche** avant la saisie

### Phase 3 — Repos et finition
- Repos **10 à 20 minutes** sous aluminium lâche
- Noisette de beurre + romarin + ail écrasé (optionnel)
- Fleur de sel au moment de servir

## Découpe

Détache la viande de l''os. Tranche en lamelles de 1 cm contre le grain. Replace contre l''os pour le dressage.

| Paramètre | Côte de bœuf | Tomahawk |
|-----------|-------------|----------|
| Poids | 1-1,5 kg | 0,8-1,5 kg |
| Fumoir | 110°C | 110°C |
| Cible à point rosé | 54°C | 54°C |
| Saisie | 1-2 min / face | 1-2 min / face |
| Repos | 10-20 min | 5-10 min |
| Durée totale | 40 min-1h15 + saisie | 45 min-1h30 + saisie |

*Utilise le [calculateur](/) avec le profil Côte de bœuf ou Tomahawk pour un timing précis.*',
'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{cote-de-boeuf,tomahawk,saisie-inversee,entrecote,boeuf,reverse-sear}', 'prime_rib',
'Côte de bœuf et tomahawk au fumoir (saisie inversée) — Charbon & Flamme',
'Comment fumer une côte de bœuf ou un tomahawk avec la saisie inversée : fumage doux, saisie violente, repos.',
5, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 6. TRAVERS DE PORC (SPARE + BABY BACK FUSIONNÉS)
-- ═══════════════════════════════════════════════════════════

('Les travers de porc au fumoir : spare ribs et baby back', 'guide-travers-de-porc-ribs',
'Spare ribs ou baby back ? Méthode 3-2-1 ou sans wrap ? Tout ce qu''il faut savoir pour des travers parfaits.',
'## Spare ribs ou baby back ?

### Spare ribs (travers de flanc)
Les **spare ribs** sont prélevées sur le flanc du cochon. Plus grandes, plus grasses, plus de saveur. C''est le format le plus populaire en compétition BBQ.

### Baby back ribs (côtes du dos)
Les **baby back ribs** sont prélevées en haut du dos, près de la colonne vertébrale. Plus courtes, plus courbées, plus maigres. Cuisson plus rapide.

### Que demander au boucher ?
- Demande un **rack entier non tranché**
- Précise que c''est pour le fumoir
- La coupe **Saint-Louis** (cartilage du bout retiré) donne un rack rectangulaire régulier
- Compte **1 rack pour 2 personnes**

## Préparation

1. **Retire la membrane** : retourne le rack, glisse un couteau sous la membrane blanche côté os, attrape-la avec un essuie-tout et tire d''un coup sec
2. **Parage** : retire l''excès de gras et le cartilage dur
3. **Moutarde + rub** : une fine couche de moutarde de Dijon sert de liant (elle disparaît à la cuisson)

## Les méthodes de cuisson

### Méthode 3-2-1 (spare ribs)

La méthode la plus fiable pour débuter :
- **3 heures** à découvert au fumoir (121°C) — formation de la croûte
- **2 heures** emballées en alu avec beurre, miel ou jus de pomme — attendrissement
- **1 heure** à découvert, badigeonnées de sauce — caramélisation

### Méthode 2-2-1 (baby back ribs)

Même principe, adapté aux côtes plus fines :
- **2 heures** à découvert
- **2 heures** en papier alu
- **1 heure** glaçage

### Sans wrap (méthode compétition)

Les puristes ne wrappent jamais :
- **5 à 6 heures** à découvert au fumoir à 121°C
- Spray léger toutes les 45 min (vinaigre de cidre + jus de pomme)
- Glaçage dans les 30 dernières minutes
- Résultat : croûte maximale, plus de mâche

### Le compromis : 3-1-1

Beaucoup de pitmasters expérimentés utilisent un wrap court :
- 3 heures à découvert
- 1 heure en papier boucher (pas alu)
- 1 heure glaçage
- Meilleur des deux mondes

## Le test de cuisson

- **Test de flexion** : soulève le rack par le milieu avec des pinces. Il doit plier nettement et la surface se fissurer.
- **Test de torsion** : attrape un os et tourne-le. Il doit tourner facilement sans sortir.

| | Spare ribs | Baby back |
|---|---|---|
| Méthode | 3-2-1 | 2-2-1 |
| Température | 121°C | 121°C |
| Durée | ~6h | ~5h |
| Bois | Cerisier, pommier, hêtre | Pommier, cerisier |
| Test | Flexion + torsion | Flexion |

*Utilise le [calculateur](/) avec le profil Spare Ribs ou Baby Back pour le timing.*',
'https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{travers,spare-ribs,baby-back,ribs,3-2-1,2-2-1,porc}', 'spare_ribs',
'Travers de porc au fumoir (spare ribs et baby back) — Charbon & Flamme',
'Spare ribs ou baby back ? Méthode 3-2-1, 2-2-1 ou sans wrap. Le guide complet des travers de porc au fumoir.',
6, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 7. POULET ENTIER
-- ═══════════════════════════════════════════════════════════

('Le poulet entier au fumoir', 'guide-poulet-entier-fumoir',
'Fumer un poulet entier demande une approche différente du low & slow classique. Plus chaud, plus rapide, et une peau qui craque.',
'## Le défi du poulet fumé

En dessous de 130°C, la graisse sous-cutanée du poulet ne rend pas assez et la peau reste **molle et caoutchouteuse**. C''est l''erreur numéro 1 des débutants.

### Quel poulet choisir ?
On a la chance en France d''avoir une volaille de qualité exceptionnelle :
- **Label Rouge** : minimum recommandé, élevé en plein air
- **Fermier** (Bresse, Loué, Gers, Challans, Landes) : le top — peau épaisse, chair dense
- Poids idéal : **1,5 à 2,5 kg**

## Préparation

### La technique du papillon (spatchcock)
Retire la colonne vertébrale avec des ciseaux de cuisine et aplatis le poulet :
- Cuisson **30% plus rapide**
- Peau uniformément exposée à la chaleur
- Plus de surface de croûte

### Assaisonnement
1. Sèche bien le poulet (essuie-tout partout)
2. Huile d''olive en fine couche
3. Paprika fumé, ail en poudre, sel, poivre, herbes de Provence
4. Optionnel : laisse sécher au frigo une nuit à découvert

## La cuisson

- **150-165°C** — plus chaud que le low & slow classique
- Bois fruitiers : pommier, cerisier, ou **sarments de vigne**
- Poulet entier : **2 à 3 heures**
- En papillon : **1h30 à 2h30**
- Cible : **74°C** dans la cuisse (sans toucher l''os)
- Les 10 dernières minutes, monte à **200°C** pour crisper la peau

## Repos

5 à 10 minutes maximum. Contrairement au bœuf, le poulet n''a pas besoin d''un long repos.

| Paramètre | Valeur |
|-----------|--------|
| Pièce | Poulet fermier (1,5-2,5 kg) |
| Température fumoir | 150-165°C |
| Température cible | 74°C (cuisse) |
| Format | Papillon recommandé |
| Bois | Pommier, cerisier, vigne |
| Durée totale | 1h30-3h |

*Utilise le [calculateur](/) avec le profil Poulet entier pour le timing.*',
'https://images.pexels.com/photos/13458086/pexels-photo-13458086.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{poulet,papillon,volaille,peau-croustillante,fumoir}', 'whole_chicken',
'Poulet entier au fumoir — Charbon & Flamme',
'Comment fumer un poulet entier : technique du papillon, bois de vigne et peau croustillante.',
7, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 8. AGNEAU
-- ═══════════════════════════════════════════════════════════

('L''agneau au fumoir : épaule, souris, gigot', 'guide-agneau-fumoir',
'L''agneau est le grand oublié du BBQ. L''épaule fumée donne un effiloché spectaculaire.',
'## Pourquoi fumer de l''agneau ?

L''agneau est quasi absent du BBQ américain mais c''est une pièce parfaite pour le fumoir. En France, on a accès à des agneaux d''exception.

### Les morceaux à fumer

#### Épaule d''agneau (le pulled lamb)
- **1,5 à 2,5 kg** avec l''os
- 121°C, cible 93°C à cœur
- **5 à 7 heures**
- En pita, en tacos ou en burger

#### Souris d''agneau (jarret arrière)
- **300 à 500 g** par souris (1 par personne)
- 121°C, cible 93°C
- **4 à 5 heures**
- La viande tombe de l''os

#### Gigot d''agneau (saisie inversée)
- **1,5 à 2,5 kg**
- Fumage à 110°C puis saisie au grill
- Cible **55°C** pour rosé, **63°C** pour à point
- **2 à 3 heures** de fumage

#### Collier d''agneau
- Le morceau le plus collagéneux et le moins cher
- Parfait pour un effiloché à petit budget
- 5 à 6 heures à 121°C

### Les agneaux français d''exception

- **Pré-salé** (Mont-Saint-Michel) : goût unique, légèrement iodé
- **Agneau de Sisteron** (IGP) : doux, tendre, plein air
- **Agneau du Quercy** (Label Rouge) : persillé, goûteux
- **Agneau de lait des Pyrénées** : très jeune, à fumer très doucement à 100°C

### Assaisonnement

L''agneau appelle les herbes méditerranéennes :
- **Classique** : herbes de Provence + sel + poivre + ail
- **Oriental** : cumin + coriandre + sumac + za''atar
- **Tandoori** : yaourt + curcuma + garam masala (marinade 12h)

### Le bois pour l''agneau

- **Cerisier** : doux, fruité — le meilleur choix
- **Vigne** : sarments secs, goût méditerranéen
- **Olivier** : complexe, herbacé. Le luxe absolu.
- Évite le hickory et le mesquite — trop forts pour l''agneau.

*Utilise le [calculateur](/) pour estimer le temps selon la pièce.*',
'https://images.pexels.com/photos/3535383/pexels-photo-3535383.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{agneau,epaule,souris,gigot,collier,pulled-lamb,fumoir}', 'lamb_shoulder',
'Agneau au fumoir (épaule, souris, gigot) — Charbon & Flamme',
'Comment réussir l''agneau au fumoir : épaule, souris, gigot, collier. Quel agneau français choisir, quel bois.',
8, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 9. LES BURNT ENDS
-- ═══════════════════════════════════════════════════════════

('Les burnt ends : les bonbons du pitmaster', 'guide-burnt-ends',
'Des cubes de viande caramélisés au fumoir. Le snack BBQ le plus addictif qui existe.',
'## Les burnt ends, c''est quoi ?

Des cubes de viande caramélisés issus de la **pointe** de la poitrine de bœuf. À l''origine, c''étaient les morceaux que les pitmasters de Kansas City offraient aux clients qui attendaient. Aujourd''hui, c''est devenu un plat culte.

### La technique classique (burnt ends de bœuf)

1. Fume une poitrine entière normalement jusqu''à 93-96°C
2. Sépare la pointe du flat
3. Cube la pointe en morceaux de 2-3 cm
4. Badigeonne de sauce BBQ, ajoute du beurre et de la cassonade
5. Remets au fumoir dans une barquette alu à 135°C pendant 1h30-2h
6. Remue toutes les 30 min

### La version rapide (burnt ends de porc)

Plus simple et tout aussi bon :
1. Achète de la **poitrine de porc** (lard frais) — 1 à 1,5 kg
2. Cube en morceaux de 3 cm
3. Assaisonne avec un rub
4. Fume à 121°C pendant 2h
5. Transfère dans une barquette alu avec beurre (30 g), sauce BBQ (60 ml), miel (30 ml)
6. Couvre et remets 1h30 à 135°C
7. Découvre et remets 30 min pour caraméliser

### Service
- Nature dans un bol avec des cure-dents
- Sur du pain blanc (tradition Kansas City)
- Dans un mac & cheese
- Sur des frites avec cheddar fondu

*Utilise le [calculateur](/) sur Brisket pour la première phase de cuisson.*',
'https://images.pexels.com/photos/8753690/pexels-photo-8753690.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'technique', '{burnt-ends,poitrine,boeuf,porc,caramelise,snack}', 'brisket',
'Burnt ends au fumoir (bœuf et porc) — Charbon & Flamme',
'Comment faire des burnt ends : cubes caramélisés de poitrine de bœuf ou de porc au fumoir.',
9, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 10. FEU, CHARBON ET BOIS DE FUMAGE (FUSIONNÉ)
-- ═══════════════════════════════════════════════════════════

('Feu, charbon et bois de fumage', 'guide-feu-charbon-bois',
'Gérer son feu, choisir son charbon et son bois de fumage. Le guide complet pour maîtriser le combustible.',
'## Le triangle du feu

Trois paramètres contrôlent ta cuisson : le **combustible** (charbon, bois), l''**oxygène** (ventilation) et la **chaleur** résultante.

## Le charbon

### Briquettes vs charbon naturel
- **Briquettes** : température constante, longue durée, idéal pour les cuissons longues
- **Charbon de bois naturel** : monte plus vite, saveur plus propre, brûle plus vite
- Privilégie le charbon **français** issu de forêts gérées durablement

### La méthode Minion
Pour les fumoirs au charbon (Weber Smokey Mountain, bouilloire) :
1. Remplis le panier de charbon non allumé
2. Ajoute 10-15 briquettes allumées sur le dessus
3. Le feu se propage lentement → **8 à 12 heures de cuisson stable**

## Les bois de fumage disponibles en France

### Les essences

| Bois | Saveur | Intensité | Idéal pour | Dispo en France |
|------|--------|-----------|------------|-----------------|
| **Chêne** | Ronde, équilibrée | Moyenne | Bœuf, tout | Partout |
| **Hêtre** | Douce, noisettée | Légère | Porc, volaille, poisson | Très courant |
| **Cerisier** | Fruitée, sucrée | Légère-moyenne | Ribs, poulet, porc, agneau | Vergers, spécialistes |
| **Pommier** | Très douce | Légère | Volaille, baby back, poisson | Vergers normands |
| **Vigne** | Terreuse, tannique | Forte | Agneau, bœuf | Vignobles, sud |
| **Olivier** | Complexe, herbacée | Moyenne | Agneau, poulet | Provence, Corse |
| **Hickory** | Bacon, noisette grillée | Forte | Porc, épaule | Importé uniquement |
| **Noyer** | Prononcée | Forte | Viandes rouges | Assez courant |

### Quel bois pour quelle viande ?

| Viande | Bois principal | Bois secondaire |
|--------|---------------|-----------------|
| Poitrine de bœuf | Chêne | Hickory, noyer |
| Échine / épaule de porc | Cerisier | Hickory, pommier |
| Travers de porc | Cerisier + hickory | Chêne |
| Poulet | Pommier | Cerisier, hêtre |
| Agneau | Cerisier | Vigne, olivier |

### Les formats
- **Bûches (splits)** : pour offset smokers
- **Morceaux (chunks)** : le plus polyvalent (kamado, kettle, WSM)
- **Copeaux (chips)** : pour smoke box sur BBQ gaz
- **Pellets** : uniquement pour pellet smoker

### Les règles absolues
1. **Jamais de résineux** (pin, sapin, épicéa) : toxique et amer
2. **Bois sec** : séché 6 à 12 mois minimum
3. **Pas de bois traité** : palettes, vernis = toxique
4. **La bonne fumée** : bleue/transparente = bonne. Blanche épaisse = mauvaise.

## La ventilation

- **Arrivée d''air (bas)** : contrôle principal. Plus ouverte = plus chaud.
- **Cheminée (haut)** : toujours **au moins à moitié ouverte**
- Règle d''or : ajuste par le bas, laisse le haut ouvert.
- Vise **±5°C** autour de ta cible. Ajuste par petits incréments et attends 15 minutes.',
'https://images.pexels.com/photos/69056/pexels-photo-69056.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'technique', '{feu,charbon,bois,fumage,ventilation,minion,chene,cerisier,hetre}', null,
'Feu, charbon et bois de fumage au barbecue — Charbon & Flamme',
'Gérer le feu au fumoir : charbon, bois français (chêne, hêtre, cerisier, vigne), ventilation et méthode Minion.',
10, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 11. LE STALL ET L''EMBALLAGE (FUSIONNÉ)
-- ═══════════════════════════════════════════════════════════

('Le stall et l''emballage au fumoir', 'guide-stall-emballage',
'Le plateau thermique et les techniques d''emballage : comprendre le stall et savoir quand wrapper.',
'## Le stall, c''est quoi ?

Le **stall** (plateau thermique) est ce moment où la température à cœur **cesse de monter** pendant 2 à 4 heures. Il se produit entre **65°C et 77°C** et touche toutes les grosses pièces.

### La science

C''est du **refroidissement par évaporation**. À 65°C, l''humidité s''évapore massivement en surface. Cette évaporation refroidit la viande, comme la transpiration refroidit la peau. Le fumoir chauffe, l''évaporation refroidit → la température stagne.

### Quelles viandes sont touchées ?

| Viande | Stall typique |
|--------|---------------|
| Poitrine de bœuf | 65-77°C, 2-5h |
| Échine de porc | 63-74°C, 2-4h |
| Paleron | 65-77°C, 1-3h |
| Plat de côtes | 65-77°C, 1-3h |
| Poulet | Pas de stall notable |

## Les 3 stratégies face au stall

### 1. La patience
Laisse passer. Le stall finit quand l''humidité de surface est épuisée. Résultat : la croûte la plus développée.

### 2. L''emballage (Texas Crutch)
Emballe pour bloquer l''évaporation et accélérer la cuisson de 1 à 3 heures.

### 3. La cuisson hot & fast
Fume à **135-150°C**. Le stall existe toujours mais dure beaucoup moins longtemps.

## Papier boucher vs aluminium

| | Papier boucher | Aluminium | Sans emballage |
|---|---|---|---|
| Croûte | Croustillante | Ramollie | Maximale |
| Vitesse | Rapide | Plus rapide | Lent |
| Jutosité | Bonne | Excellente | Variable |
| Idéal pour | Poitrine de bœuf | Ribs, échine de porc | Plat de côtes |

### Quand emballer ?

Emballe quand la **croûte est sombre et sèche au toucher** :
- **Poitrine de bœuf** : 68-74°C à cœur
- **Échine de porc** : 74-76°C à cœur
- **Ribs** : après 3h de fumage (méthode 3-2-1)

### Où trouver du papier boucher en France ?
Amazon, sites BBQ spécialisés (Esprit Barbecue), ou rouleau de papier kraft alimentaire non blanchi en magasin pro (Metro).',
'https://images.pexels.com/photos/1927383/pexels-photo-1927383.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'technique', '{stall,emballage,texas-crutch,papier-boucher,aluminium,wrap}', null,
'Le stall et l''emballage au fumoir — Charbon & Flamme',
'Le stall expliqué : pourquoi la température stagne, comment le gérer, papier boucher vs aluminium.',
11, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 12. LA BARK
-- ═══════════════════════════════════════════════════════════

('La bark : comment obtenir une croûte parfaite', 'guide-bark-croute',
'La bark est la croûte sombre et savoureuse qui se forme au fumoir. Voici comment l''obtenir parfaite.',
'## La bark, c''est quoi ?

La **bark** (croûte) est un mélange de rub caramélisé, de graisse rendue, de réaction de Maillard et de dépôts de fumée. C''est souvent la meilleure partie de la viande.

### La science

Trois réactions simultanées :
1. **Réaction de Maillard** (à partir de 110°C) : couleur brune et arômes complexes
2. **Caramélisation** (160-180°C en surface) : côté croquant et brillant
3. **Polymérisation de la fumée** : les composés se déposent et forment une couche protectrice

### Comment obtenir une bark parfaite

**1. Le rub fait tout.** Plus de rub = plus de bark. Les rubs avec cassonade donnent une bark plus sombre. Le poivre concassé gros crée de la texture.

**2. Surface sèche.** Éponge la viande avant le rub. Mieux : applique le rub la veille et laisse au frigo à découvert.

**3. Flux d''air.** La bark a besoin d''air qui circule. Ne surcharge pas ton fumoir.

**4. Température.** 107-121°C : bark lente mais profonde. 135°C+ : bark plus rapide mais risque de brûler le sucre.

**5. Ne spraye pas trop tôt.** Les 2 premières heures, laisse la bark se former. Après, un spray léger (vinaigre de cidre) aide à fixer la fumée.

**6. Wrap au bon moment.** Trop tôt : bark molle. Le bon moment : quand elle est sombre et sèche au toucher (68-74°C interne). Papier boucher > alu.

### Problèmes courants

- **Bark molle** : wrap trop tôt, trop de spray, fumoir trop humide
- **Bark brûlée** : température trop haute, trop de sucre dans le rub
- **Pas de bark** : pas assez de rub, pas assez de temps',
'https://images.pexels.com/photos/5836779/pexels-photo-5836779.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'technique', '{bark,croute,rub,maillard,caramelisation,fumee}', null,
'La bark au fumoir : obtenir une croûte parfaite — Charbon & Flamme',
'Comment obtenir une bark parfaite au fumoir : rub, température, flux d''air, timing du wrap.',
12, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 13. TEMPÉRATURES DE CUISSON
-- ═══════════════════════════════════════════════════════════

('Les températures de cuisson au fumoir', 'guide-temperatures-cuisson',
'Température du fumoir, température cible, zone de danger : le tableau complet.',
'## Les deux températures à maîtriser

Celle du **fumoir** (chambre de cuisson) et celle de la **viande** (à cœur).

### La zone de danger sanitaire

Les bactéries se multiplient entre **4°C et 60°C**. La viande ne doit pas rester dans cette zone plus de **4 heures**. Avec un fumoir à 107°C+ : la viande traverse la zone en 2-3h, c''est bon.

### Tableau par viande

| Morceau | Fumoir | Cible interne | Résultat |
|---------|--------|--------------|----------|
| Poitrine de bœuf | 107-121°C | 93-98°C | Fondant, tranché |
| Échine de porc | 107-121°C | 93-96°C | Effiloché |
| Travers de porc | 107-121°C | Test de flexion | Tendre |
| Plat de côtes | 121°C | 96-98°C | Fondant |
| Paleron | 121°C | 93-96°C | Effiloché ou tranché |
| Côte de bœuf | 110°C | 46-52°C (avant saisie) | Rosé |
| Tomahawk | 110°C | 46-52°C (avant saisie) | Rosé |
| Poulet entier | 150-165°C | 74°C (cuisse) | Peau croustillante |
| Épaule d''agneau | 121°C | 93°C | Effiloché |
| Gigot d''agneau | 110°C | 55-63°C | Rosé à à point |

### Low & slow vs hot & fast

**Low & slow (107-121°C)** : méthode traditionnelle. Le collagène fond lentement, la fumée pénètre, la bark se développe. Pour : poitrine, échine, plat de côtes.

**Hot & fast (135-165°C)** : plus rapide, bark plus épaisse. Pour : poulet, baby back ribs.

### La cuisson de nuit

Beaucoup de pitmasters lancent la cuisson le soir :
1. **22h** : allume le fumoir, stabilise à 107°C
2. **23h** : pose la viande, sonde en place
3. **7h** : vérifie (devrait être vers 65-70°C = stall)
4. **8h** : emballe si nécessaire
5. **12-14h** : la viande atteint la cible

Indispensable : un thermomètre à alarme qui te réveille si le fumoir sort de la plage.

*Le [calculateur](/) calcule les temps et te donne l''heure de lancement selon l''heure du repas.*',
'https://images.pexels.com/photos/1309065/pexels-photo-1309065.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'technique', '{temperature,fumoir,cuisson,low-and-slow,hot-and-fast,tableau}', null,
'Températures de cuisson au fumoir : tableau complet — Charbon & Flamme',
'Quelle température pour chaque viande ? Tableau complet : poitrine, échine, ribs, poulet, agneau.',
13, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 14. ERREURS DE DÉBUTANT
-- ═══════════════════════════════════════════════════════════

('Les 10 erreurs de débutant au fumoir', 'guide-erreurs-debutant',
'Température instable, viande sèche, fumée blanche... Les pièges les plus courants quand on débute.',
'## Les erreurs qui gâchent tes cuissons

### 1. Faire confiance au thermomètre du couvercle
Il mesure la température **en haut**, pas au niveau de la grille. Achète un thermomètre à double sonde (~30€ sur Amazon).

### 2. Ouvrir le couvercle trop souvent
Chaque ouverture = -10-20°C et +15-30 min. Fais confiance à ta sonde.

### 3. Trop de fumée
La fumée doit être **bleue ou transparente**. Blanche et épaisse = bois mal brûlé = goût de cendrier.

### 4. Ne pas laisser reposer
Trancher un brisket à la sortie du fumoir = jus sur la planche et viande sèche. Minimum 1h pour une poitrine, 30 min pour une échine.

### 5. Paniquer pendant le stall
Entre 65°C et 77°C, la température stagne. C''est **normal**. Ne monte pas la température en panique. Attends ou emballe.

### 6. Viande trop froide au départ
Sors la viande **1 heure avant** pour qu''elle soit à température ambiante.

### 7. Mauvais bois ou bois humide
Le bois doit être séché **6-12 mois**. Jamais de résineux, jamais de bois traité.

### 8. Trop de rub ou pas assez
Pas assez = pas de bark. Trop salé = immangeable. Une couche épaisse et **uniforme**.

### 9. Ne pas parer le gras
Le gras dur et blanc ne fond pas au fumoir. Pare à 6-8 mm de gras mou.

### 10. Cuire au temps, pas à la température
Le **seul indicateur fiable est la température interne** et le test de la sonde. Le temps n''est qu''une estimation.

*Le [calculateur](/) te donne une estimation de temps, mais la sonde est reine.*',
'https://images.pexels.com/photos/2491272/pexels-photo-2491272.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'technique', '{erreurs,debutant,fumoir,conseils,temperature,stall}', null,
'Les 10 erreurs de débutant au fumoir — Charbon & Flamme',
'Température instable, fumée blanche, viande sèche : les 10 erreurs les plus fréquentes au fumoir.',
14, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 15. LE SEL ET L''ASSAISONNEMENT
-- ═══════════════════════════════════════════════════════════

('Le sel en barbecue : salaison sèche et saumure', 'guide-sel-assaisonnement',
'Le sel est l''ingrédient le plus important du BBQ. Comment bien l''utiliser.',
'## Quel sel utiliser ?

### Gros sel de Guérande (le choix français)
L''alternative parfaite au sel casher américain : gros cristaux irréguliers qui adhèrent bien. **~15 g par kg de viande.**

### Sel de mer fin
Bon pour les rubs mélangés. Se dissout plus vite. Réduis de 30% par rapport au gros sel.

### Fleur de sel
Trop chère pour le rub. Parfaite **en finition** : quelques cristaux sur les tranches avant de servir.

## La salaison sèche (dry brine)

La meilleure technique pour les grosses pièces :
1. Sale la viande à **10 g par kg**
2. Place sur une grille au frigo
3. Laisse **12 à 24 heures** à découvert
4. Ne rince pas — le sel a été absorbé
5. Applique le rub par-dessus

Ce qui se passe : le sel tire l''humidité, se dissout dedans, puis est réabsorbé avec les jus. Résultat : viande assaisonnée en profondeur + surface sèche = meilleure bark.

## La saumure humide (brining)

### Pour la volaille
- 40 g de sel par litre d''eau
- 4 à 8 heures au frigo
- Rincer et éponger avant le rub
- Viande 10-15% plus juteuse

### Pour le porc
- 50 g de sel + 25 g de sucre par litre
- 8 à 12 heures
- La cassonade aide à la caramélisation

## Erreurs courantes

- **Pas assez de sel** : la cause n°1 de BBQ fade
- **Sel appliqué trop tard** : 10 min avant = inutile. Il faut minimum 1h, idéalement 12-24h.
- **Double salage** : injection salée + rub salé + saumure = catastrophe. Choisis UNE méthode.',
'https://images.pexels.com/photos/2814828/pexels-photo-2814828.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'technique', '{sel,guerande,saumure,salaison-seche,dry-brine,assaisonnement}', null,
'Le sel en barbecue : salaison sèche et saumure — Charbon & Flamme',
'Quel sel pour le BBQ ? Gros sel de Guérande, saumure, salaison sèche. Dosages et techniques.',
15, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 16. LES SAUCES BBQ
-- ═══════════════════════════════════════════════════════════

('Les styles de sauce barbecue', 'guide-sauces-bbq',
'Kansas City, Carolina, Texas, Alabama... Chaque région a sa sauce.',
'## Les 6 grands styles

### Kansas City — la sucrée
Épaisse, sucrée, à base de tomate et mélasse. Pour les ribs et le pulled pork.

### Caroline du Nord — le vinaigre
Pas de tomate. Vinaigre de cidre, piment, sel, poivre. Liquide comme une vinaigrette. Versée sur le porc effiloché pour couper le gras.

### Caroline du Sud — la moutarde
La « Gold sauce ». Moutarde jaune, vinaigre, cassonade. Pour le pulled pork et les saucisses.

### Texas — le jus de viande
Fine, à base de jus de cuisson. La règle texane : si ta viande a besoin de sauce, c''est qu''elle est ratée.

### Alabama — la white sauce
Mayonnaise, vinaigre de cidre, raifort. Le poulet fumé est trempé dedans à la sortie du fumoir.

### Memphis — le sec
Pas de sauce. Un rub épais sucré-épicé caramélisé. Les meilleurs ribs de Memphis n''ont pas besoin de sauce.

## Recette de base (style Kansas City maison)

- 200 ml de ketchup
- 60 g de cassonade
- 30 ml de vinaigre de cidre
- 15 ml de Worcestershire
- 10 ml de sauce piquante
- 5 g de paprika fumé, 3 g d''ail en poudre, 3 g d''oignon en poudre
- Sel, poivre

Mélange, chauffe 15 min à feu doux, laisse refroidir. Se conserve 2 semaines au frigo.',
'https://images.pexels.com/photos/4033325/pexels-photo-4033325.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'technique', '{sauce-bbq,kansas-city,carolina,texas,alabama,memphis}', null,
'Les styles de sauce BBQ — Charbon & Flamme',
'Kansas City, Carolina, Texas, Alabama, Memphis : tous les styles de sauce barbecue expliqués.',
16, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 17. CHOISIR SON FUMOIR
-- ═══════════════════════════════════════════════════════════

('Quel fumoir choisir pour débuter ?', 'guide-choisir-fumoir',
'Weber, offset, granulés, kamado — chaque fumoir a ses avantages.',
'## Les types de fumoirs

### Weber Smokey Mountain (fumoir vertical)
Le **meilleur rapport qualité/prix** pour débuter. 350-550€. 8+ heures de cuisson stable. Compact.

### Fumoir offset (horizontal)
Le fumoir traditionnel des pitmasters texans. 500€ à 3 000€+. Saveur inégalable mais demande plus d''expérience.

### Weber bouilloire (Kettle)
Le barbecue le plus polyvalent. 150-400€. Méthode du serpent pour la cuisson lente. Parfait pour débuter.

### Fumoir à granulés (Traeger, Weber SmokeFire)
Le « allumez et oubliez ». 600-2 500€. Pratique mais saveur fumée moins intense.

### Kamado (Big Green Egg, Kamado Joe, Monolith)
Céramique polyvalent. 800-3 000€. Isolation exceptionnelle, polyvalent (pizza, grillades, fumage).

## Quel fumoir pour quel profil ?

| Profil | Fumoir recommandé |
|--------|-------------------|
| Débutant absolu | Weber bouilloire |
| Passionné low & slow | Weber Smokey Mountain |
| Confort maximum | Fumoir à granulés |
| Puriste | Offset (budget 1 000€+) |
| Tout terrain | Kamado |

## Où acheter en France ?
- **Weber Store** : boutiques + en ligne
- **Jardiland, Leroy Merlin, Castorama** : Weber, Char-Broil
- **Esprit Barbecue, Barbecue & Co** : sites spécialisés

Le meilleur fumoir est celui que tu **utilises**.',
'https://images.pexels.com/photos/2491272/pexels-photo-2491272.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'equipement', '{fumoir,weber,offset,granules,kamado,bouilloire,debutant}', null,
'Quel fumoir choisir pour débuter en France ? — Charbon & Flamme',
'Comparatif des fumoirs en France : offset, bouilloire, granulés, vertical et kamado.',
17, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 18. LE THERMOMÈTRE
-- ═══════════════════════════════════════════════════════════

('Le thermomètre : l''outil indispensable', 'guide-thermometre',
'Sans thermomètre précis, tu cuisines à l''aveugle. Voici lesquels choisir.',
'## Pourquoi un thermomètre est indispensable

C''est la sonde qui décide, pas le chrono. Deux poitrines du même poids peuvent avoir 2 heures d''écart.

## Les deux types essentiels

### 1. Thermomètre instantané (à main)
- **Référence** : ThermoWorks Thermapen ONE (1 sec, ±0,3°C) — livré en France
- **Budget** : ThermoPro TP19 (Amazon France, ~15€)

### 2. Thermomètre à sonde fixe
- **Filaire** : ThermoPro TP20 (~30€ sur Amazon France)
- **Bluetooth** : MEATER — pratique, sans fil
- **WiFi** : ThermoWorks Signals, FireBoard — surveillance smartphone

## Où placer la sonde ?

- **Poitrine de bœuf** : partie la plus épaisse du flat, horizontalement
- **Échine / épaule** : au centre, loin de l''os
- **Ribs** : entre deux os, partie la plus charnue
- **Poulet** : dans la cuisse, sans toucher l''os
- **Côte de bœuf / tomahawk** : par le côté, sonde au centre

Règle : évite les poches de gras et les os (ils faussent la lecture).

## Le test de la sonde

Pour les grosses pièces, la température ne suffit pas. Insère le thermomètre : il doit entrer **comme dans du beurre mou**. S''il y a résistance, continue la cuisson.

## Calibration
- **Eau glacée** : doit afficher 0°C
- **Eau bouillante** : doit afficher 100°C',
'https://images.pexels.com/photos/792027/pexels-photo-792027.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'equipement', '{thermometre,sonde,temperature,thermoworks,thermopro}', null,
'Guide thermomètre barbecue — Charbon & Flamme',
'Quel thermomètre BBQ choisir, où placer la sonde, comment faire le test de tendreté.',
18, 'published'),


-- ═══════════════════════════════════════════════════════════
-- 19. LE REPOS DE LA VIANDE
-- ═══════════════════════════════════════════════════════════

('Le repos de la viande : pourquoi c''est non négociable', 'guide-repos-viande',
'Le repos transforme une bonne cuisson en cuisson exceptionnelle.',
'## Pourquoi reposer ?

Pendant la cuisson, les fibres se contractent et poussent les jus vers le centre. Si tu tranches immédiatement, les jus coulent sur la planche. Le repos permet aux fibres de se détendre et aux jus de se redistribuer.

## Combien de temps ?

| Pièce | Repos minimum | Repos idéal |
|-------|---------------|-------------|
| Côte de bœuf / tomahawk | 5 min | 10-20 min |
| Poitrine de bœuf | 60 min | 1-2 heures |
| Échine de porc | 30 min | 45-60 min |
| Ribs | 10 min | 15 min |
| Poulet | 5 min | 10 min |

## La méthode de la glacière

Pour les grosses pièces :
1. Emballe dans du papier boucher
2. Enveloppe dans une serviette éponge
3. Place dans une glacière **préchauffée** (eau chaude, vidée, séchée)
4. Ferme le couvercle

La viande restera à **70°C+** pendant **4 à 6 heures**.

## La cuisson résiduelle (carryover)

La température continue à monter pendant le repos :
- Côtes de bœuf fines : +2°C
- Tomahawk / côte de bœuf : +3 à 5°C
- Poitrine / échine : +1 à 2°C',
'https://images.pexels.com/photos/9424951/pexels-photo-9424951.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'technique', '{repos,carryover,glaciere,jus,tendrete}', null,
'Le repos de la viande au barbecue — Charbon & Flamme',
'Pourquoi et comment reposer sa viande : durées, méthode de la glacière et cuisson résiduelle.',
19, 'published');
