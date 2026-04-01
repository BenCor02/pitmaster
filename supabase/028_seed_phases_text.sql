-- 028_seed_phases_text.sql
-- Pre-remplit les textes des phases pour chaque profil
-- Ces textes sont éditables depuis l'admin "Profils cuisson"
-- Si phases_text est NULL, engine.js utilise les textes hardcodés comme fallback

-- ── BRISKET ──
UPDATE cooking_profiles SET phases_text = '{
  "phase1_title": "Prise de fumée",
  "phase1_objective": "Formation de la bark — la croûte fumée qui fait toute la différence",
  "phase1_visual": "La surface fonce du rose au brun acajou. Le gras de surface commence à rendre et nourrit la bark.",
  "phase1_temp": "Température interne : ~55–70°C",
  "phase1_info": "C''est pendant cette phase que la viande absorbe le plus de fumée. Bois de choix : chêne, noyer, ou mesquite pour un goût texan.",
  "phase1_advice": "Côté gras vers le haut ou le bas ? Ça dépend de ton fumoir. Gras vers la source de chaleur pour protéger la viande. Ne touche à rien pendant au moins 2h.",
  "stall_title": "Le Stall — la viande transpire",
  "stall_objective": "La viande transpire — l''évaporation fait stagner la température pendant parfois 2 à 4h",
  "stall_info": "C''est normal et c''est un bon signe. L''eau s''évapore en surface et refroidit la viande, comme la sueur. Plus le brisket est gros, plus le stall est long.",
  "stall_advice": "C''est le moment où la plupart des débutants paniquent. Ne monte PAS la température du fumoir. Si tu as le temps, laisse faire. Sinon, c''est le moment de wrapper.",
  "wrap_title": "Le Wrap — Texas Crutch",
  "wrap_objective": "Passer le stall, garder l''humidité et accélérer la dernière ligne droite",
  "wrap_tip": "Pour le brisket, le papier boucher (peach paper) est le choix des compétiteurs — il garde la bark intacte tout en retenant l''humidité.",
  "wrap_advice": "Papier boucher > aluminium pour le brisket. L''alu donne un résultat plus « braisé ». Le papier garde la texture de la bark. Ajoute un filet de jus de cuisson ou de bouillon avant de fermer.",
  "transform_title": "La Transformation",
  "transform_objective": "Le tissu conjonctif fond et se transforme en gélatine — c''est ça qui rend le brisket fondant",
  "transform_info": "Le thermomètre ne suffit pas. Deux briskets à 96°C peuvent avoir des textures complètement différentes. Fais confiance à la sonde : elle doit glisser sans aucune résistance.",
  "transform_advice": "Teste le flat (partie maigre) au point le plus épais. Si ça accroche encore, remets 30 min et reteste. La patience ici fait la différence entre un bon et un grand brisket.",
  "rest_title": "Le Repos — patience finale",
  "rest_objective": "Les jus se redistribuent et la gélatine se stabilise — le repos est AUSSI important que la cuisson",
  "rest_markers_text": "Emballer serré dans du papier boucher, puis dans une serviette épaisse\nPlacer dans une glacière fermée (sans glace). Peut tenir 4h+ sans problème.\nUn brisket qui a reposé 2h sera toujours meilleur qu''un brisket découpé à la sortie du fumoir.",
  "rest_advice": "Minimum 1h de repos, idéalement 2h. Aaron Franklin repose ses briskets 2-3h en glacière. C''est pendant le repos que la magie opère — la gélatine épaissit et retient les jus."
}'::jsonb WHERE id = 'brisket';

