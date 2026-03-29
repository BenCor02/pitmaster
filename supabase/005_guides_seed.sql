-- ============================================================
-- CHARBON & FLAMME v2 — Guides SEO complets
-- Migration 005 : Guides pour chaque viande + techniques BBQ
-- À exécuter APRÈS 003_cms.sql et 004_cms_seed.sql
-- ============================================================

-- ── GUIDES PAR VIANDE ─────────────────────────────────────

insert into public.guides (title, slug, summary, content, cover_url, category, tags, meat_type, seo_title, seo_description, sort_order, status) values

-- ── PULLED PORK ──────────────────────────────────────────
('Réussir son pulled pork au fumoir', 'guide-pulled-pork',
'Le guide complet pour un pulled pork fondant : choix de la pièce, rub, gestion du stall et effilochage parfait.',
'## Quelle pièce choisir ?

Le **pork butt** (épaule de porc, aussi appelé Boston butt) est la pièce idéale. Contrairement à ce que son nom suggère, ce n''est pas le fessier du cochon mais le haut de l''épaule. C''est une pièce très persillée qui pardonne beaucoup.

### Ce qu''il faut chercher
- Pièce de **3 à 5 kg** avec os (le bone-in donne plus de saveur)
- Bon cap de gras extérieur
- Persillage visible dans la viande
- Couleur rose vif, pas grise

## L''assaisonnement

Le pulled pork supporte des rubs plus complexes que la brisket. Une base classique :
- 4 cuillères à soupe de paprika fumé
- 2 cuillères à soupe de cassonade
- 2 cuillères à soupe de sel casher
- 1 cuillère à soupe de poivre noir
- 1 cuillère à soupe de poudre d''ail
- 1 cuillère à soupe de poudre d''oignon
- 1 cuillère à café de cayenne (optionnel)

Appliquez généreusement la veille et laissez reposer au frigo une nuit.

## La cuisson

### Température du fumoir
- **107°C (225°F)** pour un maximum de saveur fumée
- **121°C (250°F)** pour un bon compromis
- Le bois de pommier ou de cerisier apporte une douceur parfaite

### Le stall
Le stall arrive entre **63°C et 74°C** interne. Sur un pork butt, il peut durer 3 à 4 heures. Deux approches :
1. **Sans wrap** : plus de bark, plus de fumée, mais 2–3 heures de plus
2. **Avec wrap** : papier boucher à 74°C interne avec un filet de jus de pomme

### Quand c''est prêt
Température cible : **93–96°C** interne. L''os doit tourner librement dans la viande. Si vous tirez dessus, il doit glisser presque tout seul.

## L''effilochage

Laissez reposer **30 à 60 minutes** minimum. Effilochez à la main avec des griffes à viande ou deux fourchettes. Retirez les gros morceaux de gras. Mélangez les morceaux du dessus (plus fumés) avec ceux de l''intérieur (plus juteux).

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Température fumoir | 107–121°C |
| Température cible | 93–96°C interne |
| Wrap | 74°C (optionnel) |
| Repos | 30–60 min minimum |
| Durée totale | 10–14h selon poids |',
'https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?w=800&h=400&fit=crop',
'viande', '{pulled_pork,pork_butt,low_and_slow,stall,wrap,effilochage}', 'pulled_pork',
'Guide pulled pork au fumoir — Charbon & Flamme',
'Comment réussir un pulled pork au barbecue low & slow : choix de la pièce, rub, stall, wrap et effilochage. Le guide complet.',
3, 'published'),

-- ── BEEF SHORT RIBS ──────────────────────────────────────
('Beef short ribs au fumoir : le guide ultime', 'guide-beef-short-ribs',
'Les short ribs de bœuf, ou plat de côtes, sont une pièce spectaculaire qui rivalise avec la brisket en saveur.',
'## Pourquoi les short ribs ?

Les **beef short ribs** (plat de côtes de bœuf) sont peut-être la pièce la plus sous-estimée du BBQ. Elles combinent la richesse du gras intramusculaire de la brisket avec la facilité d''un format individuel. Chaque rib est un petit concentré de saveur.

### Quel format choisir ?
- **English cut** : coupé entre les os, un os par morceau, 8–12 cm d''épaisseur. C''est le format classique pour le fumoir.
- **Flanken cut** : coupé en travers des os, plus fin. Parfait pour le grill coréen mais pas idéal pour le fumage.

Demandez des ribs **english cut d''au moins 8 cm d''épaisseur** avec un bon persillage.

## Assaisonnement

Comme pour la brisket, le **dalmatien** (sel + poivre 50/50) fonctionne parfaitement. Le gras abondant des short ribs porte la saveur. Inutile de compliquer.

## La cuisson

### Méthode
- Fumoir à **121°C (250°F)**
- Bois de chêne, hickory ou mélange hickory/cerisier
- Placez les ribs **os vers le bas**, gras vers le haut

### Le stall
Les short ribs passent par un stall similaire à la brisket, entre **65°C et 77°C**. Le wrap est optionnel — beaucoup de pitmasters les cuisent **unwrapped** de bout en bout pour maximiser la bark.

### Température cible
- **96–98°C** interne pour un résultat fondant
- La sonde doit entrer sans résistance
- L''os doit commencer à se déchausser naturellement

## Repos et service

Reposez **30 à 45 minutes** sous aluminium lâche. Servez avec l''os — c''est la présentation spectaculaire qui fait des short ribs un plat d''exception.

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Température fumoir | 121°C (250°F) |
| Température cible | 96–98°C interne |
| Wrap | optionnel à 74°C |
| Repos | 30–45 min |
| Durée totale | 6–10h selon taille |',
'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=400&fit=crop',
'viande', '{beef_short_ribs,plat_de_cotes,low_and_slow,boeuf}', 'beef_short_ribs',
'Guide beef short ribs au fumoir — Charbon & Flamme',
'Comment fumer des beef short ribs (plat de côtes) au barbecue : format, assaisonnement, cuisson et service.',
4, 'published'),

