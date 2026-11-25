// Pre-computes map geometry for the FYNOVATES banners -> geo.json
import fs from 'fs';
import * as topo from 'topojson-client';
import * as d3 from 'd3-geo';

const land50 = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json'));
const land110 = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-110m.json'));
const ctry50 = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));
const land = topo.feature(land110, land110.objects.land);
const landHi = topo.feature(land50, land50.objects.land);
const borders = topo.mesh(ctry50, ctry50.objects.countries, (a, b) => a !== b);
const countries = topo.feature(ctry50, ctry50.objects.countries);

export const HUBS = {
  LDN: ['London', 51.507, -0.128], NYC: ['New York', 40.713, -74.006], DXB: ['Dubai', 25.205, 55.271],
  SIN: ['Singapore', 1.352, 103.82], HKG: ['Hong Kong', 22.32, 114.17], ZRH: ['Zurich', 47.377, 8.54],
  LUX: ['Luxembourg', 49.61, 6.13], TOR: ['Toronto', 43.65, -79.38], SAO: ['São Paulo', -23.55, -46.63],
  TYO: ['Tokyo', 35.68, 139.69], BOM: ['Mumbai', 19.08, 72.88], LIS: ['Lisbon', 38.72, -9.14],
  MIA: ['Miami', 25.76, -80.19], SYD: ['Sydney', -33.87, 151.21], JNB: ['Johannesburg', -26.2, 28.05],
  PAR: ['Paris', 48.857, 2.35], MEX: ['Mexico City', 19.43, -99.13], LAG: ['Lagos', 6.52, 3.38],
};
const out = {};

// ---------- Concept 1 : flat dot-matrix world ----------
{
  const p = d3.geoEquirectangular().rotate([-10, 0]).scale(398).translate([1280, 873]);
  const step = 12, dots = [];
  for (let y = 300; y < 1300; y += step) {
    for (let x = 0; x < 2560 + step; x += step) {
      const xx = x + ((y / step) % 2 ? step / 2 : 0);
      const ll = p.invert([xx, y]);
      if (ll && d3.geoContains(land, ll)) dots.push([xx, y]);
    }
  }
  out.c1 = { dots, hubs: {} };
  for (const [k, [n, lat, lon]] of Object.entries(HUBS)) out.c1.hubs[k] = p([lon, lat]).map(v => +v.toFixed(1));
}

// ---------- Concept 2 : orthographic globe ----------
{
  const R = 640;
  const p = d3.geoOrthographic().rotate([-20, -36]).scale(R).translate([1930, 720]).clipAngle(90).precision(0.2);
  const path = d3.geoPath(p);
  const grat = d3.geoGraticule().step([10, 10]);
  out.c2 = {
    R, cx: 1930, cy: 720,
    land: path(landHi), borders: path(borders), grat: path(grat()),
    gratMajor: path(d3.geoGraticule().step([30, 30])()),
    equator: path({ type: 'LineString', coordinates: Array.from({length:181},(_,i)=>-180+2*i).map(l => [l, 0]) }),
    hubs: {}, arcs: {}, hl: {},
  };
  for (const [k, [n, lat, lon]] of Object.entries(HUBS)) {
    const vis = d3.geoDistance([lon, lat], [20, 36]) < Math.PI / 2 - 0.05;
    if (vis) out.c2.hubs[k] = p([lon, lat]).map(v => +v.toFixed(1));
  }
  const pairs = [['LDN', 'DXB'], ['ZRH', 'SIN'], ['LUX', 'NYC'], ['DXB', 'BOM'], ['DXB', 'HKG'], ['LIS', 'SAO'], ['LDN', 'JNB'], ['ZRH', 'DXB'], ['PAR', 'LAG']];
  for (const [a, b] of pairs) {
    const A = HUBS[a], B = HUBS[b];
    out.c2.arcs[a + '-' + b] = path({ type: 'LineString', coordinates: [[A[2], A[1]], [B[2], B[1]]] });
  }
  // highlighted jurisdictions (ISO numeric ids in world-atlas)
  const ids = { '784': 'AE', '756': 'CH', '442': 'LU', '620': 'PT', '826': 'GB', '372': 'IE', '196': 'CY', '470': 'MT', '250': 'FR', '724': 'ES', '056': 'BE', '528': 'NL' };
  for (const f of countries.features) if (ids[f.id]) out.c2.hl[ids[f.id]] = path(f);
}

fs.writeFileSync('geo.json', JSON.stringify(out));
console.log('dots', out.c1.dots.length, 'c2 hubs', Object.keys(out.c2.hubs));
