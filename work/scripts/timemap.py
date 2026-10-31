import os, sys; sys.path.insert(0, os.path.dirname(__file__)); from edl import quantize
SEGS=quantize()
def s2d(t):
    """temps source -> temps final (None si coupé)"""
    for s in SEGS:
        if s["src_in"]-1e-6 <= t <= s["src_out"]+1e-6: return s["dst_in"] + (t - s["src_in"])
    return None
def d2s(t):
    for s in SEGS:
        if s["dst_in"]-1e-6 <= t <= s["dst_out"]+1e-6: return s["src_in"] + (t - s["dst_in"])
    return None
def seg_of_dst(t):
    for s in SEGS:
        if s["dst_in"]-1e-6 <= t < s["dst_out"]+1e-6: return s
