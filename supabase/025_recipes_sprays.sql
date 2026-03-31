-- ══════════════════════════════════════════════════════════════
-- 025 — Recettes de sprays (spritz) pendant la cuisson
-- 5 recettes de type "mop" appliquées au spray
-- ══════════════════════════════════════════════════════════════

INSERT INTO recipes (
  title, slug, type,
  summary, description,
  ingredients, steps,
  yield_amount, prep_time, meat_types, origin, difficulty,
  tags, status, sort_order
) VALUES

-- ═══════════════════════════════════════════════════════════
-- SPRAYS / SPRITZ (5)
-- ═══════════════════════════════════════════════════════════

('Spray vinaigre de cidre & jus de pomme', 'spray-vinaigre-cidre-jus-pomme', 'mop',
 'Le spritz classique des pitmasters. Vinaigre de cidre et jus de pomme 50/50 — simple, efficace, universel.',
 'C''est LE spray de référence en BBQ. Le vinaigre de cidre aide à fixer la fumée sur la surface de la viande et favorise la formation de la bark. Le jus de pomme apporte un sucre naturel qui caramélise doucement. Commence à sprayer après 2h de cuisson minimum — avant ça, tu empêches le rub de se fixer. Un coup de spray toutes les 45 min suffit. Chaque ouverture du fumoir coûte 15 min de récupération, donc sois rapide.',
 '[{"name":"Vinaigre de cidre","qty":"250 ml"},{"name":"Jus de pomme (pur, sans sucre ajouté)","qty":"250 ml"},{"name":"Eau","qty":"50 ml","note":"Optionnel, si trop acide"}]',
 '["Mélanger vinaigre de cidre et jus de pomme dans un flacon spray propre.","Secouer avant chaque utilisation.","Commencer à sprayer après minimum 2h de cuisson (la surface doit être sèche au toucher).","Sprayer à 20-30 cm de la viande, en brume légère — pas de jet direct.","Répéter toutes les 45 min à 1h.","Arrêter de sprayer quand tu wrappes (si tu wrappes)."]',
 '500 ml — plusieurs cuissons', '2 min', '{brisket,pulled_pork,spare_ribs,baby_back_ribs,beef_short_ribs}',
 'Standard pitmaster US', 'facile',
 '{spray,spritz,vinaigre,cidre,pomme,classique,bark}', 'published', 120),

('Spray beurre-ail pour volaille', 'spray-beurre-ail-volaille', 'mop',
 'Beurre clarifié, ail, citron et thym. Le spray qui donne une peau dorée et croustillante au poulet fumé.',
 'Le gras du beurre clarifié aide à obtenir une peau croustillante sur la volaille. L''ail et le citron parfument en douceur. Le beurre clarifié (ghee) est indispensable — le beurre normal bouche le spray à cause des protéines de lait. Utilise un flacon spray résistant à la chaleur, le mélange doit rester tiède.',
 '[{"name":"Beurre clarifié (ghee) fondu","qty":"100 ml"},{"name":"Jus de citron","qty":"30 ml"},{"name":"Ail en poudre","qty":"5 g"},{"name":"Thym séché","qty":"2 g"},{"name":"Sel","qty":"3 g"},{"name":"Eau chaude","qty":"100 ml"}]',
 '["Faire fondre le ghee et le mélanger à l''eau chaude pour le rendre assez liquide.","Ajouter le jus de citron, l''ail en poudre, le thym et le sel.","Verser dans un flacon spray.","Garder le mélange tiède (à côté du fumoir) pour éviter que le beurre fige.","Sprayer le poulet toutes les 30 min à partir de la première heure.","Insister sur les cuisses et le bréchet — les zones qui sèchent le plus vite."]',
 '250 ml — 2 poulets', '5 min', '{whole_chicken}',
 'Pitmaster volaille', 'facile',
 '{spray,beurre,ail,poulet,volaille,peau,croustillant}', 'published', 121),

