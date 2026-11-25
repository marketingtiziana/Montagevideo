FYNOVATES — ART DIRECTION 01 · THE PRIVATE DEPARTURE
"QUITTER LA FRANCE ?" · 1280 x 720 · 16:9

FILES (output/private_departure/)
  thumbnail_private_departure.png            final PNG, rendered from the SVG below
  thumbnail_private_departure_editable.svg   self-contained SVG: images and fonts embedded,
                                             headline and sub-line are live text,
                                             one named group per layer
  thumbnail_private_departure_source/
    thumbnail_private_departure.svg          the same SVG with linked assets (lighter)
    build.py                                 grades the plates, writes both SVGs, renders the PNG
    assets/                                  plates, cutouts, logos
    fonts/                                   Inter Display (OFL)
    src_inputs/                              original FYNOVATES files + original portrait
    previews/                                320x180 check

LAYERS (SVG groups)
  background  private terminal at blue hour + readability gradients
  portrait    her cutout (aspect ratio locked) + light/shadow masked to her silhouette
  passport    foreground passport on the stone floor
  headline    QUITTER / LA FRANCE ? (Inter Display ExtraBold, tracking -2.2 %)
  subline     AVANT DE PRENDRE VOTRE DÉCISION
  logo        original FYNOVATES symbol + wordmark

ART DIRECTION
  - The architecture carries the luxury: floor-to-ceiling glass, a curved
    ceiling, polished stone, the runway, a discreet business jet and a distant
    business district at blue hour. The plate is mirrored so the jet and the
    runway sit under the headline and the skyline runs toward her.
  - Strict palette: the plate's warm materials (timber, brass lamps) are
    desaturated and anchored to the FYNOVATES navy ramp (#0F0A13 → #0D082D →
    white). No gold, red or orange.
  - The passport stays secondary: lower-left foreground, toned down, soft
    shadow. Generic: no emblem, no country, no data, abstract stamps.
  - Typography: one bold white block, kerned tight; a single letter-spaced
    sub-line under a short rule. No 3D, no outline, only a light glow for
    readability.
  - Logo: original files, top-left, white variation on the dark background.

ASSET REFERENCES
  Original (FYNOVATES): src_inputs/logo_*.png, src_inputs/portrait_original.jpg
  Derived, never redrawn: assets/logo_symbol_white.png (crop),
    assets/logo_wordmark_white.png (luminance key), assets/portrait_cutout.png
    (BiRefNet-portrait mask, edge decontamination, no facial retouching)
  Generated (vidIQ / GPT Image 2.6), environment and props only:
    assets/plate_private_terminal.jpg, assets/src_passport_still.jpg
    -> *_graded / passport_luxe_cutout.png (rembg isnet)

QUALITY CONTROL
  [x] "QUITTER LA FRANCE ?" (narrow no-break space before "?"),
      "AVANT DE PRENDRE VOTRE DÉCISION" (É checked)
  [x] Authentic logo, proportions locked
  [x] Face natural, sharp, undistorted; recognisable at 320x180
  [x] Headline readable at 320x180; the sub-line is decorative at that size
  [x] 1280x720 checked; nothing important in the bottom-right corner
      (duration badge)

EDITING
  Open thumbnail_private_departure_editable.svg in Figma, Illustrator or
  Inkscape: the text stays editable (font embedded; install Inter Display for
  local editing). For a reproducible re-export, change the parameters at the
  top of build.py (HEADLINE, SUBLINE, PORTRAIT, PASSPORT, PLATE), then run:
    python3 build.py      (needs Pillow, numpy, Node + Playwright)
