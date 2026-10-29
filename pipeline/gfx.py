# -*- coding: utf-8 -*-
"""Motion-graphics compositor.

Renders a full-length RGBA overlay layer (branded intro, lower-third, key-word panels,
numbers, animated lists, timeline, captions, light leaks, outro) frame by frame with
Pillow/NumPy and pipes it into ffmpeg, which composites it over base.mp4.

    python3 gfx.py                 -> video_gfx.mp4 (video only)
    python3 gfx.py --preview 3,20  -> preview PNGs of the FINAL timeline at those seconds
"""
import os, sys, math, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from config import (WORK, W, H, FPS, BRAND, NAME, TITLE, TAGLINE, NAVY, NAVY_DEEP, GOLD, GOLD_LIGHT,
                    OFFWHITE, WHITE, SLATE, MUTED, FONT_HEAD, FONT_BODY, INTRO_DUR, OUTRO_DUR)
from edl import src_to_final, body_duration

BODY = body_duration()
TOTAL = INTRO_DUR + BODY + OUTRO_DUR
def T(src_t):            # source time -> final timeline
    return INTRO_DUR + src_to_final(src_t)

# ---------------------------------------------------------------- fonts / easing
_fonts = {}
def font(kind, size, weight='SemiBold'):
    key = (kind, size, weight)
    if key not in _fonts:
        f = ImageFont.truetype(FONT_HEAD if kind == 'head' else FONT_BODY, size)
        f.set_variation_by_name(weight.encode())
        _fonts[key] = f
    return _fonts[key]

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease_out(p): return 1 - (1 - p) ** 3
def ease_in(p): return p ** 3
def ease_io(p): return 4*p*p*p if p < 0.5 else 1 - (-2*p + 2) ** 3 / 2

def env(t, start, end, din=0.45, dout=0.30):
    """Entrance/exit envelope -> (alpha, enter_progress, exit_progress)."""
    if t < start or t > end: return 0.0, 0.0, 1.0
    pe = ease_out(clamp((t - start) / din))
    px = ease_in(clamp((t - (end - dout)) / dout)) if t > end - dout else 0.0
    return pe * (1 - px), pe, px

# ---------------------------------------------------------------- drawing helpers
def rgba(c, a=255): return (c[0], c[1], c[2], a)

_timg = {}
def text_img(txt, f, color=WHITE, tracking=0, shadow=False):
    """Render text to a tight RGBA image (optionally with a soft shadow). Cached."""
    key = (txt, id(f), color, round(tracking, 2), shadow)
    if key not in _timg:
        if len(_timg) > 4000: _timg.clear()
        _timg[key] = _text_img(txt, f, color, tracking, shadow)
    return _timg[key]

def _text_img(txt, f, color, tracking, shadow):
    d0 = ImageDraw.Draw(Image.new('RGBA', (4, 4)))
    if tracking:
        w = sum(f.getlength(ch) for ch in txt) + tracking * (len(txt) - 1)
    else:
        w = f.getlength(txt)
    bb = d0.textbbox((0, 0), txt, font=f, anchor='ls')
    asc, desc = -bb[1], bb[3]
    pad = 18 if shadow else 2
    im = Image.new('RGBA', (int(w) + pad * 2 + 2, int(asc + desc) + pad * 2 + 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    def put(target, col):
        x = pad
        if tracking:
            for ch in txt:
                target.text((x, pad + asc), ch, font=f, fill=col, anchor='ls'); x += f.getlength(ch) + tracking
        else:
            target.text((x, pad + asc), txt, font=f, fill=col, anchor='ls')
    if shadow:
        sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); put(ImageDraw.Draw(sh), (0, 0, 0, 170))
        im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(7)))
    put(d, rgba(color))
    return im

def wrap(txt, f, maxw):
    words, lines, cur = txt.split(), [], ''
    for wd in words:
        trial = (cur + ' ' + wd).strip()
        if f.getlength(trial) <= maxw or not cur: cur = trial
        else: lines.append(cur); cur = wd
    if cur: lines.append(cur)
    return lines

def rich_line(parts, f, maxw=None, shadow=True):
    """parts: list of (text, color). Returns centred single-line RGBA image."""
    imgs = [text_img(t, f, c, shadow=shadow) for t, c in parts]
    # overlap the padding so spacing stays natural
    pad = 18 if shadow else 2
    w = sum(i.width - 2 * pad for i in imgs) + 2 * pad
    h = max(i.height for i in imgs)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0)); x = 0
    for i in imgs:
        out.alpha_composite(i, (x, 0)); x += i.width - 2 * pad
    return out

def parse_rich(s, base=WHITE, accent=GOLD):
    """'Vous avez **bien choisi**' -> [(text,color),...]"""
    parts, acc, tok = [], '', False
    i = 0
    while i < len(s):
        if s.startswith('**', i):
            if acc: parts.append((acc, accent if tok else base)); acc = ''
            tok = not tok; i += 2
        else:
            acc += s[i]; i += 1
    if acc: parts.append((acc, accent if tok else base))
    return parts

