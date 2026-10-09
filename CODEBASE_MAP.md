# CODEBASE_MAP.md

Appli statique (GitHub Pages) de QCM « formule à trous » pour l'agrégation SII.

## index.html
Page unique : onglets Entraînement / Formulaire / Progrès, charge KaTeX (CDN) et js/app.js.

## css/style.css
Styles (clair/sombre, mobile) : réglages, cartes de question, options, barres de progrès.

## js/quiz.js
Moteur pur (sans DOM) : découpe des formules et génération des QCM.
- parseTex(tex) — découpe texte et cases [[bonne|pièges]]
- isConstant(s) — case sans lettre (√3, 2π…)
- prepare(formules) — parse + index notion/bloc
- allQuestions(db, blocs) — une question par case
- buildQuestion(db, q, rand) — énoncé, 4 options, bonne réponse
- pickWeighted(questions, stats, avoidKey) — tirage pondéré par erreurs
- consigne(q) — phrase selon la case masquée
- shuffle(arr, rand) — mélange Fisher-Yates

## js/app.js
Interface : sélection des notions, déroulé du quiz, bilan, formulaire, progrès (localStorage).
- renderBlocs() — cases à cocher blocs/notions
- start() / next() / answer(i) / finish() — cycle d'une série
- startGeneral() — 20 questions, bloc tiré à chaque question
- renderListe(filtre) — formulaire filtrable
- renderProgres() — maîtrise par bloc

## scripts/build.mjs
Fusionne data/src/*.json → data/formules.json après validation (champs, cases, KaTeX, doublons, 4 options).

## data/FORMAT.md
Spécification du format des formules et de la syntaxe des cases.

## data/src/*.json
Sources des formules : fiches-*.json (extraites des fiches) et sujets-*.json (ajouts depuis les sujets 2021-2025).

## data/formules.json
Base générée, chargée par l'appli (ne pas éditer à la main).

## test/quiz.test.mjs
Tests du moteur (parse, constantes, 4 options distinctes).

## scripts/dedoublonner.mjs
Applique data/doublons.json (paires retirer/garder) aux sources et fusionne les champs source.
