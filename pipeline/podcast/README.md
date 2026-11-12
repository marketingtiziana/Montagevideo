# Pipeline podcast 16:9

Montage d'un podcast vidéo horizontal (1920x1080) à partir de rushs multicam, ou d'un seul plan large 4K
avec multicam simulé par recadrage. Paramètres dans `config.json`.

| Étape | Script | Sortie |
|---|---|---|
| install | `bash pipeline/podcast/setup.sh` | modèles, polices, `work/audio16.wav`, `work/audio48.wav` |
| 0.1-0.2 | `probe_sync.py` | `work/sync.json` (ffprobe + décalages par corrélation croisée) |
| 0.3 | `transcribe.py` | `work/words.json`, `work/segments.json`, `work/transcript.txt` |
| 0.4 | `analyze_video.py` → `embed.py` → `diarize.py` | `work/visual.json` (visages, bouches), `work/emb.npz`, `work/words_spk.json`, `work/speakers.json` |
| 0.5 | `punchlines.json` (édité à la main, outil `find_phrase.py`) | punchlines horodatées |

Diarisation (une seule piste micro) : empreintes vocales WeSpeaker ResNet34 (ONNX) + k-means à 2 clusters ;
le mouvement des bouches nomme les clusters. Contrôle : `controle_diarisation.json` (répliques annotées à la main).