def icon(kind, size=56, color=GOLD, stroke=3):
    """Flat line icons drawn at 3x and down-sampled."""
    S = size * 3; st = stroke * 3
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im); c = rgba(color)
    m = S * 0.12
    if kind == 'check':
        d.line([(S*0.22, S*0.52), (S*0.42, S*0.72), (S*0.80, S*0.30)], fill=c, width=st, joint='curve')
    elif kind == 'check_circle':
        d.ellipse([m, m, S-m, S-m], outline=c, width=st)
        d.line([(S*0.32, S*0.52), (S*0.45, S*0.65), (S*0.70, S*0.37)], fill=c, width=st, joint='curve')
    elif kind == 'pin':
        d.ellipse([S*0.22, S*0.06, S*0.78, S*0.62], outline=c, width=st)
        d.line([(S*0.27, S*0.52), (S*0.50, S*0.94)], fill=c, width=st)
        d.line([(S*0.73, S*0.52), (S*0.50, S*0.94)], fill=c, width=st)
        d.ellipse([S*0.41, S*0.25, S*0.59, S*0.43], outline=c, width=st)
    elif kind == 'shield':
        d.polygon([(S*0.5, S*0.06), (S*0.86, S*0.2), (S*0.84, S*0.55), (S*0.5, S*0.94), (S*0.16, S*0.55), (S*0.14, S*0.2)],
                  outline=c, width=st)
        d.line([(S*0.36, S*0.50), (S*0.47, S*0.61), (S*0.66, S*0.40)], fill=c, width=st, joint='curve')
    elif kind == 'doc':
        d.rectangle([S*0.22, S*0.08, S*0.78, S*0.92], outline=c, width=st)
        for y in (0.34, 0.50, 0.66): d.line([(S*0.34, S*y), (S*0.66, S*y)], fill=c, width=st)
    elif kind == 'arrow_down':
        d.line([(S*0.5, S*0.12), (S*0.5, S*0.86)], fill=c, width=st)
        d.line([(S*0.22, S*0.58), (S*0.5, S*0.86), (S*0.78, S*0.58)], fill=c, width=st, joint='curve')
    elif kind == 'trend_down':
        d.line([(S*0.10, S*0.10), (S*0.10, S*0.90), (S*0.90, S*0.90)], fill=c, width=st)
        d.line([(S*0.18, S*0.30), (S*0.42, S*0.50), (S*0.58, S*0.42), (S*0.84, S*0.78)], fill=c, width=st, joint='curve')
        d.line([(S*0.70, S*0.78), (S*0.84, S*0.78), (S*0.84, S*0.64)], fill=c, width=st)
    elif kind == 'clock':
        d.ellipse([m, m, S-m, S-m], outline=c, width=st)
        d.line([(S*0.5, S*0.26), (S*0.5, S*0.52), (S*0.68, S*0.62)], fill=c, width=st, joint='curve')
    elif kind == 'cursor':
        d.polygon([(S*0.28, S*0.16), (S*0.28, S*0.80), (S*0.44, S*0.64), (S*0.56, S*0.88), (S*0.66, S*0.82),
                   (S*0.55, S*0.60), (S*0.76, S*0.58)], outline=c, width=st)
    elif kind == 'question':
        f = ImageFont.truetype(FONT_HEAD, int(S*0.9)); f.set_variation_by_name(b'SemiBold')
        d.text((S*0.5, S*0.52), '?', font=f, fill=c, anchor='mm')
    elif kind == 'star':
        pts = []
        for k in range(10):
            r = S*0.42 if k % 2 == 0 else S*0.19; a = -math.pi/2 + k*math.pi/5
            pts.append((S*0.5 + r*math.cos(a), S*0.52 + r*math.sin(a)))
        d.polygon(pts, fill=c)
    elif kind == 'building':
        d.rectangle([S*0.18, S*0.20, S*0.82, S*0.90], outline=c, width=st)
        for yy in (0.36, 0.52, 0.68):
            for xx in (0.32, 0.50, 0.68): d.rectangle([S*xx-S*0.05, S*yy-S*0.05, S*xx+S*0.05, S*yy+S*0.05], fill=c)
    elif kind == 'home':
        d.polygon([(S*0.5, S*0.10), (S*0.90, S*0.46), (S*0.78, S*0.46), (S*0.78, S*0.90), (S*0.22, S*0.90), (S*0.22, S*0.46), (S*0.10, S*0.46)],
                  outline=c, width=st)
    return im.resize((size, size), Image.LANCZOS)

def line_img(w, h=2, color=GOLD, alpha=255):
    return Image.new('RGBA', (max(1, int(w)), h), rgba(color, alpha))

def to_np(im): return np.asarray(im, dtype=np.float32) / 255.0

