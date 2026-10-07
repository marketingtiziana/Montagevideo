# Writes SOURCES.md from data/picks.json + data/jobs.json (every shot, its licence, its processing; graphics, fonts, music).
import json
P = json.load(open("data/picks.json")); J = json.load(open("data/jobs.json"))
SH = {"s01": "1 (hook)", "s02a": "2 (Dubaï)", "s02b": "2 (New York)", "s03": "3", "s04": "4", "s05": "5", "s06": "6", "s07": "7", "s08": "8",
      "s09": "9", "s10": "10", "s11": "11", "s12": "12 (révélation)", "s13": "13", "s14": "14", "s15": "15", "s16": "16", "s17": "17",
      "s18": "18", "s19": "19", "s20": "20", "s21": "21–23 (ralenti 0,5x)"}
L = ["# SOURCES — Reel 4 « Les 5 meilleurs pays pour créer ta société en 2026 »", "",
     "## Vidéos (Pexels, licence Pexels : usage commercial autorisé, attribution non obligatoire mais fournie)", "",
     "Chaque plan a suivi la même chaîne :",
     "1. Extrait du fichier original Pexels (≥ 1080p).",
     "2. Recadré en 9:16 dans ffmpeg (centré). Les 3 sources paysage ont été recadrées sans `reframe`, pour ne rien ajouter par IA à un lieu réel.",
     "3. Mis à l'échelle en 1080×1920.",
     "4. Passé par Higgsfield `upscale_video` (bytedance, preset common, 1080p, **60 fps**).",
     "5. Contrôlé par `video_analysis_create`.",
     "",
     "| Plan | Écran | Lieu (titre Pexels) | Auteur | Lien | Extrait (s) | Upscale 60 fps (job) |", "|---|---|---|---|---|---|---|"]
for k, o in P.items():
    slug = o["url"].rstrip("/").rsplit("/", 1)[-1]
    L.append(f"| {k} | {SH[k]} | {slug.rsplit('-', 1)[0].replace('-', ' ')} | [{o['author']}]({o['author_url']}) | [pexels.com/video/{o['pexels']}]({o['url']}) | "
             f"{o['ss']} → {o['ss'] + o['t']:.1f} | `{J['upscale_jobs'].get(k, '—')}` |")
L += ["", "### Plans écartés après vérification du lieu", "", "Le titre Pexels a été vérifié pour chaque plan. Un plan est écarté quand il ne montre pas le lieu nommé à l'écran.", "",
      "| Plan | Ancien Pexels | Raison |", "|---|---|---|"]
for k, r in J.get("replaced", {}).items():
    L.append(f"| {k} | [{r['old_pexels']}](https://www.pexels.com/video/{r['old_pexels']}/) | {r['reason']} |")
L += ["", "## Effet « texte derrière l'objet »", "",
      f"- Plan s02a (Burj Khalifa) : Higgsfield `remove_background` (vidéo), job `{J['mattes']['s02a']['job']}`. Le détourage est net sur toute la durée. Il est incrusté au-dessus du mot « DUBAÏ » par une clé de luminance (GLSL).",
      f"- Plan s12 (Victoria Harbour) : détourage testé (job `{J['mattes']['s12']['job']}`) puis **écarté**. Bords flous, fenêtres sombres trouées par la clé, halo sur le reflet.", "",
      "## Graphismes", "",
      "- **Drapeaux** : [flag-icons](https://github.com/lipis/flag-icons) 7.2.3, licence **MIT**. SVG 4:3 rendus en PNG 288×216 (3x) par Chromium (`tools/flags.py`). Aucun emoji.",
      "- **Contour de Hong Kong** : [Natural Earth](https://www.naturalearthdata.com/) 10m admin-0, **domaine public** (`tools/hk_outline.py`).",
      "- **Icônes** : [Lucide](https://lucide.dev) (licence ISC), via le catalogue intégré de Higgsedit.",
      f"- **Couverture du CODEX** : Higgsfield `generate_image` (gpt_image_2_5), job `{J['cover']['job']}`. Cuir noir et motif art déco or, **sans aucun texte généré par IA**. Le titre est en HTML/CSS (`mockups/codex_book/`).",
      "- **Livre 3D** : HTML/CSS (preserve-3d, rotation −25° → 0° en 0,8 s, reflet spéculaire). Rendu image par image en 60 fps par Chromium, puis exporté en .mov ProRes 4444 avec alpha (`tools/render_mockup.py`).", "",
      "## Typographie", "",
      "Montserrat ExtraBold 800, SemiBold 600 et Black 900, [SIL Open Font License](https://github.com/JulietaUla/Montserrat/blob/master/OFL.txt). Fichiers via Higgsedit `fonts add` et [Fontsource](https://fontsource.org/fonts/montserrat).", "",
      "## Musique et effets sonores", "",
      "**Composition originale** synthétisée de zéro (`audio/music.py`, numpy/scipy) : aucun échantillon, aucune banque, aucun droit tiers.",
      "- Tempo 120 BPM, drop à 27,0 s, riser de 25 à 27 s.",
      "- Effets synthétisés : whoosh, impact sub, tick, glitch, ding, croix, page.",
      "- Mixage : −14 LUFS, true peak ≤ −1 dBTP.", "",
      "## Texte d'attribution prêt à coller (légende ou commentaire)", "",
      "> Images : Pexels (" + ", ".join(sorted({o["author"] for o in P.values()})) + "). Drapeaux : flag-icons (MIT). Carte : Natural Earth. Musique originale."]
open("SOURCES.md", "w").write("\n".join(L) + "\n")
print("SOURCES.md", len(P), "shots")
