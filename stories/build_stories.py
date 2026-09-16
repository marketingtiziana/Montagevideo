#!/usr/bin/env python3
"""
Génère story-1.html … story-6.html — série « Fermer une LLC » (1080 x 1920).

Tout est dessiné en CSS + SVG inline : aucune image externe, aucune police
distante au rendu (Inter est embarquée en base64 dans webfonts/inter.css).
Le texte de chaque story est regroupé dans STORIES, en bas du fichier.
"""

import pathlib

HERE = pathlib.Path(__file__).parent

# ----------------------------------------------------------------------
# Filigrane : formulaire IRS estompé (gabarit du 5472)
# ----------------------------------------------------------------------

def form_watermark(cls, seed_rows=14):
    """Gabarit de formulaire officiel, tracé au filet fin."""
    rows = []
    y = 250
    for i in range(seed_rows):
        rows.append(f'<line x1="26" y1="{y}" x2="594" y2="{y}"/>')
        # colonnes de saisie
        rows.append(f'<line x1="392" y1="{y}" x2="392" y2="{y + 44}"/>')
        rows.append(f'<line x1="494" y1="{y}" x2="494" y2="{y + 44}"/>')
        if i % 3 == 0:
            rows.append(f'<rect x="36" y="{y + 12}" width="20" height="20"/>')
        y += 44
    ruled = "\n      ".join(rows)
    return f'''<svg class="{cls}" viewBox="0 0 620 880" fill="none" stroke="#DCE4F5"
     stroke-width="1.6" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="14" width="592" height="852"/>
      <line x1="14" y1="120" x2="606" y2="120"/>
      <line x1="430" y1="14" x2="430" y2="120"/>
      <line x1="14" y1="196" x2="606" y2="196"/>
      <line x1="14" y1="248" x2="606" y2="248"/>
      <text x="34" y="74" font-family="Inter" font-size="52" font-weight="800"
            fill="#DCE4F5" stroke="none" letter-spacing="-1">Form 5472</text>
      <text x="34" y="104" font-family="Inter" font-size="17" font-weight="500"
            fill="#DCE4F5" stroke="none">Department of the Treasury &#8212; Internal Revenue Service</text>
      <text x="452" y="62" font-family="Inter" font-size="17" font-weight="600"
            fill="#DCE4F5" stroke="none">OMB No. 1545-0123</text>
      <text x="452" y="96" font-family="Inter" font-size="17" font-weight="500"
            fill="#DCE4F5" stroke="none">Attach to your tax return.</text>
      <text x="34" y="160" font-family="Inter" font-size="21" font-weight="600"
            fill="#DCE4F5" stroke="none">Information Return of a 25% Foreign-Owned</text>
      <text x="34" y="186" font-family="Inter" font-size="21" font-weight="600"
            fill="#DCE4F5" stroke="none">U.S. Corporation or a Foreign Corporation</text>
      <text x="34" y="232" font-family="Inter" font-size="18" font-weight="700"
            fill="#DCE4F5" stroke="none">Part I &#160;&#160;Reporting Corporation</text>
      {ruled}
    </svg>'''


# ----------------------------------------------------------------------
# Éléments graphiques : la porte, fil rouge de la série
# ----------------------------------------------------------------------

FRAME = '''
      <line x1="4" y1="470" x2="396" y2="470" stroke="var(--gold)" stroke-opacity=".38" stroke-width="2"/>
      <path d="M64 470V10h272v460" stroke="var(--gold)" stroke-opacity=".5" stroke-width="2"/>
      <path d="M64 10 90 32M336 10 310 32" stroke="var(--gold)" stroke-opacity=".5" stroke-width="2"/>
      <path d="M90 470V32h220v438" stroke="var(--gold)" stroke-width="3"/>'''


