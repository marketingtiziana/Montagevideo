#!/usr/bin/env python3
# Construit public/base_cut.mp4 (video montee, 1080x1920 30fps) et data/voice_cut.wav
# a partir de source/reel5.mp4, entierement pilote par data/edit.json.
# Source deja 9:16 -> aucun reframe. Camera moves appliques cote Remotion.
# Unique cross-dissolve 8f gere ici (xfade). AUCUN timecode en dur cote TSX.
import json, subprocess, os, sys

FPS = 30
DISS = 8 / FPS  # 0.2667 s
edit = json.load(open("data/edit.json"))
segs = edit["segments"]
SRC = "source/reel5.mp4"
os.makedirs("public", exist_ok=True)

# index du cross-dissolve
diss_idx = next((i for i, s in enumerate(segs) if s["transition_in"] == "cross_dissolve_8f"), None)

def durs():
    return [s["src_out"] - s["src_in"] for s in segs]

def build_video():
    parts = []
    for i, s in enumerate(segs):
        parts.append(
            f"[0:v]trim={s['src_in']:.3f}:{s['src_out']:.3f},setpts=PTS-STARTPTS,"
            f"fps={FPS},scale=1080:1920:force_original_aspect_ratio=increase,"
            f"crop=1080:1920,setsar=1[v{i}]"
        )
    # concat partie A (avant dissolve) et B (a partir du dissolve)
    a = list(range(0, diss_idx))
    b = list(range(diss_idx, len(segs)))
    concatA = "".join(f"[v{i}]" for i in a) + f"concat=n={len(a)}:v=1:a=0[va]"
    concatB = "".join(f"[v{i}]" for i in b) + f"concat=n={len(b)}:v=1:a=0[vb]"
    durA = sum(durs()[i] for i in a)
    off = durA - DISS
    xf = f"[va][vb]xfade=transition=fade:duration={DISS:.3f}:offset={off:.3f}[vout]"
    fc = ";".join(parts + [concatA, concatB, xf])
    cmd = ["ffmpeg", "-nostdin", "-y", "-i", SRC, "-filter_complex", fc,
           "-map", "[vout]", "-r", str(FPS), "-c:v", "libx264", "-preset", "medium",
           "-crf", "18", "-pix_fmt", "yuv420p", "-an", "public/base_cut.mp4"]
    print("build video base_cut ..."); subprocess.run(cmd, check=True)

def build_voice():
    parts = []
    for i, s in enumerate(segs):
        parts.append(
            f"[0:a]atrim={s['src_in']:.3f}:{s['src_out']:.3f},asetpts=PTS-STARTPTS[a{i}]"
        )
    # acrossfade au point de dissolve (meme overlap 8f), hard concat ailleurs
    chain = ""
    labels = [f"a{i}" for i in range(len(segs))]
    # build progressively
    cur = labels[0]
    steps = []
    for i in range(1, len(segs)):
        nxt = labels[i]
        out = f"ac{i}"
        if i == diss_idx:
            steps.append(f"[{cur}][{nxt}]acrossfade=d={DISS:.3f}:c1=tri:c2=tri[{out}]")
        else:
            steps.append(f"[{cur}][{nxt}]concat=n=2:v=0:a=1[{out}]")
        cur = out
    fc = ";".join(parts + steps)
    cmd = ["ffmpeg", "-nostdin", "-y", "-i", SRC, "-filter_complex", fc,
           "-map", f"[{cur}]", "-ar", "48000", "-ac", "2", "data/voice_cut.wav"]
    print("build voice_cut ..."); subprocess.run(cmd, check=True)

if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "all"
    if what in ("all", "video"): build_video()
    if what in ("all", "voice"): build_voice()
    # rapport
    import subprocess as sp
    for f in ["public/base_cut.mp4", "data/voice_cut.wav"]:
        if os.path.exists(f):
            d = sp.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",f],
                       capture_output=True,text=True).stdout.strip()
            print(f"  {f}: {d}s")
