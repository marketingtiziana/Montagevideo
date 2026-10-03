# flag-icons 7.2.3 (MIT, https://github.com/lipis/flag-icons) 4x3 SVGs -> PNG at 3x (288x216, for a 96x72 display) via headless Chromium.
import sys, os
from playwright.sync_api import sync_playwright
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
    pg = b.new_page(viewport={"width": 288, "height": 216})
    for c in ("ee", "ae", "us", "sg", "hk"):
        svg = open(f"{src}/{c}.svg").read()
        svg = svg.replace("<svg", '<svg width="288" height="216" preserveAspectRatio="none"', 1)
        pg.set_content("<html><body style='margin:0;background:transparent'>" + svg + "</body></html>")
        pg.screenshot(path=f"{out}/{c}.png", omit_background=True)
    b.close()
print("ok")
