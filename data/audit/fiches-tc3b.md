# Audit fiches-tc3b.json — corrections de fond

- tc3-thermique-renouvellement-air : piège « 1,2 » retiré (ρc ≈ 1,2 kJ·m⁻³·K⁻¹ est juste avec $q_v$ en m³·s⁻¹ et Φ en kW)
- tc3-thermique-bilan-chauffage : piège « 1,2 $q_v$ » → « 0,034 $q_v$ » (même raison) ; ajout de la case $T_{int} - T_{ext}$ (piège $T_{ext} - T_{int}$)
- tc3-energie-pertes-joule-tri : piège 3/2 → 2 (3/2 est juste avec $R$ mesurée entre bornes en étoile) ; ajout de la case $R$
- tc3-thermo-premier-principe : cases $[[W|-W]] + [[Q|-Q]]$ → $[[W + Q|W - Q|W\,Q]]$ (le piège $-W$ est juste en convention « travail fourni », ΔU = Q − W)
- tc3-thermo-travail-pression : piège $+p_{ext}\,\mathrm{d}V$ → $-p_{ext}\,V$ (juste en convention travail fourni)
- tc3-thermo-rendement-moteur : pièges $W$ et $1 - Q_f/Q_c$ retirés (justes en convention valeurs absolues) → $-Q_f$, $Q_c + Q_f$, $1 + Q_c/Q_f$
- tc3-thermo-cop-pac : piège $Q_c - Q_f$ au dénominateur retiré (égal à $W$ en valeurs absolues, donc correct) → $Q_c + Q_f$
- tc3-commande-mli-4q : piège $1 - 2\alpha$ → $2\alpha$ (juste si α est le rapport cyclique de l'autre diagonale)
- tc3-asservi-ziegler-nichols-bo : $K_p = 1{,}2\,T/L$ → $K_p = 1{,}2\,T/(K L)$ (gain statique $K$ du procédé oublié) ; nom précisé « réglage PID » (les pièges 0,9 et 3,3L sont les valeurs PI, justes sinon)
- tc3-asservi-bf-correcteur : ajout piège numérateur $C G H_r$
- tc3-asservi-avance-phase-max : ajout pièges $1 - a$, $a$ sur la case $a - 1$
- tc3-mcc-puissance-absorbee : ajout pièges $EI$ (pour $UI$) et $RI$ (pour $RI^2$)
- tc3-meca-pfd-rotation : $C_{em}$ devient une case
- tc3-thermique-fourier-1d : ajout piège $e$ sur $S$
- tc3-discret-pi-recurrence : ajout pièges $T_e^2$, $T_i^2$
- tc3-energie-rendement-etages : symbole du rendement d'étage ρ → $\eta_1$ (ρ ambigu avec la masse volumique)
- tc3-fluide-pertes-quadratiques : $\Delta H_{reseau}$ → $H_{reseau}$ (hauteur requise, pas une perte)
- tc3-discret-choix-te : supprimée (règle empirique invérifiable : $t_r/(10$ à $20)$, $\tau/10$, $t_{5\%}/10$… coexistent, pièges potentiellement justes)