-- ── SPARE RIBS ───────────────────────────────────────────
('Spare ribs au fumoir : la méthode 3-2-1', 'guide-spare-ribs',
'La technique 3-2-1 pour des spare ribs (travers de porc) parfaitement tendres avec une bark croustillante.',
'## Les spare ribs, c''est quoi ?

Les **spare ribs** (travers de porc) sont les grandes côtes prélevées sur le ventre du cochon. Plus grandes et plus charnues que les baby back, elles ont aussi plus de gras et donc plus de saveur.

### Préparation
1. **Retirez la membrane** : retournez le rack, glissez un couteau sous la membrane blanche sur les os, attrapez-la avec un essuie-tout et tirez d''un coup sec
2. **Trimming** : retirez l''excès de gras et le cartilage dur au bout des ribs (style St. Louis)
3. **Moutarde + rub** : une fine couche de moutarde jaune sert de liant pour le rub (elle disparaît à la cuisson)

## La méthode 3-2-1

C''est la méthode la plus fiable pour les débutants :

### Phase 1 — Fumage (3 heures)
- Fumoir à **121°C (250°F)**
- Ribs directement sur la grille, **os vers le bas**
- Bois de pommier, cerisier ou hickory
- La bark se forme pendant cette phase

### Phase 2 — Wrap (2 heures)
- Emballez dans de l''aluminium avec un filet de jus de pomme, miel ou beurre
- Toujours à 121°C
- C''est ici que le collagène fond et que la viande devient tendre

### Phase 3 — Glaçage (1 heure)
- Déballez, appliquez votre sauce BBQ préférée
- Remettez sur la grille pour caraméliser
- La sauce va devenir collante et brillante

## Le test de cuisson

**Flex test** : soulevez le rack par le milieu avec des pinces. Il doit plier nettement et la viande doit commencer à se fissurer en surface. Si le rack se casse en deux, c''est trop cuit.

**Twist test** : attrapez un os et tournez-le légèrement. Il doit tourner facilement mais ne pas encore sortir.

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Température fumoir | 121°C (250°F) |
| Méthode | 3-2-1 (spare) ou 2-2-1 (baby back) |
| Test | Flex test + twist test |
| Durée totale | 6 heures |',
'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=800&h=400&fit=crop',
'viande', '{spare_ribs,travers_de_porc,3-2-1,ribs,low_and_slow}', 'spare_ribs',
'Guide spare ribs au fumoir (méthode 3-2-1) — Charbon & Flamme',
'Comment réussir des spare ribs au fumoir avec la méthode 3-2-1 : préparation, fumage, wrap et glaçage.',
5, 'published'),

-- ── BABY BACK RIBS ───────────────────────────────────────
('Baby back ribs : plus rapides, tout aussi savoureuses', 'guide-baby-back-ribs',
'Les baby back ribs sont plus petites et plus tendres que les spare ribs. La méthode 2-2-1 les rend parfaites.',
'## Baby back vs spare ribs

Les **baby back ribs** sont prélevées en haut du dos du cochon, près de la colonne vertébrale. Elles sont plus courtes, plus courbées et plus maigres que les spare ribs.

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
2. Appliquer un rub (les baby back supportent bien les rubs sucrés)
3. Laisser reposer 1h à température ambiante

## La méthode 2-2-1

Adaptée du 3-2-1 pour les baby back plus fines :

### Phase 1 — Fumage (2 heures)
- Fumoir à **121°C (250°F)**
- Bois de pommier ou cerisier (saveur douce)
- Os vers le bas

### Phase 2 — Wrap (2 heures)
- Aluminium avec un mélange beurre + miel + cassonade
- La viande va devenir très tendre

### Phase 3 — Glaçage (1 heure)
- Déballez et appliquez la sauce
- Laissez caraméliser

## Erreurs courantes

- **Trop de fumée** : les baby back sont fines, un excès de fumée les rend amères
- **Surcuisson** : la viande ne doit pas tomber de l''os (signe de surcuisson). Elle doit se détacher avec une légère traction
- **Fumoir trop chaud** : restez à 121°C max, ne montez pas

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Température fumoir | 121°C (250°F) |
| Méthode | 2-2-1 |
| Test | Flex test |
| Durée totale | 5 heures |',
'https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=400&fit=crop',
'viande', '{baby_back_ribs,ribs,2-2-1,low_and_slow,porc}', 'baby_back_ribs',
'Guide baby back ribs au fumoir (méthode 2-2-1) — Charbon & Flamme',
'Baby back ribs au fumoir : méthode 2-2-1, préparation, rub et glaçage. Le guide pour des ribs tendres et savoureuses.',
6, 'published'),

