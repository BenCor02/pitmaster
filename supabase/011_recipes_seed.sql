-- ══════════════════════════════════════════════════════════════
-- 011 — Seed recettes (rubs, mops, marinades, injections, glazes)
-- Inspiré des recettes de grands pitmasters (Aaron Franklin,
-- Meathead Goldwyn, Myron Mixon, Tuffy Stone, Malcolm Reed…)
-- ══════════════════════════════════════════════════════════════

INSERT INTO recipes (title, slug, type, summary, description, ingredients, steps, yield_amount, prep_time, meat_types, origin, difficulty, tags, status, sort_order) VALUES

-- ═══════ RUBS ═══════

('Dalmatian Rub (Texas Style)', 'dalmatian-rub-texas', 'rub',
 'Le rub minimaliste de la tradition texane. Sel + poivre, rien d''autre. Laisse le boeuf et la fumée parler.',
 'Le Dalmatian rub est LA base du BBQ texan, popularisé par Aaron Franklin. L''idée : ne pas masquer la viande. Un ratio 50/50 sel kosher et poivre noir concassé (mouture café, 16 mesh idéalement). C''est ce que servent les plus grands joints de BBQ d''Austin et Lockhart. La clé est la qualité du poivre — fraîchement concassé, pas de la poudre.',
 '[{"name":"Sel kosher (Morton)","qty":"60g","note":"Grains réguliers pour une couverture uniforme"},{"name":"Poivre noir 16 mesh","qty":"60g","note":"Concassé gros, pas moulu fin"}]',
 '["Mélanger sel et poivre dans un bol.","Appliquer généreusement sur le brisket 30-40 min avant cuisson.","Laisser le sel commencer à tirer l''humidité — la surface devient collante.","Ne pas masser : saupoudrer d''en haut, des deux côtés."]',
 '120g — 1 brisket', '2 min', '{brisket,beef_short_ribs}', 'Aaron Franklin — Austin, Texas', 'facile',
 '{texas,brisket,sel-poivre,franklin}', 'published', 1),

('Memphis Dust', 'memphis-dust', 'rub',
 'Le rub sucré légendaire de Meathead Goldwyn. Base sucrée, paprika fumé, épices chaudes. Parfait pour le porc.',
 'Créé par Meathead Goldwyn (AmazingRibs.com), le Memphis Dust est probablement le rub maison le plus reproduit au monde. Sa base sucrée (cassonade + sucre blanc) crée une bark caramélisée incroyable. Pas de sel dans la recette — Meathead recommande de saler séparément (½ c.à.c sel kosher par livre de viande, 12h avant).',
 '[{"name":"Cassonade foncée","qty":"110g"},{"name":"Sucre blanc","qty":"110g"},{"name":"Paprika","qty":"60g"},{"name":"Poudre d''ail","qty":"30g"},{"name":"Poivre noir moulu","qty":"15g"},{"name":"Gingembre moulu","qty":"15g"},{"name":"Poudre d''oignon","qty":"15g"},{"name":"Poudre de romarin","qty":"8g"}]',
 '["Mélanger tous les ingrédients dans un grand bol.","Casser les grumeaux de cassonade avec les doigts.","Stocker dans un contenant hermétique (se conserve 3 mois).","Humidifier légèrement la viande, saupoudrer le Memphis Dust sans trop en mettre.","Saler séparément : ½ c.à.c de sel kosher par livre, idéalement la veille."]',
 '350g — 4-5 cuissons', '5 min', '{pulled_pork,spare_ribs,baby_back_ribs,whole_chicken}', 'Meathead Goldwyn — AmazingRibs.com', 'facile',
 '{memphis,sucré,porc,ribs,meathead}', 'published', 2),

