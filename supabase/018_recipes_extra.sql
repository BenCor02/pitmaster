-- ══════════════════════════════════════════════════════════════
-- 018 — Recettes supplémentaires : marinades, glazes, injections, mops
-- Focus : termes français, recettes terrain, SEO-friendly
-- ══════════════════════════════════════════════════════════════

INSERT INTO recipes (title, slug, type, summary, description, ingredients, steps, yield_amount, prep_time, meat_types, origin, difficulty, tags, status, sort_order) VALUES

-- ═══════════════════════════════════════════════════════════
-- MARINADES (10)
-- ═══════════════════════════════════════════════════════════

('Marinade Teriyaki fumée', 'marinade-teriyaki-fumee', 'marinade',
 'Sauce soja, mirin, gingembre frais et miel. Idéale pour le poulet et le porc fumé.',
 'Une marinade japonaise adaptée au fumoir. Le miel caramélise lentement pendant la cuisson low & slow, créant une peau laquée brillante. Le gingembre frais apporte un kick que le gingembre en poudre n''atteint pas.',
 '[{"name":"Sauce soja","qty":"100 ml"},{"name":"Mirin","qty":"60 ml"},{"name":"Miel","qty":"40 g"},{"name":"Gingembre frais râpé","qty":"20 g"},{"name":"Ail pressé","qty":"3 gousses"},{"name":"Huile de sésame","qty":"15 ml"},{"name":"Poivre noir","qty":"2 g"}]',
 '["Mélanger tous les ingrédients dans un bol.","Faire mariner le poulet ou le porc 4 à 8 heures au frigo.","Égoutter avant de mettre au fumoir (sinon ça brûle).","Badigeonner avec le reste de marinade à mi-cuisson."]',
 '300 ml — 1,5 kg de viande', '10 min + 4h marinade', '{whole_chicken,chicken_breasts,pulled_pork,spare_ribs}', 'Japon — adapté fumoir', 'facile',
 '{teriyaki,asiatique,poulet,porc,marinade}', 'published', 80),

('Marinade Chimichurri (Argentine)', 'marinade-chimichurri', 'marinade',
 'Persil, origan, ail, vinaigre de vin rouge, huile d''olive. La sauce nationale de l''asado argentin.',
 'Le chimichurri est utilisé en Argentine à la fois comme marinade et comme sauce de table pour l''asado. La version marinade est plus liquide. Utilise du persil plat frais — jamais du séché.',
 '[{"name":"Persil plat frais haché","qty":"80 g"},{"name":"Origan frais (ou 5g séché)","qty":"10 g"},{"name":"Ail finement haché","qty":"6 gousses"},{"name":"Vinaigre de vin rouge","qty":"60 ml"},{"name":"Huile d''olive","qty":"120 ml"},{"name":"Piment rouge broyé","qty":"3 g"},{"name":"Sel","qty":"5 g"}]',
 '["Hacher finement le persil et l''ail (au couteau, pas au mixeur).","Mélanger avec l''origan, le vinaigre, le sel et le piment.","Ajouter l''huile d''olive, mélanger.","Laisser reposer 30 min à température ambiante avant d''utiliser.","Comme marinade : 2 à 4h max (le vinaigre ''cuit'' la viande si trop longtemps)."]',
 '300 ml', '15 min', '{brisket,tomahawk,beef_short_ribs,prime_rib}', 'Argentine — tradition asado', 'facile',
 '{chimichurri,argentin,asado,boeuf,persil}', 'published', 81),

