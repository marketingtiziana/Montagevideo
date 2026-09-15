#!/usr/bin/env python3
"""Série Instagram Story « Les 3 pays que je déconseille en 2026 » — Fynovates.

Génère 6 visuels verticaux 1080x1920 : photo plein écran + dégradé vertical noir
+ texte blanc Inter aligné à gauche, mots-clés en gras ou en doré sobre.

Grille, typo et traitement d'image strictement identiques sur les 6 visuels.

    python3 stories/build_stories.py

Sortie : stories/out/story-N.png (+ stories/out/planche-contact.html pour relecture)
"""

import base64
import html
import re
import shutil
import subprocess
import sys
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parent
BG = ROOT / "backgrounds"
TYPO = ROOT / "typo"
OUT = ROOT / "out"

W, H = 1080, 1920

# ---------------------------------------------------------------- direction artistique
GOLD = "#E5C07B"          # jaune doré sobre
MARGIN_X = 88             # marge latérale (grille commune)
HEADER_TOP = 168          # hors zone d'interface Instagram (avatar / pseudo)
BLOCK_BOTTOM = 400        # dégagement bas standard (barre de réponse Instagram)
BLOCK_BOTTOM_CTA = 620    # dégagement bas story 6 : zone réservée au sticker

# Dégradé vertical noir : léger en haut (lisibilité du numéro), ~60 % en zone de
# texte, appuyé en bas. Identique sur les 6 visuels.
SCRIM = (
    "linear-gradient(to bottom,"
    " rgba(0,0,0,0.62) 0%,"
    " rgba(0,0,0,0.38) 11%,"
    " rgba(0,0,0,0.20) 24%,"
    " rgba(0,0,0,0.34) 44%,"
    " rgba(0,0,0,0.64) 66%,"
    " rgba(0,0,0,0.82) 84%,"
    " rgba(0,0,0,0.93) 100%)"
)

# ---------------------------------------------------------------- contenu
# Balisage : **gras blanc**, {{doré}}. Le reste est en blanc régulier.
STORIES = [
    dict(
        n=1,
        bg="01-monde-aerien.png",
        blocks=[
            ("lead", "En 2026, il y a {{3 pays}} que je déconseille à la majorité "
                     "des entrepreneurs qui m'appellent."),
            ("body", "Ce sont les 3 plus vendus sur {{Instagram}}."),
            ("body", "Et je vais te dire pourquoi, **un par un**."),
        ],
    ),
    dict(
        n=2,
        bg="02-dubai.png",
        blocks=[
            ("kicker", "Numéro 1 : {{Dubaï}}."),
            ("body", "Pas parce que c'est « mal ». Parce que le **calcul complet** "
                     "est rarement fait : coût de vie parmi les plus chers du monde, "
                     "**présence physique réelle** exigée, un quotidien qui ne "
                     "convient pas à tout le monde."),
            ("body", "Pour certains profils ça marche. Pour la majorité, l'économie "
                     "d'impôt part dans le {{loyer}}."),
        ],
    ),
    dict(
        n=3,
        bg="03-lisbonne.png",
        blocks=[
            ("kicker", "Numéro 2 : le {{Portugal}}."),
            ("body", "Le pays qu'on te vend avec **10 ans de retard**. Le régime "
                     "**NHR** qui a fait sa réputation est fermé aux nouveaux arrivants."),
            ("body", "Ceux qui te le recommandent encore décrivent le Portugal de "
                     "2019. {{Il n'existe plus.}}"),
        ],
    ),
    dict(
        n=4,
        bg="04-bali.png",
        blocks=[
            ("kicker", "Numéro 3 : {{Bali}}."),
            ("body", "Le décor est magnifique, la fiscalité est un **champ de mines**. "
                     "Résidence fiscale mal comprise, visas précaires, des revenus "
                     "souvent **jamais déclarés nulle part**."),
            ("body", "Ce n'est pas une stratégie. C'est une pause photo qui finit en "
                     "{{régularisation}}."),
        ],
    ),
    dict(
        n=5,
        bg="05-horizon.png",
        blocks=[
            ("lead", "Tu remarques le {{point commun}} ?"),
            ("body", "Ces 3 pays ne sont pas devenus populaires parce qu'ils sont les "
                     "meilleurs. Ils sont devenus populaires parce qu'ils **font du "
                     "contenu**."),
            ("body", "Les destinations vraiment intéressantes en 2026 sont {{ailleurs}}. "
                     "Et elles ne font pas de vues."),
        ],
    ),
    dict(
        n=6,
        bg="06-horizon-cta.png",
        bottom=BLOCK_BOTTOM_CTA,
        blocks=[
            ("body", "Ces destinations-là, je les ai toutes mises dans le"),
            ("hero", "CODEX"),
            ("body", "Comparées, notées, avec les **conditions réelles** pour chacune."),
            ("cta", "Réponds {{CODEX}} à cette story et tu le reçois direct."),
        ],
    ),
]