('Big Bad Beef Rub', 'big-bad-beef-rub', 'rub',
 'Rub boeuf costaud avec café, ancho et cacao. Pour les amateurs de bark sombre et complexe.',
 'Inspiré des rubs de compétition, ce mélange va au-delà du simple sel-poivre. Le café moulu apporte de l''amertume et une bark presque noire. Le piment ancho donne de la douceur fumée sans trop de piquant. Le cacao renforce la profondeur. Idéal pour les beef short ribs ou un chuck roast.',
 '[{"name":"Poivre noir concassé","qty":"40g"},{"name":"Sel kosher","qty":"30g"},{"name":"Café moulu fin (torréfaction foncée)","qty":"20g"},{"name":"Piment ancho en poudre","qty":"15g"},{"name":"Poudre d''ail","qty":"15g"},{"name":"Cacao non sucré","qty":"10g"},{"name":"Poudre d''oignon","qty":"10g"},{"name":"Cumin moulu","qty":"5g"},{"name":"Moutarde sèche","qty":"5g"}]',
 '["Mélanger toutes les épices.","Conserver dans un bocal à l''abri de la lumière.","Appliquer sur viande à température ambiante.","Fonctionne aussi en croûte avant un reverse sear."]',
 '150g — 2-3 cuissons', '5 min', '{brisket,beef_short_ribs,chuck_roast,tomahawk}', 'Inspiré des compétitions KCBS', 'moyen',
 '{boeuf,café,ancho,competition,bark}', 'published', 3),

('Rub Cajun Fumé', 'rub-cajun-fume', 'rub',
 'Épicé et fumé avec une touche louisianaise. Cayenne, paprika fumé, thym et origan.',
 'Ce rub apporte la chaleur de la cuisine cajun au fumoir. Le paprika fumé (pimentón de la Vera) est essentiel — il renforce le goût de fumée même sur un grill au charbon. Le cayenne est dosé pour piquer sans brûler. Excellent sur le poulet entier ou les cuisses.',
 '[{"name":"Paprika fumé","qty":"30g"},{"name":"Sel kosher","qty":"25g"},{"name":"Poudre d''ail","qty":"20g"},{"name":"Poivre noir","qty":"15g"},{"name":"Poudre d''oignon","qty":"15g"},{"name":"Cayenne","qty":"8g","note":"Ajuster selon tolérance"},{"name":"Thym séché","qty":"8g"},{"name":"Origan séché","qty":"8g"},{"name":"Moutarde sèche","qty":"5g"}]',
 '["Combiner tous les ingrédients.","Pour le poulet : appliquer sous et sur la peau.","Pour le porc : appliquer 2-4h avant cuisson.","Se conserve 2 mois dans un bocal hermétique."]',
 '150g — 3-4 cuissons', '5 min', '{whole_chicken,pulled_pork,spare_ribs}', 'Tradition cajun / louisianaise', 'facile',
 '{cajun,épicé,poulet,fumé,louisiane}', 'published', 4),

('Sweet Heat Rib Rub', 'sweet-heat-rib-rub', 'rub',
 'Sucré-piquant équilibré. Cassonade, chipotle, cannelle. Le rub de compétition pour des ribs qui gagnent.',
 'Inspiré des rubs de champions comme Myron Mixon (5x champion du monde). L''équilibre sucré/piquant est la clé pour des ribs de compétition. La cassonade caramélise, le chipotle apporte un piquant fumé, et la cannelle ajoute une touche de chaleur douce qui fait la différence.',
 '[{"name":"Cassonade foncée","qty":"80g"},{"name":"Paprika","qty":"30g"},{"name":"Poivre noir","qty":"15g"},{"name":"Poudre d''ail","qty":"15g"},{"name":"Chipotle en poudre","qty":"12g"},{"name":"Poudre d''oignon","qty":"10g"},{"name":"Sel kosher","qty":"25g"},{"name":"Cannelle moulue","qty":"5g"},{"name":"Cayenne","qty":"5g"},{"name":"Moutarde sèche","qty":"5g"}]',
 '["Mélanger tous les ingrédients, écraser les grumeaux.","Retirer la membrane des ribs.","Appliquer un binder (moutarde jaune) sur les ribs.","Saupoudrer généreusement le rub des deux côtés.","Laisser reposer 30 min avant d''enfourner."]',
 '200g — 3 racks de ribs', '5 min', '{spare_ribs,baby_back_ribs}', 'Inspiré de Myron Mixon', 'facile',
 '{ribs,sucré,piquant,compétition,mixon}', 'published', 5),

