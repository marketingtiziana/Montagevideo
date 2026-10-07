# Render an HTML mockup frame by frame (Web Animations clock pinned per frame) to PNGs with alpha, then a ProRes 4444 .mov (alpha).
# usage: python3 tools/render_mockup.py mockups/codex_book OUT_DIR [fps] [seconds] [w] [h]
import sys, os, subprocess
from playwright.sync_api import sync_playwright
src, out = sys.argv[1], sys.argv[2]
fps = int(sys.argv[3]) if len(sys.argv) > 3 else 60
sec = float(sys.argv[4]) if len(sys.argv) > 4 else 6.0
w, h = (int(sys.argv[5]), int(sys.argv[6])) if len(sys.argv) > 6 else (900, 1100)
os.makedirs(f"{out}/frames", exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium", args=["--allow-file-access-from-files"])
    pg = b.new_page(viewport={"width": w, "height": h})
    pg.goto("file://" + os.path.abspath(f"{src}/index.html"))
    pg.evaluate("document.fonts.ready")
    pg.evaluate("document.getAnimations().forEach(a => a.pause())")
    for i in range(int(round(fps * sec))):
        pg.evaluate(f"document.getAnimations().forEach(a => a.currentTime = {i * 1000 / fps})")
        pg.screenshot(path=f"{out}/frames/{i:04d}.png", omit_background=True)
    b.close()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(fps), "-i", f"{out}/frames/%04d.png", "-c:v", "prores_ks", "-profile:v", "4444",
                "-pix_fmt", "yuva444p10le", "-qscale:v", "9", f"{out}/{os.path.basename(src.rstrip('/'))}.mov"], check=True)
print("ok", os.path.getsize(f"{out}/{os.path.basename(src.rstrip('/'))}.mov") // 1024, "KiB")