def leaf(edge_x, top_y=52, bottom_y=450, panels=True, handle=True):
    """Battant articulé sur le montant droit ; edge_x = position du chant libre."""
    inner = f'''
      <path d="M310 32 {edge_x} {top_y} {edge_x} {bottom_y} 310 468Z"
            fill="#05080F" fill-opacity=".92" stroke="var(--gold)" stroke-width="3" stroke-linejoin="round"/>'''
    if panels:
        px = edge_x + 20
        inner += f'''
      <path d="M292 62 {px} {top_y + 26} {px} 232 292 238Z" stroke="var(--gold)" stroke-opacity=".38" stroke-width="2"/>
      <path d="M292 266 {px} 258 {px} {bottom_y - 26} 292 438Z" stroke="var(--gold)" stroke-opacity=".38" stroke-width="2"/>'''
    if handle:
        hx = edge_x + 26
        inner += f'''
      <circle cx="{hx}" cy="252" r="7" stroke="var(--gold)" stroke-width="3"/>
      <line x1="{hx}" y1="232" x2="{hx}" y2="272" stroke="var(--gold)" stroke-opacity=".45" stroke-width="2"/>'''
    return inner


def sheet(x, y, w, h, rot, lines=5, opacity=1.0, stroke="var(--gold)", stroke_opacity=".7"):
    """Feuille de papier stylisée (rectangle réglé)."""
    rules = "".join(
        f'<line x1="{x + 16}" y1="{y + 34 + i * ((h - 52) / max(lines - 1, 1)):.0f}" '
        f'x2="{x + w - (16 if i % 2 == 0 else 46)}" '
        f'y2="{y + 34 + i * ((h - 52) / max(lines - 1, 1)):.0f}" '
        f'stroke="{stroke}" stroke-opacity=".3" stroke-width="2"/>'
        for i in range(lines)
    )
    return f'''
      <g transform="rotate({rot} {x + w / 2:.0f} {y + h / 2:.0f})" opacity="{opacity}">
        <rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#070B15" fill-opacity=".94"
              stroke="{stroke}" stroke-opacity="{stroke_opacity}" stroke-width="2.5"/>
        <rect x="{x + 16}" y="{y + 14}" width="{w * 0.42:.0f}" height="8" fill="{stroke}" fill-opacity=".45"/>
        {rules}
      </g>'''


DEFS_GLOW = '''
      <defs>
        <radialGradient id="halo" cx="50%" cy="46%" r="52%">
          <stop offset="0%" stop-color="#D4AF37" stop-opacity=".22"/>
          <stop offset="60%" stop-color="#D4AF37" stop-opacity=".05"/>
          <stop offset="100%" stop-color="#D4AF37" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="gap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#F3DFA2" stop-opacity=".55"/>
          <stop offset="100%" stop-color="#D4AF37" stop-opacity=".12"/>
        </linearGradient>
        <radialGradient id="floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#D4AF37" stop-opacity=".38"/>
          <stop offset="100%" stop-color="#D4AF37" stop-opacity="0"/>
        </radialGradient>
      </defs>'''


def door_ajar(extra="", halo=True, view="0 0 400 500", width=470):
    """Porte entrouverte + rai de lumière dans l'entrebâillement."""
    halo_el = '<circle cx="200" cy="244" r="196" fill="url(#halo)"/>' if halo else ""
    return f'''<svg viewBox="{view}" width="{width}" fill="none" xmlns="http://www.w3.org/2000/svg">
      {DEFS_GLOW}
      {halo_el}
      <ellipse cx="112" cy="470" rx="104" ry="20" fill="url(#floor)"/>
      <path d="M90 32 124 52 124 450 90 470Z" fill="url(#gap)"/>
      {FRAME}
      {leaf(124)}
      {extra}
    </svg>'''


# ---- story 1 : porte entrouverte, léger halo
ART1 = door_ajar()

# ---- story 2 : la porte, une pile de documents devant, tampon 5472
STAMP = '''
      <g transform="rotate(-13 214 348)" opacity=".5">
        <rect x="120" y="300" width="190" height="96" rx="6" stroke="var(--gold)" stroke-width="3"/>
        <rect x="132" y="312" width="166" height="72" rx="4" stroke="var(--gold)" stroke-opacity=".45" stroke-width="1.5"/>
        <text x="215" y="368" text-anchor="middle" font-family="Inter" font-size="54"
              font-weight="800" fill="var(--gold)" letter-spacing="2">5472</text>
      </g>'''

ART2 = door_ajar(
    extra=(
        sheet(24, 250, 150, 196, -9, lines=5, stroke_opacity=".45")
        + sheet(54, 276, 150, 196, -3, lines=5, stroke_opacity=".6")
        + sheet(92, 300, 158, 198, 4, lines=6)
        + STAMP
    )
)

