-- ============================================================
-- SEED DATA — Contenus CMS de démonstration
-- ============================================================

-- ── SEO BLOCKS ─────────────────────────────────────────────

insert into public.seo_blocks (title, slug, content, meat_type, cooking_method, is_global, sort_order, status) values

('Combien de temps pour fumer une brisket ?', 'temps-cuisson-brisket',
'La brisket est la pièce reine du barbecue low & slow. Comptez entre **8 et 12 heures** de cuisson pour une brisket de 4 à 6 kg à 120°C (250°F), wrap inclus.

La durée exacte dépend de plusieurs facteurs : l''épaisseur de la pièce, la quantité de gras, la stabilité de votre fumoir, et surtout le fameux **stall** — ce plateau thermique entre 65°C et 77°C où la température interne semble stagner pendant des heures.

**Règle d''or** : ne vous fiez jamais au chrono. C''est la **sonde thermique** qui décide. Votre brisket est prête quand la sonde entre comme dans du beurre, généralement entre 93°C et 98°C interne.',
'brisket', 'low_and_slow', false, 1, 'published'),

('Guide complet du pulled pork', 'guide-pulled-pork-cuisson',
'Le pulled pork (épaule de porc / pork butt) est le point d''entrée idéal pour débuter en barbecue low & slow. Moins exigeant qu''une brisket, il pardonne davantage les erreurs de température.

Comptez **10 à 14 heures** à 120°C (250°F) pour une pièce de 3 à 5 kg. Le stall arrive généralement entre 63°C et 74°C interne. Le wrap (papier boucher ou aluminium) accélère la fin de cuisson d''environ 1 à 2 heures.

**Température cible** : 93–96°C interne. L''os doit tourner librement et la viande doit s''effiler sans effort avec deux fourchettes.',
'pulled_pork', 'low_and_slow', false, 2, 'published'),

('Qu''est-ce que le stall en barbecue ?', 'comprendre-stall-bbq',
'Le **stall** (ou plateau thermique) est un phénomène redouté par les débutants mais parfaitement normal. Entre 65°C et 77°C interne, la température de la viande semble stagner — parfois pendant 2 à 4 heures.

**Pourquoi ?** L''humidité à la surface de la viande s''évapore et refroidit la pièce, exactement comme la transpiration refroidit le corps. Ce phénomène s''appelle le refroidissement évaporatif.

**Comment le gérer ?**
- **Patience** : le stall finit toujours par passer
- **Texas crutch** : emballer la viande dans du papier boucher ou de l''aluminium pour bloquer l''évaporation
- **Ne pas monter la température** du fumoir — ça n''aide pas et risque de sécher la viande',
null, null, true, 3, 'published');


-- ── FAQ ────────────────────────────────────────────────────

insert into public.faqs (question, answer, meat_type, cooking_method, is_global, sort_order, status) values

('Quand faut-il wrapper la brisket ?',
'Emballez votre brisket quand la bark (croûte extérieure) est bien formée, sèche au toucher et de couleur sombre. En température interne, c''est généralement entre **68°C et 74°C**. Le papier boucher donne une meilleure bark que l''aluminium.',
'brisket', 'low_and_slow', false, 1, 'published'),

('Papier boucher ou aluminium pour le wrap ?',
'**Papier boucher** : laisse respirer la viande, préserve mieux la bark, résultat plus sec en surface. C''est le choix des compétiteurs. **Aluminium** : plus hermétique, cuisson plus rapide, mais la bark ramollit. Idéal si vous voulez un résultat très tendre et juteux.',
null, null, true, 2, 'published'),

('Comment savoir si ma viande est prête ?',
'Oubliez le chrono. Utilisez un **thermomètre sonde** et testez la tendreté. Pour le bœuf low & slow (brisket, short ribs), la sonde doit entrer sans résistance vers 93–98°C. Pour les ribs, faites le **flex test** : soulevez le rack par le milieu, il doit plier nettement.',
null, null, true, 3, 'published'),