-- ── CHUCK ROAST ──────────────────────────────────────────
('Chuck roast au fumoir : la brisket du pauvre (en mieux)', 'guide-chuck-roast',
'Le chuck roast (paleron) est une alternative économique à la brisket avec un résultat tout aussi impressionnant.',
'## Pourquoi le chuck roast ?

Le **chuck roast** (paleron de bœuf) est surnommé « la brisket du pauvre » mais c''est un compliment déguisé. Cette pièce est plus persillée que la brisket, plus facile à trouver, moins chère et plus rapide à cuire.

### Avantages vs brisket
- **2 à 3 fois moins cher** au kilo
- Cuisson en **4 à 6 heures** au lieu de 8 à 14
- Plus tolérant aux erreurs de température
- Disponible facilement chez n''importe quel boucher

### Format
- Pièce de **1.5 à 3 kg**
- Demandez un paleron entier avec le gras

## Assaisonnement

Le dalmatien (sel + poivre) fonctionne, mais le chuck supporte aussi les rubs plus complexes avec du paprika fumé, de l''ail en poudre et un soupçon de cassonade.

## La cuisson

### Température
- Fumoir à **121°C (250°F)**
- Bois de chêne ou hickory

### Sans wrap
Le chuck roast a assez de gras pour tenir sans wrap. La bark sera spectaculaire. Comptez **5 à 6 heures**.

### Avec wrap
Pour accélérer ou si la pièce est maigre, wrappez à **74°C** interne dans du papier boucher. Comptez **4 à 5 heures** total.

### Température cible
- **96°C** interne pour un chuck effiloché style pulled beef
- **93°C** pour un chuck tranché

## Service

Le chuck roast se prête à deux présentations :
- **Tranché** : comme une brisket, en tranches épaisses contre le grain
- **Effiloché** : en pulled beef pour des sandwichs spectaculaires

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Température fumoir | 121°C (250°F) |
| Température cible | 93–96°C interne |
| Wrap | optionnel à 74°C |
| Repos | 20–30 min |
| Durée totale | 4–6h selon poids |',
'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&h=400&fit=crop',
'viande', '{chuck_roast,paleron,pulled_beef,low_and_slow,boeuf}', 'chuck_roast',
'Guide chuck roast (paleron) au fumoir — Charbon & Flamme',
'Comment fumer un chuck roast (paleron) au barbecue : la brisket du pauvre qui rivalise avec les grands. Guide complet.',
7, 'published'),

-- ── POULET ENTIER ────────────────────────────────────────
('Poulet entier au fumoir : peau croustillante, chair juteuse', 'guide-poulet-entier',
'Fumer un poulet entier demande une approche différente du low & slow classique. Plus chaud, plus rapide, et une peau qui craque.',
'## Le défi du poulet fumé

Le poulet au fumoir pose un défi unique : comment obtenir une **peau croustillante** avec une cuisson basse température ? La réponse : on fume **plus chaud** que le bœuf.

En dessous de 130°C, la graisse sous-cutanée du poulet ne rend pas assez et la peau reste **molle et caoutchouteuse**. C''est l''erreur numéro 1 des débutants.

## Préparation

### Le spatchcock (papillon)
Technique fortement recommandée : retirez la colonne vertébrale aux ciseaux et aplatissez le poulet. Avantages :
- Cuisson **30% plus rapide**
- Peau uniformément exposée à la chaleur
- Plus de surface de bark

### Assaisonnement
1. **Séchez bien** le poulet (essuie-tout partout, dedans et dehors)
2. Appliquez une fine couche d''huile d''olive
3. Rub : paprika fumé, ail en poudre, oignon en poudre, sel, poivre, thym séché
4. Optionnel : laissez sécher au frigo une nuit à découvert (peau encore plus croustillante)

## La cuisson

### Température
- **150–165°C (300–325°F)** — c''est plus chaud que le low & slow classique
- Bois fruitiers : pommier, cerisier, ou pêcher. Le hickory est trop fort pour la volaille.

### Durée
- Poulet entier (1.5–2.5 kg) : **2 à 3 heures**
- Spatchcock : **1.5 à 2.5 heures**

### Température cible
- **74°C** dans la cuisse (partie la plus épaisse, sans toucher l''os)
- La poitrine atteindra environ 71°C — c''est parfait

### Astuce peau croustillante
Les 10 dernières minutes, montez à **200°C** ou finissez sous le grill pour crisper la peau.

## Repos

5 à 10 minutes maximum. Contrairement au bœuf, le poulet ne bénéficie pas d''un long repos. Servez rapidement pour garder la peau croustillante.

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Température fumoir | 150–165°C |
| Température cible | 74°C (cuisse) |
| Format | Spatchcock recommandé |
| Repos | 5–10 min |
| Durée totale | 1.5–3h |',
'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&h=400&fit=crop',
'viande', '{whole_chicken,poulet,spatchcock,volaille,peau_croustillante}', 'whole_chicken',
'Guide poulet entier au fumoir — Charbon & Flamme',
'Comment fumer un poulet entier au barbecue : spatchcock, température, bois et astuce peau croustillante.',
8, 'published'),

