SRC = 'source.mp4'
FPS = 30
W, H = 1080, 1920

# (src_start, src_end, zoom_from, zoom_to)  -- gentle ken-burns per segment
# NOTE: the incomplete first take of the "piège" line (src 58.2-64.0) + 21s dead air
# are removed; the COMPLETE take lives in the last segment (from src 84.9).
SEGMENTS = [
    (1.55,  40.76, 1.00, 1.06),   # S1 hook -> rule -> rates (slow zoom in)
    (42.58, 55.55, 1.06, 1.01),   # S2 consequence -> "encore une autre règle" (dezoom)
    (88.20, 136.40, 1.00, 1.08),  # S3 piège(complete) + solution + guichet unique + CTA
]

def seg_durations():
    return [round(e - s, 3) for (s, e, _, _) in SEGMENTS]

def total_final():
    return round(sum(seg_durations()), 3)

# Map a SOURCE time to FINAL-timeline time (for syncing subs/overlays)
def src_to_final(t):
    acc = 0.0
    for (s, e, _, _) in SEGMENTS:
        if t < s:
            return None  # removed region before this seg
        if s <= t <= e:
            return round(acc + (t - s), 3)
        acc += (e - s)
    return None

if __name__ == '__main__':
    print('durations:', seg_durations(), 'total:', total_final())
