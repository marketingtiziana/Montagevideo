# MARGINS.md — contrôle mécanique des marges (bloquant)

Méthode : la couche texte seule (titres, mot accent + soulignement, sous-titres 28 px, numéros de solution, handle) est rendue par Higgsedit (`edit_text.jsx`, fond gris neutre, sans B-roll, sans cartes ni icônes) en PNG 1080×1920 à mi-écran ; la boîte englobante réelle des pixels non-fond (ombre portée 0/6/24 px comprise) est mesurée avec NumPy/PIL (`tools/margins_qa.py`, mesure exécutée dans le sandbox Higgsfield le 12/10/2026).

Règle : gauche ≥ 120 px · droite ≥ 120 px · haut ≥ 520 px · bas ≥ 520 px · centre horizontal = 540 ± 8 px. Boîte de sécurité x 120→960, y 520→1400. Largeur utile de composition : 792 px (840 − 2 × 24 px de flou d'ombre).

| Écran | Taille | Gauche | Droite | Haut | Bas | Centre X | Boîte réelle (x0,y0,x1,y1) | Verdict |
|---|---|---|---|---|---|---|---|---|
| s01 | 64 px | 132 | 135 | 858 | 838 | 538.0 | 132,858,944,1081 | OK |
| s02 | 96 px | 194 | 193 | 774 | 769 | 540.0 | 194,774,886,1150 | OK |
| s03 | 72 px | 139 | 140 | 813 | 810 | 539.0 | 139,813,939,1109 | OK |
| s04 | 96 px | 134 | 134 | 778 | 769 | 539.5 | 134,778,945,1150 | OK |
| s05 | 96 px | 144 | 145 | 797 | 785 | 539.0 | 144,797,934,1134 | OK |
| s06 | 96 px | 209 | 212 | 856 | 852 | 538.0 | 209,856,867,1067 | OK |
| s07 | 80 px | 143 | 143 | 802 | 796 | 539.5 | 143,802,936,1123 | OK |
| s08 | 80 px | 138 | 138 | 803 | 796 | 539.5 | 138,803,941,1123 | OK |
| s09 | 84 px | 141 | 148 | 792 | 788 | 536.0 | 141,792,931,1131 | OK |
| s10 | 72 px | 133 | 133 | 811 | 810 | 539.5 | 133,811,946,1109 | OK |
| s11 | 88 px | 132 | 131 | 784 | 784 | 540.0 | 132,784,948,1135 | OK |
| s12 | 92 px | 140 | 141 | 795 | 628 | 539.0 | 140,795,938,1291 | OK |
| s13 | 84 px | 133 | 133 | 780 | 628 | 539.5 | 133,780,946,1291 | OK |
| s14 | 96 px | 195 | 193 | 786 | 622 | 540.5 | 195,786,886,1297 | OK |
| s15 | 84 px | 132 | 135 | 808 | 644 | 538.0 | 132,808,944,1275 | OK |
| s16 | 68 px | 131 | 133 | 832 | 671 | 538.5 | 131,832,946,1248 | OK |
| s17 | 88 px | 134 | 134 | 810 | 796 | 539.5 | 134,810,945,1123 | OK |
| s18 | 96 px | 189 | 189 | 861 | 834 | 539.5 | 189,861,890,1085 | OK |
| s19 | 96 px | 194 | 197 | 903 | 891 | 538.0 | 194,903,882,1028 | OK |
| s20 | 96 px | 161 | 164 | 797 | 800 | 538.0 | 161,797,915,1119 | OK |
| s21 | 140 px | 251 | 248 | 731 | 766 | 541.0 | 251,731,831,1153 | OK |

**Résultat : 21/21 écrans conformes — aucun auto-fit supplémentaire ni raccourcissement nécessaire** (auto-fit préalable : taille de départ 96 px, pas de 4 px, max 3 lignes, interligne 1,1 ; tailles retenues ci-dessus).

Notes :
- Écrans 12–16 (solutions) : la boîte inclut le numéro 160 px au-dessus du titre ; les cartes « verre » (x 120→960) et les icônes Lucide sont des graphismes, exclus de la mesure texte.
- Écran 21 (CTA) : la carte accent pleine largeur est un graphisme voulu par le brief ; le texte (PLAN B DUBAÏ, CTA, handle) reste dans la boîte (251 px de marge latérale).
- Écran 2/7/10 : mesure faite après le compteur (0,6 s), état final du texte.