-- ── PRIME RIB ────────────────────────────────────────────
('Prime rib au fumoir : le rôti de fête ultime', 'guide-prime-rib',
'La côte de bœuf entière fumée puis saisie — le plat le plus impressionnant que vous puissiez servir.',
'## La pièce royale

La **prime rib** (côte de bœuf entière, ou train de côtes) est le rôti le plus noble du bœuf. Fumée au bois puis saisie à haute température, c''est un plat spectaculaire pour les grandes occasions.

### Choisir sa pièce
- **3 à 4 côtes** (2.5 à 5 kg) pour 6 à 10 personnes
- Demandez la partie « loin end » (côtes 10-12) qui est plus tendre
- Persillage important = meilleur résultat
- Demandez au boucher de détacher et ficeler les os (frenching optionnel)

## Assaisonnement

La prime rib mérite un assaisonnement simple qui met en valeur la viande :
- Sel casher généreux (10g par kg)
- Poivre noir concassé
- Ail en poudre
- Romarin frais haché (optionnel)

Salez la veille et laissez reposer à découvert au frigo. Le sel va pénétrer et la surface va sécher — parfait pour la bark.

## La cuisson (reverse sear)

### Phase 1 — Fumage
- Fumoir à **107°C (225°F)**
- Bois de chêne léger ou mesquite
- Sonde dans le centre de la viande, loin des os
- Sortez à **6°C avant** votre cible :
  - Saignant : sortir à **46°C**
  - Medium rare : sortir à **48°C** (recommandé)
  - Medium : sortir à **54°C**

### Phase 2 — Repos
- 20 à 30 minutes sous aluminium lâche
- La température va monter de 3 à 5°C

### Phase 3 — Saisie
- Four à **260°C** ou grill au maximum
- 8 à 12 minutes jusqu''à ce que la surface soit dorée et croustillante
- Ou : chalumeau de cuisine pour un contrôle précis

## Découpe

Retirez la ficelle, séparez les os. Tranchez en tranches de **1 à 1.5 cm** perpendiculairement aux os. Servez avec le jus de cuisson.

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Température fumoir | 107°C (225°F) |
| Cible medium rare | 54°C interne |
| Méthode | Reverse sear |
| Repos | 20–30 min |
| Durée totale | 3–5h + saisie |',
'https://images.unsplash.com/photo-1504973960431-1c1c6264cb63?w=800&h=400&fit=crop',
'viande', '{prime_rib,cote_de_boeuf,reverse_sear,roti,fete}', 'prime_rib',
'Guide prime rib au fumoir (reverse sear) — Charbon & Flamme',
'Comment fumer une prime rib (côte de bœuf) au barbecue avec le reverse sear. Le guide pour un rôti de fête parfait.',
9, 'published'),

