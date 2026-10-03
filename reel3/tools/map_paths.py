# Andorra between France and Spain: Natural Earth 1:10m admin-0 (public domain) -> SVG path data for Higgsedit.
# Usage: python3 map_paths.py ne_10m_admin_0_countries.geojson > ../data/map.json
import json, sys, math
from shapely.geometry import shape, box, LineString, MultiLineString
from shapely.ops import transform
gj = json.load(open(sys.argv[1]))
feat = {f["properties"]["ADM0_A3"]: shape(f["geometry"]) for f in gj["features"] if f["properties"]["ADM0_A3"] in ("AND", "FRA", "ESP")}
W, H = 1080, 800
LAT0 = 42.55; K = math.cos(math.radians(LAT0))
S = 1284.0                                    # px per (lon*cos) degree -> Andorra ~ 350 px wide
cx = feat["AND"].centroid.x; cy = feat["AND"].centroid.y
def px(x, y, z=None): return ((x - cx) * K * S + W / 2, (cy - y) * S + H / 2)
view = box(cx - (W / 2 + 40) / (K * S), cy - (H / 2 + 40) / S, cx + (W / 2 + 40) / (K * S), cy + (H / 2 + 40) / S)
def d_lines(g):
    parts = [g] if isinstance(g, LineString) else list(getattr(g, "geoms", []))
    out = []
    for ln in parts:
        if ln.is_empty or not isinstance(ln, LineString): continue
        pts = [px(*c) for c in ln.coords]
        out.append("M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in pts))
    return " ".join(out)
def d_poly(g):
    polys = [g] if g.geom_type == "Polygon" else list(g.geoms)
    out = []
    for p in polys:
        pts = [px(*c) for c in p.exterior.coords]
        out.append("M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in pts) + " Z")
    return " ".join(out)
andorra = feat["AND"].simplify(0.0008)
fr = feat["FRA"].boundary.intersection(view).simplify(0.001)
es = feat["ESP"].boundary.intersection(view).simplify(0.001)
ab = [px(*c) for c in andorra.exterior.coords]
xs = [p[0] for p in ab]; ys = [p[1] for p in ab]
# perimeter length in px (for the draw-on)
per = sum(math.dist(ab[i], ab[i + 1]) for i in range(len(ab) - 1))
json.dump({"W": W, "H": H, "andorra": d_poly(andorra), "andorra_bbox": [min(xs), min(ys), max(xs), max(ys)], "andorra_len": round(per, 1),
           "fra": d_lines(fr), "esp": d_lines(es), "source": "Natural Earth 1:10m Admin 0 Countries (public domain), naturalearthdata.com",
           "scale": "1284 px per degree of longitude*cos(42.55)"}, sys.stdout)
