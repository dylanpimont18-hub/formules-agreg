# Format des fichiers de formules (`data/src/*.json`)

Chaque fichier est un tableau JSON d'objets formule :

```json
[
  {
    "id": "oe3-loi-ohm",
    "bloc": "OE3",
    "notion": "OE3.2 Modélisations électriques et énergétiques",
    "nom": "Loi d'Ohm",
    "tex": "[[U]] = [[R|R^2|\\frac{1}{R}]] \\cdot [[I|I^2]]",
    "legende": "$U$ tension (V), $R$ résistance (Ω), $I$ courant (A)",
    "grandeurs": [
      { "s": "U", "nom": "tension", "u": "V" },
      { "s": "R", "nom": "résistance", "u": "\\Omega" },
      { "s": "I", "nom": "intensité du courant", "u": "A" }
    ],
    "source": "Fiche OE3.2 ; Sujet 2023 E2"
  }
]
```

## Champs

| Champ | Rôle |
|---|---|
| `id` | identifiant unique, kebab-case, préfixé par le bloc en minuscules |
| `bloc` | un de : `OE1`, `OE2`, `OE3`, `TC1`, `TC2`, `TC3`, `TC4`, `TC5` |
| `notion` | code + intitulé de la notion du programme |
| `nom` | nom court de la formule (affiché après la réponse) |
| `tex` | formule LaTeX (KaTeX) avec les **cases à deviner** entre `[[ ]]` |
| `legende` | signification + unités des grandeurs (courte). Les symboles mathématiques sont écrits entre `$...$` (LaTeX KaTeX inline), ex. `$N_s$ vitesse de synchronisme (tr/min)`, jamais `N_s` en texte brut |
| `grandeurs` | tableau des grandeurs physiques de la formule : `s` symbole LaTeX (tel qu'écrit dans `tex`), `nom` en clair (minuscule), `u` unité SI en LaTeX KaTeX (`"W\\cdot m^{-1}\\cdot K^{-1}"`, `"\\Omega"`, `"rad\\cdot s^{-1}"`, `"\\%"`), ou `""` si sans dimension. Omettre les constantes pures (2, π) ; inclure les constantes physiques ($\mu_0$, $g$...). Tableau vide `[]` si la formule n'a pas de grandeur physique (informatique, logique) |
| `source` | fiche et/ou sujet(s) où la formule apparaît |

## Les cases `[[ ... ]]`

- Chaque case est un **morceau de formule que l'élève doit retrouver**. Chaque case devient une question (`? = R·I`, `U = ?·I`, `U = R·?`).
- Syntaxe : `[[bonne|piège1|piège2|...]]`. Le premier élément est la bonne réponse (LaTeX). Les suivants, optionnels, sont des **pièges plausibles** (erreurs classiques : √2↔√3, carré oublié, inverse, facteur 2 ou 1/2, signe, 2π oublié, cos↔sin, etc.). Viser 1 à 3 pièges par case quand c'est pertinent.
- Au moins **2 cases** par formule, idéalement toutes les grandeurs significatives (y compris le membre de gauche).
- Une case peut contenir une sous-expression entière (`\sqrt{3}`, `\frac{1}{2}`, `2\pi f`, `\cos\varphi`), pas seulement une lettre. Les constantes numériques (√3, 1/2, 2π, 4, ...) sont d'excellentes cases.
- Ne jamais imbriquer de cases. Pas de `|` ni `[[`/`]]` dans le LaTeX hors syntaxe des cases (utiliser `\lvert x \rvert` ou `\left| x \right|` est interdit car contient `|` : utiliser `\lVert`, `\mathrm{abs}` ou `\lvert`/`\rvert`).
- Deux cases d'une même formule ne doivent pas avoir le même contenu (sinon ambiguïté).
- **Un piège ne doit jamais être lui aussi correct** : pas de forme équivalente (`\omega` vs `2\pi f`, `\frac{U^2}{R}` quand `RI^2` est attendu dans une formule où les deux marchent), pas de variante qui serait juste sous une autre convention courante (signe, base de log, notation).
- Le LaTeX doit être compatible KaTeX : `\frac`, `\sqrt`, `\cdot`, `\omega`, `\varphi`, `\mathrm{}`, `\text{}`, `\underline{}`, `\dfrac`, `\int`, `\sum`, `\partial`, `\Delta`, etc. Pas de macros personnalisées.
- Dans le JSON, échapper les antislashs : `\\frac`.

## Ce qu'on garde / ce qu'on écarte

- Garder : toute relation quantitative qu'un candidat doit connaître par cœur (lois physiques, définitions, fonctions de transfert types, critères, relations de dimensionnement).
- Écarter : énoncés purement qualitatifs sans grandeur, formules spécifiques à un sujet (données de l'énoncé, valeurs numériques propres au cas étudié).
- Un même résultat sous deux formes utiles (ex. `P = UI\cos\varphi` et `P = RI^2`) = deux formules distinctes.
