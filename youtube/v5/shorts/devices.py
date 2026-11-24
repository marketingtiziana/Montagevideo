"""Panneau animé v2 (1080x1160) : motion design sur appareils (iPhone, iPad, MacBook/Safari) et écrans d'applis.

Zone de sécurité : tout le contenu tient dans x 40..880 (colonne de droite libre pour j'aime / commentaires)
et y 20..760 du panneau (les ~400 px du bas restent libres pour le titre et la description du Short).
Chaque scène = dict(type, t0, t1, ...) en temps source ; 'o' convertit en temps du Short.
Les animations CSS ont des délais absolus (temps du Short) ; le JS de chaque scène s'enregistre dans window.HOOKS.
"""
import json, os, html
HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(os.path.dirname(HERE), 'assets'); BRAND = os.path.join(ASSETS, 'brand')
PW, PH = 1080, 1160
SAFE = dict(x=40, y=24, w=840, h=740)
E = html.escape

def esc(t):
    t = E(t)
    for p in [' :', ' ;', ' ?', ' !', ' %', ' €', '« ', ' »']:
        t = t.replace(p, p.replace(' ', ' '))
    return t

def A(name, d, dur=.55, ease="var(--ease)"):
    return f"animation:{name} {dur}s {ease} {max(0, d):.2f}s both;"

ICONS = {
 "house": '<path d="M8 30 L32 10 L56 30 M14 26 V54 H50 V26"/><path d="M27 54 V40 H37 V54"/>',
 "briefcase": '<rect x="8" y="20" width="48" height="32" rx="5"/><path d="M24 20 V14 H40 V20 M8 33 H56"/>',
 "chart": '<path d="M10 52 H56"/><path d="M14 44 L26 32 L36 38 L52 18"/><path d="M44 18 H52 V26"/>',
 "family": '<circle cx="22" cy="20" r="7"/><circle cx="44" cy="22" r="6"/><path d="M8 52 C8 38 36 38 36 52 M32 52 C32 41 56 41 56 52"/>',
 "vault": '<rect x="8" y="10" width="48" height="44" rx="5"/><circle cx="32" cy="32" r="11"/><path d="M32 21 V26 M32 38 V43 M21 32 H26 M38 32 H43"/>',
 "check": '<path d="M14 33 L27 46 L50 20"/>', "cross": '<path d="M18 18 L46 46 M46 18 L18 46"/>',
 "rocket": '<path d="M32 6 C44 14 46 30 40 44 H24 C18 30 20 14 32 6 Z"/><circle cx="32" cy="24" r="5"/><path d="M24 44 L16 54 L26 50 M40 44 L48 54 L38 50"/>',
 "shield": '<path d="M32 6 L54 14 V30 C54 44 44 54 32 58 C20 54 10 44 10 30 V14 Z"/><path d="M22 32 L29 39 L43 25"/>',
 "pin": '<path d="M32 58 C32 58 12 38 12 24 A20 20 0 0 1 52 24 C52 38 32 58 32 58 Z"/><circle cx="32" cy="24" r="7"/>',
 "hotel": '<rect x="12" y="10" width="40" height="46" rx="3"/><path d="M20 20 H26 M38 20 H44 M20 30 H26 M38 30 H44 M28 56 V44 H36 V56"/>',
 "warn": '<path d="M32 8 L58 54 H6 Z"/><path d="M32 26 V40 M32 47 V48"/>',
 "lock": '<rect x="12" y="28" width="40" height="28" rx="5"/><path d="M20 28 V20 A12 12 0 0 1 44 20 V28"/>',
 "search": '<circle cx="28" cy="28" r="16"/><path d="M40 40 L54 54"/>',
 "air": '<path d="M8 24 H40 A8 8 0 1 0 32 16 M8 34 H50 A8 8 0 1 1 42 42 M8 44 H28"/>',
 "people": '<circle cx="20" cy="22" r="7"/><circle cx="44" cy="22" r="7"/><path d="M6 50 C6 38 34 38 34 50 M30 50 C30 38 58 38 58 50"/>',
}
def icon(name, size=48, color="currentColor", sw=3.4):
    return (f'<svg viewBox="0 0 64 64" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</svg>')