-- ── BEEF SHORT RIBS ──
UPDATE cooking_profiles SET phases_text = '{
  "phase1_title": "Prise de fumée",
  "phase1_objective": "Développement de la bark et pénétration de la fumée dans les fibres épaisses",
  "phase1_visual": "La surface caramélise lentement. Le gras entre les os commence à rendre et perle en surface.",
  "phase1_temp": "Température interne : ~55–70°C",
  "phase1_info": "Les short ribs sont très persillées — le gras intramusculaire fond pendant toute la cuisson et donne cette texture « beefy » incomparable.",
  "phase1_advice": "Dispose les short ribs os vers le bas pour protéger la viande. Le gras va fondre vers le bas et nourrir la bark. Bois recommandé : chêne ou hickory.",
  "stall_title": "Le Stall — la viande transpire",
  "stall_objective": "Stall classique — la température interne semble bloquée pendant que l''eau s''évapore",
  "stall_info": "Sur les short ribs, le stall peut être moins prononcé que sur un brisket car la pièce est plus petite, mais il est bien là.",
  "stall_advice": "Patience. Les short ribs ont beaucoup de tissu conjonctif qui a besoin de temps pour se transformer. Ne coupe pas la cuisson trop tôt.",
  "wrap_title": "Le Wrap — Texas Crutch",
  "wrap_objective": "Passer le stall, garder l''humidité et accélérer la dernière ligne droite",
  "wrap_tip": "L''aluminium fonctionne très bien pour les short ribs — l''effet « braisé » est un plus sur cette pièce grasse.",
  "wrap_advice": "Alu ou papier boucher, les deux marchent. Ajoute un peu de bouillon de bœuf ou de jus de cuisson pour braiser légèrement. Le résultat sera spectaculaire.",
  "transform_title": "La Transformation",
  "transform_objective": "Le gras et les tissus conjonctifs fondent — la viande devient tremblotante comme de la gelée",
  "transform_info": "Les short ribs peuvent encaisser jusqu''à 99°C sans problème. Plus tu pousses (dans la cible), plus c''est fondant. Le gras protège la viande du dessèchement.",
  "transform_advice": "Secoue doucement le rack — la viande doit trembler comme de la gelée. C''est le signe que c''est prêt. Si c''est encore ferme, remets 30 min.",
  "rest_title": "Le Repos — patience finale",
  "rest_objective": "Stabilisation des jus — repos modéré pour une viande prête à servir",
  "rest_markers_text": "Reposer 30 min à 1h à couvert, dans l''emballage\nLa viande doit légèrement « figer » en surface — c''est le gras qui se stabilise",
  "rest_advice": "Repos plus court que le brisket — 30 min à 1h suffit. Les short ribs se servent souvent en rack entier, découpées entre les os à table."
}'::jsonb WHERE id = 'beef_short_ribs';

-- ── CHUCK ROAST ──
UPDATE cooking_profiles SET phases_text = '{
  "phase1_title": "Prise de fumée",
  "phase1_objective": "Formation de la bark sur cette pièce compacte et persillée",
  "phase1_visual": "La surface fonce uniformément. Le paleron étant compact, la bark se forme plus vite que sur un brisket.",
  "phase1_temp": "Température interne : ~55–70°C",
  "phase1_info": "Le paleron est le « poor man''s brisket » — moins cher, plus rapide, et excellent en pulled beef. Très persillé = très tolérant.",
  "phase1_advice": "Pas besoin de spritzer le paleron — il a suffisamment de gras interne pour rester juteux. Laisse le fumoir faire son travail.",
  "stall_title": "Le Stall — la viande transpire",
  "stall_objective": "Stall plus court que le brisket grâce à la taille plus modeste de la pièce",
  "stall_info": "Le paleron stalle aussi mais moins longtemps. Le réseau de gras interne aide à passer le plateau plus vite.",
  "stall_advice": "Le paleron est plus tolérant que le brisket. Même si tu dépasses un peu la cible en température, le gras interne compense.",
  "wrap_title": "Le Wrap — Texas Crutch",
  "wrap_objective": "Passer le stall, garder l''humidité et accélérer la dernière ligne droite",
  "wrap_tip": "Le papier alu avec un fond de bouillon donne un excellent résultat « braisé » sur le paleron.",
  "wrap_advice": "Emballer avec un filet de bouillon de bœuf ou de Worcestershire. Le paleron se prête bien à un résultat mi-fumé, mi-braisé.",
  "transform_title": "La Transformation",
  "transform_objective": "Le réseau de gras et de tissus conjonctifs fond — le paleron se défait en filaments",
  "transform_info": "Cible 91–96°C. Le paleron est prêt quand tu peux le tirer en filaments avec deux fourchettes sans effort.",
  "transform_advice": "Teste en tirant un morceau avec une fourchette. Si ça se défait en filaments sans résistance, c''est prêt pour du pulled beef. Sinon, remets 20 min.",
  "rest_title": "Le Repos — patience finale",
  "rest_objective": "Court repos pour stabiliser la texture avant d''effilocher",
  "rest_markers_text": "Reposer 30 min à couvert dans l''emballage\nLe paleron peut être effiloché directement après le repos — pas besoin de glacière",
  "rest_advice": "Repos de 30 min à 1h, puis effiloche dans un grand saladier. Mélange avec un peu de jus de cuisson récupéré dans l''emballage."
}'::jsonb WHERE id = 'chuck_roast';

