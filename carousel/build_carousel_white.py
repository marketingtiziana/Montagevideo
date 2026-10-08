#!/usr/bin/env python3
"""Variante blanche et minimaliste du carrousel (10 slides 1080x1350).

Fond blanc pur, le screen Threads posé tel quel (sans carte ni ombre : il est
déjà blanc, il se fond dans la slide). Autour, seulement : un repère de chapitre
en gris, le compteur, un filet de progression et une flèche. Sur les slides
rétroplanning, une frise texte OCT · NOV · DÉC · 1ER JANV, étape courante en noir.

Usage :  python3 carousel/build_carousel_white.py
Sortie : carousel/out_white/slide_01.png … slide_10.png + planche.jpg + preview.html
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

from build_carousel import (
    H,
    SCREENS,
    SLIDES,
    THREADS_LOGO,
    TIMELINE,
    W,
    card_height_hint,
    contact_sheet,
    img_data_uri,
    render,
)

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "out_white"
HTML = OUT / "html"

CSS = """
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1080px; height: 1350px; overflow: hidden; }
body { font-family: 'Inter', sans-serif; background: #fff; color: #000; position: relative; }

.top { position: absolute; top: 96px; left: 96px; right: 96px; display: flex; align-items: center; justify-content: space-between; }
.kicker { font-family: 'Inter Display'; font-weight: 600; font-size: 22px; letter-spacing: .22em; color: #9A9A9A; }
.counter { font-family: 'Inter Display'; font-weight: 500; font-size: 22px; letter-spacing: .06em; color: #9A9A9A; font-variant-numeric: tabular-nums; }
.counter b { color: #000; font-weight: 600; }

.shot-wrap { position: absolute; left: 96px; right: 96px; top: 190px; display: flex; align-items: center; justify-content: center; }
.shot img { display: block; width: 100%; height: auto; }

.timeline { position: absolute; left: 96px; right: 96px; bottom: 212px; display: flex; justify-content: space-between; }
.tl { font-family: 'Inter Display'; font-weight: 600; font-size: 22px; letter-spacing: .18em; color: #C8C8C8; padding-bottom: 10px; border-bottom: 2px solid transparent; }
.tl.done { color: #9A9A9A; }
.tl.now { color: #000; border-bottom-color: #000; }

.bottom { position: absolute; left: 96px; right: 96px; bottom: 96px; display: flex; align-items: center; justify-content: space-between; }
.progress { position: relative; width: 320px; height: 2px; background: #E6E6E6; }
.progress i { position: absolute; left: 0; top: 0; bottom: 0; background: #000; }
.swipe { font-family: 'Inter Display'; font-weight: 600; font-size: 22px; letter-spacing: .18em; color: #000; display: flex; align-items: center; gap: 16px; }
.swipe .arr { font-size: 30px; font-weight: 400; letter-spacing: 0; }
.cta { font-family: 'Inter Display'; font-weight: 600; font-size: 22px; letter-spacing: .12em; color: #fff; background: #000; padding: 18px 32px; border-radius: 999px; }

.logo { position: absolute; left: 96px; bottom: 212px; display: flex; align-items: center; gap: 12px; font-family: 'Inter Display'; font-weight: 500; font-size: 20px; color: #9A9A9A; }
.logo svg { width: 26px; height: 26px; }
.logo svg path { fill: #9A9A9A; }
"""


def build_html(i: int, kicker: str, step: int | None) -> str:
    n = i + 1
    img = SCREENS / f"{n}.jpg"
    zone_bottom = 290 if step is not None else 220
    avail_h = (H - zone_bottom) - 190
    scale = min(1.0, avail_h / card_height_hint(img, inner_w=888))
    shot_w = int(888 * scale)
    pct = (i + 1) / len(SLIDES) * 100

    timeline = ""
    if step is not None:
        cells = "".join(
            f'<div class="tl {"now" if k == step else "done" if k < step else ""}">{m}</div>'
            for k, m in enumerate(TIMELINE)
        )
        timeline = f'<div class="timeline">{cells}</div>'
    logo = "" if step is not None else f'<div class="logo">{THREADS_LOGO}<span>Threads</span></div>'
    bottom_right = (
        '<div class="cta">COMMENTE « JANVIER »</div>'
        if n == len(SLIDES)
        else '<div class="swipe">SUITE <span class="arr">→</span></div>'
    )
    return f"""<!doctype html><html lang="fr"><head><meta charset="utf-8">
<style>{CSS}</style></head>
<body>
<div class="top">
  <div class="kicker">{kicker}</div>
  <div class="counter"><b>{n:02d}</b> / {len(SLIDES)}</div>
</div>
<div class="shot-wrap" style="bottom:{zone_bottom}px">
  <div class="shot" style="width:{shot_w}px"><img src="{img_data_uri(img)}" alt="screen {n}"></div>
</div>
{logo}
{timeline}
<div class="bottom">
  <div class="progress"><i style="width:{pct:.1f}%"></i></div>
  {bottom_right}
</div>
</body></html>"""


def main() -> None:
    HTML.mkdir(parents=True, exist_ok=True)
    pngs: list[Path] = []
    for i, (kicker, _title, _accent, step) in enumerate(SLIDES):
        html = HTML / f"slide_{i + 1:02d}.html"
        png = OUT / f"slide_{i + 1:02d}.png"
        html.write_text(build_html(i, kicker, step), encoding="utf-8")
        render(html, png)
        pngs.append(png)
        print("ok", png.name)
    contact_sheet(pngs, OUT / "planche.jpg", bg="#EDEDED")
    preview = "".join(
        f'<img src="{p.name}" style="width:360px;margin:8px;border:1px solid #ddd">' for p in pngs
    )
    (OUT / "preview.html").write_text(
        f'<!doctype html><meta charset="utf-8"><body style="background:#f4f4f4;padding:20px">{preview}</body>',
        encoding="utf-8",
    )
    print("ok planche.jpg, preview.html")


if __name__ == "__main__":
    main()
