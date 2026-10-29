# -*- coding: utf-8 -*-
"""Edit Decision List: intervals REMOVED from the source (silences, dead air, retake),
the resulting KEEP segments, the punch-in plan and the source->final time mapping."""

SRC_END = 92.10   # last word ends at 91.74 s; keep a short tail

# (start, end) in SOURCE seconds. Derived from silencedetect (-30 dB, >0.42 s): each
# pause is shortened to ~0.3 s. Two manual cuts: the first (weaker) take of
# "Projetez-vous" (60.9-62.0) and the 3.3 s dead air + noise after "Pendant ce temps".
CUTS = [
    (5.95, 6.28), (12.46, 12.69), (13.82, 15.13), (20.04, 20.26), (25.81, 26.32),
    (26.80, 27.08), (30.79, 30.94), (34.75, 36.05), (37.15, 37.45), (40.65, 41.33),
    (42.64, 42.98), (51.36, 52.72), (59.41, 62.08), (63.02, 63.27), (70.45, 73.62),
    (77.09, 77.28), (80.09, 80.43), (82.20, 82.51),
]

def keep_segments():
    keep, t = [], 0.0
    for s, e in sorted(CUTS):
        if s > t:
            keep.append((round(t, 3), round(s, 3)))
        t = max(t, e)
    if t < SRC_END:
        keep.append((round(t, 3), SRC_END))
    return keep

KEEP = keep_segments()

# Punch-in plan: alternate framing at every cut so jump cuts read as deliberate
# camera changes. (zoom_start, zoom_end) per segment; slow push within each segment.
_LEVELS = [1.00, 1.08, 1.035, 1.10, 1.00, 1.065, 1.025, 1.09]
def zoom_plan():
    plan = []
    for i, (s, e) in enumerate(KEEP):
        z0 = _LEVELS[i % len(_LEVELS)]
        drift = 0.012 if (e - s) > 2.5 else 0.006
        plan.append((z0, round(z0 + drift, 4)))
    return plan

ZOOM = zoom_plan()

def _actual_durations():
    """Rendered segment durations (frame-exact) if render_base.py already ran, else nominal."""
    import json, os
    from config import WORK
    p = os.path.join(WORK, 'segdur.json')
    if os.path.exists(p):
        d = json.load(open(p))
        if len(d) == len(KEEP):
            return d
    return [e - s for s, e in KEEP]

def src_to_final(t):
    """Map a SOURCE time to the BODY timeline (after cuts). Times inside a removed
    interval collapse onto the cut point."""
    acc = 0.0
    for (s, e), d in zip(KEEP, _actual_durations()):
        if t < s:
            return round(acc, 3)
        if s <= t <= e:
            return round(acc + min(t - s, d), 3)
        acc += d
    return round(acc, 3)

def body_duration():
    return round(sum(_actual_durations()), 3)

def cut_points():
    """Body-timeline times where a cut happens (for subtle transitions)."""
    pts, acc = [], 0.0
    for d in _actual_durations()[:-1]:
        acc += d
        pts.append(round(acc, 3))
    return pts

if __name__ == '__main__':
    print('keep segments:', len(KEEP))
    for (s, e), (z0, z1) in zip(KEEP, ZOOM):
        print(f'  {s:7.2f} -> {e:7.2f}  ({e-s:5.2f}s)  zoom {z0}->{z1}')
    print('removed:', round(sum(e - s for s, e in CUTS), 2), 's | body duration:', body_duration(), 's')
