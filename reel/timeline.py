# -*- coding: utf-8 -*-
"""Correspondance timeline SOURCE -> timeline FINALE.

Point important : la video est quantifiee a l'image (30 fps) alors que l'audio
ne l'est pas. Si chacun decoupait de son cote, les arrondis s'accumuleraient sur
18 segments et la voix finirait desynchronisee d'un demi-tiers de seconde. On
definit donc ICI, une fois pour toutes, la duree de chaque segment EN IMAGES ;
la video comme l'audio s'y conforment.
"""
from config import SEGMENTS, FREEZE_AT, FREEZE_DUR, FPS

# duree de chaque segment, en nombre entier d'images
SEG_FRAMES = [max(1, int(round((e - s) * FPS))) for (s, e, *_r) in SEGMENTS]
FREEZE_FRAMES = int(round(FREEZE_DUR * FPS)) if FREEZE_AT else 0

# position de depart de chaque segment dans le final, en images
_starts, _acc = [], 0
for n in SEG_FRAMES:
    _starts.append(_acc)
    _acc += n
TOTAL_CUT_FRAMES = _acc


def _raw_frames(t):
    """Temps source -> image finale, sans tenir compte de l'arret sur image."""
    for i, (s, e, *_r) in enumerate(SEGMENTS):
        if s <= t <= e:
            return _starts[i] + min(SEG_FRAMES[i], int(round((t - s) * FPS)))
    if t < SEGMENTS[0][0]:
        return 0
    for i, (s, e, *_r) in enumerate(SEGMENTS):
        if t < s:                       # t tombe dans une coupe
            return _starts[i]
    return TOTAL_CUT_FRAMES


# image (dans la timeline coupee) a laquelle le gel est insere
FREEZE_FRAME = _raw_frames(FREEZE_AT) if FREEZE_AT else None


def map_frame(t):
    """Temps source -> image finale, arret sur image inclus."""
    f = _raw_frames(t)
    if FREEZE_FRAME is not None and f > FREEZE_FRAME:
        f += FREEZE_FRAMES
    return f


def map_time(t):
    """Temps source -> temps final (secondes)."""
    return map_frame(t) / FPS


TOTAL_FRAMES = TOTAL_CUT_FRAMES + FREEZE_FRAMES
TOTAL = TOTAL_FRAMES / FPS
FREEZE_POS = (FREEZE_FRAME / FPS) if FREEZE_FRAME is not None else None