('Marinade au yaourt et épices tandoori', 'marinade-yaourt-tandoori', 'marinade',
 'Yaourt grec, curcuma, cumin, paprika, garam masala. Le poulet tandoori version fumoir.',
 'Le yaourt attendrit la viande grâce à l''acide lactique, tout en créant une croûte épaisse et parfumée au fumoir. Technique empruntée au tandoor indien, adaptée au fumage low & slow.',
 '[{"name":"Yaourt grec nature","qty":"200 g"},{"name":"Curcuma","qty":"5 g"},{"name":"Cumin moulu","qty":"5 g"},{"name":"Paprika fumé","qty":"10 g"},{"name":"Garam masala","qty":"5 g"},{"name":"Ail en poudre","qty":"5 g"},{"name":"Gingembre moulu","qty":"3 g"},{"name":"Jus de citron","qty":"30 ml"},{"name":"Sel","qty":"8 g"},{"name":"Huile","qty":"15 ml"}]',
 '["Mélanger le yaourt avec toutes les épices et le citron.","Faire des incisions dans la viande (surtout le poulet entier).","Enduire généreusement, y compris sous la peau.","Mariner 6 à 12h au réfrigérateur.","Fumer à 135°C pendant 2 à 3h (poulet entier)."]',
 '300 g — 1 poulet entier', '15 min + 6h marinade', '{whole_chicken,chicken_breasts,lamb_shoulder,lamb_legs}', 'Inde — adapté fumoir', 'facile',
 '{tandoori,yaourt,poulet,agneau,indien,épices}', 'published', 82),

('Marinade au vin rouge et romarin (côte de bœuf)', 'marinade-vin-rouge-romarin', 'marinade',
 'Vin rouge charpenté, romarin, ail, baies de genièvre. Pour une côte de bœuf fumée d''exception.',
 'Le vin rouge apporte des tanins qui attendrissent les fibres musculaires. Le romarin frais et les baies de genièvre rappellent la cuisine de terroir française. Idéal pour une côte de bœuf en reverse sear au fumoir.',
 '[{"name":"Vin rouge corsé (Cahors, Madiran)","qty":"250 ml"},{"name":"Romarin frais","qty":"4 branches"},{"name":"Ail écrasé","qty":"4 gousses"},{"name":"Baies de genièvre écrasées","qty":"6"},{"name":"Poivre noir en grains","qty":"10"},{"name":"Huile d''olive","qty":"30 ml"},{"name":"Échalote émincée","qty":"2"},{"name":"Sel","qty":"10 g"}]',
 '["Écraser les baies de genièvre et le poivre au mortier.","Mélanger le vin, l''huile, l''ail, l''échalote et les épices.","Placer la viande dans un sac ou un plat, verser la marinade.","Mariner 12 à 24h au réfrigérateur en retournant 1 fois.","Sortir 1h avant cuisson, éponger la surface."]',
 '350 ml — 1 côte de bœuf', '15 min + 12h marinade', '{prime_rib,tomahawk,chuck_roast}', 'France — terroir sud-ouest', 'moyen',
 '{vin-rouge,romarin,côte-de-boeuf,français,reverse-sear}', 'published', 83),

('Marinade jerk jamaïcaine', 'marinade-jerk-jamaicaine', 'marinade',
 'Piment scotch bonnet, piment de la Jamaïque, thym, oignon vert. Le feu des Caraïbes au fumoir.',
 'Le jerk est une tradition jamaïcaine de fumage au bois de piment (pimenta). La marinade est à la fois sucrée, épicée et aromatique. Attention au scotch bonnet — c''est un des piments les plus forts (100 000–350 000 SHU).',
 '[{"name":"Oignons verts (partie verte)","qty":"6"},{"name":"Piment scotch bonnet (ou habanero)","qty":"1","note":"Épépiner pour moins de feu"},{"name":"Piment de la Jamaïque moulu","qty":"10 g"},{"name":"Thym frais","qty":"8 branches"},{"name":"Ail","qty":"4 gousses"},{"name":"Gingembre frais","qty":"15 g"},{"name":"Sauce soja","qty":"30 ml"},{"name":"Jus de citron vert","qty":"30 ml"},{"name":"Cassonade","qty":"20 g"},{"name":"Cannelle","qty":"2 g"},{"name":"Muscade","qty":"2 g"},{"name":"Huile","qty":"30 ml"}]',
 '["Mixer tous les ingrédients jusqu''à obtenir une pâte épaisse.","Faire des incisions profondes dans la viande.","Masser la pâte dans les incisions et sur toute la surface.","Mariner 12 à 24h au réfrigérateur.","Fumer au bois de cerisier ou pommier à 120°C."]',
 '300 g — 2 kg de poulet', '20 min + 12h marinade', '{whole_chicken,chicken_breasts,spare_ribs,pulled_pork}', 'Jamaïque', 'moyen',
 '{jerk,jamaïcain,piquant,caraïbes,poulet}', 'published', 84),

