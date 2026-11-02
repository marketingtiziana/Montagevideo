# -*- coding: utf-8 -*-
"""Global settings for the corporate talking-head pipeline (16:9, 1080p, 30 fps)."""
import os

WORK = os.environ.get('MV_WORK', '.')            # working dir (source.mp4, intermediates, output)
SRC = os.path.join(WORK, 'source.mp4')
FONTS = os.environ.get('MV_FONTS', os.path.join(WORK, 'fonts'))

W, H, FPS = 1920, 1080, 30

# ---- Brand -------------------------------------------------------------
BRAND = "FYNOVATES"
NAME = ""                                       # speaker name for the lower-third (unknown -> brand only)
TITLE = "Conseil en structuration & expatriation"
TAGLINE = "Visa Strategy & Expatriation Advisory"

# Palette (premium corporate: navy / champagne gold / off-white / slate)
NAVY = (11, 30, 63)
NAVY_DEEP = (6, 18, 40)
GOLD = (201, 168, 98)
GOLD_LIGHT = (232, 207, 150)
OFFWHITE = (244, 241, 234)
WHITE = (255, 255, 255)
SLATE = (160, 170, 186)
MUTED = (120, 132, 150)

# Typography (Montserrat for headings/numbers, Inter for body/captions)
FONT_HEAD = os.path.join(FONTS, 'MontserratVar.ttf')
FONT_BODY = os.path.join(FONTS, 'InterVar.ttf')

INTRO_DUR = 1.7      # branded intro (s)
OUTRO_DUR = 4.2      # branded outro with CTA (s)