def blit(canvas, im, x, y, alpha=1.0):
    """Straight-alpha 'over' of an RGBA PIL image onto the float canvas."""
    if alpha <= 0.002: return
    src = im if isinstance(im, np.ndarray) else to_np(im)
    h, w = src.shape[:2]; x, y = int(round(x)), int(round(y))
    x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    if x1 <= x0 or y1 <= y0: return
    s = src[y0 - y:y1 - y, x0 - x:x1 - x]
    d = canvas[y0:y1, x0:x1]
    sa = s[..., 3:4] * alpha; da = d[..., 3:4]
    oa = sa + da * (1 - sa)
    col = (s[..., :3] * sa + d[..., :3] * da * (1 - sa)) / np.maximum(oa, 1e-6)
    d[..., :3] = col; d[..., 3:4] = oa

# ---------------------------------------------------------------- layout constants
PX, PW = 1316, 530          # right-hand panel (free area beside the speaker)
PY = 176
PLATE_PAD = 34               # translucent plate behind the right column (contrast over the blinds)
PLATE_X0, PLATE_X1 = PX - PLATE_PAD, PX + PW + PLATE_PAD
_scratch = np.zeros((H, W, 4), np.float32)
CAP_Y = 962                 # captions baseline area (over desk/torso, never the face)
LT_X, LT_Y = 84, 930        # lower-third
_plates = {}

def plate_img(h):
    """Rounded translucent navy plate with a thin gold accent bar on the left."""
    h = int(h)
    if h not in _plates:
        w = PLATE_X1 - PLATE_X0
        im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        d.rounded_rectangle([0, 0, w - 1, h - 1], radius=16, fill=rgba(NAVY_DEEP, 178))
        d.rounded_rectangle([0, 0, w - 1, h - 1], radius=16, outline=(255, 255, 255, 26), width=1)
        if h > 48: d.rounded_rectangle([0, 18, 3, h - 19], radius=2, fill=rgba(GOLD, 230))
        _plates[h] = to_np(im)
    return _plates[h]

# ---------------------------------------------------------------- element classes
class Element:
    def __init__(self, start, end): self.start, self.end = start, end
    def active(self, t): return self.start - 0.05 <= t <= self.end + 0.05
    def draw(self, canvas, t): pass

class LightLeak(Element):
    _cache = {}
    def __init__(self, start, dur=2.4, corner='tl', peak=0.20):
        super().__init__(start, start + dur); self.corner, self.peak = corner, peak
    @classmethod
    def img(cls, corner):
        if corner not in cls._cache:
            yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
            cx, cy = (-80, -60) if corner == 'tl' else (W + 80, -60)
            r = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
            a = np.clip(1 - r / 1150, 0, 1) ** 2.2
            im = np.zeros((H, W, 4), np.float32)
            im[..., 0], im[..., 1], im[..., 2] = 1.0, 0.86, 0.66
            im[..., 3] = a
            cls._cache[corner] = im
        return cls._cache[corner]
    def draw(self, canvas, t):
        p = (t - self.start) / (self.end - self.start)
        if not 0 <= p <= 1: return
        a = math.sin(p * math.pi) ** 1.3 * self.peak
        blit(canvas, self.img(self.corner), (p - 0.5) * 60, 0, a)

class BrandMark(Element):
    """Small discreet wordmark, top-right."""
    def __init__(self, start, end):
        super().__init__(start, end)
        self.im = text_img(BRAND, font('head', 22, 'SemiBold'), WHITE, tracking=6)
    def draw(self, canvas, t):
        a, _, _ = env(t, self.start, self.end, 0.8, 0.5)
        blit(canvas, self.im, W - 84 - self.im.width, 58, a * 0.62)

class LowerThird(Element):
    def __init__(self, start, end):
        super().__init__(start, end)
        self.name = text_img(NAME or BRAND, font('head', 40, 'Bold'), WHITE, tracking=(0 if NAME else 5), shadow=True)
        sub = (BRAND + '  ·  ' + TITLE) if NAME else TITLE
        self.sub = text_img(sub, font('body', 24, 'Medium'), GOLD_LIGHT, shadow=True)
    def draw(self, canvas, t):
        a, pe, px = env(t, self.start, self.end, 0.55, 0.35)
        if a <= 0: return
        barh = 86 * ease_out(clamp((t - self.start) / 0.5))
        blit(canvas, line_img(4, max(1, int(barh)), GOLD), LT_X, LT_Y - 10 + (86 - barh) / 2, a)
        slide = (1 - pe) * 28 - px * 10
        blit(canvas, self.name, LT_X + 22 + slide - 18, LT_Y - 18 - 18, a)
        a2, _, _ = env(t, self.start + 0.18, self.end, 0.5, 0.3)
        blit(canvas, self.sub, LT_X + 22 + slide * 1.3 - 18, LT_Y + 30 - 18, a2)

