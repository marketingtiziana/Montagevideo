"""Illustrations vectorielles monochromes (SVG inline) à poser sous le texte d'une slide.

Chaque entrée : nom -> (svg_html, hauteur_px). Style : trait noir fin, gris clair,
un seul accent rouge au maximum, pour rester dans le carrousel blanc minimaliste.
"""
from __future__ import annotations

INK = "#111111"
GREY = "#9A9A9A"
LIGHT = "#E6E6E6"
RED = "#E5322D"
FONT = "font-family='Inter Display, Inter, sans-serif'"

# ---------------------------------------------------------------- iPhone, face avant, épingle « ? »
_PHONE_FRONT = f"""
<svg width="888" height="320" viewBox="0 0 888 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(382,6) scale(0.62)">
    <rect x="0" y="0" width="200" height="400" rx="34" stroke="{INK}" stroke-width="3"/>
    <rect x="12" y="12" width="176" height="376" rx="24" fill="#FAFAFA" stroke="{LIGHT}" stroke-width="2"/>
    <rect x="70" y="20" width="60" height="14" rx="7" fill="{INK}"/>
    <path d="M100 130 c-30 0-54 24-54 54 0 42 54 92 54 92 s54-50 54-92c0-30-24-54-54-54z" stroke="{INK}" stroke-width="3" fill="#fff"/>
    <text x="100" y="200" text-anchor="middle" font-size="46" font-weight="800" fill="{INK}" {FONT}>?</text>
  </g>
  <text x="444" y="300" text-anchor="middle" font-size="18" letter-spacing="5" font-weight="600" fill="{GREY}" {FONT}>FABRIQUÉ … NULLE PART</text>
</svg>
"""

# ---------------------------------------------------------------- iPhone, dos, gravure « Designed by… »
_PHONE_BACK = f"""
<svg width="888" height="310" viewBox="0 0 888 310" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(300,8) scale(0.72)">
    <rect x="0" y="0" width="200" height="400" rx="34" fill="#FAFAFA" stroke="{INK}" stroke-width="3"/>
    <rect x="18" y="18" width="78" height="78" rx="20" fill="#fff" stroke="{INK}" stroke-width="2.5"/>
    <circle cx="40" cy="40" r="11" stroke="{INK}" stroke-width="2.5"/>
    <circle cx="74" cy="40" r="11" stroke="{INK}" stroke-width="2.5"/>
    <circle cx="40" cy="74" r="11" stroke="{INK}" stroke-width="2.5"/>
    <circle cx="78" cy="76" r="4" fill="{INK}"/>
    <text x="100" y="372" text-anchor="middle" font-size="9.5" letter-spacing=".3" fill="{GREY}" {FONT}>Designed by Apple in California</text>
    <text x="100" y="386" text-anchor="middle" font-size="9.5" letter-spacing=".3" fill="{GREY}" {FONT}>Assembled in China</text>
  </g>
  <g>
    <circle cx="590" cy="250" r="66" fill="#fff" stroke="{INK}" stroke-width="3"/>
    <line x1="452" y1="280" x2="524" y2="258" stroke="{INK}" stroke-width="2" stroke-dasharray="4 5"/>
    <text x="590" y="240" text-anchor="middle" font-size="13" font-weight="600" fill="{INK}" {FONT}>Designed by Apple</text>
    <text x="590" y="257" text-anchor="middle" font-size="13" font-weight="600" fill="{INK}" {FONT}>in California.</text>
    <text x="590" y="277" text-anchor="middle" font-size="13" font-weight="600" fill="{RED}" {FONT}>Assembled in China.</text>
  </g>
</svg>
"""

# ---------------------------------------------------------------- 5 géographies reliées à un téléphone
def _pin(x: int, y: int, label: str, sub: str) -> str:
    return f"""
    <g>
      <circle cx="{x}" cy="{y}" r="7" fill="{INK}"/>
      <text x="{x}" y="{y + 34}" text-anchor="middle" font-size="19" font-weight="700" letter-spacing="2" fill="{INK}" {FONT}>{label}</text>
      <text x="{x}" y="{y + 58}" text-anchor="middle" font-size="17" fill="{GREY}" {FONT}>{sub}</text>
    </g>"""


_GEO = f"""
<svg width="888" height="262" viewBox="0 0 888 262" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M60 110 C 200 20, 350 20, 444 110 S 690 200, 828 110" stroke="{LIGHT}" stroke-width="3" stroke-dasharray="2 9"/>
  <g transform="translate(416,70)">
    <rect x="0" y="0" width="56" height="100" rx="12" fill="#fff" stroke="{INK}" stroke-width="3"/>
    <rect x="20" y="6" width="16" height="4" rx="2" fill="{INK}"/>
  </g>
  {_pin(60, 110, "TAÏWAN", "la puce")}
  {_pin(252, 54, "CORÉE", "l'écran")}
  {_pin(444, 196, "CHINE · INDE", "l'assemblage")}
  {_pin(636, 54, "CALIFORNIE", "design, logiciel")}
  {_pin(828, 110, "IRLANDE", "profits")}
</svg>
"""

