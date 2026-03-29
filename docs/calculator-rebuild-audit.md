# Rebuild calculateur BBQ

## Ce qu'on garde

- Les slugs metier deja utilises dans l'app et dans Supabase.
- Les grands usages produit: heure de demarrage, repères de cuisson, recalage, sauvegarde de plan, journal.
- Les points d'entree publics: `calculateLowSlow`, `buildTimeline`, `recalibrate`, `buildCookResult`, `buildCookRoadmap`.
- Les scenarios de reference deja utilises pour verrouiller la non-regression sur les pieces longues.

## Ce qu'on jette

- Le melange entre moteur, timeline, labels UI et pont CMS dans un seul fichier legacy.
- Les calculs trop fins ou pseudo-exacts sur des etapes qui sont en realite visuelles.
- Le pilotage implicite par des overrides runtime du moteur.
- L'ancien contrat mental "une minute precise pour chaque etape".

## Base empirique retenue

Les fourchettes ont ete recroisees a partir de sources terrain et pedagogiques:

- Meat Church, brisket Texas style: wrap vers 165F, probe tender vers 203F, repos d'au moins 1h.
- BBQ Quebec, emballage brisket: 225-250F, wrap vers 160-170F quand la bark est prise.
- Traeger, pulled pork: 225F, stall vers 150-160F, pret vers 195-204F, repos mini 45 min.
- AmazingRibs, reverse sear: la logique depend surtout de l'epaisseur, pas du poids.
- AmazingRibs, beef ribs: 225F, jusqu'a environ 203F, jusqu'a 8h selon l'epaisseur.
- Smoked BBQ Source, ribs wrap: le wrap se decide souvent vers la moitie de cuisson et au toucher.
- Community sanity check: Reddit r/smoking confirme l'usage systematique d'une marge large et d'un repos/hold long pour ne pas servir en retard.

## Principes du nouveau moteur

- Heures affichees arrondies, pas de faux precisionnisme.
- Fenetre de cuisson basee sur un min, un probable et un prudent.
- Heure de depart recommandee basee sur le prudent, pas sur la mediane.
- Repères wrap, stall et tests exprimes surtout comme zones thermiques et visuelles.
- Reverse sear pilote d'abord a l'epaisseur et a la temperature interne.

## Migration prevue

Phase 1:

- Moteur canonique reconstruit dans `src/domain/calculator/core.js`.
- UI existante recablee sur ce nouveau moteur sans reintroduire le legacy.

Phase 2:

- Donnees empiriques migrables vers Supabase apres validation metier.
- Nouveaux champs CMS pour `cook_type`, repères, cues, blocs SEO et produits associes.

## Point important

Pour ne pas rechanger l'algo a chaque edition CMS, le moteur empirique reste canonique dans le code pendant cette phase.
La migration Supabase des coefficients et profils ne doit venir qu'apres validation produit du nouveau comportement.
