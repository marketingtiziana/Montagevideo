"""Génère les graphismes (HTML/CSS animés) puis les rend en séquences PNG (Playwright).

usage : python3 gfx.py [id ...]   (sans argument : tous)
Les pages HTML sont dans build/gfx/<id>/index.html, les images dans build/gfx/<id>/f0000.png ...
"""
import json, os, sys, html, subprocess, shutil
from timeline import G, FPS, TITLE_DUR, END_DUR, HERE
from plan import build_clips, src2out_near

ASSETS = os.environ.get('V5_ASSETS', os.path.join(HERE, 'assets'))   # polices, libs carto, captures
OUT = os.path.join(HERE, 'build', 'gfx')
VIDEO_BOX = (72, 150, 1152, 648)      # x, y, w, h de la vignette vidéo en mode SPLIT
E = html.escape

def esc(t):  # échappe + insécables typographiques françaises
    t = E(t)
    for p in [' :', ' ;', ' ?', ' !', ' %', ' €', '« ', ' »']:
        t = t.replace(p, p.replace(' ', ' '))
    return t

# ----------------------------------------------------------------------------- timing
CLIPS, TOTAL_F = build_clips()

def span(g):
    """Fenêtre de sortie [début, fin] (s) d'un graphisme."""
    if g['id'] == 'title':
        c = [c for c in CLIPS if c['kind'] == 'title'][0]; return c['o_f'] / FPS, (c['o_f'] + c['n_f']) / FPS
    if g['id'] == 'endcard':
        c = [c for c in CLIPS if c['kind'] == 'end'][0]
        return c['o_f'] / FPS - 2.2, (c['o_f'] + c['n_f']) / FPS
    a = src2out_near(g['src'][0], CLIPS, True); b = src2out_near(g['src'][1], CLIPS, False)
    return round(a * FPS) / FPS, round(b * FPS) / FPS

def rel(g, t):
    a, _ = span(g)
    return max(0.0, src2out_near(t, CLIPS, True) - a)

def chapter_of(g):
    a = g['src'][0] if 'src' in g else 0
    lab = "Introduction"
    for h in G:
        if h['tpl'] == 'chapter' and h['src'][0] <= a: lab = f"Étape {h['n']} · {h['title']}"
    return lab

def adjacent_split(g):
    """(précédent collé, suivant collé) : pas d'animation d'entrée/sortie entre deux SPLIT contigus."""
    a, b = span(g); prev = nxt = False
    for h in G:
        if h is g or h['kind'] != 'SPLIT': continue
        ha, hb = span(h)
        if abs(hb - a) < 0.12: prev = True
        if abs(ha - b) < 0.12: nxt = True
    return prev, nxt