('Rub All-Purpose Charbon & Flamme', 'rub-charbon-flamme', 'rub',
 'Notre rub maison polyvalent. Fonctionne sur tout : boeuf, porc, volaille. Équilibré et sans surprise.',
 'Un rub pensé pour le quotidien du pitmaster. Pas trop sucré pour le boeuf, pas trop salé pour le porc, assez parfumé pour le poulet. C''est le rub qu''on garde toujours à portée de main.',
 '[{"name":"Paprika fumé","qty":"30g"},{"name":"Sel kosher","qty":"25g"},{"name":"Poivre noir","qty":"20g"},{"name":"Cassonade","qty":"20g"},{"name":"Poudre d''ail","qty":"15g"},{"name":"Poudre d''oignon","qty":"15g"},{"name":"Cumin","qty":"8g"},{"name":"Moutarde sèche","qty":"5g"},{"name":"Cayenne","qty":"3g"}]',
 '["Mélanger et stocker dans un bocal.","Boeuf : appliquer 1h avant.","Porc : appliquer 2-4h avant ou la veille.","Poulet : appliquer sous la peau + surface, 1h avant."]',
 '160g — 3-4 cuissons', '3 min', '{brisket,pulled_pork,spare_ribs,whole_chicken,chuck_roast}', 'Charbon & Flamme — Original', 'facile',
 '{polyvalent,maison,all-purpose}', 'published', 6),

-- ═══════ MOPS ═══════

('Texas Mop Sauce', 'texas-mop-sauce', 'mop',
 'Le mop traditionnel texan. Vinaigre, bière, épices et jus de cuisson. Garde le brisket juteux pendant les longues heures.',
 'En Texas BBQ, le mop est appliqué au pinceau (ou mini-balai) toutes les 45-60 minutes pendant la cuisson. Il ne sert pas à parfumer mais à maintenir l''humidité de surface, ce qui favorise la formation d''une bark uniforme. La bière (lager légère) apporte des sucres qui aident à la caramélisation.',
 '[{"name":"Vinaigre de cidre","qty":"250ml"},{"name":"Bière lager","qty":"250ml"},{"name":"Eau","qty":"125ml"},{"name":"Poudre d''oignon","qty":"15g"},{"name":"Poudre d''ail","qty":"10g"},{"name":"Chili powder","qty":"10g"},{"name":"Sel","qty":"8g"},{"name":"Poivre noir","qty":"5g"},{"name":"Sauce piquante (quelques traits)","qty":"5ml","note":"Tabasco, Crystal ou Valentina"}]',
 '["Porter tous les ingrédients à ébullition dans une casserole.","Réduire le feu et laisser mijoter 15 min.","Laisser refroidir à température du fumoir.","Appliquer au pinceau ou mini-mop toutes les 45-60 min.","Ne pas ouvrir le fumoir JUSTE pour mopper — profiter d''une autre tâche (ajouter du bois, vérifier la temp).","Arrêter de mopper quand on wrappe (si applicable)."]',
 '~600ml — 1 brisket', '20 min', '{brisket,beef_short_ribs,chuck_roast}', 'Tradition du Central Texas', 'facile',
 '{texas,mop,brisket,vinaigre,bière}', 'published', 10),

