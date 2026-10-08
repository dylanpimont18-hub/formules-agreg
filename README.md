# Formules Agrég SII

Entraînement par QCM aux formules à connaître par cœur pour l'agrégation SII (ingénierie électrique).

Chaque formule est découpée en cases : chaque case devient une question à 4 propositions
(`? = R·I`, `U = ?·I`, `U = R·?`). Les mauvaises réponses viennent des erreurs classiques
(√2/√3, carré oublié, inverse…) et des autres grandeurs du même thème. Les questions ratées reviennent
plus souvent (progression gardée dans le navigateur).

## Ajouter ou corriger une formule

1. Modifier un fichier de `data/src/` (format décrit dans [data/FORMAT.md](data/FORMAT.md)).
2. `npm install` (une fois), puis `npm run build` : valide tout (LaTeX KaTeX, cases, doublons) et régénère `data/formules.json`.
3. `npm run serve` puis ouvrir http://localhost:8080 pour tester.
4. Commit + push : GitHub Pages republie automatiquement.

Tests du moteur : `node test/quiz.test.mjs`.