('Marinade miso-érable', 'marinade-miso-erable', 'marinade',
 'Miso blanc, sirop d''érable, sake. Umami profond et caramel doré au fumoir.',
 'Le miso apporte un umami intense qui se marie parfaitement avec la fumée. Le sirop d''érable crée un glaçage naturel pendant la cuisson. Combo qui fonctionne sur tout : porc, poulet, saumon.',
 '[{"name":"Miso blanc (shiro)","qty":"60 g"},{"name":"Sirop d''érable","qty":"40 ml"},{"name":"Sake ou vin blanc","qty":"30 ml"},{"name":"Sauce soja","qty":"15 ml"},{"name":"Huile de sésame","qty":"10 ml"},{"name":"Gingembre râpé","qty":"10 g"},{"name":"Ail pressé","qty":"2 gousses"}]',
 '["Délayer le miso dans le sake à température ambiante.","Ajouter le sirop d''érable, la sauce soja, l''huile de sésame, le gingembre et l''ail.","Mélanger jusqu''à consistance homogène.","Enduire la viande, mariner 4 à 8h (pas plus, le miso est salé).","Éponger légèrement avant fumage."]',
 '200 ml — 1 kg de viande', '10 min + 4h marinade', '{pulled_pork,spare_ribs,baby_back_ribs,whole_chicken}', 'Fusion japon-québec', 'facile',
 '{miso,érable,umami,asiatique,porc}', 'published', 85),

-- ═══════════════════════════════════════════════════════════
-- GLAZES (8)
-- ═══════════════════════════════════════════════════════════

('Glaze bourbon et cassonade', 'glaze-bourbon-cassonade', 'glaze',
 'Bourbon, cassonade, beurre et moutarde de Dijon. La finition brillante pour les ribs et le porc.',
 'Un glaze classique du BBQ américain. Le bourbon s''évapore en laissant ses arômes de vanille et chêne. La cassonade caramélise, le beurre apporte la brillance, la moutarde l''acidité.',
 '[{"name":"Bourbon","qty":"60 ml"},{"name":"Cassonade","qty":"80 g"},{"name":"Beurre doux","qty":"30 g"},{"name":"Moutarde de Dijon","qty":"15 g"},{"name":"Sauce Worcestershire","qty":"15 ml"},{"name":"Vinaigre de cidre","qty":"15 ml"},{"name":"Pincée de cayenne","qty":"1 g"}]',
 '["Faire fondre le beurre dans une casserole à feu moyen.","Ajouter la cassonade, mélanger jusqu''à dissolution.","Verser le bourbon (attention aux flammes si feu gaz).","Ajouter la moutarde, le Worcestershire et le vinaigre.","Laisser réduire 5 min à feu doux.","Badigeonner les ribs ou le porc 30 min avant la fin de cuisson.","Remettre au fumoir ouvert (sans papier alu) pour que ça caramélise."]',
 '200 ml — 2 racks de ribs', '10 min', '{spare_ribs,baby_back_ribs,pulled_pork}', 'BBQ américain classique', 'facile',
 '{bourbon,glaze,cassonade,ribs,porc,caramel}', 'published', 90),

