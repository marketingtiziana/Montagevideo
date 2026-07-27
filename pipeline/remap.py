import json
_d = json.load(open('remap.json'))
KEEP = _d['keep']  # kept segments on the OLD base timeline

def map_time(t):
    """Map a time on the old base.mp4 timeline to the tightened base2.mp4 timeline."""
    acc = 0.0
    for (s, e) in KEEP:
        if t < s:
            return round(acc, 3)          # inside a removed gap -> collapse to cut point
        if s <= t <= e:
            return round(acc + (t - s), 3)
        acc += (e - s)
    return round(acc, 3)
