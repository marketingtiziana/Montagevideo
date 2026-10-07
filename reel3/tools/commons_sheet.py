# Runs in the Higgsfield sandbox (Commons API rate-limits the local IP).
# Fetches metadata + thumbnails for candidate Commons photos, writes commons_meta.json and a labelled contact sheet.
import json, urllib.request, urllib.parse, io, sys
from PIL import Image, ImageDraw, ImageFont
TITLES = """Caldea 20231205 122111.jpg
Caldea 01.JPG
Caldea 02.JPG
Caldea (2014).JPG
Andorra la Vella - view.jpg
Andorra la Vella - view2.jpg
Andorra la Vella - river.jpg
Andorra la Vella - Parc Central.jpg
Andorra la Vella . - panoramio.jpg
Pont de Paris, Andorra la Vella 20231203 090652.jpg
Pont de Paris and fountains of light, Andorra la Vella 20231207 173904.jpg
Pont de Paris and fountains of light, Andorra la Vella 20231207 180427.jpg
Pont-de-Paris-Andorra-la-Vella.jpg
Pont de Paris-vista oest.jpg
Avinguda Meritxell Andorra la Vella 20231008 124420.jpg
Avinguda Meritxell Andorra la Vella 20231008 123955.jpg
Avinguda Meritxell Christmas decorations 20231128 174025.jpg
Avinguda Meritxell, Andorra la Vella.jpg
Botanical Banner Andorra la Vella Avinguda Meritxell 20231128 174526.jpg
Grandvalira - Pas de la Casa - Grau Roig (1).jpg
Grandvalira - Pas de la Casa - Grau Roig (2).jpg
Grandvalira - Pas de la Casa - Grau Roig (3).jpg
Grandvalira - Pas de la Casa - Grau Roig (4).jpg
Grandvalira - Pas de la Casa - Grau Roig (5).jpg
Grandvalira - Pas de la Casa - Grau Roig (6).jpg
Grandvalira - Pas de la Casa - Grau Roig (7).jpg
Grandvalira - Pas de la Casa - Grau Roig (8).jpg
Pas de la Casa 2026.jpg
View of Pas de la Casa (1).jpg
® ANDORRA PAS DE LA CASA 1ª NEVADA 2009 - panoramio.jpg
® ANDORRA PAS DE LA CASA , BRUMAS DEL ENVALIRA - panoramio.jpg
Escaldes-Engordany. Andorra 107.jpg
Escaldes-Engordany. Andorra 114.jpg
Mountains in Escaldes-Engordany. Andorra 173.jpg
Canillo. Andorra 20.jpg
Canillo. Andorra 2013.jpg
Entre Coll d'Ordino e Canillo. Andorra 31.jpg
Entre Coll d'Ordino e Canillo. Andorra 33.jpg
Casa en Canillo. Andorra.jpg
World Cup Soldeu 2024 (1).jpg
Andorra la Vella - trail2.jpg
Letras Andorra.jpg""".split("\n")
UA = {"User-Agent": "Montagevideo-reel3/1.0 (marketing research; contact via github marketingtiziana)"}
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()
meta = []
for i in range(0, len(TITLES), 20):
    q = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "url|size|extmetadata",
                                "iiurlwidth": 360, "titles": "|".join("File:" + t for t in TITLES[i:i+20])})
    d = json.loads(get("https://commons.wikimedia.org/w/api.php?" + q))
    norm = {n["to"]: n["from"] for n in d["query"].get("normalized", [])}
    for p in d["query"]["pages"].values():
        if "imageinfo" not in p: print("MISSING", p.get("title")); continue
        ii = p["imageinfo"][0]; em = ii.get("extmetadata", {})
        strip = lambda k: __import__("re").sub("<[^>]+>", "", em.get(k, {}).get("value", "")).strip()
        meta.append({"title": p["title"], "page": ii["descriptionurl"], "url": ii["url"], "thumb": ii["thumburl"],
                     "w": ii["width"], "h": ii["height"], "license": strip("LicenseShortName"),
                     "license_url": strip("LicenseUrl"), "artist": strip("Artist"), "date": strip("DateTimeOriginal")[:10]})
order = {("File:" + t): k for k, t in enumerate(TITLES)}
meta.sort(key=lambda m: order.get(m["title"], 999))
for k, m in enumerate(meta): m["i"] = k
json.dump(meta, open("commons_meta.json", "w"), ensure_ascii=False, indent=1)
W, H, C = 360, 270, 7
rows = -(-len(meta) // C)
sheet = Image.new("RGB", (C * W, rows * (H + 30)), "black")
f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14) if __import__("os").path.exists("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf") else ImageFont.load_default()
dr = ImageDraw.Draw(sheet)
for m in meta:
    try:
        im = Image.open(io.BytesIO(get(m["thumb"]))).convert("RGB"); im.thumbnail((W, H))
    except Exception as e:
        print("thumb fail", m["title"], e); continue
    x, y = (m["i"] % C) * W, (m["i"] // C) * (H + 30)
    sheet.paste(im, (x + (W - im.width) // 2, y + (H - im.height) // 2))
    dr.text((x + 4, y + H + 4), f'{m["i"]} {m["title"][5:40]} {m["w"]}x{m["h"]}', fill="white", font=f)
sheet.save("commons_sheet.jpg", quality=85)
print(len(meta), "files")