('Glaze miel-sriracha', 'glaze-miel-sriracha', 'glaze',
 'Miel, sriracha, vinaigre de riz et ail. Sucré, piquant, collant — la perfection sur des ailes fumées.',
 'Le combo miel-sriracha est devenu un classique de la street food. Sur des ailes de poulet ou des baby back ribs fumés, c''est explosif. Le vinaigre de riz équilibre le sucre.',
 '[{"name":"Miel","qty":"80 g"},{"name":"Sriracha","qty":"40 ml"},{"name":"Vinaigre de riz","qty":"20 ml"},{"name":"Ail en poudre","qty":"3 g"},{"name":"Sauce soja","qty":"10 ml"}]',
 '["Mélanger tous les ingrédients dans un bol.","Chauffer 2 min au micro-ondes ou dans une casserole.","Badigeonner la viande 20 min avant la fin de cuisson.","Remettre au fumoir pour caraméliser.","Servir avec un filet supplémentaire de glaze sur les pièces."]',
 '150 ml', '5 min', '{baby_back_ribs,whole_chicken,chicken_breasts}', 'Fusion street food', 'facile',
 '{miel,sriracha,glaze,piquant,poulet,ribs}', 'published', 91),

('Glaze érable-chipotle', 'glaze-erable-chipotle', 'glaze',
 'Sirop d''érable du Québec et chipotle en adobo. Fumé sur fumé, sucré-piquant.',
 'L''érable est un des rares sucres qui résiste bien à la chaleur du fumoir sans brûler trop vite. Le chipotle (jalapeño fumé) double l''effet fumé. Combo magistral sur le porc.',
 '[{"name":"Sirop d''érable","qty":"100 ml"},{"name":"Chipotle en adobo (mixé)","qty":"20 g"},{"name":"Vinaigre de cidre","qty":"15 ml"},{"name":"Moutarde de Dijon","qty":"10 g"},{"name":"Sel","qty":"2 g"}]',
 '["Mixer ou écraser les chipotles en adobo.","Mélanger avec l''érable, le vinaigre, la moutarde et le sel.","Badigeonner généreusement 30-45 min avant la fin.","Deux couches : la première fige, la deuxième brille."]',
 '150 ml', '5 min', '{spare_ribs,baby_back_ribs,pulled_pork,whole_chicken}', 'Québec — fusion BBQ', 'facile',
 '{érable,chipotle,glaze,fumé,porc}', 'published', 92),

('Glaze balsamique et figues', 'glaze-balsamique-figues', 'glaze',
 'Réduction balsamique, confiture de figues et romarin. Finition française pour une pièce de bœuf fumée.',
 'Un glaze inspiré de la gastronomie française, parfait pour une côte de bœuf ou un tomahawk fumé en reverse sear. Le balsamique réduit en sirop, la figue ajoute une douceur fruitée et le romarin apporte la touche herbacée.',
 '[{"name":"Vinaigre balsamique de Modène","qty":"100 ml"},{"name":"Confiture de figues","qty":"40 g"},{"name":"Miel","qty":"20 g"},{"name":"Romarin frais haché","qty":"5 g"},{"name":"Poivre noir","qty":"2 g"},{"name":"Beurre","qty":"15 g"}]',
 '["Verser le balsamique dans une casserole à feu moyen.","Laisser réduire de moitié (environ 5 min).","Ajouter la confiture de figues et le miel, mélanger.","Hors du feu, incorporer le beurre et le romarin.","Badigeonner la pièce de bœuf après le repos, avant de servir."]',
 '150 ml', '10 min', '{prime_rib,tomahawk,brisket}', 'France — gastronomie adaptée BBQ', 'moyen',
 '{balsamique,figue,glaze,boeuf,français,romarin}', 'published', 93),

-- ═══════════════════════════════════════════════════════════
-- INJECTIONS (6)
-- ═══════════════════════════════════════════════════════════

