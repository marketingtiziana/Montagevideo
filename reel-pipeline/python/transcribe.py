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


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--lang", default="fr")
    ap.add_argument("--model", default="large-v3")
    ap.add_argument("--device", default="cpu")
    ap.add_argument(
        "--compute-type",
        default="int8",
        help="float16 on GPU, int8 on CPU",
    )
    args = ap.parse_args()

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
