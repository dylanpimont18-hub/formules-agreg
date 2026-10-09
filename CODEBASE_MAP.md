# CODEBASE_MAP.md

Appli statique (GitHub Pages, installable hors ligne sur iPhone) de QCM sur les formules de l'agrégation SII.

## index.html
Page unique : accueil (révision du jour, série générale, série à la carte), quiz, bilan, formulaire, progrès ; barre d'onglets en bas.

## manifest.webmanifest
Manifeste PWA (nom, icônes, affichage standalone).

## sw.js
Service worker généré par scripts/build.mjs (précache complet, version = empreinte). Ne pas éditer.

## css/style.css
Styles mobile d'abord (zones sûres iPhone, barre d'onglets, barre d'action fixe), clair/sombre.

## js/quiz.js
Moteur pur (sans DOM) : découpe des formules et génération des QCM de 4 types.
- TYPES — trou / forme / nom / unite + poids
- parseTex(tex) — découpe texte et cases [[bonne|pièges]]
- isConstant(s) — case sans lettre (√3, 2π…)
- completeTex(f, idx, rempl) — formule complète, case remplaçable
- prepare(formules) — parse + index notion/bloc
- allQuestions(db) — toutes les questions, tous types
- buildQuestion(db, q, rand) — énoncé, 4 options, bonne réponse
- consigne(q) — phrase selon type et case
- pickType(questions) — tirage du type pondéré
- pickWeighted(questions, stats, avoidKey) — tirage pondéré par erreurs
- shuffle(arr, rand) — mélange Fisher-Yates

## js/unites.js
Analyse dimensionnelle des unités LaTeX (évite un distracteur équivalent).
- dimension(tex) — vecteur d'exposants SI ou null
- memeDimension(a, b) — égalité de dimensions

## js/srs.js
Répétition espacée (Leitner) et suivi des jours.
- enregistrer(stat, ok, now) — met à jour boîte et échéance
- estAcquise(stat) / estDue(stat, now) — état d'une question
- fileDuJour(questions, stats, now, quota) — échues puis nouvelles
- majJour(jour, now, nouvelle) — série de jours, quota
- serieActuelle(jour, now) — jours consécutifs affichés

## js/app.js
Interface : accueil, séries, quiz, bilan, formulaire, progrès (localStorage), enregistrement du service worker.
- renderAccueil() — compteurs du jour, erreurs, flamme
- lancer(mode) — jour / erreurs / general / carte
- choisir() / next() / answer(i) / finish() — cycle d'une série
- ajuster(el) — réduit une formule à la largeur
- texteRiche(el, s) — texte avec $…$ en KaTeX
- renderLegende(el, f) — grandeurs et unités
- lienSignalement(q) — issue GitHub pré-remplie
- renderListe(filtre) / renderProgres() — formulaire, progrès

## scripts/build.mjs
Valide data/src/*.json (champs, cases, KaTeX, légendes, grandeurs, doublons, 4 options par question) → data/formules.json, puis génère sw.js.

## scripts/dedoublonner.mjs
Applique data/doublons.json (paires retirer/garder) aux sources et fusionne les champs source.

## data/FORMAT.md
Spécification du format des formules (cases, pièges, légende $…$, grandeurs).

## data/src/*.json
Sources des formules : fiches-*.json (extraites des fiches) et sujets-*.json (ajouts depuis les sujets 2021-2025).

## data/audit/*.md
Journaux de l'audit de contenu (corrections de fond par fichier).

## data/formules.json
Base générée, chargée par l'appli (ne pas éditer à la main).

## vendor/katex/
KaTeX 0.16.11 embarqué (JS, CSS, polices woff2) pour le hors ligne.

## icons/
Icônes PWA (apple-touch-icon 180, 192, 512, maskable).

## test/quiz.test.mjs
Tests du moteur, des unités et de la répétition espacée.
