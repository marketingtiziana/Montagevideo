# Cut audit (Phase 5, blocking). Checks per cut of cuts.json:
#  1. voice RMS < -32 dBFS on the 60 ms before the out point and the 60 ms after the in point (raw source voice, 48 kHz)
#  4. no truncated phoneme: re-transcription (large-v3) of +-1.5 s around the joint in the EDITED voice; the last word before and the
#     first word after must match the source transcription, complete.
#  2/3 (head displacement on the rendered 60 fps frames, 0.25x strip) are added by tests_audit_video.py.
import json, re, subprocess, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
C = json.load(open("cuts.json")); keep = C["keep"]
raw, sr = sf.read("audio/raw.wav"); raw = raw if raw.ndim == 1 else raw.mean(1)
ed, sr2 = sf.read("audio/voice_studio.wav"); ed = ed if ed.ndim == 1 else ed.mean(1)
W = [w for s in json.load(open("transcript.json"))["segments"] for w in s["words"]]
norm = lambda s: re.sub(r"[^\wÀ-ÿ%]", "", s.lower())
dbfs = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
m = WhisperModel("large-v3", device="cpu", compute_type="int8")
res = []
for i, c in enumerate(C["cuts"], 1):
    o, n, t = keep[i - 1][1], keep[i][0], c["t_out"]
    r_out = dbfs(raw[int((o - 0.06) * sr):int(o * sr)]); r_in = dbfs(raw[int(n * sr):int((n + 0.06) * sr)])
    # expected words: last source word ending before o, first source word starting after n (whisper starts absorb silence: use ends)
    # expected words: isolated re-transcription of the SOURCE just before the out point and just after the in point
    def iso(a, b):
        sf.write("scratch/iso.wav", raw[int(a * sr):int(b * sr)], sr)
        sg, _ = m.transcribe("scratch/iso.wav", language="fr", word_timestamps=True, beam_size=5, vad_filter=False, condition_on_previous_text=False)
        return [w.word.strip() for s in sg for w in s.words]
    before = iso(o - 1.5, o)[-1]; after = iso(n, n + 1.5)[0]
    seg = ed[int(max(0, t - 1.5) * sr2):int(min(len(ed) / sr2, t + 1.5) * sr2)]
    sf.write("scratch/aud.wav", seg, sr2)
    segs, _ = m.transcribe("scratch/aud.wav", language="fr", word_timestamps=True, beam_size=5, vad_filter=False, condition_on_previous_text=False)
    heard = [(w.word.strip(), w.start + max(0, t - 1.5), w.end + max(0, t - 1.5)) for s in segs for w in s.words]
    hb = [h for h in heard if h[2] <= t + 0.03]; ha = [h for h in heard if h[2] > t + 0.03]
    ok_b = bool(hb) and norm(hb[-1][0]) == norm(before); ok_a = bool(ha) and norm(ha[0][0]) == norm(after)
    res.append({"cut": i, "t_out": t, "level": c["level"], "rms_before_dbfs": round(r_out, 1), "rms_after_dbfs": round(r_in, 1),
                "silence_ok": bool(r_out < -32 and r_in < -32), "word_before": before, "heard_before": hb[-1][0] if hb else None,
                "word_after": after, "heard_after": ha[0][0] if ha else None, "words_ok": bool(ok_b and ok_a),
                "heard": " ".join(h[0] for h in heard)})
    print(res[-1])
json.dump(res, open("tests/audit_audio.json", "w"), ensure_ascii=False, indent=1)
