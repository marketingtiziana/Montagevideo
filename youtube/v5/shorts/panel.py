"""Panneau animé (moitié basse 1080x960) : composants réutilisables, pilotés par les scènes du manifeste.

Système de design commun (identité Fynovates) : navy #0D082E, blanc cassé, accent violet-bleu #5B4BFF / #A99FFF,
vert sobre (#2F9E6B) et rouge sobre (#E5484D) pour les verdicts. Typo : Lexend (titres), Inter Tight (texte).
"""
import json, os, html
HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(os.path.dirname(HERE), 'assets')
BRAND = os.path.join(ASSETS, 'brand')
PW, PH = 1080, 960
E = html.escape

def esc(t):
    t = E(t)
    for p in [' :', ' ;', ' ?', ' !', ' %', ' €', '« ', ' »']:
        t = t.replace(p, p.replace(' ', ' '))
    return t

def A(name, d, dur=.6, ease="var(--ease)"):
    return f"animation:{name} {dur}s {ease} {max(0, d):.2f}s both;"

ICONS = {   # pictogrammes vectoriels maison (trait 2.2, angles arrondis)
 "house": '<path d="M8 30 L32 10 L56 30 M14 26 V54 H50 V26" /><path d="M27 54 V40 H37 V54"/>',
 "briefcase": '<rect x="8" y="20" width="48" height="32" rx="5"/><path d="M24 20 V14 H40 V20 M8 33 H56"/>',
 "chart": '<path d="M10 52 H56"/><path d="M14 44 L26 32 L36 38 L52 18"/><path d="M44 18 H52 V26"/>',
 "family": '<circle cx="22" cy="20" r="7"/><circle cx="44" cy="22" r="6"/><path d="M8 52 C8 38 36 38 36 52 M32 52 C32 41 56 41 56 52"/>',
 "vault": '<rect x="8" y="10" width="48" height="44" rx="5"/><circle cx="32" cy="32" r="11"/><path d="M32 21 V26 M32 38 V43 M21 32 H26 M38 32 H43"/>',
 "plane": '<path d="M6 36 L58 14 L46 50 L32 40 L24 52 L22 38 Z"/><path d="M22 38 L58 14"/>',
 "check": '<path d="M14 33 L27 46 L50 20"/>',
 "cross": '<path d="M18 18 L46 46 M46 18 L18 46"/>',
 "calendar": '<rect x="8" y="12" width="48" height="42" rx="5"/><path d="M8 24 H56 M20 6 V16 M44 6 V16"/>',
}
def icon(name, size=64, color="currentColor"):
    return (f'<svg viewBox="0 0 64 64" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="3.2" '
            f'stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</svg>')

BASE_CSS = """
@import url("ASSETS/fonts/local.css"); @import url("ASSETS/fonts/brand_local.css");
:root{--ink:#0D082E;--ink2:#1B1550;--acc:#5B4BFF;--acc2:#A99FFF;--ok:#2F9E6B;--warn:#E5484D;--paper:#F4F3F8;
 --serif:"Lexend","Inter Tight",sans-serif;--sans:"Inter Tight","Inter",sans-serif;--wide:"Lexend Exa","Lexend",sans-serif;
 --ease:cubic-bezier(.16,1.1,.3,1);--spring:cubic-bezier(.34,1.56,.64,1);--in:cubic-bezier(.7,0,.2,1)}
html,body{margin:0;width:1080px;height:960px;overflow:hidden;background:var(--ink);font-family:var(--sans);color:#fff;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
.bg{position:absolute;inset:0;background:radial-gradient(90% 80% at 50% 30%,#1B1550 0%,#0D082E 60%,#07041A 100%)}
.grid{position:absolute;inset:0;opacity:.10;background-image:linear-gradient(rgba(169,159,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(169,159,255,.6) 1px,transparent 1px);background-size:72px 72px;animation:gridm 60s linear both}
@keyframes gridm{to{background-position:0 720px}}
.top{position:absolute;left:56px;right:56px;top:40px;display:flex;align-items:center;gap:14px}
.top img{width:34px} .top .k{font:600 17px/1 var(--wide);letter-spacing:.16em;text-transform:uppercase;color:var(--acc2)}
.top .ln{flex:1;height:1px;background:rgba(169,159,255,.3)}
.sc{position:absolute;left:0;right:0;top:100px;bottom:40px}
@keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes popIn{0%{opacity:0;transform:scale(.5)}60%{opacity:1;transform:scale(1.07)}100%{opacity:1;transform:scale(1)}}
@keyframes slideL{from{opacity:0;transform:translateX(-80px)}to{opacity:1;transform:none}}
@keyframes slideR{from{opacity:0;transform:translateX(80px)}to{opacity:1;transform:none}}
@keyframes wipeIn{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes growY{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes scIn{from{opacity:0;clip-path:inset(0 0 100% 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
@keyframes scOut{to{opacity:0;transform:translateY(-30px) scale(.97)}}
@keyframes draw{to{stroke-dashoffset:0}}
.h1{font:700 64px/1.05 var(--serif);letter-spacing:-.025em;text-align:center}
.kick{font:600 18px/1 var(--wide);letter-spacing:.16em;text-transform:uppercase;color:var(--acc2);text-align:center}
.card{background:#fff;color:var(--ink);border-radius:18px;box-shadow:0 30px 60px -30px rgba(0,0,0,.7)}
"""