('À quelle température fumer un poulet entier ?',
'Fumez votre poulet entre **150°C et 165°C** (300–325°F). En dessous de 130°C, la peau reste molle et caoutchouteuse. La température interne cible est **74°C** dans la partie la plus épaisse de la cuisse. Astuce : finissez 10 minutes à feu vif pour crisper la peau.',
'whole_chicken', 'low_and_slow', false, 4, 'published'),

('Comment gérer le stall sur un pulled pork ?',
'Le stall sur un pork butt arrive entre 63°C et 74°C interne et peut durer 2 à 4 heures. Deux options : **patience** (laisser passer naturellement) ou **wrapper** dans du papier boucher avec un peu de jus de pomme vers 70–76°C interne. Le wrap raccourcit le stall d''environ 1 à 2 heures.',
'pulled_pork', 'low_and_slow', false, 5, 'published');


-- ── AFFILIATE TOOLS ────────────────────────────────────────

insert into public.affiliate_tools (title, slug, description, image_url, affiliate_url, cta_text, badge, product_type, is_global, sort_order, status) values

('ThermoWorks Thermapen ONE',
'thermapen-one',
'Le thermomètre instantané de référence. Lecture en 1 seconde, précision ±0.3°C. Utilisé par Aaron Franklin et la plupart des pitmasters pro.',
'https://images.unsplash.com/photo-1585325701165-351af916e581?w=400&h=300&fit=crop',
'https://www.thermoworks.com/thermapen-one',
'Voir le prix',
'Essentiel',
'thermometre',
true, 1, 'published'),

('Papier boucher rose (Pink Butcher Paper)',
'papier-boucher-rose',
'Le papier kraft alimentaire utilisé par les pitmasters texans pour le wrap. Laisse respirer la viande contrairement à l''alu, préserve la bark tout en accélérant la cuisson.',
'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
'https://amzn.to/example-butcher-paper',
'Voir sur Amazon',
'Recommandé',
'accessoire',
true, 2, 'published'),

('Gants BBQ résistants chaleur',
'gants-bbq-chaleur',
'Gants en aramide résistants jusqu''à 500°C. Indispensables pour manipuler les pièces chaudes, ajuster les grilles et gérer le charbon en toute sécurité.',
'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400&h=300&fit=crop',
'https://amzn.to/example-bbq-gloves',
'Voir sur Amazon',
null,
'accessoire',
true, 3, 'published'),

('Thermomètre WiFi multi-sondes',
'thermometre-wifi-multi-sondes',
'Surveillez votre cuisson à distance avec un thermomètre connecté. Plusieurs sondes pour suivre la viande ET la température du fumoir. Alertes sur smartphone.',
'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
'https://amzn.to/example-wifi-thermo',
'Voir sur Amazon',
'Pro',
'thermometre',
false, 4, 'published');


-- ── GUIDES ─────────────────────────────────────────────────

insert into public.guides (title, slug, summary, content, cover_url, category, tags, meat_type, seo_title, seo_description, sort_order, status) values