('Injection beurre-bouillon (brisket)', 'injection-beurre-bouillon-brisket', 'injection',
 'Beurre clarifié, bouillon de bœuf et Worcestershire. L''injection de compétition pour un brisket juteux.',
 'En compétition KCBS, la plupart des équipes injectent leur brisket 12h avant la cuisson. Le beurre apporte le gras interne, le bouillon la saveur, le Worcestershire l''umami. Le résultat : un flat (poitrine) qui ne sèche jamais.',
 '[{"name":"Beurre clarifié fondu","qty":"60 g"},{"name":"Bouillon de bœuf concentré","qty":"200 ml"},{"name":"Sauce Worcestershire","qty":"15 ml"},{"name":"Poudre d''ail","qty":"3 g"},{"name":"Poudre d''oignon","qty":"3 g"},{"name":"Sel","qty":"3 g"}]',
 '["Faire fondre le beurre, le mélanger au bouillon chaud.","Ajouter le Worcestershire, l''ail, l''oignon et le sel.","Filtrer avec un tamis fin (éviter les grumeaux dans l''aiguille).","Injecter dans le flat tous les 5 cm, en quadrillage.","Injecter le point (partie épaisse) tous les 3 cm.","Laisser reposer 12h au frigo avant cuisson."]',
 '300 ml — 1 brisket (5-7 kg)', '15 min + 12h repos', '{brisket}', 'Compétition KCBS — USA', 'moyen',
 '{injection,brisket,beurre,compétition,juteux}', 'published', 100),

('Injection créole (épaule de porc)', 'injection-creole-epaule-porc', 'injection',
 'Bouillon de porc, beurre de Louisiane, Cajun, ail. Injection épicée pour un pulled pork avec du caractère.',
 'Inspirée de la cuisine cajun de Louisiane, cette injection donne un pulled pork moelleux avec une profondeur de saveur qui surprend. Le beurre garde la viande grasse de l''intérieur.',
 '[{"name":"Bouillon de porc (ou poulet)","qty":"250 ml"},{"name":"Beurre fondu","qty":"40 g"},{"name":"Assaisonnement cajun","qty":"8 g"},{"name":"Sauce piquante (Tabasco ou Crystal)","qty":"10 ml"},{"name":"Ail en poudre","qty":"5 g"},{"name":"Miel","qty":"15 g"},{"name":"Sel","qty":"3 g"}]',
 '["Chauffer le bouillon, y fondre le beurre.","Ajouter tous les assaisonnements et le miel.","Bien mélanger et filtrer.","Injecter l''épaule tous les 4 cm en profondeur.","Emballer au film et réfrigérer 8 à 12h."]',
 '350 ml — 1 épaule de porc (3-4 kg)', '10 min + 8h repos', '{pulled_pork}', 'Louisiane — cajun', 'moyen',
 '{injection,créole,cajun,épaule,porc,louisiane}', 'published', 101),

('Injection au bouillon et jus de pomme (volaille)', 'injection-bouillon-pomme-volaille', 'injection',
 'Bouillon de volaille, jus de pomme, beurre et sauge. Le poulet fumé le plus juteux que tu feras.',
 'Le jus de pomme apporte une douceur subtile qui se marie parfaitement avec la volaille fumée. La sauge rappelle la cuisine française traditionnelle du poulet rôti.',
 '[{"name":"Bouillon de volaille","qty":"200 ml"},{"name":"Jus de pomme (pur)","qty":"80 ml"},{"name":"Beurre fondu","qty":"30 g"},{"name":"Sauge séchée","qty":"3 g"},{"name":"Sel","qty":"3 g"},{"name":"Poivre blanc","qty":"2 g"}]',
 '["Chauffer le bouillon et le jus de pomme ensemble.","Y fondre le beurre, ajouter la sauge, le sel et le poivre.","Filtrer finement.","Injecter dans les cuisses, les blancs et les pilons du poulet.","Laisser reposer 4h au frigo minimum."]',
 '300 ml — 1 poulet entier', '10 min + 4h repos', '{whole_chicken,chicken_breasts}', 'France — poulet rôti adapté fumoir', 'facile',
 '{injection,poulet,pomme,bouillon,volaille}', 'published', 102),

-- ═══════════════════════════════════════════════════════════
-- MOPS (6)
-- ═══════════════════════════════════════════════════════════