# ------------------------------------------------------------------ composants de scène
def sc_neq(s, o):
    rel = lambda t: o(t) - o(s['t0'])
    def row(txt, at, tone, y):
        ic = icon("check" if tone == "ok" else "cross", 70, "#fff")
        return (f'<div style="position:absolute;left:110px;right:110px;top:{y}px;height:150px;display:flex;align-items:center;gap:30px;'
                f'background:rgba(255,255,255,.06);border:2px solid {"#2F9E6B" if tone == "ok" else "#E5484D"};border-radius:22px;padding:0 34px;{A("slideL", rel(at), .55, "var(--spring)")}">'
                f'<div style="width:96px;height:96px;border-radius:50%;background:{"var(--ok)" if tone == "ok" else "var(--warn)"};display:flex;align-items:center;justify-content:center;{A("popIn", rel(at) + .15, .5, "var(--spring)")}">{ic}</div>'
                f'<div style="font:700 62px/1 var(--serif);letter-spacing:-.02em">{esc(txt)}</div></div>')
    return (f'<div class="kick" style="{A("fade", .1, .4)}">{esc(s["kicker"])}</div>'
            f'<div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-top:26px;{A("fadeUp", .2, .6, "var(--spring)")}">'
            f'<span style="color:var(--acc2)">{icon("plane", 70)}</span><span class="h1" style="font-size:58px">{esc(s["title"])}</span></div>'
            + row(s['a'][0], s['a'][1], s['a'][2], 240)
            + f'<div style="position:absolute;left:0;right:0;top:395px;text-align:center;font:300 120px/1 var(--serif);color:var(--acc2);{A("popIn", rel(s["neq_at"]), .5, "var(--spring)")}">≠</div>'
            + row(s['b'][0], s['b'][1], s['b'][2], 540))

def sc_criteria(s, o):
    rel = lambda t: o(t) - o(s['t0'])
    out = (f'<div class="h1" style="font-size:54px;{A("fadeUp", rel(s["title_at"]), .6, "var(--spring)")}">{esc(s["title"])}</div>'
           f'<div style="text-align:center;font:500 32px/1.2 var(--sans);color:var(--acc2);margin-top:14px;{A("fade", rel(s["sub_at"]), .5)}">{esc(s["sub"])}</div>'
           '<div style="position:absolute;left:70px;right:70px;top:210px;display:flex;flex-direction:column;gap:22px">')
    for i, (ic, txt, at) in enumerate(s['items']):
        out += (f'<div class="card" style="display:flex;align-items:center;gap:28px;padding:26px 34px;{A("slideR", rel(at), .55, "var(--spring)")}">'
                f'<div style="width:96px;height:96px;flex:none;border-radius:20px;background:var(--acc);color:#fff;display:flex;align-items:center;justify-content:center">{icon(ic, 62)}</div>'
                f'<div><div style="font:600 18px/1 var(--wide);letter-spacing:.14em;color:var(--acc);text-transform:uppercase">Critère {i+1}</div>'
                f'<div style="font:700 40px/1.12 var(--serif);letter-spacing:-.015em;margin-top:8px">{esc(txt)}</div></div></div>')
    out += '</div>'
    if s.get('source'):
        out += f'<div style="position:absolute;left:0;right:0;bottom:6px;text-align:center;font:500 19px var(--sans);color:rgba(255,255,255,.55);{A("fade", rel(s["items"][-1][2]) + .5, .5)}">{esc(s["source"])}</div>'
    return out

