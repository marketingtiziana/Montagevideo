# SVG -> PNG (transparent) via Chromium. usage: svg2png.py in.svg out.png W H [fill]
import sys, os
from playwright.sync_api import sync_playwright
src, out, w, h = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
fill = sys.argv[5] if len(sys.argv) > 5 else None
svg = open(src).read()
if fill: svg = svg.replace("<path ", f'<path fill="{fill}" ', 1)
html = f"<html><body style='margin:0;background:transparent'><div style='width:{w}px;height:{h}px'>{svg}</div><style>svg{{width:100%;height:100%;display:block}}</style></body></html>"
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium"); pg = b.new_page(viewport={"width": w, "height": h})
    pg.set_content(html); pg.screenshot(path=out, omit_background=True); b.close()
print(out)