('Spray Worcestershire & bouillon de bœuf', 'spray-worcestershire-bouillon-boeuf', 'mop',
 'Bouillon concentré, Worcestershire, oignon. Le spray umami pour le brisket et les pièces de bœuf.',
 'Ce spray apporte de l''umami directement sur la surface du bœuf. La Worcestershire est riche en glutamate naturel (anchois fermenté), et le bouillon de bœuf renforce le goût viande. C''est le spray que beaucoup de pitmasters de compétition utilisent sur le brisket pour intensifier la saveur de la bark sans ajouter de sucre.',
 '[{"name":"Bouillon de bœuf concentré","qty":"200 ml"},{"name":"Sauce Worcestershire","qty":"60 ml"},{"name":"Eau","qty":"100 ml"},{"name":"Poudre d''oignon","qty":"5 g"},{"name":"Poivre noir moulu","qty":"3 g"}]',
 '["Chauffer légèrement le bouillon pour le fluidifier.","Ajouter la Worcestershire, l''eau, la poudre d''oignon et le poivre.","Bien mélanger et verser dans un flacon spray.","Sprayer le brisket toutes les 45 min à partir de la 3e heure.","Ce spray ne caramélise pas — tu peux l''utiliser même à haute température.","Idéal combiné avec un rub sel-poivre style Texas."]',
 '400 ml — 1 brisket', '5 min', '{brisket,beef_short_ribs,chuck_roast,prime_rib}',
 'Compétition — style Texas', 'facile',
 '{spray,worcestershire,bouillon,boeuf,umami,compétition}', 'published', 122),

('Spray bourbon-érable pour ribs', 'spray-bourbon-erable-ribs', 'mop',
 'Bourbon, sirop d''érable et vinaigre. Le spray sucré-boisé qui transforme les ribs en candy ribs.',
 'L''alcool du bourbon s''évapore à la cuisson en laissant ses arômes vanillés et boisés (le bourbon vieillit en fûts de chêne). Le sirop d''érable caramélise lentement sur la surface et crée cette brillance laquée que les juges adorent en compétition. Attention : commence à sprayer seulement après 2-3h, quand la bark est formée. Trop tôt, le sucre empêche la bark de se fixer.',
 '[{"name":"Bourbon","qty":"100 ml"},{"name":"Sirop d''érable pur","qty":"60 ml"},{"name":"Vinaigre de cidre","qty":"60 ml"},{"name":"Jus de pomme","qty":"100 ml"},{"name":"Cannelle moulue","qty":"1 g","note":"Optionnel"}]',
 '["Mélanger tous les ingrédients dans un flacon spray.","Secouer vigoureusement avant chaque utilisation (l''érable a tendance à se déposer).","Commencer à sprayer après 2h30-3h de cuisson.","Sprayer les ribs toutes les 30-40 min.","Particulièrement efficace juste avant le wrap : 2 couches de spray, puis wrapper en papier d''alu.","Pour des candy ribs : spray abondant dans les 45 dernières minutes."]',
 '350 ml — 3 racks de ribs', '3 min', '{spare_ribs,baby_back_ribs}',
 'Compétition KCBS — candy ribs', 'moyen',
 '{spray,bourbon,érable,ribs,candy,laqué,compétition}', 'published', 123),

('Spray bière brune & miel', 'spray-biere-brune-miel', 'mop',
 'Bière brune artisanale, miel et piment d''Espelette. Le spray à la française, parfumé et caramélisant.',
 'La bière brune (stout, porter ou brune d''abbaye) apporte des saveurs de torréfaction, de caramel et de malt qui se marient parfaitement avec la fumée. Le miel ajoute du sucre pour la caramélisation, et le piment d''Espelette apporte une chaleur douce. Version française du spray classique — utilise une bière de qualité, pas une industrielle. La mousse peut boucher le spray : laisse la bière se dégazer 30 min avant de préparer le mélange.',
 '[{"name":"Bière brune (stout ou brune d''abbaye)","qty":"200 ml","note":"Dégazée 30 min"},{"name":"Miel","qty":"30 ml"},{"name":"Vinaigre de cidre","qty":"30 ml"},{"name":"Piment d''Espelette","qty":"3 g"},{"name":"Sel","qty":"2 g"}]',
 '["Laisser la bière se dégazer 30 min dans un verre large.","Chauffer légèrement pour fondre le miel (ne pas bouillir — tu perds les arômes de la bière).","Ajouter le vinaigre, le piment d''Espelette et le sel.","Verser dans un flacon spray.","Sprayer toutes les 45 min à partir de la 2e heure.","Excellent sur le porc (échine, travers) et le poulet."]',
 '300 ml — plusieurs cuissons', '5 min + 30 min dégazage', '{pulled_pork,spare_ribs,whole_chicken,baby_back_ribs}',
 'France — craft BBQ', 'facile',
 '{spray,bière,brune,miel,espelette,français}', 'published', 124)

ON CONFLICT (slug) DO NOTHING;
