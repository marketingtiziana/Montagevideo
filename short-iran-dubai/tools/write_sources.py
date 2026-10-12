#!/usr/bin/env python3
"""Génère SOURCES.md (URL, auteur, licence, timestamp d'usage) à partir de build/commons_manifest.tsv,
build/clips.json, build/layout.json et des assets internes."""
import json, csv, sys, datetime
rows = list(csv.reader(open('build/commons_manifest.tsv'), delimiter='\t'))
clips = json.load(open('build/clips.json'))
lay = json.load(open('build/layout.json'))
PLAN = {'s01': 'k01', 's02': 'k02', 's03': 'k03', 's04': 'a380_taxi (b04)', 's05': 'k33', 's06': 'k05', 's07': 'k06', 's08': 'k07',
        's09': 'k08', 's10': 'k09', 's11': 'a380_aerial (b04)', 's12': 'k11', 's13': 'k12', 's14': 'k13', 's15': 'k14',
        's16': 'k15', 's17': 'k16', 's18': 'k17', 's19': 'k26', 's20': 'k19', 's21': 'k20 (ralenti 0,5×)'}
used_b = {}
for sid, k in PLAN.items():
    src = clips.get(k.split(' ')[0], {}).get('source', 'b04' if 'a380' in k else k)
    used_b.setdefault(src, []).append(sid)
now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
o = []
o.append('# SOURCES.md — provenance, auteurs, licences, horodatage d\'usage\n')
o.append(f'Généré le {now}. Short « La guerre en Iran menace-t-elle l\'expatriation à Dubaï ? » — 1080×1920, 60 fps (+ 30 fps).\n')
o.append('## 1. Photos et vidéo réelles (Wikimedia Commons) — animées par Higgsfield Kling 3.0 (image-to-video, « no new elements »)\n')
o.append('Les clés API Pexels / Pixabay / Unsplash n\'étaient pas disponibles dans l\'environnement ; les sources sont des fichiers Wikimedia Commons sous CC0, domaine public ou CC BY (attribution requise, pas de ShareAlike). Les fichiers CC BY-SA et GFDL ont été exclus. Aucune image d\'actualité, de violence, de média identifiable.\n')
o.append('| Clé | Fichier Commons | Dimensions | Licence | Auteur | Page source | Téléchargé le | Écrans |')
o.append('|---|---|---|---|---|---|---|---|')
for r in rows:
    k, title, dims, lic, licurl, author, page, ts = r
    o.append(f'| {k} | {title} | {dims} | [{lic}]({licurl}) | {author} | [page]({page}) | {ts} | {", ".join(used_b.get(k, [])) or "—"} |')
o.append('\n**Attributions CC BY à reproduire en légende ou en description (obligatoire)** : ' + ' · '.join(f'{r[5]} ({r[3]})' for r in rows if r[3].startswith('CC BY')) + '.\n')
o.append('## 2. Clips générés (Higgsfield, modèle Kling 3.0 pro, 5 s, 9:16, sans son)\n')
o.append('| Clip | Type | Source | Job Higgsfield | URL du résultat |')
o.append('|---|---|---|---|---|')
for k, v in clips.items():
    o.append(f'| {k} | {v["type"]} | {v["source"]} | {v["job_id"]} | {v["url"]} |')
o.append('\nLes 3 clips t2v (k31 brume, k32 nuages, k33 bokeh néon/pluie) sont des ambiances abstraites : aucun lieu ni événement généré par IA. Les clips image-to-video partent d\'une photo réelle licenciée et n\'ajoutent aucun élément (prompt « no new elements »).\n')
o.append('Vidéo réelle b04 (Klaus Hesse, CC BY 3.0) : segments 2–12 s (A380 au sol, DXB) et 108–118 s (vue hublot sur Dubaï), recadrés 9:16 par ffmpeg (point d\'intérêt manuel ; Higgsfield `reframe` écarté : 93 crédits par clip).\n')
o.append('## 3. Carte\n- Contours réels : Natural Earth 10 m admin_0_countries (domaine public), https://github.com/nvkelso/natural-earth-vector — projection Mercator, simplification 0,02°, `tools/map_paths.py`.\n- Coordonnées Dubaï : GeoNames 292223 (CC BY 4.0).\n')
o.append('## 4. Mockups (HTML → PNG alpha → .mov qtrle + .mp4 fond noir composité en « screen »)\n- `mockups/board.html` tableau des départs stylisé (RETARDÉ / ANNULÉ) — illustre les perturbations documentées (FACTS A1–A3), aucune compagnie, aucun logo.\n- `mockups/hud.html` HUD radar abstrait.\n- `mockups/alert.html` bandeau d\'alerte sans logo ni texte.\n')
o.append('## 5. Typographie\n- Montserrat ExtraBold / SemiBold — SIL Open Font License 1.1 (The Montserrat Project Authors), instanciées depuis `Montserrat[wght].ttf` (google/fonts).\n')
o.append('## 6. Musique et SFX\n- Musique : `audio/music_synth.wav`, composition synthétique originale générée par `tools/gen_music.py` (production interne, libre de droits) — 90 BPM, rise 9 s, drop 10 s, résolution à 28 s. La génération vidIQ (`vidiq_generate_music`) a échoué deux fois (filtre / expiration) et a été remboursée.\n- SFX : `sfx/*.wav` synthétisés par `tools/gen_sfx.py` (production interne).\n- Beats : grille 90 BPM (`build/beats_synth.json`, librosa).\n')
o.append('## 7. Faits à l\'écran\nVoir `FACTS.md` (vérifié le 12/10/2026) et le diff automatique `build/facts_diff.md`.\n')
open('SOURCES.md', 'w').write('\n'.join(o) + '\n')
print('SOURCES.md écrit')