# ---- story 3 : les documents forment un mur devant la porte
WALL = "".join(
    sheet(x, y, 132, 168, rot, lines=4, stroke_opacity=op)
    for x, y, rot, op in [
        (10, 214, -6, ".35"), (134, 206, 2, ".4"), (258, 216, 7, ".35"),
        (-4, 300, 3, ".5"), (122, 296, -3, ".6"), (250, 302, 4, ".5"),
        (16, 384, -4, ".65"), (140, 380, 2, ".8"), (264, 388, 6, ".65"),
    ]
)
ART3 = door_ajar(extra=WALL, halo=False, width=520)

# ---- story 4 : la porte close, enchaînée, cadenassée
def chain(x1, y1, x2, y2, links=13):
    dx, dy = (x2 - x1) / (links - 1), (y2 - y1) / (links - 1)
    ang = 0
    out = []
    for i in range(links):
        cx, cy = x1 + dx * i, y1 + dy * i
        ang = 34 if i % 2 else -34
        out.append(f'<ellipse cx="{cx:.0f}" cy="{cy:.0f}" rx="11" ry="19" '
                   f'transform="rotate({ang} {cx:.0f} {cy:.0f})" '
                   f'stroke="var(--gold)" stroke-width="3.2"/>')
    return "".join(out)


ART4 = f'''<svg viewBox="0 0 400 500" width="470" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#E05C5C" stop-opacity=".16"/>
          <stop offset="100%" stop-color="#E05C5C" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="200" cy="250" r="190" fill="url(#cold)"/>
      <line x1="4" y1="470" x2="396" y2="470" stroke="var(--gold)" stroke-opacity=".3" stroke-width="2"/>
      <path d="M64 470V10h272v460" stroke="var(--gold)" stroke-opacity=".4" stroke-width="2"/>
      <path d="M64 10 90 32M336 10 310 32" stroke="var(--gold)" stroke-opacity=".4" stroke-width="2"/>
      <path d="M90 470V32h220v438" stroke="var(--gold)" stroke-width="3"/>
      <rect x="102" y="44" width="196" height="414" fill="#05080F" fill-opacity=".92"
            stroke="var(--gold)" stroke-opacity=".75" stroke-width="2.5"/>
      <rect x="122" y="70" width="156" height="158" stroke="var(--gold)" stroke-opacity=".3" stroke-width="2"/>
      <rect x="122" y="266" width="156" height="158" stroke="var(--gold)" stroke-opacity=".3" stroke-width="2"/>
      <circle cx="136" cy="250" r="7" stroke="var(--gold)" stroke-width="3"/>
      {chain(72, 178, 330, 246)}
      {chain(70, 372, 328, 302)}
      <g>
        <rect x="160" y="252" width="82" height="70" rx="10" fill="#0A0F1E"
              stroke="var(--red)" stroke-width="4"/>
        <path d="M177 252v-22a24 24 0 0 1 48 0v22" stroke="var(--red)" stroke-width="4"/>
        <circle cx="201" cy="282" r="9" stroke="var(--red)" stroke-width="3.5"/>
        <line x1="201" y1="290" x2="201" y2="306" stroke="var(--red)" stroke-width="3.5"/>
      </g>
    </svg>'''

# ---- story 5 : la porte et le sablier
HOURGLASS = '''
      <g transform="translate(408 96)">
        <defs>
          <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#F3DFA2" stop-opacity=".85"/>
            <stop offset="100%" stop-color="#D4AF37" stop-opacity=".45"/>
          </linearGradient>
        </defs>
        <line x1="6" y1="6" x2="146" y2="6" stroke="var(--gold)" stroke-width="4" stroke-linecap="round"/>
        <line x1="6" y1="290" x2="146" y2="290" stroke="var(--gold)" stroke-width="4" stroke-linecap="round"/>
        <path d="M22 6 22 26 76 148 22 270 22 290" stroke="var(--gold)" stroke-width="3"/>
        <path d="M130 6 130 26 76 148 130 270 130 290" stroke="var(--gold)" stroke-width="3"/>
        <path d="M34 34 118 34 76 128Z" fill="url(#sand)"/>
        <path d="M50 264 102 264 76 214Z" fill="url(#sand)" fill-opacity=".75"/>
        <line x1="76" y1="150" x2="76" y2="238" stroke="#F3DFA2" stroke-opacity=".7" stroke-width="2.5"/>
        <line x1="16" y1="18" x2="136" y2="18" stroke="var(--gold)" stroke-opacity=".35" stroke-width="2"/>
        <line x1="16" y1="278" x2="136" y2="278" stroke="var(--gold)" stroke-opacity=".35" stroke-width="2"/>
      </g>'''

