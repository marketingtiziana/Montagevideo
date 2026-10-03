# SCENES — plan des transitions et des couches (reel 4)

Timeline 60 fps, 1080×1920, 57,0 s. Grille musicale à 120 BPM : chaque coupe tombe sur un temps.

**Règles du plan :**
- Aucune transition ne dépasse 0,4 s.
- Deux transitions consécutives ne sont jamais identiques.
- 4 zoom-throughs (au moins 3 demandés).
- Images noires + flash blanc uniquement sur la révélation du n°1.

| Coupe à | Vers l'écran | Plan entrant | Transition (durée) | Détail |
|---|---|---|---|---|
| 0,0 | 1 | s01 lumières de ville vues d'avion | **ouverture lumière** (0,4 s) | fondu depuis le noir + voile chaud 50 % |
| 2,0 | 2 | s02a Burj Khalifa (Dubaï) | **zoom-through** (0,15 + 0,3 s) | sortant : échelle ×1,5 + flou 16 ; entrant : 1,45 → 1,0 + flou 16 → 0, flou de bouger 6 échantillons |
| 3,0 | 2 (suite) | s02b Empire State (New York) | **whip + aberration chromatique** (0,15 + 0,25 s) | translation horizontale de 75 % de la largeur, aberration 1,5 px → 0 |
| 4,0 | 3 | s03 bureau, documents | **luma wipe** (0,35 s) | le plan entrant apparaît par sa luminance, des ombres vers les hautes lumières |
| 7,0 | 4 | s04 vieille ville de Tallinn | **zoom-through** | — |
| 9,5 | 5 | s05 Tallinn | **push vertical** (0,15 + 0,3 s) | poussée de 55 % de la hauteur, flou de bouger |
| 12,0 | 6 | s06 skyline de Dubaï | **iris / match de forme** (0,35 s) | masque elliptique depuis le centre, porté par un anneau or de 10 px |
| 14,5 | 7 | s07 autoroute de Dubaï la nuit | **whip + aberration chromatique** | — |
| 17,0 | 8 | s08 skyline de New York | **zoom-through** | — |
| 19,5 | 9 | s09 Manhattan la nuit, vue aérienne | **push vertical** | — |
| 22,0 | 10 | s10 Marina Bay la nuit | **luma wipe** | — |
| 24,5 | 11 | s11 Singapour la nuit | **whip + aberration chromatique** | — |
| **27,0** | 12 | s12 Victoria Harbour la nuit | **4 images noires + glitch + flash blanc** | seul flash de la vidéo ; drop musical ; fuite de lumière GLSL de 27,1 à 28,7 s |
| 29,0 | 13 | s13 Victoria Harbour | **zoom-through** | début du HUD Hong Kong |
| 32,0 | 14 | s14 rue de Hong Kong, trams | **whip + aberration chromatique** | — |
| 35,0 | 15 | s15 Star Ferry | **iris / match de forme** | — |
| 37,5 | 16 | s16 rue de Central la nuit | **luma wipe** | — |
| 40,5 | 17 | s17 port à conteneurs (vue zénithale) | **zoom-through** | — |
| 43,0 | 18 | s18 skyline depuis Victoria Peak | **whip + aberration chromatique** | — |
| 46,0 | 19 | s19 pont vers le continent (drone) | **iris / match de forme** | — |
| 48,5 | 20 | s20 rue de Hong Kong la nuit | **fondu flouté + glitch léger** (0,3 s) | l'étalonnage refroidit (écran « piège ») |
| 51,0 | 21–23 | s21 Victoria Harbour au coucher du soleil, ralenti 0,5x | **luma wipe** | le ralenti est appliqué après l'interpolation à 60 fps |

**Suite des transitions :** ouverture, zoom, whip, luma, zoom, push, iris, whip, zoom, push, luma, whip, noir+flash, zoom, whip, iris, luma, zoom, whip, iris, flou, luma. Aucune répétition consécutive.

## Couches (de bas en haut)

1. **shots** : un nœud média par plan, découpé en trois morceaux.
   - Entrée : transition, avec flou de bouger.
   - Corps : push-in linéaire de 100 à 106 %.
   - Sortie : transition, avec flou de bouger.
   - Étalonnage par shader :
     - froid jusqu'à 27 s ;
     - néon chaud de 27 à 48,5 s ;
     - « piège » refroidi de 48,5 à 51 s ;
     - chaud et propre ensuite.
   - Le shader porte aussi le vignettage de 20 %, le grain (≤ 0,04) et l'aberration chromatique (≤ 1,5 px, seulement sur les impacts et les whips).
2. **legibility** : dégradé noir de 0 à 55 % sur le tiers inférieur, plus une bande centrale douce (30 % max).
3. **hud** (29,0 → 48,5 s) :
   - grille en parallaxe à 12 % ;
   - coordonnées « 22.3°N · 114.2°E » tapées lettre par lettre ;
   - contour Natural Earth de Hong Kong (trait blanc de 3 px) avec un pin or pulsé ;
   - 30 particules de poussière à 30 %.
4. **cards** : cartes « verre » (copie floutée du plan à 24 px, blanc 8 %, bord blanc 20 %, teinte sombre pour la lisibilité) qui montent sur un ressort (300/22). On y trouve :
   - le tableau de notes ;
   - les cartes force et inconvénient ;
   - les cartes Hong Kong ;
   - le livre 3D (.mov alpha) ;
   - les chips.
5. **text** :
   - texte cinétique mot par mot ;
   - chiffres géants de 420 px en Montserrat Black avec extrusion or de 12 px ;
   - « HONG / KONG » en 300 px ;
   - glow (bloom) sur le mot accent.
6. **fx** :
   - flash d'ouverture ;
   - anneaux iris ;
   - images noires, glitch, flash et fuite de lumière du n°1 ;
   - glitch léger du piège ;
   - assombrissement final.

## Zones sûres
Rien d'important dans les 250 px du haut ni dans les 350 px du bas. Tout le contenu est placé entre y = 262 et y = 1505.
