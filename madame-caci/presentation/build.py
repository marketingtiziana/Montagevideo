# Page de présentation (artefact) : aperçus JPG tirés de output/.
import os, json, html, shutil, re
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
R = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(R, '..', 'output'); I = os.path.join(R, 'img')
shutil.rmtree(I, ignore_errors=True); os.makedirs(I)
def jpg(rel, w, name=None, crop=None, q=82):
    im = Image.open(os.path.join(O, rel)).convert('RGB')
    if crop: im = im.crop(crop)
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    n = name or rel.replace('/', '_').replace('.png', '.jpg'); im.save(os.path.join(I, n), quality=q, optimize=True, progressive=True); return 'img/' + n
e = html.escape
D = json.load(open(os.path.join(R, 'data.json')))
fig = lambda s, c='', cls='': f'<figure class="{cls}"><img src="{s}" alt="{e(c)}" loading="lazy">{f"<figcaption>{e(c)}</figcaption>" if c else ""}</figure>'
prof = jpg('01-profil/mockup-1-profil-complet.png', 780)
feedM = jpg('02-feed/mockup-2-feed-15-photos.png', 780)
reelsTab = jpg('03-reels/mockup-onglet-reels.png', 780)
feed = [(jpg(f'02-feed/madame-caci-feed-{p["id"]}.png', 640), p) for p in D['feed']]
car = [jpg(f'02-feed/carrousel-photo-05/madame-caci-carrousel-05-photo-0{i}.png', 520) for i in range(1, 5)]
reels = [(jpg(f'03-reels/couvertures/madame-caci-reel-{r["id"]}.png', 480), r) for r in D['reels']]
styles = D['styles']
stories = [(st, [(jpg(f'04-stories/style-{st}/apercu-telephone/{s["id"]}.png', 520), s) for s in D['stories'] if str(s['style']) == st]) for st in styles]
seqs = [(q, [(jpg(f'05-sequences/{q["id"]}/apercu-telephone/ecran-{j+1}.png', 520), nom) for j, nom in enumerate(q['ecrans'])]) for q in D['seq']]
hls = [(jpg(f'06-stories-a-la-une/couvertures/highlight-{h["id"]}.png', 300), jpg(f'06-stories-a-la-une/stories/highlight-{h["id"]}-story.png', 420), h) for h in D['hl']]
planche = jpg('07-presentation/madame-caci-planche-globale.png', 2000, q=80)
phone = lambda s, c: f'<figure class="phone"><div class="scr"><img src="{s}" alt="{e(c)}"></div><figcaption>{e(c)}</figcaption></figure>'
body = f"""
<section id="profil" data-view="profil"><h2>Mockup 1 · Le profil</h2><p class="lead">Portrait réel en photo de profil, nom affiché « Tiziana Caci », bio d’une ligne avec la mention @fynovates en lien, cinq Stories à la une, grille de quinze photographies. Faites défiler l’écran.</p>
<div class="duo">{phone(prof, 'Profil complet')}<div class="stack"><h3>La bio</h3><div class="bio"><b>Tiziana Caci</b><br>Fondatrice &amp; directrice de <span class="mention">@fynovates</span></div>
<p class="small">L’identifiant du compte n’a pas été fourni : il apparaît comme « [identifiant] » et sera remplacé par le vrai nom de compte. Les nombres d’abonnés sont des emplacements.</p>
<h3>Stories à la une</h3><div class="hlrow">{"".join(f'<div><img src="{a}" alt=""><span>{e(h["nom"])}</span></div>' for a, _, h in hls)}</div></div></div></section>
<section id="feed" data-view="feed" hidden><h2>Mockup 2 · Le feed</h2><p class="lead">Uniquement des photographies, sans texte, logo ni montage. Tiziana, ses lieux de travail, l’architecture, les villes et les détails alternent. Les réflexions sont dans les légendes.</p>
<div class="duo">{phone(feedM, 'Grille de 15 photographies')}<div class="grid3">{"".join(f'<figure><img src="{s}" alt="{e(p["cat"])}" loading="lazy"><figcaption><b>{e(p["cat"])}</b>{" · photo de lieu issue du projet" if p.get("illustration") else ""}{" · photo à fournir" if p.get("manquante") else ""}<br><i>« {e(p["legende"])} »</i></figcaption></figure>' for s, p in feed)}</div></div>
<h3>Carrousel photographique · publication 5</h3><div class="strip4">{"".join(fig(s, f"Photo {i+1}") for i, s in enumerate(car))}</div></section>
<section id="reels" data-view="reels" hidden><h2>Les Reels</h2><p class="lead">Tiziana prend la parole : face caméra, reportage et terrain, extraits YouTube, storytelling. Miniatures : une image de la vidéo et un sous-titre sobre. En attendant les vraies vidéos, les images viennent des photos fournies.</p>
<div class="duo">{phone(reelsTab, 'Onglet Reels')}<div class="grid4">{"".join(fig(s, r["cat"] + " · " + r["sujet"]) for s, r in reels)}</div></div></section>
<section id="stories" data-view="stories" hidden><h2>Mockup 3 · Les Stories</h2><p class="lead">Les styles de l’éditeur natif d’Instagram : sérif noir sur bandeaux blancs pour les convictions, sans-sérif blanc ou sur fond sombre pour les réflexions, textes courts, face caméra, lieux et stickers natifs. Les stickers sont simulés ; les fichiers de production laissent la place libre.</p>
{"".join(f'<h3>Style {st} · {e(styles[st])}</h3><div class="row">{"".join(fig(s, x["nom"]) for s, x in l)}</div>' for st, l in stories)}</section>
<section id="sequences" data-view="sequences" hidden><h2>Les séquences</h2><p class="lead">Quatre séquences complètes, avec les mêmes codes natifs.</p>
{"".join(f'<h3>Séquence {"ABCD"[i]} · {e(q["titre"])}<span>{e(q["theme"])}</span></h3><div class="row">{"".join(fig(s, f"{j+1}. {nom}") for j, (s, nom) in enumerate(scr))}</div>' for i, (q, scr) in enumerate(seqs))}</section>
<section id="highlights" data-view="highlights" hidden><h2>Les Stories à la une</h2><p class="lead">Cinq rubriques en français. Couvertures photographiques recadrées dans les photos réelles ; l’intitulé s’affiche sous le cercle.</p>
<div class="hls">{"".join(f'<div class="hl"><img class="circle" src="{a}" alt=""><b>{e(h["nom"])}</b><img class="hs" src="{c}" alt="Story d’introduction {e(h["nom"])}"><span class="small">Story d’introduction</span></div>' for a, c, h in hls)}</div></section>
<section id="manques" data-view="manques" hidden><h2>À compléter</h2><p class="lead">Aucune scène n’a été inventée avec Tiziana. Il manque :</p><ol class="miss">{"".join(f"<li>{e(t)}</li>" for t in ["Le vrai nom de compte Instagram (identifiant).", "Des photos de Tiziana en réunion et avec ses collaborateurs.", "Des photos de Tiziana lors d’un événement.", "Des photos de ses vrais déplacements : villes, rues, hôtels, lieux de rencontre.", "Des captures des vidéos réelles pour les miniatures de Reels et les Stories face caméra.", "Le nom de la chaîne YouTube pour les stickers de lien.", "Les captures de référence (Louis Key, Ludovic Key) : elles n’étaient pas jointes, les styles natifs ont été reproduits d’après les conventions de l’éditeur Instagram."])}</ol></section>
<section id="planche" data-view="planche" hidden><h2>Planche globale</h2><p class="lead">Profil, Reels, feed, Stories, séquences et Stories à la une réunis.</p><img class="full" src="{planche}" alt="Planche globale"></section>"""
tabs = [('profil', 'Profil'), ('feed', 'Feed'), ('reels', 'Reels'), ('stories', 'Stories'), ('sequences', 'Séquences'), ('highlights', 'À la une'), ('manques', 'À compléter'), ('planche', 'Planche globale')]
page = f'''<title>Madame Caci Instagram</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Jost:wght@400;500&display=swap">
<style>
/* Layout: presentation of a personal Instagram account — editorial header, sticky section tabs, one view per account space. Single warm light look taken from the photos. */
:root{{--bg:#FAF7F2;--paper:#FFFFFF;--ink:#211B17;--muted:#6F655D;--accent:#8E5B3B;--line:rgba(33,27,23,.12);--d:"Cormorant Garamond",Georgia,serif;--s:"Jost",system-ui,sans-serif;color-scheme:light}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:400 16px/1.55 var(--s)}}
.wrap{{max-width:1320px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}}
header.top{{padding-block:52px 22px}}.eyebrow{{font:500 12px var(--s);letter-spacing:.24em;text-transform:uppercase;color:var(--accent)}}
h1{{font:500 clamp(40px,6vw,72px)/1 var(--d);margin:12px 0 14px;text-wrap:balance}}h2{{font:500 44px/1.05 var(--d);margin:10px 0 8px}}h3{{font:500 12px var(--s);letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin:40px 0 14px}}h3 span{{margin-left:12px;letter-spacing:0;text-transform:none;font-size:14px}}
.lead{{max-width:72ch;color:var(--muted);margin:0}}.small{{font-size:13px;color:var(--muted)}}
nav.tabs{{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--bg);border-bottom:1px solid var(--line)}}body::before{{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--bg)}}
nav.tabs .wrap{{display:flex;gap:2px;overflow-x:auto}}nav.tabs a{{padding:14px 12px;font:500 15px var(--s);color:var(--muted);text-decoration:none;white-space:nowrap;border-bottom:2px solid transparent}}nav.tabs a[aria-current="page"]{{color:var(--ink);border-bottom-color:var(--accent)}}nav.tabs a:focus-visible{{outline:2px solid var(--accent);outline-offset:2px}}
main{{padding-block:28px 72px}}figure{{margin:0;min-width:0}}figcaption{{font-size:13px;color:var(--muted);margin-top:6px;line-height:1.4}}figcaption i{{font-family:var(--d);font-size:16px;color:var(--ink)}}img{{max-width:100%;display:block}}
.duo{{display:grid;grid-template-columns:340px minmax(0,1fr);gap:48px;align-items:start;margin-top:28px}}
.phone .scr{{height:700px;overflow-y:auto;border-radius:36px;border:10px solid #161412;background:#fff}}.phone img{{width:100%}}
.bios{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}}.bios img,.crop{{box-shadow:0 0 0 1px var(--line);border-radius:12px}}.crop{{max-width:360px}}
.grid4{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}}.grid3{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}}.strip4{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}}.bio{{background:var(--paper);padding:18px 20px;font-size:15px;box-shadow:0 0 0 1px var(--line);border-radius:12px;max-width:420px}}.mention{{color:#00376B;font-weight:500}}.hlrow{{display:flex;gap:18px;flex-wrap:wrap}}.hlrow div{{text-align:center;font-size:13px}}.hlrow img{{width:74px;height:74px;border-radius:50%;margin-bottom:6px}}.circle{{width:110px;height:110px;border-radius:50%;margin:0 auto}}.miss li{{margin:10px 0;max-width:70ch}}
.strip5{{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}}
.row{{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}}.row img{{border-radius:18px}}
.hls{{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:20px;margin-top:28px}}.hl{{text-align:center}}.circles{{display:flex;gap:10px;justify-content:center}}.circles img{{width:84px;height:84px;border-radius:50%;box-shadow:0 0 0 1px var(--line)}}.hl b{{display:block;margin:10px 0;font-weight:500}}.hs{{border-radius:12px;margin:0 auto}}
.full{{width:100%;margin-top:22px;box-shadow:0 0 0 1px var(--line)}}
footer{{font-size:13px;color:var(--muted);padding-block:24px 56px;border-top:1px solid var(--line)}}
@media (max-width:900px){{.duo{{grid-template-columns:minmax(0,1fr)}}.phone{{max-width:340px}}.grid4,.grid3,.strip4{{grid-template-columns:repeat(2,minmax(0,1fr))}}.row,.strip5{{grid-template-columns:repeat(2,minmax(0,1fr))}}.hls{{grid-template-columns:repeat(2,minmax(0,1fr))}}.bios{{grid-template-columns:minmax(0,1fr)}}}}
</style>
<header class="top wrap"><div class="eyebrow">Proposition · Instagram personnel de Tiziana Caci</div><h1>Madame Caci</h1>
<p class="lead">Le compte personnel de Tiziana tel qu’il pourrait apparaître : un feed exclusivement photographique, des Reels où elle prend la parole, des Stories aux codes natifs d’Instagram et cinq Stories à la une en français. Aucun élément de l’identité Fynovates.</p></header>
<nav class="tabs" aria-label="Sections"><div class="wrap">{"".join(f'<a href="#{k}">{t}</a>' for k, t in tabs)}</div></nav>
<main class="wrap">{body}</main>
<footer class="wrap">Photographies : les cinq photos réelles de Tiziana (même étalonnage léger, sans retouche du visage) et des photos de lieux issues des ressources du projet (Unsplash), à remplacer par ses propres photos de déplacement. Fichiers : dossier madame-caci/ du dépôt.</footer>
<script>
const views=[...document.querySelectorAll('[data-view]')],links=[...document.querySelectorAll('nav.tabs a')];
function show(){{const h=(location.hash||'#profil').slice(1);const id=views.some(v=>v.dataset.view===h)?h:'profil';views.forEach(v=>v.hidden=v.dataset.view!==id);links.forEach(a=>a.getAttribute('href')==='#'+id?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'))}}
addEventListener('hashchange',()=>{{show();scrollTo(0,0)}});show();
</script>'''
open(os.path.join(R, 'index.html'), 'w').write(page)
print(len(os.listdir(I)), sum(os.path.getsize(os.path.join(I, f)) for f in os.listdir(I)) // 1024, 'KB')