# ---------------------------------------------------------------- laptop = usine
_LAPTOP = f"""
<svg width="888" height="200" viewBox="0 0 888 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(314,20)">
    <rect x="30" y="0" width="200" height="124" rx="10" fill="#FAFAFA" stroke="{INK}" stroke-width="3"/>
    <rect x="42" y="12" width="176" height="100" rx="4" fill="#fff" stroke="{LIGHT}" stroke-width="2"/>
    <path d="M0 132 h260 a0 0 0 0 1 0 0 v6 a10 10 0 0 1 -10 10 h-240 a10 10 0 0 1 -10 -10z" fill="{INK}"/>
    <g stroke="{GREY}" stroke-width="2" stroke-dasharray="3 6">
      <path d="M130 12 V -4"/>
    </g>
    <text x="130" y="72" text-anchor="middle" font-size="16" letter-spacing="4" font-weight="700" fill="{GREY}" {FONT}>TON USINE</text>
  </g>
  <g font-size="17" fill="{GREY}" {FONT}>
    <text x="286" y="60" text-anchor="end">clients partout →</text>
    <text x="286" y="96" text-anchor="end">outils américains →</text>
    <text x="602" y="60">← prestataires ailleurs</text>
    <text x="602" y="96">← paiements en ligne</text>
  </g>
</svg>
"""

# ---------------------------------------------------------------- société / résidence / marché
def _box(x: int, title: str, sub: str) -> str:
    return f"""
    <g transform="translate({x},0)">
      <rect x="0" y="0" width="256" height="118" rx="18" fill="#fff" stroke="{INK}" stroke-width="3"/>
      <text x="128" y="52" text-anchor="middle" font-size="22" font-weight="800" letter-spacing="3" fill="{INK}" {FONT}>{title}</text>
      <text x="128" y="86" text-anchor="middle" font-size="18" fill="{GREY}" {FONT}>{sub}</text>
    </g>"""


_TRIO = f"""
<svg width="888" height="170" viewBox="0 0 888 170" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(0,16)">
    {_box(0, "SOCIÉTÉ", "là où le cadre est optimal")}
    {_box(316, "RÉSIDENCE", "là où ta vie s'aligne")}
    {_box(632, "MARCHÉ", "là où sont tes clients")}
    <g stroke="{INK}" stroke-width="2.5" stroke-dasharray="3 7">
      <line x1="258" y1="59" x2="314" y2="59"/>
      <line x1="574" y1="59" x2="630" y2="59"/>
    </g>
  </g>
  <text x="444" y="164" text-anchor="middle" font-size="17" letter-spacing="4" font-weight="600" fill="{GREY}" {FONT}>TROIS RÉPONSES SÉPARÉES. UN SEUL BUSINESS.</text>
</svg>
"""

# ---------------------------------------------------------------- 2010 vs 2026
_RULES = f"""
<svg width="888" height="150" viewBox="0 0 888 150" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(60,10)">
    <rect x="0" y="0" width="340" height="110" rx="18" fill="#fff" stroke="{LIGHT}" stroke-width="3" stroke-dasharray="6 6"/>
    <text x="170" y="44" text-anchor="middle" font-size="20" font-weight="800" letter-spacing="3" fill="{GREY}" {FONT}>MONTAGE 2010</text>
    <text x="170" y="78" text-anchor="middle" font-size="18" fill="{GREY}" {FONT}>boîte aux lettres, zéro substance</text>
    <line x1="40" y1="92" x2="300" y2="18" stroke="{RED}" stroke-width="3"/>
  </g>
  <g transform="translate(488,10)">
    <rect x="0" y="0" width="340" height="110" rx="18" fill="#fff" stroke="{INK}" stroke-width="3"/>
    <text x="170" y="44" text-anchor="middle" font-size="20" font-weight="800" letter-spacing="3" fill="{INK}" {FONT}>MONTAGE 2026</text>
    <text x="170" y="78" text-anchor="middle" font-size="18" fill="{GREY}" {FONT}>vraie société, vraie résidence</text>
  </g>
</svg>
"""

# ---------------------------------------------------------------- Le Codex (livre rouge)
_CODEX = f"""
<svg width="888" height="230" viewBox="0 0 888 230" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(364,6)">
    <path d="M16 10 h136 a12 12 0 0 1 12 12 v160 a12 12 0 0 1 -12 12 h-136 a16 16 0 0 1 -16 -16 v-152 a16 16 0 0 1 16 -16z" fill="{RED}"/>
    <path d="M0 178 a16 16 0 0 0 16 16 h148 v-14 h-148 a9 9 0 0 1 -9 -9z" fill="#B3231F"/>
    <rect x="30" y="0" width="8" height="194" fill="#B3231F"/>
    <text x="96" y="78" text-anchor="middle" font-size="16" letter-spacing="4" font-weight="600" fill="#fff" {FONT}>LE</text>
    <text x="96" y="112" text-anchor="middle" font-size="26" letter-spacing="4" font-weight="800" fill="#fff" {FONT}>CODEX</text>
    <line x1="60" y1="130" x2="132" y2="130" stroke="#fff" stroke-width="1.5" opacity=".7"/>
  </g>
  <text x="444" y="224" text-anchor="middle" font-size="18" letter-spacing="4" font-weight="600" fill="{GREY}" {FONT}>OÙ CRÉER · OÙ DÉTENIR · OÙ VIVRE</text>
</svg>
"""

ILLUSTRATIONS: dict[str, tuple[str, int]] = {
    "phone_front": (_PHONE_FRONT, 320),
    "phone_back": (_PHONE_BACK, 310),
    "geo": (_GEO, 262),
    "laptop": (_LAPTOP, 200),
    "trio": (_TRIO, 170),
    "rules": (_RULES, 150),
    "codex": (_CODEX, 230),
}