('Carolina Vinegar Mop', 'carolina-vinegar-mop', 'mop',
 'Le mop de la Caroline. Ultra vinaigré, piquant, parfait pour le porc fumé. Simple et efficace.',
 'En Caroline du Nord (surtout l''est), le mop/sauce est à base de vinaigre pur avec du piment rouge. Pas de tomate, pas de sucre. C''est radical mais ça fonctionne incroyablement bien avec le gras du pulled pork. Le vinaigre coupe le gras et relance l''appétit.',
 '[{"name":"Vinaigre de cidre","qty":"500ml"},{"name":"Flocons de piment rouge","qty":"15g"},{"name":"Poivre noir concassé","qty":"10g"},{"name":"Sel","qty":"10g"},{"name":"Sucre","qty":"10g","note":"Juste assez pour arrondir l''acidité"},{"name":"Sauce piquante","qty":"15ml"}]',
 '["Mélanger tous les ingrédients dans un bocal.","Secouer vigoureusement.","Laisser infuser au moins 2h (ou toute la nuit au frigo).","Appliquer sur le porc toutes les 30-45 min.","Servir aussi comme sauce de table — verser sur le pulled pork."]',
 '~550ml', '5 min + 2h infusion', '{pulled_pork,spare_ribs}', 'Eastern North Carolina', 'facile',
 '{carolina,vinaigre,porc,pulled-pork,sauce}', 'published', 11),

('Mop Beurre-Épices', 'mop-beurre-epices', 'mop',
 'Beurre fondu, rub et jus de pomme. Un mop riche qui donne une bark dorée et brillante.',
 'Ce mop combine le gras du beurre (qui aide à la bark) avec les épices du rub (pour renforcer les saveurs) et le jus de pomme (pour la douceur). Populaire chez les pitmasters de compétition qui veulent des ribs brillantes et laquées.',
 '[{"name":"Beurre fondu","qty":"120g"},{"name":"Jus de pomme","qty":"250ml"},{"name":"Votre rub favori","qty":"20g"},{"name":"Miel","qty":"30ml"},{"name":"Vinaigre de cidre","qty":"30ml"},{"name":"Sauce Worcestershire","qty":"15ml"}]',
 '["Faire fondre le beurre à feu doux.","Ajouter tous les autres ingrédients, mélanger.","Garder tiède (pas chaud) pendant la cuisson.","Appliquer au pinceau sur les ribs toutes les 30-45 min.","Idéal pendant la phase 2 (après 2h de fumée nue)."]',
 '~450ml — 2-3 racks', '5 min', '{spare_ribs,baby_back_ribs,whole_chicken}', 'Style compétition KCBS', 'facile',
 '{beurre,ribs,compétition,mop,laqué}', 'published', 12),

-- ═══════ MARINADES ═══════

('Marinade Bourbon & Cassonade', 'marinade-bourbon-cassonade', 'marinade',
 'Bourbon, cassonade, sauce soja et ail. Riche et complexe, parfaite pour le porc et le boeuf.',
 'Le bourbon apporte des notes de vanille et de caramel qui se marient parfaitement avec la fumée du bois. La sauce soja ajoute de l''umami. Cette marinade fonctionne aussi bien en immersion (4-12h) qu''en injection.',
 '[{"name":"Bourbon","qty":"120ml","note":"Pas besoin de top shelf — un bon mid-range suffit"},{"name":"Cassonade foncée","qty":"80g"},{"name":"Sauce soja","qty":"60ml"},{"name":"Vinaigre de cidre","qty":"30ml"},{"name":"Huile de sésame","qty":"15ml"},{"name":"Ail émincé","qty":"4 gousses"},{"name":"Gingembre râpé","qty":"10g"},{"name":"Poivre noir","qty":"5g"},{"name":"Flocons de piment","qty":"3g"}]',
 '["Dissoudre la cassonade dans le bourbon tiédi.","Ajouter tous les ingrédients et bien mélanger.","Mettre la viande et la marinade dans un sac zip.","Réfrigérer 4-12h en retournant une fois.","Égoutter et sécher avant d''appliquer le rub.","Ne pas réutiliser la marinade crue."]',
 '~350ml — 1-2 pièces', '10 min + 4-12h marinade', '{pulled_pork,chuck_roast,beef_short_ribs,spare_ribs}', 'Sud des États-Unis', 'moyen',
 '{bourbon,marinade,porc,boeuf,umami}', 'published', 20),

