#!/usr/bin/env python3
"""
Word-level transcription with WhisperX (large-v3) + forced alignment.

Emits work/<hash>/transcript.json:
    { "language": "fr",
      "words": [ { "i":0, "text":"Donc", "start":1.240, "end":1.410, "score":0.94 }, ... ] }

We use forced alignment so timestamps are at the WORD level, not the segment
level. Confidence scores are preserved to arbitrate ambiguous cases downstream.
"""
import argparse
import json
import sys


def transcribe_whispercpp(args) -> int:
    """
    Offline backend: whisper.cpp (pywhispercpp) with a local ggml model.
    Used when WhisperX / HuggingFace downloads are unavailable (locked network).
    token_timestamps + max_len=1 + split_on_word gives ~one word per segment.
    """
    import os
    import subprocess
    import tempfile

    from pywhispercpp.model import Model  # type: ignore

    # whisper.cpp's WAV reader wants 16-bit / 16kHz / mono. Our master WAV is
    # 24-bit / 48kHz, so pre-convert with ffmpeg into a temp file.
    ff = os.environ.get("FFMPEG_BIN", "ffmpeg")
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    tmp.close()
    subprocess.run(
        [ff, "-hide_banner", "-nostdin", "-y", "-i", args.audio,
         "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", tmp.name],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    audio_path = tmp.name

    print(f"[transcribe.py] whisper.cpp backend, model={args.ggml} lang={args.lang}")
    m = Model(
        args.ggml,
        print_realtime=False,
        print_progress=False,
        language=args.lang,
        translate=False,
    )
    segs = m.transcribe(
        audio_path,
        token_timestamps=True,
        max_len=1,
        split_on_word=True,
        no_speech_thold=0.6,
    )
    os.unlink(audio_path)
    words = []
    idx = 0
    for s in segs:
        txt = (s.text or "").strip()
        if not txt:
            continue
        words.append(
            {
                "i": idx,
                "text": txt,
                "start": round(s.t0 / 100.0, 3),  # centiseconds -> seconds
                "end": round(s.t1 / 100.0, 3),
                "score": 0.9,  # whisper.cpp does not expose a per-word prob here
            }
        )
        idx += 1

    out = {"version": 1, "language": args.lang, "words": words}
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"[transcribe.py] wrote {len(words)} words -> {args.out}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--lang", default="fr")
    ap.add_argument("--model", default="large-v3")
    ap.add_argument("--device", default="cpu")
    ap.add_argument(
        "--backend",
        default="auto",
        choices=["auto", "whisperx", "whispercpp"],
        help="auto: WhisperX if available, else whisper.cpp",
    )
    ap.add_argument(
        "--ggml",
        default="models/ggml-base.bin",
        help="local ggml model for the whisper.cpp backend",
    )
    ap.add_argument(
        "--compute-type",
        default="int8",
        help="float16 on GPU, int8 on CPU",
    )
    args = ap.parse_args()

    # Backend selection. whisper.cpp is the offline-friendly fallback.
    if args.backend == "whispercpp":
        return transcribe_whispercpp(args)
    if args.backend == "auto":
        try:
            import whisperx  # noqa: F401
        except ImportError:
            print("[transcribe.py] whisperx unavailable, falling back to whisper.cpp")
            return transcribe_whispercpp(args)

    try:
        import whisperx  # type: ignore
    except ImportError:
        print(
            "whisperx not installed. Run scripts/setup.sh first "
            "(pip install whisperx inside the venv).",
            file=sys.stderr,
        )
        return 2

    print(f"[transcribe.py] loading {args.model} on {args.device} ({args.compute_type})")
    model = whisperx.load_model(
        args.model, args.device, compute_type=args.compute_type, language=args.lang
    )

    audio = whisperx.load_audio(args.audio)
    result = model.transcribe(audio, language=args.lang, batch_size=8)

    # Forced alignment -> word-level timestamps.
    print("[transcribe.py] aligning (word-level timestamps)")
    align_model, metadata = whisperx.load_align_model(
        language_code=args.lang, device=args.device
    )
    aligned = whisperx.align(
        result["segments"],
        align_model,
        metadata,
        audio,
        args.device,
        return_char_alignments=False,
    )

    words = []
    idx = 0
    for seg in aligned.get("segments", []):
        for w in seg.get("words", []):
            # WhisperX may omit start/end for non-alignable tokens; skip those.
            if "start" not in w or "end" not in w:
                continue
            words.append(
                {
                    "i": idx,
                    "text": w.get("word", w.get("text", "")).strip(),
                    "start": round(float(w["start"]), 3),
                    "end": round(float(w["end"]), 3),
                    "score": round(float(w.get("score", 0.0)), 3),
                }
            )
            idx += 1

    out = {"version": 1, "language": args.lang, "words": words}
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"[transcribe.py] wrote {len(words)} words -> {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
