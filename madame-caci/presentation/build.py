# Page de présentation (artefact) organisée en livrables A à F, chaque création affichée individuellement.
import os, json, html, shutil
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
R = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(R, '..', 'output'); I = os.path.join(R, 'img')
shutil.rmtree(I, ignore_errors=True); os.makedirs(I)
D = json.load(open(os.path.join(R, 'data.json'))); e = html.escape
def jpg(rel, w, q=84):
    im = Image.open(os.path.join(O, rel)).convert('RGB')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    n = rel.replace('/', '_').replace('.png', '.jpg'); im.save(os.path.join(I, n), quality=q, optimize=True, progressive=True); return 'img/' + n
def story(rel, titre, note=''):  # Story en grand + lien vers la taille réelle
    big = jpg(rel, 1080, 82)
    return f'<figure class="st"><a href="{big}" target="_blank" rel="noopener"><img src="{big}" alt="{e(titre)}" loading="lazy"></a><figcaption><b>{e(titre)}</b>{f" · {e(note)}" if note else ""}<br><a href="{big}" target="_blank" rel="noopener">Ouvrir en 1080 × 1920</a></figcaption></figure>'
phone = lambda rel, c, w=780: f'<figure class="phone"><div class="scr"><img src="{jpg(rel, w)}" alt="{e(c)}"></div><figcaption>{e(c)}</figcaption></figure>'
fam = {i + 1: f for i, f in enumerate(D['familles'])}
A = f'''<section id="A" data-view="A"><div class="eyebrow">Livrable A</div><h2>Profil Instagram</h2><p class="lead">Portrait réel, nom affiché « Tiziana Caci », bio minimaliste « Fondatrice &amp; directrice de @fynovates » (la mention en couleur de lien) et les deux Stories à la une. « [identifiant] » et « [N] » sont à remplacer par les informations réelles.</p>
<div class="pair">{phone('A-profil/profil-instagram-ecran.png', 'Écran à l’ouverture du profil')}{phone('A-profil/profil-instagram-page-complete.png', 'Page complète (faire défiler)')}</div></section>'''
B = f'''<section id="B" data-view="B" hidden><div class="eyebrow">Livrable B</div><h2>FEED INSTAGRAM — MADAME CACI</h2><p class="lead">Quinze photographies, sans texte, sans logo, sans montage.</p>
<div class="pair">{phone('B-feed/feed-instagram-grille-smartphone.png', 'Grille sur smartphone')}<div class="grid3">{"".join(f'<a href="{jpg(f"B-feed/photos/feed-{p["id"]}.png", 1080)}" target="_blank" rel="noopener"><img src="{jpg(f"B-feed/photos/feed-{p["id"]}.png", 1080)}" alt="{e(p["cat"])}" loading="lazy"></a>' for p in D["feed"])}</div></div></section>'''
C = f'''<section id="C" data-view="C" hidden><div class="eyebrow">Livrable C</div><h2>Onglet Reels</h2><p class="lead">Douze vidéos : face caméra, reportage et terrain, extraits YouTube, storytelling. Miniatures tirées des photos fournies, en attendant les captures des vraies vidéos.</p>
<div class="pair">{phone('C-reels/onglet-reels-smartphone.png', 'Onglet Reels sur smartphone')}<div class="grid4">{"".join(f'<figure><img src="{jpg(f"C-reels/miniatures/reel-{r["id"]}.png", 540)}" alt="" loading="lazy"><figcaption><b>{e(r["cat"])}</b><br>{e(r["sujet"])}</figcaption></figure>' for r in D["reels"])}</div></div></section>'''
Dsec = '<section id="D" data-view="D" hidden><div class="eyebrow">Livrable D</div><h2>Stories individuelles</h2><p class="lead">Chaque Story en grand, au format 1080 × 1920 (cliquez pour l’ouvrir en taille réelle). Pour les Stories interactives, l’image montre le sticker simulé ; le fichier à publier laisse la place libre pour le vrai sticker.</p>' + ''.join(
  f'<h3>Dossier {n} · {e(nom)}</h3><div class="stories">' + ''.join(story(f'D-stories/{dossier}/{"apercus-avec-sticker/" if s["sticker"] else ""}story-{s["id"]}.png', s['nom'], 'photo à fournir' if s['manquante'] else ('photo de lieu du projet' if s['illustration'] else '')) for s in D['stories'] if s['famille'] == n) + '</div>'
  for n, (dossier, nom) in fam.items()) + '</section>'
