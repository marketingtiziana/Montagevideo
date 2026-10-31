# -*- coding: utf-8 -*-
"""Word-level French transcription (faster-whisper) + silence list, to build the EDL.
    python3 transcribe.py /path/source.mp4   -> words.json, transcript.txt, silences.txt (in MV_WORK)"""
import sys, os, json, re, subprocess, wave
import numpy as np
from faster_whisper import WhisperModel
from config import WORK

src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(WORK, 'source.mp4')
wav = os.path.join(WORK, 'audio16.wav')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-vn', '-ac', '1', '-ar', '16000', wav], check=True)

wf = wave.open(wav, 'rb')
audio = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
model = WhisperModel(os.environ.get('MV_WHISPER', 'medium'), device='cpu', compute_type='int8')
segs, _ = model.transcribe(audio, language='fr', word_timestamps=True, beam_size=5, condition_on_previous_text=True)

words, lines = [], []
for s in segs:
    lines.append(f"[{s.start:7.2f}-{s.end:7.2f}] {s.text.strip()}")
    for w in (s.words or []):
        words.append({'t0': round(w.start, 3), 't1': round(w.end, 3), 'w': w.word, 'p': round(w.probability, 3)})
json.dump(words, open(os.path.join(WORK, 'words.json'), 'w'), ensure_ascii=False, indent=0)
open(os.path.join(WORK, 'transcript.txt'), 'w').write("\n".join(lines) + "\n")

sd = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', src, '-af', 'silencedetect=noise=-30dB:d=0.3', '-f', 'null', '-'],
                    capture_output=True, text=True).stderr
sil = list(zip(re.findall(r'silence_start: ([\d.]+)', sd), re.findall(r'silence_end: ([\d.]+)', sd)))
open(os.path.join(WORK, 'silences.txt'), 'w').write("".join(f"{float(a):7.2f} {float(b):7.2f}  {float(b)-float(a):.2f}\n" for a, b in sil))
print("\n".join(lines)); print('WORDS', len(words), '| silences >0.3s:', len(sil))
