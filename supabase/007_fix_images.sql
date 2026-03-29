-- ============================================================
-- FIX — Remplacement images Unsplash mortes par Pexels
-- Images libres de droits, hotlink autorisé
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

-- ── GUIDES (004_cms_seed) ──────────────────────────────────

-- Brisket : photo de brisket tranché
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/12645502/pexels-photo-12645502.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-brisket';

-- Reverse sear : tomahawk sur flamme
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/12261087/pexels-photo-12261087.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-reverse-sear';

-- ── GUIDES (005_guides_seed) ────────────────────────────────

-- Pulled pork : porc grillé au charbon
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/1212277/pexels-photo-1212277.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-pulled-pork';

-- Beef short ribs : viande grillée
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/8250702/pexels-photo-8250702.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-beef-short-ribs';

-- Spare ribs : viande grillée BBQ
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-spare-ribs';

-- Baby back ribs : côtes grillées
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/7613432/pexels-photo-7613432.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-baby-back-ribs';

-- Chuck roast (paleron) : viande tranchée
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/4765772/pexels-photo-4765772.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-chuck-roast';

-- Poulet entier : poulet rôti
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/13458086/pexels-photo-13458086.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-poulet-entier';

-- Prime rib : côte de bœuf / steak
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-prime-rib';

-- Tomahawk : viande os sur flamme
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/12261087/pexels-photo-12261087.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-tomahawk';

-- Stall BBQ : viande tranchée gros plan
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/1927383/pexels-photo-1927383.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-stall-bbq';

-- Emballage (wrap) : viande planche à découper
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/5237010/pexels-photo-5237010.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-wrap-papier-alu';

-- Gestion du feu : BBQ grill charbon
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/69056/pexels-photo-69056.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-gestion-feu';

-- Repos : viande tranchée sur planche
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/9424951/pexels-photo-9424951.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-repos-viande';

-- Choisir son fumoir : barbecue
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/2491272/pexels-photo-2491272.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-choisir-fumoir';

-- Thermomètre : viande grillée gros plan
UPDATE public.guides SET cover_url = 'https://images.pexels.com/photos/792027/pexels-photo-792027.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop'
WHERE slug = 'guide-thermometre';


-- ── OUTILS AFFILIÉS ─────────────────────────────────────────

-- On met null car pas d'image spécifique produit
-- Tu pourras ajouter les vraies photos produit depuis l'admin
UPDATE public.affiliate_tools SET image_url = NULL
WHERE image_url LIKE '%unsplash.com%';
