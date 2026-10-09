# Formules Agrég SII

QCM pour apprendre par cœur les formules de l'agrégation SII (ingénierie électrique), pensé pour iPhone.

**https://dylanpimont18-hub.github.io/formules-agreg/**

## Installer sur iPhone
Dans Safari : bouton Partager → « Sur l'écran d'accueil ». L'appli s'ouvre alors en plein écran, fonctionne
hors ligne et la progression est conservée durablement (sinon Safari peut l'effacer après 7 jours sans visite).

## Fonctionnement
- **Révision du jour** : répétition espacée (boîtes de Leitner) — chaque question revient après 1, 3, 7, 15, 30, 60 jours
  selon tes réussites ; une erreur la fait revenir le jour même. 15 nouvelles questions par jour.
- **Mes erreurs**, **Série générale** (20 questions, thèmes mélangés), **Série à la carte** (thèmes, types, longueur).
- 4 types de questions : terme manquant (`U = ?·I`), bonne écriture parmi 4, nom de la formule, unité d'une grandeur.
- Les mauvaises réponses sont des erreurs classiques (√2/√3, carré oublié, inverse…) ; une unité équivalente
  à la bonne (J et N·m) n'est jamais proposée comme fausse.
- « Signaler une erreur » ouvre une issue GitHub pré-remplie.

## Ajouter ou corriger une formule
1. Modifier un fichier de `data/src/` (format : [data/FORMAT.md](data/FORMAT.md)).
2. `npm install` (une fois), puis `npm run build` : valide tout et régénère `data/formules.json` et `sw.js`.
3. `npm run serve` puis http://localhost:8080 pour tester ; `node test/quiz.test.mjs` pour les tests.
4. Commit + push : GitHub Pages republie ; l'appli installée se met à jour au lancement suivant.
