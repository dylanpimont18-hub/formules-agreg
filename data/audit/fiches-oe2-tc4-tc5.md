# Audit fiches-oe2-tc4-tc5.json — corrections de fond

- tc4-euler-p-z : « Euler arrière » p ≈ (z−1)/T_e, piège (z−1)/(zT_e) → p ≈ (z−1)/(zT_e), pièges 2T_e et (z+1)T_e (la réponse donnée était Euler AVANT et le piège était la vraie formule d'Euler arrière)
- oe2-quantum : piège V_PE/(2^n − 1) retiré (convention constructeur courante, donc correcte)
- oe2-fourier-reelle : piège a_0/2 retiré (correct dans la convention x = a_0/2 + Σ…)
- oe2-fourier-a0 : piège 2/T retiré (correct dans la convention a_0/2), remplacé par 1/(2T)
- oe2-barkhausen : piège arg = π retiré (correct avec la convention 1 + Aβ = 0, boucle à soustracteur) ; piège module −1 retiré (pas un module) ; légende précisée (réaction positive)
- oe2-bruit-puissance-disponible : piège T_0 retiré (kT_0B est la même formule à T = T_0)
- oe2-temperature-bruit : piège T_0 = 300 K retiré (approximation usuelle, ambiguë)
- oe2-nyquist-rapidite : piège D_s = 1·B retiré (correct pour un canal passe-bande) ; validité précisée : canal en bande de base
- oe2-puissance-reflechie : piège RL = +20 log|Γ| retiré (usage courant « S11 en dB »), remplacé par +10
- tc4-derivee-avant : piège (y_n − y_(n−1))/Δt retiré (différence arrière, aussi une approximation valable de y'(t_n)), remplacé par (y_(n+1) − y_(n−1))/Δt
- tc5-arbre-hauteur : piège 2^h − 1 retiré (correct si la racine est au niveau 1), remplacé par 2^(h+1)
- tc5-ip-sous-reseaux : piège 2^s − 2 retiré (règle RFC 950 encore enseignée)
- tc5-rs232-limites : piège 115 200 bit/s retiré (débit courant en pratique), remplacé par 10 Mbit/s (RS485)
- oe2-bande-passante-boucle-fermee : validité précisée (gain du non-inverseur ; pour l'inverseur, utiliser 1 + R_2/R_1)
- oe2-frequence-coupure-rc : la case « 1 » sans piège est remplacée par les cases 2π et RC avec pièges
- oe2-impedance-caracteristique : v devient une case
- tc4-rk4-maj : pièges ajoutés au coefficient 2 de k_2
- tc5-temps-propagation : pièges ajoutés (2d, v²)
