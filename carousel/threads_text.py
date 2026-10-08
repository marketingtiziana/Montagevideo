#!/usr/bin/env python3
"""Reproduit le rendu texte d'un post Threads (app iPhone) à partir de paragraphes.

Calé sur les screens d'origine (1184 px de large) : police système iOS imitée par
Inter, corps 47 px, interligne 75 px, 23 px entre paragraphes, marge gauche 39 px,
pastille grise « n/N » en fin de dernier paragraphe.

Usage en module :
    from threads_text import render_post
    render_post(["Premier paragraphe.", "Deuxième paragraphe."], "1/10", Path("out.jpg"))
"""
from __future__ import annotations

import html
import os
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

CHROME = os.environ.get("CHROME_BIN", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome")

WIDTH = 1184
FONT_SIZE = 49
LINE_HEIGHT = 75
PARA_GAP = 23
PAD_LEFT = 39
PAD_RIGHT = 20
PAD_TOP = 12
PAD_BOTTOM = 18
FONT_WEIGHT = 600

CSS = f"""
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{ background: #fff; width: {WIDTH}px; }}
body {{
  font-family: 'Inter', 'Noto Color Emoji', sans-serif;
  font-weight: {FONT_WEIGHT};
  font-size: {FONT_SIZE}px;
  line-height: {LINE_HEIGHT}px;
  color: #000;
  letter-spacing: -0.012em;
  padding: {PAD_TOP}px {PAD_RIGHT}px {PAD_BOTTOM}px {PAD_LEFT}px;
  font-feature-settings: 'tnum' 0;
}}
p {{ margin-bottom: {PARA_GAP}px; overflow-wrap: break-word; }}
p:last-child {{ margin-bottom: 0; }}
.pill {{
  display: inline-block; vertical-align: baseline;
  font-weight: 700; font-size: 38px; line-height: 52px; color: #8A8A8A;
  background: #EDEDED; border-radius: 14px; padding: 3px 16px 2px; margin-left: 14px;
  letter-spacing: 0;
}}
"""


def _para_html(text: str) -> str:
    # Un retour à la ligne simple dans le paragraphe = <br>, comme dans Threads.
    return "<br>".join(html.escape(line) for line in text.split("\n"))


def build_html(paragraphs: list[str], counter: str | None) -> str:
    ps = [f"<p>{_para_html(t)}</p>" for t in paragraphs]
    if counter and ps:
        ps[-1] = ps[-1][:-4] + f'<span class="pill">{html.escape(counter)}</span></p>'
    return f"<!doctype html><html lang='fr'><head><meta charset='utf-8'><style>{CSS}</style></head><body>{''.join(ps)}</body></html>"


def render_post(paragraphs: list[str], counter: str | None, dest: Path) -> Path:
    """Rend un post en JPG, recadré à la hauteur du texte (comme un screen)."""
    with tempfile.TemporaryDirectory() as td:
        html_path = Path(td) / "post.html"
        png_path = Path(td) / "post.png"
        html_path.write_text(build_html(paragraphs, counter), encoding="utf-8")
        subprocess.run(
            [
                CHROME, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
                "--force-device-scale-factor=1", f"--window-size={WIDTH},2400",
                f"--screenshot={png_path}", html_path.as_uri(),
            ],
            check=True, capture_output=True,
        )
        im = Image.open(png_path).convert("RGB")
    # Recadre sous la dernière ligne non blanche + marge basse.
    px = im.load()
    last = 0
    for y in range(im.height - 1, -1, -1):
        if any(px[x, y] != (255, 255, 255) for x in range(0, im.width, 4)):
            last = y
            break
    im = im.crop((0, 0, WIDTH, min(im.height, last + PAD_BOTTOM + 1)))
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, quality=95)
    return dest


if __name__ == "__main__":
    # Test : re-saisie du screen 2 pour comparaison visuelle.
    out = Path(__file__).resolve().parent / "out_test" / "screen2_replique.jpg"
    render_post(
        [
            "La résidence fiscale se joue par année civile.",
            "Partir au 1er janvier = une année pleine sous ton nouveau régime.",
            "Une déclaration de départ propre et simple.\n0 année coupée en deux, 0 double déclaration bancale.",
            "Partir en mars ou en juillet ? C'est possible.\nMais c'est plus sale et plus cher.",
        ],
        "2/10",
        out,
    )
    print(out)
