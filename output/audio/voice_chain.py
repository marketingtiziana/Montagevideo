# Module B / Étape A — voix studio.
# raw.wav (source, 48 kHz mono) -> [demucs si bleed] -> DeepFilterNet3 -> Pedalboard -> de-esser
# -> jump cuts (cuts.json) -> loudnorm 2 passes -> voice_studio.wav (+ ab_compare.wav, report.json)
import json, subprocess, sys, re, os
import numpy as np, soundfile as sf, pyloudnorm as pyln
from pedalboard import (Pedalboard, HighpassFilter, NoiseGate, PeakFilter, HighShelfFilter,
                        Compressor, Limiter)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE)
SRC = sys.argv[1]
ATTEN = sys.argv[2] if len(sys.argv) > 2 else None      # DeepFilterNet attenuation limit (dB), None = full
SR = 48000
NOISE_WIN = (0.05, 0.85)                                  # longest silence in the source (0–0.91 s)
AB_WIN = (8.94, 13.94)                                    # 5 s of speech: « Honnêtement, vous pouvez… »
p = lambda *a: os.path.join(OUT, *a)
run = lambda cmd: subprocess.run(cmd, check=True, capture_output=True, text=True)

def lufs(x):  return pyln.Meter(SR).integrated_loudness(x)
def floor_db(x, win=NOISE_WIN):
    seg = x[int(win[0] * SR):int(win[1] * SR)]
    return 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-12)
def true_peak(path):
    o = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    return float(re.findall(r"Peak:\s+(-?[\d.]+|-inf) dBFS", o)[-1])
def mono(path):
    x, sr = sf.read(path, always_2d=True)
    if sr != SR:                                          # demucs writes 44.1 kHz: resample in place to 48 kHz
        run(["ffmpeg", "-y", "-v", "error", "-i", path, "-ar", str(SR), "-c:a", "pcm_s24le", path + ".48k.wav"])
        os.replace(path + ".48k.wav", path)
        x, sr = sf.read(path, always_2d=True)
    return x.mean(axis=1)

# A1 — extraction 24 bits
run(["ffmpeg", "-y", "-v", "error", "-i", SRC, "-vn", "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s24le", p("raw.wav")])
raw = mono(p("raw.wav"))

# A2 — mesure AVANT + détection de bleed/musique (demucs two-stems)
run([sys.executable, "-m", "demucs", "--two-stems=vocals", "-n", "htdemucs", "-o", p("demucs"), p("raw.wav")])
voc = mono(p("demucs", "htdemucs", "raw", "vocals.wav"))
acc = mono(p("demucs", "htdemucs", "raw", "no_vocals.wav"))
bleed_db = 20 * np.log10(np.sqrt(np.mean(acc ** 2)) / np.sqrt(np.mean(voc ** 2)))
use_demucs = bleed_db > -20                              # accompagnement à moins de 20 dB sous la voix
before = {"lufs": lufs(raw), "noise_floor_dbfs": floor_db(raw), "true_peak_dbtp": true_peak(p("raw.wav")),
          "bleed_vs_voice_db": bleed_db, "demucs_used": bool(use_demucs),
          "noise_floor_at_-14LUFS": floor_db(raw) + (-14 - lufs(raw))}   # même niveau de voix que l'APRÈS

# A3 — nettoyage IA (DeepFilterNet3 : débruitage + déréverbération)
df_in = p("demucs", "htdemucs", "raw", "vocals.wav") if use_demucs else p("raw.wav")
os.makedirs(p("df"), exist_ok=True)
cmd = ["deepFilter", df_in, "-o", p("df")] + (["--atten-lim", ATTEN] if ATTEN else [])
run(cmd)
dfo = [f for f in os.listdir(p("df")) if f.endswith(".wav")][0]
x = mono(p("df", dfo)).astype(np.float32)