-- ── TOMAHAWK ─────────────────────────────────────────────
('Tomahawk au fumoir : le steak spectaculaire', 'guide-tomahawk',
'Le steak tomahawk fumé au reverse sear — une présentation digne d''un restaurant avec le goût du feu de bois.',
'## Le tomahawk, c''est quoi ?

Le **tomahawk** est une côte de bœuf individuelle avec le manche de l''os laissé entier (environ 30 cm). C''est essentiellement un **ribeye bone-in géant** de 800g à 1.5 kg. L''os ne change pas le goût mais la présentation est spectaculaire.

### Choisir son tomahawk
- Épaisseur minimum **5 cm** (c''est essentiel pour le reverse sear)
- Bon persillage (grade Choice minimum, Prime idéal)
- Sortez-le du frigo **1 heure** avant la cuisson

## Assaisonnement

Minimaliste : sel de mer en flocons + poivre noir concassé. Le beurre et les herbes viendront à la fin.

## La cuisson (reverse sear)

### Phase 1 — Fumage indirect
- Fumoir ou grill en zone indirecte à **107–120°C**
- Un morceau de bois de chêne ou cerisier pour une fumée légère
- Sonde dans le centre, loin de l''os

### Température de sortie
Retirez **6°C avant** la cible finale :
- Blue : sortir à **40°C**
- Saignant : sortir à **46°C**
- Medium rare : sortir à **48°C**
- Medium : sortir à **54°C**

### Phase 2 — Saisie
- Grill au maximum, poêle en fonte sur feu vif, ou chalumeau
- **45 à 90 secondes par face**
- La surface DOIT être sèche — séchez avec un essuie-tout avant de saisir
- N''oubliez pas les bords

### Phase 3 — Finition
- Repos 5 à 8 minutes
- Noisette de beurre + romarin + ail écrasé sur le dessus
- Fleur de sel au service

## Découpe

Détachez la viande de l''os en un seul morceau. Tranchez en lamelles de 1 cm contre le grain. Replacez les tranches contre l''os pour le service.

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Température fumoir | 107–120°C |
| Cible medium rare | 54°C interne |
| Méthode | Reverse sear |
| Saisie | 45–90 sec / face |
| Durée totale | 1.5–2.5h + saisie |',
'https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=400&fit=crop',
'viande', '{tomahawk,steak,reverse_sear,ribeye,saisie}', 'tomahawk',
'Guide tomahawk au fumoir (reverse sear) — Charbon & Flamme',
'Comment fumer et saisir un tomahawk parfait : reverse sear, températures et finition au beurre.',
10, 'published'),


-- ── GUIDES TECHNIQUES TRANSVERSAUX ──────────────────────

-- ── GESTION DU STALL ─────────────────────────────────────
('Comprendre et gérer le stall en barbecue', 'guide-stall-bbq',
'Le stall est le cauchemar des débutants. Voici la science derrière le phénomène et les méthodes pour le gérer.',
'## Qu''est-ce que le stall ?

Le **stall** (plateau thermique) est ce moment frustrant où la température interne de votre viande **cesse de monter** pendant 2 à 4 heures. Il se produit généralement entre **65°C et 77°C** et touche toutes les grosses pièces : brisket, pulled pork, chuck roast, short ribs.

## La science du stall

Le phénomène s''appelle **refroidissement évaporatif**. Quand la viande atteint 65°C, l''humidité à sa surface commence à s''évaporer massivement. Cette évaporation refroidit la surface exactement comme la transpiration refroidit votre peau.

Le fumoir chauffe la viande, mais l''évaporation la refroidit. Les deux forces s''équilibrent → la température stagne.

## Combien de temps dure-t-il ?

Ça dépend de plusieurs facteurs :
- **Taille de la pièce** : plus c''est gros, plus c''est long
- **Humidité du fumoir** : un fumoir humide prolonge le stall
- **Température du fumoir** : plus chaud = stall plus court mais toujours présent
- Typiquement : **2 à 5 heures** pour une brisket de 5 kg

## Les 3 stratégies

### 1. La patience
Laissez passer. Le stall finit toujours par se terminer quand toute l''humidité de surface s''est évaporée. C''est l''approche puriste qui donne la bark la plus développée.

### 2. Le Texas Crutch (wrap)
Emballez la viande dans du papier boucher ou de l''aluminium. Cela bloque l''évaporation et la température repart immédiatement.

- **Papier boucher** : laisse respirer, préserve la bark, perd un peu de vitesse
- **Aluminium** : plus rapide, mais la bark ramollit

Wrappez quand la bark est formée, généralement vers **68–76°C** interne.

### 3. Le hot & fast
Fumez à **135–150°C** au lieu de 107–121°C. Le stall existe toujours mais dure beaucoup moins longtemps car la puissance thermique du fumoir surpasse le refroidissement évaporatif.

## Erreurs à éviter

- **Ouvrir le fumoir** pour vérifier → vous perdez chaleur et prolongez le stall
- **Monter la température** en panique → risque de sécher la viande
- **Se fier au chrono** au lieu de la sonde → chaque pièce est différente

## Quelles viandes sont touchées ?

| Viande | Stall typique |
|--------|---------------|
| Brisket | 65–77°C, 2–5h |
| Pulled pork | 63–74°C, 2–4h |
| Chuck roast | 65–77°C, 1–3h |
| Short ribs | 65–77°C, 1–3h |
| Poulet | Pas de stall notable |
| Ribs | Léger stall possible |',
'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
'technique', '{stall,plateau_thermique,wrap,texas_crutch,debutant}', null,
'Comprendre le stall en BBQ — Charbon & Flamme',
'Le stall expliqué : pourquoi la température stagne, combien de temps ça dure et comment le gérer. Guide complet.',
11, 'published'),