TOTAL = len(STORIES)

# ---------------------------------------------------------------- rendu
INLINE = re.compile(r"\*\*(.+?)\*\*|\{\{(.+?)\}\}", re.S)


def rich(text: str) -> str:
    """Convertit **gras** et {{doré}} en spans, le reste est échappé."""
    out, pos = [], 0
    for m in INLINE.finditer(text):
        out.append(html.escape(text[pos:m.start()]))
        if m.group(1) is not None:
            out.append(f'<b>{html.escape(m.group(1))}</b>')
        else:
            out.append(f'<em>{html.escape(m.group(2))}</em>')
        pos = m.end()
    out.append(html.escape(text[pos:]))
    return "".join(out)


def data_uri(path: Path, mime: str) -> str:
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def page(story: dict) -> str:
    font = data_uri(TYPO / "Inter[opsz,wght].ttf", "font/ttf")
    image = data_uri(BG / story["bg"], "image/png")
    bottom = story.get("bottom", BLOCK_BOTTOM)
    body = "\n".join(
        f'      <p class="{kind}">{rich(txt)}</p>' for kind, txt in story["blocks"]
    )
    return f"""<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8">
<style>
  @font-face {{
    font-family: 'Inter';
    src: url('{font}') format('truetype');
    font-weight: 100 900;
    font-style: normal;
  }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{ width: {W}px; height: {H}px; overflow: hidden; background: #000; }}
  body {{
    font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
    -webkit-font-smoothing: antialiased;
    text-rendering: geometricPrecision;
  }}

  .frame {{ position: relative; width: {W}px; height: {H}px; }}
  .photo {{
    position: absolute; inset: 0;
    background-image: url('{image}');
    background-size: cover; background-position: center;
  }}
  /* dégradé vertical noir — identique sur les 6 visuels */
  .scrim {{ position: absolute; inset: 0; background: {SCRIM}; }}

  .content {{
    position: absolute; inset: 0;
    padding: {HEADER_TOP}px {MARGIN_X}px {bottom}px {MARGIN_X}px;
    display: flex; flex-direction: column; justify-content: space-between;
    color: #fff;
  }}

  /* en-tête : marque à gauche, pagination à droite */
  header {{ display: flex; justify-content: space-between; align-items: baseline; }}
  .brand {{
    font-size: 25px; font-weight: 500; letter-spacing: .38em;
    text-transform: uppercase; color: rgba(255,255,255,.74);
  }}
  .count {{
    font-size: 25px; font-weight: 500; letter-spacing: .20em;
    color: rgba(255,255,255,.82); font-variant-numeric: tabular-nums;
  }}

  /* bloc de texte, ancré en bas, aligné à gauche */
  .block {{ max-width: 856px; }}
  .rule {{
    width: 64px; height: 3px; background: {GOLD};
    margin-bottom: 40px; opacity: .92;
  }}
  p {{
    text-wrap: pretty;
    text-shadow: 0 2px 28px rgba(0,0,0,.55), 0 1px 3px rgba(0,0,0,.35);
  }}
  p + p {{ margin-top: 30px; }}

  .kicker {{ font-size: 70px; font-weight: 700; line-height: 1.10; letter-spacing: -.025em; }}
  .kicker + p {{ margin-top: 40px; }}
  .lead   {{ font-size: 58px; font-weight: 600; line-height: 1.22; letter-spacing: -.020em; }}
  .lead + p {{ margin-top: 38px; }}
  .body   {{ font-size: 42px; font-weight: 400; line-height: 1.44; letter-spacing: -.005em;
             color: rgba(255,255,255,.94); }}
  .cta    {{ font-size: 48px; font-weight: 600; line-height: 1.30; letter-spacing: -.015em;
             margin-top: 44px; }}
  .hero   {{ font-size: 156px; font-weight: 800; line-height: 1.00; letter-spacing: -.045em;
             color: {GOLD}; margin-top: 14px; margin-bottom: 6px;
             text-shadow: 0 4px 44px rgba(0,0,0,.60); }}

  b  {{ font-weight: 700; color: #fff; }}
  em {{ font-style: normal; font-weight: 600; color: {GOLD}; }}
  .hero + p {{ margin-top: 18px; }}
</style></head>
<body>
  <div class="frame">
    <div class="photo"></div>
    <div class="scrim"></div>
    <div class="content">
      <header>
        <span class="brand">Fynovates</span>
        <span class="count">{story['n']}/{TOTAL}</span>
      </header>
      <div class="block">
        <div class="rule"></div>
{body}
      </div>
    </div>
  </div>
</body></html>
"""


