# Livraison — Reel 6 « Impôts & OnlyFans » (talking head illustré en motion design)

## Fichiers hébergés (Higgsfield, confirmés)

| Élément | Caractéristiques | URL |
|---|---|---|
| **Master 60 fps** | 1080×1920, 60 fps, H.264 High 11,96 Mb/s (cible 12M), AAC 192k 48 kHz, faststart, 59,10 s | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/2eb56953-e7eb-4a96-9051-3f6ea1cec241.mp4 |
| **Fallback 30 fps** | 1080×1920, 30 fps, H.264 High 10,0 Mb/s, AAC 192k 48 kHz, faststart, 59,11 s (dérivé du master) | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/003dcfd5-0437-4ae1-b412-f3b29e1bb373.mp4 |
| Planche contact (`higgsedit sheet`) | 41 vignettes : une par élément (28) + une par jump cut, horodatées | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/19e8b401-98aa-4efa-854d-d6f5cb85e94c.jpg |
| Extrait hook 0–15,9 s (pour Virality Predictor) | 1080×1920, 60 fps | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/e7a56e9c-e683-4831-8fc4-9c1aa2e82ca1.mp4 |
| Rapport Virality Predictor | dashboard interactif | https://d8j0ntlcm91z4.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/hf_20261006_190953_d613ce85-ca76-4914-aaee-7dfc0c64961b.html |
| Brouillon 540×960 (ancien) | avant la coupe « gagné » et le correctif des mots clés | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/aee40dc7-d383-4cd0-93aa-51f9b6fd7413.mp4 |

- Dans le dépôt :
  - `contact_sheet.jpg` : la planche contact ;
  - `tests/slowmo_025x.jpg` : le contrôle à 0,25× ;
  - `tests/qa_master60.json` : les mesures de QA ;
  - `tests/virality_hook.json` : les scores bruts.
- Les masters locaux sont dans `renders/`. Ils ne sont pas versionnés (`*.mp4` ignorés).

## QA (mesurée sur le master 60 fps livré)

Script : `tests/qa.py renders/master60.mp4`.

| Contrôle | Cible | Mesuré | |
|---|---|---|---|
| Format | 60 fps H.264 12M + 30 fps 10M, AAC 192k, faststart | 11,96 / 10,0 Mb/s · AAC 48 kHz · `moov` avant `mdat` sur les deux | ✅ |
| Durée | 30–60 s | 59,10 s | ✅ |
| Loudness | −14 ±1 LUFS | **−14,0 LUFS** · true peak −1,8 dBFS · LRA 2,9 LU | ✅ |
| Plancher de bruit | < −60 dBFS | **−132,6 dBFS** dans les pauses de la voix traitée (gate DeepFilterNet + Pedalboard, `audio/report.json`), contre −45,3 dBFS avant traitement | ✅ voir (1) |
| Zéro statique | aucune fenêtre fixe > 1,2 s | image entière : plus longue immobilité **0,03 s** | ✅ |
| Synchro sous-titres / voix | < 60 ms | médiane **10 ms**, p90 30 ms, biais +2 ms, **94,8 %** des mots sous 60 ms (172/192 appariés) | ✅ voir (2) |
| Avance des éléments (5 tirés au hasard, seed 6) | 120–180 ms avant le mot | traçable 153 · OnlyFans 153 · impôts 153 · cotisations 130 · un an 110 ms | ⚠️ 4/5, voir (3) |
| Ouvertures de fenêtres à 0,25× | ressort propre, sans saut | impots.gouv.fr, urssaf.fr, iPhone : ressort, URL tapée, page en fondu, ombre continue | ✅ |
| Planche contact | lisibilité, marges, max 2 éléments | rien dans les 250 px du haut ni les 350 px du bas, aucun sous-titre sur une fenêtre, mots clés sans chevauchement | ✅ |

(1) Plancher de bruit. Le montage est en jump cuts, il ne reste donc aucun silence dans le master.
- Le percentile 5 des fenêtres de 50 ms du master (−40,5 dBFS) mesure des fins de mots et des respirations, pas du bruit.
- La mesure valable est celle des pauses de la voix traitée, avant montage : −132,6 dBFS.

