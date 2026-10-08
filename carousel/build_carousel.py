#!/usr/bin/env python3
"""Génère la propale de carrousel (10 slides 1080x1350) autour des screens Threads.

Les screens (carousel/screens/1.jpg … 10.jpg) sont intégrés tels quels dans une
carte « post Threads » posée sur un fond sombre premium. Chaque slide ajoute :
un chapitre (kicker + titre), un compteur, une barre de progression, et pour les
slides du rétroplanning une frise OCT → NOV → DÉC → 1ER JANV.

Usage :  python3 carousel/build_carousel.py
Sortie : carousel/out/slide_01.png … slide_10.png + planche.png + preview.html
"""
from __future__ import annotations

import base64
import os
import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
SCREENS = ROOT / "screens"
OUT = ROOT / "out"
HTML = OUT / "html"
CHROME = os.environ.get("CHROME_BIN", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome")

W, H = 1080, 1350

# Un chapitre par slide : (kicker, titre, accent, étape de la frise ou None)
SLIDES = [
    ("LE HOOK", "Le bon mois pour partir\nn'est pas celui que tu crois.", "gold", None),
    ("LA RÈGLE", "La résidence fiscale\nse joue au 1er janvier.", "white", None),
    ("LE PIÈGE", "Décider en décembre,\nc'est partir en avril.", "red", None),
    ("RÉTROPLANNING · ÉTAPE 1", "Octobre : l'audit\net la décision.", "green", 0),
    ("RÉTROPLANNING · ÉTAPE 2", "Novembre :\nla construction.", "green", 1),
    ("RÉTROPLANNING · ÉTAPE 3", "Décembre :\nla rupture propre.", "green", 2),
    ("RÉTROPLANNING · ARRIVÉE", "1er janvier :\nannée fiscale pleine.", "green", 3),
    ("LE COÛT", "L'hésitation a un tarif.\nIl est mensuel.", "red", None),
    ("L'URGENCE", "Dans 8 semaines,\nc'est trop tard.", "red", None),
    ("L'OFFRE", "Ton 1er janvier 2027\nse construit maintenant.", "gold", None),
]

ACCENTS = {
    "gold": "#D4AF37",
    "white": "#FFFFFF",
    "red": "#FF5A5F",
    "green": "#3DDC84",
}

TIMELINE = ["OCT", "NOV", "DÉC", "1ER JANV"]

THREADS_LOGO = (
    '<svg viewBox="0 0 192 192" width="34" height="34" fill="#000">'
    '<path d="M141.5 88.9c-.8-.4-1.5-.7-2.3-1.1-1.4-25.2-15.1-39.7-38.3-39.8h-.3c-13.9 0-25.4 5.9-32.5 16.7l12.7 8.7c5.3-8 13.6-9.7 19.8-9.7h.2c7.7 0 13.4 2.3 17.2 6.7 2.7 3.2 4.5 7.7 5.4 13.3-6.8-1.2-14.1-1.5-21.9-1.1-22 1.3-36.2 14.1-35.3 32 .5 9.1 5 16.9 12.7 22 6.5 4.3 14.9 6.4 23.6 5.9 11.5-.6 20.6-5 26.9-13.1 4.8-6.1 7.8-14 9.1-23.9 5.5 3.3 9.6 7.7 11.8 13 3.8 9 4.1 23.7-7.9 35.7-10.5 10.5-23.1 15-42.2 15.2-21.2-.2-37.2-6.9-47.6-20.2-9.8-12.4-14.8-30.3-15-53.2.2-22.9 5.2-40.8 15-53.2 10.4-13.2 26.4-20 47.6-20.2 21.3.2 37.6 7 48.4 20.3 5.3 6.5 9.3 14.7 11.9 24.3l14.9-4c-3.2-11.8-8.3-22-15.3-30.5C159.5 11.5 139.2 2.3 115.5 2H115.4C91.7 2.2 73.5 10.2 61.3 25.7 50.5 39.5 44.9 58.7 44.7 82.7v.1c.2 24 5.8 43.2 16.6 57 12.2 15.5 30.5 23.5 54.1 23.7h.1c21 -.1 35.8 -5.6 48 -17.8 15.7 -15.7 15.3 -35.4 10.1 -47.4 -3.7 -8.7 -10.8 -15.7 -20.5 -20.4zm-35.6 33.6c-9.6.5-19.6-3.8-20.1-13.1-.4-6.9 4.9-14.6 20.8-15.5 1.8-.1 3.6-.2 5.3-.2 5.7 0 11 .6 15.9 1.6-1.8 22.6-12.4 26.6-21.9 27.2z"/>'
    "</svg>"
)

CSS = """
@font-face { font-family: 'InterD'; src: local('Inter Display'); }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1080px; height: 1350px; overflow: hidden; }
body {
  font-family: 'Inter', 'Inter Display', sans-serif;
  color: #fff;
  background:
    radial-gradient(1100px 700px at 50% -10%, rgba(212,175,55,0.22), transparent 60%),
    radial-gradient(900px 600px at 50% 110%, rgba(212,175,55,0.10), transparent 60%),
    linear-gradient(180deg, #0C0F17 0%, #0A0C12 100%);
  position: relative;
}
.grain {
  position: absolute; inset: 0; pointer-events: none; opacity: .18;
  background-image: radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px);
  background-size: 6px 6px;
}
.frame {
  position: absolute; inset: 36px; border: 1px solid rgba(212,175,55,.28); border-radius: 28px;
}
.corner { position: absolute; width: 26px; height: 26px; border-color: #D4AF37; border-style: solid; }
.corner.tl { top: 36px; left: 36px; border-width: 2px 0 0 2px; border-top-left-radius: 28px; }
.corner.tr { top: 36px; right: 36px; border-width: 2px 2px 0 0; border-top-right-radius: 28px; }
.corner.bl { bottom: 36px; left: 36px; border-width: 0 0 2px 2px; border-bottom-left-radius: 28px; }
.corner.br { bottom: 36px; right: 36px; border-width: 0 2px 2px 0; border-bottom-right-radius: 28px; }

.top { position: absolute; top: 74px; left: 84px; right: 84px; display: flex; align-items: center; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 14px; font-family: 'Inter Display'; font-weight: 600; font-size: 24px; letter-spacing: .14em; color: rgba(255,255,255,.72); }
.brand .dot { width: 10px; height: 10px; border-radius: 50%; background: #D4AF37; box-shadow: 0 0 18px #D4AF37; }
.counter { font-family: 'Inter Display'; font-weight: 500; font-size: 26px; letter-spacing: .08em; color: rgba(255,255,255,.55); }
.counter b { color: #D4AF37; font-weight: 700; }

.chapter { position: absolute; top: 150px; left: 84px; right: 84px; }
.kicker { font-family: 'Inter Display'; font-weight: 700; font-size: 22px; letter-spacing: .22em; color: var(--accent); margin-bottom: 18px; display: flex; align-items: center; gap: 14px; }
.kicker:before { content: ''; width: 34px; height: 2px; background: var(--accent); }
.title { font-family: 'Inter Display'; font-weight: 800; font-size: 60px; line-height: 1.06; letter-spacing: -.02em; white-space: pre-line; color: #fff; }

.card-wrap { position: absolute; left: 84px; right: 84px; top: 386px; bottom: 206px; display: flex; align-items: center; justify-content: center; }
.card {
  width: 100%; background: #fff; border-radius: 30px; overflow: hidden;
  box-shadow: 0 40px 90px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.06), 0 0 60px rgba(212,175,55,.10);
}
.card-head { display: flex; align-items: center; justify-content: space-between; padding: 26px 34px 10px; }
.card-head .left { display: flex; align-items: center; gap: 14px; color: #000; font-weight: 700; font-size: 24px; }
.card-head .meta { color: #999; font-weight: 500; font-size: 22px; }
.card img { display: block; width: 100%; height: auto; }
.card-foot { display: flex; gap: 30px; padding: 14px 34px 24px; color: #000; }
.card-foot svg { width: 30px; height: 30px; }

.timeline { position: absolute; left: 84px; right: 84px; bottom: 150px; display: flex; gap: 14px; }
.tl { flex: 1; text-align: center; font-family: 'Inter Display'; font-weight: 700; font-size: 22px; letter-spacing: .14em; padding: 16px 0; border-radius: 14px; border: 1px solid rgba(255,255,255,.14); color: rgba(255,255,255,.38); }
.tl.done { color: rgba(61,220,132,.75); border-color: rgba(61,220,132,.35); }
.tl.now { color: #0A0C12; background: #3DDC84; border-color: #3DDC84; box-shadow: 0 0 30px rgba(61,220,132,.45); }

.bottom { position: absolute; left: 84px; right: 84px; bottom: 76px; display: flex; align-items: center; justify-content: space-between; }
.progress { display: flex; gap: 8px; }
.progress i { display: block; width: 34px; height: 5px; border-radius: 3px; background: rgba(255,255,255,.16); }
.progress i.on { background: #D4AF37; }
.progress i.now { background: #fff; }
.swipe { font-family: 'Inter Display'; font-weight: 600; font-size: 24px; letter-spacing: .12em; color: rgba(255,255,255,.72); display: flex; align-items: center; gap: 14px; }
.swipe .arr { width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid #D4AF37; display: flex; align-items: center; justify-content: center; color: #D4AF37; font-size: 24px; }
.cta { font-family: 'Inter Display'; font-weight: 800; font-size: 26px; letter-spacing: .06em; color: #0A0C12; background: #D4AF37; padding: 16px 30px; border-radius: 999px; box-shadow: 0 0 40px rgba(212,175,55,.45); }

.bigword { position: absolute; left: 0; right: 0; top: 330px; text-align: center; font-family: 'Inter Display'; font-weight: 900; font-size: 196px; letter-spacing: -.03em; color: rgba(212,175,55,.045); line-height: 1; pointer-events: none; }
.card-wrap { z-index: 2; }
"""

ICONS = (
    '<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>'
    '<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-4.5A8 8 0 1 1 21 12z"/></svg>'
    '<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>'
    '<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>'
)


def img_data_uri(path: Path) -> str:
    return "data:image/jpeg;base64," + base64.b64encode(path.read_bytes()).decode()


def card_height_hint(img: Path, inner_w: int = 912) -> int:
    w, h = Image.open(img).size
    return int(h * inner_w / w)


def build_html(i: int, kicker: str, title: str, accent: str, step: int | None) -> str:
    n = i + 1
    img = SCREENS / f"{n}.jpg"
    # La carte doit tenir dans la zone centrale : on réduit sa largeur si l'image est haute.
    zone_bottom = 300 if step is not None else 230  # la frise prend de la place sous la carte
    avail_h = (H - zone_bottom) - 386 - 110  # moins l'en-tête/pied de carte
    scale = min(1.0, avail_h / card_height_hint(img))
    card_w = int(912 * scale)

    progress = "".join(
        f'<i class="{"now" if k == i else "on" if k < i else ""}"></i>' for k in range(len(SLIDES))
    )
    timeline = ""
    if step is not None:
        cells = "".join(
            f'<div class="tl {"now" if k == step else "done" if k < step else ""}">{m}</div>'
            for k, m in enumerate(TIMELINE)
        )
        timeline = f'<div class="timeline">{cells}</div>'
    bigword = ""
    if n == 1:
        bigword = '<div class="bigword">OCTOBRE</div>'
    if n == 10:
        bigword = '<div class="bigword">JANVIER</div>'
    bottom_right = (
        '<div class="cta">COMMENTE « JANVIER »</div>'
        if n == len(SLIDES)
        else '<div class="swipe">SWIPE <span class="arr">→</span></div>'
    )
    return f"""<!doctype html><html lang="fr"><head><meta charset="utf-8">
<style>{CSS}</style></head>
<body style="--accent:{ACCENTS[accent]}">
<div class="grain"></div>
<div class="frame"></div>
<div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
{bigword}
<div class="top">
  <div class="brand"><span class="dot"></span>FISCALITÉ · EXPATRIATION</div>
  <div class="counter"><b>{n:02d}</b> / {len(SLIDES)}</div>
</div>
<div class="chapter">
  <div class="kicker">{kicker}</div>
  <div class="title">{title}</div>
</div>
<div class="card-wrap" style="bottom:{zone_bottom}px">
  <div class="card" style="width:{card_w}px">
    <div class="card-head">
      <div class="left">{THREADS_LOGO}<span>Threads</span></div>
      <div class="meta">{n}/{len(SLIDES)}</div>
    </div>
    <img src="{img_data_uri(img)}" alt="screen {n}">
    <div class="card-foot">{ICONS}</div>
  </div>
</div>
{timeline}
<div class="bottom">
  <div class="progress">{progress}</div>
  {bottom_right}
</div>
</body></html>"""


def render(html_path: Path, png_path: Path) -> None:
    subprocess.run(
        [
            CHROME,
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu",
            "--hide-scrollbars",
            "--force-device-scale-factor=1",
            f"--window-size={W},{H + 300}",  # la fenêtre inclut ~80px de chrome : on recadre ensuite
            f"--screenshot={png_path}",
            html_path.as_uri(),
        ],
        check=True,
        capture_output=True,
    )
    Image.open(png_path).crop((0, 0, W, H)).save(png_path)


def contact_sheet(pngs: list[Path], dest: Path) -> None:
    cols, pad = 5, 30
    tw, th = 400, 500
    rows = (len(pngs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tw + (cols + 1) * pad, rows * th + (rows + 1) * pad), "#1A1D26")
    for k, p in enumerate(pngs):
        im = Image.open(p).resize((tw, th), Image.LANCZOS)
        x = pad + (k % cols) * (tw + pad)
        y = pad + (k // cols) * (th + pad)
        sheet.paste(im, (x, y))
    sheet.save(dest, quality=92)


def main() -> None:
    HTML.mkdir(parents=True, exist_ok=True)
    pngs: list[Path] = []
    for i, (kicker, title, accent, step) in enumerate(SLIDES):
        html = HTML / f"slide_{i + 1:02d}.html"
        png = OUT / f"slide_{i + 1:02d}.png"
        html.write_text(build_html(i, kicker, title, accent, step), encoding="utf-8")
        render(html, png)
        pngs.append(png)
        print("ok", png.name)
    contact_sheet(pngs, OUT / "planche.jpg")
    preview = "".join(
        f'<img src="{p.name}" style="width:360px;margin:8px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.4)">'
        for p in pngs
    )
    (OUT / "preview.html").write_text(
        f'<!doctype html><meta charset="utf-8"><body style="background:#111;padding:20px;font-family:sans-serif">{preview}</body>',
        encoding="utf-8",
    )
    print("ok planche.jpg, preview.html")


if __name__ == "__main__":
    main()
