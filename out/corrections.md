# Corrections réalisation — audit → correction → résultat

| Poste | Défaut (audit) | Correction appliquée | Résultat vérifié |
|---|---|---|---|
| **Caméra** | Cadrage figé, centré, aucun suivi, aucun zoom dynamique | Suivi de visage **YuNet** (`face_track.json`) + lissage **One-Euro** + zone morte 3 % + vitesse max 6 px/f ; paliers **1.08/1.15** alternés, **zoom-through** aux transitions, **snap zoom 1.24** sur les 2 punchlines, dérive 14 px sur plans longs (`camera.json`, pilote Remotion) | Cadrage variable, compo tenue ; **médiane 0 px/f** (aucun tremblement), sauts uniquement sur snaps/coupes |
| **Sous-titres** | Surlignage (pastille bleue) partout, aucun mot jaune, ponctuation | **Surlignage supprimé** ; typo Inter Black contour 6 px + ombre ; mot en cours **échelle 1.06 + luminosité** (sans fond) ; **3 mots jaunes** #FFD84D (coûter/faux/dorment) animés lettre par lettre ; ponctuation retirée (sauf « ? ») | Vérifié sur stills : blanc net, jaunes lisibles, zéro fond |
| **Transitions** | Flashes/whips décoratifs non motivés, signature sur plan continu | **Supprimés** ; 85 % coupes franches ; whips → **zoom-through** (s05/s10/s14) ; flashes → coupes franches ; signature retirée | Aucune transition sans justification |
| **Cuts** | Jump cuts aux coupes non masquées | Cartes plein cadre (FAUX, ComparisonBar, LE PIÈGE) sur les gros sauts ; zoom-through ailleurs ; souffles conservés | Coupes sur frontières de mots, souffles gardés |
| **Graphiques** | > 2 éléments (bandeau + 2 tags + sous-titre), tenues trop longues | Tags réduits à **1/segment**, Chip passé en dominant → **≤ 2 éléments** ; LE PIÈGE **0,6 s**, TitleFlash/TwinReveal resserrés à 1,6 s | Jamais plus de 2 à l'écran |
| **Son** | Whoosh/impact sur coupes franches, 25 pops | Whoosh **uniquement sur zoom-through** (pic sur la frame de coupe, 0,3 s de montée) ; impact sur les 2 snaps ; riser avant 50 % ; click carte **HP 2 kHz, −22 dB** ; **aucun whoosh sur coupe franche** | 3 whoosh / 2 impacts / riser / 14 clicks, master −14 LUFS |

## Checklist finale
- [x] Aucune coupe sur une syllabe (frontières de mots, marges 0,25/0,40 s)
- [x] Aucun jump cut non masqué (cartes plein cadre / zoom-through)
- [x] Aucune transition sans justification écrite
- [x] Aucun tremblement de caméra (One-Euro + zone morte, médiane 0 px/f)
- [x] Aucun zoom qui court sur toute la durée d'un plan (entrée 20 f puis tenue)
- [x] Aucun surlignage derrière un sous-titre
- [x] ≤ 4 mots jaunes (3 : coûter, faux, dorment)
- [x] Aucun sous-titre sous y = 1640
- [x] Chaque graphique ≥ 1,4 s et ressort proprement (exception FullscreenCard 0,6 s, spec chapitre)
- [x] Jamais plus de 2 éléments simultanés
- [x] Aucun whoosh sur une coupe franche

## Contrainte source documentée
La rush cadre le visage haut (~20 % du haut). La compo « 38 % depuis le haut » n'est pas atteignable sans couper la tête → compo adaptée (visage haut, air au-dessus, recadrage par zoom). C'est un fait de la source, pas un défaut de réalisation.
