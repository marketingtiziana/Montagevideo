# Reel "whiteboard" — LA LLC EXPLIQUÉE SIMPLEMENT

Reel Instagram vertical **100 % animé** (aucun rush vidéo) en style dessin à main levée :
traits noirs sur fond blanc cassé, formes tracées par rough.js, texte écrit lettre par lettre
en Caveat, surligneur jaune en accent unique.

- Sortie : `../output/reel_llc_whiteboard.mp4`
- Couverture : `../output/cover_reel_llc.png`
- 1080x1920, 30 fps, H.264 CRF 18, ~43 s

## Démarrer

```bash
cd whiteboard
npm install
python3 ../pipeline/gen_whiteboard_audio.py   # génère la bande son dans public/audio
npm run dev                                    # Remotion Studio (preview interactive)
```

## Rendus

```bash
npm run render                 # export final H.264 CRF 18
npm run still                  # PNG de couverture (frame 110 de la scène 1)
npx remotion render Scene1Preview ../output/scene1.mp4 --codec=h264 --crf=20
npx remotion render ReelLLC ../output/preview.mp4 --crf=30 --scale=0.4   # preview basse qualité
```

## Structure

| Fichier | Rôle |
|---|---|
| `src/theme.ts` | Charte : couleurs, format, zones de sécurité, épaisseurs |
| `src/timeline.ts` | Durées et offsets des scènes, fenêtres de bruitage |
| `src/lib/rough.ts` | Génération des tracés rough.js (déterministes, memoïsés) + échantillonnage pour la pointe du crayon |
| `src/lib/font.ts` | Chargement de Caveat depuis `public/fonts` (aucun accès réseau au rendu) |
| `src/components/SketchShape.tsx` | Trace une forme progressivement (`stroke-dasharray` / `stroke-dashoffset`, `pathLength=1`) |
| `src/components/Handwriting.tsx` | Écriture manuscrite lettre par lettre (masque `clip-path` animé), rotation aléatoire par mot |
| `src/components/Highlighter.tsx` | Surligneur jaune sketchy derrière les mots clés |
| `src/components/Board.tsx` | Fond, grain papier, micro-drift de caméra, transition gomme |
| `src/components/Pencil.tsx` | Main tenant un crayon, suit le point de tracé et la pointe d'écriture |
| `src/components/Doodles.tsx` | Bibliothèque de croquis : flèches, bonhomme bâton, drapeau, globe, `$`, `?` |
| `src/scenes/Scene1..5.tsx` | Les cinq scènes |
| `src/Soundtrack.tsx` | Musique, crayon, "tak" de craie, gomme |

## Réglages utiles

- **Vitesse d'écriture** : `msPerChar` sur `<Handwriting>` (50 à 70 ms, défaut 58).
- **Style du trait** : `roughOptions={{roughness, bowing}}` sur `<SketchShape>` (1.5 à 2.6).
- **Micro-drift** : `zoomTo` et `driftSeed` sur `<Board>`.
- **Timings** : `SCENE*_FRAMES` dans chaque scène ; penser à reporter les fenêtres de bruitage
  dans `src/timeline.ts` (`DRAW_WINDOWS`, `TAK_FRAMES`).

## Son

`pipeline/gen_whiteboard_audio.py` synthétise toute la bande son avec ffmpeg
(aucun asset externe requis) :

| Fichier | Contenu |
|---|---|
| `public/audio/lofi_bed.mp3` | Nappe lo-fi calme Am7 / Dm7 / G7 / Cmaj7 + craquement de vinyle |
| `public/audio/pencil_loop.mp3` | Boucle de crayon qui gratte, volume piloté par `DRAW_WINDOWS` |
| `public/audio/tak.mp3` | "Tak" de craie en fin de mot important |
| `public/audio/erase.mp3` | Balayage de gomme entre les scènes |

Pour utiliser vos propres fichiers, déposez-les dans `./assets/` à la racine du dépôt puis
relancez le script :

- `assets/music.mp3` remplace la nappe générée ;
- `assets/vo.mp3` est ajouté comme voix off (les timings des scènes sont alors à recaler
  à la main dans `src/timeline.ts` et dans les scènes).

Le script écrit `src/audioManifest.ts` pour indiquer à Remotion quels fichiers optionnels existent.

## Contraintes respectées

- Aucune promesse chiffrée de défiscalisation, aucune mention de taux, aucun logo d'administration.
- La nuance de la scène 5 sur le pays de résidence est présente et encadrée.
- Zones de sécurité Instagram : rien au-dessus de 220 px ni en dessous de 1670 px.
- Aucun em-dash dans les textes à l'écran.
