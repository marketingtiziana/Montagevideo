# -*- coding: utf-8 -*-
"""Rend reel.html image par image avec Chromium, puis assemble en MP4.

  python3.13 render.py keys     # une frame cle par scene + controle de mise en page
  python3.13 render.py all      # les 1560 frames + encodage H.264

La timeline est pilotee par window.seek(t) : aucune horloge temps reel n'intervient,
chaque frame est donc reproductible a l'identique.
"""
import glob
import os
import subprocess
import sys

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "output")
FRAMES = os.path.join(OUT, "frames")
KEYS = os.path.join(OUT, "keyframes")
W, H, FPS = 1080, 1920, 30
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

# instant ou chaque scene est "posee" : c'est la frame qu'on montre pour validation
KEY_T = {"s1": 3.62, "s2": 7.60, "s3": 15.00, "s4": 21.60,
         "s5": 29.00, "s6": 36.20, "s7": 43.60, "s8": 51.00}

# verifie la lisibilite mobile et l'absence de texte coupe ou hors cadre
CHECK = """(() => {
  const bad = [];
  const st = document.querySelector('#stage').getBoundingClientRect();
  for (const el of document.querySelectorAll('#stage *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (parseFloat(cs.opacity) < 0.05) continue;
    const sc = el.closest('.sc');
    if (sc && !sc.classList.contains('on')) continue;
    const flux = el.closest('.stream');   // flux IA : rogne volontairement
    const txt = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    const r = el.getBoundingClientRect();
    if (txt) {
      const fs = parseFloat(cs.fontSize);
      if (fs < 44) bad.push(['police ' + fs.toFixed(0) + 'px', el.id || el.className, el.textContent.slice(0, 40)]);
      if (flux) continue;
      if (el.scrollWidth > el.clientWidth + 2)
        bad.push(['texte coupe', el.id || el.className, el.textContent.slice(0, 40)]);
      if (r.width > 1 && (r.left < -2 || r.right > st.width + 2))
        bad.push(['hors cadre ' + r.left.toFixed(0) + '..' + r.right.toFixed(0),
                  el.id || el.className, el.textContent.slice(0, 40)]);
      if (r.height > 1 && (r.top < -2 || r.bottom > st.height + 2))
        bad.push(['hors cadre vertical ' + r.top.toFixed(0) + '..' + r.bottom.toFixed(0),
                  el.id || el.className, el.textContent.slice(0, 40)]);
    }
  }
  return bad;
})()"""


def ffmpeg():
    hit = glob.glob("/usr/local/lib/python3.*/dist-packages/imageio_ffmpeg/binaries/ffmpeg-*")
    return hit[0] if hit else "ffmpeg"


def page(p):
    b = p.chromium.launch(executable_path=CHROME, args=["--force-color-profile=srgb",
                                                        "--font-render-hinting=none",
                                                        "--disable-lcd-text"])
    pg = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
    pg.goto("file://" + os.path.join(HERE, "reel.html"))
    pg.wait_for_function("document.fonts.status === 'loaded'")
    pg.wait_for_timeout(250)
    return b, pg


def keys():
    os.makedirs(KEYS, exist_ok=True)
    with sync_playwright() as p:
        b, pg = page(p)
        issues = []
        for sid, t in KEY_T.items():
            pg.evaluate("t => window.seek(t)", t)
            pg.screenshot(path=os.path.join(KEYS, "%s.png" % sid))
            for row in pg.evaluate(CHECK):
                issues.append([sid] + row)
        # on balaie aussi toute la timeline, 4 points par seconde
        for i in range(0, int(52 * 4)):
            pg.evaluate("t => window.seek(t)", i / 4.0)
            for row in pg.evaluate(CHECK):
                issues.append(["t=%.2f" % (i / 4.0)] + row)
        b.close()
    seen, uniq = set(), []
    for it in issues:
        k = (it[1], it[2])
        if k not in seen:
            seen.add(k)
            uniq.append(it)
    print("CONTROLE:", len(uniq), "probleme(s)")
    for it in uniq[:25]:
        print(" -", " | ".join(str(x) for x in it))


def allframes():
    os.makedirs(FRAMES, exist_ok=True)
    for f in glob.glob(os.path.join(FRAMES, "*.png")):
        os.remove(f)
    n = int(52 * FPS)
    with sync_playwright() as p:
        b, pg = page(p)
        for i in range(n):
            pg.evaluate("t => window.seek(t)", i / float(FPS))
            pg.screenshot(path=os.path.join(FRAMES, "f%05d.png" % i))
        b.close()
    mp4 = os.path.join(OUT, "reel-ia-vs-expert.mp4")
    subprocess.run([ffmpeg(), "-y", "-hide_banner", "-loglevel", "error",
                    "-framerate", str(FPS), "-i", os.path.join(FRAMES, "f%05d.png"),
                    "-c:v", "libx264", "-preset", "slow", "-crf", "18",
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4], check=True)
    print(mp4, os.path.getsize(mp4), "octets,", n, "frames")


if __name__ == "__main__":
    {"keys": keys, "all": allframes}[sys.argv[1] if len(sys.argv) > 1 else "keys"]()