CSS = """
@import url("ASSETS/fonts/local.css"); @import url("ASSETS/fonts/brand_local.css");
:root{--ink:#0D082E;--acc:#5B4BFF;--acc2:#A99FFF;--ok:#2F9E6B;--warn:#E5484D;--ios:#007AFF;
 --serif:"Lexend","Inter Tight",sans-serif;--sans:"Inter Tight","Inter",sans-serif;--wide:"Lexend Exa","Lexend",sans-serif;
 --ease:cubic-bezier(.16,1.1,.3,1);--spring:cubic-bezier(.34,1.56,.64,1);--in:cubic-bezier(.7,0,.2,1)}
html,body{margin:0;width:1080px;height:1160px;overflow:hidden;background:#0D082E;font-family:var(--sans);color:#fff;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
.bg{position:absolute;inset:0;background:radial-gradient(80% 60% at 45% 30%,#1E1758 0%,#0D082E 60%,#07041A 100%)}
.grid{position:absolute;inset:0;opacity:.09;background-image:linear-gradient(rgba(169,159,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(169,159,255,.6) 1px,transparent 1px);background-size:72px 72px}
.safe{position:absolute;left:40px;top:24px;width:840px;height:740px}
.sc{position:absolute;inset:0}
@keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes popIn{0%{opacity:0;transform:scale(.5)}60%{opacity:1;transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
@keyframes slideL{from{opacity:0;transform:translateX(-70px)}to{opacity:1;transform:none}}
@keyframes slideR{from{opacity:0;transform:translateX(70px)}to{opacity:1;transform:none}}
@keyframes slideUp{from{transform:translateY(110%)}to{transform:none}}
@keyframes wipeIn{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes growY{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes devIn{from{opacity:0;transform:translateY(120px) rotate(var(--r,0deg)) scale(.92)}to{opacity:1;transform:rotate(var(--r,0deg))}}
@keyframes scIn{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes scOut{to{opacity:0;transform:translateY(-40px) scale(.96)}}
@keyframes strike{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes typing{from{width:0}}
@keyframes blink{50%{opacity:0}}
.kick{font:600 17px/1 var(--wide);letter-spacing:.16em;text-transform:uppercase;color:var(--acc2)}
.title{font:700 46px/1.08 var(--serif);letter-spacing:-.02em}
/* ---- appareils ---- */
.phone{position:absolute;width:360px;height:740px;border-radius:58px;background:#0b0a10;padding:14px;box-shadow:0 50px 100px -30px rgba(0,0,0,.85),inset 0 0 0 3px #2c2838,inset 0 0 0 6px #0b0a10}
.phone .scr{position:relative;width:100%;height:100%;border-radius:46px;overflow:hidden;background:#fff;color:#111}
.phone .isl{position:absolute;left:50%;top:12px;width:110px;height:32px;margin-left:-55px;border-radius:20px;background:#000;z-index:20}
.phone .sb{position:absolute;left:0;right:0;top:0;height:52px;display:flex;align-items:center;justify-content:space-between;padding:6px 30px 0 36px;font:600 17px var(--sans);z-index:19}
.tablet{position:absolute;width:820px;height:600px;border-radius:40px;background:#0b0a10;padding:20px;box-shadow:0 50px 100px -30px rgba(0,0,0,.85),inset 0 0 0 3px #2c2838}
.tablet .scr{position:relative;width:100%;height:100%;border-radius:24px;overflow:hidden;background:#fff;color:#111}
.safbar{height:56px;background:#F2F2F7;display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid #ddd}
.safbar .u{flex:1;height:36px;border-radius:10px;background:#E3E3E8;display:flex;align-items:center;justify-content:center;gap:6px;font:500 16px var(--sans);color:#333}
.mk{position:absolute;border:4px solid var(--acc);background:rgba(91,75,255,.10);border-radius:6px}
/* ---- écrans d'applis ---- */
.app-h{padding:62px 22px 10px;font:800 32px/1.05 var(--sans);letter-spacing:-.01em;color:#111}
.app-sub{padding:0 22px 12px;font:500 16px var(--sans);color:#8a8a8e}
.cell{display:flex;align-items:center;gap:14px;margin:0 14px 10px;padding:14px;background:#F2F2F7;border-radius:16px;font:600 18px/1.25 var(--sans);color:#111}
.ckb{width:30px;height:30px;flex:none;border-radius:50%;border:2.5px solid #C7C7CC;position:relative}
.ckb .on{position:absolute;inset:-2.5px;border-radius:50%;background:var(--acc);display:flex;align-items:center;justify-content:center}
.sheet{position:absolute;left:0;right:0;bottom:0;background:#fff;border-radius:26px 26px 0 0;box-shadow:0 -10px 30px rgba(0,0,0,.18);padding:14px 20px 26px;color:#111}
.sheet .grab{width:46px;height:5px;border-radius:3px;background:#D1D1D6;margin:0 auto 12px}
.sheet .h{font:800 24px/1.1 var(--sans)} .sheet .s{font:500 15px var(--sans);color:#8a8a8e;margin-top:3px}
.chip{display:inline-flex;align-items:center;gap:8px;margin:10px 6px 0 0;padding:9px 12px;border-radius:12px;font:700 16px/1.15 var(--sans)}
.chip.ok{background:#E6F4EC;color:#1E7A50} .chip.warn{background:#FDE8E8;color:#C0392B} .chip.acc{background:#ECEAFF;color:#3B2FD0}
.searchbar{position:absolute;left:14px;right:14px;top:60px;height:50px;border-radius:14px;background:#fff;box-shadow:0 6px 20px rgba(0,0,0,.18);display:flex;align-items:center;gap:10px;padding:0 14px;font:500 18px var(--sans);color:#8a8a8e;z-index:5}
/* ---- cartes d'info hors écran ---- */
.info{position:absolute;background:#fff;color:var(--ink);border-radius:20px;padding:20px 22px;box-shadow:0 30px 60px -25px rgba(0,0,0,.7);border-left:8px solid var(--acc)}
.info.ok{border-left-color:var(--ok)} .info.warn{border-left-color:var(--warn)}
.info .h{font:600 15px/1 var(--wide);letter-spacing:.12em;text-transform:uppercase;color:var(--acc)}
.info.ok .h{color:var(--ok)} .info.warn .h{color:var(--warn)}
.info .v{font:700 30px/1.12 var(--serif);letter-spacing:-.01em;margin-top:8px} .info .s{font:500 18px/1.3 var(--sans);color:#6B6880;margin-top:6px}
"""

def phone(x, y, screen, d=0.0, rot=0, time="9:41", dark=False):
    sb_col = '#fff' if dark else '#111'
    return (f'<div class="phone" style="left:{x}px;top:{y}px;--r:{rot}deg;{A("devIn", d, .8, "var(--spring)")}"><div class="isl"></div>'
            f'<div class="scr" style="{"background:#111" if dark else ""}"><div class="sb" style="color:{sb_col}"><span>{time}</span><span>▮▮▮ ◔</span></div>{screen}</div></div>')

