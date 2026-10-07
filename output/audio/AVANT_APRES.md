# Voix studio — AVANT / APRÈS (Module B, étape A)

Chaîne : extraction 48 kHz / 24 bits → contrôle bleed (demucs htdemucs) → **DeepFilterNet3** (débruitage + déréverbération, pleine intensité) → Pedalboard (HPF 80 Hz, gate −45 dB, −2,5 dB @ 300 Hz, +2,5 dB @ 3,5 kHz, shelf +1,5 dB @ 10 kHz, compresseurs 3:1 puis 2:1, limiteur −1 dB) → de-esser ffmpeg (i=0.4, m=0.5, f=0.5) → jump cuts (mêmes coupes que la vidéo, à l'échantillon près, micro-fondus 8 ms) → loudnorm 2 passes (I −14, TP −1, LRA 7).

| Mesure | AVANT (source brute) | APRÈS (voice_studio.wav) | Cible |
|---|---|---|---|
| Loudness intégrée | -28.8 LUFS | **-14.2 LUFS** | −14 ±1 |
| True peak | -6.3 dBTP | **-4.0 dBTP** | ≤ −1 |
| Bruit de fond, niveau brut (fenêtre silence 0,05–0,85 s) | -61.6 dBFS | — | |
| Bruit de fond, voix ramenée à −14 LUFS | **-46.8 dBFS** | **< −120 dBFS** (silence numérique après gate) | < −60 |
| Musique / bleed (demucs, accompagnement vs voix) | -34.9 dB → demucs non nécessaire | — | |

**Contrôle « téléphone / robotique »** : part d'énergie par bande sur les 5 s de l'A/B (dB relatifs au total 60 Hz–16 kHz)

| Bande | AVANT | APRÈS |
|---|---|---|
| Graves 60–250 Hz | -11.0 | -10.7 |
| Médiums 250 Hz–2 kHz | -0.4 | -0.5 |
| Présence 2–6 kHz | -20.1 | -17.5 |
| Air 6–16 kHz | -28.3 | -25.9 |

Les graves sont conservés et la présence comme l'air gagnent environ 2,5 dB : pas de signature « téléphone » (qui couperait graves et aigus). Pas besoin de réduire DeepFilterNet. Reste une vérification à l'oreille : `ab_compare.wav` = 5 s AVANT (brut, remis à −14 LUFS pour comparer à niveau égal) + 0,5 s de silence + 5 s APRÈS, sur « Honnêtement, vous pouvez très bien collaborer… ».

Pas de musique fournie : `mix.wav` = `voice_studio.wav`. Le master v2 garde exactement la même image que le master v1, seule la piste audio change.
