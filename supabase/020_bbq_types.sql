-- ══════════════════════════════════════════════════════════════
-- 020 — Table bbq_types : types de BBQ / fumoirs gérables via admin
-- ══════════════════════════════════════════════════════════════

create table if not exists public.bbq_types (
  id text primary key,
  name text not null,
  alt_names text[] not null default '{}',
  icon text,
  tagline text,
  description text not null,
  temp_range text,
  fuel text,
  price_range text,
  level text not null check (level in ('debutant', 'intermediaire', 'avance')),
  capacity text,
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  best_for text[] not null default '{}',
  not_ideal_for text[] not null default '{}',
  brands text[] not null default '{}',
  tips text,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bbq_types enable row level security;

create policy "bbq_types_select_public" on public.bbq_types
  for select using (status = 'published');

create policy "bbq_types_admin_all" on public.bbq_types
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create trigger bbq_types_updated_at
  before update on public.bbq_types
  for each row execute function public.set_updated_at();

-- ── Seed data ──
INSERT INTO bbq_types (id, name, alt_names, icon, tagline, description, temp_range, fuel, price_range, level, capacity, pros, cons, best_for, not_ideal_for, brands, tips, sort_order, status) VALUES
('offset', 'Offset Smoker', '{"Fumoir horizontal","Stick burner","Barrel smoker"}', '🏭',
 'Le fumoir des puristes. Feu de bois, contrôle manuel, saveur incomparable.',
 'Le offset smoker (fumoir à foyer déporté) est le roi du fumage traditionnel. Le feu brûle dans une chambre latérale (firebox) et la fumée traverse la chambre de cuisson horizontale avant de s''échapper par la cheminée.',
 '107–135°C', 'Bûches de bois (chêne, hickory, mesquite)', '300€ – 3 000€+', 'avance', 'Grande (4–8 pièces)',
 '{"Saveur de fumée authentique et incomparable","Grande capacité pour les grosses pièces","Contrôle total sur le type de bois","Le vrai BBQ traditionnel texan","Bark exceptionnelle grâce au flux d''air"}',
 '{"Courbe d''apprentissage importante","Surveillance constante (toutes les 30–45 min)","Consommation de bois élevée","Modèles bon marché = problèmes d''étanchéité","Encombrant et difficile à déplacer"}',
 '{"Brisket","Épaule de porc","Travers de porc","Beef ribs"}',
 '{"Cuissons rapides","Petits espaces","Débutants pressés"}',
 '{"Oklahoma Joe''s","Lone Star Grillz","Yoder","Old Country BBQ Pits","Horizon"}',
 'Commence avec un petit offset (Highland de Oklahoma Joe''s ~250€). Apprends à gérer les splits de bois. La clé : un feu propre qui produit une fumée bleue/transparente.',
 1, 'published'),

('kamado', 'Kamado', '{"Œuf céramique","Big Green Egg","Kamado Joe"}', '🥚',
 'Polyvalent, économe en charbon, isolation parfaite. Le couteau suisse du BBQ.',
 'Le kamado est un four en céramique épaisse d''origine japonaise. Sa forme en œuf et son isolation exceptionnelle permettent de maintenir des températures très basses (90°C) comme très hautes (400°C+).',
 '90–400°C+', 'Charbon de bois + morceaux de bois', '500€ – 2 500€', 'intermediaire', 'Moyenne (2–4 pièces)',
 '{"Polyvalence incroyable : fumer, griller, rôtir, pizza","Isolation céramique — consommation très faible","Température stable sur de longues heures","Excellente rétention d''humidité","Construction solide — dure des décennies","Compact pour sa capacité"}',
 '{"Prix d''entrée élevé","Lourd (60–100+ kg)","Temps de montée en température plus long","Récupération lente si ouverture prolongée","Capacité limitée vs un offset","Risque de flashback à l''ouverture"}',
 '{"Brisket","Pulled pork","Poulet entier","Pizza","Côte de bœuf"}',
 '{"Très grosses quantités","Cuisson pour 20+ personnes"}',
 '{"Big Green Egg","Kamado Joe","Monolith","Primo","Char-Griller Akorn"}',
 'Le Kamado Joe Classic III (~1 100€) est le meilleur rapport qualité-prix. Utilise du charbon en morceaux (pas de briquettes).',
 2, 'published'),

('pellet', 'Pellet Smoker', '{"Fumoir à granulés","Traeger","Smoker automatique"}', '🤖',
 'Le fumoir set it and forget it. Automatisé, régulier, parfait pour débuter.',
 'Le pellet smoker utilise des granulés de bois compressé alimentés par une vis sans fin motorisée. Un contrôleur électronique ajuste automatiquement la température.',
 '80–260°C', 'Granulés de bois (pellets)', '400€ – 2 000€', 'debutant', 'Grande (4–6 pièces)',
 '{"Extrêmement simple — réglage au degré près","Régulation automatique de la température","Bonne capacité de cuisson","Polyvalent : fumer, griller, rôtir","Idéal pour les débutants et cuissons de nuit","Connecté WiFi/Bluetooth sur modèles récents"}',
 '{"Saveur de fumée moins prononcée","Dépendance à l''électricité","Pellets de mauvaise qualité = goût amer","Bark moins profonde qu''un offset","Vis sans fin peut tomber en panne","Consommation : ~1 kg/heure"}',
 '{"Pulled pork","Ribs","Poulet","Saumon fumé","Cuissons de nuit"}',
 '{"Saisie à très haute température","Puristes fumée de bois brut"}',
 '{"Traeger","Weber SmokeFire","Camp Chef","Pit Boss","RecTeq","Z Grills"}',
 'Pour débuter, un Pit Boss 850 (~500€) ou Z Grills 700E (~400€). Utilise des pellets 100% bois dur.',
 3, 'published'),

('kettle', 'Bouilloire (Kettle)', '{"Weber Kettle","BBQ charbon classique","Bouilloire Weber"}', '⚫',
 'Le classique indémodable. Simple, abordable, et étonnamment capable en fumage.',
 'Le kettle est le barbecue à charbon le plus iconique, popularisé par Weber depuis 1952. Sa forme ronde avec couvercle permet le grillage direct ET le fumage indirect en snake method.',
 '100–300°C', 'Charbon de bois + morceaux de bois', '80€ – 400€', 'debutant', 'Moyenne (2–3 pièces)',
 '{"Prix imbattable — Weber Master-Touch ~200€","Léger et portable","Excellent pour grillage ET fumage","Simple à comprendre","Communauté énorme, beaucoup de tutos","Pièces de rechange partout"}',
 '{"Capacité limitée pour le fumage","Snake method demande de la pratique","Température moins stable","Rechargement toutes les 4–5h","Thermomètre de couvercle basique"}',
 '{"Poulet entier","Baby back ribs","Steaks, burgers","Pulled pork (petites épaules)"}',
 '{"Brisket entier","Cuissons très longues (12h+)"}',
 '{"Weber Master-Touch","Weber Original Kettle","Napoleon Rodeo","Rösle"}',
 'La Weber Master-Touch GBS 57cm (~220€) est LA référence. Apprends la snake method. Investis dans un thermomètre à double sonde (~30€).',
 4, 'published'),

('wsm', 'Fumoir Vertical (WSM)', '{"Weber Smokey Mountain","Bullet smoker","Fumoir à eau"}', '🗼',
 'Le fumoir dédié le plus abordable. Stable, fiable, résultats pro.',
 'Le WSM et ses équivalents sont des fumoirs verticaux à charbon avec un réservoir d''eau entre le feu et la viande. L''eau stabilise la température et ajoute de l''humidité.',
 '100–135°C', 'Charbon de bois (briquettes) + morceaux de bois', '300€ – 600€', 'debutant', 'Moyenne à grande (2 niveaux)',
 '{"Température ultra-stable grâce au réservoir d''eau","Résultats quasi-professionnels pour le prix","Utilisé en compétition KCBS","Deux niveaux de grilles","Apprentissage rapide","Construction robuste"}',
 '{"Monofonction — uniquement fumage","Nettoyage du bac à eau contraignant","Rechargement de charbon difficile","Encombrement vertical (attention vent)","Pas de fenêtre de contrôle"}',
 '{"Brisket","Épaule de porc","Ribs","Poulet fumé","Saucisses fumées"}',
 '{"Grillades directes","Cuissons haute température","Pizza"}',
 '{"Weber Smokey Mountain 47cm/57cm","ProQ Frontier","Pit Barrel Cooker"}',
 'Le WSM 47cm (~350€) est parfait pour débuter. Utilise la Minion method : briquettes allumées sur briquettes froides. 10-14h de cuisson.',
 5, 'published'),

('electric', 'Fumoir Électrique', '{"Bradley","Masterbuilt","Fumoir digital"}', '🔌',
 'Le fumoir d''appartement. Branchez, fumez, sans charbon ni flamme.',
 'Le fumoir électrique utilise une résistance chauffante et des copeaux ou bisquettes de bois pour la fumée. Contrôle par thermostat. Parfait pour les environnements où le charbon est interdit.',
 '100–135°C', 'Électricité + copeaux/bisquettes de bois', '200€ – 800€', 'debutant', 'Moyenne (3–4 grilles)',
 '{"Aucune gestion de feu","Autorisé balcon/appartement","Résultats constants","Peu d''entretien","Pas de flamme ouverte","Silencieux"}',
 '{"Saveur de fumée la moins prononcée","Pas de bark digne de ce nom","Température max ~135°C","Pas de saisie possible","Résultat parfois trop propre","Dépendant de l''électricité"}',
 '{"Saumon fumé","Bacon maison","Saucisses fumées","Fromage fumé","Jerky"}',
 '{"Brisket","Saisie","Puristes du goût fumé"}',
 '{"Masterbuilt","Bradley","Char-Broil Digital","Smokin-It"}',
 'Le Masterbuilt 30" Digital (~250€) est le best-seller. Parfait pour le saumon fumé et le bacon maison.',
 6, 'published'),

('gas', 'BBQ Gaz', '{"Plancha gaz","BBQ propane","Gas grill"}', '🔥',
 'Rapide, pratique, et peut fumer avec un smoke box. Le BBQ du quotidien.',
 'Le BBQ gaz est le plus répandu en France. Allumage instantané, montée en température rapide. Pour le fumage, ajoutez une smoke box au-dessus d''un brûleur et cuisez en indirect.',
 '100–350°C', 'Propane / Butane', '150€ – 2 000€+', 'debutant', 'Variable',
 '{"Allumage instantané — prêt en 10 min","Contrôle précis au bouton","Nettoyage facile","Polyvalent : grillades, plancha, fumage indirect","Idéal au quotidien","Grande variété de tailles et prix"}',
 '{"Saveur moins riche qu''au charbon","Fumage demande un accessoire (smoke box)","Résultats fumage inférieurs à un vrai fumoir","Consommation de gaz","L''expérience feu et braise est absente"}',
 '{"Grillades quotidiennes","Plancha","Poulet en indirect","Légumes grillés"}',
 '{"Vrai fumage low & slow","Brisket","Compétition BBQ"}',
 '{"Weber Spirit/Genesis","Napoleon","Broil King","Campingaz","Char-Broil"}',
 'Teste le fumage avec une smoke box (~15€) : copeaux de hickory sur brûleur allumé, viande côté éteint.',
 7, 'published')
ON CONFLICT (id) DO NOTHING;