-- ── PULLED PORK ──
UPDATE cooking_profiles SET phases_text = '{
  "phase1_title": "Prise de fumée",
  "phase1_objective": "Formation de la bark et absorption maximale de la fumée — c''est ici que le goût se construit",
  "phase1_visual": "La surface rougit puis vire au brun-rouge foncé. La couche de gras externe commence à fondre et nourrit la bark.",
  "phase1_temp": "Température interne : ~55–65°C",
  "phase1_info": "L''échine de porc (pork butt) est la pièce la plus tolérante du BBQ. Beaucoup de gras, beaucoup de tissu conjonctif = beaucoup de saveur et une grande marge d''erreur.",
  "phase1_advice": "Bois de choix : pommier, cerisier, ou hickory. Le fumoir à 107–121°C est le sweet spot. Ne soulève pas le couvercle pendant les 3 premières heures.",
  "stall_title": "Le Stall — la viande transpire",
  "stall_objective": "Le porc stalle plus tôt et parfois plus longtemps que le bœuf — c''est normal",
  "stall_info": "L''échine de porc contient beaucoup d''eau. Le stall peut commencer dès 63°C et durer plusieurs heures. C''est la phase la plus longue.",
  "stall_advice": "C''est LE moment de patience. Le pulled pork récompense ceux qui ne paniquent pas. Si tu as le temps, ne wrappe pas — la bark sera exceptionnelle.",
  "wrap_title": "Le Wrap — Texas Crutch",
  "wrap_objective": "Passer le stall, garder l''humidité et accélérer la dernière ligne droite",
  "wrap_tip": "Pour le porc, l''alu fonctionne aussi bien que le papier boucher. Ajoute du jus de pomme ou du vinaigre de cidre dans le wrap.",
  "wrap_advice": "Emballe avec un généreux filet de jus de pomme (ou bière, ou vinaigre de cidre). L''acidité attendrit les fibres et ajoute une couche de saveur. Le porc est tolérant — difficile de rater.",
  "transform_title": "La Transformation",
  "transform_objective": "Le gras fond dans les fibres, les tissus se relâchent — la viande devient effilochable",
  "transform_info": "La cible est 93–96°C mais c''est la sonde qui décide. L''os doit tourner librement et se retirer presque tout seul — c''est le signe ultime.",
  "transform_advice": "Essaie de faire tourner l''os. S''il bouge librement, c''est prêt. La sonde doit glisser partout comme dans du beurre fondu. Si l''os résiste encore, remets 30 min.",
  "rest_title": "Le Repos — patience finale",
  "rest_objective": "Les fibres se relâchent encore et les jus se redistribuent — le repos rend l''effilochage plus facile",
  "rest_markers_text": "Emballer dans du papier alu puis dans une serviette, placer en glacière (sans glace)\nLe jus va continuer à s''accumuler dans l''emballage — récupère-le pour le mélanger au pulled pork",
  "rest_advice": "Minimum 45 min, idéalement 1h30. Comme le brisket, le pulled pork peut tenir 3-4h en glacière sans problème. Plus tu reposes, plus c''est facile à effilocher et juteux."
}'::jsonb WHERE id = 'pulled_pork';

