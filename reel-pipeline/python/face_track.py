#!/usr/bin/env python3
"""
Face tracking for the dynamic crop curve.

MediaPipe Face Detection, one pass, one detection per frame. Then:
  - One Euro filter (min_cutoff=0.6, beta=0.02) on cx, cy, width — WITHOUT
    smoothing the frame trembles and the render looks amateur.
  - gap interpolation: face lost < 12 frames -> linear interpolation; beyond
    that -> freeze on last known position and log the interval.
  - clamp: the target box never leaves the source frame.

Output work/<hash>/face_track.json:
  { "version":1, "frames":[ {"f":0,"cx":0.5,"cy":0.4,"scale":0.3,"valid":true}, ... ],
    "frozenIntervals":[ {"from":120,"to":140} ] }

Also writes a debug MP4 that draws the tracked box for visual QA.
"""
import argparse
import json
import math
import sys


class OneEuro:
    """One Euro filter — low jitter at low speed, low lag at high speed."""

    def __init__(self, freq, min_cutoff=0.6, beta=0.02, d_cutoff=1.0):
        self.freq = freq
        self.min_cutoff = min_cutoff
        self.beta = beta
        self.d_cutoff = d_cutoff
        self.x_prev = None
        self.dx_prev = 0.0

    @staticmethod
    def _alpha(cutoff, freq):
        tau = 1.0 / (2 * math.pi * cutoff)
        te = 1.0 / freq
        return 1.0 / (1.0 + tau / te)

    def __call__(self, x):
        if self.x_prev is None:
            self.x_prev = x
            return x
        dx = (x - self.x_prev) * self.freq
        a_d = self._alpha(self.d_cutoff, self.freq)
        dx_hat = a_d * dx + (1 - a_d) * self.dx_prev
        cutoff = self.min_cutoff + self.beta * abs(dx_hat)
        a = self._alpha(cutoff, self.freq)
        x_hat = a * x + (1 - a) * self.x_prev
        self.x_prev = x_hat
        self.dx_prev = dx_hat
        return x_hat


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--debug", default=None)
    ap.add_argument("--min-cutoff", type=float, default=0.6)
    ap.add_argument("--beta", type=float, default=0.02)
    ap.add_argument("--max-gap", type=int, default=12)
    args = ap.parse_args()

    try:
        import cv2  # type: ignore
        import mediapipe as mp  # type: ignore
    except ImportError:
        print(
            "opencv-python / mediapipe not installed. Run scripts/setup.sh first.",
            file=sys.stderr,
        )
        return 2

    cap = cv2.VideoCapture(args.video)
    if not cap.isOpened():
        print(f"cannot open {args.video}", file=sys.stderr)
        return 1
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)

    detector = mp.solutions.face_detection.FaceDetection(
        model_selection=1, min_detection_confidence=0.5
    )

    raw = []  # (cx, cy, w, score) or None per frame
    frames = []  # keep frames only if debug requested
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        h, w = frame.shape[:2]
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        res = detector.process(rgb)
        if res.detections:
            det = max(res.detections, key=lambda d: d.score[0])
            box = det.location_data.relative_bounding_box
            cx = box.xmin + box.width / 2
            cy = box.ymin + box.height / 2
            raw.append((cx, cy, box.width, float(det.score[0])))
        else:
            raw.append(None)
        if args.debug:
            frames.append(frame)

    cap.release()
    total = len(raw)
    if total == 0:
        print("no frames read", file=sys.stderr)
        return 1

    # Gap handling: interpolate short gaps, freeze long ones.
    frozen = []
    valid_idx = [i for i, r in enumerate(raw) if r is not None]
    filled = [None] * total
    for i in range(total):
        filled[i] = raw[i]

    def prev_valid(i):
        for j in range(i - 1, -1, -1):
            if raw[j] is not None:
                return j
        return None

    def next_valid(i):
        for j in range(i + 1, total):
            if raw[j] is not None:
                return j
        return None

    i = 0
    while i < total:
        if raw[i] is not None:
            i += 1
            continue
        p = prev_valid(i)
        q = next_valid(i)
        # find run length of this gap
        start = i
        while i < total and raw[i] is None:
            i += 1
        end = i - 1
        gap_len = end - start + 1
        if p is not None and q is not None and gap_len <= args.max_gap:
            for k in range(start, end + 1):
                t = (k - p) / (q - p)
                filled[k] = tuple(
                    raw[p][d] + (raw[q][d] - raw[p][d]) * t for d in range(4)
                )
        else:
            anchor = raw[p] if p is not None else (raw[q] if q is not None else (0.5, 0.4, 0.3, 0.0))
            for k in range(start, end + 1):
                filled[k] = anchor
            frozen.append({"from": start, "to": end})

    # One Euro smoothing on cx, cy, width.
    f_cx = OneEuro(fps, args.min_cutoff, args.beta)
    f_cy = OneEuro(fps, args.min_cutoff, args.beta)
    f_w = OneEuro(fps, args.min_cutoff, args.beta)

    out_frames = []
    for idx, r in enumerate(filled):
        cx, cy, bw, score = r
        # clamp centre so the crop box stays inside the frame
        cx = min(max(cx, 0.0), 1.0)
        cy = min(max(cy, 0.0), 1.0)
        bw = min(max(bw, 0.05), 1.0)
        scx = min(max(f_cx(cx), 0.0), 1.0)
        scy = min(max(f_cy(cy), 0.0), 1.0)
        sbw = min(max(f_w(bw), 0.05), 1.0)
        out_frames.append(
            {
                "f": idx,
                "cx": round(scx, 4),
                "cy": round(scy, 4),
                "scale": round(sbw, 4),
                "valid": raw[idx] is not None,
            }
        )

    out = {"version": 1, "frames": out_frames, "frozenIntervals": frozen}
    with open(args.out, "w", encoding="utf-8") as fp:
        json.dump(out, fp, indent=2)
    print(f"[face_track.py] wrote {len(out_frames)} frames -> {args.out} ({len(frozen)} frozen gaps)")

    # Debug overlay
    if args.debug and frames:
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        h, w = frames[0].shape[:2]
        vw = cv2.VideoWriter(args.debug, fourcc, fps, (w, h))
        for idx, frame in enumerate(frames):
            fr = out_frames[idx]
            bw = fr["scale"]
            bh = bw * (w / h) * 1.3
            x1 = int((fr["cx"] - bw / 2) * w)
            y1 = int((fr["cy"] - bh / 2) * h)
            x2 = int((fr["cx"] + bw / 2) * w)
            y2 = int((fr["cy"] + bh / 2) * h)
            color = (79, 107, 255) if fr["valid"] else (0, 0, 255)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
            vw.write(frame)
        vw.release()
        print(f"[face_track.py] wrote debug overlay -> {args.debug}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