def tablet(x, y, screen, d=0.0, w=820, h=600):
    return (f'<div class="tablet" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;{A("devIn", d, .8, "var(--spring)")}">'
            f'<div class="scr">{screen}</div></div>')

def safari(url, img, crop, marks, o, width, height, scroll=True, t_ref=0):
    """Écran Safari avec capture réelle d'un site officiel + surlignages synchronisés (temps source)."""
    x0, y0, x1, y1 = crop; sc = width / (x1 - x0); H = (y1 - y0) * sc
    mk = "".join(f'<div class="mk" style="left:{(a-x0)*sc-6:.0f}px;top:{(b-y0)*sc-4:.0f}px;width:{(c-a)*sc+12:.0f}px;height:{(d-b)*sc+8:.0f}px;{A("wipeIn", o(t), .45)}"></div>'
                 for (a, b, c, d), t in marks)
    return (f'<div class="safbar"><span style="color:#007AFF;font:600 18px var(--sans)">‹</span><div class="u">🔒 {esc(url)}</div><span style="color:#007AFF;font:600 20px var(--sans)">⋯</span></div>'
            f'<div style="position:relative;width:{width}px;height:{H:.0f}px;background:url(\'{ASSETS}/{img}\') no-repeat;background-size:{2880*sc:.0f}px auto;background-position:{-x0*sc:.0f}px {-y0*sc:.0f}px">{mk}</div>')

def info(x, y, w, h_, v, s=None, tone="", d=0.0, anim="slideR"):
    return (f'<div class="info {tone}" style="left:{x}px;top:{y}px;width:{w}px;{A(anim, d, .55, "var(--spring)")}"><div class="h">{esc(h_)}</div>'
            f'<div class="v">{esc(v)}</div>' + (f'<div class="s">{esc(s)}</div>' if s else '') + '</div>')

def headline(k, t, d=0.0, top=0):
    return (f'<div style="position:absolute;left:0;top:{top}px;width:840px"><div class="kick" style="{A("fade", d, .4)}">{esc(k)}</div>'
            f'<div class="title" style="margin-top:12px;{A("fadeUp", d + .1, .55, "var(--spring)")}">{esc(t)}</div></div>')

# ------------------------------------------------------------------ écran « plans » (appli de navigation générique)
_MAPN = [0]
def maps_screen(o, cam, pins, w=332, h=712, route=None, hl=()):
    """Carte style appli de navigation (générique, sans marque). cam = [(t_source|None, lon, lat, zoom)]."""
    _MAPN[0] += 1; mid = f"map{_MAPN[0]}"
    camo = [((o(t) if t is not None else 0), lo, la, z) for t, lo, la, z in cam]
    pin = [dict(n=n, lon=lo, lat=la, t=o(t)) for n, lo, la, t in pins]
    if route: route = dict(route, t=o(route['t']))
    js = f"""(function(){{const land=topojson.feature(window.TOPO,window.TOPO.objects.countries);const el=document.getElementById('{mid}');
 const CAM={json.dumps(camo)},PINS={json.dumps(pin, ensure_ascii=False)},HL={json.dumps(list(hl))},ROUTE={json.dumps(route)};
 const ez=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2; const proj=d3.geoMercator(); const path=d3.geoPath(proj);
 function cam(t){{let i=0;while(i<CAM.length-1&&t>=CAM[i+1][0])i++; if(i===0)return CAM[0]; const a=CAM[i-1],b=CAM[i],k=ez(Math.min(1,Math.max(0,(t-b[0])/1.4)));
   return [t,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k,a[3]*Math.pow(b[3]/a[3],k)];}}
 window.HOOKS.push(function(t){{const c=cam(t); proj.scale(c[3]).center([c[1],c[2]]).translate([{w/2},{h*0.42}]);
  let s=`<rect width="{w}" height="{h}" fill="#AAD3DF"/>`;
  for(const f of land.features) s+=`<path d="${{path(f)}}" fill="${{HL.includes(f.id)?'#E8E0F8':'#F2EFE9'}}" stroke="${{HL.includes(f.id)?'#7B6CFF':'#CFC7BA'}}" stroke-width="${{HL.includes(f.id)?2:1}}"/>`;
  if(ROUTE){{ const k=Math.min(1,Math.max(0,(t-ROUTE.t)/1.6)); if(k>0){{ const ip=d3.geoInterpolate(ROUTE.a,ROUTE.b); const pts=[];for(let i=0;i<=40*k;i++)pts.push(ip(i/40));
     s+=`<path d="${{path({{type:'LineString',coordinates:pts}})}}" fill="none" stroke="#1A73E8" stroke-width="6" stroke-linecap="round"/>`; }} }}
  for(const p of PINS){{ if(t<p.t) continue; const [x,y]=proj([p.lon,p.lat]); const k=Math.min(1,(t-p.t)/.35);
    s+=`<g transform="translate(${{x}},${{y}}) scale(${{.6+.4*k}})"><path d="M0,0 C0,0 -16,-20 -16,-32 A16,16 0 0 1 16,-32 C16,-20 0,0 0,0 Z" fill="#EA4335" stroke="#fff" stroke-width="2.5"/><circle cy="-32" r="6" fill="#fff"/></g>`;
    s+=`<g transform="translate(${{x+20}},${{y-44}})" opacity="${{k}}"><rect x="-4" y="-20" rx="8" width="${{p.n.length*12+20}}" height="30" fill="#fff" stroke="#ddd"/><text x="6" y="1" font-family="Inter Tight" font-weight="700" font-size="17" fill="#111">${{p.n}}</text></g>`; }}
  el.innerHTML=s; }});}})();"""
    html_ = f'<svg id="{mid}" viewBox="0 0 {w} {h}" style="position:absolute;inset:0;width:{w}px;height:{h}px"></svg>'
    return html_, js

