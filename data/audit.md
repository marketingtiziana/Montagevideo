# Audit réalisation — montage actuel (V3, 1:53)

> Méthode : rendu du montage actuel, 228 frames extraites (1 toutes les 15 f), inspectées en 4 planches de contrôle. Récit validé — seule la réalisation est auditée.

---

## Erreurs de cut

Les points de coupe sont désormais sur des frontières de mots (montage frame-locké), avec marges. Le problème restant = **jump cuts non masqués** : la rush est une prise unique, cadrage centré identique de part et d'autre → la posture saute aux coupes non couvertes.

| Timecode | Problème | Correction prévue |
|---|---|---|
| 0:13.67 (s02→s03) | Coupe franche, masquée par carte FAUX — OK, mais **flash décoratif** ajouté par-dessus | Garder la carte FAUX, **supprimer le flash** |
| 0:27.03 (s04→s05) | Jump cut (posture saute), masqué par **whip décoratif** non motivé | Remplacer par **zoom-through** (raccord dans le mouvement) |
| 0:44.10 (s05→s06) | **Plan continu** (pont restauré) mais **signature appliquée** dessus = transition sur non-coupe | Supprimer la signature ; garder TitleFlash comme accent seul |
| 0:54.87 (s07→s08) | Jump cut (saut source 1:12→1:33), masqué par carte + **flash décoratif** | ComparisonBar masque déjà → **coupe franche** + zoom-through |
| 1:04.10 (s09→s10) | Jump cut (saut source, bloc mort de 33 s retiré), **whip décoratif** | **Zoom-through** (marque le saut temporel proprement) |
| 1:25.40 (s12→s13) | Punchline, **flash décoratif** dessus | **Coupe franche silencieuse** (la punchline se passe d'effet) |
| 1:36.53 (s13→s14) | Jump cut, **whip décoratif** | **Zoom-through** |

**Souffle** : les respirations avant « c'est LA décision » (1:02) et avant « l'endroit où ils dorment » (1:32) sont présentes — à **conserver**.

## Transitions

| TC | Type actuel | Motivée ? | Verdict |
|---|---|---|---|
| 0:13.67 | flash + carte FAUX | Carte oui / flash non | Supprimer flash |
| 0:27.03 | whip | Non (aucun mouvement dans ce sens) | → zoom-through |
| 0:44.10 | signature | Non (plan continu) | Supprimer |
| 0:54.87 | flash | Non | → coupe franche |
| 1:04.10 | whip | Non | → zoom-through (saut temporel) |
| 1:15.73 | carte LE PIÈGE | Oui (chapitre) mais **tenue ~2,5 s** (spec 0,6 s) | Raccourcir à 0,6 s |
| 1:25.40 | flash | Non | Supprimer (coupe franche) |
| 1:36.53 | whip | Non | → zoom-through |

Bilan : **trop d'effets décoratifs** (flashes systématiques, whips contre-mouvement). La règle « 85 % coupes franches + zoom-through prioritaire » n'est pas respectée. Aucune de ces transitions n'a de justification de mouvement.

## Caméra — **le défaut majeur**

- **Aucun suivi de visage.** Cadrage figé, centré, identique sur tout le short → aspect « mou » et amateur.
- **Visage au centre (~50 %)** au lieu de **38 % depuis le haut** ; air au-dessus de la tête irrégulier.
- **Aucun zoom dynamique** : pas de variation de palier entre plans, pas d'alternance. L'image ne respire pas.
- **Aucun snap zoom** sur les punchlines (« c'est LA décision » 1:02, « à cause de l'endroit où ils dorment » 1:32).
- **Dérive quasi absente** sur les plans longs (> 3 s) → image figée.
→ **Refonte complète Phase D** : détection MediaPipe/OpenCV, lissage One-Euro, paliers 1.00/1.08/1.15/1.24, zoom-through, snap zoom sur impacts, dérive permanente.

## Sous-titres

- **SURLIGNAGE partout** : chaque mot actif dans une **pastille bleue pleine** → **banni**, à supprimer entièrement.
- **Aucun mot-clé jaune** : tout est en accent bleu. Les chiffres/montants (« milliers d'€ », « 0 % », « 50 % », « moitié ») doivent passer en **jaune #FFD84D** (2 à 4 max).
- **Ponctuation présente** (« . », « , ») → supprimer sauf « ? ».
- Mot en cours : devrait être **échelle 1.06 + luminosité**, sans fond.
- Pas d'animation lettre-par-lettre ni d'extrusion 3D sur les mots forts.
- Position : correcte (centre-bas, au-dessus du micro, rien sous y=1640).

## Son

- **Whoosh/impact sur des coupes franches masquées** (flashes s03/s08/s13, whips) → viole « pas de whoosh sur une coupe franche ». À retirer.
- **25 pops sur overlays** = trop, et pas assez discrets → réduire, passe-haut 2 kHz, -22 dB, seulement sur les vraies cartes.
- **Pas de silence 0,2 s** avant les gros impacts (snap zooms à créer).
- Whoosh mono-couche (pas les 3 couches sub/air/queue), pic pas garanti sur la frame de coupe.
- Voix (HPF80 + comp + déesseur), musique -20 dB duckée -9 dB, master -14 LUFS : **OK, à conserver**.

## Densité / éléments simultanés

- **Souvent > 2 éléments** : s05 (LowerThird + 2 tags + sous-titre = 3-4), s12 (idem), s13 (TwinReveal + tag + sous-titre). → viole « 2 max ». Réduire/étager les tags.
- Tenues trop longues : TitleFlash et TwinReveal ~3-4 s, LE PIÈGE ~2,5 s → resserrer.

---

## Plan de correction (ordre)
**B** recaler/masquer les cuts (zoom-through, match cut) · **C** transitions (supprimer décoratif, J-cut systématique) · **D** caméra virtuelle + suivi de visage (le gros morceau) · **E** sous-titres sans surlignage, typo + jaune · **F** graphiques (≤2 éléments, tenues justes) · **G** son (retirer whoosh sur coupes franches, 3 couches, silence avant impact) · **H** contrôle visuel bouclé + `corrections.md`.