FONT_MIRROR = "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/"
FONT_FILES = ["Inter[opsz,wght].ttf", "Inter-Italic[opsz,wght].ttf"]


def ensure_fonts() -> None:
    """Inter n'est pas versionné (cf. .gitignore) : on le récupère au besoin."""
    TYPO.mkdir(parents=True, exist_ok=True)
    for name in FONT_FILES:
        dest = TYPO / name
        if dest.exists():
            continue
        url = FONT_MIRROR + quote(name)
        print(f"  ↓ {name}")
        with urlopen(url) as r:
            dest.write_bytes(r.read())


def find_chrome() -> str:
    for c in (
        "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
        "/opt/pw-browsers/chromium/chrome-linux/chrome",
    ):
        if Path(c).exists():
            return c
    for c in ("chromium", "chromium-browser", "google-chrome"):
        p = shutil.which(c)
        if p:
            return p
    sys.exit("Chromium introuvable — impossible de rendre les PNG.")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    ensure_fonts()
    chrome = find_chrome()
    work = OUT / ".html"
    work.mkdir(exist_ok=True)

    for story in STORIES:
        src = work / f"story-{story['n']}.html"
        dst = OUT / f"story-{story['n']}.png"
        src.write_text(page(story), encoding="utf-8")
        subprocess.run(
            [
                chrome, "--headless=new", "--disable-gpu", "--no-sandbox",
                "--hide-scrollbars", "--force-device-scale-factor=1",
                "--default-background-color=00000000",
                f"--window-size={W},{H}",
                f"--screenshot={dst}", src.as_uri(),
            ],
            check=True, capture_output=True,
        )
        print(f"  ✓ {dst.relative_to(ROOT.parent)}")

    contact_sheet()


def contact_sheet() -> None:
    """Planche de relecture : les 6 visuels côte à côte."""
    cards = "\n".join(
        f'<figure><img src="story-{s["n"]}.png" alt="Story {s["n"]}">'
        f'<figcaption>{s["n"]}/{TOTAL}</figcaption></figure>'
        for s in STORIES
    )
    (OUT / "planche-contact.html").write_text(
        "<!DOCTYPE html><html lang='fr'><head><meta charset='utf-8'>"
        "<title>Les 3 pays que je déconseille en 2026 — planche contact</title>"
        "<style>body{background:#111;color:#bbb;font:14px/1.5 system-ui;margin:0;"
        "padding:32px}h1{font-size:15px;font-weight:500;letter-spacing:.18em;"
        "text-transform:uppercase;color:#E5C07B;margin:0 0 28px}"
        ".grid{display:flex;gap:20px;overflow-x:auto;padding-bottom:16px}"
        "figure{margin:0;flex:0 0 auto}img{width:300px;display:block;border-radius:6px}"
        "figcaption{margin-top:8px;letter-spacing:.14em;font-size:12px}</style></head>"
        f"<body><h1>Fynovates — Les 3 pays que je déconseille en 2026</h1>"
        f"<div class='grid'>{cards}</div></body></html>",
        encoding="utf-8",
    )
    print(f"  ✓ stories/out/planche-contact.html")


if __name__ == "__main__":
    main()
