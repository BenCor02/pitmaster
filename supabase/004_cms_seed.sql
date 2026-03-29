-- ============================================================
-- SEED DATA — Contenus CMS (adapté France)
-- ============================================================

-- ── SEO BLOCKS ─────────────────────────────────────────────

insert into public.seo_blocks (title, slug, content, meat_type, cooking_method, is_global, sort_order, status) values

('Combien de temps pour fumer un brisket ?', 'temps-cuisson-brisket',
'Le brisket (pointe de poitrine de bœuf) est la pièce reine du barbecue low & slow. Comptez entre **8 et 12 heures** de cuisson pour un brisket de 4 à 6 kg à 120°C (250°F), emballage inclus.

La durée exacte dépend de plusieurs facteurs : l''épaisseur de la pièce, la quantité de gras, la stabilité de votre fumoir, et surtout le fameux **stall** — ce plateau thermique entre 65°C et 77°C où la température à cœur semble stagner pendant des heures.

**Règle d''or** : ne vous fiez jamais au chrono. C''est la **sonde thermique** qui décide. Votre brisket est prêt quand la sonde entre comme dans du beurre, généralement entre 93°C et 98°C à cœur.

En France, le brisket se commande chez des bouchers en ligne spécialisés (Pourdebon, Le Goût du Bœuf, Maison Lascours) ou sur commande chez votre boucher artisan.',
'brisket', 'low_and_slow', false, 1, 'published'),

('Guide complet du pulled pork', 'guide-pulled-pork-cuisson',
'Le pulled pork (effiloché de porc) est le point d''entrée idéal pour débuter en barbecue low & slow. Moins exigeant qu''un brisket, il pardonne davantage les erreurs de température.

En France, la pièce idéale est l''**échine de porc** — bien persillée et disponible chez tous les bouchers. La **palette** ou l''**épaule entière** fonctionnent aussi très bien.

Comptez **10 à 14 heures** à 120°C (250°F) pour une pièce de 3 à 5 kg. Le stall arrive généralement entre 63°C et 74°C à cœur. L''emballage (papier kraft ou aluminium) accélère la fin de cuisson d''environ 1 à 2 heures.

**Température cible** : 93–96°C à cœur. L''os doit tourner librement et la viande doit s''effiler sans effort avec deux fourchettes.',
'pulled_pork', 'low_and_slow', false, 2, 'published'),

('Qu''est-ce que le stall en barbecue ?', 'comprendre-stall-bbq',
'Le **stall** (ou plateau thermique) est un phénomène redouté par les débutants mais parfaitement normal. Entre 65°C et 77°C à cœur, la température de la viande semble stagner — parfois pendant 2 à 4 heures.

**Pourquoi ?** L''humidité à la surface de la viande s''évapore et refroidit la pièce, exactement comme la transpiration refroidit le corps. Ce phénomène s''appelle le refroidissement par évaporation.

**Comment le gérer ?**
- **Patience** : le stall finit toujours par passer
- **Texas crutch** : emballer la viande dans du papier kraft alimentaire ou de l''aluminium pour bloquer l''évaporation
- **Ne pas monter la température** du fumoir — ça n''aide pas et risque de sécher la viande',
null, null, true, 3, 'published');


-- ── FAQ (originales) ──────────────────────────────────────

insert into public.faqs (question, answer, meat_type, cooking_method, is_global, sort_order, status) values

('Quand faut-il emballer le brisket ?',
'Emballez quand la croûte est bien formée, sèche au toucher et de couleur sombre. En température, c''est généralement entre **68°C et 74°C** à cœur. Le papier kraft donne une meilleure croûte que l''aluminium.',
'brisket', 'low_and_slow', false, 1, 'published'),

('Papier kraft ou aluminium pour l''emballage ?',
'**Papier kraft alimentaire** : laisse respirer la viande, préserve mieux la croûte, résultat plus sec en surface. C''est le choix des compétiteurs. **Aluminium** : plus hermétique, cuisson plus rapide, mais la croûte ramollit. Idéal pour un résultat très tendre et juteux.',
null, null, true, 2, 'published'),

