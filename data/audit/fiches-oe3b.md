# Audit fiches-oe3b.json — corrections de fond

- oe3-pertes-conduction-interrupteur : piège r_d retiré (résistance dynamique de diode : P = V0·Imoy + r_d·Ieff² est correct) → remplacé par 1/R_on
- oe3-pertes-commutation-lineaire : P_comm devient une case ; hypothèse « charge inductive, commutation dure » précisée (le facteur 1/2 ne vaut pas pour une charge résistive, où l'on trouve 1/6)
- oe3-onduleur-triphase-rangs-harmoniques : pièges « 6k » et « 2k » retirés pour les rangs absents (les rangs multiples de 6 et les rangs pairs sont bien absents, donc ces pièges étaient corrects) → pièges 2k+1 et 6k±1
- oe3-redresseur-pd2-diodes : piège U retiré (en monophasé, U peut désigner la même tension efficace) → V/√2
- oe3-hacheur-serie-courants : piège I_L retiré (en hacheur série, I_L moyen = I_s, donc I_e = α·I_L est correct)
- oe3-hacheur-buck-boost : case de signe « − | + » supprimée (le signe dépend de l'orientation choisie) → la formule porte sur |U_s|
- oe3-hacheur-boost-ondulation-courant : piège α(1−α) retiré (α(1−α)·U_s/(L·f) = α·U_e/(L·f), forme équivalente)
- oe3-harmoniques-thd : piège X_eff retiré (le THD rapporté à la valeur efficace totale, THD_R, est une convention reconnue) → X_1²
- oe3-chaine-resistance-pente : piège tan α retiré (F = M·g·p avec p = tan α, usuel pour les faibles pentes)
- oe3-chaine-loi-u-sur-f : piège ω retiré (U/ω = cte est la même loi) → f², √f
- oe3-chauffage-resistance-thermique-paroi : piège P retiré pour Φ (même grandeur, en W) → case ΔT/R_th avec des pièges sur sa forme
- oe3-stockage-batterie-energie : piège C retiré (la capacité d'une batterie est souvent notée C, en Ah) → Q²
- oe3-pv-modele-diode : piège I_cc retiré (I_cc ≈ I_ph) → I_mpp ; piège e^{V/V_T} retiré (correct pour n = 1) → e^{−V/(nV_T)}
- oe3-pv-productible : piège P_mpp retiré (identique à P_c aux conditions STC) → S
- oe3-alternateur-frequence : piège N retiré (N désigne aussi couramment la vitesse en tr/min)
- oe3-groupe-electrogene-rendement : piège PCS retiré (un rendement sur PCS est une convention qui existe) ; le nom précise « sur PCI »
