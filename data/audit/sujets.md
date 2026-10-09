# Audit sujets-2021 à sujets-2025 : corrections de fond

Aucune formule fausse au sens strict ni supprimée. Les corrections portent sur des pièges qui étaient justes (forme équivalente ou autre convention courante) et sur une formule à généraliser.

- oe3-s25-courant-admissible-corrige : $I'_z = I_B/K$ → $I'_z = I_z/K$ (selon NF C 15-100, le courant fictif se calcule à partir de $I_z \ge I_n$ ; le piège $I_n$ était donc correct, et $I_B$ est une simplification propre au sujet)
- oe3-s25-lc-reponse-libre : piège $I_0 L\omega_0$ → $I_0\sqrt{LC}$ ($L\omega_0 = \sqrt{L/C}$ : forme équivalente de la bonne réponse)
- oe3-s22-mcc-caracteristique-couple : pièges $K_e$ (numérateur) et $K_c\Omega$ retirés, remplacés par $K_c^2$ et $K_e I$ ($K_e = K_c$ en unités SI)
- oe1-s22-critere-nyquist : pièges $-N$ et $2N$ → $N/2$ ($-N$ est juste si les tours sont comptés en sens horaire, $2N$ si on compte sur le demi-lieu $\omega > 0$)
- oe3-s22-inductance-cyclique : piège $L_s + M_s$ → $L_s + 2M_s$ ($L_s + M_s$ est juste si $M_s$ désigne la valeur absolue de la mutuelle)
- oe3-s22-mas-couple-flux-oriente : piège $\frac{3}{2}p$ → $p^2$, et « (Concordia) » ajouté dans le tex ($\frac{3}{2}p$ est juste avec Park à amplitudes conservées)
- oe3-s22-concordia : « Concordia : » ajouté dans le tex (sinon le piège $\frac{2}{3}$ est juste en Clarke)
- oe3-s25-clarke : « Clarke : » ajouté dans le tex (sinon le piège $\sqrt{2/3}$ est juste en Concordia)
- oe2-s21-modulateur-iq : case de signe $[-|+]$ supprimée, signe − figé ($s = i\cos + q\sin$ est une convention courante)
- oe2-s24-fsk-indice : piège $\Delta f$ → $\Delta f/2$ ($h = \Delta f/D_b$ est juste quand $\Delta f$ désigne l'écart entre les deux fréquences)
- oe2-s24-vco-phase : piège $K_V$ → $\pi K_V$ ($K_V/p$ est juste avec $K_V$ en rad·s⁻¹·V⁻¹)
- tc3-s24-puissance-combustion : piège PCS → $1/\mathrm{PCI}$ (PCS est juste si la vapeur d'eau est condensée)
- oe1-s24-modbus-codes : piège 04 → 02 pour « lecture de mots » (04 lit les registres d'entrée, qui sont aussi des mots)
- oe2-s25-mode-commun-differentiel : piège $V_{e2} - V_{e1}$ → $(V_{e1} - V_{e2})/2$ (l'ordre des indices est une convention arbitraire)
- tc3-s22-poussee-hydrostatique-paroi : piège $F$ en membre de gauche → $p_{moy}$ ($F$ n'est qu'un autre nom de la résultante)
- tc3-s22-centre-poussee : piège $2h$ → $h^2$, piège $h_Q$ retiré ($2h/3$ est juste si la cote est mesurée depuis la surface libre)
- oe1-s22-codeur-absolu-resolution : piège $q$ en membre de gauche retiré ($q$, le quantum, désigne la même grandeur)
- oe1-s21-profibus-limites : piège 127 → 64 (127 adresses, de 0 à 126, est un chiffre souvent cité)
