# Edit report — Short « Poker Pro & Fiscalité : où poser tes valises »

**Format :** 1080×1920 (9:16), 30 fps, H.264 CRF 18, AAC 320k, master **−14 LUFS / −1 dBTP**.
**Durée finale :** ~1 min 43 (103,5 s).
**Source :** `source/reel5.mp4` — talking-head 9:16 (205,97 s, déjà vertical → aucun reframe).
**Principe :** le sens commande, le rythme suit. Pilotage intégral par `data/edit.json` → `data/timeline.json` (aucun timecode en dur dans le TSX).

---

## 1. Structure narrative retenue

**Thèse :** pour un joueur de poker pro, le pays où il vit n'est pas un détail fiscal mais LA décision : à gains égaux, elle sépare celui qui garde tout de celui qui en laisse la moitié — à condition d'y résider vraiment.

| Acte | Segments | Fonction |
|---|---|---|
| **Accroche** | s01–s03 | Question + promesse chiffrée (ouverture réelle de la source) → détruit la croyance « gains de jeu = non imposables » → « c'est faux, première erreur ». |
| **Contexte** | s04–s05 | Amateur vs pro : si tu en vis, activité professionnelle → imposable. Pose le socle sans lequel la suite ne se comprend pas. |
| **Démonstration** | s06–s12 | Pivot « ce qui rend le poker unique » → la taxe varie par pays → « tu gardes tout ou la moitié » → c'est LA décision → l'enjeu chiffré (moitié) → **le piège** (fausse expatriation, requalification, tout retombe). |
| **Résolution** | s13–s15 | Punchline « mêmes gains, fortunes différentes… à cause de l'endroit où ils dorment » → profil parfait → CTA « commente poker ». |

Ordre source **strictement préservé** — aucune phrase remontée en tête (correction directe de la V1, où la punchline avait été déplacée à l'ouverture alors qu'elle référence tout l'argument non encore posé).

## 2. Coupes et justifications (motif narratif, jamais technique)

| Retrait | Source | Motif |
|---|---|---|
| Claquette « Reel 3 » | 0,0→6,3 s | Élément de production, hors récit. |
| Redite « donc pas imposable, mais pas du tout » | 21,3→26,1 s | Répétition sans valeur ajoutée. |
| Faux départ « amateur qui gagne de l'argent » + reprise traînante | 34,7→45,1 s | Amorce avortée (8 s d'hésitation). |
| Recap « je touche tout pour un pro, c'est faux » | 55,6→62,1 s | Redondant avec le point déjà établi. |
| Bloc traîné « d'autres te taxent comme un revenu… » ×2 | 72,9→93,0 s (20 s) | Bégaiement/redite, idée conservée une fois. |
| **Bloc mort garbled** « les 4 entreprises… » ×2 | 102,2→135,6 s (33 s) | Formulation ratée + redite, aucune idée claire. |
| Reprises hésitantes « ce qui se réfléchit en amont » ×2 | 168,0→185,4 s | Amorces coupées, on garde la version aboutie. |
| Doublon CTA « commente poker ? » | 202,6→205,6 s | Deuxième énonciation redondante. |

**Respirations conservées** (correction directe de la V1 — on coupe des idées, pas des décibels) : temps après « première erreur », battue avant « la décision », silence de réaction avant « à cause de l'endroit où ils dorment », temps après « et tout retombe ».

## 3. Grammaire du montage

- **Coupe franche : ~90 %** du montage (le choix noble).
- **J-cut** léger (audio en amont) sur les enchaînements d'idées (s05, s14).
- Jump cuts du talking-head masqués par **changement de cadrage** (échelle/plan plus serré) ou **carte plein cadre**.
- Rythme **variable assumé** : accroche serrée, démonstration qui respire, résolution resserrée sur le CTA.

## 4. Inventaire des effets et leur motivation

| Effet | Emplacement | Motivation |
|---|---|---|
| **Transition signature** (balayage accent) | s06 « ce qui rend le poker unique » (~1:02) | **Unique** effet marquant du short, sur le point de bascule principal (le récit pivote vers le vrai sujet). |
| **Cross-dissolve 8 f** | s10 (saut du bloc mort de 33 s) | **Une seule fois**, marque le saut temporel. |
| **Carte plein cadre « LE PIÈGE »** | s11 « c'est là que les gens se font avoir » | Point de bascule secondaire (le contre-pied dans le contre-pied). |
| Tampon **FAUX** / **ComparisonBar** plein cadre | s03 / s08 | Masquent des coupes, portent l'idée. |
| Coupe franche (aucun effet) | s13 punchline | La phrase-sommet se passe d'artifice, le silence travaille. |

## 5. Système graphique

- **Palette froide** : fond cartes `#0F1535`, accent `#4F6BFF`, texte `#FFFFFF`/`#A8B0C8`. Interdits respectés (pas d'or, chaud, serif, dégradé multicolore, emoji, tiret cadratin).
- **Typo unique Inter** : titres Black 900 (−0.02em), labels Medium 500 (+0.04em, majuscules).
- **Grammaire d'animation** : chaque élément a ENTRÉE (overshoot 1.03) · TENUE (dérive/respiration, jamais figé) · SORTIE (60 % de l'entrée, ne rembobine pas). **Jamais moins de 1,4 s** à l'écran. **≤ 2 éléments** simultanés (les lower-thirds masquent le sous-titre → zéro collision).
- **Sous-titres** : texte français **corrigé et accentué** (relecture de l'ASR base), karaoké (mot actif en accent), Inter Black 88 px + contour, chunks limités en longueur (aucun débordement), zone morte respectée (rien sous y=1640).
- **Shape3D volontairement retiré** : sur un talking-head fiscal, un volume 3D en rotation ajoute du bruit, pas de la clarté (« une seule chose bouge à la fois »).

## 6. Son

- **Voix** : passe-haut 80 Hz, dé-esseur, compression douce, limiteur.
- **Musique** : lit à −20 dB, **ducking sidechain −9 dB** sous la voix ; fondu sur les 10 dernières frames.
- **SFX motivés uniquement** : impact sur le point de bascule (signature), riser avant la révélation « 50 % », clicks discrets sur l'apparition des cartes. **Aucun whoosh sur les coupes franches.**
- **Master : −14 LUFS, true peak −1 dBTP.**

## 7. Contraintes de session (documentées)

- **Modèle Whisper** : `large-v3`/`medium` injoignables (miroirs bloqués) → transcription **`base` multilingue**, texte **relu et corrigé** manuellement. À revalider si un terme fiscal ou un chiffre doit être exact à l'antenne (le « 50 % » est l'interprétation graphique de « la moitié »).
- **Musique** : lit synthétique libre de droits (remplaçable par une vraie prod si fournie).
- Rendu par tranches durables (redémarrages fréquents du conteneur) ; grain/vignette appliqués en post ffmpeg (coût de rendu).

## 8. Exports

- `out/short_final.mp4` — 1080×1920, H.264 CRF 18, yuv420p, +faststart, AAC 320k, −14 LUFS.
- `out/short_captions.srt` — sous-titres séparés.
- `out/short_sans_musique.mp4` — voix seule (sans musique ni SFX), −14 LUFS.
