# Writes SOURCES.md from data/*.json + edit_times.json (which screen uses which source).
import json
meta = {("c%02d" % m["i"]): m for m in json.load(open("data/commons_meta.json"))}
px = {c["id"]: c for c in json.load(open("data/pexels_andorra.json"))}
jobs = json.load(open("data/jobs.json"))
times = json.load(open("edit_times.json"))
use = {}
for s in times["screens"]: use.setdefault(s["shot"], []).append(s["n"])
PH = [k for k in ["c27", "c28", "c22", "c05", "c14", "c01", "c12", "c35", "c31", "c18", "c00", "c34"] if k in use]
L = ["# SOURCES — Reel 3 « Andorre, le petit pays mystérieux »", "",
     "**Règle appliquée : l'IA anime une photo réelle, elle n'invente jamais un lieu.** Les lieux identifiables viennent soit de vidéos tournées en Andorre (Pexels), soit de **photos réelles** Wikimedia Commons recadrées en 9:16 puis animées par Higgsfield (image-to-video **Kling 3.0 pro**, 5 s, 9:16, prompt unique « slow cinematic push-in, subtle parallax, realistic, no added elements »). Le texte-to-video ne sert qu'aux plans d'ambiance sans lieu identifiable (brume, mer de nuages, nuages, crêtes au couchant). Chaque plan animé a été contrôlé image par image (début, milieu, fin) : aucun élément ajouté.", "",
     "## Vidéos réelles (Pexels, tournées en Andorre)", "", "| Écran(s) | Clip | Auteur | Licence | Extrait utilisé |", "|---|---|---|---|---|"]
for pid, key, seg in ((34368610, "px34368610a", "3,0–5,2 s, recadrage 9:16 côté route"), (34368610, "px34368610b", "8,0–11,0 s, recadrage 9:16 centré (vallée)"),
                      (35009532, "px35009532", "4,0–6,2 s, recadrage 9:16"), (38238599, "px38238599", "2,0–5,0 s, recadrage 9:16 sur le Pont de Paris")):
    c = px[pid]
    L.append(f"| {', '.join(map(str, use.get(key, [])))} | [{c['url'].rstrip('/').split('/')[-1]}]({c['url']}) (3840×2160) | [{c['author']}]({c['author_url']}) | Pexels License (usage commercial libre, attribution non requise) | {seg} |")
L += ["", "## Photos réelles animées par Higgsfield (Wikimedia Commons)", "",
      "Attribution requise pour CC BY / CC BY-SA : texte prêt à coller en bas de page. Recadrage + animation = adaptation ; pour CC BY-SA, le plan animé reste sous la même licence.", "",
      "| Écran | Photo | Auteur | Licence | Job Higgsfield (Kling 3.0) |", "|---|---|---|---|---|"]
for key in PH:
    m = meta[key]
    L.append(f"| {', '.join(map(str, use[key]))} | [{m['title'][5:]}]({m['page']}) | {m['artist']} | [{m['license']}]({m['license_url'] or m['page']}) | `{jobs['i2v'][key]}` |")
t2v = jobs["t2v"]
L += ["", "## Plans d'ambiance générés (texte-to-video, sans lieu identifiable)", "",
      "| Écran(s) | Plan | Modèle | Job |", "|---|---|---|---|",
      f"| 2 | Vallée sous une mer de nuages à l'aube | Seedance 2.5, 1080p | `{t2v['t102']}` |",
      f"| 3 (fond flouté et assombri de la carte) | Brume sur crêtes sombres | Seedance 2.5, 1080p | `{t2v['t101']}` |",
      f"| 6 | Time-lapse de nuages sur une vallée boisée | Seedance 2.5, 1080p | `{t2v['t106']}` |",
      f"| 20–22 | Coucher de soleil sur des crêtes boisées | Kling 3.0 pro | `{t2v['t121']}` |",
      f"| — (rejeté) | Premier coucher de soleil : un pic volcanique qui pouvait passer pour un lieu réel | Seedance 2.5 | `{t2v['t120']}` |",
      "", "## Carte (écran 3)", "",
      "Contours d'Andorre, de la France et de l'Espagne : [Natural Earth](https://www.naturalearthdata.com/) 1:10m Admin 0 Countries (domaine public), via [nvkelso/natural-earth-vector](https://github.com/nvkelso/natural-earth-vector). Projection équirectangulaire corrigée à 42,55° N (`tools/map_paths.py`), tracée dans Higgsedit. L'enclave de Llívia apparaît à droite, conforme à la source.",
      "", "## Audio", "",
      "Musique et effets **originaux**, synthétisés de zéro par `audio/music.py` (numpy/scipy, aucun échantillon ni boucle tierce) : pas de licence tierce, pas de risque Content ID. 150 BPM ; drone sombre jusqu'à 16 s, silence de 0,25 s, drop, groove lumineux Bm–G–D–A, impacts calés sur les coupes. Mix −14 LUFS, true peak −1,2 dBTP après AAC.",
      "", "## Polices", "", "Montserrat 800 / 600 (SIL Open Font License), via le catalogue de polices Higgsedit.",
      "", "## Texte d'attribution prêt à coller (légende Instagram)", "", "```"]
credits = [f"{meta[k]['artist']} ({meta[k]['license']})" for k in PH if meta[k]["license"] != "CC0"]
L.append("Images : Wikimedia Commons — " + " · ".join(dict.fromkeys(credits)) + ". Vidéos : Xavier Pad, Nico Becker (Pexels). Animations : Higgsfield. Carte : Natural Earth.")
L.append("```")
open("SOURCES.md", "w").write("\n".join(L) + "\n")
print(L[-2])
