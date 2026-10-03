# Rend le mockup checklist en séquence PNG 30 fps (fond transparent) puis ProRes 4444 avec alpha.
# Timings lus dans ../../timeline.json (clé "checklist"), calés sur les mots du transcript.
import json, os, subprocess, glob, shutil
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, "..", "..", "timeline.json")))["checklist"]
T = {"ticks": [round(x - D["at"], 3) for x in D["ticks"]], "dur": round(D["end"] - D["at"], 3)}
N = int(round(T["dur"] * 30))
frames = os.path.join(HERE, "frames"); shutil.rmtree(frames, ignore_errors=True); os.makedirs(frames)
exe = (glob.glob("/opt/pw-browsers/chromium-*/chrome-linux*/chrome") or [None])[0]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=exe)
    pg = b.new_page(viewport={"width": 960, "height": 580}, device_scale_factor=1)
    pg.clock.install()                                           # horloge figée : rien ne bouge hors renderAt
    pg.goto("file://" + os.path.join(HERE, "index.html")); pg.wait_for_load_state("networkidle")
    pg.evaluate("document.fonts.ready")
    for f in range(N):
        pg.evaluate("([t, T]) => window.renderAt(t, T)", [f / 30, T])
        pg.clock.run_for(33)
        pg.screenshot(path=os.path.join(frames, f"f_{f:04d}.png"), omit_background=True)
    b.close()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "30", "-i", os.path.join(frames, "f_%04d.png"),
                "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", os.path.join(HERE, "mockup.mov")], check=True)
print("frames", N, "dur", T["dur"], "ticks", T["ticks"])