def sc_anchors(s, o):
    rel = lambda t: o(t) - o(s['t0'])
    out = (f'<div class="h1" style="font-size:50px;{A("fadeUp", .1, .6, "var(--spring)")}">{esc(s["title"])}</div>'
           '<svg id="fr" viewBox="0 0 1080 760" style="position:absolute;left:0;top:70px;width:1080px;height:760px"></svg>')
    ys = [170, 360, 550]
    for i, (ic, txt, at) in enumerate(s['items']):
        out += (f'<div class="card" style="position:absolute;left:470px;width:560px;top:{ys[i] + 40}px;display:flex;align-items:center;gap:20px;padding:20px 24px;{A("slideR", rel(at), .55, "var(--spring)")}">'
                f'<div style="width:72px;height:72px;flex:none;border-radius:16px;background:var(--acc);color:#fff;display:flex;align-items:center;justify-content:center">{icon(ic, 48)}</div>'
                f'<div style="font:700 30px/1.15 var(--serif);letter-spacing:-.01em">{esc(txt)}</div></div>')
    js = f"""(function(){{const land=topojson.feature(window.TOPO,window.TOPO.objects.countries); const fr=land.features.find(f=>f.id==='250');
 const proj=d3.geoMercator().fitExtent([[40,150],[430,560]],{{type:'MultiPoint',coordinates:[[-4.8,42.3],[8.3,42.3],[8.3,51.1],[-4.8,51.1]]}});
 const path=d3.geoPath(proj); const [px,py]=proj([2.35,48.86]);
 let s=`<path d="${{path(fr)}}" fill="rgba(91,75,255,.55)" stroke="#A99FFF" stroke-width="3" style="opacity:0;animation:fade .6s ease .2s both"/>`;
 const AT={json.dumps([rel(it[2]) for it in s['items']])}; const YS={json.dumps([y + 40 + 56 - 70 for y in ys])};
 AT.forEach((a,i)=>{{ const d=`M${{px}},${{py}} C${{px+120}},${{py}} 360,${{YS[i]}} 470,${{YS[i]}}`;
   s+=`<path d="${{d}}" fill="none" stroke="#A99FFF" stroke-width="3" stroke-dasharray="600" stroke-dashoffset="600" style="animation:draw .7s var(--ease) ${{a}}s forwards"/>`; }});
 s+=`<circle cx="${{px}}" cy="${{py}}" r="14" fill="#fff" stroke="#5B4BFF" stroke-width="6"/><text x="${{px-24}}" y="${{py-26}}" fill="#fff" font-family="Inter Tight" font-weight="700" font-size="28" text-anchor="end">Paris</text>`;
 document.getElementById('fr').innerHTML=s; }})();"""
    return out, js

def sc_globe(s, o):
    rel = lambda t: o(t) - o(s['t0'])
    T0 = rel(s['ring_at']); TC = rel(s['count_at']); dur = o(s['t1']) - o(s['t0'])
    out = ('<svg id="gl" viewBox="0 0 1080 860" style="position:absolute;left:0;top:-30px;width:1080px;height:860px"></svg>'
           f'<div style="position:absolute;left:0;right:0;top:20px;text-align:center;{A("popIn", TC, .5, "var(--spring)")}">'
           f'<span id="km" style="font:800 150px/1 var(--serif);letter-spacing:-.04em;text-shadow:0 10px 40px rgba(0,0,0,.6)">0</span>'
           f'<span style="font:700 70px/1 var(--serif);margin-left:14px">km</span></div>'
           f'<div style="position:absolute;left:90px;right:90px;bottom:30px;text-align:center;font:700 44px/1.18 var(--serif);{A("fadeUp", rel(s["line_at"]), .6, "var(--spring)")}">'
           f'{esc(s["line"])}</div>')
    js = f"""(function(){{const land=topojson.feature(window.TOPO,window.TOPO.objects.countries);const svg=document.getElementById('gl');
 const ez=x=>1-Math.pow(1-Math.min(1,Math.max(0,x)),3);
 window.__globe=function(t){{const proj=d3.geoOrthographic().rotate([-2.35-14*ez(t/{dur:.2f}),-40]).scale(330).translate([540,470]).clipAngle(90);
  const path=d3.geoPath(proj);let s=`<circle cx="540" cy="470" r="330" fill="#120C3A" stroke="rgba(169,159,255,.35)" stroke-width="2"/>`;
  s+=`<path d="${{path(d3.geoGraticule10())}}" fill="none" stroke="rgba(169,159,255,.12)"/>`;
  for(const f of land.features) s+=`<path d="${{path(f)}}" fill="${{f.id==='250'?'#5B4BFF':'rgba(255,255,255,.12)'}}" stroke="rgba(169,159,255,.3)" stroke-width=".6"/>`;
  const k=ez((t-{T0:.2f})/1.6); if(k>0) s+=`<path d="${{path(d3.geoCircle().center([2.35,48.86]).radius(89.9*k)())}}" fill="rgba(91,75,255,.12)" stroke="#A99FFF" stroke-width="4" stroke-dasharray="14 10"/>`;
  const [px,py]=proj([2.35,48.86]); s+=`<circle cx="${{px}}" cy="${{py}}" r="11" fill="#fff" stroke="#5B4BFF" stroke-width="5"/>`; svg.innerHTML=s;
  const c=ez((t-{TC:.2f})/1.2); document.getElementById('km').textContent=Math.round({s['km']}*c).toLocaleString('fr-FR').replace(/\\u202f/g,'\\u00a0');}};}})();"""
    return out, js

