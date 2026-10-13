#!/usr/bin/env python3
"""Carte du Golfe : contours réels Natural Earth 10m -> paths Higgsedit (M/L/Z, pixels).

Usage: python3 -I tools/map_paths.py ne_10m_admin_0_countries.geojson out/map_paths.json
Projection : Mercator sur la fenêtre lon 47..60, lat 22..31, rendue dans une boîte 1080x1920
(la carte occupe x 0..1080, y 360..1560). Simplification Douglas-Peucker 0.02°.
"""
import json, sys, math

COUNTRIES = ['Iran', 'United Arab Emirates', 'Saudi Arabia', 'Oman', 'Qatar', 'Bahrain', 'Kuwait', 'Iraq']
LON0, LON1, LAT0, LAT1 = 47.0, 60.5, 21.5, 31.5
W, H = 1080, 1920
MAP_Y0, MAP_H = 360, 1200

def merc(lat):
    return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))

MY0, MY1 = merc(LAT0), merc(LAT1)

def proj(lon, lat):
    x = (lon - LON0) / (LON1 - LON0) * W
    y = MAP_Y0 + (MY1 - merc(lat)) / (MY1 - MY0) * MAP_H
    return round(x, 1), round(y, 1)

def dp(points, eps):
    if len(points) < 3:
        return points
    (x0, y0), (x1, y1) = points[0], points[-1]
    dmax, idx = 0, 0
    for i in range(1, len(points) - 1):
        x, y = points[i]
        if (x1, y1) == (x0, y0):
            d = math.hypot(x - x0, y - y0)
        else:
            d = abs((x1 - x0) * (y0 - y) - (x0 - x) * (y1 - y0)) / math.hypot(x1 - x0, y1 - y0)
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        return dp(points[:idx + 1], eps)[:-1] + dp(points[idx:], eps)
    return [points[0], points[-1]]

def main(src, out):
    d = json.load(open(src))
    paths = {}
    for f in d['features']:
        name = f['properties'].get('ADMIN')
        if name not in COUNTRIES:
            continue
        g = f['geometry']
        polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
        parts = []
        for poly in polys:
            ring = [(x, y) for x, y in poly[0] if LON0 - 1 <= x <= LON1 + 1 and LAT0 - 1 <= y <= LAT1 + 1]
            if len(ring) < 8:
                continue
            ring = dp(ring, 0.02)
            pts = [proj(x, y) for x, y in ring]
            parts.append('M' + ' L'.join(f'{x} {y}' for x, y in pts) + ' Z')
        paths[name] = ' '.join(parts)
    dubai = proj(55.2708, 25.2048)
    lengeh = proj(54.880, 26.558)
    json.dump({'window': [LON0, LON1, LAT0, LAT1], 'size': [W, H], 'paths': paths,
               'dubai_px': dubai, 'iran_coast_px': lengeh,
               'source': 'Natural Earth 10m admin_0_countries (public domain)'}, open(out, 'w'), indent=1)
    for k, v in paths.items():
        print(k, len(v), 'chars')
    print('dubai', dubai, 'iran coast', lengeh)

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
