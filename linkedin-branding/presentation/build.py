# Génère la page de présentation comparative (index.html + aperçus JPG) à partir de output/.
import os, html, shutil
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
R = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(R, '..', 'output'); I = os.path.join(R, 'img')
shutil.rmtree(I, ignore_errors=True); os.makedirs(I)
DIRS = [('A', 'A-institutional-advisory', 'The Institutional Advisory', 'Cabinet international de conseil fiscal et corporate', 'Serif institutionnelle, grands blancs, filets fins, numérotation romaine. Ivoire et navy. La plus sobre et la plus « cabinet ».'),
        ('B', 'B-modern-financial-journal', 'The Modern Financial Journal', 'Publication professionnelle de fiscalité et de finance', 'En-tête de journal, titres Playfair très affirmés, texte en serif de lecture, figures et tableaux numérotés, un accent brique. La plus éditoriale.'),
        ('C', 'C-corporate-precision', 'The Corporate Precision', 'Cabinet de conseil multidisciplinaire moderne', 'Grille modulaire visible, Inter en graisses fortes, index numériques, aplats navy. La plus structurée et la plus lisible en petit format.')]
PUBS = [('editorial-1', 'Publication éditoriale · variante 1'), ('editorial-2', 'Publication éditoriale · variante 2'), ('infographie', 'Infographie fiscale'), ('comparatif', 'Tableau comparatif'),
        ('actualite', 'Actualité fiscale'), ('expert', 'Présentation d’expert'), ('methodologie', 'Méthodologie'), ('partenariat', 'Partenariat (exemple fictif)'), ('corporate', 'Publication corporate'), ('evenement', 'Événement')]
def jpg(src, name, w, crop=None, q=82):
    im = Image.open(src).convert('RGB')
    if crop: im = im.crop(crop)
    if im.width != w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(os.path.join(I, name), quality=q, optimize=True, progressive=True); return 'img/' + name
