#!/usr/bin/env bash
#
# setup.sh — installs everything the pipeline needs and verifies ffmpeg.
# Python is isolated in a local venv (.venv). No undeclared system deps.
#
set -euo pipefail
cd "$(dirname "$0")/.."

say() { printf '\033[36m[setup]\033[0m %s\n' "$*"; }
die() { printf '\033[31m[setup] %s\033[0m\n' "$*" >&2; exit 1; }

# 1. ffmpeg / ffprobe must be present (used for probe, cut, audio, QA).
say "checking ffmpeg / ffprobe"
if ! command -v ffmpeg  >/dev/null 2>&1; then
  die "ffmpeg not found. Install it (e.g. 'apt-get install ffmpeg' or 'brew install ffmpeg') and re-run."
fi
if ! command -v ffprobe >/dev/null 2>&1; then
  die "ffprobe not found (usually ships with ffmpeg)."
fi
say "ffmpeg: $(ffmpeg -version | head -1)"

# 2. Node deps (CLI, Remotion, Three).
say "installing node dependencies"
if command -v npm >/dev/null 2>&1; then
  npm install
else
  die "npm not found. Install Node 20+ and re-run."
fi

# 3. Python venv (WhisperX + MediaPipe).
say "creating python venv (.venv)"
PY="${PYTHON_BIN:-python3}"
"$PY" -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
python -m pip install --upgrade pip wheel
say "installing python requirements (this can take a while)"
python -m pip install -r python/requirements.txt

# 4. Sanity checks.
say "verifying python imports"
python - <<'PY'
mods = []
for m in ("whisperx", "mediapipe", "cv2"):
    try:
        __import__(m); mods.append(f"{m}: ok")
    except Exception as e:  # noqa
        mods.append(f"{m}: MISSING ({e.__class__.__name__})")
print("\n".join("  " + x for x in mods))
PY

say "done. Set ANTHROPIC_API_KEY for the editorial step, then:"
say "  npm run pipeline -- --input ./raw/your-video.mp4 --dry-run-edl"
