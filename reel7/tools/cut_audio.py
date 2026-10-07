# Assemble the voice along cuts.json keep spans with 25 ms equal-power crossfades (never longer) -> out wav.
# Length is preserved exactly (= sum of the kept spans, same as the picture): the outgoing side is extended
# by 25 ms past its out point (still inside the >= 60 ms silence margin) and overlapped with the incoming side.
# usage: python3 tools/cut_audio.py in.wav out.wav
import sys, json, numpy as np, soundfile as sf
x, sr = sf.read(sys.argv[1], always_2d=True); keep = json.load(open("cuts.json"))["keep"]
XF = int(round(0.025 * sr)); fade = np.linspace(0, np.pi / 2, XF)[:, None]
parts = []
for k, (a, b) in enumerate(keep):
    i0, i1 = int(round(a * sr)), int(round(b * sr))
    seg = x[i0:i1].copy()
    if k > 0:
        pb = int(round(keep[k - 1][1] * sr)); tail = x[pb:pb + XF]
        seg[:XF] = seg[:XF] * np.sin(fade) + tail * np.cos(fade)
    parts.append(seg)
out = np.concatenate(parts)
sf.write(sys.argv[2], out, sr, subtype="PCM_24" if sr >= 44100 else "PCM_16")
print(sys.argv[2], round(len(out) / sr, 3), "s (spans", round(sum(b - a for a, b in keep), 3), "s)")