('Mop vinaigre de cidre et moutarde', 'mop-vinaigre-cidre-moutarde', 'mop',
 'Vinaigre de cidre, moutarde, beurre et cayenne. Le mop classique du pulled pork Carolina.',
 'En Caroline du Nord, le mop au vinaigre est la base du BBQ. On badigeonne l''épaule toutes les heures pour garder la surface humide et développer l''écorce (bark). L''acidité du vinaigre attendrit aussi les fibres.',
 '[{"name":"Vinaigre de cidre","qty":"250 ml"},{"name":"Eau","qty":"100 ml"},{"name":"Moutarde jaune","qty":"30 g"},{"name":"Beurre fondu","qty":"30 g"},{"name":"Sauce piquante","qty":"15 ml"},{"name":"Sel","qty":"5 g"},{"name":"Poivre noir","qty":"3 g"},{"name":"Cayenne","qty":"2 g"},{"name":"Cassonade","qty":"15 g"}]',
 '["Mélanger tous les ingrédients dans une casserole.","Chauffer à feu doux jusqu''à dissolution du sucre et de la moutarde.","Ne pas faire bouillir.","Badigeonner avec un pinceau ou un mop (vadrouille miniature) toutes les 45 min à 1h.","Commencer après 2h de cuisson (laisser le rub se fixer d''abord)."]',
 '400 ml — 1 épaule', '5 min', '{pulled_pork,spare_ribs}', 'Caroline du Nord — tradition vinegar BBQ', 'facile',
 '{mop,vinaigre,cidre,carolina,porc,épaule}', 'published', 110),

('Mop bière blonde et miel', 'mop-biere-blonde-miel', 'mop',
 'Bière blonde, miel, ail et thym. Un mop léger et parfumé pour le poulet et le porc.',
 'La bière apporte des sucres qui caramélisent doucement sur la surface, et le houblon ajoute une amertume subtile. Utilise une bière blonde artisanale de préférence — les industrielles manquent de caractère.',
 '[{"name":"Bière blonde","qty":"330 ml"},{"name":"Miel","qty":"30 g"},{"name":"Beurre fondu","qty":"20 g"},{"name":"Ail pressé","qty":"2 gousses"},{"name":"Thym frais","qty":"3 branches"},{"name":"Sel","qty":"3 g"},{"name":"Poivre","qty":"2 g"}]',
 '["Mélanger la bière avec le miel fondu.","Ajouter le beurre, l''ail, le thym, le sel et le poivre.","Badigeonner toutes les 45 min à partir de la 2e heure de cuisson.","Conserver au chaud à côté du fumoir."]',
 '400 ml', '5 min', '{whole_chicken,pulled_pork,spare_ribs,baby_back_ribs}', 'BBQ craft beer', 'facile',
 '{mop,bière,miel,poulet,porc}', 'published', 111),

('Mop au jus de pomme et cannelle', 'mop-jus-pomme-cannelle', 'mop',
 'Jus de pomme, vinaigre, cannelle et beurre. Le mop sucré-épicé pour les ribs et l''épaule.',
 'Le jus de pomme est l''ingrédient secret de beaucoup de pitmasters de compétition. Il ajoute un sucre naturel qui aide à la formation de la bark sans caraméliser trop vite comme le sucre blanc.',
 '[{"name":"Jus de pomme (pur, pas de nectar)","qty":"250 ml"},{"name":"Vinaigre de cidre","qty":"60 ml"},{"name":"Beurre fondu","qty":"20 g"},{"name":"Cannelle moulue","qty":"2 g"},{"name":"Piment de la Jamaïque","qty":"1 g"},{"name":"Sel","qty":"3 g"}]',
 '["Mélanger tous les ingrédients.","Chauffer légèrement pour fondre le beurre.","Appliquer au spray ou au pinceau toutes les 45 min.","Idéal sur les ribs juste avant le wrap en papier alu."]',
 '350 ml', '5 min', '{spare_ribs,baby_back_ribs,pulled_pork}', 'Compétition KCBS', 'facile',
 '{mop,pomme,cannelle,ribs,compétition}', 'published', 112),

-- ═══════════════════════════════════════════════════════════
-- RUBS supplémentaires (10) — Focus français et international
-- ═══════════════════════════════════════════════════════════

