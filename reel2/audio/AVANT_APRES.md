# Reel 2 — voix studio, AVANT / APRÈS (Module A)

Chaîne (`voice_chain.py`) : extraction 48 kHz / 24 bits → contrôle bleed (demucs htdemucs) → **DeepFilterNet3** (débruitage + déréverbération) → Pedalboard (HPF 80 Hz, gate −45 dB, −2,5 dB @ 300 Hz, +2,5 dB @ 3,5 kHz, shelf +1,5 dB @ 10 kHz, compresseurs 3:1 puis 2:1, limiteur −1 dB) → de-esser ffmpeg → jump cuts (mêmes coupes que la vidéo, à l'échantillon près, micro-fondus 8 ms) → loudnorm 2 passes (I −14, TP −1, LRA 7).

| Mesure (ffmpeg ebur128) | AVANT (source.mov) | APRÈS (voice_studio.wav) | Cible |
|---|---|---|---|
| Loudness intégrée | −20,3 LUFS | **−14,1 LUFS** | −14 ±1 |
| True peak | −0,5 dBFS | **−4,0 dBFS** | ≤ −1 |
| LRA | 8,8 LU | **4,2 LU** | ≤ 7 |
| Plancher de bruit, voix ramenée à −14 LUFS (5ᵉ centile des blocs de 50 ms, piste non coupée) | −37,9 dBFS | **−54,9 dBFS** (−17 dB) | |
| Musique / bleed (demucs, accompagnement vs voix) | −36,7 dB → demucs non nécessaire | — | |

Le plancher AVANT est haut (−38 dBFS à niveau égal) : la pièce résonne et le bruit de ventilation est audible entre les phrases. DeepFilterNet3 seul le descend à −50 dBFS, le gate de la chaîne à −55 dBFS.

Note de méthode : la mesure automatique de `report.json` utilise la fenêtre 5,20–5,55 s. Cette « pause » contient en fait la queue de réverbération de « France », donc elle ne mesure pas le bruit de fond (−36,7 → −36,5 dBFS, sans signification). La ligne du tableau utilise la mesure par centile, qui est robuste.

**Contrôle « téléphone / robotique »** : part d'énergie par bande sur 5 s de parole (17–22 s, « Et cette holding détient ta société… »), en dB relatifs au total 60 Hz–16 kHz

| Bande | AVANT | APRÈS |
|---|---|---|
| Graves 60–250 Hz | −3,9 | −3,5 |
| Médiums 250 Hz–2 kHz | −2,5 | −2,9 |
| Présence 2–6 kHz | −19,4 | −15,8 |
| Air 6–16 kHz | −16,9 | −18,3 |

Les graves sont conservés et la présence gagne 3,6 dB. L'air perd 1,4 dB : c'est le souffle haute fréquence retiré par DeepFilterNet et le de-esser. Aucune signature « téléphone » (qui couperait à la fois les graves et les aigus).

Écoute : `ab_compare.wav` = 5 s AVANT (brut, remis au même niveau) + 0,5 s de silence + 5 s APRÈS. Pas de musique fournie : le mix final = `voice_studio.wav`.