('Comment savoir si ma viande est prête ?',
'Oubliez le chrono. Utilisez un **thermomètre sonde** et testez la tendreté. Pour le bœuf low & slow (brisket, beef ribs), la sonde doit entrer sans résistance vers 93–98°C. Pour les ribs, faites le **test de flexion** : soulevez le rack par le milieu, il doit plier nettement.',
null, null, true, 3, 'published'),

('À quelle température fumer un poulet entier ?',
'Fumez votre poulet entre **150°C et 165°C** (300–325°F). En dessous de 130°C, la peau reste molle et caoutchouteuse. Température cible : **74°C** dans la cuisse. Astuce : finissez 10 minutes à feu vif pour crisper la peau. Utilisez un bon poulet fermier Label Rouge ou Bresse pour un résultat optimal.',
'whole_chicken', 'low_and_slow', false, 4, 'published'),

('Comment gérer le stall sur un pulled pork ?',
'Le stall sur une échine de porc arrive entre 63°C et 74°C à cœur et peut durer 2 à 4 heures. Deux options : **patience** (laisser passer) ou **emballage** dans du papier kraft avec un filet de jus de pomme vers 70–76°C à cœur. L''emballage raccourcit le stall d''environ 1 à 2 heures.',
'pulled_pork', 'low_and_slow', false, 5, 'published');


-- ── AFFILIATE TOOLS ────────────────────────────────────────

insert into public.affiliate_tools (title, slug, description, image_url, affiliate_url, cta_text, badge, product_type, is_global, sort_order, status) values

('ThermoWorks Thermapen ONE',
'thermapen-one',
'Le thermomètre instantané de référence. Lecture en 1 seconde, précision ±0,3°C. Utilisé par Aaron Franklin et la plupart des pitmasters pro. Livraison en France disponible.',
null,
'https://www.thermoworks.com/thermapen-one',
'Voir le prix',
'Essentiel',
'thermometre',
true, 1, 'published'),

('Papier kraft alimentaire (Pink Butcher Paper)',
'papier-boucher-rose',
'Le papier kraft alimentaire utilisé par les pitmasters texans pour l''emballage. Laisse respirer la viande, préserve la croûte tout en accélérant la cuisson. Disponible en rouleau sur Amazon France ou chez Esprit Barbecue.',
null,
'https://amzn.to/example-butcher-paper',
'Voir sur Amazon',
'Recommandé',
'accessoire',
true, 2, 'published'),

('Gants BBQ résistants chaleur',
'gants-bbq-chaleur',
'Gants en aramide résistants jusqu''à 500°C. Indispensables pour manipuler les pièces chaudes, ajuster les grilles et gérer le charbon en toute sécurité.',
null,
'https://amzn.to/example-bbq-gloves',
'Voir sur Amazon',
null,
'accessoire',
true, 3, 'published'),

('ThermoPro TP20 — Thermomètre sans fil double sonde',
'thermopro-tp20',
'Thermomètre sans fil avec double sonde : une pour la viande, une pour le fumoir. Portée de 90m, alertes sonores. Le meilleur rapport qualité/prix disponible sur Amazon France (~30€).',
null,
'https://amzn.to/example-thermopro-tp20',
'Voir sur Amazon',
'Bon rapport qualité/prix',
'thermometre',
false, 4, 'published');


-- ── GUIDES (originaux, révisés) ───────────────────────────

insert into public.guides (title, slug, summary, content, cover_url, category, tags, meat_type, seo_title, seo_description, sort_order, status) values