('Le guide complet de la brisket', 'guide-brisket',
'Tout ce qu''il faut savoir pour réussir une brisket au fumoir : choix de la pièce, assaisonnement, température, stall, wrap et repos.',
'## Choisir sa brisket

La brisket est composée de deux muscles : le **flat** (partie maigre) et le **point** (partie grasse). Pour un résultat optimal, choisissez une brisket **entière** (packer) de 4 à 7 kg avec un bon persillage.

### Ce qu''il faut regarder
- Épaisseur uniforme du flat (éviter les pièces qui s''amincissent trop)
- Bon cap de gras sur le dessus (1 à 2 cm)
- Viande de couleur rouge profond avec du persillage visible
- Flex test : la brisket crue doit plier facilement quand vous la tenez par le milieu

## Assaisonnement

La tradition texane est minimaliste : **sel + poivre**, en parts égales (le fameux « dalmatien rub »). C''est le choix d''Aaron Franklin et de la majorité des pitmasters texans.

Pour 5 kg de brisket, comptez environ 60 g de sel casher et 60 g de poivre noir concassé grossièrement.

## La cuisson

### Température du fumoir
- **107°C (225°F)** : méthode traditionnelle, saveur fumée maximale
- **121°C (250°F)** : le sweet spot compétition, bon compromis temps/saveur
- **135°C (275°F)** : hot & fast, pour quand le temps presse

### Le stall
Entre 65°C et 77°C interne, la température va stagner. C''est normal. Deux options :
1. **Patience** — laisser passer naturellement
2. **Texas crutch** — emballer dans du papier boucher entre 68°C et 74°C

### Quand c''est prêt
La sonde thermique doit entrer **comme dans du beurre** entre 93°C et 98°C interne. C''est la tendreté qui décide, pas le thermomètre seul.

## Le repos

Le repos est **aussi important que la cuisson**. Minimum 1 heure, idéalement 2 heures dans une glacière fermée (sans glace). La température interne va continuer à monter légèrement puis se stabiliser.

## Résumé rapide

| Paramètre | Valeur |
|-----------|--------|
| Température fumoir | 107–135°C |
| Température cible | 93–98°C interne |
| Wrap | 68–74°C (optionnel) |
| Repos | 1–2 heures minimum |
| Durée totale | 8–14 heures selon poids |',
'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=400&fit=crop',
'viande', '{brisket,low_and_slow,stall,wrap,repos}', 'brisket',
'Guide complet brisket au fumoir — Charbon & Flamme',
'Comment réussir une brisket au barbecue : choix de la pièce, température, stall, wrap et repos. Le guide pitmaster de référence.',
1, 'published'),

('Maîtriser le reverse sear', 'guide-reverse-sear',
'La technique préférée des steakhouses pour une cuisson parfaitement uniforme du bord au centre.',
'## Qu''est-ce que le reverse sear ?

Le **reverse sear** inverse la méthode classique : au lieu de saisir d''abord puis cuire doucement, on fait l''inverse. Cuisson lente d''abord (fumoir ou four), puis saisie violente à la fin.

### Pourquoi ça marche ?
- Cuisson **parfaitement uniforme** du bord au centre (pas de bande grise)
- Meilleure **réaction de Maillard** (surface plus sèche = meilleure croûte)
- **Contrôle total** de la cuisson interne
- Résultat digne d''une compétition BBQ

## La méthode

### 1. Cuisson indirecte
Placez votre pièce en zone indirecte à **107–120°C**. Laissez monter lentement la température interne.

### 2. Sortir au bon moment
Retirez la viande **6°C avant** votre température cible :
- Saignant : sortir à **46°C** (cible 52°C)
- Medium rare : sortir à **48°C** (cible 54°C)
- Medium : sortir à **54°C** (cible 60°C)

### 3. La saisie
Feu **maximum**. Poêle en fonte, grill, ou chalumeau. 45 à 60 secondes par face. La surface doit être **sèche** avant la saisie — c''est la clé d''une bonne croûte.

### 4. Repos
5 à 10 minutes sous aluminium lâche. Le carryover va faire monter la température jusqu''à la cible.

## Pièces idéales pour le reverse sear
- Côte de bœuf / Prime rib
- Tomahawk
- Tout steak épais (>3 cm)
- Rack de côtes de veau',
'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=400&fit=crop',
'technique', '{reverse_sear,steak,cote_de_boeuf,tomahawk,saisie}', null,
'Guide reverse sear — La technique des pitmasters pro',
'Maîtrisez le reverse sear : cuisson indirecte + saisie finale pour un steak parfait. Méthode, températures et conseils.',
2, 'published');