(2) Synchro des sous-titres. Chaque mot s'allume sur l'horaire de la transcription source. Les 5 % au-dessus de 60 ms sont des écarts entre la transcription source et la transcription de contrôle (même modèle large-v3, passe indépendante sur le rendu). La médiane de 10 ms et le biais de +2 ms montrent qu'il n'y a pas de décalage d'ensemble.

(3) Avance des éléments. Chaque élément démarre exactement 150 ms avant le mot de la transcription source (large-v3).
- La transcription de contrôle place « un » (un an) 40 ms plus tôt, d'où 110 ms. L'écart vient de la mesure, pas du montage.

## Virality Predictor

L'outil refuse les vidéos de plus de 16 s. L'analyse porte donc sur le hook (0–15,9 s du master), soit la partie qui décide de la rétention.

| Score | Valeur |
|---|---|
| Global | **47** / 100 |
| Potentiel viral | 48 |
| Engagement | 40 |
| Hook (0–3 s) | **30** |
| Maintien | **99** |
| Pic | à 11 s (« 20 000 par mois » → « Première chose ») |

Lecture :
- Le maintien est excellent : l'attention ne retombe jamais.
- Le point faible est la 1ʳᵉ seconde. La fenêtre impots.gouv.fr s'ouvre vide, le temps que l'URL se tape, et le pic n'arrive qu'à 11 s, sur les chiffres.

Piste (non appliquée, elle sort du plan validé) : une version « hook v2 » qui ouvre directement sur le compteur « 20 000 € / mois » ou sur la page impots.gouv.fr déjà chargée. Je peux la faire sur demande.

## Écarts au brief, avec leur raison

1. **Coupe supplémentaire** de la fin de « …je l'ai gagné », qui restait audible. Durée : 59,1 s.
2. **Mise en page** :
   - Fenêtres en 820×520, entre y 790 et 1310. Le visage est centré, il n'y a pas de place sur les côtés. Les sous-titres descendent à y 1420 pendant qu'une fenêtre est à l'écran.
   - iPhone à l'échelle 0,95 sur la droite, avec les sous-titres dans une colonne à gauche.
3. **OnlyFans : logo seul**. onlyfans.com bloque les captures (Cloudflare 403) et le brief interdit les fausses preuves, donc aucune interface n'a été inventée.
4. **Sound design synthétisé** (sons originaux, sans licence), à −12 dB sous la voix.
5. **Pas de musique** : aucune n'a été fournie.
6. **CTA** : « Commande ton diagnostic » + « lien en bio », sans handle (validé).
7. **Punch-ins 107 %** : 15 au lieu de 4 dans le plan, pour garder un événement toutes les 2–3 s entre les fenêtres.

Détail complet : `ILLUSTRATIONS.md`, section 7.

## Fichiers du dossier `reel6/`

| Fichier | Contenu |
|---|---|
| `ILLUSTRATIONS.md` | plan validé + version finale (section 7) |
| `SOURCES.md` | sources et licences |
| `CAPTIONS_INSTAGRAM.md` | 3 légendes Instagram |
| `transcribe.py` → `transcript.json` | faster-whisper large-v3, mot à mot |
| `prep.py` → `cuts.json`, `words_cut.json` | jump cuts + coupes validées |
| `tools/face.py`, `tools/track.py` → `faces_raw.json`, `face_track.json` | visage (mediapipe) et suivi lissé |
| `tools/capture.py` | captures réelles Playwright (impots.gouv.fr, urssaf.fr desktop et mobile) |
| `mockups/notification/` + `tools/render_mockup.py` | notification générique HTML/CSS → .mov alpha |
| `gen_edit.py` + `edit.template.jsx` → `edit.jsx`, `timeline.json`, `events.json` | montage Higgsedit 60 fps (25 blocs, sous-titres karaoké, punch-ins), événements SFX |
| `audio/voice_chain.py`, `audio/sfx.py`, `audio/mix.py`, `audio/recut.py` | DeepFilterNet → Pedalboard → loudnorm −14, SFX, mix |
| `tools/mkbundle.py` | bundle de rendu pour la sandbox Higgsfield (frames / sheet / draft / master) |
| `tests/lint.mjs`, `tests/qa.py` | lint de l'edit (fenêtres de vie, keyframes) et QA du rendu |
| `assets/` (non versionné) | captures, logos, B-roll Pexels, mockup .mov |