('Le guide complet du brisket', 'guide-brisket',
'Tout ce qu''il faut savoir pour réussir un brisket au fumoir : où l''acheter en France, assaisonnement, stall, emballage et repos.',
'## Trouver un brisket en France

Le brisket (pointe de poitrine de bœuf) n''est pas une découpe courante en boucherie française traditionnelle. Voici où en trouver :

### En ligne (livraison France)
- **Pourdebon** : viande artisanale, brisket Angus
- **Le Goût du Bœuf** : brisket calibré pour le fumage
- **Maison Lascours** : brisket Black Angus de qualité
- **Guarda Pampa** : Angus ibérique

### Chez le boucher
Demandez une **pointe de poitrine de bœuf entière** de 4 à 7 kg avec un bon persillage. Prévenez votre boucher 3 à 4 jours à l''avance. Si possible, choisissez une race **Angus** pour le persillage, ou **Aubrac/Salers** pour le goût.

### Ce qu''il faut regarder
- Épaisseur uniforme du flat (éviter les pièces qui s''amincissent trop)
- Bon cap de gras sur le dessus (1 à 2 cm)
- Viande de couleur rouge profond avec du persillage visible

## Assaisonnement

La tradition texane est minimaliste : **sel + poivre**, en parts égales (le fameux « dalmatien »). C''est le choix d''Aaron Franklin et de la majorité des pitmasters.

Pour 5 kg de brisket, comptez environ 60 g de gros sel et 60 g de poivre noir concassé grossièrement.

## La cuisson

### Température du fumoir
- **107°C (225°F)** : méthode traditionnelle, saveur fumée maximale
- **121°C (250°F)** : le sweet spot compétition, bon compromis
- **135°C (275°F)** : hot & fast, pour quand le temps presse

### Quel bois ?
Le chêne ou le hêtre sont parfaits et faciles à trouver en France. Les sarments de vigne apportent une touche raffinée.

### Le stall
Entre 65°C et 77°C à cœur, la température va stagner. C''est normal. Deux options :
1. **Patience** — laisser passer naturellement
2. **Texas crutch** — emballer dans du papier kraft entre 68°C et 74°C

### Quand c''est prêt
La sonde doit entrer **comme dans du beurre** entre 93°C et 98°C à cœur. C''est la tendreté qui décide, pas le thermomètre seul.

## Le repos

Le repos est **aussi important que la cuisson**. Minimum 1 heure, idéalement 2 heures dans une glacière fermée (sans glace, préchauffée à l''eau chaude). La température va se stabiliser autour de 70°C.

## Résumé

| Paramètre | Valeur |
|-----------|--------|
| Température fumoir | 107–135°C |
| Température cible | 93–98°C à cœur |
| Emballage | 68–74°C (optionnel) |
| Repos | 1–2 heures minimum |
| Durée totale | 8–14 heures selon poids |',
'https://images.pexels.com/photos/12645502/pexels-photo-12645502.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'viande', '{brisket,low_and_slow,stall,emballage,repos}', 'brisket',
'Guide complet brisket au fumoir — Charbon & Flamme',
'Comment réussir un brisket au barbecue : où l''acheter en France, assaisonnement, stall et repos. Le guide pitmaster.',
1, 'published'),

('Maîtriser la saisie inversée (reverse sear)', 'guide-reverse-sear',
'La technique préférée des passionnés de viande pour une cuisson parfaitement uniforme du bord au centre.',
'## Qu''est-ce que la saisie inversée ?

La **saisie inversée** (reverse sear) inverse la méthode classique : au lieu de saisir d''abord puis cuire doucement, on fait l''inverse. Cuisson lente d''abord (fumoir ou four), puis saisie violente à la fin.

### Pourquoi ça marche ?
- Cuisson **parfaitement uniforme** du bord au centre (pas de bande grise)
- Meilleure **réaction de Maillard** (surface plus sèche = meilleure croûte)
- **Contrôle total** de la cuisson à cœur

## La méthode

### 1. Cuisson indirecte
Placez votre pièce en zone indirecte à **107–120°C**. Laissez monter lentement la température à cœur.

### 2. Sortir au bon moment
Retirez la viande **6°C avant** votre température cible :
- Saignant : sortir à **46°C** (cible 52°C)
- À point rosé : sortir à **48°C** (cible 54°C)
- À point : sortir à **54°C** (cible 60°C)

### 3. La saisie
Feu **maximum**. Poêle en fonte, barbecue, ou chalumeau. 45 à 60 secondes par face. La surface doit être **sèche** avant la saisie — essuyez avec un essuie-tout.

### 4. Repos
5 à 10 minutes sous aluminium lâche. La cuisson résiduelle fait monter la température jusqu''à la cible.

## Pièces idéales
- Côte de bœuf / train de côtes
- Tomahawk
- Toute entrecôte épaisse (>3 cm)
- Rack de côtes de veau',
'https://images.pexels.com/photos/12261087/pexels-photo-12261087.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
'technique', '{saisie_inversee,steak,cote_de_boeuf,tomahawk,entrecote}', null,
'Guide saisie inversée (reverse sear) — La technique des passionnés',
'Maîtrisez la saisie inversée : cuisson indirecte + saisie finale pour un steak parfait.',
2, 'published');