# A4 — chaîne Pedalboard
board = Pedalboard([
    HighpassFilter(cutoff_frequency_hz=80),
    NoiseGate(threshold_db=-45, ratio=4, attack_ms=1, release_ms=100),
    PeakFilter(cutoff_frequency_hz=300, gain_db=-2.5, q=1.2),      # boomy
    PeakFilter(cutoff_frequency_hz=3500, gain_db=2.5, q=1.0),      # présence
    HighShelfFilter(cutoff_frequency_hz=10000, gain_db=1.5),       # air
    Compressor(threshold_db=-18, ratio=3, attack_ms=5, release_ms=80),
    Compressor(threshold_db=-10, ratio=2, attack_ms=15, release_ms=150),   # glue
    Limiter(threshold_db=-1),
])
# The chain expects speech around -20 dBFS; bring the cleaned voice there first so thresholds bite.
x = x * 10 ** ((-20 - lufs(x)) / 20)
y = board(x.reshape(1, -1), SR)[0]
sf.write(p("chain.wav"), y, SR, subtype="PCM_24")

# A5 — de-esser
run(["ffmpeg", "-y", "-v", "error", "-i", p("chain.wav"), "-af", "deesser=i=0.4:m=0.5:f=0.5", "-c:a", "pcm_s24le", p("deess.wav")])

# Jump cuts (même liste que la vidéo, à l'échantillon près) avec micro-fondus de 8 ms
keep = json.load(open(os.path.join(HERE, "..", "cuts.json")))["keep"]
d = mono(p("deess.wav"))
parts, fade = [], int(0.008 * SR)
for s, e in keep:
    seg = d[int(round(s * SR)):int(round(e * SR))].copy()
    ramp = np.linspace(0, 1, fade); seg[:fade] *= ramp; seg[-fade:] *= ramp[::-1]
    parts.append(seg)
cut = np.concatenate(parts)
sf.write(p("deess_cut.wav"), cut, SR, subtype="PCM_24")

# A6 — loudnorm 2 passes -> voice_studio.wav (stéréo 48 kHz pour la vidéo)
o = subprocess.run(["ffmpeg", "-hide_banner", "-i", p("deess_cut.wav"), "-af", "loudnorm=I=-14:TP=-1:LRA=7:print_format=json",
                    "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(o[o.rindex("{"):o.rindex("}") + 1])
ln = (f"loudnorm=I=-14:TP=-1:LRA=7:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
run(["ffmpeg", "-y", "-v", "error", "-i", p("deess_cut.wav"), "-af", f"{ln},aresample=48000,aformat=channel_layouts=stereo",
     "-c:a", "pcm_s24le", p("voice_studio.wav")])
# A7 — pas de musique fournie : mix.wav = voice_studio.wav

# Mesure APRÈS. Le bruit de fond se mesure sur la même fenêtre silencieuse, sur la chaîne complète non coupée.
full = mono(p("deess.wav")) * 10 ** ((-14 - lufs(mono(p("deess.wav")))) / 20)
vs = mono(p("voice_studio.wav"))
def lufs_file(path):                                     # EBU R128 as the platforms measure it (stereo sum)
    o = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1])
def bands(x):                                            # "telephone" check: share of energy per band on the A/B window
    seg = x[int(AB_WIN[0] * SR):int(AB_WIN[1] * SR)]
    S = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))) ** 2; f = np.fft.rfftfreq(len(seg), 1 / SR)
    tot = S[(f >= 60) & (f < 16000)].sum()
    return {k: round(10 * np.log10(S[(f >= lo) & (f < hi)].sum() / tot), 1)
            for k, (lo, hi) in {"low_60_250": (60, 250), "mid_250_2k": (250, 2000), "pres_2k_6k": (2000, 6000), "air_6k_16k": (6000, 16000)}.items()}
after = {"lufs": lufs_file(p("voice_studio.wav")), "noise_floor_dbfs": floor_db(full), "true_peak_dbtp": true_peak(p("voice_studio.wav"))}
before["bands_db"], after["bands_db"] = bands(raw), bands(full)

# A8 — ab_compare.wav : 5 s avant (brut, remis au même niveau) / 0,5 s de silence / 5 s après
a, b = int(AB_WIN[0] * SR), int(AB_WIN[1] * SR)
rb = raw[a:b] * 10 ** ((-14 - lufs(raw)) / 20)
ab = np.concatenate([rb, np.zeros(SR // 2), full[a:b]])
sf.write(p("ab_compare.wav"), np.clip(ab, -1, 1), SR, subtype="PCM_24")

json.dump({"before": before, "after": after, "deepfilter_atten_lim": ATTEN}, open(p("report.json"), "w"), indent=1, default=float)
print(json.dumps({"before": before, "after": after}, indent=1, default=float))
