# Audit fiches-oe3a.json (OE3.1 / OE3.2 / OE3.3)

- oe3-courant-neutre : I_N = [[-|+|1/3]](I1+I2+I3) avec légende de convention confuse → I_N = I1+I2+I3 (orienté charges → source), case de signe supprimée (le piège « + » était correct sous la convention la plus courante)
- oe3-facteur-puissance : piège λ = cos φ retiré (correct en régime sinusoïdal) → pièges tan φ, sin φ
- oe3-puissance-apparente-mono : piège UI/2 retiré (correct avec les amplitudes) → √2·UI
- oe3-puissance-complexe : piège P − jQ retiré (correct sous la convention S = V*·I) → Q + jP, P + Q
- oe3-flux-induction : piège μ0·H retiré (Φ = μ0 H A est correct dans l'air) → B²
- oe3-compensation-reactif : piège tan φ' − tan φ retiré (correct en convention récepteur, Q_C < 0) → sin φ − sin φ'
- oe3-essai-vide : piège V_2 pour V_20 retiré (à vide V_2 = V_20) → V_1
- oe3-vitesse-synchronisme-trmin : piège 120 retiré (120 f/P correct avec P = nombre de pôles) → 30
- oe3-mas-glissement : piège « s » retiré (notation anglo-saxonne du glissement, correcte)
- oe3-facteur-distribution : piège qα/(2q) retiré (identique à α/2) → α/(2q)
- oe3-facteur-puissance-harmonique : « ≈ » → « = » (relation exacte si tension sinusoïdale)
- oe3-ms-puissance-reactive, oe3-behn-eschenburg-generateur, oe3-puissance-*-tri, oe3-chute-tension-relative, oe3-kapp-tension-secondaire, oe3-puissance-deformante : grandeurs passées en cases (3, U, I, R, X, ΔU/U…)
- oe3-seuils-securite : piège 10 mA retiré (DDR 10 mA existe et satisfait I_Δn ≤ 30 mA)