e = html.escape
secs = []; cmp = {k: [] for k in ['page', 'banniere', 'fil', 'infog', 'cas', 'expert', 'edito']}
for d, slug, nom, ref, txt in DIRS:
    b = os.path.join(O, slug); l = d.lower(); p = lambda *a: os.path.join(b, *a)
    plan = jpg(p('00-planche', f'fynovates-{l}-planche-branding.png'), f'{l}-planche.jpg', 1200, q=78)
    desk = jpg(p('05-page-linkedin', f'fynovates-{l}-page-linkedin-ordinateur.png'), f'{l}-ordinateur.jpg', 1200, q=80)
    deskTop = jpg(p('05-page-linkedin', f'fynovates-{l}-page-linkedin-ordinateur.png'), f'{l}-ordinateur-entete.jpg', 900, crop=(140, 60, 1300, 640))
    mob = jpg(p('05-page-linkedin', f'fynovates-{l}-page-linkedin-mobile.png'), f'{l}-mobile.jpg', 600, q=80)
    mobTop = jpg(p('05-page-linkedin', f'fynovates-{l}-page-linkedin-mobile.png'), f'{l}-mobile-ecran.jpg', 400, crop=(0, 0, 780, 1688))
    ban = jpg(p('01-identite', f'fynovates-{l}-banniere-linkedin.png'), f'{l}-banniere.jpg', 1400, q=88)
    prof = jpg(p('01-identite', f'fynovates-{l}-photo-de-profil.png'), f'{l}-profil.jpg', 400, q=90)
    pubs = [(jpg(p('02-publications', f'fynovates-{l}-{n}.png'), f'{l}-{n}.jpg', 600), t) for n, t in PUBS]
    car = [jpg(p('03-carrousel-pdf', 'pages', f'fynovates-{l}-carrousel-page-0{i}.png'), f'{l}-car-{i}.jpg', 480) for i in range(1, 9)]
    cas = [jpg(p('04-etude-de-cas', 'pages', f'fynovates-{l}-cas-page-0{i}.png'), f'{l}-cas-{i}.jpg', 480) for i in range(1, 6)]
    cmp['page'].append(deskTop); cmp['banniere'].append(ban); cmp['fil'].append(mobTop); cmp['infog'].append(pubs[2][0]); cmp['cas'].append(cas[0]); cmp['expert'].append(pubs[5][0]); cmp['edito'].append(pubs[0][0])
    fig = lambda s, c, cls='': f'<figure class="{cls}"><img src="{s}" alt="{e(c)}" loading="lazy"><figcaption>{e(c)}</figcaption></figure>'
    secs.append(f'''<section class="dir" id="direction-{l}" data-view="direction-{l}" hidden>
<div class="dhead"><div><div class="eyebrow">Direction {d}</div><h2>{e(nom)}</h2><p class="lead">{e(ref)}. {e(txt)}</p></div>
<div class="idn"><img src="{prof}" alt="Photo de profil, direction {d}" class="prof"><div><div class="k">Photo de profil</div><div class="small">400 × 400 px · PNG + SVG</div></div></div></div>
<h3>Bannière LinkedIn</h3><img class="ban" src="{ban}" alt="Bannière LinkedIn, direction {d}"><p class="small">1128 × 191 px · PNG 2× + SVG</p>
<h3>Page entreprise simulée</h3>
<div class="sims"><div class="scroll desk"><img src="{desk}" alt="Page LinkedIn sur ordinateur, direction {d}"></div><div class="phone"><div class="scroll"><img src="{mob}" alt="Page LinkedIn sur mobile, direction {d}"></div></div></div>
<p class="small">Faites défiler chaque écran pour parcourir l’en-tête, la présentation et le fil de huit publications (sept sur mobile).</p>
<h3>Publications</h3><div class="grid">{''.join(fig(s, c) for s, c in pubs)}</div>
<h3>Carrousel PDF · Compte de paiement ou compte bancaire (8 pages)</h3><div class="strip s8">{''.join(fig(s, f'Page {i+1}') for i, s in enumerate(car))}</div>
<h3>Étude de cas · TVA e-commerce (5 pages)</h3><div class="strip s5">{''.join(fig(s, f'Page {i+1}') for i, s in enumerate(cas))}</div>
<details><summary>Planche de branding complète</summary><img src="{plan}" alt="Planche de branding, direction {d}" loading="lazy" class="plan"></details>
</section>''')
Q = [('page', 'À quoi ressemble la page LinkedIn ?'), ('banniere', 'Quelle impression donne la bannière ?'), ('fil', 'Comment apparaissent les publications dans le fil ?'), ('infog', 'À quoi ressemblent les infographies fiscales ?'), ('cas', 'Comment sont présentés les cas clients ?'), ('expert', 'Comment les experts sont-ils mis en valeur ?'), ('edito', 'L’ensemble inspire-t-il sérieux et autorité ?')]
rows = ''.join(f'<div class="q"><h3>{e(t)}</h3><div class="abc {k}">' + ''.join(f'<figure><figcaption><b>{DIRS[i][0]}</b> {e(DIRS[i][2])}</figcaption><img src="{s}" alt="Direction {DIRS[i][0]}" loading="lazy"></figure>' for i, s in enumerate(cmp[k])) + '</div></div>' for k, t in Q)
cards = ''.join(f'<a class="card" href="#direction-{d.lower()}"><img src="img/{d.lower()}-ordinateur-entete.jpg" alt=""><div><div class="eyebrow">Direction {d}</div><b>{e(n)}</b><p>{e(t)}</p></div></a>' for d, _, n, _, t in DIRS)
page = f'''<title>FYNOVATES LinkedIn Branding</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<style>
/* Layout: comparison viewer — sticky tab bar (Comparer / A / B / C), each direction shown as a full LinkedIn identity. Single deliberate light look so the three proposals are judged on the same neutral ground. */
:root{{--bg:#EEEEF2;--paper:#FFFFFF;--ink:#0D082E;--muted:#5D5B72;--line:rgba(13,8,46,.13);--accent:#0D082E;--sans:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif;color-scheme:light}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:400 16px/1.55 var(--sans)}}
.wrap{{max-width:1280px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}}
header.top{{padding-block:48px 20px}}
.eyebrow{{font:600 12px var(--sans);letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}}
h1{{font:700 clamp(28px,4.2vw,46px)/1.08 var(--sans);letter-spacing:-.025em;margin:10px 0 12px;text-wrap:balance}}
h2{{font:700 34px/1.1 var(--sans);letter-spacing:-.02em;margin:8px 0}}
h3{{font:600 18px var(--sans);margin:44px 0 14px}}
.lead{{max-width:70ch;color:var(--muted);margin:0}}.small{{font-size:13px;color:var(--muted);margin:8px 0 0}}.k{{font-weight:600}}
nav.tabs{{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--bg);border-bottom:1px solid var(--line)}}
body::before{{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--bg)}}
nav.tabs .wrap{{display:flex;gap:4px;overflow-x:auto}}
nav.tabs a{{padding:14px 14px;font-weight:600;font-size:15px;color:var(--muted);text-decoration:none;white-space:nowrap;border-bottom:2px solid transparent}}
nav.tabs a[aria-current="page"]{{color:var(--ink);border-bottom-color:var(--ink)}}
nav.tabs a:focus-visible,summary:focus-visible,.card:focus-visible{{outline:2px solid var(--ink);outline-offset:2px}}
main{{padding-block:28px 72px}}
.cards{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:8px}}
.card{{background:var(--paper);border-radius:10px;overflow:hidden;color:inherit;text-decoration:none;box-shadow:0 0 0 1px var(--line)}}
.card img{{width:100%;display:block;aspect-ratio:900/450;object-fit:cover;object-position:top}}.card>div{{padding:14px 16px 18px}}.card p{{margin:6px 0 0;font-size:14px;color:var(--muted)}}
.q{{border-top:1px solid var(--line);margin-top:36px}}.q h3{{margin-top:22px}}
.abc{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}}
.abc figure,.grid figure,.strip figure{{margin:0;min-width:0}}
.abc img,.grid img,.strip img{{width:100%;display:block;box-shadow:0 0 0 1px var(--line);background:var(--paper)}}
.abc figcaption{{font-size:14px;margin-bottom:8px}}.grid figcaption,.strip figcaption{{font-size:13px;color:var(--muted);margin-top:6px}}
.abc.fil{{grid-template-columns:repeat(3,minmax(0,300px))}}
.dhead{{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:32px;align-items:end}}
.idn{{display:flex;gap:14px;align-items:center;font-size:14px}}.prof{{width:96px;height:96px;display:block;box-shadow:0 0 0 1px var(--line)}}
.ban{{width:100%;display:block;box-shadow:0 0 0 1px var(--line)}}
.sims{{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:28px;align-items:start}}
.scroll{{overflow-y:auto;background:var(--paper)}}.scroll img{{width:100%;display:block}}
.desk{{height:720px;box-shadow:0 0 0 1px var(--line);border-radius:8px}}
.phone{{border-radius:34px;padding:10px;background:#16151C}}.phone .scroll{{height:700px;border-radius:26px}}
.grid{{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}}
.strip{{display:grid;gap:10px}}.s8{{grid-template-columns:repeat(8,minmax(0,1fr))}}.s5{{grid-template-columns:repeat(5,minmax(0,1fr))}}
details{{margin-top:44px;background:var(--paper);border-radius:10px;padding:14px 18px;box-shadow:0 0 0 1px var(--line)}}summary{{cursor:pointer;font-weight:600}}
.plan{{width:100%;display:block;margin-top:14px}}
footer{{font-size:13px;color:var(--muted);padding-block:24px 56px;border-top:1px solid var(--line)}}
@media (max-width:900px){{.cards,.abc,.abc.fil{{grid-template-columns:minmax(0,1fr)}}.sims,.dhead{{grid-template-columns:minmax(0,1fr)}}.phone{{max-width:330px}}.grid{{grid-template-columns:repeat(2,minmax(0,1fr))}}.s8{{grid-template-columns:repeat(4,minmax(0,1fr))}}.s5{{grid-template-columns:repeat(3,minmax(0,1fr))}}.desk{{height:520px}}}}
</style>
<header class="top wrap"><div class="eyebrow">Maquettes · Page entreprise LinkedIn</div><h1>FYNOVATES sur LinkedIn : trois directions artistiques</h1>
<p class="lead">Chaque direction est présentée comme si la page existait déjà : bannière, photo de profil, page entreprise simulée sur ordinateur et sur mobile, fil de publications, infographies, carrousel PDF, étude de cas, expert et publications institutionnelles. Mêmes contenus, trois traitements. Le logo FYNOVATES officiel est utilisé tel quel, sans icône.</p></header>
<nav class="tabs" aria-label="Vues"><div class="wrap"><a href="#comparer">Comparer</a><a href="#direction-a">A · Institutional Advisory</a><a href="#direction-b">B · Modern Financial Journal</a><a href="#direction-c">C · Corporate Precision</a></div></nav>
<main class="wrap">
<section id="comparer" data-view="comparer"><div class="cards">{cards}</div>{rows}</section>
{''.join(secs)}
</main>
<footer class="wrap">Emplacements entre crochets (noms, fonctions, photos, logos de partenaires, ville du siège, nombre d’abonnés) à compléter avec des informations réelles. Le partenariat est un exemple fictif. Les chiffres sont des exemples fictifs. Tous les contenus fiscaux, comptables, juridiques et bancaires sont à valider par les experts FYNOVATES avant publication. Fichiers sources et exports (PNG, SVG, PDF) : dossier linkedin-branding/ du dépôt.</footer>
<script>
const views=[...document.querySelectorAll('[data-view]')],links=[...document.querySelectorAll('nav.tabs a')];
function show(){{const h=(location.hash||'#comparer').slice(1);const ok=views.some(v=>v.dataset.view===h);const id=ok?h:'comparer';
views.forEach(v=>v.hidden=v.dataset.view!==id);links.forEach(a=>a.getAttribute('href')==='#'+id?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));}}
addEventListener('hashchange',()=>{{show();scrollTo(0,0)}});show();
</script>'''
open(os.path.join(R, 'index.html'), 'w').write(page)
print(len(os.listdir(I)), sum(os.path.getsize(os.path.join(I, f)) for f in os.listdir(I)) // 1024, 'KB')