-- ── SPARE RIBS ──
UPDATE cooking_profiles SET phases_text = '{
  "smoke_title": "Fumée à nu",
  "smoke_objective": "Développer la bark et les arômes fumés",
  "smoke_markers_text": "La surface fonce et devient sèche\n110–120°C au fumoir",
  "smoke_advice": "Pas besoin de spritzer pendant cette phase. Laisser le feu faire son travail.",
  "wrap_title": "Emballé (wrap)",
  "wrap_objective": "Attendrir la viande et accélérer la cuisson",
  "wrap_markers_text": "Emballer avec beurre, miel ou jus de pomme\nPapier alu ou papier boucher",
  "wrap_advice": "C''est pendant cette phase que la viande devient fondante. Ne pas ouvrir.",
  "finish_title": "Finition / laquage",
  "finish_objective": "Caraméliser la sauce et raffermir légèrement la surface",
  "finish_markers_text": "Appliquer la sauce en couches fines\nLa sauce doit devenir collante et brillante",
  "finish_advice": "Remettre à nu dans le fumoir. Badigeonner toutes les 15-20 minutes.",
  "unwrapped_title": "Fumée complète à nu",
  "unwrapped_objective": "Cuisson lente sans emballage — bark maximale",
  "unwrapped_advice": "Sans wrap, la bark est plus prononcée mais la viande est moins fondante. Spritzer toutes les 45 min si nécessaire.",
  "rest_title": "Repos",
  "rest_objective": "Laisser les jus se redistribuer",
  "rest_markers_text": "Reposer 10-20 minutes à couvert",
  "rest_advice": "Les ribs ne nécessitent pas un long repos comme un brisket."
}'::jsonb WHERE id = 'spare_ribs';

-- ── BABY BACK RIBS ──
UPDATE cooking_profiles SET phases_text = '{
  "smoke_title": "Fumée à nu",
  "smoke_objective": "Développer la bark et les arômes fumés",
  "smoke_markers_text": "La surface fonce et devient sèche\n110–120°C au fumoir",
  "smoke_advice": "Les baby backs sont plus fins — surveille bien la couleur.",
  "wrap_title": "Emballé (wrap)",
  "wrap_objective": "Attendrir la viande et accélérer la cuisson",
  "wrap_markers_text": "Emballer avec beurre, miel ou jus de pomme\nPapier alu ou papier boucher",
  "wrap_advice": "C''est pendant cette phase que la viande devient fondante. Ne pas ouvrir.",
  "finish_title": "Finition / laquage",
  "finish_objective": "Caraméliser la sauce et raffermir légèrement la surface",
  "finish_markers_text": "Appliquer la sauce en couches fines\nLa sauce doit devenir collante et brillante",
  "finish_advice": "Remettre à nu dans le fumoir. Badigeonner toutes les 15-20 minutes.",
  "unwrapped_title": "Fumée complète à nu",
  "unwrapped_objective": "Cuisson lente sans emballage — bark maximale",
  "unwrapped_advice": "Sans wrap, la bark est plus prononcée. Les baby backs sèchent plus vite que des spare ribs — ne pas dépasser le temps.",
  "rest_title": "Repos",
  "rest_objective": "Laisser les jus se redistribuer",
  "rest_markers_text": "Reposer 10-15 minutes à couvert",
  "rest_advice": "Les baby backs ne nécessitent pas un long repos — 10-15 min suffit."
}'::jsonb WHERE id = 'baby_back_ribs';

-- ── PRIME RIB (Reverse Sear) ──
UPDATE cooking_profiles SET phases_text = '{
  "indirect_title": "Cuisson indirecte basse température",
  "indirect_objective": "Monter doucement en température pour une cuisson uniforme de la côte de bœuf",
  "indirect_advice": "Place la côte en zone indirecte à 110°C avec des copeaux de bois. Ferme le couvercle et surveille la sonde. La patience est la clé — plus c''est lent, plus c''est uniforme.",
  "sear_title": "Saisie finale (sear)",
  "sear_objective": "Créer une croûte caramélisée spectaculaire (réaction de Maillard)",
  "sear_advice": "Sécher la surface avant de saisir. Grill à 250°C+ ou poêle en fonte brûlante. 1-2 min par face. Une surface sèche = meilleure croûte.",
  "rest_title": "Repos",
  "rest_objective": "Redistribution des jus dans toute la pièce",
  "rest_advice": "Repos 10 min sous alu lâche. Ne pas couper immédiatement — les jus ont besoin de se stabiliser."
}'::jsonb WHERE id = 'prime_rib';