-- ── LE WRAP ──────────────────────────────────────────────
('Papier boucher vs aluminium : le guide du wrap', 'guide-wrap-papier-alu',
'Quand wrapper, avec quoi, et pourquoi. Tout ce qu''il faut savoir sur le Texas Crutch.',
'## Pourquoi wrapper ?

Le **wrap** (ou Texas Crutch) a deux objectifs :
1. **Raccourcir le stall** en bloquant l''évaporation
2. **Accélérer la cuisson** de 1 à 3 heures selon la pièce

## Papier boucher vs aluminium

### Papier boucher (Pink Butcher Paper)
- Laisse passer un peu de vapeur → la bark reste **sèche et croustillante**
- Accélère la cuisson mais moins que l''alu
- C''est le choix de la majorité des compétiteurs et d''Aaron Franklin
- Utilisez du papier kraft alimentaire non blanchi, non ciré

### Aluminium
- Hermétique → cuisson **plus rapide** mais la bark **ramollit**
- Retient tout le jus → résultat plus juteux et tendre
- Idéal pour le pulled pork ou si la tendreté prime sur la bark
- Aussi utilisé en méthode 3-2-1 pour les ribs

### Pas de wrap
- La bark la plus développée et la plus fumée
- Cuisson plus longue
- Risque de dessèchement sur les pièces maigres
- Parfait pour les short ribs et les pièces très persillées

## Quand wrapper ?

La règle : wrappez quand la **bark est formée**, pas quand vous atteignez une température précise. En pratique :
- **Brisket** : 68–74°C interne (bark sèche et sombre)
- **Pulled pork** : 74–76°C interne
- **Ribs** : après 3h de fumage (méthode 3-2-1)

## Technique de wrap

### Papier boucher
1. Deux feuilles superposées, assez grandes pour envelopper 2 fois
2. Posez la viande au centre
3. Pliez bien serré, sans laisser d''air
4. Remettez au fumoir sonde à travers le papier

### Aluminium
1. Double épaisseur d''alu résistant
2. Ajoutez un liquide : jus de pomme, beurre fondu, ou jus de cuisson
3. Fermez hermétiquement
4. Sonde à travers l''alu

## Résumé

| | Papier boucher | Aluminium | Sans wrap |
|---|---|---|---|
| Bark | Croustillante | Ramollie | Maximale |
| Vitesse | Rapide | Plus rapide | Lent |
| Jutosité | Bonne | Excellente | Variable |
| Choix idéal | Brisket | Ribs, pulled pork | Short ribs |',
'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=400&fit=crop',
'technique', '{wrap,texas_crutch,papier_boucher,aluminium,bark}', null,
'Papier boucher vs aluminium pour le wrap — Charbon & Flamme',
'Papier boucher ou aluminium ? Quand et comment wrapper sa viande au fumoir. Comparaison complète.',
12, 'published'),

-- ── GESTION DU FEU ───────────────────────────────────────
('Maîtriser son feu : la clé d''un bon BBQ', 'guide-gestion-feu',
'Le feu est l''outil principal du pitmaster. Charbon, bois, ventilation — voici comment le dompter.',
'## Le triangle du feu en BBQ

Trois paramètres contrôlent votre cuisson :
1. **Le combustible** : charbon, bois ou pellets
2. **L''oxygène** : ventilation haute et basse
3. **La chaleur** : température du fumoir

Maîtriser ces trois éléments, c''est maîtriser le BBQ.

## Les combustibles

### Charbon de bois (briquettes vs lump)
- **Briquettes** : température constante, durée de combustion longue, idéal pour les longues cuissons
- **Lump charcoal** (morceaux naturels) : monte plus vite en température, saveur plus propre, brûle plus vite

### Bois de fumage
Le bois ajoute la saveur fumée. Utilisez des **chunks** (morceaux de 5-8 cm) ou des **chips** (copeaux).

| Bois | Intensité | Idéal pour |
|------|-----------|------------|
| Pommier | Légère, sucrée | Volaille, porc |
| Cerisier | Légère, fruitée | Porc, volaille |
| Hickory | Moyenne, bacon | Porc, bœuf |
| Chêne | Moyenne, polyvalente | Tout |
| Mesquite | Forte, terreuse | Bœuf texan |
| Noyer | Forte | Viandes rouges |

### Pellets
Sciure de bois compressée. Utilisés dans les fumoirs à pellets (Traeger, etc.). Pratiques mais saveur fumée moins intense qu''avec des chunks.

## La ventilation

La ventilation contrôle l''oxygène et donc la température :
- **Ventilation basse (intake)** : contrôle principal de la température. Plus ouverte = plus chaud.
- **Ventilation haute (exhaust)** : doit rester **toujours au moins à moitié ouverte** pour évacuer la fumée âcre.

### Règle d''or
Ajustez la température par le bas (intake), laissez le haut ouvert. Ne fermez jamais complètement la ventilation haute — une fumée stagnante rend la viande amère.

## La méthode Minion

Pour les fumoirs au charbon (Weber Smokey Mountain, kettle, etc.) :
1. Remplissez le panier de charbon non allumé
2. Ajoutez 10-15 briquettes allumées sur le dessus
3. Le feu se propage lentement → **8 à 12 heures de cuisson stable**

C''est la technique standard pour le low & slow sans intervention.

## Maintenir une température stable

- Visez **±5°C** autour de votre cible
- Ajustez la ventilation par **petits incréments** et attendez 15 minutes avant de réajuster
- N''ouvrez le couvercle que quand c''est nécessaire (chaque ouverture = 10-15 min de récupération)
- Un thermomètre de fumoir précis est indispensable (le thermomètre intégré ment souvent de 10-15°C)',
'https://images.unsplash.com/photo-1470753937643-360eb5ae9b34?w=800&h=400&fit=crop',
'technique', '{feu,charbon,bois,ventilation,temperature,minion,fumoir}', null,
'Maîtriser le feu au barbecue — Charbon & Flamme',
'Comment gérer le feu au fumoir : charbon, bois, ventilation et méthode Minion. Le guide du pitmaster.',
13, 'published'),