class Caption(Element):
    """Key-statement caption: centred, white with gold accents, soft rise + fade."""
    def __init__(self, start, end, text, size=42, y=CAP_Y):
        super().__init__(start, end); self.y = y
        self.im = rich_line(parse_rich(text), font('body', size, 'SemiBold'))
    def draw(self, canvas, t):
        a, pe, px = env(t, self.start, self.end, 0.42, 0.28)
        if a <= 0: return
        dy = (1 - pe) * 22 - px * 10
        blit(canvas, self.im, (W - self.im.width) / 2, self.y - self.im.height / 2 + dy, a)

class Panel(Element):
    """Right-hand key-word panel: eyebrow label, main text, growing underline, optional icon."""
    def __init__(self, start, end, main, eyebrow=None, ico=None, size=42, muted=False):
        super().__init__(start, end)
        f = font('head', size, 'SemiBold')
        col = SLATE if muted else WHITE
        self.lines = [rich_line(parse_rich(l, col), f, shadow=True) for l in wrap(main.replace('**', ''), f, PW - (70 if ico else 0))]
        # keep rich markup per wrapped line when it fits on one line
        if len(self.lines) == 1: self.lines = [rich_line(parse_rich(main, col), f, shadow=True)]
        self.eye = text_img(eyebrow.upper(), font('body', 19, 'SemiBold'), GOLD, tracking=3, shadow=True) if eyebrow else None
        self.ico = icon(ico, 52, GOLD) if ico else None
        self.lh = int(size * 1.22)
    def draw(self, canvas, t):
        a, pe, px = env(t, self.start, self.end, 0.5, 0.3)
        if a <= 0: return
        x = PX; y = PY; dx = (1 - pe) * 26 - px * 8
        if self.eye is not None:
            blit(canvas, self.eye, x + dx - 18, y - 18, a); y += 38
        ul = 90 * ease_out(clamp((t - self.start - 0.12) / 0.5))
        blit(canvas, line_img(ul, 2, GOLD), x, y + 2, a); y += 20
        if self.ico is not None:
            blit(canvas, self.ico, x + dx, y + 6, a); x += 70
        for i, l in enumerate(self.lines):
            ai, pei, _ = env(t, self.start + 0.08 * i, self.end, 0.5, 0.3)
            blit(canvas, l, x + dx + (1 - pei) * 10 - 18, y - 18 + i * self.lh, ai)

class StatList(Element):
    """Animated list of big numbers + labels (hook credentials). items: (t_src_start, number, suffix, label, icon)"""
    def __init__(self, items, end):
        super().__init__(min(i[0] for i in items), end); self.items = items
        self.fn = font('head', 60, 'Bold'); self.fl = font('body', 24, 'Medium')
    def draw(self, canvas, t):
        y = PY; self.bottom = PY + 102
        for (s, num, suffix, label, ico) in self.items:
            a, pe, px = env(t, s, self.end, 0.5, 0.3)
            if t >= s: self.bottom = y + 102 - (1 - ease_out(clamp((t - s) / 0.5))) * 100
            if a > 0:
                dx = (1 - pe) * 24 - px * 8
                if isinstance(num, int) and num > 9:
                    p = ease_out(clamp((t - s) / 0.75)); shown = str(int(round(num * p)))
                else:
                    shown = str(num)
                nim = text_img(shown + suffix, self.fn, GOLD, shadow=True)
                blit(canvas, nim, PX + dx - 18, y - 18, a)
                lim = text_img(label, self.fl, OFFWHITE, shadow=True)
                blit(canvas, lim, PX + dx - 18, y + 62 - 18, a)
                if ico:
                    blit(canvas, icon(ico, 30, GOLD), PX + nim.width - 36 + 10 + dx, y + 16, a)
                sep = 430 * ease_out(clamp((t - s - 0.1) / 0.6))
                blit(canvas, line_img(sep, 1, WHITE, 70), PX, y + 102, a)
            y += 124

class CheckList(Element):
    """Checklist with check-circle icons appearing in sync. items: (t_src, text)"""
    def __init__(self, items, end, eyebrow=None, start=None):
        super().__init__(start if start is not None else min(i[0] for i in items), end)
        self.items = items; self.f = font('body', 31, 'Medium')
        self.eye = text_img(eyebrow.upper(), font('body', 19, 'SemiBold'), GOLD, tracking=3, shadow=True) if eyebrow else None
        self.ico = icon('check_circle', 40, GOLD)
    def draw(self, canvas, t):
        y = PY
        if self.eye is not None:
            a, pe, px = env(t, self.start, self.end, 0.5, 0.3)
            blit(canvas, self.eye, PX + (1 - pe) * 20 - 18, y - 18, a)
            ul = 90 * ease_out(clamp((t - self.start - 0.12) / 0.5))
            blit(canvas, line_img(ul, 2, GOLD), PX, y + 40, a); y += 66
        self.bottom = y - 8
        for (s, text) in self.items:
            a, pe, px = env(t, s, self.end, 0.45, 0.3)
            if a > 0:
                dx = (1 - pe) * 24 - px * 8
                nl = len(wrap(text, self.f, PW - 60))
                self.bottom = y + 44 + 38 * (nl - 1) - (1 - ease_out(clamp((t - s) / 0.45))) * 60
                blit(canvas, self.ico, PX + dx, y + 4, a)
                lines = wrap(text, self.f, PW - 60)
                for i, l in enumerate(lines):
                    blit(canvas, text_img(l, self.f, WHITE, shadow=True), PX + 58 + dx - 18, y - 18 + i * 38, a)
                y += 44 + 38 * (len(lines) - 1)
            y += 28