E = '<section id="E" data-view="E" hidden><div class="eyebrow">Livrable E</div><h2>Séquences complètes</h2><p class="lead">Chaque séquence écran par écran ; chaque fichier se publie directement comme une Story.</p>' + ''.join(
  f'<h3>Séquence {"ABCD"[i]} · {e(q["titre"])}<span>{e(q["theme"])}</span></h3><div class="stories">' + ''.join(story(f'E-sequences/{q["id"]}/{"apercus-avec-sticker/" if st else ""}ecran-{j + 1}.png', f'Écran {j + 1} · {nom}') for j, (nom, st) in enumerate(q['ecrans'])) + '</div>'
  for i, q in enumerate(D['seq'])) + '</section>'
F = f'''<section id="F" data-view="F" hidden><div class="eyebrow">Livrable F</div><h2>Stories à la une</h2><p class="lead">Deux rubriques uniquement. Couverture photographique (proposition principale) ou typographique (variante).</p>
<div class="pair">{phone('F-stories-a-la-une/affichage-sous-la-bio.png', 'Affichage sous la bio')}<div><div class="covers">{"".join(f'<div class="cv"><div class="circ"><img src="{jpg(f"F-stories-a-la-une/couvertures/couverture-{h["id"]}.png", 600)}" alt=""></div><div class="circ"><img src="{jpg(f"F-stories-a-la-une/couvertures-variante-typographique/couverture-{h["id"]}.png", 600)}" alt=""></div><b>{e(h["nom"])}</b></div>' for h in D["hl"])}</div>
{phone('F-stories-a-la-une/affichage-sous-la-bio-variante-typographique.png', 'Variante typographique sous la bio', 600)}</div></div>''' + ''.join(
  f'<h3>Contenu de la rubrique « {e(h["nom"])} »</h3><div class="stories">' + ''.join(story(f'F-stories-a-la-une/{h["id"]}/{"apercus-avec-sticker/" if st else ""}story-{j + 1}.png', f'{j + 1} · {nom}', 'à compléter' if mq else '') for j, (nom, st, mq) in enumerate(h['stories'])) + '</div>'
  for h in D['hl']) + '</section>'
