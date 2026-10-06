# Final mix: voice_studio.wav (-14 LUFS, TP -1) + sound design from ../events.json, 12 dB under the voice
# (SFX peaks at -13 dBFS against a -1 dBTP voice; ticks a further 5 dB down). One sound per event (gen_edit.py spaces them >= 120 ms).
# Then a final loudnorm pass so the mix itself sits at -14 LUFS / TP -1.
import json, os, subprocess, numpy as np, soundfile as sf
H = os.path.dirname(os.path.abspath(__file__)); SR = 48000
v, sr = sf.read(os.path.join(H, "voice_studio.wav"), always_2d=True); assert sr == SR
mix = v.copy()
GAIN = {"pop": -13, "click": -15, "whoosh": -14, "tick": -18, "impact": -13}
lib = {k: sf.read(os.path.join(H, "sfx", f"{k}.wav"))[0] for k in GAIN}
for e in json.load(open(os.path.join(H, "..", "events.json"))):
    s = lib[e["k"]] / np.abs(lib[e["k"]]).max() * 10 ** (GAIN[e["k"]] / 20)
    i = int(round(e["t"] * SR)); j = min(len(mix), i + len(s))
    if i < len(mix): mix[i:j] += s[: j - i, None]
sf.write(os.path.join(H, "mix_pre.wav"), mix, SR, subtype="PCM_24")
o = subprocess.run(["ffmpeg", "-hide_banner", "-i", os.path.join(H, "mix_pre.wav"), "-af", "loudnorm=I=-14:TP=-1:LRA=7:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
m = json.loads(o[o.rindex("{"):o.rindex("}") + 1])
ln = (f"loudnorm=I=-14:TP=-1:LRA=7:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", os.path.join(H, "mix_pre.wav"), "-af", f"{ln},aresample=48000", "-c:a", "pcm_s24le", os.path.join(H, "mix.wav")], check=True)
o = subprocess.run(["ffmpeg", "-hide_banner", "-i", os.path.join(H, "mix.wav"), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
print(o[o.rindex("Summary"):].replace("\n", " ")[:400])
