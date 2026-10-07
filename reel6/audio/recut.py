# Re-applies the jump cuts (cuts.json) to the processed voice (deess.wav from voice_chain.py) and loudnorms it -> voice_studio.wav.
# Same code as the last stage of voice_chain.py, without re-running DeepFilterNet / demucs.
import json, os, subprocess, numpy as np, soundfile as sf
H = os.path.dirname(os.path.abspath(__file__)); SR = 48000
d, sr = sf.read(os.path.join(H, "deess.wav")); d = d if d.ndim == 1 else d.mean(1)
keep = json.load(open(os.path.join(H, "..", "cuts.json")))["keep"]
parts, fade = [], int(0.008 * SR)
for s, e in keep:
    seg = d[int(round(s * SR)):int(round(e * SR))].copy(); ramp = np.linspace(0, 1, fade); seg[:fade] *= ramp; seg[-fade:] *= ramp[::-1]; parts.append(seg)
sf.write(os.path.join(H, "deess_cut.wav"), np.concatenate(parts), SR, subtype="PCM_24")
p = lambda n: os.path.join(H, n)
o = subprocess.run(["ffmpeg", "-hide_banner", "-i", p("deess_cut.wav"), "-af", "loudnorm=I=-14:TP=-1:LRA=7:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(o[o.rindex("{"):o.rindex("}") + 1])
ln = (f"loudnorm=I=-14:TP=-1:LRA=7:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", p("deess_cut.wav"), "-af", f"{ln},aresample=48000,aformat=channel_layouts=stereo", "-c:a", "pcm_s24le", p("voice_studio.wav")], check=True)
print("voice_studio.wav", sum(e - s for s, e in keep))