('Marinade Jerk Jamaïcain', 'marinade-jerk-jamaicain', 'marinade',
 'Explosive et parfumée. Scotch bonnet, piment de la Jamaïque, thym frais. Pour un poulet fumé inoubliable.',
 'La vraie marinade jerk ne se limite pas au piment — c''est un équilibre entre le piquant du scotch bonnet, la douceur du piment de la Jamaïque (allspice), la fraîcheur du thym et l''acidité du citron vert. Traditionnellement fumée sur du bois de pimento en Jamaïque.',
 '[{"name":"Oignons verts","qty":"6 tiges"},{"name":"Scotch bonnet","qty":"2","note":"Ou habanero. Ajuster au goût."},{"name":"Sauce soja","qty":"60ml"},{"name":"Jus de citron vert","qty":"45ml"},{"name":"Piment de la Jamaïque (allspice)","qty":"15g"},{"name":"Thym frais","qty":"10 brins"},{"name":"Ail","qty":"6 gousses"},{"name":"Gingembre frais","qty":"20g"},{"name":"Cassonade","qty":"30g"},{"name":"Cannelle","qty":"3g"},{"name":"Noix de muscade","qty":"2g"},{"name":"Poivre noir","qty":"5g"},{"name":"Huile végétale","qty":"30ml"}]',
 '["Mixer tous les ingrédients au blender jusqu''à consistance de pâte.","Entailler la viande au couteau pour que la marinade pénètre.","Masser généreusement la pâte sur et dans les entailles.","Mariner au frigo 6-24h (plus c''est long, mieux c''est).","Fumage idéal : bois de cerisier ou de pommier.","Cuisson indirecte à 150°C jusqu''à 75°C interne pour le poulet."]',
 '~300ml — 1 poulet entier ou 8 cuisses', '15 min + 6-24h marinade', '{whole_chicken}', 'Jamaïque', 'moyen',
 '{jerk,jamaïque,poulet,épicé,scotch-bonnet}', 'published', 21),

('Marinade Bulgogi (BBQ Coréen)', 'marinade-bulgogi', 'marinade',
 'Soja, poire asiatique, sésame et gochujang. La rencontre du fumoir américain et du BBQ coréen.',
 'Le bulgogi est LE classique du BBQ coréen. La poire asiatique (ou pomme à défaut) attendrit la viande grâce à ses enzymes naturelles. Le gochujang apporte un piquant fermenté unique. Fumé au bois de chêne ou de cerisier, c''est une fusion East-meets-West incroyable.',
 '[{"name":"Sauce soja","qty":"80ml"},{"name":"Poire asiatique râpée","qty":"1 poire","note":"Ou ½ pomme Granny Smith"},{"name":"Cassonade","qty":"40g"},{"name":"Huile de sésame","qty":"30ml"},{"name":"Gochujang","qty":"20g","note":"Optionnel, pour une version épicée"},{"name":"Ail émincé","qty":"5 gousses"},{"name":"Gingembre râpé","qty":"15g"},{"name":"Oignon râpé","qty":"½ oignon"},{"name":"Poivre noir","qty":"5g"},{"name":"Graines de sésame","qty":"10g"}]',
 '["Mixer la poire, l''ail, le gingembre et l''oignon.","Ajouter sauce soja, cassonade, sésame, gochujang et poivre.","Bien mélanger.","Mariner les tranches fines (boeuf) 2-4h ou une pièce entière 8-12h.","Pour un brisket fusion : injecter + badigeonner en surface.","Griller sur charbon vif ou fumer à 120°C pour les grosses pièces."]',
 '~300ml', '10 min + 2-12h marinade', '{brisket,beef_short_ribs,chuck_roast}', 'Corée — adapté BBQ US', 'moyen',
 '{coréen,bulgogi,soja,sésame,fusion,gochujang}', 'published', 22),