-- ── LE REPOS ─────────────────────────────────────────────
('Le repos de la viande : pourquoi c''est non négociable', 'guide-repos-viande',
'Le repos est souvent négligé mais c''est l''étape qui fait la différence entre une bonne cuisson et une cuisson exceptionnelle.',
'## Pourquoi reposer la viande ?

Pendant la cuisson, les fibres musculaires se contractent et poussent les jus vers le centre de la viande. Si vous tranchez immédiatement, ces jus s''écoulent sur la planche au lieu de rester dans la viande.

Le repos permet aux fibres de **se détendre** et aux jus de **se redistribuer** uniformément. Résultat : chaque tranche est juteuse.

## Combien de temps ?

| Type de pièce | Repos minimum | Repos idéal |
|---------------|---------------|-------------|
| Steaks / tomahawk | 5 min | 8–10 min |
| Côte de bœuf / prime rib | 15 min | 20–30 min |
| Brisket | 60 min | 1–2 heures |
| Pulled pork | 30 min | 45–60 min |
| Ribs | 10 min | 15 min |
| Poulet | 5 min | 10 min |

## La méthode de la glacière (faux cambro)

Pour les grosses pièces (brisket, pulled pork), la méthode de la glacière est incontournable :
1. Emballez la viande dans du papier boucher
2. Enveloppez dans une serviette éponge
3. Placez dans une glacière **préchauffée** (versez de l''eau chaude, videz, séchez)
4. Fermez le couvercle

La viande restera à **70°C+** pendant **4 à 6 heures**. C''est la technique des compétiteurs pour gérer le timing du service.

## Erreurs courantes

- **Pas de repos du tout** : vous perdez 20 à 30% des jus
- **Repos trop long sans isolation** : la viande refroidit et le gras fige
- **Emballer hermétiquement un steak** : la vapeur ramollit la croûte. Pour les steaks, repos sous aluminium lâche ou à l''air libre
- **Trancher le mauvais côté** : toujours repérer le sens du grain avant le repos

## Le carryover cooking

La température interne continue à monter pendant le repos — c''est le **carryover**. Pour les pièces en reverse sear, prévoyez :
- Steaks fins : +2°C
- Steaks épais / tomahawk : +3 à 5°C
- Rôtis (prime rib) : +3 à 5°C
- Brisket / pulled pork : +1 à 2°C (déjà à haute température, le carryover est faible)',
'https://images.unsplash.com/photo-1432139509613-5c4255a1d197?w=800&h=400&fit=crop',
'technique', '{repos,carryover,glaciere,jus,tendrete}', null,
'Le repos de la viande au barbecue — Charbon & Flamme',
'Pourquoi et comment reposer sa viande après cuisson : durées, méthode de la glacière et carryover cooking.',
14, 'published'),