ART5 = f'''<svg viewBox="0 0 580 500" width="640" fill="none" xmlns="http://www.w3.org/2000/svg">
      {DEFS_GLOW}
      <circle cx="200" cy="244" r="196" fill="url(#halo)"/>
      <ellipse cx="112" cy="470" rx="104" ry="20" fill="url(#floor)"/>
      <path d="M90 32 124 52 124 450 90 470Z" fill="url(#gap)"/>
      {FRAME}
      {leaf(124)}
      {HOURGLASS}
    </svg>'''

# ---- story 6 : la porte grande ouverte, lumière dorée
ART6 = '''<svg viewBox="0 0 400 560" width="470" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#F3DFA2" stop-opacity=".55"/>
          <stop offset="55%" stop-color="#D4AF37" stop-opacity=".22"/>
          <stop offset="100%" stop-color="#D4AF37" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="doorway" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FBF0CE" stop-opacity=".5"/>
          <stop offset="62%" stop-color="#E7C765" stop-opacity=".26"/>
          <stop offset="100%" stop-color="#D4AF37" stop-opacity=".12"/>
        </linearGradient>
        <radialGradient id="bloom" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#D4AF37" stop-opacity=".3"/>
          <stop offset="100%" stop-color="#D4AF37" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="186" cy="250" r="230" fill="url(#bloom)"/>
      <path d="M92 468 268 450 398 556 -24 556Z" fill="url(#beam)"/>
      <path d="M90 32 268 58 268 446 90 470Z" fill="url(#doorway)"/>
      <line x1="4" y1="470" x2="396" y2="470" stroke="var(--gold)" stroke-opacity=".45" stroke-width="2"/>
      <path d="M64 470V10h272v460" stroke="var(--gold)" stroke-opacity=".5" stroke-width="2"/>
      <path d="M64 10 90 32M336 10 310 32" stroke="var(--gold)" stroke-opacity=".5" stroke-width="2"/>
      <path d="M90 470V32h220v438" stroke="var(--gold)" stroke-width="3"/>
      <path d="M310 32 268 58 268 446 310 468Z" fill="#05080F" fill-opacity=".9"
            stroke="var(--gold)" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="288" cy="252" r="6" stroke="var(--gold)" stroke-width="3"/>
    </svg>'''


# ----------------------------------------------------------------------
# Textes et mise en page
# ----------------------------------------------------------------------

