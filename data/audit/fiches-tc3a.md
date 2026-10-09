# Audit fiches-tc3a.json — corrections de fond

- tc3-meca-hyperstatisme : m − h = 6γ − ΣN_c → m − h = 6(n − 1) − ΣN_c (relation fausse : mélange des approches statique et cinématique ; le piège 6(n−1) était la bonne réponse ; approche cinématique m − h = Σm_c − 6γ ajoutée en légende ; pièges m/h croisés ajoutés)
- tc3-mat-coef-securite : pièges R_m (numérateur, juste pour un coefficient à la rupture) et σ_adm (dénominateur, R_e/σ_adm = s exactement) retirés → E et s·σ_max
- tc3-rdm-contrainte-admissible : piège R_m retiré (σ_adm = R_m/s est une convention courante pour les matériaux fragiles) → σ_max
- tc3-mat-viscosite-cinematique : piège η retiré (η est le symbole usuel de la viscosité dynamique : η/ρ = ν est correct) → μ²
- tc3-rdm-tranchant-moment : case de signe [[-|+]] supprimée (le signe + est juste avec la convention « gauche sur droite », tout aussi courante) ; signe − figé, convention précisée en légende
- tc3-meca-dualite-liaison : piège 3 retiré (m_c + N_c = 3 est juste en modèle plan) → 12, 5 ; modèle 3D précisé
- tc3-meca-omega-n : piège n retiré (n est un symbole courant de la fréquence de rotation en tr/min) → N²
- tc3-meca-couple-frein : piège μ retiré (symbole courant du coefficient de frottement) → f²
- tc3-meca-coulomb-glissement : piège tan φ² retiré (confusion avec f = tan φ, juste) → f/2 ; piège T_0 → T
- tc3-trans-roue-vis : piège 1 au numérateur retiré (Z_vis = 1 pour une vis à un filet : 1/Z_roue est correct) → p
- tc3-trans-cardan : piège 1/cos δ retiré (tan θ_s = tan θ_e / cos δ est juste avec une autre origine des angles) → cos²δ ; dépendance à l'origine signalée en légende
- tc3-mat-kelvin-voigt : piège σ/E (contenait l'inconnue σ) → Eε²
- tc3-trans-conservation-puissance : pièges ajoutés sur C_e et C_s (cases sans piège)
- tc3-rdm-i0-tube : piège π² ajouté
- tc3-rdm-torsion : validité limitée aux sections circulaires ajoutée (nom + légende)
- tc3-meca-tmd : légende « A fixe ou A = G » erronée (le TMD vaut en tout point) → « en tout point A »
- tc3-mat-spires-transfo : renommée « Nombre minimal de spires » (condition de non-saturation)