LIBS = "".join(f'<script src="{ASSETS}/lib/{f}"></script>' for f in ["d3-array.min.js", "d3-geo.min.js", "d3-geo-projection.min.js", "topojson-client.min.js", "countries-50m.js"])

# ------------------------------------------------------------------ scènes
def scene(s, o):
    """Renvoie (html, js) pour une scène du manifeste."""
    T = s['type']; js = ""
    d = lambda t: o(t)
    if T == 'maps_phone':                       # iPhone : appli plans + feuille d'info qui monte
        mh, js = maps_screen(o, s['cam'], s['pins'], route=s.get('route'), hl=s.get('hl', ()))
        sheet = ""
        for k, sh in enumerate(s.get('sheets', [])):
            chips = "".join(f'<span class="chip {c[2]}" style="{A("popIn", d(c[1]), .45, "var(--spring)")}">{esc(c[0])}</span>' for c in sh.get('chips', []))
            sheet += (f'<div class="sheet" style="z-index:{10+k};{A("slideUp", d(sh["t"]), .55, "var(--spring)")}"><div class="grab"></div>'
                      f'<div class="h">{esc(sh["h"])}</div><div class="s">{esc(sh.get("s", ""))}</div>{chips}</div>')
        scr = mh + f'<div class="searchbar">{icon("search", 22, "#8a8a8e")}<span>{esc(s.get("search", "Rechercher un lieu"))}</span></div>' + sheet
        h = phone(s.get('px', 30), s.get('py', 10), scr, d(s['t0']))
        for c in s.get('cards', []):
            h += info(430, c['y'], 400, c['h'], c['v'], c.get('s'), c.get('tone', ''), d(c['t']))
        if s.get('kicker'): h += f'<div style="position:absolute;left:430px;top:6px;width:400px">{"<div class=kick style=" + chr(34) + A("fade", d(s["t0"]) + .2, .4) + chr(34) + ">" + esc(s["kicker"]) + "</div>"}<div class="title" style="font-size:40px;margin-top:10px;{A("fadeUp", d(s["t0"]) + .3, .5, "var(--spring)")}">{esc(s["title"])}</div></div>'
        return h, js
    if T == 'safari_tablet':                     # iPad : Safari sur une vraie page officielle
        scr = safari(s['url'], s['img'], s['crop'], s['marks'], o, 780, 560)
        h = headline(s['kicker'], s['title'], d(s['t0']))
        h += tablet(10, 150, scr, d(s['t0']) + .15, 820, 600)
        if s.get('source'): h += f'<div style="position:absolute;left:0;top:760px;width:840px;font:500 17px var(--sans);color:rgba(255,255,255,.6);{A("fade", d(s["t0"]) + 1, .5)}">{esc(s["source"])}</div>'
        return h, js
    if T == 'safari_phone':                      # iPhone : Safari + cartes à droite
        scr = '<div style="height:52px"></div>' + safari(s['url'], s['img'], s['crop'], s['marks'], o, 332, 640)
        h = phone(30, 10, scr, d(s['t0']))
        for c in s.get('cards', []): h += info(430, c['y'], 400, c['h'], c['v'], c.get('s'), c.get('tone', ''), d(c['t']))
        if s.get('kicker'): h += f'<div style="position:absolute;left:430px;top:6px;width:400px"><div class="kick" style="{A("fade", d(s["t0"]) + .2, .4)}">{esc(s["kicker"])}</div><div class="title" style="font-size:38px;margin-top:10px;{A("fadeUp", d(s["t0"]) + .3, .5, "var(--spring)")}">{esc(s["title"])}</div></div>'
        if s.get('source'): h += f'<div style="position:absolute;left:430px;top:720px;width:400px;font:500 15px var(--sans);color:rgba(255,255,255,.6)">{esc(s["source"])}</div>'
        return h, js
    if T == 'checklist_phone':                   # iPhone : appli de rappels / check-list
        rows = "".join(f'<div class="cell" style="{A("slideR", d(t), .5, "var(--spring)")}"><div class="ckb"><div class="on" style="{A("popIn", d(t) + .35, .4, "var(--spring)")}">{icon(it.get("mark", "check"), 18, "#fff", 5)}</div></div>'
                       f'<div style="flex:1">{esc(txt)}</div><div style="color:var(--acc)">{icon(ic, 26, "#5B4BFF")}</div></div>'
                       for txt, t, ic, it in [(x[0], x[1], x[2], (x[3] if len(x) > 3 else {})) for x in s['items']])
        scr = f'<div class="app-h">{esc(s["app_title"])}</div><div class="app-sub">{esc(s.get("app_sub", ""))}</div>{rows}'
        h = phone(30, 10, scr, d(s['t0']))
        h += f'<div style="position:absolute;left:430px;top:30px;width:400px"><div class="kick" style="{A("fade", d(s["t0"]) + .2, .4)}">{esc(s["kicker"])}</div><div class="title" style="font-size:40px;margin-top:12px;{A("fadeUp", d(s["t0"]) + .3, .5, "var(--spring)")}">{esc(s["title"])}</div></div>'
        for c in s.get('cards', []): h += info(430, c['y'], 400, c['h'], c['v'], c.get('s'), c.get('tone', ''), d(c['t']))
        return h, js
    if T == 'calendar_phone':                    # iPhone : calendrier, jours qui se remplissent
        days = ""
        for i in range(28):
            hot = i < s['n_days']; t = s['days_t0'] + (s['days_t1'] - s['days_t0']) * i / max(1, s['n_days'] - 1) if hot else None
            st = f"background:var(--acc);color:#fff;{A('popIn', d(t), .35, 'var(--spring)')}" if hot else "color:#111"
            days += f'<div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 17px var(--sans);{st}">{i+1}</div>'
        scr = (f'<div class="app-h">{esc(s["month"])}</div><div style="display:grid;grid-template-columns:repeat(7,40px);gap:6px 6px;padding:10px 18px">'
               + "".join(f'<div style="text-align:center;font:600 13px var(--sans);color:#8a8a8e">{x}</div>' for x in "LMMJVSD") + days + '</div>'
               + f'<div class="cell" style="margin-top:16px;{A("fadeUp", d(s["badge_t"]), .45)}"><div style="width:10px;height:42px;border-radius:5px;background:var(--acc)"></div><div>{esc(s["badge"])}</div></div>')
        h = phone(30, 10, scr, d(s['t0']))
        h += (f'<div style="position:absolute;left:430px;top:40px;width:400px;text-align:left"><div class="kick" style="{A("fade", d(s["t0"]) + .2, .4)}">{esc(s["kicker"])}</div>'
              f'<div style="font:800 190px/0.9 var(--serif);letter-spacing:-.04em;margin-top:14px;{A("popIn", d(s["big_t"]), .5, "var(--spring)")}">{esc(s["big"])}</div>'
              f'<div class="title" style="font-size:40px;margin-top:6px;{A("fadeUp", d(s["big_t"]) + .2, .5, "var(--spring)")}">{esc(s["big_sub"])}</div></div>')
        for c in s.get('cards', []): h += info(430, c['y'], 400, c['h'], c['v'], c.get('s'), c.get('tone', ''), d(c['t']))
        return h, js
    if T == 'city_phone':                        # iPhone : plan de ville stylisé, quartiers et hôtels
        roads = "".join(f'<path d="{p}" stroke="#fff" stroke-width="{w}" fill="none" stroke-linecap="round"/>' for p, w in [
            ("M-10 200 C80 180 200 230 350 190", 14), ("M-10 420 C100 400 220 470 350 430", 14), ("M120 -10 C110 200 150 400 130 720", 12),
            ("M250 -10 C240 220 270 480 230 720", 10), ("M-10 600 C120 560 230 640 350 600", 10), ("M40 300 L300 320", 6), ("M60 520 L310 500", 6)])
        zones = ""
        for i, (lab, t, (zx, zy, zr)) in enumerate(s['zones']):
            zones += (f'<g style="{A("popIn", d(t), .5, "var(--spring)")};transform-origin:{zx}px {zy}px"><circle cx="{zx}" cy="{zy}" r="{zr}" fill="rgba(91,75,255,.18)" stroke="#5B4BFF" stroke-width="3" stroke-dasharray="8 6"/>'
                      f'<g transform="translate({zx-16},{zy-30})"><rect width="32" height="32" rx="8" fill="#5B4BFF"/><text x="16" y="23" text-anchor="middle" font-family="Inter Tight" font-weight="800" font-size="18" fill="#fff">{i+1}</text></g>'
                      f'<text x="{zx}" y="{zy+28}" text-anchor="middle" font-family="Inter Tight" font-weight="700" font-size="16" fill="#3B2FD0">{esc(lab)}</text></g>')
        scr = (f'<svg viewBox="0 0 332 712" style="position:absolute;inset:0"><rect width="332" height="712" fill="#F2EFE9"/>'
               f'<rect x="170" y="250" width="140" height="120" rx="20" fill="#CDE8C4"/><path d="M0 660 C120 640 220 690 332 650 V712 H0Z" fill="#AAD3DF"/>{roads}{zones}</svg>'
               f'<div class="searchbar">{icon("hotel", 22, "#8a8a8e")}<span>{esc(s.get("search", "Hôtels"))}</span></div>')
        h = phone(30, 10, scr, d(s['t0']))
        h += f'<div style="position:absolute;left:430px;top:30px;width:400px"><div class="kick" style="{A("fade", d(s["t0"]) + .2, .4)}">{esc(s["kicker"])}</div><div style="font:800 170px/0.9 var(--serif);margin-top:10px;{A("popIn", d(s["big_t"]), .5, "var(--spring)")}">{esc(s["big"])}</div><div class="title" style="font-size:40px;margin-top:4px;{A("fadeUp", d(s["big_t"]) + .2, .5, "var(--spring)")}">{esc(s["big_sub"])}</div></div>'
        for c in s.get('cards', []): h += info(430, c['y'], 400, c['h'], c['v'], c.get('s'), c.get('tone', ''), d(c['t']))
        return h, js
    if T == 'listings_phone':                    # iPhone : appli d'annonces immobilières (générique)
        cards = ""
        for i, t in enumerate(s['visits']):
            cards += (f'<div style="display:flex;gap:12px;margin:0 14px 10px;padding:10px;border-radius:16px;background:#F2F2F7;align-items:center;{A("slideR", d(t), .45, "var(--spring)")}">'
                      f'<div style="width:70px;height:56px;border-radius:12px;background:linear-gradient(135deg,#C9C2F5,#8F84FF);display:flex;align-items:center;justify-content:center;color:#fff">{icon("house", 30, "#fff")}</div>'
                      f'<div style="flex:1;font:700 17px var(--sans)">Visite {i+1}<div style="font:500 14px var(--sans);color:#8a8a8e">Annonce en ligne</div></div>'
                      f'<div class="ckb"><div class="on" style="{A("popIn", d(t) + .3, .4, "var(--spring)")}">{icon("check", 18, "#fff", 5)}</div></div></div>')
        scr = f'<div class="app-h">{esc(s["app_title"])}</div><div class="app-sub">{esc(s.get("app_sub", ""))}</div>{cards}'
        h = phone(30, 10, scr, d(s['t0']))
        h += f'<div style="position:absolute;left:430px;top:30px;width:400px"><div class="kick" style="{A("fade", d(s["t0"]) + .2, .4)}">{esc(s["kicker"])}</div><div style="font:800 170px/0.9 var(--serif);margin-top:10px;{A("popIn", d(s["big_t"]), .5, "var(--spring)")}">{esc(s["big"])}</div><div class="title" style="font-size:40px;margin-top:4px;{A("fadeUp", d(s["big_t"]) + .2, .5, "var(--spring)")}">{esc(s["big_sub"])}</div></div>'
        for c in s.get('cards', []): h += info(430, c['y'], 400, c['h'], c['v'], c.get('s'), c.get('tone', ''), d(c['t']))
        return h, js
    if T == 'search_phone':                      # iPhone : recherche tapée puis barrée
        q = s['query']; n = len(q)
        scr = (f'<div class="app-h">Recherche</div><div style="margin:6px 14px;height:52px;border-radius:14px;background:#F2F2F7;display:flex;align-items:center;gap:10px;padding:0 14px;position:relative">'
               f'{icon("search", 22, "#8a8a8e")}<span style="font:600 21px var(--sans);color:#111;white-space:nowrap;overflow:hidden;display:inline-block;width:{n*11.5:.0f}px;animation:typing .9s steps({n}) {d(s["type_t"]):.2f}s both">{esc(q)}</span>'
               f'<span style="width:2px;height:26px;background:#007AFF;animation:blink 1s steps(1) infinite"></span>'
               f'<span style="position:absolute;left:44px;width:{n*11.5:.0f}px;top:25px;height:4px;background:#E5484D;transform-origin:left;{A("strike", d(s["strike_t"]), .35)}"></span></div>'
               + "".join(f'<div class="cell" style="{A("fadeUp", d(s["type_t"]) + .9 + .15*i, .4)}">{icon("pin", 22, "#8a8a8e")}<span style="color:#8a8a8e">{esc(r)}</span></div>' for i, r in enumerate(s.get('results', []))))
        h = phone(30, 10, scr, d(s['t0']))
        h += f'<div style="position:absolute;left:430px;top:30px;width:400px"><div class="kick" style="{A("fade", d(s["t0"]) + .2, .4)}">{esc(s["kicker"])}</div>'
        for k, (txt, t, tone) in enumerate(s['lines']):
            col = {'warn': '#FF8A8E', 'acc': '#A99FFF'}.get(tone, '#fff')
            h += f'<div class="title" style="font-size:46px;margin-top:18px;color:{col};{A("popIn", d(t), .5, "var(--spring)")}">{esc(txt)}</div>'
        h += '</div>'
        return h, js
    if T == 'dashboard_tablet':                  # iPad : tableau de bord d'une phase (icône, jauge, lignes)
        rows = "".join(f'<div style="display:flex;align-items:center;gap:16px;padding:16px 0;border-top:1px solid #ECEBF0;{A("slideR", d(t), .5, "var(--spring)")}">'
                       f'<div style="width:46px;height:46px;flex:none;border-radius:12px;background:#ECEAFF;color:#5B4BFF;display:flex;align-items:center;justify-content:center">{icon(ic, 28, "#5B4BFF")}</div>'
                       f'<div style="font:600 22px/1.25 var(--sans);color:#111">{esc(txt)}</div></div>' for txt, t, ic in s['rows'])
        gauge = ""
        if s.get('gauge'):
            g = s['gauge']
            gauge = (f'<div style="margin-top:12px;padding:16px;border-radius:16px;background:#F7F6FB;{A("fadeUp", d(g["t"]), .5)}"><div style="font:700 17px var(--sans);color:#6B6880">{esc(g["label"])}</div>'
                     f'<div style="height:16px;border-radius:8px;background:#E3E1EE;margin-top:10px;overflow:hidden"><div style="height:100%;width:100%;background:linear-gradient(90deg,#5B4BFF,#A99FFF);transform-origin:left;{A("grow", d(g["t"]) + .2, 1.6, "cubic-bezier(.3,0,.2,1)")}"></div></div></div>')
        scr = (f'<div style="display:flex;height:100%"><div style="width:200px;background:#F7F6FB;padding:30px 18px;border-right:1px solid #ECEBF0">'
               f'<div style="display:flex;gap:8px;align-items:center;font:800 18px var(--sans);color:#0D082E"><img src="{BRAND}/icon_navy.png" style="width:26px"> Patrimoine</div>'
               + "".join(f'<div style="margin-top:18px;padding:10px 12px;border-radius:10px;font:600 16px var(--sans);{"background:#5B4BFF;color:#fff" if i == s["tab"] else "color:#6B6880"}">{esc(x)}</div>' for i, x in enumerate(["Phase 1 · Croissance", "Phase 2 · Préservation"]))
               + f'</div><div style="flex:1;padding:30px 30px 0"><div style="display:flex;align-items:center;gap:14px"><div style="width:60px;height:60px;border-radius:16px;background:var(--acc);display:flex;align-items:center;justify-content:center;{A("popIn", d(s["t0"]) + .5, .5, "var(--spring)")}">{icon(s["icon"], 38, "#fff")}</div>'
               f'<div><div style="font:800 30px var(--sans);color:#111">{esc(s["phase"])}</div><div style="font:500 17px var(--sans);color:#8a8a8e">{esc(s["phase_sub"])}</div></div></div>'
               f'<div style="margin-top:16px">{rows}</div>{gauge}</div></div>')
        h = headline(s['kicker'], s['title'], d(s['t0'])) + tablet(10, 150, scr, d(s['t0']) + .15, 820, 600)
        return h, js
    if T == 'feeds':                             # deux iPhones façon réseau social
        def feed(tag, night_t, verdict, tone):
            return (f'<div style="height:52px"></div><div style="display:flex;align-items:center;gap:10px;padding:8px 16px;font:700 16px var(--sans)"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#FFB86C,#FF5E8A)"></div>{tag}</div>'
                    f'<div style="position:relative;height:420px;background:linear-gradient(180deg,#FFB46B 0%,#FF7A8A 45%,#7A5CFF 100%);overflow:hidden">'
                    f'<div style="position:absolute;left:50%;top:140px;width:130px;height:130px;margin-left:-65px;border-radius:50%;background:#FFE7A3;box-shadow:0 0 70px #FFD27A"></div>'
                    f'<svg viewBox="0 0 300 300" style="position:absolute;right:-10px;bottom:40px;width:260px"><path d="M150 300 C150 220 160 160 175 110" stroke="#1d1238" stroke-width="10" fill="none"/><path d="M175 110 C140 90 100 95 70 120 M175 110 C150 70 120 55 90 55 M175 110 C200 70 235 60 260 75 M175 110 C215 100 245 115 265 140" stroke="#1d1238" stroke-width="9" fill="none" stroke-linecap="round"/></svg>'
                    f'<div style="position:absolute;left:0;right:0;bottom:0;height:110px;background:linear-gradient(180deg,#3b2a8f,#1b1550)"></div>'
                    f'<div style="position:absolute;inset:0;background:rgba(13,8,46,.55);{A("fade", d(night_t), .5)}"></div>'
                    f'<div style="position:absolute;left:14px;right:14px;bottom:20px;padding:14px;border-radius:12px;text-align:center;font:800 24px/1.1 var(--serif);color:#fff;background:{"#E5484D" if tone == "warn" else "#2F9E6B"};{A("popIn", d(night_t) + .1, .45, "var(--spring)")}">{esc(verdict)}</div></div>'
                    f'<div style="padding:14px 16px;font:600 18px var(--sans)"><span style="color:#FF3B5C">♥</span>&nbsp; 💬 &nbsp;↗</div><div style="padding:0 16px;font:400 16px/1.35 var(--sans);color:#333"><b>{tag}</b> Le rêve d\'expat 🌴 #freedom</div>')
        h = (phone(20, 20, feed('#bali', s['night_t'][0], s['verdicts'][0], 'warn'), d(s['t0']), -4)
             + phone(460, 20, feed('#thailande', s['night_t'][1], s['verdicts'][1], 'ok'), d(s['t0']) + .2, 4)
             + f'<div style="position:absolute;left:0;width:840px;top:330px;text-align:center;font:300 110px/1 var(--serif);color:#A99FFF;{A("popIn", d(s["neq_t"]), .5, "var(--spring)")}">≠</div>')
        return h, js
    if T == 'chat_phone':                        # iPhone : message reçu (illustration de la sollicitation décrite)
        bubbles = "".join(f'<div style="max-width:250px;margin:10px 14px;padding:12px 14px;border-radius:18px 18px 18px 6px;background:#E9E9EB;font:500 18px/1.3 var(--sans);color:#111;{A("popIn", d(t), .45, "var(--spring)")};transform-origin:left bottom">{esc(txt)}</div>' for txt, t in s['bubbles'])
        scr = (f'<div style="height:52px"></div><div style="text-align:center;padding:8px 0 12px;border-bottom:1px solid #eee"><div style="width:54px;height:54px;border-radius:50%;background:#C7C7CC;margin:0 auto;display:flex;align-items:center;justify-content:center;color:#fff;font:700 22px var(--sans)">?</div>'
               f'<div style="font:600 15px var(--sans);margin-top:6px">{esc(s["sender"])}</div></div>{bubbles}')
        h = phone(30, 10, scr, d(s['t0']))
        h += f'<div style="position:absolute;left:430px;top:30px;width:400px"><div class="kick" style="color:#FF8A8E;{A("fade", d(s["t0"]) + .2, .4)}">{esc(s["kicker"])}</div><div class="title" style="font-size:40px;margin-top:12px;{A("fadeUp", d(s["t0"]) + .3, .5, "var(--spring)")}">{esc(s["title"])}</div></div>'
        for c in s.get('cards', []): h += info(430, c['y'], 400, c['h'], c['v'], c.get('s'), c.get('tone', ''), d(c['t']))
        return h, js
    if T == 'globe':                             # globe + compteur (sans appareil)
        T0, TC, dur = d(s['ring_at']), d(s['count_at']), d(s['t1']) - d(s['t0'])
        h = ('<svg id="gl" viewBox="0 0 840 740" style="position:absolute;left:0;top:0;width:840px;height:740px"></svg>'
             f'<div style="position:absolute;left:0;width:840px;top:10px;text-align:center;{A("popIn", TC, .5, "var(--spring)")}"><span id="km" style="font:800 140px/1 var(--serif);letter-spacing:-.04em;text-shadow:0 10px 40px rgba(0,0,0,.6)">0</span><span style="font:700 64px/1 var(--serif);margin-left:12px">km</span></div>'
             f'<div style="position:absolute;left:40px;width:760px;top:640px;text-align:center;font:700 40px/1.18 var(--serif);{A("fadeUp", d(s["line_at"]), .55, "var(--spring)")}">{esc(s["line"])}</div>')
        js = f"""(function(){{const land=topojson.feature(window.TOPO,window.TOPO.objects.countries);const svg=document.getElementById('gl');const ez=x=>1-Math.pow(1-Math.min(1,Math.max(0,x)),3);
 window.HOOKS.push(function(t){{ if(t<{d(s['t0']):.2f}-.5||t>{d(s['t1']):.2f}+.5) return; const u=t-{d(s['t0']):.2f};
  const proj=d3.geoOrthographic().rotate([-2.35-14*ez(u/{dur:.2f}),-40]).scale(270).translate([420,400]).clipAngle(90);const path=d3.geoPath(proj);
  let s=`<circle cx="420" cy="400" r="270" fill="#120C3A" stroke="rgba(169,159,255,.35)" stroke-width="2"/><path d="${{path(d3.geoGraticule10())}}" fill="none" stroke="rgba(169,159,255,.12)"/>`;
  for(const f of land.features) s+=`<path d="${{path(f)}}" fill="${{f.id==='250'?'#5B4BFF':'rgba(255,255,255,.12)'}}" stroke="rgba(169,159,255,.3)" stroke-width=".6"/>`;
  const k=ez((t-{T0:.2f})/1.6); if(k>0) s+=`<path d="${{path(d3.geoCircle().center([2.35,48.86]).radius(89.9*k)())}}" fill="rgba(91,75,255,.12)" stroke="#A99FFF" stroke-width="4" stroke-dasharray="14 10"/>`;
  const [px,py]=proj([2.35,48.86]); s+=`<circle cx="${{px}}" cy="${{py}}" r="10" fill="#fff" stroke="#5B4BFF" stroke-width="5"/>`; svg.innerHTML=s;
  document.getElementById('km').textContent=Math.round({s['km']}*ez((t-{TC:.2f})/1.2)).toLocaleString('fr-FR').replace(/\\u202f/g,'\\u00a0'); }});}})();"""
        return h, js
    if T == 'stamp_phone':                       # iPhone : calendrier qui défile les années + tampon
        pages = "".join(f'<div style="position:absolute;left:26px;right:26px;top:{120 + i*36}px;height:300px;border-radius:20px;background:#fff;box-shadow:0 10px 30px rgba(0,0,0,.15);overflow:hidden;{A("fadeUp", d(s["t0"]) + .3 + i*.22, .4, "var(--spring)")}">'
                        f'<div style="height:60px;background:#E5484D"></div><div style="display:flex;align-items:center;justify-content:center;height:240px">{icon("lock" if i == 3 else "chart", 90, "#0D082E", 3)}</div></div>' for i in range(4))
        scr = f'<div class="app-h">Calendrier</div>{pages}'
        h = phone(30, 10, scr, d(s['t0']))
        h += (f'<div style="position:absolute;left:430px;top:40px;width:400px"><div class="kick" style="{A("fade", d(s["t0"]) + .2, .4)}">{esc(s["kicker"])}</div><div class="title" style="font-size:46px;margin-top:12px;{A("fadeUp", d(s["t0"]) + .3, .5, "var(--spring)")}">{esc(s["title"])}</div></div>'
              f'<div style="position:absolute;left:400px;top:330px;transform:rotate(-8deg);{A("popIn", d(s["stamp_t"]), .45, "var(--spring)")}"><span style="display:inline-block;border:7px solid #E5484D;color:#E5484D;background:#fff;border-radius:14px;padding:12px 22px;font:800 52px/1 var(--serif);text-transform:uppercase">{esc(s["stamp"])}</span></div>'
              f'<div style="position:absolute;left:430px;top:520px;width:400px;font:600 32px/1.25 var(--serif);color:#A99FFF;{A("fadeUp", d(s["sub_t"]), .5, "var(--spring)")}">{esc(s["sub"])}</div>')
        return h, js
    if T == 'compare_cards':                     # deux cartes comparatives + icônes
        h = headline(s['kicker'], s['title'], d(s['t0']))
        for i, c in enumerate(s['cards']):
            h += (f'<div class="info {c.get("tone", "")}" style="left:0;top:{150 + i*150}px;width:820px;display:flex;align-items:center;gap:20px;{A("slideR", d(c["t"]), .5, "var(--spring)")}">'
                  f'<div style="width:72px;height:72px;flex:none;border-radius:18px;background:var(--acc);display:flex;align-items:center;justify-content:center">{icon(c["icon"], 44, "#fff")}</div>'
                  f'<div><div class="h">{esc(c["h"])}</div><div class="v">{esc(c["v"])}</div>' + (f'<div class="s">{esc(c["s"])}</div>' if c.get("s") else "") + '</div></div>')
        return h, js
    raise ValueError(T)

def build(short, o, dur):
    body, js = "", []
    sc = short['scenes']
    for i, s in enumerate(sc):
        a, b = o(s['t0']), o(s['t1'])
        h, j = scene(s, o)
        if j: js.append(j)
        enter = f"animation:scIn .4s var(--in) {a:.2f}s both" + ("" if i == len(sc) - 1 else f", scOut .35s var(--in) {b - .35:.2f}s forwards")
        body += f'<div class="sc" style="{enter}">{h}</div>'
    css = CSS.replace("ASSETS", ASSETS)
    top = (f'<div style="position:absolute;left:40px;top:-4px;width:840px;display:flex;align-items:center;gap:12px;opacity:0"></div>')
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body><div class="bg"></div><div class="grid"></div>'
            f'<div class="safe">{body}</div>{LIBS}<script>window.HOOKS=[];{"".join(js)}window.onT=function(t){{window.HOOKS.forEach(f=>f(t))}};window.READY=true;</script></body></html>')
