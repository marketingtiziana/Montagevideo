"""Fetch CC0 inspiration photographs (objects, decor, materials) from Openverse.
Only CC0 results are kept; title, creator, source page and licence are written to inspiration.json.
Usage: python3 sources/fetch_inspiration.py   (run from the book folder)"""
import json, os, time, urllib.request, urllib.parse, io

UA = {'User-Agent': 'brand-exploration-client/1.0'}
OUT = 'photographies/inspiration'
QUERIES = {
    'folio-cuir': 'leather portfolio folder',
    'stylo': 'fountain pen paper',
    'carnet': 'notebook pen desk',
    'enduit-mineral': 'plaster wall texture',
    'fauteuil-cuir': 'leather armchair',
    'bureau-bois': 'wooden desk office',
    'interieur-beige': 'minimalist interior beige',
    'lumiere-laterale': 'window light interior shadow',
    'travertin': 'travertine stone texture',
    'mur-brun': 'dark brown wall interior',
    'sculpture': 'stone sculpture minimal',
    'documents': 'documents desk hands',
}
meta = []
if os.path.exists(OUT + '/inspiration.json'):
    meta = json.load(open(OUT + '/inspiration.json'))
done = {m['key'] for m in meta}
for key, q in QUERIES.items():
    if any(k.startswith(key) for k in done):
        continue
    url = 'https://api.openverse.org/v1/images/?' + urllib.parse.urlencode({'q': q, 'license': 'cc0', 'page_size': 20, 'mature': 'false'})
    try:
        res = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30))
    except Exception as e:
        print('search fail', key, e, flush=True); time.sleep(45); continue
    got = 0
    for r in res.get('results', []):
        if got >= 2: break
        if r.get('license') != 'cc0': continue
        try:
            data = urllib.request.urlopen(urllib.request.Request(r['url'], headers=UA), timeout=30).read()
            from PIL import Image
            im = Image.open(io.BytesIO(data)).convert('RGB')
            if min(im.size) < 500: continue
            im.thumbnail((1600, 1600))
            fn = f'{key}-{got + 1}.jpg'
            im.save(f'{OUT}/{fn}', quality=88)
            meta.append({'key': f'{key}-{got + 1}', 'file': f'{OUT}/{fn}', 'query': q, 'title': r.get('title'), 'creator': r.get('creator'), 'source': r.get('source'), 'page': r.get('foreign_landing_url'), 'license': 'CC0', 'license_url': r.get('license_url'), 'openverse_id': r.get('id')})
            got += 1
            print('ok', fn, r.get('source'), flush=True)
        except Exception as e:
            print('dl fail', key, str(e)[:80])
    json.dump(meta, open(OUT + '/inspiration.json', 'w'), ensure_ascii=False, indent=1)
    time.sleep(20)
print('total', len(meta))