('Rub herbes de Provence (agneau fumé)', 'rub-herbes-provence-agneau', 'rub',
 'Thym, romarin, sarriette, lavande, origan. Le rub français par excellence pour l''agneau au fumoir.',
 'Les herbes de Provence sont faites pour l''agneau. Au fumoir, elles créent une bark aromatique et parfumée. Ajoute du zeste de citron séché pour un kick méditerranéen.',
 '[{"name":"Herbes de Provence","qty":"20 g"},{"name":"Sel de mer","qty":"25 g"},{"name":"Poivre noir concassé","qty":"10 g"},{"name":"Ail granulé","qty":"10 g"},{"name":"Zeste de citron séché","qty":"5 g"},{"name":"Paprika doux","qty":"5 g"}]',
 '["Mélanger toutes les épices.","Frotter généreusement l''épaule ou le gigot d''agneau.","Laisser reposer 2h au frigo à découvert.","Fumer au bois de cerisier ou de vigne."]',
 '75 g — 1 épaule d''agneau', '5 min', '{lamb_shoulder,lamb_ribs,lamb_legs}', 'Provence, France', 'facile',
 '{provence,herbes,agneau,français,méditerranéen}', 'published', 70),

('Rub 4 épices (poitrine de porc fumée)', 'rub-4-epices-poitrine-porc', 'rub',
 'Quatre-épices, cassonade, sel, poivre. Le mélange traditionnel français pour la poitrine fumée (bacon).',
 'Le quatre-épices (poivre, muscade, girofle, cannelle) est le mélange français classique pour les charcuteries. Combiné avec la cassonade et le sel, c''est la base d''un bacon maison fumé exceptionnel.',
 '[{"name":"Quatre-épices moulu","qty":"10 g"},{"name":"Cassonade","qty":"40 g"},{"name":"Sel fin","qty":"30 g"},{"name":"Poivre noir moulu","qty":"8 g"},{"name":"Ail en poudre","qty":"5 g"},{"name":"Thym séché","qty":"3 g"}]',
 '["Mélanger tous les ingrédients.","Frotter la poitrine de porc (lard frais) sur toutes les faces.","Placer dans un sachet hermétique, réfrigérer 3 jours en retournant chaque jour (salaison sèche).","Rincer, sécher, laisser à l''air 12h au frigo.","Fumer à froid (25°C) pendant 8 à 12h, ou à chaud (90°C) pendant 4h."]',
 '100 g — 2 kg de poitrine', '10 min + 3 jours salaison', '{pulled_pork}', 'France — charcuterie traditionnelle', 'avancé',
 '{quatre-épices,bacon,poitrine,charcuterie,français}', 'published', 71),

('Rub paprika fumé et piment d''Espelette', 'rub-paprika-espelette', 'rub',
 'Paprika fumé espagnol (pimentón), piment d''Espelette, ail. Le rub franco-espagnol plein de caractère.',
 'Le paprika fumé (pimentón de la Vera) double le goût fumé du barbecue. Le piment d''Espelette apporte une chaleur douce et fruitée, typiquement basque. Un rub qui marche sur tout.',
 '[{"name":"Paprika fumé (pimentón)","qty":"20 g"},{"name":"Piment d''Espelette","qty":"8 g"},{"name":"Sel de mer","qty":"20 g"},{"name":"Poivre noir","qty":"8 g"},{"name":"Ail granulé","qty":"10 g"},{"name":"Oignon en poudre","qty":"5 g"},{"name":"Origan séché","qty":"3 g"}]',
 '["Mélanger toutes les épices.","Appliquer 1h avant cuisson pour le bœuf, la veille pour le porc.","Excellent sur les travers de porc, le poulet et le brisket."]',
 '75 g', '5 min', '{brisket,spare_ribs,baby_back_ribs,whole_chicken,pulled_pork}', 'Pays Basque & Espagne', 'facile',
 '{paprika-fumé,espelette,basque,épicé,polyvalent}', 'published', 72),

