# Final mix: voice_studio.wav (-14 LUFS, TP -1) + sound design from ../events.json.
# One sound per event (gen_edit.py spaces them >= 120 ms and puts them on word boundaries, never on a syllable).
# Level: in a silence the SFX peak sits 12 dB under the voice reference peak; while she speaks it sits >= 14 dB under the
# LOCAL voice peak (150 ms around the event). Then a final loudnorm so the mix itself is -14 LUFS / TP -1.
import json, os, subprocess, numpy as np, soundfile as sf
H = os.path.dirname(os.path.abspath(__file__)); SR = 48000
v, sr = sf.read(os.path.join(H, "voice_studio.wav"), always_2d=True); assert sr == SR
mono = v.mean(1); ref = np.percentile(np.abs(mono), 99.9)                       # voice reference peak
mix = v.copy(); TRIM = {"tick": -5, "click": -2, "shimmer": -3, "sub": 0, "pop": 0, "whoosh": -1, "impact": 0}
lib = {k: sf.read(os.path.join(H, "sfx", f"{k}.wav"))[0] for k in TRIM}
log = []
for e in json.load(open(os.path.join(H, "..", "events.json"))):
    s = lib[e["k"]] / np.abs(lib[e["k"]]).max()
    i = int(round(e["t"] * SR)); w = mono[max(0, i - int(0.075 * SR)):i + int(0.075 * SR)]
    local = np.abs(w).max() if len(w) else 0
    peak = ref * 10 ** (-12 / 20) if e["quiet"] or local < ref * 10 ** (-30 / 20) else min(ref * 10 ** (-12 / 20), local * 10 ** (-14 / 20))
    s = s * peak * 10 ** (TRIM[e["k"]] / 20)
    j = min(len(mix), i + len(s))
    if i < len(mix): mix[i:j] += s[: j - i, None]
    log.append({**e, "sfx_peak_vs_voice_ref_db": round(20 * np.log10(peak / ref) + TRIM[e["k"]], 1)})
json.dump(log, open(os.path.join(H, "sfx_levels.json"), "w"), indent=0)
sf.write(os.path.join(H, "mix_pre.wav"), mix, SR, subtype="PCM_24")
o = subprocess.run(["ffmpeg", "-hide_banner", "-i", os.path.join(H, "mix_pre.wav"), "-af", "loudnorm=I=-14:TP=-1:LRA=7:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
m = json.loads(o[o.rindex("{"):o.rindex("}") + 1])
ln = (f"loudnorm=I=-14:TP=-1:LRA=7:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", os.path.join(H, "mix_pre.wav"), "-af", f"{ln},aresample=48000", "-c:a", "pcm_s24le", os.path.join(H, "mix.wav")], check=True)
o = subprocess.run(["ffmpeg", "-hide_banner", "-i", os.path.join(H, "mix.wav"), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
print(o[o.rindex("Summary"):].replace("\n", " ")[:300])
