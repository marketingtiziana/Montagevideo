#!/usr/bin/env python3
# Rendu Remotion par tranches, RESUMABLE : bundle une fois, puis chunks durables.
# Survit aux redemarrages (saute les chunks deja rendus). Concat -> out/short_draft_silent.mp4
import subprocess, os, json, sys

FPS = 30
tl = json.load(open("data/timeline.json"))
TOTAL = tl["meta"]["total_frames"]
CH = int(sys.argv[1]) if len(sys.argv) > 1 else 520
SCALE = sys.argv[2] if len(sys.argv) > 2 else "1"
OUT = sys.argv[3] if len(sys.argv) > 3 else "out/short_draft_silent.mp4"
BUNDLE = "out/bundle"
CDIR = f"out/_chunks_{SCALE.replace('.', '')}"
os.makedirs(CDIR, exist_ok=True)

def nbframes(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0",
                        "-show_entries", "stream=nb_read_frames", "-of", "default=nw=1:nk=1", p],
                       capture_output=True, text=True)
    try: return int(r.stdout.strip())
    except Exception: return -1

def valid(p, nf):
    return os.path.exists(p) and abs(nbframes(p) - nf) <= 1

# 1) bundle une fois
if not os.path.exists(os.path.join(BUNDLE, "index.html")):
    print("== bundle ==")
    subprocess.run(["npx", "remotion", "bundle", "src/index.ts", "--out-dir", BUNDLE], check=True)
else:
    print("== bundle deja present ==")

# 2) chunks
chunks = []
i = 0; idx = 0
while i < TOTAL:
    a = i; b = min(i + CH - 1, TOTAL - 1)
    chunks.append((f"{CDIR}/c{idx:02d}.mp4", b - a + 1, a, b))
    i = b + 1; idx += 1

for out, nf, a, b in chunks:
    if valid(out, nf):
        print(f"  {out} ok ({nf}f) skip"); continue
    print(f"  render {out} frames {a}-{b} @scale {SCALE}")
    subprocess.run(["npx", "remotion", "render", BUNDLE, "Short", out,
                    f"--frames={a}-{b}", f"--scale={SCALE}", "--log=error"], check=True)

# 3) concat via FILTRE concat -> renumerote proprement, exactement sum(frames) @ 30fps CFR
crf = "16" if SCALE == "1" else "20"
ins = []
for o, _, _, _ in chunks:
    ins += ["-i", o]
n = len(chunks)
filt = "".join(f"[{i}:v]" for i in range(n)) + f"concat=n={n}:v=1[v]"
subprocess.run(["ffmpeg", "-nostdin", "-y", *ins, "-filter_complex", filt, "-map", "[v]",
                "-fps_mode", "cfr", "-r", str(FPS), "-frames:v", str(TOTAL),
                "-c:v", "libx264", "-preset", "veryfast", "-crf", crf, "-pix_fmt", "yuv420p", OUT], check=True)
d = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",OUT],capture_output=True,text=True).stdout.strip()
print(f"OK {OUT} : {d}s ({len(chunks)} chunks)")