('Marinade Citron-Herbes Méditerranée', 'marinade-citron-herbes', 'marinade',
 'Fraîche et herbacée. Citron, origan, romarin, huile d''olive. Idéale pour le poulet et l''agneau au fumoir.',
 'Pas tout le BBQ doit être texan. Cette marinade méditerranéenne est parfaite pour un poulet fumé léger d''été ou pour de l''agneau. L''acidité du citron attendrit, l''huile d''olive protège de la sécheresse, les herbes parfument en profondeur.',
 '[{"name":"Huile d''olive extra vierge","qty":"100ml"},{"name":"Jus de citron frais","qty":"80ml"},{"name":"Zeste de citron","qty":"2 citrons"},{"name":"Ail émincé","qty":"6 gousses"},{"name":"Origan frais","qty":"15g","note":"Ou 8g séché"},{"name":"Romarin frais","qty":"3 brins"},{"name":"Thym frais","qty":"5 brins"},{"name":"Sel","qty":"15g"},{"name":"Poivre noir","qty":"5g"},{"name":"Flocons de piment","qty":"3g","note":"Optionnel"}]',
 '["Mélanger tous les ingrédients dans un bol.","Mariner le poulet 4-8h, l''agneau 6-12h.","Retirer la viande, éponger l''excédent.","Fumer à basse température (120-135°C) avec du bois fruité.","Le citron peut brûler — ne pas laisser de gros morceaux de zeste collés."]',
 '~250ml', '5 min + 4-12h marinade', '{whole_chicken}', 'Méditerranée', 'facile',
 '{méditerranée,citron,herbes,poulet,frais}', 'published', 23),

-- ═══════ INJECTIONS ═══════

('Injection Compétition Brisket', 'injection-competition-brisket', 'injection',
 'Bouillon de boeuf, beurre et umami. L''injection qui fait la différence en compétition.',
 'L''injection est un avantage compétitif majeur. Elle apporte de l''humidité et du goût AU COEUR de la viande, là où le rub ne peut pas aller. La Parkay (margarine liquide) est le secret des compétiteurs américains — elle a un goût de beurre plus prononcé que le vrai beurre et reste liquide à température ambiante.',
 '[{"name":"Bouillon de boeuf concentré","qty":"250ml"},{"name":"Margarine liquide (Parkay) ou beurre fondu","qty":"60ml"},{"name":"Sauce Worcestershire","qty":"30ml"},{"name":"Poudre d''oignon","qty":"10g"},{"name":"Poudre d''ail","qty":"5g"},{"name":"MSG (glutamate)","qty":"5g","note":"Optionnel mais recommandé en compétition"},{"name":"Sel","qty":"5g"}]',
 '["Chauffer le bouillon et la margarine ensemble (pas bouillir).","Ajouter les assaisonnements, bien dissoudre.","Filtrer à travers une passoire fine (important pour ne pas boucher l''aiguille).","Laisser refroidir à température tiède.","Injecter en grille de 5cm sur toute la surface du brisket.","Injecter doucement — si le liquide ressort, passer au point suivant.","Laisser reposer 4h minimum au frigo avant cuisson."]',
 '~350ml — 1 brisket', '10 min + 4h repos', '{brisket}', 'Circuit compétition KCBS/FBA', 'avancé',
 '{injection,compétition,brisket,bouillon,umami}', 'published', 30),