class Timeline(Element):
    """Vertical step timeline: items (t_src, eyebrow, text)."""
    def __init__(self, items, end, start=None):
        super().__init__(start if start is not None else min(i[0] for i in items), end); self.items = items
        self.fe = font('body', 18, 'SemiBold'); self.fm = font('head', 34, 'SemiBold')
    def draw(self, canvas, t):
        n = len(self.items); step = 118; x = PX + 16; y0 = PY + 10
        a0, _, _ = env(t, self.start, self.end, 0.4, 0.3)
        # growing spine
        last_on = [i for i, it in enumerate(self.items) if t >= it[0]]
        if last_on:
            k = last_on[-1]; s = self.items[k][0]
            prev = y0 + step * (k - 1) if k > 0 else y0
            target = y0 + step * k
            cur = prev + (target - prev) * ease_out(clamp((t - s) / 0.6))
            blit(canvas, line_img(2, max(1, int(cur - y0 + 1)), GOLD, 160), x, y0, a0)
        self.bottom = y0 + 24
        for i, (s, eye, text) in enumerate(self.items):
            a, pe, px = env(t, s, self.end, 0.45, 0.3)
            if a <= 0: continue
            y = y0 + step * i
            self.bottom = y + 30 - (1 - ease_out(clamp((t - s) / 0.45))) * 70
            r = 9 * ease_out(clamp((t - s) / 0.35))
            node = Image.new('RGBA', (26, 26), (0, 0, 0, 0)); d = ImageDraw.Draw(node)
            d.ellipse([13 - r, 13 - r, 13 + r, 13 + r], fill=rgba(GOLD))
            d.ellipse([13 - r*0.45, 13 - r*0.45, 13 + r*0.45, 13 + r*0.45], fill=rgba(NAVY))
            blit(canvas, node, x - 12, y - 12, a)
            dx = (1 - pe) * 20 - px * 8
            blit(canvas, text_img(eye.upper(), self.fe, GOLD, tracking=3, shadow=True), x + 34 + dx - 18, y - 26 - 18, a)
            blit(canvas, text_img(text, self.fm, WHITE, shadow=True), x + 34 + dx - 18, y + 2 - 18, a)

class NumberCard(Element):
    """Big number (count-up) + label + optional icon, right panel."""
    def __init__(self, start, end, number, label, suffix='', ico=None, eyebrow=None, count=True):
        super().__init__(start, end); self.number, self.suffix, self.count = number, suffix, count
        self.fn = font('head', 108, 'Bold'); self.lab = text_img(label, font('body', 28, 'Medium'), OFFWHITE, shadow=True)
        self.eye = text_img(eyebrow.upper(), font('body', 19, 'SemiBold'), GOLD, tracking=3, shadow=True) if eyebrow else None
        self.ico = icon(ico, 56, GOLD) if ico else None
    def draw(self, canvas, t):
        a, pe, px = env(t, self.start, self.end, 0.5, 0.3)
        if a <= 0: return
        y = PY; dx = (1 - pe) * 24 - px * 8
        if self.eye is not None:
            blit(canvas, self.eye, PX + dx - 18, y - 18, a); y += 34
        n = self.number
        if self.count and isinstance(n, int):
            n = int(round(n * ease_out(clamp((t - self.start) / 0.8))))
        nim = text_img(f'{n}{self.suffix}', self.fn, GOLD, shadow=True)
        blit(canvas, nim, PX + dx - 18, y - 18, a)
        y += 118
        ul = 90 * ease_out(clamp((t - self.start - 0.15) / 0.5))
        blit(canvas, line_img(ul, 2, GOLD), PX, y, a); y += 18
        xx = PX
        if self.ico is not None:
            blit(canvas, self.ico, PX + dx, y - 10, a); xx += 68
        blit(canvas, self.lab, xx + dx - 18, y - 18, a)

class CTAArrow(Element):
    """Soft bouncing arrow + text under the caption, pointing to the button below the video."""
    def __init__(self, start, end):
        super().__init__(start, end); self.ico = icon('arrow_down', 44, GOLD)
    def draw(self, canvas, t):
        a, pe, px = env(t, self.start, self.end, 0.5, 0.3)
        if a <= 0: return
        bob = 6 * math.sin((t - self.start) * 2 * math.pi * 0.9)
        blit(canvas, self.ico, (W - 44) / 2, CAP_Y + 36 + bob, a)