tabs = [('A', 'A · Profil'), ('B', 'B · Feed'), ('C', 'C · Reels'), ('D', 'D · Stories'), ('E', 'E · Séquences'), ('F', 'F · À la une')]
page = f'''<title>Madame Caci Instagram</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&family=Jost:wght@400;500&display=swap">
<style>
/* Layout: review page for a personal Instagram account — sticky tabs A–F, each deliverable on its own view, every Story shown large and individually. Single warm light look taken from the photos. */
:root{{--bg:#FAF7F2;--paper:#FFFFFF;--ink:#211B17;--muted:#6F655D;--accent:#8E5B3B;--line:rgba(33,27,23,.12);--d:"Cormorant Garamond",Georgia,serif;--s:"Jost",system-ui,sans-serif;color-scheme:light}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:400 16px/1.55 var(--s)}}
.wrap{{max-width:1320px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}}
header.top{{padding-block:48px 20px}}.eyebrow{{font:500 12px var(--s);letter-spacing:.24em;text-transform:uppercase;color:var(--accent)}}
h1{{font:500 clamp(38px,5.5vw,66px)/1 var(--d);margin:12px 0 12px;text-wrap:balance}}h2{{font:500 42px/1.05 var(--d);margin:8px 0 8px}}h3{{font:500 12px var(--s);letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin:44px 0 14px}}h3 span{{margin-left:12px;letter-spacing:0;text-transform:none;font-size:14px}}
.lead{{max-width:74ch;color:var(--muted);margin:0}}
nav.tabs{{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--bg);border-bottom:1px solid var(--line)}}body::before{{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--bg)}}
nav.tabs .wrap{{display:flex;gap:2px;overflow-x:auto}}nav.tabs a{{padding:14px 12px;font:500 15px var(--s);color:var(--muted);text-decoration:none;white-space:nowrap;border-bottom:2px solid transparent}}nav.tabs a[aria-current="page"]{{color:var(--ink);border-bottom-color:var(--accent)}}a:focus-visible{{outline:2px solid var(--accent);outline-offset:2px}}
main{{padding-block:28px 72px}}figure{{margin:0;min-width:0}}figcaption{{font-size:13px;color:var(--muted);margin-top:8px;line-height:1.4}}figcaption a{{color:var(--accent)}}img{{max-width:100%;display:block}}
.pair{{display:grid;grid-template-columns:340px minmax(0,1fr);gap:48px;align-items:start;margin-top:28px}}
.phone .scr{{height:700px;overflow-y:auto;border-radius:36px;border:10px solid #161412;background:#fff}}.phone img{{width:100%}}
#A .pair{{grid-template-columns:repeat(2,340px)}}
.grid3{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}}.grid4{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}}
.stories{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}}.st img{{border-radius:14px;box-shadow:0 0 0 1px var(--line)}}
.covers{{display:flex;gap:44px;flex-wrap:wrap;margin-bottom:28px}}.cv{{text-align:center}}.cv b{{display:block;font-weight:500;letter-spacing:.04em;margin-top:10px}}.circ{{display:inline-block;width:120px;height:120px;border-radius:50%;padding:4px;border:1px solid #DBDBDB;margin:0 6px}}.circ img{{border-radius:50%;width:100%}}
footer{{font-size:13px;color:var(--muted);padding-block:24px 56px;border-top:1px solid var(--line)}}
@media (max-width:900px){{.pair,#A .pair{{grid-template-columns:minmax(0,1fr)}}.phone{{max-width:340px}}.grid4{{grid-template-columns:repeat(2,minmax(0,1fr))}}.stories{{grid-template-columns:minmax(0,1fr)}}.st{{max-width:420px}}}}
</style>
<header class="top wrap"><div class="eyebrow">Instagram personnel de Tiziana Caci</div><h1>Madame Caci</h1>
<p class="lead">Six livrables séparés : le profil, le feed, l’onglet Reels, les Stories individuelles, les séquences écran par écran et les deux Stories à la une. Aucun élément de l’identité Fynovates.</p></header>
<nav class="tabs" aria-label="Livrables"><div class="wrap">{"".join(f'<a href="#{k}">{t}</a>' for k, t in tabs)}</div></nav>
<main class="wrap">{A}{B}{C}{Dsec}{E}{F}</main>
<footer class="wrap">À compléter : l’identifiant du compte, des photos en réunion et avec l’équipe, des photos d’événement et de déplacements réels, des captures des vraies vidéos, le nom de la chaîne YouTube et le parcours de Tiziana. Les photos de lieux viennent des ressources du projet (Unsplash). Les polices natives d’Instagram sont approchées : les Stories finales se tapent dans l’application. Fichiers : dossier madame-caci/output/ (A à F).</footer>
<script>
const views=[...document.querySelectorAll('[data-view]')],links=[...document.querySelectorAll('nav.tabs a')];
function show(){{const h=(location.hash||'#A').slice(1);const id=views.some(v=>v.dataset.view===h)?h:'A';views.forEach(v=>v.hidden=v.dataset.view!==id);links.forEach(a=>a.getAttribute('href')==='#'+id?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'))}}
addEventListener('hashchange',()=>{{show();scrollTo(0,0)}});show();
</script>'''
open(os.path.join(R, 'index.html'), 'w').write(page)
print(len(os.listdir(I)), sum(os.path.getsize(os.path.join(I, f)) for f in os.listdir(I)) // 1024, 'KB')