('Rub café-cacao noir (bœuf)', 'rub-cafe-cacao-noir', 'rub',
 'Café torréfié foncé, cacao amer, poivre de Sarawak. Bark noire intense pour le brisket.',
 'Version premium du rub au café. Le cacao amer apporte de la profondeur, le café de l''amertume qui contraste avec le gras du bœuf, et le poivre de Sarawak une chaleur complexe. La bark obtenue est d''un noir intense.',
 '[{"name":"Café torréfié foncé, moulu gros","qty":"20 g"},{"name":"Cacao amer en poudre","qty":"10 g"},{"name":"Poivre de Sarawak (ou Tellicherry)","qty":"15 g"},{"name":"Sel casher","qty":"25 g"},{"name":"Cassonade foncée","qty":"15 g"},{"name":"Poudre d''ail","qty":"8 g"},{"name":"Piment ancho","qty":"5 g"}]',
 '["Mélanger toutes les épices.","Appliquer généreusement 1h avant cuisson.","Idéal avec du bois de chêne ou de noyer.","Attention : ne pas cuire au-dessus de 150°C — le café et le sucre brûlent."]',
 '100 g — 1 brisket', '5 min', '{brisket,beef_short_ribs,chuck_roast}', 'Inspiration Tuffy Stone & craft BBQ', 'moyen',
 '{café,cacao,bark,boeuf,brisket,noir}', 'published', 73),

('Rub méditerranéen (poulet fumé)', 'rub-mediterraneen-poulet', 'rub',
 'Sumac, za''atar, cumin, coriandre. Le Moyen-Orient rencontre le fumoir américain.',
 'Le sumac apporte une acidité citronnée sans liquide (parfait pour la bark). Le za''atar est un mélange de thym, sésame et sumac. Le cumin et la coriandre rappellent le Maghreb. Un rub unique.',
 '[{"name":"Sumac","qty":"10 g"},{"name":"Za''atar","qty":"10 g"},{"name":"Cumin moulu","qty":"5 g"},{"name":"Coriandre moulue","qty":"5 g"},{"name":"Sel","qty":"15 g"},{"name":"Poivre noir","qty":"5 g"},{"name":"Ail granulé","qty":"8 g"},{"name":"Huile d''olive","qty":"15 ml","note":"En liant"}]',
 '["Mélanger les épices sèches.","Enduire la volaille d''huile d''olive.","Appliquer le rub en massant sous la peau.","Fumer au bois de vigne ou d''olivier si disponible."]',
 '75 g — 1 poulet entier', '5 min', '{whole_chicken,chicken_breasts,lamb_shoulder}', 'Méditerranée orientale', 'facile',
 '{méditerranéen,sumac,zaatar,poulet,moyen-orient}', 'published', 74),

('Rub sucré compétition (ribs)', 'rub-sucre-competition-ribs', 'rub',
 'Cassonade, paprika, moutarde sèche, poudre d''oignon. Le rub sucré de compétition BBQ pour des ribs caramélisés.',
 'En compétition KCBS, les ribs sont jugés sur la tendreté, le goût et l''apparence. Ce rub sucré crée un glaçage caramélisé pendant la cuisson qui brille à la lumière. C''est ce qu''on appelle les « candy ribs ».',
 '[{"name":"Cassonade foncée","qty":"40 g"},{"name":"Paprika doux","qty":"20 g"},{"name":"Poudre d''ail","qty":"10 g"},{"name":"Poudre d''oignon","qty":"10 g"},{"name":"Moutarde sèche","qty":"8 g"},{"name":"Cumin","qty":"5 g"},{"name":"Sel","qty":"15 g"},{"name":"Poivre noir","qty":"8 g"},{"name":"Cayenne","qty":"2 g"},{"name":"Cannelle","qty":"2 g"}]',
 '["Mélanger toutes les épices en brisant les grumeaux de cassonade.","Appliquer une couche de moutarde jaune sur les ribs (le liant).","Saupoudrer le rub en couche épaisse.","Laisser « suer » 15 min avant de mettre au fumoir.","Les ribs doivent briller après cuisson — c''est le signe que c''est réussi."]',
 '120 g — 2 racks de ribs', '5 min', '{spare_ribs,baby_back_ribs}', 'Compétition KCBS — championship ribs', 'moyen',
 '{compétition,sucré,ribs,candy,caramel,KCBS}', 'published', 75);