STORIES = [
    dict(
        title="Fermer une LLC — 1/6",
        art=ART1,
        art_style="justify-content:center;",
        copy_style="gap:52px;",
        body='''
        <p class="hook">Personne ne pose jamais cette question avant d'ouvrir une LLC.</p>
        <p class="quote">« Et le jour où je veux la <span class="gold">fermer</span>,
           ça se passe comment ? »</p>
        <p class="para">C'est pourtant là que les mauvaises surprises sortent.
           <span class="strong">Toutes en même temps.</span></p>''',
    ),
    dict(
        title="Fermer une LLC — 2/6",
        art=ART2,
        art_style="justify-content:center;",
        copy_style="gap:46px;",
        body='''
        <p class="hook">Une LLC ne se ferme pas en cliquant sur un bouton.</p>
        <p class="para">Pour la dissoudre proprement, il faut être à jour.
           Tous les formulaires <span class="gold">5472</span> déposés,
           <span class="gold">chaque année</span> depuis la création.</p>
        <p class="para">C'est au moment de partir qu'on te demande les comptes.</p>''',
    ),
    dict(
        title="Fermer une LLC — 3/6",
        art=ART3,
        art_style="justify-content:center;margin-bottom:26px;",
        copy_style="gap:38px;",
        body='''
        <div class="years" style="margin-bottom:14px;">
          <div class="year"><b>2022</b><span>MANQUANT</span></div>
          <div class="year"><b>2023</b><span>MANQUANT</span></div>
          <div class="year"><b>2024</b><span>MANQUANT</span></div>
          <div class="year"><b>2025</b><span>MANQUANT</span></div>
        </div>
        <p class="hook" style="font-size:50px;">Tu veux fermer ta LLC ouverte en 2022,
           celle qui n'a presque pas servi.</p>
        <p class="para" style="font-size:35px;">On te demande les déclarations
           2022, 2023, 2024, 2025. <span class="strong">Tu n'en as aucune.</span></p>
        <p class="para" style="font-size:35px;">Chaque année manquante : jusqu'à
          <span class="figure">25 000 $</span>
          de pénalité. Ta LLC « gratuite » a un ticket de sortie à 6 chiffres.</p>''',
    ),
    dict(
        title="Fermer une LLC — 4/6",
        art=ART4,
        art_style="justify-content:center;",
        copy_style="gap:46px;",
        body='''
        <p class="hook">Tu ne peux pas juste l'abandonner en te disant qu'elle mourra toute seule.</p>
        <p class="para">Une LLC abandonnée continue d'exister. Les obligations continuent
           de courir. Les pénalités continuent de s'empiler.</p>
        <p class="para">C'est une porte que tu ne peux fermer
           <span class="gold">qu'en règle</span>. Ou laisser ouverte
           <span class="red">pour toujours</span>.</p>''',
    ),
    dict(
        title="Fermer une LLC — 5/6",
        art=ART5,
        art_style="justify-content:flex-start;margin-left:-40px;",
        copy_style="gap:46px;",
        body='''
        <p class="hook">Le meilleur moment pour régler ça, c'est
           <span class="gold">avant</span> de vouloir sortir.</p>
        <p class="para">Tant que rien n'est tombé, la mise en conformité est gérable.
           Le jour où tu <span class="strong">dois</span> fermer, vendre ou restructurer,
           tu n'as plus le choix du calendrier.</p>
        <p class="para">Et l'urgence, en fiscalité, coûte toujours plus cher.</p>''',
        theme="--bg-top:#16223F;--bg-mid:#0C1326;--bg-bottom:#04060C;--glow:rgba(58,84,142,.55);",
    ),
    dict(
        title="Fermer une LLC — 6/6",
        art=ART6,
        art_style="justify-content:center;",
        copy_style="gap:44px;",
        body='''
        <p class="para" style="font-size:38px;">Dans la vidéo : les obligations de ta LLC,
           comment vérifier ton retard, et les deux façons d'en sortir proprement.</p>
        <div class="cta">
          <p class="cta-line">Envoie</p>
          <div class="tag">LLC</div>
          <p class="cta-line" style="margin-top:22px;">en DM et tu la reçois direct.</p>
        </div>''',
        theme="--bg-top:#0C1426;--glow:rgba(60,62,96,.5);",
    ),
]

PAGE = '''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>{title}</title>
<link rel="stylesheet" href="webfonts/inter.css">
<link rel="stylesheet" href="story.css">
</head>
<body>
  <div class="canvas"{theme}>
    <div class="layer layer--form">
      {form_a}
      {form_b}
    </div>
    <div class="layer layer--grid"></div>
    <div class="layer layer--scrim"></div>
    <div class="layer layer--vignette"></div>

    <div class="content">
      <div class="index">{n}/6</div>
      <div class="art" style="{art_style}">{art}</div>
      <div class="copy" style="{copy_style}">{body}
      </div>
    </div>
  </div>
</body>
</html>
'''


def build():
    form_a = form_watermark("form-a")
    form_b = form_watermark("form-b", seed_rows=12)
    for i, s in enumerate(STORIES, start=1):
        art = s["art"]
        if s.get("art_scale"):
            art = art.replace('width="', f'style="zoom:{s["art_scale"]}" width="', 1)
        html = PAGE.format(
            title=s["title"],
            n=i,
            theme=f' style="{s["theme"]}"' if s.get("theme") else "",
            form_a=form_a,
            form_b=form_b,
            art=art,
            art_style=s["art_style"],
            copy_style=s["copy_style"],
            body=s["body"],
        )
        (HERE / f"story-{i}.html").write_text(html, encoding="utf-8")
        print(f"story-{i}.html")


if __name__ == "__main__":
    build()