class Intro(Element):
    def __init__(self):
        super().__init__(0, INTRO_DUR + 0.5)
        self.word = BRAND; self.f = font('head', 96, 'Bold')
        self.tag = text_img(TAGLINE, font('body', 26, 'Medium'), SLATE, tracking=2)
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt((xx - W/2) ** 2 + (yy - H/2) ** 2) / 1100
        bg = np.zeros((H, W, 4), np.float32)
        for i, (a, b) in enumerate(zip(NAVY, NAVY_DEEP)):
            bg[..., i] = (a / 255) * (1 - r) + (b / 255) * r
        bg[..., 3] = 1.0; self.bg = bg
    def draw(self, canvas, t):
        if t > self.end: return
        fade = 1 - ease_io(clamp((t - INTRO_DUR) / 0.45))        # reveal the speaker
        blit(canvas, self.bg, 0, 0, fade)
        p = ease_out(clamp((t - 0.15) / 0.9))
        tracking = 34 - 22 * p
        im = text_img(self.word, self.f, WHITE, tracking=tracking)
        blit(canvas, im, (W - im.width) / 2, H / 2 - 92, p * fade)
        lw = 260 * ease_out(clamp((t - 0.45) / 0.7))
        blit(canvas, line_img(lw, 2, GOLD), (W - lw) / 2, H / 2 + 18, fade)
        a2 = ease_out(clamp((t - 0.7) / 0.6))
        blit(canvas, self.tag, (W - self.tag.width) / 2, H / 2 + 44 + (1 - a2) * 10, a2 * fade)

class Outro(Element):
    def __init__(self):
        s = INTRO_DUR + BODY
        super().__init__(s - 0.6, TOTAL + 1)
        self.bg = Intro().bg
        self.word = text_img(BRAND, font('head', 44, 'Bold'), WHITE, tracking=10)
        self.h1 = text_img("Validez votre devis", font('head', 62, 'SemiBold'), WHITE)
        self.h2 = text_img("Le bouton est sous la vidéo", font('body', 30, 'Medium'), OFFWHITE)
        self.h3 = text_img("Mon équipe vous répond dans l'heure", font('body', 26, 'Medium'), GOLD_LIGHT)
        self.arrow = icon('arrow_down', 48, GOLD); self.clock = icon('clock', 30, GOLD_LIGHT)
    def draw(self, canvas, t):
        s = INTRO_DUR + BODY
        fin = ease_io(clamp((t - (s - 0.6)) / 0.6))
        if fin <= 0: return
        blk = ease_in(clamp((t - (TOTAL - 0.6)) / 0.6))            # fade to black at the very end
        blit(canvas, self.bg, 0, 0, fin)
        k = 1 - blk
        a1 = ease_out(clamp((t - s + 0.1) / 0.6)) * k
        blit(canvas, self.word, (W - self.word.width) / 2, 318 - (1 - a1) * 10, a1 * fin)
        lw = 120 * ease_out(clamp((t - s - 0.1) / 0.6))
        blit(canvas, line_img(lw, 2, GOLD), (W - lw) / 2, 392, k * fin)
        a2 = ease_out(clamp((t - s - 0.25) / 0.6)) * k
        blit(canvas, self.h1, (W - self.h1.width) / 2, 440 + (1 - a2) * 16, a2 * fin)
        a3 = ease_out(clamp((t - s - 0.6) / 0.6)) * k
        blit(canvas, self.h2, (W - self.h2.width) / 2, 540 + (1 - a3) * 14, a3 * fin)
        bob = 5 * math.sin((t - s) * 2 * math.pi * 0.9)
        blit(canvas, self.arrow, (W - 48) / 2, 600 + bob, a3 * fin)
        a4 = ease_out(clamp((t - s - 1.0) / 0.6)) * k
        tw = self.h3.width + 44
        blit(canvas, self.clock, (W - tw) / 2, 690, a4 * fin)
        blit(canvas, self.h3, (W - tw) / 2 + 44, 672, a4 * fin)
        if blk > 0:
            blit(canvas, np.array([[[0, 0, 0, 1.0]]], np.float32).repeat(H, 0).repeat(W, 1), 0, 0, blk)