-- ── TOMAHAWK (Reverse Sear) ──
UPDATE cooking_profiles SET phases_text = '{
  "indirect_title": "Cuisson indirecte basse température",
  "indirect_objective": "Monter doucement en température pour une cuisson uniforme du bord au centre",
  "indirect_advice": "Le tomahawk est épais : le reverse sear est la méthode idéale. Monte lentement au fumoir avec quelques copeaux pour la saveur fumée.",
  "sear_title": "Saisie finale (sear)",
  "sear_objective": "Créer une croûte caramélisée digne d''une compétition",
  "sear_advice": "Saisie violente au charbon ou à la fonte brûlante. 45-60 secondes par face. Sécher la surface avant — c''est le secret d''une bonne Maillard.",
  "rest_title": "Repos",
  "rest_objective": "Redistribution des jus — court mais essentiel",
  "rest_advice": "Repos court, 5-10 min sous aluminium lâche. Le tomahawk se sert rose au centre, avec une croûte parfaite."
}'::jsonb WHERE id = 'tomahawk';

-- ── WHOLE CHICKEN (Volaille) ──
UPDATE cooking_profiles SET phases_text = '{
  "smoke_title": "Mise en fumée",
  "smoke_objective": "Absorption de la fumée et coloration de la peau",
  "smoke_markers_text": "La peau commence à dorer et prend une teinte ambrée\nTempérature interne : ~40–55°C\nPlacement de la sonde : piquer dans la partie la plus épaisse de la cuisse, sans toucher l''os",
  "smoke_advice": "Plante la sonde dans le gras de la cuisse, entre le pilon et le haut de cuisse, en visant le centre de la chair. C''est la partie la plus longue à cuire — c''est elle qui décide quand le poulet est prêt.",
  "cook_title": "Cuisson principale",
  "cook_objective": "Montée en température progressive vers la cible de 74°C",
  "cook_markers_text": "La température monte régulièrement — pas de stall comme le bœuf ou le porc\nCommencer à surveiller à partir de 65°C interne\nLe jus qui coule de la cuisse doit devenir clair (pas rosé)",
  "cook_advice_high": "À 150°C+ au fumoir, la peau croustille bien. C''est le sweet spot pour un poulet fumé avec une belle peau.",
  "cook_advice_low": "En dessous de 130°C, la peau reste molle et caoutchouteuse. Pense à finir 10 min sur un grill chaud pour la crisper.",
  "finish_title": "Vérification & finition",
  "finish_objective": "S''assurer que le poulet est cuit à cœur et que la peau est à ton goût",
  "finish_markers_text": "Cible : 74°C dans la cuisse (sécurité alimentaire)\nVérifier aussi entre le blanc et la cuisse : piquer à la jonction, viser 74°C\nRemuer une cuisse — elle doit bouger facilement dans l''articulation",
  "finish_advice_high": "Si la peau est déjà dorée et croustillante, c''est prêt. Ne dépasse pas 80°C interne sinon les blancs sèchent.",
  "finish_advice_low": "Peau molle ? Finis 5–10 min sur un grill très chaud (250°C+) ou sous le gril du four pour crisper la peau sans sur-cuire la chair.",
  "rest_title": "Repos",
  "rest_objective": "Les jus se redistribuent — le poulet sera plus juteux à la découpe",
  "rest_markers_text": "Couvrir de papier alu en tente (sans serrer, pour garder la peau croustillante)\nLaisser reposer sur une planche, pas dans un plat (l''humidité ramollit le dessous)",
  "rest_advice": "Un repos de 10–15 min suffit pour le poulet. Pas besoin de glacière comme pour le brisket — la volaille se découpe vite."
}'::jsonb WHERE id = 'whole_chicken';
