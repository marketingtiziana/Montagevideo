# Reel 5 — voix studio, AVANT / APRÈS (Module A)

## Chaîne de traitement (`voice_chain.py`)
1. Extraction en 48 kHz / 24 bits.
2. Contrôle du bleed avec demucs htdemucs : accompagnement à −37,9 dB sous la voix, donc demucs n'est pas appliqué.
3. **DeepFilterNet3** : débruitage et déréverbération.
4. Pedalboard :
   - filtre passe-haut à 80 Hz ;
   - gate à −45 dB ;
   - −2,5 dB à 300 Hz ;
   - +2,5 dB à 3,5 kHz ;
   - shelf +1,5 dB à 10 kHz ;
   - compresseurs 3:1 puis 2:1 ;
   - limiteur à −1 dB.
5. De-esser ffmpeg.
6. Jump cuts : mêmes coupes que la vidéo (`cuts.json`, 22 segments), à l'échantillon près, avec des micro-fondus de 8 ms.
7. Loudnorm en 2 passes (I −14, TP −1, LRA 7).

## Mesures

| Mesure | AVANT (`tintin.mp4`) | APRÈS (`voice_studio.wav`) | Cible |
|---|---|---|---|
| Loudness intégrée (ffmpeg ebur128, stéréo) | −22,4 LUFS | **−14,1 LUFS** | −14 ±1 |
| True peak | −3,5 dBTP | **−4,0 dBTP** | ≤ −1 |
| LRA | 5,1 LU | **2,4 LU** | ≤ 7 |
| Plancher de bruit (1) | −41,8 dBFS | **−55,5 dBFS** (−13,7 dB) | |
| Musique / bleed (demucs, accompagnement vs voix) | −37,9 dB | — | |

(1) Plancher de bruit mesuré avec la voix ramenée à −14 LUFS : 5ᵉ centile des blocs de 50 ms, sur la piste non coupée.

Note de méthode : `report.json` contient aussi une mesure de plancher sur la fenêtre 8,70–9,30 s (−35,5 → −36,3 dBFS). Ce chiffre n'est pas significatif :
- cette pause contient la queue de réverbération et la respiration qui suivent « même chose » ;
- après traitement, le gate et les jump cuts la rendent caduque.

La ligne du tableau utilise donc la mesure par centile, qui est robuste.

## Contrôle « téléphone / robotique »
Part d'énergie par bande sur 5 s de parole (source 29,3–34,3 s, « C'est la preuve que ton activité se passe vraiment… »), en dB relatifs au total 60 Hz–16 kHz.

| Bande | AVANT | APRÈS |
|---|---|---|
| Graves 60–250 Hz | −6,1 | −5,3 |
| Médiums 250 Hz–2 kHz | −1,4 | −1,8 |
| Présence 2–6 kHz | −18,4 | −14,8 |
| Air 6–16 kHz | −21,7 | −18,2 |

- Les graves sont conservés (+0,8 dB).
- La présence gagne 3,6 dB et l'air 3,5 dB.
- Aucune signature « téléphone », qui couperait à la fois les graves et les aigus.

## Écoute et mix
- `ab_compare.wav` (non versionné) : 5 s AVANT (brut, remis au même niveau), 0,5 s de silence, puis 5 s APRÈS.
- Pas de musique fournie : le mix final est `voice_studio.wav`, prolongé de 2 s de silence pour l'end card.