# ---------------------------------------------------------------- the storyboard (SOURCE seconds)
def storyboard():
    E = []
    E.append(Intro())
    E.append(Outro())
    E.append(BrandMark(T(6.4), INTRO_DUR + BODY - 0.3))
    E.append(LightLeak(T(0.0) - 0.2, 2.6, 'tr', 0.20))
    # 1. Hook: credentials
    E.append(StatList([(T(0.0), 800, '', 'entrepreneurs accompagnés', None),
                       (T(2.24), 8, ' ans', 'de métier', None),
                       (T(3.72), 50, ' avis', '5 étoiles sur Trustpilot', 'star')], T(6.1)))
    E.append(LowerThird(T(0.9), T(6.0)))
    # 2. The LLC in your quote
    E.append(Panel(T(6.5), T(12.3), "La structure qu'on monte **le plus souvent**", eyebrow="Votre devis · LLC", ico='doc'))
    E.append(Panel(T(12.86), T(13.9), "Vous avez **bien choisi**", ico='check_circle'))
    # 3. How it works
    E.append(Caption(T(15.2), T(17.3), "La LLC est **transparente**."))
    E.append(NumberCard(T(17.5), T(20.0), 0, "impôt aux États-Unis", eyebrow="Fiscalité", ico='building', count=False))
    E.append(Panel(T(20.5), T(25.7), "Vos bénéfices sont déclarés **là où vous résidez**", eyebrow="Dans la majorité des cas", ico='home'))
    E.append(Panel(T(27.2), T(29.5), "Nouveau-Mexique", eyebrow="Création · États-Unis", ico='pin', size=48))
    E.append(CheckList([(T(29.7), "Pas de rapport annuel"), (T(31.1), "Pas de taxes annuelles"),
                        (T(32.3), "Quasiment zéro contrainte administrative")], T(34.7), eyebrow="Au quotidien", start=T(29.7)))
    # 4. Objection -> reversal
    E.append(Panel(T(37.6), T(40.4), "Une usine à gaz ?", eyebrow="Vous vous dites peut-être", ico='question', muted=True))
    E.append(Caption(T(41.45), T(42.6), "C'est exactement **l'inverse**."))
    E.append(LightLeak(T(41.4), 2.0, 'tl', 0.12))
    E.append(CheckList([(T(43.0), "La structure la plus simple de notre catalogue"), (T(47.2), "La plus accessible"),
                        (T(49.1), "Adresse incluse"), (T(50.0), "Agent inclus"), (T(50.9), "Pendant 1 an")],
                       T(51.3), eyebrow="Ce qui est inclus", start=T(43.0)))
    # 5. Proof
    E.append(Panel(T(52.9), T(57.0), "Tout est **vérifiable** : registre officiel de l'État", eyebrow="Transparence", ico='shield', size=38))
    E.append(NumberCard(T(57.3), T(60.1), 800, "clients avant vous", eyebrow="Comme", ico='check'))
    # 6. Projection timeline
    E.append(Caption(T(62.2), T(63.0), "**Projetez-vous.**", size=46))
    E.append(LightLeak(T(62.1), 2.2, 'tr', 0.14))
    E.append(Timeline([(T(63.4), "Aujourd'hui", "Vous signez"), (T(64.4), "Demain", "Création lancée"),
                       (T(65.8), "Quelques jours", "Vous facturez avec votre LLC")], T(69.1), start=T(63.4)))
    # 7. Cost of inaction
    E.append(Caption(T(73.8), T(75.3), "Ne rien faire **est un coût**."))
    E.append(Panel(T(75.6), T(80.0), "Chaque mois sans structure, c'est de la **marge qui part**", eyebrow="Le vrai risque", ico='trend_down', size=38))
    # 8. Urgency
    E.append(NumberCard(T(80.6), T(82.1), 14, "jours de validité du devis", eyebrow="Votre devis", ico='clock', count=False))
    E.append(Panel(T(82.8), T(87.2), "Nombre **limité** de dossiers par semaine", eyebrow="Pour garder ce niveau de suivi", ico='doc', size=38))
    # 9. CTA
    E.append(Caption(T(87.5), INTRO_DUR + BODY - 0.1, "Le bouton est **sous la vidéo**"))
    E.append(CTAArrow(T(88.0), INTRO_DUR + BODY - 0.1))
    E.append(NumberCard(T(89.4), INTRO_DUR + BODY - 0.1, 2, "clics", eyebrow="C'est simple", ico='cursor', count=False))
    E.append(Panel(T(90.0), INTRO_DUR + BODY - 0.1, "Mon équipe vous répond **dans l'heure**", ico='clock', size=36))
    E.append(LightLeak(T(87.4), 2.4, 'tl', 0.14))
    return E

# Panels that share the right-hand column must not overlap in time: NumberCard at 89.4 and
# Panel at 90.0 both live there, so the latter is placed lower via a y-offset shim.
class Lower(Element):
    def __init__(self, inner, dy): super().__init__(inner.start, inner.end); self.inner, self.dy = inner, dy
    def draw(self, canvas, t):
        global PY
        PY += self.dy
        try:
            self.inner.draw(canvas, t)
            if hasattr(self.inner, 'bottom'): self.bottom = self.inner.bottom
        finally: PY -= self.dy