def sc_years(s, o):
    rel = lambda t: o(t) - o(s['t0'])
    cards = ""
    for i in range(4):
        cards += (f'<div class="card" style="position:absolute;left:{250 + i * 70}px;top:{220 + i * 40}px;width:360px;height:300px;padding:0;overflow:hidden;'
                  f'transform:rotate({-6 + i * 4}deg);{A("popIn", rel(s["title_at"]) + .15 + i * .18, .5, "var(--spring)")}">'
                  f'<div style="height:70px;background:var(--acc)"></div><div style="display:flex;align-items:center;justify-content:center;height:230px;color:var(--ink)">{icon("calendar", 120, "#0D082E")}</div></div>')
    return (f'<div class="h1" style="font-size:58px;{A("fadeUp", rel(s["title_at"]), .6, "var(--spring)")}">{esc(s["title"])}</div>'
            f'<div class="kick" style="margin-top:14px;{A("fade", rel(s["title_at"]) + .3, .5)}">des années de</div>' + cards +
            f'<div style="position:absolute;left:150px;right:150px;top:400px;text-align:center;transform:rotate(-8deg);{A("popIn", rel(s["stamp_at"]), .45, "var(--spring)")}">'
            f'<span style="display:inline-block;border:8px solid var(--warn);color:var(--warn);background:rgba(255,255,255,.96);border-radius:14px;padding:16px 34px;font:800 76px/1 var(--serif);letter-spacing:.02em;text-transform:uppercase">{esc(s["stamp"])}</span></div>'
            f'<div style="position:absolute;left:60px;right:60px;bottom:24px;text-align:center;font:600 38px/1.2 var(--serif);color:var(--acc2);{A("fadeUp", rel(s["sub_at"]), .55, "var(--spring)")}">{esc(s["sub"])}</div>')

COMPONENTS = {"neq": sc_neq, "criteria": sc_criteria, "anchors": sc_anchors, "globe": sc_globe, "years": sc_years}

def build_panel(short, o, dur):
    """HTML du panneau pour un Short. o(t_source) -> temps du Short."""
    scenes_html, js_parts = "", []
    for i, s in enumerate(short['scenes']):
        a, b = o(s['t0']), o(s['t1'])
        r = COMPONENTS[s['type']](s, o)
        inner, js = (r if isinstance(r, tuple) else (r, ""))
        if js: js_parts.append(js)
        first, last = i == 0, i == len(short['scenes']) - 1
        enter = f"animation:scIn .45s var(--in) {a:.2f}s both" if not first else "animation:fade .3s ease 0s both"
        leave = "" if last else f", scOut .35s var(--in) {b - .35:.2f}s forwards"
        # chaque scène a son propre temps 0 : on décale toutes ses animations internes de 'a' via un wrapper
        scenes_html += f'<div class="sc" data-a="{a:.3f}" style="{enter}{leave}"><div class="inner" data-a="{a:.3f}">{inner}</div></div>'
    css = BASE_CSS.replace("ASSETS", ASSETS)
    libs = "".join(f'<script src="{ASSETS}/lib/{f}"></script>' for f in ["d3-array.min.js", "d3-geo.min.js", "d3-geo-projection.min.js", "topojson-client.min.js", "countries-50m.js"])
    js = "\n".join(js_parts) + """
// décale les animations internes de chaque scène de son temps d'entrée
document.querySelectorAll('.inner').forEach(sc=>{const a=+sc.dataset.a; sc.querySelectorAll('*').forEach(el=>{
  const cs=getComputedStyle(el); if(cs.animationName && cs.animationName!=='none'){ const ds=cs.animationDelay.split(',').map(x=>parseFloat(x)+a+'s'); el.style.animationDelay=ds.join(','); }});});
const GA=[...document.querySelectorAll('.sc')].map(s=>+s.dataset.a);
window.onT=function(t){ if(window.__globe){ const i=[...document.querySelectorAll('#gl')].length; const sc=document.querySelector('#gl').closest('.sc'); window.__globe(t-(+sc.dataset.a)); } };
window.READY=true;"""
    body = (f'<div class="bg"></div><div class="grid"></div><div class="top"><img src="{BRAND}/icon_white_knockout.png"><div class="k">{esc(short["topic"])}</div><div class="ln"></div></div>'
            + scenes_html)
    return f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body>{body}{libs}<script>{js}</script></body></html>'