-- ── CHOISIR SON FUMOIR ───────────────────────────────────
('Quel fumoir choisir pour débuter ?', 'guide-choisir-fumoir',
'Offset, kettle, pellet, bullet — chaque type de fumoir a ses avantages. Voici comment choisir le bon.',
'## Les types de fumoirs

### Weber Smokey Mountain (Bullet Smoker)
Le **meilleur rapport qualité/prix** pour débuter en low & slow.
- Prix : 300–500€
- Maintient la température facilement pendant 8+ heures
- Compact, idéal pour les terrasses
- Limité en surface de cuisson pour les très grandes pièces

### Fumoir offset
Le **fumoir traditionnel** des pitmasters texans. Le foyer est séparé de la chambre de cuisson.
- Prix : 500€ à 5000€+
- Saveur fumée inégalable
- Demande plus d''attention et d''expérience
- Les modèles bon marché fuient et sont difficiles à réguler

### Weber Kettle
Le barbecue le plus polyvalent. Peut faire du grilling, du smoking, du reverse sear.
- Prix : 150–400€
- Méthode snake (serpent de briquettes) pour le low & slow
- Surface limitée
- Moins stable en température qu''un bullet ou offset

### Fumoir à pellets (Traeger, Weber SmokeFire, etc.)
Le **set and forget**. Un contrôleur électronique gère la température.
- Prix : 600–2500€
- Facilité d''utilisation maximale
- Température ultra stable
- Saveur fumée moins intense
- Dépendance à l''électricité

### Kamado (Big Green Egg, Kamado Joe)
Fumoir en céramique polyvalent et ultra performant.
- Prix : 800–3000€
- Isolation thermique exceptionnelle (très peu de charbon)
- Polyvalent : pizza, grilling, smoking
- Fragile et lourd

## Quel fumoir pour quel profil ?

| Profil | Fumoir recommandé |
|--------|-------------------|
| Débutant absolu | Weber Kettle (polyvalent, pas cher) |
| Passionné low & slow | Weber Smokey Mountain |
| Confort avant tout | Fumoir à pellets |
| Puriste | Offset (budget 1000€+) |
| Tout terrain | Kamado |

## Conseil clé

Le meilleur fumoir est celui que vous **utilisez**. Ne surinvestissez pas au début. Un Weber Kettle à 200€ produit d''excellents résultats entre de bonnes mains. La technique compte plus que le matériel.',
'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=400&fit=crop',
'equipement', '{fumoir,weber,offset,pellet,kamado,kettle,debutant}', null,
'Quel fumoir choisir pour débuter ? — Charbon & Flamme',
'Comparatif des fumoirs : offset, kettle, pellet, bullet et kamado. Le guide pour choisir son premier fumoir.',
15, 'published'),

-- ── THERMOMÈTRE ──────────────────────────────────────────
('Le thermomètre : l''outil indispensable du pitmaster', 'guide-thermometre',
'Sans thermomètre précis, vous cuisinez à l''aveugle. Voici lesquels choisir et comment les utiliser.',
'## Pourquoi un thermomètre est indispensable

La règle numéro 1 du BBQ : **c''est la sonde qui décide, pas le chrono**. Chaque pièce de viande est différente. Deux briskets du même poids peuvent avoir 2 heures d''écart de cuisson.

## Les deux types essentiels

### 1. Thermomètre instantané (à main)
Pour les lectures ponctuelles rapides.
- **Référence** : ThermoWorks Thermapen ONE (lecture en 1 sec, ±0.3°C)
- **Budget** : ThermoWorks ThermoPop (3 sec, ±1°C)
- Usage : vérifier la température interne, tester la tendreté (le « probe test »)

### 2. Thermomètre à sonde fixe (leave-in)
Reste dans la viande pendant toute la cuisson.
- **Filaire** : ThermoWorks Smoke, Maverick
- **Bluetooth** : MEATER, Combustion Inc
- **WiFi** : ThermoWorks Signals, FireBoard
- Usage : surveiller la montée en température sans ouvrir le fumoir

## Où placer la sonde ?

- **Brisket** : dans la partie la plus épaisse du flat, horizontalement
- **Pulled pork** : au centre de la pièce, loin de l''os
- **Ribs** : entre deux os, dans la partie la plus charnue
- **Poulet** : dans la cuisse, partie la plus épaisse, sans toucher l''os
- **Steaks** : par le côté, sonde au centre exact

### Règles générales
- Évitez les poches de gras (elles donnent une lecture trop basse)
- Évitez de toucher les os (ils conduisent la chaleur et faussent la lecture)
- Insérez la sonde dans le **centre thermique** (le point le plus froid)

## Le probe test (test de tendreté)

Pour les grosses pièces (brisket, pulled pork), la température ne suffit pas. Le **probe test** est le vrai indicateur :
- Insérez votre thermomètre instantané dans la viande
- Il doit entrer **comme dans du beurre mou**, sans résistance
- Si vous sentez une résistance, continuez la cuisson même si la température est atteinte

## Calibration

Testez vos thermomètres régulièrement :
- **Eau glacée** : doit lire 0°C (±1°C)
- **Eau bouillante** : doit lire 100°C (±1°C, ajusté pour l''altitude)',
'https://images.unsplash.com/photo-1585325701165-351af916e581?w=800&h=400&fit=crop',
'equipement', '{thermometre,sonde,temperature,thermoworks,probe_test}', null,
'Guide thermomètre BBQ — Charbon & Flamme',
'Quel thermomètre choisir pour le barbecue, où placer la sonde et comment faire le probe test. Guide complet.',
16, 'published');