class Plated(Element):
    """Wraps a right-column element: renders it to a scratch layer, puts a plate sized to the
    content underneath (height eased), then composites. Keeps text legible over the window."""
    def __init__(self, inner):
        super().__init__(inner.start, inner.end); self.inner = inner
    def draw(self, canvas, t):
        a, pe, px = env(t, self.start, self.end, 0.45, 0.3)
        if a <= 0: return
        global PY
        layer = _scratch; layer[:, PLATE_X0 - 40:PLATE_X1 + 40] = 0
        self.inner.draw(layer, t)
        col = layer[:, PLATE_X0:PLATE_X1, 3]
        rows = np.where(col.max(axis=1) > 0.02)[0]
        if len(rows):
            y0, y1 = max(0, rows[0] + 12 - PLATE_PAD), min(H, rows[-1] + PLATE_PAD - 6)   # anchor to content
            bottom = getattr(self.inner, 'bottom', None)
            if bottom is not None: y1 = min(H, int(bottom) + PLATE_PAD - 6)
            y1 = max(y1, y0 + 56)
            blit(canvas, plate_img(y1 - y0), PLATE_X0 - (1 - pe) * 18, y0, a)
        reg = layer[:, PLATE_X0 - 40:PLATE_X1 + 40]
        blit(canvas, reg, PLATE_X0 - 40, 0, 1.0)
def build():
    E = storyboard()
    E[-2] = Lower(E[-2], 330)        # "répond dans l'heure" panel below the "2 clics" card
    return [Plated(e) if isinstance(e, (Panel, StatList, CheckList, Timeline, NumberCard, Lower)) else e for e in E]

# ---------------------------------------------------------------- render
def render_frame(E, t):
    canvas = np.zeros((H, W, 4), np.float32)
    for e in E:
        if e.active(t): e.draw(canvas, t)
    return (np.clip(canvas, 0, 1) * 255).astype(np.uint8)

def encode_range(E, f0, f1, out, log=True):
    """Composite frames [f0, f1) of the final timeline over the (padded) base and encode."""
    t0 = f0 / FPS
    cmd = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
           '-i', os.path.join(WORK, 'base.mp4'),
           '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', str(FPS), '-i', 'pipe:0',
           '-filter_complex',
           f"[0:v]tpad=start_duration={INTRO_DUR}:stop_duration={OUTRO_DUR + 0.5}:start_mode=clone:stop_mode=clone,"
           f"trim=start={t0}:end={f1 / FPS},setpts=PTS-STARTPTS[b];[1:v]format=rgba[o];"
           f"[b][o]overlay=0:0:format=auto:shortest=1,format=yuv420p[v]",
           '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p',
           '-r', str(FPS), '-frames:v', str(f1 - f0), '-video_track_timescale', '30000', out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    for n in range(f0, f1):
        p.stdin.write(render_frame(E, n / FPS).tobytes())
        if log and (n - f0) % 300 == 0: print(f'  [{out}] frame {n - f0}/{f1 - f0}', flush=True)
    p.stdin.close(); err = p.stderr.read().decode(); p.wait()
    if p.returncode: print('ffmpeg failed:', err[-800:]); sys.exit(1)

def main():
    E = build()
    nframes = int(round(TOTAL * FPS))
    if len(sys.argv) > 3 and sys.argv[1] == '--part':          # worker: render one chunk
        k, n = int(sys.argv[2]), int(sys.argv[3])
        f0, f1 = nframes * k // n, nframes * (k + 1) // n
        encode_range(E, f0, f1, os.path.join(WORK, f'gfx_part{k}.mp4')); return
    if len(sys.argv) > 2 and sys.argv[1] == '--parts':         # parallel driver
        n = int(sys.argv[2])
        procs = [subprocess.Popen([sys.executable, __file__, '--part', str(k), str(n)]) for k in range(n)]
        if any(p.wait() for p in procs): print('a part failed'); sys.exit(1)
        lst = os.path.join(WORK, 'gfx_parts.txt')
        open(lst, 'w').write("".join(f"file '{os.path.abspath(os.path.join(WORK, f'gfx_part{k}.mp4'))}'\n" for k in range(n)))
        out = os.path.join(WORK, 'video_gfx.mp4')
        r = subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', out],
                           capture_output=True, text=True)
        print('gfx rc:', r.returncode, r.stderr[-500:] if r.returncode else f'OK -> {out} ({TOTAL:.2f}s, {nframes} frames)'); return
    if len(sys.argv) > 2 and sys.argv[1] == '--preview':
        base = os.path.join(WORK, 'base.mp4'); os.makedirs(os.path.join(WORK, 'preview'), exist_ok=True)
        for ts in sys.argv[2].split(','):
            t = float(ts); bt = clamp(t - INTRO_DUR, 0, BODY - 0.04)
            raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(bt), '-i', base, '-frames:v', '1', '-f', 'image2pipe',
                                  '-pix_fmt', 'rgb24', '-vcodec', 'rawvideo', '-'], capture_output=True).stdout
            bg = Image.frombytes('RGB', (W, H), raw).convert('RGBA')
            bg.alpha_composite(Image.fromarray(render_frame(E, t)))
            bg.convert('RGB').save(os.path.join(WORK, 'preview', f'p_{t:06.2f}.jpg'), quality=90)
            print('preview', t)
        return
    out = os.path.join(WORK, 'video_gfx.mp4')
    encode_range(E, 0, nframes, out)
    print(f'OK -> {out} ({TOTAL:.2f}s, {nframes} frames)')

if __name__ == '__main__':
    main()