# ----------------------------------------------------------------------------- page skeleton
def page(body, css="", dur=5.0, js=""):
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="{ASSETS}/base.css">
<style>{css}</style></head><body>{body}
<script>window.DUR={dur};{js}</script></body></html>"""

def A(name, d, dur=0.7, ease="var(--ease)"):
    return f"animation:{name} {dur}s {ease} {d:.2f}s both;"

def A2(*anims):
    """Plusieurs animations sur un même élément : A2((nom, délai, durée[, easing]), ...)."""
    parts = [f"{a[0]} {a[2]}s {a[3] if len(a) > 3 else 'var(--ease)'} {a[1]:.2f}s both" for a in anims]
    return "animation:" + ", ".join(parts) + ";"

def ROW(d):  # entrée d'une ligne d'info : glissé rebondi + surbrillance qui s'estompe
    return A2(("slideR", d, .5, "var(--spring)"), ("flash", d, 1.8))

BRAND = os.path.join(ASSETS, 'brand')

def out_anim(dur, length=0.4):
    return f"animation:fadeAll {length}s var(--easeIn) {max(0, dur-length):.2f}s forwards;"

PAPER_CSS = """
.paper{position:absolute;inset:0;background:var(--ivory)}
.paper:after{content:"";position:absolute;inset:0;opacity:.35;mix-blend-mode:multiply;
 background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.2  0 0 0 0 0.18  0 0 0 0 0.15  0 0 0 .09 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")}
.ink{position:absolute;inset:0;background:radial-gradient(120% 90% at 30% 35%,#1B1550 0%,#0D082E 55%,#07041A 100%)}
@keyframes fadeAll{to{opacity:0}}
@keyframes flash{0%{background-color:rgba(91,75,255,.16)}100%{background-color:rgba(91,75,255,0)}}
.bug{position:absolute;right:70px;top:70px;width:44px;height:44px}
"""

# ----------------------------------------------------------------------------- SPLIT frame
def split_frame(g, inner, inner_css=""):
    a, b = span(g); dur = b - a
    prev, nxt = adjacent_split(g)
    x, y, w, h = VIDEO_BOX
    d0 = 0.0 if prev else 0.35
    outst = "" if nxt else out_anim(dur, 0.4)
    css = PAPER_CSS + f"""
.vbox{{position:absolute;left:{x}px;top:{y}px;width:{w}px;height:{h}px;border-radius:14px;
  box-shadow:0 30px 60px -28px rgba(13,8,46,.45),0 0 0 1px rgba(13,8,46,.08);background:#0D082E;{'' if prev else A('fade', 0.25, 0.35)}}}
.chap{{position:absolute;left:{x}px;top:88px;font:600 19px/1 var(--sans);letter-spacing:.2em;text-transform:uppercase;color:var(--slate);{A('fade', d0, .6)}}}
.chap b{{color:var(--gold);font-weight:700}}
.panel{{position:absolute;left:1290px;top:{y}px;width:560px;height:{h}px;display:flex;flex-direction:column;{outst}}}
.ptitle{{font:600 40px/1.12 var(--serif);color:var(--ink);margin:0 0 26px;letter-spacing:-.01em}}
.prule{{height:2px;width:72px;background:var(--gold);transform-origin:left;margin:0 0 26px}}
.note{{margin-top:auto;font:400 17px/1.35 var(--sans);color:var(--slate)}}
{inner_css}"""
    lab = chapter_of(g)
    parts = lab.split(' · ', 1)
    chap = f"<b>{esc(parts[0])}</b>{(' · ' + esc(parts[1])) if len(parts) > 1 else ''}"
    body = f"""<div class="paper"></div><div class="chap">{chap}</div><div class="vbox"></div>
<div class="panel">{inner}</div><img class="bug" src="{BRAND}/icon_navy.png" style="{A('fade', d0, .6)}">"""
    return page(body, css, dur)

def ptitle(g, text, d):
    return (f'<div class="ptitle" style="{A("fadeUp", d, .8)}">{esc(text)}</div>'
            f'<div class="prule" style="{A("grow", d + .15, .7)}"></div>')

LIST_CSS = """
.row{display:flex;gap:18px;align-items:flex-start;padding:15px 0;border-top:1px solid var(--rule)}
.row:last-of-type{border-bottom:1px solid var(--rule)}
.rn{font:500 30px/1 var(--serif);color:var(--gold);min-width:44px;font-feature-settings:"lnum"}
.rt{font:500 27px/1.28 var(--sans);color:var(--ink)}
.rdot{width:10px;height:10px;border-radius:50%;background:var(--gold);margin-top:11px;flex:none}
.hot{position:relative}
.hot:before{content:"";position:absolute;left:-22px;top:12px;bottom:12px;width:4px;background:var(--gold)}
.tag{display:inline-block;margin-top:8px;font:700 15px/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;color:#fff;background:var(--gold);padding:7px 10px;border-radius:3px}
.punch{margin-top:22px;padding:20px 22px;background:var(--ink);color:var(--ivory);border-radius:8px;font:400 28px/1.3 var(--serif)}
.punch b{color:var(--gold2);font-weight:500}
.foot{margin-top:20px;font:500 24px/1.3 var(--serif);color:var(--ink)}
.ref{display:inline-block;font:600 15px/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--slate);border:1px solid var(--rule);padding:7px 9px;border-radius:3px;margin-bottom:14px}
"""

def t_steps(g):
    d = lambda t: max(0.45, rel(g, t))
    items = ""
    for i, (txt, t) in enumerate(g['items']):
        lead = f'<div class="rn">{i+1:02d}</div>' if g.get('numbered', True) else '<div class="rdot"></div>'
        items += f'<div class="row" style="{ROW(d(t))}">{lead}<div class="rt">{esc(txt)}</div></div>'
    extra = ""
    if g.get('ref'): extra = f'<div><span class="ref" style="{A("fade", .9, .6)}">{esc(g["ref"])}</span></div>'
    if g.get('punch'):
        txt, t = g['punch']
        extra2 = f'<div class="punch" style="{A("fadeUp", d(t), .7)}">{esc(txt)}</div>'
    else: extra2 = ""
    foot = f'<div class="foot" style="{A("fadeUp", d(g["foot"][1]), .7)}">{esc(g["foot"][0])}</div>' if g.get('foot') else ""
    note = f'<div class="note" style="{A("fade", 1.2, .8)}">{esc(g["note"])}</div>' if g.get('note') else ""
    return split_frame(g, ptitle(g, g['title'], .45) + extra + items + extra2 + foot + note, LIST_CSS)

def t_roadmap(g):
    d = lambda t: max(0.45, rel(g, t))
    rows = ""
    for i, s in enumerate(g['steps']):
        hot = i == g.get('hot')
        tag = f'<div><span class="tag" style="{A("fade", d(g["at"][i]) + .5, .5)}">{esc(g["hot_label"])}</span></div>' if hot else ""
        rows += (f'<div class="row{" hot" if hot else ""}" style="{ROW(d(g["at"][i]))}">'
                 f'<div class="rn">{i+1:02d}</div><div><div class="rt">{esc(s)}</div>{tag}</div></div>')
    sub = f'<div style="font:500 22px/1 var(--sans);color:var(--slate);margin:-10px 0 22px;{A("fade", .9, .6)}">{esc(g["sub"])}</div>'
    return split_frame(g, ptitle(g, g['title'], .45) + sub + rows, LIST_CSS)

COL_CSS = LIST_CSS + """
.blk{padding:18px 0 14px;border-top:1px solid var(--rule)}
.bh{font:700 17px/1 var(--sans);letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:12px}
.bi{font:500 25px/1.3 var(--sans);color:var(--ink);padding:5px 0 5px 22px;position:relative}
.bi:before{content:"";position:absolute;left:0;top:16px;width:9px;height:2px;background:var(--gold)}
.verdict{font:500 30px/1.15 var(--serif);margin:2px 0 8px}
.warn .verdict{color:var(--warn)} .ok .verdict{color:var(--ok)} .gold .verdict{color:var(--ink)}
.warn .bh{color:var(--warn)} .ok .bh{color:var(--ok)}
"""

def t_twocol(g):
    d = lambda t: max(0.45, rel(g, t))
    out = ptitle(g, g['title'], .45)
    for c in g['cols']:
        out += f'<div class="blk" style="{A("fadeUp", d(c["at"]), .6)}"><div class="bh">{esc(c["h"])}</div>'
        for txt, t in c['items']: out += f'<div class="bi" style="{ROW(d(t))}">{esc(txt)}</div>'
        out += '</div>'
    return split_frame(g, out, COL_CSS)

def t_verdict(g):
    d = lambda t: max(0.45, rel(g, t))
    out = ptitle(g, g['title'], .45)
    for side in ('left', 'right'):
        c = g[side]
        out += (f'<div class="blk {c["tone"]}" style="{A("fadeUp", d(c["at"]), .6)}"><div class="bh">{esc(c["h"])}</div>'
                f'<div class="verdict" style="{A("fadeUp", d(c["vat"]), .6)}">{esc(c["verdict"])}</div>')
        for txt, t in c['items']: out += f'<div class="bi" style="{ROW(d(t))}">{esc(txt)}</div>'
        out += '</div>'
    out += f'<div class="foot" style="{A("fadeUp", d(g["foot_at"]), .7)}">{esc(g["foot"])}</div>'
    if g.get('note'): out += f'<div class="note" style="{A("fade", 1.4, .8)}">{esc(g["note"])}</div>'
    return split_frame(g, out, COL_CSS)

def t_compare(g):
    d = lambda t: max(0.45, rel(g, t))
    out = ptitle(g, g['title'], .45)
    for side in ('left', 'right'):
        c = g[side]
        out += f'<div class="blk {c["tone"]}" style="{A("fadeUp", d(c["at"]), .6)}"><div class="bh">{esc(c["h"])}</div>'
        for txt, t in c['rows']: out += f'<div class="bi" style="{ROW(d(t))}">{esc(txt)}</div>'
        out += '</div>'
    for txt, t in g.get('foot', []):
        out += f'<div class="foot" style="font-size:22px;margin-top:14px;{A("fadeUp", d(t), .7)}">{esc(txt)}</div>'
    if g.get('note'): out += f'<div class="note" style="{A("fade", 1.4, .8)}">{esc(g["note"])}</div>'
    return split_frame(g, out, COL_CSS.replace('font:500 30px/1.15', 'font:500 27px/1.15').replace('.bi{font:500 25px', '.bi{font:500 23px'))

def t_rule(g):
    d = lambda t: max(0.45, rel(g, t))
    css = LIST_CSS + """
.rr{display:flex;gap:26px;align-items:center;padding:20px 0;border-top:1px solid var(--rule)}
.rr:last-of-type{border-bottom:1px solid var(--rule)}
.big{font:600 100px/0.9 var(--serif);color:var(--gold);min-width:120px;text-align:center}
.rh{font:600 28px/1.2 var(--sans);color:var(--ink)} .rs{font:400 21px/1.35 var(--sans);color:var(--slate);margin-top:6px}
"""
    out = ptitle(g, g['title'], .45)
    for n, h, s, t in g['rows']:
        out += (f'<div class="rr" style="{ROW(d(t))}"><div class="big">{n}</div>'
                f'<div><div class="rh">{esc(h)}</div><div class="rs">{esc(s)}</div></div></div>')
    return split_frame(g, out, css)

def t_statement(g):
    a, b = span(g); dur = b - a
    d = lambda t: max(0.45, rel(g, t))
    css = """.st1{font:400 54px/1.1 var(--serif);color:var(--ink);letter-spacing:-.015em}
.st2{font:600 54px/1.1 var(--serif);color:var(--warn);letter-spacing:-.015em;margin-top:10px}
.neq{font:300 120px/1 var(--serif);color:var(--gold);margin:6px 0 4px}"""
    out = (f'<div class="kicker" style="margin-bottom:26px;{A("fade", .4, .6)}">{esc(g["kicker"].split(" · ")[0])}</div>'
           f'<div class="st1" style="{A("fadeUp", d(g["tat"]), .8)}">{esc(g["title"])}</div>'
           f'<div class="neq" style="{A("fade", d(g["t2at"]) - .1, .5)}">≠</div>'
           f'<div class="st2" style="{A("fadeUp", d(g["t2at"]), .8)}">{esc(g["title2"])}</div>')
    return split_frame(g, '<div style="margin-top:60px">' + out + '</div>', css)

# ----------------------------------------------------------------------------- FULL
def t_title(g):
    a, b = span(g); dur = b - a
    css = PAPER_CSS + f"""
.wrap{{position:absolute;left:200px;top:340px;width:1400px;{out_anim(dur, .45)}}}
.t{{font:500 92px/1.04 var(--serif);color:var(--ivory);letter-spacing:-.02em;{A("fadeUp", .35, 1.1)}}}
.k{{{A("fade", .15, .8)};margin-bottom:34px}}
.r{{height:2px;width:120px;background:var(--gold);transform-origin:left;margin-top:42px;{A("grow", .8, .9)}}}
.sig{{position:absolute;left:200px;bottom:120px;font:500 20px/1 var(--sans);letter-spacing:.24em;text-transform:uppercase;color:rgba(245,240,232,.55);{A("fade", 1.0, .8)}{out_anim(dur, .45)}}}"""
    body = f'<div class="ink"></div><div class="wrap"><div class="kicker k">{esc(g["kicker"])}</div><div class="t">{esc(g["title"]).replace("t'expatrier ", "t'expatrier<br>").replace("t&#x27;expatrier ", "t&#x27;expatrier<br>")}</div><div class="r"></div></div><div class="sig">Tiziana</div>'
    return page(body, css, dur)

def t_chapter(g):
    a, b = span(g); dur = b - a
    dots = "".join(f'<div class="dot{" on" if i+1 == g["n"] else (" done" if i+1 < g["n"] else "")}"></div>' for i in range(5))
    css = PAPER_CSS + f"""
.all{{position:absolute;inset:0;{A("fade", 0, .3)}}}
.all.o{{{out_anim(dur, .35)}}}
.num{{position:absolute;left:180px;top:250px;font:600 340px/0.8 var(--serif);color:var(--gold);{A("fadeUp", .1, 1.0)}}}
.txt{{position:absolute;left:720px;top:300px;width:1050px}}
.k{{{A("fade", .25, .7)}margin-bottom:30px}}
.t{{font:500 80px/1.06 var(--serif);color:var(--ink);letter-spacing:-.02em;{A("fadeUp", .35, .9)}}}
.r{{height:2px;width:100px;background:var(--gold);transform-origin:left;margin-top:40px;{A("grow", .7, .8)}}}
.prog{{position:absolute;left:720px;top:820px;display:flex;gap:14px;{A("fade", .6, .7)}}}
.dot{{width:64px;height:4px;background:var(--rule)}} .dot.done{{background:rgba(91,75,255,.45)}} .dot.on{{background:var(--gold)}}"""
    body = f"""<div class="all o"><div class="all"><div class="paper"></div><div class="num">0{g['n']}</div>
<div class="txt"><div class="kicker k">Étape {g['n']} sur 5</div><div class="t">{esc(g['title'])}</div><div class="r"></div></div>
<div class="prog">{dots}</div></div></div>"""
    return page(body, css, dur)

def t_recap(g):
    a, b = span(g); dur = b - a
    d = lambda t: max(0.5, rel(g, t))
    rows = ""
    for i, s in enumerate(g['steps']):
        hot = i == g.get('hot')
        tag = f'<span class="tag" style="margin-left:18px;vertical-align:middle;{A("fade", d(g["at"][i]) + .5, .5)}">{esc(g["hot_label"])}</span>' if hot else ""
        rows += (f'<div class="row{" hot" if hot else ""}" style="{ROW(d(g["at"][i]))}"><div class="rn">{i+1:02d}</div>'
                 f'<div class="rt" style="font-size:36px">{esc(s)}{tag}</div></div>')
    css = PAPER_CSS + LIST_CSS + f"""
.all{{position:absolute;inset:0;{A("fade", 0, .35)}}} .o{{{out_anim(dur, .4)}}}
.wrap{{position:absolute;left:240px;top:150px;width:1440px}}
.row{{padding:22px 0}} .rn{{font-size:40px;min-width:80px}}
.h{{font:600 66px/1 var(--serif);color:var(--ink);margin-bottom:22px;{A("fadeUp", .2, .8)}}}"""
    body = f'<div class="all o"><div class="all"><div class="paper"></div><div class="wrap"><div class="kicker" style="margin-bottom:22px;{A("fade", .1, .6)}">En résumé</div><div class="h">{esc(g["title"])}</div>{rows}</div></div></div>'
    return page(body, css, dur)

CITIES = {"Paris": (2.35, 48.86), "Bali": (115.19, -8.41), "Bangkok": (100.5, 13.75), "Dubaï": (55.27, 25.2),
          "Singapour": (103.82, 1.35), "Suisse": (7.45, 46.95)}

def t_map(g):
    a, b = span(g); dur = b - a
    fams = []
    for i, (name, cities, t) in enumerate(g['families']):
        on = g['focus'] is None or g['focus'] == i
        at = rel(g, t) if t is not None else (0.6 + 0.35 * i if g['focus'] is None else 0.3)
        if g['focus'] is None and t is None: at = rel(g, g.get('intro_at', g['src'][0])) + 0.4 * i + 0.3
        fams.append(dict(name=name, cities=cities, at=at, on=on))
    js = f"""
const FAMS={json.dumps(fams, ensure_ascii=False)}; const C={json.dumps(CITIES)};
(async()=>{{
 const topo=window.TOPO;
 const land=topojson.feature(topo,topo.objects.countries);
 const pts={{type:'MultiPoint',coordinates:Object.values(C).concat([[-8,58],[128,-14]])}};
 const proj=d3.geoNaturalEarth1().rotate([-58,0]).fitExtent([[640,290],[1840,1010]],pts);
 const path=d3.geoPath(proj); const svg=document.getElementById('m');
 let s='';
 for(const f of land.features){{ const fr=f.id==='250'; const ch=f.id==='756';
   s+=`<path d="${{path(f)}}" class="${{fr?'fr':(ch?'ch':'c')}}"/>`; }}
 const P=n=>proj(C[n]);
 const [px,py]=P('Paris');
 FAMS.forEach((fm,i)=>{{ fm.cities.forEach((cn,j)=>{{ const [x,y]=P(cn);
   const mx=(px+x)/2, my=Math.min(py,y)-120-40*j;
   const dd=`M${{px}},${{py}} Q${{mx}},${{my}} ${{x}},${{y}}`;
   const len=Math.hypot(x-px,y-py)*1.25;
   const op=fm.on?1:.22, del=fm.at+0.12*j;
   s+=`<path d="${{dd}}" class="arc" style="opacity:${{op}};stroke-dasharray:${{len}};stroke-dashoffset:${{len}};animation:draw 1.1s var(--ease) ${{del}}s forwards"/>`;
   s+=`<circle cx="${{x}}" cy="${{y}}" r="9" class="pin" style="opacity:0;animation:pin .5s var(--ease) ${{del+0.8}}s forwards;--o:${{op}}"/>`;
   s+=`<text x="${{x+16}}" y="${{y+8}}" class="lab" style="opacity:0;animation:pin .5s var(--ease) ${{del+0.9}}s forwards;--o:${{op}}">${{cn}}</text>`;
 }}); }});
 s+=`<circle cx="${{px}}" cy="${{py}}" r="10" class="home"/><text x="${{px-18}}" y="${{py-20}}" text-anchor="end" class="lab home-l">Paris</text>`;
 svg.innerHTML=s;
 const leg=document.getElementById('leg');
 leg.innerHTML=FAMS.map((fm,i)=>`<div class="lg ${{fm.on?'on':''}}" style="animation:fadeUp .6s var(--ease) ${{fm.at}}s both"><span>0${{i+1}}</span>${{fm.name}}</div>`).join('');
 window.READY=true;
}})();"""
    css = PAPER_CSS + f"""
.all{{position:absolute;inset:0;{A("fade", 0, .4)}}} .o{{{out_anim(dur, .4)}}}
svg{{position:absolute;inset:0}}
.c{{fill:rgba(245,240,232,.09);stroke:rgba(245,240,232,.16);stroke-width:.6}}
.fr{{fill:rgba(91,75,255,.75);stroke:none}} .ch{{fill:rgba(245,240,232,.22)}}
.arc{{fill:none;stroke:var(--gold2);stroke-width:2.2}}
.pin{{fill:var(--gold2);stroke:#0D082E;stroke-width:3}} .home{{fill:var(--ivory);stroke:var(--gold);stroke-width:4}}
.lab{{font:600 24px var(--sans);fill:var(--ivory);letter-spacing:.02em}} .home-l{{fill:var(--gold2)}}
@keyframes draw{{to{{stroke-dashoffset:0}}}} @keyframes pin{{to{{opacity:var(--o,1)}}}}
.hd{{position:absolute;left:110px;top:96px}}
.hd .t{{font:500 58px/1.05 var(--serif);color:var(--ivory);margin-top:18px;{A("fadeUp", .25, .8)}}}
#leg{{position:absolute;left:110px;top:260px;display:flex;flex-direction:column;gap:14px}}
.lg{{font:500 26px/1 var(--sans);color:rgba(245,240,232,.38)}} .lg.on{{color:var(--ivory)}}
.lg span{{font:500 22px var(--serif);color:var(--gold);margin-right:14px}}"""
    head = "Les grandes familles de destination" if g['focus'] is None else f"Famille {g['focus']+1} · {g['families'][g['focus']][0]}"
    body = f'<div class="all o"><div class="all"><div class="ink"></div><svg id="m" viewBox="0 0 1920 1080"></svg><div class="hd"><div class="kicker" style="{A("fade", .1, .6)}">Étape 2</div><div class="t">{esc(head)}</div></div><div id="leg"></div></div></div>'
    scripts = "".join(f'<script src="{ASSETS}/lib/{f}"></script>' for f in ["d3-array.min.js", "d3-geo.min.js", "d3-geo-projection.min.js", "topojson-client.min.js", "countries-50m.js"])
    return page(body + scripts, css, dur, js)

SHOTS = {"domicile": dict(img="dom_full.png", crop=(420, 640, 2460, 1910),
                          boxes={"intro": (639, 1060, 2238, 1170), "foyer": (639, 1221, 2238, 1353),
                                 "travail": (639, 1557, 2238, 1689), "centre": (639, 1725, 2238, 1857)})}

def t_broll(g):
    a, b = span(g); dur = b - a
    sh = SHOTS[g['shot']]; x0, y0, x1, y1 = sh['crop']
    W = 1400; sc = W / (x1 - x0); H = (y1 - y0) * sc
    marks = ""
    for key, t in g['marks']:
        bx0, by0, bx1, by1 = sh['boxes'][key]
        l, tp, w, h = (bx0 - x0) * sc, (by0 - y0) * sc, (bx1 - bx0) * sc, (by1 - by0) * sc
        style = "border-bottom:5px solid var(--gold);" if key == 'intro' else "border:4px solid var(--gold);background:rgba(169,159,255,.16);border-radius:4px;"
        marks += f'<div class="mk" style="left:{l-8:.0f}px;top:{tp-6:.0f}px;width:{w+16:.0f}px;height:{h+12:.0f}px;{style}{A("wipeIn", rel(g, t), .55)}"></div>'
    css = PAPER_CSS + f"""
.all{{position:absolute;inset:0;{A("fade", 0, .35)}}} .o{{{out_anim(dur, .35)}}}
.win{{position:absolute;left:{(1920-W)/2:.0f}px;top:96px;width:{W}px;height:{min(H, 880):.0f}px;overflow:hidden;border-radius:12px;
  box-shadow:0 40px 90px -30px rgba(0,0,0,.6);background:#fff;transform-origin:50% 30%;animation:push {dur:.2f}s linear both}}
.bar{{height:42px;background:#EDEAE4;display:flex;align-items:center;gap:9px;padding:0 18px}}
.bar i{{width:12px;height:12px;border-radius:50%;background:#CFC9BF;display:block}}
.bar span{{margin-left:16px;font:500 17px var(--sans);color:#6A7789;background:#fff;padding:6px 14px;border-radius:6px}}
.shot{{position:relative;width:{W}px;height:{H:.0f}px;background:url('{ASSETS}/{sh['img']}') no-repeat;background-size:{2880*sc:.0f}px auto;background-position:{-x0*sc:.0f}px {-y0*sc:.0f}px}}
.mk{{position:absolute}}
@keyframes push{{from{{transform:scale(1)}}to{{transform:scale(1.045)}}}}
.src{{position:absolute;left:{(1920-W)/2:.0f}px;bottom:44px;font:500 17px var(--sans);color:rgba(245,240,232,.7);{A("fade", .5, .6)}}}"""
    body = f'<div class="all o"><div class="all"><div class="ink"></div><div class="win"><div class="bar"><i></i><i></i><i></i><span>service-public.gouv.fr</span></div><div class="shot">{marks}</div></div><div class="src">{esc(g["source"])}</div></div></div>'
    return page(body, css, dur)

def t_coin(g):
    a, b = span(g); dur = b - a
    css = PAPER_CSS + f"""
.all{{position:absolute;inset:0;{A("fade", 0, .35)}}} .o{{{out_anim(dur, .4)}}}
.coin{{position:absolute;left:660px;top:150px;width:600px;height:600px;border-radius:50%;
 background:radial-gradient(circle at 35% 30%,#8F84FF,#5B4BFF 55%,#2A1F8F);box-shadow:0 40px 80px -30px rgba(0,0,0,.6),inset 0 0 0 14px rgba(255,255,255,.12);{A("fadeUp", .1, .9)}}}
.half{{position:absolute;top:0;bottom:0;width:50%;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 46px;
 font:500 34px/1.15 var(--serif);color:#0D082E}}
.l{{left:0}} .r{{right:0}} .sep{{position:absolute;left:299px;top:70px;bottom:70px;width:2px;background:rgba(13,8,46,.35);transform-origin:top;{A("growY", .6, .7)}}}
.half{{{A("fade", .8, .6)}}}
.lines{{position:absolute;left:0;right:0;top:810px;text-align:center}}
.l1{{font:500 50px/1.1 var(--serif);color:var(--ivory)}}
.l2{{font:500 40px/1.1 var(--serif);color:var(--gold2);margin-top:18px}}"""
    body = (f'<div class="all o"><div class="all"><div class="ink"></div><div class="coin"><div class="half l">{esc(g["a"])}</div><div class="sep"></div><div class="half r">{esc(g["b"])}</div></div>'
            f'<div class="lines"><div class="l1" style="{A("fadeUp", rel(g, g["l1"][1]) + .2, .8)}">{esc(g["l1"][0])}</div>'
            f'<div class="l2" style="{A("fadeUp", rel(g, g["l2"][1]), .8)}">{esc(g["l2"][0])}</div></div></div></div>')
    return page(body, css, dur)

def t_endcard(g):
    a, b = span(g); dur = b - a
    css = PAPER_CSS + f"""
.all{{position:absolute;inset:0;{A("fade", 0, .8)}}}
.l{{position:absolute;left:0;right:0;top:120px;text-align:center;font:500 54px/1.1 var(--serif);color:var(--ivory);{A("fadeUp", .6, 1)}}}
.r{{position:absolute;left:910px;top:236px;width:100px;height:2px;background:var(--gold);transform-origin:center;{A("grow", 1.1, .8)}}}
.box{{position:absolute;top:380px;width:640px;height:360px;border:1px solid rgba(245,240,232,.18);border-radius:10px;{A("fade", 1.6, .8)}}}
.circ{{position:absolute;left:870px;top:800px;width:180px;height:180px;border-radius:50%;border:1px solid rgba(245,240,232,.18);{A("fade", 1.8, .8)}}}
.sig{{position:absolute;left:0;right:0;bottom:42px;text-align:center;font:500 18px/1 var(--sans);letter-spacing:.26em;text-transform:uppercase;color:rgba(245,240,232,.45);{A("fade", 2.0, .8)}}}"""
    body = f'<div class="all"><div class="ink"></div><div class="l">{esc(g["line"])}</div><div class="r"></div><div class="box" style="left:250px"></div><div class="box" style="left:1030px"></div><div class="circ"></div><div class="sig">Tiziana</div></div>'
    return page(body, css, dur)

# ----------------------------------------------------------------------------- CARD / LT
CARD_CSS = PAPER_CSS + """
.card{position:absolute;left:1340px;top:200px;width:500px;padding:34px 36px 32px;background:rgba(13,8,46,.93);color:var(--ivory);
  border-radius:10px;box-shadow:0 30px 60px -25px rgba(0,0,0,.55)}
.card .kicker{margin-bottom:16px}
.ct{font:600 34px/1.15 var(--serif);color:var(--ivory)}
.cs{font:400 23px/1.35 var(--sans);color:rgba(245,240,232,.78);margin-top:14px}
.ci{display:flex;gap:14px;align-items:center;padding:12px 0;border-top:1px solid rgba(245,240,232,.12);font:500 25px/1.25 var(--sans)}
.ck{width:26px;height:26px;border-radius:50%;border:2px solid var(--gold2);flex:none;position:relative}
.ck:after{content:"";position:absolute;left:7px;top:3px;width:7px;height:12px;border:solid var(--gold2);border-width:0 2.5px 2.5px 0;transform:rotate(45deg)}
.chip{display:inline-block;margin:8px 8px 0 0;padding:10px 14px;border:1px solid rgba(169,159,255,.6);border-radius:30px;font:500 21px/1 var(--sans);color:var(--gold2)}
.qm{font:300 120px/0.6 var(--serif);color:var(--gold);height:52px}
.qt{font:400 34px/1.25 var(--serif);color:var(--ivory)}
.bigs{font:600 88px/1 var(--serif);color:var(--gold2);margin-top:4px}
.wbar{position:absolute;left:0;top:0;bottom:0;width:6px;background:var(--warn);border-radius:10px 0 0 10px}
.btn{display:inline-flex;align-items:center;gap:10px;margin-top:22px;padding:14px 20px;background:var(--gold);color:#0D082E;border-radius:6px;font:700 20px/1 var(--sans);letter-spacing:.06em;text-transform:uppercase}
"""

def card_page(g, inner, top=200):
    a, b = span(g); dur = b - a
    css = CARD_CSS + f".card{{top:{top}px;{A('slideR', 0.05, .7)}}} .o{{{out_anim(dur, .4)}}}"
    return page(f'<div class="o"><div class="card">{inner}</div></div>', css, dur)

def t_quote(g):
    return card_page(g, f'<div class="qm" style="{A("fade", .2, .6)}">“</div><div class="qt" style="{A("fadeUp", .3, .8)}">{esc(g["text"])}</div>', 240)

def t_checklist(g):
    d = lambda t: max(0.5, rel(g, t))
    items = "".join(f'<div class="ci" style="{ROW(d(t))}"><div class="ck"></div>{esc(x)}</div>' for x, t in g['items'])
    return card_page(g, f'<div class="kicker">Sur place, vérifie</div><div class="ct" style="margin-bottom:16px">{esc(g["title"])}</div>{items}')

def t_stat(g):
    return card_page(g, f'<div class="kicker">{esc(g["kicker"])}</div><div class="bigs" style="{A("fadeUp", .4, .8)}">{esc(g["big"])}</div>'
                        f'<div class="cs" style="{A("fade", .7, .6)}">{esc(g["sub"])}</div>'
                        f'<div class="cs" style="color:var(--ivory);font-family:var(--serif);font-size:27px;border-top:1px solid rgba(245,240,232,.14);padding-top:16px;margin-top:20px;{A("fadeUp", rel(g, g["at2"]), .7)}">{esc(g["line2"])}</div>')

def t_chips(g):
    d = lambda t: max(0.5, rel(g, t))
    chips = "".join(f'<span class="chip" style="{A("fadeUp", d(t), .5)}">{esc(x)}</span>' for x, t in g['chips'])
    return card_page(g, f'<div class="kicker">{esc(g["kicker"])}</div><div class="ct">{esc(g["title"])}</div><div style="margin-top:14px">{chips}</div>'
                        f'<div class="cs" style="{A("fadeUp", d(g["foot"][1]), .6)}">{esc(g["foot"][0])}</div>')

def t_warn(g):
    return card_page(g, f'<div class="wbar"></div><div class="kicker" style="color:#FF8A8E">{esc(g["kicker"])}</div><div class="ct">{esc(g["title"])}</div>'
                        f'<div class="cs" style="{A("fade", .6, .6)}">{esc(g["sub"])}</div>'
                        f'<div class="cs" style="color:var(--ivory);font-family:var(--serif);font-size:27px;border-top:1px solid rgba(245,240,232,.14);padding-top:16px;margin-top:20px;{A("fadeUp", rel(g, g["at2"]), .7)}">{esc(g["line2"])}</div>')

def t_cta(g):
    d = lambda t: max(0.5, rel(g, t))
    items = "".join(f'<div class="ci" style="{ROW(d(t))}"><div class="ck"></div>{esc(x)}</div>' for x, t in g['items'])
    return card_page(g, f'<div class="kicker">{esc(g["kicker"])}</div><div class="ct">{esc(g["title"])}</div>'
                        f'<div style="margin-top:16px">{items}</div><div class="btn" style="{A("fadeUp", .8, .6)}">Réserver un appel ↓</div>', 180)

def t_lowerthird(g):
    a, b = span(g); dur = b - a
    css = PAPER_CSS + f"""
.lt{{position:absolute;left:96px;top:760px;display:flex;align-items:stretch;{out_anim(dur, .45)}}}
.bar{{width:5px;background:var(--gold);transform-origin:bottom;{A("growY", .1, .5)}}}
.bx{{background:rgba(13,8,46,.92);padding:20px 30px 20px 24px;{A("wipeIn", .3, .7)}}}
.n{{font:600 40px/1 var(--serif);color:var(--ivory)}}
.r{{font:600 18px/1 var(--sans);letter-spacing:.2em;text-transform:uppercase;color:var(--gold2);margin-top:12px}}"""
    return page(f'<div class="lt"><div class="bar"></div><div class="bx"><div class="n">{esc(g["name"])}</div><div class="r">{esc(g["role"])}</div></div></div>', css, dur)

# ============================================================================= V2 : identité Fynovates + dynamisme
def t_title(g):
    a, b = span(g); dur = b - a
    css = PAPER_CSS + f"""
.bg{{position:absolute;inset:0;background:var(--ink);{A("wipeIn", 0, .45, "cubic-bezier(.7,0,.2,1)")}}}
.grid{{position:absolute;inset:0;opacity:.14;background-image:linear-gradient(rgba(169,159,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(169,159,255,.5) 1px,transparent 1px);background-size:96px 96px;{A("fade", .3, 1.2)}}}
.icon{{position:absolute;left:200px;top:250px;width:84px;{A("popIn", .35, .6, "var(--spring)")}}}
.wrap{{position:absolute;left:200px;top:380px;width:1500px}}
.t{{font:600 88px/1.02 var(--serif);color:#fff;letter-spacing:-.025em}}
.t span{{display:inline-block;{''}}}
.k{{margin-bottom:30px;color:var(--gold2);{A("slideL", .45, .5)}}}
.r{{height:6px;width:140px;background:var(--gold);transform-origin:left;margin-top:44px;{A("grow", 1.0, .5)}}}
.wm{{position:absolute;left:200px;bottom:110px;height:30px;{A("fade", 1.1, .6)}}}
.all{{position:absolute;inset:0;{out_anim(dur, .35)}}}"""
    toks = esc(g["title"]).replace("t&#x27;expatrier ", "t&#x27;expatrier <br> ").split(' ')
    tw, d = [], .55
    for w in toks:
        if w == '<br>': tw.append('<br>'); continue
        tw.append(f'<span style="{A("fadeUp", d, .55, "var(--spring)")}">{w}</span> '); d += .07
    body = (f'<div class="all"><div class="bg"></div><div class="grid"></div><img class="icon" src="{BRAND}/icon_white_knockout.png">'
            f'<div class="wrap"><div class="kicker k">{esc(g["kicker"])}</div><div class="t">{"".join(tw)}</div><div class="r"></div></div>'
            f'<img class="wm" src="{BRAND}/wordmark_white.png"></div>')
    return page(body, css, dur)

def t_chapter(g):
    a, b = span(g); dur = b - a
    dots = "".join(f'<div class="dot{" on" if i+1 == g["n"] else (" done" if i+1 < g["n"] else "")}"></div>' for i in range(5))
    css = PAPER_CSS + f"""
.all{{position:absolute;inset:0;animation:wipeOut .4s cubic-bezier(.7,0,.2,1) {dur-.4:.2f}s forwards}}
@keyframes wipeOut{{to{{clip-path:inset(0 0 0 100%)}}}}
.bg{{position:absolute;inset:0;background:var(--ink);{A("wipeIn", 0, .42, "cubic-bezier(.7,0,.2,1)")}}}
.bar{{position:absolute;left:0;top:0;bottom:0;width:22px;background:var(--gold);{A("wipeIn", 0, .3, "cubic-bezier(.7,0,.2,1)")}}}
.num{{position:absolute;left:170px;top:250px;font:700 380px/0.8 var(--serif);color:var(--gold);letter-spacing:-.04em;{A("slideL", .2, .6, "var(--spring)")}}}
.txt{{position:absolute;left:780px;top:330px;width:1000px}}
.k{{color:var(--gold2);margin-bottom:26px;{A("fade", .35, .4)}}}
.t{{font:600 78px/1.04 var(--serif);color:#fff;letter-spacing:-.025em;{A("fadeUp", .4, .6, "var(--spring)")}}}
.prog{{position:absolute;left:780px;top:800px;display:flex;gap:14px;{A("fade", .6, .5)}}}
.dot{{width:70px;height:6px;background:rgba(255,255,255,.16);border-radius:3px}} .dot.done{{background:rgba(169,159,255,.55)}} .dot.on{{background:var(--gold2);{A("grow", .8, .5)};transform-origin:left}}
.icon{{position:absolute;right:120px;top:110px;width:52px;{A("fade", .5, .5)}}}"""
    body = f"""<div class="all"><div class="bg"></div><div class="bar"></div><div class="num">0{g['n']}</div>
<div class="txt"><div class="kicker k">Étape {g['n']} sur 5</div><div class="t">{esc(g['title'])}</div></div>
<div class="prog">{dots}</div><img class="icon" src="{BRAND}/icon_white_knockout.png"></div>"""
    return page(body, css, dur)

def t_lowerthird(g):
    a, b = span(g); dur = b - a
    css = PAPER_CSS + f"""
.lt{{position:absolute;left:96px;top:742px;display:flex;align-items:center;gap:0;{out_anim(dur, .4)}}}
.ic{{width:118px;height:118px;background:#fff;display:flex;align-items:center;justify-content:center;{A("popIn", .05, .5, "var(--spring)")}}}
.ic img{{width:118px}}
.bx{{background:var(--ink);height:118px;padding:0 40px 0 30px;display:flex;flex-direction:column;justify-content:center;{A("wipeIn", .3, .55, "cubic-bezier(.7,0,.2,1)")}}}
.n{{font:600 46px/1 var(--serif);color:#fff;letter-spacing:-.01em;{A("slideL", .45, .5)}}}
.r{{font:600 17px/1 var(--wide);letter-spacing:.14em;text-transform:uppercase;color:var(--gold2);margin-top:14px;{A("slideL", .55, .5)}}}"""
    return page(f'<div class="lt"><div class="ic"><img src="{BRAND}/icon_navy.png"></div><div class="bx"><div class="n">{esc(g["name"])}</div><div class="r">{esc(g["role"])}</div></div></div>', css, dur)

def t_endcard(g):
    a, b = span(g); dur = b - a
    css = PAPER_CSS + f"""
.all{{position:absolute;inset:0;{A("fade", 0, .8)}}}
.bg{{position:absolute;inset:0;background:var(--ink)}}
.l{{position:absolute;left:0;right:0;top:110px;text-align:center;font:500 54px/1.1 var(--serif);color:#fff;letter-spacing:-.015em;{A("fadeUp", .6, .8, "var(--spring)")}}}
.r{{position:absolute;left:900px;top:220px;width:120px;height:5px;background:var(--gold);transform-origin:center;{A("grow", 1.1, .6)}}}
.box{{position:absolute;top:340px;width:640px;height:360px;border:1px solid rgba(255,255,255,.16);border-radius:10px;{A("fade", 1.6, .8)}}}
.circ{{position:absolute;left:870px;top:770px;width:180px;height:180px;border-radius:50%;border:1px solid rgba(255,255,255,.16);{A("fade", 1.8, .8)}}}
.wm{{position:absolute;left:50%;bottom:40px;height:22px;transform:translateX(-50%);opacity:.8;{A("fade", 2.0, .8)}}}"""
    body = f'<div class="all"><div class="bg"></div><div class="l">{esc(g["line"])}</div><div class="r"></div><div class="box" style="left:250px"></div><div class="box" style="left:1030px"></div><div class="circ"></div><img class="wm" src="{BRAND}/wordmark_white.png"></div>'
    return page(body, css, dur)

def t_pop(g):
    """Mot-clé cinétique à côté de l'intervenante (zone droite libre du plan large)."""
    a, b = span(g); dur = b - a
    big = esc(g['big']); sub = esc(g.get('sub', ''))
    count = g.get('count')
    if count:
        big = f'<span class="cnt" data-to="{count[0]}" data-dec="{count[1]}" data-d="{.25:.2f}">{esc(g["big"])}</span>'
    side = g.get('side', 'R')
    x = 1300 if side == 'R' else 90
    css = PAPER_CSS + f"""
.p{{position:absolute;left:{x}px;top:{g.get('y', 300)}px;width:560px;{out_anim(dur, .3)}}}
.k{{color:#fff;background:var(--gold);display:inline-block;padding:9px 14px;font-size:17px;{A("wipeIn", .05, .35, "cubic-bezier(.7,0,.2,1)")}}}
.big{{font:700 {g.get('size', 112)}px/0.95 var(--serif);color:#fff;letter-spacing:-.03em;margin-top:14px;white-space:nowrap;
  text-shadow:0 6px 30px rgba(13,8,46,.55);{A("popIn", .12, .55, "var(--spring)")};transform-origin:{'left' if side == 'R' else 'left'} center}}
.sub{{font:600 30px/1.2 var(--serif);color:#fff;margin-top:14px;text-shadow:0 4px 18px rgba(13,8,46,.6);{A("fadeUp", .35, .45, "var(--spring)")}}}
.ul{{height:7px;width:150px;background:var(--gold2);margin-top:18px;transform-origin:left;{A("grow", .4, .4)}}}"""
    body = f'<div class="p">{"<div class=k_ class=kicker>" if False else ""}<div class="kicker k">{esc(g.get("kicker", ""))}</div><div class="big">{big}</div>{f"<div class=sub>{sub}</div>" if sub else ""}<div class="ul"></div></div>'
    if not g.get('kicker'): body = body.replace('<div class="kicker k"></div>', '')
    js = """window.onT=function(t){document.querySelectorAll('.cnt').forEach(e=>{const to=+e.dataset.to,dec=+e.dataset.dec,d=+e.dataset.d;
 const k=Math.min(1,Math.max(0,(t-d)/0.9)); const v=to*(1-Math.pow(1-k,3));
 e.textContent=v.toLocaleString('fr-FR',{minimumFractionDigits:dec,maximumFractionDigits:dec}).replace(/\\u202f/g,'\\u00a0')+(e.dataset.suf||'');});};"""
    if count and len(count) > 2: body = body.replace('data-d=', f'data-suf="{esc(count[2])}" data-d=')
    return page(body, css, dur, js)

def t_hud(g):
    """Repère permanent discret : étape en cours + logo (rendu en une seule image fixe)."""
    n = g['n']
    segs = "".join(f'<i class="{"on" if i+1 == n else ("done" if i+1 < n else "")}"></i>' for i in range(5))
    css = """
.h{position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:16px;padding:12px 18px 12px 12px;background:rgba(13,8,46,.78);border-radius:8px}
.h img{width:34px}
.h .tx{font:600 15px/1 var(--wide);letter-spacing:.14em;text-transform:uppercase;color:#fff}
.h .sg{display:flex;gap:5px;margin-top:8px} .h i{display:block;width:26px;height:4px;border-radius:2px;background:rgba(255,255,255,.22)}
.h i.done{background:rgba(169,159,255,.6)} .h i.on{background:#A99FFF}"""
    body = f'<div class="h"><img src="{BRAND}/icon_white_knockout.png"><div><div class="tx">Étape {n} · {esc(g["label"])}</div><div class="sg">{segs}</div></div></div>'
    return page(body, css, 1.0)

def t_lines(g):
    """Mots-clés cinétiques empilés en étiquettes navy, synchronisés sur la parole (alignés à droite du cadre)."""
    a, b = span(g); dur = b - a
    d = lambda t: max(0.08, rel(g, t))
    size = g.get('size', 52)
    css = PAPER_CSS + f"""
.p{{position:absolute;right:84px;top:{g.get('y', 230)}px;width:900px;display:flex;flex-direction:column;align-items:flex-end;{out_anim(dur, .3)}}}
.k{{color:#fff;background:var(--gold);display:inline-block;padding:10px 15px;font-size:17px;margin-bottom:10px;{A("wipeIn", .03, .35, "cubic-bezier(.7,0,.2,1)")}}}
.ln{{font:700 {size}px/1 var(--serif);color:#fff;letter-spacing:-.02em;white-space:nowrap;background:rgba(13,8,46,.92);
  padding:14px 22px 16px;margin:5px 0;position:relative;transform-origin:right center;box-shadow:0 16px 40px -18px rgba(0,0,0,.6)}}
.ln.accent{{background:var(--gold);color:#fff}} .ln.warn{{background:#E5484D;color:#fff}} .ln.small{{font-size:{int(size*.62)}px;font-weight:600;padding:11px 18px 12px}}
.ln .st{{position:absolute;left:12px;right:12px;top:50%;height:6px;background:#FF8A8E;transform-origin:left}}"""
    body = '<div class="p">'
    if g.get('kicker'): body += f'<div class="kicker k">{esc(g["kicker"])}</div>'
    for ln in g['lines']:
        txt, t = ln[0], ln[1]; st = ln[2] if len(ln) > 2 else ''
        strike = f'<span class="st" style="{A("grow", d(ln[3]), .3)}"></span>' if 'strike' in st else ''
        body += f'<div class="ln {st}" style="{A("popIn", d(t), .5, "var(--spring)")}">{esc(txt)}{strike}</div>'
    body += '</div>'
    return page(body, css, dur)

TPL = {k[2:]: v for k, v in globals().items() if k.startswith('t_')}

def build(ids=None):
    os.makedirs(OUT, exist_ok=True)
    manifest = []
    for g in G:
        a, b = span(g)
        import re as _re
        beats = sorted({round(float(x), 2) for x in _re.findall(r'(?:slideR|popIn|fadeUp|slideL) [.0-9]+s [^;,]*? ([0-9.]+)s both', TPL[g['tpl']](g)) if float(x) >= 0.3})
        manifest.append(dict(id=g['id'], kind=g['kind'], tpl=g['tpl'], start=a, end=b, prev_split=adjacent_split(g)[0], next_split=adjacent_split(g)[1], beats=beats))
        if ids and g['id'] not in ids: continue
        d = os.path.join(OUT, g['id']); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
        html_ = TPL[g['tpl']](g)
        open(os.path.join(d, 'index.html'), 'w').write(html_)
    json.dump(manifest, open(os.path.join(HERE, 'build', 'gfx_manifest.json'), 'w'), indent=1)
    for h in [g for g in G if g['tpl'] == 'chapter']:      # repères d'étape (image fixe)
        d = os.path.join(OUT, f"hud_{h['n']}"); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, 'index.html'), 'w').write(t_hud(dict(n=h['n'], label={1: 'Ton profil', 2: 'Ta destination', 3: 'Le terrain', 4: 'La sortie de France', 5: 'Ton patrimoine'}[h['n']])))
    return manifest

if __name__ == '__main__':
    ids = sys.argv[1:] or None
    m = build(ids)
    tot = sum(x['end'] - x['start'] for x in m)
    print(len(m), 'graphismes,', f'{tot:.0f}s au total')
    for x in m: print(f"{x['id']:14s} {x['kind']:5s} {x['start']:7.2f} -> {x['end']:7.2f} ({x['end']-x['start']:5.1f}s)")