('Injection Porc au Jus de Pomme', 'injection-porc-jus-pomme', 'injection',
 'Jus de pomme, beurre, sel et sucre. L''injection classique pour un pulled pork ultra juteux.',
 'L''injection au jus de pomme est un classique pour le pork butt. La douceur de la pomme se marie naturellement avec le porc. Le phosphate de sodium (si disponible) aide à retenir l''humidité pendant les longues cuissons. Sans phosphate, le beurre fait le job.',
 '[{"name":"Jus de pomme (pas de pulpe)","qty":"250ml"},{"name":"Beurre fondu","qty":"60ml"},{"name":"Sucre","qty":"20g"},{"name":"Sel","qty":"15g"},{"name":"Sauce Worcestershire","qty":"15ml"},{"name":"Poudre d''ail","qty":"5g"}]',
 '["Chauffer le jus de pomme avec le beurre à feu doux.","Dissoudre le sucre et le sel.","Ajouter Worcestershire et ail.","Filtrer et laisser tiédir.","Injecter en grille de 5cm dans le pork butt.","Injecter surtout dans les zones maigres (pas dans le fat cap).","Mariner au frigo 4-8h avant cuisson."]',
 '~350ml — 1 pork butt', '10 min + 4-8h repos', '{pulled_pork}', 'Tradition compétition US', 'moyen',
 '{injection,porc,pomme,juteux,compétition}', 'published', 31),

-- ═══════ GLAZES ═══════

('Glaze BBQ Miel-Chipotle', 'glaze-miel-chipotle', 'glaze',
 'Miel, chipotle en adobo et vinaigre. Un glaçage fumé-sucré-piquant pour les 30 dernières minutes.',
 'Le glaze s''applique en fin de cuisson (30-45 min avant la fin) pour créer une couche brillante et caramélisée. Le miel apporte le sucre et la brillance, le chipotle en adobo le piquant fumé, et le vinaigre équilibre le tout. Attention : le miel brûle vite au-dessus de 180°C.',
 '[{"name":"Miel","qty":"120ml"},{"name":"Chipotle en adobo (mixé)","qty":"30g","note":"2-3 chipotles + sauce de la boîte"},{"name":"Vinaigre de cidre","qty":"30ml"},{"name":"Sauce soja","qty":"15ml"},{"name":"Beurre","qty":"30g"},{"name":"Poudre d''ail","qty":"5g"}]',
 '["Faire fondre le beurre dans une casserole.","Ajouter le miel, chauffer à feu doux.","Incorporer le chipotle mixé, le vinaigre, la sauce soja et l''ail.","Mijoter 5 min jusqu''à consistance nappante.","Appliquer au pinceau 30-45 min avant la fin de cuisson.","2 couches : appliquer, attendre 15 min, réappliquer.","Ne pas appliquer si le fumoir est au-dessus de 175°C."]',
 '~250ml — 2-3 racks de ribs', '10 min', '{spare_ribs,baby_back_ribs,whole_chicken}', 'Sud des États-Unis', 'facile',
 '{glaze,miel,chipotle,ribs,laqué,brillant}', 'published', 40),

('Glaze Érable-Moutarde', 'glaze-erable-moutarde', 'glaze',
 'Sirop d''érable, moutarde de Dijon et un trait de bourbon. Doux, piquant et élégant.',
 'La combinaison érable-moutarde est un classique de la Nouvelle-Angleterre adapté au BBQ. Le sirop d''érable (vrai, pas de l''arôme) caramélise magnifiquement. La moutarde de Dijon coupe le sucre. Un trait de bourbon lie le tout. Parfait sur le jambon fumé, le poulet ou les côtes.',
 '[{"name":"Sirop d''érable pur","qty":"120ml"},{"name":"Moutarde de Dijon","qty":"60ml"},{"name":"Bourbon","qty":"30ml","note":"Optionnel mais recommandé"},{"name":"Vinaigre de cidre","qty":"15ml"},{"name":"Sel","qty":"3g"},{"name":"Poivre noir","qty":"2g"}]',
 '["Mélanger tous les ingrédients dans une casserole.","Chauffer à feu doux 3-4 min en remuant.","Ne pas bouillir — le sirop d''érable mousse vite.","Appliquer 20-30 min avant la fin.","Superbe sur des baby back ribs ou un poulet entier."]',
 '~250ml', '5 min', '{baby_back_ribs,whole_chicken,spare_ribs}', 'Nouvelle-Angleterre / Québec', 'facile',
 '{glaze,érable,moutarde,bourbon,élégant}', 'published', 41)

ON CONFLICT (slug) DO NOTHING;
